import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
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
  Building2,
  Tag,
  Pencil,
  Upload,
  Image as ImageIcon,
  X,
  Search,
  AlertCircle,
} from "lucide-react";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";
import {
  Brand,
  Company,
  getCompanies,
  makeId,
  revokeImage,
  setCompanies,
  setCompanyActive,
  subscribeToCompanies,
} from "../../lib/admin-catalog";

interface DraftBrand {
  id: string;
  name: string;
  imageUrl: string | null;
}

export function AdminCompanies() {
  const navigate = useNavigate();
  const [companies, setCompaniesState] = useState<Company[]>(getCompanies());
  const [search, setSearch] = useState("");

  // Subscribe so seller-add (or anything else) keeps us in sync.
  useEffect(() => {
    return subscribeToCompanies(() => setCompaniesState([...getCompanies()]));
  }, []);

  // Create / Edit dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftBrand[]>([
    { id: makeId("br"), name: "", imageUrl: null },
  ]);
  const companyImgRef = useRef<HTMLInputElement | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setImageUrl(null);
    setDrafts([{ id: makeId("br"), name: "", imageUrl: null }]);
    setIsOpen(true);
  };

  const openEdit = (c: Company) => {
    setEditingId(c.id);
    setName(c.name);
    setImageUrl(c.imageUrl);
    setDrafts(
      c.brands.length > 0
        ? c.brands.map((b) => ({ id: b.id, name: b.name, imageUrl: b.imageUrl }))
        : [{ id: makeId("br"), name: "", imageUrl: null }],
    );
    setIsOpen(true);
  };

  const handleCompanyImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    revokeImage(imageUrl);
    setImageUrl(URL.createObjectURL(f));
    e.target.value = "";
  };

  const handleBrandImage = (idx: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    setDrafts((prev) => {
      const next = [...prev];
      revokeImage(next[idx].imageUrl);
      next[idx] = { ...next[idx], imageUrl: URL.createObjectURL(file) };
      return next;
    });
  };

  const updateBrandName = (idx: number, value: string) => {
    setDrafts((prev) => prev.map((b, i) => (i === idx ? { ...b, name: value } : b)));
  };

  const addBrandRow = () =>
    setDrafts((prev) => [...prev, { id: makeId("br"), name: "", imageUrl: null }]);

  const removeBrandRow = (idx: number) => {
    setDrafts((prev) => {
      revokeImage(prev[idx].imageUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Company name is required");
      return;
    }
    const validBrands = drafts.filter((b) => b.name.trim() !== "");
    if (validBrands.length === 0) {
      toast.error("At least one brand is required");
      return;
    }
    const existing = editingId ? companies.find((c) => c.id === editingId) : undefined;
    const company: Company = {
      id: editingId ?? makeId("co"),
      name: name.trim(),
      imageUrl,
      isActive: existing?.isActive ?? true,
      brands: validBrands.map<Brand>((b) => ({
        id: b.id,
        name: b.name.trim(),
        imageUrl: b.imageUrl,
      })),
    };
    const next = editingId
      ? companies.map((c) => (c.id === editingId ? company : c))
      : [company, ...companies];
    setCompanies(next);
    toast.success(`Company "${company.name}" ${editingId ? "updated" : "created"}`);
    setIsOpen(false);
  };

  const handleToggleActive = (c: Company, next: boolean) => {
    setCompanyActive(c.id, next);
    toast.success(`"${c.name}" marked ${next ? "Active" : "Inactive"}`);
  };

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      q === "" ||
      c.name.toLowerCase().includes(q) ||
      c.brands.some((b) => b.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Companies & Brands
            </h2>
            <p className="text-sm text-gray-500">
              Manage company master data — used when creating sellers and SKUs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company or brand..."
                className="pl-9 w-64 h-9"
              />
            </div>
            <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-sm text-gray-500">
              No companies found. Click <b>Add Company</b> to create one.
            </CardContent>
          </Card>
        )}
        {filtered.map((c) => {
          const isActive = c.isActive !== false;
          return (
          <Card key={c.id} className={isActive ? "" : "opacity-75"}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      {c.brands.length} brand{c.brands.length === 1 ? "" : "s"}
                    </Badge>
                    {isActive ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.brands.map((b) => (
                      <div
                        key={b.id}
                        className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full pl-1 pr-2 py-0.5 text-xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                          {b.imageUrl ? (
                            <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                          ) : (
                            <Tag className="h-2.5 w-2.5 text-gray-400" />
                          )}
                        </div>
                        <span className="text-gray-800">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-2"
                    title={isActive ? "Deactivate company" : "Activate company"}
                  >
                    <Switch
                      checked={isActive}
                      onCheckedChange={(v) => handleToggleActive(c, v)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)} title="Edit">
                    <Pencil className="h-4 w-4 text-gray-700" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="!max-w-[min(95vw,800px)] w-[min(95vw,800px)] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              {editingId ? "Edit Company" : "Add Company"}
            </DialogTitle>
            <DialogDescription>
              Add the company name, logo, and at least one brand. You can add more brands now or later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Company name + logo */}
            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start">
              <div className="space-y-1">
                <Label className="text-xs">Logo</Label>
                <input
                  ref={companyImgRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCompanyImage}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => companyImgRef.current?.click()}
                  className="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 flex items-center justify-center overflow-hidden text-gray-500 hover:text-blue-600 transition-colors relative group"
                >
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt="Logo" className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-5 w-5 text-white" />
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="h-5 w-5" />
                      <span className="text-[10px]">Upload logo</span>
                    </div>
                  )}
                </button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      revokeImage(imageUrl);
                      setImageUrl(null);
                    }}
                    className="text-[10px] text-red-600 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ITC Limited"
                />
                <p className="text-[11px] text-gray-500">
                  This is the legal entity. Brands sit under it.
                </p>
              </div>
            </div>

            {/* Brands */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-3 py-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-600" />
                  Brands
                  <span className="text-red-500">*</span>
                </p>
                <Button variant="outline" size="sm" onClick={addBrandRow} className="gap-1 h-7 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Add brand
                </Button>
              </div>
              <div className="divide-y divide-gray-100">
                {drafts.map((b, i) => (
                  <BrandRow
                    key={b.id}
                    brand={b}
                    onName={(v) => updateBrandName(i, v)}
                    onImage={(f) => handleBrandImage(i, f)}
                    onRemove={() => removeBrandRow(i)}
                    canRemove={drafts.length > 1}
                  />
                ))}
              </div>
              <div className="px-3 py-2 bg-blue-50 border-t border-blue-100 text-[11px] text-blue-900 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 shrink-0" />
                At least one brand with a name is required to save.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {editingId ? "Save Changes" : "Create Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ---- Brand row used inside the Add/Edit Company dialog ----
function BrandRow({
  brand,
  onName,
  onImage,
  onRemove,
  canRemove,
}: {
  brand: DraftBrand;
  onName: (v: string) => void;
  onImage: (f: File) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <div className="grid grid-cols-[60px_1fr_36px] gap-2 items-center p-3">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImage(f);
          if (ref.current) ref.current.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors"
        title="Upload brand image"
      >
        {brand.imageUrl ? (
          <img src={brand.imageUrl} alt={brand.name || "Brand"} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </button>
      <Input
        value={brand.name}
        onChange={(e) => onName(e.target.value)}
        placeholder="Brand name (e.g. Aashirvaad)"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onRemove}
        disabled={!canRemove}
        title={canRemove ? "Remove brand" : "At least one brand is required"}
      >
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}
