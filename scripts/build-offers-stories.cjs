// Build the Offers & Schemes module user-stories Word document.
// Run with: node scripts/build-offers-stories.cjs
//
// Produces: Seller-Store-Offers-Schemes-User-Stories-Phase1.docx
//
// Style mirrors the Orders / Super Admin module docs. Stories are grounded against
// src/app/pages/offers/offers-list.tsx and src/app/lib/qps-validation.ts.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, Header, Footer,
  PageNumber, TabStopType, TabStopPosition,
} = require("docx");

// ---------- layout constants ----------
const PAGE_WIDTH = 12240;
const PAGE_HEIGHT = 15840;
const PAGE_MARGIN = 1080;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

const COLOR_PRIMARY = "1F4E79";
const COLOR_ACCENT = "2E75B6";
const COLOR_RED = "C00000";
const COLOR_MUTED = "595959";
const HEADER_FILL = "1F4E79";
const FIELD_FILL = "DEE6F1";
const ZEBRA_FILL = "F2F6FA";
const CODE_FILL = "F4F4F4";

const border = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

// ---------- atomic builders ----------
function P(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text: String(text), ...(opts.run || {}) })],
    spacing: { before: opts.before ?? 60, after: opts.after ?? 60 },
    alignment: opts.alignment,
    pageBreakBefore: opts.pageBreakBefore,
  });
}

function H1(text, opts = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, color: COLOR_PRIMARY, size: 36 })],
    spacing: { before: 320, after: 200 },
    pageBreakBefore: opts.pageBreakBefore ?? true,
  });
}

function num(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [new TextRun({ text })],
    spacing: { before: 40, after: 40 },
  });
}

function mono(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Consolas", size: 18 })],
    spacing: { before: opts.before ?? 0, after: opts.after ?? 0 },
    shading: opts.shade ? { fill: CODE_FILL, type: ShadingType.CLEAR, color: "auto" } : undefined,
  });
}

function makeTable(headers, rows, proportions) {
  const total = proportions.reduce((a, b) => a + b, 0);
  const colWidths = proportions.map(p => Math.round((CONTENT_WIDTH * p) / total));
  const sum = colWidths.reduce((a, b) => a + b, 0);
  colWidths[colWidths.length - 1] += CONTENT_WIDTH - sum;

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: cellBorders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: HEADER_FILL, type: ShadingType.CLEAR, color: "auto" },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })],
        spacing: { before: 0, after: 0 },
      })],
    })),
  });

  const dataRows = rows.map((r, ri) => new TableRow({
    children: r.map((cellVal, ci) => new TableCell({
      borders: cellBorders,
      width: { size: colWidths[ci], type: WidthType.DXA },
      shading: ri % 2 === 1 ? { fill: ZEBRA_FILL, type: ShadingType.CLEAR, color: "auto" } : undefined,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: cellToParagraphs(cellVal),
    })),
  }));

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
}

function metaTable(rows) {
  const left = Math.round(CONTENT_WIDTH * 0.28);
  const right = CONTENT_WIDTH - left;
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [left, right],
    rows: rows.map(([k, v], ri) => new TableRow({
      children: [
        new TableCell({
          borders: cellBorders,
          width: { size: left, type: WidthType.DXA },
          shading: { fill: FIELD_FILL, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: k, bold: true, color: COLOR_PRIMARY, size: 20 })],
            spacing: { before: 0, after: 0 },
          })],
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: right, type: WidthType.DXA },
          shading: ri % 2 === 1 ? { fill: ZEBRA_FILL, type: ShadingType.CLEAR, color: "auto" } : undefined,
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: cellToParagraphs(v),
        }),
      ],
    })),
  });
}

function cellToParagraphs(val) {
  const arr = Array.isArray(val) ? val : [val];
  return arr.map(line => new Paragraph({
    children: [new TextRun({ text: String(line), size: 20 })],
    spacing: { before: 0, after: 0 },
  }));
}

function storyBanner(numLabel, title, breadcrumbs) {
  return [
    new Paragraph({
      pageBreakBefore: true,
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: numLabel, bold: true, color: COLOR_RED, size: 28 })],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: title, bold: true, color: COLOR_PRIMARY, size: 36 })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY, space: 4 } },
      children: [new TextRun({ text: breadcrumbs, italics: true, color: COLOR_MUTED, size: 20 })],
    }),
  ];
}

function acBlock(code, parts) {
  const out = [
    new Paragraph({
      spacing: { before: 120, after: 40 },
      children: [new TextRun({ text: code + ":", bold: true, color: COLOR_RED, size: 22 })],
    }),
  ];
  for (const p of parts) {
    out.push(new Paragraph({
      spacing: { before: 20, after: 20 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: p.key + " ", bold: true, color: COLOR_PRIMARY, size: 20 }),
        new TextRun({ text: p.value, size: 20 }),
      ],
    }));
  }
  return out;
}

function workflowBlock(lines) {
  const out = [new Paragraph({
    spacing: { before: 120, after: 60 },
    children: [new TextRun({ text: "WORKFLOW", bold: true, color: COLOR_PRIMARY, size: 22 })],
  })];
  for (const line of lines) out.push(mono(line, { shade: true }));
  return out;
}

function wireframeBlock(lines) { return lines.map(l => mono(l, { shade: true })); }

function userStoryLine(persona, action, outcome) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    children: [
      new TextRun({ text: "User Story: ", bold: true, color: COLOR_PRIMARY, size: 22 }),
      new TextRun({ text: "As a ", size: 22 }),
      new TextRun({ text: persona, bold: true, size: 22 }),
      new TextRun({ text: ", I want to ", size: 22 }),
      new TextRun({ text: action, bold: true, size: 22 }),
      new TextRun({ text: ", so that ", size: 22 }),
      new TextRun({ text: outcome, bold: true, size: 22 }),
      new TextRun({ text: ".", size: 22 }),
    ],
  });
}

function whyParagraph(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    children: [
      new TextRun({ text: "WHY: ", bold: true, color: COLOR_PRIMARY, size: 22 }),
      new TextRun({ text: text, size: 22 }),
    ],
  });
}

function sectionBanner(text) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_ACCENT, space: 1 } },
    children: [new TextRun({ text, bold: true, color: COLOR_PRIMARY, size: 26 })],
  });
}

function subBanner(text) {
  return new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [new TextRun({ text, bold: true, color: COLOR_ACCENT, size: 22 })],
  });
}

function notApplicable(reason) {
  return new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "[NOT APPLICABLE] ", bold: true, color: COLOR_MUTED, size: 20 }),
      new TextRun({ text: "\u2014 " + reason, italics: true, color: COLOR_MUTED, size: 20 }),
    ],
  });
}

function csState(currentState, desiredState) {
  return new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text: currentState + " " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text: desiredState }),
    ],
  });
}

// =====================================================================
// CONTENT
// =====================================================================

const cover = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1800, after: 100 },
    children: [new TextRun({ text: "QWIPO SELLER STORE", bold: true, size: 56, color: COLOR_PRIMARY })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
    children: [new TextRun({ text: "Offers & Schemes \u2014 Phase 1", bold: true, size: 36, color: COLOR_ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
    children: [new TextRun({ text: "User Story Specifications", italics: true, size: 28, color: COLOR_MUTED })],
  }),
  metaTable([
    ["Document Type", "User Story Specifications \u2014 Offers & Schemes Module"],
    ["Module", "Seller Admin \u2014 Offers & Schemes (Quantity Pricing Schemes / QPS)"],
    ["Persona", "Seller Admin (Distributor)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Total Stories", "6 (OS-01 through OS-06)"],
    ["Version", "1.0 \u2014 Draft (initial dedicated coverage of the Offers & Schemes module)"],
    ["Date", "29 April 2026"],
    ["Status", "Ready for Dev"],
    ["Document Owner", "Omkar Charankar"],
    ["Companion Documents",
      "Seller-Store-User-Stories-Phase1.docx (Seller Admin); Seller-Store-Super-Admin-User-Stories-Phase1.docx; Seller-Store-Orders-User-Stories-Phase1.docx; Seller-Store-ONDC-SKU-Validation-Rules.docx."],
  ]),
];

const scope = [
  H1("Document Scope & Note to Reviewer"),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "This document is the dedicated user-story specification for the Qwipo Seller Store \u2014 Offers & Schemes module " +
        "under the Seller Admin persona. Phase 1 ships a single offer type \u2014 Quantity Pricing Scheme (QPS) \u2014 attached to a " +
        "single SKU and effective over a defined validity window. Coverage includes: the List page (KPI cards, search, " +
        "status filter, row actions); the Create / Edit / View / Delete flows for a QPS; the cross-slab validation rules " +
        "(QPS-010 / 011 / 012); and the fully wired Bulk Import flow."
      }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "GROUNDING: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text: "Stories are grounded in the actual implementation under " }),
      new TextRun({ text: "src/app/pages/offers/offers-list.tsx", font: "Consolas", color: COLOR_ACCENT }),
      new TextRun({ text: " and " }),
      new TextRun({ text: "src/app/lib/qps-validation.ts", font: "Consolas", color: COLOR_ACCENT }),
      new TextRun({ text: ". This document supersedes US-10 and US-11 in the Seller Admin user-stories doc \u2014 those entries remain there for the seller-side cross-references; this file is the canonical Offers & Schemes spec going forward." }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "OUT OF SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Other offer types (combo, BOGO, time-of-day, basket-level, etc.) \u2014 Phase 1 ships QPS only; multi-SKU bundle schemes; tier / segment-specific schemes (e.g., one price for Class A buyers, another for Class B)."
      }),
    ],
  }),
];

const stateMachine = [
  H1("QPS Lifecycle (Phase 1)"),
  P("Every QPS has an Active / Inactive toggle plus Start and End dates. The Status displayed on the list and the badge in the editor is DERIVED from these inputs \u2014 it is never directly set by the user."),
  makeTable(
    ["Status", "Derivation", "Editable?", "Deletable?"],
    [
      ["Scheduled", "Active toggle ON, Start Date is in the future.", "Yes", "Yes"],
      ["Active", "Active toggle ON, today falls within Start \u2192 End.", "Yes", "Yes"],
      ["Inactive", "Active toggle OFF, today is on or before End Date.", "Yes", "Yes"],
      ["Expired", "End Date is in the past (terminal, irreversible).", "No (Edit disabled with tooltip; Active toggle disabled)", "Yes"],
    ],
    [2, 6, 3, 3],
  ),
  subBanner("Status Derivation Algorithm"),
  ...workflowBlock([
    "Inputs:  startDate, endDate, activeToggle, today.",
    "1. IF endDate < today          -> \"Expired\"",
    "2. ELSE IF activeToggle == OFF -> \"Inactive\"",
    "3. ELSE IF startDate > today   -> \"Scheduled\"",
    "4. ELSE                        -> \"Active\"",
  ]),
];

const indexChildren = [
  H1("Story Index"),
  makeTable(
    ["#", "Story Title", "Module", "Priority", "Dependency", "Status"],
    [
      ["OS-01", "Offers & Schemes \u2014 List Page (KPI Cards, Search, Status Filter, Row Actions)", "Offers & Schemes", "High", "None", "Ready for Dev"],
      ["OS-02", "Offers & Schemes \u2014 Create QPS Offer (Dialog, Slab Editor, Validation)", "Offers & Schemes", "High", "OS-01", "Ready for Dev"],
      ["OS-03", "Offers & Schemes \u2014 Edit QPS Offer (Reuse Dialog, Status-aware)", "Offers & Schemes", "High", "OS-02", "Ready for Dev"],
      ["OS-04", "Offers & Schemes \u2014 View QPS Offer Details (Read-only Dialog)", "Offers & Schemes", "Medium", "OS-01", "Ready for Dev"],
      ["OS-05", "Offers & Schemes \u2014 Delete QPS Offer (Confirmation)", "Offers & Schemes", "Medium", "OS-01", "Ready for Dev"],
      ["OS-06", "Offers & Schemes \u2014 Bulk Import QPS Schemes (Template + Validate + Merge)", "Offers & Schemes", "High", "OS-01, OS-02", "Ready for Dev"],
    ],
    [2, 7, 3, 2, 3, 3],
  ),
];

const slabRulesAppendix = [
  H1("QPS Slab Validation Rules (Appendix A)"),
  P("These rules are referenced from OS-02 (Create), OS-03 (Edit), and OS-06 (Bulk Import). They are codified in src/app/lib/qps-validation.ts. Per-field rules apply on every input change; cross-slab rules apply on Save."),
  subBanner("Per-Field Rules"),
  makeTable(
    ["#", "Field", "Rule"],
    [
      ["QPS-001", "Min Qty", "Required; integer; > 0; Slab 1 starts at 1 by default."],
      ["QPS-002", "Max Qty", "Required for all slabs except the LAST (which may be open-ended / unbounded); integer; > Min Qty."],
      ["QPS-003", "Discount Type", "Required; one of \"flat\" | \"percent\"."],
      ["QPS-004", "Discount Value (Flat)", "Required when Discount Type = flat; decimal; > 0; < SKU Selling Price."],
      ["QPS-005", "Discount Value (Percent)", "Required when Discount Type = percent; numeric; > 0; < 100."],
      ["QPS-006", "Effective Price (computed)", "Flat: = Discount Value. Percent: = round(SP \u00d7 (1 \u2212 P / 100), 2). Always > 0 and \u2264 SP."],
      ["QPS-007", "Start Date", "Required; date; \u2264 End Date."],
      ["QPS-008", "End Date", "Required; date; \u2265 Start Date; \u2265 today on Create."],
      ["QPS-009", "SKU", "Required; must belong to this distributor's catalog; must have a Selling Price > 0."],
    ],
    [1, 4, 8],
  ),
  subBanner("Cross-Slab Rules (run on Save)"),
  makeTable(
    ["#", "Rule", "Description"],
    [
      ["QPS-010", "No Overlaps", "For any two slabs i and j (i \u2260 j), their quantity ranges must not overlap."],
      ["QPS-011", "No Gaps (Contiguity)", "When slabs are sorted by Min Qty ascending: Min(i+1) = Max(i) + 1. Only the last slab may be open-ended."],
      ["QPS-012", "Monotone Non-Increasing Effective Price", "When slabs are sorted by Min Qty ascending, the computed Effective Price must be non-increasing across slabs (a higher quantity tier never costs more per unit than a lower tier)."],
    ],
    [1, 4, 8],
  ),
];

// =====================================================================
// OS-01 — List Page
// =====================================================================
const os01 = [
  ...storyBanner("USER STORY 1", "Offers & Schemes \u2014 List Page (KPI Cards, Search, Status Filter, Row Actions)",
    "Epic: Seller Admin \u2014 Offers & Schemes (QPS)   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Offers & Schemes \u2014 List Page (KPI Cards, Search, Status Filter, Row Actions)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Offers & Schemes (QPS)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 the Offers list is the seller's working view of every QPS scheme and the entry point to creating, editing, viewing, deleting and bulk-importing schemes."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor running quantity-based pricing offers."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Phase 1 of Offers & Schemes ships a single offer type \u2014 Quantity Pricing Scheme (QPS). A QPS attaches one or " +
    "more quantity slabs to a SKU (e.g., buy 1\u201311 units at \u20b9171, 12\u201347 units at 5% off, 48+ at 10% off) over a defined " +
    "validity window. The list page is the seller's working view of every QPS \u2014 four KPI cards summarise the portfolio, " +
    "search and a status filter narrow the table, and per-row actions (View Details, Edit, Delete) let the seller manage " +
    "individual schemes. Two primary CTAs (Bulk Import and + Create QPS Offer) seed new schemes."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Seller Admin runs 30+ QPS offers across their catalog. Some are about to expire and a couple should be paused.",
    "Seller Admin opens Offers & Schemes, sees four KPI cards (Total / Active / Total Pricing Rules / Avg Max Discount), filters by Status = Active, searches by SKU name, and acts on a row \u2014 view details, edit, or delete \u2014 in seconds.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "view, search and filter all my Quantity Pricing Schemes with at-a-glance KPIs and per-row actions",
    "I can manage every QPS from a single screen and act on any scheme with one click",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks Offers & Schemes in the left navigation" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the system displays four KPI cards in this order: Total QPS Schemes, Active Schemes, Total Pricing Rules, Avg Max Discount." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the seller has at least one scheme" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "the table is shown with columns: SKU Code, SKU Name, Offer Type (\"QPS\" badge), Pricing Rules (slab count), MRP / SP, Validity (Start \u2192 End), Status (badge), Actions." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin types in the search input" },
    { key: "When", value: "the input changes (debounced)" },
    { key: "Then", value: "the list filters to rows where SKU Code OR SKU Name contains the search term (case-insensitive, contains-match)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin opens the Status filter" },
    { key: "When", value: "a value is chosen from { All, Active, Inactive, Scheduled, Expired }" },
    { key: "Then", value: "the list refreshes to rows whose derived Status equals the selected value (or all rows when All is selected)." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Seller Admin clicks Bulk Import" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the Bulk Import flow (OS-06)." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Seller Admin clicks + Create QPS Offer" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the Create QPS Offer dialog (OS-02)." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "a row's status is Active, Inactive or Scheduled" },
    { key: "When", value: "the Actions column renders" },
    { key: "Then", value: "all three actions are enabled and visible: View Details (eye), Edit (pencil), Delete (trash)." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "a row's status is Expired" },
    { key: "When", value: "the Actions column renders" },
    { key: "Then", value: "View Details and Delete are enabled; Edit is disabled with the tooltip \"Expired schemes cannot be edited.\"" },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the Seller Admin clicks View Details" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the read-only View Details dialog (OS-04)." },
  ]),
  ...acBlock("AC-10", [
    { key: "Given", value: "the Seller Admin clicks Edit on an editable row" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the Edit dialog (OS-03) pre-filled with the scheme's current values." },
  ]),
  ...acBlock("AC-11", [
    { key: "Given", value: "the Seller Admin clicks Delete on any row" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the Delete confirmation (OS-05)." },
  ]),
  ...acBlock("AC-12", [
    { key: "Given", value: "the seller has zero schemes" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the empty state is shown; KPI cards display 0 (or \u20b9 0 for Avg Max Discount); the Bulk Import and + Create QPS Offer buttons remain visible." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Phase 1 supports a single Offer Type: QPS. The Offer Type column is informational \u2014 the value is always \"QPS\"."],
      ["BR-2", "Status values are derived from start / end dates and the Active toggle (see the QPS Lifecycle table at the top of this document)."],
      ["BR-3", "Total QPS Schemes = count of all schemes for this distributor (any status)."],
      ["BR-4", "Active Schemes = count of schemes whose derived Status is Active right now."],
      ["BR-5", "Total Pricing Rules = sum of slab counts across all schemes."],
      ["BR-6", "Avg Max Discount = average of (best slab Effective Price vs Selling Price) per scheme, expressed as a percentage."],
      ["BR-7", "Search matches SKU Code OR SKU Name only (case-insensitive, contains-match)."],
      ["BR-8", "Edit is disabled for Expired schemes (irreversible state)."],
      ["BR-9", "Delete is allowed in any state; the confirmation dialog must show the scheme name and slab count (see OS-05)."],
      ["BR-10", "The list is scoped to the logged-in distributor."],
      ["BR-11", "[NEEDS INPUT] Pagination model on this list (current code uses an in-memory filter with no pagination). Phase 1 spec proposes 25 rows per page with Previous / Next, matching the My SKU and Customers lists \u2014 confirm."],
      ["BR-12", "[NEEDS INPUT] Default sort order of the list (e.g., Status priority? Validity end-date asc?)."],
    ],
    [1, 9],
  ),
  subBanner("KPI Card Definitions"),
  makeTable(
    ["Card #", "Label", "Definition", "Source"],
    [
      ["1", "Total QPS Schemes", "All QPS schemes for this distributor, any status.", "COUNT(schemes WHERE distributor = current seller)"],
      ["2", "Active Schemes", "Schemes whose derived Status is Active right now.", "COUNT(schemes WHERE derivedStatus = 'Active')"],
      ["3", "Total Pricing Rules", "Sum of pricing slabs across all schemes.", "SUM(scheme.slabs.count)"],
      ["4", "Avg Max Discount", "Across all schemes, the average of the deepest discount each scheme offers (best slab Effective Price vs SP).", "AVG((SP \u2212 minEffectivePrice) / SP \u00d7 100)"],
    ],
    [1, 4, 6, 6],
  ),
  subBanner("Action Permissions by Status"),
  makeTable(
    ["Status", "View Details", "Edit", "Delete"],
    [
      ["Active", "Yes", "Yes", "Yes"],
      ["Inactive", "Yes", "Yes", "Yes"],
      ["Scheduled", "Yes", "Yes", "Yes"],
      ["Expired", "Yes", "No (disabled with tooltip \"Expired schemes cannot be edited\")", "Yes"],
    ],
    [3, 3, 5, 3],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller has zero schemes", "Empty state shown; all KPI cards = 0; Bulk Import and + Create QPS Offer remain visible."],
      ["2", "Search returns zero rows", "Show \"No schemes match your search\"; offer Clear Search."],
      ["3", "Status filter set to Expired and zero rows match", "Show \"No schemes match the selected status\"; offer Clear Filter."],
      ["4", "Scheme transitions Scheduled \u2192 Active during the session (start date hits now)", "On next list refresh / interaction, Status badge flips to Active and Active Schemes KPI is incremented."],
      ["5", "Scheme transitions Active \u2192 Expired (end date passes)", "Status badge flips to Expired; Edit becomes disabled; Active Schemes KPI is decremented."],
      ["6", "Seller toggles Active \u2192 Inactive on a scheme that is in validity (via Edit)", "Status flips Active \u2192 Inactive; Active Schemes KPI is decremented; the scheme remains in the list."],
      ["7", "Seller deletes the last Active scheme", "Active Schemes KPI \u2192 0; the scheme is removed from the list."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-OFR-01", "List load API fails", "\"Unable to load offers. Please retry.\"", "Show retry CTA; preserve search / filter state."],
      ["ERR-OFR-02", "Search request fails", "\"Search is temporarily unavailable. Please try again.\"", "Keep previously loaded list; non-blocking toast."],
      ["ERR-OFR-03", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login; preserve target URL."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (List Columns)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["SKU Code", "String", "Yes", "Belongs to this distributor's catalog.", "Scheme record \u2192 SKU master."],
      ["SKU Name", "String", "Yes", "Display only.", "SKU master."],
      ["Offer Type", "Enum", "Yes", "Phase 1: \"QPS\" only.", "System."],
      ["Pricing Rules", "Integer", "Yes", "Count of slabs on the scheme; \u2265 1.", "Computed from scheme.slabs."],
      ["MRP / SP", "Decimal", "Yes", "Display reference \u2014 SKU's MRP and Selling Price.", "SKU master (snapshot)."],
      ["Validity", "DateRange", "Yes", "Start Date \u2192 End Date (DD-MMM-YYYY).", "Scheme record."],
      ["Status", "Enum", "Yes", "Derived: Active | Inactive | Scheduled | Expired.", "Derived from Active toggle + dates."],
      ["Actions", "Control", "Yes", "View Details (eye) | Edit (pencil) | Delete (trash); Edit disabled when Expired.", "UI control."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks Offers & Schemes in the left navigation.",
    "2. System loads schemes scoped to the distributor; recomputes derived Status from start / end dates and Active toggle.",
    "3. System renders the four KPI cards and the table with row actions per status.",
    "4. [DECISION] Seller Admin chooses an action (any order, can combine):",
    "   IF Search:                          Filter list by SKU Code / SKU Name.",
    "   IF Status Filter:                   Apply selected status; rows refresh.",
    "   IF Bulk Import:                     Open Bulk Import flow (OS-06).",
    "   IF + Create QPS Offer:              Open Create dialog (OS-02).",
    "   IF View Details (any status):       Open read-only details dialog (OS-04).",
    "   IF Edit (Active / Inactive / Sched):Open Edit dialog (OS-03).",
    "   IF Delete (any status):             Open Delete confirmation (OS-05).",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Offers & Schemes \u2014 List View",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (Offers & Schemes active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header  Title: \"Offers & Schemes\"",
    "    \u251c\u2500 KPI Cards Row (4 cards)",
    "    \u2502   \u251c\u2500 Total QPS Schemes",
    "    \u2502   \u251c\u2500 Active Schemes",
    "    \u2502   \u251c\u2500 Total Pricing Rules",
    "    \u2502   \u2514\u2500 Avg Max Discount",
    "    \u251c\u2500 Action Bar (top-right cluster)",
    "    \u2502   \u251c\u2500 Search Input  (placeholder: \"Search by SKU code or name...\")",
    "    \u2502   \u251c\u2500 [Status \u25be] dropdown: All | Active | Inactive | Scheduled | Expired",
    "    \u2502   \u251c\u2500 [Bulk Import] button",
    "    \u2502   \u2514\u2500 [+ Create QPS Offer] primary button",
    "    \u251c\u2500 Data Table (8 columns)",
    "    \u2502   SKU Code | SKU Name | Offer Type | Pricing Rules | MRP / SP | Validity | Status (badge) | Actions",
    "    \u2502   Actions per row: [eye View] [pencil Edit] [trash Delete]  (pencil disabled when Status = Expired)",
    "    \u2514\u2500 Pagination Footer  [NEEDS INPUT]",
  ]),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Offers & Schemes \u2014 zero schemes", "You have not created any QPS schemes yet. Start with a Bulk Import or create your first scheme.", "\"+ Create QPS Offer\""],
      ["Offers & Schemes \u2014 search returns no rows", "No schemes match your search.", "\"Clear Search\""],
      ["Offers & Schemes \u2014 status filter returns no rows", "No schemes match the selected status.", "\"Clear Filter\""],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR-OFR-01", "Unable to load offers. Please retry.", "GET /offers failed: <statusCode>"],
      ["ERR-OFR-02", "Search is temporarily unavailable. Please try again.", "GET /offers/search failed: <statusCode> <query>"],
      ["ERR-OFR-03", "Your session has expired. Please log in again.", "401 Unauthorized on /offers"],
    ],
    [3, 6, 5],
  ),
];

// =====================================================================
// OS-02 — Create QPS
// =====================================================================
const os02 = [
  ...storyBanner("USER STORY 2", "Offers & Schemes \u2014 Create QPS Offer (Dialog, Slab Editor, Validation)",
    "Epic: Seller Admin \u2014 Offers & Schemes (QPS)   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Offers & Schemes \u2014 Create QPS Offer (Dialog, Slab Editor, Validation)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Offers & Schemes (QPS)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 the Create dialog is the primary path to introduce a QPS for any SKU; it must enforce the per-field and cross-slab validation rules so invalid schemes never reach the catalog."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor configuring a quantity-based discount for a single SKU."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "A QPS rewards bulk buying with tiered prices. The Create QPS Offer dialog is where the Seller Admin defines the " +
    "scheme for a single SKU \u2014 picks the SKU, sets a validity window, and adds 1\u2013N pricing slabs (Min Qty, Max Qty, " +
    "Discount Type, Discount Value). The dialog shows live computed Customer Pays and Customer Saves for every slab so " +
    "the seller can review the math before going live. Per-field validation is enforced as the user types; cross-slab " +
    "validation (no overlaps, no gaps, monotone non-increasing prices) runs on Save."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Seller Admin wants a tiered offer on Sunflower Oil 5L: \u20b9580 for 1\u20139 units, 5% off for 10\u201347, 8% off for 48+.",
    "Seller Admin clicks + Create QPS Offer, picks the SKU, sees the existing MRP / SP as context, sets Start / End dates, adds three slabs (1\u20139 flat \u20b9580; 10\u201347 percent 5%; 48+ percent 8%), reviews the live Customer Pays / You Save columns, leaves the Active toggle on, and clicks Create QPS Scheme \u2014 the scheme appears in the list with derived Status = Active or Scheduled (depending on Start Date).",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "create a QPS scheme by selecting a SKU, setting a validity window, and adding pricing slabs",
    "I can roll out tiered, time-bound discounts for any SKU with the math validated for me",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks + Create QPS Offer on the Offers list (OS-01)" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the Create dialog with sections in this order: SKU selector \u2192 Validity (Start / End dates) \u2192 Active / Inactive toggle \u2192 Pricing Slabs editor \u2192 footer (Cancel | Create QPS Scheme)." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the dialog is open" },
    { key: "When", value: "the Seller Admin selects a SKU from the catalog selector" },
    { key: "Then", value: "the dialog displays the SKU's existing MRP and Selling Price as a prominent read-only context panel (these values drive the live Customer Pays and Customer Saves columns)." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "Start Date and End Date are mandatory" },
    { key: "When", value: "the Seller Admin clicks Create QPS Scheme without both dates" },
    { key: "Then", value: "save is blocked with the inline error \"Start date and end date are required.\"" },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin enters a Start Date that is after the End Date" },
    { key: "When", value: "validation runs (per QPS-007 / QPS-008)" },
    { key: "Then", value: "save is blocked with \"Start date must be on or before end date.\"" },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the dialog opens" },
    { key: "When", value: "the slab editor first renders" },
    { key: "Then", value: "Slab 1 is shown with default fields: Min Qty (defaults to 1), Max Qty (empty for last slab), Discount Type (dropdown: Flat | Percent), Discount Value, computed Effective Price, computed Customer Saves." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Seller Admin clicks + Add Slab" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "a new slab row is appended below the previous one with Min Qty pre-filled to (previous Max Qty + 1)." },
    { key: "And", value: "[NEEDS INPUT] the Phase 1 spec proposes a 4-slab cap; the current implementation does not enforce a cap. Confirm \u2014 current AC assumes the Phase 1 cap of 4 slabs and disables + Add Slab beyond that with the tooltip \"Maximum 4 slabs per scheme.\"" },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "two or more slabs exist" },
    { key: "When", value: "the Seller Admin clicks the Delete (trash) icon on any slab row" },
    { key: "Then", value: "that slab row is removed; remaining slabs renumber from 1; if only one slab remains, its Delete button is disabled with the tooltip \"At least one slab is required.\"" },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Seller Admin selects Discount Type = Flat for a slab" },
    { key: "When", value: "the user enters a Discount Value V" },
    { key: "Then", value: "Effective Price = V; Customer Saves = SP \u2212 V; per-row inputs are validated per QPS-004 (V > 0 AND V < SP)." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the Seller Admin selects Discount Type = Percent for a slab" },
    { key: "When", value: "the user enters a Discount Value P" },
    { key: "Then", value: "Effective Price = round(SP \u00d7 (1 \u2212 P / 100), 2); Customer Saves = SP \u2212 Effective Price; per-row inputs are validated per QPS-005 (P > 0 AND P < 100)." },
  ]),
  ...acBlock("AC-10", [
    { key: "Given", value: "the Seller Admin clicks Create QPS Scheme" },
    { key: "When", value: "validation runs" },
    { key: "Then", value: "the system runs per-field rules QPS-001..QPS-009 then cross-slab rules QPS-010 (no overlaps), QPS-011 (no gaps / contiguity), QPS-012 (monotone non-increasing Effective Price)." },
    { key: "And", value: "any violation blocks save with inline messages on the offending fields / rows; the user can fix and re-save without losing other data." },
  ]),
  ...acBlock("AC-11", [
    { key: "Given", value: "all rules pass" },
    { key: "When", value: "the Seller Admin clicks Create QPS Scheme" },
    { key: "Then", value: "the scheme is persisted with derived Status (per the Lifecycle table); the dialog closes; the new scheme appears in the Offers list (OS-01); KPI cards refresh." },
  ]),
  ...acBlock("AC-12", [
    { key: "Given", value: "the Seller Admin clicks Cancel" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "any unsaved input is discarded; the dialog closes with no scheme created. [NEEDS INPUT] confirm whether a confirmation prompt is required when there are unsaved edits." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "A QPS targets exactly one SKU. Multi-SKU bundles are out of scope for Phase 1."],
      ["BR-2", "Start Date and End Date are mandatory; Start \u2264 End; on Create End must be \u2265 today."],
      ["BR-3", "A scheme has at least 1 slab. [NEEDS INPUT] Phase 1 spec proposes a maximum of 4 slabs; current implementation does not cap \u2014 confirm and enforce."],
      ["BR-4", "Discount Type is one of: Flat (Customer Pays the entered value) or Percent (off the SKU's Selling Price)."],
      ["BR-5", "Per-field validation rules are codified as QPS-001 through QPS-009 (see Appendix A)."],
      ["BR-6", "Cross-slab validation rules are codified as QPS-010 (no overlaps), QPS-011 (no gaps / contiguity), QPS-012 (monotone non-increasing Effective Price). They run on Save (see Appendix A)."],
      ["BR-7", "Effective Price and Customer Saves are computed live and read-only \u2014 the seller cannot type into these fields."],
      ["BR-8", "Active / Inactive toggle on Create: ON makes the scheme eligible to take effect (derived Status = Active when within validity, Scheduled when Start Date is future); OFF makes it Inactive regardless of dates."],
      ["BR-9", "Status of a saved scheme is always DERIVED from start / end dates plus the Active toggle (see the Lifecycle table)."],
      ["BR-10", "Only one Active QPS per SKU may be in effect at any time. [NEEDS INPUT] confirm: hard block on creating a second Active scheme on the same SKU, or warn-and-allow."],
      ["BR-11", "[NEEDS INPUT] Currency, decimal precision and rounding rule for Effective Price / Customer Saves (current proposal: 2 decimal places, half-up)."],
      ["BR-12", "Currency in Phase 1 is INR."],
    ],
    [1, 9],
  ),
  subBanner("Slab Editor \u2014 Field Specification"),
  makeTable(
    ["Field", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Min Qty", "Integer", "Yes (QPS-001)", "> 0; Slab(i+1).Min = Slab(i).Max + 1.", "User input."],
      ["Max Qty", "Integer | Open", "Yes for all slabs except the last (QPS-002)", "> Min Qty; only the LAST slab may be open-ended (no Max Qty = \"and above\").", "User input."],
      ["Discount Type", "Enum", "Yes (QPS-003)", "Flat | Percent.", "Dropdown selection."],
      ["Discount Value", "Decimal", "Yes (QPS-004 / 005)", "Flat: > 0 AND < SP. Percent: > 0 AND < 100.", "User input."],
      ["Effective Price", "Decimal", "Computed (QPS-006)", "Flat: = Discount Value. Percent: = round(SP \u00d7 (1 \u2212 V / 100), 2). Always > 0 and \u2264 SP.", "Computed read-only."],
      ["Customer Saves", "Decimal", "Computed", "= SP \u2212 Effective Price.", "Computed read-only."],
    ],
    [3, 2, 3, 5, 4],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Selected SKU has no Selling Price set", "Block with \"This SKU has no Selling Price. Set price on the SKU Detail page first.\" The SKU selector remains usable to pick another."],
      ["2", "Seller defines Slab 1 = 1\u20135, Slab 2 = 7\u201310 (gap)", "Save blocked by QPS-011: \"Min Qty must be <previous Max + 1>.\""],
      ["3", "Seller defines Slab 1 = 1\u20135, Slab 2 = 4\u201310 (overlap)", "Save blocked by QPS-010: \"Slab quantity ranges must not overlap.\""],
      ["4", "Two slabs both have Effective Price = \u20b9100 (non-strict equality)", "Allowed by QPS-012 (monotone NON-increasing, not strictly decreasing)."],
      ["5", "Seller marks Slab 2 as the last slab and leaves Max Qty empty (\"and above\")", "Allowed; the row visually reads \"\u2265 Min Qty\"; computation works as expected."],
      ["6", "Discount Value (Flat) = SP exactly", "QPS-004 fails: \"Flat price must be less than the SKU's Selling Price.\""],
      ["7", "Discount Value (Percent) = 100 exactly", "QPS-005 fails: \"Discount must be less than 100%.\""],
      ["8", "End Date is in the past on Create", "QPS-008 fails: \"End date must be today or later.\""],
      ["9", "Seller toggles Active OFF, sets Start Date today, End Date in 30 days", "On Save, derived Status = Inactive (per Lifecycle table)."],
      ["10", "Seller sets Start Date in 5 days, Active = ON", "On Save, derived Status = Scheduled until the start date."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-OFRC-01", "Create API timeout", "\"Save is taking longer than usual. Please try again.\"", "Keep dialog open; retain entered values; allow retry."],
      ["ERR-OFRC-02", "Create API server error", "\"Could not create the scheme. Please retry.\"", "Keep dialog open; retain values; allow retry."],
      ["ERR-OFRC-03", "Selected SKU was deleted while the dialog was open", "\"The selected SKU is no longer available. Please choose another.\"", "Reset SKU selection; preserve other inputs where possible."],
      ["ERR-OFRC-04", "Slab validation failure on Save (per-field or cross-slab)", "Per-field / per-row inline messages keyed by QPS-NNN.", "Block save; do not call API."],
      ["ERR-OFRC-05", "Session expired during create", "\"Your session has expired. Please log in again.\"", "Redirect to login; preserve target URL."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Scheme record persisted on Create)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["id", "String", "Yes", "System-generated; unique per distributor.", "Auto."],
      ["distributorId", "String", "Yes", "Tenant scope.", "Session."],
      ["skuCode / skuId", "String", "Yes", "Belongs to this distributor's catalog (QPS-009).", "User selection."],
      ["skuName, mrp, sellingPrice", "String / Decimal", "Yes", "Snapshot from SKU master at create time.", "Auto-loaded."],
      ["startDate", "Date", "Yes", "QPS-007.", "User input."],
      ["endDate", "Date", "Yes", "QPS-008.", "User input."],
      ["slabs[]", "Array (1\u2013N)", "Yes", "Per-slab QPS-001..006; cross-slab QPS-010..012.", "User input."],
      ["activeToggle", "Boolean", "Yes", "ON / OFF; combined with dates to derive Status.", "Toggle."],
      ["status (derived)", "Enum", "Yes", "Active | Inactive | Scheduled | Expired (per Lifecycle algorithm).", "Computed."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks + Create QPS Offer on the Offers list (OS-01).",
    "2. System opens the Create dialog with one empty Slab 1 and Active toggle ON by default.",
    "3. Seller Admin selects a SKU; system loads MRP / SP context.",
    "4. Seller Admin enters Start Date and End Date.",
    "5. Seller Admin configures Slab 1 (Min, Max, Discount Type, Discount Value); per-field rules QPS-001..006 run live.",
    "   - Effective Price and Customer Saves recompute live as values change.",
    "6. (Optional) Seller Admin clicks + Add Slab; up to [Phase 1 cap, NEEDS INPUT] slabs total.",
    "7. (Optional) Seller Admin deletes a slab via the trash icon (cannot delete the last remaining slab).",
    "8. (Optional) Seller Admin toggles Active / Inactive.",
    "9. [DECISION] Seller Admin clicks an action:",
    "    IF Cancel:                Discard inputs; close dialog; EXIT.",
    "    IF Create QPS Scheme:     Run per-field + cross-slab validation (QPS-001..012) + BR-10 single-active check.",
    "10. [DECISION] Validation result:",
    "    IF any rule fails:        Block save; show inline errors; preserve values.",
    "    ELSE:                     Persist scheme; derive Status; close dialog.",
    "11. Offers list refreshes; new scheme appears with the correct Status badge; KPI cards update.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Dialog: Create QPS Offer",
    "\u251c\u2500 Header: \"Create QPS Scheme\" + close (X)",
    "\u251c\u2500 Section: Select SKU",
    "\u2502   \u251c\u2500 SKU selector (search + dropdown, scoped to distributor catalog)",
    "\u2502   \u2514\u2500 Read-only context: \"MRP: \u20b9<mrp>   Selling Price: \u20b9<sp>\"",
    "\u251c\u2500 Section: Validity",
    "\u2502   \u251c\u2500 Start Date (date picker, required)",
    "\u2502   \u2514\u2500 End Date (date picker, required)",
    "\u251c\u2500 Section: Status",
    "\u2502   \u2514\u2500 Active / Inactive toggle (default ON; auto-disabled when End Date in past)",
    "\u251c\u2500 Section: Pricing Slabs",
    "\u2502   \u251c\u2500 Slab table header: # | Min Qty | Max Qty | Discount Type | Discount Value | Effective Price | Customer Saves | (delete)",
    "\u2502   \u251c\u2500 Slab 1 row (always present, delete disabled when only 1 slab)",
    "\u2502   \u251c\u2500 Slab 2..N rows (added via + Add Slab; each has a delete trash icon)",
    "\u2502   \u2514\u2500 [+ Add Slab] button",
    "\u2514\u2500 Footer Action Bar: [ Cancel ]   [ + Create QPS Scheme ]",
  ]),
];

// =====================================================================
// OS-03 — Edit QPS
// =====================================================================
const os03 = [
  ...storyBanner("USER STORY 3", "Offers & Schemes \u2014 Edit QPS Offer (Reuse Dialog, Status-aware)",
    "Epic: Seller Admin \u2014 Offers & Schemes (QPS)   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Offers & Schemes \u2014 Edit QPS Offer (Reuse Dialog, Status-aware)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Offers & Schemes (QPS)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 schemes are routinely tweaked (slab tweaks, validity extensions, deactivation) post-creation."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 amending an existing QPS."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "After a QPS is live, sellers often need to extend the validity, tune slab thresholds, or pause the scheme. Edit " +
    "reuses the same dialog as Create (OS-02) with the existing values pre-filled. The same QPS-001..012 validation " +
    "applies on Save. Edit is gated by Status: Active / Inactive / Scheduled schemes are editable; Expired schemes are " +
    "read-only (the pencil icon is disabled with a tooltip on the list)."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "An Active QPS scheme needs its end date extended by 14 days and one slab adjusted.",
    "Seller Admin clicks Edit on the row, the dialog opens pre-filled, the seller updates End Date and tweaks Slab 2's discount, clicks Save Changes, and the list reflects the new validity and computed savings.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "edit an existing QPS scheme using the same dialog as Create, with Expired schemes blocked",
    "I can amend live, paused, or scheduled schemes confidently while frozen Expired schemes stay frozen",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks Edit on a non-Expired row in the Offers list" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the same Create / Edit dialog as OS-02, pre-filled with the scheme's SKU, MRP / SP context, Start / End dates, all slabs, and the Active toggle state." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the dialog is in Edit mode" },
    { key: "When", value: "the dialog renders" },
    { key: "Then", value: "the title reads \"Edit QPS Scheme\"; the footer primary button reads \"Save Changes\"; SKU selection is read-only (cannot reassign a scheme to a different SKU). [NEEDS INPUT] confirm whether SKU re-selection is desired in any case." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin makes any field change and clicks Save Changes" },
    { key: "When", value: "validation runs" },
    { key: "Then", value: "QPS-001..009 run on changed fields and QPS-010..012 run across all slabs; the same per-field / per-row error semantics as OS-02 apply." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "validation passes" },
    { key: "When", value: "the Seller Admin clicks Save Changes" },
    { key: "Then", value: "the scheme is updated in place; the list refreshes with the new Status (re-derived from new dates / toggle); KPI cards refresh." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "a row has Status = Expired" },
    { key: "When", value: "the user inspects the Actions column" },
    { key: "Then", value: "the Edit (pencil) button is disabled with the tooltip \"Expired schemes cannot be edited\"; clicking has no effect." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the dialog is open and the scheme's End Date is in the past (became Expired since the dialog opened)" },
    { key: "When", value: "the user inspects the toggle" },
    { key: "Then", value: "the Active / Inactive toggle is disabled (cannot turn an Expired scheme back on by toggling); the user must extend the End Date first." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "another session has updated the same scheme while this dialog was open" },
    { key: "When", value: "the user clicks Save Changes" },
    { key: "Then", value: "the system surfaces a concurrency error \"This scheme was updated elsewhere. Reload to see the latest values.\"; the user must reload before retrying. [NEEDS INPUT] confirm concurrency policy." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Seller Admin clicks Cancel" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "any unsaved edits are discarded; the dialog closes with the scheme unchanged." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Edit reuses the Create dialog with pre-filled values; the same QPS-001..012 rules apply on Save."],
      ["BR-2", "SKU selection is locked in Edit mode \u2014 a scheme cannot be reassigned to a different SKU."],
      ["BR-3", "Edit is disabled for Expired schemes (pencil disabled with tooltip on the list; the dialog is never opened in that case)."],
      ["BR-4", "When End Date becomes past while the dialog is open, the Active toggle is disabled (cannot revive expired schemes by toggling)."],
      ["BR-5", "Save Changes does NOT change the scheme's identity (id) \u2014 it updates the existing record in place."],
      ["BR-6", "[NEEDS INPUT] Whether changes to slabs apply retroactively to past orders or only to new orders going forward (current implementation: only new orders \u2014 confirm)."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller extends End Date to today + 30", "Status remains Active (or Scheduled if Start was future); KPI cards unchanged."],
      ["2", "Seller toggles Active OFF on a currently Active scheme", "Status flips Active \u2192 Inactive; Active Schemes KPI decrements."],
      ["3", "Seller tweaks Slab 2 in a way that breaks QPS-011 (introduces a gap)", "Save blocked; inline error on Slab 2."],
      ["4", "Seller opens Edit on a scheme that is Expired (e.g., direct URL or cached state)", "Dialog refuses to open; show toast \"Expired schemes cannot be edited.\""],
      ["5", "Seller adds a 5th slab (under the proposed 4-slab cap)", "Blocked per OS-02 BR-3 (with [NEEDS INPUT] flag)."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-OFRE-01", "Edit load API fails", "\"Unable to load the scheme. Please retry.\"", "Show retry CTA; preserve dialog skeleton."],
      ["ERR-OFRE-02", "Save API timeout / server error", "\"Could not save changes. Please retry.\"", "Keep dialog open; preserve edits."],
      ["ERR-OFRE-03", "Concurrent state change", "\"This scheme was updated elsewhere. Reload to see the latest values.\"", "Offer Reload."],
      ["ERR-OFRE-04", "Validation failure on Save", "Per-field / per-row inline messages keyed by QPS-NNN.", "Block save."],
      ["ERR-OFRE-05", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks Edit on a non-Expired row (OS-01 AC-7 / AC-10).",
    "2. System opens the Create / Edit dialog pre-filled with the scheme's current values; SKU is locked.",
    "3. Seller Admin edits any of: Start Date, End Date, Active toggle, slab fields, +Add / Delete slab.",
    "4. [DECISION] Seller Admin clicks an action:",
    "    IF Cancel:           Discard edits; close dialog; EXIT.",
    "    IF Save Changes:     Run QPS-001..012 + concurrency check.",
    "5. [DECISION] Validation result:",
    "    IF invalid:          Show inline errors; remain in dialog.",
    "    ELSE:                Persist updates; derive new Status; close dialog.",
    "6. Offers list refreshes; the row reflects the new validity, slabs and Status.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes"),
  P("UI is identical to OS-02's Create dialog with three differences: (1) title reads \"Edit QPS Scheme\"; (2) footer primary button reads \"Save Changes\"; (3) the SKU selector is rendered as read-only context (BR-2)."),
];

// =====================================================================
// OS-04 — View Details
// =====================================================================
const os04 = [
  ...storyBanner("USER STORY 4", "Offers & Schemes \u2014 View QPS Offer Details (Read-only Dialog)",
    "Epic: Seller Admin \u2014 Offers & Schemes (QPS)   |   Priority: Medium   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Offers & Schemes \u2014 View QPS Offer Details (Read-only Dialog)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Offers & Schemes (QPS)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Medium \u2014 the read view lets the seller verify a scheme's slabs and savings without entering Edit mode."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 inspecting an existing QPS."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "View Details is the read-only inspect view for a scheme. It opens as a dialog from the eye icon on any row " +
    "(any status, including Expired). It surfaces the same shape of data as the editor but locked from edits, with a " +
    "footer Edit button that switches to Edit mode \u2014 disabled when Status = Expired."
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "view a scheme's full details \u2014 SKU, validity, status, slabs, computed savings \u2014 without entering Edit mode",
    "I can verify a scheme at a glance without risking accidental edits",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks View Details (eye icon) on any row" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens a read-only View Details dialog showing: SKU Code + SKU Name; MRP / SP context; Start \u2192 End validity; derived Status badge; slabs table with Min Qty / Max Qty / Discount / Effective Price / Customer Saves." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the View Details dialog is open" },
    { key: "When", value: "the user inspects the slabs table" },
    { key: "Then", value: "all fields are read-only \u2014 no inputs, no toggles, no add / delete buttons." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the View Details dialog is open" },
    { key: "When", value: "the dialog footer renders" },
    { key: "Then", value: "the footer shows: Close, Edit. The Edit button is disabled with the tooltip \"Expired schemes cannot be edited\" when Status = Expired (BR-3)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin clicks Edit in the View dialog" },
    { key: "When", value: "Status is editable" },
    { key: "Then", value: "the View dialog closes and the Edit dialog (OS-03) opens pre-filled." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Seller Admin clicks Close (or X)" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the dialog closes; the user remains on the Offers list with the same scroll / search / filter state preserved." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "View Details is available for all schemes regardless of Status (including Expired)."],
      ["BR-2", "View Details is strictly read-only \u2014 no field is editable from this dialog."],
      ["BR-3", "Edit button in the footer is disabled when Status = Expired (consistent with OS-01 AC-8 and OS-03 BR-3)."],
      ["BR-4", "Closing the dialog must not navigate the user away from the Offers list."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Scheme transitions to Expired while the View dialog is open", "Edit button updates to disabled; Status badge updates to Expired."],
      ["2", "Scheme is deleted in another session while the View dialog is open", "On close, the Offers list refresh hides the row; if the user clicks Edit, surface a clear \"This scheme no longer exists.\" toast."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  notApplicable("View Details is a read-only dialog over already-loaded list data; there are no failure modes beyond standard list-load errors covered by OS-01 ERR-OFR-01."),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks the eye icon on any row.",
    "2. System opens the View Details dialog with read-only content.",
    "3. [DECISION] Seller Admin clicks an action in the dialog:",
    "    IF Edit (when enabled):  Close View dialog; open Edit dialog (OS-03).",
    "    IF Close / X:            Close dialog; remain on Offers list.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Dialog: View QPS Scheme",
    "\u251c\u2500 Header: \"Scheme Details\" + close (X)",
    "\u251c\u2500 Strip: SKU Code \u00b7 SKU Name \u00b7 MRP \u00b7 SP \u00b7 Validity \u00b7 Status badge",
    "\u251c\u2500 Slabs table (read-only): # | Min Qty | Max Qty | Discount | Effective Price | Customer Saves",
    "\u2514\u2500 Footer: [ Close ]   [ Edit ]   (Edit disabled when Status = Expired)",
  ]),
];

// =====================================================================
// OS-05 — Delete
// =====================================================================
const os05 = [
  ...storyBanner("USER STORY 5", "Offers & Schemes \u2014 Delete QPS Offer (Confirmation)",
    "Epic: Seller Admin \u2014 Offers & Schemes (QPS)   |   Priority: Medium   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Offers & Schemes \u2014 Delete QPS Offer (Confirmation)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Offers & Schemes (QPS)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Medium \u2014 sellers need to retire schemes that were created in error or are no longer relevant."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 retiring a scheme."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Delete is the only way to permanently remove a scheme from the catalog. It is allowed for any Status (Active, " +
    "Inactive, Scheduled, Expired) and is gated by a confirmation dialog showing the scheme name and slab count. The " +
    "Phase 1 implementation does not block delete based on referential checks \u2014 the seller owns the decision."
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "permanently delete a QPS scheme after confirming I understand the action is final",
    "I can clean up the catalog without leaving stale or test schemes around",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks Delete (trash icon) on any row" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens a confirmation dialog stating: \"Delete <scheme name>? This scheme has <N> slab(s). This action cannot be undone.\" with two actions: Cancel | Delete." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the confirmation dialog is open" },
    { key: "When", value: "the Seller Admin clicks Cancel (or X)" },
    { key: "Then", value: "the dialog closes with no change; the scheme remains in the list." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the confirmation dialog is open" },
    { key: "When", value: "the Seller Admin clicks Delete" },
    { key: "Then", value: "the scheme is removed from the catalog; the Offers list refreshes; the KPI cards refresh; a success toast confirms \"Scheme deleted.\"" },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the scheme is currently Active" },
    { key: "When", value: "the user clicks Delete" },
    { key: "Then", value: "the same confirmation flow applies. [NEEDS INPUT] confirm whether deleting an Active scheme requires an extra warning step (e.g., \"This scheme is currently Active \u2014 are you sure?\")." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "delete fails server-side" },
    { key: "When", value: "the API responds with an error" },
    { key: "Then", value: "the scheme remains in the list; an error toast is shown (ERR-OFRD-01); the user may retry." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Delete is allowed for any Status (Active, Inactive, Scheduled, Expired)."],
      ["BR-2", "A confirmation dialog is mandatory \u2014 there is no quick / no-confirm delete path."],
      ["BR-3", "The confirmation dialog must show the scheme name and the slab count."],
      ["BR-4", "Phase 1 has no cascading checks \u2014 deleting a scheme does not touch any past order's pricing snapshot."],
      ["BR-5", "[NEEDS INPUT] Whether deleting an Active scheme requires an additional warning step (per AC-4)."],
      ["BR-6", "[NEEDS INPUT] Whether the API uses soft-delete (with audit trail) or hard-delete in Phase 1."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller deletes the only scheme in the catalog", "List goes to empty state; KPI cards reset to 0."],
      ["2", "Seller deletes a scheme that just transitioned to Expired", "Same flow; the Status badge in the confirm dialog reads Expired."],
      ["3", "Seller deletes a scheme already deleted in another session", "API returns 404 / not-found; toast \"This scheme no longer exists.\"; remove the row from the list."],
      ["4", "Seller cancels at the confirmation step", "No-op; scheme remains."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-OFRD-01", "Delete API timeout / server error", "\"Could not delete the scheme. Please retry.\"", "Keep scheme in list; offer retry."],
      ["ERR-OFRD-02", "Scheme already deleted (404)", "\"This scheme no longer exists.\"", "Remove row from the list silently."],
      ["ERR-OFRD-03", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks the trash icon on any row.",
    "2. System opens the confirmation dialog with scheme name + slab count + irreversibility note.",
    "3. [DECISION] Seller Admin clicks an action:",
    "    IF Cancel:   Close dialog; no change; EXIT.",
    "    IF Delete:   Call delete API.",
    "4. [DECISION] API result:",
    "    IF success:  Remove row; refresh KPIs; success toast.",
    "    ELSE:        Keep row; show error toast (ERR-OFRD-01) with retry.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes"),
  ...wireframeBlock([
    "Dialog: Delete QPS Scheme?",
    "\u251c\u2500 Title: \"Delete <scheme name>?\"",
    "\u251c\u2500 Body: \"This scheme has <N> slab(s). This action cannot be undone.\"",
    "\u2514\u2500 Footer: [ Cancel ]   [ Delete ] (destructive style)",
  ]),
];

// =====================================================================
// OS-06 — Bulk Import
// =====================================================================
const os06 = [
  ...storyBanner("USER STORY 6", "Offers & Schemes \u2014 Bulk Import QPS Schemes (Template + Validate + Merge)",
    "Epic: Seller Admin \u2014 Offers & Schemes (QPS)   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Offers & Schemes \u2014 Bulk Import QPS Schemes (Template + Validate + Merge)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Offers & Schemes (QPS)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 distributors with large catalogs need a way to define schemes for many SKUs at once."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 onboarding many schemes from a spreadsheet."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Hand-creating a QPS for every SKU in a 200-SKU catalog is impractical. Bulk Import lets the Seller Admin download " +
    "a CSV template, fill one row per slab (multiple rows per SKU), upload the file, review a validation preview that " +
    "groups rows into per-SKU schemes, and on confirmation create or update schemes in bulk with merge-by-SKU semantics."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Seller Admin has 80 SKUs that need a tiered QPS each.",
    "Seller Admin clicks Bulk Import, downloads the CSV template, fills it row-by-slab in their tool of choice, uploads, reviews the validation preview (Aggregated by SKU and Per-Row tabs), fixes any flagged rows, and clicks Import \u2014 the system creates / updates 80 schemes in one operation and the toast confirms \"80 scheme(s) \u2014 N new, M updated.\"",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "bulk-import QPS schemes from a structured file with template download, validation preview, and merge-by-SKU semantics",
    "I can roll out tiered pricing across the catalog in minutes",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks Bulk Import on the Offers list" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the Bulk Import flow with three steps: 1) Download Template, 2) Upload File, 3) Review Validation Preview & Import." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Seller Admin clicks Download Template" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system downloads a CSV with the canonical 9 columns: SKU ID, SKU Name (display), MRP (display), SP (display), Slab Start (Min Qty), Slab End (Max Qty, blank for open-ended last slab), Slab Price (Flat), Slab Percent (% off), Effective Value." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin uploads a file" },
    { key: "When", value: "the upload completes" },
    { key: "Then", value: "the system accepts CSV / XLSX / XLS; on parse failure, surface an error and allow re-upload." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the file is parsed successfully" },
    { key: "When", value: "the validation preview renders" },
    { key: "Then", value: "two tabs are shown: \"Aggregated Schemes\" (rows grouped by SKU into one scheme each) and \"Rows\" (per-row detail with status pills); each row / scheme that fails validation shows the QPS-NNN error code and a per-field reason." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "validation runs over the uploaded rows" },
    { key: "When", value: "rows are grouped by SKU into schemes" },
    { key: "Then", value: "the same per-field rules QPS-001..009 and cross-slab rules QPS-010 / 011 / 012 apply per scheme; SKUs that do not exist in the distributor's catalog (QPS-009) are flagged as errors." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "at least one valid scheme is present in the preview" },
    { key: "When", value: "the Seller Admin clicks Import" },
    { key: "Then", value: "the system applies merge-by-SKU semantics: for each valid SKU, if a scheme already exists for that SKU, it is UPDATED; otherwise a NEW scheme is created. Invalid schemes are skipped." },
    { key: "And", value: "a success toast summarises the outcome: \"X scheme(s) \u2014 Y new, Z updated\"; invalid rows remain visible in the preview for offline correction and re-upload." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "every uploaded scheme fails validation" },
    { key: "When", value: "the Seller Admin reviews the preview" },
    { key: "Then", value: "the Import button is disabled; the user must fix the file and re-upload." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Seller Admin clicks Cancel at any step" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the upload is discarded; no schemes are created or modified; the user returns to the Offers list." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Supported file formats: .csv, .xlsx, .xls."],
      ["BR-2", "Canonical CSV columns (in order): SKU ID, SKU Name, MRP, SP, Slab Start, Slab End, Slab Price (Flat), Slab Percent, Effective Value."],
      ["BR-3", "One row per slab. Multiple rows for the same SKU are aggregated into a single scheme; the union of slabs forms the scheme's slab list."],
      ["BR-4", "Validation runs the same per-field rules QPS-001..009 and cross-slab rules QPS-010 / 011 / 012 from Appendix A, applied per scheme after aggregation."],
      ["BR-5", "Merge-by-SKU on Import: existing scheme for a SKU is UPDATED in place; non-existent SKU schemes are CREATED."],
      ["BR-6", "Invalid schemes are skipped (partial commit) \u2014 valid schemes are imported even when other schemes in the same file fail."],
      ["BR-7", "[NEEDS INPUT] Maximum file size and maximum rows per upload."],
      ["BR-8", "[NEEDS INPUT] Whether existing slabs on a SKU are REPLACED entirely by the uploaded slabs (current implementation: replace) or MERGED with existing slabs (would require additional disambiguation rules)."],
      ["BR-9", "[NEEDS INPUT] Default Start / End dates for newly imported schemes if not present in the file (proposal: today \u2192 today + 30 days; confirm)."],
      ["BR-10", "[NEEDS INPUT] Sync vs async processing (proposal: sync for files \u2264 1000 rows; async + notification beyond)."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "File contains a SKU not in the distributor's catalog", "Aggregated scheme flagged with QPS-009 (\"SKU not found in catalog\"); skipped on Import."],
      ["2", "File has overlapping slabs for the same SKU", "Aggregated scheme flagged with QPS-010; skipped on Import."],
      ["3", "File has gap between slabs for the same SKU", "Aggregated scheme flagged with QPS-011; skipped on Import."],
      ["4", "File has slab order with rising effective price", "Aggregated scheme flagged with QPS-012; skipped on Import."],
      ["5", "File has rows for both Flat and Percent on the same slab (Slab Price AND Slab Percent both filled)", "Per-row error: \"Provide either Flat or Percent, not both.\""],
      ["6", "File has empty Slab End for a non-last slab", "Per-row error: only the last slab may be open-ended (QPS-002)."],
      ["7", "File has duplicate rows (same SKU + same slab range)", "Per-row error: duplicate slab; only one is kept (or all flagged \u2014 [NEEDS INPUT] confirm preferred behaviour)."],
      ["8", "User uploads an empty file (header only)", "Reject upload: \"File contains no data rows.\""],
      ["9", "User uploads an unsupported format (e.g., .txt)", "Reject upload: \"Only CSV, XLSX or XLS files are supported.\""],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-OFRI-01", "File parse failure", "\"We could not read this file. Please use the sample template.\"", "Reject file; remain on upload step."],
      ["ERR-OFRI-02", "Import API timeout / server error", "\"Import failed. Please retry.\"", "Keep preview; allow retry."],
      ["ERR-OFRI-03", "All schemes fail validation", "\"No valid schemes found. Please review the validation preview.\"", "Disable Import button."],
      ["ERR-OFRI-04", "Some schemes fail validation (partial)", "\"X imported, Y skipped. See preview for details.\"", "Apply valid; keep preview for review."],
      ["ERR-OFRI-05", "Session expired during upload", "\"Your session has expired. Please log in again.\"", "Redirect to login."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Bulk Import CSV columns)"),
  makeTable(
    ["#", "Column", "Type", "Required", "Notes"],
    [
      ["1", "SKU ID", "String", "Yes", "Must exist in the distributor's catalog (QPS-009)."],
      ["2", "SKU Name", "String", "Display only", "Helpful for spreadsheet readability; not used for matching."],
      ["3", "MRP", "Decimal", "Display only", "Snapshot from SKU master; ignored on import."],
      ["4", "SP (Selling Price)", "Decimal", "Display only", "Snapshot from SKU master; ignored on import."],
      ["5", "Slab Start (Min Qty)", "Integer", "Yes", "QPS-001."],
      ["6", "Slab End (Max Qty)", "Integer", "Yes except last slab", "Blank only for the last (open-ended) slab \u2014 QPS-002."],
      ["7", "Slab Price (Flat)", "Decimal", "Conditional", "Required when this row's discount is Flat; mutually exclusive with Slab Percent (QPS-003 / 004)."],
      ["8", "Slab Percent", "Decimal", "Conditional", "Required when this row's discount is Percent; mutually exclusive with Slab Price (QPS-003 / 005)."],
      ["9", "Effective Value", "Decimal", "Display only", "The expected Effective Price; if present, must match the computed value (QPS-006) within the rounding rule."],
    ],
    [1, 4, 2, 2, 6],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks Bulk Import on the Offers list (OS-01).",
    "2. System opens the Bulk Import flow with Step 1: Download Template.",
    "3. (Optional) Seller Admin clicks Download Template -> CSV with 9 columns is served.",
    "4. Seller Admin fills the file offline (one row per slab, multiple rows per SKU) and uploads it.",
    "5. System parses the file.",
    "    IF parse failure:                Reject (ERR-OFRI-01); remain on upload step.",
    "    ELSE:                            Proceed to validation.",
    "6. System aggregates rows by SKU into schemes; runs QPS-001..009 per row and QPS-010..012 across each scheme's slabs.",
    "7. System renders the validation preview with two tabs:",
    "    - Aggregated Schemes (one row per SKU; status: Valid / Error)",
    "    - Rows (per-row status; per-row reasons keyed by QPS-NNN)",
    "8. [DECISION] Seller Admin clicks an action:",
    "    IF Cancel:    Discard upload; close flow; EXIT.",
    "    IF Import:    Apply merge-by-SKU for all valid schemes (CREATE if SKU has no scheme; UPDATE if it does); skip invalid.",
    "9. System shows summary toast: \"X scheme(s) - Y new, Z updated\". Invalid rows remain visible for offline correction.",
    "10. Offers list refreshes; KPI cards refresh; new / updated schemes appear with derived Status.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page / Drawer: Bulk Import QPS Schemes",
    "\u251c\u2500 Step 1: Download Template",
    "\u2502   \u2514\u2500 Body: short instruction + [ Download Template (CSV) ] button",
    "\u251c\u2500 Step 2: Upload File",
    "\u2502   \u2514\u2500 Body: drop-zone / file picker; supported formats hint (CSV, XLSX, XLS)",
    "\u251c\u2500 Step 3: Validation Preview & Import",
    "\u2502   \u251c\u2500 Tabs: [ Aggregated Schemes ] [ Rows ]",
    "\u2502   \u251c\u2500 Aggregated tab: per-SKU scheme rows with Valid / Error pill + per-error reason",
    "\u2502   \u2514\u2500 Rows tab: per-row detail with QPS-NNN error code per row",
    "\u2514\u2500 Footer: [ Cancel ]   [ Import ]   (Import disabled when no valid scheme)",
  ]),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Bulk Import \u2014 no file selected", "Drop your file here or click to browse. Use the sample template for guaranteed compatibility.", "\"Download Template\""],
      ["Validation Preview \u2014 zero schemes parsed", "We could not find any valid schemes in this file. Please use the sample template.", "\"Re-upload File\""],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR-OFRI-01", "We could not read this file. Please use the sample template.", "qps_import_parse_failed"],
      ["ERR-OFRI-02", "Import failed. Please retry.", "POST /offers/import failed: <statusCode>"],
      ["ERR-OFRI-03", "No valid schemes found. Please review the validation preview.", "qps_import_no_valid_schemes"],
      ["ERR-OFRI-04", "X imported, Y skipped. See preview for details.", "qps_import_partial_success"],
      ["ERR-OFRI-05", "Your session has expired. Please log in again.", "401 Unauthorized on /offers/import"],
    ],
    [3, 6, 5],
  ),
];

// =====================================================================
// Open Questions
// =====================================================================
const openQuestions = [
  H1("Open Questions for the Next Walkthrough Session"),
  num("List \u2014 pagination model (page size, controls); default sort order; whether status filter should support multi-select."),
  num("Create / Edit \u2014 whether to enforce the proposed 4-slab cap (current code does not cap); single-Active-scheme-per-SKU policy (hard block vs warn-and-allow); rounding rule and decimal precision for Effective Price; unsaved-edits guard on Cancel."),
  num("Edit \u2014 whether SKU re-selection is desired in any case; whether slab edits apply retroactively to past orders."),
  num("Delete \u2014 extra warning for Active schemes; soft-delete vs hard-delete; audit trail."),
  num("Bulk Import \u2014 max file size / row count; existing-slabs replace vs merge semantics; default Start / End dates when not present; sync vs async processing for large files; duplicate-row handling."),
  num("Concurrency \u2014 server-driven \"latest version\" guard or optimistic concurrency on Edit Save."),
  num("Reporting \u2014 whether Avg Max Discount KPI should also surface per-status breakdowns or trend over time."),
  num("Audit \u2014 whether scheme edits / deletes need an immutable history accessible from the View Details dialog."),
];

// =====================================================================
// ASSEMBLE
// =====================================================================
const doc = new Document({
  creator: "Omkar Charankar",
  title: "Qwipo Seller Store \u2014 Offers & Schemes User Stories (Phase 1)",
  description: "User stories for the Offers & Schemes module (Seller Admin persona), Phase 1.",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: COLOR_PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: COLOR_PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: COLOR_ACCENT, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: { top: PAGE_MARGIN, right: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: "Qwipo Seller Store \u2014 Offers & Schemes User Stories (Phase 1)", color: COLOR_MUTED, size: 18 }),
              new TextRun({ text: "\tConfidential \u2014 Internal", color: COLOR_MUTED, size: 18, italics: true }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: "v1.0 \u2014 29 Apr 2026", color: COLOR_MUTED, size: 18 }),
              new TextRun({ text: "\tPage ", color: COLOR_MUTED, size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], color: COLOR_MUTED, size: 18 }),
              new TextRun({ text: " of ", color: COLOR_MUTED, size: 18 }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], color: COLOR_MUTED, size: 18 }),
            ],
          })],
        }),
      },
      children: [
        ...cover,
        ...scope,
        ...stateMachine,
        ...indexChildren,
        ...os01,
        ...os02,
        ...os03,
        ...os04,
        ...os05,
        ...os06,
        ...slabRulesAppendix,
        ...openQuestions,
      ],
    },
  ],
});

const outPath = path.join(__dirname, "..", "Seller-Store-Offers-Schemes-User-Stories-Phase1.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote:", outPath);
});
