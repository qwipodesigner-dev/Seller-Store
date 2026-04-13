import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

type UserRole = "seller" | "admin_seller";
type DmsType = "bizom" | "botree" | "gt_software";

const DMS_OPTIONS: { value: DmsType; label: string }[] = [
  { value: "bizom", label: "Bizom" },
  { value: "botree", label: "Botree" },
  { value: "gt_software", label: "GT Software" },
];

export function AdminAddUser() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  // User info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [sellerStoreId, setSellerStoreId] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // Role + DMS (admin_seller only)
  const [role, setRole] = useState<UserRole | "">("");
  const [dmsType, setDmsType] = useState<DmsType | "">("");

  const handleRoleChange = (v: string) => {
    setRole(v as UserRole);
    setDmsType("");
  };

  const handleSave = () => {
    if (!fullName.trim()) { toast.error("Full Name is required"); return; }
    if (!phone.trim()) { toast.error("Mobile Number is required"); return; }
    if (!businessName.trim()) { toast.error("Company / Business Name is required"); return; }
    if (!role) { toast.error("Please select a role"); return; }
    if (role === "admin_seller" && !dmsType) {
      toast.error("Please select a DMS for the admin seller");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`User "${fullName}" created successfully`);
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
              Add New User
            </h2>
            <p className="text-sm text-gray-500">
              Create a seller or admin-seller account
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Company / Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seller ID / Store ID</Label>
                  <Input
                    value={sellerStoreId}
                    onChange={(e) => setSellerStoreId(e.target.value)}
                    placeholder="Enter seller or store ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full address — Street, Area, State, PIN"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Role & Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                {/* Role dropdown */}
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <Label>
                    Select Role <span className="text-red-500">*</span>
                  </Label>
                  <Select value={role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="admin_seller">Admin Seller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* DMS dropdown — only for Admin Seller */}
                {role === "admin_seller" && (
                  <div className="space-y-2 flex-1 min-w-[200px]">
                    <Label>
                      Select DMS <span className="text-red-500">*</span>
                    </Label>
                    <Select value={dmsType} onValueChange={(v) => setDmsType(v as DmsType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose DMS..." />
                      </SelectTrigger>
                      <SelectContent>
                        {DMS_OPTIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {role === "seller" && (
                <p className="text-xs text-gray-500">
                  Seller account will be created. You can link brands later from
                  the Managed Companies tab in the user details page.
                </p>
              )}
              {role === "admin_seller" && !dmsType && (
                <p className="text-xs text-gray-500">
                  Admin Seller — select a DMS to complete. After login, this user
                  will see all sellers connected to the selected DMS.
                </p>
              )}
              {role === "admin_seller" && dmsType && (
                <p className="text-xs text-gray-500">
                  Admin Seller on{" "}
                  <strong>
                    {DMS_OPTIONS.find((d) => d.value === dmsType)?.label}
                  </strong>
                  . After login, this user will be able to view and manage all
                  sellers connected to this DMS.
                </p>
              )}
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
              {isSaving ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
