// Shared store for bit-wise serviceability configuration. Owns the
// canonical list of "bits" (Company × Beat × DeliveryDay × optional
// polygon) and exposes a subscribe API so any page can react to
// changes — the ServiceabilityManager UI on the admin seller-detail
// page writes through here, and the Customer detail page reads from
// here to render its auto-assigned delivery day.
//
// In a real install this would live behind an API. For the demo
// everything is in-memory + seeded with one Freedom bit so the UI
// always has something to point at.
//
// `getDeliveryDayForCompany` is the entry point downstream callers
// (customer detail, orders list) should use. It returns the bit the
// customer "belongs to" for the given company, alongside its
// delivery day — or null when no bit is configured. The matching
// rule is deterministic + cheap (no polygon engine in the demo):
//   1. If only one bit exists for the company, use it.
//   2. Otherwise hash the customer location key into the company's
//      bit list so the assignment is stable across renders.
// Wiring a real point-in-polygon test later is a drop-in replacement
// for that function.

import type { DeliveryDay } from "./customers-data";

export interface ServiceabilityBit {
  id: string;
  companyId: string;
  companyName: string;
  beatName: string;
  deliveryDay: DeliveryDay;
  polygonFileName?: string;
  polygonData?: unknown;
  createdAt: string;
}

// ---- Seed ----
//
// One Freedom (co-freedom) bit so the Mumbai customer in the seed
// (c3 Ramesh Patel, area: Andheri West) auto-inherits "Monday" the
// moment the customer detail page renders.

const SAMPLE_FREEDOM_POLYGON = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      properties: { name: "Freedom Zone — Mumbai metropolitan region" },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [72.7, 18.9],
            [73.05, 18.9],
            [73.05, 19.3],
            [72.7, 19.3],
            [72.7, 18.9],
          ],
        ],
      },
    },
  ],
};

const SEED_BITS: ServiceabilityBit[] = [
  {
    id: "bit-freedom-mum-mon",
    companyId: "co-freedom",
    companyName: "Gemini Edibles & Fats India",
    beatName: "Mumbai Metro — North",
    deliveryDay: "Monday",
    polygonFileName: "freedom-zone.geojson",
    polygonData: SAMPLE_FREEDOM_POLYGON,
    createdAt: "2026-04-10T09:00:00Z",
  },
];

// ---- In-memory store + subscribe API ----

let _bits: ServiceabilityBit[] = [...SEED_BITS];
const _listeners = new Set<() => void>();

const notify = () => {
  for (const cb of _listeners) cb();
};

export function getServiceabilityBits(): ServiceabilityBit[] {
  return _bits;
}

export function setServiceabilityBits(next: ServiceabilityBit[]): void {
  _bits = next;
  notify();
}

export function subscribeToServiceabilityBits(cb: () => void): () => void {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}

export function makeServiceabilityBitId(): string {
  return `bit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ---- Lookup helpers ----

/** Deterministic hash for picking a bit from the company's list. We
 *  don't run a real point-in-polygon test in the demo, so we lean on
 *  the customer location to keep the assignment stable across
 *  renders + the same across pages (list + detail). */
function hashKey(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export interface CustomerLocationKey {
  customerId: string;
  city?: string;
  area?: string;
  pincode?: string;
}

/**
 * Resolve the serviceability bit a customer would inherit for a
 * given company. Returns null when no bit is configured.
 *
 * For the demo this is a simple deterministic mapper — when a real
 * polygon engine ships, swap the body for a point-in-polygon test
 * against `bit.polygonData`. Callers don't need to change.
 */
export function findBitForCustomer(
  customer: CustomerLocationKey,
  companyId: string,
): ServiceabilityBit | null {
  const candidates = _bits.filter((b) => b.companyId === companyId);
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  const key = `${customer.customerId}|${customer.city ?? ""}|${customer.area ?? ""}|${customer.pincode ?? ""}`;
  return candidates[hashKey(key) % candidates.length];
}

/** Convenience — same as `findBitForCustomer` but returns just the
 *  delivery day (or null). Used by display surfaces that only care
 *  about the day name. */
export function getDeliveryDayForCustomer(
  customer: CustomerLocationKey,
  companyId: string,
): DeliveryDay | null {
  return findBitForCustomer(customer, companyId)?.deliveryDay ?? null;
}
