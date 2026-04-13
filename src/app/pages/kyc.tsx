import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { FileText, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth-context";
import {
  getSellerByEmail,
  updateSellerKyc,
  type Seller,
} from "../lib/mock-store";

export function KycPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [gstin, setGstin] = useState("");
  const [bankAcct, setBankAcct] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const s = getSellerByEmail(user.email);
    if (s) {
      setSeller(s);
      setPan(s.kyc.pan || "");
      setAadhaar(s.kyc.aadhaar || "");
      setGstin(s.kyc.gstin || "");
      setBankAcct(s.kyc.bankAcct || "");
      setBusinessAddress(s.kyc.businessAddress || "");
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) {
      toast.error("Seller profile not found");
      return;
    }

    // Basic validations
    if (!pan.trim() || !aadhaar.trim() || !businessAddress.trim()) {
      toast.error("PAN, Aadhaar and Business Address are required");
      return;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(pan.trim().toUpperCase())) {
      toast.error("PAN format invalid (expected: ABCDE1234F)");
      return;
    }

    setIsSaving(true);
    const updated = updateSellerKyc(seller.id, {
      pan: pan.trim().toUpperCase(),
      aadhaar: aadhaar.trim(),
      gstin: gstin.trim().toUpperCase() || undefined,
      bankAcct: bankAcct.trim() || undefined,
      businessAddress: businessAddress.trim(),
    });
    setIsSaving(false);
    if (updated) {
      setSeller(updated);
      toast.success("KYC submitted. Admin will verify shortly.");
    } else {
      toast.error("Failed to save KYC");
    }
  };

  const statusBadge = () => {
    if (!seller) return null;
    if (seller.kyc.status === "verified") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Verified
        </Badge>
      );
    }
    if (seller.kyc.status === "submitted") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
          Submitted — Awaiting Verification
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-300">
        Not Started
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                KYC Information
              </h2>
              <p className="text-sm text-gray-500">
                Submit your business verification details
              </p>
            </div>
          </div>
          {statusBadge()}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pan">
                      PAN Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pan"
                      value={pan}
                      onChange={(e) => setPan(e.target.value)}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aadhaar">
                      Aadhaar Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="aadhaar"
                      value={aadhaar}
                      onChange={(e) => setAadhaar(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      maxLength={19}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                      id="gstin"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="36ABCDE1234F1Z5"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAcct">Bank Account (Last 4)</Label>
                    <Input
                      id="bankAcct"
                      value={bankAcct}
                      onChange={(e) => setBankAcct(e.target.value)}
                      placeholder="XXXX-XXXX-1234"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">
                    Business Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessAddress"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Street, Area, City, State, PIN"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Your data is reviewed by the admin team before verification.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Submit KYC"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
