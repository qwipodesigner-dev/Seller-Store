# QWIPO SELLER STORE — Offers & Schemes, Phase 1

**User Story Specifications**

| Field | Value |
| --- | --- |
| Document Type | User Story Specifications — Offers & Schemes Module |
| Module | Seller Admin — Offers & Schemes (Quantity Pricing Schemes / QPS) |
| Persona | Seller Admin (Distributor) |
| Business Owner | Product Team (Qwipo Seller Store) |
| Total Stories | 6 (OS-01 through OS-06) |
| Version | 1.0 — Draft (initial dedicated coverage of the Offers & Schemes module) |
| Date | 29 April 2026 |
| Status | Ready for Dev |
| Document Owner | Omkar Charankar |
| Companion Documents | Seller-Store-User-Stories-Phase1.docx (Seller Admin); Seller-Store-Super-Admin-User-Stories-Phase1.docx; Seller-Store-Orders-User-Stories-Phase1.docx; Seller-Store-ONDC-SKU-Validation-Rules.docx |

## Document Scope & Note to Reviewer

**SCOPE:** This document is the dedicated user-story specification for the Qwipo Seller Store — Offers & Schemes module under the Seller Admin persona. Phase 1 ships a single offer type — Quantity Pricing Scheme (QPS) — attached to a single SKU and effective over a defined validity window. Coverage includes: the List page (KPI cards, search, status filter, row actions); the Create / Edit / View / Delete flows for a QPS; the cross-slab validation rules (QPS-010 / 011 / 012); and the fully wired Bulk Import flow.

**GROUNDING:** Stories are grounded in the actual implementation under `src/app/pages/offers/offers-list.tsx` and `src/app/lib/qps-validation.ts`. This document supersedes US-10 and US-11 in the Seller Admin user-stories doc — those entries remain there for the seller-side cross-references; this file is the canonical Offers & Schemes spec going forward.

**OUT OF SCOPE:** Other offer types (combo, BOGO, time-of-day, basket-level, etc.) — Phase 1 ships QPS only; multi-SKU bundle schemes; tier / segment-specific schemes (e.g., one price for Class A buyers, another for Class B).

## Persona Overview

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Distributor running quantity-based pricing offers | Manage every QPS scheme from a single screen and act on any scheme with one click | Hand-creating tiered offers across a large catalog is slow and error-prone without validation and bulk tools |

## QPS Lifecycle (Phase 1) — Navigation

Every QPS has an Active / Inactive toggle plus Start and End dates. The Status displayed on the list and the badge in the editor is **DERIVED** from these inputs — it is never directly set by the user.

| Status | Derivation | Editable? | Deletable? |
| --- | --- | --- | --- |
| Scheduled | Active toggle ON, Start Date is in the future. | Yes | Yes |
| Active | Active toggle ON, today falls within Start → End. | Yes | Yes |
| Inactive | Active toggle OFF, today is on or before End Date. | Yes | Yes |
| Expired | End Date is in the past (terminal, irreversible). | No (Edit disabled with tooltip; Active toggle disabled) | Yes |

**Status Derivation Algorithm**

```
Inputs:  startDate, endDate, activeToggle, today.
1. IF endDate < today          -> "Expired"
2. ELSE IF activeToggle == OFF -> "Inactive"
3. ELSE IF startDate > today   -> "Scheduled"
4. ELSE                        -> "Active"
```

## Story Index

| # | Story Title | Module | Priority | Dependency | Status |
| --- | --- | --- | --- | --- | --- |
| OS-01 | Offers & Schemes — List Page (KPI Cards, Search, Status Filter, Row Actions) | Offers & Schemes | High | None | Ready for Dev |
| OS-02 | Offers & Schemes — Create QPS Offer (Dialog, Slab Editor, Validation) | Offers & Schemes | High | OS-01 | Ready for Dev |
| OS-03 | Offers & Schemes — Edit QPS Offer (Reuse Dialog, Status-aware) | Offers & Schemes | High | OS-02 | Ready for Dev |
| OS-04 | Offers & Schemes — View QPS Offer Details (Read-only Dialog) | Offers & Schemes | Medium | OS-01 | Ready for Dev |
| OS-05 | Offers & Schemes — Delete QPS Offer (Confirmation) | Offers & Schemes | Medium | OS-01 | Ready for Dev |
| OS-06 | Offers & Schemes — Bulk Import QPS Schemes (Template + Validate + Merge) | Offers & Schemes | High | OS-01, OS-02 | Ready for Dev |

---

# USER STORY OS-01

## Offers & Schemes — List Page (KPI Cards, Search, Status Filter, Row Actions)

*Epic: Seller Admin — Offers & Schemes (QPS)   |   Priority: High   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Offers & Schemes — List Page (KPI Cards, Search, Status Filter, Row Actions) |
| Epic / Feature Link | Seller Admin — Offers & Schemes (QPS) |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | High — the Offers list is the seller's working view of every QPS scheme and the entry point to creating, editing, viewing, deleting and bulk-importing schemes. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — distributor running quantity-based pricing offers. |

**Business Context**

**WHY:** Phase 1 of Offers & Schemes ships a single offer type — Quantity Pricing Scheme (QPS). A QPS attaches one or more quantity slabs to a SKU (e.g., buy 1–11 units at ₹171, 12–47 units at 5% off, 48+ at 10% off) over a defined validity window. The list page is the seller's working view of every QPS — four KPI cards summarise the portfolio, search and a status filter narrow the table, and per-row actions (View Details, Edit, Delete) let the seller manage individual schemes. Two primary CTAs (Bulk Import and + Create QPS Offer) seed new schemes.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Distributor running quantity-based pricing offers | Manage every QPS from a single screen with at-a-glance KPIs and one-click row actions | Without a unified list + KPIs, schemes drift, expire silently, or duplicate across SKUs |

**Success Metrics**

- KPI cards reconcile with the underlying list within ±0% — target 100% accuracy.
- Time to find a specific scheme (search) — target under 5 seconds.

**Real-World Scenario**

**CURRENT STATE:** Seller Admin runs 30+ QPS offers across their catalog. Some are about to expire and a couple should be paused.

**DESIRED STATE:** Seller Admin opens Offers & Schemes, sees four KPI cards (Total / Active / Total Pricing Rules / Avg Max Discount), filters by Status = Active, searches by SKU name, and acts on a row — view details, edit, or delete — in seconds.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to view, search and filter all my Quantity Pricing Schemes with at-a-glance KPIs and per-row actions, so that I can manage every QPS from a single screen and act on any scheme with one click.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin clicks Offers & Schemes in the left navigation
- **When** the page loads
- **Then** the system displays four KPI cards in this order: Total QPS Schemes, Active Schemes, Total Pricing Rules, Avg Max Discount.

**AC-2:**
- **Given** the seller has at least one scheme
- **When** the page renders
- **Then** the table is shown with columns: SKU Code, SKU Name, Offer Type ("QPS" badge), Pricing Rules (slab count), MRP / SP, Validity (Start → End), Status (badge), Actions.

**AC-3:**
- **Given** the Seller Admin types in the search input
- **When** the input changes (debounced)
- **Then** the list filters to rows where SKU Code OR SKU Name contains the search term (case-insensitive, contains-match).

**AC-4:**
- **Given** the Seller Admin opens the Status filter
- **When** a value is chosen from { All, Active, Inactive, Scheduled, Expired }
- **Then** the list refreshes to rows whose derived Status equals the selected value (or all rows when All is selected).

**AC-5:**
- **Given** the Seller Admin clicks Bulk Import
- **When** the action runs
- **Then** the system opens the Bulk Import flow (OS-06).

**AC-6:**
- **Given** the Seller Admin clicks + Create QPS Offer
- **When** the action runs
- **Then** the system opens the Create QPS Offer dialog (OS-02).

**AC-7:**
- **Given** a row's status is Active, Inactive or Scheduled
- **When** the Actions column renders
- **Then** all three actions are enabled and visible: View Details (eye), Edit (pencil), Delete (trash).

**AC-8:**
- **Given** a row's status is Expired
- **When** the Actions column renders
- **Then** View Details and Delete are enabled; Edit is disabled with the tooltip "Expired schemes cannot be edited."

**AC-9:**
- **Given** the Seller Admin clicks View Details
- **When** the action runs
- **Then** the system opens the read-only View Details dialog (OS-04).

**AC-10:**
- **Given** the Seller Admin clicks Edit on an editable row
- **When** the action runs
- **Then** the system opens the Edit dialog (OS-03) pre-filled with the scheme's current values.

**AC-11:**
- **Given** the Seller Admin clicks Delete on any row
- **When** the action runs
- **Then** the system opens the Delete confirmation (OS-05).

**AC-12:**
- **Given** the seller has zero schemes
- **When** the page loads
- **Then** the empty state is shown; KPI cards display 0 (or ₹ 0 for Avg Max Discount); the Bulk Import and + Create QPS Offer buttons remain visible.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Phase 1 supports a single Offer Type: QPS. The Offer Type column is informational — the value is always "QPS". |
| BR-2 | Status values are derived from start / end dates and the Active toggle (see the QPS Lifecycle table at the top of this document). |
| BR-3 | Total QPS Schemes = count of all schemes for this distributor (any status). |
| BR-4 | Active Schemes = count of schemes whose derived Status is Active right now. |
| BR-5 | Total Pricing Rules = sum of slab counts across all schemes. |
| BR-6 | Avg Max Discount = average of (best slab Effective Price vs Selling Price) per scheme, expressed as a percentage. |
| BR-7 | Search matches SKU Code OR SKU Name only (case-insensitive, contains-match). |
| BR-8 | Edit is disabled for Expired schemes (irreversible state). |
| BR-9 | Delete is allowed in any state; the confirmation dialog must show the scheme name and slab count (see OS-05). |
| BR-10 | The list is scoped to the logged-in distributor. |
| BR-11 | [NEEDS INPUT] Pagination model on this list (current code uses an in-memory filter with no pagination). Phase 1 spec proposes 25 rows per page with Previous / Next, matching the My SKU and Customers lists — confirm. |
| BR-12 | [NEEDS INPUT] Default sort order of the list (e.g., Status priority? Validity end-date asc?). |

**KPI Card Definitions**

| Card # | Label | Definition | Source |
| --- | --- | --- | --- |
| 1 | Total QPS Schemes | All QPS schemes for this distributor, any status. | COUNT(schemes WHERE distributor = current seller) |
| 2 | Active Schemes | Schemes whose derived Status is Active right now. | COUNT(schemes WHERE derivedStatus = 'Active') |
| 3 | Total Pricing Rules | Sum of pricing slabs across all schemes. | SUM(scheme.slabs.count) |
| 4 | Avg Max Discount | Across all schemes, the average of the deepest discount each scheme offers (best slab Effective Price vs SP). | AVG((SP − minEffectivePrice) / SP × 100) |

**Action Permissions by Status**

| Status | View Details | Edit | Delete |
| --- | --- | --- | --- |
| Active | Yes | Yes | Yes |
| Inactive | Yes | Yes | Yes |
| Scheduled | Yes | Yes | Yes |
| Expired | Yes | No (disabled with tooltip "Expired schemes cannot be edited") | Yes |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Seller has zero schemes | Empty state shown; all KPI cards = 0; Bulk Import and + Create QPS Offer remain visible. |
| 2 | Search returns zero rows | Show "No schemes match your search"; offer Clear Search. |
| 3 | Status filter set to Expired and zero rows match | Show "No schemes match the selected status"; offer Clear Filter. |
| 4 | Scheme transitions Scheduled → Active during the session (start date hits now) | On next list refresh / interaction, Status badge flips to Active and Active Schemes KPI is incremented. |
| 5 | Scheme transitions Active → Expired (end date passes) | Status badge flips to Expired; Edit becomes disabled; Active Schemes KPI is decremented. |
| 6 | Seller toggles Active → Inactive on a scheme that is in validity (via Edit) | Status flips Active → Inactive; Active Schemes KPI is decremented; the scheme remains in the list. |
| 7 | Seller deletes the last Active scheme | Active Schemes KPI → 0; the scheme is removed from the list. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-OFR-01 | List load API fails | "Unable to load offers. Please retry." | Show retry CTA; preserve search / filter state. |
| ERR-OFR-02 | Search request fails | "Search is temporarily unavailable. Please try again." | Keep previously loaded list; non-blocking toast. |
| ERR-OFR-03 | Session expired | "Your session has expired. Please log in again." | Redirect to login; preserve target URL. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| SKU Code | String | Yes | Belongs to this distributor's catalog. | Scheme record → SKU master. |
| SKU Name | String | Yes | Display only. | SKU master. |
| Offer Type | Enum | Yes | Phase 1: "QPS" only. | System. |
| Pricing Rules | Integer | Yes | Count of slabs on the scheme; ≥ 1. | Computed from scheme.slabs. |
| MRP / SP | Decimal | Yes | Display reference — SKU's MRP and Selling Price. | SKU master (snapshot). |
| Validity | DateRange | Yes | Start Date → End Date (DD-MMM-YYYY). | Scheme record. |
| Status | Enum | Yes | Derived: Active \| Inactive \| Scheduled \| Expired. | Derived from Active toggle + dates. |
| Actions | Control | Yes | View Details (eye) \| Edit (pencil) \| Delete (trash); Edit disabled when Expired. | UI control. |

### Workflow

```
1. Seller Admin clicks Offers & Schemes in the left navigation.
2. System loads schemes scoped to the distributor; recomputes derived Status from start / end dates and Active toggle.
3. System renders the four KPI cards and the table with row actions per status.
4. [DECISION] Seller Admin chooses an action (any order, can combine):
   IF Search:                          Filter list by SKU Code / SKU Name.
   IF Status Filter:                   Apply selected status; rows refresh.
   IF Bulk Import:                     Open Bulk Import flow (OS-06).
   IF + Create QPS Offer:              Open Create dialog (OS-02).
   IF View Details (any status):       Open read-only details dialog (OS-04).
   IF Edit (Active / Inactive / Sched):Open Edit dialog (OS-03).
   IF Delete (any status):             Open Delete confirmation (OS-05).
```

### Section 4 — UI/UX

**Wireframe Notes (Component Hierarchy)**

```
Page: Offers & Schemes — List View
├─ App Shell Header (global)
├─ Left Navigation (Offers & Schemes active)
└─ Main Content Area
    ├─ Page Header  Title: "Offers & Schemes"
    ├─ KPI Cards Row (4 cards)
    │   ├─ Total QPS Schemes
    │   ├─ Active Schemes
    │   ├─ Total Pricing Rules
    │   └─ Avg Max Discount
    ├─ Action Bar (top-right cluster)
    │   ├─ Search Input  (placeholder: "Search by SKU code or name...")
    │   ├─ [Status ▾] dropdown: All | Active | Inactive | Scheduled | Expired
    │   ├─ [Bulk Import] button
    │   └─ [+ Create QPS Offer] primary button
    ├─ Data Table (8 columns)
    │   SKU Code | SKU Name | Offer Type | Pricing Rules | MRP / SP | Validity | Status (badge) | Actions
    │   Actions per row: [eye View] [pencil Edit] [trash Delete]  (pencil disabled when Status = Expired)
    └─ Pagination Footer  [NEEDS INPUT]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Search input | Max 100 chars; trims whitespace; case-insensitive contains-match. | "Search term is too long." | On-input (debounced) |
| Status filter | One of { All, Active, Inactive, Scheduled, Expired }. | — | On-change |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Offers & Schemes — zero schemes | You have not created any QPS schemes yet. Start with a Bulk Import or create your first scheme. | "+ Create QPS Offer" |
| Offers & Schemes — search returns no rows | No schemes match your search. | "Clear Search" |
| Offers & Schemes — status filter returns no rows | No schemes match the selected status. | "Clear Filter" |

**Error Messages**

| Error Code | User-Facing Message | Technical Log Message |
| --- | --- | --- |
| ERR-OFR-01 | Unable to load offers. Please retry. | GET /offers failed: \<statusCode\> |
| ERR-OFR-02 | Search is temporarily unavailable. Please try again. | GET /offers/search failed: \<statusCode\> \<query\> |
| ERR-OFR-03 | Your session has expired. Please log in again. | 401 Unauthorized on /offers |

---

# USER STORY OS-02

## Offers & Schemes — Create QPS Offer (Dialog, Slab Editor, Validation)

*Epic: Seller Admin — Offers & Schemes (QPS)   |   Priority: High   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Offers & Schemes — Create QPS Offer (Dialog, Slab Editor, Validation) |
| Epic / Feature Link | Seller Admin — Offers & Schemes (QPS) |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | High — the Create dialog is the primary path to introduce a QPS for any SKU; it must enforce the per-field and cross-slab validation rules so invalid schemes never reach the catalog. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — distributor configuring a quantity-based discount for a single SKU. |

**Business Context**

**WHY:** A QPS rewards bulk buying with tiered prices. The Create QPS Offer dialog is where the Seller Admin defines the scheme for a single SKU — picks the SKU, sets a validity window, and adds 1–N pricing slabs (Min Qty, Max Qty, Discount Type, Discount Value). The dialog shows live computed Customer Pays and Customer Saves for every slab so the seller can review the math before going live. Per-field validation is enforced as the user types; cross-slab validation (no overlaps, no gaps, monotone non-increasing prices) runs on Save.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Configuring a quantity-based discount for a single SKU | Roll out tiered, time-bound discounts with the math validated for them | Manual price math + cross-slab consistency is error-prone; invalid schemes reach the catalog without enforcement |

**Success Metrics**

- 100% of created schemes pass QPS-001..012 (no invalid schemes reach the catalog).
- Median time to create a 3-slab scheme — target under 90 seconds.

**Real-World Scenario**

**CURRENT STATE:** Seller Admin wants a tiered offer on Sunflower Oil 5L: ₹580 for 1–9 units, 5% off for 10–47, 8% off for 48+.

**DESIRED STATE:** Seller Admin clicks + Create QPS Offer, picks the SKU, sees the existing MRP / SP as context, sets Start / End dates, adds three slabs (1–9 flat ₹580; 10–47 percent 5%; 48+ percent 8%), reviews the live Customer Pays / You Save columns, leaves the Active toggle on, and clicks Create QPS Scheme — the scheme appears in the list with derived Status = Active or Scheduled (depending on Start Date).

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to create a QPS scheme by selecting a SKU, setting a validity window, and adding pricing slabs, so that I can roll out tiered, time-bound discounts for any SKU with the math validated for me.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin clicks + Create QPS Offer on the Offers list (OS-01)
- **When** the action runs
- **Then** the system opens the Create dialog with sections in this order: SKU selector → Validity (Start / End dates) → Active / Inactive toggle → Pricing Slabs editor → footer (Cancel \| Create QPS Scheme).

**AC-2:**
- **Given** the dialog is open
- **When** the Seller Admin selects a SKU from the catalog selector
- **Then** the dialog displays the SKU's existing MRP and Selling Price as a prominent read-only context panel (these values drive the live Customer Pays and Customer Saves columns).

**AC-3:**
- **Given** Start Date and End Date are mandatory
- **When** the Seller Admin clicks Create QPS Scheme without both dates
- **Then** save is blocked with the inline error "Start date and end date are required."

**AC-4:**
- **Given** the Seller Admin enters a Start Date that is after the End Date
- **When** validation runs (per QPS-007 / QPS-008)
- **Then** save is blocked with "Start date must be on or before end date."

**AC-5:**
- **Given** the dialog opens
- **When** the slab editor first renders
- **Then** Slab 1 is shown with default fields: Min Qty (defaults to 1), Max Qty (empty for last slab), Discount Type (dropdown: Flat \| Percent), Discount Value, computed Effective Price, computed Customer Saves.

**AC-6:**
- **Given** the Seller Admin clicks + Add Slab
- **When** the action runs
- **Then** a new slab row is appended below the previous one with Min Qty pre-filled to (previous Max Qty + 1).
- **And** [NEEDS INPUT] the Phase 1 spec proposes a 4-slab cap; the current implementation does not enforce a cap. Confirm — current AC assumes the Phase 1 cap of 4 slabs and disables + Add Slab beyond that with the tooltip "Maximum 4 slabs per scheme."

**AC-7:**
- **Given** two or more slabs exist
- **When** the Seller Admin clicks the Delete (trash) icon on any slab row
- **Then** that slab row is removed; remaining slabs renumber from 1; if only one slab remains, its Delete button is disabled with the tooltip "At least one slab is required."

**AC-8:**
- **Given** the Seller Admin selects Discount Type = Flat for a slab
- **When** the user enters a Discount Value V
- **Then** Effective Price = V; Customer Saves = SP − V; per-row inputs are validated per QPS-004 (V \> 0 AND V \< SP).

**AC-9:**
- **Given** the Seller Admin selects Discount Type = Percent for a slab
- **When** the user enters a Discount Value P
- **Then** Effective Price = round(SP × (1 − P / 100), 2); Customer Saves = SP − Effective Price; per-row inputs are validated per QPS-005 (P \> 0 AND P \< 100).

**AC-10:**
- **Given** the Seller Admin clicks Create QPS Scheme
- **When** validation runs
- **Then** the system runs per-field rules QPS-001..QPS-009 then cross-slab rules QPS-010 (no overlaps), QPS-011 (no gaps / contiguity), QPS-012 (monotone non-increasing Effective Price).
- **And** any violation blocks save with inline messages on the offending fields / rows; the user can fix and re-save without losing other data.

**AC-11:**
- **Given** all rules pass
- **When** the Seller Admin clicks Create QPS Scheme
- **Then** the scheme is persisted with derived Status (per the Lifecycle table); the dialog closes; the new scheme appears in the Offers list (OS-01); KPI cards refresh.

**AC-12:**
- **Given** the Seller Admin clicks Cancel
- **When** the action runs
- **Then** any unsaved input is discarded; the dialog closes with no scheme created. [NEEDS INPUT] confirm whether a confirmation prompt is required when there are unsaved edits.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | A QPS targets exactly one SKU. Multi-SKU bundles are out of scope for Phase 1. |
| BR-2 | Start Date and End Date are mandatory; Start ≤ End; on Create End must be ≥ today. |
| BR-3 | A scheme has at least 1 slab. [NEEDS INPUT] Phase 1 spec proposes a maximum of 4 slabs; current implementation does not cap — confirm and enforce. |
| BR-4 | Discount Type is one of: Flat (Customer Pays the entered value) or Percent (off the SKU's Selling Price). |
| BR-5 | Per-field validation rules are codified as QPS-001 through QPS-009 (see Appendix A). |
| BR-6 | Cross-slab validation rules are codified as QPS-010 (no overlaps), QPS-011 (no gaps / contiguity), QPS-012 (monotone non-increasing Effective Price). They run on Save (see Appendix A). |
| BR-7 | Effective Price and Customer Saves are computed live and read-only — the seller cannot type into these fields. |
| BR-8 | Active / Inactive toggle on Create: ON makes the scheme eligible to take effect (derived Status = Active when within validity, Scheduled when Start Date is future); OFF makes it Inactive regardless of dates. |
| BR-9 | Status of a saved scheme is always DERIVED from start / end dates plus the Active toggle (see the Lifecycle table). |
| BR-10 | Only one Active QPS per SKU may be in effect at any time. [NEEDS INPUT] confirm: hard block on creating a second Active scheme on the same SKU, or warn-and-allow. |
| BR-11 | [NEEDS INPUT] Currency, decimal precision and rounding rule for Effective Price / Customer Saves (current proposal: 2 decimal places, half-up). |
| BR-12 | Currency in Phase 1 is INR. |

**Slab Editor — Field Specification**

| Field | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| Min Qty | Integer | Yes (QPS-001) | \> 0; Slab(i+1).Min = Slab(i).Max + 1. | User input. |
| Max Qty | Integer \| Open | Yes for all slabs except the last (QPS-002) | \> Min Qty; only the LAST slab may be open-ended (no Max Qty = "and above"). | User input. |
| Discount Type | Enum | Yes (QPS-003) | Flat \| Percent. | Dropdown selection. |
| Discount Value | Decimal | Yes (QPS-004 / 005) | Flat: \> 0 AND \< SP. Percent: \> 0 AND \< 100. | User input. |
| Effective Price | Decimal | Computed (QPS-006) | Flat: = Discount Value. Percent: = round(SP × (1 − V / 100), 2). Always \> 0 and ≤ SP. | Computed read-only. |
| Customer Saves | Decimal | Computed | = SP − Effective Price. | Computed read-only. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Selected SKU has no Selling Price set | Block with "This SKU has no Selling Price. Set price on the SKU Detail page first." The SKU selector remains usable to pick another. |
| 2 | Seller defines Slab 1 = 1–5, Slab 2 = 7–10 (gap) | Save blocked by QPS-011: "Min Qty must be \<previous Max + 1\>." |
| 3 | Seller defines Slab 1 = 1–5, Slab 2 = 4–10 (overlap) | Save blocked by QPS-010: "Slab quantity ranges must not overlap." |
| 4 | Two slabs both have Effective Price = ₹100 (non-strict equality) | Allowed by QPS-012 (monotone NON-increasing, not strictly decreasing). |
| 5 | Seller marks Slab 2 as the last slab and leaves Max Qty empty ("and above") | Allowed; the row visually reads "≥ Min Qty"; computation works as expected. |
| 6 | Discount Value (Flat) = SP exactly | QPS-004 fails: "Flat price must be less than the SKU's Selling Price." |
| 7 | Discount Value (Percent) = 100 exactly | QPS-005 fails: "Discount must be less than 100%." |
| 8 | End Date is in the past on Create | QPS-008 fails: "End date must be today or later." |
| 9 | Seller toggles Active OFF, sets Start Date today, End Date in 30 days | On Save, derived Status = Inactive (per Lifecycle table). |
| 10 | Seller sets Start Date in 5 days, Active = ON | On Save, derived Status = Scheduled until the start date. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-OFRC-01 | Create API timeout | "Save is taking longer than usual. Please try again." | Keep dialog open; retain entered values; allow retry. |
| ERR-OFRC-02 | Create API server error | "Could not create the scheme. Please retry." | Keep dialog open; retain values; allow retry. |
| ERR-OFRC-03 | Selected SKU was deleted while the dialog was open | "The selected SKU is no longer available. Please choose another." | Reset SKU selection; preserve other inputs where possible. |
| ERR-OFRC-04 | Slab validation failure on Save (per-field or cross-slab) | Per-field / per-row inline messages keyed by QPS-NNN. | Block save; do not call API. |
| ERR-OFRC-05 | Session expired during create | "Your session has expired. Please log in again." | Redirect to login; preserve target URL. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| id | String | Yes | System-generated; unique per distributor. | Auto. |
| distributorId | String | Yes | Tenant scope. | Session. |
| skuCode / skuId | String | Yes | Belongs to this distributor's catalog (QPS-009). | User selection. |
| skuName, mrp, sellingPrice | String / Decimal | Yes | Snapshot from SKU master at create time. | Auto-loaded. |
| startDate | Date | Yes | QPS-007. | User input. |
| endDate | Date | Yes | QPS-008. | User input. |
| slabs[] | Array (1–N) | Yes | Per-slab QPS-001..006; cross-slab QPS-010..012. | User input. |
| activeToggle | Boolean | Yes | ON / OFF; combined with dates to derive Status. | Toggle. |
| status (derived) | Enum | Yes | Active \| Inactive \| Scheduled \| Expired (per Lifecycle algorithm). | Computed. |

### Workflow

```
1. Seller Admin clicks + Create QPS Offer on the Offers list (OS-01).
2. System opens the Create dialog with one empty Slab 1 and Active toggle ON by default.
3. Seller Admin selects a SKU; system loads MRP / SP context.
4. Seller Admin enters Start Date and End Date.
5. Seller Admin configures Slab 1 (Min, Max, Discount Type, Discount Value); per-field rules QPS-001..006 run live.
   - Effective Price and Customer Saves recompute live as values change.
6. (Optional) Seller Admin clicks + Add Slab; up to [Phase 1 cap, NEEDS INPUT] slabs total.
7. (Optional) Seller Admin deletes a slab via the trash icon (cannot delete the last remaining slab).
8. (Optional) Seller Admin toggles Active / Inactive.
9. [DECISION] Seller Admin clicks an action:
    IF Cancel:                Discard inputs; close dialog; EXIT.
    IF Create QPS Scheme:     Run per-field + cross-slab validation (QPS-001..012) + BR-10 single-active check.
10. [DECISION] Validation result:
    IF any rule fails:        Block save; show inline errors; preserve values.
    ELSE:                     Persist scheme; derive Status; close dialog.
11. Offers list refreshes; new scheme appears with the correct Status badge; KPI cards update.
```

### Section 4 — UI/UX

**Wireframe Notes (Component Hierarchy)**

```
Dialog: Create QPS Offer
├─ Header: "Create QPS Scheme" + close (X)
├─ Section: Select SKU
│   ├─ SKU selector (search + dropdown, scoped to distributor catalog)
│   └─ Read-only context: "MRP: ₹<mrp>   Selling Price: ₹<sp>"
├─ Section: Validity
│   ├─ Start Date (date picker, required)
│   └─ End Date (date picker, required)
├─ Section: Status
│   └─ Active / Inactive toggle (default ON; auto-disabled when End Date in past)
├─ Section: Pricing Slabs
│   ├─ Slab table header: # | Min Qty | Max Qty | Discount Type | Discount Value | Effective Price | Customer Saves | (delete)
│   ├─ Slab 1 row (always present, delete disabled when only 1 slab)
│   ├─ Slab 2..N rows (added via + Add Slab; each has a delete trash icon)
│   └─ [+ Add Slab] button
└─ Footer Action Bar: [ Cancel ]   [ + Create QPS Scheme ]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| SKU | Required (QPS-009); must belong to distributor catalog with SP \> 0. | "Select a SKU." / "This SKU has no Selling Price." | On-save / on-select |
| Start Date | Required (QPS-007); ≤ End Date. | "Start date and end date are required." / "Start date must be on or before end date." | On-save |
| End Date | Required (QPS-008); ≥ Start Date; ≥ today on Create. | "End date must be today or later." | On-save |
| Min Qty | Required (QPS-001); integer \> 0. | "Min Qty must be a positive whole number." | On-blur / on-save |
| Max Qty | Required for all but last slab (QPS-002); \> Min Qty. | "Max Qty must be greater than Min Qty." | On-blur / on-save |
| Discount Type | Required (QPS-003); Flat \| Percent. | "Select a discount type." | On-save |
| Discount Value (Flat) | Required (QPS-004); \> 0 AND \< SP. | "Flat price must be less than the SKU's Selling Price." | On-blur / on-save |
| Discount Value (Percent) | Required (QPS-005); \> 0 AND \< 100. | "Discount must be less than 100%." | On-blur / on-save |
| Cross-slab | QPS-010 (no overlaps), QPS-011 (no gaps), QPS-012 (monotone non-increasing). | Per-row keyed messages. | On-save |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Slab editor — only the default Slab 1 present | (no empty state — Slab 1 always renders) | — |
| SKU selector — no SKUs in catalog | No SKUs found in your catalog. Add a SKU first. | "Go to My SKU" |

---

# USER STORY OS-03

## Offers & Schemes — Edit QPS Offer (Reuse Dialog, Status-aware)

*Epic: Seller Admin — Offers & Schemes (QPS)   |   Priority: High   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Offers & Schemes — Edit QPS Offer (Reuse Dialog, Status-aware) |
| Epic / Feature Link | Seller Admin — Offers & Schemes (QPS) |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | High — schemes are routinely tweaked (slab tweaks, validity extensions, deactivation) post-creation. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — amending an existing QPS. |

**Business Context**

**WHY:** After a QPS is live, sellers often need to extend the validity, tune slab thresholds, or pause the scheme. Edit reuses the same dialog as Create (OS-02) with the existing values pre-filled. The same QPS-001..012 validation applies on Save. Edit is gated by Status: Active / Inactive / Scheduled schemes are editable; Expired schemes are read-only (the pencil icon is disabled with a tooltip on the list).

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Amending an existing QPS | Extend, tune or pause schemes confidently while frozen Expired schemes stay frozen | Without status-aware gating, sellers risk reviving expired offers or unintentionally deactivating live ones |

**Success Metrics**

- 0% of Expired schemes are mutated post-expiry (Edit gated correctly).
- Median time to extend a scheme's validity — target under 30 seconds.

**Real-World Scenario**

**CURRENT STATE:** An Active QPS scheme needs its end date extended by 14 days and one slab adjusted.

**DESIRED STATE:** Seller Admin clicks Edit on the row, the dialog opens pre-filled, the seller updates End Date and tweaks Slab 2's discount, clicks Save Changes, and the list reflects the new validity and computed savings.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to edit an existing QPS scheme using the same dialog as Create, with Expired schemes blocked, so that I can amend live, paused, or scheduled schemes confidently while frozen Expired schemes stay frozen.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin clicks Edit on a non-Expired row in the Offers list
- **When** the action runs
- **Then** the system opens the same Create / Edit dialog as OS-02, pre-filled with the scheme's SKU, MRP / SP context, Start / End dates, all slabs, and the Active toggle state.

**AC-2:**
- **Given** the dialog is in Edit mode
- **When** the dialog renders
- **Then** the title reads "Edit QPS Scheme"; the footer primary button reads "Save Changes"; SKU selection is read-only (cannot reassign a scheme to a different SKU). [NEEDS INPUT] confirm whether SKU re-selection is desired in any case.

**AC-3:**
- **Given** the Seller Admin makes any field change and clicks Save Changes
- **When** validation runs
- **Then** QPS-001..009 run on changed fields and QPS-010..012 run across all slabs; the same per-field / per-row error semantics as OS-02 apply.

**AC-4:**
- **Given** validation passes
- **When** the Seller Admin clicks Save Changes
- **Then** the scheme is updated in place; the list refreshes with the new Status (re-derived from new dates / toggle); KPI cards refresh.

**AC-5:**
- **Given** a row has Status = Expired
- **When** the user inspects the Actions column
- **Then** the Edit (pencil) button is disabled with the tooltip "Expired schemes cannot be edited"; clicking has no effect.

**AC-6:**
- **Given** the dialog is open and the scheme's End Date is in the past (became Expired since the dialog opened)
- **When** the user inspects the toggle
- **Then** the Active / Inactive toggle is disabled (cannot turn an Expired scheme back on by toggling); the user must extend the End Date first.

**AC-7:**
- **Given** another session has updated the same scheme while this dialog was open
- **When** the user clicks Save Changes
- **Then** the system surfaces a concurrency error "This scheme was updated elsewhere. Reload to see the latest values."; the user must reload before retrying. [NEEDS INPUT] confirm concurrency policy.

**AC-8:**
- **Given** the Seller Admin clicks Cancel
- **When** the action runs
- **Then** any unsaved edits are discarded; the dialog closes with the scheme unchanged.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Edit reuses the Create dialog with pre-filled values; the same QPS-001..012 rules apply on Save. |
| BR-2 | SKU selection is locked in Edit mode — a scheme cannot be reassigned to a different SKU. |
| BR-3 | Edit is disabled for Expired schemes (pencil disabled with tooltip on the list; the dialog is never opened in that case). |
| BR-4 | When End Date becomes past while the dialog is open, the Active toggle is disabled (cannot revive expired schemes by toggling). |
| BR-5 | Save Changes does NOT change the scheme's identity (id) — it updates the existing record in place. |
| BR-6 | [NEEDS INPUT] Whether changes to slabs apply retroactively to past orders or only to new orders going forward (current implementation: only new orders — confirm). |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Seller extends End Date to today + 30 | Status remains Active (or Scheduled if Start was future); KPI cards unchanged. |
| 2 | Seller toggles Active OFF on a currently Active scheme | Status flips Active → Inactive; Active Schemes KPI decrements. |
| 3 | Seller tweaks Slab 2 in a way that breaks QPS-011 (introduces a gap) | Save blocked; inline error on Slab 2. |
| 4 | Seller opens Edit on a scheme that is Expired (e.g., direct URL or cached state) | Dialog refuses to open; show toast "Expired schemes cannot be edited." |
| 5 | Seller adds a 5th slab (under the proposed 4-slab cap) | Blocked per OS-02 BR-3 (with [NEEDS INPUT] flag). |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-OFRE-01 | Edit load API fails | "Unable to load the scheme. Please retry." | Show retry CTA; preserve dialog skeleton. |
| ERR-OFRE-02 | Save API timeout / server error | "Could not save changes. Please retry." | Keep dialog open; preserve edits. |
| ERR-OFRE-03 | Concurrent state change | "This scheme was updated elsewhere. Reload to see the latest values." | Offer Reload. |
| ERR-OFRE-04 | Validation failure on Save | Per-field / per-row inline messages keyed by QPS-NNN. | Block save. |
| ERR-OFRE-05 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

**[NOT APPLICABLE]** — Edit reuses the same persisted record shape as OS-02 Create; see OS-02 Data Specification. Edit only mutates fields in place; identity (id) is unchanged.

### Workflow

```
1. Seller Admin clicks Edit on a non-Expired row (OS-01 AC-7 / AC-10).
2. System opens the Create / Edit dialog pre-filled with the scheme's current values; SKU is locked.
3. Seller Admin edits any of: Start Date, End Date, Active toggle, slab fields, +Add / Delete slab.
4. [DECISION] Seller Admin clicks an action:
    IF Cancel:           Discard edits; close dialog; EXIT.
    IF Save Changes:     Run QPS-001..012 + concurrency check.
5. [DECISION] Validation result:
    IF invalid:          Show inline errors; remain in dialog.
    ELSE:                Persist updates; derive new Status; close dialog.
6. Offers list refreshes; the row reflects the new validity, slabs and Status.
```

### Section 4 — UI/UX

**Wireframe Notes**

```
Dialog: Edit QPS Scheme
(Identical to OS-02's Create dialog with three differences)
├─ Header: "Edit QPS Scheme" + close (X)
├─ Section: Select SKU
│   └─ SKU shown as READ-ONLY context (cannot reassign — BR-2)
├─ Section: Validity            (editable; QPS-007 / 008)
├─ Section: Status              (Active toggle; auto-disabled when End Date past)
├─ Section: Pricing Slabs       (editable; +Add / Delete with rules)
└─ Footer Action Bar: [ Cancel ]   [ Save Changes ]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| SKU selector | Read-only in Edit (BR-2). | — | — |
| All other fields | Same rules as OS-02 (Start Date, End Date, Min Qty, Max Qty, Discount Type, Discount Value, cross-slab). | Same messages as OS-02. | On-blur / on-save |
| Active toggle | Disabled when End Date is in the past (BR-4). | (tooltip) "Extend End Date to reactivate." | On-render |

**Empty States**

**[NOT APPLICABLE]** — Edit always opens with a pre-filled scheme; no empty-state path inside the dialog.

---

# USER STORY OS-04

## Offers & Schemes — View QPS Offer Details (Read-only Dialog)

*Epic: Seller Admin — Offers & Schemes (QPS)   |   Priority: Medium   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Offers & Schemes — View QPS Offer Details (Read-only Dialog) |
| Epic / Feature Link | Seller Admin — Offers & Schemes (QPS) |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Medium — the read view lets the seller verify a scheme's slabs and savings without entering Edit mode. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — inspecting an existing QPS. |

**Business Context**

**WHY:** View Details is the read-only inspect view for a scheme. It opens as a dialog from the eye icon on any row (any status, including Expired). It surfaces the same shape of data as the editor but locked from edits, with a footer Edit button that switches to Edit mode — disabled when Status = Expired.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Inspecting an existing QPS | Verify a scheme at a glance without risking accidental edits | Opening Edit just to look at a scheme exposes the seller to accidental mutations |

**Success Metrics**

- 0% accidental edits originating from a "view" intent (View dialog stays read-only).
- View Details opens within \< 200ms of click on a list row (UI responsiveness).

**Real-World Scenario**

**CURRENT STATE:** Seller Admin wants to confirm the slab math on a scheme before forwarding the details to a buyer.

**DESIRED STATE:** Seller Admin clicks the eye icon on the row, the View Details dialog opens with the SKU, validity, status, slabs and computed savings — read-only — and the seller closes it without any risk of edit.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to view a scheme's full details — SKU, validity, status, slabs, computed savings — without entering Edit mode, so that I can verify a scheme at a glance without risking accidental edits.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin clicks View Details (eye icon) on any row
- **When** the action runs
- **Then** the system opens a read-only View Details dialog showing: SKU Code + SKU Name; MRP / SP context; Start → End validity; derived Status badge; slabs table with Min Qty / Max Qty / Discount / Effective Price / Customer Saves.

**AC-2:**
- **Given** the View Details dialog is open
- **When** the user inspects the slabs table
- **Then** all fields are read-only — no inputs, no toggles, no add / delete buttons.

**AC-3:**
- **Given** the View Details dialog is open
- **When** the dialog footer renders
- **Then** the footer shows: Close, Edit. The Edit button is disabled with the tooltip "Expired schemes cannot be edited" when Status = Expired (BR-3).

**AC-4:**
- **Given** the Seller Admin clicks Edit in the View dialog
- **When** Status is editable
- **Then** the View dialog closes and the Edit dialog (OS-03) opens pre-filled.

**AC-5:**
- **Given** the Seller Admin clicks Close (or X)
- **When** the action runs
- **Then** the dialog closes; the user remains on the Offers list with the same scroll / search / filter state preserved.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | View Details is available for all schemes regardless of Status (including Expired). |
| BR-2 | View Details is strictly read-only — no field is editable from this dialog. |
| BR-3 | Edit button in the footer is disabled when Status = Expired (consistent with OS-01 AC-8 and OS-03 BR-3). |
| BR-4 | Closing the dialog must not navigate the user away from the Offers list. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Scheme transitions to Expired while the View dialog is open | Edit button updates to disabled; Status badge updates to Expired. |
| 2 | Scheme is deleted in another session while the View dialog is open | On close, the Offers list refresh hides the row; if the user clicks Edit, surface a clear "This scheme no longer exists." toast. |

### Error Scenarios

**[NOT APPLICABLE]** — View Details is a read-only dialog over already-loaded list data; there are no failure modes beyond standard list-load errors covered by OS-01 ERR-OFR-01.

### Data Specification

**[NOT APPLICABLE]** — View Details renders the same persisted scheme shape as OS-02; no new fields are introduced or written from this view.

### Workflow

```
1. Seller Admin clicks the eye icon on any row.
2. System opens the View Details dialog with read-only content.
3. [DECISION] Seller Admin clicks an action in the dialog:
    IF Edit (when enabled):  Close View dialog; open Edit dialog (OS-03).
    IF Close / X:            Close dialog; remain on Offers list.
```

### Section 4 — UI/UX

**Wireframe Notes (Component Hierarchy)**

```
Dialog: View QPS Scheme
├─ Header: "Scheme Details" + close (X)
├─ Strip: SKU Code · SKU Name · MRP · SP · Validity · Status badge
├─ Slabs table (read-only): # | Min Qty | Max Qty | Discount | Effective Price | Customer Saves
└─ Footer: [ Close ]   [ Edit ]   (Edit disabled when Status = Expired)
```

**Field Validations**

**[NOT APPLICABLE]** — View Details has no editable inputs; validation is the responsibility of OS-02 / OS-03.

**Empty States**

**[NOT APPLICABLE]** — View Details only opens for an existing scheme; there is no empty path.

---

# USER STORY OS-05

## Offers & Schemes — Delete QPS Offer (Confirmation)

*Epic: Seller Admin — Offers & Schemes (QPS)   |   Priority: Medium   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Offers & Schemes — Delete QPS Offer (Confirmation) |
| Epic / Feature Link | Seller Admin — Offers & Schemes (QPS) |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Medium — sellers need to retire schemes that were created in error or are no longer relevant. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — retiring a scheme. |

**Business Context**

**WHY:** Delete is the only way to permanently remove a scheme from the catalog. It is allowed for any Status (Active, Inactive, Scheduled, Expired) and is gated by a confirmation dialog showing the scheme name and slab count. The Phase 1 implementation does not block delete based on referential checks — the seller owns the decision.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Retiring a scheme | Permanently remove stale or test schemes after explicit confirmation | Without a confirmation gate, accidental deletions of live schemes are too easy |

**Success Metrics**

- 100% of deletes pass through the confirmation dialog (no direct / no-confirm delete path).
- Accidental delete rate (rolled back via support ticket) — target near 0%.

**Real-World Scenario**

**CURRENT STATE:** Seller Admin created a test scheme that should not have gone live; another scheme is no longer relevant after the season ended.

**DESIRED STATE:** Seller Admin clicks the trash icon, the confirmation dialog shows the scheme name and slab count plus the irreversibility note, the seller clicks Delete, and the scheme is removed; KPI cards refresh.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to permanently delete a QPS scheme after confirming I understand the action is final, so that I can clean up the catalog without leaving stale or test schemes around.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin clicks Delete (trash icon) on any row
- **When** the action runs
- **Then** the system opens a confirmation dialog stating: "Delete \<scheme name\>? This scheme has \<N\> slab(s). This action cannot be undone." with two actions: Cancel \| Delete.

**AC-2:**
- **Given** the confirmation dialog is open
- **When** the Seller Admin clicks Cancel (or X)
- **Then** the dialog closes with no change; the scheme remains in the list.

**AC-3:**
- **Given** the confirmation dialog is open
- **When** the Seller Admin clicks Delete
- **Then** the scheme is removed from the catalog; the Offers list refreshes; the KPI cards refresh; a success toast confirms "Scheme deleted."

**AC-4:**
- **Given** the scheme is currently Active
- **When** the user clicks Delete
- **Then** the same confirmation flow applies. [NEEDS INPUT] confirm whether deleting an Active scheme requires an extra warning step (e.g., "This scheme is currently Active — are you sure?").

**AC-5:**
- **Given** delete fails server-side
- **When** the API responds with an error
- **Then** the scheme remains in the list; an error toast is shown (ERR-OFRD-01); the user may retry.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Delete is allowed for any Status (Active, Inactive, Scheduled, Expired). |
| BR-2 | A confirmation dialog is mandatory — there is no quick / no-confirm delete path. |
| BR-3 | The confirmation dialog must show the scheme name and the slab count. |
| BR-4 | Phase 1 has no cascading checks — deleting a scheme does not touch any past order's pricing snapshot. |
| BR-5 | [NEEDS INPUT] Whether deleting an Active scheme requires an additional warning step (per AC-4). |
| BR-6 | [NEEDS INPUT] Whether the API uses soft-delete (with audit trail) or hard-delete in Phase 1. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Seller deletes the only scheme in the catalog | List goes to empty state; KPI cards reset to 0. |
| 2 | Seller deletes a scheme that just transitioned to Expired | Same flow; the Status badge in the confirm dialog reads Expired. |
| 3 | Seller deletes a scheme already deleted in another session | API returns 404 / not-found; toast "This scheme no longer exists."; remove the row from the list. |
| 4 | Seller cancels at the confirmation step | No-op; scheme remains. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-OFRD-01 | Delete API timeout / server error | "Could not delete the scheme. Please retry." | Keep scheme in list; offer retry. |
| ERR-OFRD-02 | Scheme already deleted (404) | "This scheme no longer exists." | Remove row from the list silently. |
| ERR-OFRD-03 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

**[NOT APPLICABLE]** — Delete only references the existing scheme by id and (optionally per BR-6) writes a soft-delete flag / audit record; no new write-back fields.

### Workflow

```
1. Seller Admin clicks the trash icon on any row.
2. System opens the confirmation dialog with scheme name + slab count + irreversibility note.
3. [DECISION] Seller Admin clicks an action:
    IF Cancel:   Close dialog; no change; EXIT.
    IF Delete:   Call delete API.
4. [DECISION] API result:
    IF success:  Remove row; refresh KPIs; success toast.
    ELSE:        Keep row; show error toast (ERR-OFRD-01) with retry.
```

### Section 4 — UI/UX

**Wireframe Notes**

```
Dialog: Delete QPS Scheme?
├─ Title: "Delete <scheme name>?"
├─ Body: "This scheme has <N> slab(s). This action cannot be undone."
└─ Footer: [ Cancel ]   [ Delete ] (destructive style)
```

**Field Validations**

**[NOT APPLICABLE]** — Delete is a confirm-only dialog with no input fields.

**Empty States**

**[NOT APPLICABLE]** — Delete operates on a single existing row; no list / table empty-state path applies.

---

# USER STORY OS-06

## Offers & Schemes — Bulk Import QPS Schemes (Template + Validate + Merge)

*Epic: Seller Admin — Offers & Schemes (QPS)   |   Priority: High   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Offers & Schemes — Bulk Import QPS Schemes (Template + Validate + Merge) |
| Epic / Feature Link | Seller Admin — Offers & Schemes (QPS) |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | High — distributors with large catalogs need a way to define schemes for many SKUs at once. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — onboarding many schemes from a spreadsheet. |

**Business Context**

**WHY:** Hand-creating a QPS for every SKU in a 200-SKU catalog is impractical. Bulk Import lets the Seller Admin download a CSV template, fill one row per slab (multiple rows per SKU), upload the file, review a validation preview that groups rows into per-SKU schemes, and on confirmation create or update schemes in bulk with merge-by-SKU semantics.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Onboarding many schemes from a spreadsheet | Roll out tiered pricing across the catalog in minutes | One-by-one creation does not scale to 100s of SKUs |

**Success Metrics**

- 80+ schemes onboarded in a single bulk import — target under 5 minutes end-to-end (download → fill → upload → review → import).
- 100% of invalid schemes are flagged in the preview with a QPS-NNN code (no silent failures).

**Real-World Scenario**

**CURRENT STATE:** Seller Admin has 80 SKUs that need a tiered QPS each.

**DESIRED STATE:** Seller Admin clicks Bulk Import, downloads the CSV template, fills it row-by-slab in their tool of choice, uploads, reviews the validation preview (Aggregated by SKU and Per-Row tabs), fixes any flagged rows, and clicks Import — the system creates / updates 80 schemes in one operation and the toast confirms "80 scheme(s) — N new, M updated."

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to bulk-import QPS schemes from a structured file with template download, validation preview, and merge-by-SKU semantics, so that I can roll out tiered pricing across the catalog in minutes.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin clicks Bulk Import on the Offers list
- **When** the action runs
- **Then** the system opens the Bulk Import flow with three steps: 1) Download Template, 2) Upload File, 3) Review Validation Preview & Import.

**AC-2:**
- **Given** the Seller Admin clicks Download Template
- **When** the action runs
- **Then** the system downloads a CSV with the canonical 9 columns: SKU ID, SKU Name (display), MRP (display), SP (display), Slab Start (Min Qty), Slab End (Max Qty, blank for open-ended last slab), Slab Price (Flat), Slab Percent (% off), Effective Value.

**AC-3:**
- **Given** the Seller Admin uploads a file
- **When** the upload completes
- **Then** the system accepts CSV / XLSX / XLS; on parse failure, surface an error and allow re-upload.

**AC-4:**
- **Given** the file is parsed successfully
- **When** the validation preview renders
- **Then** two tabs are shown: "Aggregated Schemes" (rows grouped by SKU into one scheme each) and "Rows" (per-row detail with status pills); each row / scheme that fails validation shows the QPS-NNN error code and a per-field reason.

**AC-5:**
- **Given** validation runs over the uploaded rows
- **When** rows are grouped by SKU into schemes
- **Then** the same per-field rules QPS-001..009 and cross-slab rules QPS-010 / 011 / 012 apply per scheme; SKUs that do not exist in the distributor's catalog (QPS-009) are flagged as errors.

**AC-6:**
- **Given** at least one valid scheme is present in the preview
- **When** the Seller Admin clicks Import
- **Then** the system applies merge-by-SKU semantics: for each valid SKU, if a scheme already exists for that SKU, it is UPDATED; otherwise a NEW scheme is created. Invalid schemes are skipped.
- **And** a success toast summarises the outcome: "X scheme(s) — Y new, Z updated"; invalid rows remain visible in the preview for offline correction and re-upload.

**AC-7:**
- **Given** every uploaded scheme fails validation
- **When** the Seller Admin reviews the preview
- **Then** the Import button is disabled; the user must fix the file and re-upload.

**AC-8:**
- **Given** the Seller Admin clicks Cancel at any step
- **When** the action runs
- **Then** the upload is discarded; no schemes are created or modified; the user returns to the Offers list.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Supported file formats: .csv, .xlsx, .xls. |
| BR-2 | Canonical CSV columns (in order): SKU ID, SKU Name, MRP, SP, Slab Start, Slab End, Slab Price (Flat), Slab Percent, Effective Value. |
| BR-3 | One row per slab. Multiple rows for the same SKU are aggregated into a single scheme; the union of slabs forms the scheme's slab list. |
| BR-4 | Validation runs the same per-field rules QPS-001..009 and cross-slab rules QPS-010 / 011 / 012 from Appendix A, applied per scheme after aggregation. |
| BR-5 | Merge-by-SKU on Import: existing scheme for a SKU is UPDATED in place; non-existent SKU schemes are CREATED. |
| BR-6 | Invalid schemes are skipped (partial commit) — valid schemes are imported even when other schemes in the same file fail. |
| BR-7 | [NEEDS INPUT] Maximum file size and maximum rows per upload. |
| BR-8 | [NEEDS INPUT] Whether existing slabs on a SKU are REPLACED entirely by the uploaded slabs (current implementation: replace) or MERGED with existing slabs (would require additional disambiguation rules). |
| BR-9 | [NEEDS INPUT] Default Start / End dates for newly imported schemes if not present in the file (proposal: today → today + 30 days; confirm). |
| BR-10 | [NEEDS INPUT] Sync vs async processing (proposal: sync for files ≤ 1000 rows; async + notification beyond). |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | File contains a SKU not in the distributor's catalog | Aggregated scheme flagged with QPS-009 ("SKU not found in catalog"); skipped on Import. |
| 2 | File has overlapping slabs for the same SKU | Aggregated scheme flagged with QPS-010; skipped on Import. |
| 3 | File has gap between slabs for the same SKU | Aggregated scheme flagged with QPS-011; skipped on Import. |
| 4 | File has slab order with rising effective price | Aggregated scheme flagged with QPS-012; skipped on Import. |
| 5 | File has rows for both Flat and Percent on the same slab (Slab Price AND Slab Percent both filled) | Per-row error: "Provide either Flat or Percent, not both." |
| 6 | File has empty Slab End for a non-last slab | Per-row error: only the last slab may be open-ended (QPS-002). |
| 7 | File has duplicate rows (same SKU + same slab range) | Per-row error: duplicate slab; only one is kept (or all flagged — [NEEDS INPUT] confirm preferred behaviour). |
| 8 | User uploads an empty file (header only) | Reject upload: "File contains no data rows." |
| 9 | User uploads an unsupported format (e.g., .txt) | Reject upload: "Only CSV, XLSX or XLS files are supported." |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-OFRI-01 | File parse failure | "We could not read this file. Please use the sample template." | Reject file; remain on upload step. |
| ERR-OFRI-02 | Import API timeout / server error | "Import failed. Please retry." | Keep preview; allow retry. |
| ERR-OFRI-03 | All schemes fail validation | "No valid schemes found. Please review the validation preview." | Disable Import button. |
| ERR-OFRI-04 | Some schemes fail validation (partial) | "X imported, Y skipped. See preview for details." | Apply valid; keep preview for review. |
| ERR-OFRI-05 | Session expired during upload | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| # | Column | Type | Required | Notes |
| --- | --- | --- | --- | --- |
| 1 | SKU ID | String | Yes | Must exist in the distributor's catalog (QPS-009). |
| 2 | SKU Name | String | Display only | Helpful for spreadsheet readability; not used for matching. |
| 3 | MRP | Decimal | Display only | Snapshot from SKU master; ignored on import. |
| 4 | SP (Selling Price) | Decimal | Display only | Snapshot from SKU master; ignored on import. |
| 5 | Slab Start (Min Qty) | Integer | Yes | QPS-001. |
| 6 | Slab End (Max Qty) | Integer | Yes except last slab | Blank only for the last (open-ended) slab — QPS-002. |
| 7 | Slab Price (Flat) | Decimal | Conditional | Required when this row's discount is Flat; mutually exclusive with Slab Percent (QPS-003 / 004). |
| 8 | Slab Percent | Decimal | Conditional | Required when this row's discount is Percent; mutually exclusive with Slab Price (QPS-003 / 005). |
| 9 | Effective Value | Decimal | Display only | The expected Effective Price; if present, must match the computed value (QPS-006) within the rounding rule. |

### Workflow

```
1. Seller Admin clicks Bulk Import on the Offers list (OS-01).
2. System opens the Bulk Import flow with Step 1: Download Template.
3. (Optional) Seller Admin clicks Download Template -> CSV with 9 columns is served.
4. Seller Admin fills the file offline (one row per slab, multiple rows per SKU) and uploads it.
5. System parses the file.
    IF parse failure:                Reject (ERR-OFRI-01); remain on upload step.
    ELSE:                            Proceed to validation.
6. System aggregates rows by SKU into schemes; runs QPS-001..009 per row and QPS-010..012 across each scheme's slabs.
7. System renders the validation preview with two tabs:
    - Aggregated Schemes (one row per SKU; status: Valid / Error)
    - Rows (per-row status; per-row reasons keyed by QPS-NNN)
8. [DECISION] Seller Admin clicks an action:
    IF Cancel:    Discard upload; close flow; EXIT.
    IF Import:    Apply merge-by-SKU for all valid schemes (CREATE if SKU has no scheme; UPDATE if it does); skip invalid.
9. System shows summary toast: "X scheme(s) - Y new, Z updated". Invalid rows remain visible for offline correction.
10. Offers list refreshes; KPI cards refresh; new / updated schemes appear with derived Status.
```

### Section 4 — UI/UX

**Wireframe Notes (Component Hierarchy)**

```
Page / Drawer: Bulk Import QPS Schemes
├─ Step 1: Download Template
│   └─ Body: short instruction + [ Download Template (CSV) ] button
├─ Step 2: Upload File
│   └─ Body: drop-zone / file picker; supported formats hint (CSV, XLSX, XLS)
├─ Step 3: Validation Preview & Import
│   ├─ Tabs: [ Aggregated Schemes ] [ Rows ]
│   ├─ Aggregated tab: per-SKU scheme rows with Valid / Error pill + per-error reason
│   └─ Rows tab: per-row detail with QPS-NNN error code per row
└─ Footer: [ Cancel ]   [ Import ]   (Import disabled when no valid scheme)
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| File format | One of .csv / .xlsx / .xls (BR-1). | "Only CSV, XLSX or XLS files are supported." | On-upload |
| File contents | At least one data row beyond header. | "File contains no data rows." | On-parse |
| Per-row | Slab Price XOR Slab Percent; not both. | "Provide either Flat or Percent, not both." | On-parse |
| Per-row | Slab End blank only for the last slab (QPS-002). | "Only the last slab may be open-ended." | On-parse |
| Per-row + per-scheme | QPS-001..009 (per row), QPS-010..012 (cross-slab per scheme). | Per-row keyed messages with QPS-NNN. | On-parse |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Bulk Import — no file selected | Drop your file here or click to browse. Use the sample template for guaranteed compatibility. | "Download Template" |
| Validation Preview — zero schemes parsed | We could not find any valid schemes in this file. Please use the sample template. | "Re-upload File" |

**Error Messages**

| Error Code | User-Facing Message | Technical Log Message |
| --- | --- | --- |
| ERR-OFRI-01 | We could not read this file. Please use the sample template. | qps_import_parse_failed |
| ERR-OFRI-02 | Import failed. Please retry. | POST /offers/import failed: \<statusCode\> |
| ERR-OFRI-03 | No valid schemes found. Please review the validation preview. | qps_import_no_valid_schemes |
| ERR-OFRI-04 | X imported, Y skipped. See preview for details. | qps_import_partial_success |
| ERR-OFRI-05 | Your session has expired. Please log in again. | 401 Unauthorized on /offers/import |

---

## Appendix A — QPS Slab Validation Rules

These rules are referenced from OS-02 (Create), OS-03 (Edit), and OS-06 (Bulk Import). They are codified in `src/app/lib/qps-validation.ts`. Per-field rules apply on every input change; cross-slab rules apply on Save.

**Per-Field Rules**

| # | Field | Rule |
| --- | --- | --- |
| QPS-001 | Min Qty | Required; integer; \> 0; Slab 1 starts at 1 by default. |
| QPS-002 | Max Qty | Required for all slabs except the LAST (which may be open-ended / unbounded); integer; \> Min Qty. |
| QPS-003 | Discount Type | Required; one of "flat" \| "percent". |
| QPS-004 | Discount Value (Flat) | Required when Discount Type = flat; decimal; \> 0; \< SKU Selling Price. |
| QPS-005 | Discount Value (Percent) | Required when Discount Type = percent; numeric; \> 0; \< 100. |
| QPS-006 | Effective Price (computed) | Flat: = Discount Value. Percent: = round(SP × (1 − P / 100), 2). Always \> 0 and ≤ SP. |
| QPS-007 | Start Date | Required; date; ≤ End Date. |
| QPS-008 | End Date | Required; date; ≥ Start Date; ≥ today on Create. |
| QPS-009 | SKU | Required; must belong to this distributor's catalog; must have a Selling Price \> 0. |

**Cross-Slab Rules (run on Save)**

| # | Rule | Description |
| --- | --- | --- |
| QPS-010 | No Overlaps | For any two slabs i and j (i ≠ j), their quantity ranges must not overlap. |
| QPS-011 | No Gaps (Contiguity) | When slabs are sorted by Min Qty ascending: Min(i+1) = Max(i) + 1. Only the last slab may be open-ended. |
| QPS-012 | Monotone Non-Increasing Effective Price | When slabs are sorted by Min Qty ascending, the computed Effective Price must be non-increasing across slabs (a higher quantity tier never costs more per unit than a lower tier). |

---

## Open Questions for the Next Walkthrough Session

1. **List** — pagination model (page size, controls); default sort order; whether status filter should support multi-select.
2. **Create / Edit** — whether to enforce the proposed 4-slab cap (current code does not cap); single-Active-scheme-per-SKU policy (hard block vs warn-and-allow); rounding rule and decimal precision for Effective Price; unsaved-edits guard on Cancel.
3. **Edit** — whether SKU re-selection is desired in any case; whether slab edits apply retroactively to past orders.
4. **Delete** — extra warning for Active schemes; soft-delete vs hard-delete; audit trail.
5. **Bulk Import** — max file size / row count; existing-slabs replace vs merge semantics; default Start / End dates when not present; sync vs async processing for large files; duplicate-row handling.
6. **Concurrency** — server-driven "latest version" guard or optimistic concurrency on Edit Save.
7. **Reporting** — whether Avg Max Discount KPI should also surface per-status breakdowns or trend over time.
8. **Audit** — whether scheme edits / deletes need an immutable history accessible from the View Details dialog.
