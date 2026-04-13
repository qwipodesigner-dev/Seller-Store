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
import { ArrowLeft, Save, Truck, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ShippingSettings() {
  const navigate = useNavigate();
  const [freeShipping, setFreeShipping] = useState(true);
  const [codAvailable, setCodAvailable] = useState(true);

  const handleSave = () => {
    toast.success("Shipping settings saved successfully!");
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
            <Truck className="h-8 w-8 text-amber-600" />
            Shipping Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Set delivery charges and shipping rules
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Delivery Charges */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Free Shipping</Label>
                <p className="text-sm text-gray-600">
                  Enable free shipping for all orders
                </p>
              </div>
              <Switch checked={freeShipping} onCheckedChange={setFreeShipping} />
            </div>

            {!freeShipping && (
              <>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label>Base Shipping Charge (₹)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      defaultValue="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Free Shipping Above (₹)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      defaultValue="999"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Per KM Charge (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Enter per km charge"
                    defaultValue="5"
                  />
                  <p className="text-xs text-gray-500">
                    Additional charge per kilometer for long-distance delivery
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Shipping Zones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Shipping Zones</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Zone
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium">Zone A - Local</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Within 25 KM • ₹30 base charge
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pincodes: 400001-400100
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium">Zone B - Regional</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    25-100 KM • ₹80 base charge
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pincodes: 400101-420000
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium">Zone C - State-wide</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    100+ KM • ₹150 base charge
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pincodes: 420001-450000
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Time */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Standard Delivery (days)</Label>
                <Select defaultValue="3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1-2 days</SelectItem>
                    <SelectItem value="3">3-5 days</SelectItem>
                    <SelectItem value="7">7-10 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Express Delivery (days)</Label>
                <Select defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Same day</SelectItem>
                    <SelectItem value="1">Next day</SelectItem>
                    <SelectItem value="2">2 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Express Delivery Charge (₹)</Label>
              <Input
                type="number"
                placeholder="Additional charge"
                defaultValue="100"
              />
              <p className="text-xs text-gray-500">
                Additional charge for express delivery
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cash on Delivery */}
        <Card>
          <CardHeader>
            <CardTitle>Cash on Delivery (COD)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable COD</Label>
                <p className="text-sm text-gray-600">
                  Allow customers to pay on delivery
                </p>
              </div>
              <Switch checked={codAvailable} onCheckedChange={setCodAvailable} />
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