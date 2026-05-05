import { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  FileQuestion,
  Lock,
  RefreshCcw,
  ServerCrash,
  ShieldAlert,
  Wifi,
  Wrench,
  Home,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ErrorState } from "../components/error-state";

interface ErrorVariant {
  id: string;
  label: string;
  /** Pill shown above the title — typically the HTTP code or short tag. */
  code?: string;
  icon: typeof AlertOctagon;
  title: string;
  description: string;
  tone: "danger" | "warning" | "info" | "neutral";
  /** Optional primary CTA shown inside the demo. */
  cta?: { label: string; icon?: typeof RefreshCcw };
}

/**
 * Catalogue of every error screen the app supports. Each entry is
 * rendered through the shared <ErrorState> primitive so adding a new
 * one is a one-line change. Keep these synchronised with the actual
 * error pages wired into the router (currently: 404 lives at the
 * router fallback; the rest are surfaced via this gallery).
 */
const VARIANTS: ErrorVariant[] = [
  {
    id: "404",
    label: "404 — Page Not Found",
    code: "404",
    icon: FileQuestion,
    title: "Page Not Found",
    description:
      "We couldn't find the page you were looking for. It may have been moved, renamed, or never existed in the first place.",
    tone: "info",
    cta: { label: "Back to Home", icon: Home },
  },
  {
    id: "500",
    label: "500 — Server Error",
    code: "500",
    icon: ServerCrash,
    title: "Something went wrong on our end",
    description:
      "Our servers tripped over themselves. The team has been notified — please try again in a moment.",
    tone: "danger",
    cta: { label: "Try Again", icon: RefreshCcw },
  },
  {
    id: "network",
    label: "Network Error",
    code: "Network",
    icon: Wifi,
    title: "You're offline",
    description:
      "We can't reach Qwipo right now. Check your internet connection and try again.",
    tone: "neutral",
    cta: { label: "Retry", icon: RefreshCcw },
  },
  {
    id: "403",
    label: "403 — Forbidden",
    code: "403",
    icon: Lock,
    title: "You don't have access to this page",
    description:
      "This area is only available to specific roles. Reach out to an administrator if you think this is a mistake.",
    tone: "warning",
    cta: { label: "Back to Home", icon: Home },
  },
  {
    id: "401",
    label: "401 — Session Expired",
    code: "401",
    icon: ShieldAlert,
    title: "Your session has expired",
    description:
      "For security, we've signed you out. Please log in again to pick up where you left off.",
    tone: "warning",
    cta: { label: "Sign in again", icon: RefreshCcw },
  },
  {
    id: "maintenance",
    label: "Maintenance",
    code: "Scheduled",
    icon: Wrench,
    title: "Qwipo is undergoing maintenance",
    description:
      "We're rolling out improvements. We'll be back online shortly — try again in a few minutes.",
    tone: "info",
  },
  {
    id: "rate-limit",
    label: "Rate Limited",
    code: "429",
    icon: AlertTriangle,
    title: "Too many requests",
    description:
      "Slow down for a moment — you've hit our rate limit. Try again in a few seconds.",
    tone: "warning",
    cta: { label: "Retry", icon: RefreshCcw },
  },
  {
    id: "generic",
    label: "Generic Error",
    code: "Error",
    icon: AlertOctagon,
    title: "Something didn't work",
    description:
      "We hit an unexpected error. Try the action again — if it keeps failing, contact Qwipo support.",
    tone: "danger",
    cta: { label: "Try Again", icon: RefreshCcw },
  },
];

/**
 * Demo gallery: one entry per supported error screen, with a toggle row
 * up top to switch between them. Used by the design / product team to
 * audit the app's error states without having to trigger them in the
 * wild.
 *
 * Reachable from the sidebar in empty-mode logins (Super Admin Empty,
 * Seller Empty) — those personas exist precisely for capture-able demos
 * of every state.
 */
export function ErrorScreensDemo() {
  const [activeId, setActiveId] = useState<string>(VARIANTS[0].id);
  const active = VARIANTS.find((v) => v.id === activeId) ?? VARIANTS[0];
  const CtaIcon = active.cta?.icon;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar matches every other admin/seller list page. */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {VARIANTS.length} error screens
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Use the toggle below to preview every error state.
          </p>
        </div>
      </div>

      {/* Toggle bar — chip-style segmented control so all variants are
          visible at a glance. Wraps to multiple rows on narrow widths. */}
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

      {/* Active error preview — Card fills the available width AND
          height of the content area so the screenshot represents what
          the user would actually see in production at this viewport.
          Footer metadata stays at the bottom of the Card so the page
          itself doesn't scroll. */}
      <div className="flex-1 overflow-hidden p-4 md:p-6">
        <Card className="w-full h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center min-h-0">
            <ErrorState
              icon={active.icon}
              code={active.code}
              title={active.title}
              description={active.description}
              tone={active.tone}
              size="lg"
              action={
                active.cta ? (
                  <Button className="gap-2">
                    {CtaIcon && <CtaIcon className="h-4 w-4" />}
                    {active.cta.label}
                  </Button>
                ) : undefined
              }
            />
          </div>
          <div className="border-t border-gray-100 px-5 py-2.5 text-[11px] text-gray-500 font-mono flex items-center gap-3 flex-wrap">
            <span>
              tone=<span className="text-gray-700">{active.tone}</span>
            </span>
            <span>·</span>
            <span>
              id=<span className="text-gray-700">{active.id}</span>
            </span>
            {active.code && (
              <>
                <span>·</span>
                <span>
                  code=<span className="text-gray-700">{active.code}</span>
                </span>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
