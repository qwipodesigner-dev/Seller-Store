import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShoppingCart,
  XCircle,
  RefreshCw,
  Info,
  FileText,
  Plus,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export function CommunicationSettings() {
  const navigate = useNavigate();
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // ---- Notifications & Templates (combined view) ----
  // Phase 1 ships only one notification preference (New Order) but the
  // shape is a list-of-rows so we can add more later without restructure.
  // Each row carries:
  //   • enabled — on/off toggle controlling whether the message goes out
  //   • template — the WhatsApp-approved body. Once added, immutable.
  type NotificationKey = "new-order";
  interface NotificationPref {
    key: NotificationKey;
    label: string;
    description: string;
    enabled: boolean;
    template: string | null;
  }
  const [notifications, setNotifications] = useState<NotificationPref[]>([
    {
      key: "new-order",
      label: "New Order Received",
      description: "Get notified instantly when a new order is placed.",
      enabled: true,
      template: null,
    },
  ]);

  const setNotificationEnabled = (key: NotificationKey, enabled: boolean) =>
    setNotifications((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled } : n)),
    );

  // Add-template dialog — bound to a specific notification preference
  // so the seller knows what they're adding the message FOR.
  const [templateDialogFor, setTemplateDialogFor] = useState<NotificationKey | null>(null);
  const [templateDraft, setTemplateDraft] = useState("");
  const [templateError, setTemplateError] = useState<string | null>(null);
  const dialogTarget = notifications.find((n) => n.key === templateDialogFor);

  const openCreateTemplate = (key: NotificationKey) => {
    setTemplateDialogFor(key);
    setTemplateDraft("");
    setTemplateError(null);
  };

  const closeTemplateDialog = () => {
    setTemplateDialogFor(null);
    setTemplateDraft("");
    setTemplateError(null);
  };

  const handleSaveTemplate = () => {
    if (!templateDialogFor) return;
    const trimmed = templateDraft.trim();
    if (!trimmed) {
      setTemplateError("Template message is required");
      return;
    }
    if (trimmed.length < 10) {
      setTemplateError("Template must be at least 10 characters");
      return;
    }
    if (trimmed.length > 1024) {
      setTemplateError("Template can't exceed 1024 characters");
      return;
    }
    const target = templateDialogFor;
    setNotifications((prev) =>
      prev.map((n) => (n.key === target ? { ...n, template: trimmed } : n)),
    );
    closeTemplateDialog();
    toast.success("Template added. It can't be edited or deleted later.");
  };

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

        {/* Notification Preferences — list view. Each row is one
            notification preference with its own on/off toggle and its
            own approved template. Templates are immutable once added,
            mirroring WhatsApp's approval flow. */}
        {whatsappConnected && (
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 p-2 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Pick which events trigger WhatsApp messages and add the
                    approved template body for each.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.key}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  {/* Top row: name + description + on/off toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-semibold text-gray-900">
                        {n.label}
                      </Label>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {n.description}
                      </p>
                    </div>
                    <Switch
                      checked={n.enabled}
                      onCheckedChange={(v) => setNotificationEnabled(n.key, v)}
                    />
                  </div>

                  {/* Template row — Add Template CTA when blank, locked
                      message body once added. The template is scoped
                      to this notification only. */}
                  {n.template ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-[11px] uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                          <FileText className="h-3 w-3" />
                          Approved Template
                        </Label>
                        <Badge className="bg-violet-600 gap-1 text-[10px]">
                          <Lock className="h-2.5 w-2.5" />
                          Locked
                        </Badge>
                      </div>
                      <div className="border border-violet-200 bg-violet-50/40 rounded-md p-3">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {n.template}
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-500 flex items-start gap-1.5">
                        <AlertCircle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                        Templates can't be edited or deleted. Contact support
                        to register a different one.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-md px-3 py-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Info className="h-3.5 w-3.5 text-gray-500" />
                        No template yet — add the WhatsApp-approved message
                        body for this notification.
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openCreateTemplate(n.key)}
                        className="bg-violet-600 hover:bg-violet-700 gap-1.5 h-8"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Template
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Active Notifications Summary */}
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 mt-2">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Active Notifications: {notifications.filter((n) => n.enabled).length} of {notifications.length}
                      {" · "}
                      Templates added: {notifications.filter((n) => n.template).length} of {notifications.length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Notifications fire only when both the toggle is on AND a
                      template has been added.
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

      {/* Add Approved Template — scoped to the notification preference
          the seller clicked Add Template on. Once submitted, the
          template is locked permanently for that notification. */}
      <Dialog
        open={templateDialogFor !== null}
        onOpenChange={(o) => !o && closeTemplateDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Add Template — {dialogTarget?.label ?? ""}
            </DialogTitle>
            <DialogDescription>
              Paste the WhatsApp-approved message body for{" "}
              <b>{dialogTarget?.label}</b>. Once added, this template is
              locked to this notification — it can't be edited or deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="template-body" className="text-xs">
              Template Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="template-body"
              value={templateDraft}
              onChange={(e) => {
                setTemplateDraft(e.target.value);
                if (templateError) setTemplateError(null);
              }}
              placeholder="e.g. Hi {{1}}, your order #{{2}} of ₹{{3}} has been placed successfully. — ABC Distributors"
              rows={6}
              maxLength={1024}
              aria-invalid={!!templateError}
            />
            <div className="flex items-center justify-between text-[11px]">
              {templateError ? (
                <p className="text-red-600">{templateError}</p>
              ) : (
                <p className="text-gray-500">
                  Use placeholders like {"{{1}}"}, {"{{2}}"} for dynamic values.
                </p>
              )}
              <span className="text-gray-400 shrink-0 ml-2">
                {templateDraft.length} / 1024
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5 text-xs text-amber-900 flex items-start gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              <b>Heads up:</b> after you click <b>Add Template</b>, this
              message becomes permanent — there's no edit or delete.
            </span>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeTemplateDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={templateDraft.trim().length < 10}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Add Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}