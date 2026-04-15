import { useState, useEffect } from "react";
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
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  RotateCcw,
  Calendar,
  CreditCard,
  Hash,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface OrderProduct {
  id: string;
  name: string;
  skuId: string;
  orderedQuantity: number;
  availableStock: number;
  editableQuantity: number;
  pricePerUnit: number;
  totalPrice: number;
  isModified: boolean;
}

interface OrderDetails {
  orderId: string;
  status: "New" | "Confirmed" | "In Progress" | "Rejected" | "Delivered";
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

const mockOrderData: OrderDetails = {
  orderId: "DKN-2025-12345",
  status: "New",
  orderTime: "2026-03-30 10:30 AM",
  channel: "ONDC",
  buyerStoreName: "Balaji Kirana Store",
  buyerOwnerName: "Ramesh Balaji",
  buyerPhone: "+91 98765 43210",
  buyerAddress: "Shop No. 12, MG Road, Koramangala, Bangalore, Karnataka - 560034",
  sellerName: "ITC Private Limited",
  sellerId: "SELLER-ITC-001",
  sellerContact: "+91 80 2222 3333",
  buyerId: "BUYER-BAL-456",
  channelOrderId: "ONDC-ORD-789456",
  paymentMode: "COD",
  orderValue: 12450.00,
  products: [
    {
      id: "1",
      name: "Aashirvaad Atta 10kg",
      skuId: "SKU-AASH-10",
      orderedQuantity: 20,
      availableStock: 15,
      editableQuantity: 20,
      pricePerUnit: 420,
      totalPrice: 8400,
      isModified: false,
    },
    {
      id: "2",
      name: "Sunfeast Biscuits Dark Fantasy 150g",
      skuId: "SKU-SUNF-DF150",
      orderedQuantity: 50,
      availableStock: 100,
      editableQuantity: 50,
      pricePerUnit: 35,
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
      totalPrice: 300,
      isModified: false,
    },
  ],
};

export function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderDetails>(mockOrderData);
  const [hasModifications, setHasModifications] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Out of Stock");
  const [cancelOtherReason, setCancelOtherReason] = useState("");

  const getStatusBadge = (status: OrderDetails["status"]) => {
    switch (status) {
      case "New":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-base px-4 py-1">
            New Order
          </Badge>
        );
      case "Confirmed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300 text-base px-4 py-1">
            Confirmed
          </Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-base px-4 py-1">
            In Progress
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300 text-base px-4 py-1">
            Rejected
          </Badge>
        );
      case "Delivered":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-base px-4 py-1">
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

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity) || 0;
    
    setOrderData((prev) => ({
      ...prev,
      products: prev.products.map((product) => {
        if (product.id === productId) {
          const isModified = quantity !== product.orderedQuantity;
          return {
            ...product,
            editableQuantity: quantity,
            totalPrice: quantity * product.pricePerUnit,
            isModified,
          };
        }
        return product;
      }),
    }));

    // Check if any product is modified
    const anyModified = orderData.products.some(
      (p) => p.id === productId ? quantity !== p.orderedQuantity : p.isModified
    );
    setHasModifications(anyModified);
  };

  const handleResetChanges = () => {
    setOrderData((prev) => ({
      ...prev,
      products: prev.products.map((product) => ({
        ...product,
        editableQuantity: product.orderedQuantity,
        totalPrice: product.orderedQuantity * product.pricePerUnit,
        isModified: false,
      })),
    }));
    setHasModifications(false);
    toast.info("Changes have been reset");
  };

  const handleUpdateOrder = () => {
    // Validate stock availability
    const invalidProducts = orderData.products.filter(
      (p) => p.editableQuantity > p.availableStock
    );

    if (invalidProducts.length > 0) {
      toast.error("Some quantities exceed available stock. Please adjust.");
      return;
    }

    setIsUpdateModalOpen(true);
  };

  const handleConfirmUpdate = () => {
    setOrderData((prev) => ({
      ...prev,
      products: prev.products.map((product) => ({
        ...product,
        orderedQuantity: product.editableQuantity,
        isModified: false,
      })),
    }));
    setHasModifications(false);
    setIsUpdateModalOpen(false);
    toast.success("Order updated successfully!");
  };

  const handleConfirmOrder = () => {
    if (hasModifications) {
      toast.error("Please save your modifications before confirming the order");
      return;
    }

    // Validate stock availability
    const invalidProducts = orderData.products.filter(
      (p) => p.editableQuantity > p.availableStock
    );

    if (invalidProducts.length > 0) {
      toast.error("Cannot confirm order. Some quantities exceed available stock.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    setOrderData((prev) => ({ ...prev, status: "Confirmed" }));
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
    setOrderData((prev) => ({ ...prev, status: "Rejected" }));
    setIsCancelModalOpen(false);
    toast.error(`Order cancelled. Reason: ${reason}`);
    setTimeout(() => {
      navigate("/orders");
    }, 1500);
  };

  const calculateTotal = () => {
    return orderData.products.reduce((sum, product) => sum + product.totalPrice, 0);
  };

  const getStockWarning = (product: OrderProduct) => {
    if (product.editableQuantity > product.availableStock) {
      return (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <AlertTriangle className="h-3 w-3" />
          Exceeds available stock!
        </p>
      );
    }
    if (product.availableStock < product.orderedQuantity) {
      return (
        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
          <AlertTriangle className="h-3 w-3" />
          Only {product.availableStock} units available
        </p>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/orders")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
            <div className="flex items-center gap-3">
              {orderData.status === "New" && (
                <>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={handleCancelOrder}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleConfirmOrder}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm Order
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{orderData.orderId}
                </h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {orderData.orderTime}
                  </span>
                  <span>•</span>
                  {getChannelBadge(orderData.channel)}
                </div>
              </div>
            </div>
            {getStatusBadge(orderData.status)}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Buyer & Seller Information */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Buyer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                Buyer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-gray-600 text-xs">Store Name</Label>
                <p className="font-semibold text-gray-900">{orderData.buyerStoreName}</p>
              </div>
              <div>
                <Label className="text-gray-600 text-xs">Owner Name</Label>
                <p className="text-gray-900">{orderData.buyerOwnerName}</p>
              </div>
              <div>
                <Label className="text-gray-600 text-xs">Phone Number</Label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  {orderData.buyerPhone}
                </p>
              </div>
              <div>
                <Label className="text-gray-600 text-xs">Delivery Address</Label>
                <p className="text-gray-900 flex gap-1">
                  <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{orderData.buyerAddress}</span>
                </p>
              </div>
              <div>
                <Label className="text-gray-600 text-xs">Buyer ID</Label>
                <p className="text-gray-900 font-mono text-sm">{orderData.buyerId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Seller Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Seller Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-gray-600 text-xs">Seller Name</Label>
                <p className="font-semibold text-gray-900">{orderData.sellerName}</p>
              </div>
              <div>
                <Label className="text-gray-600 text-xs">Seller ID</Label>
                <p className="text-gray-900 font-mono text-sm">{orderData.sellerId}</p>
              </div>
              <div>
                <Label className="text-gray-600 text-xs">Contact Info</Label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  {orderData.sellerContact}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Meta Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-gray-600" />
              Order Meta Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-600 text-xs">Channel Order ID</Label>
                <p className="font-mono text-sm text-gray-900">{orderData.channelOrderId}</p>
              </div>
              <div>
                <Label className="text-gray-600 text-xs">Original Order Value</Label>
                <p className="font-semibold text-gray-900">
                  ₹{orderData.orderValue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product List — read-only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Order Items ({orderData.products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0 z-[5]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        SKU ID
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Price/Unit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Total Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderData.products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">{product.name}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-mono text-gray-600">{product.skuId}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <p className="font-semibold text-gray-900">{product.orderedQuantity}</p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="text-gray-900">₹{product.pricePerUnit}</p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-semibold text-gray-900">₹{product.totalPrice}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2">
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-right font-semibold">
                        Total Order Value:
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-lg text-green-600">
                        ₹{orderData.orderValue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Order Confirmation Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>
            <DialogDescription>
              You have modified the quantities for this order
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-700 font-medium">Modified Items:</p>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                {orderData.products
                  .filter((p) => p.isModified)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between text-sm"
                    >
                      <span>{product.name}</span>
                      <span className="font-semibold">
                        {product.orderedQuantity} → {product.editableQuantity}
                      </span>
                    </div>
                  ))}
              </div>
              <p className="text-sm text-gray-700 mt-4">
                New Total: <span className="font-bold text-green-600">₹{calculateTotal().toFixed(2)}</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpdate} className="bg-blue-600 hover:bg-blue-700">
              Confirm Changes
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
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
