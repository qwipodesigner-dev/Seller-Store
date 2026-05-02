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
  TrendingDown,
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

// Seed QPS schemes — these populate the list on first load.
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
  const [qpsSchemes, setQpsSchemes] = useState<QpsScheme[]>(seedQpsSchemes);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create / Edit QPS dialog (shared — editingId=null means create)
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
    return matchesSearch && matchesStatus;
  });

  // ---- KPIs ----
  const totalSchemes = qpsSchemes.length;
  const activeSchemes = qpsSchemes.filter((s) => s.status === "Active").length;
  const totalSlabs = qpsSchemes.reduce((n, s) => n + s.slabs.length, 0);
  const avgDiscount = qpsSchemes.length
    ? qpsSchemes.reduce((sum, s) => {
        const best = Math.min(...s.slabs.map((sl) => sl.effectivePrice));
        return sum + ((s.sellingPrice - best) / s.sellingPrice) * 100;
      }, 0) / qpsSchemes.length
    : 0;

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

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* KPI Summary */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Card className="border-0 shadow-sm p-3">
            <div className="flex items-center gap-3">
              <Layers className="h-6 w-6 text-gray-600" />
              <div>
                <div className="text-xl font-bold">{totalSchemes}</div>
                <p className="text-xs text-gray-600">Total QPS Schemes</p>
              </div>
            </div>
          </Card>
          <Card className="border-0 shadow-sm p-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-xl font-bold text-green-600">{activeSchemes}</div>
                <p className="text-xs text-gray-600">Active</p>
              </div>
            </div>
          </Card>
          <Card className="border-0 shadow-sm p-3">
            <div className="flex items-center gap-3">
              <Tag className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-xl font-bold text-blue-600">{totalSlabs}</div>
                <p className="text-xs text-gray-600">Total Pricing Rules</p>
              </div>
            </div>
          </Card>
          <Card className="border-0 shadow-sm p-3">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-6 w-6 text-purple-600" />
              <div>
                <div className="text-xl font-bold text-purple-600">{avgDiscount.toFixed(1)}%</div>
                <p className="text-xs text-gray-600">Avg max discount</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          {/* Header with search + filters + actions */}
          <div className="border-b border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto flex-wrap">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by SKU code or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-3 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleOpenCreate} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create QPS
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase">SKU Code</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase">SKU Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Offer Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase text-center">
                    Pricing Rules
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase text-right">
                    MRP / SP
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Validity</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase text-center">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchemes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <Tag className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-900">No QPS schemes</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Click <b>Create QPS</b> above to define quantity-based pricing.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSchemes.map((s) => {
                    const bestPrice = Math.min(...s.slabs.map((x) => x.effectivePrice));
                    const maxSaving = (((s.sellingPrice - bestPrice) / s.sellingPrice) * 100).toFixed(1);
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
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-lg font-bold text-gray-900">{s.slabs.length}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                              slab{s.slabs.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="text-xs text-gray-500">MRP ₹{s.mrp}</p>
                          <p className="text-sm font-semibold text-green-700">SP ₹{s.sellingPrice}</p>
                          <p className="text-[10px] text-purple-700">Best: ₹{bestPrice.toFixed(2)} ({maxSaving}% off)</p>
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
          </div>
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
                            <td className="px-3 py-2.5 text-sm font-medium text-gray-700">Slab {i + 1}</td>
                            <td className="px-3 py-2.5 text-sm text-gray-800">
                              {slab.minQty}–{slab.maxQty === null ? "∞" : slab.maxQty} units
                            </td>
                            <td className="px-3 py-2.5 text-sm">
                              {slab.discountType === "percent" ? (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                  {slab.slabPercent}% off
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                  Flat ₹{slab.slabPrice}/unit
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <p className="text-base font-bold text-green-700">
                                ₹{slab.effectivePrice.toFixed(2)}
                              </p>
                              <p className="text-[10px] text-gray-500">per unit</p>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              {saving > 0 ? (
                                <>
                                  <p className="text-sm font-semibold text-purple-700">
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
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  {viewScheme.status === "Expired" ? "Edit (Expired)" : "Edit Scheme"}
                </Button>
              </DialogFooter>
            </>
          )}
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
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold ${editorActive ? "text-green-700" : "text-gray-400"}`}
                >
                  Active
                </span>
                <Switch
                  checked={editorActive}
                  onCheckedChange={setEditorActive}
                  disabled={!!editorEndDate && editorEndDate < new Date().toISOString().slice(0, 10)}
                />
                <span
                  className={`text-xs font-semibold ${!editorActive ? "text-orange-700" : "text-gray-400"}`}
                >
                  Inactive
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

            {/* Slab editor */}
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
                          <td className="px-3 py-2 text-xs font-medium text-gray-700">Slab {i + 1}</td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={1}
                              value={slab.minQty ?? ""}
                              onChange={(e) => updateSlab(i, { minQty: parseInt(e.target.value) || 0 })}
                              className="h-8"
                            />
                          </td>
                          <td className="px-3 py-2">
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
                          <td className="px-3 py-2">
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
                          <td className="px-3 py-2">
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
                          <td className="px-3 py-2 text-right">
                            <p className="text-base font-bold text-green-700">₹{eff.toFixed(2)}</p>
                            <p className="text-[10px] text-gray-500">per unit</p>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {saving > 0.01 ? (
                              <>
                                <p className="text-sm font-semibold text-purple-700">
                                  ₹{saving.toFixed(2)}
                                </p>
                                <p className="text-[10px] text-gray-500">{savingPct.toFixed(1)}% off</p>
                              </>
                            ) : (
                              <p className="text-xs text-gray-400">—</p>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingId ? "Save Changes" : "Create QPS Scheme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
