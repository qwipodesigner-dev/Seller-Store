import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
  Tag,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  addMasterCategory,
  getMasterCategories,
  revokeImage,
  setMasterCategoryImage,
  subscribeToMasterCategories,
  type MasterCategory,
} from "../../lib/admin-catalog";
import { EmptyState } from "../../components/empty-state";

// Two-level taxonomy: root → subcategory. Subcategories never carry images
// and never nest further. Roots are the canonical 37 ONDC categories — the
// admin can't add new roots, only customise their cover image and add
// subcategories under them.
export function AdminCategories() {
  const [flat, setFlat] = useState<MasterCategory[]>(getMasterCategories());
  useEffect(
    () => subscribeToMasterCategories(() => setFlat([...getMasterCategories()])),
    [],
  );

  const [search, setSearch] = useState("");

  // Inline draft for the Add-subcategory input on each card. Keyed by root id.
  const [subDrafts, setSubDrafts] = useState<Record<string, string>>({});

  // Image-upload dialog state. When the admin clicks the cover image on a
  // category card we open a small dialog where they can upload / replace /
  // remove the image — no full Edit Category form.
  const [editImageFor, setEditImageFor] = useState<MasterCategory | null>(null);
  // Draft URL while the dialog is open. Committed to the store on Save.
  const [draftImageUrl, setDraftImageUrl] = useState<string | null>(null);
  const draftImageRef = useRef<HTMLInputElement | null>(null);

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

  // ---- Image dialog handlers ----
  const openImageDialog = (cat: MasterCategory) => {
    setEditImageFor(cat);
    // Start the draft from whatever is currently saved so the preview
    // matches what the admin already sees on the card.
    setDraftImageUrl(cat.imageUrl);
  };

  const closeImageDialog = () => {
    // If the user picked a file but didn't save, free that blob URL.
    if (
      draftImageUrl &&
      draftImageUrl !== editImageFor?.imageUrl &&
      draftImageUrl.startsWith("blob:")
    ) {
      revokeImage(draftImageUrl);
    }
    setEditImageFor(null);
    setDraftImageUrl(null);
    if (draftImageRef.current) draftImageRef.current.value = "";
  };

  const handleDraftImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    // Free the previous draft (if it was a fresh blob — not the
    // already-saved one) before swapping in the new one.
    if (
      draftImageUrl &&
      draftImageUrl !== editImageFor?.imageUrl &&
      draftImageUrl.startsWith("blob:")
    ) {
      revokeImage(draftImageUrl);
    }
    setDraftImageUrl(URL.createObjectURL(f));
    if (draftImageRef.current) draftImageRef.current.value = "";
  };

  const handleSaveImage = () => {
    if (!editImageFor) return;
    setMasterCategoryImage(editImageFor.id, draftImageUrl);
    toast.success(
      draftImageUrl
        ? `Updated image for "${editImageFor.name}"`
        : `Removed image from "${editImageFor.name}"`,
    );
    setEditImageFor(null);
    setDraftImageUrl(null);
    if (draftImageRef.current) draftImageRef.current.value = "";
  };

  const handleRemoveDraftImage = () => {
    // Just clear the draft — the user has to hit Save to actually persist
    // a removal, matching the upload flow.
    if (
      draftImageUrl &&
      draftImageUrl !== editImageFor?.imageUrl &&
      draftImageUrl.startsWith("blob:")
    ) {
      revokeImage(draftImageUrl);
    }
    setDraftImageUrl(null);
    if (draftImageRef.current) draftImageRef.current.value = "";
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
      {/* Toolbar — count on the left, search on the right. There is no
          "Add Category" button: the 37 ONDC roots are fixed; the admin
          customises them via the per-card image upload and the inline
          subcategory input. */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {rootCount} categor{rootCount === 1 ? "y" : "ies"} · {subCount} sub{subCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category or subcategory..."
                className="pl-10"
              />
            </div>
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
                  ? "The 37 ONDC categories will appear here on the next data refresh."
                  : "Try a different search term to find what you're looking for."
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
                onEditImage={() => openImageDialog(root)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit category cover image dialog */}
      <Dialog
        open={editImageFor !== null}
        onOpenChange={(open) => (open ? null : closeImageDialog())}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              {editImageFor?.imageUrl ? "Update Cover Image" : "Upload Cover Image"}
            </DialogTitle>
            <DialogDescription>
              Cover image for <span className="font-medium text-gray-700">{editImageFor?.name}</span>.
              Recommended size: 16:9 ratio, at least 800×450 px.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <input
              ref={draftImageRef}
              type="file"
              accept="image/*"
              onChange={handleDraftImagePick}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => draftImageRef.current?.click()}
              className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 flex items-center justify-center overflow-hidden text-gray-500 hover:text-blue-600 transition-colors relative group"
              title="Click to choose an image"
            >
              {draftImageUrl ? (
                <>
                  <img
                    src={draftImageUrl}
                    alt={editImageFor?.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                    <Upload className="h-5 w-5" />
                    <span className="text-xs font-medium">Replace image</span>
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon className="h-10 w-10 text-gray-300" />
                  <span className="text-xs font-medium">Click to upload</span>
                  <span className="text-[11px] text-gray-400">PNG / JPG up to a few MB</span>
                </div>
              )}
            </button>
            {draftImageUrl && (
              <button
                type="button"
                onClick={handleRemoveDraftImage}
                className="mt-3 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove image
              </button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeImageDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveImage}>Save</Button>
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
  onEditImage,
}: {
  root: MasterCategory;
  subs: MasterCategory[];
  draft: string;
  onDraftChange: (v: string) => void;
  onAddSub: () => void;
  onEditImage: () => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200 flex flex-col">
      {/* Image header — clicking anywhere on it opens the upload dialog. */}
      <button
        type="button"
        onClick={onEditImage}
        className="relative bg-gradient-to-br from-pink-50 to-purple-50 aspect-[16/9] flex items-center justify-center overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        title={
          root.imageUrl ? "Click to change image" : "Click to upload image"
        }
      >
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

        {/* Hover overlay tells the admin the image is editable. */}
        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
          <Upload className="h-5 w-5" />
          <span className="text-xs font-medium">
            {root.imageUrl ? "Change image" : "Upload image"}
          </span>
        </span>

        <div className="absolute top-2 left-2">
          <Badge className="bg-white/90 text-gray-700 border-gray-200 backdrop-blur-sm shadow-sm">
            {subs.length} sub{subs.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </button>

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
