import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { ArrowLeft, Save, Store, Calendar } from "lucide-react";
import { toast } from "sonner";

export function StoreSettings() {
  const navigate = useNavigate();
  const [storeActive, setStoreActive] = useState(true);
  const [acceptOrders, setAcceptOrders] = useState(true);

  const handleSave = () => {
    toast.success("Store settings saved successfully!");
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
            <Store className="h-8 w-8 text-blue-600" />
            Store Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage holidays and store availability
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Store Status */}
        <Card>
          <CardHeader>
            <CardTitle>Store Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Store Active</Label>
                <p className="text-sm text-gray-600">
                  Enable or disable your store
                </p>
              </div>
              <Switch checked={storeActive} onCheckedChange={setStoreActive} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Accept Orders</Label>
                <p className="text-sm text-gray-600">
                  Start or stop accepting new orders
                </p>
              </div>
              <Switch
                checked={acceptOrders}
                onCheckedChange={setAcceptOrders}
              />
            </div>
          </CardContent>
        </Card>

        {/* Holidays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Holiday Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Holi</p>
                  <p className="text-sm text-gray-600">March 25, 2026</p>
                </div>
                <Button variant="outline" size="sm">
                  Remove
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Independence Day</p>
                  <p className="text-sm text-gray-600">August 15, 2026</p>
                </div>
                <Button variant="outline" size="sm">
                  Remove
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Diwali</p>
                  <p className="text-sm text-gray-600">October 21, 2026</p>
                </div>
                <Button variant="outline" size="sm">
                  Remove
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              + Add Holiday
            </Button>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input
                placeholder="Enter store name"
                defaultValue="ABC Distributors"
              />
            </div>
            <div className="space-y-2">
              <Label>Store Description</Label>
              <Input
                placeholder="Brief description of your store"
                defaultValue="Premium FMCG distributor serving Maharashtra"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  placeholder="+91 98765 43210"
                  defaultValue="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="store@example.com"
                  defaultValue="abc@distributors.com"
                />
              </div>
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
