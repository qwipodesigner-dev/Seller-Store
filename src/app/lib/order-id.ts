// =====================================================================
// Order ID — format, generator, validator.
//
//   Shape: QWI-<MKT>-<YYMMDD>-<TOKEN>
//   Example: QWI-ONDC-260511-8F3K92
//
//   QWI    — fixed company prefix
//   MKT    — 4-char marketplace code (ONDC / AMZN / FLPK / …)
//   YYMMDD — date the order arrived (2-digit year)
//   TOKEN  — 6 chars from a 30-letter alphabet (no I, L, 1, O, 0)
//
// Why this shape:
//   - Sortable by marketplace then date when scanned by eye, no
//     parse step needed.
//   - The bucket prefix (`QWI-MKT-YYMMDD-`) makes cross-marketplace
//     collisions impossible by construction; the random token only
//     has to be unique inside one day's bucket per marketplace.
//   - 30⁶ ≈ 729 M tokens per bucket — birthday-paradox 50% collision
//     at ~27 000 IDs/day, well past our forseeable scale.
//   - Token alphabet drops the OCR/readback-confusable characters
//     (I/L/1, O/0) so reading IDs back over the phone is reliable.
//   - 4-char marketplace code reserves enough room for future
//     additions (SHPF, MEES, JIOM, BIGB, …) without inflating the
//     overall ID width.
// =====================================================================

/**
 * Marketplace → 4-char code mapping. Source-of-truth for what shows
 * up in the middle of an order ID. Add a new entry here when a new
 * channel onboards.
 */
export const MARKETPLACE_CODE: Record<string, string> = {
  ONDC: "ONDC",
  Amazon: "AMZN",
  Flipkart: "FLPK",
  Shopify: "SHPF",
  Meesho: "MEES",
  JioMart: "JIOM",
  BigBasket: "BIGB",
};

/** Default code when an order arrives without a marketplace tag. */
const DEFAULT_MARKETPLACE_CODE = "ONDC";

/**
 * The 30-letter token alphabet. Order-preserved (A-Z minus I/L/O,
 * then 2-9) so tokens read naturally; randomness comes from the
 * indexing into it, not from the alphabet order.
 *
 *   Removed: I (looks like 1 and L), L (looks like 1), O (looks
 *   like 0), 0 (looks like O), 1 (looks like I and L).
 */
const TOKEN_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const TOKEN_LENGTH = 6;
export const ORDER_ID_REGEX = /^QWI-[A-Z]{2,5}-\d{6}-[A-Z0-9]{6}$/;

/** Get a cryptographically-strong 6-char token. Falls back to
 *  Math.random only when crypto is unavailable (older Node test
 *  runners) so unit tests can still run. */
export function generateOrderToken(length: number = TOKEN_LENGTH): string {
  const alphabet = TOKEN_ALPHABET;
  const bytes = new Uint8Array(length);
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/** Format a Date / ISO date string as YYMMDD. */
export function formatYymmdd(input: Date | string = new Date()): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) {
    // Bad input — fall back to today so we never emit an invalid id.
    return formatYymmdd(new Date());
  }
  const yy = String(d.getFullYear() % 100).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/** Look up the 4-char marketplace code. Unknown marketplaces fall
 *  back to ONDC so we never produce an ID without a recognisable
 *  bucket. */
export function marketplaceCode(name: string | undefined | null): string {
  if (!name) return DEFAULT_MARKETPLACE_CODE;
  const direct = MARKETPLACE_CODE[name];
  if (direct) return direct;
  // Case-insensitive backup match for names that arrive with weird
  // casing (e.g. "amazon", "AMAZON").
  const found = Object.entries(MARKETPLACE_CODE).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );
  return found ? found[1] : DEFAULT_MARKETPLACE_CODE;
}

/**
 * Build a fresh Order ID. The caller supplies the marketplace (or
 * its 4-char code) and an optional date; everything else is filled
 * in by the helpers above.
 *
 *   generateOrderId("ONDC")              → QWI-ONDC-260511-8F3K92
 *   generateOrderId("Amazon", "2026-03-30") → QWI-AMZN-260330-…
 */
export function generateOrderId(
  marketplace: string | undefined | null = DEFAULT_MARKETPLACE_CODE,
  date: Date | string = new Date(),
): string {
  return `QWI-${marketplaceCode(marketplace)}-${formatYymmdd(date)}-${generateOrderToken()}`;
}

/**
 * Generate an order ID guaranteed not to collide with any ID in the
 * `existing` set. Loops up to 5× before giving up — at 30⁶ tokens
 * per bucket this is essentially never reached.
 */
export function generateUniqueOrderId(
  marketplace: string | undefined | null,
  date: Date | string,
  existing: Set<string> | string[] = new Set(),
): string {
  const seen = existing instanceof Set ? existing : new Set(existing);
  for (let i = 0; i < 5; i++) {
    const candidate = generateOrderId(marketplace, date);
    if (!seen.has(candidate)) return candidate;
  }
  // Last-resort fallback — append two more random chars and call it
  // done. Should never run in practice.
  return `${generateOrderId(marketplace, date)}-${generateOrderToken(2)}`;
}

/** Shape check. Returns false for legacy DKN-* IDs and anything
 *  else that doesn't fit the new format. */
export function isValidOrderId(id: string | null | undefined): boolean {
  return typeof id === "string" && ORDER_ID_REGEX.test(id);
}

/** Parse an Order ID into its four sections — useful for debugging,
 *  for surfacing the marketplace in a UI without reading data, and
 *  for filtering by date bucket. */
export function parseOrderId(id: string): {
  prefix: string;
  marketplace: string;
  date: string;
  token: string;
} | null {
  if (!isValidOrderId(id)) return null;
  const [prefix, marketplace, date, token] = id.split("-");
  return { prefix, marketplace, date, token };
}
