// Build the ONDC eB2B SKU Creation Validation Rules Word document.
// Run with: node scripts/build-ondc-rules.cjs
//
// Produces: Seller-Store-ONDC-SKU-Validation-Rules.docx
// Source content: Qwipo internal "ONDC_SKU_Validation_Rules" reference (23-Apr-2026 field list).
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, Header, Footer,
  PageNumber, TabStopType, TabStopPosition,
} = require("docx");

// ---------- layout constants ----------
const PAGE_WIDTH = 12240;
const PAGE_HEIGHT = 15840;
const PAGE_MARGIN = 1080;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

const COLOR_PRIMARY = "1F4E79";
const COLOR_ACCENT = "2E75B6";
const COLOR_RED = "C00000";
const COLOR_MUTED = "595959";
const COLOR_GREEN = "548235";
const HEADER_FILL = "1F4E79";
const FIELD_FILL = "DEE6F1";
const ZEBRA_FILL = "F2F6FA";
const RULE_BANNER_FILL = "EAF1F8";
const CODE_FILL = "F4F4F4";

const border = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

// ---------- atomic builders ----------
function P(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text: String(text), ...(opts.run || {}) })],
    spacing: { before: opts.before ?? 60, after: opts.after ?? 60 },
    alignment: opts.alignment,
    pageBreakBefore: opts.pageBreakBefore,
  });
}

function H1(text, opts = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, color: COLOR_PRIMARY, size: 36 })],
    spacing: { before: 320, after: 200 },
    pageBreakBefore: opts.pageBreakBefore ?? true,
  });
}

function num(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [new TextRun({ text })],
    spacing: { before: 40, after: 40 },
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text })],
    spacing: { before: 40, after: 40 },
  });
}

function mono(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Consolas", size: 18 })],
    spacing: { before: opts.before ?? 0, after: opts.after ?? 0 },
    shading: { fill: CODE_FILL, type: ShadingType.CLEAR, color: "auto" },
  });
}

function makeTable(headers, rows, proportions) {
  const total = proportions.reduce((a, b) => a + b, 0);
  const colWidths = proportions.map(p => Math.round((CONTENT_WIDTH * p) / total));
  const sum = colWidths.reduce((a, b) => a + b, 0);
  colWidths[colWidths.length - 1] += CONTENT_WIDTH - sum;

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: cellBorders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: HEADER_FILL, type: ShadingType.CLEAR, color: "auto" },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })],
        spacing: { before: 0, after: 0 },
      })],
    })),
  });

  const dataRows = rows.map((r, ri) => new TableRow({
    children: r.map((cellVal, ci) => new TableCell({
      borders: cellBorders,
      width: { size: colWidths[ci], type: WidthType.DXA },
      shading: ri % 2 === 1
        ? { fill: ZEBRA_FILL, type: ShadingType.CLEAR, color: "auto" }
        : undefined,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: cellToParagraphs(cellVal),
    })),
  }));

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
}

function metaTable(rows) {
  const left = Math.round(CONTENT_WIDTH * 0.28);
  const right = CONTENT_WIDTH - left;
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [left, right],
    rows: rows.map(([k, v], ri) => new TableRow({
      children: [
        new TableCell({
          borders: cellBorders,
          width: { size: left, type: WidthType.DXA },
          shading: { fill: FIELD_FILL, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: k, bold: true, color: COLOR_PRIMARY, size: 20 })],
            spacing: { before: 0, after: 0 },
          })],
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: right, type: WidthType.DXA },
          shading: ri % 2 === 1
            ? { fill: ZEBRA_FILL, type: ShadingType.CLEAR, color: "auto" }
            : undefined,
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: cellToParagraphs(v),
        }),
      ],
    })),
  });
}

function cellToParagraphs(val) {
  const arr = Array.isArray(val) ? val : [val];
  return arr.map(line => new Paragraph({
    children: [new TextRun({ text: String(line), size: 20 })],
    spacing: { before: 0, after: 0 },
  }));
}

function sectionBanner(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY, space: 2 } },
    children: [new TextRun({ text, bold: true, color: COLOR_PRIMARY, size: 28 })],
    pageBreakBefore: true,
  });
}

function subBanner(text) {
  return new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [new TextRun({ text, bold: true, color: COLOR_ACCENT, size: 22 })],
  });
}

// ---------- per-rule renderer ----------
function renderRule(rule) {
  const out = [];

  // Rule banner: "V-001  Item Status (Label)" with shaded background
  const bannerCell = new TableCell({
    borders: cellBorders,
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    shading: { fill: RULE_BANNER_FILL, type: ShadingType.CLEAR, color: "auto" },
    margins: { top: 120, bottom: 120, left: 200, right: 200 },
    children: [
      new Paragraph({
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({ text: rule.id + "  ", bold: true, color: COLOR_RED, size: 28 }),
          new TextRun({ text: rule.field, bold: true, color: COLOR_PRIMARY, size: 28 }),
        ],
      }),
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({ text: "Error Code: ", bold: true, color: COLOR_MUTED, size: 18 }),
          new TextRun({ text: rule.errorCode, font: "Consolas", color: COLOR_GREEN, size: 18 }),
        ],
      }),
    ],
  });
  out.push(new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    rows: [new TableRow({ children: [bannerCell] })],
  }));

  // Validation Rules
  out.push(new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [new TextRun({ text: "Validation Rules", bold: true, color: COLOR_ACCENT, size: 20 })],
  }));
  for (const r of rule.rules) {
    out.push(bullet(r));
  }

  // Error Messages table
  out.push(new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [new TextRun({ text: "Error Messages (as shown to user)", bold: true, color: COLOR_ACCENT, size: 20 })],
  }));
  out.push(makeTable(
    ["Trigger", "User-Facing Message"],
    rule.errors.map(e => [e.trigger, e.message]),
    [3, 8],
  ));

  return out;
}

// =====================================================================
// CONTENT
// =====================================================================

const RULES = [
  // Section 1 — Core Identifiers
  {
    id: "V-001",
    field: "Item Status (Label)",
    errorCode: "ERR_SKU_001",
    rules: [
      "Field is mandatory \u2014 cannot be null, empty or missing.",
      "Value must strictly be one of the enum: \"enable\" or \"disable\".",
      "Case-sensitive (lowercase only).",
    ],
    errors: [
      { trigger: "Empty", message: "Item status is required. Please select either Enable or Disable." },
      { trigger: "Invalid enum", message: "Invalid item status. Allowed values are Enable or Disable only." },
    ],
  },
  // Section 2 — Descriptor
  {
    id: "V-002",
    field: "Item Name",
    errorCode: "ERR_SKU_002",
    rules: [
      "Mandatory \u2014 cannot be blank.",
      "Minimum 3 characters, maximum 100 characters.",
      "Must contain brand + variant + pack-size information (business rule).",
      "No special characters other than: space, comma, hyphen, dot, parentheses, ampersand.",
      "Duplicate item name is not allowed for the same provider + location.",
    ],
    errors: [
      { trigger: "Empty", message: "Item name is required." },
      { trigger: "Length", message: "Item name must be between 3 and 100 characters." },
      { trigger: "Special chars", message: "Item name contains invalid characters. Only letters, numbers and basic punctuation are allowed." },
      { trigger: "Duplicate", message: "An item with the same name already exists at this location." },
    ],
  },
  {
    id: "V-003",
    field: "Item Code",
    errorCode: "ERR_SKU_003",
    rules: [
      "Mandatory \u2014 must follow the format \"type:code\".",
      "Type prefix must be one of 1 (EAN), 2 (ISBN), 3 (GTIN), 4 (HSN), 5 (Others).",
      "EAN \u2192 exactly 13 digits. ISBN \u2192 10 or 13 digits. GTIN \u2192 8/12/13/14 digits. HSN \u2192 4 to 8 digits. Others \u2192 alphanumeric up to 20 chars.",
      "Item code must be unique per provider (no two SKUs can share the same code).",
      "Checksum validation for EAN-13 and GTIN where applicable.",
    ],
    errors: [
      { trigger: "Empty", message: "Item code is required." },
      { trigger: "Format", message: "Invalid item code format. Please use the format type:code (e.g., 1:8901234567890)." },
      { trigger: "Invalid type", message: "Invalid code type. Allowed values: 1 (EAN), 2 (ISBN), 3 (GTIN), 4 (HSN), 5 (Others)." },
      { trigger: "Length / digits", message: "Invalid EAN/GTIN/HSN length. Please verify the code." },
      { trigger: "Duplicate", message: "This item code is already used by another SKU in your catalog." },
      { trigger: "Checksum", message: "Invalid EAN/GTIN checksum digit. Please verify the code." },
    ],
  },
  {
    id: "V-004",
    field: "Symbol / Thumbnail",
    errorCode: "ERR_SKU_004",
    rules: [
      "Mandatory \u2014 must be a valid, publicly accessible URL.",
      "Must use HTTPS (not HTTP).",
      "Allowed file extensions: .png, .jpg, .jpeg, .webp.",
      "Image file size must be \u2264 2 MB; recommended dimensions 500x500 to 2000x2000 px.",
      "URL must return HTTP 200 on health check at the time of creation.",
    ],
    errors: [
      { trigger: "Empty", message: "Thumbnail image URL is required." },
      { trigger: "Not HTTPS", message: "Image URL must use HTTPS." },
      { trigger: "Invalid extension", message: "Unsupported image format. Allowed formats: PNG, JPG, JPEG, WEBP." },
      { trigger: "Size", message: "Image file size exceeds 2 MB. Please upload a smaller image." },
      { trigger: "Unreachable", message: "The image URL is not accessible. Please check and try again." },
    ],
  },
  {
    id: "V-005",
    field: "Short Description",
    errorCode: "ERR_SKU_005",
    rules: [
      "Mandatory.",
      "Minimum 10 characters, maximum 150 characters.",
      "Plain text only \u2014 no HTML tags, no line breaks.",
    ],
    errors: [
      { trigger: "Empty", message: "Short description is required." },
      { trigger: "Length", message: "Short description must be between 10 and 150 characters." },
      { trigger: "HTML", message: "HTML tags are not allowed in short description." },
    ],
  },
  {
    id: "V-006",
    field: "Long Description",
    errorCode: "ERR_SKU_006",
    rules: [
      "Mandatory.",
      "Minimum 20 characters, maximum 1000 characters.",
      "Plain text only \u2014 HTML tags, scripts, and external links are not allowed.",
    ],
    errors: [
      { trigger: "Empty", message: "Long description is required." },
      { trigger: "Length", message: "Long description must be between 20 and 1000 characters." },
      { trigger: "HTML / script", message: "HTML tags or scripts are not permitted in the description." },
    ],
  },
  {
    id: "V-007",
    field: "Additional Images",
    errorCode: "ERR_SKU_007",
    rules: [
      "Optional field \u2014 but if provided, all URLs in the array must pass the same rules as the thumbnail (HTTPS, valid extension, size \u2264 2 MB, reachable).",
      "Maximum 8 additional images allowed per SKU.",
      "Do NOT send placeholder images if none are available \u2014 leave the array absent.",
    ],
    errors: [
      { trigger: "Count", message: "A maximum of 8 additional images can be uploaded." },
      { trigger: "Invalid URL", message: "One or more image URLs are invalid or inaccessible." },
      { trigger: "Extension", message: "One or more images have an unsupported format." },
    ],
  },
  // Section 3 — Quantity
  {
    id: "V-008",
    field: "Unitized Count (Pack Size)",
    errorCode: "ERR_SKU_008",
    rules: [
      "Optional field.",
      "If provided, must be a stringified positive integer > 0.",
      "Decimals and negative values are not allowed.",
      "Upper practical bound: 10,000 units per pack.",
    ],
    errors: [
      { trigger: "Non-integer", message: "Pack size must be a whole number." },
      { trigger: "Zero / negative", message: "Pack size must be greater than 0." },
      { trigger: "Upper bound", message: "Pack size cannot exceed 10,000." },
    ],
  },
  {
    id: "V-009",
    field: "Measure Unit",
    errorCode: "ERR_SKU_009",
    rules: [
      "Mandatory.",
      "Value must be one of the enum: \"unit\", \"dozen\", \"gram\", \"kilogram\", \"tonne\", \"litre\", \"millilitre\".",
      "Case-sensitive (lowercase only).",
      "Unit must be logically consistent with the selected category (e.g., liquids should not use kilogram).",
    ],
    errors: [
      { trigger: "Empty", message: "Measure unit is required." },
      { trigger: "Invalid enum", message: "Invalid measure unit. Allowed: unit, dozen, gram, kilogram, tonne, litre, millilitre." },
      { trigger: "Category mismatch", message: "Selected measure unit is not valid for the chosen category." },
    ],
  },
  {
    id: "V-010",
    field: "Measure Value",
    errorCode: "ERR_SKU_010",
    rules: [
      "Mandatory.",
      "Stringified numeric value > 0. Up to 3 decimal places allowed (e.g., 0.500, 1, 1.25).",
      "Must be consistent with unit (e.g., \"1\" with kilogram means 1 kg).",
    ],
    errors: [
      { trigger: "Empty", message: "Net quantity value is required." },
      { trigger: "Non-numeric", message: "Net quantity must be a valid number." },
      { trigger: "Zero / negative", message: "Net quantity must be greater than 0." },
      { trigger: "Precision", message: "Net quantity supports up to 3 decimal places only." },
    ],
  },
  {
    id: "V-011",
    field: "Available Count",
    errorCode: "ERR_SKU_011",
    rules: [
      "Mandatory.",
      "Stringified integer \u2014 must be \"0\" (out of stock) or any positive integer up to \"99\" (available cap).",
      "Value \"99\" is treated as available with no explicit count.",
      "Should not exceed the Maximum Order Quantity when compared logically.",
    ],
    errors: [
      { trigger: "Empty", message: "Available count is required." },
      { trigger: "Non-integer", message: "Available count must be a whole number." },
      { trigger: "Negative", message: "Available count cannot be negative." },
      { trigger: "Range", message: "Available count must be between 0 and 99." },
    ],
  },
  {
    id: "V-012",
    field: "Maximum Order Qty",
    errorCode: "ERR_SKU_012",
    rules: [
      "Mandatory. Stringified positive integer.",
      "Must be \u2265 Minimum Order Qty.",
      "Default value \"99\" means no upper limit.",
      "Must be \u2264 Available Count (cannot allow an order of more than what is in stock).",
    ],
    errors: [
      { trigger: "Empty", message: "Maximum order quantity is required." },
      { trigger: "Non-integer / negative", message: "Maximum order quantity must be a positive whole number." },
      { trigger: "Less than min", message: "Maximum order quantity cannot be less than minimum order quantity." },
      { trigger: "Exceeds stock", message: "Maximum order quantity cannot exceed available stock." },
    ],
  },
  {
    id: "V-013",
    field: "Minimum Order Qty",
    errorCode: "ERR_SKU_013",
    rules: [
      "Mandatory. Stringified positive integer \u2265 1.",
      "Must be \u2264 Maximum Order Qty.",
      "Must be \u2264 Available Count.",
    ],
    errors: [
      { trigger: "Empty", message: "Minimum order quantity is required." },
      { trigger: "Non-integer", message: "Minimum order quantity must be a whole number." },
      { trigger: "Less than 1", message: "Minimum order quantity must be at least 1." },
      { trigger: "Greater than max", message: "Minimum order quantity cannot be greater than maximum order quantity." },
    ],
  },
  // Section 4 — Category, Fulfillment & Location Linking
  {
    id: "V-014",
    field: "Category ID",
    errorCode: "ERR_SKU_014",
    rules: [
      "Mandatory.",
      "Must exactly match a value from the published ONDC eB2B category taxonomy (case-sensitive).",
      "Free-text custom categories are not allowed \u2014 only enum values from the taxonomy sheet.",
    ],
    errors: [
      { trigger: "Empty", message: "Category is required." },
      { trigger: "Invalid", message: "Selected category is not a valid ONDC eB2B category. Please choose from the taxonomy list." },
    ],
  },
  {
    id: "V-015",
    field: "Fulfillment ID",
    errorCode: "ERR_SKU_015",
    rules: [
      "Mandatory.",
      "Must reference an existing fulfillment option defined at the provider level in the same payload.",
      "If the referenced fulfillment ID does not exist for the provider, SKU creation must be rejected.",
    ],
    errors: [
      { trigger: "Empty", message: "Fulfillment option is required." },
      { trigger: "Not found", message: "The selected fulfillment option does not exist for this provider. Please define it first." },
    ],
  },
  {
    id: "V-016",
    field: "Location ID",
    errorCode: "ERR_SKU_016",
    rules: [
      "Mandatory.",
      "Must reference an existing, enabled location (warehouse / store) belonging to the same provider.",
      "Location must not be in \"disable\" or \"close\" state at the time of SKU creation.",
    ],
    errors: [
      { trigger: "Empty", message: "Location is required." },
      { trigger: "Not found", message: "The selected location does not exist for this provider." },
      { trigger: "Disabled / closed", message: "Cannot link SKU to a disabled or closed location." },
    ],
  },
  // Section 5 — ONDC-Specific Commerce Attributes
  {
    id: "V-017",
    field: "Returnable",
    errorCode: "ERR_SKU_017",
    rules: [
      "Mandatory. Boolean \u2014 only true or false accepted.",
      "If set to true, the Return Window field (@ondc/org/return_window) becomes mandatory (dependency rule).",
    ],
    errors: [
      { trigger: "Empty / invalid", message: "Please specify whether this item is returnable (True/False)." },
      { trigger: "Dependency", message: "Return window must be provided when the item is marked as returnable." },
    ],
  },
  {
    id: "V-018",
    field: "Cancellable",
    errorCode: "ERR_SKU_018",
    rules: [
      "Mandatory. Boolean \u2014 only true or false accepted.",
    ],
    errors: [
      { trigger: "Empty / invalid", message: "Please specify whether this item is cancellable (True/False)." },
    ],
  },
  {
    id: "V-019",
    field: "Time to Ship",
    errorCode: "ERR_SKU_019",
    rules: [
      "Mandatory.",
      "Must be a valid ISO-8601 duration (e.g., PT4H, PT30M, P1D).",
      "Minimum allowed: PT15M (15 minutes). Maximum allowed: P7D (7 days).",
      "Duration must be positive.",
    ],
    errors: [
      { trigger: "Empty", message: "Time to ship is required." },
      { trigger: "Invalid format", message: "Invalid duration format. Please use ISO-8601 format (e.g., PT4H for 4 hours)." },
      { trigger: "Out of range", message: "Time to ship must be between 15 minutes and 7 days." },
    ],
  },
  {
    id: "V-020",
    field: "Available on COD",
    errorCode: "ERR_SKU_020",
    rules: [
      "Mandatory. Boolean \u2014 only true or false accepted.",
    ],
    errors: [
      { trigger: "Empty / invalid", message: "Please specify whether Cash on Delivery is available (True/False)." },
    ],
  },
  {
    id: "V-021",
    field: "Consumer Care Contact",
    errorCode: "ERR_SKU_021",
    rules: [
      "Mandatory.",
      "Must follow the exact format: \"name,email,contact_no\" (comma-separated, NO spaces after commas).",
      "Name: 2 to 50 characters, letters and spaces only.",
      "Email: valid RFC-5322 email format.",
      "Contact number: 10 digits (mobile) or 11 digits (with STD) \u2014 numeric only, no +91 or spaces.",
    ],
    errors: [
      { trigger: "Empty", message: "Consumer care contact is required." },
      { trigger: "Format", message: "Consumer care contact must be in format: name,email,contact_no with no spaces after commas." },
      { trigger: "Email", message: "Invalid email format in consumer care contact." },
      { trigger: "Phone", message: "Invalid contact number. Must be 10 or 11 digits, numeric only." },
      { trigger: "Name", message: "Invalid name in consumer care contact. Only letters and spaces allowed." },
    ],
  },
  // Section 6 — Statutory (Conditional)
  {
    id: "V-022",
    field: "Manufacturer / Packer Name",
    errorCode: "ERR_SKU_022",
    rules: [
      "Conditional: becomes mandatory when Category ID falls under a packaged commodity category as per Legal Metrology rules.",
      "2 to 100 characters. Letters, numbers, spaces, and basic punctuation only.",
    ],
    errors: [
      { trigger: "Missing (when required)", message: "Manufacturer/Packer name is required for packaged commodity categories." },
      { trigger: "Length", message: "Manufacturer name must be between 2 and 100 characters." },
    ],
  },
  {
    id: "V-023",
    field: "Manufacturer / Packer Address",
    errorCode: "ERR_SKU_023",
    rules: [
      "Conditional: mandatory when Category ID is a packaged commodity.",
      "10 to 250 characters. Must contain city / PIN code (6 digits) for traceability.",
      "Plain text \u2014 no HTML or special scripting characters.",
    ],
    errors: [
      { trigger: "Missing (when required)", message: "Manufacturer/Packer address is required for packaged commodity categories." },
      { trigger: "Length", message: "Manufacturer address must be between 10 and 250 characters." },
      { trigger: "PIN missing", message: "Manufacturer address must include a valid 6-digit PIN code." },
    ],
  },
  // Section 7 — Tags (Discovery & Attribute Enrichment)
  {
    id: "V-024",
    field: "Country of Origin",
    errorCode: "ERR_SKU_024",
    rules: [
      "Mandatory.",
      "Must be a valid ISO 3166-1 alpha-3 country code (e.g., IND, USA, CHN).",
      "Uppercase 3-letter code only.",
    ],
    errors: [
      { trigger: "Empty", message: "Country of origin is required." },
      { trigger: "Invalid", message: "Invalid country code. Please use a 3-letter ISO country code (e.g., IND for India)." },
    ],
  },
  {
    id: "V-025",
    field: "Brand Attribute",
    errorCode: "ERR_SKU_025",
    rules: [
      "Mandatory.",
      "2 to 50 characters. Letters, numbers, spaces, hyphen, apostrophe allowed.",
      "Should ideally match a recognized brand name in the ONDC brand master where applicable.",
    ],
    errors: [
      { trigger: "Empty", message: "Brand is required." },
      { trigger: "Length", message: "Brand name must be between 2 and 50 characters." },
      { trigger: "Invalid chars", message: "Brand name contains invalid characters." },
    ],
  },
  {
    id: "V-026",
    field: "Additional Images (Statutory)",
    errorCode: "ERR_SKU_026",
    rules: [
      "Optional.",
      "If provided, each list entry must include both \"type\" (e.g., back_image, side_image, nutrition_label) and \"url\".",
      "URL rules same as thumbnail (HTTPS, valid extension, size \u2264 2 MB, reachable).",
      "Maximum 5 statutory images per SKU.",
    ],
    errors: [
      { trigger: "Missing type / url", message: "Each statutory image must include both type and URL." },
      { trigger: "Count", message: "A maximum of 5 statutory images are allowed." },
      { trigger: "Invalid URL", message: "One or more statutory image URLs are invalid or inaccessible." },
    ],
  },
  // Section 8 — Cross-Field / Business Rule Validations
  {
    id: "V-027",
    field: "Min \u2264 Max \u2264 Available",
    errorCode: "ERR_SKU_027",
    rules: [
      "Enforce: Minimum Order Qty \u2264 Maximum Order Qty \u2264 Available Count.",
      "This validation applies across the Quantity block and must run after individual field validations pass.",
    ],
    errors: [
      { trigger: "Cross-field", message: "Invalid quantity configuration: Minimum order quantity must be \u2264 Maximum order quantity \u2264 Available count." },
    ],
  },
  {
    id: "V-028",
    field: "Returnable \u2194 Return Window",
    errorCode: "ERR_SKU_028",
    rules: [
      "If Returnable = true, Return Window must be provided and must be a valid ISO-8601 duration (P1D to P30D).",
      "If Returnable = false, Return Window should NOT be sent; if sent, it should be ignored with a warning.",
    ],
    errors: [
      { trigger: "Missing when returnable", message: "Return window is mandatory when the item is marked returnable." },
      { trigger: "Out of range", message: "Return window must be between 1 and 30 days." },
    ],
  },
  {
    id: "V-029",
    field: "Category-based Statutory Fields",
    errorCode: "ERR_SKU_029",
    rules: [
      "When the selected Category ID falls under the packaged commodity taxonomy, Manufacturer / Packer Name and Address become mandatory.",
      "When the selected Category ID falls under prepackaged food (F&B) taxonomy, nutritional info, additives, and brand-owner FSSAI license number should also be validated (if those fields are later added to the payload).",
      "The mapping of category \u2192 required statutory attributes must be driven by a maintained rules table, not hardcoded.",
    ],
    errors: [
      { trigger: "Statutory missing", message: "The selected category requires statutory fields. Please fill Manufacturer/Packer Name and Address." },
    ],
  },
  {
    id: "V-030",
    field: "Price \u2014 MRP Consistency (if Price fields are added)",
    errorCode: "ERR_SKU_030",
    rules: [
      "Note: Price fields are not in the finalized list shown, but if they are reintroduced: Selling Price \u2264 MRP (maximum_value).",
      "Currency code must be a valid ISO 4217 code (e.g., INR).",
    ],
    errors: [
      { trigger: "Selling > MRP", message: "Selling price cannot be greater than MRP." },
      { trigger: "Currency", message: "Invalid currency code." },
    ],
  },
  {
    id: "V-031",
    field: "Provider / Location Ownership",
    errorCode: "ERR_SKU_031",
    rules: [
      "Fulfillment ID and Location ID referenced in the item must belong to the SAME provider making the SKU create request.",
      "Cross-provider references must be rejected.",
    ],
    errors: [
      { trigger: "Cross-provider", message: "Fulfillment option or location does not belong to this provider." },
    ],
  },
  {
    id: "V-032",
    field: "Duplicate SKU Prevention",
    errorCode: "ERR_SKU_032",
    rules: [
      "Combination of (provider_id + location_id + item_code) must be unique.",
      "Also recommended: block creation if (provider_id + location_id + item_name) already exists.",
    ],
    errors: [
      { trigger: "Duplicate code", message: "A SKU with the same item code already exists at this location." },
      { trigger: "Duplicate name", message: "A SKU with the same name already exists at this location." },
    ],
  },
  {
    id: "V-033",
    field: "Payload Schema Validation",
    errorCode: "ERR_SKU_033",
    rules: [
      "Entire payload must be valid JSON and conform to the ONDC eB2B on_search item schema.",
      "Unknown / extra fields should be rejected or logged as warnings.",
      "All mandatory fields must be present and non-null before field-level validations run.",
    ],
    errors: [
      { trigger: "Schema", message: "Invalid payload structure. Please verify against the ONDC eB2B API contract." },
      { trigger: "Mandatory missing", message: "One or more mandatory fields are missing." },
    ],
  },
];

// Section grouping
const SECTIONS = [
  { title: "Section 1 \u2014 Core Identifiers", ids: ["V-001"] },
  { title: "Section 2 \u2014 Descriptor (Product Identity)", ids: ["V-002", "V-003", "V-004", "V-005", "V-006", "V-007"] },
  { title: "Section 3 \u2014 Quantity (Net Quantity & Inventory)", ids: ["V-008", "V-009", "V-010", "V-011", "V-012", "V-013"] },
  { title: "Section 4 \u2014 Category, Fulfillment & Location Linking", ids: ["V-014", "V-015", "V-016"] },
  { title: "Section 5 \u2014 ONDC-Specific Commerce Attributes", ids: ["V-017", "V-018", "V-019", "V-020", "V-021"] },
  { title: "Section 6 \u2014 Statutory (Packaged Commodities, Conditional)", ids: ["V-022", "V-023"] },
  { title: "Section 7 \u2014 Tags (Discovery & Attribute Enrichment)", ids: ["V-024", "V-025", "V-026"] },
  { title: "Section 8 \u2014 Cross-Field / Business Rule Validations", ids: ["V-027", "V-028", "V-029", "V-030", "V-031", "V-032", "V-033"] },
];

// =====================================================================
// Build document children
// =====================================================================
const cover = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1800, after: 100 },
    children: [new TextRun({ text: "ONDC eB2B", bold: true, size: 56, color: COLOR_PRIMARY })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
    children: [new TextRun({ text: "SKU Creation Validation Rules", bold: true, size: 36, color: COLOR_ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
    children: [new TextRun({ text: "Rule Catalog: V-001 \u2192 V-033", italics: true, size: 28, color: COLOR_MUTED })],
  }),
  metaTable([
    ["Document Type", "ONDC SKU Validation Rule Catalog"],
    ["Module", "SKU Creation \u2014 Bulk Import (US-03) and SKU Detail Save (US-05)"],
    ["Persona", "Backend system (validation engine); user-facing errors surface to Seller Admin."],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Total Rules", "33 (V-001 through V-033)"],
    ["Version", "1.0 \u2014 Final (matches finalized field list dated 23-Apr-2026)"],
    ["Date", "28 April 2026"],
    ["Status", "Ready for Dev \u2014 referenced by US-03 BR-2 and US-05 BR-12"],
    ["Document Owner", "Omkar Charankar"],
  ]),
];

const purposeAndScope = [
  H1("Purpose & Scope"),
  new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [
      new TextRun({ text: "Purpose: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Defines field-level and cross-field validation rules for the SKU (item) creation workflow. Each rule has a unique " +
        "Rule ID, an error code, and a user-facing error message to be surfaced on the UI / API response."
      }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [
      new TextRun({ text: "Scope: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Applies to all SKUs created under the provider's catalog (items[] block) per the finalized field list dated 23-Apr-2026."
      }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [
      new TextRun({ text: "Cross-references to user stories: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "This catalog is the authoritative source for "
      }),
      new TextRun({ text: "US-03 BR-2", bold: true }),
      new TextRun({ text: " (Bulk Import \u2014 Add SKUs creates stubs only; ONDC enrichment is validated against V-001 \u2192 V-033 on the SKU Detail page) and " }),
      new TextRun({ text: "US-05 BR-12", bold: true }),
      new TextRun({ text: " (SKU Detail Save runs the canonical V-001 \u2192 V-033 catalog and toggles the SKU's ONDC Compliance status)." }),
    ],
  }),
];

const conventions = [
  H1("Validation Conventions"),
  subBanner("Rule ID format"),
  P("V-NNN (sequential)."),
  subBanner("Error Code format"),
  P("ERR_SKU_NNN. Returned in API response in the 'error.code' field; the corresponding message goes in 'error.message'."),
  subBanner("Validation order"),
  num("Schema / payload structure."),
  num("Presence of mandatory fields."),
  num("Field-level format & range."),
  num("Cross-field & business rules."),
  num("Uniqueness / duplicate checks."),
  num("Referential integrity (location, fulfillment, provider)."),
  subBanner("Fail-fast vs collect-all"),
  P("For schema / structural errors \u2014 fail fast. For field-level errors \u2014 collect ALL errors and return in a single response so the user can fix them in one go."),
];

// Index table mapping each rule id to its field + section
const indexRows = [];
for (const sec of SECTIONS) {
  for (const id of sec.ids) {
    const r = RULES.find(x => x.id === id);
    indexRows.push([id, r.field, r.errorCode, sec.title.replace(/^Section \d+ \u2014 /, "")]);
  }
}
const ruleIndex = [
  H1("Rule Index"),
  P("Quick lookup of all 33 rules with their error code and section."),
  makeTable(
    ["Rule ID", "Field", "Error Code", "Section"],
    indexRows,
    [2, 6, 3, 5],
  ),
];

// Per-section rule renderings
const rulesBody = [];
rulesBody.push(H1("Validation Rules"));
rulesBody.push(P("Each rule below is rendered with its validation predicates and the user-facing error messages keyed by trigger."));
for (const sec of SECTIONS) {
  rulesBody.push(sectionBanner(sec.title));
  for (const id of sec.ids) {
    const rule = RULES.find(x => x.id === id);
    rulesBody.push(...renderRule(rule));
  }
}

// Error response template (JSON code block)
const errorTemplate = [
  H1("Error Response Template (API)"),
  P("Suggested structure for surfacing validation errors back to the seller app:"),
  mono("{"),
  mono("  \"status\": \"REJECTED\","),
  mono("  \"errors\": ["),
  mono("    {"),
  mono("      \"code\": \"ERR_SKU_003\","),
  mono("      \"field\": \"items[0].descriptor.code\","),
  mono("      \"rule_id\": \"V-003\","),
  mono("      \"message\": \"Invalid item code format. Please use the format type:code (e.g., 1:8901234567890).\""),
  mono("    },"),
  mono("    {"),
  mono("      \"code\": \"ERR_SKU_013\","),
  mono("      \"field\": \"items[0].quantity.minimum.count\","),
  mono("      \"rule_id\": \"V-013\","),
  mono("      \"message\": \"Minimum order quantity cannot be greater than maximum order quantity.\""),
  mono("    }"),
  mono("  ]"),
  mono("}"),
];

const notes = [
  H1("Notes & Assumptions"),
  num("Length limits (min / max chars, file size 2 MB, etc.) are reasonable defaults based on common eB2B practice; they should be reconfirmed with the product team before locking into the schema."),
  num("The mapping of category \u2192 statutory field requirements (V-029) should be maintained in a separate rules table so that new categories can be onboarded without code changes."),
  num("URL reachability checks (for images) should be done asynchronously on catalog ingestion \u2014 not blocking the create call \u2014 to avoid timeouts; failures should be surfaced as warnings rather than hard rejections if agreed with the team."),
  num("Price-related rules (V-030) are included for completeness even though Price fields were not on the finalized list \u2014 if Price is part of your SKU payload, these rules apply."),
  num("This catalog is the canonical reference for US-03 BR-2 and US-05 BR-12. Any rule change here must be reflected in the user-stories document."),
];

// =====================================================================
// ASSEMBLE
// =====================================================================
const doc = new Document({
  creator: "Omkar Charankar",
  title: "ONDC eB2B \u2014 SKU Creation Validation Rules (V-001 \u2192 V-033)",
  description: "Canonical ONDC validation rule catalog for SKU creation. Referenced by Seller Store user stories US-03 and US-05.",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: COLOR_PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: COLOR_PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: { top: PAGE_MARGIN, right: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: "ONDC eB2B \u2014 SKU Validation Rules (V-001 \u2192 V-033)", color: COLOR_MUTED, size: 18 }),
              new TextRun({ text: "\tConfidential \u2014 Internal", color: COLOR_MUTED, size: 18, italics: true }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: "v1.0 \u2014 28 Apr 2026", color: COLOR_MUTED, size: 18 }),
              new TextRun({ text: "\tPage ", color: COLOR_MUTED, size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], color: COLOR_MUTED, size: 18 }),
              new TextRun({ text: " of ", color: COLOR_MUTED, size: 18 }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], color: COLOR_MUTED, size: 18 }),
            ],
          })],
        }),
      },
      children: [
        ...cover,
        ...purposeAndScope,
        ...conventions,
        ...ruleIndex,
        ...rulesBody,
        ...errorTemplate,
        ...notes,
      ],
    },
  ],
});

const outPath = path.join(__dirname, "..", "Seller-Store-ONDC-SKU-Validation-Rules.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote:", outPath);
});
