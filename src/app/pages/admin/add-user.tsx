import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";

export function AdminAddUser() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSave = () => {
    if (!fullName.trim()) { toast.error("Full Name is required"); return; }
    if (!phone.trim()) { toast.error("Mobile Number is required"); return; }
    if (!businessName.trim()) { toast.error("Company / Business Name is required"); return; }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`Seller "${fullName}" created successfully`);
      navigate("/admin/users");
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Add Seller
            </h2>
            <p className="text-sm text-gray-500">
              Create a new seller account
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>
                    Company / Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Full Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, Area, City, State, PIN"
                  />
                </div>
              </div>

              {/* Active / Inactive Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-xs text-gray-500">
                    {isActive ? "Seller will be active immediately" : "Seller will be created as inactive"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isActive ? "text-green-700" : "text-gray-500"}`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Button variant="outline" onClick={() => navigate("/admin/users")}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              <UserPlus className="h-4 w-4" />
              {isSaving ? "Creating..." : "Create Seller"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
