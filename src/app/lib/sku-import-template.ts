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

/** Build the .xlsx workbook (3 sheets) and trigger a download. */
export const downloadSkuTemplate = () => {
  const wb = XLSX.utils.book_new();

  // ---- Sheet 1 — Main SKU Upload ----
  // Row 1 = header (Mandatory cols carry a trailing *).
  // Row 2 = frozen helper row with Mandatory/Optional + format hint.
  // Row 3 = empty start-typing row.
  const headerRow = SKU_FIELDS.map(
    (f) => f.header + (f.mandatory ? " *" : ""),
  );
  const helperRow = SKU_FIELDS.map(
    (f) => `${f.mandatory ? "Mandatory" : "Optional"} · ${f.format}`,
  );

  const mainSheet = XLSX.utils.aoa_to_sheet([
    headerRow,
    helperRow,
    new Array(SKU_FIELDS.length).fill(""), // blank input row
  ]);

  // Freeze header + helper row.
  mainSheet["!freeze"] = { xSplit: 0, ySplit: 2 };
  // Older readers honour `!views` instead.
  (mainSheet as XLSX.WorkSheet & { "!views"?: { state: string; ySplit: number }[] })["!views"] = [
    { state: "frozen", ySplit: 2 },
  ];

  // Column widths — generous enough to show the helper row text.
  mainSheet["!cols"] = SKU_FIELDS.map((f) => ({
    wch: Math.max(20, f.header.length + 4, f.format.length + 4),
  }));

  // Cell-level data validation for dropdown columns. Excel reads these
  // from the workbook's `!dataValidation` array; SheetJS persists them.
  const dataValidations: {
    sqref: string;
    type: "list";
    formula1: string;
    allowBlank?: boolean;
  }[] = [];
  SKU_FIELDS.forEach((f, idx) => {
    if (!f.options || f.options.length === 0) return;
    const colLetter = colToLetter(idx);
    // Apply the dropdown to rows 3..1000 (input rows). Row 1 = header,
    // row 2 = helper text we want to keep readable.
    const sqref = `${colLetter}3:${colLetter}1000`;
    // Inline list — survives even if the user breaks the Master sheet.
    const formula1 = `"${f.options.map((o) => o.replace(/"/g, '""')).join(",")}"`;
    dataValidations.push({
      sqref,
      type: "list",
      formula1,
      allowBlank: !f.mandatory,
    });
  });
  if (dataValidations.length > 0) {
    (mainSheet as XLSX.WorkSheet & {
      "!dataValidation"?: typeof dataValidations;
    })["!dataValidation"] = dataValidations;
  }

  XLSX.utils.book_append_sheet(wb, mainSheet, "Main SKU Upload");

  // ---- Sheet 2 — Validation ----
  const validationRows: (string | number)[][] = [
    [
      "Field",
      "Mandatory / Optional",
      "Format",
      "Validation Rules",
      "Example",
    ],
    ...SKU_FIELDS.map((f) => [
      f.header,
      f.mandatory ? "Mandatory" : "Optional",
      f.format,
      f.rules,
      f.example ?? "",
    ]),
  ];
  const validationSheet = XLSX.utils.aoa_to_sheet(validationRows);
  validationSheet["!cols"] = [
    { wch: 28 }, // Field
    { wch: 22 }, // Mandatory
    { wch: 22 }, // Format
    { wch: 64 }, // Rules
    { wch: 36 }, // Example
  ];
  validationSheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  (validationSheet as XLSX.WorkSheet & {
    "!views"?: { state: string; ySplit: number }[];
  })["!views"] = [{ state: "frozen", ySplit: 1 }];
  XLSX.utils.book_append_sheet(wb, validationSheet, "Validation");

  // ---- Sheet 3 — Master Data ----
  // Each option list as its own column so users can also use these
  // as named ranges if they prefer. The Main-sheet dropdowns use
  // inline lists so this sheet is purely reference material.
  const masterColumns: { label: string; values: string[] }[] = [];
  const seenLabels = new Set<string>();
  SKU_FIELDS.forEach((f) => {
    if (!f.options || seenLabels.has(f.header)) return;
    masterColumns.push({ label: f.header, values: f.options });
    seenLabels.add(f.header);
  });
  const maxRows = Math.max(...masterColumns.map((c) => c.values.length));
  const masterRows: string[][] = [
    masterColumns.map((c) => c.label),
    ...Array.from({ length: maxRows }, (_, r) =>
      masterColumns.map((c) => c.values[r] ?? ""),
    ),
  ];
  const masterSheet = XLSX.utils.aoa_to_sheet(masterRows);
  masterSheet["!cols"] = masterColumns.map((c) => ({
    wch: Math.max(c.label.length + 4, ...c.values.map((v) => v.length + 4)),
  }));
  masterSheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, masterSheet, "Master Data");

  // ---- Trigger download ----
  XLSX.writeFile(wb, "SKU_Import_Template.xlsx");
};

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
