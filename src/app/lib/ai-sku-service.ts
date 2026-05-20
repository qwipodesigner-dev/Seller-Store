// Mock AI service for the "Create SKU with AI" flow.
//
// The real implementation would chain OCR → barcode → vision search →
// marketplace lookup. Here we simulate that pipeline so the UI/UX can
// be reviewed end-to-end without any backend. The simulation is
// deterministic on filename — same uploads produce the same matches —
// so screenshots/QA are reproducible.

export type ConfidenceLevel = "high" | "medium" | "low";

export type AiSearchSource =
  | "Google Shopping"
  | "Amazon"
  | "Flipkart"
  | "JioMart"
  | "BigBasket"
  | "Blinkit"
  | "Brand Website"
  | "FMCG Database"
  | "Distributor Catalog";

export type MatchTier = "exact" | "high" | "partial";

/** A single field's value + how confident the AI is in it. */
export interface AiField<T = string> {
  value: T;
  confidence: ConfidenceLevel;
  /** Where this value came from — surfaced as a tooltip in the UI. */
  source?: AiSearchSource;
}

/** Nutrition row per 100 g/ml — kept simple, FMCG only. */
export interface NutritionRow {
  label: string;
  value: string;
}

/**
 * The full product payload the AI returns per candidate match. Every
 * field maps 1:1 to the SKU spec the seller would otherwise type by
 * hand. Anything the AI couldn't confidently fetch is left undefined
 * (the preview screen renders those as "needs user input").
 */
export interface AiProductMatch {
  matchId: string;
  tier: MatchTier;
  /** 0–100. Drives the badge colour + ranking. */
  overallConfidence: number;
  /** Brief one-liner the UI shows under the title. */
  matchReason: string;
  /** Sources the AI cross-checked (shown as small chips). */
  sources: AiSearchSource[];
  /** Stand-in for vision-search thumbnails — gradient + label avatar. */
  thumbnailSeed: string;

  // Identity
  brandName: AiField;
  productName: AiField;
  variant?: AiField;
  flavor?: AiField;

  // Taxonomy
  category: AiField;
  subCategory: AiField;
  skuType: AiField;
  packageType: AiField;
  tags: AiField<string[]>;
  searchKeywords: AiField<string[]>;

  // Description
  description: AiField;
  ingredients?: AiField<string[]>;
  nutrition?: AiField<NutritionRow[]>;

  // Pack + measurements
  packSize: AiField;
  uom: AiField;
  netWeight: AiField;
  grossWeight?: AiField;
  dimensions?: AiField; // L x W x H
  casePack?: AiField;
  innerPack?: AiField;
  multipack?: AiField;

  // Compliance & origin
  barcode: AiField;
  hsnCode: AiField;
  gstPercent: AiField;
  manufacturerName: AiField;
  countryOfOrigin: AiField;
  shelfLifeDays?: AiField;
  storageType?: AiField;

  // Pricing
  mrp: AiField;

  // Imagery (suggested product images the AI "found" on the web)
  fetchedImages: { label: string; seed: string }[];
}

/** Result of a single image's pre-processing step. */
export interface ImageProcessingResult {
  fileName: string;
  ocrText: string[];
  barcodeDetected: string | null;
  brandDetected: string | null;
  /** Free-text shown in the live processing log. */
  notes: string[];
}

/** Top-level response from the simulated pipeline. */
export interface AiSearchResponse {
  searchId: string;
  processedAt: string;
  perImage: ImageProcessingResult[];
  /** Sources actually queried for this search. */
  searchedSources: AiSearchSource[];
  /** Ranked, highest-confidence first. */
  matches: AiProductMatch[];
  /** True if no candidate cleared the partial-match threshold. */
  noConfidentMatch: boolean;
}

// ---------------------------------------------------------------------------
// Mock catalog — pretend these are the "found online" candidates the
// AI can resolve uploaded images to. The variety covers FMCG, grocery,
// personal care, and packaged snacks — the SKU types most sellers on
// this platform deal with.
// ---------------------------------------------------------------------------

const MOCK_CATALOG: AiProductMatch[] = [
  {
    matchId: "amul-gold-1l",
    tier: "exact",
    overallConfidence: 96,
    matchReason: "Barcode + brand logo + pack-size text all aligned",
    sources: ["Amazon", "BigBasket", "JioMart", "Brand Website"],
    thumbnailSeed: "amul-gold",
    brandName: { value: "Amul", confidence: "high", source: "Brand Website" },
    productName: { value: "Amul Gold Full Cream Milk", confidence: "high", source: "Brand Website" },
    variant: { value: "Full Cream", confidence: "high" },
    category: { value: "Food & Groceries", confidence: "high" },
    subCategory: { value: "Dairy / Milk", confidence: "high" },
    skuType: { value: "Single", confidence: "high" },
    packageType: { value: "Tetra Pack", confidence: "high" },
    tags: { value: ["Dairy", "Milk", "Full Cream", "Tetra Pack"], confidence: "high" },
    searchKeywords: {
      value: ["amul gold", "full cream milk", "amul milk 1L", "dairy"],
      confidence: "high",
    },
    description: {
      value:
        "Amul Gold Full Cream Milk is homogenised, pasteurised, and packed in a 6-layer Tetra Fino pack. Rich in protein, calcium, and vitamin D. Ready to drink, ideal for tea, coffee, and cooking.",
      confidence: "high",
      source: "Brand Website",
    },
    ingredients: { value: ["Toned Cow Milk", "Permitted Stabilisers"], confidence: "medium" },
    nutrition: {
      value: [
        { label: "Energy (kcal)", value: "67" },
        { label: "Protein (g)", value: "3.2" },
        { label: "Fat (g)", value: "3.5" },
        { label: "Carbohydrates (g)", value: "4.7" },
      ],
      confidence: "high",
    },
    packSize: { value: "1", confidence: "high" },
    uom: { value: "L", confidence: "high" },
    netWeight: { value: "1000 ml", confidence: "high" },
    grossWeight: { value: "1030 g", confidence: "medium" },
    dimensions: { value: "8 x 6 x 22 cm", confidence: "medium" },
    casePack: { value: "12", confidence: "medium", source: "Distributor Catalog" },
    innerPack: { value: "1", confidence: "high" },
    multipack: { value: "No", confidence: "high" },
    barcode: { value: "8901491100014", confidence: "high", source: "Brand Website" },
    hsnCode: { value: "0401", confidence: "high" },
    gstPercent: { value: "0", confidence: "high" },
    manufacturerName: { value: "Gujarat Co-operative Milk Marketing Federation Ltd", confidence: "high" },
    countryOfOrigin: { value: "India", confidence: "high" },
    shelfLifeDays: { value: "90", confidence: "high" },
    storageType: { value: "Ambient (≤ 30°C)", confidence: "high" },
    mrp: { value: "72", confidence: "high", source: "JioMart" },
    fetchedImages: [
      { label: "Front", seed: "amul-front" },
      { label: "Back", seed: "amul-back" },
      { label: "Pack", seed: "amul-pack" },
    ],
  },
  {
    matchId: "lays-classic-52g",
    tier: "exact",
    overallConfidence: 94,
    matchReason: "OCR captured 'Classic Salted' + brand mark + 52g pack callout",
    sources: ["Amazon", "Blinkit", "Flipkart", "BigBasket"],
    thumbnailSeed: "lays-classic",
    brandName: { value: "Lay's", confidence: "high" },
    productName: { value: "Lay's Classic Salted Potato Chips", confidence: "high" },
    variant: { value: "Classic Salted", confidence: "high" },
    flavor: { value: "Salted", confidence: "high" },
    category: { value: "Food & Groceries", confidence: "high" },
    subCategory: { value: "Snacks / Chips", confidence: "high" },
    skuType: { value: "Single", confidence: "high" },
    packageType: { value: "Pouch", confidence: "high" },
    tags: { value: ["Snacks", "Chips", "Salted", "FMCG"], confidence: "high" },
    searchKeywords: { value: ["lays", "potato chips", "salted chips", "lays 52g"], confidence: "high" },
    description: {
      value:
        "The original Lay's Classic Salted — thin-cut potatoes, lightly salted, fried to a crisp. India's most popular chip in a portable 52 g pouch.",
      confidence: "high",
    },
    ingredients: {
      value: ["Potatoes", "Edible Vegetable Oil (Palmolein)", "Iodised Salt"],
      confidence: "high",
    },
    nutrition: {
      value: [
        { label: "Energy (kcal)", value: "545" },
        { label: "Protein (g)", value: "5.6" },
        { label: "Fat (g)", value: "34.5" },
        { label: "Carbohydrates (g)", value: "53.2" },
      ],
      confidence: "high",
    },
    packSize: { value: "52", confidence: "high" },
    uom: { value: "g", confidence: "high" },
    netWeight: { value: "52 g", confidence: "high" },
    dimensions: { value: "12 x 4 x 21 cm", confidence: "medium" },
    casePack: { value: "60", confidence: "medium" },
    innerPack: { value: "1", confidence: "high" },
    multipack: { value: "No", confidence: "high" },
    barcode: { value: "8901491502344", confidence: "high" },
    hsnCode: { value: "1905", confidence: "high" },
    gstPercent: { value: "12", confidence: "high" },
    manufacturerName: { value: "PepsiCo India Holdings Pvt Ltd", confidence: "high" },
    countryOfOrigin: { value: "India", confidence: "high" },
    shelfLifeDays: { value: "120", confidence: "high" },
    storageType: { value: "Ambient — cool & dry", confidence: "high" },
    mrp: { value: "20", confidence: "high" },
    fetchedImages: [
      { label: "Front", seed: "lays-front" },
      { label: "Back", seed: "lays-back" },
    ],
  },
  {
    matchId: "colgate-strong-teeth-200g",
    tier: "high",
    overallConfidence: 88,
    matchReason: "Brand + 'Strong Teeth' OCR; pack size inferred from carton text",
    sources: ["Amazon", "Flipkart", "BigBasket", "Brand Website"],
    thumbnailSeed: "colgate-strong",
    brandName: { value: "Colgate", confidence: "high" },
    productName: { value: "Colgate Strong Teeth Toothpaste", confidence: "high" },
    variant: { value: "Strong Teeth", confidence: "high" },
    category: { value: "Personal Care", confidence: "high" },
    subCategory: { value: "Oral Care / Toothpaste", confidence: "high" },
    skuType: { value: "Single", confidence: "high" },
    packageType: { value: "Tube + Carton", confidence: "medium" },
    tags: { value: ["Oral Care", "Toothpaste", "Calcium"], confidence: "high" },
    searchKeywords: { value: ["colgate", "strong teeth", "toothpaste 200g"], confidence: "high" },
    description: {
      value:
        "Colgate Strong Teeth is enriched with Amino Shakti — fights cavities and makes teeth 2x stronger from the very first brush. Suitable for daily use.",
      confidence: "high",
    },
    packSize: { value: "200", confidence: "high" },
    uom: { value: "g", confidence: "high" },
    netWeight: { value: "200 g", confidence: "high" },
    grossWeight: { value: "230 g", confidence: "medium" },
    dimensions: { value: "5 x 4 x 18 cm", confidence: "medium" },
    casePack: { value: "48", confidence: "medium" },
    innerPack: { value: "1", confidence: "high" },
    multipack: { value: "No", confidence: "high" },
    barcode: { value: "8901314010237", confidence: "high" },
    hsnCode: { value: "3306", confidence: "high" },
    gstPercent: { value: "18", confidence: "high" },
    manufacturerName: { value: "Colgate-Palmolive (India) Ltd", confidence: "high" },
    countryOfOrigin: { value: "India", confidence: "high" },
    shelfLifeDays: { value: "1095", confidence: "medium" },
    storageType: { value: "Ambient", confidence: "high" },
    mrp: { value: "165", confidence: "high" },
    fetchedImages: [
      { label: "Front", seed: "colgate-front" },
      { label: "Carton", seed: "colgate-carton" },
    ],
  },
  {
    matchId: "tata-salt-1kg",
    tier: "high",
    overallConfidence: 82,
    matchReason: "Brand logo strong; pack-size text partially obscured",
    sources: ["JioMart", "Amazon", "BigBasket"],
    thumbnailSeed: "tata-salt",
    brandName: { value: "Tata", confidence: "high" },
    productName: { value: "Tata Salt Iodised", confidence: "high" },
    variant: { value: "Iodised", confidence: "high" },
    category: { value: "Food & Groceries", confidence: "high" },
    subCategory: { value: "Cooking Essentials / Salt", confidence: "high" },
    skuType: { value: "Single", confidence: "high" },
    packageType: { value: "Pouch", confidence: "high" },
    tags: { value: ["Salt", "Iodised", "Cooking"], confidence: "high" },
    searchKeywords: { value: ["tata salt", "iodised salt", "1kg salt"], confidence: "high" },
    description: {
      value:
        "Tata Salt — India's first national branded iodised salt. Vacuum-evaporated for purity and consistent crystal size.",
      confidence: "high",
    },
    packSize: { value: "1", confidence: "medium" },
    uom: { value: "kg", confidence: "medium" },
    netWeight: { value: "1 kg", confidence: "medium" },
    dimensions: { value: "15 x 4 x 22 cm", confidence: "low" },
    casePack: { value: "20", confidence: "medium" },
    barcode: { value: "8901725100016", confidence: "high" },
    hsnCode: { value: "2501", confidence: "high" },
    gstPercent: { value: "0", confidence: "high" },
    manufacturerName: { value: "Tata Consumer Products Ltd", confidence: "high" },
    countryOfOrigin: { value: "India", confidence: "high" },
    shelfLifeDays: { value: "730", confidence: "medium" },
    storageType: { value: "Ambient — dry place", confidence: "high" },
    mrp: { value: "28", confidence: "high" },
    fetchedImages: [{ label: "Front", seed: "tata-salt-front" }],
  },
  {
    matchId: "maggi-2min-70g",
    tier: "high",
    overallConfidence: 79,
    matchReason: "Strong brand match; flavour variant probable but not confirmed",
    sources: ["Amazon", "Blinkit", "BigBasket"],
    thumbnailSeed: "maggi-masala",
    brandName: { value: "Maggi", confidence: "high" },
    productName: { value: "Maggi 2-Minute Masala Noodles", confidence: "medium" },
    variant: { value: "Masala", confidence: "medium" },
    flavor: { value: "Masala", confidence: "medium" },
    category: { value: "Food & Groceries", confidence: "high" },
    subCategory: { value: "Ready to Cook / Noodles", confidence: "high" },
    skuType: { value: "Single", confidence: "high" },
    packageType: { value: "Pouch", confidence: "high" },
    tags: { value: ["Noodles", "Instant", "Masala"], confidence: "high" },
    searchKeywords: { value: ["maggi", "2 minute noodles", "masala noodles"], confidence: "high" },
    description: {
      value:
        "The iconic Maggi 2-Minute Noodles, Masala flavour — wheat noodles with the classic tastemaker seasoning. Ready in two minutes.",
      confidence: "high",
    },
    ingredients: { value: ["Wheat Flour", "Edible Vegetable Oil", "Salt", "Spices"], confidence: "medium" },
    packSize: { value: "70", confidence: "high" },
    uom: { value: "g", confidence: "high" },
    netWeight: { value: "70 g", confidence: "high" },
    casePack: { value: "96", confidence: "medium" },
    barcode: { value: "8901058852387", confidence: "high" },
    hsnCode: { value: "1902", confidence: "high" },
    gstPercent: { value: "12", confidence: "high" },
    manufacturerName: { value: "Nestlé India Ltd", confidence: "high" },
    countryOfOrigin: { value: "India", confidence: "high" },
    shelfLifeDays: { value: "270", confidence: "medium" },
    storageType: { value: "Ambient — cool & dry", confidence: "high" },
    mrp: { value: "14", confidence: "high" },
    fetchedImages: [{ label: "Front", seed: "maggi-front" }, { label: "Back", seed: "maggi-back" }],
  },
  {
    matchId: "dabur-honey-250g",
    tier: "partial",
    overallConfidence: 64,
    matchReason: "Honey jar shape recognised; brand partial — image likely glare-affected",
    sources: ["Amazon", "BigBasket"],
    thumbnailSeed: "dabur-honey",
    brandName: { value: "Dabur", confidence: "medium" },
    productName: { value: "Dabur Honey", confidence: "medium" },
    category: { value: "Food & Groceries", confidence: "medium" },
    subCategory: { value: "Health Foods / Honey", confidence: "medium" },
    skuType: { value: "Single", confidence: "high" },
    packageType: { value: "Glass Jar", confidence: "medium" },
    tags: { value: ["Honey", "Health"], confidence: "medium" },
    searchKeywords: { value: ["dabur honey", "honey 250g"], confidence: "medium" },
    description: {
      value:
        "Dabur Honey — naturally pure, world's no. 1 honey brand. Boost immunity and energy. Best consumed daily.",
      confidence: "medium",
    },
    packSize: { value: "250", confidence: "low" },
    uom: { value: "g", confidence: "medium" },
    netWeight: { value: "250 g", confidence: "low" },
    barcode: { value: "8901207103223", confidence: "medium" },
    hsnCode: { value: "0409", confidence: "medium" },
    gstPercent: { value: "5", confidence: "high" },
    manufacturerName: { value: "Dabur India Ltd", confidence: "high" },
    countryOfOrigin: { value: "India", confidence: "high" },
    mrp: { value: "150", confidence: "medium" },
    fetchedImages: [{ label: "Front", seed: "dabur-front" }],
  },
];

const ALL_SOURCES: AiSearchSource[] = [
  "Google Shopping",
  "Amazon",
  "Flipkart",
  "JioMart",
  "BigBasket",
  "Blinkit",
  "Brand Website",
  "FMCG Database",
  "Distributor Catalog",
];

// Cheap, stable hash so identical filenames produce identical matches.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Drives the per-image processing log shown live in the UI. Each call
 * resolves after a short delay so the user sees a believable "AI is
 * thinking" cadence.
 */
export async function preprocessImage(
  fileName: string,
  onStep: (note: string) => void,
): Promise<ImageProcessingResult> {
  const seed = hashString(fileName);
  const pickedMatch = MOCK_CATALOG[seed % MOCK_CATALOG.length];

  const steps: string[] = [
    "Decoding image…",
    "Running OCR on label text…",
    "Scanning for barcodes (EAN-13 / UPC-A)…",
    "Detecting brand logo + colour palette…",
  ];
  for (const step of steps) {
    onStep(step);
    await sleep(180 + (seed % 120));
  }

  const ocrText = [
    pickedMatch.brandName.value.toUpperCase(),
    pickedMatch.productName.value,
    pickedMatch.netWeight.value,
  ];
  const barcodeDetected =
    pickedMatch.barcode.confidence === "high" ? pickedMatch.barcode.value : null;

  return {
    fileName,
    ocrText,
    barcodeDetected,
    brandDetected: pickedMatch.brandName.value,
    notes: [
      barcodeDetected
        ? `Barcode ${barcodeDetected} parsed (EAN-13).`
        : "No barcode detected — relying on visual + OCR match.",
      `Brand candidate: ${pickedMatch.brandName.value}.`,
      `Pack size text read: ${pickedMatch.netWeight.value}.`,
    ],
  };
}

/**
 * Simulates the marketplace search + match-ranking step. Picks a primary
 * candidate from the catalog (deterministic per filename set) plus up
 * to two close runners-up for the "multiple matches" UI.
 */
export async function searchMatches(
  perImage: ImageProcessingResult[],
  onSourceQueried: (source: AiSearchSource) => void,
): Promise<AiSearchResponse> {
  const seed = hashString(perImage.map((p) => p.fileName).join("|"));
  const primary = MOCK_CATALOG[seed % MOCK_CATALOG.length];

  // Pretend to query each marketplace one at a time.
  const queried: AiSearchSource[] = [];
  for (const src of ALL_SOURCES) {
    if (!primary.sources.includes(src) && queried.length >= 4) continue;
    onSourceQueried(src);
    queried.push(src);
    await sleep(140);
  }

  // Build runner-ups by perturbing the primary's confidence + reason.
  const partner1Idx = (seed + 1) % MOCK_CATALOG.length;
  const partner2Idx = (seed + 3) % MOCK_CATALOG.length;
  const runners: AiProductMatch[] = [];
  if (partner1Idx !== seed % MOCK_CATALOG.length) {
    runners.push(downgradeMatch(MOCK_CATALOG[partner1Idx], "high", 14));
  }
  if (
    partner2Idx !== seed % MOCK_CATALOG.length &&
    partner2Idx !== partner1Idx
  ) {
    runners.push(downgradeMatch(MOCK_CATALOG[partner2Idx], "partial", 28));
  }

  const matches = [primary, ...runners].sort(
    (a, b) => b.overallConfidence - a.overallConfidence,
  );

  // If the seeded primary itself is "partial", emit the no-confident-
  // match flag — this drives the manual-fallback messaging.
  const noConfidentMatch =
    matches.length === 0 || matches[0].overallConfidence < 65;

  return {
    searchId: `ai-${Date.now()}-${seed}`,
    processedAt: new Date().toISOString(),
    perImage,
    searchedSources: queried,
    matches,
    noConfidentMatch,
  };
}

function downgradeMatch(
  match: AiProductMatch,
  tier: MatchTier,
  scoreDrop: number,
): AiProductMatch {
  return {
    ...match,
    matchId: `${match.matchId}-runner`,
    tier,
    overallConfidence: Math.max(40, match.overallConfidence - scoreDrop),
    matchReason:
      tier === "partial"
        ? "Visual similarity only — pack size and barcode differ"
        : "Same brand family, close variant",
  };
}

/** Heuristic — list of fields the UI treats as mandatory for SKU creation. */
export const MANDATORY_FIELDS: (keyof AiProductMatch)[] = [
  "brandName",
  "productName",
  "category",
  "subCategory",
  "packSize",
  "uom",
  "mrp",
  "hsnCode",
  "gstPercent",
  "barcode",
];

/** Pretty labels for every field surfaced in the preview screen. */
export const FIELD_LABELS: Partial<Record<keyof AiProductMatch, string>> = {
  brandName: "Brand Name",
  productName: "Product Name",
  variant: "Variant",
  flavor: "Flavor",
  category: "Category",
  subCategory: "Sub-category",
  description: "Description",
  packSize: "Pack Size",
  uom: "UOM",
  netWeight: "Net Weight",
  grossWeight: "Gross Weight",
  dimensions: "Dimensions (L x W x H)",
  barcode: "Barcode (EAN / UPC)",
  hsnCode: "HSN Code",
  gstPercent: "GST %",
  manufacturerName: "Manufacturer Name",
  countryOfOrigin: "Country of Origin",
  shelfLifeDays: "Shelf Life (days)",
  storageType: "Storage Type",
  mrp: "MRP (₹)",
  casePack: "Case Pack",
  innerPack: "Inner Pack",
  searchKeywords: "Search Keywords",
  tags: "Product Tags",
  skuType: "SKU Type",
  packageType: "Package Type",
  multipack: "Multipack Information",
};

/**
 * Lookup so `<AiThumbnail seed="amul-front">` can render the same
 * gradient + initials everywhere. Keeps "fetched images" looking like
 * recognisable product placeholders without depending on an external
 * image host.
 */
export function thumbnailColorFor(seed: string): { from: string; to: string; initials: string } {
  const palette = [
    { from: "from-amber-300", to: "to-amber-500" },
    { from: "from-rose-300", to: "to-rose-500" },
    { from: "from-emerald-300", to: "to-emerald-500" },
    { from: "from-sky-300", to: "to-sky-500" },
    { from: "from-violet-300", to: "to-violet-500" },
    { from: "from-orange-300", to: "to-orange-500" },
    { from: "from-lime-300", to: "to-lime-500" },
  ];
  const idx = hashString(seed) % palette.length;
  const initials = seed
    .split("-")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  return { ...palette[idx], initials };
}
