import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Search,
  LayoutGrid,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminCategory,
  getCategories,
  setCategories,
  subscribeToCategories,
  revokeImage,
} from "../../lib/admin-catalog";

export function AdminCategories() {
  const [cats, setCats] = useState<AdminCategory[]>(getCategories());
  const [search, setSearch] = useState("");

  useEffect(() => {
    return subscribeToCategories(() => setCats([...getCategories()]));
  }, []);

  const handleUpload = (catName: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    const next = cats.map((c) => {
      if (c.name !== catName) return c;
      revokeImage(c.imageUrl);
      return { ...c, imageUrl: URL.createObjectURL(file) };
    });
    setCategories(next);
    toast.success(`Image uploaded for "${catName}"`);
  };

  const handleRemove = (catName: string) => {
    const next = cats.map((c) => {
      if (c.name !== catName) return c;
      revokeImage(c.imageUrl);
      return { ...c, imageUrl: null };
    });
    setCategories(next);
    toast.success(`Image removed from "${catName}"`);
  };

  const filtered = cats.filter(
    (c) => search === "" || c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const withImages = cats.filter((c) => c.imageUrl).length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-pink-600" />
              ONDC Categories
            </h2>
            <p className="text-sm text-gray-500">
              Upload an image for each ONDC eB2B category. Sellers see these on the
              storefront and category browse pages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {withImages} / {cats.length} with images
            </Badge>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category..."
                className="pl-9 w-64 h-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-sm text-gray-500">
              No categories match your search.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((c) => (
              <CategoryTile
                key={c.name}
                category={c}
                onUpload={(f) => handleUpload(c.name, f)}
                onRemove={() => handleRemove(c.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryTile({
  category,
  onUpload,
  onRemove,
}: {
  category: AdminCategory;
  onUpload: (f: File) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <Card className="overflow-hidden hover:border-pink-300 transition-colors">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          if (ref.current) ref.current.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-full aspect-square bg-gray-50 hover:bg-gray-100 flex items-center justify-center overflow-hidden relative group"
      >
        {category.imageUrl ? (
          <>
            <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-5 w-5 text-white" />
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <ImageIcon className="h-7 w-7" />
            <span className="text-[10px] font-medium">Upload</span>
          </div>
        )}
      </button>
      <div className="p-2.5 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
          {category.name}
        </p>
        {category.imageUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-600 hover:bg-red-50 rounded shrink-0"
            title="Remove image"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Card>
  );
}
