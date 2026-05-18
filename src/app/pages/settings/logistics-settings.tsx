import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Truck, Save } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import {
  getLogisticsSettings,
  setLogisticsSettings,
} from "../../lib/logistics-settings";

/**
 * Logistics Settings — master toggle for the sidebar Logistics menu.
 *
 * Off by default. When the seller flips it on they pick at least one of
 * the two modes — Self Logistics, 3PL Logistics, or both — and confirm
 * the save in a follow-up dialog. The persisted state is read by the
 * RootLayout sidebar to decide whether the Logistics menu item is
 * disabled or clickable.
 */
export function LogisticsSettingsPage() {
  const navigate = useNavigate();
  const initial = getLogisticsSettings();

  const [enabled, setEnabled] = useState(initial.enabled);
  const [selfLogistics, setSelfLogistics] = useState(initial.selfLogistics);
  const [thirdPartyLogistics, setThirdPartyLogistics] = useState(
    initial.thirdPartyLogistics,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  // When enabled, at least one of the two modes must be ticked — Save
  // stays disabled otherwise so the seller can't ship an "enabled but
  // empty" configuration.
  const saveDisabled =
    enabled && !selfLogistics && !thirdPartyLogistics;

  const handleSaveClick = () => setConfirmOpen(true);

  const handleConfirmSave = () => {
    setLogisticsSettings({
      enabled,
      // Clear sub-options when the master is off so the store never
      // carries stale "self/3PL still on but master off" combinations.
      selfLogistics: enabled ? selfLogistics : false,
      thirdPartyLogistics: enabled ? thirdPartyLogistics : false,
    });
    setConfirmOpen(false);
    toast.success("Logistics settings saved.");
  };

  // Build the human-readable summary used in the confirmation dialog.
  const summary = (() => {
    if (!enabled) {
      return "Logistics will be disabled. The Logistics menu will not appear in the sidebar.";
    }
    const modes = [
      selfLogistics ? "Self Logistics" : null,
      thirdPartyLogistics ? "3PL Logistics" : null,
    ].filter(Boolean);
    return `Logistics will be enabled with ${modes.join(" + ")}. The Logistics menu will be available in the sidebar.`;
  })();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Page header — Back to Settings + title + icon. Mirrors the
          chrome on Store Settings / Order Settings. */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/settings")}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-amber-600" />
          <h1 className="text-base font-semibold text-gray-900">
            Logistics Settings
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-4">
          <Card>
            <CardContent className="p-5 space-y-5">
              {/* Master toggle */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-900">
                    Enable Logistics
                  </Label>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Turn this on to give your team access to the Logistics
                    module from the sidebar. Off by default.
                  </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>

              {/* Mode selection — only visible when the master is on.
                  Spec: at least one, can be both — checkbox semantics
                  (not radio) even though the user called them "radio
                  buttons" in passing. */}
              {enabled && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Logistics modes
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pick at least one — either of these or both.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer rounded-md border border-gray-200 p-3 hover:border-gray-300">
                    <Checkbox
                      checked={selfLogistics}
                      onCheckedChange={(v) => setSelfLogistics(v === true)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Self Logistics
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Your team manages dispatch and delivery on your own
                        fleet.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer rounded-md border border-gray-200 p-3 hover:border-gray-300">
                    <Checkbox
                      checked={thirdPartyLogistics}
                      onCheckedChange={(v) =>
                        setThirdPartyLogistics(v === true)
                      }
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        3PL Logistics
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Hand off dispatch and delivery to a third-party
                        logistics provider.
                      </p>
                    </div>
                  </label>

                  {saveDisabled && (
                    <p className="text-xs text-red-600 pt-1">
                      Pick at least one mode before saving.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save CTA */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveClick}
              className="gap-2"
              disabled={saveDisabled}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation dialog — names the impact in plain English so
          the seller knows exactly what they're saying yes to. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Save logistics settings?</DialogTitle>
            <DialogDescription>{summary}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
