# QWIPO SELLER STORE — Settings, Phase 1

**User Story Specifications**

| Field | Value |
| --- | --- |
| Document Type | User Story Specifications — Settings Module |
| Module | Seller Admin — Settings (Hub + 7 sub-pages) |
| Persona | Seller Admin (Distributor) |
| Business Owner | Product Team (Qwipo Seller Store) |
| Total Stories | 8 (ST-01 through ST-08) |
| Version | 1.0 — Draft (initial dedicated coverage of Settings module) |
| Date | 2 May 2026 |
| Status | Ready for Dev |
| Document Owner | Omkar Charankar |
| Companion Documents | Seller-Store-User-Stories-Phase1.docx; Seller-Store-Super-Admin-User-Stories-Phase1.docx; Seller-Store-Orders-User-Stories-Phase1.docx; Seller-Store-Offers-Schemes-User-Stories-Phase1.docx; Seller-Store-Support-User-Stories-Phase1.docx; Seller-Store-ONDC-SKU-Validation-Rules.docx |

## Document Scope & Note to Reviewer

**SCOPE:** This document is the dedicated user-story specification for the Qwipo Seller Store — Settings module under the Seller Admin persona. The Settings hub at `/settings` exposes a 6-card grid that links to seven sub-pages: Store, Order, Shipping, Serviceability, Payment, Customer, and Communication. Two of the sub-pages — Shipping and Payment — are gated as "Coming Soon" on the hub even though their underlying implementations are present in the codebase; this document captures the desired Phase 1 behaviour for both the gated state and the full implementation so the spec is ready when product flips them on.

**GROUNDING:** Stories are grounded in the actual implementation under `src/app/pages/settings.tsx` and the seven sub-pages under `src/app/pages/settings/`, plus the brand-specific CustomerSettingsDrawer referenced from the Customer module.

**OUT OF SCOPE:** Profile Management (route: `/profile`) and KYC (route: `/kyc`) are top-level Seller Admin routes — they are NOT nested under `/settings/`. They cover the seller's account / company / bank / identity verification surface and warrant their own dedicated document; they are intentionally excluded here to keep this document focused on the `/settings/` subtree. Reports (route: `/reports`) and Connectors (route: `/connectors`) are also out of scope.

## Persona Overview

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Distributor configuring their store | Reach every configurable surface from a single hub with a clear view of what is gated in Phase 1 | Without a single hub + visible gating, the seller does not know which configurations are live and which are deferred |

## Settings Subtree — Map / Navigation

The complete `/settings/` surface with hub-card status, dependent module references and the story that owns each surface.

| # | Route | Hub Card | Phase 1 Status (in hub) | Owner Story |
| --- | --- | --- | --- | --- |
| 1 | /settings | Hub itself (6 cards in 2-col / 3-col grid) | Available | ST-01 |
| 2 | /settings/store | Store Settings (Store icon, blue) | Available — clickable | ST-02 |
| 3 | /settings/order | Order Settings (Cart icon, purple) | Available — clickable | ST-03 |
| 4 | /settings/shipping | Shipping Settings (Truck icon, amber) | Coming Soon — disabled card (opacity 50) | ST-04 |
| 5 | /settings/serviceability | Serviceability (Map-pin icon, green) | Available — clickable | ST-05 |
| 6 | /settings/payment | Payment Settings (Wallet icon, rose) | Coming Soon — disabled card (opacity 50) | ST-06 |
| 7 | /settings/customer | (NOT on the hub) | Reachable from the Customer module / brand drawer only | ST-07 |
| 8 | /settings/communication | Communication Settings (Message icon, cyan) | Available — clickable | ST-08 |

## Story Index

| # | Story Title | Module | Priority | Dependency | Status |
| --- | --- | --- | --- | --- | --- |
| ST-01 | Settings — Hub Landing Page (Card Grid + Coming Soon Gating) | Settings | Medium | None | Ready for Dev |
| ST-02 | Settings — Store Settings (Status, Working Hours, Holidays, Store Info) | Settings | High | ST-01 | Ready for Dev |
| ST-03 | Settings — Order Settings (Min / Max, Processing Time, Cancellation, Returns) | Settings | High | ST-01 | Ready for Dev |
| ST-04 | Settings — Shipping Settings (Phase 1 Coming Soon; full spec for next phase) | Settings | Medium | ST-01 | Ready for Dev |
| ST-05 | Settings — Serviceability (Polygon-based Delivery Areas per Company) | Settings | High | ST-01 | Ready for Dev |
| ST-06 | Settings — Payment Settings (Phase 1 Coming Soon; full spec for next phase) | Settings | Medium | ST-01 | Ready for Dev |
| ST-07 | Settings — Customer Settings (Auto-Approval + Brand-Specific Drawer) | Settings | Medium | Customer module | Ready for Dev |
| ST-08 | Settings — Communication Settings (WhatsApp Connect + Notification Preferences) | Settings | High | ST-01 | Ready for Dev |

---

# USER STORY ST-01

## Settings — Hub Landing Page (Card Grid + Coming Soon Gating)

*Epic: Seller Admin — Settings   |   Priority: Medium   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Settings — Hub Landing Page (Card Grid + Coming Soon Gating) |
| Epic / Feature Link | Seller Admin — Settings |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Medium — the hub is the entry point to every Settings sub-page; it must clearly indicate which configurations are available in Phase 1 and which are gated. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — distributor configuring their store. |

**Business Context**

**WHY:** Settings consists of seven distinct configuration surfaces. The Hub gives the Seller Admin a single landing page with one card per area, a short description, and a clear visual gate for any area not yet released in Phase 1. Cards that are released route on click; cards marked Coming Soon are visibly disabled (opacity 50, cursor not-allowed, Coming Soon badge) and do not navigate. This keeps expectations honest while reserving the IA for future releases.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Distributor configuring their store | Reach any settings sub-page in one click and see at a glance which areas are released | Without visible gating, sellers waste time clicking dead-end cards or assume features exist when they don't |

**Success Metrics**

- Hub load time — page renders with zero JS / route errors in 100% of sessions.
- Time from "I want to change a setting" → land on the right sub-page — target under 5 seconds (one nav click + one card click).

**Real-World Scenario**

**CURRENT STATE:** Seller Admin needs to set their working hours for next week's holidays.

**DESIRED STATE:** Seller Admin clicks Settings in the left nav, lands on the Hub, sees six cards in a 3-column grid (2-column on tablet, 1-column on mobile), clicks Store Settings, and is taken to `/settings/store`.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to land on a clean Settings hub that shows all configuration areas as cards and clearly gates the Coming Soon ones, so that I always know what's configurable in Phase 1 and where to start.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin clicks Settings in the left navigation
- **When** the page loads
- **Then** the system renders the Hub with: (1) a top toolbar showing the sub-text "Manage your store configurations"; (2) a card grid showing exactly six cards in this order: Store Settings, Order Settings, Shipping Settings, Serviceability, Payment Settings, Communication Settings.

**AC-2:**
- **Given** the Hub is rendered
- **When** the user inspects the cards available in Phase 1 (Store, Order, Serviceability, Communication)
- **Then** each card shows: a colour-coded icon, the card title, a one-line description, and a "Configure ›" affordance; the card is hover-elevated and clickable.

**AC-3:**
- **Given** the Hub is rendered
- **When** the user inspects the Shipping Settings and Payment Settings cards
- **Then** both cards show a "Coming Soon" badge in the top-right; the card is rendered at 50% opacity with cursor: not-allowed; the "Configure ›" affordance is hidden; clicking does NOT navigate.

**AC-4:**
- **Given** the user clicks any non-gated card
- **When** the click is registered
- **Then** the system navigates to the card's path: Store → /settings/store; Order → /settings/order; Serviceability → /settings/serviceability; Communication → /settings/communication.

**AC-5:**
- **Given** the user clicks a Coming Soon card (Shipping or Payment)
- **When** the click is registered
- **Then** no navigation happens; no error or modal appears; the badge alone communicates the state.

**AC-6:**
- **Given** the user navigates directly to /settings/shipping or /settings/payment via deep link or browser back
- **When** the route resolves
- **Then** the underlying page renders normally (the Coming Soon gating is at the hub card only, not at the route guard — see ST-04 / ST-06 BR-1). [NEEDS INPUT] confirm whether deep links to gated routes should be blocked / 404'd or kept reachable for QA.

**AC-7:**
- **Given** the user opens the Hub on a small viewport
- **When** the page renders
- **Then** the grid stacks: 1 column on mobile, 2 columns on tablet, 3 columns on desktop.

**AC-8:**
- **Given** Customer Settings exists at /settings/customer
- **When** the Hub renders
- **Then** Customer Settings is intentionally NOT exposed on the Hub; it is reachable from the Customer module / CustomerSettingsDrawer only (see ST-07 BR-1).

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | The Hub is fully static — no API calls, no spinners. Card metadata (id, title, description, icon, path, comingSoon flag) is hardcoded for Phase 1. |
| BR-2 | Six cards are exposed on the Hub in this fixed order: Store Settings, Order Settings, Shipping Settings, Serviceability, Payment Settings, Communication Settings. |
| BR-3 | Coming Soon cards in Phase 1: Shipping Settings, Payment Settings. Both must render at 50% opacity, with cursor: not-allowed, a Coming Soon badge in the top-right, and the Configure CTA hidden. |
| BR-4 | Customer Settings (/settings/customer) is intentionally not exposed on the Hub. It is reachable from the Customer module via the CustomerSettingsDrawer (per-brand approval mode) and via direct route only. |
| BR-5 | If the Phase 1 status of any card changes (e.g., Payment is released), this story is the source of truth and must be revised before the change ships. |
| BR-6 | [NEEDS INPUT] Whether a Customer Settings card should be added to the Hub once the brand-drawer flow is consolidated. |

**Hub Card Specification**

| # | Card | Icon (lucide) | Description | Route | Phase 1 Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Store Settings | Store (blue) | Manage holidays and store availability | /settings/store | Available |
| 2 | Order Settings | ShoppingCart (purple) | Configure minimum order values and order rules | /settings/order | Available |
| 3 | Shipping Settings | Truck (amber) | Set delivery charges and shipping rules | /settings/shipping | Coming Soon |
| 4 | Serviceability | MapPin (green) | Configure company-level delivery areas | /settings/serviceability | Available |
| 5 | Payment Settings | Wallet (rose) | Configure payment providers and modes | /settings/payment | Coming Soon |
| 6 | Communication Settings | MessageCircle (cyan) | Configure email and SMS settings | /settings/communication | Available |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | User refreshes the Hub | Page re-renders identically; no API calls. |
| 2 | User opens /settings URL directly (deep link) | Same content; no auth bypass. |
| 3 | User uses keyboard tab navigation through the cards | Tab order matches BR-2 (Store → Order → Shipping → Serviceability → Payment → Communication); Enter / Space activates clickable cards; Coming Soon cards are skipped or non-activatable. |
| 4 | User clicks a Coming Soon card | No-op; no toast, no modal. |
| 5 | User has slow network | Static content loads immediately; no spinner. |
| 6 | Future card is added (e.g., Customer Settings) | Hub layout extends to a 7th card without reflowing the existing IA; per BR-5 this story is updated first. |

### Error Scenarios

**[NOT APPLICABLE]** — Static page with no data fetch, no API calls, no user input. There are no failure modes beyond standard page-load failures handled by the application shell.

### Data Specification

**[NOT APPLICABLE]** — No data fields, no inputs, no persistence. Card metadata is hardcoded per BR-1.

### Workflow

```
1. Seller Admin clicks Settings in the left navigation.
2. System routes to /settings; left nav marks Settings active.
3. System renders the toolbar + the 6 cards in fixed order (BR-2).
4. [DECISION] Seller Admin chooses an action:
    IF clicks an Available card:        Navigate to that card's route.
    IF clicks a Coming Soon card:       No-op (BR-3).
    IF clicks any other left-nav item:  Navigate; Settings is no longer active.
```

### Section 4 — UI/UX

**Wireframe Notes (Component Hierarchy)**

```
Page: Settings — Hub
├─ App Shell Header (global)
├─ Left Navigation (Settings active)
└─ Main Content Area (gray bg)
    ├─ Toolbar  Sub-text: "Manage your store configurations"
    └─ Card Grid (3-col desktop, 2-col tablet, 1-col mobile)
        ├─ Card 1: Store Settings           [available]
        ├─ Card 2: Order Settings           [available]
        ├─ Card 3: Shipping Settings        [Coming Soon — 50% opacity]
        ├─ Card 4: Serviceability           [available]
        ├─ Card 5: Payment Settings         [Coming Soon — 50% opacity]
        └─ Card 6: Communication Settings   [available]

Each available card:
    [icon tile (colour-coded)]   Card Title
    Description (1 line)
    Configure ›   (link-styled)

Each Coming Soon card:
    [icon tile]   Card Title    [Coming Soon badge — top-right]
    Description (1 line)
    (no Configure CTA)
```

**Field Validations**

**[NOT APPLICABLE]** — No input fields on the Hub.

**Empty States**

**[NOT APPLICABLE]** — Hub always renders the same six cards (BR-2); there is no list / collection that can be empty.

---

# USER STORY ST-02

## Settings — Store Settings (Status, Working Hours, Holidays, Store Info)

*Epic: Seller Admin — Settings   |   Priority: High   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Settings — Store Settings (Status, Working Hours, Holidays, Store Info) |
| Epic / Feature Link | Seller Admin — Settings |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | High — working hours, holidays and the Accept-Orders toggle govern when buyers can place orders against this seller. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — configuring when the store accepts orders. |

**Business Context**

**WHY:** The store has to advertise consistent availability to buyers — weekly working hours, fixed holidays the seller observes, plus an emergency Accept Orders toggle to pause intake without changing the schedule. Store Settings is the single screen for all of this. It also surfaces read-only Store Information (name, contact, email) drawn from the seller's onboarding profile so the seller can verify what buyers see.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Configuring when the store accepts orders | Set working hours, mark holidays, and pause / resume intake at will | Without a single store-status surface, sellers either accept undeliverable orders or pause intake by going offline entirely |

**Success Metrics**

- 100% of saved Working Hours entries pass per-day Open \< Close validation (no invalid windows reach buyers).
- Time to add a fixed holiday and save — target under 30 seconds.

**Real-World Scenario**

**CURRENT STATE:** Seller is closing for Diwali on 12 Nov. Working hours change to 10am–7pm starting next month.

**DESIRED STATE:** Seller Admin opens Store Settings, adjusts the per-day working hours grid (using Apply to All to set a baseline), adds 12 Nov to Fixed Holidays, and saves — a toast confirms the update.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to configure my store status, weekly working hours, fixed holidays, and view my store information, so that buyers see consistent availability and I can pause / resume order intake at will.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin opens Store Settings
- **When** the page loads
- **Then** the page renders four sections in this order: Store Status, Working Hours, Fixed Holidays, Store Information.

**AC-2:**
- **Given** the Store Status section is shown
- **When** the user inspects the Accept Orders toggle
- **Then** the toggle reflects the current state; toggling it ON / OFF updates the local state immediately and surfaces a status message (e.g., "Currently accepting orders" / "Order intake paused").

**AC-3:**
- **Given** the Working Hours section is shown
- **When** the user inspects the grid
- **Then** a 7-day grid is displayed (Monday → Sunday) with per-day Open Time, Close Time, and a Closed toggle; an "Apply to All" helper sets the same Open / Close times across all days that are not marked Closed.

**AC-4:**
- **Given** a day is marked Closed
- **When** the row renders
- **Then** the Open / Close inputs for that day are disabled; the row visually indicates Closed.

**AC-5:**
- **Given** the Fixed Holidays section is shown
- **When** the user adds a holiday (date + label)
- **Then** the new entry appears in the list; the user can remove any entry via a delete control.

**AC-6:**
- **Given** the Store Information section is shown
- **When** the user inspects the fields
- **Then** Store Name, Description, Contact Phone, Email are displayed as read-only context (sourced from Profile).

**AC-7:**
- **Given** the user makes any change in Store Status, Working Hours, or Fixed Holidays
- **When** the user clicks Save
- **Then** the change is persisted; a success toast is shown (e.g., "Store settings updated."). [NEEDS INPUT] confirm whether saves are per-section or page-wide.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Sections rendered in order: 1) Store Status; 2) Working Hours; 3) Fixed Holidays; 4) Store Information (read-only). |
| BR-2 | Accept Orders toggle is independent of Working Hours — turning it OFF pauses intake even during working hours; turning it ON does NOT make the store available outside working hours. |
| BR-3 | Working Hours grid covers all 7 days; each day independently has Open / Close times or a Closed flag. |
| BR-4 | "Apply to All" copies the currently focused day's Open / Close times to every other day that is not marked Closed. |
| BR-5 | Fixed Holidays accept date + label; duplicates by date are not allowed. [NEEDS INPUT] confirm date format and recurring-holiday support. |
| BR-6 | Store Information fields (Name, Description, Phone, Email) are read-only on this page; edits live on the Profile page (out of scope here). |
| BR-7 | Phase 1 implementation persists to local component state with a toast confirmation; backend API integration is [NEEDS INPUT]. |
| BR-8 | [NEEDS INPUT] Time-zone the Working Hours are interpreted in (proposal: IST, locked). |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | User marks all 7 days as Closed | Allowed (effectively the store is closed every day); Accept Orders toggle becomes informational. |
| 2 | User toggles a day from Closed back to Open | Open / Close inputs become editable with sensible defaults; user can adjust. |
| 3 | User adds a holiday that has already passed | Allowed; informational only — holiday is still recorded for audit. |
| 4 | User clicks Apply to All without entering any times | Either no-op (silently) or surface a hint "Set Open / Close times first." |
| 5 | User toggles Accept Orders OFF mid-day | Existing in-flight orders are unaffected; new incoming orders are paused per BR-2. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-STS-01 | Save API timeout / server error | "Could not save store settings. Please retry." | Keep page state; allow retry. |
| ERR-STS-02 | Validation failure on Save | Per-field inline messages (see Field Validations). | Block save; do not call API. |
| ERR-STS-03 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| acceptOrders | Boolean | Yes | ON / OFF; emergency intake toggle. | Toggle. |
| workingHours[day] | Object | Yes | Per-day { openTime, closeTime, closed }; openTime \< closeTime when not closed. | User input. |
| fixedHolidays[] | Array | Yes | Each entry { date, label }; unique by date. | User input. |
| storeName / description / contactPhone / email | String | Read-only | Sourced from Profile. | Profile (snapshot). |

### Workflow

```
1. Seller Admin opens Store Settings (from Hub or deep link).
2. System renders 4 sections (Store Status / Working Hours / Fixed Holidays / Store Information).
3. Seller Admin edits any of: Accept Orders toggle; per-day Working Hours; Fixed Holidays.
4. (Optional) Seller Admin clicks "Apply to All" to copy a day's hours across the week.
5. [DECISION] Seller Admin clicks Save:
   IF validation fails:    Show inline errors; block save.
   ELSE:                   Persist; success toast.
```

### Section 4 — UI/UX

**Wireframe Notes**

```
Page: Settings — Store Settings
├─ Page Header  /  Back to Settings breadcrumb
├─ Section: Store Status
│   └─ [Toggle] Accept Orders   |  status text
├─ Section: Working Hours
│   ├─ 7-day grid: Day | Open | Close | Closed toggle
│   └─ [ Apply to All ] helper
├─ Section: Fixed Holidays
│   ├─ Add row: [ Date picker ] [ Label ] [ + Add ]
│   └─ List of holidays with delete (×) per row
├─ Section: Store Information (read-only, sourced from Profile)
│   ├─ Store Name
│   ├─ Description
│   ├─ Contact Phone
│   └─ Email
└─ Action Bar: [ Save ]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Working Hours — Open Time | Required when day is not Closed; format HH:MM; \< Close Time. | "Open time must be before close time." | On-blur |
| Working Hours — Close Time | Required when day is not Closed; format HH:MM; \> Open Time. | "Close time must be after open time." | On-blur |
| Fixed Holiday — Date | Required; not duplicated within the list. | "This date is already in your holidays." | On-add |
| Fixed Holiday — Label | Required; max 50 chars (proposed). | "Label is required." | On-add |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Fixed Holidays — list is empty | No fixed holidays added yet. | — |

---

# USER STORY ST-03

## Settings — Order Settings (Min / Max Amounts, Processing Time, Cancellation, Returns)

*Epic: Seller Admin — Settings   |   Priority: High   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Settings — Order Settings (Min / Max Amounts, Processing Time, Cancellation, Returns) |
| Epic / Feature Link | Seller Admin — Settings |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | High — these knobs govern what orders the seller is willing to accept and how long the buyer has to cancel or return. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — configuring order acceptance rules. |

**Business Context**

**WHY:** Order Settings exposes four independent controls: minimum / maximum order amount; default processing time (how long the seller commits to dispatch); order cancellation window (how long the buyer can self-cancel after placing); and order return rules (with Phase 1 limited to full-order returns).

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Configuring order acceptance rules | Codify min / max thresholds and the SLAs the buyer can rely on | Without these knobs, the seller commits implicitly to thresholds and SLAs that vary by order |

**Success Metrics**

- 100% of saved configurations pass cross-field validation (Maximum \> Minimum; Returns config consistent with toggle).
- Median time to update a single setting and save — target under 20 seconds.

**Real-World Scenario**

**CURRENT STATE:** Seller wants to enforce a ₹500 minimum order, set processing time to 24 hours, allow buyer cancellations within 6 hours.

**DESIRED STATE:** Seller Admin opens Order Settings, sets Minimum Order Amount = 500, Processing Time = 24h, Cancellation Window = 6h, leaves Returns toggled on at Full Order Only / 24h, clicks Save — a toast confirms.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to configure my order acceptance rules — amount thresholds, processing time, cancellation window and return policy, so that buyers see clear order rules and the seller's commitments are codified.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin opens Order Settings
- **When** the page loads
- **Then** the page renders four sections in this order: Minimum / Maximum Order Amount, Default Processing Time, Order Cancellation Window, Order Return.

**AC-2:**
- **Given** the Min / Max section is shown
- **When** the user enters Minimum Order Amount and Maximum Order Amount
- **Then** both are required positive numbers; Maximum \> Minimum; INR.

**AC-3:**
- **Given** the Default Processing Time section is shown
- **When** the user opens the dropdown
- **Then** options are 6h, 12h, 24h, 48h, 72h; one value must be selected.

**AC-4:**
- **Given** the Cancellation Window section is shown
- **When** the user opens the dropdown
- **Then** options are 1h, 3h, 6h, 12h, 24h; one value must be selected.

**AC-5:**
- **Given** the Order Return section is shown
- **When** the user inspects the section
- **Then** the section shows: Returns Allowed toggle (default ON); Return Type field locked to "Full Order Only" with the note "Phase 1 supports full-order returns only"; Return Window dropdown with options 24h or 48h.

**AC-6:**
- **Given** Returns Allowed = OFF
- **When** the section re-renders
- **Then** Return Type and Return Window inputs are disabled / hidden.

**AC-7:**
- **Given** the user clicks Save
- **When** validation passes
- **Then** the changes are persisted; a success toast is shown.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Currency in Phase 1 is INR. |
| BR-2 | Minimum Order Amount and Maximum Order Amount are both required; Maximum \> Minimum. |
| BR-3 | Default Processing Time options: 6h, 12h, 24h, 48h, 72h. |
| BR-4 | Cancellation Window options: 1h, 3h, 6h, 12h, 24h. |
| BR-5 | Return Type is locked to "Full Order Only" in Phase 1; partial-item returns are out of scope. |
| BR-6 | Return Window options: 24h, 48h. The window starts from the order's Delivered timestamp (Orders OR-03 BR-6 — deliveredAt). |
| BR-7 | When Returns Allowed = OFF, Return Type and Return Window are not collected. |
| BR-8 | Phase 1 implementation persists to local component state with a toast confirmation; backend API integration is [NEEDS INPUT]. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Seller enters Min = Max | Validation fails per BR-2; inline error on Maximum. |
| 2 | Seller toggles Returns Allowed OFF after configuring a window | The window value is preserved in state but hidden / inactive; toggling back ON restores the previous selection. |
| 3 | Seller picks the lowest cancellation window (1h) and the slowest processing time (72h) | Allowed; both are independent. |
| 4 | Seller leaves Min Amount blank | Inline error; save blocked. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-ORDS-01 | Save API timeout / server error | "Could not save order settings. Please retry." | Keep page state; allow retry. |
| ERR-ORDS-02 | Validation failure on Save | Per-field inline messages (see Field Validations). | Block save; do not call API. |
| ERR-ORDS-03 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| minOrderAmount | Decimal (INR) | Yes | \> 0; \< maxOrderAmount. | User input. |
| maxOrderAmount | Decimal (INR) | Yes | \> minOrderAmount. | User input. |
| processingTimeHours | Enum | Yes | One of 6 \| 12 \| 24 \| 48 \| 72. | Dropdown. |
| cancellationWindowHours | Enum | Yes | One of 1 \| 3 \| 6 \| 12 \| 24. | Dropdown. |
| returnsAllowed | Boolean | Yes | ON / OFF. | Toggle. |
| returnType | Enum | Locked | "Full Order Only" in Phase 1. | System (locked). |
| returnWindowHours | Enum | Required when returnsAllowed = ON | One of 24 \| 48. | Dropdown. |

### Workflow

```
1. Seller Admin opens Order Settings.
2. System renders 4 sections (Min/Max / Processing / Cancellation / Returns).
3. Seller Admin enters / picks values for each section.
4. (Optional) Seller Admin toggles Returns Allowed OFF -> Return Type / Window inputs hide.
5. [DECISION] Seller Admin clicks Save:
   IF validation fails:    Show inline errors; block save.
   ELSE:                   Persist; success toast.
```

### Section 4 — UI/UX

**Wireframe Notes**

```
Page: Settings — Order Settings
├─ Page Header  /  Back to Settings
├─ Section: Order Amount Limits
│   ├─ Minimum Order Amount (₹ input)
│   └─ Maximum Order Amount (₹ input)
├─ Section: Default Processing Time
│   └─ Dropdown: 6h / 12h / 24h / 48h / 72h
├─ Section: Order Cancellation Window
│   └─ Dropdown: 1h / 3h / 6h / 12h / 24h
├─ Section: Order Return
│   ├─ [Toggle] Returns Allowed (default ON)
│   ├─ Return Type: "Full Order Only" (locked, with Phase 1 note)
│   └─ Return Window dropdown: 24h / 48h
└─ Action Bar: [ Save ]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Minimum Order Amount | Required; numeric; \> 0. | "Minimum order amount is required." | On-blur |
| Maximum Order Amount | Required; numeric; \> Minimum Order Amount. | "Maximum must be greater than minimum." | On-blur |
| Default Processing Time | Required; one of 6 / 12 / 24 / 48 / 72 hours. | "Select a processing time." | On-save |
| Cancellation Window | Required; one of 1 / 3 / 6 / 12 / 24 hours. | "Select a cancellation window." | On-save |
| Return Window | Required when Returns Allowed = ON; one of 24 / 48 hours. | "Select a return window." | On-save |

**Empty States**

**[NOT APPLICABLE]** — Order Settings is a single-form page; no list / collection components that can be empty.

---

# USER STORY ST-04

## Settings — Shipping Settings (Phase 1 Coming Soon; Full Spec for Next Phase)

*Epic: Seller Admin — Settings   |   Priority: Medium   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Settings — Shipping Settings (Phase 1 Coming Soon; Full Spec for Next Phase) |
| Epic / Feature Link | Seller Admin — Settings |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Medium — the page is implementation-ready but gated as Coming Soon on the Hub for Phase 1; this story locks the desired behaviour for both states. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date for un-gating |
| User Persona | Seller Admin — configuring delivery charges and COD. |

**Business Context**

**WHY:** Shipping Settings governs delivery charges, free-shipping thresholds, COD availability, and weight-based shipping tiers. The implementation exists in the codebase, but the Hub gates the card as Coming Soon for Phase 1. This story captures both: (a) the gated state on the Hub; (b) the full functional spec to ship when the gate is lifted.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Configuring delivery charges and COD | Set base / threshold-driven shipping costs, COD availability, and weight tiers | Without these controls, sellers either eat the delivery cost or surprise buyers with ad-hoc charges |

**Success Metrics**

- (Once un-gated) 100% of buyer-facing checkouts reflect the seller's most recent saved shipping configuration.

**Real-World Scenario**

**CURRENT STATE:** Phase 1 — the seller sees a Coming Soon card on the Hub.

**DESIRED STATE (post-un-gating):** Seller Admin opens Shipping Settings, toggles Free Shipping ON, sets Free Shipping Above = ₹999, sets Base Shipping Charge = ₹49, enables COD, fills in 4 weight tiers, clicks Save — a toast confirms.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to configure shipping charges, free-shipping thresholds, COD availability, and weight-based delivery tiers, so that buyers see consistent delivery costs and COD support reflects what the seller can actually fulfil.

### Acceptance Criteria — Phase 1 (Gated)

**AC-1:**
- **Given** Phase 1 is in effect
- **When** the Seller Admin views the Settings Hub
- **Then** the Shipping Settings card is rendered with the Coming Soon badge per ST-01 BR-3 and clicking is a no-op.

**AC-2:**
- **Given** Phase 1 is in effect and the user navigates directly to /settings/shipping
- **When** the route resolves
- **Then** the underlying page renders normally for QA / preview purposes. [NEEDS INPUT] confirm whether deep link should be 404'd in production.

### Acceptance Criteria — Full Functionality (Next Phase)

**AC-3:**
- **Given** the Shipping Settings page is open (post-un-gating)
- **When** the page renders
- **Then** the page shows three sections: Free Shipping, Cash on Delivery (COD), Weight-based Charges.

**AC-4:**
- **Given** the Free Shipping section is shown
- **When** the user inspects the controls
- **Then** the section shows: Free Shipping toggle; Base Shipping Charge (₹); Free Shipping Above (₹, threshold).

**AC-5:**
- **Given** Free Shipping toggle = ON
- **When** the user enters thresholds
- **Then** Base Shipping Charge applies to orders below the Free Shipping Above threshold; orders above the threshold are charged ₹0.

**AC-6:**
- **Given** the COD section is shown
- **When** the user inspects the toggle
- **Then** COD Availability is a single toggle (ON / OFF); when OFF, buyers cannot select COD at checkout.

**AC-7:**
- **Given** the Weight-based Charges section is shown
- **When** the user inspects the grid
- **Then** the grid shows weight tiers (e.g., 0–1kg, 1–5kg, 5–10kg, 10kg+) with editable charges per tier.

**AC-8:**
- **Given** the user clicks Save
- **When** validation passes
- **Then** changes are persisted; success toast.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Phase 1: the Hub gates this card as Coming Soon (ST-01 BR-3). The route remains reachable for development / QA. [NEEDS INPUT] confirm production behaviour for direct deep links. |
| BR-2 | When the gate is lifted, the page must render the three sections per AC-3 in that order. |
| BR-3 | Free Shipping Above threshold is only meaningful when Free Shipping toggle = ON. |
| BR-4 | Weight tiers are seller-editable; the canonical default tier set is [NEEDS INPUT]. |
| BR-5 | Currency: INR. |
| BR-6 | Phase 1 implementation persists to local component state with a toast confirmation; backend API integration is [NEEDS INPUT]. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Free Shipping = ON but Free Shipping Above = 0 | Validation fails per Field Validations (threshold must be \> 0). |
| 2 | Weight tier overlaps with adjacent tier (e.g., 0–5kg and 1–10kg) | [NEEDS INPUT] confirm overlap policy (current implementation does not validate overlaps). |
| 3 | COD = OFF mid-day with COD orders already in flight | In-flight COD orders are unaffected; new buyer attempts to pick COD are blocked at checkout. |
| 4 | Seller leaves all weight-tier charges blank | [NEEDS INPUT] confirm whether at least one tier is required. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-SHP-01 | Save API timeout / server error | "Could not save shipping settings. Please retry." | Keep page state; allow retry. |
| ERR-SHP-02 | Validation failure on Save | Per-field inline messages (see Field Validations). | Block save. |
| ERR-SHP-03 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| freeShippingEnabled | Boolean | Yes | ON / OFF. | Toggle. |
| baseShippingCharge | Decimal (INR) | Yes | ≥ 0. | User input. |
| freeShippingAbove | Decimal (INR) | Required when freeShippingEnabled = ON | \> 0. | User input. |
| codEnabled | Boolean | Yes | ON / OFF. | Toggle. |
| weightTiers[] | Array | Optional | Each entry { minKg, maxKg, charge }; tier set is seller-editable; default tiers [NEEDS INPUT]. | User input. |

### Workflow

```
1. (Phase 1) Seller views Hub -> Shipping card is Coming Soon -> click is no-op.
2. (Post-un-gating) Seller opens Shipping Settings.
3. System renders 3 sections (Free Shipping / COD / Weight-based Charges).
4. Seller toggles / fills values per section.
5. [DECISION] Seller clicks Save:
   IF validation fails:    Show inline errors; block save.
   ELSE:                   Persist; success toast.
```

### Section 4 — UI/UX

**Wireframe Notes**

```
Page: Settings — Shipping Settings  (post-un-gating)
├─ Page Header  /  Back to Settings
├─ Section: Free Shipping
│   ├─ [Toggle] Free Shipping
│   ├─ Base Shipping Charge (₹)
│   └─ Free Shipping Above (₹, threshold)
├─ Section: Cash on Delivery (COD)
│   └─ [Toggle] COD Availability
├─ Section: Weight-based Charges
│   └─ Grid: [0–1kg | charge] [1–5kg | charge] [5–10kg | charge] [10kg+ | charge]
└─ Action Bar: [ Save ]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Base Shipping Charge | Numeric; ≥ 0. | "Charge must be a non-negative number." | On-blur |
| Free Shipping Above | Required when Free Shipping = ON; numeric; \> 0. | "Threshold must be greater than 0." | On-blur |
| Weight tier charge | Numeric; ≥ 0. | "Charge must be a non-negative number." | On-blur |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Weight tiers — no tiers configured | (default tier set seeds the grid) | — |

**Out of Scope**

**[NOT APPLICABLE]** — Per-pincode rate cards, courier integration, AWB generation, real-time rate quotes, multi-warehouse shipping origin selection — these are explicitly deferred.

---

# USER STORY ST-05

## Settings — Serviceability (Polygon-based Delivery Areas per Company)

*Epic: Seller Admin — Settings   |   Priority: High   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Settings — Serviceability (Polygon-based Delivery Areas per Company) |
| Epic / Feature Link | Seller Admin — Settings |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | High — serviceability defines where the seller will deliver; without it, buyers outside the area can place undeliverable orders. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — defining geographic service areas per company they sell for. |

**Business Context**

**WHY:** Serviceability is configured per company (one or more companies are linked to the seller during onboarding by the Super Admin). For each company the seller uploads a GeoJSON polygon that delineates the deliverable area. The page uses a dual-mode UX: a List mode showing all companies and their polygon status, and a Configure mode where the seller picks a company without a polygon (or one already configured to overwrite) and uploads the GeoJSON.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Defining geographic service areas per company | Upload one polygon per linked company so buyers outside the area cannot order | Without serviceability, buyers outside the route place undeliverable orders the seller has to refund |

**Success Metrics**

- 100% of saved polygons pass file-format and size validation.
- Time to upload and confirm a single polygon — target under 60 seconds.

**Real-World Scenario**

**CURRENT STATE:** Seller Admin works with Brand A and Brand B and needs to set up delivery areas for both.

**DESIRED STATE:** Seller Admin opens Serviceability, sees both companies on the List with status "Not configured", clicks Add (or Edit), enters Configure mode, picks Brand A, drops the brand-A.geojson polygon file, sees a green "Polygon configured" badge, and repeats for Brand B.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to configure a delivery polygon per company I sell for, with the option to add or edit, so that buyers outside my serviceable area cannot place undeliverable orders.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin opens Serviceability
- **When** the page loads
- **Then** the page is in List mode showing all companies linked to the seller, each with a status (Polygon configured ✅ / Not configured) and an Edit button; an Add new CTA is present.

**AC-2:**
- **Given** the Seller Admin clicks Add new (or Edit on a row)
- **When** the action runs
- **Then** the page switches to Configure mode showing: a Company dropdown (selectable only for companies without a polygon, OR pre-selected if Edit was clicked), a GeoJSON file upload area, and a back-to-list affordance.

**AC-3:**
- **Given** the Seller Admin uploads a file
- **When** the upload completes
- **Then** the system validates: (a) file size ≤ 5 MB; (b) parses as JSON; (c) is a GeoJSON FeatureCollection, Feature, or Polygon. On any failure, surface a clear error and stay in Configure mode.

**AC-4:**
- **Given** validation passes
- **When** the user confirms
- **Then** the polygon is associated with the chosen company; a success state renders; the Verified "Polygon configured" badge appears for that company in List mode.

**AC-5:**
- **Given** the user is in Configure mode
- **When** the user clicks the back affordance
- **Then** the page returns to List mode without applying any unsaved upload.

**AC-6:**
- **Given** all companies already have polygons
- **When** the user clicks Add new
- **Then** the Company dropdown is empty (or shows a hint "All companies already configured"); the user can use Edit on a row to overwrite an existing polygon instead.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Serviceability is scoped per company. Each company linked to the seller has at most one polygon. |
| BR-2 | List mode displays every company linked to the seller (sourced from the seller's onboarding by Super Admin). Status pills: "Polygon configured" (green tick) or "Not configured" (neutral). |
| BR-3 | Configure mode pre-selects the company when entered via Edit; pre-selects nothing when entered via Add new. |
| BR-4 | Uploaded file constraints: max 5 MB; must parse as JSON; must be one of GeoJSON FeatureCollection, Feature, or Polygon. |
| BR-5 | Editing replaces the existing polygon entirely — the seller is asked to confirm the overwrite. [NEEDS INPUT] confirm whether to keep version history. |
| BR-6 | Phase 1 implementation persists to local component state with a toast confirmation; backend integration is [NEEDS INPUT]. |
| BR-7 | [NEEDS INPUT] Whether the page should preview the uploaded polygon on a map (currently the file is validated but not rendered). |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | User uploads a GeoJSON with a non-Polygon geometry (e.g., LineString) | Reject with a clear error referencing the supported types. |
| 2 | User uploads a \> 5 MB file | Reject with the file-size error. |
| 3 | User edits an existing polygon and uploads a new one | Confirmation prompt before overwrite; on confirm, replace. |
| 4 | Seller has zero companies linked | List mode shows an empty state with a hint to contact Super Admin to link a company first. |
| 5 | User uploads malformed JSON | Parse error surfaces a friendly message. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-SVC-01 | File parse failure | "We could not read this file. Please upload a valid GeoJSON." | Reject upload; remain in Configure mode. |
| ERR-SVC-02 | File too large (\> 5 MB) | "Upload a valid GeoJSON file under 5 MB." | Reject upload. |
| ERR-SVC-03 | Unsupported geometry type | "Only Polygon, Feature, or FeatureCollection are supported." | Reject upload. |
| ERR-SVC-04 | Save API timeout / server error | "Could not save the polygon. Please retry." | Keep Configure mode; allow retry. |
| ERR-SVC-05 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| companyId | String | Yes | One of the companies linked to the seller. | Dropdown selection. |
| polygon (GeoJSON) | Object | Yes | One of FeatureCollection \| Feature \| Polygon; ≤ 5 MB. | File upload. |
| status (derived) | Enum | Yes | "Polygon configured" \| "Not configured" — derived from presence / absence of a polygon. | Computed. |

### Workflow

```
1. Seller Admin opens Serviceability (List mode).
2. System loads all companies linked to the seller; renders status badges per row.
3. [DECISION] Seller chooses an action:
   IF Add new:           Enter Configure mode (Company dropdown empty; pick one).
   IF Edit on a row:     Enter Configure mode (Company pre-selected; warn on overwrite).
4. Seller uploads a GeoJSON file.
5. System validates (size / JSON / geometry type).
   IF invalid:           Show error; stay in Configure mode.
   ELSE:                 Persist polygon; return to List mode; success toast.
6. (Edit case) On confirm overwrite, replace the existing polygon entirely.
```

### Section 4 — UI/UX

**Wireframe Notes**

```
Page: Settings — Serviceability  (Dual-Mode)

MODE: List
├─ Header  /  Back to Settings
├─ [ + Add new ] CTA
└─ Companies table:
    Company | Status (badge: Polygon configured ✓ / Not configured) | [Edit]

MODE: Configure
├─ [ ← Back to list ]
├─ Company dropdown (selectable only for companies without a polygon, OR pre-filled if Edit)
├─ File upload area (drop / browse): GeoJSON; max 5 MB
├─ Inline validation status (success / error)
└─ Footer: [ Cancel ]   [ Save Polygon ]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Company dropdown | Required in Configure mode. | "Select a company." | On-submit |
| GeoJSON file | Required; ≤ 5 MB; valid JSON; type ∈ {FeatureCollection, Feature, Polygon}. | "Upload a valid GeoJSON file under 5 MB." | On-upload |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Serviceability — seller has zero companies linked | No companies linked. Contact your administrator to link a company first. | — |
| Configure mode — Company dropdown empty (all configured) | All companies already configured. | — |

---

# USER STORY ST-06

## Settings — Payment Settings (Phase 1 Coming Soon; Full Spec for Next Phase)

*Epic: Seller Admin — Settings   |   Priority: Medium   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Settings — Payment Settings (Phase 1 Coming Soon; Full Spec for Next Phase) |
| Epic / Feature Link | Seller Admin — Settings |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Medium — the page is implementation-ready but gated as Coming Soon on the Hub for Phase 1. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date for un-gating |
| User Persona | Seller Admin — configuring payment gateways and accepted modes. |

**Business Context**

**WHY:** Payment Settings owns the seller's payment gateway, accepted payment modes (UPI / Cards / Net Banking / Wallets), payment terms (Immediate / Net 7 / 15 / 30 / 45), credit limit, settlement frequency, and payout bank account. The Phase 1 Hub gates this card as Coming Soon. This story locks both the gated state and the full functional spec.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Configuring payment gateways and accepted modes | Select a gateway, enable supported modes, define payment terms, and set payout details | Without these controls, buyers cannot pay through the channels the seller actually supports |

**Success Metrics**

- (Once un-gated) 100% of buyer-facing checkouts present only the payment modes the seller has enabled.

**Real-World Scenario**

**CURRENT STATE:** Phase 1 — the seller sees a Coming Soon card on the Hub.

**DESIRED STATE (post-un-gating):** Seller Admin opens Payment Settings, picks Razorpay, fills the API Key and Secret Key, enables UPI + Cards + Net Banking, picks Net 30 with a Credit Limit of ₹100,000, picks Settlement Frequency = T+1, edits the Bank Account once, and saves — a toast confirms.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to configure my payment gateway, accepted modes, payment terms, settlement frequency and payout bank account, so that buyers can pay through supported channels and the seller receives settlements on a clear schedule.

### Acceptance Criteria — Phase 1 (Gated)

**AC-1:**
- **Given** Phase 1 is in effect
- **When** the Seller Admin views the Settings Hub
- **Then** the Payment Settings card is rendered with the Coming Soon badge per ST-01 BR-3 and clicking is a no-op.

**AC-2:**
- **Given** Phase 1 is in effect and the user navigates directly to /settings/payment
- **When** the route resolves
- **Then** the underlying page renders normally for QA / preview purposes. [NEEDS INPUT] confirm production behaviour for direct deep links.

### Acceptance Criteria — Full Functionality (Next Phase)

**AC-3:**
- **Given** Payment Settings page is open
- **When** the page renders
- **Then** six sections are shown: Primary Gateway, Accepted Payment Modes, Payment Terms, Settlement Frequency, Bank Account, Transaction Charges (read-only).

**AC-4:**
- **Given** the Primary Gateway section is shown
- **When** the user opens the dropdown
- **Then** options are: Razorpay, Paytm, PhonePe, Stripe, Cashfree; selecting one reveals two masked secret inputs (API Key, Secret Key).

**AC-5:**
- **Given** the Accepted Modes section is shown
- **When** the user inspects the controls
- **Then** the section shows four toggles (UPI, Cards, Net Banking, Wallets) with badge lists summarising the active set.

**AC-6:**
- **Given** the Payment Terms section is shown
- **When** the user opens the dropdown
- **Then** options are: Immediate, Net 7, Net 15, Net 30, Net 45; a Credit Limit input (₹) is shown when terms != Immediate.

**AC-7:**
- **Given** the Settlement Frequency section is shown
- **When** the user opens the dropdown
- **Then** options are: T+0, T+1, Weekly, Monthly.

**AC-8:**
- **Given** the Bank Account section is shown
- **When** the user inspects the section
- **Then** Bank Name, IFSC, Masked Account Number are displayed; an Edit affordance opens secured inputs. [NEEDS INPUT] confirm whether bank changes here require KYC re-verification.

**AC-9:**
- **Given** the Transaction Charges section is shown
- **When** the user inspects the table
- **Then** the table is read-only; rows show the gateway's charges per mode.

**AC-10:**
- **Given** the user clicks Save
- **When** validation passes
- **Then** settings are persisted; success toast.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Phase 1: gated as Coming Soon on the Hub (ST-01 BR-3). Route remains reachable for QA. [NEEDS INPUT] confirm production deep-link behaviour. |
| BR-2 | Primary Gateway choices: Razorpay, Paytm, PhonePe, Stripe, Cashfree (Phase 1 supports one active gateway at a time). |
| BR-3 | API Key and Secret Key are masked once entered; the seller may rotate but cannot view the persisted secret. |
| BR-4 | At least one Payment Mode must be enabled when the gateway is set. |
| BR-5 | Credit Limit is required when Payment Terms != Immediate. |
| BR-6 | Settlement Frequency options: T+0, T+1, Weekly, Monthly. |
| BR-7 | Bank Account changes are sensitive and may require additional verification — [NEEDS INPUT] confirm KYC dependency. |
| BR-8 | Transaction Charges are read-only — sourced from the gateway / contract; not seller-editable. |
| BR-9 | Phase 1 implementation persists to local component state with a toast confirmation; backend integration is [NEEDS INPUT]. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Seller picks a gateway but enables zero modes | Save blocked per BR-4 with inline error "Enable at least one payment mode." |
| 2 | Seller changes Payment Terms from Net 30 → Immediate | Credit Limit field disappears; the previously entered value is preserved in state but not collected. |
| 3 | Seller rotates API Key + Secret Key | Old values are overwritten on save; UI continues to mask the persisted secret. |
| 4 | Seller edits Bank Account | If KYC dependency applies (per BR-7), the edit triggers a verification flow; [NEEDS INPUT] confirm. |
| 5 | Seller enters an invalid IFSC | Inline validation error per Field Validations. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-PAY-01 | Save API timeout / server error | "Could not save payment settings. Please retry." | Keep page state; allow retry. |
| ERR-PAY-02 | Validation failure on Save | Per-field inline messages (see Field Validations). | Block save. |
| ERR-PAY-03 | Bank Account change requires KYC re-verification | "Bank account changes require identity re-verification. We will guide you through KYC." | Trigger KYC flow [NEEDS INPUT]. |
| ERR-PAY-04 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| primaryGateway | Enum | Yes | One of Razorpay \| Paytm \| PhonePe \| Stripe \| Cashfree. | Dropdown. |
| apiKey | String | Yes when gateway is set | Non-empty after trim; persisted masked. | User input. |
| secretKey | String | Yes when gateway is set | Non-empty after trim; persisted masked. | User input. |
| acceptedModes | Object | Yes | { upi, cards, netBanking, wallets } booleans; at least one true. | Toggles. |
| paymentTerms | Enum | Yes | One of Immediate \| Net 7 \| Net 15 \| Net 30 \| Net 45. | Dropdown. |
| creditLimit | Decimal (INR) | Required when paymentTerms != Immediate | ≥ 0. | User input. |
| settlementFrequency | Enum | Yes | One of T+0 \| T+1 \| Weekly \| Monthly. | Dropdown. |
| bankName / ifsc / maskedAccountNumber | String | Yes | IFSC format check; account number 9–18 digits. | User input. |
| transactionCharges[] | Array | Read-only | Sourced from gateway / contract. | Gateway. |

### Workflow

```
1. (Phase 1) Seller views Hub -> Payment card is Coming Soon -> click is no-op.
2. (Post-un-gating) Seller opens Payment Settings.
3. System renders 6 sections (Gateway / Modes / Terms / Settlement / Bank / Charges).
4. Seller picks gateway -> fills API Key + Secret Key -> enables modes -> picks terms (+ credit limit if not Immediate)
   -> picks settlement frequency -> (optional) edits bank account.
5. [DECISION] Seller clicks Save:
   IF validation fails:    Show inline errors; block save.
   ELSE:                   Persist; success toast.
   IF KYC dependency:      Trigger KYC re-verification flow [NEEDS INPUT].
```

### Section 4 — UI/UX

**Wireframe Notes**

```
Page: Settings — Payment Settings  (post-un-gating)
├─ Page Header  /  Back to Settings
├─ Section: Primary Gateway
│   ├─ Dropdown: Razorpay | Paytm | PhonePe | Stripe | Cashfree
│   ├─ API Key (masked)
│   └─ Secret Key (masked)
├─ Section: Accepted Payment Modes
│   ├─ [Toggle] UPI    [Toggle] Cards
│   └─ [Toggle] Net Banking    [Toggle] Wallets
├─ Section: Payment Terms
│   ├─ Dropdown: Immediate | Net 7 | Net 15 | Net 30 | Net 45
│   └─ Credit Limit (₹)   (visible when terms != Immediate)
├─ Section: Settlement Frequency
│   └─ Dropdown: T+0 | T+1 | Weekly | Monthly
├─ Section: Bank Account
│   ├─ Bank Name | IFSC | Masked Account Number
│   └─ [ Edit ] (opens secured inputs; may trigger KYC)
├─ Section: Transaction Charges (read-only table)
└─ Action Bar: [ Save ]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Primary Gateway | Required when any other Payment field is changed. | "Select a payment gateway." | On-save |
| API Key / Secret Key | Required when Gateway is selected; non-empty after trim. | "API Key and Secret Key are required." | On-save |
| Accepted Modes | At least one toggle must be ON. | "Enable at least one payment mode." | On-save |
| Credit Limit | Required when Payment Terms != Immediate; numeric; ≥ 0. | "Credit limit is required for net terms." | On-save |
| IFSC | Format check (4 letters + 0 + 6 alphanumerics). | "Invalid IFSC code." | On-blur |
| Account Number | Required; numeric; 9–18 digits. | "Invalid account number." | On-blur |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Transaction Charges — no contract loaded | Charges will appear once a gateway is selected. | — |

---

# USER STORY ST-07

## Settings — Customer Settings (Auto-Approval + Brand-Specific Drawer)

*Epic: Seller Admin — Settings   |   Priority: Medium   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Settings — Customer Settings (Auto-Approval + Brand-Specific Drawer) |
| Epic / Feature Link | Seller Admin — Settings |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Medium — governs whether new customer registrations are auto-approved, and configures per-brand approval / matching rules. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — controlling customer onboarding behaviour. |

**Business Context**

**WHY:** Customer Settings exposes a single store-level Auto-Approval toggle: when ON, new customer registrations are approved without seller review; when OFF, every new registration requires manual approval. The page is reachable at `/settings/customer` but is intentionally NOT exposed on the Settings Hub (ST-01 AC-8). A separate, related surface — the Customer Settings Drawer — launches from the Customer module and configures per-brand rules: who approves new customers (DMS or Seller) and how customers are matched (Mobile or Customer ID).

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Controlling customer onboarding behaviour | Pause auto-approval for promotions or set per-brand approval / matching rules | Without these controls, sellers either over-approve or manually triage every onboarding |

**Success Metrics**

- 100% of customer-onboarding flows respect the current Auto-Approval setting at the moment of arrival.
- Per-brand drawer changes apply to that brand only — 0% leakage to other brands.

**Real-World Scenario**

**CURRENT STATE:** Seller wants to manually review every new customer for the next two weeks while a promotion runs.

**DESIRED STATE:** Seller Admin opens `/settings/customer` (deep link or via the Customer module), sets Auto Approval = OFF, sees the status indicator turn amber (Manual Required), and resumes auto-approval after the promotion ends.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to control whether new customer registrations are auto-approved store-wide, and configure per-brand approval and matching rules, so that I get the right balance of speed and control over customer onboarding.

### Acceptance Criteria — Store-Level Page

**AC-1:**
- **Given** the Seller Admin navigates to /settings/customer
- **When** the page loads
- **Then** the page shows: Auto Approval toggle, a status indicator (green "Auto-approval enabled" when ON; amber "Manual approval required" when OFF), and a brief explanatory paragraph.

**AC-2:**
- **Given** the Auto Approval toggle is changed
- **When** the user toggles ON → OFF or OFF → ON
- **Then** the status indicator updates immediately; a toast confirms the change.

**AC-3:**
- **Given** the page is rendered
- **When** the user inspects the IA
- **Then** this page is NOT exposed on the Settings Hub (ST-01 AC-8). It is reachable only via direct route or via the Customer module entry point.

### Acceptance Criteria — Brand Drawer

**AC-4:**
- **Given** the Seller Admin opens the Customer Settings Drawer from the Customer module (per-brand)
- **When** the drawer renders
- **Then** two sections are shown: (a) Approval Mode — radio selection between "DMS approval" and "Seller approval"; (b) Match Criteria — radio selection between "Mobile Number" and "Customer ID".

**AC-5:**
- **Given** the user picks an Approval Mode and Match Criteria for the brand
- **When** the user clicks Save
- **Then** the per-brand configuration is persisted; the drawer closes; a toast confirms.

**AC-6:**
- **Given** the user clicks Cancel in the drawer
- **When** the action runs
- **Then** the drawer closes with no change to the brand's configuration.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Customer Settings is intentionally not exposed on the Settings Hub. Users reach it via direct route (/settings/customer) or via the Customer module / brand drawer. |
| BR-2 | Auto Approval is a single store-level boolean. ON: new customer registrations are auto-approved on first order (Seller Admin US-09 auto-create flow); OFF: registrations require manual seller review. |
| BR-3 | Status indicator: ON → green pill "Auto-approval enabled"; OFF → amber pill "Manual approval required". |
| BR-4 | Brand Drawer is per-brand: Approval Mode is one of {DMS approval, Seller approval}; Match Criteria is one of {Mobile Number, Customer ID}. |
| BR-5 | Brand Drawer applies only to multi-brand sellers; for single-brand sellers it falls back to the store-level setting. [NEEDS INPUT] confirm precedence rules between store-level toggle and per-brand drawer. |
| BR-6 | Phase 1 implementation persists to local component state with a toast confirmation; backend integration is [NEEDS INPUT]. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Seller toggles Auto Approval OFF while customers are auto-creating | In-flight auto-creates already in progress complete; new registrations from that moment require manual approval. |
| 2 | Brand Drawer Approval Mode = DMS approval but no DMS is configured for the seller | Validation fails with a clear hint to configure DMS first. [NEEDS INPUT] confirm flow. |
| 3 | User opens /settings/customer with no brands linked | Store-level toggle is fully usable; brand-drawer flow is not surfaced. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-CUS-01 | Save API timeout / server error | "Could not save customer settings. Please retry." | Keep page state; allow retry. |
| ERR-CUS-02 | Brand Drawer Save with DMS mode but no DMS configured | "Configure DMS first to use DMS approval." | Block save; offer link to DMS setup. |
| ERR-CUS-03 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| autoApproval | Boolean | Yes | Store-level ON / OFF. | Toggle. |
| brandConfig[brandId].approvalMode | Enum | Yes (per brand) | One of "DMS approval" \| "Seller approval". | Radio. |
| brandConfig[brandId].matchCriteria | Enum | Yes (per brand) | One of "Mobile Number" \| "Customer ID". | Radio. |

### Workflow

```
1. Seller Admin navigates to /settings/customer (direct route or via Customer module entry).
2. System renders the store-level Auto Approval toggle + status indicator.
3. Seller toggles Auto Approval; status pill updates; toast confirms.
4. (Per-brand) Seller opens the Customer Settings Drawer from the Customer module.
5. System renders the drawer with Approval Mode and Match Criteria radio groups.
6. [DECISION] Seller clicks an action:
   IF Cancel:   Close drawer; no change.
   IF Save:     Persist per-brand config; close drawer; toast.
```

### Section 4 — UI/UX

**Wireframe Notes**

```
Page: Settings — Customer Settings  (NOT on the Hub)
├─ Header  /  Back to (entry point)
├─ Section: Auto Approval
│   ├─ [Toggle] Auto Approval
│   └─ Status pill (green: enabled / amber: manual required)
└─ Explanatory paragraph

Drawer: Customer Settings Drawer  (launched from Customer module per brand)
├─ Header: "Customer Settings — <brand name>"
├─ Section: Approval Mode
│   ├─ ( ) DMS approval
│   └─ ( ) Seller approval
├─ Section: Match Criteria
│   ├─ ( ) Mobile Number
│   └─ ( ) Customer ID
└─ Footer: [ Cancel ]   [ Save ]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Auto Approval | Boolean toggle. | — | On-toggle |
| Approval Mode (drawer) | Required; one of DMS approval / Seller approval. | "Select an approval mode." | On-save |
| Match Criteria (drawer) | Required; one of Mobile Number / Customer ID. | "Select a match criteria." | On-save |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Brand Drawer — seller has no brands linked | (drawer is not surfaced for single / no-brand sellers; store-level toggle remains usable) | — |

---

# USER STORY ST-08

## Settings — Communication Settings (WhatsApp Connect + Notification Preferences)

*Epic: Seller Admin — Settings   |   Priority: High   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Settings — Communication Settings (WhatsApp Connect + Notification Preferences) |
| Epic / Feature Link | Seller Admin — Settings |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | High — the seller depends on real-time order notifications; WhatsApp is the primary channel in Phase 1. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — connecting a WhatsApp number for order and event notifications. |

**Business Context**

**WHY:** Communication Settings owns the seller's WhatsApp connection and per-event notification preferences. The seller enters a phone number, receives a 6-digit verification code, enters it, and the number is connected (subsequently displayed masked). Below the connection block, the seller toggles individual notification events on / off; in Phase 1 the only event surfaced is "New Order Received". A summary line shows "X of N" notifications enabled.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Connecting a WhatsApp number for notifications | Get real-time order alerts on the channel I check most often | Without WhatsApp alerts, sellers miss new ONDC orders or act late on them |

**Success Metrics**

- Time from connect-flow start → connected state — target under 60 seconds for 95% of sellers.
- Notification delivery success rate — track and surface; target 99%+ once connected.

**Real-World Scenario**

**CURRENT STATE:** Seller wants every new ONDC order to ping their WhatsApp.

**DESIRED STATE:** Seller Admin opens Communication Settings, enters their mobile number, taps Send Code, enters the 6-digit code, sees the masked number with a Disconnect button, leaves the New Order Received toggle ON, and walks away.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to connect a WhatsApp number via verification and select which events I want to be notified about, so that I'm reliably alerted in real time on the channel I check most often.

### Acceptance Criteria — WhatsApp Connect

**AC-1:**
- **Given** the Seller Admin opens Communication Settings and no WhatsApp number is connected
- **When** the page loads
- **Then** the WhatsApp Connect section shows: a phone-number input, a Send Code button, and explanatory copy.

**AC-2:**
- **Given** the user enters a mobile number and clicks Send Code
- **When** validation passes
- **Then** a 6-digit code is sent to that number; the UI transitions to the verification step with a code-input field, a Verify button, a Resend Code option, and a back affordance to change the number.

**AC-3:**
- **Given** the user enters the 6-digit code and clicks Verify
- **When** validation passes
- **Then** the number is marked Connected; the UI transitions to a connected state showing the masked number (e.g., "+91 ••••• 12345") and a Disconnect button; a success toast confirms.

**AC-4:**
- **Given** a number is connected
- **When** the user clicks Disconnect
- **Then** the system confirms the action and removes the connection on confirm; the UI returns to the entry step.

**AC-5:**
- **Given** the user enters an invalid or expired code
- **When** Verify is clicked
- **Then** an inline error is shown ("Invalid or expired code. Please request a new one."); the user can resend the code.

### Acceptance Criteria — Notification Preferences

**AC-6:**
- **Given** the Notification Preferences section is shown
- **When** the user inspects the section
- **Then** the section shows a list of available events with a toggle per event; the section header shows a summary "X of N enabled"; in Phase 1 the only event listed is "New Order Received".

**AC-7:**
- **Given** the user toggles a notification event
- **When** the toggle is flipped
- **Then** the change is reflected immediately in the summary count; a toast confirms.

**AC-8:**
- **Given** no WhatsApp number is connected
- **When** the user inspects the Notification Preferences section
- **Then** [NEEDS INPUT] confirm whether toggles are disabled until a number is connected, or whether they remain togglable as future-state preferences.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | WhatsApp is the only notification channel in Phase 1. SMS / email are out of scope. |
| BR-2 | Connection flow is two-step: (1) phone entry + Send Code; (2) code entry + Verify. |
| BR-3 | Verification code is 6 digits; expiry [NEEDS INPUT] (proposal: 10 minutes). |
| BR-4 | Once connected, the phone number is displayed masked; the seller can Disconnect (with confirmation) and reconnect with a different number. |
| BR-5 | Notification events list in Phase 1: "New Order Received". Future events (Order Status Changed, Stock Low, etc.) are out of scope. |
| BR-6 | Summary header reads "X of N enabled" where N is the count of available events for Phase 1 (currently 1). |
| BR-7 | Phase 1 implementation persists to local component state with a toast confirmation; backend integration is [NEEDS INPUT]. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | User clicks Send Code repeatedly | Throttle requests; show "Code sent. You can resend in \<N\>s." Disable Resend until cooldown expires. |
| 2 | User enters a number that already has a Qwipo account elsewhere | [NEEDS INPUT] confirm whether to allow connection or block / reassign. |
| 3 | User refreshes the page during verification step | [NEEDS INPUT] confirm whether the verification state survives a refresh or restarts. |
| 4 | User disconnects while there are pending notification deliveries | Pending deliveries fail silently; new notifications are paused. |
| 5 | User toggles New Order Received OFF | Seller stops receiving WhatsApp notifications for new orders; orders still arrive in the Orders module. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-COM-01 | Send Code API timeout / server error | "Could not send verification code. Please retry." | Re-enable Send Code; allow retry. |
| ERR-COM-02 | Verify API timeout / server error | "Could not verify the code. Please retry." | Re-enable Verify; allow retry. |
| ERR-COM-03 | Invalid / expired code | "Invalid or expired code. Please request a new one." | Block submit; offer Resend Code. |
| ERR-COM-04 | Send Code throttled | "Code sent. You can resend in \<N\>s." | Disable Resend until cooldown expires. |
| ERR-COM-05 | Disconnect API timeout / server error | "Could not disconnect. Please retry." | Keep connected state visible; offer retry. |
| ERR-COM-06 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| whatsappNumber | String | Yes | 10 digits (Indian mobile); persisted masked. | User input. |
| verificationCode | String | Yes (verify step) | 6 digits; numeric; matches issued code; not expired. | User input. |
| connectionStatus | Enum | Yes | "disconnected" \| "awaiting_verification" \| "connected". | Derived. |
| notificationEvents[] | Array | Yes | Each entry { eventId, enabled }; Phase 1 has one event: "New Order Received". | Toggles. |

### Workflow

```
1. Seller opens Communication Settings.
2. State A — Disconnected:
   Seller enters mobile number -> clicks Send Code.
   IF validation fails:    Show inline error; stay on entry step.
   ELSE:                   Issue 6-digit code; transition to State B.
3. State B — Awaiting verification:
   Seller enters 6-digit code -> clicks Verify.
   IF code invalid / expired: Show inline error; offer Resend Code.
   ELSE:                       Transition to State C; success toast.
   (Optional) Seller clicks Change number -> back to State A.
4. State C — Connected:
   UI shows masked number + Disconnect.
   IF Disconnect:           Confirm -> remove connection -> back to State A.
5. Notification Preferences (independent of connection state):
   Seller toggles events -> summary count updates -> toast confirms.
```

### Section 4 — UI/UX

**Wireframe Notes**

```
Page: Settings — Communication Settings
├─ Header  /  Back to Settings
├─ Section: WhatsApp Connect
│   STATE: Disconnected
│   ├─ Phone number input
│   └─ [ Send Code ]
│   STATE: Awaiting verification
│   ├─ 6-digit code input
│   ├─ [ Verify ]   [ Resend Code (cooldown) ]
│   └─ [ ← Change number ]
│   STATE: Connected
│   ├─ Masked number display: "+91 ••••• 12345"
│   └─ [ Disconnect ]
└─ Section: Notification Preferences
    ├─ Header: "Notifications  —  X of N enabled"
    └─ Event row: New Order Received  [Toggle]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Mobile Number | Required; numeric; 10 digits (Indian mobile). | "Enter a valid 10-digit mobile number." | On-blur / on-Send-Code |
| Verification Code | Required; 6 digits; numeric. | "Enter the 6-digit code." | On-Verify |
| Verification Code (server-side) | Must match the most-recent issued code; not expired. | "Invalid or expired code. Please request a new one." | On-Verify |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| WhatsApp Connect — disconnected | (entry input + Send Code; no separate empty message) | — |
| Notification Preferences — no events available | (Phase 1 always lists at least 1 event; not applicable.) | — |

---

## Open Questions for the Next Walkthrough Session

1. **Hub:** confirm whether the route for a Coming Soon page (`/settings/shipping`, `/settings/payment`) should be 404'd in production or remain reachable for QA.
2. **Hub:** should Customer Settings be promoted to a 7th card on the Hub once the brand-drawer flow is consolidated?
3. **Store Settings:** confirm save model (per-section vs page-wide save), date format and whether recurring holidays are supported, and the locked time-zone (proposal: IST).
4. **Order Settings:** confirm whether partial-item returns are on the Phase 2 roadmap and the precise definition of "order delivered" timestamp the return window is anchored to.
5. **Shipping Settings:** canonical default weight tiers; whether per-pincode overrides are required at any phase.
6. **Serviceability:** whether the page should preview the uploaded polygon on a map; confirm overwrite vs version-history behaviour.
7. **Payment Settings:** KYC dependency for bank changes; whether multiple gateways can be active simultaneously in any phase.
8. **Customer Settings:** precedence between store-level Auto Approval and brand-level Approval Mode; whether the page should be added to the Hub.
9. **Communication Settings:** code expiry duration; cooldown / throttling rules on Send Code; behaviour on page refresh during verification; whether toggles are disabled until a number is connected.
10. **All sub-pages:** backend persistence model (current Phase 1 implementation persists to local state with a toast); audit / change-history requirements.
