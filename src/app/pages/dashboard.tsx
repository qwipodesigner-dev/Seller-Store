import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCategoryDistribution,
  getDashboardSnapshot,
  getOrderTrend,
  presetRange,
  PRESET_RANGE_LABELS,
  type DashboardSnapshot,
  type DateRange,
  type OrderTrendPoint,
  type PresetRangeId,
  type CategorySliceRow,
} from "../lib/dashboard-data";
import { subscribeToOrders } from "../lib/orders-data";
import { subscribeToDemoCustomers } from "../lib/customers-demo-data";
import { subscribeToCompanies } from "../lib/admin-catalog";

// ---------------------------------------------------------------------
// Dashboard — seller-wide KPI rollup.
//
// Layout follows the canonical chart palette from the design system.
// Charts are recharts (v2) — the same primitives the Reports pages
// already use, so colour, axis, tooltip, and grid styling stay in
// lock-step across the app.
// ---------------------------------------------------------------------

// Canonical chart palette — kept in sync with design-system.tsx so a
// pie slice for "Active" reads the same colour as a line for "Active"
// elsewhere in the app.
const PALETTE = {
  blue: "#2563EB",
  green: "#16A34A",
  amber: "#D97706",
  red: "#DC2626",
  purple: "#9333EA",
  cyan: "#0891B2",
  indigo: "#4F46E5",
  gray: "#6B7280",
};

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
  const [orderTrend, setOrderTrend] = useState<OrderTrendPoint[]>(() =>
    getOrderTrend(range),
  );
  const [categories, setCategories] = useState<CategorySliceRow[]>(() =>
    getCategoryDistribution(),
  );

  useEffect(() => {
    const refresh = () => {
      setSnapshot(getDashboardSnapshot(range));
      setOrderTrend(getOrderTrend(range));
      setCategories(getCategoryDistribution());
    };
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

  // Pie + donut datasets — recharts wants {name, value} pairs.
  const companyPie = useMemo(
    () => [
      { name: "Active", value: snapshot.companies.active, color: PALETTE.green },
      {
        name: "Inactive",
        value: snapshot.companies.inactive,
        color: PALETTE.gray,
      },
    ],
    [snapshot.companies],
  );
  const customerPie = useMemo(
    () => [
      {
        name: "Active",
        value: snapshot.customers.active,
        color: PALETTE.green,
      },
      {
        name: "Blocked",
        value: snapshot.customers.blocked,
        color: PALETTE.red,
      },
    ],
    [snapshot.customers],
  );
  const offerPie = useMemo(
    () => [
      { name: "Active", value: snapshot.offers.active, color: PALETTE.green },
      {
        name: "Scheduled",
        value: snapshot.offers.scheduled,
        color: PALETTE.amber,
      },
      {
        name: "Inactive",
        value: snapshot.offers.inactive,
        color: PALETTE.gray,
      },
      { name: "Expired", value: snapshot.offers.expired, color: PALETTE.red },
    ],
    [snapshot.offers],
  );
  const orderStatusDonut = useMemo(
    () => [
      { name: "New", value: snapshot.orders.new, color: PALETTE.amber },
      {
        name: "Confirmed",
        value: snapshot.orders.confirmed,
        color: PALETTE.blue,
      },
      {
        name: "Delivered",
        value: snapshot.orders.delivered,
        color: PALETTE.green,
      },
      {
        name: "Cancelled",
        value: snapshot.orders.cancelled,
        color: PALETTE.red,
      },
    ],
    [snapshot.orders],
  );

  // SKU compliance radial — single value, percentage.
  const compliancePct = snapshot.skus.total
    ? Math.round((snapshot.skus.compliant / snapshot.skus.total) * 100)
    : 0;
  const complianceRadial = [
    { name: "Compliant", value: compliancePct, fill: PALETTE.green },
  ];

  // Format the trend chart's x-axis labels — short month-day for
  // ranges within the same calendar year, otherwise include the year.
  const trendData = useMemo(
    () =>
      orderTrend.map((p) => ({
        ...p,
        label: shortDate(p.date),
      })),
    [orderTrend],
  );

  // Top 6 categories for the bar chart; smaller categories collapse
  // into the long-tail tooltip via the table below.
  const topCategories = useMemo(() => categories.slice(0, 6), [categories]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar — range picker + download. The page-level "Dashboard"
          heading is supplied by the top nav bar; we don't repeat it. */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
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
            {activePreset === "custom"
              ? `${range.from} → ${range.to}`
              : "Custom"}
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Hero KPI strip — 4 wide cards with the marquee numbers. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HeroTile
            title="Companies"
            icon={<Building2 className="h-5 w-5 text-blue-600" />}
            value={snapshot.companies.total}
            chips={[
              { label: "Active", value: snapshot.companies.active, tone: "emerald" },
              { label: "Inactive", value: snapshot.companies.inactive, tone: "gray" },
            ]}
          />
          <HeroTile
            title="Brands"
            icon={<Tags className="h-5 w-5 text-emerald-600" />}
            value={snapshot.brands.total}
            chips={[
              { label: "Active", value: snapshot.brands.active, tone: "emerald" },
              { label: "Inactive", value: snapshot.brands.inactive, tone: "gray" },
            ]}
          />
          <HeroTile
            title="SKUs"
            icon={<Package className="h-5 w-5 text-purple-600" />}
            value={snapshot.skus.total}
            chips={[
              { label: "Active", value: snapshot.skus.active, tone: "emerald" },
              {
                label: "Compliant",
                value: snapshot.skus.compliant,
                tone: "blue",
              },
            ]}
          />
          <HeroTile
            title="Customers"
            icon={<Users className="h-5 w-5 text-indigo-600" />}
            value={snapshot.customers.total}
            chips={[
              { label: "Active", value: snapshot.customers.active, tone: "emerald" },
              { label: "Blocked", value: snapshot.customers.blocked, tone: "rose" },
            ]}
          />
        </div>

        {/* Visualization grid — 3 columns of donut / radial part-of-whole */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PartOfWholeCard
            title="Companies"
            icon={<Building2 className="h-4 w-4 text-blue-600" />}
            data={companyPie}
            centerLabel={snapshot.companies.total.toLocaleString("en-IN")}
            centerCaption="Total"
          />
          <PartOfWholeCard
            title="Customers"
            icon={<Users className="h-4 w-4 text-indigo-600" />}
            data={customerPie}
            centerLabel={snapshot.customers.total.toLocaleString("en-IN")}
            centerCaption="Total"
          />
          <RadialKpiCard
            title="SKU compliance"
            icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
            data={complianceRadial}
            value={compliancePct}
            caption={`${snapshot.skus.compliant.toLocaleString("en-IN")} / ${snapshot.skus.total.toLocaleString("en-IN")} compliant`}
          />
        </div>

        {/* Offers row — KPI tiles + offers status donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-700 font-medium">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Offers &amp; Schemes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <DonutBlock
                data={offerPie}
                centerLabel={snapshot.offers.total.toLocaleString("en-IN")}
                centerCaption="Total"
              />
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatusTile
                label="Active"
                value={snapshot.offers.active}
                tone="emerald"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              />
              <StatusTile
                label="Scheduled"
                value={snapshot.offers.scheduled}
                tone="amber"
                icon={<Clock className="h-3.5 w-3.5" />}
              />
              <StatusTile
                label="Inactive"
                value={snapshot.offers.inactive}
                tone="gray"
                icon={<PauseCircle className="h-3.5 w-3.5" />}
              />
              <StatusTile
                label="Expired"
                value={snapshot.offers.expired}
                tone="rose"
                icon={<TriangleAlert className="h-3.5 w-3.5" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders — KPI hero tiles + trend area chart + status donut */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Trend area chart — spans 2 columns on xl+. */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700 font-medium">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                Order trend
              </CardTitle>
              <div className="flex items-center gap-4 text-xs">
                <MarqueeStat
                  label="Total"
                  value={snapshot.orders.total.toLocaleString("en-IN")}
                  tone="blue"
                />
                <MarqueeStat
                  label="Value"
                  value={inrCompact(snapshot.orders.totalValue)}
                  tone="indigo"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="ordersAreaFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={PALETTE.blue} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={PALETTE.blue} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      // Skip every-other tick when there's a lot of data so
                      // the axis isn't crammed.
                      interval={trendData.length > 14 ? "preserveStartEnd" : 0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                    />
                    <RechartsTooltip
                      contentStyle={{ fontSize: 12 }}
                      labelClassName="text-xs"
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke={PALETTE.blue}
                      strokeWidth={2}
                      fill="url(#ordersAreaFill)"
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Quick status strip under the chart. */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <StatusTile
                  label="New"
                  value={snapshot.orders.new}
                  tone="amber"
                  icon={<AlertTriangle className="h-3.5 w-3.5" />}
                />
                <StatusTile
                  label="Confirmed"
                  value={snapshot.orders.confirmed}
                  tone="blue"
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                />
                <StatusTile
                  label="Delivered"
                  value={snapshot.orders.delivered}
                  tone="emerald"
                  icon={<Truck className="h-3.5 w-3.5" />}
                />
                <StatusTile
                  label="Cancelled"
                  value={snapshot.orders.cancelled}
                  tone="rose"
                  icon={<XCircle className="h-3.5 w-3.5" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order status donut */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-700 font-medium">
                <Wallet className="h-4 w-4 text-blue-600" />
                Status split
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DonutBlock
                data={orderStatusDonut}
                centerLabel={snapshot.orders.total.toLocaleString("en-IN")}
                centerCaption="Orders"
              />
            </CardContent>
          </Card>
        </div>

        {/* SKU distribution by category — bar chart. */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-700 font-medium">
              <Tags className="h-4 w-4 text-emerald-600" />
              SKUs by category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {topCategories.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                No SKUs in the catalog yet.
              </p>
            ) : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCategories}
                    margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "rgba(37,99,235,0.06)" }}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Bar
                      dataKey="skuCount"
                      fill={PALETTE.blue}
                      radius={[6, 6, 0, 0]}
                      name="SKUs"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company breakdown — click a row to drill in. */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-700 font-medium">
              <Building2 className="h-4 w-4 text-blue-600" />
              By company
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <Th>Company</Th>
                    <Th align="right">Brands</Th>
                    <Th align="right">SKUs</Th>
                    <Th align="right">Compliant</Th>
                    <Th align="right">Customers</Th>
                    <Th align="right">Offers</Th>
                    <Th align="right">Orders</Th>
                    <Th align="right">Order value</Th>
                    <Th align="right"></Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {snapshot.companyBreakdown.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
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
                            ({row.activeSkuCount} act.)
                          </span>
                        </Td>
                        <Td align="right">
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                            {row.compliantSkuCount}
                          </span>
                        </Td>
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
          </CardContent>
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

const TONE_CHIP_BG: Record<Tone, string> = {
  default: "bg-gray-100 text-gray-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  blue: "bg-blue-50 text-blue-700",
  indigo: "bg-indigo-50 text-indigo-700",
  gray: "bg-gray-100 text-gray-700",
};

interface HeroChip {
  label: string;
  value: number;
  tone: Tone;
}

function HeroTile({
  title,
  icon,
  value,
  chips,
}: {
  title: string;
  icon: React.ReactNode;
  value: number;
  chips?: HeroChip[];
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {icon}
          {title}
        </div>
        <p className="text-3xl font-semibold text-gray-900 leading-tight mt-1">
          {value.toLocaleString("en-IN")}
        </p>
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {chips.map((c) => (
              <span
                key={c.label}
                className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${TONE_CHIP_BG[c.tone]}`}
              >
                {c.label}
                <span className="font-semibold">
                  {c.value.toLocaleString("en-IN")}
                </span>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusTile({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: Tone;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-md border border-gray-200 p-3 bg-white`}
    >
      <div className={`flex items-center gap-1.5 text-xs ${TONE_VALUE_COLOR[tone]}`}>
        {icon}
        {label}
      </div>
      <p className="text-xl font-semibold text-gray-900 mt-1 leading-none">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function MarqueeStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className={`text-base font-semibold ${TONE_VALUE_COLOR[tone]}`}>
        {value}
      </p>
    </div>
  );
}

function PartOfWholeCard({
  title,
  icon,
  data,
  centerLabel,
  centerCaption,
}: {
  title: string;
  icon: React.ReactNode;
  data: Array<{ name: string; value: number; color: string }>;
  centerLabel: string;
  centerCaption: string;
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
        <DonutBlock
          data={data}
          centerLabel={centerLabel}
          centerCaption={centerCaption}
        />
      </CardContent>
    </Card>
  );
}

function DonutBlock({
  data,
  centerLabel,
  centerCaption,
}: {
  data: Array<{ name: string; value: number; color: string }>;
  centerLabel: string;
  centerCaption: string;
}) {
  const total = data.reduce((n, d) => n + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-32 w-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={total === 0 ? [{ name: "Empty", value: 1, color: "#E5E7EB" }] : data}
              dataKey="value"
              nameKey="name"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={2}
              strokeWidth={0}
            >
              {(total === 0 ? [{ name: "Empty", value: 1, color: "#E5E7EB" }] : data).map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            {total > 0 && (
              <RechartsTooltip contentStyle={{ fontSize: 12 }} />
            )}
          </PieChart>
        </ResponsiveContainer>
        {/* Centered metric — sits above the donut hole. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-semibold text-gray-900 leading-none">
            {centerLabel}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">{centerCaption}</p>
        </div>
      </div>
      <ul className="flex-1 min-w-0 space-y-1 text-xs">
        {data.map((d) => (
          <li
            key={d.name}
            className="flex items-center justify-between gap-2"
          >
            <span className="inline-flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-gray-600 truncate">{d.name}</span>
            </span>
            <span className="font-medium text-gray-900">
              {d.value.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RadialKpiCard({
  title,
  icon,
  data,
  value,
  caption,
}: {
  title: string;
  icon: React.ReactNode;
  data: Array<{ name: string; value: number; fill: string }>;
  value: number;
  caption: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-700 font-medium">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex items-center gap-4">
        <div className="h-32 w-32 shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: "#F3F4F6" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-semibold text-gray-900 leading-none">
              {value}%
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">Compliant</p>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500">{caption}</p>
        </div>
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

function inrCompact(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// "May 04" / "2026-04-05" — short label for chart axes. We use the
// long form only when the range covers more than one year.
function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

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
