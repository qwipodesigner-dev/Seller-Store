import { useEffect, useMemo, useRef, useState } from "react";
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
  Search,
  LayoutGrid,
  Upload,
  Image as ImageIcon,
  Plus,
  CheckCircle2,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  addMasterCategory,
  getMasterCategories,
  revokeImage,
  subscribeToMasterCategories,
  type MasterCategory,
} from "../../lib/admin-catalog";
import { EmptyState } from "../../components/empty-state";

// Two-level taxonomy: root → subcategory. Subcategories never carry images
// and never nest further; the UI enforces both constraints by exposing the
// image upload only on the root-level Add Category dialog and never showing
// an "Add subcategory" affordance under a subcategory.
export function AdminCategories() {
  const [flat, setFlat] = useState<MasterCategory[]>(getMasterCategories());
  useEffect(
    () => subscribeToMasterCategories(() => setFlat([...getMasterCategories()])),
    [],
  );

  const [search, setSearch] = useState("");

  // Add Root Category dialog
  const [isAddRootOpen, setIsAddRootOpen] = useState(false);
  const [newRootName, setNewRootName] = useState("");
  const [newRootImageUrl, setNewRootImageUrl] = useState<string | null>(null);
  const newRootImageRef = useRef<HTMLInputElement | null>(null);

  // Inline draft for the Add-subcategory input on each card. Keyed by root id.
  const [subDrafts, setSubDrafts] = useState<Record<string, string>>({});

  const roots = useMemo(
    () => flat.filter((c) => c.parentId === null).sort((a, b) => a.name.localeCompare(b.name)),
    [flat],
  );
  const subsByParent = useMemo(() => {
    const map: Record<string, MasterCategory[]> = {};
    flat
      .filter((c) => c.parentId !== null)
      .forEach((c) => {
        if (!map[c.parentId!]) map[c.parentId!] = [];
        map[c.parentId!].push(c);
      });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));
    return map;
  }, [flat]);

  // Searched roots: keep a root if its own name matches OR if any of its
  // subcategories match. When a sub matches, only that sub is shown under
  // the root.
  const filteredRoots = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roots.map((r) => ({ root: r, subs: subsByParent[r.id] ?? [] }));
    return roots
      .map((r) => {
        const rootMatch = r.name.toLowerCase().includes(q);
        const allSubs = subsByParent[r.id] ?? [];
        const matchedSubs = allSubs.filter((s) => s.name.toLowerCase().includes(q));
        if (rootMatch) return { root: r, subs: allSubs };
        if (matchedSubs.length > 0) return { root: r, subs: matchedSubs };
        return null;
      })
      .filter(
        (x): x is { root: MasterCategory; subs: MasterCategory[] } => x !== null,
      );
  }, [roots, subsByParent, search]);

  // ---- Header stats ----
  const totalCats = flat.length;
  const rootCount = roots.length;
  const subCount = totalCats - rootCount;
  const withImages = roots.filter((r) => r.imageUrl).length;

  // ---- Root add ----
  const openAddRoot = () => {
    setNewRootName("");
    revokeImage(newRootImageUrl);
    setNewRootImageUrl(null);
    setIsAddRootOpen(true);
  };

  const handleNewRootImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    revokeImage(newRootImageUrl);
    setNewRootImageUrl(URL.createObjectURL(f));
    if (newRootImageRef.current) newRootImageRef.current.value = "";
  };

  const handleAddRoot = () => {
    if (!newRootName.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (
      roots.some((r) => r.name.toLowerCase() === newRootName.trim().toLowerCase())
    ) {
      toast.error("A category with this name already exists");
      return;
    }
    addMasterCategory({
      name: newRootName.trim(),
      imageUrl: newRootImageUrl,
      parentId: null,
    });
    toast.success(`Category "${newRootName.trim()}" added`);
    setIsAddRootOpen(false);
  };

  // ---- Inline subcategory add ----
  const setSubDraft = (rootId: string, value: string) =>
    setSubDrafts((prev) => ({ ...prev, [rootId]: value }));

  const handleAddSub = (rootId: string) => {
    const name = (subDrafts[rootId] ?? "").trim();
    if (!name) {
      toast.error("Subcategory name is required");
      return;
    }
    const siblings = subsByParent[rootId] ?? [];
    if (siblings.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("A subcategory with this name already exists here");
      return;
    }
    addMasterCategory({ name, imageUrl: null, parentId: rootId });
    setSubDraft(rootId, "");
    toast.success(`Subcategory "${name}" added`);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-pink-600" />
              Category Master
            </h2>
            <p className="text-sm text-gray-500">
              Two-level taxonomy: a main category (with an image) and any
              number of subcategories under it. Subcategories don't nest
              further. Categories cannot be edited or deleted once created.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {withImages} / {rootCount} with images
            </Badge>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
              {rootCount} categories · {subCount} subs
            </Badge>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category or subcategory..."
                className="pl-9 w-72 h-9"
              />
            </div>
            <Button
              onClick={openAddRoot}
              className="gap-2 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>
      </div>

      {/* Grid of category cards */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredRoots.length === 0 ? (
          <Card>
            <EmptyState
              icon={LayoutGrid}
              title={
                rootCount === 0
                  ? "No categories yet"
                  : "No categories match your search"
              }
              description={
                rootCount === 0
                  ? "Categories organise every SKU on the platform. Add the top-level categories your distributors will choose from."
                  : "Try a different search term to find what you're looking for."
              }
              action={
                rootCount === 0 ? (
                  <Button
                    onClick={openAddRoot}
                    className="gap-2 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRoots.map(({ root, subs }) => (
              <CategoryCard
                key={root.id}
                root={root}
                subs={subs}
                draft={subDrafts[root.id] ?? ""}
                onDraftChange={(v) => setSubDraft(root.id, v)}
                onAddSub={() => handleAddSub(root.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Root Category Dialog */}
      <Dialog open={isAddRootOpen} onOpenChange={setIsAddRootOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-pink-600" />
              Add Category
            </DialogTitle>
            <DialogDescription>
              Top-level category with an image. You can add subcategories
              under it from the card after it's created.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start py-2">
            <div className="space-y-1">
              <Label className="text-xs">Image</Label>
              <input
                ref={newRootImageRef}
                type="file"
                accept="image/*"
                onChange={handleNewRootImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => newRootImageRef.current?.click()}
                className="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 flex items-center justify-center overflow-hidden text-gray-500 hover:text-blue-600 transition-colors relative group"
                title="Upload category image"
              >
                {newRootImageUrl ? (
                  <>
                    <img
                      src={newRootImageUrl}
                      alt="Category"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="h-5 w-5 text-white" />
                    </span>
                  </>
                ) : (
                  <div className="relative flex flex-col items-center gap-1 text-gray-400">
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                    <span className="text-[10px]">Upload</span>
                    <span className="absolute top-0.5 right-0.5 bg-blue-600 text-white rounded-full p-0.5">
                      <Upload className="h-2.5 w-2.5" />
                    </span>
                  </div>
                )}
              </button>
              {newRootImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    revokeImage(newRootImageUrl);
                    setNewRootImageUrl(null);
                  }}
                  className="text-[10px] text-red-600 hover:text-red-700 underline"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={newRootName}
                onChange={(e) => setNewRootName(e.target.value)}
                placeholder="e.g. Rice and Rice Products"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddRoot();
                }}
              />
              <p className="text-[11px] text-gray-500">
                Categories cannot be renamed or removed once saved.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRootOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRoot}
              className="text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Single category card ----
function CategoryCard({
  root,
  subs,
  draft,
  onDraftChange,
  onAddSub,
}: {
  root: MasterCategory;
  subs: MasterCategory[];
  draft: string;
  onDraftChange: (v: string) => void;
  onAddSub: () => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200 flex flex-col">
      {/* Image / colored header strip */}
      <div className="relative bg-gradient-to-br from-pink-50 to-purple-50 aspect-[16/9] flex items-center justify-center overflow-hidden">
        {root.imageUrl ? (
          <img
            src={root.imageUrl}
            alt={root.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-pink-300">
            <ImageIcon className="h-10 w-10" />
            <span className="text-[10px] font-medium tracking-wider uppercase text-pink-400">
              No image
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge className="bg-white/90 text-gray-700 border-gray-200 backdrop-blur-sm shadow-sm">
            {subs.length} sub{subs.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <h3
          className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2"
          title={root.name}
        >
          {root.name}
        </h3>

        {/* Subcategory chips */}
        {subs.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {subs.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 bg-pink-50 text-pink-800 border border-pink-200 rounded-full px-2 py-0.5 text-[11px]"
              >
                <Tag className="h-2.5 w-2.5 text-pink-500" />
                {s.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 italic">
            No subcategories yet — add one below.
          </p>
        )}

        {/* Spacer pushes the input to the bottom */}
        <div className="flex-1" />

        {/* Inline add-subcategory input */}
        <div className="flex gap-1.5 pt-2 border-t border-gray-100">
          <div className="relative flex-1">
            {draft && (
              <button
                type="button"
                onClick={() => onDraftChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                title="Clear"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <Input
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder="Add subcategory…"
              className="h-8 text-xs pr-7"
              onKeyDown={(e) => {
                if (e.key === "Enter") onAddSub();
              }}
            />
          </div>
          <Button
            size="sm"
            onClick={onAddSub}
            disabled={!draft.trim()}
            className="h-8 gap-1 text-white px-2.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
