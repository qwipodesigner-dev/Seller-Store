import { useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Pencil,
  Trash2,
  // Per-offer-type icons — match the Create Offers picker.
  Layers,
  IndianRupee,
  Gift,
  Boxes,
  Receipt,
  Store as StoreIcon,
  Rocket,
  Award,
  Package,
  Clock,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ListPagination } from "../../components/ui/list-pagination";
import {
  OffersFilterDrawer,
  type OfferTypeOption,
} from "../../components/filter-drawers/offers-filter-drawer";

// =====================================================================
// Empty-mode demo page for "Offers & Schemes 2"
//
// Lifecycle parity with the live page (same 10-card "Create Offers"
// picker, per-row View / Edit), but every offer type is wired:
//   QPS replicates the live slab editor (qty bands × discount %).
//   Value Slab uses the same shape on order value instead of qty.
//   BOGO, Case Bonus, Off-Invoice, Display Allowance, Launch
//   Incentive, Loyalty Rebate, Combo Bundle, Early Payment each get
//   the structured inputs that match the offer's real-world shape.
//
// State is in-memory only — refreshing resets to the seed catalogue.
// =====================================================================

type OfferKind =
  | "qps"
  | "value-slab"
  | "bogo"
  | "case-bonus"
  | "off-invoice"
  | "display-allowance"
  | "launch-incentive"
  | "loyalty-rebate"
  | "combo-bundle"
  | "early-payment";

type OfferStatus = "Active" | "Inactive" | "Scheduled" | "Expired";

// ---------------------------------------------------------------------
// Type-specific config payloads (tagged union — the discriminator is
// `kind`). Saving an offer goes through one of these, so View and Edit
// can round-trip the structured state instead of parsing a string.
// ---------------------------------------------------------------------

interface QpsSlab {
  minQty: number;
  maxQty: number | null; // null = ∞
  discountPct: number;
}

interface ValueSlabTier {
  minValue: number;
  maxValue: number | null; // null = ∞
  discountPct: number;
}

type OfferConfig =
  | { kind: "qps"; sellingPrice: number; slabs: QpsSlab[] }
  | { kind: "value-slab"; tiers: ValueSlabTier[] }
  | { kind: "bogo"; buyQty: number; freeQty: number }
  | { kind: "case-bonus"; buyCases: number; freeCases: number }
  | {
      kind: "off-invoice";
      discountType: "percent" | "flat";
      value: number;
    }
  | {
      kind: "display-allowance";
      amountPerStore: number;
      requirement: string;
      frequency: "Weekly" | "Fortnightly" | "Monthly";
    }
  | {
      kind: "launch-incentive";
      discountPerUnit: number;
      durationDays: number;
      minQty: number;
    }
  | {
      kind: "loyalty-rebate";
      rebatePct: number;
      afterReorders: number;
      payoutFrequency: "Monthly" | "Quarterly" | "Half-yearly";
    }
  | {
      kind: "combo-bundle";
      bundleSkuCode: string;
      bundleSkuName: string;
      discountType: "percent" | "flat";
      value: number;
    }
  | { kind: "early-payment"; discountPct: number; withinDays: number };

interface DemoOffer {
  id: string;
  skuCode: string;
  skuName: string;
  config: OfferConfig;
  startDate: string;
  endDate: string;
  status: OfferStatus;
}

// ---------------------------------------------------------------------
// Per-type display metadata: label, description, icon, colours.
// Used by both the picker dialog and the row badge in the table.
// ---------------------------------------------------------------------

const OFFER_TYPE_META: Record<
  OfferKind,
  {
    label: string;
    description: string;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  }
> = {
  qps: {
    label: "QPS",
    description: "Quantity-based price slabs with tiered discounts",
    icon: Layers,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200",
  },
  "value-slab": {
    label: "Value Slab",
    description: "Order value-based discount tiers",
    icon: IndianRupee,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
  },
  bogo: {
    label: "BOGO",
    description: "Buy X quantity, get Y free units",
    icon: Gift,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    badgeBg: "bg-pink-50",
    badgeText: "text-pink-700",
    badgeBorder: "border-pink-200",
  },
  "case-bonus": {
    label: "Case Bonus",
    description: "Extra cases free on bulk purchase",
    icon: Boxes,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
  },
  "off-invoice": {
    label: "Off-Invoice",
    description: "Flat discount applied on invoice total",
    icon: Receipt,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
  },
  "display-allowance": {
    label: "Display Allowance",
    description: "Incentive for in-store product display",
    icon: StoreIcon,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    badgeBg: "bg-cyan-50",
    badgeText: "text-cyan-700",
    badgeBorder: "border-cyan-200",
  },
  "launch-incentive": {
    label: "Launch Incentive",
    description: "Special pricing for new product launches",
    icon: Rocket,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700",
    badgeBorder: "border-orange-200",
  },
  "loyalty-rebate": {
    label: "Loyalty Rebate",
    description: "Cashback rebate for repeat purchases",
    icon: Award,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    badgeBg: "bg-yellow-50",
    badgeText: "text-yellow-700",
    badgeBorder: "border-yellow-200",
  },
  "combo-bundle": {
    label: "Combo Bundle",
    description: "Bundled products at discounted rate",
    icon: Package,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
    badgeBorder: "border-indigo-200",
  },
  "early-payment": {
    label: "Early Payment",
    description: "Discount for early invoice settlement",
    icon: Clock,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-700",
    badgeBorder: "border-teal-200",
  },
};

const OFFER_KINDS: OfferKind[] = Object.keys(OFFER_TYPE_META) as OfferKind[];

const STATUS_TONES: Record<OfferStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-gray-100 text-gray-700 border-gray-300",
  Scheduled: "bg-amber-50 text-amber-700 border-amber-200",
  Expired: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_OPTIONS: OfferStatus[] = [
  "Active",
  "Inactive",
  "Scheduled",
  "Expired",
];

const ID_PREFIX: Record<OfferKind, string> = {
  qps: "QPS",
  "value-slab": "VS",
  bogo: "BOGO",
  "case-bonus": "CB",
  "off-invoice": "OFF",
  "display-allowance": "DA",
  "launch-incentive": "LI",
  "loyalty-rebate": "LR",
  "combo-bundle": "CMB",
  "early-payment": "EP",
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const plusDays = (iso: string, days: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// ---------------------------------------------------------------------
// describeConfig — converts a structured OfferConfig into the
// short human-readable string the table's Details column shows.
// Same pattern the live page uses for QPS slabs.
// ---------------------------------------------------------------------

const fmtCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmtRange = (min: number, max: number | null, suffix = "") =>
  max === null ? `${min}${suffix}+` : `${min}–${max}${suffix}`;

function describeConfig(c: OfferConfig): string {
  switch (c.kind) {
    case "qps": {
      const top = Math.max(...c.slabs.map((s) => s.discountPct), 0);
      const bands = c.slabs.map((s) => fmtRange(s.minQty, s.maxQty)).join(" / ");
      return `${c.slabs.length} slabs · ${bands} qty · up to ${top}% off`;
    }
    case "value-slab":
      return c.tiers
        .map(
          (t) =>
            `${fmtCurrency(t.minValue)}${
              t.maxValue === null ? "+" : `–${fmtCurrency(t.maxValue)}`
            } · ${t.discountPct}% off`,
        )
        .join(" · ");
    case "bogo":
      return `Buy ${c.buyQty}, get ${c.freeQty} free unit${c.freeQty === 1 ? "" : "s"}`;
    case "case-bonus":
      return `Buy ${c.buyCases} cases, get ${c.freeCases} free`;
    case "off-invoice":
      return c.discountType === "percent"
        ? `${c.value}% off on invoice total`
        : `Flat ${fmtCurrency(c.value)} off per unit on invoice`;
    case "display-allowance":
      return `${fmtCurrency(c.amountPerStore)} per store · ${c.requirement} · verified ${c.frequency.toLowerCase()}`;
    case "launch-incentive":
      return `${fmtCurrency(c.discountPerUnit)} off per unit · first ${c.durationDays} days · min ${c.minQty} qty`;
    case "loyalty-rebate":
      return `${c.rebatePct}% cashback after ${c.afterReorders} reorder${c.afterReorders === 1 ? "" : "s"} · ${c.payoutFrequency.toLowerCase()} payout`;
    case "combo-bundle":
      return `Bundle ${c.bundleSkuCode}${c.bundleSkuName ? ` (${c.bundleSkuName})` : ""} · ${c.discountType === "percent" ? `${c.value}% off` : `${fmtCurrency(c.value)} off`}`;
    case "early-payment":
      return `${c.discountPct}% off if settled within ${c.withinDays} days`;
  }
}

// ---------------------------------------------------------------------
// Seed catalogue — same SKUs across multiple offer types so the demo
// shows the multi-offer-per-SKU pattern.
// ---------------------------------------------------------------------

const SEED_OFFERS: DemoOffer[] = [
  {
    id: "QPS-180000008-seed",
    skuCode: "180000008",
    skuName: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS.",
    config: {
      kind: "qps",
      sellingPrice: 1850,
      slabs: [
        { minQty: 1, maxQty: 11, discountPct: 0 },
        { minQty: 12, maxQty: 47, discountPct: 5 },
        { minQty: 48, maxQty: null, discountPct: 10 },
      ],
    },
    startDate: "2026-04-01",
    endDate: "2026-05-31",
    status: "Active",
  },
  {
    id: "BOGO-180000008-seed",
    skuCode: "180000008",
    skuName: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS.",
    config: { kind: "bogo", buyQty: 10, freeQty: 1 },
    startDate: "2026-04-15",
    endDate: "2026-06-15",
    status: "Active",
  },
  {
    id: "OFF-180000008-seed",
    skuCode: "180000008",
    skuName: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS.",
    config: { kind: "off-invoice", discountType: "flat", value: 10 },
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    status: "Scheduled",
  },
  {
    id: "VS-180000005-seed",
    skuCode: "180000005",
    skuName: "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN",
    config: {
      kind: "value-slab",
      tiers: [
        { minValue: 50000, maxValue: 99999, discountPct: 3 },
        { minValue: 100000, maxValue: null, discountPct: 5 },
      ],
    },
    startDate: "2026-04-01",
    endDate: "2026-07-31",
    status: "Active",
  },
  {
    id: "EP-180000005-seed",
    skuCode: "180000005",
    skuName: "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN",
    config: { kind: "early-payment", discountPct: 2, withinDays: 7 },
    startDate: "2026-04-01",
    endDate: "2026-12-31",
    status: "Active",
  },
  {
    id: "QPS-180000249-seed",
    skuCode: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    config: {
      kind: "qps",
      sellingPrice: 2400,
      slabs: [
        { minQty: 1, maxQty: 4, discountPct: 0 },
        { minQty: 5, maxQty: 19, discountPct: 4 },
        { minQty: 20, maxQty: null, discountPct: 8 },
      ],
    },
    startDate: "2026-04-15",
    endDate: "2026-06-30",
    status: "Inactive",
  },
  {
    id: "CB-180000249-seed",
    skuCode: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    config: { kind: "case-bonus", buyCases: 50, freeCases: 3 },
    startDate: "2026-04-15",
    endDate: "2026-06-30",
    status: "Active",
  },
  {
    id: "DA-180000249-seed",
    skuCode: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    config: {
      kind: "display-allowance",
      amountPerStore: 500,
      requirement: "End-cap display for 4 weeks",
      frequency: "Fortnightly",
    },
    startDate: "2026-04-15",
    endDate: "2026-06-30",
    status: "Active",
  },
  {
    id: "LR-180000249-seed",
    skuCode: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    config: {
      kind: "loyalty-rebate",
      rebatePct: 1,
      afterReorders: 3,
      payoutFrequency: "Monthly",
    },
    startDate: "2026-04-15",
    endDate: "2026-12-31",
    status: "Scheduled",
  },
  {
    id: "LI-180000179-seed",
    skuCode: "180000179",
    skuName: "FREEDOM REF.SUNFLOWER OIL 2 LTR X 6 PET",
    config: {
      kind: "launch-incentive",
      discountPerUnit: 50,
      durationDays: 60,
      minQty: 24,
    },
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    status: "Expired",
  },
  {
    id: "CMB-180000076-seed",
    skuCode: "180000076",
    skuName: "FREEDOM REF.SUNFLOWER OIL 1 LTR X 12PET",
    config: {
      kind: "combo-bundle",
      bundleSkuCode: "180000200",
      bundleSkuName: "FREEDOM REF.GROUNDNUT OIL 1 LTR X 12PET",
      discountType: "flat",
      value: 150,
    },
    startDate: "2026-04-20",
    endDate: "2026-05-20",
    status: "Active",
  },
];

// ---------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------

export function OffersDemo() {
  const [offers, setOffers] = useState<DemoOffer[]>(SEED_OFFERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Picker → form pipeline:
  //   1. seller clicks Create Offers → pickerOpen = true
  //   2. seller picks a type card → pickerOpen = false, creatingKind = X
  //   3. seller submits or cancels → creatingKind = null
  const [pickerOpen, setPickerOpen] = useState(false);
  const [creatingKind, setCreatingKind] = useState<OfferKind | null>(null);

  const [editing, setEditing] = useState<DemoOffer | null>(null);
  const [viewing, setViewing] = useState<DemoOffer | null>(null);

  const offerTypeOptions = useMemo<OfferTypeOption[]>(
    () =>
      OFFER_KINDS.map((kind) => ({
        value: kind,
        label: OFFER_TYPE_META[kind].label,
      })),
    [],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return offers.filter((o) => {
      const matchesSearch =
        q === "" ||
        o.skuCode.toLowerCase().includes(q) ||
        o.skuName.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || o.status === statusFilter;
      const matchesType =
        offerTypeFilter === "all" || o.config.kind === offerTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [offers, searchQuery, statusFilter, offerTypeFilter]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const filtersActive =
    statusFilter !== "all" || offerTypeFilter !== "all";

  const handleCreated = (offer: DemoOffer) => {
    setOffers((prev) => [offer, ...prev]);
    setCreatingKind(null);
    setCurrentPage(1);
    toast.success(
      `Created ${OFFER_TYPE_META[offer.config.kind].label} offer for ${offer.skuCode}.`,
    );
  };

  const handleEdited = (offer: DemoOffer) => {
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? offer : o)));
    setEditing(null);
    toast.success(`Updated ${OFFER_TYPE_META[offer.config.kind].label} offer.`);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-hidden p-6">
        <Card className="h-full flex flex-col overflow-hidden p-0 gap-0">
          {/* Header — search left, Filters + Create Offers right. */}
          <div className="border-b border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap flex-shrink-0">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto flex-wrap">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by SKU code or name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-3 h-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {filtersActive && (
                  <Badge className="bg-blue-600 text-white border-blue-600 ml-1 h-5 px-1.5 text-[10px]">
                    {(statusFilter !== "all" ? 1 : 0) +
                      (offerTypeFilter !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setPickerOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Create Offers
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr className="text-left">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    SKU Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    SKU Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Offer Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Validity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 text-center">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm text-gray-500"
                    >
                      No offers match your search or filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((o) => {
                    const meta = OFFER_TYPE_META[o.config.kind];
                    const Icon = meta.icon;
                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-800">
                          {o.skuCode}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{o.skuName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`gap-1 ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                          >
                            <Icon className="h-3 w-3" />
                            {meta.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-700 leading-snug max-w-md">
                            {describeConfig(o.config)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-700">{o.startDate}</p>
                          <p className="text-xs text-gray-500">to {o.endDate}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            className={`${STATUS_TONES[o.status]} border font-medium text-xs`}
                          >
                            {o.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="View Details"
                              onClick={() => setViewing(o)}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title={
                                o.status === "Expired"
                                  ? "Expired offers cannot be edited"
                                  : "Edit"
                              }
                              disabled={o.status === "Expired"}
                              onClick={() => setEditing(o)}
                            >
                              <Pencil
                                className={`h-4 w-4 ${o.status === "Expired" ? "text-gray-300" : "text-gray-700"}`}
                              />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <ListPagination
            page={currentPage}
            total={filtered.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="offer"
          />
        </Card>
      </div>

      <OffersFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filterStatus={statusFilter}
        setFilterStatus={(v) => {
          setStatusFilter(v);
          setCurrentPage(1);
        }}
        filterOfferType={offerTypeFilter}
        setFilterOfferType={(v) => {
          setOfferTypeFilter(v);
          setCurrentPage(1);
        }}
        offerTypeOptions={offerTypeOptions}
        onClearFilters={() => {
          setStatusFilter("all");
          setOfferTypeFilter("all");
          setCurrentPage(1);
        }}
      />

      {/* 10-card offer-type picker (same shape as the live page). */}
      <OfferTypePickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(kind) => {
          setPickerOpen(false);
          setCreatingKind(kind);
        }}
      />

      {/* Create form — routed per type. */}
      {creatingKind && (
        <OfferEditorDialog
          mode="create"
          kind={creatingKind}
          onCancel={() => setCreatingKind(null)}
          onSubmit={handleCreated}
        />
      )}

      {/* Edit form — re-opens the same per-type editor pre-filled. */}
      {editing && (
        <OfferEditorDialog
          mode="edit"
          kind={editing.config.kind}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={handleEdited}
        />
      )}

      {/* Read-only View. */}
      <OfferViewDialog
        offer={viewing}
        onClose={() => setViewing(null)}
        onEdit={(o) => {
          setViewing(null);
          if (o.status !== "Expired") setEditing(o);
        }}
      />
    </div>
  );
}

// =====================================================================
// Offer-type picker — opens from the Create Offers CTA.
// 10 cards, all enabled. Picking one closes this dialog and the parent
// opens the matching editor.
// =====================================================================

function OfferTypePickerDialog({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (kind: OfferKind) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-[min(95vw,1100px)] w-[min(95vw,1100px)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Tag className="h-5 w-5 text-blue-600" />
            Create Offers
          </DialogTitle>
          <DialogDescription>
            Pick the type of offer you want to set up for your catalog. All 10
            offer types are available on this page.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 py-2">
          {OFFER_KINDS.map((kind) => {
            const meta = OFFER_TYPE_META[kind];
            const Icon = meta.icon;
            return (
              <button
                key={kind}
                type="button"
                onClick={() => onPick(kind)}
                className="relative text-left rounded-xl border p-4 transition-all min-h-[140px] bg-white border-gray-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                <div
                  className={`${meta.iconBg} ${meta.iconColor} p-2 rounded-lg w-fit`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-3 leading-tight">
                  {meta.label}
                </p>
                <p className="text-[11px] text-gray-600 leading-snug mt-1">
                  {meta.description}
                </p>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================================
// OfferEditorDialog — routes to the per-type form. The wide dialog
// width is used for QPS and Value Slab (slab tables need horizontal
// room); the others use the default 2xl width.
// =====================================================================

interface EditorProps {
  mode: "create" | "edit";
  kind: OfferKind;
  initial?: DemoOffer;
  onCancel: () => void;
  onSubmit: (offer: DemoOffer) => void;
}

function OfferEditorDialog(props: EditorProps) {
  const isWide = props.kind === "qps" || props.kind === "value-slab";
  return (
    <Dialog open onOpenChange={(o) => !o && props.onCancel()}>
      <DialogContent
        className={
          isWide
            ? "!max-w-[min(95vw,1150px)] w-[min(95vw,1150px)] max-h-[92vh] overflow-y-auto"
            : "max-w-2xl max-h-[92vh] overflow-y-auto"
        }
      >
        <OfferEditorBody {...props} />
      </DialogContent>
    </Dialog>
  );
}

function OfferEditorBody({ mode, kind, initial, onCancel, onSubmit }: EditorProps) {
  const meta = OFFER_TYPE_META[kind];
  const Icon = meta.icon;
  return (
    <>
      <DialogHeader className="pb-2">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Icon className={`h-5 w-5 ${meta.iconColor}`} />
          {mode === "edit" ? "Edit" : "Create"} {meta.label} Offer
        </DialogTitle>
        <DialogDescription>{meta.description}</DialogDescription>
      </DialogHeader>

      {kind === "qps" && (
        <QpsForm mode={mode} initial={initial} onCancel={onCancel} onSubmit={onSubmit} />
      )}
      {kind === "value-slab" && (
        <ValueSlabForm mode={mode} initial={initial} onCancel={onCancel} onSubmit={onSubmit} />
      )}
      {kind === "bogo" && (
        <BogoForm mode={mode} initial={initial} onCancel={onCancel} onSubmit={onSubmit} />
      )}
      {kind === "case-bonus" && (
        <CaseBonusForm mode={mode} initial={initial} onCancel={onCancel} onSubmit={onSubmit} />
      )}
      {kind === "off-invoice" && (
        <OffInvoiceForm mode={mode} initial={initial} onCancel={onCancel} onSubmit={onSubmit} />
      )}
      {kind === "display-allowance" && (
        <DisplayAllowanceForm
          mode={mode}
          initial={initial}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      )}
      {kind === "launch-incentive" && (
        <LaunchIncentiveForm
          mode={mode}
          initial={initial}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      )}
      {kind === "loyalty-rebate" && (
        <LoyaltyRebateForm
          mode={mode}
          initial={initial}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      )}
      {kind === "combo-bundle" && (
        <ComboBundleForm
          mode={mode}
          initial={initial}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      )}
      {kind === "early-payment" && (
        <EarlyPaymentForm
          mode={mode}
          initial={initial}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}

// =====================================================================
// Common form scaffolding — shared across all 10 forms.
// =====================================================================

interface CommonDraft {
  skuCode: string;
  skuName: string;
  startDate: string;
  endDate: string;
  status: OfferStatus;
}

const initialCommon = (initial?: DemoOffer): CommonDraft => ({
  skuCode: initial?.skuCode ?? "",
  skuName: initial?.skuName ?? "",
  startDate: initial?.startDate ?? todayISO(),
  endDate: initial?.endDate ?? plusDays(todayISO(), 30),
  status: initial?.status ?? "Scheduled",
});

function CommonFields({
  draft,
  setDraft,
  errors,
}: {
  draft: CommonDraft;
  setDraft: (d: CommonDraft) => void;
  errors: Partial<Record<keyof CommonDraft, string>>;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="SKU Code" required error={errors.skuCode}>
          <Input
            value={draft.skuCode}
            onChange={(e) => setDraft({ ...draft, skuCode: e.target.value })}
            placeholder="e.g. 180000008"
            className="h-9 text-sm font-mono"
            aria-invalid={!!errors.skuCode}
          />
        </Field>
        <Field label="SKU Name" required error={errors.skuName}>
          <Input
            value={draft.skuName}
            onChange={(e) => setDraft({ ...draft, skuName: e.target.value })}
            placeholder="e.g. FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS."
            className="h-9 text-sm"
            aria-invalid={!!errors.skuName}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Start Date" required error={errors.startDate}>
          <Input
            type="date"
            value={draft.startDate}
            onChange={(e) =>
              setDraft({ ...draft, startDate: e.target.value })
            }
            className="h-9 text-sm"
          />
        </Field>
        <Field label="End Date" required error={errors.endDate}>
          <Input
            type="date"
            value={draft.endDate}
            onChange={(e) =>
              setDraft({ ...draft, endDate: e.target.value })
            }
            className="h-9 text-sm"
          />
        </Field>
        <Field label="Status">
          <Select
            value={draft.status}
            onValueChange={(v) =>
              setDraft({ ...draft, status: v as OfferStatus })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-[11px] text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

const validateCommon = (
  draft: CommonDraft,
): Partial<Record<keyof CommonDraft, string>> => {
  const errs: Partial<Record<keyof CommonDraft, string>> = {};
  if (!draft.skuCode.trim()) errs.skuCode = "SKU code is required";
  if (!draft.skuName.trim()) errs.skuName = "SKU name is required";
  if (!draft.startDate) errs.startDate = "Start date is required";
  if (!draft.endDate) errs.endDate = "End date is required";
  if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
    errs.endDate = "End date must be on or after the start date";
  }
  return errs;
};

const buildOffer = (
  draft: CommonDraft,
  config: OfferConfig,
  initial?: DemoOffer,
): DemoOffer => ({
  id:
    initial?.id ??
    `${ID_PREFIX[config.kind]}-${draft.skuCode || "NEW"}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`,
  skuCode: draft.skuCode,
  skuName: draft.skuName,
  config,
  startDate: draft.startDate,
  endDate: draft.endDate,
  status: draft.status,
});

interface FormProps {
  mode: "create" | "edit";
  initial?: DemoOffer;
  onCancel: () => void;
  onSubmit: (offer: DemoOffer) => void;
}

function FormFooter({ mode, onCancel, onSubmit }: { mode: "create" | "edit"; onCancel: () => void; onSubmit: () => void }) {
  return (
    <DialogFooter className="mt-3">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSubmit}>
        {mode === "create" ? "Create Offer" : "Save Changes"}
      </Button>
    </DialogFooter>
  );
}

// =====================================================================
// 1. QPS — replicates the live slab editor (qty bands × discount %).
// =====================================================================

function QpsForm({ mode, initial, onCancel, onSubmit }: FormProps) {
  const seedConfig =
    initial?.config.kind === "qps"
      ? initial.config
      : { kind: "qps" as const, sellingPrice: 100, slabs: [{ minQty: 1, maxQty: 5, discountPct: 0 }] };

  const [common, setCommon] = useState<CommonDraft>(initialCommon(initial));
  const [sellingPrice, setSellingPrice] = useState<number>(
    seedConfig.sellingPrice,
  );
  const [slabs, setSlabs] = useState<QpsSlab[]>(seedConfig.slabs);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommonDraft | "slabs" | "sellingPrice", string>>
  >({});

  const updateSlab = (idx: number, patch: Partial<QpsSlab>) =>
    setSlabs((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const lastSlab = slabs[slabs.length - 1];
  const lastIsInfinite =
    !lastSlab || lastSlab.maxQty === null || lastSlab.maxQty === undefined;
  const addSlab = () =>
    setSlabs((prev) => [
      ...prev,
      {
        minQty: (prev[prev.length - 1]?.maxQty ?? prev[prev.length - 1]?.minQty ?? 0) + 1,
        maxQty: null,
        discountPct: 0,
      },
    ]);
  const removeSlab = (idx: number) =>
    setSlabs((prev) => prev.filter((_, i) => i !== idx));

  const slabErrors = useMemo(() => {
    const errs: { index: number; msg: string }[] = [];
    slabs.forEach((s, i) => {
      if (s.minQty <= 0) errs.push({ index: i, msg: "Min Qty must be ≥ 1" });
      if (s.maxQty !== null && s.maxQty <= s.minQty)
        errs.push({ index: i, msg: "Max Qty must be > Min Qty" });
      if (s.discountPct < 0 || s.discountPct >= 100)
        errs.push({ index: i, msg: "Discount must be 0–99%" });
      if (i > 0) {
        const prev = slabs[i - 1];
        if (prev.maxQty === null)
          errs.push({ index: i, msg: "Previous slab covers ∞ — cannot add another" });
        else if (s.minQty <= prev.maxQty)
          errs.push({ index: i, msg: "Min Qty must be greater than previous Max Qty" });
      }
    });
    return errs;
  }, [slabs]);

  const handleSubmit = () => {
    const commonErrs = validateCommon(common);
    const errs: typeof errors = { ...commonErrs };
    if (sellingPrice <= 0) errs.sellingPrice = "Selling price must be greater than 0";
    if (slabErrors.length > 0) errs.slabs = `Fix ${slabErrors.length} slab error${slabErrors.length === 1 ? "" : "s"}`;
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(
      buildOffer(common, { kind: "qps", sellingPrice, slabs }, initial),
    );
  };

  return (
    <div className="space-y-4">
      <CommonFields draft={common} setDraft={setCommon} errors={errors} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field
          label="Selling Price (₹)"
          required
          error={errors.sellingPrice}
          hint="Base per-unit price before slab discount."
        >
          <Input
            type="number"
            value={sellingPrice || ""}
            onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
            placeholder="e.g. 1850"
            className="h-9 text-sm"
          />
        </Field>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Pricing Slabs</p>
          <Button
            variant="outline"
            size="sm"
            onClick={addSlab}
            disabled={lastIsInfinite}
            title={
              lastIsInfinite
                ? "Set a Max Qty on the last slab before adding a new one."
                : "Add another slab"
            }
            className="gap-1 h-7 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add Slab
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase w-16">Slab #</th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase w-24">Min Qty</th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase w-28">Max Qty</th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase w-32">Discount %</th>
                <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-600 uppercase">Customer Pays</th>
                <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-600 uppercase">Saving</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slabs.map((s, i) => {
                const rowErrors = slabErrors.filter((e) => e.index === i);
                const isError = rowErrors.length > 0;
                const eff = sellingPrice * (1 - s.discountPct / 100);
                const saving = sellingPrice - eff;
                return (
                  <tr key={i} className={isError ? "bg-red-50/60" : ""}>
                    <td className="px-3 py-2 text-xs font-medium text-gray-700">Slab {i + 1}</td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={1}
                        value={s.minQty}
                        onChange={(e) =>
                          updateSlab(i, { minQty: parseInt(e.target.value) || 0 })
                        }
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={1}
                        placeholder="∞"
                        value={s.maxQty ?? ""}
                        onChange={(e) =>
                          updateSlab(i, {
                            maxQty: e.target.value === "" ? null : parseInt(e.target.value),
                          })
                        }
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        max={99}
                        step={0.5}
                        value={s.discountPct}
                        onChange={(e) =>
                          updateSlab(i, { discountPct: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                      {fmtCurrency(+eff.toFixed(2))}
                    </td>
                    <td className="px-3 py-2 text-right text-sm text-emerald-700 font-medium">
                      {fmtCurrency(+saving.toFixed(2))}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeSlab(i)}
                        disabled={slabs.length === 1}
                        title={slabs.length === 1 ? "At least one slab required" : "Remove slab"}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {slabErrors.length > 0 && (
          <div className="border-t border-red-200 bg-red-50 px-3 py-2">
            <ul className="text-[11px] text-red-700 list-disc list-inside space-y-0.5">
              {slabErrors.map((e, i) => (
                <li key={i}>
                  Slab {e.index + 1}: {e.msg}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <FormFooter mode={mode} onCancel={onCancel} onSubmit={handleSubmit} />
    </div>
  );
}

// =====================================================================
// 2. Value Slab — same shape as QPS but tiers are on order value.
// =====================================================================

function ValueSlabForm({ mode, initial, onCancel, onSubmit }: FormProps) {
  const seedConfig =
    initial?.config.kind === "value-slab"
      ? initial.config
      : {
          kind: "value-slab" as const,
          tiers: [{ minValue: 10000, maxValue: null, discountPct: 0 }],
        };

  const [common, setCommon] = useState<CommonDraft>(initialCommon(initial));
  const [tiers, setTiers] = useState<ValueSlabTier[]>(seedConfig.tiers);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommonDraft | "tiers", string>>
  >({});

  const updateTier = (idx: number, patch: Partial<ValueSlabTier>) =>
    setTiers((prev) => prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  const lastTier = tiers[tiers.length - 1];
  const lastIsInfinite = !lastTier || lastTier.maxValue === null;
  const addTier = () =>
    setTiers((prev) => [
      ...prev,
      {
        minValue: (prev[prev.length - 1]?.maxValue ?? prev[prev.length - 1]?.minValue ?? 0) + 1,
        maxValue: null,
        discountPct: 0,
      },
    ]);
  const removeTier = (idx: number) =>
    setTiers((prev) => prev.filter((_, i) => i !== idx));

  const tierErrors = useMemo(() => {
    const errs: { index: number; msg: string }[] = [];
    tiers.forEach((t, i) => {
      if (t.minValue < 0) errs.push({ index: i, msg: "Min value must be ≥ 0" });
      if (t.maxValue !== null && t.maxValue <= t.minValue)
        errs.push({ index: i, msg: "Max must be greater than Min" });
      if (t.discountPct < 0 || t.discountPct >= 100)
        errs.push({ index: i, msg: "Discount must be 0–99%" });
      if (i > 0) {
        const prev = tiers[i - 1];
        if (prev.maxValue === null)
          errs.push({ index: i, msg: "Previous tier covers ∞ — cannot add another" });
        else if (t.minValue <= prev.maxValue)
          errs.push({ index: i, msg: "Min must be greater than previous Max" });
      }
    });
    return errs;
  }, [tiers]);

  const handleSubmit = () => {
    const commonErrs = validateCommon(common);
    const errs: typeof errors = { ...commonErrs };
    if (tierErrors.length > 0) errs.tiers = `Fix ${tierErrors.length} tier error${tierErrors.length === 1 ? "" : "s"}`;
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(buildOffer(common, { kind: "value-slab", tiers }, initial));
  };

  return (
    <div className="space-y-4">
      <CommonFields draft={common} setDraft={setCommon} errors={errors} />

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Order Value Tiers</p>
          <Button
            variant="outline"
            size="sm"
            onClick={addTier}
            disabled={lastIsInfinite}
            className="gap-1 h-7 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add Tier
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase w-16">Tier</th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Min Value (₹)</th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Max Value (₹)</th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Discount %</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tiers.map((t, i) => {
                const rowErrors = tierErrors.filter((e) => e.index === i);
                return (
                  <tr key={i} className={rowErrors.length ? "bg-red-50/60" : ""}>
                    <td className="px-3 py-2 text-xs font-medium text-gray-700">Tier {i + 1}</td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        value={t.minValue}
                        onChange={(e) =>
                          updateTier(i, { minValue: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        placeholder="∞"
                        value={t.maxValue ?? ""}
                        onChange={(e) =>
                          updateTier(i, {
                            maxValue: e.target.value === "" ? null : parseFloat(e.target.value),
                          })
                        }
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        max={99}
                        step={0.5}
                        value={t.discountPct}
                        onChange={(e) =>
                          updateTier(i, { discountPct: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeTier(i)}
                        disabled={tiers.length === 1}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {tierErrors.length > 0 && (
          <div className="border-t border-red-200 bg-red-50 px-3 py-2">
            <ul className="text-[11px] text-red-700 list-disc list-inside space-y-0.5">
              {tierErrors.map((e, i) => (
                <li key={i}>
                  Tier {e.index + 1}: {e.msg}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <FormFooter mode={mode} onCancel={onCancel} onSubmit={handleSubmit} />
    </div>
  );
}

// =====================================================================
// 3. BOGO — Buy X, get Y free.
// =====================================================================

function BogoForm({ mode, initial, onCancel, onSubmit }: FormProps) {
  const seed =
    initial?.config.kind === "bogo"
      ? initial.config
      : { kind: "bogo" as const, buyQty: 10, freeQty: 1 };
  const [common, setCommon] = useState<CommonDraft>(initialCommon(initial));
  const [buyQty, setBuyQty] = useState(seed.buyQty);
  const [freeQty, setFreeQty] = useState(seed.freeQty);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommonDraft | "buyQty" | "freeQty", string>>
  >({});

  const handleSubmit = () => {
    const commonErrs = validateCommon(common);
    const errs: typeof errors = { ...commonErrs };
    if (buyQty <= 0) errs.buyQty = "Buy quantity must be greater than 0";
    if (freeQty <= 0) errs.freeQty = "Free quantity must be greater than 0";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(buildOffer(common, { kind: "bogo", buyQty, freeQty }, initial));
  };

  return (
    <div className="space-y-4">
      <CommonFields draft={common} setDraft={setCommon} errors={errors} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="Buy Quantity"
          required
          error={errors.buyQty}
          hint="How many units the buyer must purchase."
        >
          <Input
            type="number"
            min={1}
            value={buyQty || ""}
            onChange={(e) => setBuyQty(parseInt(e.target.value) || 0)}
            placeholder="e.g. 10"
            className="h-9 text-sm"
          />
        </Field>
        <Field
          label="Free Quantity"
          required
          error={errors.freeQty}
          hint="How many units are added free."
        >
          <Input
            type="number"
            min={1}
            value={freeQty || ""}
            onChange={(e) => setFreeQty(parseInt(e.target.value) || 0)}
            placeholder="e.g. 1"
            className="h-9 text-sm"
          />
        </Field>
      </div>
      <PreviewLine>
        Buy {buyQty || "—"}, get {freeQty || "—"} free unit
        {freeQty === 1 ? "" : "s"}
      </PreviewLine>
      <FormFooter mode={mode} onCancel={onCancel} onSubmit={handleSubmit} />
    </div>
  );
}

// =====================================================================
// 4. Case Bonus — Buy N cases, get M free.
// =====================================================================

function CaseBonusForm({ mode, initial, onCancel, onSubmit }: FormProps) {
  const seed =
    initial?.config.kind === "case-bonus"
      ? initial.config
      : { kind: "case-bonus" as const, buyCases: 50, freeCases: 3 };
  const [common, setCommon] = useState<CommonDraft>(initialCommon(initial));
  const [buyCases, setBuyCases] = useState(seed.buyCases);
  const [freeCases, setFreeCases] = useState(seed.freeCases);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommonDraft | "buyCases" | "freeCases", string>>
  >({});

  const handleSubmit = () => {
    const commonErrs = validateCommon(common);
    const errs: typeof errors = { ...commonErrs };
    if (buyCases <= 0) errs.buyCases = "Buy cases must be greater than 0";
    if (freeCases <= 0) errs.freeCases = "Free cases must be greater than 0";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(
      buildOffer(common, { kind: "case-bonus", buyCases, freeCases }, initial),
    );
  };

  return (
    <div className="space-y-4">
      <CommonFields draft={common} setDraft={setCommon} errors={errors} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="Buy Cases"
          required
          error={errors.buyCases}
          hint="Trigger threshold in cases."
        >
          <Input
            type="number"
            min={1}
            value={buyCases || ""}
            onChange={(e) => setBuyCases(parseInt(e.target.value) || 0)}
            placeholder="e.g. 50"
            className="h-9 text-sm"
          />
        </Field>
        <Field
          label="Free Cases"
          required
          error={errors.freeCases}
          hint="Cases added free at the threshold."
        >
          <Input
            type="number"
            min={1}
            value={freeCases || ""}
            onChange={(e) => setFreeCases(parseInt(e.target.value) || 0)}
            placeholder="e.g. 3"
            className="h-9 text-sm"
          />
        </Field>
      </div>
      <PreviewLine>
        Buy {buyCases || "—"} cases, get {freeCases || "—"} free
      </PreviewLine>
      <FormFooter mode={mode} onCancel={onCancel} onSubmit={handleSubmit} />
    </div>
  );
}

// =====================================================================
// 5. Off-Invoice — % off or flat ₹ off per unit on the invoice.
// =====================================================================

function OffInvoiceForm({ mode, initial, onCancel, onSubmit }: FormProps) {
  const seed =
    initial?.config.kind === "off-invoice"
      ? initial.config
      : { kind: "off-invoice" as const, discountType: "flat" as const, value: 10 };
  const [common, setCommon] = useState<CommonDraft>(initialCommon(initial));
  const [discountType, setDiscountType] = useState<"percent" | "flat">(
    seed.discountType,
  );
  const [value, setValue] = useState(seed.value);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommonDraft | "value", string>>
  >({});

  const handleSubmit = () => {
    const commonErrs = validateCommon(common);
    const errs: typeof errors = { ...commonErrs };
    if (value <= 0) errs.value = "Discount value must be greater than 0";
    if (discountType === "percent" && value >= 100)
      errs.value = "Percentage must be less than 100";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(
      buildOffer(common, { kind: "off-invoice", discountType, value }, initial),
    );
  };

  return (
    <div className="space-y-4">
      <CommonFields draft={common} setDraft={setCommon} errors={errors} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Discount Type" required>
          <Select
            value={discountType}
            onValueChange={(v) => setDiscountType(v as "percent" | "flat")}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Flat ₹ off per unit</SelectItem>
              <SelectItem value="percent">% off invoice total</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field
          label={discountType === "percent" ? "Discount (%)" : "Amount per unit (₹)"}
          required
          error={errors.value}
        >
          <Input
            type="number"
            min={0}
            step={discountType === "percent" ? 0.5 : 1}
            value={value || ""}
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            placeholder={discountType === "percent" ? "e.g. 5" : "e.g. 10"}
            className="h-9 text-sm"
          />
        </Field>
      </div>
      <PreviewLine>
        {discountType === "percent"
          ? `${value || "—"}% off on invoice total`
          : `Flat ${fmtCurrency(value || 0)} off per unit on invoice`}
      </PreviewLine>
      <FormFooter mode={mode} onCancel={onCancel} onSubmit={handleSubmit} />
    </div>
  );
}

// =====================================================================
// 6. Display Allowance — incentive for in-store display.
// =====================================================================

function DisplayAllowanceForm({ mode, initial, onCancel, onSubmit }: FormProps) {
  const seed =
    initial?.config.kind === "display-allowance"
      ? initial.config
      : {
          kind: "display-allowance" as const,
          amountPerStore: 500,
          requirement: "End-cap display for 4 weeks",
          frequency: "Fortnightly" as const,
        };
  const [common, setCommon] = useState<CommonDraft>(initialCommon(initial));
  const [amountPerStore, setAmountPerStore] = useState(seed.amountPerStore);
  const [requirement, setRequirement] = useState(seed.requirement);
  const [frequency, setFrequency] = useState<
    "Weekly" | "Fortnightly" | "Monthly"
  >(seed.frequency);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommonDraft | "amountPerStore" | "requirement", string>>
  >({});

  const handleSubmit = () => {
    const commonErrs = validateCommon(common);
    const errs: typeof errors = { ...commonErrs };
    if (amountPerStore <= 0) errs.amountPerStore = "Amount must be greater than 0";
    if (!requirement.trim())
      errs.requirement = "Describe what counts as a qualifying display";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(
      buildOffer(
        common,
        {
          kind: "display-allowance",
          amountPerStore,
          requirement,
          frequency,
        },
        initial,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <CommonFields draft={common} setDraft={setCommon} errors={errors} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="Amount per Store (₹)"
          required
          error={errors.amountPerStore}
        >
          <Input
            type="number"
            min={1}
            value={amountPerStore || ""}
            onChange={(e) => setAmountPerStore(parseFloat(e.target.value) || 0)}
            placeholder="e.g. 500"
            className="h-9 text-sm"
          />
        </Field>
        <Field label="Verification Frequency" required>
          <Select
            value={frequency}
            onValueChange={(v) =>
              setFrequency(v as "Weekly" | "Fortnightly" | "Monthly")
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Fortnightly">Fortnightly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field
        label="Display Requirement"
        required
        error={errors.requirement}
        hint="What the buyer needs to display, where, and for how long."
      >
        <Textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="e.g. End-cap display for 4 weeks · 3 SKU facings minimum"
          className="text-sm min-h-[70px]"
        />
      </Field>
      <PreviewLine>
        {fmtCurrency(amountPerStore || 0)} per store · {requirement || "—"} ·
        verified {frequency.toLowerCase()}
      </PreviewLine>
      <FormFooter mode={mode} onCancel={onCancel} onSubmit={handleSubmit} />
    </div>
  );
}

// =====================================================================
// 7. Launch Incentive — special pricing for new launches.
// =====================================================================

function LaunchIncentiveForm({ mode, initial, onCancel, onSubmit }: FormProps) {
  const seed =
    initial?.config.kind === "launch-incentive"
      ? initial.config
      : {
          kind: "launch-incentive" as const,
          discountPerUnit: 50,
          durationDays: 60,
          minQty: 24,
        };
  const [common, setCommon] = useState<CommonDraft>(initialCommon(initial));
  const [discountPerUnit, setDiscountPerUnit] = useState(seed.discountPerUnit);
  const [durationDays, setDurationDays] = useState(seed.durationDays);
  const [minQty, setMinQty] = useState(seed.minQty);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommonDraft | "discountPerUnit" | "durationDays" | "minQty", string>>
  >({});

  const handleSubmit = () => {
    const commonErrs = validateCommon(common);
    const errs: typeof errors = { ...commonErrs };
    if (discountPerUnit <= 0)
      errs.discountPerUnit = "Discount must be greater than 0";
    if (durationDays <= 0)
      errs.durationDays = "Launch period must be greater than 0";
    if (minQty < 0) errs.minQty = "Min qty must be 0 or more";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(
      buildOffer(
        common,
        { kind: "launch-incentive", discountPerUnit, durationDays, minQty },
        initial,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <CommonFields draft={common} setDraft={setCommon} errors={errors} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field
          label="Discount per Unit (₹)"
          required
          error={errors.discountPerUnit}
        >
          <Input
            type="number"
            min={0}
            value={discountPerUnit || ""}
            onChange={(e) => setDiscountPerUnit(parseFloat(e.target.value) || 0)}
            placeholder="e.g. 50"
            className="h-9 text-sm"
          />
        </Field>
        <Field
          label="Launch Period (days)"
          required
          error={errors.durationDays}
        >
          <Input
            type="number"
            min={1}
            value={durationDays || ""}
            onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
            placeholder="e.g. 60"
            className="h-9 text-sm"
          />
        </Field>
        <Field
          label="Min Qty to Qualify"
          error={errors.minQty}
          hint="0 means no minimum."
        >
          <Input
            type="number"
            min={0}
            value={minQty}
            onChange={(e) => setMinQty(parseInt(e.target.value) || 0)}
            placeholder="e.g. 24"
            className="h-9 text-sm"
          />
        </Field>
      </div>
      <PreviewLine>
        {fmtCurrency(discountPerUnit || 0)} off per unit · first{" "}
        {durationDays || "—"} days · min {minQty} qty
      </PreviewLine>
      <FormFooter mode={mode} onCancel={onCancel} onSubmit={handleSubmit} />
    </div>
  );
}

// =====================================================================
// 8. Loyalty Rebate — cashback for repeat purchases.
// =====================================================================

function LoyaltyRebateForm({ mode, initial, onCancel, onSubmit }: FormProps) {
  const seed =
    initial?.config.kind === "loyalty-rebate"
      ? initial.config
      : {
          kind: "loyalty-rebate" as const,
          rebatePct: 1,
          afterReorders: 3,
          payoutFrequency: "Monthly" as const,
        };
  const [common, setCommon] = useState<CommonDraft>(initialCommon(initial));
  const [rebatePct, setRebatePct] = useState(seed.rebatePct);
  const [afterReorders, setAfterReorders] = useState(seed.afterReorders);
  const [payoutFrequency, setPayoutFrequency] = useState<
    "Monthly" | "Quarterly" | "Half-yearly"
  >(seed.payoutFrequency);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommonDraft | "rebatePct" | "afterReorders", string>>
  >({});

  const handleSubmit = () => {
    const commonErrs = validateCommon(common);
    const errs: typeof errors = { ...commonErrs };
    if (rebatePct <= 0 || rebatePct >= 100)
      errs.rebatePct = "Rebate must be between 0 and 100";
    if (afterReorders < 0) errs.afterReorders = "Must be 0 or more";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(
      buildOffer(
        common,
        { kind: "loyalty-rebate", rebatePct, afterReorders, payoutFrequency },
        initial,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <CommonFields draft={common} setDraft={setCommon} errors={errors} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="Rebate (%)" required error={errors.rebatePct}>
          <Input
            type="number"
            min={0}
            max={99}
            step={0.5}
            value={rebatePct || ""}
            onChange={(e) => setRebatePct(parseFloat(e.target.value) || 0)}
            placeholder="e.g. 1"
            className="h-9 text-sm"
          />
        </Field>
        <Field
          label="After N Reorders"
          required
          error={errors.afterReorders}
          hint="0 = from the first reorder."
        >
          <Input
            type="number"
            min={0}
            value={afterReorders}
            onChange={(e) => setAfterReorders(parseInt(e.target.value) || 0)}
            placeholder="e.g. 3"
            className="h-9 text-sm"
          />
        </Field>
        <Field label="Payout Frequency" required>
          <Select
            value={payoutFrequency}
            onValueChange={(v) =>
              setPayoutFrequency(v as "Monthly" | "Quarterly" | "Half-yearly")
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Quarterly">Quarterly</SelectItem>
              <SelectItem value="Half-yearly">Half-yearly</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <PreviewLine>
        {rebatePct || "—"}% cashback after {afterReorders} reorder
        {afterReorders === 1 ? "" : "s"} · {payoutFrequency.toLowerCase()} payout
      </PreviewLine>
      <FormFooter mode={mode} onCancel={onCancel} onSubmit={handleSubmit} />
    </div>
  );
}

// =====================================================================
// 9. Combo Bundle — bundle two SKUs for a discount.
// =====================================================================

function ComboBundleForm({ mode, initial, onCancel, onSubmit }: FormProps) {
  const seed =
    initial?.config.kind === "combo-bundle"
      ? initial.config
      : {
          kind: "combo-bundle" as const,
          bundleSkuCode: "",
          bundleSkuName: "",
          discountType: "flat" as const,
          value: 100,
        };
  const [common, setCommon] = useState<CommonDraft>(initialCommon(initial));
  const [bundleSkuCode, setBundleSkuCode] = useState(seed.bundleSkuCode);
  const [bundleSkuName, setBundleSkuName] = useState(seed.bundleSkuName);
  const [discountType, setDiscountType] = useState<"percent" | "flat">(
    seed.discountType,
  );
  const [value, setValue] = useState(seed.value);
  const [errors, setErrors] = useState<
    Partial<
      Record<
        keyof CommonDraft | "bundleSkuCode" | "bundleSkuName" | "value",
        string
      >
    >
  >({});

  const handleSubmit = () => {
    const commonErrs = validateCommon(common);
    const errs: typeof errors = { ...commonErrs };
    if (!bundleSkuCode.trim()) errs.bundleSkuCode = "Bundle SKU code is required";
    if (!bundleSkuName.trim()) errs.bundleSkuName = "Bundle SKU name is required";
    if (value <= 0) errs.value = "Discount value must be greater than 0";
    if (discountType === "percent" && value >= 100)
      errs.value = "Percentage must be less than 100";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(
      buildOffer(
        common,
        { kind: "combo-bundle", bundleSkuCode, bundleSkuName, discountType, value },
        initial,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <CommonFields draft={common} setDraft={setCommon} errors={errors} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field
          label="Bundle SKU Code"
          required
          error={errors.bundleSkuCode}
          hint="The second SKU in the bundle."
        >
          <Input
            value={bundleSkuCode}
            onChange={(e) => setBundleSkuCode(e.target.value)}
            placeholder="e.g. 180000200"
            className="h-9 text-sm font-mono"
          />
        </Field>
        <Field
          label="Bundle SKU Name"
          required
          error={errors.bundleSkuName}
        >
          <Input
            value={bundleSkuName}
            onChange={(e) => setBundleSkuName(e.target.value)}
            placeholder="e.g. FREEDOM REF. GROUNDNUT OIL 1 LTR X 12PET"
            className="h-9 text-sm"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Discount Type" required>
          <Select
            value={discountType}
            onValueChange={(v) => setDiscountType(v as "percent" | "flat")}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Flat ₹ off the bundle</SelectItem>
              <SelectItem value="percent">% off the bundle total</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field
          label={discountType === "percent" ? "Discount (%)" : "Amount (₹)"}
          required
          error={errors.value}
        >
          <Input
            type="number"
            min={0}
            step={discountType === "percent" ? 0.5 : 1}
            value={value || ""}
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            placeholder={discountType === "percent" ? "e.g. 10" : "e.g. 150"}
            className="h-9 text-sm"
          />
        </Field>
      </div>
      <PreviewLine>
        Bundle {bundleSkuCode || "—"}
        {bundleSkuName ? ` (${bundleSkuName})` : ""} ·{" "}
        {discountType === "percent"
          ? `${value || "—"}% off`
          : `${fmtCurrency(value || 0)} off`}
      </PreviewLine>
      <FormFooter mode={mode} onCancel={onCancel} onSubmit={handleSubmit} />
    </div>
  );
}

// =====================================================================
// 10. Early Payment — discount for early invoice settlement.
// =====================================================================

function EarlyPaymentForm({ mode, initial, onCancel, onSubmit }: FormProps) {
  const seed =
    initial?.config.kind === "early-payment"
      ? initial.config
      : { kind: "early-payment" as const, discountPct: 2, withinDays: 7 };
  const [common, setCommon] = useState<CommonDraft>(initialCommon(initial));
  const [discountPct, setDiscountPct] = useState(seed.discountPct);
  const [withinDays, setWithinDays] = useState(seed.withinDays);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommonDraft | "discountPct" | "withinDays", string>>
  >({});

  const handleSubmit = () => {
    const commonErrs = validateCommon(common);
    const errs: typeof errors = { ...commonErrs };
    if (discountPct <= 0 || discountPct >= 100)
      errs.discountPct = "Discount must be between 0 and 100";
    if (withinDays <= 0)
      errs.withinDays = "Settlement window must be greater than 0";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(
      buildOffer(common, { kind: "early-payment", discountPct, withinDays }, initial),
    );
  };

  return (
    <div className="space-y-4">
      <CommonFields draft={common} setDraft={setCommon} errors={errors} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Discount (%)" required error={errors.discountPct}>
          <Input
            type="number"
            min={0}
            max={99}
            step={0.5}
            value={discountPct || ""}
            onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
            placeholder="e.g. 2"
            className="h-9 text-sm"
          />
        </Field>
        <Field
          label="Settle Within (days)"
          required
          error={errors.withinDays}
        >
          <Input
            type="number"
            min={1}
            value={withinDays || ""}
            onChange={(e) => setWithinDays(parseInt(e.target.value) || 0)}
            placeholder="e.g. 7"
            className="h-9 text-sm"
          />
        </Field>
      </div>
      <PreviewLine>
        {discountPct || "—"}% off if settled within {withinDays || "—"} days
      </PreviewLine>
      <FormFooter mode={mode} onCancel={onCancel} onSubmit={handleSubmit} />
    </div>
  );
}

// =====================================================================
// Helpers
// =====================================================================

function PreviewLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50/60 border border-blue-200 rounded-md p-3">
      <p className="text-[11px] uppercase tracking-wider text-blue-700 mb-1">
        Preview
      </p>
      <p className="text-sm text-gray-800">{children}</p>
    </div>
  );
}

// =====================================================================
// View dialog — renders the description string + type-specific
// structured breakdown (slab/tier tables, key values, etc.).
// =====================================================================

function OfferViewDialog({
  offer,
  onClose,
  onEdit,
}: {
  offer: DemoOffer | null;
  onClose: () => void;
  onEdit: (offer: DemoOffer) => void;
}) {
  if (!offer) return null;
  const meta = OFFER_TYPE_META[offer.config.kind];
  const Icon = meta.icon;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${meta.iconColor}`} />
            {offer.skuName}
          </DialogTitle>
          <DialogDescription>
            Offer ID&nbsp;
            <span className="font-mono text-gray-700">{offer.id}</span> ·{" "}
            {meta.label}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ViewField label="SKU Code" value={offer.skuCode} mono />
            <ViewField label="Offer Type" value={meta.label} />
            <ViewField label="Start Date" value={offer.startDate} />
            <ViewField label="End Date" value={offer.endDate} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
              Status
            </p>
            <Badge
              className={`${STATUS_TONES[offer.status]} border font-medium text-xs`}
            >
              {offer.status}
            </Badge>
          </div>
          <ConfigDetails config={offer.config} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => onEdit(offer)}
            disabled={offer.status === "Expired"}
            title={
              offer.status === "Expired"
                ? "Expired offers cannot be edited"
                : undefined
            }
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ViewField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </p>
      <p className={`text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function ConfigDetails({ config }: { config: OfferConfig }) {
  switch (config.kind) {
    case "qps":
      return (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
            QPS Slabs · Selling Price {fmtCurrency(config.sellingPrice)}
          </p>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Slab</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Min Qty</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Max Qty</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Discount</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-600 uppercase">Customer Pays</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {config.slabs.map((s, i) => {
                  const eff = config.sellingPrice * (1 - s.discountPct / 100);
                  return (
                    <tr key={i}>
                      <td className="px-3 py-2 text-xs">Slab {i + 1}</td>
                      <td className="px-3 py-2 text-xs">{s.minQty}</td>
                      <td className="px-3 py-2 text-xs">
                        {s.maxQty === null ? "∞" : s.maxQty}
                      </td>
                      <td className="px-3 py-2 text-xs">{s.discountPct}%</td>
                      <td className="px-3 py-2 text-xs text-right font-medium">
                        {fmtCurrency(+eff.toFixed(2))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "value-slab":
      return (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
            Order-Value Tiers
          </p>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Tier</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Min Value</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Max Value</th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase">Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {config.tiers.map((t, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-xs">Tier {i + 1}</td>
                    <td className="px-3 py-2 text-xs">{fmtCurrency(t.minValue)}</td>
                    <td className="px-3 py-2 text-xs">
                      {t.maxValue === null ? "∞" : fmtCurrency(t.maxValue)}
                    </td>
                    <td className="px-3 py-2 text-xs">{t.discountPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "bogo":
      return (
        <div className="grid grid-cols-2 gap-3">
          <ViewField label="Buy Quantity" value={String(config.buyQty)} />
          <ViewField label="Free Quantity" value={String(config.freeQty)} />
        </div>
      );
    case "case-bonus":
      return (
        <div className="grid grid-cols-2 gap-3">
          <ViewField label="Buy Cases" value={String(config.buyCases)} />
          <ViewField label="Free Cases" value={String(config.freeCases)} />
        </div>
      );
    case "off-invoice":
      return (
        <div className="grid grid-cols-2 gap-3">
          <ViewField
            label="Discount Type"
            value={config.discountType === "percent" ? "% off invoice" : "Flat ₹ per unit"}
          />
          <ViewField
            label="Value"
            value={
              config.discountType === "percent"
                ? `${config.value}%`
                : fmtCurrency(config.value)
            }
          />
        </div>
      );
    case "display-allowance":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ViewField label="Amount per Store" value={fmtCurrency(config.amountPerStore)} />
            <ViewField label="Verification" value={config.frequency} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
              Display Requirement
            </p>
            <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 border border-gray-200 rounded-md p-3">
              {config.requirement}
            </p>
          </div>
        </div>
      );
    case "launch-incentive":
      return (
        <div className="grid grid-cols-3 gap-3">
          <ViewField label="Discount per Unit" value={fmtCurrency(config.discountPerUnit)} />
          <ViewField label="Launch Period" value={`${config.durationDays} days`} />
          <ViewField label="Min Qty" value={String(config.minQty)} />
        </div>
      );
    case "loyalty-rebate":
      return (
        <div className="grid grid-cols-3 gap-3">
          <ViewField label="Rebate" value={`${config.rebatePct}%`} />
          <ViewField label="After N Reorders" value={String(config.afterReorders)} />
          <ViewField label="Payout" value={config.payoutFrequency} />
        </div>
      );
    case "combo-bundle":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ViewField label="Bundle SKU Code" value={config.bundleSkuCode} mono />
            <ViewField
              label="Bundle Discount"
              value={
                config.discountType === "percent"
                  ? `${config.value}% off`
                  : `${fmtCurrency(config.value)} off`
              }
            />
          </div>
          <ViewField label="Bundle SKU Name" value={config.bundleSkuName} />
        </div>
      );
    case "early-payment":
      return (
        <div className="grid grid-cols-2 gap-3">
          <ViewField label="Discount" value={`${config.discountPct}%`} />
          <ViewField label="Settle Within" value={`${config.withinDays} days`} />
        </div>
      );
  }
}
