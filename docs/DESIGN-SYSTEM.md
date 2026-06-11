# Qwipo Design System

A single source of truth for every product that wears the Qwipo brand — web, mobile, internal tools. This document is the **portable** version of the interactive handbook at `/design` (file: [`src/app/pages/design-system.tsx`](../src/app/pages/design-system.tsx)). The handbook is what you browse; this file is what you copy into another codebase.

**Audience**

- **Designers**: spec components, tokens, layouts.
- **Product**: name flows, choose patterns, sign off copy.
- **Web developers**: implement against Tailwind v4 + shadcn/Radix.
- **Mobile developers**: implement against React Native / Flutter / native iOS / native Android using the token table in [§9 Cross-platform](#9-cross-platform-implementation).

**Stack the web app uses today** — Tailwind v4 · shadcn/ui (Radix primitives) · Lucide icons · Sonner toasts · Motion (Framer) · cmdk · vaul · react-day-picker · Recharts.

---

## Table of contents

- [1. Brand & principles](#1-brand--principles)
- [2. Tokens — foundations](#2-tokens--foundations)
  - [2.1 Color](#21-color)
  - [2.2 Typography](#22-typography)
  - [2.3 Spacing](#23-spacing)
  - [2.4 Radii](#24-radii)
  - [2.5 Shadows / elevation](#25-shadows--elevation)
  - [2.6 Motion](#26-motion)
  - [2.7 Z-index](#27-z-index)
  - [2.8 Breakpoints](#28-breakpoints)
  - [2.9 Iconography](#29-iconography)
- [3. Themes — light & dark](#3-themes--light--dark)
- [4. Component inventory](#4-component-inventory)
- [5. Patterns](#5-patterns)
- [6. Mobile-specific guidelines](#6-mobile-specific-guidelines)
- [7. Charts](#7-charts)
- [8. Voice & tone](#8-voice--tone)
- [9. Cross-platform implementation](#9-cross-platform-implementation)
- [10. Accessibility](#10-accessibility)
- [11. Implementation checklist](#11-implementation-checklist)

---

## 1. Brand & principles

**Five non-negotiable principles** (every PR is reviewed against them):

| Principle | What it means in practice |
|---|---|
| **Clarity over cleverness** | Users manage real money. Plain language, predictable layouts, remove visual noise that doesn't pay rent. |
| **Status-aware UI** | What the user can do follows from the state of the data. Order is `New` → show Confirm + Cancel. `Delivered` → no destructive actions. |
| **Empty states do work** | An empty list isn't a blank page — it explains what'll appear there and how to make the first one. |
| **Tokens, not hex codes** | Use the approved scale (Tailwind utility classes / token names). If a value isn't in the scale, propose adding it before reaching for arbitrary classes. |
| **Accessibility is non-negotiable** | Every interactive is keyboard-reachable, has a visible focus ring, and passes WCAG AA contrast at every state. |

**Voice in three words**: confident · concise · operational. We're talking to distributors running real businesses — assume competence, don't apologize, never use exclamation points in product copy.

---

## 2. Tokens — foundations

> All tokens live in CSS custom properties in [`src/styles/theme.css`](../src/styles/theme.css). The `@theme inline { … }` block exposes them to Tailwind v4 as utility classes. **Never hard-code a hex** — always reference the token.

### 2.1 Color

#### Brand

| Role | Token | Value | Tailwind |
|---|---|---|---|
| **Primary** | `--primary` | `#2563EB` | `blue-600` |
| Primary foreground | `--primary-foreground` | `#FFFFFF` | `white` |
| Ring (focus) | `--ring` | `#2563EB` | `blue-600` |
| Destructive | `--destructive` | `#D4183D` | (custom red) |
| Destructive foreground | `--destructive-foreground` | `#FFFFFF` | `white` |

Change `--primary` once → Button default, Badge default, Switch checked, Checkbox checked, focus rings, links, and active-tab pills all re-color in lock-step.

#### Surfaces (light)

| Role | Token | Value |
|---|---|---|
| Background | `--background` | `#FFFFFF` |
| Foreground | `--foreground` | `oklch(0.145 0 0)` (≈ `#252525`) |
| Card | `--card` | `#FFFFFF` |
| Muted | `--muted` | `#ECECF0` |
| Muted foreground | `--muted-foreground` | `#717182` |
| Border | `--border` | `rgba(0,0,0,0.1)` |
| Input background | `--input-background` | `#F3F3F5` |

#### Semantic palette (Tailwind shade range used)

| Semantic | Default | Background | Border | Foreground |
|---|---|---|---|---|
| Success | `emerald-600` `#059669` | `emerald-50` | `emerald-200` | `emerald-700` |
| Warning | `amber-600` `#D97706` | `amber-50` | `amber-200` | `amber-700` |
| Danger | `red-600` `#DC2626` | `red-50` | `red-200` | `red-700` |
| Info | `blue-600` `#2563EB` | `blue-50` | `blue-200` | `blue-700` |
| Neutral | `gray-600` `#4B5563` | `gray-50` | `gray-200` | `gray-700` |
| Accent | `purple-600` `#9333EA` | `purple-50` | `purple-200` | `purple-700` |

#### Chart palette — 8 colors, semantic-keyed

```ts
const CHART_PALETTE = [
  "#2563EB", // 1. Primary — blue 600
  "#16A34A", // 2. Success — green 600
  "#D97706", // 3. Warning — amber 600
  "#DC2626", // 4. Danger — red 600
  "#9333EA", // 5. Accent — purple 600
  "#0891B2", // 6. Cyan 600
  "#C026D3", // 7. Fuchsia 600
  "#4F46E5", // 8. Indigo 600
];
```

Rule: a series for "Active" reads green wherever it appears; "Cancelled" reads red. Don't reassign roles.

### 2.2 Typography

**Family**: Inter (`--font-sans`) → loaded once in `index.html`, exposed via `--font-sans`. Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.

**Base font size**: `16px` (`--font-size`).

**Weights** — only `400` (body) and `500` (medium / semibold-equivalent). No `600+` headings on dense UI.

#### Type scale

| Role | Class | px / line-height | Use |
|---|---|---|---|
| Display | `text-2xl font-semibold` | 24 / 32 | Page titles only |
| H1 | `text-xl font-semibold` | 20 / 28 | Card section headers |
| H2 | `text-base font-semibold` | 16 / 24 | Sub-section heads |
| H3 | `text-sm font-semibold` | 14 / 20 | Tile titles, list items |
| Body | `text-sm` | 14 / 20 | Default body |
| Small | `text-xs` | 12 / 16 | Helper text, captions |
| Tiny | `text-[11px]` | 11 / 16 | Footnotes, status-row helpers |
| Micro | `text-[10px] uppercase tracking-wider` | 10 / 14 | Label badges, table mini-headers |
| Mono | `font-mono text-xs` | 12 / 16 | SKU codes, IDs, channel-order IDs |

**Never**: `text-3xl` or larger in product UI, mixed weights inside a single label, or `text-base` on a body that should be `text-sm`.

### 2.3 Spacing

Tailwind v4 default 4-px scale: `0 · 0.5 · 1 · 1.5 · 2 · 3 · 4 · 5 · 6 · 8 · 10 · 12 · 16 · 24`.

**Density rules** (the application norm — denser than Material defaults):

- Card padding: `p-4` (16 px) on dense list / detail surfaces, `p-5` on dialog content, `p-6` on full-page wrappers.
- Gutter between cards in a section: `gap-4` (16 px).
- Spacing between sections on a page: `space-y-6` (24 px).
- Form field vertical rhythm: `space-y-2` between Label and Input, `gap-3` or `gap-4` between fields in a row.
- Toolbar row height: `h-9` (36 px) for inputs / outline buttons, `h-8` (32 px) for compact controls inside Card headers.

### 2.4 Radii

| Token | Value | Use |
|---|---|---|
| `--radius` (base) | `0.625rem` (10 px) | Cards, dialogs, popovers |
| `rounded-sm` | 2 px | Pills inside table cells |
| `rounded-md` | 6 px | Buttons, inputs, switches |
| `rounded-lg` | 8 px | Cards, dialogs |
| `rounded-xl` | 12 px | Hero / brand surfaces only |
| `rounded-full` | 9999 px | Avatars, status pills, range-preset segmented controls |

### 2.5 Shadows / elevation

| Token | Use |
|---|---|
| `shadow-sm` | Resting cards, sticky toolbars |
| `shadow-md` | Hover state on clickable cards |
| `shadow-lg` | Popovers, dropdown menus |
| `shadow-xl` | Modal dialogs, mobile drawers (web) |
| `shadow-inner` | Inputs on dark surfaces (rare) |

Don't combine shadow + ring + border on the same element. Pick one elevation cue.

### 2.6 Motion

| Use | Duration | Easing |
|---|---|---|
| Hover/focus state | `transition-colors` (150 ms) | default |
| Pill / chip active toggle | `transition-all` (150–200 ms) | default |
| Card hover lift | `transition-shadow` (200 ms) | default |
| Dialog enter | 200 ms | cubic ease-out (Radix default) |
| Dialog exit | 150 ms | cubic ease-in |
| Sidebar slide | 300 ms | `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind ease-in-out) |
| Page route progress | 600 ms | ease-out, one-shot |

**Reduced motion**: any animation longer than 200 ms must respect `prefers-reduced-motion: reduce` by switching to a fade-only / instant variant.

### 2.7 Z-index

| Layer | Z | Use |
|---|---|---|
| Base | `0` | Page body |
| Sticky toolbar | `10` | Search/filter bars that pin |
| Sticky table header | `20` | `thead.sticky` inside scroll regions |
| Sidebar (mobile drawer) | `40` | Slide-in nav |
| Popover / dropdown | `50` | Selects, comboboxes |
| Modal dialog | `60` | shadcn Dialog |
| Toast | `70` | Sonner |
| Tooltip | `80` | Last word on hover |

### 2.8 Breakpoints

Tailwind defaults — keep the same names on mobile too so designers and engineers speak one language:

| Name | min-width | Notes |
|---|---|---|
| (base) | 0 | Mobile portrait — design here first. |
| `sm` | 640 px | Mobile landscape, very small tablets. |
| `md` | 768 px | Tablet portrait. |
| `lg` | 1024 px | Tablet landscape, small laptop. |
| `xl` | 1280 px | Standard laptop. |
| `2xl` | 1536 px | External monitors. |

**Layout rule**: every list page is `flex-col h-full`, the toolbar is `flex-shrink-0`, only the table region scrolls. Don't let the whole page scroll on desktop — the sticky toolbar is the seller's anchor.

### 2.9 Iconography

| Spec | Value |
|---|---|
| Library | **Lucide** (open-source, tree-shakable). One library, one stroke style. |
| Stroke | `1.5` (Lucide default) — don't override. |
| Sizes | `h-3 w-3` (12 px) inside table cells, `h-3.5 w-3.5` (14 px) in chip pills, `h-4 w-4` (16 px) default, `h-5 w-5` (20 px) section heading + primary CTA, `h-6 w-6` (24 px) hero illustrations only. |
| Color | Inherit from the text node it sits next to (`text-blue-600`, etc.) — don't fill explicit colors on the SVG. |
| Tone | Match the semantic palette of the surrounding context (success → emerald-600, warning → amber-600). |

---

## 3. Themes — light & dark

Light is canonical. Dark is opt-in via the `next-themes` provider; the toggle lives in the top nav. All tokens have a `.dark` counterpart in `theme.css`.

**Adding a new product surface? Light first, validate dark second.** Don't ship a screen that only works in one mode.

| Surface | Light | Dark |
|---|---|---|
| Background | `#FFFFFF` | `oklch(0.145 0 0)` ≈ `#252525` |
| Foreground | `oklch(0.145 0 0)` ≈ `#252525` | `oklch(0.985 0 0)` ≈ `#FAFAFA` |
| Card | `#FFFFFF` | `oklch(0.145 0 0)` |
| Border | `rgba(0,0,0,0.1)` | `oklch(0.269 0 0)` |
| Muted | `#ECECF0` | `oklch(0.269 0 0)` |
| Ring | `#2563EB` | `oklch(0.439 0 0)` |

**Dark-mode rules**:

1. Never reduce contrast below WCAG AA. Bright-on-bright is a bug.
2. Shadows are weaker in dark mode — use border + subtle background tint instead.
3. Logos: swap to the `for_Dark_BG` PNG/SVG variant (already wired in `RootLayout` via `themeReady` mount guard).
4. Charts: keep the same CHART_PALETTE — saturated 600-level shades read on both themes.

---

## 4. Component inventory

Every primitive used today, grouped by purpose. All web implementations live in `src/app/components/ui/`. Native equivalents are noted in [§9](#9-cross-platform-implementation).

### Forms & inputs

| Component | File | Use |
|---|---|---|
| **Button** | `button.tsx` | Default (primary), `variant="outline"`, `"ghost"`, `"destructive"`. Sizes: `sm`, default, `lg`, `icon`. |
| **Input** | `input.tsx` | Default `h-9`. Use `aria-invalid` for error states; pair with a red helper line below. |
| **Textarea** | `textarea.tsx` | Multi-line; resize disabled by default. |
| **Label** | `label.tsx` | Always pair with an `htmlFor` matching the input id. |
| **Select** | `select.tsx` (Radix) | Use for ≤ 8 options. For more, switch to Combobox. |
| **Combobox** | `command.tsx` + `popover.tsx` (cmdk) | Search-and-select. See `SkuComboBox`, `CompanyComboBox`. |
| **Multi-select** | `multi-select.tsx` | Chip-based; clear-all + per-chip remove. |
| **Radio group** | `radio-group.tsx` | Mutually-exclusive options. Cards-as-radios pattern for ≤ 3 high-stakes choices. |
| **Checkbox** | `checkbox.tsx` | Independent boolean per option. Avoid as a "checked-all" implicit state. |
| **Switch** | `switch.tsx` | Master toggles, settings. Same width as a Tailwind `w-9` to match the size grid. |
| **Toggle / Toggle group** | `toggle.tsx`, `toggle-group.tsx` | Segmented control for 2–4 mutually-exclusive options. |
| **Slider** | `slider.tsx` | Numeric range. Always show the current value above the thumb. |
| **Calendar / Date picker** | `calendar.tsx` (react-day-picker) | Picks a single date; use `Input type="date"` for compact inline pickers. |
| **Input OTP** | `input-otp.tsx` | 4 or 6 cells; auto-advance on input. |
| **Image uploader** | `image-uploader.tsx` | Drag-drop + click; previews + remove button. |
| **Form** | `form.tsx`, `form-field.tsx` | React Hook Form bindings with field-level error rendering. |

### Display

| Component | File | Use |
|---|---|---|
| **Badge** | `badge.tsx` | Status pills. Variants: default (brand), `secondary`, `outline`, `destructive`. |
| **Status badge** | `status-badge.tsx` | Pre-tinted by status string (Active / Inactive / Scheduled / Expired / etc). |
| **Card** | `card.tsx` | `Card` + `CardHeader` + `CardTitle` + `CardContent`. **Default anatomy** — use this everywhere. |
| **Avatar** | `avatar.tsx` | Initials fallback when no image. |
| **Progress** | `progress.tsx` | Determinate bar. For indeterminate, use `Loader2` spinning. |
| **Separator** | `separator.tsx` | 1-px line; horizontal default. Use `space-y-*` instead where possible. |
| **Skeleton** | `skeleton.tsx` | Loading placeholders. Match the shape of the real content. |
| **Aspect ratio** | `aspect-ratio.tsx` | Pin image / map aspect during load. |
| **Carousel** | `carousel.tsx` | Marketing only — avoid in admin UI. |
| **Page header / loader** | `page-header.tsx`, `page-loader.tsx` | Top progress bar on route change. |

### Overlays

| Component | File | Use |
|---|---|---|
| **Dialog** | `dialog.tsx` | Modal — centered on web, full-screen-able on mobile. Default `max-w-md`. |
| **Alert dialog** | `alert-dialog.tsx` | Destructive confirmations only (delete, cancel, force action). |
| **Sheet** | `sheet.tsx` | Side panel on web; **prefer this on mobile** instead of a centered dialog for forms. |
| **Drawer** | `drawer.tsx` (vaul) | Bottom-sheet on mobile, sheet on desktop. The mobile-first dialog. |
| **Popover** | `popover.tsx` | Anchored to a trigger; use for color pickers, mini-forms. |
| **Hover card** | `hover-card.tsx` | Read-only preview; never put actions inside. |
| **Tooltip** | `tooltip.tsx` | Short clarifications, ≤ 6 words. Don't repeat the label. |
| **Dropdown menu** | `dropdown-menu.tsx` | Action menus. Items get an icon left + label. |
| **Context menu** | `context-menu.tsx` | Right-click (desktop) / long-press (mobile). |
| **Command** | `command.tsx` (cmdk) | Search-everywhere palette. |
| **Toast** | `sonner.tsx` (Sonner) | `success` / `error` / `info`. Top-right. ≤ 6 seconds. |

### Navigation

| Component | File | Use |
|---|---|---|
| **Tabs** | `tabs.tsx` | Top-of-card tabs. Pill style — pick one and don't mix with underline tabs. |
| **Accordion** | `accordion.tsx` | Settings groups; FAQ. Default single-open. |
| **Breadcrumb** | `breadcrumb.tsx` | Use sparingly — the sidebar + page title usually carry location. |
| **Pagination** | `pagination.tsx`, `list-pagination.tsx` | List page footer; always 25 per page across the app. |
| **Sidebar** | `sidebar.tsx` | App shell only. |
| **Navigation menu** | `navigation-menu.tsx` | Mega-menu (web). Avoid on mobile. |
| **Menubar** | `menubar.tsx` | Desktop app-style menu bar. Rare. |

### Data display

| Component | File | Use |
|---|---|---|
| **Table** | `table.tsx` | Read-mostly grids. Sticky header on scroll. |
| **Data table** | `data-table.tsx`, `data-table-shell.tsx` | Sortable, filterable, paginated. |
| **Chart** | `chart.tsx` + recharts | See [§7 Charts](#7-charts). |
| **Scroll area** | `scroll-area.tsx` | Custom scrollbar; long lists inside popovers. |
| **Resizable** | `resizable.tsx` | Split panes. |
| **Collapsible** | `collapsible.tsx` | Show-more sections. |

---

## 5. Patterns

| Pattern | Where to see it | Recipe |
|---|---|---|
| **List page** | `/orders`, `/customers`, `/products/my-sku` | `flex-col h-full bg-gray-50` → Toolbar (`bg-white border-b px-6 py-4 flex-shrink-0`) with search left + Filters / Export / Create right → `flex-1 overflow-auto` table → `ListPagination` footer. |
| **Detail page** | `/orders/:orderId`, `/customers/:customerId` | Compact header (icon-only Back + H1 + status badge) → meta card with 3 cols (Buyer / Seller / Order Meta) → primary content card. |
| **Form page** | `/products/add-sku/manual`, `/settings/store` | `p-6 bg-gray-50 min-h-full` + `max-w-5xl mx-auto space-y-6` → Back link + H1 + subtitle → sectioned Cards each with header icon + Save inside the card header. |
| **Settings hub** | `/settings` | Grid of icon-led cards routing to the section pages. |
| **Wizard** | `/products/add-sku` | Stepper pill chain at top with done (emerald) / active (blue) / pending (gray) states. |
| **Empty state** | First load on every list | Icon + headline + 1 sentence + primary action. Use `EmptyState` component. |
| **Bulk action bar** | Orders list | Sticky strip appearing once ≥ 1 row is checked; primary action right, count left. |
| **Filter drawer** | Orders, Offers | Right-side Sheet with apply / clear footer. Badge count on the trigger when filters are active. |
| **Confirmation popup** | Cancel, Delete, Status change | AlertDialog with destructive primary on the right. Never destructive primary on the left. |
| **Action bar inside Card** | Order Meta, Settings card | Save / Edit lives in the CardHeader's right side, not floating in the body. |
| **KPI tile** | Dashboard | Icon + small label → big number → 2-line status chips. |
| **Notifications** | Cross-app | Sonner toast — success (green check), error (red x), neutral (info). |

---

## 6. Mobile-specific guidelines

A separate set of constraints overlays everything above when shipping a native or PWA mobile build.

### 6.1 Touch targets

- **Minimum tap area: 44 × 44 pt (iOS) / 48 × 48 dp (Android)**. Tailwind: `min-h-11 min-w-11`.
- A button that's `h-9` (web compact) must grow to `h-11` on touch viewports.
- Inline icon-only actions in a list row (Eye, Edit) need 8 px padding around the icon to hit 44 pt total.

### 6.2 Safe areas

Always inset content from notches / home indicator using `env(safe-area-inset-*)`. In Tailwind v4:

```html
<div class="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">…</div>
```

Native: use `useSafeAreaInsets()` (React Native) or `SafeArea` widget (Flutter).

### 6.3 Density

| Surface | Web | Mobile |
|---|---|---|
| Card padding | `p-4` | `p-4` (same; the comfort comes from larger touch targets, not bigger padding) |
| Toolbar row | `h-9` controls | `h-11` controls |
| Table row | `py-3` | Switch to **stacked cards** — tables are a desktop pattern. |
| Modal | Centered, `max-w-md` | **Bottom sheet** via Drawer; full-screen on long forms. |
| Multi-step form | Stepper at top | Progress dots; one step per screen, fixed bottom CTA. |

### 6.4 Navigation

- **Tab bar** (≤ 5 root destinations) at the bottom on mobile; sidebar on desktop. Pick the same icons in both places.
- **Back gesture**: every screen except the tab roots must respond to system back (Android hardware back / iOS edge swipe).
- **Bottom CTA**: primary action floats at the bottom inside `safe-area-inset-bottom`, full-width, `h-12` minimum.

### 6.5 Lists on mobile

Convert every wide table to a card list:

- Each row → a Card with header (title + status badge), 2-line summary, optional metadata row.
- Bulk-action affordance: long-press to enter selection mode.
- Pull-to-refresh on top, infinite scroll on bottom (replace pagination).

### 6.6 Forms on mobile

- One section per screen for wizards; never compress a multi-section form into one mobile screen.
- Inputs are `h-12` minimum. Labels above, not beside.
- Use platform-native pickers for date/time. Don't render a calendar grid on a 360 px screen.
- Soft keyboard: lift sticky CTA above the keyboard (web: `interactive-widget=resizes-content`; native: `KeyboardAvoidingView` / `Scaffold(resizeToAvoidBottomInset: true)`).

### 6.7 Drawers vs dialogs

| When | Web | Mobile |
|---|---|---|
| Confirmation (≤ 2 sentences + 2 buttons) | AlertDialog | AlertDialog (centered, 90% width) |
| Form with > 2 fields | Dialog | Drawer (bottom sheet, 75–90% height) |
| Multi-step or full editor | Sheet (right) | Full-screen route, not a sheet |
| Picker / menu | Popover | Bottom sheet — never a popover floating beside the trigger |

### 6.8 Haptics (native only)

- Light impact on every primary toggle (Switch, Tab change).
- Medium impact on destructive confirm tap.
- Success notification haptic after Save / Create.
- Don't haptic on every keystroke or scroll.

---

## 7. Charts

[Recharts v2](https://recharts.org/) is the canonical library. Always use `CHART_PALETTE` from [§2.1](#21-color). Every chart sits inside `<ResponsiveContainer width="100%" height="100%">` and the parent owns the height (`h-56` for tile-sized, `h-72` for full-card).

### Picking the right chart

| Use | Component |
|---|---|
| One metric over time, ≤ 30 points | `LineChart` |
| Same as above but the filled magnitude matters | `AreaChart` (gradient fill) |
| Compare 2–4 metrics over time | Multi-series `LineChart` |
| Categorical breakdown (sorted descending) | `BarChart` |
| Composition over time | Stacked `BarChart` (≤ 4 segments) |
| Part-of-whole, 3–5 slices, one is meaningfully bigger | `PieChart` (donut variant for KPI center text) |
| Single-value progress to a known ceiling | `RadialBarChart` |
| Trend inside a small KPI tile | Sparkline (raw `<svg>` polyline) |

### Mobile chart rules

- One chart per fold — never stack two charts above the fold on mobile.
- Drop axis labels on the narrow side; keep tooltips.
- Donut centers carry the KPI number — that's where the eye lands.

---

## 8. Voice & tone

- **Sentence case** for all labels, buttons, dialog titles. Title Case only for proper nouns.
- **Imperative for buttons**: "Save", "Create offer", "Cancel order". Not "Saving" or "Click to save".
- **Sentence-form for empty states**: "No customers yet. Add your first one to get started."
- **Numerics**: Indian system for currency (`₹12,450` not `₹12450`); use the compact form on tiles (`₹12.4L` for lakhs, `₹1.2Cr` for crores).
- **Dates**: ISO `YYYY-MM-DD` in tables, short `May 04` on chart axes, long `Monday, 4 May 2026` in narrative copy.
- **No emoji** in product copy (allowed in marketing).
- **No exclamation points**. Ever.

---

## 9. Cross-platform implementation

Same tokens, three implementations. The token table is canon — the platform-specific code is just a binding.

### 9.1 Web (Tailwind v4 + shadcn/Radix)

```html
<button class="bg-blue-600 hover:bg-blue-700 text-white px-4 h-9 rounded-md">
  Save
</button>
```

Tokens come from `theme.css`; components from `src/app/components/ui/`. See files cited above.

### 9.2 React Native

Map tokens to a single `theme.ts` consumed by every component:

```ts
export const theme = {
  color: {
    primary: "#2563EB",
    primaryFg: "#FFFFFF",
    background: "#FFFFFF",
    foreground: "#252525",
    muted: "#ECECF0",
    border: "rgba(0,0,0,0.1)",
    success: "#059669",
    warning: "#D97706",
    danger: "#DC2626",
  },
  spacing: { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48 },
  radius: { sm: 2, md: 6, lg: 8, xl: 12, full: 9999, base: 10 },
  font: { sans: "Inter", size: { xs:12, sm:14, base:16, lg:18, xl:20, '2xl':24 } },
  motion: { fast:150, default:200, slow:300 },
};
```

Component-to-component mapping:

| Web (shadcn) | React Native |
|---|---|
| `Button` | `Pressable` + theme |
| `Input` | `TextInput` (with `theme.color.border`, `h-11` on mobile) |
| `Card` | `View` (border + radius + shadow as platform allows) |
| `Dialog` | `Modal` (centered) or `@gorhom/bottom-sheet` (preferred) |
| `Drawer` | `@gorhom/bottom-sheet` |
| `Switch` | `Switch` from RN (tint with theme.primary) |
| `Toast` | `react-native-toast-message` themed to match Sonner output |
| `Chart` | `victory-native` or `react-native-svg-charts` reading CHART_PALETTE |

### 9.3 Flutter

```dart
class QwipoTokens {
  static const primary = Color(0xFF2563EB);
  static const success = Color(0xFF059669);
  static const warning = Color(0xFFD97706);
  static const danger  = Color(0xFFDC2626);
  static const radiusBase = 10.0;
  static const fontFamily = 'Inter';
}
```

Map to `ThemeData` (`colorScheme.primary`, `cardTheme.shape`, `textTheme` per the type scale above). Use `BottomSheet` (modal) for the mobile drawer pattern.

### 9.4 Native iOS / Android

Define the same tokens as `UIColor` (iOS) / `colors.xml` (Android). Buttons follow the platform's tap-target minimums automatically (44 pt / 48 dp).

### 9.5 Implementation contract

Whichever platform you're on, your binding must satisfy:

1. **One source of truth for tokens.** A new color goes into the central file; PRs that hard-code hex are rejected.
2. **Semantic names, not hex.** `theme.success`, not `#059669` at the call site.
3. **Component API parity where it makes sense.** A `Button` has `variant` and `size` props in every implementation.
4. **Platform-native interaction.** Don't ship a web hover state as a mobile tap effect — use platform-native ripple / pressed states.

---

## 10. Accessibility

WCAG 2.1 AA, no exceptions.

| Area | Rule |
|---|---|
| Contrast | Body text ≥ 4.5:1 vs background, large text ≥ 3:1, UI components (borders, icons) ≥ 3:1. |
| Keyboard | Every interactive must be reachable with Tab and operable with Enter / Space. Visible focus ring (the brand blue) on every focusable element. |
| Screen reader | Every form input has a `<label htmlFor="…">` or `aria-label`. Icon-only buttons have `aria-label` + a tooltip. |
| Targets | Touch targets ≥ 44 pt (iOS) / 48 dp (Android). Web: hit area ≥ 32 × 32 px; aim for 40 × 40. |
| Live regions | Use `aria-live="polite"` for non-critical status updates (form save toasts). |
| Motion | Respect `prefers-reduced-motion: reduce` — fade-only fallback. |
| Color | Never the only signal — pair color with an icon or text label (e.g. ✓ + green badge, not just green). |
| Forms | Errors announce via `aria-invalid="true"` on the input + a red helper line below with the message. |

---

## 11. Implementation checklist

Before merging any UI work — web or mobile:

- [ ] **Tokens only.** No raw hex / arbitrary spacing / one-off font sizes in the diff.
- [ ] **Canonical component anatomy.** Cards are `Card + CardHeader + CardTitle + CardContent`. Form fields are `<div className="space-y-2"><Label>…<Input>…</div>` (or platform equivalent).
- [ ] **Status-aware actions.** The set of visible actions matches the state of the data.
- [ ] **Empty state.** Every list has one. Includes a primary action.
- [ ] **Error state.** Form errors render below the input; toasts surface server errors.
- [ ] **Loading state.** Either a skeleton matching the final shape or a `Loader2` spinner. Never a blank.
- [ ] **Mobile breakpoint review.** Tables collapse to cards; modals become drawers; CTAs hit the bottom safe area.
- [ ] **Keyboard pass.** Tab to every control, Enter activates the primary, Esc closes overlays.
- [ ] **Light + dark check.** Open in both themes before review.
- [ ] **Voice & tone.** Sentence case, imperative buttons, no exclamation points.
- [ ] **Accessibility audit.** Run the page through axe or Lighthouse; resolve every AA failure.

---

## Appendix — file map

| Concept | Where it lives |
|---|---|
| Token definitions | [`src/styles/theme.css`](../src/styles/theme.css) |
| Font setup | [`src/styles/fonts.css`](../src/styles/fonts.css) · loaded by `index.html` |
| Global CSS entry | [`src/styles/index.css`](../src/styles/index.css) |
| Interactive handbook | [`src/app/pages/design-system.tsx`](../src/app/pages/design-system.tsx) (browsable at `/design`) |
| UI primitives | [`src/app/components/ui/`](../src/app/components/ui/) |
| Composite components | `src/app/components/*` (e.g. `sku-combobox.tsx`, `company-combobox.tsx`) |
| Patterns | `src/app/pages/*` (every page is a worked example) |
| Chart palette | Re-declared in [`src/app/pages/dashboard.tsx`](../src/app/pages/dashboard.tsx) (`PALETTE`) and [`src/app/pages/design-system.tsx`](../src/app/pages/design-system.tsx) (`CHART_PALETTE`) — keep them in sync |

**Updating the design system**: change the token / component in the code, then update the corresponding section of this file in the same PR. Reviewers can decline a token-changing PR that doesn't update this doc.
