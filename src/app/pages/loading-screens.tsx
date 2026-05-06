import { useState } from "react";
import { Loader2, Layers, RotateCw } from "lucide-react";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { PageLoader } from "../components/ui/page-loader";

type Variant = "skeleton" | "center";

interface VariantMeta {
  id: Variant;
  label: string;
  icon: typeof Layers;
  hint: string;
}

const VARIANTS: VariantMeta[] = [
  {
    id: "skeleton",
    label: "Skeleton — network loading",
    icon: Layers,
    hint: "Use while the initial bundle / network is fetching the page shell. Mimics the eventual layout so the user perceives instant progress.",
  },
  {
    id: "center",
    label: "Center loader — data / API loading",
    icon: RotateCw,
    hint: "Use after the shell has rendered and a single async data fetch is outstanding. Centered spinner inside the page region that's about to be filled.",
  },
];

/**
 * Loading screens demo gallery. Mirrors the Error Screens page —
 * surfaced in the empty-mode sidebar so the design / product team can
 * audit every loading state without wiring real latency. Two variants
 * cover the spectrum: Skeleton for the "page shell is still on the
 * wire" case, and Center loader for the "shell rendered, data fetch
 * pending" case.
 */
export function LoadingScreensDemo() {
  const [activeId, setActiveId] = useState<Variant>("skeleton");
  const active = VARIANTS.find((v) => v.id === activeId) ?? VARIANTS[0];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar matches every other admin/seller list page. */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {VARIANTS.length} loading screens
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Use the toggle below to preview each loading state.
          </p>
        </div>
      </div>

      {/* Toggle bar — chip-style segmented control. Wraps on narrow
          viewports so both pills always remain visible. */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2 flex-wrap">
          {VARIANTS.map((v) => {
            const isActive = v.id === active.id;
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveId(v.id)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                  (isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700")
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active loading preview — Card stretches to fill the available
          area so the demo represents what the user would actually see
          in production. Footer metadata stays pinned at the bottom. */}
      <div className="flex-1 overflow-hidden p-4 md:p-6">
        <Card className="w-full h-full flex flex-col p-0 overflow-hidden gap-0">
          <div className="flex-1 min-h-0 overflow-auto">
            {active.id === "skeleton" ? (
              <SkeletonListPreview />
            ) : (
              <PageLoader label="Loading…" className="h-full" />
            )}
          </div>
          <div className="border-t border-gray-100 px-5 py-2.5 text-[11px] text-gray-500 font-mono flex items-center gap-3 flex-wrap">
            <span>
              variant=<span className="text-gray-700">{active.id}</span>
            </span>
            <span>·</span>
            <span className="font-sans normal-case text-gray-500">
              {active.hint}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Mirrors the shape of every list page in the app — toolbar with
 * search + actions, table headers, and a column of rows — but each
 * element is replaced with a pulsing skeleton. Use this while the
 * initial network request that fetches the page shell is still in
 * flight, so the user immediately sees the layout they're about to
 * get rather than a blank screen.
 */
function SkeletonListPreview() {
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar skeleton — search bar on the left, two action chips on the right */}
      <div className="border-b border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
        <Skeleton className="h-9 w-full sm:max-w-md" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Table-header skeleton */}
      <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 flex-shrink-0">
        <Skeleton className="h-3 col-span-2" />
        <Skeleton className="h-3 col-span-3" />
        <Skeleton className="h-3 col-span-2" />
        <Skeleton className="h-3 col-span-2" />
        <Skeleton className="h-3 col-span-2" />
        <Skeleton className="h-3 col-span-1" />
      </div>

      {/* Row skeletons — eight rows so the column rhythm reads as a
          real list. Each row mirrors the column widths above. */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-4 items-center px-4 py-4"
          >
            <Skeleton className="h-4 col-span-2" />
            <div className="col-span-3 space-y-1.5">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-4 col-span-2" />
            <Skeleton className="h-6 col-span-2 rounded-full" />
            <Skeleton className="h-4 col-span-2" />
            <Skeleton className="h-7 col-span-1 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
