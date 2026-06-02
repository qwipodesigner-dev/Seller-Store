import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Building2,
  Tags,
  Package,
  Users,
  Sparkles,
  ShoppingCart,
  CalendarRange,
  Download,
  ChevronRight,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  PauseCircle,
  TriangleAlert,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDashboardSnapshot,
  presetRange,
  PRESET_RANGE_LABELS,
  type DashboardSnapshot,
  type DateRange,
  type PresetRangeId,
} from "../lib/dashboard-data";
import { subscribeToOrders } from "../lib/orders-data";
import { subscribeToDemoCustomers } from "../lib/customers-demo-data";
import { subscribeToCompanies } from "../lib/admin-catalog";

// ---------------------------------------------------------------------
// Dashboard — seller-wide KPI rollup with a date-range filter, a
// per-company breakdown table, and an XLSX download.
//
// Reads every data store via `getDashboardSnapshot(range)` and re-runs
// the rollup whenever the seller flips a range preset, edits a custom
// range, or any of the underlying stores fires its subscribe
// notification (so a new order or a customer block on another page
// rolls back into the dashboard counts live).
// ---------------------------------------------------------------------

const PRESETS: PresetRangeId[] = [
  "today",
  "last-7",
  "last-30",
  "month-to-date",
  "year-to-date",
];

export function Dashboard() {
  const navigate = useNavigate();
  const [activePreset, setActivePreset] = useState<PresetRangeId | "custom">(
    "last-30",
  );
  const [range, setRange] = useState<DateRange>(() => presetRange("last-30"));
  const [customOpen, setCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(range.from);
  const [customTo, setCustomTo] = useState(range.to);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(() =>
    getDashboardSnapshot(range),
  );

  // Re-run the rollup whenever the range changes or any of the stores
  // we depend on fires a write notification. The other stores
  // (admin-catalog companies, my-sku sampleSKUs, offers QPS schemes)
  // are static at runtime today; if they grow a subscribe API later
  // we can hook them in here without touching the rest of the page.
  useEffect(() => {
    const refresh = () => setSnapshot(getDashboardSnapshot(range));
    refresh();
    const unsubA = subscribeToOrders(refresh);
    const unsubB = subscribeToDemoCustomers(refresh);
    const unsubC = subscribeToCompanies(refresh);
    return () => {
      unsubA();
      unsubB();
      unsubC();
    };
  }, [range]);

  const applyPreset = (id: PresetRangeId) => {
    setActivePreset(id);
    setRange(presetRange(id));
  };

  const applyCustom = () => {
    if (!customFrom || !customTo) {
      toast.error("Please set both dates.");
      return;
    }
    if (customFrom > customTo) {
      toast.error("From date must be on or before To date.");
      return;
    }
    setActivePreset("custom");
    setRange({ from: customFrom, to: customTo });
    setCustomOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar — title, range picker, download. Sticks to the top so
          the seller can re-filter without scrolling back. */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {snapshot.range.from === snapshot.range.to
              ? `Snapshot for ${snapshot.range.from}`
              : `Window: ${snapshot.range.from} → ${snapshot.range.to}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap rounded-md border border-gray-200 bg-white p-1 gap-1">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => applyPreset(p)}
                className={`text-xs px-3 py-1.5 rounded ${
                  activePreset === p
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {PRESET_RANGE_LABELS[p]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setCustomFrom(range.from);
                setCustomTo(range.to);
                setCustomOpen(true);
              }}
              className={`text-xs px-3 py-1.5 rounded inline-flex items-center gap-1 ${
                activePreset === "custom"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <CalendarRange className="h-3.5 w-3.5" />
              Custom
            </button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportSnapshot(snapshot)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download report
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Catalog row */}
        <SectionHeading
          title="Catalog"
          subtitle="Current state of the master catalog — not affected by the date range."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Companies"
            icon={<Building2 className="h-5 w-5 text-blue-600" />}
            mainValue={snapshot.companies.total}
            stats={[
              { label: "Active", value: snapshot.companies.active, tone: "emerald" },
              { label: "Inactive", value: snapshot.companies.inactive, tone: "gray" },
            ]}
          />
          <KpiCard
            title="Brands"
            icon={<Tags className="h-5 w-5 text-emerald-600" />}
            mainValue={snapshot.brands.total}
            stats={[
              { label: "Active", value: snapshot.brands.active, tone: "emerald" },
              { label: "Inactive", value: snapshot.brands.inactive, tone: "gray" },
            ]}
          />
          <KpiCard
            title="SKUs"
            icon={<Package className="h-5 w-5 text-purple-600" />}
            mainValue={snapshot.skus.total}
            stats={[
              { label: "Active", value: snapshot.skus.active, tone: "emerald" },
              { label: "Inactive", value: snapshot.skus.inactive, tone: "gray" },
              { label: "Compliant", value: snapshot.skus.compliant, tone: "blue" },
              {
                label: "Non-compliant",
                value: snapshot.skus.nonCompliant,
                tone: "amber",
              },
            ]}
          />
        </div>

        {/* Customers row */}
        <SectionHeading
          title="Customers"
          subtitle="Current customer base — counts are a snapshot of all linked customers."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            title="Total customers"
            icon={<Users className="h-5 w-5 text-blue-600" />}
            mainValue={snapshot.customers.total}
          />
          <KpiCard
            title="Active customers"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            mainValue={snapshot.customers.active}
            tone="emerald"
          />
          <KpiCard
            title="Blocked customers"
            icon={<XCircle className="h-5 w-5 text-rose-600" />}
            mainValue={snapshot.customers.blocked}
            tone="rose"
          />
        </div>

        {/* Offers row */}
        <SectionHeading
          title="Offers & Schemes"
          subtitle={`Schemes whose validity window overlaps ${snapshot.range.from} → ${snapshot.range.to}.`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Total"
            icon={<Sparkles className="h-5 w-5 text-purple-600" />}
            mainValue={snapshot.offers.total}
          />
          <KpiCard
            title="Active"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            mainValue={snapshot.offers.active}
            tone="emerald"
          />
          <KpiCard
            title="Scheduled"
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            mainValue={snapshot.offers.scheduled}
            tone="amber"
          />
          <KpiCard
            title="Inactive"
            icon={<PauseCircle className="h-5 w-5 text-gray-600" />}
            mainValue={snapshot.offers.inactive}
            tone="gray"
          />
          <KpiCard
            title="Expired"
            icon={<TriangleAlert className="h-5 w-5 text-rose-600" />}
            mainValue={snapshot.offers.expired}
            tone="rose"
          />
        </div>

        {/* Orders row */}
        <SectionHeading
          title="Orders"
          subtitle={`Orders placed between ${snapshot.range.from} and ${snapshot.range.to}.`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="Total orders"
            icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
            mainValue={snapshot.orders.total}
          />
          <KpiCard
            title="Order value"
            icon={<Layers className="h-5 w-5 text-indigo-600" />}
            mainValueText={inrCompact(snapshot.orders.totalValue)}
            tone="indigo"
          />
          <KpiCard
            title="New"
            icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
            mainValue={snapshot.orders.new}
            tone="amber"
          />
          <KpiCard
            title="Confirmed"
            icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
            mainValue={snapshot.orders.confirmed}
            tone="blue"
          />
          <KpiCard
            title="Delivered"
            icon={<Truck className="h-5 w-5 text-emerald-600" />}
            mainValue={snapshot.orders.delivered}
            tone="emerald"
          />
          <KpiCard
            title="Cancelled"
            icon={<XCircle className="h-5 w-5 text-rose-600" />}
            mainValue={snapshot.orders.cancelled}
            tone="rose"
          />
        </div>

        {/* Company breakdown */}
        <SectionHeading
          title="By company"
          subtitle="Click a row to drill into that company's brands, SKUs, customers, offers, and orders."
        />
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <Th>Company</Th>
                  <Th align="right">Brands</Th>
                  <Th align="right">SKUs</Th>
                  <Th align="right">Compliant</Th>
                  <Th align="right">Categories</Th>
                  <Th align="right">Customers</Th>
                  <Th align="right">Offers</Th>
                  <Th align="right">Orders</Th>
                  <Th align="right">Order value</Th>
                  <Th align="right"> </Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {snapshot.companyBreakdown.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-12 text-center text-sm text-gray-500"
                    >
                      No companies linked yet.
                    </td>
                  </tr>
                ) : (
                  snapshot.companyBreakdown.map((row) => (
                    <tr
                      key={row.companyId}
                      onClick={() =>
                        navigate(
                          `/dashboard/companies/${encodeURIComponent(
                            row.companyId,
                          )}?from=${range.from}&to=${range.to}`,
                        )
                      }
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {row.companyName}
                          </span>
                          {!row.isActive && (
                            <Badge className="bg-gray-100 text-gray-600 border-gray-300">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </td>
                      <Td align="right">{row.brandCount}</Td>
                      <Td align="right">
                        {row.skuCount}
                        <span className="text-xs text-gray-500 ml-1">
                          ({row.activeSkuCount} active)
                        </span>
                      </Td>
                      <Td align="right">
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                          {row.compliantSkuCount}
                        </span>
                      </Td>
                      <Td align="right">{row.categoryCount}</Td>
                      <Td align="right">{row.customerCount}</Td>
                      <Td align="right">{row.offerCount}</Td>
                      <Td align="right">{row.orderCount}</Td>
                      <Td align="right">{inrCompact(row.orderValue)}</Td>
                      <Td align="right">
                        <ChevronRight className="h-4 w-4 text-gray-400 inline" />
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Custom range dialog */}
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-blue-600" />
              Custom date range
            </DialogTitle>
            <DialogDescription>
              Pick the From and To dates. Both bounds are inclusive.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyCustom}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =====================================================================
// Subcomponents
// =====================================================================

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

type Tone = "default" | "emerald" | "amber" | "rose" | "blue" | "indigo" | "gray";

const TONE_VALUE_COLOR: Record<Tone, string> = {
  default: "text-gray-900",
  emerald: "text-emerald-700",
  amber: "text-amber-700",
  rose: "text-rose-700",
  blue: "text-blue-700",
  indigo: "text-indigo-700",
  gray: "text-gray-700",
};

interface KpiStat {
  label: string;
  value: number;
  tone?: "emerald" | "amber" | "rose" | "blue" | "gray";
}

function KpiCard({
  title,
  icon,
  mainValue,
  mainValueText,
  tone = "default",
  stats,
}: {
  title: string;
  icon: React.ReactNode;
  mainValue?: number;
  mainValueText?: string;
  tone?: Tone;
  stats?: KpiStat[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-700 font-medium">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p
          className={`text-3xl font-semibold leading-tight ${TONE_VALUE_COLOR[tone]}`}
        >
          {mainValueText ?? mainValue?.toLocaleString("en-IN") ?? "—"}
        </p>
        {stats && stats.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-gray-500">{s.label}</span>
                <span
                  className={`font-medium ${
                    s.tone ? TONE_VALUE_COLOR[s.tone] : "text-gray-900"
                  }`}
                >
                  {s.value.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-${align} text-xs font-semibold uppercase tracking-wider text-gray-600`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td className={`px-4 py-3 text-${align} text-sm text-gray-800`}>
      {children}
    </td>
  );
}

// =====================================================================
// Helpers
// =====================================================================

// "₹12.4L" / "₹50K" / "₹820" — compact Indian formatter used for KPI
// values where space matters.
function inrCompact(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// XLSX download — one workbook with sections matching the dashboard
// layout. Same dynamic-import-ExcelJS pattern used by the other
// download flows in the app so the SDK doesn't ship on the initial
// bundle.
async function exportSnapshot(snapshot: DashboardSnapshot) {
  try {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = "Qwipo Seller Store";
    wb.created = new Date();

    const styleHeader = (row: import("exceljs").Row) => {
      row.font = { bold: true, color: { argb: "FFFFFFFF" } };
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E40AF" },
      };
      row.alignment = { vertical: "middle", horizontal: "left" };
      row.height = 22;
    };

    // Summary sheet
    const summary = wb.addWorksheet("Summary");
    summary.addRow(["Section", "Metric", "Value"]);
    styleHeader(summary.getRow(1));
    summary.addRow([
      "Range",
      "Window",
      `${snapshot.range.from} → ${snapshot.range.to}`,
    ]);
    summary.addRow(["Companies", "Total", snapshot.companies.total]);
    summary.addRow(["Companies", "Active", snapshot.companies.active]);
    summary.addRow(["Companies", "Inactive", snapshot.companies.inactive]);
    summary.addRow(["Brands", "Total", snapshot.brands.total]);
    summary.addRow(["Brands", "Active", snapshot.brands.active]);
    summary.addRow(["Brands", "Inactive", snapshot.brands.inactive]);
    summary.addRow(["SKUs", "Total", snapshot.skus.total]);
    summary.addRow(["SKUs", "Active", snapshot.skus.active]);
    summary.addRow(["SKUs", "Inactive", snapshot.skus.inactive]);
    summary.addRow(["SKUs", "Compliant", snapshot.skus.compliant]);
    summary.addRow(["SKUs", "Non-compliant", snapshot.skus.nonCompliant]);
    summary.addRow(["Customers", "Total", snapshot.customers.total]);
    summary.addRow(["Customers", "Active", snapshot.customers.active]);
    summary.addRow(["Customers", "Blocked", snapshot.customers.blocked]);
    summary.addRow(["Offers", "Total", snapshot.offers.total]);
    summary.addRow(["Offers", "Active", snapshot.offers.active]);
    summary.addRow(["Offers", "Scheduled", snapshot.offers.scheduled]);
    summary.addRow(["Offers", "Inactive", snapshot.offers.inactive]);
    summary.addRow(["Offers", "Expired", snapshot.offers.expired]);
    summary.addRow(["Orders", "Total", snapshot.orders.total]);
    summary.addRow(["Orders", "New", snapshot.orders.new]);
    summary.addRow(["Orders", "Confirmed", snapshot.orders.confirmed]);
    summary.addRow(["Orders", "Delivered", snapshot.orders.delivered]);
    summary.addRow(["Orders", "Cancelled", snapshot.orders.cancelled]);
    summary.addRow(["Orders", "Total value (₹)", snapshot.orders.totalValue]);
    summary.getColumn(1).width = 16;
    summary.getColumn(2).width = 22;
    summary.getColumn(3).width = 28;
    summary.views = [{ state: "frozen", ySplit: 1 }];

    // Company breakdown sheet
    const company = wb.addWorksheet("Companies");
    company.addRow([
      "Company",
      "Status",
      "Brands",
      "SKUs",
      "Active SKUs",
      "Compliant SKUs",
      "Categories",
      "Customers",
      "Offers",
      "Orders",
      "Order value (₹)",
    ]);
    styleHeader(company.getRow(1));
    snapshot.companyBreakdown.forEach((row) => {
      company.addRow([
        row.companyName,
        row.isActive ? "Active" : "Inactive",
        row.brandCount,
        row.skuCount,
        row.activeSkuCount,
        row.compliantSkuCount,
        row.categoryCount,
        row.customerCount,
        row.offerCount,
        row.orderCount,
        row.orderValue,
      ]);
    });
    [40, 12, 10, 10, 12, 14, 12, 12, 10, 10, 16].forEach((w, i) => {
      company.getColumn(i + 1).width = w;
    });
    company.views = [{ state: "frozen", ySplit: 1 }];

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seller_dashboard_${snapshot.range.from}_to_${snapshot.range.to}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Dashboard report downloaded.");
  } catch (err) {
    console.error("[dashboard] export failed", err);
    toast.error("Couldn't generate the report. Please try again.");
  }
}
