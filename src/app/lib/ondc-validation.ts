/**
 * ONDC eB2B SKU validation rules.
 *
 * Implements the rule set from "ONDC_SKU_Validation_Rules" (23-Apr-2026).
 * Each rule returns { code, ruleId, field, message } on failure.
 *
 * Order of evaluation (per spec):
 *   (1) Presence of mandatory fields
 *   (2) Field-level format / range
 *   (3) Cross-field / business rules
 *   (4) Duplicate checks (caller passes existing SKUs)
 *
 * Field-level errors are collected (not fail-fast) so the UI can show them all at once.
 */

export interface SKUInput {
  // Core Identifiers
  itemStatus?: string; // "enable" | "disable"

  // Descriptor
  itemName?: string;
  itemCode?: string; // "type:code"
  thumbnail?: string;
  shortDesc?: string;
  longDesc?: string;
  additionalImages?: string[];

  // Quantity
  unitizedCount?: string;
  measureUnit?: string;
  measureValue?: string;
  availableCount?: string;
  maximumOrderQty?: string;
  minimumOrderQty?: string;

  // Category / Fulfillment / Location
  categoryId?: string;
  fulfillmentId?: string;
  locationId?: string;

  // ONDC Commerce Attributes
  returnable?: boolean;
  cancellable?: boolean;
  timeToShip?: string;
  availableOnCod?: boolean;
  consumerCareContact?: string; // "name,email,contact_no"
  returnWindow?: string; // ISO-8601 P1D..P30D — required if returnable=true

  // Statutory
  manufacturerName?: string;
  manufacturerAddress?: string;
  isPackagedCommodity?: boolean; // driven by category

  // Tags
  countryOfOrigin?: string;
  brandAttribute?: string;
  statutoryImages?: Array<{ type?: string; url?: string }>;
}

export interface ValidationError {
  code: string; // ERR_SKU_NNN
  ruleId: string; // V-NNN
  field: string; // JSON path-ish identifier
  message: string;
}

export interface ValidateOptions {
  /** Existing item codes at the same provider+location — used for duplicate check V-032. */
  existingItemCodes?: Set<string>;
  /** Existing item names at the same provider+location — used for duplicate check V-002/V-032. */
  existingItemNames?: Set<string>;
  /** Valid ONDC eB2B category list — used for V-014. */
  validCategories?: Set<string>;
  /** Valid fulfillment IDs defined at provider — used for V-015. */
  validFulfillmentIds?: Set<string>;
  /** Valid location IDs (enabled) at provider — used for V-016. */
  validLocationIds?: Set<string>;
}

// ---------- Helpers ----------

const MEASURE_UNITS = new Set([
  "unit",
  "dozen",
  "gram",
  "kilogram",
  "tonne",
  "litre",
  "millilitre",
]);

const NAME_RE = /^[A-Za-z0-9 ,.\-()&]+$/; // letters/digits + basic punctuation
const HUMAN_NAME_RE = /^[A-Za-z ]+$/;
const BRAND_RE = /^[A-Za-z0-9 '\-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_RE = /\b\d{6}\b/;
const ISO3_RE = /^[A-Z]{3}$/;
const URL_EXT_RE = /\.(png|jpg|jpeg|webp)(\?|$)/i;
// ISO-8601 duration for time-to-ship: PT15M .. P7D
const ISO_DUR_RE = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

function isBlank(v: any): boolean {
  return v === undefined || v === null || String(v).trim() === "";
}

function isPositiveInt(v: string, opts?: { min?: number; max?: number }): boolean {
  if (!/^\d+$/.test(String(v).trim())) return false;
  const n = parseInt(String(v), 10);
  if (opts?.min !== undefined && n < opts.min) return false;
  if (opts?.max !== undefined && n > opts.max) return false;
  return true;
}

function isPositiveDecimal(v: string, maxDecimals = 3): boolean {
  const re = new RegExp(`^\\d+(?:\\.\\d{1,${maxDecimals}})?$`);
  if (!re.test(String(v).trim())) return false;
  return parseFloat(String(v)) > 0;
}

function isHttpsImageUrl(u: string): { ok: true } | { ok: false; reason: string } {
  if (isBlank(u)) return { ok: false, reason: "empty" };
  let url: URL;
  try {
    url = new URL(u);
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (url.protocol !== "https:") return { ok: false, reason: "not-https" };
  if (!URL_EXT_RE.test(url.pathname)) return { ok: false, reason: "extension" };
  return { ok: true };
}

function parseIsoDurationToSeconds(v: string): number | null {
  const m = ISO_DUR_RE.exec(v);
  if (!m) return null;
  const [, d, h, mm, s] = m;
  if (!d && !h && !mm && !s) return null;
  const sec =
    (parseInt(d || "0", 10) * 86400) +
    (parseInt(h || "0", 10) * 3600) +
    (parseInt(mm || "0", 10) * 60) +
    parseInt(s || "0", 10);
  return sec > 0 ? sec : null;
}

function ean13Checksum(digits: string): boolean {
  if (!/^\d{13}$/.test(digits)) return false;
  const d = digits.split("").map(Number);
  const sum = d.slice(0, 12).reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return check === d[12];
}

function gtinChecksum(digits: string): boolean {
  // GTIN-8/12/13/14 — use mod-10 right-to-left (3 weighting on odd positions from the right, excluding check digit)
  const m = digits.length;
  if (![8, 12, 13, 14].includes(m)) return false;
  const arr = digits.split("").map(Number);
  const check = arr.pop()!;
  const sum = arr.reverse().reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

function parseItemCode(code: string): { type: string; value: string } | null {
  // Accept any single-character type prefix here so we can emit a specific
  // "Invalid code type" error downstream (per docx V-003) rather than a
  // generic "invalid format".
  const m = /^([^:]+):(.+)$/.exec(code);
  if (!m) return null;
  return { type: m[1], value: m[2] };
}

// ---------- Main validator ----------

export function validateSKU(input: SKUInput, opts: ValidateOptions = {}): ValidationError[] {
  const errors: ValidationError[] = [];
  const push = (
    ruleId: string,
    code: string,
    field: string,
    message: string,
  ) => errors.push({ ruleId, code, field, message });

  // ---------- V-001 Item Status ----------
  if (isBlank(input.itemStatus)) {
    push("V-001", "ERR_SKU_001", "items[].time.label",
      "Item status is required. Please select either Enable or Disable.");
  } else if (!["enable", "disable"].includes(input.itemStatus!)) {
    push("V-001", "ERR_SKU_001", "items[].time.label",
      "Invalid item status. Allowed values are Enable or Disable only.");
  }

  // ---------- V-002 Item Name ----------
  if (isBlank(input.itemName)) {
    push("V-002", "ERR_SKU_002", "items[].descriptor.name", "Item name is required.");
  } else {
    const n = input.itemName!.trim();
    if (n.length < 3 || n.length > 100) {
      push("V-002", "ERR_SKU_002", "items[].descriptor.name",
        "Item name must be between 3 and 100 characters.");
    }
    if (!NAME_RE.test(n)) {
      push("V-002", "ERR_SKU_002", "items[].descriptor.name",
        "Item name contains invalid characters. Only letters, numbers and basic punctuation are allowed.");
    }
    if (opts.existingItemNames?.has(n.toLowerCase())) {
      push("V-002", "ERR_SKU_002", "items[].descriptor.name",
        "An item with the same name already exists at this location.");
    }
  }

  // ---------- V-003 Item Code ----------
  if (isBlank(input.itemCode)) {
    push("V-003", "ERR_SKU_003", "items[].descriptor.code", "Item code is required.");
  } else {
    const parsed = parseItemCode(input.itemCode!.trim());
    if (!parsed) {
      push("V-003", "ERR_SKU_003", "items[].descriptor.code",
        "Invalid item code format. Please use the format type:code (e.g., 1:8901234567890).");
    } else {
      const { type, value } = parsed;
      // Per docx: surface "Invalid code type" distinctly from length errors.
      if (!["1", "2", "3", "4", "5"].includes(type)) {
        push("V-003", "ERR_SKU_003", "items[].descriptor.code",
          "Invalid code type. Allowed values: 1 (EAN), 2 (ISBN), 3 (GTIN), 4 (HSN), 5 (Others).");
      } else if (type === "1") {
        const lengthOk = /^\d{13}$/.test(value);
        if (!lengthOk) push("V-003", "ERR_SKU_003", "items[].descriptor.code",
          "Invalid EAN length. EAN must be exactly 13 digits.");
        else if (!ean13Checksum(value)) {
          push("V-003", "ERR_SKU_003", "items[].descriptor.code",
            "Invalid EAN/GTIN checksum digit. Please verify the code.");
        }
      } else if (type === "2") {
        const lengthOk = /^\d{10}$/.test(value) || /^\d{13}$/.test(value);
        if (!lengthOk) push("V-003", "ERR_SKU_003", "items[].descriptor.code",
          "Invalid ISBN length. ISBN must be 10 or 13 digits.");
      } else if (type === "3") {
        const lengthOk = /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(value);
        if (!lengthOk) push("V-003", "ERR_SKU_003", "items[].descriptor.code",
          "Invalid GTIN length. GTIN must be 8, 12, 13 or 14 digits.");
        else if (!gtinChecksum(value)) {
          push("V-003", "ERR_SKU_003", "items[].descriptor.code",
            "Invalid EAN/GTIN checksum digit. Please verify the code.");
        }
      } else if (type === "4") {
        if (!/^\d{4,8}$/.test(value)) {
          push("V-003", "ERR_SKU_003", "items[].descriptor.code",
            "Invalid HSN length. HSN must be 4 to 8 digits.");
        }
      } else if (type === "5") {
        if (!/^[A-Za-z0-9]{1,20}$/.test(value)) {
          push("V-003", "ERR_SKU_003", "items[].descriptor.code",
            "Invalid 'Others' code. Must be alphanumeric up to 20 characters.");
        }
      }

      if (opts.existingItemCodes?.has(input.itemCode!.trim())) {
        push("V-003", "ERR_SKU_003", "items[].descriptor.code",
          "This item code is already used by another SKU in your catalog.");
      }
    }
  }

  // ---------- V-004 Symbol / Thumbnail ----------
  if (isBlank(input.thumbnail)) {
    push("V-004", "ERR_SKU_004", "items[].descriptor.symbol",
      "Thumbnail image URL is required.");
  } else {
    const r = isHttpsImageUrl(input.thumbnail!);
    if (!r.ok) {
      if (r.reason === "not-https")
        push("V-004", "ERR_SKU_004", "items[].descriptor.symbol", "Image URL must use HTTPS.");
      else if (r.reason === "extension")
        push("V-004", "ERR_SKU_004", "items[].descriptor.symbol",
          "Unsupported image format. Allowed formats: PNG, JPG, JPEG, WEBP.");
      else
        push("V-004", "ERR_SKU_004", "items[].descriptor.symbol",
          "The image URL is not accessible. Please check and try again.");
    }
  }

  // ---------- V-005 Short Description ----------
  if (isBlank(input.shortDesc)) {
    push("V-005", "ERR_SKU_005", "items[].descriptor.short_desc", "Short description is required.");
  } else {
    const s = input.shortDesc!;
    if (s.length < 10 || s.length > 150) {
      push("V-005", "ERR_SKU_005", "items[].descriptor.short_desc",
        "Short description must be between 10 and 150 characters.");
    }
    if (/<[a-z][\s\S]*>/i.test(s) || /\n|\r/.test(s)) {
      push("V-005", "ERR_SKU_005", "items[].descriptor.short_desc",
        "HTML tags are not allowed in short description.");
    }
  }

  // ---------- V-006 Long Description ----------
  if (isBlank(input.longDesc)) {
    push("V-006", "ERR_SKU_006", "items[].descriptor.long_desc", "Long description is required.");
  } else {
    const s = input.longDesc!;
    if (s.length < 20 || s.length > 1000) {
      push("V-006", "ERR_SKU_006", "items[].descriptor.long_desc",
        "Long description must be between 20 and 1000 characters.");
    }
    if (/<[a-z][\s\S]*>|<script/i.test(s)) {
      push("V-006", "ERR_SKU_006", "items[].descriptor.long_desc",
        "HTML tags or scripts are not permitted in the description.");
    }
  }

  // ---------- V-007 Additional Images ----------
  if (input.additionalImages && input.additionalImages.length > 0) {
    if (input.additionalImages.length > 8) {
      push("V-007", "ERR_SKU_007", "items[].descriptor.images",
        "A maximum of 8 additional images can be uploaded.");
    }
    for (const u of input.additionalImages) {
      const r = isHttpsImageUrl(u);
      if (!r.ok) {
        push("V-007", "ERR_SKU_007", "items[].descriptor.images",
          r.reason === "extension"
            ? "One or more images have an unsupported format."
            : "One or more image URLs are invalid or inaccessible.");
        break;
      }
    }
  }

  // ---------- V-008 Unitized Count ----------
  if (!isBlank(input.unitizedCount)) {
    const s = String(input.unitizedCount).trim();
    if (!/^\d+$/.test(s)) {
      push("V-008", "ERR_SKU_008", "items[].quantity.unitized.count",
        "Pack size must be a whole number.");
    } else {
      const n = parseInt(s, 10);
      if (n <= 0) push("V-008", "ERR_SKU_008", "items[].quantity.unitized.count",
        "Pack size must be greater than 0.");
      else if (n > 10000) push("V-008", "ERR_SKU_008", "items[].quantity.unitized.count",
        "Pack size cannot exceed 10,000.");
    }
  }

  // ---------- V-009 Measure Unit ----------
  if (isBlank(input.measureUnit)) {
    push("V-009", "ERR_SKU_009", "items[].quantity.unitized.measure.unit",
      "Measure unit is required.");
  } else if (!MEASURE_UNITS.has(input.measureUnit!)) {
    push("V-009", "ERR_SKU_009", "items[].quantity.unitized.measure.unit",
      "Invalid measure unit. Allowed: unit, dozen, gram, kilogram, tonne, litre, millilitre.");
  }

  // ---------- V-010 Measure Value ----------
  if (isBlank(input.measureValue)) {
    push("V-010", "ERR_SKU_010", "items[].quantity.unitized.measure.value",
      "Net quantity value is required.");
  } else {
    const s = String(input.measureValue).trim();
    if (!/^-?\d+(\.\d+)?$/.test(s)) {
      push("V-010", "ERR_SKU_010", "items[].quantity.unitized.measure.value",
        "Net quantity must be a valid number.");
    } else if (parseFloat(s) <= 0) {
      push("V-010", "ERR_SKU_010", "items[].quantity.unitized.measure.value",
        "Net quantity must be greater than 0.");
    } else if (!isPositiveDecimal(s, 3)) {
      push("V-010", "ERR_SKU_010", "items[].quantity.unitized.measure.value",
        "Net quantity supports up to 3 decimal places only.");
    }
  }

  // ---------- V-011 Available Count ----------
  let availableCountNum: number | null = null;
  if (isBlank(input.availableCount)) {
    push("V-011", "ERR_SKU_011", "items[].quantity.available.count",
      "Available count is required.");
  } else {
    const s = String(input.availableCount).trim();
    if (!/^-?\d+$/.test(s)) {
      push("V-011", "ERR_SKU_011", "items[].quantity.available.count",
        "Available count must be a whole number.");
    } else {
      const n = parseInt(s, 10);
      if (n < 0) push("V-011", "ERR_SKU_011", "items[].quantity.available.count",
        "Available count cannot be negative.");
      else if (n > 99) push("V-011", "ERR_SKU_011", "items[].quantity.available.count",
        "Available count must be between 0 and 99.");
      else availableCountNum = n;
    }
  }

  // ---------- V-012 Maximum Order Qty ----------
  let maxQtyNum: number | null = null;
  if (isBlank(input.maximumOrderQty)) {
    push("V-012", "ERR_SKU_012", "items[].quantity.maximum.count",
      "Maximum order quantity is required.");
  } else {
    const s = String(input.maximumOrderQty).trim();
    if (!isPositiveInt(s)) {
      push("V-012", "ERR_SKU_012", "items[].quantity.maximum.count",
        "Maximum order quantity must be a positive whole number.");
    } else {
      maxQtyNum = parseInt(s, 10);
    }
  }

  // ---------- V-013 Minimum Order Qty ----------
  let minQtyNum: number | null = null;
  if (isBlank(input.minimumOrderQty)) {
    push("V-013", "ERR_SKU_013", "items[].quantity.minimum.count",
      "Minimum order quantity is required.");
  } else {
    const s = String(input.minimumOrderQty).trim();
    if (!/^\d+$/.test(s)) {
      push("V-013", "ERR_SKU_013", "items[].quantity.minimum.count",
        "Minimum order quantity must be a whole number.");
    } else {
      const n = parseInt(s, 10);
      if (n < 1) push("V-013", "ERR_SKU_013", "items[].quantity.minimum.count",
        "Minimum order quantity must be at least 1.");
      else minQtyNum = n;
    }
  }

  // ---------- V-014 Category ID ----------
  if (isBlank(input.categoryId)) {
    push("V-014", "ERR_SKU_014", "items[].category_id", "Category is required.");
  } else if (opts.validCategories && !opts.validCategories.has(input.categoryId!)) {
    push("V-014", "ERR_SKU_014", "items[].category_id",
      "Selected category is not a valid ONDC eB2B category. Please choose from the taxonomy list.");
  }

  // ---------- V-015 Fulfillment ID ----------
  if (isBlank(input.fulfillmentId)) {
    push("V-015", "ERR_SKU_015", "items[].fulfillment_id", "Fulfillment option is required.");
  } else if (opts.validFulfillmentIds && !opts.validFulfillmentIds.has(input.fulfillmentId!)) {
    push("V-015", "ERR_SKU_015", "items[].fulfillment_id",
      "The selected fulfillment option does not exist for this provider. Please define it first.");
  }

  // ---------- V-016 Location ID ----------
  if (isBlank(input.locationId)) {
    push("V-016", "ERR_SKU_016", "items[].location_id", "Location is required.");
  } else if (opts.validLocationIds && !opts.validLocationIds.has(input.locationId!)) {
    push("V-016", "ERR_SKU_016", "items[].location_id",
      "The selected location does not exist for this provider.");
  }

  // ---------- V-017 Returnable ----------
  if (typeof input.returnable !== "boolean") {
    push("V-017", "ERR_SKU_017", "items[].@ondc/org/returnable",
      "Please specify whether this item is returnable (True/False).");
  }

  // ---------- V-018 Cancellable ----------
  if (typeof input.cancellable !== "boolean") {
    push("V-018", "ERR_SKU_018", "items[].@ondc/org/cancellable",
      "Please specify whether this item is cancellable (True/False).");
  }

  // ---------- V-019 Time to Ship ----------
  if (isBlank(input.timeToShip)) {
    push("V-019", "ERR_SKU_019", "items[].@ondc/org/time_to_ship", "Time to ship is required.");
  } else {
    const secs = parseIsoDurationToSeconds(input.timeToShip!.trim());
    if (secs === null) {
      push("V-019", "ERR_SKU_019", "items[].@ondc/org/time_to_ship",
        "Invalid duration format. Please use ISO-8601 format (e.g., PT4H for 4 hours).");
    } else if (secs < 15 * 60 || secs > 7 * 86400) {
      push("V-019", "ERR_SKU_019", "items[].@ondc/org/time_to_ship",
        "Time to ship must be between 15 minutes and 7 days.");
    }
  }

  // ---------- V-020 Available on COD ----------
  if (typeof input.availableOnCod !== "boolean") {
    push("V-020", "ERR_SKU_020", "items[].@ondc/org/available_on_cod",
      "Please specify whether Cash on Delivery is available (True/False).");
  }

  // ---------- V-021 Consumer Care Contact ----------
  if (isBlank(input.consumerCareContact)) {
    push("V-021", "ERR_SKU_021", "items[].@ondc/org/contact_details_consumer_care",
      "Consumer care contact is required.");
  } else {
    const s = input.consumerCareContact!;
    if (/ ,|, /.test(s)) {
      push("V-021", "ERR_SKU_021", "items[].@ondc/org/contact_details_consumer_care",
        "Consumer care contact must be in format: name,email,contact_no with no spaces after commas.");
    }
    const parts = s.split(",");
    if (parts.length !== 3) {
      push("V-021", "ERR_SKU_021", "items[].@ondc/org/contact_details_consumer_care",
        "Consumer care contact must be in format: name,email,contact_no with no spaces after commas.");
    } else {
      const [name, email, phone] = parts;
      if (!HUMAN_NAME_RE.test(name) || name.length < 2 || name.length > 50) {
        push("V-021", "ERR_SKU_021", "items[].@ondc/org/contact_details_consumer_care",
          "Invalid name in consumer care contact. Only letters and spaces allowed.");
      }
      if (!EMAIL_RE.test(email)) {
        push("V-021", "ERR_SKU_021", "items[].@ondc/org/contact_details_consumer_care",
          "Invalid email format in consumer care contact.");
      }
      if (!/^\d{10,11}$/.test(phone)) {
        push("V-021", "ERR_SKU_021", "items[].@ondc/org/contact_details_consumer_care",
          "Invalid contact number. Must be 10 or 11 digits, numeric only.");
      }
    }
  }

  // ---------- V-022 / V-023 / V-029 Statutory (Conditional on packaged commodity) ----------
  if (input.isPackagedCommodity) {
    if (isBlank(input.manufacturerName)) {
      push("V-022", "ERR_SKU_022", "items[].@ondc/org/statutory_reqs_packaged_commodities.manufacturer_or_packer_name",
        "Manufacturer/Packer name is required for packaged commodity categories.");
    } else {
      const n = input.manufacturerName!;
      if (n.length < 2 || n.length > 100) {
        push("V-022", "ERR_SKU_022", "items[].@ondc/org/statutory_reqs_packaged_commodities.manufacturer_or_packer_name",
          "Manufacturer name must be between 2 and 100 characters.");
      }
    }
    if (isBlank(input.manufacturerAddress)) {
      push("V-023", "ERR_SKU_023", "items[].@ondc/org/statutory_reqs_packaged_commodities.manufacturer_or_packer_address",
        "Manufacturer/Packer address is required for packaged commodity categories.");
    } else {
      const a = input.manufacturerAddress!;
      if (a.length < 10 || a.length > 250) {
        push("V-023", "ERR_SKU_023", "items[].@ondc/org/statutory_reqs_packaged_commodities.manufacturer_or_packer_address",
          "Manufacturer address must be between 10 and 250 characters.");
      }
      if (!PIN_RE.test(a)) {
        push("V-023", "ERR_SKU_023", "items[].@ondc/org/statutory_reqs_packaged_commodities.manufacturer_or_packer_address",
          "Manufacturer address must include a valid 6-digit PIN code.");
      }
      if (/<[a-z][\s\S]*>|<script/i.test(a)) {
        push("V-023", "ERR_SKU_023", "items[].@ondc/org/statutory_reqs_packaged_commodities.manufacturer_or_packer_address",
          "Manufacturer address cannot contain HTML or scripting characters.");
      }
    }
  }

  // ---------- V-024 Country of Origin ----------
  // Accept either a 3-letter ISO code (e.g., "IND") or a plain country name
  // in letters (e.g., "India"). Reject values that contain digits or other
  // non-letter characters — the field is a text field, not numeric.
  if (isBlank(input.countryOfOrigin)) {
    push("V-024", "ERR_SKU_024", "items[].tags[code=origin].country",
      "Country of origin is required.");
  } else {
    const v = input.countryOfOrigin!;
    const isIsoAlpha3 = ISO3_RE.test(v);
    const isCountryName = /^[A-Za-z][A-Za-z ]{1,}$/.test(v);
    if (!isIsoAlpha3 && !isCountryName) {
      push("V-024", "ERR_SKU_024", "items[].tags[code=origin].country",
        "Country of origin must be a text value (e.g., India) or a 3-letter ISO code (e.g., IND). Numbers and special characters are not allowed.");
    }
  }

  // ---------- V-025 Brand Attribute ----------
  if (isBlank(input.brandAttribute)) {
    push("V-025", "ERR_SKU_025", "items[].tags[code=attribute].brand", "Brand is required.");
  } else {
    const b = input.brandAttribute!;
    if (b.length < 2 || b.length > 50) {
      push("V-025", "ERR_SKU_025", "items[].tags[code=attribute].brand",
        "Brand name must be between 2 and 50 characters.");
    }
    if (!BRAND_RE.test(b)) {
      push("V-025", "ERR_SKU_025", "items[].tags[code=attribute].brand",
        "Brand name contains invalid characters.");
    }
  }

  // ---------- V-026 Statutory Images ----------
  if (input.statutoryImages && input.statutoryImages.length > 0) {
    if (input.statutoryImages.length > 5) {
      push("V-026", "ERR_SKU_026", "items[].tags[code=image]",
        "A maximum of 5 statutory images are allowed.");
    }
    for (const img of input.statutoryImages) {
      if (!img.type || !img.url) {
        push("V-026", "ERR_SKU_026", "items[].tags[code=image]",
          "Each statutory image must include both type and URL.");
        break;
      }
      const r = isHttpsImageUrl(img.url);
      if (!r.ok) {
        push("V-026", "ERR_SKU_026", "items[].tags[code=image]",
          "One or more statutory image URLs are invalid or inaccessible.");
        break;
      }
    }
  }

  // ---------- V-027 Cross-field: min <= max <= available ----------
  if (minQtyNum !== null && maxQtyNum !== null && minQtyNum > maxQtyNum) {
    push("V-013", "ERR_SKU_013", "items[].quantity.minimum.count",
      "Minimum order quantity cannot be greater than maximum order quantity.");
  }
  if (
    availableCountNum !== null &&
    maxQtyNum !== null &&
    minQtyNum !== null &&
    !(minQtyNum <= maxQtyNum && maxQtyNum <= availableCountNum)
  ) {
    push("V-027", "ERR_SKU_027", "items[].quantity",
      "Invalid quantity configuration: Minimum order quantity must be ≤ Maximum order quantity ≤ Available count.");
  } else if (maxQtyNum !== null && availableCountNum !== null && maxQtyNum > availableCountNum) {
    push("V-012", "ERR_SKU_012", "items[].quantity.maximum.count",
      "Maximum order quantity cannot exceed available stock.");
  }

  // ---------- V-028 Returnable ↔ Return Window ----------
  if (input.returnable === true) {
    if (isBlank(input.returnWindow)) {
      push("V-028", "ERR_SKU_028", "items[].@ondc/org/return_window",
        "Return window is mandatory when the item is marked returnable.");
    } else {
      const secs = parseIsoDurationToSeconds(input.returnWindow!);
      if (secs === null) {
        push("V-028", "ERR_SKU_028", "items[].@ondc/org/return_window",
          "Return window must be a valid ISO-8601 duration.");
      } else if (secs < 86400 || secs > 30 * 86400) {
        push("V-028", "ERR_SKU_028", "items[].@ondc/org/return_window",
          "Return window must be between 1 and 30 days.");
      }
    }
  }

  return errors;
}
