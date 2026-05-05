import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./ui/utils";

interface ErrorStateProps {
  /** Lucide icon shown in the gradient tile. */
  icon: LucideIcon;
  /** Loud heading — "404. Page Not Found", "Network Error", etc. */
  title: string;
  /**
   * Short paragraph explaining what happened and what the user can
   * do about it. Keep it under two sentences.
   */
  description: string;
  /**
   * Optional small "code" pill — e.g. "404", "500", "ERR_NETWORK".
   * Shown above the title so the screen reads as an error and not just
   * an empty state.
   */
  code?: string;
  /**
   * Tone — controls the gradient + icon colour. Default `"danger"`.
   *   danger  → red    (4xx, 5xx, generic error)
   *   warning → amber  (rate limit, retry)
   *   info    → blue   (maintenance, redirect, no permission)
   *   neutral → gray   (offline, unknown)
   */
  tone?: "danger" | "warning" | "info" | "neutral";
  /** Optional CTA — usually a Button (Reload / Go home / Contact support). */
  action?: ReactNode;
  /** Tighter padding for use inside a Card. */
  compact?: boolean;
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<ErrorStateProps["tone"]>, {
  blur: string;
  tile: string;
  icon: string;
  code: string;
}> = {
  danger: {
    blur: "from-red-100 via-orange-100 to-pink-100",
    tile: "from-red-50 via-white to-orange-50 ring-red-100",
    icon: "text-red-500",
    code: "bg-red-50 text-red-700 ring-red-200",
  },
  warning: {
    blur: "from-amber-100 via-orange-100 to-yellow-100",
    tile: "from-amber-50 via-white to-yellow-50 ring-amber-100",
    icon: "text-amber-500",
    code: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  info: {
    blur: "from-blue-100 via-indigo-100 to-purple-100",
    tile: "from-blue-50 via-white to-indigo-50 ring-blue-100",
    icon: "text-blue-500",
    code: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  neutral: {
    blur: "from-gray-100 via-slate-100 to-zinc-100",
    tile: "from-gray-50 via-white to-slate-50 ring-gray-200",
    icon: "text-gray-500",
    code: "bg-gray-100 text-gray-700 ring-gray-200",
  },
};

/**
 * Reusable error / 4xx / 5xx state. Pairs with the existing EmptyState
 * primitive (same hierarchy: gradient illustration tile, heading,
 * subtitle, optional CTA) but with tone-specific colours and an
 * optional code pill so an "error" reads visually different from an
 * "empty inbox".
 *
 * The Error Screens demo page uses this to render every supported
 * error variant (404, 500, network, forbidden, maintenance, …).
 */
export function ErrorState({
  icon: Icon,
  title,
  description,
  code,
  tone = "danger",
  action,
  compact = false,
  className,
}: ErrorStateProps) {
  const tones = TONE_CLASSES[tone];
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10 px-6" : "py-16 px-6",
        className,
      )}
    >
      <div className="relative mb-5">
        <div
          className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-br rounded-3xl blur-2xl opacity-60",
            tones.blur,
          )}
        />
        <div
          className={cn(
            "w-20 h-20 rounded-2xl bg-gradient-to-br ring-1 shadow-sm flex items-center justify-center",
            tones.tile,
          )}
        >
          <Icon className={cn("h-10 w-10", tones.icon)} strokeWidth={1.5} />
        </div>
      </div>

      {code && (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset uppercase tracking-wider mb-2",
            tones.code,
          )}
        >
          {code}
        </span>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
