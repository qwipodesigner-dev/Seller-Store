import { useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Search,
  Tag,
  Plus,
  Filter,
  Eye,
  Pencil,
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
  type LucideIcon,
} from "lucide-react";
import { ListPagination } from "../../components/ui/list-pagination";
import {
  OffersFilterDrawer,
  type OfferTypeOption,
} from "../../components/filter-drawers/offers-filter-drawer";

// =====================================================================
// Empty-mode demo page for "Offers & Schemes 2"
//
// Surfaces the SAME table chrome the live page uses, but seeded with a
// catalogue of every offer type — and crucially with the same SKU
// appearing across multiple rows under different offer types — so the
// design + product team can see how a multi-offer SKU actually reads
// in production without having to author it.
//
// This page has no creation flow; all rows are read-only mock data.
// Edit / View affordances are visible but no-op (they fire a no-op
// click — handler omitted on purpose).
// =====================================================================

interface DemoOffer {
  id: string;
  skuCode: string;
  skuName: string;
  offerType:
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
  /** Free-text describing the offer. Replaces the per-type detail
   *  columns the live page exposes (Pricing Rules, MRP/SP, etc.). */
  details: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive" | "Scheduled" | "Expired";
}

const OFFER_TYPE_META: Record<
  DemoOffer["offerType"],
  { label: string; icon: LucideIcon; iconColor: string; bg: string; border: string }
> = {
  qps: {
    label: "QPS",
    icon: Layers,
    iconColor: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  "value-slab": {
    label: "Value Slab",
    icon: IndianRupee,
    iconColor: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  bogo: {
    label: "BOGO",
    icon: Gift,
    iconColor: "text-pink-700",
    bg: "bg-pink-50",
    border: "border-pink-200",
  },
  "case-bonus": {
    label: "Case Bonus",
    icon: Boxes,
    iconColor: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  "off-invoice": {
    label: "Off-Invoice",
    icon: Receipt,
    iconColor: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  "display-allowance": {
    label: "Display Allowance",
    icon: StoreIcon,
    iconColor: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  "launch-incentive": {
    label: "Launch Incentive",
    icon: Rocket,
    iconColor: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  "loyalty-rebate": {
    label: "Loyalty Rebate",
    icon: Award,
    iconColor: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  "combo-bundle": {
    label: "Combo Bundle",
    icon: Package,
    iconColor: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  "early-payment": {
    label: "Early Payment",
    icon: Clock,
    iconColor: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
};

// Demo data — three SKUs each carrying multiple offer types so the
// table actively shows the "same SKU, different rows" pattern.
const DEMO_OFFERS: DemoOffer[] = [
  // SKU 180000008 — Sunflower Oil — 3 different offer types
  {
    id: "QPS-180000008",
    skuCode: "180000008",
    skuName: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS.",
    offerType: "qps",
    details: "3 slabs · 1–11 / 12–47 / 48+ qty · up to 10% off",
    startDate: "2026-04-01",
    endDate: "2026-05-31",
    status: "Active",
  },
  {
    id: "BOGO-180000008",
    skuCode: "180000008",
    skuName: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS.",
    offerType: "bogo",
    details: "Buy 10, get 1 free unit",
    startDate: "2026-04-15",
    endDate: "2026-06-15",
    status: "Active",
  },
  {
    id: "OFF-180000008",
    skuCode: "180000008",
    skuName: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS.",
    offerType: "off-invoice",
    details: "Flat ₹10 off per unit on invoice",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    status: "Scheduled",
  },

  // SKU 180000005 — Sunflower Oil 15 KG TIN — 2 offer types
  {
    id: "VS-180000005",
    skuCode: "180000005",
    skuName: "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN",
    offerType: "value-slab",
    details: "Order > ₹50,000 · 3% off · > ₹1,00,000 · 5% off",
    startDate: "2026-04-01",
    endDate: "2026-07-31",
    status: "Active",
  },
  {
    id: "EP-180000005",
    skuCode: "180000005",
    skuName: "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN",
    offerType: "early-payment",
    details: "2% off if invoice settled within 7 days",
    startDate: "2026-04-01",
    endDate: "2026-12-31",
    status: "Active",
  },

  // SKU 180000249 — Sunflower 5L jars — 4 offer types
  {
    id: "QPS-180000249",
    skuCode: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    offerType: "qps",
    details: "3 slabs · 1–4 / 5–19 / 20+ jars",
    startDate: "2026-04-15",
    endDate: "2026-06-30",
    status: "Inactive",
  },
  {
    id: "CB-180000249",
    skuCode: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    offerType: "case-bonus",
    details: "Buy 50 cases, get 3 free",
    startDate: "2026-04-15",
    endDate: "2026-06-30",
    status: "Active",
  },
  {
    id: "DA-180000249",
    skuCode: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    offerType: "display-allowance",
    details: "₹500 incentive per store for end-cap display",
    startDate: "2026-04-15",
    endDate: "2026-06-30",
    status: "Active",
  },
  {
    id: "LR-180000249",
    skuCode: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    offerType: "loyalty-rebate",
    details: "1% cashback on every reorder after 3rd month",
    startDate: "2026-04-15",
    endDate: "2026-12-31",
    status: "Scheduled",
  },

  // Two more SKUs with single offers — fills the type catalog
  {
    id: "LI-180000179",
    skuCode: "180000179",
    skuName: "FREEDOM REF.SUNFLOWER OIL 2 LTR X 6 PET",
    offerType: "launch-incentive",
    details: "₹50 launch discount per unit · first 60 days",
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    status: "Expired",
  },
  {
    id: "CB-180000076",
    skuCode: "180000076",
    skuName: "FREEDOM REF.SUNFLOWER OIL 1 LTR X 12PET",
    offerType: "combo-bundle",
    details: "Bundle 1 case Sunflower + 1 case Groundnut · ₹150 off",
    startDate: "2026-04-20",
    endDate: "2026-05-20",
    status: "Active",
  },
];

const STATUS_TONES: Record<DemoOffer["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-gray-100 text-gray-700 border-gray-300",
  Scheduled: "bg-amber-50 text-amber-700 border-amber-200",
  Expired: "bg-red-50 text-red-700 border-red-200",
};

export function OffersDemo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const offerTypeOptions = useMemo<OfferTypeOption[]>(
    () =>
      Object.entries(OFFER_TYPE_META).map(([value, meta]) => ({
        value,
        label: meta.label,
      })),
    [],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return DEMO_OFFERS.filter((o) => {
      const matchesSearch =
        q === "" ||
        o.skuCode.toLowerCase().includes(q) ||
        o.skuName.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || o.status === statusFilter;
      const matchesType =
        offerTypeFilter === "all" || o.offerType === offerTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, statusFilter, offerTypeFilter]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const filtersActive =
    statusFilter !== "all" || offerTypeFilter !== "all";

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-hidden p-6">
        <Card className="h-full flex flex-col overflow-hidden p-0 gap-0">
          {/* Header — search left, Filters + Create Offers right.
              Same toolbar shape as the live offers list. */}
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
              <Button size="sm" className="gap-2">
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
                    const meta = OFFER_TYPE_META[o.offerType];
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
                            className={`gap-1 ${meta.bg} ${meta.iconColor} ${meta.border}`}
                          >
                            <Icon className="h-3 w-3" />
                            {meta.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-700 leading-snug max-w-md">
                            {o.details}
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
    </div>
  );
}
