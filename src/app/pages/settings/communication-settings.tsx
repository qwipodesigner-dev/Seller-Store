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
                  {notifications.filter((n) => n.enabled && n.template).length} /{" "}
                  {notifications.length} active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.key}
                  className="border border-gray-200 rounded-md p-2.5 space-y-2"
                >
                  {/* Name + description + on/off toggle */}
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

                  {/* Template — locked panel when set, dashed Add CTA
                      otherwise. */}
                  {n.template ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-[10px] uppercase tracking-wider text-gray-500 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Approved Template
                        </Label>
                        <Badge className="bg-violet-600 gap-1 text-[10px] h-5">
                          <Lock className="h-2.5 w-2.5" />
                          Locked
                        </Badge>
                      </div>
                      <div className="border border-violet-200 bg-violet-50/40 rounded-md px-2.5 py-2">
                        <p className="text-[13px] text-gray-900 whitespace-pre-wrap leading-snug">
                          {n.template}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-500 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                        Templates can't be edited or deleted. Contact support
                        to register a different one.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-md px-2.5 py-1.5">
                      <span className="text-[11px] text-gray-600 flex items-center gap-1.5">
                        <Info className="h-3 w-3 text-gray-500" />
                        No template yet for this notification.
                      </span>
                      <Button
                        size="sm"
                        onClick={() => openCreateTemplate(n.key)}
                        className="h-7 gap-1 text-xs bg-violet-600 hover:bg-violet-700"
                      >
                        <Plus className="h-3 w-3" />
                        Add Template
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <p className="text-[11px] text-gray-500 pt-1 flex items-start gap-1.5">
                <Info className="h-3 w-3 text-gray-400 shrink-0 mt-0.5" />
                Notifications fire only when both the toggle is on AND a
                template has been added.
              </p>
            </CardContent>
          </Card>
        )}
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