import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Truck, Save, Building2, Boxes } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
 *
 * Page chrome and card density mirror Order Settings / Store Settings:
 * compact icon-only Back, single-line title, Save lives INSIDE the
 * card header (not as a floating footer CTA), and the mode grid is
 * responsive — side-by-side at md+ and stacked on narrow screens.
 */
export function LogisticsSettingsPage() {
  const navigate = useNavigate();
  const initial = getLogisticsSettings();

  const [enabled, setEnabled] = useState(initial.enabled);
  const [selfLogistics, setSelfLogistics] = useState(initial.selfLogistics);
  const [thirdPartyLogistics, setThirdPartyLogistics] = useState(
    initial.thirdPartyLogistics,
  );
  // Track the last saved snapshot so the Save CTA can disable itself
  // when there are no unsaved changes — matches the dirty-flag pattern
  // every other settings card uses.
  const [saved, setSaved] = useState({
    enabled: initial.enabled,
    selfLogistics: initial.selfLogistics,
    thirdPartyLogistics: initial.thirdPartyLogistics,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isDirty =
    enabled !== saved.enabled ||
    (enabled &&
      (selfLogistics !== saved.selfLogistics ||
        thirdPartyLogistics !== saved.thirdPartyLogistics));

  // When enabled, at least one of the two modes must be ticked — Save
  // stays disabled otherwise so the seller can't ship an "enabled but
  // empty" configuration.
  const missingMode = enabled && !selfLogistics && !thirdPartyLogistics;
  const saveDisabled = !isDirty || missingMode;

  const handleSaveClick = () => setConfirmOpen(true);

  const handleConfirmSave = () => {
    setLogisticsSettings({
      enabled,
      // Clear sub-options when the master is off so the store never
      // carries stale "self/3PL still on but master off" combinations.
      selfLogistics: enabled ? selfLogistics : false,
      thirdPartyLogistics: enabled ? thirdPartyLogistics : false,
    });
    setSaved({
      enabled,
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
    <div className="p-4 space-y-3 bg-gray-50 min-h-full">
      {/* Compact header — matches Order Settings chrome. */}
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
          <Truck className="h-5 w-5 text-emerald-600" />
          Logistics Settings
        </h1>
      </div>

      {/* Body — same max width as Order Settings so the page sits in the
          familiar visual frame. The card itself flexes to fill it, and
          the mode grid breaks to two columns at md+. */}
      <div className="max-w-5xl space-y-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" />
                Logistics Module
              </CardTitle>
              {/* Save lives in the section header, mirroring every other
                  settings card. Disabled until there's something to
                  save, or if the seller enabled the master without
                  picking a mode. */}
              <Button
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handleSaveClick}
                disabled={saveDisabled}
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Master toggle — pulled into the same border-and-bg
                container Order Settings uses for its Allow Returns
                row, so density and rhythm match. */}
            <div className="flex items-start justify-between gap-3 border border-gray-200 rounded-md p-2.5 bg-gray-50/50">
              <div>
                <Label className="text-sm">Enable Logistics</Label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Turn this on to give your team access to the Logistics
                  module from the sidebar. Off by default.
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            {/* Mode selection — only visible when the master is on.
                Spec: at least one, can be both — checkbox semantics
                even though the user called them "radio buttons" in
                passing. Two-column grid at md+ keeps the choices
                comparable side-by-side; stacks on narrow screens. */}
            {enabled && (
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-900">
                    Logistics modes
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Pick at least one — either of these or both.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 cursor-pointer rounded-md border p-3 transition-colors ${
                      selfLogistics
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <Checkbox
                      checked={selfLogistics}
                      onCheckedChange={(v) => setSelfLogistics(v === true)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900">
                          Self Logistics
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Your team manages dispatch and delivery on your own
                        fleet.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 cursor-pointer rounded-md border p-3 transition-colors ${
                      thirdPartyLogistics
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <Checkbox
                      checked={thirdPartyLogistics}
                      onCheckedChange={(v) =>
                        setThirdPartyLogistics(v === true)
                      }
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900">
                          3PL Logistics
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Hand off dispatch and delivery to a third-party
                        logistics provider.
                      </p>
                    </div>
                  </label>
                </div>

                {missingMode && (
                  <p className="text-[11px] text-red-600">
                    Pick at least one mode before saving.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
