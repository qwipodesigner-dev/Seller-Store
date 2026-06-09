import { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Database, Phone, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth-context";
import { validateCredentials } from "../../lib/auth-credentials";

export function CatalogAdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleSendOtp = () => {
    if (mobile.length !== 10) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      toast.success("OTP sent to " + mobile);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setOtpError("Please enter the 4-digit OTP");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const user = validateCredentials(mobile, otp);
      setIsLoading(false);
      if (!user || user.role !== "catalog-admin") {
        setOtpError(
          user
            ? "This account doesn't have Catalog Admin access."
            : "Invalid OTP. Please try again."
        );
        setOtp("");
        return;
      }
      setOtpError(null);
      login(user);
      toast.success(`Welcome, ${user.name}!`);
      navigate("/catalog-admin");
    }, 600);
  };

  const fillDemo = () => {
    setMobile("5500000001");
    setOtp("1234");
    setOtpSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-32 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Database className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">Qwipo</p>
              <p className="text-sm text-teal-200">Product Store</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Manage the
            <br />
            Master Catalog
          </h2>
          <p className="text-lg text-teal-100 max-w-md mb-8">
            Review SKU requests, approve edits, maintain product data, and keep
            the catalog up to date for all distributors on Digidukaan.
          </p>

          <div className="flex flex-wrap gap-3">
            {[
              "SKU Approvals",
              "Edit Requests",
              "Catalog Management",
              "Brand Oversight",
            ].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full bg-white/15 text-sm font-medium text-white/90"
              >
                {f}
              </span>
            ))}
          </div>

          <div className="flex gap-10 mt-12">
            <div>
              <p className="text-3xl font-bold">
                {/* from psSkus */}
                1,500+
              </p>
              <p className="text-sm text-teal-200">Active SKUs</p>
            </div>
            <div>
              <p className="text-3xl font-bold">21</p>
              <p className="text-sm text-teal-200">Brands</p>
            </div>
            <div>
              <p className="text-3xl font-bold">8</p>
              <p className="text-sm text-teal-200">Companies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-lg leading-tight">
                  Qwipo Product Store
                </p>
                <p className="text-xs text-gray-500">Catalog Admin Portal</p>
              </div>
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Catalog Admin Login</CardTitle>
              <CardDescription>
                Sign in with your registered mobile number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className="pl-10"
                      maxLength={10}
                      disabled={otpSent}
                      required
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <Button
                    type="button"
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={isLoading || mobile.length !== 10}
                    onClick={handleSendOtp}
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 4-digit OTP"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, ""));
                            if (otpError) setOtpError(null);
                          }}
                          className="pl-10"
                          maxLength={4}
                          autoFocus
                          required
                          aria-invalid={!!otpError}
                        />
                      </div>
                      {otpError && (
                        <p className="text-xs text-red-600">{otpError}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          OTP sent to {mobile}
                        </p>
                        <button
                          type="button"
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                          }}
                        >
                          Change Number
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      disabled={isLoading || otp.length !== 4}
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </>
                )}
              </form>

              {/* Demo credentials */}
              <div className="mt-5 p-3 border border-teal-100 bg-teal-50/60 rounded-lg">
                <p className="text-xs font-semibold text-teal-900 mb-2">
                  Demo account — tap to autofill (OTP: 1234)
                </p>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="w-full flex items-center gap-2 p-2 rounded-md bg-white border border-teal-200 hover:border-teal-400 transition-all text-left"
                >
                  <ShieldCheck className="h-4 w-4 text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Catalog Admin
                    </p>
                    <p className="text-[10px] text-gray-500">5500000001</p>
                  </div>
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">
                Not a catalog admin?{" "}
                <Link
                  to="/login"
                  className="text-teal-600 hover:underline font-medium"
                >
                  Go to Seller Store login
                </Link>
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-gray-500 mt-6">
            © 2026 Qwipo. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
