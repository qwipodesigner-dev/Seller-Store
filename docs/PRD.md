# Qwipo Seller Store — Product Requirements Document

| | |
|---|---|
| **Product** | Qwipo Seller Store |
| **Owner** | Product · Qwipo B2B |
| **Audience** | Product · Design · Engineering · Account-managers · QA |
| **Status** | Phase 1 / Phase 2 in flight |
| **Last revised** | 18 May 2026 |
| **Repo** | `qwipodesigner-dev/Seller-Store` |
| **Production URL** | https://seller-store-nine.vercel.app |

---

## 1. Executive summary

Qwipo Seller Store is the web console a **distributor** (the "seller") uses to run their B2B catalog, fulfil orders, manage retailer relationships, and publish to ONDC + Amazon + Flipkart from one place. It sits on top of the Qwipo platform and is paired with two adjacent surfaces:

- The **Qwipo Super-Admin console** (same repo, different sidebar) — onboards sellers, manages master data (companies, brands, categories, connectors).
- The **Buyer Application** (separate product) — the retailer-facing storefront where customers actually place orders. Orders + customer auto-registration flow into the Seller Store from there.

The store is built as a **single-page React application** styled with a Qwipo design system (`/design` route) and ships as a static Vite bundle hosted on Vercel. There is no native mobile app in scope; the web console is responsive down to a phone-class viewport.

**One-sentence pitch:** *one screen for everything a distributor's office staff needs to do today — list SKUs, set prices, run schemes, confirm orders, mark deliveries, manage customer access, and pull a CSV for finance — without any of the multi-portal back-and-forth they live with on legacy stacks.*

---

## 2. Goals

1. **Replace 4–6 disconnected portals** (DMS, ONDC publisher, marketplace seller centrals, ad-hoc Excel sheets) with one console scoped to the seller's catalog, orders, customers, schemes, and reports.
2. **Make the inception path frictionless** — a fresh seller logging in on day one sees friendly empty-state illustrations on every screen with clear CTAs (*"Once retailers register against your brands, they'll auto-register here"*, *"Add SKUs first — there's no catalog to update yet"*).
3. **Keep the data-entry surface as small as possible.** Orders auto-flow from the Buyer Application; customers auto-register on first order; bulk imports work off pre-filled sheets; ONDC fields fall back to sensible defaults.
4. **Be auditable.** Every destructive action goes through a confirmation dialog that names the consequence; every status change emits a toast that the seller can read before navigating; every bulk action surfaces a downloadable error report.
5. **Be honest about scope.** Each module clearly distinguishes what Phase 1 / Phase 2 ships from what's coming later — no mystery menu items, no half-built pages.

## 3. Non-goals

- A **native mobile app** is not in scope; web responsive is the only target.
- An **ad-hoc admin self-service** for hard-coded settings (Support phone numbers, default measure units, etc.) is not in scope this phase.
- **Real-time multi-seller collaboration** (live cursors, presence indicators) is not in scope.
- **AI/ML-driven recommendations** (pricing, restock predictions) are not in scope.
- A **public API surface** is not in scope; the Seller Store is a client of the platform's existing back-end.

---

## 4. Personas

| Persona | Sign-in via | What they live to do |
|---|---|---|
| **Seller Admin** *(Rajesh Kumar)* | OTP on mobile `9900000002` | Run their catalog, fulfil orders, manage customers, configure schemes. The console's primary user. |
| **Demo Seller (Empty)** | OTP on mobile `9900000003` | Same as Seller Admin, but their store seed is wiped so every screen shows its empty-state. Used for screenshots, walkthroughs, and inception-day rehearsals. |
| **Qwipo Super Admin** | OTP on mobile `9900000001` | Onboards sellers, manages master data (Companies, Brands, Categories, Connectors). Lives on `/admin/*`. |
| **Designer** *(Design persona)* | OTP on mobile `9900000004` | Read-only access to the Design System handbook at `/design`. |

**Auth:** OTP-only in this phase. No password screen, no SSO, no MFA configuration. Demo OTP is `1234` for every persona; production wires real OTPs through the platform's existing OTP service.

---

## 5. Information architecture

### Seller console — left sidebar (top → bottom)

| # | Item | Route | Phase |
|---|---|---|---|
| 1 | Dashboard | `/` | Live |
| 2 | My SKU | `/products/my-sku` | Live |
| 3 | Customers | `/customers` | Live (Phase 2 flow) |
| 4 | Offers & Schemes | `/offers` | Live |
| 5 | Orders | `/orders` | Live |
| 6 | Reports | `/reports` | Live |
| 7 | KYC | `/kyc` | Live |
| 8 | Connectors | `/connectors` | Live |
| 9 | Logistics | `/settings/logistics` | Conditional — only when toggled on in Settings |
| 10 | Settings | `/settings` | Live |
| 11 | Support | `/support` | Live |

### Super-admin console — left sidebar

| # | Item | Route |
|---|---|---|
| 1 | Dashboard | `/admin` |
| 2 | Sellers | `/admin/users` |
| 3 | Companies & Brands | `/admin/companies` |
| 4 | Category Master | `/admin/categories` |
| 5 | Connectors | `/admin/connectors` |

### Top bars

- **Seller console header** — search (placeholder for future cross-module search), notifications icon, theme toggle (light / dark / system), seller-profile dropdown with sign-out.
- **Admin console header** — same chrome, different left-sidebar content.

### Auth area (no sidebar)

- `/login` — mobile + OTP screen with persona presets.
- `/onboarding` — first-time KYC + connector setup wizard (placeholder in this phase).
- `/design` — design-system handbook accessible to the Designer persona without going through the rest of the auth flow.

---

## 6. Modules — feature catalog

### 6.1 Dashboard (`/`)

A one-glance home for the seller. Renders:

- **Greeting bar** with the seller's name + today's date.
- **KPI tiles** — Orders today, Revenue this month, New customers this week, Stock alerts.
- **Top Products list** — five rows with name, orders count, revenue. Static demo data.
- **Recent Orders list** — five rows with Order ID, customer, amount, status, marketplace.
- **Quick links / CTAs** to common destinations (Add SKU, Create Scheme, View Orders).

The Dashboard is intentionally lightweight — every tile and list links into the deeper module that owns the data.

### 6.2 My SKU + Bulk Import (`/products/my-sku`)

The seller's catalog management surface.

**List page**
- Search by SKU name / code / brand.
- Filters drawer — Status, Category (multi-select), Brand (multi-select), ONDC compliance.
- Paginated table at 25 rows per page.
- **Bulk Import** dropdown button in the header with two items:
  - **Add New SKUs** — opens the shared `BulkImportDialog` configured for the Add-SKU template (3-tab `.xlsx`).
  - **Update Price & Stock** — opens the same dialog configured for the price/stock template. Disabled in the empty-catalog state.
- Row-level actions: View, Edit.
- Empty-state illustration when the catalog is fresh.

**SKU detail page** *(`/products/sku-detail/:skuId`)* — a unified two-tab view:
- **Product Details** — a DualRow editor (DMS source column on the left, editable ONDC column on the right) covering every field on the SKU schema. Group Name field included. Weight in KG is auto-calculated and read-only. Validation errors render inline under each field. After Save Changes, a post-save summary popup confirms what landed + any rows that failed.
- **Price & Inventory** — MRP / Selling Price / Available Stock / Infinite-stock toggle / Threshold Level / Reserved Stock. Active-offers warning when the SKU has a live QPS scheme attached.

**Bulk import dialog (shared `<BulkImportDialog>`)** — a four-step modal:
1. **Upload** — instructions banner + sample-template card + drag-and-drop file picker. Accepts `.csv`, `.xlsx`, `.xls`, up to 10 MB.
2. **Validating** — spinner with a 5-second simulated delay so reviewers see the loader (configurable per flow).
3. **Results** — three summary cards (Total / Valid / Invalid), a simplified per-SKU error table (SKU Code · SKU Name · error count), and a footer with Re-upload File + Download Error Report + Import N Valid Records.
4. **Importing** — spinner during the apply pass.

**Add SKU template structure (3-tab `.xlsx`)** — generated client-side by ExcelJS so dropdowns persist on save:
- **Main SKU Upload** — header row (mandatory columns carry `*`), frozen italic helper row with format hints, data rows from row 3. Cell-level dropdowns on every option column (named ranges on the Master sheet for long lists).
- **Validation** — five-column reference table (Field · Mandatory or Optional · Format · Validation Rules · Example).
- **Master Data** — option lists per dropdown column; the Main sheet references these via workbook-level named ranges so reordering columns doesn't break the formulas.

**Update Price & Stock template** — a 7-column CSV pre-filled with the seller's current catalog:
- **Read-only:** SKU Code · SKU Name · Brand · Category.
- **Editable:** MRP · Selling Price · Available Stock (Yes / No).
- File name `price_stock_update_template.csv`, UTF-8 with BOM, 500-row upload cap.
- Unknown SKU codes are rejected (not silently skipped).
- Yes → SKU is in stock (sets `isInfiniteStock = true`, keeps the existing count); No → SKU is out of stock (clears the flag + zeros the count).

### 6.3 Offers & Schemes (`/offers`)

QPS (Quantity Per Slab) scheme management. List page + create wizard.

- List page with filters by status (Active / Inactive / Expired) and brand.
- Schemes apply quantity slabs (e.g., 12–47 qty → 5% off, 48+ qty → 10% off) to a SKU's selling price.
- Create flow lets the seller pick a SKU, define slabs, pick a start and end date, and save. Phase 1 ships percent-discount slabs only — flat-rupee slabs are out of scope this phase.
- Offers carry an Offer Code (e.g., *QPS-180000008*) that surfaces on the Order Detail page's QPS Impact row so the seller can trace any discount back to its scheme.

### 6.4 Orders (`/orders`)

The seller's day-to-day fulfilment surface.

**List page** — five tabs (All / New / Confirmed / Delivered / Cancelled) with per-tab counts. Each tab carries its own search bar (Order ID + Retailer Name). The page header has a Filters drawer (Company / Brand, Status, Marketplace, Date Range) and an Export button. Pagination is 10 orders per page, sorted by Order Date newest first.

**Columns:** Order ID (the new `QWI-<MKT>-<YYMMDD>-<TOKEN>` shape, e.g., *QWI-ONDC-260330-8F3K92*) · Company · Retailer Name · Mobile · Order Value · Marketplace · Order Date · Status · Actions (View).

**Bulk actions** — appear next to the per-tab search bar when at least one row is selected:
- **New** tab → Confirm + Cancel
- **Confirmed** tab → Mark Delivered + Cancel
- **Delivered / Cancelled** tabs render no checkboxes (terminal states).

**Detail page** *(`/orders/:orderId`)* — three-up Buyer / Seller / Order Meta card, items table with per-line QPS Impact rows, and totals footer (Total QPS Savings + Total Order Value). The items table is strictly read-only — the earlier Modify Items flow has been retired.

**Header actions by status:**
- **New** → Cancel + Confirm Order
- **Confirmed** → Cancel + Mark as Delivered
- **Delivered / Cancelled** → no actions (fully read-only).

**Export Orders dialog** — Start Date + End Date + Format (CSV / XLSX) inputs. Default range is the last 30 days. End Date auto-fills to Start + 30 days (capped at today) when Start changes. Strict 31-day max span. The file is a 23-column line-item sheet (one row per line item) with order-level fields repeating on every row.

### 6.5 Customers (`/customers`)

Auto-register flow — every buyer who places an order from the Buyer Application lands here automatically; the seller never adds a customer by hand.

**List page** — five-column table (Business Name · Mobile · Company · Status · Actions). The page header has Search + Filters (Status, Company) + Export. Clicking the *N companies* cell opens a **Linked Companies popup** with per-row Block / Unblock controls.

**Per-company Block / Unblock** — status is tracked on every (customer × company) link, not on the customer record. A customer can be Active for ITC and Blocked for Marico simultaneously. The row's Status badge is a roll-up:
- All Active → green *Active*
- All Blocked → red *Blocked*
- Mixed → amber *Mixed (N/M)* with a tooltip explaining the split.

**Detail page** *(`/customers/:customerId`)* — four cards on the left (Basic Information, Address Details, Business Information, Linked Companies) and a sticky OpenStreetMap card on the right. The Linked Companies card carries inline Block / Unblock per company link. The header has no customer-level Block CTA — every block decision is scoped per-company.

**Export** — 9-column CSV, one row per (customer × company), with the per-company Status on each row.

### 6.6 Reports (`/reports`)

Hub of six analytics surfaces:

1. **Sales Orders** — orders over time, top customers, breakdown by marketplace.
2. **Inventory Insights** — stock-on-hand, low-stock alerts, reservation pressure.
3. **Product Performance** — top SKUs, brand performance, slow movers.
4. **Customer Insights** — auto-register volume, repeat-order patterns, blocked-customer count.
5. **Schemes & Offers** — scheme uptake, discount-spend totals.
6. **Operations & Delivery** — fulfilment SLAs, cancellation reasons, marketplace mix.

All six surfaces are read-only and ship with date-range filters + export buttons.

### 6.7 Settings (`/settings`)

Sub-pages grouped by domain. Most are toggle-and-form pages with persist-to-store-on-save semantics:

- **Store Settings** — storefront name, hours, contact info.
- **Order Settings** — auto-confirm window, fallback statuses.
- **Shipping Settings** — packaging defaults, weight thresholds.
- **Payment Settings** — UPI / bank account / COD configuration.
- **Customer Settings** — auto-register defaults, blocked-customer notification.
- **Communication Settings** — email / SMS templates, sender identity.
- **Logistics Settings** — toggle Logistics module on/off (drives whether the Logistics sidebar item is enabled).

### 6.8 KYC (`/kyc`)

Static document-upload + status surface for the seller's GST / PAN / FSSAI / business-registration documents. Phase 1 ships read-only — uploads are mocked.

### 6.9 Connectors (`/connectors`)

Per-marketplace integration cards (ONDC, Amazon, Flipkart, etc.). Each card shows connection status, last sync time, and a Connect / Disconnect toggle.

### 6.10 Support (`/support`)

A four-card static contact page. Row 1: Phone Support (`+91 91212 22836`, tel-link) + Email Support (`info@qwipo.com`, mailto-link). Row 2: Working Hours + FAQ blurb. Same content for every seller.

### 6.11 Profile (`/profile`)

Seller's own account — name, mobile, email, avatar, sign-out.

### 6.12 Design System (`/design`)

A read-only handbook of the design tokens, primitive components, and patterns the console is built on. Accessible to the Designer persona without going through the sales/seller flow.

### 6.13 Admin surfaces (`/admin/*`)

- **Active Sellers** — list of onboarded sellers.
- **Add User** — onboarding flow for a new seller.
- **Seller Detail** — per-seller profile with linked connectors.
- **Companies & Brands** — master-data editor for the company → brand hierarchy.
- **Category Master** — ONDC eB2B category list.
- **Connectors** — admin-level view of every marketplace connector.
- **New Requests** — queue of pending onboarding requests.
- **Error / Loading Screens** — galleries surfaced only on the empty-mode admin persona for QA review.

---

## 7. Cross-cutting design rules

These show up everywhere; the team has converged on them and they should not be re-litigated module by module.

1. **Empty states are first-class.** Every list page renders a friendly EmptyState illustration (centred icon + title + helper line) when the dataset is fresh. Toolbar elements that can't act on a zero-row dataset (Filters, Export) are hidden in this state; only Search stays visible so the chrome reads as a real page.
2. **No hand-add for auto-flowing data.** Customers and Orders never have an *Add* CTA — both flow in from the Buyer Application. SKUs do have an Add flow because the seller authors their own catalog.
3. **Destructive actions go through a named confirmation dialog.** The dialog title names what's being affected (*"Block {Business Name} for Marico?"*, *"Cancel Order"*, *"Block this customer?"*). The dialog can't be dismissed with an X — the seller must explicitly Cancel or confirm.
4. **Status badges are colour-coded consistently:** New (blue) · Confirmed (green) · Delivered (emerald or purple, per page) · Cancelled (red) · Mixed (amber) · Pending (yellow).
5. **Toasts confirm consequence + count.** Every multi-record action's success toast names what changed (e.g., *"20 order(s) confirmed successfully! Dispatch scheduled for {date} at {time}."*).
6. **Validation is inline-first.** Forms surface errors directly under the offending input. Page-level error banners are reserved for unrecoverable failures.
7. **Hover-to-copy on identifier columns.** The list pages render `<CopyOnHover>` around Order IDs, SKU codes, mobile numbers, and similar — hovering reveals a copy affordance.
8. **Per-tab search beats a global one** for list pages with tabs (Orders). The search bar sits inside each tab's body so switching tabs preserves the search context per tab.
9. **The shared `<BulkImportDialog>` is the single bulk-import surface.** Every flow that needs an upload — Add SKU, Price & Stock, Customers (future), Orders (future) — drives the same four-step modal with a per-flow config (`title`, `instructions`, `sample`, `validate`, `onImport`, `successToast`). The component lives in `app/components/bulk-import-dialog.tsx`.
10. **Hard-coded contact info on the Support page is intentional.** Phase 1 doesn't expose an admin surface for editing it; the values live in the Support component itself.

---

## 8. Data model — shared stores

The console runs on an **in-memory mock store** in this phase. Every module's data lives in a `lib/*-data.ts` file with a publish/subscribe API:

| Store | Owner | Shape (highlights) |
|---|---|---|
| `lib/orders-data.ts` | Orders + Order Detail | `Order = { id, brand, company, retailerName, orderValue, paymentMode, orderDate, status, marketplace, buyerContact?, buyerAddress?, channelOrderId?, lineItems? }`. Status: *New* · *Confirmed* · *Delivered* · *Cancelled*. |
| `lib/customers-demo-data.ts` | Customers | `DemoCustomer = { customerId, customerName, businessName, mobile, email?, fullAddress?, area, city, state, pincode, latitude, longitude, gstNumber?, registeredDate, totalOrders, totalRevenue?, companies: CompanyLink[] }` — every `CompanyLink` carries its own `status: "Active" | "Blocked"`. |
| `lib/offers-data.ts` | Offers & Schemes | `QPSScheme = { id, name, sku, status, startDate, endDate, slabs }`. |
| `lib/sku-catalog.ts` | SKU dropdown helper | Distinct SKU list across the seller's catalog. |
| `lib/sku-import-template.ts` | Bulk SKU import | `SKU_FIELDS` schema (single source of truth for both the template generator + the upload parser). `downloadSkuTemplate()` / `parseSkuImportFile()`. |
| `lib/order-id.ts` | New Order ID format | `generateUniqueOrderId(marketplace, date)` → `QWI-<MKT>-<YYMMDD>-<TOKEN>` (e.g., *QWI-ONDC-260330-8F3K92*). |
| `lib/logistics-settings.ts` | Logistics toggle | Drives whether the Logistics sidebar item is enabled. |
| `lib/auth-context.tsx` | Auth | Logged-in user + their `dataMode` (`demo` vs `empty`). |
| `lib/data-mode.ts` | Demo / empty branching | `isEmptyMode()` helper used across pages to render zero-row states. |
| `lib/ondc-validation.ts` | SKU ONDC field rules | ONDC schema definitions, per-field validation. |
| `lib/qps-validation.ts` | QPS slab rules | Slab range / discount validation. |
| `lib/bizom-validation.ts` | Legacy Bizom CSV parser | Retired from the live UI; kept for reference. |

Each store exports `getXxx()`, `setXxx()` / `updateXxx()`, and `subscribeToXxx(cb)`. Pages mirror the store in local state and re-pull on store-change notifications, so a write from one page re-renders every subscriber without a manual reload.

In production, every `lib/*-data.ts` is replaced with a real back-end client; the page-level subscribe pattern stays the same so the UI surface doesn't change.

---

## 9. UX & Design system

The console is built on a **Qwipo-customised shadcn/ui foundation**:

- **Primitives:** Radix UI (Dialog, Dropdown, Tabs, Select, Checkbox, Switch, Tooltip, Toast, Accordion, etc.).
- **Styling:** Tailwind CSS with a custom `theme.css` overlay; light + dark themes via `next-themes`.
- **Icons:** `lucide-react`.
- **Animations:** `motion/react` for drawers + dialogs + page transitions.
- **Toasts:** `sonner`.
- **Tables:** custom — built directly on `<table>` + sticky headers + the shared `<ListPagination>` component.
- **Charts:** `recharts` (Reports module).
- **Forms:** `react-hook-form` for the heavier forms (Add SKU manual, Settings sub-pages).
- **Date pickers:** `react-day-picker` wrapped in Tailwind primitives.
- **File parsing:** `exceljs` for `.xlsx` read + write (dynamically imported so the ~900 KB cost only lands when the seller actually bulk-imports).
- **Drag-and-drop:** `react-dnd` (used in scheme-builder slab reordering).

The full design vocabulary — colour tokens, spacing scale, typography, component states, do's & don'ts — lives at `/design` and is the source of truth that every page's CSS layers reference.

**Responsive:** desktop-first with mobile-aware breakpoints. All grids collapse cleanly to a single column at `md`/`sm` breakpoints. Mobile-only flows (e.g., scanning a QR code on the buyer app to test orders) are out of scope.

**Accessibility:** the design system targets WCAG 2.1 AA — colour contrast minimums, keyboard navigation, focus-visible rings on every interactive element, screen-reader labels on icon-only buttons.

---

## 10. Non-functional requirements

| Dimension | Target | Notes |
|---|---|---|
| **First-paint** | ≤ 1.5 s on a desktop broadband connection | The main bundle is ~2.2 MB / 564 KB gzipped today. ExcelJS is lazy-loaded so it's not in the critical path. |
| **Interaction latency** | ≤ 100 ms for in-page UI (tab switch, filter apply, search keystroke) | Achieved by keeping the dataset in memory and avoiding network round-trips. |
| **Bulk-import** | 500 rows validated client-side in < 1 s | The validator walks the schema synchronously; the 5-second simulated delay is a demo-only flourish. |
| **Browser support** | Latest two majors of Chrome, Edge, Safari, Firefox | No IE11; no `<picture>`/`srcset` polyfills. |
| **Offline** | Not supported in this phase | The seller's actions need a live back-end in production. |
| **Auth session** | OTP-based, with logout on browser-close | Real session-lifetime config wires up in the back-end. |
| **Concurrency** | Single-tab in-store; cross-tab via the shared store's subscribe API | Two tabs of the same console on the same machine stay in sync. |

---

## 11. Phasing & roadmap

### Phase 1 (shipped or in QA)

- Auth (OTP login, persona switching).
- Seller console chrome: sidebar, top bar, theme toggle.
- Dashboard (static demo data).
- My SKU list + detail + manual Add SKU.
- Bulk Import: Add SKU (3-tab .xlsx template) + Update Price & Stock (Yes/No availability).
- Offers & Schemes: list + create flow (percent slabs only).
- Orders: list (5 tabs) + detail + lifecycle actions (Confirm / Cancel / Mark Delivered) + bulk actions + Export Orders dialog.
- Customers: list + detail + per-company Block / Unblock + filter-aware Export.
- Settings sub-pages.
- KYC + Connectors (read-only).
- Support page.
- Reports (six static surfaces).
- Admin console: dashboard, sellers, companies & brands, category master, connectors, requests queue.

### Phase 2 (active development)

- New Order ID format (`QWI-<MKT>-<YYMMDD>-<TOKEN>`).
- Customer module rework (per-company Block, Class field retired, roll-up Status badge).
- SKU detail revamp (unified 2-tab view, inline validation, Group Name field, Weight in KG auto-calc).
- ExcelJS migration on the SKU bulk-import write path.
- Bulk-import error report standardisation (5-column CSV with raw SKU Code + SKU Name + Value Entered).
- Modify Items retirement on the Order Detail page.
- Mark as Delivered single-order CTA on the Order Detail page.

### Future (out of scope today)

- Mobile app.
- Multi-seller collaboration / live presence.
- AI-driven pricing or restock suggestions.
- Real-time webhook ingestion (today's flows are pull-based).
- An admin self-service surface for hard-coded settings (Support contacts, currency, region defaults).
- Public API.

---

## 12. Open questions and risks

| # | Topic | Notes |
|---|---|---|
| Q-1 | **Bulk import row cap** — is 500 the right number for production? | The demo enforces 500; real seller catalogs occasionally run 5 000+. The cap may need to lift, with a paginated upload pattern, in production. |
| Q-2 | **Auto-register cross-channel dedup** | A buyer who orders on ONDC under one phone number and on Amazon under another would create two Customer records. Cross-channel dedup is out of scope for now. |
| Q-3 | **Marketplace catalog publishing** | The Connectors page tracks status but does not yet drive a "Publish my SKU to ONDC" action. That sits in the marketplace-publishing roadmap. |
| Q-4 | **Discount slab type expansion** | Phase 1 ships percent-discount slabs only. Flat-rupee slabs and tier-conditional pricing are common asks but out of scope until QPS V2. |
| Q-5 | **Permission model** | Today every seller-side user is a `Seller Admin`. Sub-roles (read-only viewer, finance-only) would require a real RBAC surface; not in scope today. |
| R-1 | **In-memory store** in the demo build will mislead first-time reviewers about persistence guarantees. We must call out clearly that the production build wires real back-end services. |
| R-2 | **Mock data drift.** The seed data for the customer / order modules has to stay consistent with the schema; a schema change without a corresponding seed update breaks the empty-mode walkthrough. |
| R-3 | **Bundle size**. The main bundle is creeping past 2 MB raw. Future code-splitting work needed before we onboard heavier modules (real-time charts, mapping). |

---

## 13. Documentation map

| Where | What lives there |
|---|---|
| `/design` route in-app | Design system handbook — tokens, primitives, patterns. |
| `app/lib/sku-import-template.ts` | Single source of truth for the SKU bulk-import schema. |
| `app/lib/order-id.ts` | New Order ID format + generator. |
| `app/lib/customers-demo-data.ts` | Customer data shape + per-company Block/Unblock contract. |
| `app/components/bulk-import-dialog.tsx` | Shared bulk-import flow + standardised error-report CSV builder. |
| Azure DevOps Feature 19093 family | SKU + Bulk Import user stories. |
| Azure DevOps Feature 19173 family | Orders user stories. |
| Azure DevOps Feature 19298 family | New SKU Module stories (Phase 2). |
| Azure DevOps Feature 19337 family | New Customer Module stories (Phase 2). |
| Azure DevOps Feature 19187 family | Support, Profile, settings stories. |
| `~/.claude/skills/user-story-creation/SKILL.md` | The user-story authoring rubric (PM-side). |

---

## 14. Glossary

- **ONDC** — Open Network for Digital Commerce; India's interoperability protocol that the seller publishes their catalog into.
- **DMS** — Distribution Management System; the seller's existing inventory + price source. Surfaced as the read-only left column of the SKU detail editor.
- **QPS** — Quantity Per Slab; the discount-on-quantity scheme model the offers module uses.
- **Channel Order ID** — the marketplace's own identifier for an order (e.g., *ONDC-ORD-789456*) that the seller can quote to the buyer.
- **Seller-linked Company** — a company the seller has been authorised to sell on behalf of (e.g., the distributor sells ITC + Marico + Gemini brands).
- **Buyer Application** — the retailer-facing storefront the customer uses to place orders. Orders flow from there into the Seller Store.
- **Bulk Import** — the catalog-scale upload flow for adding SKUs or refreshing price & stock. Implemented via the shared `<BulkImportDialog>` component.
- **Auto-register** — the system creating a Customer record on the buyer's first order, without any seller-side action.
- **Per-company Block** — restricting a customer from ordering against one of the seller's companies while leaving their access to other companies unaffected.
- **Empty mode** — a build / persona where every store is seeded with zero rows so every screen renders its inception-day empty state.

---

*End of PRD.*
