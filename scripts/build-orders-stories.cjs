// Build the Orders module user-stories Word document.
// Run with: node scripts/build-orders-stories.cjs
//
// Produces: Seller-Store-Orders-User-Stories-Phase1.docx
//
// Style mirrors the Seller Admin doc. Stories grounded against
// src/app/pages/orders-enhanced.tsx and src/app/pages/order-detail.tsx.
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
    children: [new TextRun({ text: "Orders \u2014 Phase 1", bold: true, size: 36, color: COLOR_ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
    children: [new TextRun({ text: "User Story Specifications", italics: true, size: 28, color: COLOR_MUTED })],
  }),
  metaTable([
    ["Document Type", "User Story Specifications \u2014 Orders Module"],
    ["Module", "Seller Admin \u2014 Orders (List, Detail, Lifecycle Actions, Modify Items, Bulk Actions)"],
    ["Persona", "Seller Admin (Distributor)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Total Stories", "5 (OR-01 through OR-05)"],
    ["Version", "1.0 \u2014 Draft (initial coverage of Orders module)"],
    ["Date", "29 April 2026"],
    ["Status", "Ready for Dev"],
    ["Document Owner", "Omkar Charankar"],
    ["Companion Documents",
      "Seller-Store-User-Stories-Phase1.docx (Seller Admin); Seller-Store-Super-Admin-User-Stories-Phase1.docx; Seller-Store-ONDC-SKU-Validation-Rules.docx."],
  ]),
];

const scope = [
  H1("Document Scope & Note to Reviewer"),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "This document captures user stories for the Qwipo Seller Store \u2014 Orders module under the Seller Admin persona. " +
        "Coverage includes: the Orders list page (tabs, search, filter, export, pagination); the Order Detail read view " +
        "(buyer info, seller info, order meta, items table); the order lifecycle actions per status (Confirm, Reject with " +
        "reason, Mark as Delivered, Cancel); the Modify Items flow (editable quantity / price with live QPS slab " +
        "evaluation and confirmation diff); and Bulk Actions on the list (multi-select Confirm / Reject / Mark Delivered)."
      }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "GROUNDING: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text: "Stories are grounded in the actual implementation under " }),
      new TextRun({ text: "src/app/pages/orders-enhanced.tsx", font: "Consolas", color: COLOR_ACCENT }),
      new TextRun({ text: " and " }),
      new TextRun({ text: "src/app/pages/order-detail.tsx", font: "Consolas", color: COLOR_ACCENT }),
      new TextRun({ text: ". Where the walkthrough did not mention a feature already in the code (e.g., bulk actions, the fourth cancel reason \"Delivery Issue\", QPS savings aggregated at order footer), the story captures the implemented behaviour and flags any open product decisions with " }),
      new TextRun({ text: "[NEEDS INPUT]", bold: true, color: COLOR_RED }),
      new TextRun({ text: "." }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "OUT OF SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Returns / refunds workflows; partial-shipment tracking; courier integration / AWB generation; buyer-app side of the order lifecycle. These are deferred beyond Phase 1."
      }),
    ],
  }),
];

const lifecycle = [
  H1("Order Lifecycle (Phase 1)"),
  P("The Phase 1 order state machine is captured below. Every order entering the Seller Store via the ONDC network or a marketplace channel begins in the New state. The Seller Admin drives the order through the lifecycle until it reaches a terminal state."),
  makeTable(
    ["From", "Action", "To", "Conditions / Notes"],
    [
      ["New", "Confirm", "Confirmed", "Optional Modify Items beforehand. After confirm, order is locked in to be fulfilled."],
      ["New", "Reject (with reason)", "Rejected (terminal)", "Reason required: Out of Stock, Delivery Issue, Pricing Error, or Other (free-text)."],
      ["New", "Modify Items", "(stays in New, updated)", "Editable quantity and price with live QPS slab re-evaluation."],
      ["Confirmed", "Mark as Delivered", "Delivered (terminal)", "Marks order fulfilled."],
      ["Confirmed", "Cancel (with reason)", "Rejected (terminal)", "Same reason set as New \u2192 Reject."],
      ["Confirmed", "Modify Items", "(stays in Confirmed, updated)", "Same Modify flow as New."],
      ["Delivered", "(none)", "(terminal)", "Read-only \u2014 no actions allowed."],
      ["Rejected", "(none)", "(terminal)", "Read-only \u2014 no actions allowed."],
    ],
    [2, 3, 3, 5],
  ),
];

const indexChildren = [
  H1("Story Index"),
  makeTable(
    ["#", "Story Title", "Module", "Priority", "Dependency", "Status"],
    [
      ["OR-01", "Orders \u2014 List Page (Tabs, Search, Filter, Export, Pagination)", "Orders", "Critical", "None", "Ready for Dev"],
      ["OR-02", "Orders \u2014 Order Detail Page (Buyer / Seller / Meta / Items)", "Orders", "Critical", "OR-01", "Ready for Dev"],
      ["OR-03", "Orders \u2014 Lifecycle Actions per Status (Confirm / Reject / Mark Delivered / Cancel)", "Orders", "Critical", "OR-02", "Ready for Dev"],
      ["OR-04", "Orders \u2014 Modify Items Flow (Editable Quantity / Price with QPS Re-evaluation)", "Orders", "High", "OR-02, OR-03", "Ready for Dev"],
      ["OR-05", "Orders \u2014 Bulk Actions (Multi-select Confirm / Reject / Mark Delivered)", "Orders", "Medium", "OR-01, OR-03", "Ready for Dev"],
    ],
    [2, 7, 2, 3, 3, 3],
  ),
];

// =====================================================================
// OR-01 — Orders List
// =====================================================================
const or01 = [
  ...storyBanner("USER STORY 1", "Orders \u2014 List Page (Tabs, Search, Filter, Export, Pagination)",
    "Epic: Seller Admin \u2014 Orders   |   Priority: Critical   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Orders \u2014 List Page (Tabs, Search, Filter, Export, Pagination)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Orders"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Critical \u2014 the Orders list is the seller's daily operating view; it is the entry point to every order action."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor processing incoming orders from ONDC and marketplace channels."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Orders flow into the Seller Store from the ONDC network and connected marketplaces (Amazon / Flipkart / Direct). " +
    "The Seller Admin needs a single screen to triage them by lifecycle stage (New, Confirmed, Delivered, Rejected) " +
    "and to slice the data by company, status, marketplace, and date range. The list is the entry point to acting on " +
    "individual orders (Confirm, Reject, Modify, Mark as Delivered) and to running multi-order operations via Bulk " +
    "Actions (OR-05). Without this page, the seller has no operational visibility into their order pipeline."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor processing orders",
      "See every incoming and in-flight order at a glance, find a specific order quickly, and act on it",
      "Multiple marketplace consoles + ONDC inbox \u2014 without one unified list the seller misses orders or acts late"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Median time to find a specific order (search) \u2014 target under 5 seconds."),
  num("New-order acknowledgement time (New \u2192 Confirmed or Rejected) \u2014 target under 30 minutes for 95% of orders."),
  num("Tab counts reconcile with the underlying list filtered to the same status \u2014 target 100% accuracy."),
  subBanner("Real-World Scenario"),
  csState(
    "A new ONDC order lands at 9:05 am. The seller is on a phone call and needs to act on it within the SLA.",
    "Seller Admin opens Orders, the New tab badge shows the count, the new order is at the top of the New tab; the seller filters to Marketplace = ONDC, clicks the order, and confirms within 60 seconds.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "view, search, filter, paginate and export my orders across lifecycle tabs",
    "I can quickly find any order, segment my pipeline, and pull lists for offline analysis",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks Orders in the left navigation" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "five tabs are shown in this order with count badges: All, New, Confirmed, Delivered, Rejected; the All tab is selected by default." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the active tab has at least one order" },
    { key: "When", value: "the table renders" },
    { key: "Then", value: "the columns shown are: Order ID, Company / Brand, Source, Retailer Name, Order Value, Marketplace, Order Date, Status (badge), Actions." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin types in the search input" },
    { key: "When", value: "the input changes (debounced)" },
    { key: "Then", value: "the active-tab list filters to rows where Order ID OR Retailer Name contains the search term (case-insensitive)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin opens the Filter panel" },
    { key: "When", value: "filters are applied (Company / Brand multi-select, Status multi-select, Marketplace, Order Date Range From / To)" },
    { key: "Then", value: "the list refreshes to rows matching all selected filters; applied filters are reflected as removable chips above the table; pagination resets to page 1." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Filter panel is open" },
    { key: "When", value: "the user clicks Clear" },
    { key: "Then", value: "all filter inputs in the panel are cleared; the user can re-apply or close the panel." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Seller Admin clicks Apply on the Filter panel" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "filters are applied to the active tab; the panel closes; chips appear above the table." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Seller Admin clicks Export" },
    { key: "When", value: "the export drawer opens" },
    { key: "Then", value: "the system asks for an Order Date Range (From / To) and a file format ([NEEDS INPUT] confirm: CSV and / or XLSX); on confirmation, the system downloads a file containing all orders whose Order Date falls in the chosen range." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "more than 25 orders match the active tab and any applied search / filter" },
    { key: "When", value: "the list renders" },
    { key: "Then", value: "exactly 25 rows are shown per page and Previous / Next pagination controls are visible; the controls are disabled appropriately on the first and last pages." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the Seller Admin clicks the Action button on any row" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system navigates to the Order Detail page (OR-02) for that order." },
  ]),
  ...acBlock("AC-10", [
    { key: "Given", value: "the Seller Admin has zero orders" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the empty state is shown on the All tab; tab badges show 0; pagination footer is hidden." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Page size is fixed at 25 rows per page in Phase 1; pagination controls are limited to Previous and Next."],
      ["BR-2", "The list is scoped to the logged-in distributor \u2014 no cross-tenant visibility."],
      ["BR-3", "Tab counts (badges) reflect the count of orders in each status, AFTER any applied filter / search."],
      ["BR-4", "Status values: New, Confirmed, Delivered, Rejected. Cancelled orders land in the Rejected tab (Cancel transitions Confirmed -> Rejected per the lifecycle table)."],
      ["BR-5", "Search matches Order ID OR Retailer Name only (case-insensitive, contains-match)."],
      ["BR-6", "Filter \u2014 Company / Brand: multi-select sourced from the seller's Company / Brand catalog (Super Admin SA-08)."],
      ["BR-7", "Filter \u2014 Status: multi-select from { New, Confirmed, Delivered, Rejected }."],
      ["BR-8", "Filter \u2014 Marketplace: ONDC, Amazon, Flipkart, Direct. [NEEDS INPUT] confirm whether the canonical list also includes any other channels."],
      ["BR-9", "Filter \u2014 Order Date Range: From / To inclusive, both optional individually; if both provided, From <= To."],
      ["BR-10", "Export: scope is the Order Date Range chosen in the export drawer; the active tab and current search / filter chips do NOT alter the export \u2014 the date range is the sole scope. [NEEDS INPUT] confirm whether the user expects export to honour the active filter chips."],
      ["BR-11", "[NEEDS INPUT] Default sort order of the list within each tab (e.g., Order Date descending)."],
    ],
    [1, 9],
  ),
  subBanner("Tab Specification"),
  makeTable(
    ["Tab", "Definition", "Default Sort", "Bulk Actions Available (OR-05)"],
    [
      ["All", "All orders regardless of status.", "[NEEDS INPUT] (proposed: Order Date desc)", "None"],
      ["New", "Orders awaiting Confirm / Reject (just received from ONDC / marketplace).", "Order Date desc", "Confirm, Reject"],
      ["Confirmed", "Orders confirmed by the seller, awaiting fulfillment.", "Order Date desc", "Mark as Delivered, Cancel"],
      ["Delivered", "Terminal \u2014 orders successfully delivered.", "Order Date desc", "None"],
      ["Rejected", "Terminal \u2014 orders rejected (from New) or cancelled (from Confirmed).", "Order Date desc", "None"],
    ],
    [2, 5, 3, 4],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller has zero orders", "Empty state on All tab; tab badges all show 0."],
      ["2", "Search returns zero rows on the active tab", "Show \"No orders match your search\"; pagination footer hidden; offer Clear Search."],
      ["3", "Filter Date Range From > To", "Block Apply with inline error \"From date must be on or before To date.\""],
      ["4", "Export Date Range From > To", "Block confirm with the same inline error."],
      ["5", "Export with no rows in range", "Inform the user \"No orders in this date range.\"; do not download an empty file."],
      ["6", "Tab is switched while a search term is active", "Search term is preserved and applied to the new tab; tab badges and rows reflect the combined filter."],
      ["7", "Order is acted on (Confirm / Reject) elsewhere; user refreshes the list", "The order moves to the appropriate tab on refresh; badges update."],
      ["8", "User on page 3 changes the search term", "Pagination resets to page 1 of the new filtered set."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-ORD-01", "List load API fails", "\"Unable to load orders. Please retry.\"", "Show retry CTA; preserve filter / search / tab state."],
      ["ERR-ORD-02", "Search request fails", "\"Search is temporarily unavailable. Please try again.\"", "Keep previously loaded list visible; non-blocking toast."],
      ["ERR-ORD-03", "Pagination request fails", "\"Could not load the next page. Please retry.\"", "Keep current page visible; offer retry."],
      ["ERR-ORD-04", "Export request fails", "\"Export failed. Please retry.\"", "Keep export drawer open; offer retry."],
      ["ERR-ORD-05", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login; preserve target URL."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (List Columns)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Order ID", "String", "Yes", "System-generated; unique per distributor.", "Order record."],
      ["Company / Brand", "String", "Yes", "From the SKUs in the order.", "Order record (derived)."],
      ["Source", "String", "Yes", "Origin channel (e.g., ONDC, Amazon, Flipkart, Direct).", "Order record."],
      ["Retailer Name", "String", "Yes", "Buyer's name / business as supplied by the channel.", "Order record."],
      ["Order Value", "Decimal", "Yes", "Total order value (currency \u2014 INR in Phase 1).", "Computed from items."],
      ["Marketplace", "Enum", "Yes", "ONDC | Amazon | Flipkart | Direct.", "Order record."],
      ["Order Date", "DateTime", "Yes", "Used for filter date range and export.", "Order record."],
      ["Status", "Enum", "Yes", "New | Confirmed | Delivered | Rejected.", "Order record."],
      ["Actions", "Control", "Yes", "View / Manage \u2192 OR-02.", "UI control."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks Orders in the left navigation.",
    "2. System loads the orders scoped to this distributor.",
    "3. System renders the five tabs (All default), the table, and pagination.",
    "4. [DECISION] Seller Admin chooses an action (any order, can combine):",
    "   IF Switch tab:                 Re-render rows for the new tab; preserve search / filter context.",
    "   IF Search:                     Filter list by Order ID / Retailer Name; reset to page 1.",
    "   IF Filter (Apply):             Apply Company / Status / Marketplace / Date Range; chips render; reset to page 1.",
    "   IF Filter (Clear):             Clear filter inputs in the panel.",
    "   IF Previous / Next:            Load the corresponding 25-record page.",
    "   IF Export:                     Open drawer -> ask From / To order dates -> download file.",
    "   IF Action (View / Manage):     Navigate to Order Detail (OR-02).",
    "   IF Bulk Action:                See OR-05.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Orders \u2014 List View",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (Orders active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header  Title: \"Orders\"",
    "    \u251c\u2500 Tabs row: [ All (n) ] [ New (n) ] [ Confirmed (n) ] [ Delivered (n) ] [ Rejected (n) ]",
    "    \u251c\u2500 Action Bar (top-right cluster)",
    "    \u2502   \u251c\u2500 Search Input  (placeholder: \"Search by Order ID or Retailer Name\")",
    "    \u2502   \u251c\u2500 [Filter] button \u2192 panel: Company / Brand, Status, Marketplace, Date Range From / To, [Clear] [Apply]",
    "    \u2502   \u2514\u2500 [Export] button \u2192 drawer: From / To dates, file format, [Download]",
    "    \u251c\u2500 Filter Chips Bar (only when filters applied) + Clear all",
    "    \u251c\u2500 Bulk Action Bar (only when rows selected on New / Confirmed tab) \u2014 see OR-05",
    "    \u251c\u2500 Data Table (9 columns)",
    "    \u2502   Order ID | Company / Brand | Source | Retailer | Order Value | Marketplace | Order Date | Status (badge) | Actions",
    "    \u2514\u2500 Pagination Footer  [Previous]   Page X of Y   [Next]   (max 25 rows per page)",
  ]),
  subBanner("User Flow"),
  num("Seller Admin clicks Orders in the left nav."),
  num("Tabs + table + pagination render."),
  num("Seller Admin optionally switches tabs / searches / filters."),
  num("Seller Admin clicks Export \u2192 picks From / To dates and format \u2192 downloads file."),
  num("Seller Admin clicks View on a row \u2192 Order Detail (OR-02)."),
  num("BACK PATH: Seller Admin clicks any other left-nav item; filter / search / tab state is reset on next visit (Phase 1) \u2014 [NEEDS INPUT] confirm whether state preservation is required."),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Search input", "Max 100 chars; trims whitespace.", "\"Search term is too long.\"", "On-input (debounced)"],
      ["Filter \u2014 Date Range From / To", "Both optional individually; if both provided, From <= To.", "\"From date must be on or before To date.\"", "On-apply"],
      ["Export \u2014 From / To dates", "Both required; From <= To.", "\"From date must be on or before To date.\"", "On-confirm"],
      ["Export \u2014 File format", "[NEEDS INPUT] confirm allowed values (CSV / XLSX).", "\u2014", "On-confirm"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Orders \u2014 zero orders ever (first-time seller)", "No orders yet. Orders will appear here when buyers place them on ONDC or connected marketplaces.", "\u2014 (informational)"],
      ["Orders \u2014 active tab returns no rows", "No orders in this tab.", "\u2014"],
      ["Orders \u2014 search returns no rows", "No orders match your search.", "\"Clear Search\""],
      ["Orders \u2014 filter returns no rows", "No orders match the selected filters.", "\"Clear Filters\""],
      ["Export \u2014 no rows in date range", "No orders in this date range.", "\u2014"],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR-ORD-01", "Unable to load orders. Please retry.", "GET /orders failed: <statusCode>"],
      ["ERR-ORD-02", "Search is temporarily unavailable. Please try again.", "GET /orders/search failed: <statusCode> <query>"],
      ["ERR-ORD-03", "Could not load the next page. Please retry.", "Pagination request failed: page=<n> <statusCode>"],
      ["ERR-ORD-04", "Export failed. Please retry.", "POST /orders/export failed: <statusCode> from=<d> to=<d>"],
      ["ERR-ORD-05", "Your session has expired. Please log in again.", "401 Unauthorized on /orders"],
    ],
    [3, 6, 5],
  ),
];

// =====================================================================
// OR-02 — Order Detail (read view)
// =====================================================================
const or02 = [
  ...storyBanner("USER STORY 2", "Orders \u2014 Order Detail Page (Buyer / Seller / Meta / Items)",
    "Epic: Seller Admin \u2014 Orders   |   Priority: Critical   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Orders \u2014 Order Detail Page (Buyer / Seller / Meta / Items)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Orders"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Critical \u2014 the detail page is where the seller verifies what was ordered, who it is for, and acts on the order."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 reviewing a single order."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Once an order is selected from the list, the Seller Admin needs everything required to decide whether to confirm, " +
    "modify, or reject in a single read view: who the buyer is, what was ordered, what the order is worth, and which " +
    "channel it came through. The detail page surfaces buyer information, seller information, order meta (payment " +
    "mode, channel order ID, original order value), and the line-item table including any QPS savings. The action " +
    "buttons available on this page are governed by the order's current status (OR-03)."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "A new ONDC order arrives for 60 units of Sunflower Oil 5L from a known retailer.",
    "Seller Admin clicks the order from the New tab, lands on Order Detail, sees the buyer's store name and address (to verify it's reachable), the items table with quantity 60 and a QPS slab badge showing the 48+ tier discount, the original order value, and decides to Confirm \u2014 driving OR-03.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "view a single order's full information in one read view \u2014 buyer, seller, meta, items",
    "I have everything I need to decide whether to confirm, modify, or reject the order",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks View on an order row in the Orders list" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the page header shows the Order ID, the order Status badge, and a Back to Orders breadcrumb." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Order Detail page is rendered" },
    { key: "When", value: "the user inspects the layout" },
    { key: "Then", value: "the page is organised into four sections in this order: 1) Buyer Information, 2) Seller Information, 3) Order Meta, 4) Order Items." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Buyer Information section is rendered" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the section shows: Buyer Business / Store Name, Buyer Owner Name, Buyer Phone (Contact), Buyer Address, Buyer ID." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Information section is rendered" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the section shows: Seller Name, Seller ID / Code, Seller Contact Phone." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Order Meta section is rendered" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the section shows: Payment Mode (e.g., COD or Prepaid), Channel Order ID, Original Order Value, Order Date / Time, Channel / Marketplace." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Order Items section is rendered" },
    { key: "When", value: "the user inspects the table" },
    { key: "Then", value: "the table shows columns: Product Name, SKU Code, Quantity, Unit Price (Price / Unit), Total." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "an order item has a QPS scheme applied" },
    { key: "When", value: "the row renders" },
    { key: "Then", value: "a QPS badge is shown on the row indicating the slab the quantity falls into (e.g., \"Slab 2 \u00b7 12\u201347 qty \u00b7 5% off\") and the total saving for that item." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "one or more items have QPS savings" },
    { key: "When", value: "the items section renders" },
    { key: "Then", value: "a footer line summarises the aggregated QPS savings across the order (e.g., \"You saved \u20b9X across this order\")." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the order is in Delivered or Rejected state" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "the page is read-only \u2014 no Confirm / Reject / Modify / Cancel / Mark as Delivered buttons are shown." },
  ]),
  ...acBlock("AC-10", [
    { key: "Given", value: "the order is in New or Confirmed state" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "the appropriate per-status action buttons are shown (governed by OR-03)." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Order Detail is a read view; all editable behaviour is reached via Modify Items (OR-04) or per-status action buttons (OR-03)."],
      ["BR-2", "QPS slab evaluation on the read view reflects the slab the CURRENT item quantity falls into (sourced from the Offers & Schemes module \u2014 Seller Admin US-10 / US-11)."],
      ["BR-3", "Order Value shown on the Order Meta section is the ORIGINAL order value as received from the channel; the live computed total based on current items is shown in the Items section footer."],
      ["BR-4", "Tenant scope: the Seller Admin can only open detail pages for orders belonging to their own distributor record."],
      ["BR-5", "Phase 1 currency: INR. [NEEDS INPUT] confirm whether multi-currency is in scope for any channel."],
      ["BR-6", "Stock availability is shown for context but is NOT a blocking condition for Confirm in Phase 1 (distributors don't maintain real-time counts \u2014 see code comment)."],
    ],
    [1, 9],
  ),
  subBanner("Data Specification (Order Detail fields)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Order ID", "String", "Yes", "Display only.", "Order record."],
      ["Status", "Enum", "Yes", "New | Confirmed | Delivered | Rejected.", "Order record."],
      ["Order Time", "DateTime", "Yes", "Display.", "Order record."],
      ["Channel / Marketplace", "Enum", "Yes", "ONDC | Amazon | Flipkart | Direct.", "Order record."],
      ["Buyer Store / Business Name", "String", "Yes", "Display.", "Order record."],
      ["Buyer Owner Name", "String", "Yes", "Display.", "Order record."],
      ["Buyer Phone", "String", "Yes", "Display (10-digit).", "Order record."],
      ["Buyer Address", "String", "Yes", "Display.", "Order record."],
      ["Buyer ID", "String", "Yes", "Display.", "Order record."],
      ["Seller Name", "String", "Yes", "Display.", "Order record."],
      ["Seller ID / Code", "String", "Yes", "Display.", "Order record."],
      ["Seller Contact Phone", "String", "Yes", "Display.", "Order record."],
      ["Channel Order ID", "String", "Yes", "Display \u2014 the upstream channel's order identifier.", "Order record."],
      ["Payment Mode", "Enum", "Yes", "COD | Prepaid (and any other channel-specific values \u2014 [NEEDS INPUT]).", "Order record."],
      ["Original Order Value", "Decimal", "Yes", "Display (INR).", "Order record."],
      ["Items[]", "Array", "Yes", "Each item: id, name, skuId, quantity, pricePerUnit, totalPrice; QPS metadata when applicable.", "Order record."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Order has no items (data error)", "Show error state \"This order has no items\"; offer Back to Orders."],
      ["2", "An item's SKU has been deleted from the catalog after the order was placed", "Display the item with the original snapshot data; flag the SKU as \"No longer in catalog\"."],
      ["3", "QPS scheme has been deactivated since the order was placed", "Keep the QPS badge that applied at the time of order placement."],
      ["4", "Buyer Address is unusually long", "Wrap gracefully without breaking the section layout."],
      ["5", "Seller Admin opens an order URL belonging to a different distributor", "403 Forbidden; redirect to Orders list with error toast."],
      ["6", "Buyer phone is missing on the order payload", "Show \"\u2014\" placeholder; do not block the page."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-ORDD-01", "Detail load API fails", "\"Unable to load order. Please retry.\"", "Show retry CTA."],
      ["ERR-ORDD-02", "Order not found / out-of-scope", "\"Order not found.\"", "Show error state with Back to Orders."],
      ["ERR-ORDD-03", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login; preserve target URL."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks View on an order row.",
    "2. System loads the order scoped to the distributor.",
    "3. [DECISION] Order exists and is in scope?",
    "   IF no:    Show ERR-ORDD-02; offer Back to Orders; EXIT.",
    "   ELSE:     Render header (Order ID, Status badge) and the four sections.",
    "4. Render Buyer Information, Seller Information, Order Meta, Order Items.",
    "5. For each item: render row with QPS badge if applicable; aggregate QPS savings in the footer.",
    "6. Render the action buttons appropriate to the order Status (OR-03).",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Orders \u2014 Order Detail",
    "\u251c\u2500 Page Header",
    "\u2502   \u251c\u2500 Back to Orders breadcrumb",
    "\u2502   \u251c\u2500 H1: Order ID",
    "\u2502   \u2514\u2500 Status badge + Order Date / Time",
    "\u251c\u2500 Section: Buyer Information",
    "\u2502   \u251c\u2500 Buyer Business / Store Name",
    "\u2502   \u251c\u2500 Buyer Owner Name",
    "\u2502   \u251c\u2500 Buyer Phone",
    "\u2502   \u251c\u2500 Buyer Address",
    "\u2502   \u2514\u2500 Buyer ID",
    "\u251c\u2500 Section: Seller Information",
    "\u2502   \u251c\u2500 Seller Name",
    "\u2502   \u251c\u2500 Seller ID / Code",
    "\u2502   \u2514\u2500 Seller Contact Phone",
    "\u251c\u2500 Section: Order Meta (compact 3-col grid)",
    "\u2502   \u251c\u2500 Payment Mode",
    "\u2502   \u251c\u2500 Channel Order ID",
    "\u2502   \u2514\u2500 Original Order Value",
    "\u251c\u2500 Section: Order Items",
    "\u2502   \u251c\u2500 Table: Product Name | SKU Code | Quantity | Unit Price | Total",
    "\u2502   \u2502   QPS badge per row when applicable (\"Slab N \u00b7 range \u00b7 discount\")",
    "\u2502   \u2514\u2500 Footer: aggregated QPS savings + computed live total",
    "\u2514\u2500 Sticky Action Bar: per-status buttons (OR-03)",
  ]),
];

// =====================================================================
// OR-03 — Lifecycle Actions per Status
// =====================================================================
const or03 = [
  ...storyBanner("USER STORY 3", "Orders \u2014 Lifecycle Actions per Status (Confirm / Reject / Mark Delivered / Cancel)",
    "Epic: Seller Admin \u2014 Orders   |   Priority: Critical   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Orders \u2014 Lifecycle Actions per Status (Confirm / Reject / Mark Delivered / Cancel)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Orders"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Critical \u2014 the lifecycle is the core of the orders module."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 driving an order from receipt to delivery (or rejection)."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Each order in the Seller Store advances through a small, deterministic state machine. From New, the seller can " +
    "Confirm (move to Confirmed), Reject with reason (move to Rejected, terminal), or Modify Items first (OR-04). " +
    "From Confirmed, the seller can Mark as Delivered (terminal) or Cancel with reason (move to Rejected, terminal). " +
    "Delivered and Rejected are terminal \u2014 no further action is allowed. The Reject and Cancel paths require a " +
    "reason from a fixed set: Out of Stock, Delivery Issue, Pricing Error, Other (free-text)."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "A New order arrives. The seller can fulfill it. Later, after dispatch, the goods are delivered.",
    "Seller Admin opens the order, clicks Confirm; status changes to Confirmed. After delivery, the seller opens the order again and clicks Mark as Delivered \u2014 status flips to Delivered (terminal) and no further actions are possible.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "drive each order through Confirm \u2192 Mark as Delivered, or reject / cancel with a reason at any point in New or Confirmed",
    "every order ends in a terminal state with a clear audit trail",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "an order is in New state" },
    { key: "When", value: "the user is on Order Detail" },
    { key: "Then", value: "the action bar shows three buttons: Modify Items (-> OR-04), Confirm Order, Cancel (Reject)." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "an order is in Confirmed state" },
    { key: "When", value: "the user is on Order Detail" },
    { key: "Then", value: "the action bar shows: Modify Items (-> OR-04), Mark as Delivered, Cancel." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "an order is in Delivered or Rejected state" },
    { key: "When", value: "the user is on Order Detail" },
    { key: "Then", value: "no action buttons are shown; the page is read-only." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the user clicks Confirm Order on a New-status order" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system requests confirmation, then updates the order's status to Confirmed; the action bar transitions to the Confirmed-state buttons; the Orders list / tab counts reflect the change." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the user clicks Cancel (or Reject) on a New / Confirmed order" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens a Cancel dialog asking the user to select a reason from: Out of Stock, Delivery Issue, Pricing Error, Other; the dialog has Confirm Cancellation and Go Back actions." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the user selects Other as the reason" },
    { key: "When", value: "the dialog renders" },
    { key: "Then", value: "a free-text textarea is shown; the user must enter at least one non-empty character before Confirm Cancellation is enabled." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the user has selected a reason and clicks Confirm Cancellation" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the order's status is set to Rejected with the chosen reason persisted; the dialog closes; the Orders list / tab counts reflect the change." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the user clicks Go Back inside the Cancel dialog" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the dialog closes with no change to the order's state." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the user clicks Mark as Delivered on a Confirmed order" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system requests confirmation, then sets the order's status to Delivered (terminal); the action bar disappears; the order moves to the Delivered tab." },
  ]),
  ...acBlock("AC-10", [
    { key: "Given", value: "the order is acted on by another session while open in this one" },
    { key: "When", value: "the user clicks an action" },
    { key: "Then", value: "the system surfaces a concurrency error with a Reload action; the user must reload before retrying." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Allowed transitions are exactly: New -> Confirmed; New -> Rejected; Confirmed -> Delivered; Confirmed -> Rejected. No other transitions are allowed."],
      ["BR-2", "Delivered and Rejected are terminal states; no further actions are allowed."],
      ["BR-3", "Reject (from New) and Cancel (from Confirmed) both require a reason. Allowed reasons: Out of Stock, Delivery Issue, Pricing Error, Other."],
      ["BR-4", "When reason = Other, a free-text comment is required (non-empty after trim)."],
      ["BR-5", "Confirm Order does NOT require a reason; the system may optionally ask for a confirmation prompt."],
      ["BR-6", "Mark as Delivered does NOT require a reason; [NEEDS INPUT] confirm whether a delivery date / time is captured at this step (current bulk-action UI captures dispatch date / time \u2014 confirm whether single-order Mark Delivered does the same)."],
      ["BR-7", "Cancellation reason and Other comment are persisted on the order and visible in the Rejected-tab read view."],
      ["BR-8", "Concurrency: actions are guarded against stale state \u2014 the order's expected current status is sent with the action and rejected by the server if it does not match (Phase 1 implementation: optimistic concurrency)."],
      ["BR-9", "[NEEDS INPUT] Whether actions taken on the Seller Store propagate back to the originating channel (ONDC, marketplaces) and on what cadence."],
    ],
    [1, 9],
  ),
  subBanner("Action Permissions by Status"),
  makeTable(
    ["Status", "Modify Items (OR-04)", "Confirm", "Reject / Cancel (with reason)", "Mark as Delivered"],
    [
      ["New", "Yes", "Yes", "Yes (Reject)", "No"],
      ["Confirmed", "Yes", "No", "Yes (Cancel)", "Yes"],
      ["Delivered", "No", "No", "No", "No"],
      ["Rejected", "No", "No", "No", "No"],
    ],
    [3, 3, 3, 4, 4],
  ),
  subBanner("Cancel / Reject Reason Specification"),
  makeTable(
    ["Reason", "Free-text comment", "When to use"],
    [
      ["Out of Stock", "Optional", "The seller cannot fulfill due to inventory."],
      ["Delivery Issue", "Optional", "Inability to deliver to the buyer's location / pincode."],
      ["Pricing Error", "Optional", "The order was placed at a price the seller cannot honour."],
      ["Other", "Required (non-empty after trim)", "Anything else; the comment is mandatory so the audit trail is meaningful."],
    ],
    [3, 3, 6],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller Admin clicks Confirm twice quickly", "Second click is suppressed (button disabled while action in flight); only one transition is recorded."],
      ["2", "Seller Admin selects Other and leaves the comment empty", "Confirm Cancellation remains disabled until the comment has at least one non-whitespace character."],
      ["3", "Seller Admin opens a stale order page (status changed elsewhere) and clicks an action", "Concurrency error surfaced with Reload (per BR-8 / AC-10)."],
      ["4", "Seller Admin tries to Confirm a New order that has been rejected on the channel side", "Server rejects with a clear error; client refreshes the order to its true state."],
      ["5", "Seller Admin clicks Mark as Delivered without dispatching first", "[NEEDS INPUT] confirm whether dispatch is gated upstream or whether Mark as Delivered is unconditionally allowed in Phase 1."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-ORDA-01", "Action API timeout", "\"This is taking longer than usual. Please try again.\"", "Re-enable button; allow retry."],
      ["ERR-ORDA-02", "Action API server error", "\"Could not update the order. Please retry.\"", "Re-enable button; allow retry."],
      ["ERR-ORDA-03", "Concurrent state change", "\"This order was updated elsewhere. Reload to see the latest status.\"", "Offer Reload."],
      ["ERR-ORDA-04", "Required reason missing on Cancel", "\"Please select a reason.\" / \"Please describe the reason.\"", "Block submit."],
      ["ERR-ORDA-05", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (audit fields written on action)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["status", "Enum", "Yes", "Updated to the new state per BR-1.", "Action."],
      ["statusUpdatedAt", "DateTime", "Yes", "Server timestamp at action.", "Auto."],
      ["statusUpdatedBy", "String", "Yes", "User ID of the Seller Admin who performed the action.", "Session."],
      ["cancelReason", "Enum", "Required on Reject / Cancel", "One of Out of Stock | Delivery Issue | Pricing Error | Other.", "User input."],
      ["cancelComment", "String", "Required when reason = Other", "Non-empty after trim.", "User input."],
      ["deliveredAt", "DateTime", "Required on Mark as Delivered", "Server timestamp [NEEDS INPUT \u2014 confirm whether user can override].", "Auto / user input."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin opens an order on the Detail page.",
    "2. System renders the action bar based on the order's current status.",
    "3. [DECISION] Seller Admin clicks an action:",
    "   IF Modify Items:           Open Modify mode (OR-04).",
    "   IF Confirm Order:          Confirm prompt -> set status = Confirmed -> reload action bar.",
    "   IF Cancel / Reject:        Open Cancel dialog -> select reason (+ comment if Other) -> Confirm Cancellation",
    "                              -> set status = Rejected with reason / comment persisted -> close dialog -> reload page.",
    "   IF Mark as Delivered:      Confirm prompt -> set status = Delivered -> action bar disappears (terminal).",
    "4. Refresh tab counts and the order row in the list on next render.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Action Bar by Status)"),
  ...wireframeBlock([
    "New status:",
    "    [ Modify Items ]   [ Cancel ]   [ Confirm Order ]",
    "",
    "Confirmed status:",
    "    [ Modify Items ]   [ Cancel ]   [ Mark as Delivered ]",
    "",
    "Delivered / Rejected status:",
    "    (no action bar \u2014 read-only)",
    "",
    "Cancel dialog (modal):",
    "\u251c\u2500 Title: \"Cancel order?\"",
    "\u251c\u2500 Body: short copy explaining the order will move to Rejected.",
    "\u251c\u2500 Reason picker (radio buttons):",
    "\u2502   ( ) Out of Stock",
    "\u2502   ( ) Delivery Issue",
    "\u2502   ( ) Pricing Error",
    "\u2502   ( ) Other  (when selected, free-text textarea below \u2014 required)",
    "\u2514\u2500 Footer: [ Go Back ]   [ Confirm Cancellation ]",
  ]),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Reason picker", "Required on Cancel / Reject.", "\"Please select a reason.\"", "On-submit"],
      ["Other comment", "Required when reason = Other; non-empty after trim.", "\"Please describe the reason.\"", "On-submit"],
    ],
    [3, 5, 5, 2],
  ),
];

// =====================================================================
// OR-04 — Modify Items
// =====================================================================
const or04 = [
  ...storyBanner("USER STORY 4", "Orders \u2014 Modify Items Flow (Editable Quantity / Price with QPS Re-evaluation)",
    "Epic: Seller Admin \u2014 Orders   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Orders \u2014 Modify Items Flow (Editable Quantity / Price with QPS Re-evaluation)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Orders"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 modification is essential when stock is short, prices have shifted, or the buyer's quantity has to be adjusted before fulfillment."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 adjusting an order's items before fulfillment."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Sometimes a seller cannot honour the buyer's exact order: a SKU is partially out of stock, a price has moved, or " +
    "a quantity has to be trimmed. Modify Items lets the Seller Admin edit per-item quantity and unit price inline. " +
    "As quantity changes, the system re-evaluates which QPS slab the new quantity falls into and recomputes both " +
    "Customer Pays and the line total live. The previous (pre-edit) values are shown next to the editable fields so " +
    "the seller can see what they're changing. A Save Changes confirmation dialog presents the diff before commit, " +
    "so the seller has one final review before the order is updated."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "A 60-unit order is at the 48+ QPS slab with 10% off. The seller has stock for 40 units only.",
    "Seller Admin clicks Modify Items, edits the quantity from 60 to 40; the QPS badge re-evaluates to the 12\u201347 slab (5% off); the unit price preview reflects the new effective price; the line total recomputes. The seller clicks Save Changes; the diff dialog shows quantity 60 -> 40, slab 48+ -> 12\u201347, total \u20b9X -> \u20b9Y, and the seller clicks Apply.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "edit per-item quantity and unit price inline with live QPS slab re-evaluation and a confirmation diff",
    "I can adjust an order to match real fulfilment constraints without leaving the detail page",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the order is in New or Confirmed state" },
    { key: "When", value: "the Seller Admin clicks Modify Items" },
    { key: "Then", value: "the items table enters edit mode \u2014 Quantity and Unit Price fields become editable inline; the action bar switches to: Discard Changes | Save Changes." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "edit mode is on" },
    { key: "When", value: "the Seller Admin types a new Quantity" },
    { key: "Then", value: "the row re-evaluates the QPS slab in real time; the QPS badge updates to reflect the slab the new quantity falls into; the line Total recomputes from new Quantity \u00d7 effective unit price; the order Total in the footer recomputes." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "edit mode is on" },
    { key: "When", value: "the Seller Admin types a new Unit Price" },
    { key: "Then", value: "the row's Total recomputes; the order Total recomputes; the QPS badge does NOT change (slabs are quantity-driven, not price-driven)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "edit mode is on" },
    { key: "When", value: "the user inspects an editable row" },
    { key: "Then", value: "for both Quantity and Unit Price the previous (pre-edit) value is shown next to the input as a \"was <original>\" label, so the seller can see what they're changing." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the new quantity falls outside any QPS slab for that SKU" },
    { key: "When", value: "the row re-evaluates" },
    { key: "Then", value: "the QPS badge is removed and a small note indicates \"No QPS slab applies at this quantity\"; the unit price reverts to the SKU's base Selling Price (no discount)."},
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Seller Admin enters Quantity 0 or negative" },
    { key: "When", value: "validation runs" },
    { key: "Then", value: "the row shows an inline error \"Quantity must be a positive whole number.\"; Save Changes is blocked." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Seller Admin enters Unit Price 0 or negative" },
    { key: "When", value: "validation runs" },
    { key: "Then", value: "the row shows an inline error \"Unit price must be greater than 0.\"; Save Changes is blocked." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Seller Admin clicks Discard Changes" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "all unsaved edits are reverted to the persisted values; edit mode exits; the original action bar (per OR-03) returns." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "validation passes and the Seller Admin clicks Save Changes" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "a Save Changes confirmation dialog opens listing every modified item with Original \u2192 New for Quantity, Unit Price, Total (and the new QPS slab if changed); plus the Order Value Original \u2192 New." },
  ]),
  ...acBlock("AC-10", [
    { key: "Given", value: "the Save Changes dialog is open" },
    { key: "When", value: "the Seller Admin clicks Apply" },
    { key: "Then", value: "the modifications are persisted; the dialog closes; edit mode exits; the order detail re-renders with the updated values; the order's status remains New or Confirmed (Modify does NOT change status)." },
  ]),
  ...acBlock("AC-11", [
    { key: "Given", value: "the Save Changes dialog is open" },
    { key: "When", value: "the Seller Admin clicks Cancel" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the dialog closes; the user remains in edit mode with their pending changes intact." },
  ]),
  ...acBlock("AC-12", [
    { key: "Given", value: "the order is in Delivered or Rejected state" },
    { key: "When", value: "the user views the order" },
    { key: "Then", value: "the Modify Items button is not shown; the items table is read-only." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Modify Items is allowed only when status is New or Confirmed."],
      ["BR-2", "Modify does NOT change the order's status; the order stays in its current state with updated items."],
      ["BR-3", "Editable per item: Quantity (positive integer > 0) and Unit Price (decimal > 0). Product Name and SKU Code are read-only."],
      ["BR-4", "QPS slab evaluation runs on every Quantity change; the row's effective unit price (Customer Pays) is taken from the matched slab when one applies, else from the SKU's base Selling Price."],
      ["BR-5", "The line Total = effective unit price \u00d7 quantity. The order Total = sum of all line totals. Both recompute live in edit mode."],
      ["BR-6", "Previous values (pre-edit) are shown next to each editable field as a \"was X\" hint."],
      ["BR-7", "Removing a line item entirely (quantity = 0) is NOT supported in Phase 1 \u2014 to drop a SKU from the order, the seller must Cancel the whole order. [NEEDS INPUT] confirm."],
      ["BR-8", "Stock availability is shown for context but is NOT a blocking validation in Phase 1 (per OR-02 BR-6)."],
      ["BR-9", "Save Changes opens a confirmation dialog that shows the full diff (Original \u2192 New) before commit. Apply commits; Cancel returns to edit mode."],
      ["BR-10", "Discard Changes from edit mode reverts to the last persisted values; no confirmation required if no edits were made."],
      ["BR-11", "[NEEDS INPUT] Whether modifications propagate back to the originating channel (ONDC / marketplace) and how the buyer is notified."],
    ],
    [1, 9],
  ),
  subBanner("QPS Re-evaluation Algorithm"),
  P("On every Quantity change in edit mode, the system runs the following lookup against the SKU's active QPS scheme (sourced from Seller Admin US-10 / US-11):"),
  ...workflowBlock([
    "1. Find the SKU's active scheme (status Active, within validity).",
    "2. [DECISION] Active scheme exists?",
    "   IF no:    Effective unit price = SKU.SellingPrice; remove QPS badge; EXIT.",
    "   ELSE:     Iterate slabs in order.",
    "3. Find the slab where quantity falls between MinQty and MaxQty (inclusive; last slab may be open-ended).",
    "4. [DECISION] Match found?",
    "   IF yes:   Effective unit price = slab.CustomerPays (Flat or computed from Percent).",
    "             Render QPS badge: \"Slab N \u00b7 minQty\u2013maxQty \u00b7 discount label\".",
    "   IF no:    Effective unit price = SKU.SellingPrice; remove QPS badge.",
    "5. Line Total = effective unit price \u00d7 quantity. Order Total = sum of line totals.",
  ]),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller Admin reduces quantity from 60 to 40 \u2014 slab changes from 48+ (10% off) to 12\u201347 (5% off)", "Badge updates to the new slab; effective unit price increases; line / order total recomputes; Save Changes diff shows both values changing."],
      ["2", "Seller Admin reduces quantity to 5 (below first slab Min 1\u201311)", "Slab 1 still matches if MinQty=1; if no slab matches, no QPS badge \u2014 fall back to SKU base price."],
      ["3", "Seller Admin increases unit price above SKU's MRP", "[NEEDS INPUT] confirm: hard block (Selling Price < MRP rule from US-06), or warn-and-allow on Modify Items."],
      ["4", "Seller Admin enters a non-numeric value into Quantity or Unit Price", "Inline error; Save Changes blocked."],
      ["5", "Seller Admin saves a Modify with no actual change", "Apply is a no-op; close dialog; show \"No changes to save\" toast (or silently dismiss)."],
      ["6", "QPS scheme has been deactivated since the order was placed", "[NEEDS INPUT] confirm: keep the original slab / pricing snapshot, or re-evaluate using the current (no-scheme) state."],
      ["7", "Seller Admin opens Modify on a stale order that has changed status elsewhere", "Concurrency error per OR-03 BR-8; Reload action."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-ORDM-01", "Save API timeout", "\"Save is taking longer than usual. Please try again.\"", "Keep edit mode; preserve inputs; allow retry."],
      ["ERR-ORDM-02", "Save API server error", "\"Could not save changes. Please retry.\"", "Keep edit mode; allow retry."],
      ["ERR-ORDM-03", "Validation failure on Save", "Per-row inline messages.", "Block save."],
      ["ERR-ORDM-04", "Concurrent state change (order moved to terminal status elsewhere)", "\"This order was updated elsewhere. Reload to see the latest status.\"", "Offer Reload."],
      ["ERR-ORDM-05", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Per-item editable fields)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["editableQuantity", "Integer", "Yes", "> 0; positive whole number.", "User input."],
      ["editablePricePerUnit", "Decimal", "Yes", "> 0; [NEEDS INPUT] precision.", "User input."],
      ["isModified", "Boolean", "Auto", "True if either editableQuantity or editablePricePerUnit differs from the original.", "Computed."],
      ["effectiveUnitPrice (display)", "Decimal", "Auto", "From matched QPS slab (Customer Pays) or SKU base price.", "Computed."],
      ["totalPrice (display)", "Decimal", "Auto", "= effectiveUnitPrice \u00d7 editableQuantity.", "Computed."],
      ["qps.slabLabel (display)", "String", "Optional", "e.g., \"Slab 2\". Hidden when no slab matches.", "Computed."],
      ["qps.discountLabel (display)", "String", "Optional", "e.g., \"5% off vs \u20b9171/unit\". Hidden when no slab matches.", "Computed."],
      ["qps.savingPerUnit (display)", "Decimal", "Optional", "= base price \u2212 effectiveUnitPrice.", "Computed."],
      ["qps.totalSaving (display)", "Decimal", "Optional", "= savingPerUnit \u00d7 editableQuantity.", "Computed."],
    ],
    [4, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin opens Order Detail; order is in New or Confirmed.",
    "2. Seller Admin clicks Modify Items.",
    "3. Items table enters edit mode; action bar becomes: Discard Changes | Save Changes.",
    "4. Seller Admin edits Quantity and / or Unit Price per row.",
    "5. On every Quantity change: re-evaluate QPS slab; recompute effective unit price, line total, order total.",
    "6. On every Unit Price change: recompute line total, order total (no QPS re-evaluation).",
    "7. [DECISION] Seller Admin clicks an action:",
    "   IF Discard Changes:    Revert all edits; exit edit mode; show original action bar.",
    "   IF Save Changes:       Validate per BR-3 / AC-6 / AC-7.",
    "8. [DECISION] Validation result:",
    "   IF invalid: Show inline errors; remain in edit mode.",
    "   ELSE:       Open Save Changes diff dialog.",
    "9. [DECISION] Seller Admin clicks an action in the diff dialog:",
    "   IF Cancel:  Close dialog; remain in edit mode with pending changes.",
    "   IF Apply:   Persist changes -> close dialog -> exit edit mode -> re-render Detail with updated values.",
    "10. Order's status does NOT change as part of Modify (BR-2).",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Items Table in Edit Mode)"),
  ...wireframeBlock([
    "Items Table \u2014 EDIT MODE",
    "\u251c\u2500 Header: Product Name | SKU Code | Quantity | Unit Price | Total | (no actions per row)",
    "\u2514\u2500 Per row:",
    "    Product Name (read-only)  | SKU Code (read-only)",
    "    Quantity input            \"was 60\"",
    "    Unit Price input          \"was \u20b9165\"",
    "    Total (computed)          \"was \u20b9X\"",
    "    QPS badge (re-evaluates live): \"Slab 2 \u00b7 12\u201347 qty \u00b7 5% off vs \u20b9171/unit\"",
    "    Saving line: \"\u20b9N saved on this item\"  (when QPS applies)",
    "",
    "Footer: aggregated savings + Order Total (computed live)",
    "Action Bar: [ Discard Changes ]   [ Save Changes ]",
    "",
    "Save Changes dialog:",
    "\u251c\u2500 Title: \"Confirm Modifications\"",
    "\u251c\u2500 Body: list of modified items showing Original \u2192 New (Qty, Unit Price, Total)",
    "\u2502   Plus: Order Value Original \u2192 New",
    "\u2514\u2500 Footer: [ Cancel ]   [ Apply ]",
  ]),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Quantity", "Required; positive integer > 0.", "\"Quantity must be a positive whole number.\"", "On-blur / on-save"],
      ["Unit Price", "Required; decimal > 0; [NEEDS INPUT] confirm cap vs SKU MRP.", "\"Unit price must be greater than 0.\"", "On-blur / on-save"],
      ["Modify itself", "At least one row must be modified to enable Save Changes.", "\u2014", "On-render"],
    ],
    [3, 5, 5, 2],
  ),
];

// =====================================================================
// OR-05 — Bulk Actions
// =====================================================================
const or05 = [
  ...storyBanner("USER STORY 5", "Orders \u2014 Bulk Actions (Multi-select Confirm / Reject / Mark Delivered)",
    "Epic: Seller Admin \u2014 Orders   |   Priority: Medium   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Orders \u2014 Bulk Actions (Multi-select Confirm / Reject / Mark Delivered)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Orders"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Medium \u2014 saves the seller from clicking through each order one-by-one when many are alike."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 processing many orders of the same kind at once."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "When the seller has 30 routine orders to confirm in the morning, doing it one-by-one is a waste. Bulk Actions " +
    "let the Seller Admin select multiple orders on the New tab and Confirm or Reject them in one shot, or select " +
    "multiple orders on the Confirmed tab and Mark them all as Delivered. The action prompt for bulk operations " +
    "captures any required metadata (dispatch date / time, notes for delivery; reason for reject) once and applies " +
    "it across the selection."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "20 routine orders have come in overnight. The seller can fulfill them all.",
    "Seller Admin opens the New tab, clicks the header checkbox to select all 20 orders, clicks Bulk Confirm, fills any required dispatch fields once, and confirms \u2014 all 20 orders move to Confirmed in one operation.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "select multiple orders on the New or Confirmed tab and run Confirm, Reject, or Mark as Delivered in bulk",
    "I can process routine workloads efficiently",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin is on the New or Confirmed tab" },
    { key: "When", value: "the table renders" },
    { key: "Then", value: "each row has a selection checkbox; the table header has a select-all checkbox that selects all rows on the current page." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Seller Admin selects one or more orders on the New tab" },
    { key: "When", value: "the selection is non-empty" },
    { key: "Then", value: "a Bulk Action bar appears showing: \"N selected\", [Bulk Confirm], [Bulk Reject], [Clear selection]." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin selects one or more orders on the Confirmed tab" },
    { key: "When", value: "the selection is non-empty" },
    { key: "Then", value: "a Bulk Action bar appears showing: \"N selected\", [Bulk Mark as Delivered], [Bulk Cancel], [Clear selection]." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin clicks Bulk Confirm" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "a dialog opens collecting any required dispatch metadata (dispatch date / time, notes); on confirm, every selected order transitions New \u2192 Confirmed with the metadata recorded." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Seller Admin clicks Bulk Reject (or Bulk Cancel)" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "a dialog opens asking for a reason from the canonical set (Out of Stock, Delivery Issue, Pricing Error, Other); on confirm, every selected order transitions to Rejected with the reason recorded." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Seller Admin clicks Bulk Mark as Delivered" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "a dialog opens collecting any required delivery metadata (delivery date / time, notes \u2014 [NEEDS INPUT] confirm fields); on confirm, every selected order transitions Confirmed \u2192 Delivered with the metadata recorded." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "a bulk action affects N orders, some succeed and some fail (partial result)" },
    { key: "When", value: "the bulk job completes" },
    { key: "Then", value: "the system surfaces a summary toast / dialog: \"Updated: X | Failed: Y\" with a downloadable per-order error list. Orders that failed retain their previous status; successful ones reflect the new status." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Seller Admin clicks Clear selection" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "all checkboxes clear; the Bulk Action bar disappears." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the Seller Admin switches tabs while a selection is active" },
    { key: "When", value: "the new tab renders" },
    { key: "Then", value: "the selection is cleared (selections do NOT persist across tabs)." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Bulk Actions are exposed only on the New and Confirmed tabs."],
      ["BR-2", "Allowed bulk transitions: New \u2192 Confirmed (Bulk Confirm); New \u2192 Rejected (Bulk Reject); Confirmed \u2192 Delivered (Bulk Mark as Delivered); Confirmed \u2192 Rejected (Bulk Cancel)."],
      ["BR-3", "Reasons for Bulk Reject / Bulk Cancel use the same canonical set as OR-03 (Out of Stock / Delivery Issue / Pricing Error / Other; Other requires a free-text comment)."],
      ["BR-4", "Bulk Confirm and Bulk Mark as Delivered may collect dispatch / delivery metadata once and apply it to every selected order."],
      ["BR-5", "Selections are scoped to the current tab; switching tabs clears the selection."],
      ["BR-6", "Select-all on a page selects only the rows on that page (not all rows across pagination). [NEEDS INPUT] confirm whether a \"select across all pages\" option is desired."],
      ["BR-7", "Bulk operations are applied atomically per order \u2014 a failure on order X does not roll back orders Y / Z that already succeeded."],
      ["BR-8", "[NEEDS INPUT] Maximum bulk size per action (e.g., 200 orders); current code does not enforce a hard cap \u2014 confirm for product safety."],
      ["BR-9", "[NEEDS INPUT] Whether bulk Cancel / Reject also requires a comment when the reason is anything other than Other (e.g., to give richer audit trails)."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "User selects 50 orders across pages and clicks Bulk Confirm", "Selection is scoped to the current page only (per BR-6); clarify with the user before action."],
      ["2", "One of the selected orders has been moved to a terminal state by another session", "That order is reported as failed in the partial-result summary; the other orders proceed."],
      ["3", "User triggers a Bulk Action while another bulk job is in flight", "[NEEDS INPUT] confirm: queue or block."],
      ["4", "Reason = Other on Bulk Reject, comment is empty", "Block the action (per OR-03 BR-4)."],
      ["5", "User has zero selections and tries to click a bulk button (button is disabled)", "Buttons are disabled; clicking is a no-op."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-ORDB-01", "Bulk action API timeout", "\"This is taking longer than usual. Please try again.\"", "Keep selection; allow retry."],
      ["ERR-ORDB-02", "Bulk action API server error", "\"Could not complete the bulk action. Please retry.\"", "Keep selection; allow retry."],
      ["ERR-ORDB-03", "Partial failure", "\"Updated: X | Failed: Y. See details.\"", "Show downloadable per-order error list; refresh successful orders in the list."],
      ["ERR-ORDB-04", "Required reason / metadata missing", "Per-field message.", "Block submit."],
      ["ERR-ORDB-05", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin opens the Orders list on the New or Confirmed tab.",
    "2. Seller Admin selects one or more orders via checkboxes (or Select-all on the page).",
    "3. Bulk Action bar appears with the actions allowed for that tab.",
    "4. [DECISION] Seller Admin clicks an action:",
    "   IF Bulk Confirm:                Open dispatch metadata dialog -> confirm -> bulk transition to Confirmed.",
    "   IF Bulk Reject / Bulk Cancel:   Open reason dialog -> select reason (+ comment if Other) -> confirm -> bulk transition to Rejected.",
    "   IF Bulk Mark as Delivered:      Open delivery metadata dialog -> confirm -> bulk transition to Delivered.",
    "   IF Clear selection:             Clear checkboxes; hide bar; EXIT.",
    "5. System processes per-order; tracks successes and failures.",
    "6. On completion: show summary (Updated / Failed); refresh affected rows; clear selection.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Bulk Action Bar)"),
  ...wireframeBlock([
    "Bulk Action Bar (visible only when selection > 0 on New / Confirmed tab):",
    "    [\u2713] N selected   |   per-tab actions   |   [ Clear selection ]",
    "",
    "On the New tab:",
    "    [ Bulk Confirm ]   [ Bulk Reject ]",
    "",
    "On the Confirmed tab:",
    "    [ Bulk Mark as Delivered ]   [ Bulk Cancel ]",
    "",
    "Bulk Confirm dialog:",
    "\u251c\u2500 Title: \"Confirm N orders\"",
    "\u251c\u2500 Body: dispatch fields (date, time, notes) \u2014 [NEEDS INPUT] confirm full field set",
    "\u2514\u2500 Footer: [ Cancel ]   [ Confirm All ]",
    "",
    "Bulk Reject / Cancel dialog:",
    "\u251c\u2500 Title: \"Reject N orders\"",
    "\u251c\u2500 Reason picker (radio buttons; Other reveals a textarea)",
    "\u2514\u2500 Footer: [ Cancel ]   [ Reject All ]",
    "",
    "Bulk Mark as Delivered dialog:",
    "\u251c\u2500 Title: \"Mark N orders as Delivered\"",
    "\u251c\u2500 Delivery fields (date, time, notes) \u2014 [NEEDS INPUT]",
    "\u2514\u2500 Footer: [ Cancel ]   [ Mark All as Delivered ]",
  ]),
];

// =====================================================================
// Open Questions
// =====================================================================
const openQuestions = [
  H1("Open Questions for the Next Walkthrough Session"),
  num("Default sort order within each tab (List); state preservation across navigation."),
  num("Export \u2014 confirm allowed file formats (CSV / XLSX / both); whether export honours the active filter chips or only the date range."),
  num("Marketplace canonical list \u2014 confirm beyond ONDC / Amazon / Flipkart / Direct."),
  num("Mark as Delivered \u2014 single-order: capture dispatch / delivery date / time fields? (Bulk action UI captures these; confirm parity for the single-order path.)"),
  num("Modify Items \u2014 whether a unit price above MRP is hard-blocked or warn-and-allow; precision rule on Unit Price; behaviour when QPS scheme has been deactivated since order placement; whether deleting a line (qty=0) is supported."),
  num("Whether actions taken on the Seller Store propagate back to the originating channel (ONDC / marketplaces) and how the buyer is notified, especially after Modify."),
  num("Bulk \u2014 maximum bulk size; cross-page \"select all\" option; concurrent bulk-job policy; whether Bulk Cancel reasons require a comment for non-Other reasons."),
  num("Concurrency model: optimistic concurrency vs server-driven \"current-status\" guard."),
  num("Returns / refunds and partial shipment \u2014 confirm Phase 2 timing and scope."),
];

// =====================================================================
// ASSEMBLE
// =====================================================================
const doc = new Document({
  creator: "Omkar Charankar",
  title: "Qwipo Seller Store \u2014 Orders User Stories (Phase 1)",
  description: "User stories for the Orders module (Seller Admin persona), Phase 1.",
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
              new TextRun({ text: "Qwipo Seller Store \u2014 Orders User Stories (Phase 1)", color: COLOR_MUTED, size: 18 }),
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
        ...lifecycle,
        ...indexChildren,
        ...or01,
        ...or02,
        ...or03,
        ...or04,
        ...or05,
        ...openQuestions,
      ],
    },
  ],
});

const outPath = path.join(__dirname, "..", "Seller-Store-Orders-User-Stories-Phase1.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote:", outPath);
});
