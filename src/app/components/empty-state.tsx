import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Lucide icon that becomes the illustration. */
  icon: LucideIcon;
  /** Short, friendly title — e.g. "No SKUs yet". */
  title: string;
  /** One-sentence subtitle that tells the user what they're seeing. */
  description: string;
  /** Optional CTA — usually a <Button> the user can click to start. */
  action?: ReactNode;
  /** Tighter vertical padding for in-card empty states. */
  compact?: boolean;
}

/**
 * Reusable inception-day empty state. Used across every list/table page in
 * both the admin and seller modules so the "no data yet" experience is
 * consistent: a soft gradient illustration, a friendly title, a simple
 * subtitle, and an optional CTA.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-10 px-6" : "py-16 px-6"
      }`}
    >
      {/* Illustration: soft gradient tile with the page's icon */}
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl blur-2xl opacity-60" />
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 ring-1 ring-gray-200 shadow-sm flex items-center justify-center">
          <Icon className="h-10 w-10 text-blue-500" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md leading-relaxed">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
