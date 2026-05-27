// Shared orders data — the seed + a tiny store the orders list and
// the order detail page both read from.
//
// Why a shared store? Before this lib, the orders list owned the
// table data and the detail page rendered a single hard-coded
// OrderDetails mock for every order ID. Clicking any row landed
// the seller on the same "QWI-ONDC-260330-8F3K92" detail regardless of
// which row they came from. With this lib:
//
//   - The list reads from `getOrders()`.
//   - The detail page calls `getOrderDetail(orderId)` and renders
//     the right buyer / channel / status for that specific order.
//   - Status writes (confirm / cancel / mark as delivered) call
//     `updateOrderStatus(orderId, status)` and broadcast via a
//     tiny subscribe API so the list page re-renders the new
//     status without needing a reload.
//
// Phase 1 also retired the word "Rejected" — cancelled orders
// now use the consistent status name "Cancelled" across the
// whole module.

export type OrderStatus = "New" | "Confirmed" | "Delivered" | "Cancelled";

/**
 * Operational delivery classification for an order. Simplified per
 * the May 2026 product call to just two values — the granular
 * Sales Beat / Non-Sales Beat split now lives on the `beatName`
 * field instead, and Next Day Delivery rolls into "Urgent".
 *
 *   - "Urgent"  — must dispatch ASAP. Express, NDD-style, or any
 *                 other priority signal. Renders with a red badge
 *                 and rides the urgent lane in the day checklist.
 *   - "Regular" — standard scheduled delivery; rides the configured
 *                 beat / route on its assigned day.
 */
export type DeliveryType = "Urgent" | "Regular";

export interface OrderLineItem {
  skuCode: string;
  productName: string;
  /** Company that owns the product (e.g. "ITC Limited"). */
  company: string;
  brand: string;
  /** ONDC eB2B taxonomy category — surfaced on the export. */
  category: string;
  qty: number;
  originalPricePerUnit: number;
  finalPricePerUnit: number;
  discountApplied: number;
  discountDetails: string;
  lineTotal: number;
}

export interface Order {
  id: string;
  brand: string;
  /** Company that the order's primary line items map to. Displayed
   *  in the list as the second column (previously "Company / Brand"
   *  — we ship just the company now). */
  company: string;
  source: string;
  retailerName: string;
  itemsSummary: string;
  orderValue: number;
  paymentMode: "COD" | "Prepaid";
  orderDate: string;
  status: OrderStatus;
  marketplace: string;
  buyerContact?: string;
  buyerAddress?: string;
  buyerCode?: string;
  channelOrderId?: string;
  orderTime?: string;
  lineItems?: OrderLineItem[];
  /**
   * Date the seller has committed to deliver this order on
   * (YYYY-MM-DD). Becomes the primary operational reference for the
   * distributor — orders sort + bucket by this, not by orderDate.
   * For NDD the value is orderDate + 1 day.
   */
  expectedDeliveryDate: string;
  /** See `DeliveryType` for semantics. */
  deliveryType: DeliveryType;
  /** Optional beat name the order belongs to (when the order rides
   *  a configured serviceability beat). Surfaced on the badge and
   *  the detail page; orphan/ad-hoc deliveries leave this blank. */
  beatName?: string;
  /**
   * Reason captured in the Cancel popup when the seller cancels an
   * order (from either the detail page or the list page's bulk
   * action). Only meaningful when `status === "Cancelled"`. Rendered
   * in the Order Meta block on the detail page so the cancelled-tab
   * reviewer can see why each order was cancelled without re-opening
   * the activity log.
   */
  cancellationReason?: string;
}

// One distributor for the demo seller. Populates the Seller-*
// columns on the export and the seller card on the detail page.
export const SELLER_INFO = {
  name: "ITC Private Limited",
  contact: "+91 80 2222 3333",
  code: "SELLER-ITC-001",
};

// Seed orders — the same 13 mock orders the list used to inline.
// Statuses use the new "Cancelled" wording everywhere (was
// "Rejected"); companies are derived from each order's primary
// line-item company so the list's second column has a real value.
// `expectedDeliveryDate` + `deliveryType` are tuned around the demo
// "today" (2026-05-20) so the Tomorrow / Beyond Tomorrow tabs are
// pre-populated with realistic mixes.
export const seedOrders: Order[] = [
  {
    id: "QWI-ONDC-260330-8F3K92",
    brand: "ITC",
    company: "ITC Limited",
    source: "DMS-Bizom",
    retailerName: "Balaji Kirana Store",
    itemsSummary: "Sunflower Oil + 5 more",
    orderValue: 12450,
    paymentMode: "COD",
    orderDate: "2026-05-20",
    orderTime: "10:30 AM",
    status: "New",
    marketplace: "ONDC",
    expectedDeliveryDate: "2026-05-21",
    deliveryType: "Urgent",
    buyerContact: "+91 98765 43210",
    buyerAddress:
      "Shop No. 12, MG Road, Koramangala, Bangalore, Karnataka - 560034",
    buyerCode: "BUYER-BAL-456",
    channelOrderId: "ONDC-ORD-789456",
    lineItems: [
      {
        skuCode: "180000008",
        productName: "Freedom Refined Sunflower Oil 1L × 16",
        company: "Gemini Edibles & Fats India",
        brand: "Freedom",
        category: "Edible Oil",
        qty: 25,
        originalPricePerUnit: 171,
        finalPricePerUnit: 162.45,
        discountApplied: 213.75,
        discountDetails: "Slab 2: 12–47 qty • 5% off vs ₹171.00",
        lineTotal: 4061.25,
      },
      {
        skuCode: "SKU-AASH-10",
        productName: "Aashirvaad Atta 10kg",
        company: "ITC Limited",
        brand: "Aashirvaad",
        category: "Foodgrains",
        qty: 20,
        originalPricePerUnit: 450,
        finalPricePerUnit: 420,
        discountApplied: 600,
        discountDetails: "Slab 2: 10–24 qty • 6.67% off vs ₹450.00",
        lineTotal: 8400,
      },
      {
        skuCode: "SKU-SUNF-DF150",
        productName: "Sunfeast Biscuits Dark Fantasy 150g",
        company: "ITC Limited",
        brand: "Sunfeast",
        category: "Biscuits",
        qty: 50,
        originalPricePerUnit: 35,
        finalPricePerUnit: 35,
        discountApplied: 0,
        discountDetails: "—",
        lineTotal: 1750,
      },
      {
        skuCode: "SKU-CLAS-NB172",
        productName: "Classmate Notebook 172 Pages",
        company: "ITC Limited",
        brand: "Classmate",
        category: "Stationery",
        qty: 30,
        originalPricePerUnit: 45,
        finalPricePerUnit: 45,
        discountApplied: 0,
        discountDetails: "—",
        lineTotal: 1350,
      },
      {
        skuCode: "SKU-BING-MA90",
        productName: "Bingo Mad Angles 90g",
        company: "ITC Limited",
        brand: "Bingo",
        category: "Snacks",
        qty: 40,
        originalPricePerUnit: 20,
        finalPricePerUnit: 20,
        discountApplied: 0,
        discountDetails: "—",
        lineTotal: 800,
      },
      {
        skuCode: "SKU-YIPP-240",
        productName: "Yippee Noodles 240g",
        company: "ITC Limited",
        brand: "Yippee",
        category: "Noodles",
        qty: 25,
        originalPricePerUnit: 12,
        finalPricePerUnit: 12,
        discountApplied: 0,
        discountDetails: "—",
        lineTotal: 300,
      },
    ],
  },
  {
    id: "QWI-ONDC-260519-K2P7XR",
    brand: "Pepsi",
    company: "PepsiCo India",
    source: "DMS-Bizom",
    retailerName: "Balaji Kirana",
    itemsSummary: "100 units Mixed SKUs",
    orderValue: 12450,
    paymentMode: "COD",
    orderDate: "2026-05-19",
    status: "Confirmed",
    marketplace: "ONDC",
    expectedDeliveryDate: "2026-05-21",
    deliveryType: "Regular",
    beatName: "Mumbai Metro — North",
    buyerContact: "+91 98765 43211",
  },
  {
    id: "QWI-FLPK-260519-Q4M8YE",
    brand: "Freedom Oil",
    company: "Gemini Edibles & Fats India",
    source: "DMS-Botery",
    retailerName: "City Supermart",
    itemsSummary: "50 units Britannia Biscuits",
    orderValue: 8750,
    paymentMode: "Prepaid",
    orderDate: "2026-05-19",
    status: "Confirmed",
    marketplace: "Flipkart",
    expectedDeliveryDate: "2026-05-21",
    deliveryType: "Regular",
    buyerContact: "+91 98765 43212",
  },
  {
    id: "QWI-AMZN-260518-V6T3HN",
    brand: "Marico",
    company: "Marico Limited",
    source: "DMS-Bizom",
    retailerName: "Modern Retail Chain",
    itemsSummary: "200 units Maggi Noodles",
    orderValue: 24000,
    paymentMode: "Prepaid",
    orderDate: "2026-05-18",
    status: "Delivered",
    marketplace: "Amazon",
    expectedDeliveryDate: "2026-05-19",
    deliveryType: "Regular",
    beatName: "Pune Central",
    buyerContact: "+91 98765 43213",
  },
  {
    id: "QWI-ONDC-260518-J5C9BD",
    brand: "Pepsi",
    company: "PepsiCo India",
    source: "DMS-Botery",
    retailerName: "Quick Mart",
    itemsSummary: "30 units Aashirvaad Atta",
    orderValue: 5400,
    paymentMode: "COD",
    orderDate: "2026-05-18",
    status: "Cancelled",
    cancellationReason: "Out of Stock",
    marketplace: "ONDC",
    expectedDeliveryDate: "2026-05-19",
    deliveryType: "Urgent",
    buyerContact: "+91 98765 43214",
  },
  {
    id: "QWI-AMZN-260519-N7W2XK",
    brand: "Freedom Oil",
    company: "Gemini Edibles & Fats India",
    source: "DMS-Bizom",
    retailerName: "Sunrise Traders",
    itemsSummary: "75 units Sunfeast Biscuits",
    orderValue: 6825,
    paymentMode: "Prepaid",
    orderDate: "2026-05-19",
    status: "Confirmed",
    marketplace: "Amazon",
    expectedDeliveryDate: "2026-05-22",
    deliveryType: "Regular",
    beatName: "Mumbai Metro — South",
    buyerContact: "+91 98765 43215",
  },
  {
    id: "QWI-ONDC-260519-R3F4PT",
    brand: "Marico",
    company: "Marico Limited",
    source: "DMS-Botery",
    retailerName: "Lucky Store",
    itemsSummary: "40 units Surf Excel",
    orderValue: 9200,
    paymentMode: "COD",
    orderDate: "2026-05-19",
    status: "Confirmed",
    marketplace: "ONDC",
    expectedDeliveryDate: "2026-05-25",
    deliveryType: "Regular",
    buyerContact: "+91 98765 43216",
  },
  {
    id: "QWI-FLPK-260520-A6H8WC",
    brand: "Pepsi",
    company: "PepsiCo India",
    source: "DMS-Bizom",
    retailerName: "New Era Retail",
    itemsSummary: "60 units Colgate Toothpaste",
    orderValue: 4320,
    paymentMode: "Prepaid",
    orderDate: "2026-05-20",
    status: "New",
    marketplace: "Flipkart",
    expectedDeliveryDate: "2026-05-21",
    deliveryType: "Regular",
    beatName: "Bengaluru East",
    buyerContact: "+91 98765 43217",
  },
  {
    id: "QWI-AMZN-260517-B9D2MZ",
    brand: "Freedom Oil",
    company: "Gemini Edibles & Fats India",
    source: "DMS-Botery",
    retailerName: "Himalaya Traders",
    itemsSummary: "90 units Lizol Floor Cleaner",
    orderValue: 10800,
    paymentMode: "COD",
    orderDate: "2026-05-17",
    status: "Delivered",
    marketplace: "Amazon",
    expectedDeliveryDate: "2026-05-18",
    deliveryType: "Regular",
    buyerContact: "+91 98765 43218",
  },
  {
    id: "QWI-ONDC-260520-E5G7QY",
    brand: "Marico",
    company: "Marico Limited",
    source: "DMS-Bizom",
    retailerName: "Anand General Store",
    itemsSummary: "120 units Tata Tea Gold",
    orderValue: 19800,
    paymentMode: "Prepaid",
    orderDate: "2026-05-20",
    status: "New",
    marketplace: "ONDC",
    expectedDeliveryDate: "2026-05-22",
    deliveryType: "Regular",
    beatName: "Hyderabad North",
    buyerContact: "+91 98765 43219",
  },
  {
    id: "QWI-FLPK-260516-S4U8VK",
    brand: "Pepsi",
    company: "PepsiCo India",
    source: "DMS-Botery",
    retailerName: "Premium Retail Pvt Ltd",
    itemsSummary: "80 units Dove Soap",
    orderValue: 6400,
    paymentMode: "COD",
    orderDate: "2026-05-16",
    status: "Delivered",
    marketplace: "Flipkart",
    expectedDeliveryDate: "2026-05-17",
    deliveryType: "Regular",
    beatName: "Mumbai Metro — North",
    buyerContact: "+91 98765 43220",
  },
  {
    id: "QWI-AMZN-260515-T6Y9NF",
    brand: "Freedom Oil",
    company: "Gemini Edibles & Fats India",
    source: "DMS-Bizom",
    retailerName: "Vinayak Traders",
    itemsSummary: "45 units Ariel Detergent",
    orderValue: 13500,
    paymentMode: "Prepaid",
    orderDate: "2026-05-15",
    status: "Cancelled",
    cancellationReason: "Pricing Error",
    marketplace: "Amazon",
    expectedDeliveryDate: "2026-05-16",
    deliveryType: "Urgent",
    buyerContact: "+91 98765 43221",
  },
];

// ---- Tiny in-memory store + subscribe API ----
//
// Both pages can mutate (the list does bulk confirm / cancel /
// deliver, the detail page does single-order actions). When either
// writes, the other gets a re-render via the subscribe callback.

let _orders: Order[] = [...seedOrders];
const _listeners = new Set<() => void>();

const notify = () => {
  for (const cb of _listeners) cb();
};

export function getOrders(): Order[] {
  return _orders;
}

export function setOrders(next: Order[]) {
  _orders = next;
  notify();
}

export function getOrderById(id: string): Order | undefined {
  return _orders.find((o) => o.id === id);
}

/**
 * Update a single order's status. No-op if the id isn't found.
 * Passing `reason` alongside a "Cancelled" status persists it as
 * `cancellationReason` so the detail page can render it in Order
 * Meta. When the status flips to something OTHER than "Cancelled"
 * the previously persisted reason is cleared.
 */
export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  reason?: string,
) {
  let mutated = false;
  _orders = _orders.map((o) => {
    if (o.id !== id) return o;
    mutated = true;
    return applyStatusUpdate(o, status, reason);
  });
  if (mutated) notify();
}

/** Bulk variant — atomic from the subscriber's perspective. */
export function updateOrderStatuses(
  ids: string[],
  status: OrderStatus,
  reason?: string,
) {
  const set = new Set(ids);
  let mutated = false;
  _orders = _orders.map((o) => {
    if (!set.has(o.id)) return o;
    mutated = true;
    return applyStatusUpdate(o, status, reason);
  });
  if (mutated) notify();
}

/** Status-write helper — single source of truth for the
 *  cancellationReason side-effect. Cancelled + reason → persist;
 *  any other status → wipe a stale reason. */
function applyStatusUpdate(o: Order, status: OrderStatus, reason?: string): Order {
  if (status === "Cancelled") {
    return reason !== undefined
      ? { ...o, status, cancellationReason: reason }
      : { ...o, status };
  }
  // Any non-Cancelled write clears the previously persisted reason
  // so a re-opened-then-fulfilled order doesn't carry a stale label.
  const { cancellationReason: _drop, ...rest } = o;
  void _drop;
  return { ...rest, status };
}

export function subscribeToOrders(cb: () => void): () => void {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}

// ---- Delivery-bucket helpers ----
//
// "Today" is what the user is looking at right now. Hard-coding a
// demo-day baseline keeps the seed data and the bucketing logic in
// sync across screens — there's no live clock to chase. Override via
// `OVERRIDE_TODAY` if you ever need a different anchor for QA.

const DEMO_TODAY = "2026-05-20";

/** Resolve "today" for the orders module. */
export function getOrdersToday(): string {
  return DEMO_TODAY;
}

/** Add `n` days to a YYYY-MM-DD string. Returns YYYY-MM-DD. Parses
 *  and serialises in UTC so the result doesn't drift across the
 *  client's timezone boundary. */
function addDays(iso: string, n: number): string {
  const t = Date.parse(iso + "T00:00:00Z");
  if (Number.isNaN(t)) return iso;
  return new Date(t + n * 86400000).toISOString().slice(0, 10);
}

export type DeliveryBucket = "past" | "today" | "tomorrow" | "beyond";

/**
 * Classify an order's expected delivery date relative to today.
 * - past     — already overdue (operationally needs cleanup)
 * - today    — must dispatch / deliver today
 * - tomorrow — primary "Tomorrow Deliveries" bucket
 * - beyond   — anything dated after tomorrow
 */
export function getDeliveryBucket(order: Order): DeliveryBucket {
  const today = getOrdersToday();
  const tomorrow = addDays(today, 1);
  if (order.expectedDeliveryDate < today) return "past";
  if (order.expectedDeliveryDate === today) return "today";
  if (order.expectedDeliveryDate === tomorrow) return "tomorrow";
  return "beyond";
}

/** Day-of-week label for a YYYY-MM-DD date. Used by the
 *  "Friday Delivery" / "Monday Delivery" callouts on the row. */
export function dayOfWeekLabel(iso: string): string {
  const t = Date.parse(iso + "T00:00:00Z");
  if (Number.isNaN(t)) return iso;
  // Render in UTC so the weekday matches the date string regardless
  // of the user's local timezone.
  return new Date(t).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

/**
 * Human-friendly compound label combining the bucket + the delivery
 * type. Rewritten alongside the May 2026 Urgent / Regular collapse —
 * Urgent always reads as "Urgent" regardless of bucket; Regular
 * surfaces the bucket name (Tomorrow / Today / weekday).
 */
export function deliveryLabelFor(order: Order): string {
  const bucket = getDeliveryBucket(order);
  if (order.deliveryType === "Urgent") return "Urgent";
  if (bucket === "tomorrow") return "Tomorrow – Regular";
  if (bucket === "today") return "Today – Regular";
  if (bucket === "past") return "Overdue – Regular";
  // Beyond: surface the weekday so distributors can scan workload.
  return `${dayOfWeekLabel(order.expectedDeliveryDate)} Delivery`;
}

// ---- Synthesizer for the detail page ----
//
// OrderDetail wants a richer shape than the list row. For the seed
// "QWI-ONDC-260330-8F3K92" we have full line items in the seed; for every
// other order we synthesize a single-line products array from the
// itemsSummary string so the products table has something to show.
// In production this would be a real lookup against the backend.

export interface SynthesizedOrderProduct {
  id: string;
  name: string;
  skuId: string;
  orderedQuantity: number;
  availableStock: number;
  pricePerUnit: number;
  totalPrice: number;
  basePrice?: number;
}

/** Build the order-detail shape from a list `Order`. The caller
 *  (order-detail.tsx) supplies the rich line items for orders we
 *  have full mock data for; for the rest we synthesise a single
 *  line from itemsSummary so the products table isn't empty. */
export function synthesizeProducts(
  order: Order,
): SynthesizedOrderProduct[] {
  // Use line items when present (real export-grade detail).
  if (order.lineItems && order.lineItems.length > 0) {
    return order.lineItems.map((li, idx) => ({
      id: String(idx + 1),
      name: li.productName,
      skuId: li.skuCode,
      orderedQuantity: li.qty,
      availableStock: Math.max(li.qty * 2, 50),
      basePrice: li.originalPricePerUnit,
      pricePerUnit: li.finalPricePerUnit,
      totalPrice: li.lineTotal,
    }));
  }

  // Fallback — derive a placeholder line item from the itemsSummary
  // string. The summary follows a "<qty> units <name>" / "Sunflower
  // Oil + N more" shape; we strip the suffix and approximate the
  // unit price from orderValue / qty.
  const summary = order.itemsSummary;
  const m = /^(\d+)\s+units\s+(.+)$/i.exec(summary);
  const qty = m ? Number(m[1]) : 1;
  const name = m ? m[2] : summary;
  const ppu = qty > 0 ? +(order.orderValue / qty).toFixed(2) : order.orderValue;
  return [
    {
      id: "1",
      name,
      skuId: `${order.id}-LINE-1`,
      orderedQuantity: qty,
      availableStock: qty * 2,
      basePrice: ppu,
      pricePerUnit: ppu,
      totalPrice: order.orderValue,
    },
  ];
}
