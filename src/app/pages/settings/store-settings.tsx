import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  ArrowLeft,
  Save,
  Store,
  Calendar,
  Clock,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

// ---------- Working Hours ----------
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];
interface DayHours {
  open: string; // HH:mm
  close: string; // HH:mm
  closed: boolean;
}

interface FixedHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
}

export function StoreSettings() {
  const navigate = useNavigate();
  // Store Status — only Accept Orders now (Store Active removed)
  const [acceptOrders, setAcceptOrders] = useState(true);

  // Working Hours — sane defaults; Sunday closed
  const [workingHours, setWorkingHours] = useState<Record<DayKey, DayHours>>({
    mon: { open: "09:00", close: "21:00", closed: false },
    tue: { open: "09:00", close: "21:00", closed: false },
    wed: { open: "09:00", close: "21:00", closed: false },
    thu: { open: "09:00", close: "21:00", closed: false },
    fri: { open: "09:00", close: "21:00", closed: false },
    sat: { open: "09:00", close: "21:00", closed: false },
    sun: { open: "10:00", close: "18:00", closed: true },
  });
  const [applyToAll, setApplyToAll] = useState({ open: "09:00", close: "21:00" });

  // Fixed Holidays — recurring or one-off
  const [holidays, setHolidays] = useState<FixedHoliday[]>([
    { id: "h-1", name: "Republic Day", date: "2026-01-26" },
    { id: "h-2", name: "Holi", date: "2026-03-25" },
    { id: "h-3", name: "Independence Day", date: "2026-08-15" },
    { id: "h-4", name: "Gandhi Jayanti", date: "2026-10-02" },
    { id: "h-5", name: "Diwali", date: "2026-10-21" },
    { id: "h-6", name: "Christmas", date: "2026-12-25" },
  ]);
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");

  // ---- Handlers ----
  const updateDay = (key: DayKey, patch: Partial<DayHours>) =>
    setWorkingHours((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const handleApplyToAll = () => {
    setWorkingHours((prev) => {
      const next = { ...prev };
      for (const d of DAYS) {
        if (!prev[d.key].closed) {
          next[d.key] = { ...prev[d.key], open: applyToAll.open, close: applyToAll.close };
        }
      }
      return next;
    });
    toast.success("Working hours applied to all open days");
  };

  const handleAddHoliday = () => {
    if (!newHolidayName.trim() || !newHolidayDate) {
      toast.error("Please enter both the holiday name and date");
      return;
    }
    if (holidays.some((h) => h.date === newHolidayDate)) {
      toast.error("A holiday already exists on this date");
      return;
    }
    setHolidays((prev) =>
      [
        ...prev,
        { id: `h-${Date.now()}`, name: newHolidayName.trim(), date: newHolidayDate },
      ].sort((a, b) => a.date.localeCompare(b.date)),
    );
    setNewHolidayName("");
    setNewHolidayDate("");
    toast.success("Holiday added");
  };

  const handleRemoveHoliday = (id: string) => {
    const h = holidays.find((x) => x.id === id);
    setHolidays((prev) => prev.filter((x) => x.id !== id));
    if (h) toast.success(`Removed "${h.name}"`);
  };

  const handleSave = () => {
    // Quick validation: ensure open < close on every working day
    const bad: string[] = [];
    for (const d of DAYS) {
      const h = workingHours[d.key];
      if (!h.closed && h.open >= h.close) bad.push(d.label);
    }
    if (bad.length > 0) {
      toast.error(
        `Closing time must be after opening time for: ${bad.join(", ")}`,
      );
      return;
    }
    toast.success("Store settings saved successfully!");
  };

  const formatHolidayDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/settings")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Store className="h-8 w-8 text-blue-600" />
            Store Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your store availability, working hours and holidays
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Store Status — only Accept Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Store Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Accept Orders</Label>
                <p className="text-sm text-gray-600">
                  Turn this off to temporarily stop accepting new orders without
                  closing your store. New orders will be paused until you turn
                  this back on.
                </p>
              </div>
              <Switch
                checked={acceptOrders}
                onCheckedChange={setAcceptOrders}
              />
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Set the days and times your store accepts orders. Outside these
              hours, the store will appear closed to buyers.
            </p>

            {/* Apply-to-all helper */}
            <div className="flex flex-wrap items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-sm font-medium text-blue-900">
                Quick set for all open days:
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={applyToAll.open}
                  onChange={(e) =>
                    setApplyToAll((prev) => ({ ...prev, open: e.target.value }))
                  }
                  className="w-28 h-8"
                />
                <span className="text-sm text-gray-600">to</span>
                <Input
                  type="time"
                  value={applyToAll.close}
                  onChange={(e) =>
                    setApplyToAll((prev) => ({ ...prev, close: e.target.value }))
                  }
                  className="w-28 h-8"
                />
                <Button size="sm" variant="outline" onClick={handleApplyToAll}>
                  Apply to all
                </Button>
              </div>
            </div>

            {/* Per-day editor */}
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
              {DAYS.map((d) => {
                const h = workingHours[d.key];
                return (
                  <div
                    key={d.key}
                    className={`grid grid-cols-1 md:grid-cols-[140px_1fr_auto] items-center gap-3 p-3 ${
                      h.closed ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 w-24">
                        {d.label}
                      </span>
                      {h.closed && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                          Closed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Input
                        type="time"
                        value={h.open}
                        onChange={(e) => updateDay(d.key, { open: e.target.value })}
                        disabled={h.closed}
                        className="w-32 h-9"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <Input
                        type="time"
                        value={h.close}
                        onChange={(e) => updateDay(d.key, { close: e.target.value })}
                        disabled={h.closed}
                        className="w-32 h-9"
                      />
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <Label className="text-xs text-gray-600">Closed</Label>
                      <Switch
                        checked={h.closed}
                        onCheckedChange={(v) => updateDay(d.key, { closed: v })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Fixed Holidays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-rose-600" />
              Fixed Holidays
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              On these dates the store will be marked closed regardless of
              working hours. Add public holidays, regional holidays or planned
              shutdowns.
            </p>

            {/* List of holidays */}
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
              {holidays.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">
                  No fixed holidays configured.
                </div>
              )}
              {holidays.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center">
                      <span className="text-[8px] font-semibold text-rose-700 uppercase">
                        {new Date(h.date + "T00:00:00").toLocaleDateString("en-IN", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-sm font-bold text-rose-800 leading-none">
                        {new Date(h.date + "T00:00:00").getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{h.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatHolidayDate(h.date)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveHoliday(h.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new holiday */}
            <div className="border border-dashed border-gray-300 rounded-lg p-3 grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Holiday Name</Label>
                <Input
                  placeholder="e.g. Ganesh Chaturthi"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                />
              </div>
              <Button onClick={handleAddHoliday} className="gap-1 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Holiday
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input
                placeholder="Enter store name"
                defaultValue="ABC Distributors"
              />
            </div>
            <div className="space-y-2">
              <Label>Store Description</Label>
              <Input
                placeholder="Brief description of your store"
                defaultValue="Premium FMCG distributor serving Maharashtra"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  placeholder="+91 98765 43210"
                  defaultValue="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="store@example.com"
                  defaultValue="abc@distributors.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate("/settings")}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
