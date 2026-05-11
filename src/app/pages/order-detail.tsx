import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  Store,
  Building2,
  Phone,
  MapPin,
  Package,
  CheckCircle2,
  XCircle,
  Edit3,
  RotateCcw,
  Calendar,
  Hash,
  Layers,
  TrendingDown,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
// Shared orders store — the detail page now looks up the right
// order by URL :orderId rather than rendering a single hard-coded
// mock for every route. Status writes (confirm / cancel / mark as
// delivered) flow back through `updateOrderStatus` so the list
// page's subscribe callback sees the change.
import {
  getOrderById,
  updateOrderStatus,
  subscribeToOrders,
  synthesizeProducts,
  SELLER_INFO,
  type Order,
} from "../lib/orders-data";

/** One row in the QPS slab schedule for a SKU. */
interface QpsSlabDef {
  minQty: number;
  /** Upper bound; undefined = open-ended (highest tier). */
  maxQty?: number;
  /** Pretty name for the discount, e.g. "5% off" / "Flat ₹155" / "—" for no discount. */
  discountLabel: string;
  /** Effective per-unit price in this tier. */
  pricePerUnit: number;
}

interface OrderProduct {
  id: string;
  name: string;
  skuId: string;
  orderedQuantity: number;
  availableStock: number;
  editableQuantity: number;
  pricePerUnit: number;
  /** In-flight edit of price-per-unit. Mirrors pricePerUnit until the seller modifies it. */
  editablePricePerUnit: number;
  totalPrice: number;
  isModified: boolean;
  /** Base selling price before any QPS slab discount is applied (per unit). */
  basePrice?: number;
  /** Snapshot of the QPS slab applied to this line item, if any. */
  qps?: {
    /** The Offer Code (scheme ID) the discount was applied from —
     *  e.g. "QPS-180000008". Surfaced on the product line so the
     *  seller can trace each line's pricing back to the scheme that
     *  authored it. */
    offerCode: string;
    slabLabel: string;       // e.g. "Slab 2 · 12–47 qty"
    discountLabel: string;   // Phase 1 — always "N% off" / "—" (no flat slabs)
    savingPerUnit: number;   // ₹ saved per unit vs basePrice
    totalSaving: number;     // ₹ saved on the whole line
    /** Full slab schedule — present so we can re-evaluate live when the seller
     *  modifies the order quantity in edit mode. */
    slabs?: QpsSlabDef[];
  };
}

/** Build a Slab N · X–Y qty (or X+) label from a slab definition. */
function slabLabelFor(idx: number, slab: QpsSlabDef): string {
  const range = slab.maxQty
    ? `${slab.minQty}–${slab.maxQty} qty`
    : `${slab.minQty}+ qty`;
  return `Slab ${idx + 1} · ${range}`;
}

/**
 * Locate the slab that a given quantity falls into.
 *
 * Returns -1 only when qty < the lowest tier's minQty. When qty
 * exceeds the highest defined slab's maxQty (i.e. the seller
 * authored bounded slabs and the order goes past them), we fall
 * back to the LAST slab so the customer still gets the highest
 * tier's discount. This matches the product rule: "the highest
 * tier always applies to over-quantity orders."
 */
function findSlabIdx(qty: number, slabs: QpsSlabDef[]): number {
  if (slabs.length === 0) return -1;
  for (let i = 0; i < slabs.length; i++) {
    const s = slabs[i];
    const inRange =
      qty >= s.minQty && (s.maxQty === undefined || qty <= s.maxQty);
    if (inRange) return i;
  }
  // Past every defined slab — pick the last one (highest qty range)
  // if the order quantity exceeds its minQty. (If qty is below
  // every slab's minQty we return -1 unchanged.)
  const last = slabs[slabs.length - 1];
  if (qty >= last.minQty) return slabs.length - 1;
  return -1;
}

interface OrderDetails {
  orderId: string;
  // Status string mirrors the shared store. "In Progress" stays in
  // the union for backwards compatibility but isn't produced by any
  // current flow; Phase 1 ships New / Confirmed / Cancelled /
  // Delivered.
  status: "New" | "Confirmed" | "In Progress" | "Cancelled" | "Delivered";
  orderTime: string;
  channel: "ONDC" | "Amazon" | "Flipkart";
  buyerStoreName: string;
  buyerOwnerName: string;
  buyerPhone: string;
  buyerAddress: string;
  sellerName: string;
  sellerId: string;
  sellerContact: string;
  buyerId: string;
  channelOrderId: string;
  paymentMode: "COD" | "Prepaid";
  orderValue: number;
  products: OrderProduct[];
}

/**
 * Build an OrderDetails record from a shared-store Order. For
 * "DKN-2025-12345" we keep the rich products mock (with QPS slab
 * snapshots) because line items there carry the full discount
 * trace; for every other order we synthesize the products from
 * the store's lineItems / itemsSummary. The buyer / seller /
 * channel / status fields always come from the store row, so
 * clicking any row in the orders list now lands the seller on the
 * right order's details.
 */
function buildOrderDetailFromStore(order: Order): OrderDetails {
  // For the rich-mock order, keep the existing hand-authored
  // products array (with QPS slabs) — synthesizeProducts strips the
  // QPS field so we'd lose it otherwise.
  const products =
    order.id === "DKN-2025-12345"
      ? RICH_PRODUCTS_DKN_2025_12345
      : (synthesizeProducts(order) as OrderProduct[]);

  // Status mapping — the store's OrderStatus is a subset of the
  // detail page's wider union, so the cast is safe.
  return {
    orderId: order.id,
    status: order.status as OrderDetails["status"],
    orderTime: `${order.orderDate}${order.orderTime ? " " + order.orderTime : ""}`,
    channel: (order.marketplace as OrderDetails["channel"]) ?? "ONDC",
    buyerStoreName: order.retailerName,
    buyerOwnerName: order.retailerName,
    buyerPhone: order.buyerContact ?? "+91 90000 00000",
    buyerAddress: order.buyerAddress ?? "Address on file",
    sellerName: SELLER_INFO.name,
    sellerId: SELLER_INFO.code,
    sellerContact: SELLER_INFO.contact,
    buyerId: order.buyerCode ?? `BUYER-${order.id}`,
    channelOrderId: order.channelOrderId ?? `${order.marketplace ?? "ONDC"}-${order.id}`,
    paymentMode: order.paymentMode,
    orderValue: order.orderValue,
    products,
  };
}

// Rich hand-authored products array used only by DKN-2025-12345 —
// preserves the QPS slab snapshots so the QPS impact row renders.
const RICH_PRODUCTS_DKN_2025_12345: OrderProduct[] = [
  {
    // QPS-eligible line: SKU 180000008 has a 3-slab QPS scheme
    //   1–11 qty → ₹171/unit · 12–47 qty → 5% off (₹162.45) · 48+ qty → 10% off (₹153.90)
    // This order has 25 units → falls in Slab 2, 5% off.
    id: "1",
    name: "Freedom Refined Sunflower Oil 1L × 16",
    skuId: "180000008",
    orderedQuantity: 25,
    availableStock: 642,
    editableQuantity: 25,
    basePrice: 171,
    pricePerUnit: 162.45,
    editablePricePerUnit: 162.45,
    totalPrice: 4061.25,
    isModified: false,
    qps: {
      offerCode: "QPS-180000008",
      slabLabel: "Slab 2 · 12–47 qty",
      discountLabel: "5% off",
      savingPerUnit: 8.55,
      totalSaving: 213.75,
      slabs: [
        { minQty: 1, maxQty: 11, discountLabel: "—", pricePerUnit: 171 },
        { minQty: 12, maxQty: 47, discountLabel: "5% off", pricePerUnit: 162.45 },
        { minQty: 48, discountLabel: "10% off", pricePerUnit: 153.9 },
      ],
    },
  },
  {
    id: "1a",
    name: "Aashirvaad Atta 10kg",
    skuId: "SKU-AASH-10",
    orderedQuantity: 20,
    availableStock: 15,
    editableQuantity: 20,
    basePrice: 450,
    pricePerUnit: 420,
    editablePricePerUnit: 420,
    totalPrice: 8400,
    isModified: false,
    qps: {
      offerCode: "QPS-SKU-AASH-10",
      slabLabel: "Slab 2 · 10–24 qty",
      discountLabel: "6.67% off",
      savingPerUnit: 30,
      totalSaving: 600,
      slabs: [
        { minQty: 1, maxQty: 9, discountLabel: "—", pricePerUnit: 450 },
        { minQty: 10, maxQty: 24, discountLabel: "6.67% off", pricePerUnit: 420 },
        { minQty: 25, discountLabel: "11.11% off", pricePerUnit: 400 },
      ],
    },
  },
  {
    id: "2",
    name: "Sunfeast Biscuits Dark Fantasy 150g",
    skuId: "SKU-SUNF-DF150",
    orderedQuantity: 50,
    availableStock: 100,
    editableQuantity: 50,
    pricePerUnit: 35,
    editablePricePerUnit: 35,
    totalPrice: 1750,
    isModified: false,
  },
  {
    id: "3",
    name: "Classmate Notebook 172 Pages",
    skuId: "SKU-CLAS-NB172",
    orderedQuantity: 30,
    availableStock: 25,
    editableQuantity: 30,
    pricePerUnit: 45,
    editablePricePerUnit: 45,
    totalPrice: 1350,
    isModified: false,
  },
  {
    id: "4",
    name: "Bingo Mad Angles 90g",
    skuId: "SKU-BING-MA90",
    orderedQuantity: 40,
    availableStock: 80,
    editableQuantity: 40,
    pricePerUnit: 20,
    editablePricePerUnit: 20,
    totalPrice: 800,
    isModified: false,
  },
  {
    id: "5",
    name: "Yippee Noodles 240g",
    skuId: "SKU-YIPP-240",
    orderedQuantity: 25,
    availableStock: 10,
    editableQuantity: 25,
    pricePerUnit: 12,
    editablePricePerUnit: 12,
    totalPrice: 300,
    isModified: false,
  },
];

export function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  // Resolve the order from the shared store by URL :orderId. If
  // the ID isn't in the store (e.g. the seller hand-typed a URL
  // for a non-existent order), fall back to the rich mock so the
  // page still renders something useful instead of crashing.
  const initialOrder = orderId ? getOrderById(orderId) : undefined;
  const initialDetail = initialOrder
    ? buildOrderDetailFromStore(initialOrder)
    : buildOrderDetailFromStore({
        id: orderId ?? "DKN-2025-12345",
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
      });
  const [orderData, setOrderData] = useState<OrderDetails>(initialDetail);

  // Resync when the URL changes (clicking a different order in a
  // new tab, or back/forward) AND when the store fires a write
  // notification (bulk confirm/cancel/deliver from the list page).
  useEffect(() => {
    const refresh = () => {
      if (!orderId) return;
      const o = getOrderById(orderId);
      if (!o) return;
      setOrderData((prev) => ({
        ...buildOrderDetailFromStore(o),
        // Preserve in-flight product edits so a list write doesn't
        // clobber the seller's edit-mode changes mid-stream.
        products: prev.orderId === o.id ? prev.products : buildOrderDetailFromStore(o).products,
      }));
    };
    refresh();
    return subscribeToOrders(refresh);
  }, [orderId]);

  const [hasModifications, setHasModifications] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Out of Stock");
  const [cancelOtherReason, setCancelOtherReason] = useState("");
  // Modify mode — when true, the items table renders Qty and Price/Unit as
  // editable inputs and the seller can adjust them line-by-line. Available
  // only while the order is in New or Confirmed state.
  const [isEditMode, setIsEditMode] = useState(false);
  const canModify =
    orderData.status === "New" || orderData.status === "Confirmed";

  const getStatusBadge = (status: OrderDetails["status"]) => {
    switch (status) {
      case "New":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-base px-4 py-1">
            New Order
          </Badge>
        );
      case "Confirmed":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 text-base px-4 py-1">
            Confirmed
          </Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-base px-4 py-1">
            In Progress
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 text-base px-4 py-1">
            Cancelled
          </Badge>
        );
      case "Delivered":
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-base px-4 py-1">
            Delivered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getChannelBadge = (channel: OrderDetails["channel"]) => {
    return <Badge variant="secondary" className="text-sm">{channel}</Badge>;
  };

  // Recompute the row's totalPrice + isModified flag after any qty/price edit.
  const recalcLine = (product: OrderProduct, patch: Partial<OrderProduct>) => {
    const next = { ...product, ...patch };
    next.totalPrice = next.editableQuantity * next.editablePricePerUnit;
    next.isModified =
      next.editableQuantity !== next.orderedQuantity ||
      next.editablePricePerUnit !== next.pricePerUnit;
    return next;
  };

  const refreshHasModifications = (products: OrderProduct[]) => {
    setHasModifications(products.some((p) => p.isModified));
  };

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = Math.max(0, parseInt(newQuantity) || 0);
    setOrderData((prev) => {
      const products = prev.products.map((p) =>
        p.id === productId ? recalcLine(p, { editableQuantity: quantity }) : p,
      );
      refreshHasModifications(products);
      return { ...prev, products };
    });
  };

  const handlePriceChange = (productId: string, newPrice: string) => {
    // Allow decimals for price; clamp negatives to 0.
    const price = Math.max(0, parseFloat(newPrice) || 0);
    setOrderData((prev) => {
      const products = prev.products.map((p) =>
        p.id === productId ? recalcLine(p, { editablePricePerUnit: price }) : p,
      );
      refreshHasModifications(products);
      return { ...prev, products };
    });
  };

  const handleResetChanges = () => {
    setOrderData((prev) => ({
      ...prev,
      products: prev.products.map((product) => ({
        ...product,
        editableQuantity: product.orderedQuantity,
        editablePricePerUnit: product.pricePerUnit,
        totalPrice: product.orderedQuantity * product.pricePerUnit,
        isModified: false,
      })),
    }));
    setHasModifications(false);
    toast.info("Changes have been discarded");
  };

  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    handleResetChanges();
    setIsEditMode(false);
  };

  const handleUpdateOrder = () => {
    setIsUpdateModalOpen(true);
  };

  const handleConfirmUpdate = () => {
    setOrderData((prev) => ({
      ...prev,
      // Recalculate the order total from the persisted lines so the header
      // value stays in sync with whatever the seller just saved.
      orderValue: prev.products.reduce(
        (sum, p) => sum + p.editableQuantity * p.editablePricePerUnit,
        0,
      ),
      products: prev.products.map((product) => ({
        ...product,
        orderedQuantity: product.editableQuantity,
        pricePerUnit: product.editablePricePerUnit,
        isModified: false,
      })),
    }));
    setHasModifications(false);
    setIsUpdateModalOpen(false);
    setIsEditMode(false);
    toast.success("Order updated successfully!");
  };

  const handleConfirmOrder = () => {
    if (hasModifications) {
      toast.error("Please save your modifications before confirming the order");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    setOrderData((prev) => ({ ...prev, status: "Confirmed" }));
    // Write the new status back to the shared store so the list
    // page (and any other subscriber) sees the change.
    if (orderData.orderId) updateOrderStatus(orderData.orderId, "Confirmed");
    setIsConfirmModalOpen(false);
    toast.success("Order confirmed successfully!");
    setTimeout(() => {
      navigate("/orders");
    }, 1500);
  };

  const handleCancelOrder = () => {
    setIsCancelModalOpen(true);
  };

  const handleCancel = () => {
    const reason = cancelReason === "Other" ? cancelOtherReason : cancelReason;
    setOrderData((prev) => ({ ...prev, status: "Cancelled" }));
    if (orderData.orderId) updateOrderStatus(orderData.orderId, "Cancelled");
    setIsCancelModalOpen(false);
    toast.error(`Order cancelled. Reason: ${reason}`);
    setTimeout(() => {
      navigate("/orders");
    }, 1500);
  };

  // ---- Mark as Delivered (Confirmed → Delivered) ----
  // The Confirmed-status flow needs a follow-on "Mark as
  // Delivered" CTA. The detail page used to only handle New →
  // Confirmed; Phase 1 finishes the loop here.
  const handleMarkDelivered = () => {
    setIsDeliverModalOpen(true);
  };

  const handleConfirmDelivered = () => {
    setOrderData((prev) => ({ ...prev, status: "Delivered" }));
    if (orderData.orderId) updateOrderStatus(orderData.orderId, "Delivered");
    setIsDeliverModalOpen(false);
    toast.success("Order marked as delivered.");
    setTimeout(() => {
      navigate("/orders");
    }, 1500);
  };

  const calculateTotal = () => {
    return orderData.products.reduce((sum, product) => sum + product.totalPrice, 0);
  };

  // Stock-availability warnings are no longer shown — distributors don't
  // maintain real-time stock counts (they sell offline & on other channels),
  // so the order line treats the entered qty as authoritative.

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/orders")}
              className="gap-1.5 h-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  Order #{orderData.orderId}
                </h1>
                {getStatusBadge(orderData.status)}
                {getChannelBadge(orderData.channel)}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                <Calendar className="h-3 w-3" />
                {orderData.orderTime}
                <span className="mx-1">•</span>
                <span className="font-mono">{orderData.channelOrderId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
              {/* Modify / Save / Discard — visible when order is New or Confirmed */}
              {canModify && !isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 h-8"
                  onClick={handleEnterEditMode}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Modify Items
                </Button>
              )}
              {canModify && isEditMode && (
                <>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleCancelEdit}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={handleUpdateOrder}
                    disabled={!hasModifications}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Save Changes
                  </Button>
                </>
              )}
              {/* Status-aware CTAs.
                  New → Confirm Order + Cancel.
                  Confirmed → Mark as Delivered + Cancel.
                  Delivered / Cancelled → no destructive actions —
                  the order is past the seller's hand. */}
              {orderData.status === "New" && !isEditMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50 h-8"
                    onClick={handleCancelOrder}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 h-8"
                    onClick={handleConfirmOrder}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Confirm Order
                  </Button>
                </>
              )}
              {orderData.status === "Confirmed" && !isEditMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50 h-8"
                    onClick={handleCancelOrder}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 h-8"
                    onClick={handleMarkDelivered}
                  >
                    <Truck className="h-3.5 w-3.5 mr-1.5" />
                    Mark as Delivered
                  </Button>
                </>
              )}
            </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Buyer / Seller / Meta — compact 3-up grid */}
        <Card>
          <CardContent className="p-3 grid md:grid-cols-3 gap-3 text-sm">
            {/* Buyer */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Store className="h-3.5 w-3.5 text-blue-600" />
                Buyer
              </p>
              <p className="font-semibold text-gray-900">{orderData.buyerStoreName}</p>
              <p className="text-gray-700">{orderData.buyerOwnerName}</p>
              <p className="text-gray-700 flex items-center gap-1 text-xs">
                <Phone className="h-3 w-3 text-gray-400" />
                {orderData.buyerPhone}
              </p>
              <p className="text-gray-600 flex gap-1 text-xs leading-snug">
                <MapPin className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
                <span>{orderData.buyerAddress}</span>
              </p>
              <p className="text-[11px] text-gray-500 font-mono">{orderData.buyerId}</p>
            </div>
            {/* Seller */}
            <div className="space-y-1 md:border-l md:pl-3 md:border-gray-200">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-green-600" />
                Seller
              </p>
              <p className="font-semibold text-gray-900">{orderData.sellerName}</p>
              <p className="text-gray-700 flex items-center gap-1 text-xs">
                <Phone className="h-3 w-3 text-gray-400" />
                {orderData.sellerContact}
              </p>
              <p className="text-[11px] text-gray-500 font-mono">{orderData.sellerId}</p>
            </div>
            {/* Meta */}
            <div className="space-y-1 md:border-l md:pl-3 md:border-gray-200">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Hash className="h-3.5 w-3.5 text-gray-600" />
                Order Meta
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Payment</span>
                <span className="text-gray-900 font-medium">{orderData.paymentMode}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Channel Order ID</span>
                <span className="text-gray-900 font-mono">{orderData.channelOrderId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Original Value</span>
                <span className="text-gray-900 font-semibold">
                  ₹{orderData.orderValue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product List */}
        <Card>
          <CardHeader className="py-2 px-3 border-b border-gray-100">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-600" />
              Order Items ({orderData.products.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <div className="overflow-x-auto max-h-[55vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b sticky top-0 z-[5]">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                        Price/Unit
                      </th>
                      <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orderData.products.map((product) => (
                      <React.Fragment key={product.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                              {product.qps && (
                                <Badge
                                  className="bg-purple-50 text-purple-700 border-purple-200 gap-1 text-[10px] py-0"
                                  title="Quantity Pricing Scheme applied to this line item"
                                >
                                  <Layers className="h-2.5 w-2.5" />
                                  QPS
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-mono text-gray-600">{product.skuId}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isEditMode ? (
                              <div className="flex flex-col items-center gap-1">
                                <Input
                                  type="number"
                                  min={0}
                                  value={product.editableQuantity}
                                  onChange={(e) =>
                                    handleQuantityChange(product.id, e.target.value)
                                  }
                                  className={`w-20 h-8 text-center ${
                                    product.editableQuantity !== product.orderedQuantity
                                      ? "border-blue-400 ring-1 ring-blue-200"
                                      : ""
                                  }`}
                                />
                                {product.editableQuantity !== product.orderedQuantity && (
                                  <span className="text-[10px] text-gray-500">
                                    was {product.orderedQuantity}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="font-semibold text-gray-900">
                                {product.orderedQuantity}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isEditMode ? (
                              <div className="flex flex-col items-end gap-1">
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                                    ₹
                                  </span>
                                  <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={product.editablePricePerUnit}
                                    onChange={(e) =>
                                      handlePriceChange(product.id, e.target.value)
                                    }
                                    className={`w-28 h-8 pl-5 text-right ${
                                      product.editablePricePerUnit !== product.pricePerUnit
                                        ? "border-blue-400 ring-1 ring-blue-200"
                                        : ""
                                    }`}
                                  />
                                </div>
                                {product.editablePricePerUnit !== product.pricePerUnit && (
                                  <span className="text-[10px] text-gray-500">
                                    was ₹{product.pricePerUnit.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            ) : product.qps && product.basePrice ? (
                              <div>
                                <p className="text-[11px] text-gray-400 line-through">
                                  ₹{product.basePrice.toFixed(2)}
                                </p>
                                <p className="font-semibold text-green-700">
                                  ₹{product.pricePerUnit.toFixed(2)}
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-900">₹{product.pricePerUnit}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p
                              className={`font-semibold text-sm ${
                                product.isModified ? "text-blue-700" : "text-gray-900"
                              }`}
                            >
                              ₹
                              {product.totalPrice.toLocaleString("en-IN", {
                                minimumFractionDigits: product.totalPrice % 1 ? 2 : 0,
                              })}
                            </p>
                          </td>
                        </tr>
                        {product.qps && (
                          <QpsImpactRow
                            product={product}
                            isEditMode={isEditMode}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2">
                    {(() => {
                      const totalQpsSaving = orderData.products.reduce(
                        (sum, p) => sum + (p.qps?.totalSaving ?? 0),
                        0,
                      );
                      return (
                        <>
                          {totalQpsSaving > 0 && (
                            <tr className="bg-purple-50">
                              <td colSpan={4} className="px-4 py-3 text-right text-[11px] font-semibold text-purple-800">
                                Total QPS savings on this order
                              </td>
                              <td className="px-4 py-3 text-right text-xs font-bold text-purple-700">
                                −₹{totalQpsSaving.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold">
                              {isEditMode ? "Updated Order Value:" : "Total Order Value:"}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-base text-green-600">
                              ₹
                              {(isEditMode
                                ? calculateTotal()
                                : orderData.orderValue
                              ).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        </>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Order Confirmation Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Save Changes</DialogTitle>
            <DialogDescription>
              You have modified the following line items. Review and confirm to apply.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg max-h-80 overflow-y-auto divide-y divide-gray-200">
                {orderData.products
                  .filter((p) => p.isModified)
                  .map((product) => {
                    const qtyChanged =
                      product.editableQuantity !== product.orderedQuantity;
                    const priceChanged =
                      product.editablePricePerUnit !== product.pricePerUnit;

                    // Recompute slab impact for QPS-eligible lines so the seller sees
                    // exactly how the modification affects discount tier and saving.
                    const slabs = product.qps?.slabs;
                    const hasSlabs = !!slabs && slabs.length > 0;
                    const origIdx = hasSlabs ? findSlabIdx(product.orderedQuantity, slabs!) : -1;
                    const newIdx = hasSlabs ? findSlabIdx(product.editableQuantity, slabs!) : -1;
                    const slabChanged = hasSlabs && origIdx !== newIdx;
                    const origSlab = origIdx >= 0 ? slabs![origIdx] : null;
                    const newSlab = newIdx >= 0 ? slabs![newIdx] : null;
                    const base = product.basePrice ?? 0;
                    const origSaving = product.qps?.totalSaving ?? 0;
                    const newSavingPerUnit =
                      newSlab && base ? Math.max(0, base - newSlab.pricePerUnit) : 0;
                    const newSaving = newSavingPerUnit * product.editableQuantity;
                    const savingDelta = +(newSaving - origSaving).toFixed(2);
                    const direction =
                      !slabChanged
                        ? "unchanged"
                        : newIdx > origIdx
                          ? "upgraded"
                          : "downgraded";

                    return (
                      <div key={product.id} className="py-2 first:pt-0 last:pb-0">
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-1">
                          {qtyChanged && (
                            <span className="text-gray-700">
                              Qty:&nbsp;
                              <span className="text-gray-400 line-through">
                                {product.orderedQuantity}
                              </span>
                              &nbsp;→&nbsp;
                              <span className="font-semibold text-blue-700">
                                {product.editableQuantity}
                              </span>
                            </span>
                          )}
                          {priceChanged && (
                            <span className="text-gray-700">
                              Price:&nbsp;
                              <span className="text-gray-400 line-through">
                                ₹{product.pricePerUnit.toFixed(2)}
                              </span>
                              &nbsp;→&nbsp;
                              <span className="font-semibold text-blue-700">
                                ₹{product.editablePricePerUnit.toFixed(2)}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* QPS slab-change indicator — only when slab actually moved */}
                        {slabChanged && (
                          <div
                            className={`mt-1.5 rounded-md border text-[11px] px-2 py-1.5 ${
                              direction === "upgraded"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                : "bg-red-50 border-red-200 text-red-900"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Layers
                                className={`h-3 w-3 ${
                                  direction === "upgraded"
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                }`}
                              />
                              <span className="font-semibold">
                                {direction === "upgraded"
                                  ? "QPS slab upgraded"
                                  : "QPS slab dropped"}
                              </span>
                              <span className="opacity-80">·</span>
                              <span>
                                <span className="line-through opacity-60">
                                  {product.qps?.slabLabel ?? "—"} ({product.qps?.discountLabel})
                                </span>
                                &nbsp;→&nbsp;
                                <b>
                                  {newSlab
                                    ? `${slabLabelFor(newIdx, newSlab)} (${newSlab.discountLabel})`
                                    : "Below lowest slab — no QPS price"}
                                </b>
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px]">
                              <span>
                                Saving on this line:&nbsp;
                                <span className="line-through opacity-60">
                                  ₹{origSaving.toFixed(2)}
                                </span>
                                &nbsp;→&nbsp;
                                <b>₹{newSaving.toFixed(2)}</b>
                              </span>
                              <Badge
                                className={`text-[10px] gap-1 border ${
                                  direction === "upgraded"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}
                              >
                                {savingDelta >= 0 ? "+" : "−"}₹
                                {Math.abs(savingDelta).toFixed(2)}{" "}
                                {direction === "upgraded"
                                  ? "extra saving"
                                  : "less saving"}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Aggregate QPS saving impact across the whole modification */}
              {(() => {
                const totals = orderData.products
                  .filter((p) => p.isModified && p.qps?.slabs && p.qps.slabs.length > 0)
                  .reduce(
                    (acc, p) => {
                      const slabs = p.qps!.slabs!;
                      const origIdx = findSlabIdx(p.orderedQuantity, slabs);
                      const newIdx = findSlabIdx(p.editableQuantity, slabs);
                      if (origIdx === newIdx) return acc;
                      const newSlab = newIdx >= 0 ? slabs[newIdx] : null;
                      const base = p.basePrice ?? 0;
                      const newSavingPerUnit = newSlab && base ? Math.max(0, base - newSlab.pricePerUnit) : 0;
                      const newSaving = newSavingPerUnit * p.editableQuantity;
                      acc.origSaving += p.qps!.totalSaving;
                      acc.newSaving += newSaving;
                      acc.lines += 1;
                      return acc;
                    },
                    { origSaving: 0, newSaving: 0, lines: 0 },
                  );
                const delta = +(totals.newSaving - totals.origSaving).toFixed(2);
                if (totals.lines === 0) return null;
                return (
                  <div
                    className={`rounded-md border px-3 py-2 text-xs flex items-center justify-between gap-2 ${
                      delta >= 0
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-red-50 border-red-200 text-red-900"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers
                        className={`h-3.5 w-3.5 ${
                          delta >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      />
                      <b>QPS impact across {totals.lines} line{totals.lines === 1 ? "" : "s"}:</b>{" "}
                      saving ₹{totals.origSaving.toFixed(2)} → ₹{totals.newSaving.toFixed(2)}
                    </span>
                    <Badge
                      className={`text-[10px] border ${
                        delta >= 0
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {delta >= 0 ? "+" : "−"}₹{Math.abs(delta).toFixed(2)}{" "}
                      {delta >= 0 ? "extra" : "lost"}
                    </Badge>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-gray-700">Updated Total:</span>
                <span className="font-bold text-green-600 text-lg">
                  ₹
                  {calculateTotal().toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
              Back
            </Button>
            <Button onClick={handleConfirmUpdate} className="">
              Confirm &amp; Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Order Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Confirm Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this order?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Order ID:</strong> {orderData.orderId}
              </p>
              <p className="text-sm">
                <strong>Buyer:</strong> {orderData.buyerStoreName}
              </p>
              <p className="text-sm">
                <strong>Total Items:</strong> {orderData.products.length}
              </p>
              <p className="text-sm">
                <strong>Order Value:</strong> ₹{calculateTotal().toFixed(2)}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              After confirmation, the buyer will be notified and you can proceed with fulfillment.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
              Yes, Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Cancellation Reason</Label>
              <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Out of Stock" id="c1" />
                  <Label htmlFor="c1" className="font-normal cursor-pointer">
                    Out of Stock
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Delivery Issue" id="c2" />
                  <Label htmlFor="c2" className="font-normal cursor-pointer">
                    Delivery Issue
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pricing Error" id="c3" />
                  <Label htmlFor="c3" className="font-normal cursor-pointer">
                    Pricing Error
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="c4" />
                  <Label htmlFor="c4" className="font-normal cursor-pointer">
                    Other
                  </Label>
                </div>
              </RadioGroup>
              {cancelReason === "Other" && (
                <div className="mt-2">
                  <Textarea
                    placeholder="Please specify the reason..."
                    rows={3}
                    value={cancelOtherReason}
                    onChange={(e) => setCancelOtherReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={
                !cancelReason ||
                (cancelReason === "Other" && !cancelOtherReason.trim())
              }
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Delivered Modal — confirmation step for the
          Confirmed → Delivered transition. */}
      <Dialog open={isDeliverModalOpen} onOpenChange={setIsDeliverModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              Mark as Delivered
            </DialogTitle>
            <DialogDescription>
              Confirm that Order #{orderData.orderId} has been delivered to{" "}
              {orderData.buyerStoreName}. This action moves the order to the
              Delivered tab and can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeliverModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelivered}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Truck className="h-4 w-4 mr-1.5" />
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- QPS impact row ----------
// Read-only banner shown directly under each QPS-eligible line item.
// Two pieces:
//   1. The compact one-liner naming the active slab + line saving —
//      always visible.
//   2. The full QPS schedule (Slab / Qty range / Discount /
//      Price-per-unit) — only visible while the seller is in Modify
//      Items mode. Before that, surfacing every slab tier is noise;
//      the seller already sees which slab applies via the one-liner
//      and the highlighted active row in the schedule once they
//      open it. The currently-applied slab is softly highlighted.
//
// Edit-mode affordances that USED to live here (Was → Now diff,
// Slab dropped / upgraded chips, "Apply slab price" CTA) are
// intentionally absent — they surface inside the Save Changes popup
// once the seller commits. The "Active" column was also dropped
// from the table; the row highlight communicates the same thing.
function QpsImpactRow({
  product,
  isEditMode,
}: {
  product: OrderProduct;
  isEditMode: boolean;
}) {
  const qps = product.qps!;
  const base = product.basePrice ?? 0;
  const slabs = qps.slabs;
  const activeIdx = slabs ? findSlabIdx(product.orderedQuantity, slabs) : -1;

  return (
    <tr className="bg-purple-50/40">
      <td colSpan={5} className="px-4 py-3">
        <div className="space-y-2">
          {/* Compact one-liner */}
          <div className="flex items-center gap-2 text-[11px] text-purple-900 flex-wrap">
            <Layers className="h-3 w-3 text-purple-600 shrink-0" />
            <span>
              <b>{qps.slabLabel}</b> · {qps.discountLabel}
              {base > 0 && <> vs ₹{base.toFixed(2)}</>}
            </span>
            <span className="text-purple-700 inline-flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              saved <b>₹{qps.totalSaving.toFixed(2)}</b>
            </span>
            {/* Offer Code lives here, on the same line as the slab +
                discount + saving summary — keeps the trace next to
                the offer details rather than under the product name. */}
            {qps.offerCode && (
              <span className="text-purple-800 font-mono">
                · Offer: <b>{qps.offerCode}</b>
              </span>
            )}
          </div>

          {/* Full slab schedule — only when the seller is in Modify
              Items mode. Before that, the one-liner above is enough. */}
          {isEditMode && slabs && slabs.length > 0 && (
            <div className="bg-white border border-purple-200 rounded overflow-hidden">
              <table className="w-full text-[11px]">
                <thead className="bg-purple-50 text-purple-800">
                  <tr>
                    <th className="text-left px-2 py-1 font-semibold">Slab</th>
                    <th className="text-left px-2 py-1 font-semibold">
                      Qty range
                    </th>
                    <th className="text-left px-2 py-1 font-semibold">
                      Discount
                    </th>
                    <th className="text-right px-2 py-1 font-semibold">
                      Price / unit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {slabs.map((s, i) => {
                    const isActive = i === activeIdx;
                    return (
                      <tr
                        key={i}
                        className={
                          isActive
                            ? "bg-purple-50/70 font-medium"
                            : "bg-white"
                        }
                      >
                        <td className="px-2 py-1.5 text-gray-900">
                          Slab {i + 1}
                        </td>
                        <td className="px-2 py-1.5 text-gray-700">
                          {s.maxQty
                            ? `${s.minQty}–${s.maxQty}`
                            : `${s.minQty}+`}
                        </td>
                        <td className="px-2 py-1.5 text-gray-700">
                          {s.discountLabel}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono text-gray-900">
                          ₹{s.pricePerUnit.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

