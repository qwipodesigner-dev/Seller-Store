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
import { ArrowLeft, Save, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export function OrderSettings() {
  const navigate = useNavigate();
  const [autoAcceptDMS, setAutoAcceptDMS] = useState(true);
  const [autoAcceptONDC, setAutoAcceptONDC] = useState(false);
  const [allowCancellation, setAllowCancellation] = useState(true);

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
            Configure minimum order values and order rules
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

        {/* Order Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Order Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Accept Orders from DMS</Label>
                <p className="text-sm text-gray-600">
                  Automatically accept orders originating from the DMS (Bizom) without manual approval
                </p>
              </div>
              <Switch
                checked={autoAcceptDMS}
                onCheckedChange={setAutoAcceptDMS}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Accept Orders from ONDC</Label>
                <p className="text-sm text-gray-600">
                  Automatically accept orders from the ONDC marketplace network without manual approval
                </p>
              </div>
              <Switch
                checked={autoAcceptONDC}
                onCheckedChange={setAutoAcceptONDC}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Allow Customer Cancellation</Label>
                <p className="text-sm text-gray-600">
                  Customers can cancel orders before processing
                </p>
              </div>
              <Switch
                checked={allowCancellation}
                onCheckedChange={setAllowCancellation}
              />
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