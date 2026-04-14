import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Shield, Store, Users, Phone, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth-context";
import { validateCredentials } from "../../lib/auth-credentials";
import qwipoLogo from "../../../imports/Qwipo_Secondary_Logo_for_Light_BG@4x-8.png";
import qwipoIcon from "../../../imports/Qwipo_Icon_Logo_for_Light_BG@4x-8.png";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = () => {
    const cleaned = mobile.replace(/\D/g, "");
    if (cleaned.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
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
      toast.error("Please enter the 4-digit OTP");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const user = validateCredentials(mobile, otp);
      setIsLoading(false);
      if (!user) {
        toast.error("Invalid OTP. Use 1234 for demo accounts.");
        return;
      }
      login(user);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "admin_seller") {
        navigate("/select-seller");
      } else {
        navigate("/");
      }
    }, 600);
  };

  const fillDemo = (role: "admin" | "seller" | "admin_seller") => {
    if (role === "admin") {
      setMobile("9900000001");
    } else if (role === "admin_seller") {
      setMobile("9900000003");
    } else {
      setMobile("9900000002");
    }
    setOtp("1234");
    setOtpSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-32 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-300/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Manage your
            <br />
            distribution business
            <br />
            smarter
          </h2>
          <p className="text-lg text-blue-100 max-w-md mb-8">
            Centralized catalog, real-time inventory sync, ONDC marketplace
            integration — all in one platform.
          </p>

          <div className="flex flex-wrap gap-3">
            {[
              "Catalog Sync",
              "ONDC Ready",
              "DMS Integration",
              "Real-time Inventory",
            ].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full bg-white/15 text-sm font-medium text-white/90 backdrop-blur-sm"
              >
                {f}
              </span>
            ))}
          </div>

          <div className="flex gap-10 mt-12">
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm text-blue-200">Brands</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50K+</p>
              <p className="text-sm text-blue-200">Products</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-blue-200">Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src={qwipoLogo}
              alt="Qwipo"
              className="h-12 mx-auto mb-2 object-contain"
            />
            <p className="text-gray-500 text-sm">Seller Management Platform</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in with your mobile number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="pl-10"
                      maxLength={15}
                      disabled={otpSent}
                      required
                    />
                  </div>
                </div>

                {/* OTP Section */}
                {!otpSent ? (
                  <Button
                    type="button"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
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
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="pl-10"
                          maxLength={4}
                          autoFocus
                          required
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          OTP sent to {mobile}
                        </p>
                        <button
                          type="button"
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
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
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                  </>
                )}
              </form>

              {/* Demo credentials */}
              <div className="mt-5 p-3 border border-blue-100 bg-blue-50/60 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">
                  Demo accounts — tap to autofill (OTP: 1234)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo("admin")}
                    className="flex items-start gap-2 p-2 rounded-md bg-white border border-blue-200 hover:border-blue-400 transition-all text-left"
                  >
                    <Shield className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900">
                        Super Admin
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        9900000001
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo("admin_seller")}
                    className="flex items-start gap-2 p-2 rounded-md bg-white border border-blue-200 hover:border-blue-400 transition-all text-left"
                  >
                    <Users className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900">
                        Admin Seller
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        9900000003
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo("seller")}
                    className="flex items-start gap-2 p-2 rounded-md bg-white border border-blue-200 hover:border-blue-400 transition-all text-left"
                  >
                    <Store className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900">
                        Seller
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        9900000002
                      </p>
                    </div>
                  </button>
                </div>
              </div>
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
