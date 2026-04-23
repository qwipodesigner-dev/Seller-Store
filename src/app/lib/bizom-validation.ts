/**
 * Bizom DMS Price & Inventory import validation and SKU-level aggregation.
 *
 * The Bizom DMS export is a batch-level CSV — one row per (SKU Code, Batch). Our Seller Store
 * maintains prices/stock at the SKU Code level, so we must:
 *   1) Validate every batch row against numeric / date rules.
 *   2) Reject the file / row on any negative price, negative stock, MRP < Selling Price etc.
 *   3) Group rows by SKU Code, sum stock across batches, and — per business rule —
 *      take the MAXIMUM MRP and MAXIMUM Selling Price across the batches of a SKU when
 *      the batches disagree (each batch can be priced differently in DMS; we promote the
 *      highest to our catalog to avoid underselling).
 *
 * Rule IDs here use the prefix PV- (Price/inventory Validation) to distinguish from the
 * SKU (ONDC) rule set (V-).
 */

// Raw row as extracted from the Bizom CSV (trimmed + normalised).
export interface BizomRawRow {
  rowNumber: number;
  skuId: string;
  skuName: string;
  skuCode: string;
  batch: string;
  manufactureDate: string;
  expiryDate: string;
  mrpPerPcs: string;
  pricePerPcs: string;
  gst: string;
  saleableCase: string;
  saleableUnit: string;
  nonSaleableCase: string;
  nonSaleableUnit: string;
  inTransitCase: string;
  inTransitUnit: string;
  totalCase: string;
  totalUnit: string;
  amountValue: string;
}

export interface PriceInventoryError {
  ruleId: string; // PV-NNN
  code: string; // ERR_PI_NNN
  field: string;
  message: string;
}

export interface BatchRow {
  raw: BizomRawRow;
  parsed: {
    mrp: number;
    sellingPrice: number;
    gst: number;
    totalStockUnits: number; // total stock converted to unit count (case × pack + units), approximated as case+unit if pack size unknown
    saleableUnits: number;
    manufactureDate: Date | null;
    expiryDate: Date | null;
  };
  errors: PriceInventoryError[];
  status: "valid" | "invalid";
}

export interface AggregatedSKU {
  skuId: string;
  skuCode: string;
  skuName: string;
  batchCount: number;
  batches: string[];
  mrp: number; // MAX across batches
  sellingPrice: number; // MAX across batches
  gst: number; // most-common GST (expected to be uniform); falls back to MAX
  totalStock: number; // SUM of saleable stock across batches
  earliestExpiry: Date | null;
  hasPriceDivergence: boolean; // true if batches disagreed on MRP or price
  hasDateIssue: boolean; // true if any batch has already expired
}

export interface BizomValidationResult {
  totalRows: number;
  validBatchRows: number;
  invalidBatchRows: number;
  batchRows: BatchRow[];
  aggregated: AggregatedSKU[];
  fileLevelErrors: PriceInventoryError[];
}

// ---------- Helpers ----------

/** Bizom export uses a leading apostrophe on numeric fields (e.g. `'1,0`) to prevent Excel
 *  from interpreting them as dates. This strips the apostrophe and returns the first number. */
function cleanBizomNumeric(s: string): string {
  if (!s) return "";
  return s.replace(/^'/, "").trim();
}

/** Parse a "case,unit" pair like `'1,0` or `50,2` into [case, unit]. Returns [null,null] if not parseable. */
function parseCaseUnit(caseStr: string, unitStr: string): [number | null, number | null] {
  const c = cleanBizomNumeric(caseStr);
  const u = cleanBizomNumeric(unitStr);
  if (c === "-" || c === "" || u === "-" || u === "") return [null, null];
  const ci = parseInt(c, 10);
  const ui = parseInt(u, 10);
  return [isNaN(ci) ? null : ci, isNaN(ui) ? null : ui];
}

function parseIsoDate(s: string): Date | null {
  if (!s) return null;
  // Accept YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(s + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

// ---------- Row-level validator ----------

/** Validate a single batch row from Bizom. Collects ALL errors for the row. */
export function validateBizomRow(raw: BizomRawRow): BatchRow {
  const errors: PriceInventoryError[] = [];
  const push = (ruleId: string, code: string, field: string, message: string) =>
    errors.push({ ruleId, code, field, message });

  // --- PV-001 SKU Code ---
  if (!raw.skuCode || !/^[A-Za-z0-9_-]+$/.test(raw.skuCode)) {
    push("PV-001", "ERR_PI_001", "SKU Code", "SKU Code is required and must be alphanumeric.");
  }

  // --- PV-002 Batch (mandatory in DMS) ---
  if (!raw.batch) {
    push("PV-002", "ERR_PI_002", "Batch", "Batch number is required for every DMS row.");
  }

  // --- PV-003 MRP numeric, ≥ 0 ---
  const mrpStr = cleanBizomNumeric(raw.mrpPerPcs);
  const mrp = parseFloat(mrpStr);
  if (mrpStr === "" || isNaN(mrp)) {
    push("PV-003", "ERR_PI_003", "MRP/Pcs", "MRP must be a valid number.");
  } else if (mrp < 0) {
    push("PV-003", "ERR_PI_003", "MRP/Pcs", "MRP cannot be negative.");
  }

  // --- PV-004 Price/Pcs (selling price) numeric, ≥ 0 ---
  const priceStr = cleanBizomNumeric(raw.pricePerPcs);
  const price = parseFloat(priceStr);
  if (priceStr === "" || isNaN(price)) {
    push("PV-004", "ERR_PI_004", "Price/Pcs", "Selling price must be a valid number.");
  } else if (price < 0) {
    push("PV-004", "ERR_PI_004", "Price/Pcs", "Selling price cannot be negative.");
  } else if (price === 0) {
    push("PV-004", "ERR_PI_004", "Price/Pcs", "Selling price must be greater than 0.");
  }

  // --- PV-005 Selling Price ≤ MRP (only when MRP > 0) ---
  if (!isNaN(mrp) && !isNaN(price) && mrp > 0 && price > mrp) {
    push("PV-005", "ERR_PI_005", "Price/Pcs",
      `Selling price (${price}) cannot be greater than MRP (${mrp}).`);
  }

  // --- PV-006 GST range 0–28 ---
  const gstStr = cleanBizomNumeric(raw.gst);
  const gst = parseFloat(gstStr);
  if (gstStr !== "" && (isNaN(gst) || gst < 0 || gst > 28)) {
    push("PV-006", "ERR_PI_006", "GST(%)", "GST must be a number between 0 and 28.");
  }

  // --- PV-007 / PV-008 / PV-009 Dates ---
  const mfgDate = parseIsoDate(raw.manufactureDate);
  const expDate = parseIsoDate(raw.expiryDate);
  if (raw.manufactureDate && !mfgDate) {
    push("PV-007", "ERR_PI_007", "Manufacture Date",
      "Manufacture date must be a valid date in YYYY-MM-DD format.");
  }
  if (raw.expiryDate && !expDate) {
    push("PV-008", "ERR_PI_008", "Expiry Date",
      "Expiry date must be a valid date in YYYY-MM-DD format.");
  }
  if (mfgDate && expDate && expDate <= mfgDate) {
    push("PV-009", "ERR_PI_009", "Expiry Date",
      "Expiry date must be after manufacture date.");
  }

  // --- PV-010 Stock non-negative integers (case/unit) ---
  const [saleableCase, saleableUnit] = parseCaseUnit(raw.saleableCase, raw.saleableUnit);
  const [nonSaleableCase, nonSaleableUnit] = parseCaseUnit(raw.nonSaleableCase, raw.nonSaleableUnit);
  const [transitCase, transitUnit] = parseCaseUnit(raw.inTransitCase, raw.inTransitUnit);
  const stockValues = [saleableCase, saleableUnit, nonSaleableCase, nonSaleableUnit, transitCase, transitUnit];
  for (const v of stockValues) {
    if (v !== null && v < 0) {
      push("PV-010", "ERR_PI_010", "Stock",
        "Stock quantities (case / unit) cannot be negative.");
      break;
    }
  }

  // --- Compute derived parsed values (even if errors exist, for preview) ---
  // Saleable stock is what we import into the catalog (non-saleable + in-transit are excluded).
  const saleableTotal = (saleableCase ?? 0) + (saleableUnit ?? 0);
  const totalStock = saleableTotal;

  return {
    raw,
    parsed: {
      mrp: isNaN(mrp) ? 0 : mrp,
      sellingPrice: isNaN(price) ? 0 : price,
      gst: isNaN(gst) ? 0 : gst,
      totalStockUnits: totalStock,
      saleableUnits: saleableTotal,
      manufactureDate: mfgDate,
      expiryDate: expDate,
    },
    errors,
    status: errors.length === 0 ? "valid" : "invalid",
  };
}

// ---------- File-level parsing + aggregation ----------

/** Parse a CSV string into an array of rows (2D array). Handles quoted cells with commas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else { field += c; }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Required Bizom DMS columns — matches the export file the user provided. */
export const BIZOM_REQUIRED_HEADERS = [
  "SKU Id",
  "SKU Name",
  "SKU Code",
  "Batch",
  "Manufacture Date",
  "Expiry Date",
  "MRP/Pcs",
  "Price/Pcs",
  "GST(%)",
] as const;

/** Main entry — parse a Bizom DMS CSV file, validate every batch row, aggregate to SKU level. */
export function importBizomCsv(csvText: string): BizomValidationResult {
  const fileLevelErrors: PriceInventoryError[] = [];
  const rows = parseCsv(csvText);

  if (rows.length === 0) {
    fileLevelErrors.push({
      ruleId: "PV-013",
      code: "ERR_PI_013",
      field: "file",
      message: "File is empty.",
    });
    return {
      totalRows: 0,
      validBatchRows: 0,
      invalidBatchRows: 0,
      batchRows: [],
      aggregated: [],
      fileLevelErrors,
    };
  }

  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);

  // PV-013 — required columns present
  const missingHeaders = BIZOM_REQUIRED_HEADERS.filter((req) => !headers.includes(req));
  if (missingHeaders.length > 0) {
    fileLevelErrors.push({
      ruleId: "PV-013",
      code: "ERR_PI_013",
      field: "headers",
      message: `Missing required column(s): ${missingHeaders.join(", ")}. Please use the Bizom DMS export template.`,
    });
  }

  // Build column index
  const col = (name: string) => headers.indexOf(name);
  const idxSkuId = col("SKU Id");
  const idxSkuName = col("SKU Name");
  const idxSkuCode = col("SKU Code");
  const idxBatch = col("Batch");
  const idxMfg = col("Manufacture Date");
  const idxExp = col("Expiry Date");
  const idxMrp = col("MRP/Pcs");
  const idxPrice = col("Price/Pcs");
  const idxGst = col("GST(%)");

  // Bizom exports several columns with embedded commas inside one CSV cell —
  // specifically the `Saleable Stock( Case ),Saleable Stock( Unit )` pair is a single quoted cell
  // containing `"1,0"`. We split those apart after CSV parsing.
  const idxSaleable = headers.findIndex((h) => /Saleable Stock\(\s*Case/i.test(h) && !/Non-/.test(h));
  const idxNonSaleable = headers.findIndex((h) => /Non-Saleable Stock/i.test(h));
  const idxInTransit = headers.findIndex((h) => /In Transit/i.test(h));
  const idxTotalStock = headers.findIndex((h) => /Total Stock/i.test(h));
  const idxAmount = headers.findIndex((h) => /Amount/i.test(h));

  const splitPair = (s: string | undefined): [string, string] => {
    if (!s) return ["", ""];
    const parts = s.replace(/^'/, "").split(",");
    return [parts[0]?.trim() || "", parts[1]?.trim() || ""];
  };

  const batchRows: BatchRow[] = dataRows.map((cols, idx): BatchRow => {
    const [saleableCase, saleableUnit] = splitPair(cols[idxSaleable]);
    const [nonSaleableCase, nonSaleableUnit] = splitPair(cols[idxNonSaleable]);
    const [inTransitCase, inTransitUnit] = splitPair(cols[idxInTransit]);
    const [totalCase, totalUnit] = splitPair(cols[idxTotalStock]);

    const raw: BizomRawRow = {
      rowNumber: idx + 2,
      skuId: (cols[idxSkuId] || "").trim(),
      skuName: (cols[idxSkuName] || "").trim(),
      skuCode: (cols[idxSkuCode] || "").trim(),
      batch: (cols[idxBatch] || "").trim(),
      manufactureDate: (cols[idxMfg] || "").trim(),
      expiryDate: (cols[idxExp] || "").trim(),
      mrpPerPcs: (cols[idxMrp] || "").trim(),
      pricePerPcs: (cols[idxPrice] || "").trim(),
      gst: (cols[idxGst] || "").trim(),
      saleableCase, saleableUnit,
      nonSaleableCase, nonSaleableUnit,
      inTransitCase, inTransitUnit,
      totalCase, totalUnit,
      amountValue: (cols[idxAmount] || "").trim(),
    };

    return validateBizomRow(raw);
  });

  // --- PV-014 duplicate (SKU Code + Batch) detection ---
  const seenKeys = new Map<string, number>();
  batchRows.forEach((b, i) => {
    const key = `${b.raw.skuCode}__${b.raw.batch}`;
    if (seenKeys.has(key)) {
      b.errors.push({
        ruleId: "PV-014",
        code: "ERR_PI_014",
        field: "Batch",
        message: `Duplicate row — SKU Code + Batch already appeared in row ${seenKeys.get(key)}.`,
      });
      b.status = "invalid";
    } else {
      seenKeys.set(key, b.raw.rowNumber);
    }
  });

  // --- Aggregate VALID rows by SKU Code ---
  const bySku = new Map<string, BatchRow[]>();
  for (const b of batchRows) {
    if (b.status !== "valid") continue;
    const k = b.raw.skuCode;
    if (!bySku.has(k)) bySku.set(k, []);
    bySku.get(k)!.push(b);
  }

  const aggregated: AggregatedSKU[] = [];
  const today = new Date();
  for (const [skuCode, batches] of bySku) {
    const first = batches[0].raw;
    const mrps = batches.map((b) => b.parsed.mrp);
    const prices = batches.map((b) => b.parsed.sellingPrice);
    const gsts = batches.map((b) => b.parsed.gst);
    const expiries = batches.map((b) => b.parsed.expiryDate).filter(Boolean) as Date[];

    // Business rule: if batches disagree on price, take MAX.
    const maxMrp = Math.max(...mrps);
    const maxPrice = Math.max(...prices);
    const hasPriceDivergence = new Set(mrps).size > 1 || new Set(prices).size > 1;
    const totalStock = batches.reduce((sum, b) => sum + b.parsed.saleableUnits, 0);
    const earliestExpiry = expiries.length > 0
      ? new Date(Math.min(...expiries.map((d) => d.getTime())))
      : null;
    const hasDateIssue = earliestExpiry !== null && earliestExpiry < today;

    aggregated.push({
      skuId: first.skuId,
      skuCode,
      skuName: first.skuName,
      batchCount: batches.length,
      batches: batches.map((b) => b.raw.batch),
      mrp: maxMrp,
      sellingPrice: maxPrice,
      gst: Math.max(...gsts),
      totalStock,
      earliestExpiry,
      hasPriceDivergence,
      hasDateIssue,
    });
  }

  // Sort by SKU Code for stable preview
  aggregated.sort((a, b) => a.skuCode.localeCompare(b.skuCode));

  const validBatchRows = batchRows.filter((b) => b.status === "valid").length;
  const invalidBatchRows = batchRows.filter((b) => b.status === "invalid").length;

  return {
    totalRows: batchRows.length,
    validBatchRows,
    invalidBatchRows,
    batchRows,
    aggregated,
    fileLevelErrors,
  };
}

/** Edit-form numeric validator (used in the inline Edit Price & Inventory dialog). */
export interface PriceInventoryEdit {
  mrp: string;
  sellingPrice: string;
  stock: string;
  isInfiniteStock: boolean;
}

export function validateEditForm(edit: PriceInventoryEdit): PriceInventoryError[] {
  const errors: PriceInventoryError[] = [];
  const push = (ruleId: string, code: string, field: string, message: string) =>
    errors.push({ ruleId, code, field, message });

  const mrp = parseFloat(edit.mrp);
  const price = parseFloat(edit.sellingPrice);

  if (edit.mrp === "" || isNaN(mrp)) {
    push("PV-003", "ERR_PI_003", "mrp", "MRP is required and must be a valid number.");
  } else if (mrp < 0) {
    push("PV-003", "ERR_PI_003", "mrp", "MRP cannot be negative.");
  }

  if (edit.sellingPrice === "" || isNaN(price)) {
    push("PV-004", "ERR_PI_004", "sellingPrice",
      "Selling price is required and must be a valid number.");
  } else if (price < 0) {
    push("PV-004", "ERR_PI_004", "sellingPrice", "Selling price cannot be negative.");
  } else if (price === 0) {
    push("PV-004", "ERR_PI_004", "sellingPrice", "Selling price must be greater than 0.");
  }

  if (!isNaN(mrp) && !isNaN(price) && mrp > 0 && price > mrp) {
    push("PV-005", "ERR_PI_005", "sellingPrice",
      "Selling price cannot be greater than MRP.");
  }

  if (!edit.isInfiniteStock) {
    const stock = parseInt(edit.stock, 10);
    if (edit.stock === "" || isNaN(stock)) {
      push("PV-011", "ERR_PI_011", "stock",
        "Stock quantity is required and must be a whole number.");
    } else if (stock < 0) {
      push("PV-011", "ERR_PI_011", "stock", "Stock quantity cannot be negative.");
    }
  }

  return errors;
}
