import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  Bell,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Component,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Info,
  Layers,
  LayoutTemplate,
  LogOut,
  Mail,
  Palette,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Type,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Switch } from "../components/ui/switch";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../lib/auth-context";
import logoImage from "../../imports/Qwipo_Secondary_Logo_for_Light_BG@4x-8.png";
import logoImageDark from "../../imports/Qwipo_Secondary_Logo_for_Dark_BG.svg";
import { useTheme } from "next-themes";
import { toast } from "sonner";

// =====================================================================
// Design System — single-page handbook for the Qwipo seller store.
//
// Audience: designers, PMs, and developers who need to align on the
// visual language without paging through Figma + the live app.
//
// Why a single page (not Storybook)? The team is small and a custom
// page can pull each component directly from the production codebase
// so the docs are always in sync. Sections are anchor-linked from a
// sticky sidebar so navigating is fast.
//
// Sections:
//   1. Overview        — purpose, principles, audience
//   2. Foundations     — colors, typography, spacing, radius, shadows,
//                        icons
//   3. Components      — every primitive with all variants + states
//   4. Patterns        — recurring layouts (list page, detail page,
//                        form, action bar, empty + loading)
//   5. Screens         — index of canonical live pages
// =====================================================================

interface SectionDef {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: { group: string; items: SectionDef[] }[] = [
  {
    group: "Getting Started",
    items: [{ id: "overview", title: "Overview", icon: Sparkles }],
  },
  {
    group: "Foundations",
    items: [
      { id: "colors", title: "Colors", icon: Palette },
      { id: "typography", title: "Typography", icon: Type },
      { id: "spacing", title: "Spacing & Radius", icon: LayoutTemplate },
      { id: "shadows", title: "Shadows", icon: Layers },
      { id: "icons", title: "Icons", icon: Component },
    ],
  },
  {
    group: "Components",
    items: [
      { id: "buttons", title: "Buttons", icon: Box },
      { id: "inputs", title: "Inputs", icon: Type },
      { id: "selects", title: "Selects", icon: ChevronDown },
      { id: "toggles", title: "Checkbox & Switch", icon: CheckCircle2 },
      { id: "badges", title: "Badges & Status", icon: ShieldCheck },
      { id: "cards", title: "Cards", icon: Layers },
      { id: "feedback", title: "Toasts & Banners", icon: Bell },
      { id: "loading", title: "Loading & Skeletons", icon: Activity },
    ],
  },
  {
    group: "Patterns",
    items: [
      { id: "list-page", title: "List Page Anatomy", icon: FileText },
      { id: "detail-page", title: "Detail Page Anatomy", icon: FileText },
      { id: "form", title: "Form Anatomy (DMS → ONDC)", icon: FileText },
      { id: "action-bar", title: "Action Bars & CTAs", icon: ArrowRight },
      { id: "empty-states", title: "Empty States", icon: Box },
    ],
  },
  {
    group: "Screens",
    items: [{ id: "screens", title: "Canonical Pages", icon: Eye }],
  },
];

// ---- Token tables ------------------------------------------------

const COLOR_GROUPS: {
  group: string;
  hint: string;
  swatches: { name: string; hex: string; usage: string }[];
}[] = [
  {
    group: "Brand & Primary",
    hint: "Primary CTAs, links, focus rings, brand accents.",
    swatches: [
      { name: "Blue 600", hex: "#2563EB", usage: "Primary CTA · links" },
      { name: "Blue 700", hex: "#1D4ED8", usage: "Primary CTA hover · focus ring" },
      { name: "Indigo 600", hex: "#4F46E5", usage: "Secondary brand · gradients" },
      { name: "Purple 600", hex: "#9333EA", usage: "QPS / promotions / Layers icons" },
      { name: "Fuchsia 600", hex: "#C026D3", usage: "Design system accent (this page)" },
    ],
  },
  {
    group: "Status — Success",
    hint: "Confirmed orders, active items, positive deltas.",
    swatches: [
      { name: "Green 50", hex: "#F0FDF4", usage: "Badge background" },
      { name: "Green 200", hex: "#BBF7D0", usage: "Badge border" },
      { name: "Green 600", hex: "#16A34A", usage: "Primary success text" },
      { name: "Green 700", hex: "#15803D", usage: "Confirm / Save CTA · success badge text" },
      { name: "Emerald 600", hex: "#059669", usage: "Active customer · 'Active' badge" },
    ],
  },
  {
    group: "Status — Warning",
    hint: "Awaiting input, scheduled items, attention without alarm.",
    swatches: [
      { name: "Amber 50", hex: "#FFFBEB", usage: "Notice banner background" },
      { name: "Amber 200", hex: "#FDE68A", usage: "Notice banner border · Modify Items button" },
      { name: "Amber 600", hex: "#D97706", usage: "Pending Approval icon" },
      { name: "Amber 700", hex: "#B45309", usage: "Notice banner text · 'Edited' indicator" },
      { name: "Yellow 700", hex: "#A16207", usage: "Inactive / Scheduled status text" },
    ],
  },
  {
    group: "Status — Danger",
    hint: "Destructive actions, cancellations, errors.",
    swatches: [
      { name: "Red 50", hex: "#FEF2F2", usage: "Cancel button background" },
      { name: "Red 200", hex: "#FECACA", usage: "Cancel button border" },
      { name: "Red 600", hex: "#DC2626", usage: "Required field marker · destructive CTA" },
      { name: "Red 700", hex: "#B91C1C", usage: "Cancel button text · Cancelled badge" },
    ],
  },
  {
    group: "Neutrals",
    hint: "Page chrome, borders, body text, secondary surfaces.",
    swatches: [
      { name: "White", hex: "#FFFFFF", usage: "Card surface · page background (light)" },
      { name: "Gray 50", hex: "#F9FAFB", usage: "Page background · table thead" },
      { name: "Gray 100", hex: "#F3F4F6", usage: "Hover surface · subtle dividers" },
      { name: "Gray 200", hex: "#E5E7EB", usage: "Borders · disabled fills" },
      { name: "Gray 400", hex: "#9CA3AF", usage: "Placeholder text · helper icons" },
      { name: "Gray 600", hex: "#4B5563", usage: "Secondary text · column headers" },
      { name: "Gray 700", hex: "#374151", usage: "Body text" },
      { name: "Gray 900", hex: "#111827", usage: "Headings · primary body" },
    ],
  },
];

const TYPE_SCALE: {
  token: string;
  className: string;
  preview: string;
  usage: string;
}[] = [
  { token: "Display", className: "text-2xl font-semibold", preview: "Page title — 24px / 32px / 600", usage: "Page H1, dialog titles" },
  { token: "H2", className: "text-xl font-semibold", preview: "Section heading — 20px / 28px / 600", usage: "Section headings on long pages" },
  { token: "H3", className: "text-lg font-semibold", preview: "Card title — 18px / 28px / 600", usage: "Card / panel titles" },
  { token: "H4", className: "text-base font-semibold", preview: "Sub-section — 16px / 24px / 600", usage: "List-row primary text, section sub-titles" },
  { token: "Body", className: "text-sm text-gray-700", preview: "Body — 14px / 20px / 400", usage: "Default body, table cells, form labels" },
  { token: "Body Small", className: "text-xs text-gray-600", preview: "Body small — 12px / 16px / 400", usage: "Helper text, captions, footer rows" },
  { token: "Caption", className: "text-[11px] text-gray-500 uppercase tracking-wider font-semibold", preview: "OVERLINE / CAPTION — 11px / 16px / 600", usage: "Column headers, KPI sub-labels" },
  { token: "Mono", className: "font-mono text-sm text-gray-700", preview: "QWI-ONDC-260330-8F3K92", usage: "IDs, codes, monospaced values" },
];

const SPACING_TOKENS: { token: string; px: string; usage: string }[] = [
  { token: "0.5", px: "2 px", usage: "Hairline gaps inside chips" },
  { token: "1", px: "4 px", usage: "Icon ↔ label gap on chips" },
  { token: "1.5", px: "6 px", usage: "Inline tag clusters" },
  { token: "2", px: "8 px", usage: "Compact row spacing · CTA gap" },
  { token: "3", px: "12 px", usage: "Card padding · table cell padding" },
  { token: "4", px: "16 px", usage: "Section padding · form spacing" },
  { token: "6", px: "24 px", usage: "Page padding · grid gutter" },
  { token: "8", px: "32 px", usage: "Block separation" },
];

const RADIUS_TOKENS: { token: string; px: string; usage: string }[] = [
  { token: "rounded-sm", px: "2 px", usage: "Tag chips, inline pills" },
  { token: "rounded-md", px: "6 px", usage: "Inputs, default buttons, popover items" },
  { token: "rounded-lg", px: "8 px", usage: "Cards, dialogs, drawers" },
  { token: "rounded-xl", px: "12 px", usage: "Hero cards, KPI tiles" },
  { token: "rounded-full", px: "9999 px", usage: "Avatars, status dots, pill badges" },
];

const SHADOW_TOKENS: { token: string; className: string; usage: string }[] = [
  { token: "shadow-sm", className: "shadow-sm", usage: "Default cards, KPI tiles" },
  { token: "shadow", className: "shadow", usage: "Sticky action bars, raised CTAs" },
  { token: "shadow-md", className: "shadow-md", usage: "Hover state on clickable cards" },
  { token: "shadow-lg", className: "shadow-lg", usage: "Dialogs, drawers, toasts" },
  { token: "shadow-2xl", className: "shadow-2xl", usage: "Mobile menu, full-height drawers" },
];

const CANONICAL_SCREENS: {
  name: string;
  path: string;
  notes: string;
}[] = [
  { name: "Login", path: "/login", notes: "Two-pane layout, demo persona picker." },
  { name: "Dashboard", path: "/", notes: "'Coming Soon' state with Phase 1 quick links." },
  { name: "My SKU", path: "/products/my-sku", notes: "List page anatomy — search, filters, table, pagination, bulk import." },
  { name: "SKU Details", path: "/products/sku-detail/180000008", notes: "Detail page with DMS / ONDC dual-column form." },
  { name: "Customers", path: "/customers", notes: "Auto-register flow — one row per customer, company count badge, status." },
  { name: "Orders", path: "/orders", notes: "Status-tab list with bulk Cancel + Mark Delivered." },
  { name: "Order Detail", path: "/orders/QWI-ONDC-260330-8F3K92", notes: "Status-aware CTAs, QPS impact rows, action bar." },
  { name: "Offers & Schemes", path: "/offers", notes: "Offer Code · SKU · Valid From / Till · Status." },
];

// ---- Helpers -----------------------------------------------------

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="text-[11px] leading-relaxed bg-gray-900 text-gray-100 rounded-md p-3 overflow-x-auto font-mono">
      <code>{children}</code>
    </pre>
  );
}

function SwatchTile({
  name,
  hex,
  usage,
}: {
  name: string;
  hex: string;
  usage: string;
}) {
  const isLight = (() => {
    // Quick luma check so we flip the swatch label text to dark on
    // light fills.
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 186;
  })();
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div
        className="h-16 flex items-end justify-between p-2"
        style={{ background: hex }}
      >
        <span
          className={`text-[11px] font-mono ${isLight ? "text-gray-700" : "text-white/90"}`}
        >
          {hex}
        </span>
      </div>
      <div className="p-2 bg-white">
        <p className="text-xs font-semibold text-gray-900">{name}</p>
        <p className="text-[11px] text-gray-500 leading-snug">{usage}</p>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-5">
      <header className="space-y-1.5">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mt-6 mb-2">
      {children}
    </h3>
  );
}

function StateRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3 items-center py-2 border-t border-gray-100 first:border-t-0">
      <p className="text-xs font-medium text-gray-700">{label}</p>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}

// ---- Main page ---------------------------------------------------

export function DesignSystem() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const { resolvedTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => setThemeReady(true), []);
  const logoSrc = themeReady && resolvedTheme === "dark" ? logoImageDark : logoImage;

  // IntersectionObserver-based scroll spy. Highlights the side-nav
  // entry of whichever section is currently in view so the seller
  // always knows where they are in the handbook.
  useEffect(() => {
    const ids = SECTIONS.flatMap((g) => g.items.map((i) => i.id));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top,
          )[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-80px 0px -50% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — sections grouped, sticky on desktop. self-start
          keeps it from stretching to the full document height;
          combined with `sticky top-0 h-screen` it pins to the
          viewport as the main content scrolls. */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-gray-200 bg-white sticky top-0 h-screen self-start">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-gray-200">
          <img src={logoSrc} alt="Qwipo" className="h-5 object-contain" />
          <span className="text-xs uppercase tracking-wider font-semibold text-fuchsia-600">
            Design
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {SECTIONS.map((g) => (
            <div key={g.group}>
              <p className="px-2 text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                {g.group}
              </p>
              <div className="space-y-0.5">
                {g.items.map(({ id, title, icon: Icon }) => {
                  const active = activeSection === id;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={
                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors " +
                        (active
                          ? "bg-fuchsia-50 text-fuchsia-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-100")
                      }
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {title}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user?.name ?? "Designer"}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {user?.email ?? "design@qwipo.com"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-12">
          {/* ===== 1. Overview ===== */}
          <Section
            id="overview"
            title="Qwipo Design System"
            description="A living handbook for everyone shipping Qwipo Seller Store. Every token, component, and pattern is pulled directly from the production codebase — so what you see here is exactly what users see."
          >
            <Card className="border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-fuchsia-700">
                  <Palette className="h-5 w-5" />
                  <p className="text-sm font-semibold">For designers, PMs, and developers</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Use the sidebar to jump to any section. Foundations cover
                  tokens (colors / type / spacing). Components show every
                  variant ×️ state with copy-paste-ready code. Patterns
                  document the recurring page layouts so new screens stay
                  consistent. Screens link out to the live pages those
                  patterns power.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Tailwind v4", "shadcn / Radix", "Lucide icons", "Sonner toasts", "Motion (Framer)"].map((tech) => (
                    <Badge key={tech} variant="outline" className="bg-white text-fuchsia-700 border-fuchsia-200">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: Palette, title: "Tokens", body: "Colors, type scale, spacing, radii, shadows." },
                { icon: Component, title: "Components", body: "Buttons, inputs, badges, cards, dialogs — every state." },
                { icon: LayoutTemplate, title: "Patterns", body: "List, detail, form, action bars, empty states." },
              ].map(({ icon: Icon, title, body }) => (
                <Card key={title} className="shadow-sm">
                  <CardContent className="p-4 space-y-1.5">
                    <Icon className="h-5 w-5 text-fuchsia-600" />
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <SubHeader>Design Principles</SubHeader>
              <div className="space-y-2">
                {[
                  { title: "Clarity over cleverness", body: "Sellers manage real money. Use plain language, predictable layouts, and remove visual noise that doesn't pay rent." },
                  { title: "Status-aware UI", body: "What the user can do should follow from the state of the data. Order is New? Show Confirm + Cancel. Delivered? Show nothing destructive." },
                  { title: "DMS is reference, ONDC is truth", body: "Every form that touches the catalog shows DMS values read-only on the left, editable ONDC inputs on the right. Forks are visible." },
                  { title: "Empty states do work", body: "An empty list isn't a blank page — it's an opportunity to explain what'll appear there and how." },
                  { title: "Tokens, not hex codes", body: "Use Tailwind utility classes from the approved scale. If a value isn't in the scale, propose adding it before reaching for arbitrary classes." },
                ].map(({ title, body }) => (
                  <div key={title} className="flex gap-3 p-3 rounded-md border border-gray-200 bg-white">
                    <CheckCircle2 className="h-4 w-4 text-fuchsia-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ===== 2. Foundations — Colors ===== */}
          <Section
            id="colors"
            title="Colors"
            description="The palette is a curated subset of Tailwind's named scales. Every status uses a 50 / 200 / 600 / 700 quartet so badges, banners, and CTAs read consistently across the app."
          >
            {COLOR_GROUPS.map((g) => (
              <div key={g.group}>
                <SubHeader>
                  {g.group}
                  <span className="ml-2 text-[11px] font-normal normal-case tracking-normal text-gray-500">
                    {g.hint}
                  </span>
                </SubHeader>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {g.swatches.map((s) => (
                    <SwatchTile key={s.name} {...s} />
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {/* ===== 2. Foundations — Typography ===== */}
          <Section
            id="typography"
            title="Typography"
            description="Inter for everything UI; system mono for IDs and codes. The scale is intentionally tight — eight steps cover the entire app."
          >
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-3 py-2 font-semibold w-28">Token</th>
                    <th className="px-3 py-2 font-semibold">Preview</th>
                    <th className="px-3 py-2 font-semibold w-64">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TYPE_SCALE.map((t) => (
                    <tr key={t.token}>
                      <td className="px-3 py-3 align-top">
                        <code className="text-[11px] font-mono text-fuchsia-700">
                          {t.token}
                        </code>
                      </td>
                      <td className="px-3 py-3">
                        <p className={t.className}>{t.preview}</p>
                      </td>
                      <td className="px-3 py-3 align-top text-xs text-gray-600 leading-relaxed">
                        {t.usage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ===== 2. Foundations — Spacing & Radius ===== */}
          <Section
            id="spacing"
            title="Spacing & Radius"
            description="Tailwind's 4px-based scale. Tokens 0.5 → 8 cover every layout in the app. Larger gaps are rare and should be questioned."
          >
            <SubHeader>Spacing</SubHeader>
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-3 py-2 font-semibold w-24">Token</th>
                    <th className="px-3 py-2 font-semibold w-24">Pixels</th>
                    <th className="px-3 py-2 font-semibold w-56">Preview</th>
                    <th className="px-3 py-2 font-semibold">Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {SPACING_TOKENS.map((s) => (
                    <tr key={s.token}>
                      <td className="px-3 py-2 align-middle">
                        <code className="text-[11px] font-mono text-fuchsia-700">
                          {s.token}
                        </code>
                      </td>
                      <td className="px-3 py-2 align-middle text-xs text-gray-700 font-mono">
                        {s.px}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <div
                          className="bg-fuchsia-500 rounded-sm h-3"
                          style={{ width: `${parseFloat(s.px) * 4}px` }}
                        />
                      </td>
                      <td className="px-3 py-2 align-middle text-xs text-gray-600">
                        {s.usage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubHeader>Border Radius</SubHeader>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {RADIUS_TOKENS.map((r) => (
                <div
                  key={r.token}
                  className="border border-gray-200 bg-white p-3 space-y-2"
                >
                  <div
                    className={
                      "h-12 bg-gradient-to-br from-fuchsia-100 to-purple-100 border border-fuchsia-200 " +
                      r.token
                    }
                  />
                  <p className="text-xs font-mono text-fuchsia-700">{r.token}</p>
                  <p className="text-[11px] text-gray-500">{r.px} · {r.usage}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ===== 2. Foundations — Shadows ===== */}
          <Section
            id="shadows"
            title="Shadows"
            description="Depth lifts important surfaces above the page. Stick to four tiers: base, sm, md/lg, 2xl. Avoid inventing new shadows."
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {SHADOW_TOKENS.map((s) => (
                <div
                  key={s.token}
                  className={`p-4 bg-white rounded-lg ${s.className}`}
                >
                  <p className="text-xs font-mono text-fuchsia-700">{s.token}</p>
                  <p className="text-[11px] text-gray-600 mt-1">{s.usage}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ===== 2. Foundations — Icons ===== */}
          <Section
            id="icons"
            title="Icons"
            description="Lucide React. Default size 16 × 16 (h-4 w-4). 14 × 14 inside chips, 20 × 20 in card headers, 24 × 24+ for hero illustrations only. Stroke width is the lucide default."
          >
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                Search, Filter, Users, Layers, Bell, Mail,
                Phone, Eye, EyeOff, Copy, Trash2, ShieldCheck,
                CheckCircle2, XCircle, AlertCircle, AlertTriangle,
                Info, Ban,
              ].map((Icon, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg border border-gray-200 bg-white flex items-center justify-center"
                >
                  <Icon className="h-5 w-5 text-gray-700" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Browse the full set at{" "}
              <a
                href="https://lucide.dev/icons"
                target="_blank"
                rel="noreferrer"
                className="text-fuchsia-700 underline hover:no-underline"
              >
                lucide.dev/icons
              </a>
              . Avoid using two different icons for the same concept.
            </p>
          </Section>

          {/* ===== 3. Components — Buttons ===== */}
          <Section
            id="buttons"
            title="Buttons"
            description="Six variants. Primary by default, destructive only for irreversible actions, ghost for low-emphasis affordances. Sizes: sm (h-8), default (h-9), lg (h-10), icon (square)."
          >
            <SubHeader>Variants</SubHeader>
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
              <StateRow label="Default (primary)">
                <Button>Confirm Order</Button>
                <Button>
                  <CheckCircle2 className="h-4 w-4" />
                  With Icon
                </Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
              </StateRow>
              <StateRow label="Outline (secondary)">
                <Button variant="outline">Modify Items</Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </StateRow>
              <StateRow label="Ghost">
                <Button variant="ghost">View Details</Button>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </StateRow>
              <StateRow label="Destructive">
                <Button variant="destructive">Cancel Order</Button>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </StateRow>
              <StateRow label="Link">
                <Button variant="link">Forgot Password?</Button>
              </StateRow>
            </div>

            <SubHeader>States</SubHeader>
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
              <StateRow label="Normal">
                <Button>Primary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </StateRow>
              <StateRow label="Hover (illustrated)">
                <Button className="bg-blue-700 hover:bg-blue-700">
                  Primary
                </Button>
                <Button variant="outline" className="bg-gray-50">
                  Outline
                </Button>
                <Button variant="ghost" className="bg-gray-100">
                  Ghost
                </Button>
              </StateRow>
              <StateRow label="Disabled">
                <Button disabled>Primary</Button>
                <Button variant="outline" disabled>
                  Outline
                </Button>
                <Button variant="destructive" disabled>
                  Destructive
                </Button>
              </StateRow>
              <StateRow label="Focus (illustrated)">
                <Button className="ring-2 ring-blue-300 ring-offset-2">
                  Primary
                </Button>
                <Button
                  variant="outline"
                  className="ring-2 ring-blue-300 ring-offset-2"
                >
                  Outline
                </Button>
              </StateRow>
              <StateRow label="Loading">
                <Button disabled>
                  <Activity className="h-4 w-4 animate-spin" />
                  Saving…
                </Button>
              </StateRow>
            </div>

            <SubHeader>Usage</SubHeader>
            <CodeBlock>{`<Button>Confirm Order</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon"><Eye /></Button>`}</CodeBlock>
          </Section>

          {/* ===== 3. Components — Inputs ===== */}
          <Section
            id="inputs"
            title="Inputs"
            description="One Input primitive covers text, number, password, search, email, date. Always pair with a Label and the optional helper / error caption below."
          >
            <div className="rounded-lg border border-gray-200 bg-white p-4 grid sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-1.5">
                <Label className="text-xs">Default</Label>
                <Input placeholder="Type something…" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  With value
                </Label>
                <Input defaultValue="Freedom Refined Sunflower Oil" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Required<span className="text-red-600 ml-0.5">*</span>
                </Label>
                <Input required placeholder="Required field" />
                <p className="text-[11px] text-gray-600">Helper text appears below.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Error</Label>
                <Input
                  defaultValue="invalid@"
                  className="border-red-400 focus-visible:ring-red-300"
                  aria-invalid
                />
                <p className="text-[11px] text-red-700 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Enter a valid email address.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Disabled</Label>
                <Input disabled defaultValue="Read-only value" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">With leading icon</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input className="pl-9" placeholder="Search by name…" />
                </div>
              </div>
            </div>
          </Section>

          {/* ===== 3. Components — Selects ===== */}
          <Section
            id="selects"
            title="Selects"
            description="Use Select for short, known-set options (≤ 8 items). For larger sets prefer a Combobox (see SkuComboBox)."
          >
            <div className="rounded-lg border border-gray-200 bg-white p-4 grid sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-1.5">
                <Label className="text-xs">Default</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a status…" />
                  </SelectTrigger>
                  <SelectContent>
                    {["New", "Confirmed", "Delivered", "Cancelled"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">With value</Label>
                <Select defaultValue="Confirmed">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["New", "Confirmed", "Delivered", "Cancelled"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Disabled</Label>
                <Select disabled defaultValue="Delivered">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* ===== 3. Components — Checkbox & Switch ===== */}
          <Section
            id="toggles"
            title="Checkbox & Switch"
            description="Checkbox for multi-select lists. Switch for instant-effect binary settings (status, toggles). Avoid using a switch for actions that need a Save button."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <SubHeader>Checkbox</SubHeader>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox />
                    Unchecked
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox defaultChecked />
                    Checked
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked="indeterminate" />
                    Indeterminate
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <Checkbox disabled />
                    Disabled
                  </label>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <SubHeader>Switch</SubHeader>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    Status (off) <Switch />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    Status (on) <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    Disabled <Switch disabled defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ===== 3. Components — Badges & Status ===== */}
          <Section
            id="badges"
            title="Badges & Status"
            description="Status semantics map to colors with a fixed 50 / 200 / 700 recipe. Match this matrix exactly on new status types so badges stay scannable."
          >
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <StateRow label="Active / Confirmed">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </Badge>
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  Confirmed
                </Badge>
              </StateRow>
              <StateRow label="Pending / Awaiting">
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Unassigned
                </Badge>
                <Badge className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  Scheduled
                </Badge>
              </StateRow>
              <StateRow label="Inactive / Soft-stop">
                <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                  Inactive
                </Badge>
                <Badge className="bg-gray-200 text-gray-700 border-gray-300">
                  Expired
                </Badge>
              </StateRow>
              <StateRow label="Cancelled / Error">
                <Badge className="bg-red-50 text-red-700 border-red-200 gap-1">
                  <Ban className="h-3 w-3" />
                  Cancelled
                </Badge>
                <Badge variant="destructive">Error</Badge>
              </StateRow>
              <StateRow label="Informational / Highlight">
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                  New
                </Badge>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
                  <Layers className="h-3 w-3" />
                  QPS
                </Badge>
                <Badge variant="outline">Outline</Badge>
              </StateRow>
            </div>
          </Section>

          {/* ===== 3. Components — Cards ===== */}
          <Section
            id="cards"
            title="Cards"
            description="The base surface for grouped content. White fill, gray-200 border, rounded-lg. Use shadow-sm for KPI tiles and headed cards; raise to shadow-lg only for transient surfaces."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <p className="text-[11px] uppercase font-semibold text-gray-500 tracking-wider">
                    KPI Tile
                  </p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-xs text-gray-600">Total Customers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Headed Card</p>
                  <Separator />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Use for grouped form fields, section summaries, or any
                    content that needs a visual container on the page.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
                <CardContent className="p-4 space-y-2">
                  <Sparkles className="h-5 w-5 text-fuchsia-600" />
                  <p className="text-sm font-semibold text-gray-900">Accent Card</p>
                  <p className="text-xs text-gray-600">For callouts and intros.</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Clickable Card</p>
                    <p className="text-xs text-gray-600">Deep-link to a sub-page.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ===== 3. Components — Toasts & Banners ===== */}
          <Section
            id="feedback"
            title="Toasts & Banners"
            description="Toasts via Sonner for transient feedback (saves, errors). Inline banners for context that's part of the current task."
          >
            <SubHeader>Sonner toasts (transient)</SubHeader>
            <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-wrap gap-2">
              <Button onClick={() => toast.success("Saved successfully")}>
                Success
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.error("Something went wrong")}
              >
                Error
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.warning("Heads up — check this field")}
              >
                Warning
              </Button>
              <Button variant="outline" onClick={() => toast.info("FYI")}>
                Info
              </Button>
            </div>

            <SubHeader>Inline banners (persistent)</SubHeader>
            <div className="space-y-3">
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 flex gap-2 text-blue-900 text-xs">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Informational banner — explains state without demanding action.</span>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 flex gap-2 text-amber-900 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Warning banner — action is recommended before continuing.</span>
              </div>
              <div className="rounded-md border border-red-200 bg-red-50 p-3 flex gap-2 text-red-900 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Error banner — something failed, here's what to fix.</span>
              </div>
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 flex gap-2 text-emerald-900 text-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Success banner — confirm a completed operation.</span>
              </div>
            </div>
          </Section>

          {/* ===== 3. Components — Loading ===== */}
          <Section
            id="loading"
            title="Loading & Skeletons"
            description="Skeleton placeholders for predictable layouts (lists, cards). Centered spinner only when content has no skeletable shape (network ops, downloads)."
          >
            <SubHeader>Skeleton (preferred)</SubHeader>
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </div>

            <SubHeader>Spinner (fallback)</SubHeader>
            <div className="rounded-lg border border-gray-200 bg-white p-8 flex items-center justify-center gap-2">
              <Circle className="h-4 w-4 animate-pulse text-fuchsia-600 fill-fuchsia-600" />
              <Circle className="h-4 w-4 animate-pulse text-fuchsia-600 fill-fuchsia-600 [animation-delay:120ms]" />
              <Circle className="h-4 w-4 animate-pulse text-fuchsia-600 fill-fuchsia-600 [animation-delay:240ms]" />
              <span className="text-sm text-gray-600 ml-2">Loading…</span>
            </div>
          </Section>

          {/* ===== 4. Patterns — List page ===== */}
          <Section
            id="list-page"
            title="List Page Anatomy"
            description="Every list-style page (My SKU, Customers, Orders, Offers) follows the same template. Reach for these slots in this order — adding new chrome erodes scannability."
          >
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-5 space-y-3">
              <div className="rounded-md bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 flex items-center justify-between">
                <span>Page Title</span>
                <span className="text-gray-500 font-normal">(top nav)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] text-gray-600">
                {["Total · 12", "Active · 8", "Pending · 3", "Blocked · 1"].map((k) => (
                  <div
                    key={k}
                    className="rounded-md border border-gray-200 px-3 py-2 bg-gray-50"
                  >
                    <p className="font-semibold text-gray-800">{k.split(" · ")[1]}</p>
                    <p>{k.split(" · ")[0]}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between text-xs">
                <span className="text-gray-500">Search by …</span>
                <span className="flex gap-1">
                  <Badge variant="outline">Filters</Badge>
                  <Badge variant="outline">Export</Badge>
                </span>
              </div>
              <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
                <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50 border-b border-gray-200">
                  Column · Column · Column · Status · Actions
                </div>
                <div className="px-3 py-3 text-xs text-gray-600">— rows —</div>
                <div className="px-3 py-3 text-xs text-gray-600 border-t border-gray-200">— rows —</div>
              </div>
              <div className="rounded-md bg-gray-50 px-3 py-2 text-[11px] text-gray-600 flex items-center justify-between">
                <span>Showing 1–10 of 47</span>
                <span>‹ Previous · 1 2 3 · Next ›</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold">Slots in order:</span> page title → optional KPI tiles → toolbar (search left, filters + export right) → table → pagination footer. The Card wrapping the toolbar and table uses <code className="text-fuchsia-700 font-mono">gap-0</code> so there's no whitespace between header bar and the table thead.
            </p>
          </Section>

          {/* ===== 4. Patterns — Detail page ===== */}
          <Section
            id="detail-page"
            title="Detail Page Anatomy"
            description="A sticky header carries identity + status + status-aware CTAs. Buyer / Seller / Meta sit in a 3-up grid. Item lists live in a tight-gap Card below."
          >
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-5 space-y-3">
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order #QWI-ONDC-260330-8F3K92</p>
                  <p className="text-[11px] text-gray-500">2026-03-30 · ONDC</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button size="sm">Confirm Order</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                {["Buyer", "Seller", "Order Meta"].map((h) => (
                  <div key={h} className="rounded-md border border-gray-200 p-2">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                      {h}
                    </p>
                    <p className="mt-1">…</p>
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-gray-200 overflow-hidden">
                <div className="px-3 py-2 text-xs font-semibold text-gray-900 border-b border-gray-100">
                  Order Items (6)
                </div>
                <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50 border-b border-gray-200">
                  Product · SKU · Qty · Price/Unit · Total
                </div>
                <div className="px-3 py-3 text-xs text-gray-600">— rows —</div>
              </div>
            </div>
          </Section>

          {/* ===== 4. Patterns — Form ===== */}
          <Section
            id="form"
            title="Form Anatomy (DMS → ONDC)"
            description="Catalog forms split each field into two columns: DMS value on the left (read-only reference), ONDC value on the right (editable, becomes the source of truth). Edited cells get an amber 'Edited' indicator."
          >
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_1fr] bg-gray-50 px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                <span>Field</span>
                <span>DMS (Read-only)</span>
                <span>ONDC (Editable)</span>
              </div>
              {[
                { label: "SKU Name *", dms: "FREEDOM REF. SUNFLOWER OIL 1 LTR…", ondc: "FREEDOM REF. SUNFLOWER OIL 1 LTR.X16NOS." },
                { label: "Measure Unit *", dms: "litre", ondc: "Liter" },
                { label: "SKU Weight *", dms: "1.05", ondc: "1" },
                { label: "Weight in KG", dms: "1 kg", ondc: "1 kg · Auto", auto: true },
              ].map(({ label, dms, ondc, auto }) => (
                <div
                  key={label}
                  className="grid grid-cols-1 sm:grid-cols-[200px_1fr_1fr] border-t border-gray-100 px-3 py-2 text-xs"
                >
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-500 font-mono">{dms}</span>
                  <span className="text-gray-900 font-mono flex items-center gap-2">
                    {ondc}
                    {auto && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        Auto
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5 leading-relaxed">
              <li>Required fields end with <span className="text-red-600">*</span>.</li>
              <li>Inline helper text (gray-600, 11px) lives directly under the input.</li>
              <li>Errors replace the helper text with red-700 copy + an AlertCircle icon.</li>
              <li>Auto-calculated fields display the system value with an "Auto" pill — never let the user type into them.</li>
            </ul>
          </Section>

          {/* ===== 4. Patterns — Action bars ===== */}
          <Section
            id="action-bar"
            title="Action Bars & CTAs"
            description="Primary action sits on the right of the action bar, secondary / destructive to its left. Status-aware: only show actions that apply to the current state."
          >
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-gray-700">Modify the order before confirming.</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button size="sm">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confirm Order
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              When the order moves to <Badge className="bg-green-50 text-green-700 border-green-200 mx-1">Confirmed</Badge> the same bar swaps Confirm Order out for <span className="font-semibold">Mark as Delivered</span>. Cancelled / Delivered orders show <em>no</em> destructive actions — the order is past the seller's hand.
            </p>
          </Section>

          {/* ===== 4. Patterns — Empty states ===== */}
          <Section
            id="empty-states"
            title="Empty States"
            description="An empty list is an opportunity. Always pair the illustration with a short headline + an explainer that tells the user what'll appear there and how it'll arrive."
          >
            <div className="rounded-lg border border-gray-200 bg-white p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-xl bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center mb-3">
                <Users className="h-7 w-7 text-fuchsia-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">No customers yet</p>
              <p className="text-xs text-gray-600 mt-1 max-w-md leading-relaxed">
                Once retailers register against your brands from the buyer app,
                they'll auto-register as Active here and appear in this list.
              </p>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold">Recipe:</span> rounded icon tile (h-16 w-16, soft brand fill) → 14px semibold headline → 12px gray-600 explainer, max 60 chars per line. Optional CTA below when there's a useful jump-start action.
            </p>
          </Section>

          {/* ===== 5. Screens ===== */}
          <Section
            id="screens"
            title="Canonical Pages"
            description="Live links to the pages these patterns power. Use them as references when shipping a new screen — copy the structure, swap the content."
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {CANONICAL_SCREENS.map((s) => (
                <Link
                  key={s.path}
                  to={s.path}
                  className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-fuchsia-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono mb-1">{s.path}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.notes}</p>
                </Link>
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Some of these need a logged-in seller session. Switch personas
              via the user dropdown if a screen sends you to the login page.
            </p>
          </Section>

          <footer className="pt-8 border-t border-gray-200 text-xs text-gray-500">
            <p>
              Design system handbook — updates ship alongside the codebase.
              File issues or proposals in the project tracker.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
