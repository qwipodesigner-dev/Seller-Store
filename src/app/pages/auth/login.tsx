import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff, Shield, Store, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth-context";
import { validateCredentials } from "../../lib/auth-credentials";
import qwipoLogo from "../../../imports/Qwipo_Secondary_Logo_for_Light_BG@4x-8.png";
import qwipoIcon from "../../../imports/Qwipo_Icon_Logo_for_Light_BG@4x-8.png";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneOrEmail || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const user = validateCredentials(phoneOrEmail, password);
      setIsLoading(false);
      if (!user) {
        toast.error("Invalid credentials. Try one of the demo accounts below.");
        return;
      }
      login(user);
      toast.success(`Welcome back, ${user.name}!`);
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
      setPhoneOrEmail("admin@qwipo.com");
      setPassword("admin@123");
    } else if (role === "admin_seller") {
      setPhoneOrEmail("adminseller@qwipo.com");
      setPassword("adminseller@123");
    } else {
      setPhoneOrEmail("seller@qwipo.com");
      setPassword("seller@123");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Panel — branding / illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Abstract shapes */}
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

          {/* Feature pills */}
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

          {/* Stats */}
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

      {/* Right Panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo above login form */}
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
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneOrEmail">Phone Number or Email</Label>
                  <Input
                    id="phoneOrEmail"
                    type="text"
                    placeholder="Enter phone or email"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Demo credentials helper */}
              <div className="mt-5 p-3 border border-blue-100 bg-blue-50/60 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">
                  Demo credentials — tap to autofill
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo("admin")}
                    className="flex items-start gap-2 p-2 rounded-md bg-white border border-blue-200 hover:border-blue-400 transition-all text-left"
                  >
                    <Shield className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900">Master Admin</p>
                      <p className="text-[10px] text-gray-500 truncate">
                        admin@qwipo.com
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
                        adminseller@...
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
                        seller@qwipo.com
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
