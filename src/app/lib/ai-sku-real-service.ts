// Real-time Claude Vision implementation of the AI SKU pipeline.
//
// Uses Anthropic's API directly from the browser. Set
// `VITE_ANTHROPIC_API_KEY` in a `.env` (or `.env.local`) file at the
// project root to enable it; the page falls back to the mock service
// when the key is unset.
//
// IMPORTANT: anything starting with `VITE_` is inlined into the
// client bundle. Anyone who downloads the JS can read the key. This
// is fine for local demos / internal seller-store dev builds but
// must not be deployed to production seller-facing builds — proxy
// the call through a small backend that holds the key server-side.

import Anthropic from "@anthropic-ai/sdk";
import {
  type AiProductMatch,
  type AiSearchResponse,
  type AiSearchSource,
  type ConfidenceLevel,
  type ImageProcessingResult,
} from "./ai-sku-service";

const MODEL = "claude-opus-4-7";

/** True if a usable API key is present at build time. */
export function isRealAiAvailable(): boolean {
  return typeof import.meta.env.VITE_ANTHROPIC_API_KEY === "string" &&
    import.meta.env.VITE_ANTHROPIC_API_KEY.trim().length > 0;
}

/** Lazily-created singleton client. */
let clientRef: Anthropic | null = null;
function getClient(): Anthropic {
  if (clientRef) return clientRef;
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "VITE_ANTHROPIC_API_KEY is not set — add it to .env.local to enable real AI.",
    );
  }
  clientRef = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  return clientRef;
}

// ---------------------------------------------------------------------------
// Image preparation — downscale + base64-encode so we stay well under the
// API request size limit. Opus 4.7 accepts up to 2576px on the long edge;
// 2048px gives us excellent OCR quality with smaller payloads.
// ---------------------------------------------------------------------------

const MAX_LONG_EDGE = 2048;
const JPEG_QUALITY = 0.85;

interface PreparedImage {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  fileName: string;
}

async function prepareImage(file: File): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const longEdge = Math.max(bitmap.width, bitmap.height);
  const scale = longEdge > MAX_LONG_EDGE ? MAX_LONG_EDGE / longEdge : 1;
  const targetW = Math.round(bitmap.width * scale);
  const targetH = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
  const buffer = await blob.arrayBuffer();
  return {
    base64: arrayBufferToBase64(buffer),
    mediaType: "image/jpeg",
    fileName: file.name,
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)),
    );
  }
  return btoa(binary);
}

// ---------------------------------------------------------------------------
// JSON schema Claude must return. Mirrors the AiProductMatch shape but in a
// flatter form — we re-wrap into `{value, confidence}` fields after.
// ---------------------------------------------------------------------------

const CONFIDENCE_ENUM = ["high", "medium", "low"];

function fieldSchema(description: string) {
  return {
    type: "object",
    properties: {
      value: { type: "string", description },
      confidence: { type: "string", enum: CONFIDENCE_ENUM },
    },
    required: ["value", "confidence"],
    additionalProperties: false,
  };
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    identified: {
      type: "boolean",
      description:
        "True if a real product was confidently identified, false if the image is unclear or generic.",
    },
    overallConfidence: {
      type: "integer",
      description: "0–100 overall confidence in the identification.",
    },
    matchReason: {
      type: "string",
      description: "One-line explanation of how the product was identified.",
    },
    sources: {
      type: "array",
      items: { type: "string" },
      description:
        "Public sources / marketplaces where this product is commonly listed (e.g. Amazon, Flipkart, BigBasket).",
    },
    ocrText: {
      type: "array",
      items: { type: "string" },
      description: "Notable text strings read from the label.",
    },
    barcode: { ...fieldSchema("EAN-13 / UPC-A barcode if visible. Empty if not.") },
    brandName: { ...fieldSchema("Brand name.") },
    productName: { ...fieldSchema("Full product name including variant.") },
    variant: { ...fieldSchema("Variant / flavour, if any.") },
    flavor: { ...fieldSchema("Flavour, if applicable. Empty otherwise.") },
    category: { ...fieldSchema("Top-level category.") },
    subCategory: { ...fieldSchema("Sub-category.") },
    skuType: { ...fieldSchema("Single, Multi-pack, Combo, etc.") },
    packageType: { ...fieldSchema("Pouch, Bottle, Tetra Pack, Carton, etc.") },
    description: { ...fieldSchema("2-3 sentence product description.") },
    packSize: { ...fieldSchema("Numeric pack size (e.g. 1, 200, 52).") },
    uom: { ...fieldSchema("Unit of measure (g, ml, kg, L, piece).") },
    netWeight: { ...fieldSchema("Net weight with unit (e.g. 200 g).") },
    grossWeight: { ...fieldSchema("Gross weight if known.") },
    dimensions: { ...fieldSchema("Approximate L x W x H in cm.") },
    casePack: { ...fieldSchema("Units per outer case if known.") },
    innerPack: { ...fieldSchema("Inner pack count if applicable.") },
    multipack: { ...fieldSchema("Yes / No.") },
    hsnCode: { ...fieldSchema("Indian HSN code for this product category.") },
    gstPercent: { ...fieldSchema("Indian GST percentage (0, 5, 12, 18, 28).") },
    manufacturerName: { ...fieldSchema("Manufacturer / marketer name.") },
    countryOfOrigin: { ...fieldSchema("Country of origin.") },
    shelfLifeDays: { ...fieldSchema("Shelf life in days as a number.") },
    storageType: { ...fieldSchema("Storage type (Ambient, Refrigerated, Frozen).") },
    mrp: { ...fieldSchema("Maximum Retail Price in INR as a number, no currency symbol.") },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "Short keyword tags.",
    },
    searchKeywords: {
      type: "array",
      items: { type: "string" },
      description: "Search keywords a seller would use.",
    },
    ingredients: {
      type: "array",
      items: { type: "string" },
      description: "Ingredients if visible on the label.",
    },
    nutrition: {
      type: "array",
      description: "Nutrition info per 100 g/ml if visible.",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          value: { type: "string" },
        },
        required: ["label", "value"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "identified",
    "overallConfidence",
    "matchReason",
    "sources",
    "ocrText",
    "barcode",
    "brandName",
    "productName",
    "category",
    "subCategory",
    "skuType",
    "packageType",
    "description",
    "packSize",
    "uom",
    "netWeight",
    "hsnCode",
    "gstPercent",
    "manufacturerName",
    "countryOfOrigin",
    "mrp",
    "tags",
    "searchKeywords",
  ],
  additionalProperties: false,
} as const;

// ---------------------------------------------------------------------------
// System prompt. Stable across calls → cached.
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a product identification engine for an Indian B2B seller catalog (FMCG, grocery, personal care, pharma, general merchandise).

You are shown 1–4 photos of a single product (front, back, barcode, side). Your job:

1. Identify the product as precisely as possible. Use brand mark + label OCR + barcode (EAN-13/UPC-A).
2. Fill the structured fields requested. Where you cannot read a value, leave it as an empty string ("") with confidence "low" — DO NOT make up specific numbers (MRP, weight, barcode).
3. Per-field confidence:
   - high   = read directly from the label, or matches an unambiguous brand SKU you know
   - medium = inferred (e.g. typical pack size for this brand+variant)
   - low    = guess / unknown — value should usually be empty
4. Use Indian conventions: INR for MRP, Indian HSN codes, GST slabs (0/5/12/18/28), India as country of origin unless the label clearly says otherwise.
5. \`overallConfidence\` is your honest 0–100 score for whether you correctly identified the product. Below 60 means "not confident — user should fill manually."
6. \`sources\` should list the 2–5 Indian marketplaces or brand sites a seller would cross-reference (e.g. "Amazon", "Flipkart", "BigBasket", "JioMart", "Blinkit", "Brand Website"). Do NOT invent obscure sources.
7. NEVER fabricate barcodes or MRPs you can't read. Empty + low confidence is correct.

Respond ONLY with the JSON object matching the provided schema.`;

// ---------------------------------------------------------------------------
// Main entry point — process all images + identify.
// ---------------------------------------------------------------------------

export interface RealAiCallbacks {
  onLog: (line: string) => void;
  onSourceQueried?: (source: AiSearchSource) => void;
}

export async function identifyProductWithClaude(
  files: File[],
  callbacks: RealAiCallbacks,
): Promise<AiSearchResponse> {
  callbacks.onLog("Connecting to Claude Vision (Opus 4.7)…");

  callbacks.onLog(`Preparing ${files.length} image(s) for analysis…`);
  const prepared: PreparedImage[] = [];
  for (let i = 0; i < files.length; i++) {
    callbacks.onLog(`  • Downscaling + encoding ${files[i].name}`);
    prepared.push(await prepareImage(files[i]));
  }

  callbacks.onLog("Sending images to Claude for vision analysis…");
  const client = getClient();

  const imageBlocks = prepared.map((img) => ({
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: img.mediaType,
      data: img.base64,
    },
  }));

  // Use messages.parse() for automatic schema validation. The system prompt
  // is identical every call, so cache it.
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          ...imageBlocks,
          {
            type: "text",
            text:
              "Identify this product. Return the JSON object matching the schema. " +
              "Be honest about confidence — empty fields with low confidence are better than fabricated values.",
          },
        ],
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: RESPONSE_SCHEMA,
      },
    },
  });

  callbacks.onLog(
    `Response received — input ${response.usage.input_tokens} tokens, output ${response.usage.output_tokens} tokens.`,
  );
  if (response.usage.cache_read_input_tokens) {
    callbacks.onLog(
      `  • Prompt cache hit: ${response.usage.cache_read_input_tokens} tokens read from cache.`,
    );
  }

  // The SDK populates `parsed_output` when the JSON validates. It can be
  // null if the model refused or returned malformed JSON; treat that as
  // a no-match.
  const parsed = response.parsed_output as ClaudeProductResponse | null;
  if (!parsed) {
    callbacks.onLog("Claude could not produce a structured response.");
    return emptyResponse(files);
  }

  callbacks.onLog(
    `Product identified: ${parsed.brandName.value} ${parsed.productName.value} (${parsed.overallConfidence}% confidence)`,
  );

  // Surface "sources" as queried sources for the UI chips.
  for (const src of parsed.sources.slice(0, 6)) {
    const allowed = matchSource(src);
    if (allowed && callbacks.onSourceQueried) callbacks.onSourceQueried(allowed);
  }

  return assembleResponse(parsed, files);
}

// ---------------------------------------------------------------------------
// Type-mapped Claude response.
// ---------------------------------------------------------------------------

interface ClaudeField {
  value: string;
  confidence: ConfidenceLevel;
}
interface ClaudeProductResponse {
  identified: boolean;
  overallConfidence: number;
  matchReason: string;
  sources: string[];
  ocrText: string[];
  barcode: ClaudeField;
  brandName: ClaudeField;
  productName: ClaudeField;
  variant?: ClaudeField;
  flavor?: ClaudeField;
  category: ClaudeField;
  subCategory: ClaudeField;
  skuType: ClaudeField;
  packageType: ClaudeField;
  description: ClaudeField;
  packSize: ClaudeField;
  uom: ClaudeField;
  netWeight: ClaudeField;
  grossWeight?: ClaudeField;
  dimensions?: ClaudeField;
  casePack?: ClaudeField;
  innerPack?: ClaudeField;
  multipack?: ClaudeField;
  hsnCode: ClaudeField;
  gstPercent: ClaudeField;
  manufacturerName: ClaudeField;
  countryOfOrigin: ClaudeField;
  shelfLifeDays?: ClaudeField;
  storageType?: ClaudeField;
  mrp: ClaudeField;
  tags: string[];
  searchKeywords: string[];
  ingredients?: string[];
  nutrition?: { label: string; value: string }[];
}

function assembleResponse(
  parsed: ClaudeProductResponse,
  files: File[],
): AiSearchResponse {
  const wrappedSources = parsed.sources
    .map(matchSource)
    .filter((s): s is AiSearchSource => s !== null);

  const match: AiProductMatch = {
    matchId: `claude-${Date.now()}`,
    tier:
      parsed.overallConfidence >= 90
        ? "exact"
        : parsed.overallConfidence >= 70
          ? "high"
          : "partial",
    overallConfidence: parsed.overallConfidence,
    matchReason: parsed.matchReason,
    sources: wrappedSources.length
      ? wrappedSources
      : ["Brand Website"],
    thumbnailSeed: `${parsed.brandName.value || "product"}-${parsed.productName.value || "id"}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40),
    brandName: parsed.brandName,
    productName: parsed.productName,
    variant: parsed.variant,
    flavor: parsed.flavor,
    category: parsed.category,
    subCategory: parsed.subCategory,
    skuType: parsed.skuType,
    packageType: parsed.packageType,
    tags: { value: parsed.tags, confidence: "medium" },
    searchKeywords: { value: parsed.searchKeywords, confidence: "medium" },
    description: parsed.description,
    ingredients: parsed.ingredients
      ? { value: parsed.ingredients, confidence: "medium" }
      : undefined,
    nutrition: parsed.nutrition
      ? { value: parsed.nutrition, confidence: "medium" }
      : undefined,
    packSize: parsed.packSize,
    uom: parsed.uom,
    netWeight: parsed.netWeight,
    grossWeight: parsed.grossWeight,
    dimensions: parsed.dimensions,
    casePack: parsed.casePack,
    innerPack: parsed.innerPack,
    multipack: parsed.multipack,
    barcode: parsed.barcode,
    hsnCode: parsed.hsnCode,
    gstPercent: parsed.gstPercent,
    manufacturerName: parsed.manufacturerName,
    countryOfOrigin: parsed.countryOfOrigin,
    shelfLifeDays: parsed.shelfLifeDays,
    storageType: parsed.storageType,
    mrp: parsed.mrp,
    fetchedImages: [],
  };

  const perImage: ImageProcessingResult[] = files.map((file) => ({
    fileName: file.name,
    ocrText: parsed.ocrText,
    barcodeDetected:
      parsed.barcode.confidence === "high" && parsed.barcode.value
        ? parsed.barcode.value
        : null,
    brandDetected: parsed.brandName.value || null,
    notes: [],
  }));

  return {
    searchId: `ai-real-${Date.now()}`,
    processedAt: new Date().toISOString(),
    perImage,
    searchedSources: wrappedSources,
    matches: parsed.identified && parsed.overallConfidence >= 40 ? [match] : [],
    noConfidentMatch: !parsed.identified || parsed.overallConfidence < 60,
  };
}

function emptyResponse(files: File[]): AiSearchResponse {
  return {
    searchId: `ai-real-${Date.now()}`,
    processedAt: new Date().toISOString(),
    perImage: files.map((f) => ({
      fileName: f.name,
      ocrText: [],
      barcodeDetected: null,
      brandDetected: null,
      notes: [],
    })),
    searchedSources: [],
    matches: [],
    noConfidentMatch: true,
  };
}

const KNOWN_SOURCES: AiSearchSource[] = [
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

function matchSource(raw: string): AiSearchSource | null {
  const lower = raw.toLowerCase();
  for (const src of KNOWN_SOURCES) {
    if (lower.includes(src.toLowerCase())) return src;
  }
  // Default any unrecognised source to "Brand Website" so the user still
  // sees a chip rather than nothing.
  if (lower.includes(".com") || lower.includes("site") || lower.includes("brand")) {
    return "Brand Website";
  }
  return null;
}
