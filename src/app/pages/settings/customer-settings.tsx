import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { ArrowLeft, Users, CheckCircle2, Clock, Info } from "lucide-react";
import { toast } from "sonner";

export function CustomerSettings() {
  const navigate = useNavigate();
  const [autoApproveCustomers, setAutoApproveCustomers] = useState(false);

  const handleSave = () => {
    toast.success("Customer settings saved successfully!");
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-full">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/settings")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="mt-6 space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            Customer Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure customer approval workflows and registration requirements
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Auto Approval Section */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Auto Approval Settings</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Configure automatic customer approval workflow
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Auto Approve Toggle */}
            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border-2 border-indigo-100">
              <div className="flex-1">
                <Label htmlFor="auto-approve" className="text-base font-semibold text-gray-900">
                  Enable Auto Approve
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically approve new customer registrations without manual review
                </p>
                <div className="mt-3 flex items-start gap-2 text-sm">
                  <Info className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    {autoApproveCustomers
                      ? "New customers will be approved instantly and can start placing orders immediately."
                      : "New customer registrations will require manual approval by admin before they can place orders."}
                  </p>
                </div>
              </div>
              <Switch
                id="auto-approve"
                checked={autoApproveCustomers}
                onCheckedChange={setAutoApproveCustomers}
                className="ml-4"
              />
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              {autoApproveCustomers ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Auto Approval: Enabled
                    </p>
                    <p className="text-xs text-green-700">
                      Customers will be approved automatically
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Manual Approval: Required
                    </p>
                    <p className="text-xs text-amber-700">
                      Customers require manual approval from admin
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate("/settings")}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}