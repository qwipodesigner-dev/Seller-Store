import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShoppingCart,
  UserPlus,
  PackageCheck,
  XCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export function CommunicationSettings() {
  const navigate = useNavigate();
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Notification toggle - Keep ONLY New Order
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);

  const handleConnectWhatsApp = () => {
    if (!whatsappNumber || whatsappNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsVerifying(true);
    // Simulate sending verification code
    setTimeout(() => {
      toast.success("Verification code sent to WhatsApp!");
      setIsVerifying(false);
    }, 1500);
  };

  const handleVerify = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    // Simulate verification
    setTimeout(() => {
      setWhatsappConnected(true);
      toast.success("WhatsApp connected successfully!");
    }, 1000);
  };

  const handleDisconnect = () => {
    setWhatsappConnected(false);
    setWhatsappNumber("");
    setVerificationCode("");
    toast.info("WhatsApp disconnected");
  };

  const handleSave = () => {
    toast.success("Communication settings saved successfully!");
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
            <MessageCircle className="h-8 w-8 text-cyan-600" />
            Communication Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure WhatsApp notifications to stay updated on key events
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* WhatsApp Connection Section */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  WhatsApp Configuration
                  {whatsappConnected && (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Connect your WhatsApp number to receive instant notifications
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {!whatsappConnected ? (
              <>
                {/* Connection Setup */}
                <div className="space-y-4">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium">How it works:</p>
                      <ol className="list-decimal list-inside mt-1 space-y-1 text-blue-800">
                        <li>Enter your WhatsApp-enabled mobile number</li>
                        <li>Receive a 6-digit verification code on WhatsApp</li>
                        <li>Enter the code to verify and connect</li>
                      </ol>
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-number" className="text-sm font-medium">
                      WhatsApp Number
                    </Label>
                    <div className="flex gap-3">
                      <div className="flex-1 flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border rounded-md">
                          <Smartphone className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">+91</span>
                        </div>
                        <Input
                          id="whatsapp-number"
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10}
                          className="flex-1"
                        />
                      </div>
                      <Button
                        onClick={handleConnectWhatsApp}
                        disabled={isVerifying || whatsappNumber.length !== 10}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Send Code
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">
                      Enter the mobile number registered with WhatsApp Business or WhatsApp
                    </p>
                  </div>

                  {/* Verification Code Input */}
                  {isVerifying === false && whatsappNumber.length === 10 && (
                    <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                      <Label htmlFor="verification-code" className="text-sm font-medium">
                        Verification Code
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          id="verification-code"
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleVerify}
                          disabled={verificationCode.length !== 6}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Verify
                        </Button>
                      </div>
                      <p className="text-xs text-green-700">
                        Check your WhatsApp for the verification code
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Connected Status */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">WhatsApp Connected</p>
                        <p className="text-sm text-green-700">
                          +91 {whatsappNumber.slice(0, 5)}***{whatsappNumber.slice(-2)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        {whatsappConnected && (
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose which events trigger WhatsApp notifications
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Order Notifications */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Order Notifications</h3>
                </div>

                {/* New Order */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="notify-new-order" className="text-sm font-medium">
                      New Order Received
                    </Label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Get notified instantly when a new order is placed
                    </p>
                  </div>
                  <Switch
                    id="notify-new-order"
                    checked={notifyNewOrder}
                    onCheckedChange={setNotifyNewOrder}
                  />
                </div>
              </div>

              {/* Active Notifications Summary */}
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 mt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Active Notifications: {[notifyNewOrder].filter(Boolean).length} of 1
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      You will receive WhatsApp notifications for the selected events
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate("/settings")}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}