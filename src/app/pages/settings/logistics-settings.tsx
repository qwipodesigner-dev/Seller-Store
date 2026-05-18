import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Truck, Save, Cpu, Network } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
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
  type LogisticsMode,
} from "../../lib/logistics-settings";

/**
 * Logistics Settings — master toggle for the sidebar Logistics menu.
 *
 * Off by default. When the seller flips the master on, two mutually
 * exclusive mode switches appear — exactly one must be picked:
 *   1. "Tech for both Self & 3PL"
 *   2. "No Tech for Self & Tech for 3PL"
 *
 * Toggling either mode on automatically turns the other off (radio
 * semantics in switch clothing — the user asked for switches, but the
 * two modes are not independent: you pick one or the other, not both).
 *
 * The persisted state is read by the RootLayout sidebar to decide
 * whether the Logistics menu item is disabled or clickable.
 */
export function LogisticsSettingsPage() {
  const navigate = useNavigate();
  const initial = getLogisticsSettings();

  const [enabled, setEnabled] = useState(initial.enabled);
  const [mode, setMode] = useState<LogisticsMode | null>(initial.mode);
  // Track the last saved snapshot so the Save CTA can disable itself
  // when there are no unsaved changes — matches the dirty-flag pattern
  // every other settings card uses.
  const [saved, setSaved] = useState({
    enabled: initial.enabled,
    mode: initial.mode,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isDirty =
    enabled !== saved.enabled || (enabled && mode !== saved.mode);

  // When enabled, exactly one mode must be picked — Save stays disabled
  // until that's true so the seller can't ship an "enabled but empty"
  // configuration.
  const missingMode = enabled && mode === null;
  const saveDisabled = !isDirty || missingMode;

  // Mutually-exclusive switch handler. Turning a switch on selects its
  // mode (and visually flips the other one off); turning the active
  // switch off clears the selection (Save gates until a mode is
  // re-picked).
  const handleModeToggle = (next: LogisticsMode, checked: boolean) => {
    if (checked) {
      setMode(next);
    } else if (mode === next) {
      setMode(null);
    }
  };

  const handleSaveClick = () => setConfirmOpen(true);

  const handleConfirmSave = () => {
    setLogisticsSettings({
      enabled,
      // Clear the mode when the master is off so the store never
      // carries a stale "mode picked but master off" combination.
      mode: enabled ? mode : null,
    });
    setSaved({ enabled, mode: enabled ? mode : null });
    setConfirmOpen(false);
    toast.success("Logistics settings saved.");
  };

  // Human-readable summary for the confirmation dialog.
  const summary = (() => {
    if (!enabled) {
      return "Logistics will be disabled. The Logistics menu will not appear in the sidebar.";
    }
    const label =
      mode === "tech-for-both"
        ? "Tech for both Self & 3PL"
        : "No Tech for Self & Tech for 3PL";
    return `Logistics will be enabled in "${label}" mode. The Logistics menu will be available in the sidebar.`;
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
                  settings card. */}
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
            {/* Master toggle — same outlined-row container Order
                Settings uses for its toggle rows. */}
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

            {/* Mode toggles — only visible when the master is on.
                Mutually exclusive: turning one on flips the other off.
                Two-column grid at md+ keeps the choices comparable
                side-by-side; stacks on narrow screens. */}
            {enabled && (
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-900">
                    Logistics mode
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Pick one — the two modes are mutually exclusive.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Mode 1: Tech for both Self & 3PL */}
                  <div
                    className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${
                      mode === "tech-for-both"
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900">
                          Tech for both Self &amp; 3PL
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Qwipo's logistics tech runs both your own fleet
                        and any 3PL provider deliveries.
                      </p>
                    </div>
                    <Switch
                      checked={mode === "tech-for-both"}
                      onCheckedChange={(v) =>
                        handleModeToggle("tech-for-both", v)
                      }
                      className="mt-0.5"
                    />
                  </div>

                  {/* Mode 2: No Tech for Self & Tech for 3PL */}
                  <div
                    className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${
                      mode === "tech-for-third-party-only"
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900">
                          No Tech for Self &amp; Tech for 3PL
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                        Your in-house dispatch runs outside Qwipo;
                        only the 3PL leg is technology-tracked.
                      </p>
                    </div>
                    <Switch
                      checked={mode === "tech-for-third-party-only"}
                      onCheckedChange={(v) =>
                        handleModeToggle("tech-for-third-party-only", v)
                      }
                      className="mt-0.5"
                    />
                  </div>
                </div>

                {missingMode && (
                  <p className="text-[11px] text-red-600">
                    Pick a mode before saving.
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
