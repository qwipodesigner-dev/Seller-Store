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
import { ArrowLeft, Save, ShoppingCart, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function OrderSettings() {
  const navigate = useNavigate();
  const [returnsEnabled, setReturnsEnabled] = useState(true);
  const [returnWindow, setReturnWindow] = useState("24");

  const handleSave = () => {
    toast.success("Order settings saved successfully!");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/settings")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-purple-600" />
            Order Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure minimum order values and order processing
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Minimum Order Value */}
        <Card>
          <CardHeader>
            <CardTitle>Minimum Order Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Order Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  defaultValue="1000"
                />
                <p className="text-xs text-gray-500">
                  Orders below this amount will not be accepted
                </p>
              </div>
              <div className="space-y-2">
                <Label>Maximum Order Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  defaultValue="500000"
                />
                <p className="text-xs text-gray-500">
                  Optional limit for single orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Processing */}
        <Card>
          <CardHeader>
            <CardTitle>Order Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Processing Time (hours)</Label>
              <Select defaultValue="24">
                <SelectTrigger>
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
              <p className="text-xs text-gray-500">
                Time taken to process and prepare orders for shipment
              </p>
            </div>
            <div className="space-y-2">
              <Label>Order Cancellation Window (hours)</Label>
              <Select defaultValue="2">
                <SelectTrigger>
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
              <p className="text-xs text-gray-500">
                Time window for customers to cancel orders
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Return — Phase 1: full-order return only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-purple-600" />
              Order Return
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Allow Returns</Label>
                <p className="text-sm text-gray-600">
                  Let buyers raise return requests for delivered orders
                </p>
              </div>
              <Switch checked={returnsEnabled} onCheckedChange={setReturnsEnabled} />
            </div>

            {/* Return Type — phase 1 only supports full-order return */}
            <div className="space-y-2">
              <Label>Return Type</Label>
              <Select value="full-order" disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-order">Full Order Return Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                <b>Phase 1:</b> only full-order returns are supported. Partial /
                line-item returns will be enabled in a later phase.
              </p>
            </div>

            {/* Return Window — 24h or 48h */}
            <div className="space-y-2">
              <Label>Return Window</Label>
              <Select
                value={returnWindow}
                onValueChange={setReturnWindow}
                disabled={!returnsEnabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Time window from delivery within which the buyer can request a
                full-order return.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate("/settings")}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}