// =====================================================================
// My SKU bulk import — Phase 2 template + parser
// ---------------------------------------------------------------------
// Phase 2 makes the SKU bulk import cover every field on the SKU
// detail page. The downloaded template is a real .xlsx with three
// tabs — Main / Validation / Master — and dropdown columns on the
// Main sheet pull from named ranges on the Master sheet so Excel
// rejects free-text entries.
//
// Why a separate module? The template + parser logic is meaty
// (~300 lines) and the My SKU page is already heavy. Keeping it here
// also lets the upcoming Excel-template tests target a small surface.
// =====================================================================

import * as XLSX from "xlsx";
// ExcelJS is heavy (~900 KB unbundled). It's only needed for
// downloading the template — the parser side uses SheetJS. Import
// it dynamically inside downloadSkuTemplate so it doesn't ship in
// the main bundle for users who never open the bulk-import flow.
// We still import its types statically (erased at compile time).
import type ExcelJSType from "exceljs";

/** Per-field schema shared by the template generator and the parser. */
export interface SkuFieldDef {
  /** Stable key used by the parser when it returns parsed rows. */
  key: string;
  /** Header label shown on the Main sheet (without the trailing `*`). */
  header: string;
  /** Whether the field is required for a valid SKU row. */
  mandatory: boolean;
  /** Short hint shown in the frozen helper row under the header. */
  format: string;
  /** Long-form description shown on the Validation sheet. */
  rules: string;
  /** Optional dropdown options. When set, the column gets cell-level
   *  data validation and the values are listed on the Master sheet. */
  options?: string[];
  /** Example value shown on the Validation sheet. */
  example?: string;
}

// Categories — pulled from the SKU detail page's CATEGORY_OPTIONS so
// the template stays in sync. Kept inline to avoid circular imports.
const CATEGORY_OPTIONS: string[] = [
  "Atta, Flours & Sooji",
  "Bakery, Cakes & Dairy",
  "Beauty & Hygiene",
  "Beverages",
  "Biscuits, Snacks & Namkeen",
  "Cooking Oils & Ghee",
  "Dairy & Cheese",
  "Dals & Pulses",
  "Detergents",
  "Dry Fruits",
  "Eggs, Meat & Fish",
  "Foodgrains, Oil & Masala",
  "Fruit Juices",
  "Frozen Snacks",
  "Frozen Vegetables",
  "Fruits and Vegetables",
  "Gift Voucher",
  "Gourmet & World Foods",
  "Indian Sweets",
  "Kitchen Accessories",
  "Masala & Seasoning",
  "Oats & Noodles",
  "Oil & Ghee",
  "Pasta & Soup",
  "Pet Care",
  "Pickles & Podis",
  "Ready to Cook",
  "Rice",
  "Salt & Sugar",
  "Snacks, Dry Fruits & Nuts",
  "Sugar & Spices",
  "Snacks & Branded Foods",
  "Spreads, Sauces & Ketchups",
  "Tea & Coffee",
  "Tinned & Processed Foods",
];

const MEASURE_UNITS = ["Dozen", "Gram", "Kilogram", "Ton", "Liter", "Milliliter"];
const COUNTRIES = ["India", "Bangladesh", "Sri Lanka", "Nepal", "Bhutan", "China", "Other"];
const TIME_TO_SHIP = ["24 hours", "36 hours", "48 hours"];
const YES_NO = ["Yes", "No"];
const FULFILLMENT = ["Store Delivery"];
const LOCATION = ["Warehouse 1", "Warehouse 2", "Warehouse 3"];
const ITEM_STATUS = ["Active", "Inactive"];

/** The full schema. Order = column order on the Main sheet. */
export const SKU_FIELDS: SkuFieldDef[] = [
  // --- Identity ---
  {
    key: "skuCode",
    header: "SKU Code",
    mandatory: true,
    format: "Letters/digits/-/_",
    rules: "Required. Alphanumeric (letters, digits, dashes, underscores). Must be unique within the file and not collide with an existing SKU.",
    example: "180000005",
  },
  {
    key: "skuName",
    header: "SKU Name",
    mandatory: true,
    format: "3–100 chars",
    rules: "Required. 3 to 100 characters. Plain text.",
    example: "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN",
  },
  {
    key: "shortDesc",
    header: "Short Description",
    mandatory: true,
    format: "10–150 chars",
    rules: "Required. 10 to 150 characters. Plain text only — no links or HTML.",
    example: "Premium refined sunflower oil, 15 kg tin",
  },
  {
    key: "longDesc",
    header: "Long Description",
    mandatory: false,
    format: "Up to 200 chars",
    rules: "Optional. Up to 200 characters. Plain text only.",
    example: "Filtered for clarity, suitable for high-temperature cooking.",
  },

  // --- Quantity & Inventory ---
  {
    key: "measureUnit",
    header: "Measure Unit",
    mandatory: true,
    format: "Dropdown",
    rules: "Required. Pick from the dropdown.",
    options: MEASURE_UNITS,
    example: "Liter",
  },
  {
    key: "measureValue",
    header: "Unit Value",
    mandatory: true,
    format: "Whole number > 0",
    rules: "Required. Positive whole number (no decimals).",
    example: "15",
  },
  {
    key: "unitizedCount",
    header: "Pack Size",
    mandatory: false,
    format: "Whole number ≥ 1",
    rules: "Optional. Positive whole number when filled.",
    example: "1",
  },
  {
    key: "upc",
    header: "UPC",
    mandatory: false,
    format: "Numeric",
    rules: "Optional. Numeric value.",
    example: "8901234567890",
  },
  {
    key: "skuWeight",
    header: "SKU Weight (kg)",
    mandatory: false,
    format: "Decimal > 0",
    rules: "Optional. Positive number — gross weight in kilograms.",
    example: "15.0",
  },
  {
    key: "minimumOrderQty",
    header: "Min Order Quantity",
    mandatory: true,
    format: "Whole number ≥ 1",
    rules: "Required. Positive whole number. Cannot be greater than Max Order Quantity.",
    example: "1",
  },
  {
    key: "maximumOrderQty",
    header: "Max Order Quantity",
    mandatory: true,
    format: "Whole number ≥ 1",
    rules: "Required. Positive whole number. Cannot be less than Min Order Quantity.",
    example: "100",
  },

  // --- Category & Fulfillment ---
  {
    key: "categoryId",
    header: "Category",
    mandatory: true,
    format: "Dropdown",
    rules: "Required. Pick a category from the admin-managed list.",
    options: CATEGORY_OPTIONS,
    example: "Cooking Oils & Ghee",
  },
  {
    key: "fulfillmentId",
    header: "Fulfillment",
    mandatory: true,
    format: "Dropdown",
    rules: "Required. Phase 1 supports Store Delivery only.",
    options: FULFILLMENT,
    example: "Store Delivery",
  },
  {
    key: "locationId",
    header: "Location",
    mandatory: true,
    format: "Dropdown",
    rules: "Required. The warehouse this SKU is fulfilled from.",
    options: LOCATION,
    example: "Warehouse 1",
  },

  // --- ONDC attributes ---
  {
    key: "returnable",
    header: "Returnable",
    mandatory: true,
    format: "Yes / No",
    rules: "Required. Phase 1 default: No.",
    options: YES_NO,
    example: "No",
  },
  {
    key: "cancellable",
    header: "Cancellable",
    mandatory: true,
    format: "Yes / No",
    rules: "Required. Phase 1 default: No.",
    options: YES_NO,
    example: "No",
  },
  {
    key: "availableOnCod",
    header: "Available on COD",
    mandatory: true,
    format: "Yes / No",
    rules: "Required. Phase 1 default: Yes.",
    options: YES_NO,
    example: "Yes",
  },
  {
    key: "timeToShip",
    header: "Time to Ship",
    mandatory: true,
    format: "Dropdown",
    rules: "Required. Pick the dispatch window.",
    options: TIME_TO_SHIP,
    example: "24 hours",
  },

  // --- Customer Care ---
  {
    key: "consumerCareContactName",
    header: "Customer Care Name",
    mandatory: true,
    format: "Letters only",
    rules: "Required. Alphabetical characters only.",
    example: "Customer Support",
  },
  {
    key: "consumerCareContactEmail",
    header: "Customer Care Email",
    mandatory: true,
    format: "Valid email",
    rules: "Required. Valid email address (name@domain.tld).",
    example: "support@example.com",
  },
  {
    key: "consumerCareContactPhone",
    header: "Customer Care Phone",
    mandatory: true,
    format: "10 digits",
    rules: "Required. Exactly 10 digits, numeric only.",
    example: "9876543210",
  },

  // --- Manufacturer ---
  {
    key: "manufacturerName",
    header: "Manufacturer",
    mandatory: true,
    format: "Linked company",
    rules: "Required. Must match a company linked to your seller account (see Manage Seller → Companies & Brands).",
    example: "ITC Limited",
  },
  {
    key: "brandAttribute",
    header: "Brand",
    mandatory: true,
    format: "Linked brand",
    rules: "Required. Must be a brand under the selected Manufacturer.",
    example: "Aashirvaad",
  },
  {
    key: "manufacturerAddress",
    header: "Manufacturer Address",
    mandatory: false,
    format: "10–250 chars",
    rules: "Optional. 10 to 250 characters when filled. Should include a 6-digit PIN.",
    example: "Plot 14, MIDC, Mumbai 400072",
  },
  {
    key: "countryOfOrigin",
    header: "Country of Origin",
    mandatory: true,
    format: "Dropdown",
    rules: "Required. Default: India.",
    options: COUNTRIES,
    example: "India",
  },

  // --- Status ---
  {
    key: "itemStatus",
    header: "Status",
    mandatory: true,
    format: "Dropdown",
    rules: "Required. Active SKUs are visible to buyers; Inactive SKUs are hidden.",
    options: ITEM_STATUS,
    example: "Active",
  },
];

/** Convert a 0-based column index to its Excel letter (A, B, …, AA, AB). */
const colToLetter = (idx: number): string => {
  let n = idx;
  let s = "";
  while (n >= 0) {
    s = String.fromCharCode((n % 26) + 65) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
};

/** Escape a sheet name for cross-sheet formula references (single
 *  quotes around any name with whitespace, doubled apostrophes). */
const escapeSheetName = (name: string) =>
  /[^A-Za-z0-9_]/.test(name)
    ? `'${name.replace(/'/g, "''")}'`
    : name;

/**
 * Build the .xlsx workbook (3 sheets) and trigger a download.
 *
 * Why ExcelJS instead of SheetJS for writing? SheetJS Community
 * doesn't persist data validations on write — they're a Pro feature.
 * That meant the dropdowns we configured never made it into the
 * downloaded file. ExcelJS is open-source and writes proper
 * <dataValidations> XML, so the user actually sees the dropdown
 * arrows in Excel / Google Sheets / LibreOffice.
 *
 * SheetJS still owns the parser side because its sheet_to_json and
 * cell-resolution logic is best-in-class.
 */
export const downloadSkuTemplate = async () => {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Qwipo Seller Store";
  wb.created = new Date();

  const HEADER_FILL: ExcelJSType.FillPattern = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E40AF" }, // blue-800
  };
  const HEADER_FONT: Partial<ExcelJSType.Font> = {
    bold: true,
    color: { argb: "FFFFFFFF" },
    size: 11,
  };
  const HELPER_FILL: ExcelJSType.FillPattern = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEFF6FF" }, // blue-50
  };
  const HELPER_FONT: Partial<ExcelJSType.Font> = {
    italic: true,
    color: { argb: "FF1E3A8A" }, // blue-900
    size: 10,
  };
  const BORDER: ExcelJSType.Border = { style: "thin", color: { argb: "FFCBD5E1" } };
  const ALL_BORDERS: Partial<ExcelJSType.Borders> = {
    top: BORDER,
    left: BORDER,
    right: BORDER,
    bottom: BORDER,
  };

  // ---------- Sheet 3 — Master Data (built first so the Main sheet
  //            can reference it via named ranges). ----------
  const masterSheet = wb.addWorksheet("Master Data");
  const masterColumns: { label: string; values: string[]; key: string }[] = [];
  const seenLabels = new Set<string>();
  SKU_FIELDS.forEach((f) => {
    if (!f.options || seenLabels.has(f.header)) return;
    masterColumns.push({ label: f.header, values: f.options, key: f.key });
    seenLabels.add(f.header);
  });
  // Header row.
  masterSheet.addRow(masterColumns.map((c) => c.label));
  const maxRows = Math.max(...masterColumns.map((c) => c.values.length));
  for (let r = 0; r < maxRows; r++) {
    masterSheet.addRow(masterColumns.map((c) => c.values[r] ?? ""));
  }
  // Style the master header row + freeze it.
  const masterHeaderRow = masterSheet.getRow(1);
  masterHeaderRow.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = ALL_BORDERS;
  });
  masterHeaderRow.height = 22;
  masterSheet.views = [{ state: "frozen", ySplit: 1 }];
  masterColumns.forEach((c, idx) => {
    masterSheet.getColumn(idx + 1).width = Math.max(
      c.label.length + 4,
      ...c.values.map((v) => v.length + 4),
    );
  });

  // Define a workbook-level named range for every option column on the
  // Master sheet. Cell dropdowns on the Main sheet point at these
  // names — that way if the user reorders columns later the formulas
  // stay valid.
  const namedRanges = new Map<string, string>();
  masterColumns.forEach((c, idx) => {
    const colLetter = colToLetter(idx);
    const range = `${escapeSheetName("Master Data")}!$${colLetter}$2:$${colLetter}$${c.values.length + 1}`;
    const name = `MASTER_${c.key.toUpperCase()}`;
    wb.definedNames.add(range, name);
    namedRanges.set(c.key, name);
  });

  // ---------- Sheet 1 — Main SKU Upload ----------
  const main = wb.addWorksheet("Main SKU Upload");
  // Row 1 = headers (mandatory carry a trailing *).
  main.addRow(SKU_FIELDS.map((f) => f.header + (f.mandatory ? " *" : "")));
  // Row 2 = frozen helper row with Mandatory/Optional + format.
  main.addRow(
    SKU_FIELDS.map((f) => `${f.mandatory ? "Mandatory" : "Optional"} · ${f.format}`),
  );

  // Style header row.
  const headerRow = main.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell((cell, col) => {
    const f = SKU_FIELDS[col - 1];
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = ALL_BORDERS;
    if (f && f.mandatory) {
      cell.font = { ...HEADER_FONT };
    }
  });

  // Style helper row.
  const helperRow = main.getRow(2);
  helperRow.height = 20;
  helperRow.eachCell((cell) => {
    cell.font = HELPER_FONT;
    cell.fill = HELPER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = ALL_BORDERS;
  });

  // Column widths.
  SKU_FIELDS.forEach((f, idx) => {
    main.getColumn(idx + 1).width = Math.max(
      20,
      f.header.length + 4,
      f.format.length + 4,
    );
  });

  // Freeze header + helper row.
  main.views = [{ state: "frozen", ySplit: 2 }];

  // Cell-level data validation. ExcelJS persists these properly so
  // Excel renders a dropdown arrow on every option-bearing column.
  // For long lists (categories) we point at a named range on the
  // Master sheet — Excel rejects inline lists over 255 chars.
  const FIRST_DATA_ROW = 3;
  const LAST_DATA_ROW = 1000;
  SKU_FIELDS.forEach((f, idx) => {
    if (!f.options || f.options.length === 0) return;
    const colLetter = colToLetter(idx);
    // Use a named range when present, otherwise inline literal list.
    const inlineList = `"${f.options
      .map((o) => o.replace(/"/g, '""'))
      .join(",")}"`;
    const namedRangeName = namedRanges.get(f.key);
    const formula =
      namedRangeName && inlineList.length > 250
        ? `=${namedRangeName}`
        : inlineList;
    for (let r = FIRST_DATA_ROW; r <= LAST_DATA_ROW; r++) {
      main.getCell(`${colLetter}${r}`).dataValidation = {
        type: "list",
        allowBlank: !f.mandatory,
        formulae: [formula],
        showErrorMessage: true,
        errorStyle: "stop",
        errorTitle: "Invalid value",
        error: `Pick one of: ${f.options.slice(0, 6).join(", ")}${f.options.length > 6 ? ", …" : ""}.`,
      };
    }
  });

  // ---------- Sheet 2 — Validation ----------
  const validation = wb.addWorksheet("Validation");
  validation.addRow([
    "Field",
    "Mandatory / Optional",
    "Format",
    "Validation Rules",
    "Example",
  ]);
  SKU_FIELDS.forEach((f) => {
    validation.addRow([
      f.header,
      f.mandatory ? "Mandatory" : "Optional",
      f.format,
      f.rules,
      f.example ?? "",
    ]);
  });
  validation.getColumn(1).width = 28;
  validation.getColumn(2).width = 22;
  validation.getColumn(3).width = 22;
  validation.getColumn(4).width = 64;
  validation.getColumn(5).width = 36;
  const valHeaderRow = validation.getRow(1);
  valHeaderRow.height = 22;
  valHeaderRow.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = ALL_BORDERS;
  });
  // Wrap text in the Rules column.
  for (let r = 2; r <= validation.rowCount; r++) {
    validation.getCell(r, 4).alignment = { wrapText: true, vertical: "top" };
  }
  validation.views = [{ state: "frozen", ySplit: 1 }];

  // Reorder sheets so the user lands on Main SKU Upload first when
  // they open the workbook.
  wb.eachSheet((sheet) => {
    if (sheet.name !== "Main SKU Upload") return;
    sheet.orderNo = 0;
  });

  // ---------- Trigger download ----------
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "SKU_Import_Template.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/** Parsed SKU row, keyed by SkuFieldDef.key. */
export type ParsedSkuRow = Record<string, string>;

export interface ParseFileResult {
  /** Header row from the Main sheet (without trailing `*`). */
  headers: string[];
  /** Data rows starting from row 3 (after header + helper). */
  rows: ParsedSkuRow[];
  /** True when the file is missing the Main sheet or required headers. */
  fatalError?: string;
}

/** Parse an uploaded .xlsx / .csv file using SheetJS. */
export const parseSkuImportFile = async (
  file: File,
): Promise<ParseFileResult> => {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  // Prefer the "Main SKU Upload" sheet when present (xlsx template);
  // fall back to the first sheet so a plain .csv still works.
  const sheetName =
    wb.SheetNames.find((n) => /main\s*sku\s*upload/i.test(n)) ??
    wb.SheetNames[0];
  if (!sheetName) {
    return { headers: [], rows: [], fatalError: "File has no sheets." };
  }
  const sheet = wb.Sheets[sheetName];
  const aoa: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
    raw: false,
  });
  if (aoa.length === 0) {
    return { headers: [], rows: [], fatalError: "Sheet is empty." };
  }

  const rawHeaders = aoa[0].map((h) => String(h).replace(/\*+\s*$/, "").trim());

  // Detect helper row vs data row. If row index 1 starts with
  // "Mandatory" / "Optional" we treat it as the helper row and skip it.
  const looksLikeHelper = (cells: string[]) =>
    cells.length > 0 && /^(mandatory|optional)\b/i.test((cells[0] ?? "").trim());
  const dataStart = aoa[1] && looksLikeHelper(aoa[1]) ? 2 : 1;
  const dataRows = aoa.slice(dataStart);

  // Map header → SkuFieldDef.key. We try exact header match first, then
  // a relaxed match (lowercase, strip non-alphanumerics) so users can
  // bring legacy CSVs without the template.
  const headerToKey = new Map<string, string>();
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  SKU_FIELDS.forEach((f) => {
    headerToKey.set(normalize(f.header), f.key);
    headerToKey.set(normalize(f.key), f.key);
  });
  // Also accept some legacy aliases.
  headerToKey.set(normalize("Item Code"), "skuCode");
  headerToKey.set(normalize("Item Name"), "skuName");
  headerToKey.set(normalize("Name"), "skuName");

  const colKey: (string | undefined)[] = rawHeaders.map((h) =>
    headerToKey.get(normalize(h)),
  );

  const rows: ParsedSkuRow[] = dataRows
    .filter((r) => r.some((c) => String(c).trim() !== ""))
    .map((cols) => {
      const row: ParsedSkuRow = {};
      cols.forEach((cell, i) => {
        const key = colKey[i];
        if (!key) return;
        row[key] = String(cell ?? "").trim();
      });
      return row;
    });

  return { headers: rawHeaders, rows };
};
