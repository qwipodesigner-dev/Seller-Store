# QWIPO SELLER STORE — Customers, Phase 1

**User Story Specifications**

| Field | Value |
| --- | --- |
| Document Type | User Story Specifications — Customers Module |
| Module | Seller Admin — Customers (Approval Workflow: Pending / Approved / Rejected) |
| Persona | Seller Admin (Distributor) |
| Business Owner | Product Team (Qwipo Seller Store) |
| Total Stories | 7 (CM-01 through CM-07) |
| Version | 1.0 — Draft (initial dedicated coverage of the Customer Approval workflow) |
| Date | 2 May 2026 |
| Status | Ready for Dev |
| Document Owner | Omkar Charankar |
| Companion Documents | Seller-Store-User-Stories-Phase1.docx (Seller Admin); Seller-Store-Super-Admin-User-Stories-Phase1.docx; Seller-Store-Orders-User-Stories-Phase1.docx; Seller-Store-Offers-Schemes-User-Stories-Phase1.docx; Seller-Store-Support-User-Stories-Phase1.docx; Seller-Store-ONDC-SKU-Validation-Rules.docx |

## Document Scope & Note to Reviewer

**SCOPE:** This document is the dedicated user-story specification for the Qwipo Seller Store — Customers module under the Seller Admin persona. Phase 1 covers the per-company approval workflow for buyer-initiated customer onboarding. Coverage includes: the three-tab list view (Pending Approval / Approved / Rejected); the per-row Approve / Reject / Details actions on the Pending tab; the mandatory-delivery-day Approve flow (single + bulk); the Reject-with-reason flow (single + bulk); the mobile-keyed Linked Companies grouping on the Approved and Rejected tabs (including the mixed-state case where a customer is approved on one brand and rejected on another); and the Customer Detail page which is the canonical surface for per-company control and the Reopen flow (the only path to change a previously assigned delivery day or reverse a prior decision in Phase 1).

**GROUNDING:** Stories are grounded in the actual implementation under `src/app/pages/customers.tsx`, `src/app/pages/customer-detail.tsx`, and `src/app/lib/customers-data.ts`. Where the design notes under `src/imports/pasted_text/customer-module-design.md` describe an alternate Master / DMS / ONDC tab architecture, this story set captures the implemented Pending / Approved / Rejected workflow and flags the discrepancy as **[NEEDS INPUT]** (see Open Questions).

**OUT OF SCOPE:** DMS sync status badges and a separate ONDC source tab; an in-app messaging channel back to the buyer on rejection; a settings panel for per-brand auto-approval rules; CRM-grade segmentation (RFM, churn risk, lifetime value); buyer-side / buyer-app behaviour. These are deferred beyond Phase 1.

## Persona Overview

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Distributor processing buyer-initiated customer onboarding requests | Approve, reject, or defer every onboarding request quickly, with one row per (customer × company) on Pending and a clean mobile-keyed view on Approved / Rejected | Without per-brand approval and a Linked Companies view, multi-brand distributors cannot tell which brands a buyer is allowed to order from |

## Customer Approval Lifecycle (Phase 1) — Navigation

A "customer" is uniquely identified by **mobile number**. When a buyer registers from the buyer app and requests onboarding against one or more of the distributor's companies / brands, the system creates one **Company Approval** entry per requested company under that customer. Each entry has its own status (`pending` / `approved` / `rejected`) — so a single customer can be Approved on Brand A and Rejected on Brand B at the same time. The list tabs reflect the per-company entry status, then group on the Approved / Rejected tabs by mobile.

| Status (per Company Approval) | Lands in Tab | Set By | Required Inputs |
| --- | --- | --- | --- |
| pending | Pending Approval | System (on buyer registration) | None — created on buyer onboarding request |
| approved | Approved | Seller Admin (Approve action) | Mandatory: Delivery Day (one of NDD / Mon–Sun) |
| rejected | Rejected | Seller Admin (Reject action) | Mandatory: Rejection Reason (Outside Service Area \| Incomplete Information \| Invalid Documents \| Duplicate Registration \| Other → free-text) |
| pending (re-opened) | Pending Approval | Seller Admin (Reopen action on Detail page) | None — flips status back; clears delivery day / reason |

**Mixed-state customers:** A customer with both Approved and Rejected company entries appears in **both** the Approved and Rejected tabs. Each tab's row shows only the subset of companies in that status (e.g., Approved tab shows the approved company; Rejected tab shows the rejected company).

## Story Index

| # | Story Title | Module | Priority | Dependency | Status |
| --- | --- | --- | --- | --- | --- |
| CM-01 | Customers — List Page (3 Tabs, KPI Cards, Search, Filter, Export, Pagination) | Customers | Critical | None | Ready for Dev |
| CM-02 | Customers — Pending Approval Tab (Per-row Approve / Reject / Details Actions) | Customers | Critical | CM-01 | Ready for Dev |
| CM-03 | Customers — Approve Customer Flow (Mandatory Delivery Day; Single + Bulk) | Customers | Critical | CM-02 | Ready for Dev |
| CM-04 | Customers — Reject Customer Flow (Reason + Other Comment; Single + Bulk) | Customers | Critical | CM-02 | Ready for Dev |
| CM-05 | Customers — Approved Tab (Linked Companies Grouping, Details, Reopen Path) | Customers | High | CM-03 | Ready for Dev |
| CM-06 | Customers — Rejected Tab (Mixed-State Handling, Linked Companies, Reopen Path) | Customers | High | CM-04 | Ready for Dev |
| CM-07 | Customers — Customer Detail Page (Per-Company Approval Control + Reopen) | Customers | Critical | CM-02, CM-05, CM-06 | Ready for Dev |

---

# USER STORY CM-01

## Customers — List Page (3 Tabs, KPI Cards, Search, Filter, Export, Pagination)

*Epic: Seller Admin — Customers   |   Priority: Critical   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Customers — List Page (3 Tabs, KPI Cards, Search, Filter, Export, Pagination) |
| Epic / Feature Link | Seller Admin — Customers |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Critical — the Customers list is the seller's daily operating view for the buyer-onboarding pipeline; it is the entry point to every approval action. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — distributor processing incoming buyer-onboarding requests across one or more brands. |

**Business Context**

**WHY:** Buyers register from the buyer app and request onboarding against one or more of the distributor's companies / brands. The Seller Admin needs a single, always-available screen to (a) see the entire approval pipeline at a glance via four KPI cards, (b) triage requests by their lifecycle stage via three tabs (Pending Approval, Approved, Rejected), (c) narrow the list with search and filters (Brand / Company, Class Type, Registration Date Range), (d) pull a date-bounded export for offline analysis, and (e) jump from any row into the Customer Detail page for per-company control. Without this page, multi-brand distributors cannot tell which brands a given buyer is allowed to order from.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Distributor processing buyer-onboarding requests | Triage every (customer × company) request from a single screen with at-a-glance KPIs and one-click jump-into-detail | Without a unified list with per-brand visibility, multi-brand distributors lose track of which buyers are onboarded for which brand |

**Success Metrics**

- Median time to find a specific customer (search) — target under 5 seconds.
- Acknowledgement time for a new Pending request (creation → Approve / Reject) — target under 24 hours for 95% of requests.
- KPI cards reconcile with the underlying list — target 100% accuracy.

**Real-World Scenario**

**CURRENT STATE:** A multi-brand distributor onboards 10–20 buyers per week from the buyer app, across three brands. The seller has no operational view of who is waiting and who is already onboarded against which brand.

**DESIRED STATE:** Seller Admin opens Customers, sees the four KPI cards (Total / Active / New this month / Repeat buyers 10+), the Pending Approval tab badge shows 12, the seller filters Brand / Company = Brand A, types the buyer's area name in search, finds the row, and acts on it from CM-02 / CM-03 / CM-04.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to view, search, filter, paginate and export every buyer-onboarding request across three lifecycle tabs with at-a-glance KPIs, so that I can triage my approval pipeline from a single screen and jump into any (customer × company) request with one click.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin clicks Customers in the left navigation
- **When** the page loads
- **Then** the system displays four KPI cards in this order: Total Customers, Active Customers, New this month, Repeat buyers (10+).

**AC-2:**
- **Given** the page renders
- **When** the user inspects the tab bar
- **Then** three tabs are shown in this order with count badges: Pending Approval (clock icon, amber), Approved (check icon, green), Rejected (X icon, red); the Pending Approval tab is selected by default.

**AC-3:**
- **Given** the active tab is Pending Approval
- **When** the table renders
- **Then** the columns shown in this order are: select-all checkbox, Customer (customerName), Class (classType badge), Business (businessName), Mobile, Brand / Company (companyName badge), Area / Pincode (area on top, "pincode · city" beneath), Registered (registeredDate), Actions (Reject \| Approve \| Eye/Details).

**AC-4:**
- **Given** the active tab is Approved or Rejected
- **When** the table renders
- **Then** the columns shown in this order are: Customer, Class, Business, Mobile, Linked Companies (button: "{N} company / companies"), Area / Pincode, Registered, Actions (Eye/Details only).

**AC-5:**
- **Given** the Seller Admin types in the search input
- **When** the input changes
- **Then** the active-tab list filters to rows where the term matches any of: customerName, businessName, mobile (whitespace-normalised), area, city, pincode (case-insensitive contains-match).

**AC-6:**
- **Given** the Seller Admin opens the Filter panel (right-side drawer)
- **When** filters are applied (Brand / Company multi-select, Class Type multi-select, Registration Date Range From / To)
- **Then** the list refreshes to rows matching all selected filters; applied filters are reflected as removable chips above the table; pagination resets to page 1.

**AC-7:**
- **Given** the Filter panel is open
- **When** the user clicks Clear
- **Then** every filter input in the panel is cleared; the user can re-apply or close the panel.

**AC-8:**
- **Given** the chip bar shows one or more active filters
- **When** the Seller Admin clicks Clear all
- **Then** every active filter is cleared on every tab; the chip bar is hidden; pagination resets to page 1.

**AC-9:**
- **Given** the Seller Admin clicks Export
- **When** the export dialog opens
- **Then** the system asks for a Registration Date Range (From / To, both optional); on confirmation, the system downloads a CSV containing all customers whose Registered date falls in the chosen range.

**AC-10:**
- **Given** more than 10 rows match the active tab and any applied search / filter
- **When** the list renders
- **Then** exactly 10 rows are shown per page and Previous / Next pagination controls are visible; the controls are disabled appropriately on the first and last pages; the footer shows "Showing X to Y of Z" and "Page A of B".

**AC-11:**
- **Given** the Seller Admin clicks the Eye / Details icon on any row
- **When** the action runs
- **Then** the system navigates to the Customer Detail page (CM-07) at `/customers/{customerId}`.

**AC-12:**
- **Given** the seller has zero (customer × company) requests in the pipeline
- **When** the page loads
- **Then** all four KPI cards display 0; the Pending Approval tab badge shows 0; the empty state is shown on the active tab.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | The list is scoped to the logged-in distributor — no cross-tenant visibility. |
| BR-2 | Customer uniqueness key is **mobile**; one customer may have multiple Company Approvals (one per requested company / brand). |
| BR-3 | Pending Approval tab shows ONE ROW PER (customer × company) request — a buyer who requests two brands shows as two rows. |
| BR-4 | Approved and Rejected tabs GROUP BY MOBILE — multiple companies for the same customer collapse into a single row with a Linked Companies button (see CM-05 / CM-06). |
| BR-5 | A customer with both Approved and Rejected company entries appears in BOTH the Approved and Rejected tabs; each tab shows only the subset of companies in that status. |
| BR-6 | Tab count badges reflect the count of rows visible on each tab AFTER any applied search / filter. |
| BR-7 | Search matches customerName OR businessName OR mobile (whitespace-normalised) OR area OR city OR pincode (case-insensitive, contains-match). [NEEDS INPUT] confirm whether to add explicit debounce on the search input (current implementation updates on every keystroke). |
| BR-8 | Filter — Brand / Company: multi-select sourced from the union of all companyApprovals across the distributor's customers. |
| BR-9 | Filter — Class Type: multi-select from the canonical 8 values: Kirana, Wholesaler, Bakery, Grocery, Supermarket, Restaurant, Hotel, Other. |
| BR-10 | Filter — Registration Date Range: From / To inclusive, both optional individually; "Registered" = date of the customer's first order (NOT signup date). |
| BR-11 | Export: scope is the Registration Date Range chosen in the dialog only; the active tab and current search / filter chips do NOT alter the export. [NEEDS INPUT] confirm whether export should honour active filter chips. |
| BR-12 | Page size is fixed at 10 rows per page in Phase 1; pagination controls are limited to Previous and Next. [NEEDS INPUT] confirm 10 vs the 25-per-page convention used in Orders / SKU lists. |
| BR-13 | Default sort within each tab is Registered date descending (newest first). |
| BR-14 | Tab switching, search change, filter Apply / Clear, and Clear all chips ALL reset pagination to page 1. |
| BR-15 | Phase 1 export format is CSV only. [NEEDS INPUT] confirm whether XLSX should be added (user walkthrough mentioned "Excel or CSV"). |

**KPI Card Definitions**

| Card # | Label | Definition | Source |
| --- | --- | --- | --- |
| 1 | Total Customers | Count of all unique customers (by mobile) for this distributor, regardless of approval status. | COUNT(distinct customer.mobile) |
| 2 | Active Customers | Count of customers with at least one placed order. | COUNT(customer WHERE totalOrders \> 0) |
| 3 | New this month | Count of customers whose Registered date falls in the current calendar month. | COUNT(customer WHERE registeredDate ≥ monthStart) |
| 4 | Repeat buyers (10+) | Count of customers with 10 or more placed orders. | COUNT(customer WHERE totalOrders ≥ 10) |

**Tab Specification**

| Tab | Definition | Default Sort | Per-row Actions | Bulk Actions (CM-03 / CM-04) |
| --- | --- | --- | --- | --- |
| Pending Approval | One row per (customer × company) entry whose status = pending. | Registered date desc | Reject \| Approve \| Details | Reject Selected, Approve Selected |
| Approved | Customers (grouped by mobile) with at least one Company Approval whose status = approved; row shows only the approved subset. | Registered date desc | Details | None |
| Rejected | Customers (grouped by mobile) with at least one Company Approval whose status = rejected; row shows only the rejected subset. | Registered date desc | Details | None |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Seller has zero customers ever | All four KPI cards = 0; all three tab badges = 0; empty state on the active tab; Export dialog still openable but yields the "no rows in range" message. |
| 2 | Search returns zero rows on the active tab | Show "No {pending requests \| approved customers \| rejected customers}" with helper "Try adjusting your search or filters."; pagination footer hidden. |
| 3 | Filter Date Range From \> To | Block Apply with inline error; chips do not update. |
| 4 | Export Date Range From \> To | Block Download with toast: "'From' date must be before 'To' date." |
| 5 | Export with no rows in range | Toast: "No customers found in the selected date range."; do not download an empty file. |
| 6 | Tab is switched while a search term is active | Search term is preserved and applied to the new tab; tab badges and rows reflect the combined filter; pagination resets to page 1. |
| 7 | Buyer requests a 4th brand while the seller has the Pending tab open | On next list refresh, a new row is appended; the Pending tab badge increments. |
| 8 | Filter — Brand / Company list is empty (no companyApprovals exist anywhere) | The dropdown shows the empty-state placeholder "All companies"; no filter is applied. |
| 9 | User on page 3 changes the search term | Pagination resets to page 1 of the new filtered set. |
| 10 | A customer is approved for Brand A and rejected for Brand B (mixed state) | The customer appears in BOTH the Approved tab (Brand A row) and the Rejected tab (Brand B row); tab badges count each instance independently. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-CUS-01 | List load API fails | "Unable to load customers. Please retry." | Show retry CTA; preserve search / filter / tab state. |
| ERR-CUS-02 | Search request fails | "Search is temporarily unavailable. Please try again." | Keep previously loaded list visible; non-blocking toast. |
| ERR-CUS-03 | Pagination request fails | "Could not load the next page. Please retry." | Keep current page visible; offer retry. |
| ERR-CUS-04 | Export request fails | "Export failed. Please retry." | Keep export dialog open; offer retry. |
| ERR-CUS-05 | Export — no rows in range | "No customers found in the selected date range." | Block download; keep dialog open. |
| ERR-CUS-06 | Export — From \> To | "'From' date must be before 'To' date." | Block download; keep dialog open. |
| ERR-CUS-07 | Session expired | "Your session has expired. Please log in again." | Redirect to login; preserve target URL. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| id (customerId) | String | Yes | System-generated; unique per distributor. | Customer record. |
| customerName | String | Yes | Display only. | Buyer registration. |
| businessName | String | Yes | Display only. | Buyer registration. |
| classType | Enum | Yes | One of Kirana \| Wholesaler \| Bakery \| Grocery \| Supermarket \| Restaurant \| Hotel \| Other. | Buyer registration. |
| mobile | String | Yes | Customer uniqueness key; whitespace-normalised on search. | Buyer registration. |
| area | String | Yes | Locality name (e.g., "MG Road"). | Buyer registration. |
| pincode | String | Yes | Display. | Buyer registration. |
| city | String | Yes | Display. | Buyer registration. |
| state | String | Yes | Display. | Buyer registration. |
| fullAddress | String | Yes | Used in Detail page and Export. | Buyer registration. |
| latitude / longitude | Number | Yes | Used for map embed and Export. | Buyer registration / geocode. |
| registeredDate | Date (ISO YYYY-MM-DD) | Yes | "Registered" = date of the customer's FIRST ORDER, not signup. | Computed / Order record. |
| totalOrders | Integer | Yes | Drives Active and Repeat KPI cards. | Computed from orders. |
| totalRevenue | Decimal | Yes | INR; used in Export. | Computed from orders. |
| email | String | Optional | Display + Export. | Buyer registration. |
| gstNumber | String | Optional | Display + Export. | Buyer registration. |
| companyApprovals[] | Array | Yes | One entry per requested company; see CM-02 / CM-05 / CM-06 for shape. | Per-brand request. |

### Workflow

```
1. Seller Admin clicks Customers in the left navigation.
2. System loads the customers scoped to this distributor; computes KPI cards.
3. System renders the four KPI cards, the three tabs (Pending Approval default), the table, and pagination.
4. [DECISION] Seller Admin chooses an action (any order, can combine):
   IF Switch tab:                  Re-render rows for the new tab; preserve search / filter context; reset to page 1.
   IF Search:                      Filter list; reset to page 1.
   IF Filter (Apply):              Apply Brand/Company / Class / Registration Date Range; chips render; reset to page 1.
   IF Filter (Clear):              Clear inputs in the panel.
   IF Clear all chips:             Clear every active filter across tabs; reset to page 1.
   IF Previous / Next:             Load the corresponding 10-record page.
   IF Export:                      Open dialog -> pick From / To registration dates -> download CSV.
   IF Eye / Details on row:        Navigate to /customers/{customerId} (CM-07).
   IF Per-row Approve/Reject:      See CM-02 / CM-03 / CM-04 (Pending tab only).
   IF Bulk Approve/Reject:         See CM-03 / CM-04 (Pending tab only).
```

### Section 4 — UI/UX

**Wireframe Notes (Component Hierarchy)**

```
Page: Customers — List View
├─ App Shell Header (global)
├─ Left Navigation (Customers active)
└─ Main Content Area
    ├─ Page Header  Title: "Customers"
    ├─ KPI Cards Row (4 cards)
    │   ├─ Total Customers           (Users icon, gray)
    │   ├─ Active Customers          (UserCheck icon, green)
    │   ├─ New this month            (ShoppingBag icon, blue)
    │   └─ Repeat buyers (10+)       (Store icon, purple)
    ├─ Action Bar (top-right cluster)
    │   ├─ Search Input  (placeholder: "Search by name, business, mobile, area or pincode...")
    │   ├─ [Filter] button → drawer (right): Brand / Company, Class Type, Registration Date Range, [Clear] [Apply]
    │   └─ [Export] button → dialog: Registration Date Range From / To, [Cancel] [Download]
    ├─ Tab Bar: [ Pending Approval (n) ] [ Approved (n) ] [ Rejected (n) ]
    ├─ Filter Chips Bar (only when filters applied) + "Clear all" link
    ├─ Bulk Action Bar (only on Pending tab when rows selected) — see CM-03 / CM-04
    ├─ Data Table (columns vary by tab — see AC-3 / AC-4)
    └─ Pagination Footer
        ├─ "Showing X to Y of Z {pending requests | customers}"
        └─ [Previous]   Page A of B   [Next]   (10 rows per page)
```

**User Flow**

- Seller Admin clicks Customers in the left nav.
- KPI cards + tabs + table + pagination render (Pending Approval is the default tab).
- Seller Admin optionally switches tabs / searches / filters.
- Seller Admin clicks Export → picks From / To registration dates → downloads CSV.
- Seller Admin clicks Eye / Details on a row → Customer Detail page (CM-07).
- **BACK PATH:** Seller Admin clicks any other left-nav item; filter / search / tab state is reset on next visit (Phase 1) — [NEEDS INPUT] confirm whether state preservation is required.

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Search input | Max 100 chars; trims and normalises whitespace; case-insensitive contains-match across customerName / businessName / mobile / area / city / pincode. | "Search term is too long." | On-input |
| Filter — Registration Date Range From / To | Both optional individually; if both provided, From ≤ To. | "From date must be on or before To date." | On-apply |
| Export — From / To dates | Both optional; if both provided, From ≤ To; range must contain at least one row. | "'From' date must be before 'To' date." / "No customers found in the selected date range." | On-confirm |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Customers — zero (customer × company) requests ever | All KPI cards show 0; "No pending requests" on default tab | — |
| Pending Approval — active tab returns no rows | No pending requests. Try adjusting your search or filters. | — |
| Approved — active tab returns no rows | No approved customers. Try adjusting your search or filters. | — |
| Rejected — active tab returns no rows | No rejected customers. Try adjusting your search or filters. | — |
| Filter — Brand / Company dropdown empty | All companies (placeholder) | — |
| Export — no rows in date range | No customers found in the selected date range. | — |

**Error Messages**

| Error Code | User-Facing Message | Technical Log Message |
| --- | --- | --- |
| ERR-CUS-01 | Unable to load customers. Please retry. | GET /customers failed: \<statusCode\> |
| ERR-CUS-02 | Search is temporarily unavailable. Please try again. | GET /customers/search failed: \<statusCode\> \<query\> |
| ERR-CUS-03 | Could not load the next page. Please retry. | Pagination request failed: page=\<n\> \<statusCode\> |
| ERR-CUS-04 | Export failed. Please retry. | POST /customers/export failed: \<statusCode\> from=\<d\> to=\<d\> |
| ERR-CUS-05 | No customers found in the selected date range. | qps_export_no_rows from=\<d\> to=\<d\> |
| ERR-CUS-06 | 'From' date must be before 'To' date. | qps_export_invalid_range |
| ERR-CUS-07 | Your session has expired. Please log in again. | 401 Unauthorized on /customers |

---

# USER STORY CM-02

## Customers — Pending Approval Tab (Per-row Approve / Reject / Details Actions)

*Epic: Seller Admin — Customers   |   Priority: Critical   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Customers — Pending Approval Tab (Per-row Approve / Reject / Details Actions) |
| Epic / Feature Link | Seller Admin — Customers |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Critical — Pending Approval is where every buyer-onboarding request lands first; the per-row actions are the seller's primary workflow. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — distributor acting on a single (customer × company) onboarding request. |

**Business Context**

**WHY:** Every onboarding request from the buyer app lands in Pending Approval as one row per (customer × company). The seller needs three explicit actions on every Pending row: **Approve** (CM-03 — requires a delivery day), **Reject** (CM-04 — requires a reason), and **Details** (CM-07 — read-only context page). Per-row actions are the workhorse of this tab; bulk equivalents are covered in CM-03 / CM-04 for the routine case where many requests of the same shape arrive together.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Acting on a single (customer × company) request | Decide each pending request quickly: Approve with a delivery day, Reject with a reason, or open Details for more context | Without per-row inline actions, the seller has to drill into Detail to act on every request — too many clicks for routine decisions |

**Success Metrics**

- Percentage of Pending requests acted on within 24 hours of arrival — target 95%.
- Per-decision click cost (Pending row → committed action) — target ≤ 3 clicks for routine Approve / Reject.

**Real-World Scenario**

**CURRENT STATE:** A buyer registers from the buyer app for Brand A and Brand B at 9:05 am. Two Pending rows appear within minutes.

**DESIRED STATE:** Seller Admin opens Customers, the Pending Approval tab is selected, sees both rows; clicks Approve on the Brand A row → picks Monday as delivery day → confirms; clicks Reject on the Brand B row → picks "Outside Service Area" → confirms. Both rows leave the Pending tab; the Approved and Rejected tab badges increment.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want per-row Approve, Reject, and Details actions on every Pending Approval row, so that I can decide each (customer × company) onboarding request from the list without drilling into a separate page first.

### Acceptance Criteria

**AC-1:**
- **Given** the Pending Approval tab is selected
- **When** the table renders
- **Then** every row exposes three actions in this order in the Actions column: Reject (outline, red), Approve (filled, green), Details (Eye icon).

**AC-2:**
- **Given** the Seller Admin clicks Reject on a Pending row
- **When** the action runs
- **Then** the system opens the single-row Reject dialog scoped to that (customer × company) — see CM-04.

**AC-3:**
- **Given** the Seller Admin clicks Approve on a Pending row
- **When** the action runs
- **Then** the system opens the single-row Approve dialog scoped to that (customer × company) — see CM-03.

**AC-4:**
- **Given** the Seller Admin clicks Details (Eye icon) on a Pending row
- **When** the action runs
- **Then** the system navigates to `/customers/{customerId}` (CM-07); the Detail page opens with full context and per-company action controls.

**AC-5:**
- **Given** every Pending row carries a checkbox in the leftmost column
- **When** the Seller Admin selects one or more rows
- **Then** the Bulk Action Bar appears above the table (see CM-03 AC-7 and CM-04 AC-7).

**AC-6:**
- **Given** the table header carries a select-all checkbox
- **When** the Seller Admin clicks it
- **Then** every row on the current page is selected; the header checkbox enters indeterminate state if rows are selected on this page but not all are selected.

**AC-7:**
- **Given** the Seller Admin tries to act on the same row twice in rapid succession
- **When** the second click fires before the first completes
- **Then** the row's action buttons are disabled while a single-row action is in flight; only one action is committed.

**AC-8:**
- **Given** a row has just been Approved or Rejected (single-row action)
- **When** the action commits
- **Then** the row leaves the Pending tab; the Pending badge decrements; the Approved or Rejected badge increments; a success toast confirms the action ("Approved {businessName} for {companyName} · delivery {deliveryDay}" or "Rejected {businessName} for {companyName} · {reason}").

**AC-9:**
- **Given** the Pending tab returns zero rows after search / filter
- **When** the empty state renders
- **Then** the message "No pending requests. Try adjusting your search or filters." is shown; the Bulk Action Bar is hidden.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Pending Approval rows are one per (customer × company); per-row actions are scoped to that single entry only. |
| BR-2 | The selection key for bulk actions is `{customerId}__{companyId}` so a customer with two brands selects independently per brand. |
| BR-3 | Per-row Approve and Reject use the same dialogs as Bulk Approve / Reject but pre-scoped to the single row (CM-03 / CM-04). |
| BR-4 | Per-row Details navigates to the Customer Detail page (CM-07) keyed by customerId — the Detail page surfaces all of that customer's Company Approvals (any status). |
| BR-5 | While a single-row action is in flight, that row's Reject and Approve buttons are disabled to prevent double-submit. |
| BR-6 | Switching tabs clears the current selection (selections do NOT persist across tabs — see CM-03 BR-5 / CM-04 BR-5). |
| BR-7 | The select-all header checkbox selects only rows on the current page (10 max). [NEEDS INPUT] confirm whether a "select across all pages" option is desired. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Seller Admin clicks Approve, then Reject on the same row before the first dialog opens | Only the first dialog opens; the second click is suppressed (buttons disabled while action in flight). |
| 2 | A buyer cancels their onboarding request elsewhere and the Pending row vanishes during the seller's session | On next refresh / interaction, the row is removed; if the seller had opened a per-row dialog, surface a clear "This request no longer exists." toast on submit. |
| 3 | Seller selects 3 rows across different customers, switches to Approved tab, switches back | Selection is cleared on tab switch; the Bulk Action Bar is hidden until the seller re-selects. |
| 4 | Seller has 12 Pending rows on page 1 and 3 on page 2; clicks select-all on page 1, then navigates to page 2 | Page 2's rows are NOT auto-selected; the page-1 selection state is preserved if the seller returns to page 1 (in-memory selection). [NEEDS INPUT] confirm cross-page selection behaviour. |
| 5 | A request is moved out of Pending in another session | On next refresh, that row disappears; if the seller had it selected, the selection set silently drops the missing key. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-CUSP-01 | Per-row action API timeout | "This is taking longer than usual. Please try again." | Re-enable the row's buttons; allow retry. |
| ERR-CUSP-02 | Per-row action API server error | "Could not update the request. Please retry." | Re-enable the row's buttons; allow retry. |
| ERR-CUSP-03 | Concurrent state change (request already decided elsewhere) | "This request was updated elsewhere. Refresh to see the latest." | Offer Refresh; do not commit the duplicate action. |
| ERR-CUSP-04 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| customerId | String | Yes | The customer's id; unique per distributor. | Customer record. |
| companyId | String | Yes | The company / brand the request is scoped to. | Company Approval. |
| status | Enum | Yes | "pending" while on this tab; mutated to "approved" / "rejected" by per-row actions. | Company Approval. |
| selectionKey | String | Auto | `{customerId}__{companyId}`. | Computed. |

### Workflow

```
1. Seller Admin opens the Pending Approval tab (CM-01).
2. System renders the row-per-(customer × company) table and the bulk-select checkboxes.
3. [DECISION] Seller Admin chooses an action on any row:
   IF Reject (per-row):       Open single-row Reject dialog (CM-04).
   IF Approve (per-row):      Open single-row Approve dialog (CM-03).
   IF Details (per-row):      Navigate to /customers/{customerId} (CM-07).
   IF Select checkbox:        Add (customerId, companyId) to the selection set; show Bulk Action Bar.
   IF Select-all (header):    Add every row on the current page; header enters indeterminate when partial.
4. On commit (per-row Approve / Reject), the row leaves the Pending tab; badges update; toast confirms.
```

### Section 4 — UI/UX

**Wireframe Notes (Pending Tab — Per-row Layout)**

```
Pending Approval — Table Row
├─ [☐] Checkbox (selection key: {customerId}__{companyId})
├─ Customer        : customerName
├─ Class           : ClassType badge (color-coded)
├─ Business        : businessName
├─ Mobile          : mobile
├─ Brand / Company : companyName badge
├─ Area / Pincode  : area
│                    pincode · city
├─ Registered      : registeredDate (DD MMM YYYY)
└─ Actions         : [ Reject (outline red) ]   [ Approve (filled green) ]   [👁 Details ]
```

**Field Validations**

**[NOT APPLICABLE]** — The Pending tab itself has no editable inputs; field validations live in CM-03 (Approve) and CM-04 (Reject) dialogs.

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Pending tab — no rows after search / filter | No pending requests. Try adjusting your search or filters. | — |
| Pending tab — no rows ever (no buyer requests) | No pending requests. | — |

---

# USER STORY CM-03

## Customers — Approve Customer Flow (Mandatory Delivery Day; Single + Bulk)

*Epic: Seller Admin — Customers   |   Priority: Critical   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Customers — Approve Customer Flow (Mandatory Delivery Day; Single + Bulk) |
| Epic / Feature Link | Seller Admin — Customers |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Critical — approval is the gateway from a buyer's onboarding request to active ordering; pinning a delivery day on approval defines the customer's beat. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — distributor approving a (customer × company) request and committing to a delivery day. |

**Business Context**

**WHY:** Approving a customer for a brand is not just a "yes" — it is a commitment to a **delivery day** (the day on which orders from this customer for this brand will be delivered). The system enforces a mandatory Delivery Day pick on approval so the customer's beat is defined from day 1. The same dialog is reused across the single-row Approve action (CM-02) and the multi-row Bulk Approve action; in the bulk case, one delivery day is applied to every selected (customer × company) request.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Approving a (customer × company) request | Pin a delivery day on approval so the beat is defined from day 1 | Without a mandatory delivery day on approval, the seller has no operational beat and the buyer doesn't know when to expect delivery |

**Success Metrics**

- 100% of Approved company entries carry a delivery day (no approvals without a beat).
- Median time to approve a single Pending row (click Approve → commit) — target ≤ 10 seconds.
- Bulk approve throughput — 20 requests in a single bulk operation in under 30 seconds.

**Real-World Scenario**

**CURRENT STATE:** 18 Kirana buyers have registered overnight for Brand A — all on the same MG Road beat that the seller services on Mondays.

**DESIRED STATE:** Seller Admin opens the Pending tab, filters Brand / Company = Brand A and Class Type = Kirana, ticks the select-all on the page (all 10 rows on page 1 + the rest on page 2), clicks Bulk Approve, picks Monday as the single delivery day, clicks Approve 18 — all 18 (customer × company) requests transition to Approved with delivery day Monday in one operation.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to approve a single (customer × company) request OR a multi-select bulk of requests by picking one mandatory Delivery Day, so that every approved customer is committed to a known beat from day 1 with the minimum click cost.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin clicks Approve on a single Pending row
- **When** the action runs
- **Then** the Approve dialog opens with the title "Approve customer" and the description "Approve **{businessName}** for **{companyName}** and pin a delivery day for this customer's beat."

**AC-2:**
- **Given** the Approve dialog is open
- **When** the user inspects the Delivery Day field
- **Then** the field is a required dropdown (red asterisk) with options: Next Day Delivery (NDD) \| Monday \| Tuesday \| Wednesday \| Thursday \| Friday \| Saturday \| Sunday; helper text reads "Pin a fixed weekday or commit to next-day delivery."

**AC-3:**
- **Given** no Delivery Day is selected
- **When** the user inspects the dialog footer
- **Then** the Approve button is disabled; only Cancel is enabled.

**AC-4:**
- **Given** the user picks a Delivery Day and clicks Approve
- **When** the action commits
- **Then** the (customer × company) entry is updated: status → "approved"; deliveryDay → selected value; decidedAt → today's ISO date (YYYY-MM-DD); rejectionReason → cleared; the dialog closes; the row leaves the Pending tab; the Pending badge decrements; the Approved badge increments; a success toast confirms "Approved {businessName} for {companyName} · delivery {deliveryDay}".

**AC-5:**
- **Given** the user clicks Cancel
- **When** the action runs
- **Then** the dialog closes with no change to the request.

**AC-6:**
- **Given** "Next Day" is the selected delivery day
- **When** the dropdown renders the option
- **Then** the option label is shown as "Next Day Delivery (NDD)" in the dialog and as "NDD" in compact chips.

**AC-7:**
- **Given** the Seller Admin selects two or more Pending rows
- **When** the selection is non-empty
- **Then** a Bulk Action Bar appears above the table showing: "**N** request(s)" with a Clear link, [Reject Selected] (outline red), [Approve Selected] (filled green).

**AC-8:**
- **Given** the Seller Admin clicks Approve Selected
- **When** the action runs
- **Then** the Bulk Approve dialog opens with the title "Approve {N} request(s)" and the description "Pick one delivery day — it will be applied to every selected customer × company request."; the Delivery Day dropdown is required; helper text reads "All selected requests will be approved with this same day."

**AC-9:**
- **Given** the Seller Admin picks a Delivery Day and clicks "Approve {N}"
- **When** the action commits
- **Then** every selected (customer × company) entry is approved with that Delivery Day; the dialog closes; the selection is cleared; the Pending badge decrements by N; the Approved badge increments by N; a success toast summarises "Approved {N} request(s) · delivery {deliveryDay}".

**AC-10:**
- **Given** the Bulk Approve dialog is open and the user clicks Cancel
- **When** the action runs
- **Then** the dialog closes with no requests changed; the selection is preserved.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Approve is allowed only when the entry's status is "pending". |
| BR-2 | Delivery Day is mandatory on every Approve (single and bulk); the Approve button is disabled until a value is picked. |
| BR-3 | Allowed Delivery Day values: Next Day, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. The "Next Day" value renders as "Next Day Delivery (NDD)" in dialog dropdowns and as "NDD" in compact chips. |
| BR-4 | On approval, decidedAt is set to today's server date; any prior rejectionReason on the entry is cleared. |
| BR-5 | Switching tabs clears the current selection; selections do NOT persist across tabs. |
| BR-6 | The single-row Approve dialog and the Bulk Approve dialog use the same Delivery Day picker and the same commit semantics — only the title, description, and confirm-button label differ. |
| BR-7 | Bulk Approve applies the SAME Delivery Day to every selected (customer × company) entry. To approve different requests with different days, perform separate per-row Approve actions. |
| BR-8 | [NEEDS INPUT] Maximum bulk size per action; current code does not enforce a hard cap — confirm for product safety (e.g., 200). |
| BR-9 | [NEEDS INPUT] Whether changing a previously assigned Delivery Day is allowed via direct re-Approve from the Approved tab, OR only via Reopen → re-Approve from the Customer Detail page. Phase 1 implementation: Reopen → re-Approve only (CM-07). |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Seller selects 18 Pending rows and clicks Approve Selected with no Delivery Day picked | Approve button stays disabled; helper text + dropdown placeholder remind to pick a day. |
| 2 | One of the 18 selected rows has been Approved or Rejected by another session before commit | Concurrency error per ERR-CUSP-03; the surviving rows are committed; the offender is reported in the toast (or per-row error list) — see CM-03 BR-7. [NEEDS INPUT] confirm partial-failure handling. |
| 3 | Seller selects an "NDD" delivery day for a bulk of customers in a beat that is normally fixed-weekday | Allowed by Phase 1 — no business validation against beat conventions. [NEEDS INPUT] confirm whether a warn step is desired. |
| 4 | Seller picks Sunday as a Delivery Day | Allowed (Sunday is a valid value). |
| 5 | Seller's bulk selection includes (customer X, company A) and (customer X, company B) — same customer, different brands | Both entries are approved with the same Delivery Day; the customer's Approved-tab row will show 2 Linked Companies after refresh (CM-05). |
| 6 | Seller picks a Delivery Day, clicks Approve, then immediately clicks Approve again | Second click is suppressed (button disabled while action in flight); only one transition is recorded. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-CUSA-01 | Approve API timeout (single or bulk) | "This is taking longer than usual. Please try again." | Re-enable Approve; preserve dialog state; allow retry. |
| ERR-CUSA-02 | Approve API server error (single or bulk) | "Could not approve the request(s). Please retry." | Re-enable Approve; preserve dialog state; allow retry. |
| ERR-CUSA-03 | Concurrent state change on one or more selected requests | "This request was updated elsewhere. Refresh to see the latest." | Surface per-row failure; surviving requests proceed (BR-7 partial commit). |
| ERR-CUSA-04 | Required Delivery Day missing on submit | (Approve button stays disabled; no submit fires.) | Block submit. |
| ERR-CUSA-05 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| status | Enum | Yes | Updated to "approved" on commit. | Action. |
| deliveryDay | Enum | Yes (mandatory on Approve) | One of Next Day \| Monday \| Tuesday \| Wednesday \| Thursday \| Friday \| Saturday \| Sunday. | User input. |
| decidedAt | Date (ISO YYYY-MM-DD) | Auto | Server / today's date at action. | Auto. |
| rejectionReason | String | Cleared on Approve | Set to undefined when Approve commits. | Auto. |

### Workflow

```
1. Seller Admin clicks Approve on a Pending row OR Approve Selected on the Bulk Action Bar.
2. System opens the Approve dialog (single or bulk variant).
3. Seller Admin picks a Delivery Day from the dropdown.
4. [DECISION] Seller Admin clicks an action:
   IF Cancel:                Close dialog; no change; selection preserved (bulk case); EXIT.
   IF Approve / Approve N:   Submit.
5. [DECISION] API result:
   IF success:               Update entries (status=approved, deliveryDay, decidedAt, clear rejectionReason);
                             close dialog; clear selection (bulk case); decrement Pending badge;
                             increment Approved badge; show success toast.
   IF partial failure:       Commit the surviving entries; surface per-failure messages (ERR-CUSA-03).
   IF total failure:         Keep dialog open; show error toast (ERR-CUSA-01 / 02); allow retry.
```

### Section 4 — UI/UX

**Wireframe Notes (Approve Dialogs)**

```
Single-row Approve dialog
├─ Header: ✓ "Approve customer"  (CheckCircle2 icon, green)
├─ Body:
│   "Approve **{businessName}** for **{companyName}** and pin a delivery day for this customer's beat."
│   Delivery Day *  [▾ Next Day Delivery (NDD) | Monday | Tuesday | ... | Sunday]
│   Helper: "Pin a fixed weekday or commit to next-day delivery."
└─ Footer: [ Cancel ]   [ Approve ]   (Approve disabled until a Delivery Day is picked)

Bulk Approve dialog
├─ Header: ✓ "Approve {N} request(s)"
├─ Body:
│   "Pick one delivery day — it will be applied to every selected customer × company request."
│   Delivery Day *  [▾ ...]
│   Helper: "All selected requests will be approved with this same day."
└─ Footer: [ Cancel ]   [ Approve {N} ]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Delivery Day | Required; one of NDD / Monday–Sunday. | (Approve button disabled until picked.) | On-render / on-submit |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Bulk Action Bar — no rows selected | (bar is hidden) | — |
| Bulk Approve dialog — N = 0 | (dialog is never opened with N = 0; Approve Selected is disabled.) | — |

---

# USER STORY CM-04

## Customers — Reject Customer Flow (Reason + Other Comment; Single + Bulk)

*Epic: Seller Admin — Customers   |   Priority: Critical   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Customers — Reject Customer Flow (Reason + Other Comment; Single + Bulk) |
| Epic / Feature Link | Seller Admin — Customers |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Critical — every rejection must carry a reason for an audit-quality decision trail; without it, the seller cannot defend onboarding decisions or revisit them later. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — distributor rejecting a (customer × company) request with a reason. |

**Business Context**

**WHY:** Rejecting a customer for a brand is a final decision (until Reopen — CM-07) that has to be defensible. The reason picker forces the seller to commit to one of four canonical reasons, with a free-text "Other" path for cases that don't fit. The same dialog is reused across the single-row Reject action (CM-02) and the multi-row Bulk Reject action; in the bulk case, one reason (and one Other comment if applicable) is applied to every selected request.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Rejecting a (customer × company) request | Commit a defensible rejection with a canonical reason in one click | Without a forced reason, rejections lack audit context and the seller cannot revisit the decision intelligently later |

**Success Metrics**

- 100% of Rejected company entries carry a non-empty reason.
- Other-comment cases — comment is non-empty after trim in 100% of submissions.

**Real-World Scenario**

**CURRENT STATE:** 4 of last night's onboarding requests are from PIN codes the seller does not service.

**DESIRED STATE:** Seller Admin selects all 4 rows on the Pending tab, clicks Reject Selected, picks "Outside Service Area", clicks Reject 4 — every selected request transitions to Rejected with the reason persisted.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want to reject a single (customer × company) request OR a multi-select bulk of requests by picking one canonical reason (with a free-text Other path), so that every rejection carries audit-quality context with the minimum click cost.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin clicks Reject on a single Pending row
- **When** the action runs
- **Then** the Reject dialog opens with the title "Reject customer" and the description "Reject **{businessName}** for **{companyName}**. Pick a reason."

**AC-2:**
- **Given** the Reject dialog is open
- **When** the user inspects the reason picker
- **Then** the picker is a radio group with these options in this order: Outside Service Area, Incomplete Information, Invalid Documents, Duplicate Registration, Other.

**AC-3:**
- **Given** no reason is selected
- **When** the user inspects the dialog footer
- **Then** the Reject button is disabled; only Cancel is enabled.

**AC-4:**
- **Given** the user selects "Other"
- **When** the dialog renders
- **Then** a free-text Textarea appears (placeholder: "Please specify the reason...", rows: 3); the Reject button stays disabled until the textarea has at least one non-whitespace character.

**AC-5:**
- **Given** the user picks a reason (or fills the Other textarea) and clicks Reject
- **When** the action commits
- **Then** the (customer × company) entry is updated: status → "rejected"; rejectionReason → selected value (or textarea value if Other); decidedAt → today's ISO date; deliveryDay → cleared; the dialog closes; the row leaves the Pending tab; the Pending badge decrements; the Rejected badge increments; a success toast confirms "Rejected {businessName} for {companyName} · {reason}".

**AC-6:**
- **Given** the user clicks Cancel
- **When** the action runs
- **Then** the dialog closes with no change to the request.

**AC-7:**
- **Given** the Seller Admin selects two or more Pending rows
- **When** the user clicks Reject Selected on the Bulk Action Bar
- **Then** the Bulk Reject dialog opens with the title "Reject {N} request(s)" and the description "Pick one reason — it will be applied to every selected request."; the same radio group + Other textarea apply.

**AC-8:**
- **Given** the Seller Admin picks a reason and clicks "Reject {N}"
- **When** the action commits
- **Then** every selected (customer × company) entry is rejected with that reason; the dialog closes; the selection is cleared; the Pending badge decrements by N; the Rejected badge increments by N; a success toast summarises "Rejected {N} request(s) · {reason}".

**AC-9:**
- **Given** the Bulk Reject dialog is open and the user clicks Cancel
- **When** the action runs
- **Then** the dialog closes with no requests changed; the selection is preserved.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Reject is allowed only when the entry's status is "pending". |
| BR-2 | Reason is mandatory on every Reject (single and bulk); the Reject button is disabled until a value is picked. |
| BR-3 | Allowed reasons (canonical): Outside Service Area, Incomplete Information, Invalid Documents, Duplicate Registration, Other. |
| BR-4 | When reason = Other, a free-text comment is required (non-empty after trim); the persisted rejectionReason is the textarea value, not the literal string "Other". |
| BR-5 | On rejection, decidedAt is set to today's server date; any prior deliveryDay on the entry is cleared. |
| BR-6 | Switching tabs clears the current selection; selections do NOT persist across tabs. |
| BR-7 | Bulk Reject applies the SAME reason (and Other comment if applicable) to every selected (customer × company) entry. To reject different requests with different reasons, perform separate per-row Reject actions. |
| BR-8 | [NEEDS INPUT] Whether bulk Reject also requires a comment when the reason is anything other than Other (e.g., for a richer audit trail). |
| BR-9 | [NEEDS INPUT] Maximum bulk size per action (see CM-03 BR-8). |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Seller selects "Other" but leaves the comment blank | Reject button stays disabled until the comment has at least one non-whitespace character. |
| 2 | Seller picks a reason, clicks Reject, then immediately clicks Reject again | Second click is suppressed (button disabled while action in flight); only one transition is recorded. |
| 3 | Bulk reject: one of the selected entries has been Approved by another session | Concurrency error per ERR-CUSP-03; the surviving entries proceed (BR-7 partial commit). [NEEDS INPUT] confirm partial-failure handling. |
| 4 | Seller wants to reject one entry with a customised "Other" comment AND another with a canonical reason in the same operation | Not supported in a single Bulk Reject — perform two operations (per-row Reject for the customised one, then Bulk Reject for the rest). |
| 5 | Seller picks "Other", types a comment, switches the reason back to "Outside Service Area" | The textarea is hidden; the canonical reason is persisted; the typed Other comment is discarded on submit. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-CUSR-01 | Reject API timeout (single or bulk) | "This is taking longer than usual. Please try again." | Re-enable Reject; preserve dialog state; allow retry. |
| ERR-CUSR-02 | Reject API server error (single or bulk) | "Could not reject the request(s). Please retry." | Re-enable Reject; preserve dialog state; allow retry. |
| ERR-CUSR-03 | Concurrent state change on one or more selected requests | "This request was updated elsewhere. Refresh to see the latest." | Surface per-row failure; surviving requests proceed (BR-7 partial commit). |
| ERR-CUSR-04 | Required reason missing | "Please provide a reason for rejection." | Block submit (Reject button stays disabled). |
| ERR-CUSR-05 | Other reason chosen, comment empty | "Please specify the reason." | Block submit. |
| ERR-CUSR-06 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| status | Enum | Yes | Updated to "rejected" on commit. | Action. |
| rejectionReason | String | Yes (mandatory on Reject) | One of Outside Service Area \| Incomplete Information \| Invalid Documents \| Duplicate Registration; or the Other textarea value (non-empty after trim). | User input. |
| decidedAt | Date (ISO YYYY-MM-DD) | Auto | Server / today's date at action. | Auto. |
| deliveryDay | Enum | Cleared on Reject | Set to undefined when Reject commits. | Auto. |

### Workflow

```
1. Seller Admin clicks Reject on a Pending row OR Reject Selected on the Bulk Action Bar.
2. System opens the Reject dialog (single or bulk variant).
3. Seller Admin picks a reason from the radio group.
   IF reason = Other:        Free-text Textarea is shown; require non-empty comment after trim.
4. [DECISION] Seller Admin clicks an action:
   IF Cancel:                Close dialog; no change; selection preserved (bulk case); EXIT.
   IF Reject / Reject N:     Submit.
5. [DECISION] API result:
   IF success:               Update entries (status=rejected, rejectionReason, decidedAt, clear deliveryDay);
                             close dialog; clear selection (bulk case); decrement Pending badge;
                             increment Rejected badge; show success toast.
   IF partial failure:       Commit the surviving entries; surface per-failure messages (ERR-CUSR-03).
   IF total failure:         Keep dialog open; show error toast (ERR-CUSR-01 / 02); allow retry.
```

### Section 4 — UI/UX

**Wireframe Notes (Reject Dialogs)**

```
Single-row Reject dialog
├─ Header: ✗ "Reject customer"  (XCircle icon, red)
├─ Body:
│   "Reject **{businessName}** for **{companyName}**. Pick a reason."
│   Reason picker (radio):
│     ( ) Outside Service Area
│     ( ) Incomplete Information
│     ( ) Invalid Documents
│     ( ) Duplicate Registration
│     ( ) Other  (when selected, free-text Textarea below — required)
└─ Footer: [ Cancel ]   [ Reject ]   (disabled until a reason is picked / Other comment is non-empty)

Bulk Reject dialog
├─ Header: ✗ "Reject {N} request(s)"
├─ Body:
│   "Pick one reason — it will be applied to every selected request."
│   (same radio group + Other textarea as single-row)
└─ Footer: [ Cancel ]   [ Reject {N} ]
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Reason | Required; one of the 5 canonical values. | "Please provide a reason for rejection." | On-submit |
| Other comment | Required when reason = Other; non-empty after trim. | "Please specify the reason." | On-submit |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Bulk Action Bar — no rows selected | (bar is hidden) | — |
| Bulk Reject dialog — N = 0 | (dialog is never opened with N = 0; Reject Selected is disabled.) | — |

---

# USER STORY CM-05

## Customers — Approved Tab (Linked Companies Grouping, Details, Reopen Path)

*Epic: Seller Admin — Customers   |   Priority: High   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Customers — Approved Tab (Linked Companies Grouping, Details, Reopen Path) |
| Epic / Feature Link | Seller Admin — Customers |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | High — the Approved tab is the seller's roster of onboarded buyers; the mobile-keyed grouping prevents row-noise for buyers with multiple brand approvals. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — reviewing the active onboarded roster and (occasionally) reversing or modifying a prior approval. |

**Business Context**

**WHY:** Once a (customer × company) request is Approved, the seller wants ONE row per customer (keyed on mobile) — not one row per company — so the roster reads cleanly even for multi-brand distributors. The Approved tab groups by mobile and exposes a "Linked Companies" button per row that opens a per-company breakdown showing each approved company plus its assigned Delivery Day. Inline, only the Details action is available; to **change a Delivery Day** or to **reverse a prior approval**, the seller goes through the Customer Detail page (CM-07) and uses the Reopen action — this is the only path in Phase 1 to mutate a prior decision.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Reviewing the active onboarded roster | See one row per customer (keyed on mobile) with quick visibility into how many brands the customer is onboarded for and on which days | Without grouping, a multi-brand customer creates row-noise and the roster becomes hard to scan |

**Success Metrics**

- Approved tab rows = count of distinct mobiles with at least one approved company entry — target 100% accuracy.
- Time to find a specific approved customer (search) — target under 5 seconds.

**Real-World Scenario**

**CURRENT STATE:** A buyer is onboarded across all three of the distributor's brands; the seller has assigned different Delivery Days per brand (Brand A = Monday, Brand B = NDD, Brand C = Wednesday). The seller now wants to change Brand B's Delivery Day from NDD to Friday.

**DESIRED STATE:** Seller Admin opens the Approved tab, finds the buyer's row (one row, "3 companies"), clicks Linked Companies → sees Brand A · Monday, Brand B · NDD, Brand C · Wednesday; clicks Open Customer → Detail page opens; in the Linked Companies section, clicks Reopen on the Brand B entry → the entry returns to Pending; clicks Approve → picks Friday → the Brand B entry is approved with the new Delivery Day; the Approved tab reflects 3 companies (now Mon / Fri / Wed).

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want the Approved tab to show one row per customer (grouped by mobile) with a Linked Companies breakdown showing each approved brand and its Delivery Day, and to reach the Reopen / change-day flow via the Customer Detail page, so that my onboarded roster reads cleanly and the path to reverse a prior approval is explicit.

### Acceptance Criteria

**AC-1:**
- **Given** the Approved tab is selected
- **When** the table renders
- **Then** rows are GROUPED BY mobile — one row per customer with at least one approved Company Approval — and the row shows columns: Customer, Class, Business, Mobile, Linked Companies, Area / Pincode, Registered, Actions (Details only).

**AC-2:**
- **Given** a row's customer has multiple approved companies
- **When** the Linked Companies cell renders
- **Then** the cell shows a button "{N} company / companies" (singular when N = 1) with the Building2 icon and a ChevronRight; the button styling is `bg-green-50 text-green-700 border-green-200`.

**AC-3:**
- **Given** the Seller Admin clicks the Linked Companies button on an Approved row
- **When** the action runs
- **Then** the Linked Companies dialog opens with the title "Linked Companies" and the description "Per-company approval status for **{businessName}** ({mobile})."

**AC-4:**
- **Given** the Linked Companies dialog is open
- **When** the user inspects each company entry
- **Then** each entry shows: company name (bold); a status badge (Approved = green, Rejected = red, Pending Approval = amber); a Delivery Day badge with Calendar icon when status = approved; sub-text "Delivery day: **{deliveryDay}** · approved {decidedAt}" when approved.

**AC-5:**
- **Given** the Linked Companies dialog is open
- **When** the dialog footer renders
- **Then** the footer shows: Close, Open Customer. Open Customer navigates to `/customers/{customerId}` (CM-07).

**AC-6:**
- **Given** the Seller Admin clicks Details (Eye icon) on an Approved row
- **When** the action runs
- **Then** the system navigates to `/customers/{customerId}` (CM-07) — the Detail page surfaces every Company Approval (any status) and the per-company Reopen action.

**AC-7:**
- **Given** the Seller Admin needs to change a Delivery Day on an already-approved entry
- **When** the seller goes to CM-07 → clicks Reopen on that entry → the entry returns to Pending status → clicks Approve → picks a new Delivery Day
- **Then** the entry is approved with the new Delivery Day; the Approved tab row reflects the change on next render.

**AC-8:**
- **Given** the Seller Admin needs to reverse a prior approval on an entry
- **When** the seller goes to CM-07 → clicks Reopen → the entry returns to Pending → clicks Reject → picks a reason
- **Then** the entry is rejected; the Approved tab row reflects fewer Linked Companies (or disappears if all approvals have been reversed); the Rejected tab now contains a row with the rejected company.

**AC-9:**
- **Given** the Approved tab returns zero rows after search / filter
- **When** the empty state renders
- **Then** the message "No approved customers. Try adjusting your search or filters." is shown.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Approved tab rows are GROUPED BY mobile (customer uniqueness key). |
| BR-2 | A row appears on the Approved tab if and only if at least one of the customer's Company Approvals has status = approved. The row's Linked Companies count and breakdown reflect ONLY the approved subset. |
| BR-3 | The Linked Companies button shows the count and singular / plural label correctly: "1 company" vs "N companies". |
| BR-4 | Inline, the only row action on the Approved tab is Details (no Reject / Re-approve buttons inline). |
| BR-5 | The Reopen / change-Delivery-Day / re-Reject flow lives on the Customer Detail page (CM-07) and is the ONLY path in Phase 1 to mutate a prior decision. |
| BR-6 | Reopen flips the entry back to status = "pending"; deliveryDay, decidedAt, and rejectionReason are cleared. The seller then goes through the standard Approve (CM-03) or Reject (CM-04) flow. |
| BR-7 | Search and filter from CM-01 apply to this tab — including the Brand / Company filter, which scopes the Linked Companies display only to companies that match the active filter. [NEEDS INPUT] confirm this scoping (versus showing every approved company regardless of filter). |
| BR-8 | The Linked Companies dialog mirrors the same per-company status layout as the Customer Detail page's Linked Companies section, but is read-only — all mutating actions live on the Detail page. |
| BR-9 | A customer with both Approved and Rejected company entries appears in BOTH the Approved and Rejected tabs (mixed-state — see CM-06); the Approved tab row shows only the approved subset; the Rejected tab row shows only the rejected subset. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | A customer's last approved company is reversed via Reopen → Reject | The customer's row leaves the Approved tab; if the customer still has rejected entries, they remain on the Rejected tab. |
| 2 | A customer with 1 approved company has a 2nd brand approved | The Linked Companies cell flips from "1 company" to "2 companies" on next render. |
| 3 | Buyer registers a 3rd brand request after the customer is already onboarded for 2 | A new Pending entry is created and shows on the Pending tab; the Approved tab row continues to show "2 companies" until the new request is decided. |
| 4 | Seller filters Brand / Company = Brand A; an Approved row's customer is approved for Brand A AND Brand B | Per BR-7 [NEEDS INPUT]: row shows only Brand A in the Linked Companies cell / dialog OR shows all approved brands regardless. Confirm. |
| 5 | Two Pending entries for the same customer are bulk-Approved together | After commit, the Approved tab shows ONE row for that customer with "2 companies" linked; both Delivery Days are visible in the breakdown. |
| 6 | Seller refreshes mid-Reopen | The Reopen flow has not yet committed; the entry remains Approved on refresh. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-CUSAP-01 | Linked Companies dialog load fails | "Unable to load company breakdown. Please retry." | Show retry CTA; dialog remains open. |
| ERR-CUSAP-02 | Concurrent change while dialog is open | (Refresh on close — see CM-07 ERR-CUSD-03 for the Detail-page-level concurrency story.) | Refresh on dialog close. |
| ERR-CUSAP-03 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| customerId | String | Yes | Customer record key. | Customer record. |
| mobile | String | Yes | Grouping key for the Approved tab. | Customer record. |
| approvedCompanies[] | Array | Yes | Subset of companyApprovals where status = approved; each entry carries companyName + deliveryDay + decidedAt. | Computed from companyApprovals. |
| approvedCount | Integer | Yes | = approvedCompanies.length; drives the "{N} company / companies" button label. | Computed. |

### Workflow

```
1. Seller Admin opens the Approved tab (CM-01).
2. System loads customer rows grouped by mobile, filtered to those with ≥ 1 approved Company Approval.
3. System renders the row with the Linked Companies button "{N} company / companies".
4. [DECISION] Seller Admin chooses an action:
   IF Linked Companies button:    Open the Linked Companies dialog (read-only per-company breakdown).
                                  -> [DECISION] In the dialog:
                                          IF Close:           Close dialog; remain on Approved tab.
                                          IF Open Customer:   Navigate to /customers/{customerId} (CM-07).
   IF Details (Eye icon):         Navigate to /customers/{customerId} (CM-07).
5. To change a Delivery Day or reverse an approval, the seller goes through CM-07's Reopen flow.
```

### Section 4 — UI/UX

**Wireframe Notes (Approved Tab — Per-row Layout + Linked Companies Dialog)**

```
Approved — Table Row (grouped by mobile)
├─ Customer        : customerName
├─ Class           : ClassType badge
├─ Business        : businessName
├─ Mobile          : mobile
├─ Linked Companies: [ 🏢 {N} company / companies  ▸ ]   (green chip)
├─ Area / Pincode  : area
│                    pincode · city
├─ Registered      : registeredDate (DD MMM YYYY)
└─ Actions         : [👁 Details ]

Linked Companies dialog
├─ Header: 🏢 "Linked Companies"
├─ Sub-text: "Per-company approval status for **{businessName}** ({mobile})."
├─ Per-company entry:
│   {companyName}     [ Approved (green) ]   [ 📅 {deliveryDay} ]
│   "Delivery day: **{deliveryDay}** · approved {decidedAt}"
└─ Footer: [ Close ]   [ Open Customer → ]
```

**Field Validations**

**[NOT APPLICABLE]** — The Approved tab and the Linked Companies dialog are read-only; mutating actions live in CM-07.

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Approved tab — no approved customers (no rows) | No approved customers. Try adjusting your search or filters. | — |
| Linked Companies dialog — customer has 0 approved companies | (Dialog never opens with 0 — the row would not appear on the Approved tab.) | — |

---

# USER STORY CM-06

## Customers — Rejected Tab (Mixed-State Handling, Linked Companies, Reopen Path)

*Epic: Seller Admin — Customers   |   Priority: High   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Customers — Rejected Tab (Mixed-State Handling, Linked Companies, Reopen Path) |
| Epic / Feature Link | Seller Admin — Customers |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | High — the Rejected tab gives sellers a defensible record of every onboarding decline AND the optionality to revisit a decision via Reopen. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — reviewing the rejected roster and (occasionally) reversing a prior rejection. |

**Business Context**

**WHY:** The Rejected tab is the system's audit-quality record of every onboarding decline. It uses the same mobile-keyed grouping as the Approved tab, with the Linked Companies cell scoped to the rejected subset. The mixed-state case is first-class: a customer who is **approved on Brand A** and **rejected on Brand B** appears in BOTH the Approved AND Rejected tabs — each tab shows only the relevant subset. This preserves a single source of truth per customer (one Customer record, one Detail page) while letting each tab read cleanly. As with Approved (CM-05), inline actions are limited to Details; the Reopen flow lives on the Customer Detail page (CM-07) and is the only Phase 1 path to reverse a rejection.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Reviewing the rejected roster | See every declined (customer × company) request with the reason and date, and have a clear path to Reopen if the decision needs to change | Without a defensible record + a Reopen path, the seller either re-keys data or lives with a wrong decision |

**Success Metrics**

- 100% of Rejected entries carry a non-empty rejectionReason and a decidedAt timestamp (audit completeness).
- Reopen rate from the Rejected tab (decisions reversed) — track and surface; target visibility, not a hard rate target.

**Real-World Scenario**

**CURRENT STATE:** A buyer was Rejected on Brand B last month with reason "Outside Service Area". The seller has since extended Brand B's beat to cover the buyer's pincode and wants to onboard them.

**DESIRED STATE:** Seller Admin opens the Rejected tab, finds the buyer's row, clicks Open Customer → Detail page; in Linked Companies, finds the Brand B rejected entry; clicks Reopen → the entry returns to Pending; clicks Approve → picks Friday as Delivery Day; the buyer is now Approved on Brand B; the Rejected tab no longer shows that customer (assuming no other rejections); the Approved tab now shows the Brand B approval.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want the Rejected tab to show one row per customer (grouped by mobile) with a Linked Companies breakdown of every rejected brand and its reason, with mixed-state customers visible on both Approved and Rejected tabs, and the Reopen flow accessible via the Customer Detail page, so that I have a defensible audit record AND the optionality to reverse a prior rejection.

### Acceptance Criteria

**AC-1:**
- **Given** the Rejected tab is selected
- **When** the table renders
- **Then** rows are GROUPED BY mobile — one row per customer with at least one rejected Company Approval — and the row shows columns: Customer, Class, Business, Mobile, Linked Companies, Area / Pincode, Registered, Actions (Details only).

**AC-2:**
- **Given** a row's customer has multiple rejected companies
- **When** the Linked Companies cell renders
- **Then** the cell shows a button "{N} company / companies" with the Building2 icon and a ChevronRight; the button styling is `bg-red-50 text-red-700 border-red-200`.

**AC-3:**
- **Given** the Seller Admin clicks the Linked Companies button on a Rejected row
- **When** the action runs
- **Then** the Linked Companies dialog opens scoped to the customer (mobile); per-company entries show: company name; status badge "Rejected" (red); sub-text "{rejectionReason} · {decidedAt}".

**AC-4:**
- **Given** a customer has BOTH approved and rejected company entries (mixed state)
- **When** the seller views the tabs
- **Then** the customer appears on the Approved tab with a row showing only the approved companies (CM-05 scoped Linked Companies) AND on the Rejected tab with a row showing only the rejected companies (this story's scoped Linked Companies); the Customer Detail page (CM-07) shows every Company Approval regardless of status.

**AC-5:**
- **Given** the Seller Admin clicks Details (Eye icon) on a Rejected row
- **When** the action runs
- **Then** the system navigates to `/customers/{customerId}` (CM-07).

**AC-6:**
- **Given** the seller wants to reverse a rejection
- **When** the seller goes to CM-07 → clicks Reopen on the rejected entry → the entry returns to Pending → clicks Approve → picks a Delivery Day
- **Then** the entry is approved; the Rejected tab row reflects fewer Linked Companies (or disappears if all rejections have been reversed); the Approved tab now contains a row with the approved company.

**AC-7:**
- **Given** the seller wants to re-reject the entry with a different reason after reversing
- **When** the seller goes to CM-07 → clicks Reopen → the entry returns to Pending → clicks Reject → picks a different reason
- **Then** the entry is rejected with the new reason and a new decidedAt; the prior reason is overwritten. [NEEDS INPUT] confirm whether prior decisions should be retained as an immutable history.

**AC-8:**
- **Given** the Rejected tab returns zero rows after search / filter
- **When** the empty state renders
- **Then** the message "No rejected customers. Try adjusting your search or filters." is shown.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | Rejected tab rows are GROUPED BY mobile. |
| BR-2 | A row appears on the Rejected tab if and only if at least one of the customer's Company Approvals has status = rejected. The row's Linked Companies cell shows ONLY the rejected subset. |
| BR-3 | A customer with both Approved and Rejected company entries appears in BOTH tabs; each tab shows only the relevant subset; the Detail page (CM-07) is the canonical full view. |
| BR-4 | Inline, the only row action on the Rejected tab is Details. |
| BR-5 | The Reopen flow lives on the Customer Detail page (CM-07); it is the only Phase 1 path to reverse a rejection or to change a previously assigned reason. |
| BR-6 | Reopen flips a rejected entry back to status = "pending"; rejectionReason and decidedAt are cleared. The seller then goes through the standard Approve (CM-03) or Reject (CM-04) flow. |
| BR-7 | The Linked Companies dialog mirrors the same per-company status layout as the Customer Detail page's Linked Companies section, but is read-only. |
| BR-8 | [NEEDS INPUT] Whether prior rejection / approval decisions should be retained as an immutable history (audit log on the Detail page) when Reopen is used. Phase 1 implementation: only the latest decision is retained; prior fields are overwritten on the next decision. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | All rejected entries on a customer are Reopened and re-Approved | The customer leaves the Rejected tab; appears only on the Approved tab. |
| 2 | A customer is Rejected on Brand A and Pending on Brand B | The Pending entry appears on the Pending tab; the Rejected entry appears on the Rejected tab; no Approved row exists yet. |
| 3 | Seller filters Brand / Company = Brand B; a Rejected row's customer is rejected on Brand A AND Brand B | Per CM-05 BR-7 [NEEDS INPUT]: row shows only Brand B in the Linked Companies cell / dialog OR shows all rejected brands regardless. Confirm. |
| 4 | Two Pending entries for the same customer are bulk-Rejected together | After commit, the Rejected tab shows ONE row for that customer with "2 companies" rejected; both reasons are visible in the breakdown. |
| 5 | Seller Reopens a rejected entry and walks away without taking a follow-up action | The entry sits in the Pending tab as a re-opened request; the Pending badge increments; the Rejected tab loses that entry. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-CUSRJ-01 | Linked Companies dialog load fails | "Unable to load company breakdown. Please retry." | Show retry CTA; dialog remains open. |
| ERR-CUSRJ-02 | Concurrent change while dialog is open | (Refresh on close — see CM-07 ERR-CUSD-03 for the Detail-page-level concurrency story.) | Refresh on dialog close. |
| ERR-CUSRJ-03 | Session expired | "Your session has expired. Please log in again." | Redirect to login. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| customerId | String | Yes | Customer record key. | Customer record. |
| mobile | String | Yes | Grouping key for the Rejected tab. | Customer record. |
| rejectedCompanies[] | Array | Yes | Subset of companyApprovals where status = rejected; each entry carries companyName + rejectionReason + decidedAt. | Computed from companyApprovals. |
| rejectedCount | Integer | Yes | = rejectedCompanies.length; drives the "{N} company / companies" button label. | Computed. |

### Workflow

```
1. Seller Admin opens the Rejected tab (CM-01).
2. System loads customer rows grouped by mobile, filtered to those with ≥ 1 rejected Company Approval.
3. System renders the row with the Linked Companies button "{N} company / companies" (red chip).
4. [DECISION] Seller Admin chooses an action:
   IF Linked Companies button:    Open the Linked Companies dialog (read-only per-company breakdown).
                                  -> Per-entry sub-text: "{rejectionReason} · {decidedAt}".
                                  -> [DECISION] In the dialog:
                                          IF Close:           Close dialog; remain on Rejected tab.
                                          IF Open Customer:   Navigate to /customers/{customerId} (CM-07).
   IF Details (Eye icon):         Navigate to /customers/{customerId} (CM-07).
5. To reverse a rejection, the seller goes through CM-07's Reopen flow.
```

### Section 4 — UI/UX

**Wireframe Notes (Rejected Tab — Per-row Layout + Linked Companies Dialog)**

```
Rejected — Table Row (grouped by mobile)
├─ Customer        : customerName
├─ Class           : ClassType badge
├─ Business        : businessName
├─ Mobile          : mobile
├─ Linked Companies: [ 🏢 {N} company / companies  ▸ ]   (red chip)
├─ Area / Pincode  : area
│                    pincode · city
├─ Registered      : registeredDate (DD MMM YYYY)
└─ Actions         : [👁 Details ]

Linked Companies dialog
├─ Header: 🏢 "Linked Companies"
├─ Sub-text: "Per-company approval status for **{businessName}** ({mobile})."
├─ Per-company entry:
│   {companyName}     [ Rejected (red) ]
│   "Reason: **{rejectionReason}** · {decidedAt}"
└─ Footer: [ Close ]   [ Open Customer → ]
```

**Field Validations**

**[NOT APPLICABLE]** — The Rejected tab and the Linked Companies dialog are read-only; mutating actions (Reopen, re-Approve, re-Reject) live in CM-07.

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Rejected tab — no rejected customers (no rows) | No rejected customers. Try adjusting your search or filters. | — |

---

# USER STORY CM-07

## Customers — Customer Detail Page (Per-Company Approval Control + Reopen)

*Epic: Seller Admin — Customers   |   Priority: Critical   |   Owner: Product Team*

### Description

**Section 1 — Basic Information**

| Field | Value |
| --- | --- |
| Story Title | Customers — Customer Detail Page (Per-Company Approval Control + Reopen) |
| Epic / Feature Link | Seller Admin — Customers |
| Business Owner | Product Team (Qwipo Seller Store) |
| Priority | Critical — the Detail page is the canonical full view of a customer (every Company Approval, any status) and the only Phase 1 surface that exposes the Reopen action. |
| Sprint Target | [NEEDS INPUT] Sprint ID / target date |
| User Persona | Seller Admin — reviewing a single customer's full record, acting per-company, or reopening a prior decision. |

**Business Context**

**WHY:** The Customer Detail page is the canonical full view of a customer. Unlike the list tabs (which show subsets per status), the Detail page surfaces EVERY Company Approval — pending, approved, and rejected — in one Linked Companies section, each entry carrying the appropriate per-status action: Approve / Reject (when pending) or Reopen (when decided). Reopen is the gate to mutating any prior decision in Phase 1: it flips the entry back to Pending, after which the seller goes through the standard Approve (CM-03) or Reject (CM-04) flow. The page also surfaces Basic Information, Address, Business Information, Internal Notes, and an embedded location map for verification.

**User Persona**

| Persona Name | Role | Goal | Pain Point |
| --- | --- | --- | --- |
| Seller Admin | Reviewing a single customer's full record | See every Company Approval (any status) and act per-company; reopen a decision when the situation has changed | Without a single canonical view, the seller has to reconcile per-tab partial views by hand and has no path to mutate prior decisions |

**Success Metrics**

- 100% of Reopen actions correctly flip the target entry to Pending and clear deliveryDay / rejectionReason / decidedAt (audit cleanliness).
- Time from "I want to change a Delivery Day" → committed change — target under 60 seconds (Detail open → Reopen → Approve → pick day).

**Real-World Scenario**

**CURRENT STATE:** A buyer is Approved on Brand A and Brand C, Rejected on Brand B. The seller wants to (a) verify the buyer's address on a map; (b) change Brand A's Delivery Day from Monday to NDD; (c) Reopen the Brand B rejection and approve it on Friday.

**DESIRED STATE:** Seller Admin lands on `/customers/{id}`, sees the page header with Back to Customers, the Linked Companies section showing Brand A (Approved · Mon), Brand B (Rejected · Outside Service Area), Brand C (Approved · Wed); clicks Reopen on Brand A → it returns to Pending → clicks Approve → picks NDD → committed; clicks Reopen on Brand B → returns to Pending → clicks Approve → picks Friday → committed; navigates back to the list — the Approved tab now shows 3 companies for this customer; the Rejected tab no longer shows the customer.

**Section 3 — Functional Clarity**

**User Story:** As a Seller Admin, I want a single canonical Customer Detail page that surfaces every Company Approval (any status), the per-company Approve / Reject / Reopen actions, the customer's basic information, address (with embedded map), and business details, so that I have a single screen to act per-company and to reverse any prior decision via the Reopen flow.

### Acceptance Criteria

**AC-1:**
- **Given** the Seller Admin lands on `/customers/{customerId}`
- **When** the page loads
- **Then** the page header shows: Back to Customers (ArrowLeft icon, navigates to `/customers`), the customer's Store Name (h1), and the sub-text "{ownerName} · {mobile}".

**AC-2:**
- **Given** the Linked Companies section renders
- **When** the user inspects each entry
- **Then** each entry shows: company name (bold); a status badge (Approved = green, Rejected = red, Pending Approval = amber); a Delivery Day badge when status = approved; "Reason: {rejectionReason}" when status = rejected; "Acted on {decidedAt}" sub-text when not pending.

**AC-3:**
- **Given** an entry's status is "pending"
- **When** the user inspects the entry's actions
- **Then** the entry shows two buttons: Reject (outline red) and Approve (filled green); both open the same dialogs as CM-03 / CM-04 but pre-scoped to that single entry.

**AC-4:**
- **Given** an entry's status is "approved" or "rejected"
- **When** the user inspects the entry's actions
- **Then** the entry shows ONE button: Reopen (ghost variant, RefreshCw icon, title: "Re-open decision").

**AC-5:**
- **Given** the user clicks Reopen on an Approved or Rejected entry
- **When** the action commits
- **Then** the entry's status flips to "pending"; deliveryDay, decidedAt, and rejectionReason are cleared; the entry's action bar swaps to Reject + Approve; a success toast confirms "Re-opened decision for {companyName}".

**AC-6:**
- **Given** the user clicks Approve on a (now-pending) entry after Reopen
- **When** the dialog opens
- **Then** the dialog title reads "Approve for {companyName}"; the Delivery Day field is required (per CM-03); on commit the entry is approved with the new Delivery Day.

**AC-7:**
- **Given** the user clicks Reject on a (now-pending) entry after Reopen
- **When** the dialog opens
- **Then** the dialog title reads "Reject for {companyName}"; the Reason picker is required (per CM-04); on commit the entry is rejected with the new reason.

**AC-8:**
- **Given** the page renders
- **When** the user inspects the Basic Information section
- **Then** the section shows: Store Name, Owner Name, Phone, Email (if present), Category (mapped from classType, or "—" if absent).

**AC-9:**
- **Given** the page renders
- **When** the user inspects the Address Details section
- **Then** the section shows: Full Address (full width), City + State + Pincode (5-column tight grid), Latitude + Longitude (monospace).

**AC-10:**
- **Given** the page renders
- **When** the user inspects the Business Information section
- **Then** the section shows: Customer ID (monospace, if present), GSTN Number (monospace, or "Not applicable" if absent), and "Registered On (First Order)" with the formatted date (e.g., "27 Mar 2026").

**AC-11:**
- **Given** the page renders
- **When** the user inspects the Location Map section
- **Then** an embedded OpenStreetMap iframe is shown; clicking anywhere on the map opens Google Maps in a new tab; the helper text reads "Click map to open in Google Maps"; an address strip below the map shows "{city}, {state} — {pincode}" plus the coordinates in monospace.

**AC-12:**
- **Given** the customer has Internal Notes
- **When** the page renders
- **Then** the Internal Notes section is shown with the notes copy; if no notes exist, the section is hidden.

### Business Rules

| # | Rule |
| --- | --- |
| BR-1 | The Detail page surfaces EVERY Company Approval on the customer regardless of status; the list tabs (Pending / Approved / Rejected) show only subsets — Detail is the canonical full view. |
| BR-2 | Per-company actions on the Detail page mirror the list-page semantics: Approve requires a Delivery Day (CM-03); Reject requires a reason (CM-04); Reopen flips status back to Pending. |
| BR-3 | Reopen is the only Phase 1 path to mutate a prior decision (change a Delivery Day, reverse an approval, or change a rejection reason). There is no direct "edit Delivery Day" or "change reason" action. |
| BR-4 | Reopen clears deliveryDay, decidedAt, and rejectionReason on the target entry and sets status = "pending". A subsequent Approve / Reject is required to commit a new decision. |
| BR-5 | Tenant scope: the Seller Admin can only open Detail pages for customers belonging to their own distributor record. |
| BR-6 | The page is read-only for Basic Information, Address, Business Information, and Internal Notes in Phase 1. [NEEDS INPUT] confirm whether any of these fields should be editable from the Detail page. |
| BR-7 | The Location Map section uses OpenStreetMap (no API key) for the embed and Google Maps for the click-through. [NEEDS INPUT] confirm whether the map provider needs to change for production. |
| BR-8 | The "Registered On" label is qualified as "First Order" to match the field semantics across the module (the registered date is the date of the customer's first order, not the buyer-app signup date). |
| BR-9 | "Acted on {decidedAt}" timestamps are rendered for any entry not in Pending; on Reopen, the timestamp is cleared. |
| BR-10 | Concurrency: actions on the Detail page are guarded against stale state — see ERR-CUSD-03. |

### Edge Cases

| # | Scenario | Expected Behavior |
| --- | --- | --- |
| 1 | Customer has no Linked Companies (all approvals removed somehow) | Linked Companies section shows the message "No companies linked to this customer yet." |
| 2 | Seller opens a Detail URL for a customer in another distributor | 403 Forbidden; redirect to /customers with an error toast. |
| 3 | Seller clicks Reopen, then immediately clicks Reopen again on the same entry | Second click is suppressed (button disabled while action in flight); only one Reopen is recorded. |
| 4 | Seller is on the Detail page and the customer's data changes in another session | Concurrency error per ERR-CUSD-03 on the next action; refresh required. |
| 5 | Customer has no GSTN | Business Information section shows "Not applicable" (gray, italic) for GSTN. |
| 6 | Customer has no Internal Notes | The Internal Notes section is hidden entirely. |
| 7 | Customer's pincode is in a region without map tiles | The map iframe shows whatever OSM provides; the click-through still opens Google Maps with the lat/long. |
| 8 | Seller Reopens an entry, walks away without committing a follow-up action | The entry sits in Pending state on the Detail page and on the list's Pending tab; no Delivery Day / reason is set. |

### Error Scenarios

| Code | Trigger | User-Facing Message | System Behavior |
| --- | --- | --- | --- |
| ERR-CUSD-01 | Detail load API fails | "Unable to load customer. Please retry." | Show retry CTA. |
| ERR-CUSD-02 | Customer not found / out-of-scope | "Customer not found." | Show error state with Back to Customers. |
| ERR-CUSD-03 | Concurrent state change on a per-company action | "This customer was updated elsewhere. Refresh to see the latest." | Offer Refresh; do not commit the duplicate action. |
| ERR-CUSD-04 | Per-company Approve / Reject / Reopen API failure | "Could not update the company decision. Please retry." | Re-enable the entry's buttons; allow retry. |
| ERR-CUSD-05 | Session expired | "Your session has expired. Please log in again." | Redirect to login; preserve target URL. |

### Data Specification

| Field Name | Type | Required | Validation Rule | Source / Default |
| --- | --- | --- | --- | --- |
| customerId | String | Yes | Display only. | Customer record. |
| storeName / customerName | String | Yes | Display. | Customer record. |
| ownerName | String | Yes | Display. | Customer record. |
| mobile / phone | String | Yes | Display. | Customer record. |
| email | String | Optional | Display. | Customer record. |
| classType / category | Enum | Yes | One of the 8 ClassType values; rendered as label or "—" if absent. | Customer record. |
| fullAddress | String | Yes | Display. | Customer record. |
| city / state / pincode | String | Yes | Display. | Customer record. |
| latitude / longitude | Number | Yes | Used for OpenStreetMap embed and Google Maps click-through. | Customer record. |
| gstNumber | String | Optional | Display; rendered as "Not applicable" when absent. | Customer record. |
| registeredDate | Date | Yes | Display as "Registered On (First Order)" with formatted date. | Computed (first order). |
| internalNotes | String | Optional | Section hidden when absent. | Customer record. |
| companyApprovals[] | Array | Yes | One entry per requested company; each entry: companyId, companyName, status, deliveryDay (when approved), decidedAt (when decided), rejectionReason (when rejected). | Customer record. |

### Workflow

```
1. Seller Admin clicks Details (Eye icon) on any list row OR Open Customer in a Linked Companies dialog.
2. System loads the customer scoped to the distributor.
3. [DECISION] Customer exists and is in scope?
   IF no:    Show ERR-CUSD-02; offer Back to Customers; EXIT.
   ELSE:     Render Header (Back / Store Name / Owner · Mobile) and the sections below.
4. Render Linked Companies section (every entry, any status).
5. Render Basic Information, Address Details, Business Information, Internal Notes (if present), Location Map.
6. [DECISION] Seller Admin chooses an action on a Linked Companies entry:
   IF entry status = pending:
       IF Approve:           Open Approve dialog (CM-03 single-row variant) -> on commit, update entry; toast.
       IF Reject:            Open Reject dialog (CM-04 single-row variant) -> on commit, update entry; toast.
   IF entry status = approved or rejected:
       IF Reopen:            Flip status to pending; clear deliveryDay / decidedAt / rejectionReason;
                             swap entry's action bar to Approve + Reject; toast: "Re-opened decision for {companyName}".
   IF Back to Customers:     Navigate to /customers; the list refreshes.
```

### Section 4 — UI/UX

**Wireframe Notes (Component Hierarchy)**

```
Page: Customer Detail (/customers/{customerId})
├─ Page Header
│   ├─ ← Back to Customers
│   ├─ H1: {storeName}
│   └─ Sub-text: "{ownerName} · {mobile}"
├─ Section: Linked Companies ({companyApprovals.length})    🏢 (blue)
│   └─ Per-entry layout:
│       ├─ {companyName}   [ Approved | Rejected | Pending Approval ]   [📅 {deliveryDay}]
│       ├─ When approved: "Delivery day: **{deliveryDay}** · Acted on {decidedAt}"
│       ├─ When rejected: "Reason: **{rejectionReason}** · Acted on {decidedAt}"
│       ├─ When pending : "Awaiting seller approval."
│       └─ Actions:
│            IF pending : [ Reject (outline red) ]   [ Approve (filled green) ]
│            ELSE       : [ ↻ Reopen ]   (ghost, gray)
├─ Section: Basic Information                                👤 (blue)
│   ├─ Store Name | Owner Name
│   ├─ Phone      | Email (if present)
│   └─ Category
├─ Section: Address Details                                  📍 (green)
│   ├─ Full Address (full width)
│   ├─ City | State | Pincode (5-col tight grid)
│   └─ Latitude | Longitude (monospace)
├─ Section: Business Information                             🏢 (purple)
│   ├─ Customer ID (monospace, if present)
│   ├─ GSTN Number (monospace, or "Not applicable" if absent)
│   └─ Registered On (First Order): {formatted date}
├─ Section: Internal Notes  (hidden if no notes)
│   └─ {notes copy}
└─ Section: Location Map                                     🧭 (red)  [sticky on lg+]
    ├─ Embedded OpenStreetMap iframe
    ├─ Transparent overlay → Google Maps (new tab)
    ├─ Helper: "Click map to open in Google Maps" 🔗
    └─ Address strip: "📍 {city}, {state} — {pincode}"   {lat, lng} (monospace)
```

**Field Validations**

| Field | Validation Rule | Error Message | Trigger |
| --- | --- | --- | --- |
| Per-company Approve dialog — Delivery Day | Required (per CM-03 BR-2). | (Approve disabled until picked.) | On-render / on-submit |
| Per-company Reject dialog — Reason | Required (per CM-04 BR-2). | "Please provide a reason for rejection." | On-submit |
| Per-company Reject dialog — Other comment | Required when reason = Other (per CM-04 BR-4). | "Please specify the reason." | On-submit |

**Empty States**

| Screen / Component | Empty State Message | CTA Button |
| --- | --- | --- |
| Linked Companies — customer has zero entries | No companies linked to this customer yet. | — |
| Internal Notes — no notes on customer | (section is hidden entirely) | — |
| GSTN Number — no GSTN on customer | Not applicable | — |
| Email — no email on customer | (row is hidden in Basic Information) | — |

---

## Open Questions for the Next Walkthrough Session

1. **Tab architecture** — the design notes describe a Master / DMS / ONDC three-tab architecture; the implemented design is Pending Approval / Approved / Rejected. Confirm the implemented architecture is the Phase 1 final.
2. **Pagination** — page size is currently 10; Orders / SKU lists use 25. Confirm the Phase 1 page size for Customers; confirm whether to add a page-size picker.
3. **Search debounce** — current code updates on every keystroke. Confirm whether to add explicit debounce (200–300 ms) before triggering filter.
4. **Export** — current code outputs CSV only. Confirm whether XLSX should be added (user walkthrough mentioned "Excel or CSV"); confirm whether export should honour active filter chips OR remain date-only as today.
5. **Bulk** — confirm a hard cap on bulk Approve / Reject size (e.g., 200); confirm cross-page "select all" option; confirm partial-failure handling (per-row error report) on bulk operations; confirm whether bulk Reject reasons require a comment for non-Other reasons.
6. **Concurrency** — confirm policy: optimistic concurrency (per-record version sent with action) vs server-driven "current-status" guard.
7. **Filter scoping on Approved / Rejected** — when a Brand / Company filter is active and a customer's row qualifies for the tab on the strength of the filtered brand only, confirm whether the Linked Companies cell shows ONLY that brand or shows all approved / rejected brands for the customer regardless of the active filter.
8. **Reopen audit trail** — confirm whether prior decisions (deliveryDay, rejectionReason, decidedAt, decidedBy) should be retained as an immutable audit history on the Customer Detail page when Reopen is used. Phase 1 implementation: only the latest decision is retained.
9. **Approved / Rejected — direct re-decide** — confirm whether changing a Delivery Day or reversing a decision should be possible from the list tabs directly (not just via Reopen on Detail). Phase 1 implementation: Detail-page-only.
10. **Detail page edits** — confirm whether any of Basic Information / Address / Business Information / Internal Notes should be editable from the Detail page (currently all read-only).
11. **Map provider** — confirm whether OpenStreetMap (current implementation) is acceptable for production OR whether to switch to Google Maps / a paid provider with API key.
12. **Persistence** — current code uses in-memory overrides keyed by customerId; reload reverts to seeded data. Confirm Phase 1 backend persistence story (REST endpoints, audit, etc.).
13. **Bulk on the Approved / Rejected tabs** — currently absent. Confirm whether bulk Reopen, bulk re-Approve, or bulk re-Reject should be added in Phase 1.
14. **Decision audit fields** — current code captures `decidedAt` only. Confirm whether `decidedBy` (user ID) and separate `approvedAt` / `rejectedAt` fields should be persisted for richer audit trails.
