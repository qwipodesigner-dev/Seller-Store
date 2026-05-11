// Shared orders data — the seed + a tiny store the orders list and
// the order detail page both read from.
//
// Why a shared store? Before this lib, the orders list owned the
// table data and the detail page rendered a single hard-coded
// OrderDetails mock for every order ID. Clicking any row landed
// the seller on the same "DKN-2025-12345" detail regardless of
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
export const seedOrders: Order[] = [
  {
    id: "DKN-2025-12345",
    brand: "ITC",
    company: "ITC Limited",
    source: "DMS-Bizom",
    retailerName: "Balaji Kirana Store",
    itemsSummary: "Sunflower Oil + 5 more",
    orderValue: 12450,
    paymentMode: "COD",
    orderDate: "2026-03-30",
    orderTime: "10:30 AM",
    status: "New",
    marketplace: "ONDC",
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
    id: "DKN-2025-12347",
    brand: "Pepsi",
    company: "PepsiCo India",
    source: "DMS-Bizom",
    retailerName: "Balaji Kirana",
    itemsSummary: "100 units Mixed SKUs",
    orderValue: 12450,
    paymentMode: "COD",
    orderDate: "2026-03-26",
    status: "Confirmed",
    marketplace: "ONDC",
  },
  {
    id: "DKN-2025-12348",
    brand: "Freedom Oil",
    company: "Gemini Edibles & Fats India",
    source: "DMS-Botery",
    retailerName: "City Supermart",
    itemsSummary: "50 units Britannia Biscuits",
    orderValue: 8750,
    paymentMode: "Prepaid",
    orderDate: "2026-03-26",
    status: "Confirmed",
    marketplace: "Flipkart",
  },
  {
    id: "DKN-2025-12349",
    brand: "Marico",
    company: "Marico Limited",
    source: "DMS-Bizom",
    retailerName: "Modern Retail Chain",
    itemsSummary: "200 units Maggi Noodles",
    orderValue: 24000,
    paymentMode: "Prepaid",
    orderDate: "2026-03-25",
    status: "Delivered",
    marketplace: "Amazon",
  },
  {
    id: "DKN-2025-12350",
    brand: "Pepsi",
    company: "PepsiCo India",
    source: "DMS-Botery",
    retailerName: "Quick Mart",
    itemsSummary: "30 units Aashirvaad Atta",
    orderValue: 5400,
    paymentMode: "COD",
    orderDate: "2026-03-25",
    status: "Cancelled",
    marketplace: "ONDC",
  },
  {
    id: "DKN-2025-12351",
    brand: "Freedom Oil",
    company: "Gemini Edibles & Fats India",
    source: "DMS-Bizom",
    retailerName: "Sunrise Traders",
    itemsSummary: "75 units Sunfeast Biscuits",
    orderValue: 6825,
    paymentMode: "Prepaid",
    orderDate: "2026-03-24",
    status: "Confirmed",
    marketplace: "Amazon",
  },
  {
    id: "DKN-2025-12352",
    brand: "Marico",
    company: "Marico Limited",
    source: "DMS-Botery",
    retailerName: "Lucky Store",
    itemsSummary: "40 units Surf Excel",
    orderValue: 9200,
    paymentMode: "COD",
    orderDate: "2026-03-24",
    status: "Confirmed",
    marketplace: "ONDC",
  },
  {
    id: "DKN-2025-12353",
    brand: "Pepsi",
    company: "PepsiCo India",
    source: "DMS-Bizom",
    retailerName: "New Era Retail",
    itemsSummary: "60 units Colgate Toothpaste",
    orderValue: 4320,
    paymentMode: "Prepaid",
    orderDate: "2026-03-23",
    status: "New",
    marketplace: "Flipkart",
  },
  {
    id: "DKN-2025-12354",
    brand: "Freedom Oil",
    company: "Gemini Edibles & Fats India",
    source: "DMS-Botery",
    retailerName: "Himalaya Traders",
    itemsSummary: "90 units Lizol Floor Cleaner",
    orderValue: 10800,
    paymentMode: "COD",
    orderDate: "2026-03-23",
    status: "Delivered",
    marketplace: "Amazon",
  },
  {
    id: "DKN-2025-12355",
    brand: "Marico",
    company: "Marico Limited",
    source: "DMS-Bizom",
    retailerName: "Anand General Store",
    itemsSummary: "120 units Tata Tea Gold",
    orderValue: 19800,
    paymentMode: "Prepaid",
    orderDate: "2026-03-22",
    status: "New",
    marketplace: "ONDC",
  },
  {
    id: "DKN-2025-12356",
    brand: "Pepsi",
    company: "PepsiCo India",
    source: "DMS-Botery",
    retailerName: "Premium Retail Pvt Ltd",
    itemsSummary: "80 units Dove Soap",
    orderValue: 6400,
    paymentMode: "COD",
    orderDate: "2026-03-22",
    status: "Delivered",
    marketplace: "Flipkart",
  },
  {
    id: "DKN-2025-12357",
    brand: "Freedom Oil",
    company: "Gemini Edibles & Fats India",
    source: "DMS-Bizom",
    retailerName: "Vinayak Traders",
    itemsSummary: "45 units Ariel Detergent",
    orderValue: 13500,
    paymentMode: "Prepaid",
    orderDate: "2026-03-21",
    status: "Cancelled",
    marketplace: "Amazon",
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

/** Update a single order's status. No-op if the id isn't found. */
export function updateOrderStatus(id: string, status: OrderStatus) {
  let mutated = false;
  _orders = _orders.map((o) => {
    if (o.id !== id) return o;
    mutated = true;
    return { ...o, status };
  });
  if (mutated) notify();
}

/** Bulk variant — atomic from the subscriber's perspective. */
export function updateOrderStatuses(ids: string[], status: OrderStatus) {
  const set = new Set(ids);
  let mutated = false;
  _orders = _orders.map((o) => {
    if (!set.has(o.id)) return o;
    mutated = true;
    return { ...o, status };
  });
  if (mutated) notify();
}

export function subscribeToOrders(cb: () => void): () => void {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}

// ---- Synthesizer for the detail page ----
//
// OrderDetail wants a richer shape than the list row. For the seed
// "DKN-2025-12345" we have full line items in the seed; for every
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
