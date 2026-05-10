// Shared store for the seller's Order Settings values that other
// pages need to read. Backed by localStorage so a change made on the
// Order Settings page propagates to any SKU Detail page opened
// afterwards (the SKU page reads on mount via useState's lazy init).
//
// We only persist the small handful of fields that are actually
// referenced cross-page; everything else stays local to
// order-settings.tsx.

const PROCESSING_TIME_KEY = "qwipo.orderSettings.processingTimeHours";

/** Default if the seller has never opened Order Settings. Matches the
 *  default the page seeds. */
const DEFAULT_PROCESSING_TIME_HOURS = "24";

/** The dropdown options the seller can pick from on Order Settings —
 *  exported so any consumer can render the same surface. */
export const PROCESSING_TIME_OPTIONS = ["6", "12", "24", "48", "72"] as const;

export function getProcessingTimeHours(): string {
  try {
    const v = localStorage.getItem(PROCESSING_TIME_KEY);
    if (v && PROCESSING_TIME_OPTIONS.includes(v as (typeof PROCESSING_TIME_OPTIONS)[number])) {
      return v;
    }
  } catch {
    /* localStorage unavailable — fall through */
  }
  return DEFAULT_PROCESSING_TIME_HOURS;
}

export function setProcessingTimeHours(hours: string) {
  try {
    localStorage.setItem(PROCESSING_TIME_KEY, hours);
  } catch {
    /* localStorage unavailable — no-op */
  }
}

/** Format hours for display. "24" → "24 hours". */
export function formatProcessingTimeLabel(hours: string): string {
  return `${hours} hour${hours === "1" ? "" : "s"}`;
}
