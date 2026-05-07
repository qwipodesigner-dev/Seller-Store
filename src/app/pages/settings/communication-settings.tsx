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

  // Notification toggle - Keep ONLY New Order
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);

  // ---- Approved Template ----
  // Phase 1 rule: a seller can register exactly ONE WhatsApp template
  // (the approved message body that goes out for New Order alerts).
  // Once added, the template is locked — no edit, no delete. The
  // textarea pop-up is the only way to create it.
  const [approvedTemplate, setApprovedTemplate] = useState<string | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateDraft, setTemplateDraft] = useState("");
  const [templateError, setTemplateError] = useState<string | null>(null);

  const openCreateTemplate = () => {
    setTemplateDraft("");
    setTemplateError(null);
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
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
    setApprovedTemplate(trimmed);
    setTemplateDialogOpen(false);
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

        {/* Approved Template — appears once WhatsApp is connected.
            Phase 1: exactly one template per seller. Once created the
            block flips to a locked, read-only display with a "Locked"
            pill — no edit, no delete. */}
        {whatsappConnected && (
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-violet-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Approved Template
                      {approvedTemplate && (
                        <Badge className="bg-violet-600 gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      WhatsApp notifications are sent using this approved
                      template. Only one template per account.
                    </p>
                  </div>
                </div>
                {!approvedTemplate && (
                  <Button
                    onClick={openCreateTemplate}
                    className="bg-violet-600 hover:bg-violet-700 gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    Add Template
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {approvedTemplate ? (
                <div className="space-y-3">
                  <div className="border border-violet-200 bg-violet-50/40 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {approvedTemplate}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-md p-2.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Once added, an approved template <b>cannot be edited or
                      deleted</b>. To use a different template, contact
                      support.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                  <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span>
                    No template added yet. Click <b>Add Template</b> to register
                    your approved WhatsApp message body. After it's added, it
                    can't be edited or deleted.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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

      {/* Add Approved Template — single textarea pop-up. Once
          submitted, the template is locked permanently. */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Add Approved Template
            </DialogTitle>
            <DialogDescription>
              Paste the exact body of your WhatsApp-approved template. Once
              added, it can't be edited or deleted.
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
            <Button
              variant="outline"
              onClick={() => setTemplateDialogOpen(false)}
            >
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