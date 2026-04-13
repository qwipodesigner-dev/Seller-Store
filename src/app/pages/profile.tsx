import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Building2,
  User,
  CreditCard,
  MapPin,
  Palette,
  Edit,
  Check,
  X,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

export function Profile() {
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [sensitiveField, setSensitiveField] = useState("");

  // Business Details
  const [companyName, setCompanyName] = useState("ABC Distributors Pvt Ltd");
  const [gstId, setGstId] = useState("29AABCU9603R1ZM");
  const [companyAddress, setCompanyAddress] = useState("123 Business Park, MG Road, Bangalore, Karnataka 560001");
  const [gstVerified, setGstVerified] = useState(true);

  // Contact Information
  const [contactName, setContactName] = useState("Rajesh Kumar");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [contactEmail, setContactEmail] = useState("rajesh@abcdistributors.com");
  const [phoneVerified, setPhoneVerified] = useState(true);

  // Bank Details
  const [accountHolderName, setAccountHolderName] = useState("ABC Distributors Pvt Ltd");
  const [accountNumber, setAccountNumber] = useState("1234567890");
  const [maskedAccountNumber, setMaskedAccountNumber] = useState("******7890");
  const [ifscCode, setIfscCode] = useState("HDFC0001234");
  const [bankName, setBankName] = useState("HDFC Bank, MG Road Branch");
  const [bankVerified, setBankVerified] = useState(true);

  // Service Areas
  const [pincodes, setPincodes] = useState<string[]>(["560001", "560002", "560003", "560004", "560005"]);
  const [newPincode, setNewPincode] = useState("");

  // Branding
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const handleSaveBusiness = () => {
    // Check if sensitive fields changed
    if (gstId !== "29AABCU9603R1ZM") {
      setSensitiveField("GST ID");
      setShowWarningDialog(true);
      return;
    }
    setIsEditingBusiness(false);
    toast.success("Business details updated successfully!");
  };

  const handleSaveContact = () => {
    // Check if sensitive fields changed
    if (contactPhone !== "+91 98765 43210") {
      setSensitiveField("Phone Number");
      setShowWarningDialog(true);
      return;
    }
    setIsEditingContact(false);
    toast.success("Contact information updated successfully!");
  };

  const handleSaveBank = () => {
    if (accountNumber !== "1234567890" || ifscCode !== "HDFC0001234") {
      setSensitiveField("Bank Details");
      setShowWarningDialog(true);
      return;
    }
    setIsEditingBank(false);
    toast.success("Bank details updated successfully!");
  };

  const handleAddPincode = () => {
    if (!newPincode || newPincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    if (pincodes.includes(newPincode)) {
      toast.error("Pincode already added");
      return;
    }
    setPincodes([...pincodes, newPincode]);
    setNewPincode("");
  };

  const handleRemovePincode = (pincode: string) => {
    setPincodes(pincodes.filter((p) => p !== pincode));
  };

  const handleSaveServiceAreas = () => {
    setIsEditingService(false);
    toast.success("Service areas updated successfully!");
  };

  const handleProceedWithVerification = () => {
    setShowWarningDialog(false);
    setIsEditingBusiness(false);
    setIsEditingContact(false);
    setIsEditingBank(false);
    setGstVerified(false);
    setPhoneVerified(false);
    setBankVerified(false);
    toast.warning(`${sensitiveField} updated. Verification required.`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      toast.success("Logo uploaded successfully!");
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      toast.success("Banner uploaded successfully!");
      setBannerUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
        <p className="text-gray-600 mt-1">
          Manage your business profile and settings
        </p>
      </div>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-gray-600" />
              <div>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>Company information and GST details</CardDescription>
              </div>
            </div>
            {!isEditingBusiness ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingBusiness(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingBusiness(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveBusiness}>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingBusiness ? (
            <div className="space-y-3">
              <div>
                <Label className="text-gray-600">Company Name</Label>
                <p className="font-medium text-gray-900">{companyName}</p>
              </div>
              <div>
                <Label className="text-gray-600">GST ID</Label>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{gstId}</p>
                  {gstVerified ? (
                    <Badge className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      Pending Verification
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Company Address</Label>
                <p className="font-medium text-gray-900">{companyAddress}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstId">GST ID</Label>
                <Input
                  id="gstId"
                  value={gstId}
                  onChange={(e) => setGstId(e.target.value)}
                />
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Changing GST ID will require re-verification
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  rows={3}
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Primary contact details</CardDescription>
              </div>
            </div>
            {!isEditingContact ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingContact(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingContact(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveContact}>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingContact ? (
            <div className="space-y-3">
              <div>
                <Label className="text-gray-600">Contact Name</Label>
                <p className="font-medium text-gray-900">{contactName}</p>
              </div>
              <div>
                <Label className="text-gray-600">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{contactPhone}</p>
                  {phoneVerified ? (
                    <Badge className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      Pending Verification
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Email ID</Label>
                <p className="font-medium text-gray-900">{contactEmail}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Changing phone number will require re-verification
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email ID</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <div>
                <CardTitle>Bank Details</CardTitle>
                <CardDescription>Payment settlement information</CardDescription>
              </div>
            </div>
            {!isEditingBank ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingBank(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingBank(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveBank}>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingBank ? (
            <div className="space-y-3">
              <div>
                <Label className="text-gray-600">Account Holder Name</Label>
                <p className="font-medium text-gray-900">{accountHolderName}</p>
              </div>
              <div>
                <Label className="text-gray-600">Account Number</Label>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{maskedAccountNumber}</p>
                  {bankVerified ? (
                    <Badge className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      Pending Verification
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-gray-600">IFSC Code</Label>
                <p className="font-medium text-gray-900">{ifscCode}</p>
              </div>
              <div>
                <Label className="text-gray-600">Bank Name</Label>
                <p className="font-medium text-gray-900">{bankName}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Changing bank details will require re-verification
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <p className="text-sm text-gray-600">{bankName}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Areas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div>
                <CardTitle>Service Areas</CardTitle>
                <CardDescription>Delivery locations and pincodes</CardDescription>
              </div>
            </div>
            {!isEditingService ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingService(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingService(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveServiceAreas}>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingService && (
            <div className="space-y-2">
              <Label htmlFor="newPincode">Add Pincode</Label>
              <div className="flex gap-2">
                <Input
                  id="newPincode"
                  placeholder="Enter 6-digit pincode"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                />
                <Button type="button" onClick={handleAddPincode}>
                  Add
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label className="text-gray-600 mb-2 block">
              Service Pincodes ({pincodes.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {pincodes.map((pincode) => (
                <Badge
                  key={pincode}
                  variant="secondary"
                  className="px-3 py-1.5 flex items-center gap-2"
                >
                  {pincode}
                  {isEditingService && (
                    <button
                      onClick={() => handleRemovePincode(pincode)}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-gray-600" />
            <div>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Upload logo and banner images</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Company Logo</Label>
              <p className="text-xs text-gray-600 mb-3">
                Recommended size: 200x200px, Max 2MB (PNG, JPG)
              </p>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center text-gray-400">
                    <Upload className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Banner Image</Label>
              <p className="text-xs text-gray-600 mb-3">
                Recommended size: 1200x400px, Max 5MB (PNG, JPG)
              </p>
              <div className="space-y-4">
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt="Banner"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm">No banner uploaded</p>
                    </div>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="banner-upload"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("banner-upload")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Banner
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Verification Required
            </DialogTitle>
            <DialogDescription>
              Changes to {sensitiveField} require re-verification to maintain account security.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700">
              After saving these changes, your {sensitiveField} will be marked as "Pending Verification".
              Our team will review and verify the changes within 24-48 hours.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarningDialog(false)}>
              Cancel Changes
            </Button>
            <Button onClick={handleProceedWithVerification} className="bg-amber-600 hover:bg-amber-700">
              Proceed with Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
