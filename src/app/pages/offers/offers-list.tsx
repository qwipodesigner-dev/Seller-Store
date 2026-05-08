import { useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Plus,
  Search,
  Tag,
  Gift,
  Package,
  Percent,
  Filter,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Eye,
  Pencil,
  // Offer-type picker icons — one per scheme.
  IndianRupee,
  Boxes,
  Receipt,
  Store as StoreIcon,
  Rocket,
  Award,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { catalogSkus, findSku } from "../../lib/sku-catalog";
import {
  QpsScheme,
  QpsSlab,
  SlabDiscountType,
  validateSlabs,
  computeEffectivePrice,
} from "../../lib/qps-validation";
import { isEmptyMode } from "../../lib/data-mode";
import { EmptyState } from "../../components/empty-state";
import { ListPagination } from "../../components/ui/list-pagination";
import {
  OffersFilterDrawer,
  type OfferTypeOption,
} from "../../components/filter-drawers/offers-filter-drawer";

// Seed QPS schemes — these populate the list on first load.
// The ten offer types surfaced on the "Create Offers" picker dialog.
// QPS is the only one wired up in Phase 1 — everything else carries
// a "Coming Soon" badge and is non-interactive in the picker UI.
//
// Icon + colour pair follow the same convention used everywhere
// else in the app (Settings hub tiles, ConnectorCard, dashboard
// shortcut cards): a Lucide icon in a tinted square. Each offer type
// gets its own tone so the grid reads at a glance.
interface OfferType {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}
const OFFER_TYPES: OfferType[] = [
  {
    id: "qps",
    label: "QPS",
    description: "Quantity-based price slabs with tiered discounts",
    icon: Layers,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "value-slab",
    label: "Value Slab",
    description: "Order value-based discount tiers",
    icon: IndianRupee,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "bogo",
    label: "BOGO",
    description: "Buy X quantity, get Y free units",
    icon: Gift,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    id: "case-bonus",
    label: "Case Bonus",
    description: "Extra cases free on bulk purchase",
    icon: Boxes,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    id: "off-invoice",
    label: "Off-Invoice",
    description: "Flat discount applied on invoice total",
    icon: Receipt,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "display-allowance",
    label: "Display Allowance",
    description: "Incentive for in-store product display",
    icon: StoreIcon,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    id: "launch-incentive",
    label: "Launch Incentive",
    description: "Special pricing for new product launches",
    icon: Rocket,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "loyalty-rebate",
    label: "Loyalty Rebate",
    description: "Cashback rebate for repeat purchases",
    icon: Award,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    id: "combo-bundle",
    label: "Combo Bundle",
    description: "Bundled products at discounted rate",
    icon: Package,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    id: "early-payment",
    label: "Early Payment",
    description: "Discount for early invoice settlement",
    icon: Clock,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
];

// Seed schemes — show one example of each status (Active, Inactive, Scheduled, Expired)
// so the seller can see how each looks on the list.
const seedQpsSchemes: QpsScheme[] = [
  {
    id: "QPS-180000008",
    name: "QPS – Sunflower Oil 1L x16",
    skuCode: "180000008",
    skuName: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS.",
    mrp: 188,
    sellingPrice: 171,
    startDate: "2026-04-01",
    endDate: "2026-05-31",
    status: "Active",
    slabs: [
      { minQty: 1, maxQty: 11, discountType: "flat", slabPrice: 171, effectivePrice: 171 },
      { minQty: 12, maxQty: 47, discountType: "percent", slabPercent: 5, effectivePrice: +(171 * 0.95).toFixed(2) },
      { minQty: 48, maxQty: null, discountType: "percent", slabPercent: 10, effectivePrice: +(171 * 0.9).toFixed(2) },
    ],
  },
  {
    id: "QPS-180000249",
    name: "QPS – Sunflower Oil 5Lx4 Jars",
    skuCode: "180000249",
    skuName: "FREEDOM REF.SUNFLOWEROIL 5LTRX4JARS-NEW",
    mrp: 963,
    sellingPrice: 875,
    startDate: "2026-04-15",
    endDate: "2026-06-30",
    status: "Inactive", // toggled off by seller
    slabs: [
      { minQty: 1, maxQty: 4, discountType: "flat", slabPrice: 875, effectivePrice: 875 },
      { minQty: 5, maxQty: 19, discountType: "flat", slabPrice: 855, effectivePrice: 855 },
      { minQty: 20, maxQty: null, discountType: "flat", slabPrice: 820, effectivePrice: 820 },
    ],
  },
  {
    id: "QPS-180000005",
    name: "QPS – Sunflower Oil 15 KG",
    skuCode: "180000005",
    skuName: "FREEDOM REF. SUNFLOWER OIL 15 KG. TIN",
    mrp: 3091,
    sellingPrice: 2810,
    startDate: "2026-05-15",
    endDate: "2026-07-31",
    status: "Scheduled", // future-dated, not yet active
    slabs: [
      { minQty: 1, maxQty: 4, discountType: "flat", slabPrice: 2810, effectivePrice: 2810 },
      { minQty: 5, maxQty: null, discountType: "percent", slabPercent: 4, effectivePrice: +(2810 * 0.96).toFixed(2) },
    ],
  },
  {
    id: "QPS-180000006",
    name: "QPS – Sunflower Oil 15 LTR",
    skuCode: "180000006",
    skuName: "FREEDOM REF. SUNFLOWER OIL 15 LTR. TIN",
    mrp: 2838,
    sellingPrice: 2580,
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    status: "Expired", // past end date — not editable
    slabs: [
      { minQty: 1, maxQty: 9, discountType: "flat", slabPrice: 2580, effectivePrice: 2580 },
      { minQty: 10, maxQty: null, discountType: "percent", slabPercent: 6, effectivePrice: +(2580 * 0.94).toFixed(2) },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 border-green-200";
    case "Inactive":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Scheduled":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Expired":
      return "bg-gray-200 text-gray-700 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function OffersList() {
  const [qpsSchemes, setQpsSchemes] = useState<QpsScheme[]>(() =>
    isEmptyMode() ? [] : seedQpsSchemes,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  // Pagination — reset to page 1 on any filter / search change so the
  // visible window doesn't fall off the end of a shorter result set.
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Create / Edit QPS dialog (shared — editingId=null means create)
  // ---- Offer-type picker (the "Create Offers" entry-point dialog) ----
  // Shows the 10 offer types as cards with hover effects. Only QPS is
  // active in Phase 1; the rest render with a "Coming Soon" badge.
  // Picking QPS closes this dialog and opens the existing QPS editor.
  const [isOfferTypeOpen, setIsOfferTypeOpen] = useState(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorSkuCode, setEditorSkuCode] = useState<string>("");
  const [editorStartDate, setEditorStartDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [editorEndDate, setEditorEndDate] = useState<string>(
    new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10),
  );
  const [editorSlabs, setEditorSlabs] = useState<Partial<QpsSlab>[]>([
    { minQty: 1, maxQty: 5, discountType: "flat", slabPrice: 0 },
  ]);
  const [editorActive, setEditorActive] = useState<boolean>(true);

  // View Details dialog
  const [viewSchemeId, setViewSchemeId] = useState<string | null>(null);

  // Delete confirmation
  // Schemes are immutable once created — no delete flow. (Sellers can mark a
  // scheme Inactive via the toggle if they want it off.)

  // Bulk Import has been removed for Phase 1 — schemes are created one at a
  // time via the Create QPS Scheme button.

  // ---- Filter + Search ----
  const filteredSchemes = qpsSchemes.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      s.skuCode.toLowerCase().includes(q) ||
      s.skuName.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    // Live page only carries QPS schemes; filter still works for
    // consistency (and so the demo page can reuse the same shape).
    const matchesType = offerTypeFilter === "all" || offerTypeFilter === "qps";
    return matchesSearch && matchesStatus && matchesType;
  });
  // Slice the filtered list down to the current page's window.
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchemes = filteredSchemes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );


  // ---- Editor handlers (create + edit) ----
  const selectedSku = findSku(editorSkuCode);
  const spForEditor = selectedSku?.sellingPrice ?? 0;
  const mrpForEditor = selectedSku?.mrp ?? 0;

  const handleOpenCreate = () => {
    setEditingId(null);
    setEditorSkuCode("");
    setEditorStartDate(new Date().toISOString().slice(0, 10));
    setEditorEndDate(new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10));
    setEditorSlabs([{ minQty: 1, maxQty: 5, discountType: "flat", slabPrice: 0 }]);
    setEditorActive(true);
    setIsEditorOpen(true);
  };

  // Bridges the offer-type picker → existing QPS editor: closes the
  // type dialog first, then opens the editor for a fresh QPS scheme.
  const handlePickQps = () => {
    setIsOfferTypeOpen(false);
    handleOpenCreate();
  };

  const handleOpenEdit = (scheme: QpsScheme) => {
    setEditingId(scheme.id);
    setEditorSkuCode(scheme.skuCode);
    setEditorStartDate(scheme.startDate);
    setEditorEndDate(scheme.endDate);
    setEditorSlabs(
      scheme.slabs.map((s) => ({
        minQty: s.minQty,
        maxQty: s.maxQty,
        discountType: s.discountType,
        slabPrice: s.slabPrice,
        slabPercent: s.slabPercent,
      })),
    );
    // Active toggle reflects whether the seller chose to keep the scheme running.
    // Scheduled = future-active, so toggle is on. Inactive / Expired = off.
    setEditorActive(scheme.status === "Active" || scheme.status === "Scheduled");
    setIsEditorOpen(true);
  };

  const updateSlab = (idx: number, patch: Partial<QpsSlab>) => {
    setEditorSlabs((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addSlab = () => {
    setEditorSlabs((prev) => {
      const last = prev[prev.length - 1];
      const start =
        last && typeof last.maxQty === "number" && last.maxQty !== null
          ? last.maxQty + 1
          : (last?.minQty ?? 0) + 10;
      return [
        ...prev,
        {
          minQty: start,
          maxQty: start + 10,
          discountType: last?.discountType ?? "flat",
          slabPrice: last?.discountType === "percent" ? undefined : 0,
          slabPercent: last?.discountType === "percent" ? 0 : undefined,
        },
      ];
    });
  };

  const removeSlab = (idx: number) => {
    setEditorSlabs((prev) => prev.filter((_, i) => i !== idx));
  };

  const editorErrors = useMemo(() => {
    if (!selectedSku) return [];
    return validateSlabs(editorSlabs, selectedSku.sellingPrice);
  }, [editorSlabs, selectedSku]);

  const handleSaveEditor = () => {
    if (!selectedSku) {
      toast.error("Please select a SKU");
      return;
    }
    if (!editorStartDate || !editorEndDate) {
      toast.error("Please set start and end dates");
      return;
    }
    if (editorStartDate > editorEndDate) {
      toast.error("Start date must be before end date");
      return;
    }
    if (editorErrors.length > 0) {
      toast.error(`Fix ${editorErrors.length} validation error${editorErrors.length === 1 ? "" : "s"} before saving`);
      return;
    }
    const finalSlabs: QpsSlab[] = editorSlabs.map((s) => ({
      minQty: s.minQty!,
      maxQty: s.maxQty ?? null,
      discountType: s.discountType!,
      slabPrice: s.slabPrice,
      slabPercent: s.slabPercent,
      effectivePrice: computeEffectivePrice(s, selectedSku.sellingPrice),
    }));

    // Resolve final status: end-date past → Expired (auto); otherwise the
    // seller's Active/Inactive toggle decides; future-dated → Scheduled.
    const today = new Date().toISOString().slice(0, 10);
    let finalStatus: QpsScheme["status"];
    if (editorEndDate < today) finalStatus = "Expired";
    else if (!editorActive) finalStatus = "Inactive";
    else if (editorStartDate > today) finalStatus = "Scheduled";
    else finalStatus = "Active";

    if (editingId) {
      // Edit mode — replace the existing scheme in place
      setQpsSchemes((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                skuCode: selectedSku.skuCode,
                skuName: selectedSku.skuName,
                mrp: selectedSku.mrp,
                sellingPrice: selectedSku.sellingPrice,
                startDate: editorStartDate,
                endDate: editorEndDate,
                slabs: finalSlabs,
                status: finalStatus,
              }
            : s,
        ),
      );
      toast.success(`QPS scheme updated for ${selectedSku.skuName}`);
    } else {
      const newScheme: QpsScheme = {
        id: `QPS-${selectedSku.skuCode}-${Date.now()}`,
        name: `QPS – ${selectedSku.skuName}`,
        skuCode: selectedSku.skuCode,
        skuName: selectedSku.skuName,
        mrp: selectedSku.mrp,
        sellingPrice: selectedSku.sellingPrice,
        slabs: finalSlabs,
        startDate: editorStartDate,
        endDate: editorEndDate,
        status: finalStatus,
      };
      setQpsSchemes((prev) => [newScheme, ...prev]);
      toast.success(`QPS scheme created for ${selectedSku.skuName}`);
    }
    setIsEditorOpen(false);
  };

  const viewScheme = viewSchemeId ? qpsSchemes.find((s) => s.id === viewSchemeId) : null;

  // Inception-day: when the seller has no QPS schemes at all, hide
  // only the toolbar chrome (search, status filter, Create CTA) and
  // the pagination footer. KPI summary stays visible (showing 0s) and
  // the same full-height Card container is preserved so the layout
  // reads identically to the populated state.
  const isEmpty = qpsSchemes.length === 0;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Page area — Card stretches; only the rows scroll. Mirrors the
          My SKU page pattern. */}
      <div className="flex-1 overflow-hidden p-6">
        <Card className="h-full flex flex-col overflow-hidden p-0 gap-0">
          {/* Header with search + filters + actions — search + Create
              QPS stay visible on the empty state so the seller can
              immediately start authoring schemes; only the status
              filter (which has nothing to filter) is hidden. */}
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
            {/* Right-aligned actions: Filters (right-side drawer) +
                Create Offers. Matches the My SKU / Customers pattern
                so the toolbar reads consistently across list pages. */}
            <div className="flex items-center gap-2">
              {!isEmpty && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {(statusFilter !== "all" || offerTypeFilter !== "all") && (
                    <Badge className="bg-blue-600 text-white border-blue-600 ml-1 h-5 px-1.5 text-[10px]">
                      {(statusFilter !== "all" ? 1 : 0) +
                        (offerTypeFilter !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setIsOfferTypeOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Offers
              </Button>
            </div>
          </div>

          {/* Table — flex-1 so it fills the remaining Card height; only
              this region scrolls. When the catalog is empty, the
              EmptyState fills the entire region (no headers) so the
              illustration sits centered. */}
          <div className="flex-1 overflow-auto">
            {isEmpty ? (
              <EmptyState
                icon={Tag}
                title="No QPS schemes yet"
                description="Once you create a quantity-based pricing scheme to reward bulk buyers, they'll appear here for ongoing management."
              />
            ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr className="text-left">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">SKU Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">SKU Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Offer Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Validity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 text-center">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSchemes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-3">
                      <EmptyState
                        icon={Tag}
                        title="No matches"
                        description="No schemes match your search or filters. Try clearing them to see everything."
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedSchemes.map((s) => {
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-800">{s.skuCode}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{s.skuName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                            <Layers className="h-3 w-3" /> QPS
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-700">{s.startDate}</p>
                          <p className="text-xs text-gray-500">to {s.endDate}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`${getStatusColor(s.status)} border font-medium text-xs`}>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="View Details"
                              onClick={() => setViewSchemeId(s.id)}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title={s.status === "Expired" ? "Expired schemes cannot be edited" : "Edit"}
                              disabled={s.status === "Expired"}
                              onClick={() => handleOpenEdit(s)}
                            >
                              <Pencil className={`h-4 w-4 ${s.status === "Expired" ? "text-gray-300" : "text-gray-700"}`} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            )}
          </div>
          {!isEmpty && (
          <ListPagination
            page={currentPage}
            total={filteredSchemes.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="scheme"
          />
          )}
        </Card>
      </div>

      {/* ====================== View Details Dialog ====================== */}
      <Dialog
        open={viewSchemeId !== null}
        onOpenChange={(open) => !open && setViewSchemeId(null)}
      >
        <DialogContent className="!max-w-[min(95vw,900px)] w-[min(95vw,900px)] max-h-[92vh] overflow-y-auto">
          {viewScheme && (
            <>
              <DialogHeader className="pb-2">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Layers className="h-5 w-5 text-blue-600" />
                  {viewScheme.name}
                </DialogTitle>
                <DialogDescription>
                  {viewScheme.skuCode} · {viewScheme.skuName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* SKU + validity strip */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-[11px] text-gray-600">MRP</p>
                      <p className="font-bold text-gray-900">₹{viewScheme.mrp}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-600">Selling Price</p>
                      <p className="font-bold text-green-700">₹{viewScheme.sellingPrice}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-600">Validity</p>
                      <p className="text-sm text-gray-800">
                        {viewScheme.startDate} → {viewScheme.endDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-600">Status</p>
                      <Badge className={`${getStatusColor(viewScheme.status)} border text-xs`}>
                        {viewScheme.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Slab table with clear customer-facing pricing */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Pricing Slabs ({viewScheme.slabs.length})
                    </p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 border-b border-gray-200">
                      <tr className="text-left">
                        <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase">Slab</th>
                        <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase">Qty Range</th>
                        <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase">Discount</th>
                        <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase text-right">Customer Pays</th>
                        <th className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase text-right">You Save</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewScheme.slabs.map((slab, i) => {
                        const saving = viewScheme.sellingPrice - slab.effectivePrice;
                        const savingPct = (saving / viewScheme.sellingPrice) * 100;
                        return (
                          <tr key={i}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">Slab {i + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {slab.minQty}–{slab.maxQty === null ? "∞" : slab.maxQty} units
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {slab.discountType === "percent" ? (
                                <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                                  {slab.slabPercent}% off
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                  Flat ₹{slab.slabPrice}/unit
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <p className="text-base font-medium text-green-700">
                                ₹{slab.effectivePrice.toFixed(2)}
                              </p>
                              <p className="text-[10px] text-gray-500">per unit</p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {saving > 0 ? (
                                <>
                                  <p className="text-sm font-medium text-purple-700">
                                    ₹{saving.toFixed(2)}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    ({savingPct.toFixed(1)}% off SP)
                                  </p>
                                </>
                              ) : (
                                <p className="text-xs text-gray-400">—</p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewSchemeId(null)}>
                  Close
                </Button>
                <Button
                  disabled={viewScheme.status === "Expired"}
                  title={
                    viewScheme.status === "Expired"
                      ? "Expired schemes cannot be edited — create a new one if needed"
                      : undefined
                  }
                  onClick={() => {
                    const s = viewScheme;
                    setViewSchemeId(null);
                    handleOpenEdit(s);
                  }}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  {viewScheme.status === "Expired" ? "Edit (Expired)" : "Edit Scheme"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ====================== Offer-Type Picker Dialog ======================
          Phase-1 entry point for "Create Offers". Surfaces all 10
          offer types as cards with hover affordances. Only QPS is
          live; the rest carry a "Coming Soon" badge and are
          non-interactive. Picking QPS bridges to the existing QPS
          editor below. */}
      <Dialog open={isOfferTypeOpen} onOpenChange={setIsOfferTypeOpen}>
        <DialogContent className="!max-w-[min(95vw,1100px)] w-[min(95vw,1100px)] max-h-[92vh] overflow-y-auto p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Tag className="h-5 w-5 text-blue-600" />
              Create Offers
            </DialogTitle>
            <DialogDescription>
              Pick the type of offer you want to set up for your catalog.
              More types are rolling out — stay tuned.
            </DialogDescription>
          </DialogHeader>

          {/* Two rows of five — same shape as the dashboard shortcut
              grid. Each tile mirrors the Settings hub card: icon
              tile on the left, heading + one-line subtitle on the
              right, top-aligned. The whole card is the click target. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 py-2">
            {OFFER_TYPES.map((t) => {
              const enabled = t.id === "qps";
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={enabled ? handlePickQps : undefined}
                  disabled={!enabled}
                  className={
                    "relative text-left rounded-xl border p-4 transition-all min-h-[140px] " +
                    (enabled
                      ? "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                      : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed")
                  }
                >
                  {!enabled && (
                    <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-700 border border-gray-300 leading-none">
                      Coming Soon
                    </span>
                  )}
                  <div
                    className={`${t.iconBg} ${t.iconColor} p-2 rounded-lg w-fit`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-3 leading-tight">
                    {t.label}
                  </p>
                  <p className="text-[11px] text-gray-600 leading-snug mt-1">
                    {t.description}
                  </p>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOfferTypeOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====================== Create / Edit QPS Dialog ====================== */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="!max-w-[min(95vw,1150px)] w-[min(95vw,1150px)] max-h-[92vh] overflow-y-auto p-5">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Layers className="h-5 w-5 text-blue-600" />
              {editingId ? "Edit" : "Create"} Quantity Pricing Scheme (QPS)
            </DialogTitle>
            <DialogDescription>
              Select a SKU and define quantity-based pricing slabs. Use flat price or %
              discount per slab — the effective per-unit price that the customer pays is
              calculated live.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* SKU + dates */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Label className="text-xs font-medium text-gray-700 mb-1 block">
                  SKU <span className="text-red-500">*</span>
                </Label>
                <Select value={editorSkuCode} onValueChange={setEditorSkuCode}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a SKU from your catalog..." />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogSkus.map((s) => (
                      <SelectItem key={s.skuCode} value={s.skuCode}>
                        {s.skuCode} — {s.skuName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1 block">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input type="date" value={editorStartDate} onChange={(e) => setEditorStartDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700 mb-1 block">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input type="date" value={editorEndDate} onChange={(e) => setEditorEndDate(e.target.value)} />
              </div>
            </div>

            {/* Scheme Status — Active / Inactive toggle */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <div>
                <Label className="text-sm font-semibold text-gray-800">
                  Scheme Status
                </Label>
                <p className="text-xs text-gray-600 mt-0.5">
                  {editorActive
                    ? "Active — slab pricing applies on matching orders within the validity window."
                    : "Inactive — slab pricing is paused. Orders use the regular Selling Price."}
                  {editorEndDate && editorEndDate < new Date().toISOString().slice(0, 10) && (
                    <span className="text-red-700 font-medium"> · End date is in the past — scheme will save as Expired.</span>
                  )}
                </p>
              </div>
              {/* Order is Inactive ← Switch → Active so the side the
                  thumb travels to (right, "checked") visually matches
                  the green "Active" label. The previous arrangement
                  (Active left / Inactive right) read as if turning ON
                  the switch was deactivating the scheme. */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold ${!editorActive ? "text-orange-700" : "text-gray-400"}`}
                >
                  Inactive
                </span>
                <Switch
                  checked={editorActive}
                  onCheckedChange={setEditorActive}
                  disabled={!!editorEndDate && editorEndDate < new Date().toISOString().slice(0, 10)}
                />
                <span
                  className={`text-xs font-semibold ${editorActive ? "text-green-700" : "text-gray-400"}`}
                >
                  Active
                </span>
              </div>
            </div>

            {/* Prominent MRP / SP panel once SKU is selected */}
            {selectedSku && (
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-600 uppercase tracking-wider">Selected SKU</p>
                    <p className="font-semibold text-gray-900">{selectedSku.skuName}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {selectedSku.skuCode} · {selectedSku.brand} · {selectedSku.category}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[11px] text-gray-600 uppercase tracking-wider">MRP</p>
                      <p className="text-2xl font-bold text-gray-900">₹{selectedSku.mrp}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-600 uppercase tracking-wider">Selling Price</p>
                      <p className="text-2xl font-bold text-green-700">₹{selectedSku.sellingPrice}</p>
                      <p className="text-[10px] text-gray-500">base before discount</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Slab editor — only visible after a SKU is selected.
                Authoring price slabs without a Selling Price reference
                is meaningless, so we hide the entire section (header
                row + table + helper banner) until a SKU is picked. */}
            {selectedSku && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Pricing Slabs</p>
                <Button variant="outline" size="sm" onClick={addSlab} className="gap-1 h-7 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Slab
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase w-16">#</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase w-24">Min Qty</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase w-28">Max Qty</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase w-36">Discount Type</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase w-28">Value</th>
                      <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-600 uppercase">Customer Pays</th>
                      <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-600 uppercase">Saving</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {editorSlabs.map((slab, i) => {
                      const rowErrors = editorErrors.filter((e) => e.rowIndex === i);
                      const isError = rowErrors.length > 0;
                      const eff = computeEffectivePrice(slab, spForEditor);
                      const saving = spForEditor - eff;
                      const savingPct = spForEditor > 0 ? (saving / spForEditor) * 100 : 0;
                      return (
                        <tr key={i} className={isError ? "bg-red-50/60" : ""}>
                          <td className="px-4 py-3 text-xs font-medium text-gray-700">Slab {i + 1}</td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min={1}
                              value={slab.minQty ?? ""}
                              onChange={(e) => updateSlab(i, { minQty: parseInt(e.target.value) || 0 })}
                              className="h-8"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min={1}
                              placeholder="∞"
                              value={slab.maxQty ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                updateSlab(i, { maxQty: v === "" ? null : parseInt(v) || 0 });
                              }}
                              className="h-8"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={slab.discountType ?? "flat"}
                              onValueChange={(v) =>
                                updateSlab(i, {
                                  discountType: v as SlabDiscountType,
                                  slabPrice: v === "flat" ? (slab.slabPrice ?? 0) : undefined,
                                  slabPercent: v === "percent" ? (slab.slabPercent ?? 0) : undefined,
                                })
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="flat">Flat Price (₹)</SelectItem>
                                <SelectItem value="percent">% Discount</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                            {slab.discountType === "percent" ? (
                              <div className="relative">
                                <Input
                                  type="number"
                                  min={0}
                                  max={99.99}
                                  step={0.01}
                                  value={slab.slabPercent ?? ""}
                                  onChange={(e) => updateSlab(i, { slabPercent: parseFloat(e.target.value) })}
                                  className="h-8 pr-6"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                              </div>
                            ) : (
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">₹</span>
                                <Input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={slab.slabPrice ?? ""}
                                  onChange={(e) => updateSlab(i, { slabPrice: parseFloat(e.target.value) })}
                                  className="h-8 pl-5"
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-base font-medium text-green-700">₹{eff.toFixed(2)}</p>
                            <p className="text-[10px] text-gray-500">per unit</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {saving > 0.01 ? (
                              <>
                                <p className="text-sm font-medium text-purple-700">
                                  ₹{saving.toFixed(2)}
                                </p>
                                <p className="text-[10px] text-gray-500">{savingPct.toFixed(1)}% off</p>
                              </>
                            ) : (
                              <p className="text-xs text-gray-400">—</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => removeSlab(i)}
                              disabled={editorSlabs.length === 1}
                              title={editorSlabs.length === 1 ? "At least one slab is required" : "Remove slab"}
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
              {/* MRP reference footer */}
              {selectedSku && (
                <div className="bg-gray-50 border-t border-gray-100 px-3 py-2 text-[11px] text-gray-600 flex items-center justify-between">
                  <span>
                    💡 Effective price = the per-unit price the <b>customer pays</b> after the slab
                    discount.
                  </span>
                  <span>
                    MRP: <b className="text-gray-900">₹{mrpForEditor}</b> · SP: <b className="text-green-700">₹{spForEditor}</b>
                  </span>
                </div>
              )}
            </div>
            )}

            {/* Validation errors */}
            {selectedSku && editorErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-800 mb-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {editorErrors.length} validation error{editorErrors.length === 1 ? "" : "s"}:
                </p>
                <ul className="space-y-1 text-xs text-red-700">
                  {editorErrors.map((err, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-mono font-semibold text-[10px] bg-red-100 text-red-800 border border-red-200 px-1 py-0.5 rounded shrink-0">
                        {err.code}
                      </span>
                      <span>{err.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditor}
              disabled={!selectedSku || editorErrors.length > 0}
              className=""
            >
              {editingId ? "Save Changes" : "Create QPS Scheme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Right-side filter drawer — Status + Offer Type. Live page
          only ships QPS schemes, so the Offer Type dropdown surfaces
          a single option; the empty-mode demo page uses the same
          drawer with all 10 types. */}
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
        offerTypeOptions={OFFER_TYPES.filter((t) => t.id === "qps").map<OfferTypeOption>((t) => ({
          value: t.id,
          label: t.label,
        }))}
        onClearFilters={() => {
          setStatusFilter("all");
          setOfferTypeFilter("all");
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
