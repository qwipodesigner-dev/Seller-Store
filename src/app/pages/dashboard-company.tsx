import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  ArrowLeft,
  Building2,
  Tags,
  Package,
  Users,
  Sparkles,
  ShoppingCart,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  PauseCircle,
  TriangleAlert,
  Layers,
  Hash,
} from "lucide-react";
import {
  getCompanyDrilldown,
  todayISO,
  type CompanyDrilldown,
  type DateRange,
} from "../lib/dashboard-data";

// ---------------------------------------------------------------------
// Per-company drill-down. Routed at /dashboard/companies/:companyId.
// The date range is carried via ?from=YYYY-MM-DD&to=YYYY-MM-DD so a
// link from the seller-level dashboard preserves the chosen window
// (and the page is shareable / bookmarkable).
// ---------------------------------------------------------------------

const TONE_VALUE_COLOR = {
  default: "text-gray-900",
  emerald: "text-emerald-700",
  amber: "text-amber-700",
  rose: "text-rose-700",
  blue: "text-blue-700",
  indigo: "text-indigo-700",
  gray: "text-gray-700",
};

type Tone = keyof typeof TONE_VALUE_COLOR;

export function DashboardCompany() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [searchParams] = useSearchParams();

  const range = useMemo<DateRange>(() => {
    const today = todayISO();
    return {
      from: searchParams.get("from") ?? today,
      to: searchParams.get("to") ?? today,
    };
  }, [searchParams]);

  const [drill, setDrill] = useState<CompanyDrilldown | null>(() =>
    companyId ? getCompanyDrilldown(companyId, range) : null,
  );

  useEffect(() => {
    if (!companyId) return;
    setDrill(getCompanyDrilldown(companyId, range));
  }, [companyId, range]);

  if (!drill) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <Building2 className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-gray-600 font-medium">Company not found.</p>
        <Button
          variant="outline"
          className="mt-4 gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/?from=${range.from}&to=${range.to}`)}
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              {drill.company.name}
              {drill.company.isActive === false && (
                <Badge className="bg-gray-100 text-gray-600 border-gray-300">
                  Inactive
                </Badge>
              )}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Window: {range.from} → {range.to}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Quick stat row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard
            title="Brands"
            icon={<Tags className="h-5 w-5 text-emerald-600" />}
            value={drill.brands.length}
          />
          <KpiCard
            title="SKUs"
            icon={<Package className="h-5 w-5 text-purple-600" />}
            value={drill.skus.total}
            tone="default"
          />
          <KpiCard
            title="Categories"
            icon={<Hash className="h-5 w-5 text-indigo-600" />}
            value={drill.categories.length}
            tone="indigo"
          />
          <KpiCard
            title="Customers"
            icon={<Users className="h-5 w-5 text-blue-600" />}
            value={drill.customers.total}
            tone="blue"
          />
          <KpiCard
            title="Offers"
            icon={<Sparkles className="h-5 w-5 text-purple-600" />}
            value={drill.offers.total}
          />
          <KpiCard
            title="Orders"
            icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
            value={drill.orders.total}
            footer={inrCompact(drill.orders.totalValue)}
          />
        </div>

        {/* SKU status + compliance */}
        <SectionTitle title="SKU rollup" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniCard
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            label="Active SKUs"
            value={drill.skus.active}
            tone="emerald"
          />
          <MiniCard
            icon={<XCircle className="h-4 w-4 text-gray-500" />}
            label="Inactive SKUs"
            value={drill.skus.inactive}
            tone="gray"
          />
          <MiniCard
            icon={<ShieldCheck className="h-4 w-4 text-blue-600" />}
            label="Compliant"
            value={drill.skus.compliant}
            tone="blue"
          />
          <MiniCard
            icon={<TriangleAlert className="h-4 w-4 text-amber-600" />}
            label="Non-compliant"
            value={drill.skus.nonCompliant}
            tone="amber"
          />
        </div>

        {/* Customers + Offers + Orders detail rows */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SubCard title="Customers" icon={<Users className="h-4 w-4 text-blue-600" />}>
            <StatRow label="Active" value={drill.customers.active} tone="emerald" />
            <StatRow label="Blocked" value={drill.customers.blocked} tone="rose" />
            <StatRow label="Total" value={drill.customers.total} bold />
          </SubCard>
          <SubCard title="Offers & Schemes" icon={<Sparkles className="h-4 w-4 text-purple-600" />}>
            <StatRow label="Active" value={drill.offers.active} tone="emerald" />
            <StatRow label="Scheduled" value={drill.offers.scheduled} tone="amber" />
            <StatRow label="Inactive" value={drill.offers.inactive} tone="gray" />
            <StatRow label="Expired" value={drill.offers.expired} tone="rose" />
            <StatRow label="Total" value={drill.offers.total} bold />
          </SubCard>
          <SubCard title="Orders" icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}>
            <StatRow label="New" value={drill.orders.new} tone="amber" icon={<AlertTriangle className="h-3 w-3 text-amber-600" />} />
            <StatRow label="Confirmed" value={drill.orders.confirmed} tone="blue" />
            <StatRow label="Delivered" value={drill.orders.delivered} tone="emerald" icon={<Truck className="h-3 w-3 text-emerald-600" />} />
            <StatRow label="Cancelled" value={drill.orders.cancelled} tone="rose" />
            <StatRow label="Total" value={drill.orders.total} bold />
            <StatRow label="Order value" valueText={inrCompact(drill.orders.totalValue)} bold tone="indigo" />
          </SubCard>
        </div>

        {/* Brands table */}
        <SectionTitle title="Brands under this company" />
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <Th>Brand</Th>
                  <Th align="right">SKUs</Th>
                  <Th align="right">Active</Th>
                  <Th align="right">Compliant</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drill.brands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                      No brands under this company yet.
                    </td>
                  </tr>
                ) : (
                  drill.brands.map((b) => (
                    <tr key={b.brandId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{b.brandName}</span>
                      </td>
                      <Td align="right">{b.skuCount}</Td>
                      <Td align="right">{b.activeSkuCount}</Td>
                      <Td align="right">{b.compliantSkuCount}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Categories chips */}
        <SectionTitle title="Categories" />
        <Card>
          <CardContent className="p-4">
            {drill.categories.length === 0 ? (
              <p className="text-sm text-gray-500">
                No categories — the company has no SKUs yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {drill.categories.map((c) => (
                  <Badge
                    key={c.name}
                    className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1"
                  >
                    {c.name}
                    <span className="text-[10px] opacity-70">· {c.skuCount}</span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <SectionTitle title="Recent orders (in window)" />
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <Th>Order ID</Th>
                  <Th>Buyer</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th align="right">Value</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drill.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      No orders for this company in the selected window.
                    </td>
                  </tr>
                ) : (
                  drill.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-800">
                        {o.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {o.retailerName}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {o.orderDate}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ₹{o.orderValue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent SKUs */}
        <SectionTitle title="Recently updated SKUs" />
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <Th>SKU code</Th>
                  <Th>Name</Th>
                  <Th>Brand</Th>
                  <Th>Category</Th>
                  <Th>Status</Th>
                  <Th>Compliance</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drill.recentSkus.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      No SKUs found for this company yet.
                    </td>
                  </tr>
                ) : (
                  drill.recentSkus.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-800">
                        {s.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{s.brand}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{s.category}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            s.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                          }
                        >
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {s.ondcCompliance.isCompliant ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Compliant
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                            <TriangleAlert className="h-3 w-3" />
                            Non-compliant
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================================
// Subcomponents
// =====================================================================

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-base font-semibold text-gray-900">{title}</h2>;
}

function KpiCard({
  title,
  icon,
  value,
  tone = "default",
  footer,
}: {
  title: string;
  icon: React.ReactNode;
  value: number;
  tone?: Tone;
  footer?: string;
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
        <p className={`text-3xl font-semibold leading-tight ${TONE_VALUE_COLOR[tone]}`}>
          {value.toLocaleString("en-IN")}
        </p>
        {footer && (
          <p className="text-xs text-gray-500 mt-1">{footer}</p>
        )}
      </CardContent>
    </Card>
  );
}

function MiniCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: Tone;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {icon}
          {label}
        </div>
        <p className={`text-2xl font-semibold mt-1 ${TONE_VALUE_COLOR[tone]}`}>
          {value.toLocaleString("en-IN")}
        </p>
      </CardContent>
    </Card>
  );
}

function SubCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-700 font-medium">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-1.5">{children}</CardContent>
    </Card>
  );
}

function StatRow({
  label,
  value,
  valueText,
  tone = "default",
  bold,
  icon,
}: {
  label: string;
  value?: number;
  valueText?: string;
  tone?: Tone;
  bold?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span
        className={`${bold ? "font-semibold" : "font-medium"} ${
          TONE_VALUE_COLOR[tone]
        }`}
      >
        {valueText ?? value?.toLocaleString("en-IN") ?? "—"}
      </span>
    </div>
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

function OrderStatusBadge({
  status,
}: {
  status: "New" | "Confirmed" | "Delivered" | "Cancelled";
}) {
  const tones: Record<typeof status, string> = {
    New: "bg-amber-50 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return <Badge className={tones[status]}>{status}</Badge>;
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
