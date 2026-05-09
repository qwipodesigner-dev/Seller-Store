// Shared offers/schemes data + lookup helpers.
//
// The Offers & Schemes list (`offers-list.tsx`) is the canonical
// editor for QPS schemes, but other pages need to query against
// the same dataset — e.g. Price & Inventory needs to know whether
// a SKU has active schemes mapped to it BEFORE the seller updates
// its base price (so the system can warn that the slab-effective
// prices will recalc on top of the new SP).
//
// We keep the seed in this lib so both pages can read it. New
// schemes the seller creates in the same session are persisted to
// localStorage (`qwipo.qpsSchemes`) so the lookup also surfaces
// them — the offers list calls `setAllSchemes()` whenever its
// state changes.

import {
  type QpsScheme,
  type QpsSlab,
  computeEffectivePrice,
} from "./qps-validation";

const STORAGE_KEY = "qwipo.qpsSchemes";

// Seed schemes — same shape that offers-list.tsx renders. One
// example of each status (Active, Inactive, Scheduled, Expired)
// so reviewers can see how each looks on the list.
export const seedQpsSchemes: QpsScheme[] = [
  {
    id: "QPS-180000008",
    name: "QPS – Sunflower Oil 1L x16",
    skuCode: "180000008",
    skuName: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS.",
    mrp: 188,
    sellingPrice: 171,
    startDate: "2026-04-01",
    endDate: "2026-05-31",
    status: "Active",
    slabs: [
      { minQty: 1, maxQty: 11, discountType: "flat", slabPrice: 171, effectivePrice: 171 },
      { minQty: 12, maxQty: 47, discountType: "percent", slabPercent: 5, effectivePrice: +(171 * 0.95).toFixed(2) },
      { minQty: 48, maxQty: null, discountType: "percent", slabPercent: 10, effectivePrice: +(171 * 0.9).toFixed(2) },
    ],
  },
  {
    id: "QPS-180000249",
    name: "QPS – Sunflower Oil 5Lx4 Jars",
    skuCode: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    mrp: 963,
    sellingPrice: 875,
    startDate: "2026-04-15",
    endDate: "2026-06-30",
    status: "Inactive",
    slabs: [
      { minQty: 1, maxQty: 4, discountType: "flat", slabPrice: 875, effectivePrice: 875 },
      { minQty: 5, maxQty: 19, discountType: "flat", slabPrice: 855, effectivePrice: 855 },
      { minQty: 20, maxQty: null, discountType: "flat", slabPrice: 820, effectivePrice: 820 },
    ],
  },
  {
    id: "QPS-180000005",
    name: "QPS – Sunflower Oil 15 KG",
    skuCode: "180000005",
    skuName: "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN",
    mrp: 3091,
    sellingPrice: 2810,
    startDate: "2026-05-15",
    endDate: "2026-07-31",
    status: "Scheduled",
    slabs: [
      { minQty: 1, maxQty: 4, discountType: "flat", slabPrice: 2810, effectivePrice: 2810 },
      { minQty: 5, maxQty: null, discountType: "percent", slabPercent: 4, effectivePrice: +(2810 * 0.96).toFixed(2) },
    ],
  },
  {
    id: "QPS-180000006",
    name: "QPS – Sunflower Oil 15 LTR",
    skuCode: "180000006",
    skuName: "FREEDOM REF. SUNFLOWER OIL 15 LTR. TIN",
    mrp: 2838,
    sellingPrice: 2580,
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    status: "Expired",
    slabs: [
      { minQty: 1, maxQty: 9, discountType: "flat", slabPrice: 2580, effectivePrice: 2580 },
      { minQty: 10, maxQty: null, discountType: "percent", slabPercent: 6, effectivePrice: +(2580 * 0.94).toFixed(2) },
    ],
  },
];

/** Read the persisted scheme set, falling back to the seed on first
 *  load. Returns a copy so callers can mutate freely. */
export function getAllSchemes(): QpsScheme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...seedQpsSchemes];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as QpsScheme[];
  } catch {
    /* localStorage unavailable or corrupted — fall through */
  }
  return [...seedQpsSchemes];
}

/** Persist the full scheme set. The Offers & Schemes list calls
 *  this whenever its state changes so other pages see the latest. */
export function setAllSchemes(schemes: QpsScheme[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schemes));
  } catch {
    /* localStorage unavailable — no-op */
  }
}

/**
 * Return the schemes currently in effect (or about to be) for a
 * given SKU. We treat both "Active" and "Scheduled" as worth
 * warning about — Scheduled schemes will activate soon and the
 * seller's price update will affect their effective prices then.
 *
 * "Inactive" (toggled off by seller) and "Expired" (past end date)
 * are filtered out — they have no live impact on pricing.
 */
export function getActiveSchemesForSku(skuCode: string): QpsScheme[] {
  return getAllSchemes().filter(
    (s) =>
      s.skuCode === skuCode &&
      (s.status === "Active" || s.status === "Scheduled"),
  );
}

/**
 * Recompute slab effective prices for a NEW selling price. Flat
 * slabs keep their locked rupee value; percent slabs recalc against
 * the new SP. Returns a fresh slab array — the input is untouched.
 *
 * This drives the "Updated Effective Price" column in the price-
 * change confirmation dialog.
 */
export function recomputeSlabsForNewPrice(
  slabs: QpsSlab[],
  newSellingPrice: number,
): QpsSlab[] {
  return slabs.map((s) => ({
    ...s,
    effectivePrice: computeEffectivePrice(s, newSellingPrice),
  }));
}
