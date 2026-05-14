import { useEffect, useLayoutEffect, useState } from "react";
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
  Moon,
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
  Sun,
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
import { ListPagination } from "../components/ui/list-pagination";
import { EmptyState } from "../components/empty-state";
import { CopyOnHover } from "../components/copy-on-hover";
import { motion, AnimatePresence } from "motion/react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";

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
      { id: "dark-mode", title: "Dark Mode", icon: Moon },
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
      { id: "charts", title: "Charts & Infographics", icon: TrendingUp },
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

// Semantic CSS variables that drive the whole theme. Defined in
// src/styles/theme.css under :root (light) and .dark (dark).
const SEMANTIC_TOKENS: {
  name: string;
  light: string;
  dark: string;
  usage: string;
}[] = [
  { name: "--background", light: "#FFFFFF", dark: "#1F1F1F", usage: "Page background" },
  { name: "--foreground", light: "#0F0F0F", dark: "#FAFAFA", usage: "Default body text" },
  { name: "--card", light: "#FFFFFF", dark: "#1F1F1F", usage: "Card surface" },
  { name: "--card-foreground", light: "#0F0F0F", dark: "#FAFAFA", usage: "Text on cards" },
  { name: "--popover", light: "#FFFFFF", dark: "#1F1F1F", usage: "Popover / Dropdown surface" },
  { name: "--primary", light: "#2563EB", dark: "#FAFAFA", usage: "Primary CTA fill" },
  { name: "--primary-foreground", light: "#FFFFFF", dark: "#2A2A2A", usage: "Text on primary fill" },
  { name: "--muted", light: "#ECECF0", dark: "#3B3B3B", usage: "Disabled / subtle surface" },
  { name: "--muted-foreground", light: "#717182", dark: "#A6A6A6", usage: "Secondary / placeholder text" },
  { name: "--destructive", light: "#D4183D", dark: "#7F1D1D", usage: "Destructive fill (Delete)" },
  { name: "--border", light: "rgba(0,0,0,.10)", dark: "#3B3B3B", usage: "Divider / outline" },
  { name: "--input", light: "transparent", dark: "#3B3B3B", usage: "Input field background ring" },
  { name: "--ring", light: "#2563EB", dark: "#6A6A6A", usage: "Focus ring" },
];

// Tailwind utility classes that get automatic dark-mode overrides via
// .dark .<utility> selectors in theme.css. Developers don't need to
// write dark:bg-* — these flip automatically when the theme switches.
const UTILITY_FLIPS: {
  utility: string;
  light: string;
  dark: string;
}[] = [
  { utility: "bg-white", light: "#FFFFFF", dark: "#343434" },
  { utility: "bg-gray-50", light: "#F9FAFB", dark: "#2E2E2E" },
  { utility: "bg-gray-100", light: "#F3F4F6", dark: "#3F3F3F" },
  { utility: "bg-gray-200", light: "#E5E7EB", dark: "#494949" },
  { utility: "text-gray-900", light: "#111827", dark: "#F5F5F5" },
  { utility: "text-gray-700", light: "#374151", dark: "#D4D4D4" },
  { utility: "text-gray-600", light: "#4B5563", dark: "#BABABA" },
  { utility: "text-gray-500", light: "#6B7280", dark: "#A2A2A2" },
  { utility: "border-gray-200", light: "#E5E7EB", dark: "#4E4E4E" },
  { utility: "border-gray-300", light: "#D1D5DB", dark: "#575757" },
  { utility: "bg-blue-50", light: "#EFF6FF", dark: "rgba(67,127,234,.18)" },
  { utility: "bg-emerald-50", light: "#ECFDF5", dark: "rgba(60,167,127,.18)" },
  { utility: "bg-amber-50", light: "#FFFBEB", dark: "rgba(195,144,46,.18)" },
  { utility: "bg-red-50", light: "#FEF2F2", dark: "rgba(180,72,72,.18)" },
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

// ---- Chart data (seeded for the dashboard / analytics patterns) -

const CHART_PALETTE = [
  "#2563EB", // Blue 600 — primary
  "#16A34A", // Green 600 — success
  "#D97706", // Amber 600 — warning
  "#DC2626", // Red 600 — danger
  "#9333EA", // Purple 600 — accent
  "#0891B2", // Cyan 600
  "#C026D3", // Fuchsia 600
  "#4F46E5", // Indigo 600
];

const CHART_SALES_TREND = [
  { day: "Mon", orders: 24 },
  { day: "Tue", orders: 32 },
  { day: "Wed", orders: 28 },
  { day: "Thu", orders: 45 },
  { day: "Fri", orders: 52 },
  { day: "Sat", orders: 38 },
  { day: "Sun", orders: 30 },
];

const CHART_MULTI_TREND = [
  { day: "Mon", new: 12, confirmed: 8, cancelled: 1 },
  { day: "Tue", new: 14, confirmed: 12, cancelled: 2 },
  { day: "Wed", new: 11, confirmed: 14, cancelled: 1 },
  { day: "Thu", new: 18, confirmed: 17, cancelled: 3 },
  { day: "Fri", new: 22, confirmed: 20, cancelled: 2 },
  { day: "Sat", new: 16, confirmed: 18, cancelled: 1 },
  { day: "Sun", new: 14, confirmed: 12, cancelled: 1 },
];

const CHART_REVENUE_BY_CATEGORY = [
  { category: "Oil & Ghee", revenue: 4.8 },
  { category: "Atta", revenue: 3.2 },
  { category: "Snacks", revenue: 2.6 },
  { category: "Dairy", revenue: 2.1 },
  { category: "Beverages", revenue: 1.7 },
  { category: "Personal Care", revenue: 1.2 },
];

const CHART_STATUS_BY_WEEK = [
  { week: "W1", confirmed: 18, delivered: 14, cancelled: 2 },
  { week: "W2", confirmed: 22, delivered: 17, cancelled: 3 },
  { week: "W3", confirmed: 26, delivered: 21, cancelled: 1 },
  { week: "W4", confirmed: 30, delivered: 24, cancelled: 4 },
];

const CHART_MARKETPLACE_SPLIT = [
  { name: "ONDC", value: 58 },
  { name: "Amazon", value: 21 },
  { name: "Flipkart", value: 14 },
  { name: "Direct", value: 7 },
];

const CHART_ORDER_STATUS_SPLIT = [
  { name: "Delivered", value: 47 },
  { name: "Confirmed", value: 32 },
  { name: "New", value: 12 },
  { name: "Cancelled", value: 9 },
];

const CHART_RADIAL_KPIS = [
  { label: "ONDC Compliance", value: 78, color: "#16A34A" },
  { label: "On-Time Dispatch", value: 92, color: "#2563EB" },
  { label: "Warehouse Capacity", value: 64, color: "#D97706" },
];

const CHART_SPARKLINES = [
  {
    label: "Orders (7d)",
    value: "247",
    color: "#2563EB",
    data: [24, 32, 28, 45, 52, 38, 30].map((v, i) => ({ i, v })),
  },
  {
    label: "Revenue (7d)",
    value: "₹4.8L",
    color: "#16A34A",
    data: [62, 71, 65, 78, 82, 75, 70].map((v, i) => ({ i, v })),
  },
  {
    label: "Cancellations",
    value: "9",
    color: "#DC2626",
    data: [3, 2, 1, 3, 2, 1, 1].map((v, i) => ({ i, v })),
  },
];

const CHART_COMPOSED = [
  { month: "Jan", revenue: 2.4, aov: 1620 },
  { month: "Feb", revenue: 2.8, aov: 1690 },
  { month: "Mar", revenue: 3.4, aov: 1755 },
  { month: "Apr", revenue: 3.9, aov: 1820 },
  { month: "May", revenue: 4.2, aov: 1880 },
  { month: "Jun", revenue: 4.8, aov: 1945 },
];

const CHART_PROGRESS_BARS = [
  { label: "Monthly revenue goal", value: 78, target: 100, color: "#2563EB" },
  { label: "ONDC compliant SKUs", value: 64, target: 100, color: "#16A34A" },
  { label: "Customer onboarding", value: 45, target: 100, color: "#D97706" },
  { label: "Cancellation rate (lower = better)", value: 12, target: 100, color: "#DC2626" },
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

// Locked theme preview — wraps content in a `.dark` ancestor so the
// utility-class overrides flip the children to dark colors, regardless
// of the page's current theme. The light variant renders normally.
// Note: this works reliably when the page itself is in light mode; if
// the page is already in dark mode, both panels look dark.
function ThemePreview({
  mode,
  children,
}: {
  mode: "light" | "dark";
  children: React.ReactNode;
}) {
  const body = (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <p className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 text-gray-500">
        {mode === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
        {mode === "dark" ? "Dark mode" : "Light mode"}
      </p>
      {children}
    </div>
  );
  return mode === "dark" ? <div className="dark">{body}</div> : body;
}

// ---- Main page ---------------------------------------------------

export function DesignSystem() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const { resolvedTheme, setTheme } = useTheme();
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
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [sheetDrawerOpen, setSheetDrawerOpen] = useState(false);
  const [paginationPage, setPaginationPage] = useState(2);

  // Land at the top of the handbook on mount unless the URL points
  // at a specific section (#anchor). Two safeguards run together:
  //   - flip history.scrollRestoration to "manual" so the browser
  //     stops re-applying the prior scroll position after React mounts
  //   - useLayoutEffect runs before paint so the initial scroll is set
  //     before the user sees anything; a follow-up scroll via rAF
  //     swats away any late layout shifts (lazy-loaded images, fonts).
  useLayoutEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    if (!window.location.hash) {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

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

  // Keep the sidebar's active item visible — when the user scrolls
  // far enough that the highlighted entry would fall off the nav's
  // viewport, slide the nav so the entry stays in view. We
  // manipulate `nav.scrollTop` directly (not scrollIntoView) so the
  // page itself never moves.
  useEffect(() => {
    const link = document.querySelector<HTMLAnchorElement>(
      `aside nav a[href="#${activeSection}"]`,
    );
    if (!link) return;
    const nav = link.closest("nav");
    if (!nav) return;
    const linkTop = link.offsetTop;
    const linkBottom = linkTop + link.offsetHeight;
    const navScrollTop = nav.scrollTop;
    const navHeight = nav.clientHeight;
    const navScrollBottom = navScrollTop + navHeight;
    // Add a small buffer so the active entry never hugs the edge.
    const buffer = 48;
    if (linkTop < navScrollTop + buffer) {
      nav.scrollTo({ top: linkTop - buffer, behavior: "smooth" });
    } else if (linkBottom > navScrollBottom - buffer) {
      nav.scrollTo({
        top: linkBottom - navHeight + buffer,
        behavior: "smooth",
      });
    }
  }, [activeSection]);

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

            {/* ===== Foundations — Dark Mode ===== */}
            <Section
              id="dark-mode"
              title="Dark Mode"
              description="The app ships with a fully-themed dark mode. Developers don't write dark: variants on every utility — the theme system flips them automatically. This section documents the mechanism, the tokens, and how each component reacts."
            >
              <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {resolvedTheme === "dark" ? (
                        <Moon className="h-5 w-5 text-fuchsia-600" />
                      ) : (
                        <Sun className="h-5 w-5 text-fuchsia-600" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Current theme: {resolvedTheme === "dark" ? "Dark" : "Light"}
                        </p>
                        <p className="text-[11px] text-gray-600">
                          Toggle the whole page to see every component flip.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setTheme(resolvedTheme === "dark" ? "light" : "dark")
                      }
                    >
                      {resolvedTheme === "dark" ? (
                        <>
                          <Sun className="h-4 w-4" />
                          Switch to Light
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4" />
                          Switch to Dark
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <SubHeader>How it works</SubHeader>
              <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5 leading-relaxed">
                <li>
                  <code className="font-mono text-fuchsia-700">next-themes</code>
                  {" "}toggles a <code className="font-mono text-fuchsia-700">.dark</code> class on the <code className="font-mono">&lt;html&gt;</code> element. Preference persists under{" "}
                  <code className="font-mono text-fuchsia-700">qwipo.theme</code> in localStorage.
                </li>
                <li>
                  Semantic CSS variables (<code className="font-mono text-fuchsia-700">--background</code>,
                  {" "}<code className="font-mono text-fuchsia-700">--foreground</code>,
                  {" "}<code className="font-mono text-fuchsia-700">--primary</code>, etc.) are redefined under the <code className="font-mono">.dark</code> selector in <code className="font-mono">src/styles/theme.css</code>.
                </li>
                <li>
                  Tailwind utility classes (<code className="font-mono text-fuchsia-700">bg-white</code>,
                  {" "}<code className="font-mono text-fuchsia-700">text-gray-900</code>,
                  {" "}<code className="font-mono text-fuchsia-700">border-gray-200</code>, etc.) have explicit dark overrides in the same stylesheet. You don't need <code className="font-mono">dark:bg-*</code> in component code — it flips for free.
                </li>
                <li>
                  Components that need theme-aware behavior in JS read <code className="font-mono text-fuchsia-700">resolvedTheme</code> from <code className="font-mono text-fuchsia-700">useTheme()</code> (see the logo swap in the top nav).
                </li>
              </ul>

              <SubHeader>Semantic Tokens (CSS Variables)</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold w-44">Token</th>
                      <th className="px-3 py-2 font-semibold w-16">Light</th>
                      <th className="px-3 py-2 font-semibold w-32 font-mono">Hex</th>
                      <th className="px-3 py-2 font-semibold w-16">Dark</th>
                      <th className="px-3 py-2 font-semibold w-32 font-mono">Hex</th>
                      <th className="px-3 py-2 font-semibold">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {SEMANTIC_TOKENS.map((t) => (
                      <tr key={t.name}>
                        <td className="px-3 py-2">
                          <code className="text-[11px] font-mono text-fuchsia-700">{t.name}</code>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className="inline-block h-5 w-5 rounded border border-gray-200"
                            style={{ background: t.light }}
                          />
                        </td>
                        <td className="px-3 py-2 text-[11px] font-mono text-gray-700">{t.light}</td>
                        <td className="px-3 py-2">
                          <span
                            className="inline-block h-5 w-5 rounded border border-gray-700"
                            style={{ background: t.dark }}
                          />
                        </td>
                        <td className="px-3 py-2 text-[11px] font-mono text-gray-700">{t.dark}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{t.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SubHeader>Utility-class Flips</SubHeader>
              <p className="text-xs text-gray-600 leading-relaxed -mt-1">
                These Tailwind utility classes have explicit dark-mode overrides. Write them once; both themes look right.
              </p>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold w-48">Utility</th>
                      <th className="px-3 py-2 font-semibold w-16">Light</th>
                      <th className="px-3 py-2 font-semibold w-40 font-mono">Hex</th>
                      <th className="px-3 py-2 font-semibold w-16">Dark</th>
                      <th className="px-3 py-2 font-semibold font-mono">Hex</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {UTILITY_FLIPS.map((u) => (
                      <tr key={u.utility}>
                        <td className="px-3 py-2">
                          <code className="text-[11px] font-mono text-fuchsia-700">{u.utility}</code>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className="inline-block h-5 w-5 rounded border border-gray-200"
                            style={{ background: u.light }}
                          />
                        </td>
                        <td className="px-3 py-2 text-[11px] font-mono text-gray-700">{u.light}</td>
                        <td className="px-3 py-2">
                          <span
                            className="inline-block h-5 w-5 rounded border border-gray-700"
                            style={{ background: u.dark }}
                          />
                        </td>
                        <td className="px-3 py-2 text-[11px] font-mono text-gray-700">{u.dark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SubHeader>Side-by-side Component Preview</SubHeader>
              <p className="text-xs text-gray-600 leading-relaxed -mt-1">
                Same markup, two themes. This is what each primitive looks like to a developer who never wrote a single <code className="font-mono text-fuchsia-700">dark:</code> class.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {(["light", "dark"] as const).map((mode) => (
                  <ThemePreview key={mode} mode={mode}>
                    {/* text-gray-900 on the wrapper is intentional — it
                        has an explicit `.dark .text-gray-900` override,
                        so every inherited text (Label, plain <label>,
                        Ghost button, "Checked"/"On" copy) flips
                        cleanly inside the .dark scope. */}
                    <div className="space-y-3 text-gray-900">
                      <p className="text-xl font-semibold text-gray-900">Heading</p>
                      <p className="text-sm text-gray-700">
                        Body copy reads on a card surface. Secondary text sits in <span className="text-gray-500">gray-500</span>.
                      </p>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-700">Mobile</Label>
                        <Input placeholder="10-digit number" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm">Primary</Button>
                        <Button size="sm" variant="outline">Outline</Button>
                        <Button size="sm" variant="ghost" className="text-gray-700">Ghost</Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200">Scheduled</Badge>
                        <Badge className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">QPS</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-700">
                        <label className="flex items-center gap-2">
                          <Checkbox defaultChecked /> Checked
                        </label>
                        <label className="flex items-center gap-2">
                          <Switch defaultChecked /> On
                        </label>
                      </div>
                      <div className="rounded-md border border-blue-200 bg-blue-50 p-2.5 flex gap-2 text-blue-900 text-xs">
                        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>Inline banner — auto-tinted for the active theme.</span>
                      </div>
                    </div>
                  </ThemePreview>
                ))}
              </div>

              <SubHeader>Toast notifications across themes</SubHeader>
              <p className="text-xs text-gray-600 leading-relaxed -mt-1">
                Sonner toasts render in a portal at the document root, so they always pick up the global page theme — toggle the page above to see live toasts flip. The static mocks below show what each variant looks like in each mode.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {(["light", "dark"] as const).map((mode) => (
                  <ThemePreview key={mode} mode={mode}>
                    <div className="space-y-2 text-gray-900">
                      {[
                        { tone: "success", title: "Order confirmed", body: "QWI-ONDC-260330-8F3K92", icon: CheckCircle2, ring: "ring-emerald-500/30", iconColor: "text-emerald-600" },
                        { tone: "error", title: "Could not save", body: "Network timeout — please retry.", icon: AlertCircle, ring: "ring-red-500/30", iconColor: "text-red-600" },
                        { tone: "warning", title: "Stock running low", body: "Sunflower 1L · 3 units left.", icon: AlertTriangle, ring: "ring-amber-500/30", iconColor: "text-amber-600" },
                        { tone: "info", title: "Sync scheduled", body: "Next catalog sync at 02:00.", icon: Info, ring: "ring-blue-500/30", iconColor: "text-blue-600" },
                      ].map((t) => (
                        <div
                          key={t.tone}
                          className={`rounded-md border border-gray-200 bg-white shadow-sm px-3 py-2.5 flex items-start gap-2.5 ring-1 ${t.ring}`}
                        >
                          <t.icon className={`h-4 w-4 shrink-0 mt-0.5 ${t.iconColor}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{t.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 leading-snug">{t.body}</p>
                          </div>
                          <button className="text-gray-400 hover:text-gray-700 shrink-0">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </ThemePreview>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" onClick={() => toast.success("Order confirmed", { description: "QWI-ONDC-260330-8F3K92" })}>
                  Trigger success
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.error("Could not save", { description: "Network timeout — please retry." })}>
                  Trigger error
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.warning("Stock running low", { description: "Sunflower 1L · 3 units left." })}>
                  Trigger warning
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Sync scheduled", { description: "Next catalog sync at 02:00." })}>
                  Trigger info
                </Button>
              </div>

              <SubHeader>Status tints across themes</SubHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {(["light", "dark"] as const).map((mode) => (
                  <ThemePreview key={mode} mode={mode}>
                    <div className="space-y-2">
                      {[
                        { tone: "Info", bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-200", icon: Info },
                        { tone: "Success", bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-200", icon: CheckCircle2 },
                        { tone: "Warning", bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200", icon: AlertTriangle },
                        { tone: "Danger", bg: "bg-red-50", text: "text-red-900", border: "border-red-200", icon: AlertCircle },
                      ].map((s) => (
                        <div
                          key={s.tone}
                          className={`rounded-md border ${s.border} ${s.bg} p-2.5 flex items-center gap-2 ${s.text} text-xs`}
                        >
                          <s.icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="font-semibold">{s.tone}</span>
                          <span className="opacity-80">— status tint reads on both surfaces.</span>
                        </div>
                      ))}
                    </div>
                  </ThemePreview>
                ))}
              </div>

              <SubHeader>Rules of thumb</SubHeader>
              <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5 leading-relaxed">
                <li>Reach for documented utilities — they flip for free. If you find yourself writing arbitrary hex, add it to the override table in <code className="font-mono text-fuchsia-700">theme.css</code> instead.</li>
                <li>For brand colors that should NOT flip (e.g. an always-blue logo), use the raw hex and skip dark overrides.</li>
                <li>Test every new screen in both modes before shipping. The global toggle lives in the top nav.</li>
                <li>Status tints stay tinted in dark mode — green still reads green, red still reads red — so the semantic meaning survives the theme flip.</li>
              </ul>
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
                    <Label className="text-xs">Search (with leading icon + clear-X)</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-10 pr-10"
                        placeholder="Search by order ID, retailer name…"
                        defaultValue="Freedom"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Production search inputs always carry the inline clear-X when there's a value.
                    </p>
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
              description="Action menu anchored to a trigger. Production uses three patterns: an avatar-led user menu in the top nav (root-layout.tsx), a split CTA menu like Bulk Import on My SKU (gap-2 + ChevronDown / MoreVertical inside the primary button), and a small overflow ⋯ on row-level actions. Destructive items use text-red-600."
            >
              <SubHeader>User profile menu (top nav)</SubHeader>
              <PreviewBox>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                        VM
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-medium text-gray-900">Vikas Mittapalli</p>
                        <p className="text-xs text-gray-600">Seller · Acme Distributors</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-600 hidden lg:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium">Vikas Mittapalli</p>
                        <p className="text-xs font-normal text-gray-600">Seller · Acme Distributors</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserIcon className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </PreviewBox>

              <SubHeader>Split CTA menu (My SKU "Bulk Import" pattern)</SubHeader>
              <PreviewBox>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Bulk Import
                      <MoreHorizontal className="h-3.5 w-3.5 opacity-80" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Plus className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Add New SKUs</p>
                        <p className="text-[11px] text-gray-500">Upload the full SKU template (all fields)</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Update Price &amp; Stock</p>
                        <p className="text-[11px] text-gray-500">Download existing → edit offline → re-upload</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </PreviewBox>

              <SubHeader>Row-level overflow + view options (kept for reference)</SubHeader>
              <PreviewBox>
                <div className="flex flex-wrap gap-3">
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        View options
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>View</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem checked>Show sidebar</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>Compact rows</DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value="list">
                        <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <UserIcon className="h-4 w-4" /> Profile
                        <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                      </DropdownMenuItem>
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
              description="A modal for focused tasks (Create / Edit forms, multi-field flows, status changes that need extra inputs). Production dialogs use max-w-lg, a Title that PAIRS a status-tinted icon with the verb (CheckCircle2 + Confirm Orders, XCircle + Cancel Orders, PackageCheck + Mark as Delivered), and a Description carrying any count or context. The footer keeps the dismiss verb on the left and the action verb — coloured to match the icon — on the right."
            >
              <PreviewBox>
                <div className="flex flex-wrap gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm Orders
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Confirm Orders
                        </DialogTitle>
                        <DialogDescription>
                          Confirm 3 order(s). Please provide dispatch details.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>
                            Estimated Dispatch Date <span className="text-red-500">*</span>
                          </Label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label>
                            Estimated Dispatch Time <span className="text-red-500">*</span>
                          </Label>
                          <Input type="time" />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes (Optional)</Label>
                          <Textarea rows={3} placeholder="Add any special instructions or notes…" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button className="gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Confirm Orders
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <XCircle className="h-4 w-4" />
                        Cancel Orders
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          Cancel Orders
                        </DialogTitle>
                        <DialogDescription>
                          Cancel 3 order(s). Please provide a reason for cancellation.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>
                            Reason for Cancellation <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            rows={4}
                            placeholder="e.g., Out of stock, Cannot deliver to location, Customer request…"
                          />
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-sm text-amber-800">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            Cancelled orders will be notified to the customer and cannot be undone.
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive" className="gap-2">
                          <XCircle className="h-4 w-4" />
                          Cancel 3 Order(s)
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export Orders
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Download className="h-5 w-5 text-blue-600" />
                          Export Orders
                        </DialogTitle>
                        <DialogDescription>
                          Pick a date range up to 31 days. Output is a CSV with 23 columns.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-3 py-4">
                        <div className="space-y-2">
                          <Label>Start date</Label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label>End date</Label>
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
              <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5 leading-relaxed">
                <li><span className="font-semibold">Title</span> always wraps an icon in a status-tinted color (<code className="text-fuchsia-700 font-mono">text-green-600</code> for success, <code className="text-fuchsia-700 font-mono">text-red-600</code> for destructive, <code className="text-fuchsia-700 font-mono">text-blue-600</code> for neutral).</li>
                <li><span className="font-semibold">Width</span> defaults to <code className="text-fuchsia-700 font-mono">max-w-lg</code> for most flows.</li>
                <li><span className="font-semibold">Destructive warnings</span> live inside the body in an amber-50 alert box, never as a separate banner above the title.</li>
                <li><span className="font-semibold">Footer</span> primary action mirrors the title verb + icon and disables until required fields are filled.</li>
              </ul>
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
              title="Side Drawer (filter / detail panel)"
              description="Production list pages do NOT use the bare shadcn Sheet primitive for filter drawers — they use a 96-wide motion.div panel anchored to the right with a black/50 backdrop, a header carrying the title + X close, and a sticky footer with Clear Filters + Apply (both flex-1). The shadcn Sheet primitive is still available for left-side navigation drawers and the mobile menu — see root-layout.tsx."
            >
              <SubHeader>Production filter drawer (motion.div, w-96, right)</SubHeader>
              <PreviewBox>
                <div className="space-y-2">
                  <Button onClick={() => setSheetDrawerOpen(true)} variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Open production drawer
                  </Button>
                  <p className="text-[11px] text-gray-500">
                    Identical to the OffersFilterDrawer / customers-demo / inventory drawer used across every list page.
                  </p>
                </div>
              </PreviewBox>

              <AnimatePresence>
                {sheetDrawerOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 bg-black/50 z-40"
                      onClick={() => setSheetDrawerOpen(false)}
                    />
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col"
                    >
                      <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                        <button
                          onClick={() => setSheetDrawerOpen(false)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Close filters"
                        >
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Status
                            </Label>
                            <Select defaultValue="all">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Marketplace
                            </Label>
                            <Select defaultValue="all">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Marketplaces</SelectItem>
                                <SelectItem value="ondc">ONDC</SelectItem>
                                <SelectItem value="amazon">Amazon</SelectItem>
                                <SelectItem value="flipkart">Flipkart</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 p-6 flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setSheetDrawerOpen(false)}
                          className="flex-1"
                        >
                          Clear Filters
                        </Button>
                        <Button
                          onClick={() => setSheetDrawerOpen(false)}
                          className="flex-1"
                        >
                          Apply
                        </Button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <SubHeader>Left-side navigation Sheet (mobile menu)</SubHeader>
              <PreviewBox>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Menu className="h-4 w-4" />
                      Open menu
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Navigation</SheetTitle>
                      <SheetDescription>Jump to a section.</SheetDescription>
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
                <p className="text-[11px] text-gray-500 mt-2">
                  The shadcn Sheet primitive is reserved for the responsive mobile-nav drawer (see <code className="text-fuchsia-700 font-mono">root-layout.tsx</code>). For filter drawers, use the motion.div pattern above.
                </p>
              </PreviewBox>
            </Section>

            {/* ===== Overlays — Drawer ===== */}
            <Section
              id="drawer"
              title="Drawer (bottom)"
              description="Bottom-anchored sheet, mobile-first. Backed by vaul. NOT currently used anywhere in the live Qwipo app — every drawer in production is the right-side motion.div panel above. Demo retained for completeness; reach for it if you genuinely need an iOS-style pull-up tray, otherwise prefer the side drawer pattern."
            >
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 flex gap-2 text-amber-900 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold">Not in production use.</span>{" "}
                  No page in the live app uses the vaul-backed Drawer. The
                  demo below shows the primitive in case you need it; before
                  adding one to a new flow, check whether the right-side
                  filter / detail drawer would fit instead.
                </span>
              </div>
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
              description="Every list page in production uses the shared ListPagination component — a sticky footer carrying a 'Showing N–M of T items' caption on the left and a Previous / Next pair with a 'Page X of Y' pill on the right. It always renders (even with a single page) so each list page has the same visual shape."
            >
              <SubHeader>ListPagination (production component)</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <ListPagination
                  page={paginationPage}
                  total={247}
                  pageSize={10}
                  onPageChange={setPaginationPage}
                  itemLabel="order"
                />
              </div>

              <SubHeader>Single page (Previous / Next disabled)</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <ListPagination
                  page={1}
                  total={7}
                  pageSize={10}
                  onPageChange={() => {}}
                  itemLabel="customer"
                />
              </div>

              <SubHeader>shadcn Pagination primitive (reference only)</SubHeader>
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
              <p className="text-xs text-gray-600 leading-relaxed">
                Production reaches for <code className="text-fuchsia-700 font-mono">{`<ListPagination />`}</code> on every list page — never the bare shadcn primitive. The shadcn version is kept here purely as an inventory reference.
              </p>
            </Section>

            {/* ===== Data Display — Tables ===== */}
            <Section
              id="tables"
              title="Tables"
              description="Production list pages (Orders, Customers, My SKU, Offers) render a plain HTML <table> with thead.bg-gray-50 + sticky top-0 + uppercase text-xs font-semibold headers, and tbody.divide-y for row borders. Numerics right-aligned. Status uses Badge. Hover-reveal a CopyOnHover icon next to identity-carrying cells (Business Name, Mobile, SKU)."
            >
              <SubHeader>Production table (native HTML)</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 w-10">
                          <Checkbox />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          SKU
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Name
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Price
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { sku: "180000008", name: "Freedom Sunflower 1L × 16", stock: 480, price: "₹125", status: "Active" },
                        { sku: "180000009", name: "Aashirvaad Atta 5KG", stock: 120, price: "₹420", status: "Active" },
                        { sku: "180000010", name: "Maggi Masala Noodles 70g × 12", stock: 0, price: "₹158", status: "Out of stock" },
                      ].map((r) => (
                        <tr key={r.sku} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3"><Checkbox /></td>
                          <td className="px-4 py-3">
                            <CopyOnHover value={r.sku} label="SKU">
                              <span className="font-mono text-xs text-gray-700">{r.sku}</span>
                            </CopyOnHover>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                          <td className="px-4 py-3 text-right font-mono text-sm">{r.stock}</td>
                          <td className="px-4 py-3 text-right font-mono text-sm">{r.price}</td>
                          <td className="px-4 py-3 text-center">
                            {r.status === "Active" ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                            ) : (
                              <Badge className="bg-orange-50 text-orange-700 border-orange-200">Out of stock</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <SubHeader>shadcn Table primitive (reference)</SubHeader>
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
                    ].map((r) => (
                      <TableRow key={r.sku}>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell className="font-mono text-[11px]">{r.sku}</TableCell>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-right font-mono">{r.stock}</TableCell>
                        <TableCell className="text-right font-mono">{r.price}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </PreviewBox>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold">Pick the native HTML pattern</span> for any new list page that uses sticky headers, CopyOnHover identity cells, or row-level click navigation. The shadcn Table primitive is fine for dense settings-style tables or embedded breakdowns.
              </p>
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

            {/* ===== Patterns — Charts & Infographics ===== */}
            <Section
              id="charts"
              title="Charts & Infographics"
              description="recharts (v2) is the canonical charting library — already used on the Reports pages. Use these patterns when wiring dashboards or analytics panels. Colors come from the brand palette so charts read consistently with the rest of the UI."
            >
              <SubHeader>Line chart — single metric over time</SubHeader>
              <PreviewBox>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={CHART_SALES_TREND} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: "#2563EB" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  <span className="font-semibold">Use:</span> daily / weekly trend on a dashboard tile. One color per metric. Limit to ≤ 30 data points before it gets noisy — fall back to a Bar chart for longer ranges.
                </p>
              </PreviewBox>

              <SubHeader>Multi-series line — comparing metrics</SubHeader>
              <PreviewBox>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={CHART_MULTI_TREND} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <RechartsTooltip />
                      <RechartsLegend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="new" stroke="#2563EB" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="confirmed" stroke="#16A34A" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="cancelled" stroke="#DC2626" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  <span className="font-semibold">Use:</span> orders-by-status, revenue-vs-cost, year-over-year compares. Cap at 4 series — past that, switch to small multiples.
                </p>
              </PreviewBox>

              <SubHeader>Bar chart — categorical breakdown</SubHeader>
              <PreviewBox>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHART_REVENUE_BY_CATEGORY} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <RechartsTooltip cursor={{ fill: "rgba(37,99,235,0.06)" }} />
                      <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  <span className="font-semibold">Use:</span> revenue by category, units sold by brand, leaderboard tiles. Sort descending unless the x-axis is naturally ordered (days, months).
                </p>
              </PreviewBox>

              <SubHeader>Stacked bar — composition over time</SubHeader>
              <PreviewBox>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHART_STATUS_BY_WEEK} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <RechartsTooltip />
                      <RechartsLegend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="confirmed" stackId="s" fill="#16A34A" />
                      <Bar dataKey="delivered" stackId="s" fill="#2563EB" />
                      <Bar dataKey="cancelled" stackId="s" fill="#DC2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  <span className="font-semibold">Use:</span> when each bar's total matters AND the composition matters. Keep stacks to ≤ 4 segments — beyond that, a normalised area chart reads better.
                </p>
              </PreviewBox>

              <SubHeader>Area chart — cumulative volume</SubHeader>
              <PreviewBox>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_SALES_TREND} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dsAreaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity={0.32} />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={2} fill="url(#dsAreaFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  <span className="font-semibold">Use:</span> emphasising "how much" rather than "how it changes". A line chart is almost always lighter-weight; reach for area only when the filled magnitude carries meaning.
                </p>
              </PreviewBox>

              <SubHeader>Pie & Donut — part-of-whole</SubHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <PreviewBox>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Pie</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={CHART_MARKETPLACE_SPLIT} dataKey="value" nameKey="name" outerRadius={80} label={{ fontSize: 11 }}>
                          {CHART_MARKETPLACE_SPLIT.map((entry, i) => (
                            <Cell key={entry.name} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <RechartsLegend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </PreviewBox>
                <PreviewBox>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Donut</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={CHART_ORDER_STATUS_SPLIT} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                          {CHART_ORDER_STATUS_SPLIT.map((entry, i) => (
                            <Cell key={entry.name} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <RechartsLegend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </PreviewBox>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed -mt-1">
                <span className="font-semibold">Use:</span> 3–5 slices, one "is meaningfully bigger than the rest" story. For 6+ categories, a horizontal bar reads better. Donuts add headroom for a centered KPI value if the surface is large enough.
              </p>

              <SubHeader>Radial bar — single-value progress</SubHeader>
              <PreviewBox>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CHART_RADIAL_KPIS.map((kpi) => (
                    <div key={kpi.label} className="flex items-center gap-3">
                      <div className="h-24 w-24 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" data={[kpi]} startAngle={90} endAngle={-270}>
                            <RadialBar dataKey="value" cornerRadius={6} fill={kpi.color} background={{ fill: "#F3F4F6" }} />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 leading-none">{kpi.value}%</p>
                        <p className="text-[11px] text-gray-600 mt-1.5">{kpi.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
                  <span className="font-semibold">Use:</span> KPI tiles where the value is a percentage with a clear ceiling (compliance, fulfilment, capacity). Pair with the raw value so the seller doesn't have to do mental math.
                </p>
              </PreviewBox>

              <SubHeader>Sparkline — trend in a tile</SubHeader>
              <PreviewBox>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CHART_SPARKLINES.map((sp) => (
                    <Card key={sp.label} className="shadow-sm">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">{sp.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{sp.value}</p>
                        <div className="h-10 -mx-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sp.data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                              <Line type="monotone" dataKey="v" stroke={sp.color} strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  <span className="font-semibold">Use:</span> KPI tile that needs a "shape of the last N points" cue without crowding the value. Strip the axes, dots, grid, and tooltip — sparklines are decoration.
                </p>
              </PreviewBox>

              <SubHeader>Composed — bar + line combo</SubHeader>
              <PreviewBox>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={CHART_COMPOSED} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <RechartsTooltip />
                      <RechartsLegend wrapperStyle={{ fontSize: 11 }} />
                      <Bar yAxisId="left" dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="aov" stroke="#9333EA" strokeWidth={2} dot={{ r: 3, fill: "#9333EA" }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                  <span className="font-semibold">Use:</span> two metrics that share an x-axis but live on different scales (e.g. revenue ₹ on left, average order value ₹ on right). Use a dual axis or normalised values — never a single axis with mismatched magnitudes.
                </p>
              </PreviewBox>

              <SubHeader>Progress bars — inline metric reveal</SubHeader>
              <PreviewBox>
                <div className="space-y-3 max-w-md">
                  {CHART_PROGRESS_BARS.map((row) => (
                    <div key={row.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">{row.label}</span>
                        <span className="font-mono text-gray-700">{row.value}% <span className="text-gray-400">/ {row.target}%</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, (row.value / row.target) * 100)}%`, background: row.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-600 mt-3 leading-relaxed">
                  <span className="font-semibold">Use:</span> goal-vs-actual cards, multi-metric leaderboards, completion checklists. Color-code by tone (success / warning / danger) when goal-distance is meaningful.
                </p>
              </PreviewBox>

              <SubHeader>Recipe & rules of thumb</SubHeader>
              <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5 leading-relaxed">
                <li>Use the brand palette (<code className="font-mono text-fuchsia-700">CHART_PALETTE</code> in this file) — Blue, Emerald, Amber, Red, Purple, Cyan, Fuchsia, Indigo. Don't introduce new chart colors per page.</li>
                <li>Axes / grid in <code className="font-mono text-fuchsia-700">gray-200</code> (<code className="font-mono">#E5E7EB</code>); axis labels in <code className="font-mono text-fuchsia-700">gray-500</code> (<code className="font-mono">#6B7280</code>) at <code className="font-mono">11px</code>.</li>
                <li>Always wrap recharts in <code className="font-mono text-fuchsia-700">&lt;ResponsiveContainer&gt;</code> with a parent height — recharts won't render without one.</li>
                <li>Default to <code className="font-mono text-fuchsia-700">type="monotone"</code> for smooth lines and <code className="font-mono text-fuchsia-700">radius=&#123;[4, 4, 0, 0]&#125;</code> for soft-cap bars.</li>
                <li>For dashboards combine: top-row KPI tiles → mid-row 1–2 trend charts → bottom-row breakdown (bar / donut). Avoid wall-of-charts.</li>
              </ul>
            </Section>

            {/* ===== Patterns — Filters & Search ===== */}
            <Section
              id="filters"
              title="Filters & Search"
              description="Production pattern: free-text search lives in the page toolbar (with a leading Search icon and an inline clear-X), and a single Filters button opens a right-side drawer carrying every secondary filter. Inside the drawer, section labels stack vertically and Clear Filters + Apply pin to the bottom as flex-1 split buttons."
            >
              <SubHeader>Toolbar (search left, Filters + Export right)</SubHeader>
              <PreviewBox>
                <div className="flex items-center justify-between gap-4">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10 pr-10"
                      placeholder="Search by order ID, retailer name..."
                      defaultValue=""
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFiltersDrawerOpen(true)}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </PreviewBox>

              <SubHeader>Right-side Filters drawer (w-96, motion-animated)</SubHeader>
              <PreviewBox>
                <div className="space-y-2">
                  <Button onClick={() => setFiltersDrawerOpen(true)} variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Open Filters drawer
                  </Button>
                  <p className="text-[11px] text-gray-500">
                    96-wide motion.div · backdrop bg-black/50 · header "Filters" + X · sticky footer with Clear Filters + Apply (both flex-1).
                  </p>
                </div>
              </PreviewBox>

              {/* Shared filter drawer rendered once. Mirrors the
                  production OffersFilterDrawer / customers-demo /
                  inventory drawer pattern 1:1. */}
              <AnimatePresence>
                {filtersDrawerOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 bg-black/50 z-40"
                      onClick={() => setFiltersDrawerOpen(false)}
                    />
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col"
                    >
                      <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                        <button
                          onClick={() => setFiltersDrawerOpen(false)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Close filters"
                        >
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Status
                            </Label>
                            <Select defaultValue="all">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="Expired">Expired</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Company
                            </Label>
                            <Select defaultValue="all">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Companies</SelectItem>
                                <SelectItem value="acme">Acme Distributors</SelectItem>
                                <SelectItem value="freedom">Freedom Foods</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 p-6 flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setFiltersDrawerOpen(false)}
                          className="flex-1"
                        >
                          Clear Filters
                        </Button>
                        <Button
                          onClick={() => setFiltersDrawerOpen(false)}
                          className="flex-1"
                        >
                          Apply
                        </Button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <SubHeader>Active filter chips (below the toolbar)</SubHeader>
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
                <span className="font-semibold">Rule of thumb:</span> in production every list page (Orders, Customers, My SKU, Offers, Inventory) uses the same right-side <code className="text-fuchsia-700 font-mono">motion.div</code> filter drawer rather than an inline filter row. The toolbar carries only Search + Filters + Export. Every active filter must be visible and removable as a chip — invisible filters cause "why am I seeing nothing?" support tickets.
              </p>
            </Section>

            {/* ===== Patterns — Bulk Actions ===== */}
            <Section
              id="bulk-actions"
              title="Bulk Actions"
              description="When a row checkbox is ticked, the page toolbar grows a count caption and verb-coloured buttons next to the search bar — the table header itself stays put. Action verbs colour-match their consequence: green for Confirm, destructive red for Cancel, blue/green for Mark as Delivered."
            >
              <SubHeader>Toolbar with selection (Orders pattern)</SubHeader>
              <PreviewBox>
                <div className="flex items-center justify-between gap-4">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input className="pl-10 pr-10" placeholder="Search by order ID, retailer name…" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 mr-2">3 selected</span>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </PreviewBox>

              <SubHeader>Inline selection bar (legacy / overlay pattern)</SubHeader>
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
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold">Live Orders</span> uses the toolbar variant: a gray-600 "<em>N selected</em>" caption followed by status-aware buttons inline with the search. The blue-50 bar is the legacy variant kept here as a reference pattern; new flows should mirror the toolbar.
              </p>
            </Section>

            {/* ===== Patterns — Action bars ===== */}
            <Section
              id="action-bar"
              title="Action Bars & CTAs"
              description="Production detail pages (SKU Detail, Order Detail) carry a sticky-top action bar — the page identifier / status sits on the left, the verb buttons on the right. The bar stays glued to the top of the scrolling area so the primary action is always one click away."
            >
              <SubHeader>Sticky-top detail action bar (sku-detail / order-detail)</SubHeader>
              <PreviewBox>
                <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200 gap-2 shadow-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700">Item Status</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Reset</Button>
                    <Button size="sm">Save</Button>
                  </div>
                </div>
              </PreviewBox>

              <SubHeader>Order detail status-aware actions</SubHeader>
              <PreviewBox>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">Order #QWI-ONDC-260330-8F3K92</p>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" className="gap-2">
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                    <Button size="sm" className="gap-2">
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
                When the order moves to <Badge className="bg-green-50 text-green-700 border-green-200 mx-1">Confirmed</Badge> the same bar swaps Confirm Order out for <span className="font-semibold">Mark as Delivered</span>. Cancelled / Delivered orders show <em>no</em> destructive actions — the order is past the seller's hand. Save buttons stay disabled until the page is dirty.
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
              description="The shared EmptyState component is the production primitive — a soft gradient halo behind a rounded icon tile, 24px semibold title, 16px gray-500 description, optional CTA. Default sizing fills the empty page (min-h-[420px]); compact mode shrinks to ~10px padding for sidebar widgets and embedded cards."
            >
              <SubHeader>Default — fills the empty page</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <EmptyState
                  icon={Users}
                  title="No customers yet"
                  description="Once retailers register against your brands from the buyer app, they'll auto-register as Active here and appear in this list."
                />
              </div>

              <SubHeader>With primary action</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <EmptyState
                  icon={Package}
                  title="No SKUs in your catalog"
                  description="Add your first SKU manually, sync from your DMS, or import in bulk via CSV."
                  action={
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add SKU</Button>
                      <Button variant="outline" size="sm" className="gap-2"><Upload className="h-4 w-4" /> Import CSV</Button>
                    </div>
                  }
                />
              </div>

              <SubHeader>Compact — for sidebar widgets / nested cards</SubHeader>
              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <EmptyState
                  compact
                  icon={Search}
                  title="No results for &quot;freedmm oil&quot;"
                  description="Check the spelling or clear filters."
                  action={<Button variant="link" size="sm">Clear filters</Button>}
                />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold">Recipe:</span> the EmptyState component carries the layout — gradient halo blur, rounded-2xl icon tile (h-28 w-28 default, h-20 w-20 compact), 24px semibold headline, 16px gray-500 explainer. The lucide icon and copy are the only required props. Use the same primitive when a real list page comes back empty AND when the gallery / preview shows the "no data yet" state.
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
              description="The dashboard hero. Production tiles carry a colored left border (border-l-4), a small label, a 3xl bold number, a trend chip with TrendingUp/Down icon and percentage, plus a soft-fill icon tile on the right. Hover lifts the shadow. Group in rows of 4 on lg screens — keep count + order stable so the layout itself is meaningful."
            >
              <SubHeader>Production dashboard tile (4-up grid)</SubHeader>
              <PreviewBox>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Orders",
                      value: "247",
                      change: "+18.2%",
                      trend: "up",
                      icon: ShoppingCart,
                      borderColor: "border-l-blue-500",
                      iconBg: "bg-blue-100",
                      iconColor: "text-blue-600",
                    },
                    {
                      label: "Revenue",
                      value: "₹4.8L",
                      change: "+9.2%",
                      trend: "up",
                      icon: TrendingUp,
                      borderColor: "border-l-emerald-500",
                      iconBg: "bg-emerald-100",
                      iconColor: "text-emerald-600",
                    },
                    {
                      label: "Avg Order Value",
                      value: "₹1,945",
                      change: "−3.1%",
                      trend: "down",
                      icon: CreditCard,
                      borderColor: "border-l-amber-500",
                      iconBg: "bg-amber-100",
                      iconColor: "text-amber-600",
                    },
                    {
                      label: "Active Customers",
                      value: "312",
                      change: "+24",
                      trend: "up",
                      icon: Users,
                      borderColor: "border-l-fuchsia-500",
                      iconBg: "bg-fuchsia-100",
                      iconColor: "text-fuchsia-600",
                    },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <Card
                        key={m.label}
                        className={`border-l-4 ${m.borderColor} hover:shadow-lg transition-shadow`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-600 mb-2">{m.label}</p>
                              <p className="text-3xl font-bold text-gray-900 mb-2">{m.value}</p>
                              <div className="flex items-center gap-1">
                                {m.trend === "up" ? (
                                  <TrendingUp className="h-3 w-3 text-green-600" />
                                ) : (
                                  <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                                )}
                                <span
                                  className={
                                    "text-xs font-semibold " +
                                    (m.trend === "up" ? "text-green-600" : "text-red-600")
                                  }
                                >
                                  {m.change}
                                </span>
                                <span className="text-xs text-gray-500">vs last period</span>
                              </div>
                            </div>
                            <div className={`${m.iconBg} ${m.iconColor} p-3 rounded-xl`}>
                              <Icon className="h-6 w-6" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </PreviewBox>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold">Recipe:</span> <code className="text-fuchsia-700 font-mono">border-l-4</code> + colored stripe matched to the metric's accent · <code className="text-fuchsia-700 font-mono">p-5</code> · 14px gray-600 label · 30px bold value · trend chip (TrendingUp/Down + percentage) on the bottom-left · soft-fill rounded-xl icon tile (p-3) on the right · hover:shadow-lg. Always 4 across on lg screens.
              </p>
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
