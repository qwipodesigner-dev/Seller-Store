import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  Smartphone,
  ShoppingCart,
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

  // ---- Notifications (toggle-only) ----
  // Phase 1 ships only one notification preference (New Order) but the
  // shape is a list-of-rows so we can add more later without restructure.
  // Each row is just `enabled` — the message body itself is configured
  // and approved on the WhatsApp Business (WABA) side, not in the
  // seller UI. The seller only opts in / out of receiving each one.
  type NotificationKey = "new-order";
  interface NotificationPref {
    key: NotificationKey;
    label: string;
    description: string;
    enabled: boolean;
  }
  const [notifications, setNotifications] = useState<NotificationPref[]>([
    {
      key: "new-order",
      label: "New Order Received",
      description: "Get notified instantly when a new order is placed.",
      enabled: true,
    },
  ]);

  const setNotificationEnabled = (key: NotificationKey, enabled: boolean) =>
    setNotifications((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled } : n)),
    );

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

  return (
    <div className="p-4 space-y-3 bg-gray-50 min-h-full">
      {/* Compact header — single row, no subtitle, no page-level save */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/settings")}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-cyan-600" />
          Communication Settings
        </h1>
      </div>

      <div className="max-w-5xl space-y-3">
        {/* WhatsApp Configuration — compact card. The big "How it works"
            ordered list was dropped; the three steps are obvious from
            the input + button + verification flow itself. */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp Configuration
              {whatsappConnected && (
                <Badge className="bg-green-600 text-[10px] gap-1 h-5">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Connected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {!whatsappConnected ? (
              <>
                {/* Phone number row — country prefix + input + Send Code */}
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-number" className="text-xs">
                    WhatsApp Number
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 h-8 bg-gray-100 border rounded-md text-sm font-medium shrink-0">
                      <Smartphone className="h-3.5 w-3.5 text-gray-600" />
                      +91
                    </div>
                    <Input
                      id="whatsapp-number"
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) =>
                        setWhatsappNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="flex-1 h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleConnectWhatsApp}
                      disabled={isVerifying || whatsappNumber.length !== 10}
                      className="h-8 gap-1.5 bg-green-600 hover:bg-green-700"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-3.5 w-3.5" />
                          Send Code
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Use a number registered with WhatsApp or WhatsApp Business.
                  </p>
                </div>

                {/* Verification — only shows once a 10-digit number is
                    typed. Tightened to a single inline row. */}
                {isVerifying === false && whatsappNumber.length === 10 && (
                  <div className="space-y-1 p-2.5 bg-green-50 border border-green-200 rounded-md">
                    <Label htmlFor="verification-code" className="text-xs">
                      Verification Code
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="verification-code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="6-digit code"
                        maxLength={6}
                        className="flex-1 h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleVerify}
                        disabled={verificationCode.length !== 6}
                        className="h-8 gap-1.5 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verify
                      </Button>
                    </div>
                    <p className="text-[11px] text-green-700">
                      Check your WhatsApp for the code.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between gap-2 bg-green-50 border border-green-200 rounded-md p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-green-900">
                      WhatsApp Connected
                    </p>
                    <p className="text-[11px] text-green-700">
                      +91 {whatsappNumber.slice(0, 5)}***{whatsappNumber.slice(-2)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="h-7 gap-1 text-xs border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Disconnect
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Preferences — list view. Each row is one
            notification with its toggle and its approved template. */}
        {whatsappConnected && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-cyan-600" />
                Notification Preferences
                <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px]">
                  {notifications.filter((n) => n.enabled).length} /{" "}
                  {notifications.length} active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {/* Each row is just label + description + on/off toggle.
                  The message body is approved and managed in WABA on
                  the back end, so the seller doesn't author templates
                  here — they only choose whether each notification
                  fires. */}
              {notifications.map((n) => (
                <div
                  key={n.key}
                  className="border border-gray-200 rounded-md p-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-medium text-gray-900">
                        {n.label}
                      </Label>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {n.description}
                      </p>
                    </div>
                    <Switch
                      checked={n.enabled}
                      onCheckedChange={(v) => setNotificationEnabled(n.key, v)}
                    />
                  </div>
                </div>
              ))}

              <p className="text-[11px] text-gray-500 pt-1 flex items-start gap-1.5">
                <Info className="h-3 w-3 text-gray-400 shrink-0 mt-0.5" />
                Message templates are managed on the WhatsApp Business
                side. Toggle a row to opt in or out of that notification.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}