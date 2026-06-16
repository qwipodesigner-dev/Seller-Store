import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  UserX,
  Building2,
  Tag,
  Users,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { psCompanies, psBrands } from "../../lib/product-store-data";

interface BrandManager {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  companyIds: string[];
  brandIds: string[];
  status: "active" | "inactive";
  createdAt: string;
}

const initialManagers: BrandManager[] = [
  {
    id: "BM-001",
    name: "Arjun Mehta",
    mobile: "5500000002",
    email: "arjun.mehta@itc.in",
    companyIds: ["ITC"],
    brandIds: ["AASH", "SUNF", "BINGO", "YIPP"],
    status: "active",
    createdAt: "2026-01-15",
  },
  {
    id: "BM-002",
    name: "Sneha Kapoor",
    mobile: "5500000003",
    email: "sneha.kapoor@nestle.in",
    companyIds: ["NEST"],
    brandIds: ["MAGGI", "NESTEA", "KITKAT"],
    status: "active",
    createdAt: "2026-02-10",
  },
  {
    id: "BM-003",
    name: "Ravi Sharma",
    mobile: "5500000004",
    email: "ravi.sharma@hul.in",
    companyIds: ["HUL"],
    brandIds: ["SURF", "LUX", "DOVE", "LIPT", "KNORR"],
    status: "inactive",
    createdAt: "2026-03-05",
  },
];

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  companyIds: [] as string[],
  brandIds: [] as string[],
};

export function CatalogAdminBrandManagers() {
  const [managers, setManagers] = useState<BrandManager[]>(initialManagers);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = managers.filter((m) => {
    const q = search.toLowerCase();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.mobile.includes(q) ||
      (m.email ?? "").toLowerCase().includes(q) ||
      m.companyIds.some((id) =>
        psCompanies.find((c) => c.id === id)?.name.toLowerCase().includes(q)
      )
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (m: BrandManager) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      mobile: m.mobile,
      email: m.email ?? "",
      companyIds: [...m.companyIds],
      brandIds: [...m.brandIds],
    });
    setDialogOpen(true);
  };

  const toggleCompany = (id: string) => {
    setForm((prev) => {
      const has = prev.companyIds.includes(id);
      const companyIds = has
        ? prev.companyIds.filter((c) => c !== id)
        : [...prev.companyIds, id];
      // Remove brands that no longer belong to selected companies
      const brandIds = prev.brandIds.filter((bid) => {
        const brand = psBrands.find((b) => b.id === bid);
        return brand && companyIds.includes(brand.companyId);
      });
      return { ...prev, companyIds, brandIds };
    });
  };

  const toggleBrand = (id: string) => {
    setForm((prev) => ({
      ...prev,
      brandIds: prev.brandIds.includes(id)
        ? prev.brandIds.filter((b) => b !== id)
        : [...prev.brandIds, id],
    }));
  };

  const availableBrands = psBrands.filter((b) =>
    form.companyIds.includes(b.companyId)
  );

  const isValid = form.name.trim() && form.mobile.trim().length >= 10 && form.companyIds.length > 0;

  const handleSave = () => {
    if (!isValid) return;
    if (editingId) {
      setManagers((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, name: form.name, mobile: form.mobile, email: form.email, companyIds: form.companyIds, brandIds: form.brandIds }
            : m
        )
      );
      toast.success(`Brand Manager "${form.name}" updated.`);
    } else {
      const newManager: BrandManager = {
        id: `BM-${Date.now()}`,
        name: form.name,
        mobile: form.mobile,
        email: form.email || undefined,
        companyIds: form.companyIds,
        brandIds: form.brandIds,
        status: "active",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setManagers((prev) => [newManager, ...prev]);
      toast.success(`Brand Manager "${form.name}" created successfully.`);
    }
    setDialogOpen(false);
  };

  const toggleStatus = (m: BrandManager) => {
    setManagers((prev) =>
      prev.map((bm) =>
        bm.id === m.id
          ? { ...bm, status: bm.status === "active" ? "inactive" : "active" }
          : bm
      )
    );
    toast.success(
      m.status === "active"
        ? `"${m.name}" deactivated.`
        : `"${m.name}" reactivated.`
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-600" />
            Brand Managers
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage Brand Manager logins. Map each manager to their companies and brands.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4" />
          Add Brand Manager
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, mobile, company..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="font-medium">No brand managers found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Companies</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Brands</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const companies = psCompanies.filter((c) => m.companyIds.includes(c.id));
                  const brands = psBrands.filter((b) => m.brandIds.includes(b.id));
                  return (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{m.name}</p>
                        {m.email && <p className="text-xs text-gray-400">{m.email}</p>}
                        <code className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded font-mono">{m.id}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-gray-700">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {m.mobile}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {companies.map((c) => (
                            <Badge key={c.id} className="bg-teal-50 text-teal-700 border-teal-200 text-[10px] gap-1">
                              <Building2 className="h-2.5 w-2.5" />
                              {c.name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {brands.slice(0, 3).map((b) => (
                            <Badge key={b.id} className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                              {b.name}
                            </Badge>
                          ))}
                          {brands.length > 3 && (
                            <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[10px]">
                              +{brands.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {m.status === "active" ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200 gap-1 text-xs">
                            <ShieldCheck className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(m)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit / Remap
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={m.status === "active" ? "text-red-600 focus:text-red-700" : ""}
                              onClick={() => toggleStatus(m)}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              {m.status === "active" ? "Deactivate" : "Reactivate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              {editingId ? "Edit Brand Manager" : "Add Brand Manager"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update this manager's details or company/brand mappings."
                : "Create a login and map the manager to their companies and brands."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                placeholder="e.g. Arjun Mehta"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <Label>Mobile Number *</Label>
              <Input
                placeholder="10-digit mobile"
                value={form.mobile}
                onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label>Email <span className="text-xs text-gray-400 font-normal">(optional)</span></Label>
              <Input
                placeholder="manager@company.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>

            {/* Companies */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-teal-600" />
                Map to Companies *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {psCompanies.map((c) => {
                  const selected = form.companyIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCompany(c.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs transition-colors ${
                        selected
                          ? "border-teal-400 bg-teal-50 text-teal-900"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded border-2 flex-shrink-0 flex items-center justify-center ${selected ? "border-teal-600 bg-teal-600" : "border-gray-300"}`}>
                        {selected && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                      </div>
                      <span className="truncate font-medium">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands — only shown when companies selected */}
            {availableBrands.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-indigo-600" />
                  Map to Brands <span className="text-xs text-gray-400 font-normal">(optional — leave blank for all brands in company)</span>
                </Label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto border rounded-lg p-2">
                  {availableBrands.map((b) => {
                    const selected = form.brandIds.includes(b.id);
                    const company = psCompanies.find((c) => c.id === b.companyId);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleBrand(b.id)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-left text-xs transition-colors ${
                          selected
                            ? "border-indigo-400 bg-indigo-50 text-indigo-900"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded border-2 flex-shrink-0 flex items-center justify-center ${selected ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`}>
                          {selected && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{b.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{company?.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-400">
                  {form.brandIds.length === 0
                    ? "No specific brands selected — manager will see all brands under mapped companies."
                    : `${form.brandIds.length} brand${form.brandIds.length === 1 ? "" : "s"} selected.`}
                </p>
              </div>
            )}

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!isValid}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {editingId ? "Save Changes" : "Create Brand Manager"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
