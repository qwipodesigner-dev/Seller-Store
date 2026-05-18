import { useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
import { toast } from "sonner";
import { ListPagination } from "../../components/ui/list-pagination";
import {
  OffersFilterDrawer,
  type OfferTypeOption,
} from "../../components/filter-drawers/offers-filter-drawer";

// =====================================================================
// Empty-mode demo page for "Offers & Schemes 2"
//
// Surfaces the SAME table chrome the live page uses, but enables ALL
// 10 offer types end-to-end (the live page only wires QPS — the rest
// are "Coming Soon" there). On this page the seller can:
//   - Create any of the 10 offer types via the "Create Offers" CTA
//   - View an offer's full configuration (Eye action)
//   - Edit an existing offer (Pencil action; Expired offers are gated)
//
// State is in-memory only — refreshing the page resets to the seed
// catalogue, which intentionally includes the same SKU appearing under
// multiple offer types so reviewers see the multi-offer pattern.
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

interface DemoOffer {
  id: string;
  skuCode: string;
  skuName: string;
  offerType: OfferKind;
  /** Free-text describing the offer. Replaces the per-type detail
   *  columns the live page exposes (Pricing Rules, MRP/SP, etc.). */
  details: string;
  startDate: string;
  endDate: string;
  status: OfferStatus;
}

const OFFER_TYPE_META: Record<
  OfferKind,
  {
    label: string;
    description: string;
    icon: LucideIcon;
    iconColor: string;
    bg: string;
    border: string;
    placeholder: string;
  }
> = {
  qps: {
    label: "QPS",
    description: "Quantity-based price slabs with tiered discounts",
    icon: Layers,
    iconColor: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    placeholder: "e.g. 3 slabs · 1–11 / 12–47 / 48+ qty · up to 10% off",
  },
  "value-slab": {
    label: "Value Slab",
    description: "Order value-based discount tiers",
    icon: IndianRupee,
    iconColor: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    placeholder:
      "e.g. Order > ₹50,000 · 3% off · Order > ₹1,00,000 · 5% off",
  },
  bogo: {
    label: "BOGO",
    description: "Buy X quantity, get Y free units",
    icon: Gift,
    iconColor: "text-pink-700",
    bg: "bg-pink-50",
    border: "border-pink-200",
    placeholder: "e.g. Buy 10, get 1 free unit",
  },
  "case-bonus": {
    label: "Case Bonus",
    description: "Extra cases free on bulk purchase",
    icon: Boxes,
    iconColor: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    placeholder: "e.g. Buy 50 cases, get 3 free",
  },
  "off-invoice": {
    label: "Off-Invoice",
    description: "Flat discount applied on invoice total",
    icon: Receipt,
    iconColor: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    placeholder: "e.g. Flat ₹10 off per unit on invoice",
  },
  "display-allowance": {
    label: "Display Allowance",
    description: "Incentive for in-store product display",
    icon: StoreIcon,
    iconColor: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    placeholder: "e.g. ₹500 per store for end-cap display",
  },
  "launch-incentive": {
    label: "Launch Incentive",
    description: "Special pricing for new product launches",
    icon: Rocket,
    iconColor: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    placeholder: "e.g. ₹50 launch discount per unit · first 60 days",
  },
  "loyalty-rebate": {
    label: "Loyalty Rebate",
    description: "Cashback rebate for repeat purchases",
    icon: Award,
    iconColor: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    placeholder: "e.g. 1% cashback on every reorder after 3rd month",
  },
  "combo-bundle": {
    label: "Combo Bundle",
    description: "Bundled products at discounted rate",
    icon: Package,
    iconColor: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    placeholder:
      "e.g. Bundle 1 case Sunflower + 1 case Groundnut · ₹150 off",
  },
  "early-payment": {
    label: "Early Payment",
    description: "Discount for early invoice settlement",
    icon: Clock,
    iconColor: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    placeholder: "e.g. 2% off if invoice settled within 7 days",
  },
};

const OFFER_KINDS: OfferKind[] = Object.keys(OFFER_TYPE_META) as OfferKind[];

// Seed data — three SKUs each carrying multiple offer types so the
// table actively shows the "same SKU, different rows" pattern.
const SEED_OFFERS: DemoOffer[] = [
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

// Type-aware id prefix for fresh offer ids. Helps reviewers see at a
// glance which row carries which offer kind when they reorder.
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

interface OfferDraft {
  skuCode: string;
  skuName: string;
  offerType: OfferKind;
  details: string;
  startDate: string;
  endDate: string;
  status: OfferStatus;
}

const emptyDraft = (): OfferDraft => ({
  skuCode: "",
  skuName: "",
  offerType: "qps",
  details: "",
  startDate: todayISO(),
  endDate: plusDays(todayISO(), 30),
  status: "Scheduled",
});

export function OffersDemo() {
  const [offers, setOffers] = useState<DemoOffer[]>(SEED_OFFERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Dialog state — exactly one of these may be set at a time.
  const [createOpen, setCreateOpen] = useState(false);
  const [viewing, setViewing] = useState<DemoOffer | null>(null);
  const [editing, setEditing] = useState<DemoOffer | null>(null);

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
        offerTypeFilter === "all" || o.offerType === offerTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [offers, searchQuery, statusFilter, offerTypeFilter]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const filtersActive =
    statusFilter !== "all" || offerTypeFilter !== "all";

  const handleCreateSubmit = (draft: OfferDraft) => {
    const id = `${ID_PREFIX[draft.offerType]}-${draft.skuCode || Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
    const newOffer: DemoOffer = { id, ...draft };
    setOffers((prev) => [newOffer, ...prev]);
    setCreateOpen(false);
    setCurrentPage(1);
    toast.success(
      `Created ${OFFER_TYPE_META[draft.offerType].label} offer for ${draft.skuCode}.`,
    );
  };

  const handleEditSubmit = (draft: OfferDraft) => {
    if (!editing) return;
    setOffers((prev) =>
      prev.map((o) => (o.id === editing.id ? { ...o, ...draft } : o)),
    );
    setEditing(null);
    toast.success(`Updated offer ${editing.id}.`);
  };

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
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setCreateOpen(true)}
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

      {/* Create dialog — fresh draft, all 10 types selectable. */}
      <OfferFormDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit dialog — pre-filled from the row, same form shape. */}
      <OfferFormDialog
        open={!!editing}
        mode="edit"
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={handleEditSubmit}
      />

      {/* View dialog — read-only display. */}
      <OfferViewDialog
        offer={viewing}
        onClose={() => setViewing(null)}
        onEdit={(o) => {
          setViewing(null);
          setEditing(o);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------
// Subcomponents — kept in this file because they're purpose-built for
// the demo flow and not reused anywhere else.
// ---------------------------------------------------------------------

interface OfferFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: DemoOffer | null;
  onClose: () => void;
  onSubmit: (draft: OfferDraft) => void;
}

function OfferFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: OfferFormDialogProps) {
  // Re-key on the row id (or "new") so the form resets between opens.
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <OfferForm
          key={initial?.id ?? "new"}
          mode={mode}
          initial={initial}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

interface OfferFormProps {
  mode: "create" | "edit";
  initial?: DemoOffer | null;
  onCancel: () => void;
  onSubmit: (draft: OfferDraft) => void;
}

function OfferForm({ mode, initial, onCancel, onSubmit }: OfferFormProps) {
  const [draft, setDraft] = useState<OfferDraft>(() =>
    initial
      ? {
          skuCode: initial.skuCode,
          skuName: initial.skuName,
          offerType: initial.offerType,
          details: initial.details,
          startDate: initial.startDate,
          endDate: initial.endDate,
          status: initial.status,
        }
      : emptyDraft(),
  );
  const [errors, setErrors] = useState<Partial<Record<keyof OfferDraft, string>>>(
    {},
  );

  const update = <K extends keyof OfferDraft>(key: K, value: OfferDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const meta = OFFER_TYPE_META[draft.offerType];
  const TypeIcon = meta.icon;

  const handleSubmit = () => {
    const errs: Partial<Record<keyof OfferDraft, string>> = {};
    if (!draft.skuCode.trim()) errs.skuCode = "SKU code is required";
    if (!draft.skuName.trim()) errs.skuName = "SKU name is required";
    if (!draft.details.trim()) errs.details = "Details are required";
    if (!draft.startDate) errs.startDate = "Start date is required";
    if (!draft.endDate) errs.endDate = "End date is required";
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      errs.endDate = "End date must be on or after the start date";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(draft);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {mode === "create" ? "Create Offer" : "Edit Offer"}
        </DialogTitle>
        <DialogDescription>
          {mode === "create"
            ? "Pick an offer type and configure the details. All 10 offer types are available on this page."
            : "Update the offer's configuration. Saving overwrites the current row."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {/* Offer type — full-width selector at the top so the rest of
            the form's helper text adapts to the picked type. */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            Offer Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={draft.offerType}
            onValueChange={(v) => update("offerType", v as OfferKind)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue>
                <span className="inline-flex items-center gap-2">
                  <TypeIcon className={`h-4 w-4 ${meta.iconColor}`} />
                  {meta.label}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {OFFER_KINDS.map((kind) => {
                const m = OFFER_TYPE_META[kind];
                const Icon = m.icon;
                return (
                  <SelectItem key={kind} value={kind}>
                    <span className="inline-flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${m.iconColor}`} />
                      <span className="font-medium">{m.label}</span>
                      <span className="text-xs text-gray-500">
                        — {m.description}
                      </span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-gray-500">{meta.description}</p>
        </div>

        {/* SKU pair */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">
              SKU Code <span className="text-red-500">*</span>
            </Label>
            <Input
              value={draft.skuCode}
              onChange={(e) => update("skuCode", e.target.value)}
              placeholder="e.g. 180000008"
              className="h-9 text-sm font-mono"
              aria-invalid={!!errors.skuCode}
            />
            {errors.skuCode && (
              <p className="text-[11px] text-red-600">{errors.skuCode}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              SKU Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={draft.skuName}
              onChange={(e) => update("skuName", e.target.value)}
              placeholder="e.g. FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS."
              className="h-9 text-sm"
              aria-invalid={!!errors.skuName}
            />
            {errors.skuName && (
              <p className="text-[11px] text-red-600">{errors.skuName}</p>
            )}
          </div>
        </div>

        {/* Type-aware details — placeholder reflects the picked type so
            the seller sees a working template for the offer they're
            building. */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            Details <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={draft.details}
            onChange={(e) => update("details", e.target.value)}
            placeholder={meta.placeholder}
            className="text-sm min-h-[80px]"
            aria-invalid={!!errors.details}
          />
          {errors.details ? (
            <p className="text-[11px] text-red-600">{errors.details}</p>
          ) : (
            <p className="text-[11px] text-gray-500">
              How the {meta.label} rule reads to a buyer. Free text — use the
              placeholder pattern as a guide.
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={draft.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="h-9 text-sm"
              aria-invalid={!!errors.startDate}
            />
            {errors.startDate && (
              <p className="text-[11px] text-red-600">{errors.startDate}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              End Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={draft.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="h-9 text-sm"
              aria-invalid={!!errors.endDate}
            />
            {errors.endDate && (
              <p className="text-[11px] text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={draft.status}
            onValueChange={(v) => update("status", v as OfferStatus)}
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
        </div>
      </div>

      <DialogFooter className="mt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {mode === "create" ? "Create Offer" : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

interface OfferViewDialogProps {
  offer: DemoOffer | null;
  onClose: () => void;
  onEdit: (offer: DemoOffer) => void;
}

function OfferViewDialog({ offer, onClose, onEdit }: OfferViewDialogProps) {
  if (!offer) {
    return (
      <Dialog open={false} onOpenChange={() => onClose()}>
        <DialogContent />
      </Dialog>
    );
  }
  const meta = OFFER_TYPE_META[offer.offerType];
  const Icon = meta.icon;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${meta.iconColor}`} />
            {offer.skuName}
          </DialogTitle>
          <DialogDescription>
            Offer ID&nbsp;
            <span className="font-mono text-gray-700">{offer.id}</span>
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
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
              Details
            </p>
            <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 border border-gray-200 rounded-md p-3">
              {offer.details}
            </p>
          </div>
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
      <p
        className={`text-sm text-gray-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
