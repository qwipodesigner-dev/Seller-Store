// Phase 1 demo: every login carries a `dataMode` of "demo" or "empty".
// "empty" forces every page (admin AND seller) to show its inception-day
// empty state — useful for screenshots and demos.
//
// Admin-side data wiping is handled inside admin-catalog.ts and mock-store.ts
// because those collections are persisted in localStorage. Seller-side data
// is currently hard-coded inside the page files (mockOrders, mockProducts,
// etc.), so each seller page reads `isEmptyMode()` from this module to
// decide whether to render its seed or an empty list.

const KEY = "qwipo.dataMode";

export type DataMode = "demo" | "empty";

export function getDataMode(): DataMode {
  try {
    return localStorage.getItem(KEY) === "empty" ? "empty" : "demo";
  } catch {
    return "demo";
  }
}

export function setDataMode(mode: DataMode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* localStorage unavailable — no-op */
  }
}

export function isEmptyMode(): boolean {
  return getDataMode() === "empty";
}
