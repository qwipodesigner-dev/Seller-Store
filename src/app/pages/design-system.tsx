import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  Bell,
  Bold,
  Box,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Circle,
  Clock,
  Component,
  Copy,
  CreditCard,
  Download,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Flag,
  Folder,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Info,
  Italic,
  Keyboard,
  Layers,
  LayoutTemplate,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Mic,
  MoreHorizontal,
  Move,
  Package,
  Palette,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Type,
  Underline,
  Upload,
  User as UserIcon,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Switch } from "../components/ui/switch";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Slider } from "../components/ui/slider";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Toggle } from "../components/ui/toggle";
import { AspectRatio } from "../components/ui/aspect-ratio";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../components/ui/context-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Calendar } from "../components/ui/calendar";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp";
import { MultiSelect } from "../components/ui/multi-select";

import { useAuth } from "../lib/auth-context";
import logoImage from "../../imports/Qwipo_Secondary_Logo_for_Light_BG@4x-8.png";
import logoImageDark from "../../imports/Qwipo_Secondary_Logo_for_Dark_BG.svg";
import { useTheme } from "next-themes";
import { toast } from "sonner";

// =====================================================================
// Design System — single-page handbook for the Qwipo seller store.
//
// Audience: designers, PMs, and developers shipping any product on
// the Qwipo design language. This page documents every token,
// component, and pattern — including pieces the seller app doesn't
// currently use — so the system can be reused across other products.
//
// Why a single page (not Storybook)? The team is small and a custom
// page can pull each component directly from the production codebase,
// so the docs always stay in sync. Sections are anchor-linked from a
// sticky sidebar so navigating is fast.
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
      { id: "motion", title: "Motion", icon: Zap },
      { id: "layout-tokens", title: "Z-index & Breakpoints", icon: Layers },
      { id: "icons", title: "Icons", icon: Component },
    ],
  },
  {
    group: "Forms & Inputs",
    items: [
      { id: "buttons", title: "Buttons", icon: Box },
      { id: "inputs", title: "Inputs", icon: Type },
      { id: "textarea", title: "Textarea", icon: FileText },
      { id: "selects", title: "Selects", icon: ChevronDown },
      { id: "combobox", title: "Combobox", icon: Search },
      { id: "multi-select", title: "Multi-Select", icon: Tag },
      { id: "radio", title: "Radio Group", icon: Circle },
      { id: "toggles", title: "Checkbox & Switch", icon: CheckCircle2 },
      { id: "toggle-group", title: "Toggle Group", icon: Bold },
      { id: "slider", title: "Slider", icon: Activity },
      { id: "date-picker", title: "Date Picker", icon: CalendarIcon },
      { id: "otp", title: "OTP Input", icon: Keyboard },
      { id: "file-upload", title: "File Upload", icon: Upload },
    ],
  },
  {
    group: "Display",
    items: [
      { id: "badges", title: "Badges & Status", icon: ShieldCheck },
      { id: "cards", title: "Cards", icon: Layers },
      { id: "avatars", title: "Avatars", icon: UserIcon },
      { id: "progress", title: "Progress", icon: TrendingUp },
      { id: "separators", title: "Separators & Layout", icon: Move },
      { id: "loading", title: "Loading & Skeletons", icon: Activity },
    ],
  },
  {
    group: "Overlays",
    items: [
      { id: "tooltip", title: "Tooltip", icon: HelpCircle },
      { id: "popover", title: "Popover", icon: Box },
      { id: "hover-card", title: "Hover Card", icon: Eye },
      { id: "dropdown", title: "Dropdown Menu", icon: ChevronDown },
      { id: "context-menu", title: "Context Menu", icon: MoreHorizontal },
      { id: "dialog", title: "Dialog", icon: Layers },
      { id: "alert-dialog", title: "Alert Dialog", icon: AlertTriangle },
      { id: "sheet", title: "Sheet (side panel)", icon: Layers },
      { id: "drawer", title: "Drawer (bottom)", icon: Layers },
      { id: "command", title: "Command Palette", icon: Keyboard },
      { id: "feedback", title: "Toasts & Banners", icon: Bell },
    ],
  },
  {
    group: "Navigation",
    items: [
      { id: "tabs", title: "Tabs", icon: Folder },
      { id: "accordion", title: "Accordion & Collapsible", icon: ChevronDown },
      { id: "breadcrumb", title: "Breadcrumb", icon: ChevronRight },
      { id: "pagination", title: "Pagination", icon: ArrowRight },
    ],
  },
  {
    group: "Data Display",
    items: [
      { id: "tables", title: "Tables", icon: LayoutTemplate },
      { id: "scroll-area", title: "Scroll Area", icon: Move },
    ],
  },
  {
    group: "Patterns",
    items: [
      { id: "list-page", title: "List Page Anatomy", icon: FileText },
      { id: "detail-page", title: "Detail Page Anatomy", icon: FileText },
      { id: "form", title: "Form Anatomy (DMS → ONDC)", icon: FileText },
      { id: "filters", title: "Filters & Search", icon: Filter },
      { id: "bulk-actions", title: "Bulk Actions", icon: CheckCircle2 },
      { id: "action-bar", title: "Action Bars & CTAs", icon: ArrowRight },
      { id: "wizards", title: "Wizards & Steppers", icon: ChevronRight },
      { id: "confirmation", title: "Confirmation Dialogs", icon: AlertTriangle },
      { id: "empty-states", title: "Empty States", icon: Box },
      { id: "notifications", title: "Notifications & Inbox", icon: Bell },
      { id: "kpi-tiles", title: "KPI Tiles", icon: TrendingUp },
      { id: "timeline", title: "Activity Timeline", icon: Clock },
      { id: "upload-pattern", title: "Upload Pattern", icon: Upload },
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

const MOTION_DURATIONS: { token: string; ms: string; usage: string }[] = [
  { token: "duration-75", ms: "75ms", usage: "Hover lift on already-visible affordances" },
  { token: "duration-150", ms: "150ms", usage: "Default — buttons, toggles, link colour shifts" },
  { token: "duration-200", ms: "200ms", usage: "Popover / tooltip fade-in" },
  { token: "duration-300", ms: "300ms", usage: "Dialog / sheet enter, accordion expand" },
  { token: "duration-500", ms: "500ms", usage: "Hero entrance, splash transitions (rare)" },
];

const MOTION_EASINGS: { token: string; curve: string; usage: string }[] = [
  { token: "ease-linear", curve: "linear", usage: "Loading bars, ticking progress" },
  { token: "ease-in", curve: "cubic-bezier(.4, 0, 1, 1)", usage: "Exit animations only" },
  { token: "ease-out", curve: "cubic-bezier(0, 0, .2, 1)", usage: "Default for entering UI (default for transitions)" },
  { token: "ease-in-out", curve: "cubic-bezier(.4, 0, .2, 1)", usage: "Smooth two-way interactions (drawers, toggles)" },
];

const Z_INDEX_TOKENS: { token: string; usage: string }[] = [
  { token: "z-0", usage: "Default — most elements" },
  { token: "z-10", usage: "Sticky toolbars inside cards" },
  { token: "z-20", usage: "Sticky page header / top nav" },
  { token: "z-30", usage: "Sticky action bar (detail page footer)" },
  { token: "z-40", usage: "Dropdowns, tooltips, popovers" },
  { token: "z-50", usage: "Dialogs, sheets, drawers, command palette, toasts" },
];

const BREAKPOINTS: { token: string; px: string; usage: string }[] = [
  { token: "sm", px: "≥ 640 px", usage: "Two-column forms, side-by-side cards" },
  { token: "md", px: "≥ 768 px", usage: "Tablet — sidebar appears, KPI grids" },
  { token: "lg", px: "≥ 1024 px", usage: "Desktop — full-width tables, 3-up grids" },
  { token: "xl", px: "≥ 1280 px", usage: "Wide desktop — content max-width caps" },
  { token: "2xl", px: "≥ 1536 px", usage: "Ultrawide — avoid bespoke layouts here" },
];

const BORDER_WIDTHS: { token: string; px: string; usage: string }[] = [
  { token: "border", px: "1 px", usage: "Default — cards, inputs, table dividers" },
  { token: "border-2", px: "2 px", usage: "Focus rings, dashed placeholder boxes" },
  { token: "border-4", px: "4 px", usage: "Decorative emphasis only (rare)" },
];

const OPACITY_TOKENS: { token: string; value: string; usage: string }[] = [
  { token: "opacity-40", value: "0.4", usage: "Disabled icons" },
  { token: "opacity-50", value: "0.5", usage: "Disabled buttons / inputs" },
  { token: "opacity-60", value: "0.6", usage: "Placeholder text on dark fills" },
  { token: "opacity-80", value: "0.8", usage: "Overlay backdrops" },
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

function PreviewBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {children}
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

  // Local state for demoing interactive overlays / inputs.
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [comboboxValue, setComboboxValue] = useState("");
  const [sliderValue, setSliderValue] = useState([40]);
  const [progressValue, setProgressValue] = useState(60);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [otpValue, setOtpValue] = useState("");
  const [multiValue, setMultiValue] = useState<string[]>(["mumbai", "pune"]);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Scroll spy — highlights the sidebar entry of whichever section
  // is currently in view.
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

  const skuComboItems = [
    { value: "ABC-001", label: "Freedom Sunflower Oil 1L" },
    { value: "ABC-002", label: "Aashirvaad Atta 5KG" },
    { value: "ABC-003", label: "Tata Salt 1KG" },
    { value: "ABC-004", label: "Britannia Marie 200g" },
    { value: "ABC-005", label: "Maggi Noodles Pack of 12" },
  ];

  const cityOptions = [
    { value: "mumbai", label: "Mumbai" },
    { value: "pune", label: "Pune" },
    { value: "bengaluru", label: "Bengaluru" },
    { value: "hyderabad", label: "Hyderabad" },
    { value: "chennai", label: "Chennai" },
    { value: "delhi", label: "Delhi" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
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
              description="A living handbook for everyone shipping on the Qwipo design language. Every token, component, and pattern is pulled directly from the production codebase — so what you see here is exactly what users see, and it's safe to reuse across other Qwipo products."
            >
              <Card className="border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-purple-50">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-fuchsia-700">
                    <Palette className="h-5 w-5" />
                    <p className="text-sm font-semibold">For designers, PMs, and developers</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Use the sidebar to jump to any section. Foundations cover
                    tokens (colors / type / spacing / motion). Components
                    cover every primitive grouped by purpose — Forms &
                    Inputs, Display, Overlays, Navigation, Data Display.
                    Patterns document the recurring page structures so new
                    screens stay consistent. Screens link out to the live
                    pages those patterns power.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Tailwind v4", "shadcn / Radix", "Lucide icons", "Sonner toasts", "Motion (Framer)", "cmdk", "vaul", "react-day-picker"].map((tech) => (
                      <Badge key={tech} variant="outline" className="bg-white text-fuchsia-700 border-fuchsia-200">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: Palette, title: "Tokens", body: "Colors, type, spacing, radii, shadows, motion, z-index, breakpoints." },
                  { icon: Component, title: "Components", body: "40+ primitives — buttons, inputs, overlays, navigation, data." },
                  { icon: LayoutTemplate, title: "Patterns", body: "List, detail, form, filters, bulk actions, wizards, dialogs, empty states." },
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
                    { title: "Clarity over cleverness", body: "Users manage real money. Plain language, predictable layouts, remove visual noise that doesn't pay rent." },
                    { title: "Status-aware UI", body: "What the user can do should follow from the state of the data. Order is New? Show Confirm + Cancel. Delivered? Show nothing destructive." },
                    { title: "DMS is reference, ONDC is truth", body: "Every form that touches the catalog shows DMS values read-only on the left, editable ONDC inputs on the right. Forks are visible." },
                    { title: "Empty states do work", body: "An empty list isn't a blank page — it's an opportunity to explain what'll appear there and how." },
                    { title: "Tokens, not hex codes", body: "Use Tailwind utility classes from the approved scale. If a value isn't in the scale, propose adding it before reaching for arbitrary classes." },
                    { title: "Accessibility is non-negotiable", body: "Every interactive must be keyboard-reachable, have a visible focus ring, and pass WCAG AA contrast at every state." },
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

            {/* ===== Foundations — Colors ===== */}
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

            {/* ===== Foundations — Typography ===== */}
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

              <SubHeader>Font Weights</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="font-normal">Regular 400</p>
                  <p className="text-[11px] text-gray-500 mt-1">Body, captions</p>
                </div>
                <div>
                  <p className="font-medium">Medium 500</p>
                  <p className="text-[11px] text-gray-500 mt-1">Form labels, table cells</p>
                </div>
                <div>
                  <p className="font-semibold">Semibold 600</p>
                  <p className="text-[11px] text-gray-500 mt-1">Headings, CTAs</p>
                </div>
                <div>
                  <p className="font-bold">Bold 700</p>
                  <p className="text-[11px] text-gray-500 mt-1">Page H1, KPI values</p>
                </div>
              </div>
            </Section>

            {/* ===== Foundations — Spacing & Radius ===== */}
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

              <SubHeader>Border Widths</SubHeader>
              <div className="grid grid-cols-3 gap-3">
                {BORDER_WIDTHS.map((b) => (
                  <div key={b.token} className="rounded-md bg-white p-4 space-y-2 border-gray-200" style={{ borderWidth: b.px }}>
                    <p className="text-xs font-mono text-fuchsia-700">{b.token}</p>
                    <p className="text-[11px] text-gray-500">{b.px} · {b.usage}</p>
                  </div>
                ))}
              </div>

              <SubHeader>Opacity</SubHeader>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {OPACITY_TOKENS.map((o) => (
                  <div key={o.token} className="rounded-md border border-gray-200 bg-white p-3 space-y-2">
                    <div className="h-10 rounded-md bg-fuchsia-600" style={{ opacity: parseFloat(o.value) }} />
                    <p className="text-xs font-mono text-fuchsia-700">{o.token}</p>
                    <p className="text-[11px] text-gray-500">{o.value} · {o.usage}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ===== Foundations — Shadows ===== */}
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

            {/* ===== Foundations — Motion ===== */}
            <Section
              id="motion"
              title="Motion"
              description="Animation lives in two scales: duration (how long) and easing (the curve). Default to 150ms + ease-out for any interactive feedback. Anything above 300ms needs justification."
            >
              <SubHeader>Durations</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold w-32">Token</th>
                      <th className="px-3 py-2 font-semibold w-24">Time</th>
                      <th className="px-3 py-2 font-semibold">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOTION_DURATIONS.map((m) => (
                      <tr key={m.token}>
                        <td className="px-3 py-2"><code className="text-[11px] font-mono text-fuchsia-700">{m.token}</code></td>
                        <td className="px-3 py-2 text-xs font-mono text-gray-700">{m.ms}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{m.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SubHeader>Easings</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold w-32">Token</th>
                      <th className="px-3 py-2 font-semibold">Curve</th>
                      <th className="px-3 py-2 font-semibold">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOTION_EASINGS.map((m) => (
                      <tr key={m.token}>
                        <td className="px-3 py-2"><code className="text-[11px] font-mono text-fuchsia-700">{m.token}</code></td>
                        <td className="px-3 py-2 text-xs font-mono text-gray-700">{m.curve}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{m.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SubHeader>Principles</SubHeader>
              <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5 leading-relaxed">
                <li>Respect <code className="font-mono text-fuchsia-700">prefers-reduced-motion</code>. Drop durations to 0ms for users who set it.</li>
                <li>Animate transforms and opacity, not <code>width</code>/<code>height</code>/<code>top</code>. Layout properties stutter.</li>
                <li>Enter on <em>ease-out</em>, leave on <em>ease-in</em>. The eye locks onto an arriving element and forgives a slow exit.</li>
              </ul>
            </Section>

            {/* ===== Foundations — Z-index & Breakpoints ===== */}
            <Section
              id="layout-tokens"
              title="Z-index & Breakpoints"
              description="A small, fixed z-index scale prevents the dreaded `z-9999` arms race. Breakpoints map to real device classes — design mobile-first."
            >
              <SubHeader>Z-Index Scale</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold w-32">Token</th>
                      <th className="px-3 py-2 font-semibold">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Z_INDEX_TOKENS.map((z) => (
                      <tr key={z.token}>
                        <td className="px-3 py-2"><code className="text-[11px] font-mono text-fuchsia-700">{z.token}</code></td>
                        <td className="px-3 py-2 text-xs text-gray-600">{z.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SubHeader>Breakpoints</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold w-24">Token</th>
                      <th className="px-3 py-2 font-semibold w-32">Min Width</th>
                      <th className="px-3 py-2 font-semibold">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {BREAKPOINTS.map((bp) => (
                      <tr key={bp.token}>
                        <td className="px-3 py-2"><code className="text-[11px] font-mono text-fuchsia-700">{bp.token}</code></td>
                        <td className="px-3 py-2 text-xs font-mono text-gray-700">{bp.px}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{bp.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ===== Foundations — Icons ===== */}
            <Section
              id="icons"
              title="Icons"
              description="Lucide React. Default size 16 × 16 (h-4 w-4). 14 × 14 inside chips, 20 × 20 in card headers, 24 × 24+ for hero illustrations only. Stroke width is the lucide default (1.5)."
            >
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  Search, Filter, Users, Layers, Bell, Mail,
                  Phone, Eye, EyeOff, Copy, Trash2, ShieldCheck,
                  CheckCircle2, XCircle, AlertCircle, AlertTriangle,
                  Info, Ban, Package, ShoppingCart, Truck, Tag,
                  CreditCard, Star, MapPin, Settings, Home, Flag,
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

            {/* ===== Forms — Buttons ===== */}
            <Section
              id="buttons"
              title="Buttons"
              description="Six variants. Primary by default, destructive only for irreversible actions, ghost for low-emphasis affordances. Sizes: sm (h-8), default (h-9), lg (h-10), icon (square)."
            >
              <SubHeader>Variants</SubHeader>
              <PreviewBox>
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
                <StateRow label="Secondary (filled)">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="secondary">
                    <Download className="h-4 w-4" />
                    Export
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
              </PreviewBox>

              <SubHeader>States</SubHeader>
              <PreviewBox>
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
              </PreviewBox>

              <SubHeader>Usage</SubHeader>
              <CodeBlock>{`<Button>Confirm Order</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon"><Eye /></Button>`}</CodeBlock>
            </Section>

            {/* ===== Forms — Inputs ===== */}
            <Section
              id="inputs"
              title="Inputs"
              description="One Input primitive covers text, number, password, search, email, date. Always pair with a Label and the optional helper / error caption below."
            >
              <PreviewBox>
                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Default</Label>
                    <Input placeholder="Type something…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">With value</Label>
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
                  <div className="space-y-1.5">
                    <Label className="text-xs">With trailing button</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Mobile number" />
                      <Button variant="outline" size="sm">Send OTP</Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Password</Label>
                    <div className="relative">
                      <Input type="password" defaultValue="hunter2" />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Forms — Textarea ===== */}
            <Section
              id="textarea"
              title="Textarea"
              description="Multi-line text. Use a min-height that hints at expected length (~3 rows for short notes, 6 for descriptions). Resizing should be vertical-only."
            >
              <PreviewBox>
                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Default</Label>
                    <Textarea placeholder="Add a note about this customer…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">With value</Label>
                    <Textarea defaultValue="Delivery instructions: ring the bell twice; security gate closes after 8 PM." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Error</Label>
                    <Textarea
                      defaultValue=""
                      placeholder="Required"
                      className="border-red-400 focus-visible:ring-red-300"
                      aria-invalid
                    />
                    <p className="text-[11px] text-red-700">This field is required.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Disabled</Label>
                    <Textarea disabled defaultValue="Locked — set at registration." />
                  </div>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Forms — Selects ===== */}
            <Section
              id="selects"
              title="Selects"
              description="Use Select for short, known-set options (≤ 8 items). For larger sets prefer a Combobox (see below)."
            >
              <PreviewBox>
                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
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
              </PreviewBox>
            </Section>

            {/* ===== Forms — Combobox ===== */}
            <Section
              id="combobox"
              title="Combobox"
              description="Search-as-you-type picker. Use when the option set is large (≥ 8) or unknown until typed (SKU lookup, customer search). Backed by cmdk + Popover."
            >
              <PreviewBox>
                <div className="space-y-1.5 max-w-md">
                  <Label className="text-xs">SKU</Label>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxOpen}
                        className="w-full justify-between font-normal"
                      >
                        {comboboxValue
                          ? skuComboItems.find((i) => i.value === comboboxValue)?.label
                          : "Search SKUs by name or code…"}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search SKUs…" />
                        <CommandList>
                          <CommandEmpty>No SKU found.</CommandEmpty>
                          <CommandGroup>
                            {skuComboItems.map((i) => (
                              <CommandItem
                                key={i.value}
                                value={i.label}
                                onSelect={() => {
                                  setComboboxValue(i.value === comboboxValue ? "" : i.value);
                                  setComboboxOpen(false);
                                }}
                              >
                                <Check className={"mr-2 h-4 w-4 " + (comboboxValue === i.value ? "opacity-100" : "opacity-0")} />
                                <span className="font-mono text-[11px] text-gray-500 mr-2">{i.value}</span>
                                {i.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-[11px] text-gray-600">Filters inactive SKUs and SKUs already mapped to another active scheme.</p>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Forms — Multi-Select ===== */}
            <Section
              id="multi-select"
              title="Multi-Select"
              description="Pick multiple values from a known set. Selected values appear as removable chips inside the trigger. Use when ordering doesn't matter."
            >
              <PreviewBox>
                <div className="space-y-1.5 max-w-md">
                  <Label className="text-xs">Service Cities</Label>
                  <MultiSelect
                    options={cityOptions}
                    selected={multiValue}
                    onChange={setMultiValue}
                    placeholder="Pick cities…"
                  />
                  <p className="text-[11px] text-gray-600">Chips inside the trigger are removable. Use the search inside the popover to narrow long lists.</p>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Forms — Radio Group ===== */}
            <Section
              id="radio"
              title="Radio Group"
              description="Single-choice from a small, visible set (typically 2–5). For ≥ 6 options prefer Select. Lay out vertically for clarity; horizontal only for short labels."
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <PreviewBox>
                  <SubHeader>Vertical (default)</SubHeader>
                  <RadioGroup defaultValue="cod" className="space-y-2">
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                      <RadioGroupItem value="cod" id="r-cod" className="mt-0.5" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-[11px] text-gray-500">Pay on receipt.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                      <RadioGroupItem value="upi" id="r-upi" className="mt-0.5" />
                      <div>
                        <p className="font-medium">UPI</p>
                        <p className="text-[11px] text-gray-500">Instant transfer.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 text-sm cursor-pointer text-gray-400">
                      <RadioGroupItem value="card" id="r-card" disabled className="mt-0.5" />
                      <div>
                        <p className="font-medium">Card (unavailable)</p>
                        <p className="text-[11px]">Coming soon.</p>
                      </div>
                    </label>
                  </RadioGroup>
                </PreviewBox>

                <PreviewBox>
                  <SubHeader>Horizontal</SubHeader>
                  <RadioGroup defaultValue="percent" className="flex flex-wrap gap-3">
                    {["Percent", "Flat", "BOGO"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                        <RadioGroupItem value={opt.toLowerCase()} />
                        {opt}
                      </label>
                    ))}
                  </RadioGroup>
                </PreviewBox>
              </div>
            </Section>

            {/* ===== Forms — Checkbox & Switch ===== */}
            <Section
              id="toggles"
              title="Checkbox & Switch"
              description="Checkbox for multi-select lists. Switch for instant-effect binary settings (status, toggles). Avoid using a switch for actions that need a Save button."
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <PreviewBox>
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
                </PreviewBox>
                <PreviewBox>
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
                </PreviewBox>
              </div>
            </Section>

            {/* ===== Forms — Toggle Group ===== */}
            <Section
              id="toggle-group"
              title="Toggle Group"
              description="A row of pill-style toggles. Single-select for view modes, multi-select for inline formatting toolbars."
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <PreviewBox>
                  <SubHeader>Single (view mode)</SubHeader>
                  <ToggleGroup type="single" defaultValue="list" className="justify-start">
                    <ToggleGroupItem value="list">List</ToggleGroupItem>
                    <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
                    <ToggleGroupItem value="kanban">Kanban</ToggleGroupItem>
                  </ToggleGroup>
                </PreviewBox>
                <PreviewBox>
                  <SubHeader>Multiple (formatting)</SubHeader>
                  <ToggleGroup type="multiple" defaultValue={["bold"]} className="justify-start">
                    <ToggleGroupItem value="bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="underline"><Underline className="h-4 w-4" /></ToggleGroupItem>
                  </ToggleGroup>
                </PreviewBox>
                <PreviewBox>
                  <SubHeader>Standalone Toggle</SubHeader>
                  <div className="flex gap-2">
                    <Toggle><Mic className="h-4 w-4" /></Toggle>
                    <Toggle defaultPressed>Pinned</Toggle>
                  </div>
                </PreviewBox>
              </div>
            </Section>

            {/* ===== Forms — Slider ===== */}
            <Section
              id="slider"
              title="Slider"
              description="Continuous range input. Use for fuzzy values (price ranges, discount percentages, weight). Always pair with a numeric display so the exact value is visible."
            >
              <PreviewBox>
                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <Label className="text-xs">Discount</Label>
                      <span className="font-mono text-gray-700">{sliderValue[0]}%</span>
                    </div>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Price range (₹)</Label>
                    <Slider defaultValue={[100, 800]} max={1000} step={50} />
                  </div>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Forms — Date Picker ===== */}
            <Section
              id="date-picker"
              title="Date Picker"
              description="Calendar picker via react-day-picker, wrapped in a Popover. For Valid From / Till on offers we cap selections to a 31-day window programmatically; the calendar always shows next month context."
            >
              <PreviewBox>
                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal">
                          <CalendarIcon className="h-4 w-4" />
                          {date ? date.toLocaleDateString() : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Inline calendar</Label>
                    <div className="rounded-md border border-gray-200 inline-block">
                      <Calendar mode="single" selected={date} onSelect={setDate} />
                    </div>
                  </div>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Forms — OTP Input ===== */}
            <Section
              id="otp"
              title="OTP Input"
              description="Slotted numeric input for one-time passwords. Auto-advances on type, supports paste, accepts only digits. Default 4 slots; 6 for higher-security flows."
            >
              <PreviewBox>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">4-digit OTP</Label>
                    <InputOTP maxLength={4} value={otpValue} onChange={setOtpValue}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">6-digit OTP</Label>
                    <InputOTP maxLength={6}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Forms — File Upload ===== */}
            <Section
              id="file-upload"
              title="File Upload"
              description="Drag-and-drop zone + click-to-browse fallback. Show accepted formats, max size, and what the user gets when files land (preview, name, size, remove)."
            >
              <PreviewBox>
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-fuchsia-300 hover:bg-fuchsia-50/30 transition-all">
                  <Upload className="h-7 w-7 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Drop files here or click to browse</p>
                  <p className="text-[11px] text-gray-500 mt-1">PNG, JPG, PDF — up to 5 MB each</p>
                  <input type="file" className="hidden" />
                </label>
              </PreviewBox>

              <SubHeader>With queued files</SubHeader>
              <PreviewBox>
                <div className="space-y-2">
                  {[
                    { name: "front.jpg", size: "248 KB", status: "uploaded" },
                    { name: "back.jpg", size: "194 KB", status: "uploading" },
                    { name: "receipt.pdf", size: "1.2 MB", status: "error" },
                  ].map((f) => (
                    <div key={f.name} className="flex items-center gap-3 rounded-md border border-gray-200 p-2">
                      <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                        <ImageIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">{f.name}</p>
                        <p className="text-[10px] text-gray-500">{f.size}</p>
                      </div>
                      {f.status === "uploaded" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {f.status === "uploading" && <Activity className="h-4 w-4 text-blue-600 animate-spin" />}
                      {f.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                      <Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  ))}
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Display — Badges & Status ===== */}
            <Section
              id="badges"
              title="Badges & Status"
              description="Status semantics map to colors with a fixed 50 / 200 / 700 recipe. Match this matrix exactly on new status types so badges stay scannable."
            >
              <PreviewBox>
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
                <StateRow label="Numeric / Count">
                  <Badge className="bg-blue-600 text-white border-blue-600 rounded-full px-1.5 min-w-[20px] justify-center">3</Badge>
                  <Badge className="bg-red-600 text-white border-red-600 rounded-full px-1.5 min-w-[20px] justify-center">99+</Badge>
                </StateRow>
              </PreviewBox>
            </Section>

            {/* ===== Display — Cards ===== */}
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

            {/* ===== Display — Avatars ===== */}
            <Section
              id="avatars"
              title="Avatars"
              description="Round image with initials fallback. Sizes: xs (h-6), sm (h-8), default (h-10), lg (h-12). Stacks for groups, with a +N pill if the group overflows."
            >
              <PreviewBox>
                <StateRow label="Sizes">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">RK</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">RK</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>RK</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>RK</AvatarFallback>
                  </Avatar>
                </StateRow>
                <StateRow label="With image">
                  <Avatar>
                    <AvatarImage src="https://avatar.iran.liara.run/public/45" alt="" />
                    <AvatarFallback>RK</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src="https://avatar.iran.liara.run/public/30" alt="" />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                </StateRow>
                <StateRow label="Stack">
                  <div className="flex -space-x-2">
                    {["RK", "SA", "PM", "VK"].map((i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-white">
                        <AvatarFallback className="text-[11px]">{i}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[11px] text-gray-700 font-semibold">
                      +5
                    </div>
                  </div>
                </StateRow>
                <StateRow label="With status dot">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>RK</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>SA</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-gray-300 border-2 border-white" />
                  </div>
                </StateRow>
              </PreviewBox>
            </Section>

            {/* ===== Display — Progress ===== */}
            <Section
              id="progress"
              title="Progress"
              description="Determinate bars for known durations (uploads, multi-step forms). Indeterminate spinner for unknown waits (see Loading & Skeletons)."
            >
              <PreviewBox>
                <div className="space-y-4 max-w-md">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-700">Catalog sync</span>
                      <span className="font-mono text-gray-500">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} />
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>−10%</Button>
                      <Button variant="outline" size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>+10%</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">Variants</p>
                    <Progress value={100} className="[&>div]:bg-emerald-500" />
                    <Progress value={45} className="[&>div]:bg-amber-500" />
                    <Progress value={20} className="[&>div]:bg-red-500" />
                  </div>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Display — Separators & Layout ===== */}
            <Section
              id="separators"
              title="Separators & Layout"
              description="Separators break content into scannable rhythm. Aspect Ratio locks media to a fixed shape regardless of width."
            >
              <SubHeader>Separator</SubHeader>
              <PreviewBox>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">First chunk of content above the line.</p>
                  <Separator />
                  <p className="text-sm text-gray-700">Second chunk, divided by a horizontal separator.</p>
                  <div className="flex h-5 items-center gap-3 text-xs text-gray-600">
                    <span>Inline</span>
                    <Separator orientation="vertical" />
                    <span>Vertical</span>
                    <Separator orientation="vertical" />
                    <span>Use</span>
                  </div>
                </div>
              </PreviewBox>

              <SubHeader>Aspect Ratio</SubHeader>
              <PreviewBox>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <AspectRatio ratio={1} className="rounded-md bg-gradient-to-br from-fuchsia-100 to-purple-100 flex items-center justify-center text-xs text-fuchsia-700 font-semibold">
                      1:1
                    </AspectRatio>
                    <p className="text-[11px] text-gray-500 mt-1">Avatars, product tiles</p>
                  </div>
                  <div>
                    <AspectRatio ratio={4 / 3} className="rounded-md bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xs text-blue-700 font-semibold">
                      4:3
                    </AspectRatio>
                    <p className="text-[11px] text-gray-500 mt-1">Catalog photos</p>
                  </div>
                  <div>
                    <AspectRatio ratio={16 / 9} className="rounded-md bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center text-xs text-emerald-700 font-semibold">
                      16:9
                    </AspectRatio>
                    <p className="text-[11px] text-gray-500 mt-1">Hero banners</p>
                  </div>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Display — Loading ===== */}
            <Section
              id="loading"
              title="Loading & Skeletons"
              description="Skeleton placeholders for predictable layouts (lists, cards). Centered spinner only when content has no skeletable shape (network ops, downloads)."
            >
              <SubHeader>Skeleton (preferred)</SubHeader>
              <PreviewBox>
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                </div>
              </PreviewBox>

              <SubHeader>Skeleton — list row</SubHeader>
              <PreviewBox>
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              </PreviewBox>

              <SubHeader>Spinner (fallback)</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white p-8 flex items-center justify-center gap-2">
                <Circle className="h-4 w-4 animate-pulse text-fuchsia-600 fill-fuchsia-600" />
                <Circle className="h-4 w-4 animate-pulse text-fuchsia-600 fill-fuchsia-600 [animation-delay:120ms]" />
                <Circle className="h-4 w-4 animate-pulse text-fuchsia-600 fill-fuchsia-600 [animation-delay:240ms]" />
                <span className="text-sm text-gray-600 ml-2">Loading…</span>
              </div>
            </Section>

            {/* ===== Overlays — Tooltip ===== */}
            <Section
              id="tooltip"
              title="Tooltip"
              description="Tiny hover hint for icons or terse labels. Never put critical information here — keyboard / touch users may never see it. 12px text, dark fill, ~120ms delay."
            >
              <PreviewBox>
                <div className="flex flex-wrap gap-6">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete SKU</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>I am a tooltip.</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 cursor-help">
                        <Info className="h-3 w-3" /> SLA
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">Mean time-to-ship across last 30 days.</TooltipContent>
                  </Tooltip>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Popover ===== */}
            <Section
              id="popover"
              title="Popover"
              description="Anchored floating panel with structured content (forms, mini menus, swatch pickers). Closes on outside click and Esc. Use Dialog instead when the content needs the page's full attention."
            >
              <PreviewBox>
                <div className="flex flex-wrap gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">Open Popover</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 space-y-2">
                      <p className="text-sm font-semibold">Pick a label colour</p>
                      <div className="flex flex-wrap gap-2">
                        {["bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-blue-500", "bg-fuchsia-500"].map((c) => (
                          <button key={c} className={"h-7 w-7 rounded-full " + c} />
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500">Choices apply immediately.</p>
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Display Name</Label>
                        <Input defaultValue="ABC Distributors" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Public listing</Label>
                        <Switch defaultChecked />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Hover Card ===== */}
            <Section
              id="hover-card"
              title="Hover Card"
              description="Larger, mouse-only preview triggered on hover (entity peek). Touch users see no preview, so this is supplementary content — never the only path."
            >
              <PreviewBox>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link" className="px-0">@rajesh.kumar</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>RK</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">Rajesh Kumar</p>
                        <p className="text-[11px] text-gray-500">ABC Distributors · Joined 2023-08</p>
                        <p className="text-xs text-gray-700 mt-1.5">Active seller — 1,240 SKUs, 312 customers.</p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Dropdown Menu ===== */}
            <Section
              id="dropdown"
              title="Dropdown Menu"
              description="Action menu anchored to a trigger. Use for row-level actions (overflow `⋯`), account switchers, view options. Supports nested submenus, checkable items, radio groups, keyboard shortcuts."
            >
              <PreviewBox>
                <div className="flex flex-wrap gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Open menu
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Account</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <UserIcon className="h-4 w-4" /> Profile
                        <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4" /> Settings
                        <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>View</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem checked>Show sidebar</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>Compact rows</DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value="list">
                        <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-700">
                        <LogOut className="h-4 w-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem><Edit2 className="h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="h-4 w-4" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-700"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Context Menu ===== */}
            <Section
              id="context-menu"
              title="Context Menu"
              description="Right-click menu for power users. Always pair with an equivalent path through a visible Dropdown / overflow `⋯` — context menus are invisible on touch."
            >
              <PreviewBox>
                <ContextMenu>
                  <ContextMenuTrigger className="block rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center text-xs text-gray-600">
                    Right-click anywhere inside this box
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem><Edit2 className="h-4 w-4" /> Rename</ContextMenuItem>
                    <ContextMenuItem><Copy className="h-4 w-4" /> Copy link</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem className="text-red-600 focus:text-red-700"><Trash2 className="h-4 w-4" /> Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Dialog ===== */}
            <Section
              id="dialog"
              title="Dialog"
              description="A modal for focused tasks (Create / Edit forms, multi-field flows). Always include a Title and a Description. Close on Esc + outside-click unless the task is destructive."
            >
              <PreviewBox>
                <div className="flex flex-wrap gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4" />
                        New Customer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add a new customer</DialogTitle>
                        <DialogDescription>
                          Customers register automatically on first order, but you can also add them manually.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Mobile</Label>
                          <Input placeholder="10-digit number" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Business name</Label>
                          <Input placeholder="Acme Distributors" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button>Add Customer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Download className="h-4 w-4" />
                        Export Orders
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Export Orders</DialogTitle>
                        <DialogDescription>
                          Pick a date range up to 31 days. Output is a CSV with 23 columns.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-3 py-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Start date</Label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">End date</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button>Download CSV</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Alert Dialog ===== */}
            <Section
              id="alert-dialog"
              title="Alert Dialog"
              description="A modal that demands a decision before continuing. No Esc / outside-click escape. Use for destructive or irreversible actions. The primary action mirrors the verb in the title."
            >
              <PreviewBox>
                <div className="flex flex-wrap gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete SKU
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this SKU?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This SKU has 4 active orders. Deleting it will not cancel those orders, but the SKU will no longer be visible in the catalog.
                          <span className="font-semibold text-gray-900"> This action cannot be undone.</span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep SKU</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                          Yes, delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <Ban className="h-4 w-4" />
                        Cancel Order
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The buyer will be notified and any reserved stock will be returned to inventory.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep order</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                          Cancel order
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Sheet ===== */}
            <Section
              id="sheet"
              title="Sheet (side panel)"
              description="Side-anchored panel that slides in from the right (default) or left. Use for filter drawers, detail peeks, multi-section forms that wouldn't fit a dialog. Side: right (default), left, top, bottom."
            >
              <PreviewBox>
                <div className="flex flex-wrap gap-3">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">
                        <Filter className="h-4 w-4" />
                        Open Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Filter Orders</SheetTitle>
                        <SheetDescription>Narrow this list by status, marketplace, or date.</SheetDescription>
                      </SheetHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Status</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Any", "New", "Confirmed", "Delivered", "Cancelled"].map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Marketplace</Label>
                          <div className="space-y-2">
                            {["ONDC", "Amazon", "Flipkart"].map((m) => (
                              <label key={m} className="flex items-center gap-2 text-sm">
                                <Checkbox /> {m}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <SheetFooter>
                        <Button variant="outline">Clear all</Button>
                        <Button>Apply</Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">
                        <Menu className="h-4 w-4" />
                        Left Drawer
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Navigation</SheetTitle>
                      </SheetHeader>
                      <nav className="space-y-1 py-4 text-sm">
                        {["Dashboard", "My SKU", "Orders", "Customers", "Reports"].map((i) => (
                          <a key={i} href="#" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
                            {i}
                          </a>
                        ))}
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Drawer ===== */}
            <Section
              id="drawer"
              title="Drawer (bottom)"
              description="Bottom-anchored sheet, mobile-first. Use for actions on a list item, picker flows, or content where the trigger is visually 'pulling up' a tray. Backed by vaul."
            >
              <PreviewBox>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">
                      <ChevronDown className="h-4 w-4 rotate-180" />
                      Open Drawer
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="mx-auto w-full max-w-md">
                      <DrawerHeader>
                        <DrawerTitle>Order #QWI-ONDC-260330-8F3K92</DrawerTitle>
                        <DrawerDescription>Status: Confirmed · 6 items · ₹4,580</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 space-y-2 text-sm">
                        <p className="text-gray-700">Confirm to send the order to fulfillment, or cancel to release stock.</p>
                      </div>
                      <DrawerFooter>
                        <Button>Mark Delivered</Button>
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Command ===== */}
            <Section
              id="command"
              title="Command Palette"
              description="Keyboard-first finder. Open via ⌘K / Ctrl K. Use to jump between pages, run actions, or pick from a long list. Backed by cmdk."
            >
              <PreviewBox>
                <div className="rounded-md border border-gray-200 overflow-hidden">
                  <Command className="bg-white">
                    <CommandInput placeholder="Type a command or search…" />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup heading="Pages">
                        <CommandItem><Package className="h-4 w-4" /> My SKU</CommandItem>
                        <CommandItem><ShoppingCart className="h-4 w-4" /> Orders</CommandItem>
                        <CommandItem><Users className="h-4 w-4" /> Customers</CommandItem>
                      </CommandGroup>
                      <CommandSeparator />
                      <CommandGroup heading="Actions">
                        <CommandItem><Plus className="h-4 w-4" /> Create Offer</CommandItem>
                        <CommandItem><Download className="h-4 w-4" /> Export Orders</CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Toasts & Banners ===== */}
            <Section
              id="feedback"
              title="Toasts & Banners"
              description="Toasts via Sonner for transient feedback (saves, errors). Inline banners for context that's part of the current task."
            >
              <SubHeader>Sonner toasts (transient)</SubHeader>
              <PreviewBox>
                <div className="flex flex-wrap gap-2">
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
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast("Order #QWI-ONDC-260330-8F3K92 cancelled", {
                        description: "Stock has been returned to inventory.",
                        action: { label: "Undo", onClick: () => toast.success("Restored") },
                      })
                    }
                  >
                    With action
                  </Button>
                </div>
              </PreviewBox>

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

            {/* ===== Navigation — Tabs ===== */}
            <Section
              id="tabs"
              title="Tabs"
              description="Switch between mutually-exclusive views of the same context. Three variants in production use — pick the one that matches the page: status pills (Orders), section pills (Seller Detail / Connector Detail), or equal-width grid (Inventory)."
            >
              <SubHeader>Status pills with counts (Orders pattern)</SubHeader>
              <PreviewBox>
                <Tabs defaultValue="new" className="w-full">
                  <TabsList className="bg-gray-100 p-1 rounded-lg inline-flex gap-1 h-auto flex-shrink-0">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                    >
                      <span className="font-medium">All (47)</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="new"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">New (12)</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="confirmed"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">Confirmed (18)</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="delivered"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                    >
                      <Truck className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">Delivered (14)</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="cancelled"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all whitespace-nowrap"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">Cancelled (3)</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="new" className="text-xs text-gray-600 pt-3">
                    New orders content — the rows that need a Confirm / Cancel decision.
                  </TabsContent>
                  <TabsContent value="confirmed" className="text-xs text-gray-600 pt-3">
                    Confirmed orders — awaiting Mark Delivered.
                  </TabsContent>
                </Tabs>
              </PreviewBox>

              <SubHeader>Section pills (Seller Detail / Connector pattern)</SubHeader>
              <PreviewBox>
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="bg-gray-100 p-1 rounded-lg inline-flex gap-1 h-auto flex-wrap">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2">Profile</TabsTrigger>
                    <TabsTrigger value="address" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2">Address</TabsTrigger>
                    <TabsTrigger value="kyc" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2">KYC</TabsTrigger>
                    <TabsTrigger value="payments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2">Payments</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="text-xs text-gray-600 pt-3">
                    Profile content — business name, mobile, GSTIN.
                  </TabsContent>
                </Tabs>
              </PreviewBox>

              <SubHeader>Equal-width grid (Inventory pattern)</SubHeader>
              <PreviewBox>
                <Tabs defaultValue="in-stock" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="in-stock">In Stock (240)</TabsTrigger>
                    <TabsTrigger value="out-of-stock">Out of Stock (12)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="in-stock" className="text-xs text-gray-600 pt-3">
                    Best for two-or-three balanced lanes where each tab represents an equal slice.
                  </TabsContent>
                </Tabs>
              </PreviewBox>

              <SubHeader>When to pick which</SubHeader>
              <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5 leading-relaxed">
                <li><span className="font-semibold">Status pills with counts</span> — list pages with filterable rows (Orders, Customers, Schemes). Show count per tab; icons optional.</li>
                <li><span className="font-semibold">Section pills</span> — detail pages with multiple subsections (Seller Detail, Connector Detail, Companies). No counts; flat label.</li>
                <li><span className="font-semibold">Equal-width grid</span> — binary or near-binary splits (In Stock / Out of Stock). Each tab fills its column.</li>
              </ul>
            </Section>

            {/* ===== Navigation — Accordion & Collapsible ===== */}
            <Section
              id="accordion"
              title="Accordion & Collapsible"
              description="Accordion for an FAQ-style list of headers/bodies. Collapsible for a single show/hide region (e.g. 'Show advanced options')."
            >
              <SubHeader>Accordion (single)</SubHeader>
              <PreviewBox>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="a">
                    <AccordionTrigger>What does ONDC mean for my catalog?</AccordionTrigger>
                    <AccordionContent>
                      ONDC is an open network of buyer and seller apps. Your catalog
                      becomes discoverable across every buyer app on the network as soon as
                      it's published.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="b">
                    <AccordionTrigger>How is DMS data different from ONDC data?</AccordionTrigger>
                    <AccordionContent>
                      DMS is your internal record. ONDC is the version that goes on the network.
                      You can edit ONDC fields independently — DMS stays the read-only reference.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="c">
                    <AccordionTrigger>Where do offers apply?</AccordionTrigger>
                    <AccordionContent>
                      Quantity Pricing Schemes apply at order time. The discount appears on the
                      Order Detail page as a QPS Impact row.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </PreviewBox>

              <SubHeader>Collapsible (single region)</SubHeader>
              <PreviewBox>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between">
                      Show advanced options
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 text-xs text-gray-600 space-y-2">
                    <p>Advanced controls show up here. Examples: bulk delete, raw JSON view, debug logs.</p>
                  </CollapsibleContent>
                </Collapsible>
              </PreviewBox>
            </Section>

            {/* ===== Navigation — Breadcrumb ===== */}
            <Section
              id="breadcrumb"
              title="Breadcrumb"
              description="Hierarchical path. Last segment is the current page (non-link). Truncate to ellipsis on mobile if path is deep."
            >
              <PreviewBox>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">My SKU</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>SKU Details</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </PreviewBox>
            </Section>

            {/* ===== Navigation — Pagination ===== */}
            <Section
              id="pagination"
              title="Pagination"
              description="Show page numbers + Previous / Next. Use an ellipsis when total pages > 7. Always show the current page label + total count to the left of the controls."
            >
              <PreviewBox>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">Showing 1–10 of 247</p>
                  <Pagination className="m-0 w-auto justify-end">
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                      <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationEllipsis /></PaginationItem>
                      <PaginationItem><PaginationLink href="#">25</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationNext href="#" /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Data Display — Tables ===== */}
            <Section
              id="tables"
              title="Tables"
              description="Default text-sm. Headers in gray-50, gray-600 caption case. Sticky header for tables ≥ 20 rows. Numerics right-aligned. Status uses Badge."
            >
              <PreviewBox>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"><Checkbox /></TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { sku: "180000008", name: "Freedom Sunflower 1L × 16", stock: 480, price: "₹125", status: "Active" },
                      { sku: "180000009", name: "Aashirvaad Atta 5KG", stock: 120, price: "₹420", status: "Active" },
                      { sku: "180000010", name: "Maggi Masala Noodles 70g × 12", stock: 0, price: "₹158", status: "Out of stock" },
                    ].map((r) => (
                      <TableRow key={r.sku}>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell className="font-mono text-[11px]">{r.sku}</TableCell>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-right font-mono">{r.stock}</TableCell>
                        <TableCell className="text-right font-mono">{r.price}</TableCell>
                        <TableCell>
                          {r.status === "Active" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                          ) : (
                            <Badge className="bg-orange-50 text-orange-700 border-orange-200">Out of stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </PreviewBox>
            </Section>

            {/* ===== Data Display — Scroll Area ===== */}
            <Section
              id="scroll-area"
              title="Scroll Area"
              description="A styled scrollable region with a thin, opt-in scrollbar. Use to constrain tall lists inside cards or popovers without giving up native momentum."
            >
              <PreviewBox>
                <ScrollArea className="h-48 rounded-md border border-gray-200">
                  <div className="p-3 space-y-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="text-xs text-gray-700">
                        Row {i + 1} — Some content that takes up vertical space inside the scroll area.
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PreviewBox>
            </Section>

            {/* ===== Patterns — List page ===== */}
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

            {/* ===== Patterns — Detail page ===== */}
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

            {/* ===== Patterns — Form ===== */}
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

            {/* ===== Patterns — Filters & Search ===== */}
            <Section
              id="filters"
              title="Filters & Search"
              description="Three layers: free-text search always visible, primary filter chips inline above the table, advanced filters in a Sheet. Selected filters surface as removable chips below the search bar."
            >
              <SubHeader>Filter bar (inline)</SubHeader>
              <PreviewBox>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="Search by name, SKU, or order ID…" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4" />
                        More
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Advanced Filters</SheetTitle>
                      </SheetHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Brand</Label>
                          <MultiSelect
                            options={[{ value: "freedom", label: "Freedom" }, { value: "aashirvaad", label: "Aashirvaad" }]}
                            selected={[]}
                            onChange={() => {}}
                            placeholder="Any brand"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Price range (₹)</Label>
                          <Slider defaultValue={[0, 500]} max={1000} step={50} />
                        </div>
                      </div>
                      <SheetFooter>
                        <Button variant="outline">Clear all</Button>
                        <Button>Apply</Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>
              </PreviewBox>

              <SubHeader>Active filter chips</SubHeader>
              <PreviewBox>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] text-gray-500">Filters:</span>
                  {[
                    "Status: Active",
                    "Brand: Freedom, Aashirvaad",
                    "Price: ₹100 – ₹500",
                  ].map((f) => (
                    <Badge key={f} variant="outline" className="gap-1.5">
                      {f}
                      <button className="text-gray-400 hover:text-gray-700">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button variant="link" size="sm" className="px-1 h-auto text-[11px]">Clear all</Button>
                </div>
              </PreviewBox>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold">Rule of thumb:</span> ≤ 4 inline filters; the rest live in the "More" sheet. Every active filter must be visible and removable as a chip — invisible filters cause "why am I seeing nothing?" support tickets.
              </p>
            </Section>

            {/* ===== Patterns — Bulk Actions ===== */}
            <Section
              id="bulk-actions"
              title="Bulk Actions"
              description="When a row checkbox is ticked, the table header transforms into a contextual action bar with the count + verb-only buttons. Destructive actions on the right, separated by a divider."
            >
              <PreviewBox>
                <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Checkbox checked="indeterminate" />
                    <span className="font-medium text-blue-900">3 selected</span>
                    <Button variant="link" size="sm" className="px-0 h-auto text-blue-700">Clear selection</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"><Tag className="h-3.5 w-3.5" /> Tag</Button>
                    <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Patterns — Action bars ===== */}
            <Section
              id="action-bar"
              title="Action Bars & CTAs"
              description="Primary action sits on the right of the action bar, secondary / destructive to its left. Status-aware: only show actions that apply to the current state."
            >
              <PreviewBox>
                <div className="flex items-center justify-between">
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
              </PreviewBox>

              <SubHeader>Sticky bottom action bar (mobile / long forms)</SubHeader>
              <PreviewBox>
                <div className="rounded-md border border-gray-200 bg-white shadow-lg px-4 py-3 flex items-center justify-between sticky bottom-0">
                  <p className="text-xs text-gray-500">Unsaved changes</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Discard</Button>
                    <Button size="sm">Save Changes</Button>
                  </div>
                </div>
              </PreviewBox>
              <p className="text-xs text-gray-600 leading-relaxed">
                When the order moves to <Badge className="bg-green-50 text-green-700 border-green-200 mx-1">Confirmed</Badge> the same bar swaps Confirm Order out for <span className="font-semibold">Mark as Delivered</span>. Cancelled / Delivered orders show <em>no</em> destructive actions — the order is past the seller's hand.
              </p>
            </Section>

            {/* ===== Patterns — Wizards ===== */}
            <Section
              id="wizards"
              title="Wizards & Steppers"
              description="Multi-step flows expose the steps up front so users know where they are and what's coming. Each step's footer carries Back / Continue; the last step's primary is the verb of the outcome (Submit, Create, Pay)."
            >
              <PreviewBox>
                <ol className="flex items-center justify-between gap-2 w-full text-xs">
                  {[
                    { n: 1, label: "Mobile", state: "done" },
                    { n: 2, label: "OTP", state: "done" },
                    { n: 3, label: "Business Info", state: "current" },
                    { n: 4, label: "KYC", state: "upcoming" },
                    { n: 5, label: "Done", state: "upcoming" },
                  ].map((s, i, arr) => (
                    <li key={s.n} className="flex items-center gap-2 flex-1">
                      <div className={
                        "h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 " +
                        (s.state === "done"
                          ? "bg-emerald-500 text-white"
                          : s.state === "current"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-500")
                      }>
                        {s.state === "done" ? <Check className="h-3.5 w-3.5" /> : s.n}
                      </div>
                      <span className={s.state === "current" ? "font-semibold text-gray-900" : "text-gray-500"}>
                        {s.label}
                      </span>
                      {i < arr.length - 1 && <div className={"flex-1 h-px " + (s.state === "done" ? "bg-emerald-300" : "bg-gray-200")} />}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 rounded-md border border-gray-200 p-4 space-y-3">
                  <p className="text-sm font-semibold">Step 3 · Business Info</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Business name</Label>
                      <Input placeholder="Acme Distributors" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">GSTIN</Label>
                      <Input placeholder="27AAACR5055K1ZK" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Button variant="outline" size="sm">Back</Button>
                  <Button size="sm">Continue<ArrowRight className="h-3.5 w-3.5" /></Button>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Patterns — Confirmation Dialogs ===== */}
            <Section
              id="confirmation"
              title="Confirmation Dialogs"
              description="Use an Alert Dialog whenever an action is destructive, irreversible, or has blast radius beyond the current row. Mirror the verb in the title so users know what they're agreeing to."
            >
              <PreviewBox>
                <div className="space-y-3">
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-900">
                    <p className="font-semibold mb-1 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Destructive</p>
                    <p>Delete account · Delete SKU · Permanently remove customer.</p>
                  </div>
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <p className="font-semibold mb-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Irreversible (state change)</p>
                    <p>Cancel order · Publish to ONDC · Mark delivered.</p>
                  </div>
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                    <p className="font-semibold mb-1 flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Bulk side-effects</p>
                    <p>Apply offer to 24 SKUs · Send notification to 312 customers · Archive 47 conversations.</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4" />
                      Try a confirmation
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Apply offer to 24 SKUs?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The QPS scheme "BULK10" will apply to 24 SKUs across 3 brands. Buyers will see updated pricing within 60 seconds.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Not yet</AlertDialogCancel>
                      <AlertDialogAction>Yes, apply</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </PreviewBox>
            </Section>

            {/* ===== Patterns — Empty states ===== */}
            <Section
              id="empty-states"
              title="Empty States"
              description="An empty list is an opportunity. Always pair the illustration with a short headline + an explainer that tells the user what'll appear there and how it'll arrive."
            >
              <PreviewBox>
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-xl bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center mb-3">
                    <Users className="h-7 w-7 text-fuchsia-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">No customers yet</p>
                  <p className="text-xs text-gray-600 mt-1 max-w-md leading-relaxed">
                    Once retailers register against your brands from the buyer app,
                    they'll auto-register as Active here and appear in this list.
                  </p>
                </div>
              </PreviewBox>

              <SubHeader>With primary action</SubHeader>
              <PreviewBox>
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-3">
                    <Package className="h-7 w-7 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">No SKUs in your catalog</p>
                  <p className="text-xs text-gray-600 mt-1 max-w-md leading-relaxed">
                    Add your first SKU manually, sync from your DMS, or import in bulk via CSV.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm"><Plus className="h-4 w-4" /> Add SKU</Button>
                    <Button variant="outline" size="sm"><Upload className="h-4 w-4" /> Import CSV</Button>
                  </div>
                </div>
              </PreviewBox>

              <SubHeader>Filtered to nothing</SubHeader>
              <PreviewBox>
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <Search className="h-6 w-6 text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-900">No results for "freedmm oil"</p>
                  <p className="text-xs text-gray-600 mt-1">Check the spelling or clear filters.</p>
                  <Button variant="link" size="sm" className="mt-2">Clear filters</Button>
                </div>
              </PreviewBox>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold">Recipe:</span> rounded icon tile (h-16 w-16, soft brand fill) → 14px semibold headline → 12px gray-600 explainer, max 60 chars per line. Optional CTA below when there's a useful jump-start action.
              </p>
            </Section>

            {/* ===== Patterns — Notifications & Inbox ===== */}
            <Section
              id="notifications"
              title="Notifications & Inbox"
              description="Bell icon in the top nav with a count badge. Click opens a popover with the unread list, grouped by day. Each item: icon · title · timestamp · optional action."
            >
              <PreviewBox>
                <div className="flex justify-end">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-4 w-4" />
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-semibold">3</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                        <p className="text-sm font-semibold">Notifications</p>
                        <Button variant="link" size="sm" className="h-auto px-0 text-[11px]">Mark all read</Button>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                        {[
                          { icon: ShoppingCart, color: "text-blue-600", title: "New order from Acme Retail", ts: "2 min ago", unread: true },
                          { icon: AlertTriangle, color: "text-amber-600", title: "Stock for Sunflower 1L low", ts: "15 min ago", unread: true },
                          { icon: CheckCircle2, color: "text-emerald-600", title: "Order #QWI-…-8F3K92 delivered", ts: "1 hr ago", unread: true },
                          { icon: UserIcon, color: "text-purple-600", title: "Rajesh Kumar registered", ts: "Yesterday", unread: false },
                        ].map((n, i) => (
                          <div key={i} className={"px-3 py-2 flex gap-3 hover:bg-gray-50 " + (n.unread ? "bg-blue-50/40" : "")}>
                            <div className={"h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 " + n.color}>
                              <n.icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-900 leading-snug">{n.title}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{n.ts}</p>
                            </div>
                            {n.unread && <span className="h-2 w-2 rounded-full bg-blue-600 mt-1" />}
                          </div>
                        ))}
                      </div>
                      <div className="px-3 py-2 border-t border-gray-200 text-center">
                        <Button variant="link" size="sm" className="h-auto text-xs">View all</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Patterns — KPI Tiles ===== */}
            <Section
              id="kpi-tiles"
              title="KPI Tiles"
              description="The dashboard hero. Each tile: small caption · big number · delta or context. Group in rows of 3 or 4. Keep them stable in count and order — the layout itself is meaningful."
            >
              <PreviewBox>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Orders this month", value: "247", delta: "+18%", deltaColor: "text-emerald-600", icon: ShoppingCart, iconColor: "text-blue-600" },
                    { label: "Revenue", value: "₹4.8L", delta: "+9.2%", deltaColor: "text-emerald-600", icon: TrendingUp, iconColor: "text-emerald-600" },
                    { label: "Avg order value", value: "₹1,945", delta: "−3.1%", deltaColor: "text-red-600", icon: CreditCard, iconColor: "text-amber-600" },
                    { label: "Active customers", value: "312", delta: "+24", deltaColor: "text-emerald-600", icon: Users, iconColor: "text-fuchsia-600" },
                  ].map((k) => (
                    <Card key={k.label} className="shadow-sm">
                      <CardContent className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] uppercase font-semibold text-gray-500 tracking-wider">{k.label}</p>
                          <k.icon className={"h-4 w-4 " + k.iconColor} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                        <p className={"text-xs font-medium " + k.deltaColor}>{k.delta} <span className="text-gray-500 font-normal">vs last month</span></p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Patterns — Activity Timeline ===== */}
            <Section
              id="timeline"
              title="Activity Timeline"
              description="A vertical log of events on an entity (order, customer, SKU). Each event has an icon, title, optional body, and timestamp. Newest first."
            >
              <PreviewBox>
                <ol className="relative border-l-2 border-gray-200 pl-6 space-y-4">
                  {[
                    { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", title: "Marked Delivered", body: "by Rajesh Kumar", ts: "2026-03-30, 18:42" },
                    { icon: Truck, color: "bg-blue-100 text-blue-700", title: "Out for delivery", ts: "2026-03-30, 09:15" },
                    { icon: Package, color: "bg-purple-100 text-purple-700", title: "Packed", body: "All 6 items packed", ts: "2026-03-29, 17:05" },
                    { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", title: "Confirmed", body: "by Rajesh Kumar", ts: "2026-03-29, 12:30" },
                    { icon: Plus, color: "bg-gray-100 text-gray-700", title: "Order placed", ts: "2026-03-29, 11:12" },
                  ].map((e, i) => (
                    <li key={i} className="relative">
                      <span className={"absolute -left-9 top-0 h-6 w-6 rounded-full flex items-center justify-center " + e.color}>
                        <e.icon className="h-3 w-3" />
                      </span>
                      <p className="text-sm font-semibold text-gray-900">{e.title}</p>
                      {e.body && <p className="text-xs text-gray-600 mt-0.5">{e.body}</p>}
                      <p className="text-[11px] text-gray-500 mt-1 font-mono">{e.ts}</p>
                    </li>
                  ))}
                </ol>
              </PreviewBox>
            </Section>

            {/* ===== Patterns — Upload Pattern ===== */}
            <Section
              id="upload-pattern"
              title="Upload Pattern"
              description="Bulk import is a two-step pattern: 1) drop the file, 2) review parsed rows with errors highlighted before committing. Always make the template available."
            >
              <PreviewBox>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Bulk import SKUs</p>
                    <Button variant="link" size="sm" className="h-auto px-0 text-xs"><Download className="h-3.5 w-3.5" /> Download template</Button>
                  </div>
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-fuchsia-300 hover:bg-fuchsia-50/30 transition-all">
                    <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Drop CSV / XLSX here</p>
                    <p className="text-[11px] text-gray-500 mt-1">Max 5 MB · up to 5,000 rows</p>
                  </label>
                  <div className="rounded-md border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-900">42 rows parsed</span>
                      <span><span className="text-emerald-700">38 valid</span> · <span className="text-red-700">4 errors</span></span>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Row</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Issue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-red-50/40">
                          <TableCell className="font-mono">7</TableCell>
                          <TableCell className="font-mono text-[11px]">180000-X</TableCell>
                          <TableCell className="text-red-700">SKU code must be numeric</TableCell>
                        </TableRow>
                        <TableRow className="bg-red-50/40">
                          <TableCell className="font-mono">12</TableCell>
                          <TableCell className="font-mono text-[11px]">180000034</TableCell>
                          <TableCell className="text-red-700">Missing Measure Unit</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">Cancel</Button>
                    <Button size="sm" disabled>Import 38 valid rows</Button>
                  </div>
                </div>
              </PreviewBox>
            </Section>

            {/* ===== Screens ===== */}
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
