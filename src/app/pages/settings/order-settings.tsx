import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  ArrowLeft,
  Save,
  ShoppingCart,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export function OrderSettings() {
  const navigate = useNavigate();

  // ---- Minimum / Maximum Order Value ----
  const [minOrderAmount, setMinOrderAmount] = useState("1000");
  const [maxOrderAmount, setMaxOrderAmount] = useState("500000");
  const [savedOrderValue, setSavedOrderValue] = useState({
    min: "1000",
    max: "500000",
  });
  const isOrderValueDirty =
    minOrderAmount !== savedOrderValue.min ||
    maxOrderAmount !== savedOrderValue.max;

  // ---- Order Processing ----
  const [processingTime, setProcessingTime] = useState("24");
  const [cancellationWindow, setCancellationWindow] = useState("2");
  const [savedProcessing, setSavedProcessing] = useState({
    processingTime: "24",
    cancellationWindow: "2",
  });
  const isProcessingDirty =
    processingTime !== savedProcessing.processingTime ||
    cancellationWindow !== savedProcessing.cancellationWindow;

  // ---- Order Return ----
  // Allow Returns flips through a confirmation dialog (both directions
  // get a popup). Return Window is required when returns are enabled.
  const [returnsEnabled, setReturnsEnabled] = useState(true);
  const [returnWindow, setReturnWindow] = useState("24");
  const [pendingReturnsToggle, setPendingReturnsToggle] = useState<boolean | null>(null);
  const [savedReturns, setSavedReturns] = useState({
    enabled: true,
    window: "24",
  });
  const [returnWindowError, setReturnWindowError] = useState<string | null>(null);
  const isReturnsDirty =
    returnsEnabled !== savedReturns.enabled ||
    returnWindow !== savedReturns.window;

  // ---- Section save handlers ----
  const handleSaveOrderValue = () => {
    const min = parseFloat(minOrderAmount);
    const max = parseFloat(maxOrderAmount);
    if (isNaN(min) || min < 0) {
      toast.error("Minimum order amount must be a non-negative number");
      return;
    }
    if (maxOrderAmount.trim() !== "" && (isNaN(max) || max <= min)) {
      toast.error("Maximum order amount must be greater than the minimum");
      return;
    }
    setSavedOrderValue({ min: minOrderAmount, max: maxOrderAmount });
    toast.success("Order value saved.");
  };

  const handleSaveProcessing = () => {
    setSavedProcessing({ processingTime, cancellationWindow });
    toast.success("Order processing saved.");
  };

  const handleSaveReturns = () => {
    if (returnsEnabled && !returnWindow) {
      setReturnWindowError("Please select a return window");
      return;
    }
    setReturnWindowError(null);
    setSavedReturns({ enabled: returnsEnabled, window: returnWindow });
    toast.success("Order return saved.");
  };

  return (
    <div className="p-4 space-y-3 bg-gray-50 min-h-full">
      {/* Compact header — single line, no page-level save (each section
          owns its own). */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/settings")}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-purple-600" />
          Order Settings
        </h1>
      </div>

      <div className="max-w-5xl space-y-3">
        {/* Row 1: Order Value + Processing side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Order Value — Min + Max */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-emerald-600" />
                  Order Value
                </CardTitle>
                <Button
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={handleSaveOrderValue}
                  disabled={!isOrderValueDirty}
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Minimum (₹)</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="h-8 text-sm"
                />
                <p className="text-[11px] text-gray-500">
                  Orders below this aren't accepted.
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Maximum (₹)</Label>
                <Input
                  type="number"
                  placeholder="500000"
                  value={maxOrderAmount}
                  onChange={(e) => setMaxOrderAmount(e.target.value)}
                  className="h-8 text-sm"
                />
                <p className="text-[11px] text-gray-500">
                  Optional cap per order.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Processing — Default Processing Time + Cancellation Window */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Order Processing
                </CardTitle>
                <Button
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={handleSaveProcessing}
                  disabled={!isProcessingDirty}
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Processing Time</Label>
                <Select value={processingTime} onValueChange={setProcessingTime}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-gray-500">
                  Time to prepare orders for shipment.
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cancellation Window</Label>
                <Select value={cancellationWindow} onValueChange={setCancellationWindow}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-gray-500">
                  Customer's cancellation window after placing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Return — Allow toggle (with popup) + Return Type (RO) +
            Return Window (required) */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-purple-600" />
                Order Return
              </CardTitle>
              <Button
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handleSaveReturns}
                disabled={!isReturnsDirty}
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-start justify-between gap-3 border border-gray-200 rounded-md p-2.5 bg-gray-50/50">
              <div>
                <Label className="text-sm">Allow Returns</Label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Let buyers raise return requests on delivered orders.
                </p>
              </div>
              <Switch
                checked={returnsEnabled}
                // Confirm-on-flip in both directions so the seller is
                // aware before changing the buyer-facing return policy.
                onCheckedChange={(v) => setPendingReturnsToggle(v)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Return Type</Label>
                <Select value="full-order" disabled>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-order">Full Order Return Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-gray-500">
                  Phase 1: full-order returns only.
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Return Window <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={returnWindow}
                  onValueChange={(v) => {
                    setReturnWindow(v);
                    if (returnWindowError) setReturnWindowError(null);
                  }}
                  disabled={!returnsEnabled}
                >
                  <SelectTrigger
                    className="h-8 text-sm"
                    aria-invalid={!!returnWindowError}
                  >
                    <SelectValue placeholder="Choose a window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                  </SelectContent>
                </Select>
                {returnWindowError ? (
                  <p className="text-[11px] text-red-600">{returnWindowError}</p>
                ) : (
                  <p className="text-[11px] text-gray-500">
                    Time from delivery to raise a return.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allow Returns confirmation — both directions */}
      <Dialog
        open={pendingReturnsToggle !== null}
        onOpenChange={(o) => !o && setPendingReturnsToggle(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingReturnsToggle ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              )}
              {pendingReturnsToggle
                ? "Allow buyers to raise returns?"
                : "Stop accepting return requests?"}
            </DialogTitle>
            <DialogDescription>
              {pendingReturnsToggle
                ? "Buyers will be able to raise full-order return requests within the configured Return Window. Existing approved returns are unaffected."
                : "Buyers will no longer see a Return option on delivered orders. In-flight return requests already submitted continue through their normal flow."}
            </DialogDescription>
          </DialogHeader>
          <div
            className={
              pendingReturnsToggle
                ? "bg-emerald-50 border border-emerald-200 rounded-md p-3 text-xs text-emerald-900"
                : "bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-900"
            }
          >
            {pendingReturnsToggle ? (
              <>
                Make sure your Return Window is set before saving — it's
                mandatory for returns to work end-to-end.
              </>
            ) : (
              <>
                <b>Heads up:</b> the change takes effect after you click
                Save on this section. Buyers will see returns disabled
                across all delivered orders.
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingReturnsToggle(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingReturnsToggle === null) return;
                setReturnsEnabled(pendingReturnsToggle);
                if (!pendingReturnsToggle) {
                  setReturnWindowError(null);
                }
                setPendingReturnsToggle(null);
              }}
              className={
                pendingReturnsToggle
                  ? ""
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }
            >
              {pendingReturnsToggle ? "Yes, allow returns" : "Yes, disable returns"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
