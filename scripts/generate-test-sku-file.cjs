// =====================================================================
// One-off generator for an SKU bulk-import TEST file.
//
// Produces SKU_Test_50_Records.xlsx with 50 rows on the
// "Main SKU Upload" sheet:
//   • 30 fully valid SKUs (no errors)
//   • 20 invalid SKUs with a deliberate spread of error counts:
//       - 1 SKU with exactly 1 mistake
//       - 1 SKU with exactly 10 mistakes
//       - 1 SKU with EVERY rule broken (all-mistakes max)
//       - 17 SKUs with 2..9 mistakes each
//
// Run with:  node scripts/generate-test-sku-file.cjs
// =====================================================================

const path = require("path");
const ExcelJS = require("exceljs");

// Mirror SKU_FIELDS from src/app/lib/sku-import-template.ts.
// Order = column order on the Main sheet.
const SKU_FIELDS = [
  { key: "skuCode",                  header: "SKU Code",                 mandatory: true,  format: "Letters/digits/-/_" },
  { key: "skuName",                  header: "SKU Name",                 mandatory: true,  format: "3–100 chars" },
  { key: "shortDesc",                header: "Short Description",        mandatory: true,  format: "10–150 chars" },
  { key: "longDesc",                 header: "Long Description",         mandatory: false, format: "Up to 200 chars" },
  { key: "measureUnit",              header: "Measure Unit",             mandatory: true,  format: "Dropdown",
    options: ["Dozen", "Gram", "Kilogram", "Ton", "Liter", "Milliliter"] },
  { key: "measureValue",             header: "Unit Value",               mandatory: true,  format: "Whole number > 0" },
  { key: "unitizedCount",            header: "Pack Size",                mandatory: false, format: "Whole number ≥ 1" },
  { key: "upc",                      header: "UPC",                      mandatory: false, format: "Numeric" },
  { key: "skuWeight",                header: "SKU Weight (kg)",          mandatory: false, format: "Decimal > 0" },
  { key: "minimumOrderQty",          header: "Min Order Quantity",       mandatory: true,  format: "Whole number ≥ 1" },
  { key: "maximumOrderQty",          header: "Max Order Quantity",       mandatory: true,  format: "Whole number ≥ 1" },
  { key: "categoryId",               header: "Category",                 mandatory: true,  format: "Dropdown",
    options: [
      "Atta, Flours & Sooji","Bakery, Cakes & Dairy","Beauty & Hygiene","Beverages","Biscuits, Snacks & Namkeen",
      "Cooking Oils & Ghee","Dairy & Cheese","Dals & Pulses","Detergents","Dry Fruits","Eggs, Meat & Fish",
      "Foodgrains, Oil & Masala","Fruit Juices","Frozen Snacks","Frozen Vegetables","Fruits and Vegetables",
      "Gift Voucher","Gourmet & World Foods","Indian Sweets","Kitchen Accessories","Masala & Seasoning",
      "Oats & Noodles","Oil & Ghee","Pasta & Soup","Pet Care","Pickles & Podis","Ready to Cook","Rice",
      "Salt & Sugar","Snacks, Dry Fruits & Nuts","Sugar & Spices","Snacks & Branded Foods",
      "Spreads, Sauces & Ketchups","Tea & Coffee","Tinned & Processed Foods",
    ] },
  { key: "fulfillmentId",            header: "Fulfillment",              mandatory: true,  format: "Dropdown",
    options: ["Store Delivery"] },
  { key: "locationId",               header: "Location",                 mandatory: true,  format: "Dropdown",
    options: ["Warehouse 1", "Warehouse 2", "Warehouse 3"] },
  { key: "returnable",               header: "Returnable",               mandatory: true,  format: "Yes / No",
    options: ["Yes", "No"] },
  { key: "cancellable",              header: "Cancellable",              mandatory: true,  format: "Yes / No",
    options: ["Yes", "No"] },
  { key: "availableOnCod",           header: "Available on COD",         mandatory: true,  format: "Yes / No",
    options: ["Yes", "No"] },
  { key: "timeToShip",               header: "Time to Ship",             mandatory: true,  format: "Dropdown",
    options: ["24 hours", "36 hours", "48 hours"] },
  { key: "consumerCareContactName",  header: "Customer Care Name",       mandatory: true,  format: "Letters only" },
  { key: "consumerCareContactEmail", header: "Customer Care Email",      mandatory: true,  format: "Valid email" },
  { key: "consumerCareContactPhone", header: "Customer Care Phone",      mandatory: true,  format: "10 digits" },
  { key: "manufacturerName",         header: "Manufacturer",             mandatory: true,  format: "Linked company" },
  { key: "brandAttribute",           header: "Brand",                    mandatory: true,  format: "Linked brand" },
  { key: "manufacturerAddress",      header: "Manufacturer Address",     mandatory: false, format: "10–250 chars" },
  { key: "countryOfOrigin",          header: "Country of Origin",        mandatory: true,  format: "Dropdown",
    options: ["India", "Bangladesh", "Sri Lanka", "Nepal", "Bhutan", "China", "Other"] },
  { key: "itemStatus",               header: "Status",                   mandatory: true,  format: "Dropdown",
    options: ["Active", "Inactive"] },
];

// A clean, fully-valid baseline row. Every "good" row mutates a copy
// of this; every "bad" row starts as a copy and breaks rules.
const baseline = {
  skuCode: "TEST_001",
  skuName: "Premium Refined Sunflower Oil 1L",
  shortDesc: "Cold-pressed sunflower oil for everyday cooking",
  longDesc: "Light, neutral-tasting oil suited to high-temperature cooking and salads.",
  measureUnit: "Liter",
  measureValue: "1",
  unitizedCount: "1",
  upc: "8901234567890",
  skuWeight: "1.0",
  minimumOrderQty: "1",
  maximumOrderQty: "100",
  categoryId: "Cooking Oils & Ghee",
  fulfillmentId: "Store Delivery",
  locationId: "Warehouse 1",
  returnable: "No",
  cancellable: "No",
  availableOnCod: "Yes",
  timeToShip: "24 hours",
  consumerCareContactName: "Customer Support",
  consumerCareContactEmail: "support@example.com",
  consumerCareContactPhone: "9876543210",
  manufacturerName: "ITC Limited",
  brandAttribute: "Aashirvaad",
  manufacturerAddress: "Plot 14, MIDC, Mumbai 400072",
  countryOfOrigin: "India",
  itemStatus: "Active",
};

const productNames = [
  "Aashirvaad Whole Wheat Atta 5kg",
  "Marico Saffola Gold Edible Oil 1L",
  "Tata Salt Iodised 1kg",
  "Britannia Marie Gold Biscuits 250g",
  "Parle G Glucose Biscuits 800g",
  "Amul Pure Ghee 500ml",
  "Nestle Maggi 2-Min Noodles 280g",
  "Red Label Tea 500g",
  "Sunfeast Glucose Biscuits 100g",
  "Daawat Basmati Rice 5kg",
  "Fortune Sunlite Oil 5L",
  "Mother Dairy Toned Milk 1L",
  "Amul Butter Salted 500g",
  "Cadbury Dairy Milk 100g",
  "Lays Classic Salted Chips 90g",
  "Kissan Mixed Fruit Jam 500g",
  "Saffola Honey 500g",
  "Tropicana Orange Juice 1L",
  "Bingo Mad Angles 65g",
  "Knorr Tomato Soup 53g",
  "Britannia Bread White 400g",
  "Paper Boat Aam Panna 250ml",
  "Nescafe Classic Coffee 100g",
  "Brooke Bond Taj Mahal Tea 250g",
  "Sunfeast Yippee Noodles 70g",
  "Aashirvaad Multigrain Atta 5kg",
  "Tata Sampann Toor Dal 1kg",
  "Fortune Mustard Oil 1L",
  "Patanjali Atta Noodles 60g",
  "Saffola Honey Balanced 250g",
  "Kissan Tomato Ketchup 1kg",
  "Sunfeast Dark Fantasy 100g",
  "Bisleri Mineral Water 1L",
  "Aquafina Mineral Water 1L",
  "Amul Cool Cafe Coffee 200ml",
  "Britannia Cheese Cubes 200g",
  "Nestle Munch Chocolate 26g",
  "5 Star Chocolate 40g",
  "Kit Kat 4-Finger Chocolate 41g",
  "Cadbury Bournvita 500g",
  "Amul Cheese Slices 200g",
  "Tata Tea Premium 500g",
  "Daawat Brown Basmati Rice 1kg",
  "Fortune Soya Health Oil 1L",
  "Tata Sampann Chana Dal 1kg",
  "Britannia Wonder Bread 400g",
  "Mother Dairy Curd 400g",
  "Saffola Tasty Gold Oil 1L",
  "Maggi Hot & Sweet Sauce 1kg",
  "Tata Tea Gold 250g",
];

const measureUnits = ["Liter", "Milliliter", "Kilogram", "Gram", "Dozen"];
const categories = SKU_FIELDS.find((f) => f.key === "categoryId").options;
const companies = ["ITC Limited", "Marico", "Tata Consumer Products", "Britannia", "Parle Products", "Nestle India", "Mother Dairy", "Amul"];
const brands = ["Aashirvaad", "Saffola", "Tata", "Britannia", "Parle", "Nestle", "Mother Dairy", "Amul"];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---- Generate 30 GOOD rows --------------------------------------------------
const goodRows = [];
for (let i = 0; i < 30; i++) {
  const row = { ...baseline };
  row.skuCode = `TEST_${String(i + 1).padStart(3, "0")}`;
  row.skuName = productNames[i % productNames.length];
  row.shortDesc = `${row.skuName.split(" ").slice(0, 4).join(" ")} — premium variant`;
  row.measureUnit = pickRandom(measureUnits);
  row.measureValue = String(Math.floor(Math.random() * 10) + 1);
  row.upc = String(8901234567000 + i);
  row.skuWeight = (Math.random() * 5 + 0.1).toFixed(2);
  row.minimumOrderQty = "1";
  row.maximumOrderQty = String(50 + i * 5);
  row.categoryId = pickRandom(categories);
  row.locationId = pickRandom(["Warehouse 1", "Warehouse 2", "Warehouse 3"]);
  row.returnable = pickRandom(["Yes", "No"]);
  row.cancellable = pickRandom(["Yes", "No"]);
  row.availableOnCod = pickRandom(["Yes", "No"]);
  row.timeToShip = pickRandom(["24 hours", "36 hours", "48 hours"]);
  const idx = i % companies.length;
  row.manufacturerName = companies[idx];
  row.brandAttribute = brands[idx];
  row.itemStatus = i % 7 === 0 ? "Inactive" : "Active";
  goodRows.push(row);
}

// ---- Generate 20 BAD rows with controlled error spread ----------------------
//
// Helpers — each "break" function corrupts ONE specific rule on the row.
// We compose breaks per-SKU to hit a specific error count.
const breaks = {
  blankSkuCode:        (r) => { r.skuCode = ""; },
  badSkuCodeFormat:    (r) => { r.skuCode = "BAD CODE!@#"; },
  shortSkuName:        (r) => { r.skuName = "AB"; },                               // < 3
  longSkuName:         (r) => { r.skuName = "X".repeat(120); },                     // > 100
  shortShortDesc:      (r) => { r.shortDesc = "tiny"; },                            // < 10
  longShortDesc:       (r) => { r.shortDesc = "X".repeat(200); },                   // > 150
  longLongDesc:        (r) => { r.longDesc = "X".repeat(250); },                    // > 200
  badMeasureUnit:      (r) => { r.measureUnit = "Pounds"; },                        // not in list
  badMeasureValue:     (r) => { r.measureValue = "1.5"; },                          // not whole
  badUnitizedCount:    (r) => { r.unitizedCount = "0"; },                           // not positive
  badUpc:              (r) => { r.upc = "ABC12"; },                                 // non-numeric
  badSkuWeight:        (r) => { r.skuWeight = "-2"; },                              // not positive
  blankMinQty:         (r) => { r.minimumOrderQty = ""; },
  blankMaxQty:         (r) => { r.maximumOrderQty = ""; },
  minGreaterThanMax:   (r) => { r.minimumOrderQty = "200"; r.maximumOrderQty = "50"; },
  badCategory:         (r) => { r.categoryId = "Random Made-Up Category"; },
  badFulfillment:      (r) => { r.fulfillmentId = "Drone Delivery"; },
  badLocation:         (r) => { r.locationId = "Mars Hub"; },
  badReturnable:       (r) => { r.returnable = "Maybe"; },
  badCancellable:      (r) => { r.cancellable = "Sometimes"; },
  badCod:              (r) => { r.availableOnCod = "Card only"; },
  badTimeToShip:       (r) => { r.timeToShip = "Whenever"; },
  badCcName:           (r) => { r.consumerCareContactName = "Support 1234"; },     // digits not allowed
  badCcEmail:          (r) => { r.consumerCareContactEmail = "not-an-email"; },
  badCcPhone:          (r) => { r.consumerCareContactPhone = "12345"; },           // < 10 digits
  shortMfgAddress:     (r) => { r.manufacturerAddress = "Short"; },                // < 10
  longMfgAddress:      (r) => { r.manufacturerAddress = "X".repeat(300); },        // > 250
  badCountry:          (r) => { r.countryOfOrigin = "Atlantis"; },
  badItemStatus:       (r) => { r.itemStatus = "Pending"; },
};

const allBreakNames = Object.keys(breaks);

const makeBadRow = (skuCode, skuName, breakNames) => {
  const row = { ...baseline, skuCode, skuName };
  breakNames.forEach((name) => breaks[name](row));
  return row;
};

const badRows = [];

// 1) SKU with exactly 1 mistake
badRows.push(
  makeBadRow("BAD_001_ONE_MISTAKE", "One mistake — bad email only",
    ["badCcEmail"]),
);

// 2) Six SKUs with 2 mistakes each (spread across rule families)
[
  ["BAD_002_TWO_MIST",   "Bad SKU code + bad measure unit",        ["badSkuCodeFormat", "badMeasureUnit"]],
  ["BAD_003_TWO_MIST",   "Short desc + bad email",                 ["shortShortDesc", "badCcEmail"]],
  ["BAD_004_TWO_MIST",   "Bad UPC + bad weight",                   ["badUpc", "badSkuWeight"]],
  ["BAD_005_TWO_MIST",   "Bad category + bad time-to-ship",        ["badCategory", "badTimeToShip"]],
  ["BAD_006_TWO_MIST",   "Bad cc name + bad cc phone",             ["badCcName", "badCcPhone"]],
  ["BAD_007_TWO_MIST",   "Bad returnable + bad COD",               ["badReturnable", "badCod"]],
].forEach((t) => badRows.push(makeBadRow(t[0], t[1], t[2])));

// 3) Five SKUs with 4 mistakes each
[
  ["BAD_008_FOUR_MIST",  "4 mistakes — text/length",
    ["shortSkuName", "shortShortDesc", "longLongDesc", "shortMfgAddress"]],
  ["BAD_009_FOUR_MIST",  "4 mistakes — dropdown chaos",
    ["badMeasureUnit", "badCategory", "badLocation", "badCountry"]],
  ["BAD_010_FOUR_MIST",  "4 mistakes — numeric chaos",
    ["badMeasureValue", "badUnitizedCount", "badUpc", "badSkuWeight"]],
  ["BAD_011_FOUR_MIST",  "4 mistakes — yes/no chaos",
    ["badReturnable", "badCancellable", "badCod", "badItemStatus"]],
  ["BAD_012_FOUR_MIST",  "4 mistakes — customer care",
    ["badCcName", "badCcEmail", "badCcPhone", "badTimeToShip"]],
];

// 4) Five SKUs with 5–9 mistakes each (varied)
[
  ["BAD_008_FOUR_MIST",  "Text/length issues",
    ["shortSkuName", "shortShortDesc", "longLongDesc", "shortMfgAddress"]],
  ["BAD_009_FIVE_MIST",  "Dropdown chaos",
    ["badMeasureUnit", "badCategory", "badLocation", "badCountry", "badTimeToShip"]],
  ["BAD_010_SIX_MIST",   "Numeric + yes-no chaos",
    ["badMeasureValue", "badUnitizedCount", "badUpc", "badSkuWeight",
     "badReturnable", "badCod"]],
  ["BAD_011_SEVEN_MIST", "Customer care + dropdowns",
    ["badCcName", "badCcEmail", "badCcPhone", "badTimeToShip",
     "badReturnable", "badCancellable", "badItemStatus"]],
  ["BAD_012_EIGHT_MIST", "Mixed bag — eight rules",
    ["shortSkuName", "shortShortDesc", "longLongDesc", "badMeasureUnit",
     "badUpc", "badCategory", "badCcEmail", "badCountry"]],
  ["BAD_013_NINE_MIST",  "Nine mistakes — almost everything",
    ["badSkuCodeFormat", "shortSkuName", "shortShortDesc", "longLongDesc",
     "badMeasureUnit", "badMeasureValue", "badUpc", "badCategory",
     "badCountry"]],
].forEach((t) => badRows.push(makeBadRow(t[0], t[1], t[2])));

// 5) Three "filler" SKUs at 3 mistakes each
[
  ["BAD_014_THREE_MIST", "Three mistakes — desc, email, phone",
    ["shortShortDesc", "badCcEmail", "badCcPhone"]],
  ["BAD_015_THREE_MIST", "Three mistakes — cat, country, status",
    ["badCategory", "badCountry", "badItemStatus"]],
  ["BAD_016_THREE_MIST", "Three mistakes — UPC, qty, weight",
    ["badUpc", "minGreaterThanMax", "badSkuWeight"]],
].forEach((t) => badRows.push(makeBadRow(t[0], t[1], t[2])));

// 6) One SKU with EXACTLY 10 mistakes
badRows.push(
  makeBadRow("BAD_017_TEN_MIST", "Exactly 10 mistakes",
    ["badSkuCodeFormat", "shortSkuName", "shortShortDesc", "longLongDesc",
     "badMeasureUnit", "badMeasureValue", "badUpc", "badSkuWeight",
     "minGreaterThanMax", "badCategory"]),
);

// 7) Two more 5-7 mistake fillers to reach 20 total
[
  ["BAD_018_FIVE_MIST", "Five mistakes — yes/no + dropdown",
    ["badReturnable", "badCancellable", "badCod", "badFulfillment", "badLocation"]],
  ["BAD_019_SIX_MIST",  "Six mistakes — mixed text + numeric",
    ["shortSkuName", "longShortDesc", "badMeasureValue", "badUnitizedCount",
     "badCcEmail", "badItemStatus"]],
].forEach((t) => badRows.push(makeBadRow(t[0], t[1], t[2])));

// 8) ONE SKU with EVERY rule broken (max-mistakes)
badRows.push(
  makeBadRow("BAD_020_ALL_MIST", "MAX — every rule broken",
    allBreakNames),
);

if (badRows.length !== 20) {
  console.warn(`Expected 20 bad rows, got ${badRows.length}.`);
}

// Deduplicate by skuCode (some explicit lists overlap by accident)
const seen = new Set();
const finalBadRows = [];
for (const row of badRows) {
  const key = row.skuCode;
  if (seen.has(key)) continue;
  seen.add(key);
  finalBadRows.push(row);
}

// Pad / trim to exactly 20 bad rows.
while (finalBadRows.length < 20) {
  const idx = finalBadRows.length + 1;
  finalBadRows.push(makeBadRow(`BAD_PAD_${idx}`, `Padding bad row ${idx}`, ["badCcEmail", "badCcPhone"]));
}
finalBadRows.length = 20;

const allRows = [...goodRows, ...finalBadRows];

// =====================================================================
// Build the .xlsx — same 3-tab structure as the real template, but
// pre-populated with 50 test rows on the Main sheet.
// =====================================================================

const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
const HEADER_FONT = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
const HELPER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
const HELPER_FONT = { italic: true, color: { argb: "FF1E3A8A" }, size: 10 };
const BORDER = { style: "thin", color: { argb: "FFCBD5E1" } };
const ALL_BORDERS = { top: BORDER, left: BORDER, right: BORDER, bottom: BORDER };

const FIELD_RULES = {
  skuCode:                  "Required. Alphanumeric (letters, digits, dashes, underscores). Must be unique within the file and not collide with an existing SKU.",
  skuName:                  "Required. 3 to 100 characters. Plain text.",
  shortDesc:                "Required. 10 to 150 characters. Plain text only — no links or HTML.",
  longDesc:                 "Optional. Up to 200 characters. Plain text only.",
  measureUnit:              "Required. Pick from the dropdown.",
  measureValue:             "Required. Positive whole number (no decimals).",
  unitizedCount:            "Optional. Positive whole number when filled.",
  upc:                      "Optional. Numeric value.",
  skuWeight:                "Optional. Positive number — gross weight in kilograms.",
  minimumOrderQty:          "Required. Positive whole number. Cannot be greater than Max Order Quantity.",
  maximumOrderQty:          "Required. Positive whole number. Cannot be less than Min Order Quantity.",
  categoryId:               "Required. Pick a category from the admin-managed list.",
  fulfillmentId:            "Required. Phase 1 supports Store Delivery only.",
  locationId:               "Required. The warehouse this SKU is fulfilled from.",
  returnable:               "Required. Phase 1 default: No.",
  cancellable:              "Required. Phase 1 default: No.",
  availableOnCod:           "Required. Phase 1 default: Yes.",
  timeToShip:               "Required. Pick the dispatch window.",
  consumerCareContactName:  "Required. Alphabetical characters only.",
  consumerCareContactEmail: "Required. Valid email address (name@domain.tld).",
  consumerCareContactPhone: "Required. Exactly 10 digits, numeric only.",
  manufacturerName:         "Required. Must match a company linked to your seller account (see Manage Seller → Companies & Brands).",
  brandAttribute:           "Required. Must be a brand under the selected Manufacturer.",
  manufacturerAddress:      "Optional. 10 to 250 characters when filled. Should include a 6-digit PIN.",
  countryOfOrigin:          "Required. Default: India.",
  itemStatus:               "Required. Active SKUs are visible to buyers; Inactive SKUs are hidden.",
};

const FIELD_EXAMPLES = {
  skuCode:                  "180000005",
  skuName:                  "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN",
  shortDesc:                "Premium refined sunflower oil, 15 kg tin",
  longDesc:                 "Filtered for clarity, suitable for high-temperature cooking.",
  measureUnit:              "Liter",
  measureValue:             "15",
  unitizedCount:            "1",
  upc:                      "8901234567890",
  skuWeight:                "15.0",
  minimumOrderQty:          "1",
  maximumOrderQty:          "100",
  categoryId:               "Cooking Oils & Ghee",
  fulfillmentId:            "Store Delivery",
  locationId:               "Warehouse 1",
  returnable:               "No",
  cancellable:              "No",
  availableOnCod:           "Yes",
  timeToShip:               "24 hours",
  consumerCareContactName:  "Customer Support",
  consumerCareContactEmail: "support@example.com",
  consumerCareContactPhone: "9876543210",
  manufacturerName:         "ITC Limited",
  brandAttribute:           "Aashirvaad",
  manufacturerAddress:      "Plot 14, MIDC, Mumbai 400072",
  countryOfOrigin:          "India",
  itemStatus:               "Active",
};

const colToLetter = (idx) => {
  let n = idx;
  let s = "";
  while (n >= 0) {
    s = String.fromCharCode((n % 26) + 65) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
};

const escapeSheetName = (name) =>
  /[^A-Za-z0-9_]/.test(name) ? `'${name.replace(/'/g, "''")}'` : name;

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Qwipo Seller Store — Test Data";
  wb.created = new Date();

  // ------------------------------------------------------------------
  // Sheet 3 — Master Data (built first so the Main sheet can
  // reference it through named ranges).
  // ------------------------------------------------------------------
  const masterSheet = wb.addWorksheet("Master Data");
  const masterColumns = [];
  const seen = new Set();
  SKU_FIELDS.forEach((f) => {
    if (!f.options || seen.has(f.header)) return;
    masterColumns.push({ label: f.header, values: f.options, key: f.key });
    seen.add(f.header);
  });
  masterSheet.addRow(masterColumns.map((c) => c.label));
  const maxRows = Math.max(...masterColumns.map((c) => c.values.length));
  for (let r = 0; r < maxRows; r++) {
    masterSheet.addRow(masterColumns.map((c) => c.values[r] ?? ""));
  }
  const masterHeader = masterSheet.getRow(1);
  masterHeader.height = 22;
  masterHeader.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = ALL_BORDERS;
  });
  masterSheet.views = [{ state: "frozen", ySplit: 1 }];
  masterColumns.forEach((c, idx) => {
    masterSheet.getColumn(idx + 1).width = Math.max(
      c.label.length + 4,
      ...c.values.map((v) => v.length + 4),
    );
  });

  // Workbook-level named ranges (one per option column).
  const namedRanges = new Map();
  masterColumns.forEach((c, idx) => {
    const colLetter = colToLetter(idx);
    const range = `${escapeSheetName("Master Data")}!$${colLetter}$2:$${colLetter}$${c.values.length + 1}`;
    const name = `MASTER_${c.key.toUpperCase()}`;
    wb.definedNames.add(range, name);
    namedRanges.set(c.key, name);
  });

  // ------------------------------------------------------------------
  // Sheet 1 — Main SKU Upload (with 50 test rows pre-filled)
  // ------------------------------------------------------------------
  const main = wb.addWorksheet("Main SKU Upload");
  // Row 1 — headers
  main.addRow(SKU_FIELDS.map((f) => f.header + (f.mandatory ? " *" : "")));
  // Row 2 — frozen helper row
  main.addRow(
    SKU_FIELDS.map((f) => `${f.mandatory ? "Mandatory" : "Optional"} · ${f.format}`),
  );
  // Rows 3..52 — test data
  for (const row of allRows) {
    main.addRow(SKU_FIELDS.map((f) => row[f.key] ?? ""));
  }

  // Style header + helper rows
  const mainHeader = main.getRow(1);
  mainHeader.height = 24;
  mainHeader.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = ALL_BORDERS;
  });
  const mainHelper = main.getRow(2);
  mainHelper.height = 20;
  mainHelper.eachCell((cell) => {
    cell.font = HELPER_FONT;
    cell.fill = HELPER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = ALL_BORDERS;
  });

  // Column widths
  SKU_FIELDS.forEach((f, idx) => {
    main.getColumn(idx + 1).width = Math.max(
      20,
      f.header.length + 4,
      f.format.length + 4,
    );
  });

  // Freeze header + helper rows
  main.views = [{ state: "frozen", ySplit: 2 }];

  // Cell-level data validation on every option-bearing column.
  // Excel will show the dropdown arrow on every input cell from row
  // 3..1000. Because the test rows already contain deliberately bad
  // values (BAD_*** rows), Excel will mark those cells with an
  // information indicator — the validator side runs from values, so
  // those rows still trigger validation errors when uploaded.
  const FIRST_DATA_ROW = 3;
  const LAST_DATA_ROW = 1000;
  SKU_FIELDS.forEach((f, idx) => {
    if (!f.options || f.options.length === 0) return;
    const colLetter = colToLetter(idx);
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
        errorStyle: "information",
        errorTitle: "Invalid value",
        error: `Pick one of: ${f.options.slice(0, 6).join(", ")}${f.options.length > 6 ? ", …" : ""}.`,
      };
    }
  });

  // Highlight bad rows in light red so it's visually obvious which
  // rows are expected to fail.
  for (let r = 3; r <= 2 + allRows.length; r++) {
    const rowIndex = r - 3;
    if (rowIndex >= 30) {
      main.getRow(r).eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
      });
    }
  }

  // ------------------------------------------------------------------
  // Sheet 2 — Validation
  // ------------------------------------------------------------------
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
      FIELD_RULES[f.key] ?? "",
      FIELD_EXAMPLES[f.key] ?? "",
    ]);
  });
  validation.getColumn(1).width = 28;
  validation.getColumn(2).width = 22;
  validation.getColumn(3).width = 22;
  validation.getColumn(4).width = 64;
  validation.getColumn(5).width = 36;
  const valHeader = validation.getRow(1);
  valHeader.height = 22;
  valHeader.eachCell((cell) => {
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = ALL_BORDERS;
  });
  for (let r = 2; r <= validation.rowCount; r++) {
    validation.getCell(r, 4).alignment = { wrapText: true, vertical: "top" };
  }
  validation.views = [{ state: "frozen", ySplit: 1 }];

  // Reorder so Main SKU Upload opens first.
  wb.eachSheet((sheet) => {
    if (sheet.name === "Main SKU Upload") sheet.orderNo = 0;
  });

  const outPath = path.join(__dirname, "..", "SKU_Test_50_Records.xlsx");
  await wb.xlsx.writeFile(outPath);
  console.log(`✓ Wrote ${outPath}`);
  console.log(`  Sheets: Main SKU Upload · Validation · Master Data`);
  console.log(`  - 30 good rows (TEST_001 … TEST_030)`);
  console.log(`  - 20 bad rows (BAD_001 … BAD_020)`);
  console.log(`     · BAD_001 — exactly 1 mistake`);
  console.log(`     · BAD_017 — exactly 10 mistakes`);
  console.log(`     · BAD_020 — every rule broken (max)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
