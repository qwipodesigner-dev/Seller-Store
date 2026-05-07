import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
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
  Save,
  Store,
  Calendar,
  Clock,
  Trash2,
  Plus,
  Warehouse as WarehouseIcon,
  CheckCircle2,
  Star,
} from "lucide-react";
import { toast } from "sonner";

// ---------- Working Hours ----------
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: "mon", label: "Monday", short: "Mon" },
  { key: "tue", label: "Tuesday", short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday", short: "Thu" },
  { key: "fri", label: "Friday", short: "Fri" },
  { key: "sat", label: "Saturday", short: "Sat" },
  { key: "sun", label: "Sunday", short: "Sun" },
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

// ---------- Warehouses ----------
// Each SKU maps to a warehouse via Location ID; the default warehouse
// is what new SKUs and bulk imports auto-pick. Sellers usually have
// 1–3 warehouses, so a small inline list (no pagination) is enough.
interface Warehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
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

  // Warehouses — seeded with one default so the page never shows an
  // empty list. Phase 1 sellers ship from a single warehouse most of
  // the time, so the seed mirrors that.
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: "wh-1",
      name: "Warehouse 1",
      address: "Plot 14, MIDC Industrial Estate",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400072",
      isDefault: true,
    },
  ]);
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);
  const [warehouseDraft, setWarehouseDraft] = useState<Omit<Warehouse, "id" | "isDefault"> & { isDefault: boolean }>({
    name: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    isDefault: false,
  });
  const [warehouseErrors, setWarehouseErrors] = useState<{
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  }>({});

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

  // ---- Warehouse handlers ----
  const openCreateWarehouse = () => {
    setWarehouseDraft({
      name: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      // First warehouse must be default; auto-check the box and lock it.
      isDefault: warehouses.length === 0,
    });
    setWarehouseErrors({});
    setWarehouseDialogOpen(true);
  };

  const validateWarehouseDraft = () => {
    const errs: typeof warehouseErrors = {};
    if (!warehouseDraft.name.trim()) errs.name = "Warehouse name is required";
    if (!warehouseDraft.address.trim()) errs.address = "Address is required";
    if (!warehouseDraft.city.trim()) errs.city = "City is required";
    if (!warehouseDraft.state.trim()) errs.state = "State is required";
    if (!warehouseDraft.pinCode.trim()) {
      errs.pinCode = "PIN is required";
    } else if (!/^\d{6}$/.test(warehouseDraft.pinCode.trim())) {
      errs.pinCode = "PIN must be a 6-digit number";
    }
    setWarehouseErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveWarehouse = () => {
    if (!validateWarehouseDraft()) return;
    const id = `wh-${Date.now()}`;
    const makeDefault = warehouseDraft.isDefault || warehouses.length === 0;
    setWarehouses((prev) => {
      const next: Warehouse[] = prev.map((w) =>
        makeDefault ? { ...w, isDefault: false } : w,
      );
      next.push({
        id,
        name: warehouseDraft.name.trim(),
        address: warehouseDraft.address.trim(),
        city: warehouseDraft.city.trim(),
        state: warehouseDraft.state.trim(),
        pinCode: warehouseDraft.pinCode.trim(),
        isDefault: makeDefault,
      });
      return next;
    });
    setWarehouseDialogOpen(false);
    toast.success(
      makeDefault
        ? `Created "${warehouseDraft.name.trim()}" and set as default`
        : `Created "${warehouseDraft.name.trim()}"`,
    );
  };

  const handleSetDefaultWarehouse = (id: string) => {
    setWarehouses((prev) =>
      prev.map((w) => ({ ...w, isDefault: w.id === id })),
    );
    const w = warehouses.find((x) => x.id === id);
    if (w) toast.success(`"${w.name}" is now the default warehouse`);
  };

  const handleRemoveWarehouse = (id: string) => {
    const w = warehouses.find((x) => x.id === id);
    if (!w) return;
    if (w.isDefault) {
      toast.error("Set another warehouse as default before removing this one");
      return;
    }
    setWarehouses((prev) => prev.filter((x) => x.id !== id));
    toast.success(`Removed "${w.name}"`);
  };

  const isDraftValid =
    warehouseDraft.name.trim() !== "" &&
    warehouseDraft.address.trim() !== "" &&
    warehouseDraft.city.trim() !== "" &&
    warehouseDraft.state.trim() !== "" &&
    /^\d{6}$/.test(warehouseDraft.pinCode.trim());

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
      month: "short",
    });
  };

  return (
    <div className="p-4 space-y-3 bg-gray-50 min-h-full">
      {/* Compact header — single line, icon left, action buttons right.
          Saves a full row vs. the old two-line subtitle layout. */}
      <div className="flex items-center justify-between gap-3">
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
            <Store className="h-5 w-5 text-blue-600" />
            Store Settings
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="max-w-5xl space-y-3">
        {/* Row 1: Store Status + Warehouses side-by-side. Two short
            cards in one row instead of two stacked rows. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Store Status — only Accept Orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Store Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label className="text-sm">Accept Orders</Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pause new orders without closing the store.
                  </p>
                </div>
                <Switch checked={acceptOrders} onCheckedChange={setAcceptOrders} />
              </div>
            </CardContent>
          </Card>

          {/* Warehouses card — list + Add Warehouse CTA in the header */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <WarehouseIcon className="h-4 w-4 text-purple-600" />
                  Warehouses
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                    {warehouses.length}
                  </Badge>
                </CardTitle>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={openCreateWarehouse}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Warehouse
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {warehouses.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">
                  No warehouses yet. Add one to publish SKUs.
                </p>
              ) : (
                warehouses.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between gap-2 border border-gray-200 rounded-md p-2 hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {w.name}
                        </p>
                        {w.isDefault && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1 h-5">
                            <Star className="h-2.5 w-2.5 fill-emerald-700" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">
                        {w.city}, {w.state} · {w.pinCode}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!w.isDefault && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleSetDefaultWarehouse(w.id)}
                          title="Make this the default warehouse"
                        >
                          Set default
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveWarehouse(w.id)}
                        title={
                          w.isDefault
                            ? "Pick another default first"
                            : `Remove ${w.name}`
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Working Hours — compact rows, one line each. Quick-set bar
            and per-day editor share the same card so the section
            stays inside one viewport. */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {/* Apply-to-all helper — single compact row */}
            <div className="flex flex-wrap items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5">
              <span className="text-xs font-medium text-blue-900">
                Quick set all open days:
              </span>
              <Input
                type="time"
                value={applyToAll.open}
                onChange={(e) =>
                  setApplyToAll((prev) => ({ ...prev, open: e.target.value }))
                }
                className="w-24 h-7 text-xs"
              />
              <span className="text-xs text-gray-600">to</span>
              <Input
                type="time"
                value={applyToAll.close}
                onChange={(e) =>
                  setApplyToAll((prev) => ({ ...prev, close: e.target.value }))
                }
                className="w-24 h-7 text-xs"
              />
              <Button size="sm" variant="outline" onClick={handleApplyToAll} className="h-7 text-xs">
                Apply
              </Button>
            </div>

            {/* Per-day editor — denser grid, no inset row backgrounds */}
            <div className="border border-gray-200 rounded-md divide-y divide-gray-100">
              {DAYS.map((d) => {
                const h = workingHours[d.key];
                return (
                  <div
                    key={d.key}
                    className="grid grid-cols-[80px_1fr_auto] items-center gap-2 px-2 py-1.5"
                  >
                    <span className="text-xs font-medium text-gray-800">
                      {d.short}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="time"
                        value={h.open}
                        onChange={(e) => updateDay(d.key, { open: e.target.value })}
                        disabled={h.closed}
                        className="w-24 h-7 text-xs"
                      />
                      <span className="text-xs text-gray-500">to</span>
                      <Input
                        type="time"
                        value={h.close}
                        onChange={(e) => updateDay(d.key, { close: e.target.value })}
                        disabled={h.closed}
                        className="w-24 h-7 text-xs"
                      />
                      {h.closed && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                          Closed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Label className="text-[11px] text-gray-600">Closed</Label>
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

        {/* Fixed Holidays — flat list with smaller date pills, add-row
            inline at the bottom. */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-600" />
              Fixed Holidays
              <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                {holidays.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {holidays.length === 0 && (
                <div className="md:col-span-2 p-2 text-center text-xs text-gray-500 border border-gray-200 rounded-md">
                  No fixed holidays configured.
                </div>
              )}
              {holidays.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-2 border border-gray-200 rounded-md px-2 py-1.5 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shrink-0">
                      {formatHolidayDate(h.date)}
                    </span>
                    <p className="text-sm text-gray-900 truncate">{h.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveHoliday(h.id)}
                    title={`Remove ${h.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new holiday — single compact row */}
            <div className="border border-dashed border-gray-300 rounded-md p-2 grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-2 items-end">
              <Input
                placeholder="Holiday name (e.g. Ganesh Chaturthi)"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                className="h-8 text-sm"
              />
              <Input
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="h-8 text-sm"
              />
              <Button onClick={handleAddHoliday} size="sm" className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Store Information — read-only, two-column compact grid */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm">Store Information</CardTitle>
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 leading-none"
                title="Store Information comes from the seller's onboarding profile and cannot be edited here."
              >
                Read-only
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Store Name</Label>
              <Input
                readOnly
                value="ABC Distributors"
                className="bg-gray-100 cursor-not-allowed h-8 text-sm focus-visible:ring-0 focus-visible:border-input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Store Description</Label>
              <Input
                readOnly
                value="Premium FMCG distributor serving Maharashtra"
                className="bg-gray-100 cursor-not-allowed h-8 text-sm focus-visible:ring-0 focus-visible:border-input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Contact Number</Label>
              <Input
                readOnly
                value="+91 98765 43210"
                className="bg-gray-100 cursor-not-allowed h-8 text-sm focus-visible:ring-0 focus-visible:border-input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                readOnly
                value="abc@distributors.com"
                className="bg-gray-100 cursor-not-allowed h-8 text-sm focus-visible:ring-0 focus-visible:border-input"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Warehouse dialog — kept short: name, full address,
          city/state, PIN, default toggle. The first warehouse is
          forced as default; subsequent ones can opt in via the
          checkbox. Inline red helper text on each field replaces
          popup toasts (matches the rest of Phase 1). */}
      <Dialog open={warehouseDialogOpen} onOpenChange={setWarehouseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WarehouseIcon className="h-5 w-5 text-purple-600" />
              Add Warehouse
            </DialogTitle>
            <DialogDescription>
              Sellers can ship from one or more warehouses. The default
              warehouse is auto-selected for new SKUs and bulk imports.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">
                Warehouse Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={warehouseDraft.name}
                onChange={(e) => {
                  setWarehouseDraft((p) => ({ ...p, name: e.target.value }));
                  if (warehouseErrors.name)
                    setWarehouseErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="e.g. Mumbai Hub"
                aria-invalid={!!warehouseErrors.name}
              />
              {warehouseErrors.name && (
                <p className="text-[11px] text-red-600">{warehouseErrors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                value={warehouseDraft.address}
                onChange={(e) => {
                  setWarehouseDraft((p) => ({ ...p, address: e.target.value }));
                  if (warehouseErrors.address)
                    setWarehouseErrors((p) => ({ ...p, address: undefined }));
                }}
                placeholder="Street, area, landmark…"
                aria-invalid={!!warehouseErrors.address}
              />
              {warehouseErrors.address && (
                <p className="text-[11px] text-red-600">{warehouseErrors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={warehouseDraft.city}
                  onChange={(e) => {
                    setWarehouseDraft((p) => ({ ...p, city: e.target.value }));
                    if (warehouseErrors.city)
                      setWarehouseErrors((p) => ({ ...p, city: undefined }));
                  }}
                  placeholder="Mumbai"
                  aria-invalid={!!warehouseErrors.city}
                />
                {warehouseErrors.city && (
                  <p className="text-[11px] text-red-600">{warehouseErrors.city}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={warehouseDraft.state}
                  onChange={(e) => {
                    setWarehouseDraft((p) => ({ ...p, state: e.target.value }));
                    if (warehouseErrors.state)
                      setWarehouseErrors((p) => ({ ...p, state: undefined }));
                  }}
                  placeholder="Maharashtra"
                  aria-invalid={!!warehouseErrors.state}
                />
                {warehouseErrors.state && (
                  <p className="text-[11px] text-red-600">{warehouseErrors.state}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">
                PIN Code <span className="text-red-500">*</span>
              </Label>
              <Input
                inputMode="numeric"
                value={warehouseDraft.pinCode}
                onChange={(e) => {
                  setWarehouseDraft((p) => ({
                    ...p,
                    pinCode: e.target.value.replace(/\D/g, "").slice(0, 6),
                  }));
                  if (warehouseErrors.pinCode)
                    setWarehouseErrors((p) => ({ ...p, pinCode: undefined }));
                }}
                placeholder="6-digit PIN"
                className="w-32"
                aria-invalid={!!warehouseErrors.pinCode}
              />
              {warehouseErrors.pinCode && (
                <p className="text-[11px] text-red-600">{warehouseErrors.pinCode}</p>
              )}
            </div>

            {/* Default toggle — locked on for the first warehouse so
                the seller can't end up with zero defaults. */}
            <div className="flex items-start justify-between gap-3 border border-gray-200 rounded-md p-2.5 bg-gray-50">
              <div>
                <Label className="text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Set as default warehouse
                </Label>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {warehouses.length === 0
                    ? "First warehouse must be the default."
                    : "New SKUs and bulk imports will auto-pick this warehouse."}
                </p>
              </div>
              <Switch
                checked={warehouseDraft.isDefault}
                onCheckedChange={(v) =>
                  setWarehouseDraft((p) => ({ ...p, isDefault: v }))
                }
                disabled={warehouses.length === 0}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWarehouseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWarehouse} disabled={!isDraftValid}>
              Add Warehouse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
