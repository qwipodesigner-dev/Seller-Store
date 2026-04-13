import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Package, Check, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { addRequest } from "../../lib/mock-store";

const STEPS = [
  { id: 1, name: "Basic Details", description: "Company and contact info" },
  { id: 2, name: "Business Details", description: "GST and address" },
  { id: 3, name: "Bank Details", description: "Payment information" },
  { id: 4, name: "Service Areas", description: "Delivery locations" },
  { id: 5, name: "Verification", description: "Review and submit" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Step 1: Basic Details
  const [sellerType, setSellerType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Step 2: Business Details
  const [gstId, setGstId] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [gstVerified, setGstVerified] = useState(false);

  // Step 3: Bank Details
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");

  // Step 4: Service Areas
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [newPincode, setNewPincode] = useState("");

  const handleNext = () => {
    if (currentStep === 1) {
      if (!sellerType || !companyName || !contactName || !contactPhone || !contactEmail) {
        toast.error("Please fill all required fields");
        return;
      }
      if (!phoneVerified) {
        toast.error("Please verify your phone number");
        return;
      }
    } else if (currentStep === 2) {
      if (!gstId || !companyAddress) {
        toast.error("Please fill all required fields");
        return;
      }
      if (!gstVerified) {
        toast.error("Please verify your GST ID");
        return;
      }
    } else if (currentStep === 3) {
      if (!accountHolderName || !accountNumber || !ifscCode) {
        toast.error("Please fill all required fields");
        return;
      }
    } else if (currentStep === 4) {
      if (pincodes.length === 0) {
        toast.error("Please add at least one service area");
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleVerifyPhone = () => {
    if (!contactPhone || contactPhone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    // Simulate OTP verification
    setIsLoading(true);
    setTimeout(() => {
      setPhoneVerified(true);
      setIsLoading(false);
      toast.success("Phone number verified successfully!");
    }, 1500);
  };

  const handleVerifyGst = () => {
    if (!gstId || gstId.length < 15) {
      toast.error("Please enter a valid GST ID");
      return;
    }
    // Simulate GST verification
    setIsLoading(true);
    setTimeout(() => {
      setGstVerified(true);
      setIsLoading(false);
      // Auto-fill company address
      setCompanyAddress("123 Business Park, MG Road, Bangalore, Karnataka 560001");
      toast.success("GST verified! Company details fetched.");
    }, 1500);
  };

  const handleFetchBankName = () => {
    if (!ifscCode || ifscCode.length < 11) {
      toast.error("Please enter a valid IFSC code");
      return;
    }
    // Simulate IFSC fetch
    setIsLoading(true);
    setTimeout(() => {
      setBankName("HDFC Bank, MG Road Branch");
      setIsLoading(false);
      toast.success("Bank details fetched!");
    }, 1000);
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

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        // Extract city from address (best-effort: last non-empty comma-separated chunk minus pincode)
        const parts = companyAddress
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
        const city =
          parts.length >= 2
            ? parts[parts.length - 2].replace(/\d/g, "").trim() || "—"
            : "—";

        addRequest({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          businessName: companyName,
          city,
        });
        setIsLoading(false);
        setIsSubmitted(true);
        toast.success("Registration request submitted successfully!");
      } catch (err) {
        setIsLoading(false);
        toast.error("Failed to submit. Please try again.");
      }
    }, 1200);
  };

  // Success state after submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Request Submitted</h1>
            <p className="text-gray-600 mt-2">
              Your registration is under review
            </p>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Thank you, <strong>{contactName}</strong>. Your request for{" "}
                  <strong>{companyName}</strong> has been submitted to the
                  Qwipo admin team.
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>What happens next?</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>
                    An admin will review your details within 1–2 business days.
                  </li>
                  <li>
                    You'll be notified at <strong>{contactEmail}</strong> once
                    a decision is made.
                  </li>
                  <li>
                    Upon approval, you can sign in and complete your KYC and
                    connector setup.
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Registration</h1>
          <p className="text-gray-600 mt-2">Join the SMP Platform</p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1 relative">
                <div className="flex items-center">
                  {index > 0 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        currentStep > step.id - 1 ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                  <div
                    className={`relative flex flex-col items-center ${
                      index === 0 ? "ml-0" : "mx-auto"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        currentStep > step.id
                          ? "bg-blue-600 text-white"
                          : currentStep === step.id
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="absolute top-12 text-center whitespace-nowrap">
                      <p
                        className={`text-xs font-medium ${
                          currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl mt-16">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sellerType">Seller Type *</Label>
                  <Select value={sellerType} onValueChange={setSellerType}>
                    <SelectTrigger id="sellerType">
                      <SelectValue placeholder="Select seller type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brand">Brand</SelectItem>
                      <SelectItem value="Distributor">Distributor</SelectItem>
                      <SelectItem value="C&F">C&F (Clearing & Forwarding)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">Primary Contact Name *</Label>
                  <Input
                    id="contactName"
                    placeholder="Enter contact person name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="contactPhone"
                      placeholder="+91 98765 43210"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      disabled={phoneVerified}
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyPhone}
                      disabled={phoneVerified || isLoading}
                      variant={phoneVerified ? "secondary" : "default"}
                    >
                      {phoneVerified ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Verified
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </div>
                  {phoneVerified && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Phone number verified
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email ID *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gstId">GST ID *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="gstId"
                      placeholder="22AAAAA0000A1Z5"
                      value={gstId}
                      onChange={(e) => setGstId(e.target.value.toUpperCase())}
                      maxLength={15}
                      disabled={gstVerified}
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyGst}
                      disabled={gstVerified || isLoading}
                      variant={gstVerified ? "secondary" : "default"}
                    >
                      {gstVerified ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Verified
                        </>
                      ) : (
                        "Verify GST"
                      )}
                    </Button>
                  </div>
                  {gstVerified && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      GST verified and details fetched
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address *</Label>
                  <Textarea
                    id="companyAddress"
                    placeholder="Enter complete company address"
                    rows={4}
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                  />
                  {gstVerified && (
                    <p className="text-xs text-gray-600">
                      Address auto-filled from GST registry. You can edit if needed.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Bank Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                  <Input
                    id="accountHolderName"
                    placeholder="As per bank records"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Bank Account Number *</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="ifscCode"
                      placeholder="HDFC0001234"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      maxLength={11}
                    />
                    <Button
                      type="button"
                      onClick={handleFetchBankName}
                      disabled={isLoading || !ifscCode}
                    >
                      Fetch Bank
                    </Button>
                  </div>
                </div>

                {bankName && (
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                      {bankName}
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Bank details are required for settlement of payments from orders.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Service Areas */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Add Service Pincodes</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pincode"
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

                {pincodes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Added Pincodes ({pincodes.length})</Label>
                    <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-gray-50">
                      {pincodes.map((pincode) => (
                        <Badge
                          key={pincode}
                          variant="secondary"
                          className="px-3 py-1.5 flex items-center gap-2"
                        >
                          {pincode}
                          <button
                            onClick={() => handleRemovePincode(pincode)}
                            className="hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {pincodes.length === 0 && (
                  <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-500">
                    <p className="text-sm">No service areas added yet</p>
                    <p className="text-xs mt-1">Add at least one pincode to continue</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Verification & Summary */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ All verification steps completed successfully!
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Basic Details</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Seller Type:</strong> {sellerType}</p>
                      <p><strong>Company:</strong> {companyName}</p>
                      <p><strong>Contact:</strong> {contactName}</p>
                      <p><strong>Phone:</strong> {contactPhone} <Badge className="ml-2 bg-green-100 text-green-700">Verified</Badge></p>
                      <p><strong>Email:</strong> {contactEmail}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Business Details</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>GST ID:</strong> {gstId} <Badge className="ml-2 bg-green-100 text-green-700">Verified</Badge></p>
                      <p><strong>Address:</strong> {companyAddress}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bank Details</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Account Holder:</strong> {accountHolderName}</p>
                      <p><strong>Account Number:</strong> {accountNumber}</p>
                      <p><strong>IFSC:</strong> {ifscCode}</p>
                      <p><strong>Bank:</strong> {bankName}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Service Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {pincodes.map((pincode) => (
                        <Badge key={pincode} variant="secondary">
                          {pincode}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    By clicking "Submit & Register", you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              {currentStep < 5 ? (
                <Button type="button" onClick={handleNext}>
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Submitting..." : "Submit & Register"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
