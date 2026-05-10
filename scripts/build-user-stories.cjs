// Build the Seller Store user stories Word document.
// Run with: node scripts/build-user-stories.cjs
//
// Style follows the Qwipo Seller App User Stories v1.0 reference document:
// - Cover metadata table
// - Document Scope & Note to Reviewer
// - Personas Overview table
// - Left Navigation table
// - Story Index table
// - Per-story: Section 1 (Field/Value table), Section 2 (WHY + persona + metrics + scenario),
//   Section 3 (User Story sentence, AC-N blocks, BR-N table, Edge Cases, Error Scenarios with
//   module-prefixed codes, Data Specification, Workflow with [DECISION]),
//   Section 4 (Wireframe ASCII tree, User Flow, Field Validations, Empty States, Error Messages).
// - Open Questions for next walkthrough.
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
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2; // 10080 dxa

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

function PR(runs, opts = {}) {
  return new Paragraph({
    children: runs,
    spacing: { before: opts.before ?? 60, after: opts.after ?? 60 },
    alignment: opts.alignment,
    pageBreakBefore: opts.pageBreakBefore,
    indent: opts.indent,
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

function num(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    children: [new TextRun({ text })],
    spacing: { before: 40, after: 40 },
  });
}

function mono(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Consolas", size: 18, color: opts.color || "000000" })],
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
      shading: ri % 2 === 1
        ? { fill: ZEBRA_FILL, type: ShadingType.CLEAR, color: "auto" }
        : undefined,
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
          shading: ri % 2 === 1
            ? { fill: ZEBRA_FILL, type: ShadingType.CLEAR, color: "auto" }
            : undefined,
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
  for (const line of lines) {
    out.push(mono(line, { shade: true, before: 0, after: 0 }));
  }
  return out;
}

function wireframeBlock(lines) {
  return lines.map(l => mono(l, { shade: true, before: 0, after: 0 }));
}

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

function needsInput(reason) {
  return new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "[NEEDS INPUT] ", bold: true, color: COLOR_RED, size: 20 }),
      new TextRun({ text: "\u2014 " + reason, italics: true, color: COLOR_MUTED, size: 20 }),
    ],
  });
}

// =====================================================================
// CONTENT
// =====================================================================

const coverChildren = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1800, after: 100 },
    children: [new TextRun({ text: "QWIPO SELLER STORE", bold: true, size: 56, color: COLOR_PRIMARY })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
    children: [new TextRun({ text: "Seller Admin \u2014 Phase 1", bold: true, size: 36, color: COLOR_ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
    children: [new TextRun({ text: "User Story Specifications", italics: true, size: 28, color: COLOR_MUTED })],
  }),
  metaTable([
    ["Document Type", "User Story Specifications"],
    ["Module", "Seller Admin \u2014 Dashboard, My SKU, SKU Detail, Customers & Offers / Schemes"],
    ["Persona", "Seller Admin (Distributor)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Total Stories", "11 (US-01 through US-11)"],
    ["Version", "0.8 \u2014 Draft (links ONDC rule catalog v1.0 from US-05 BR-12)"],
    ["Companion Document", "Seller-Store-ONDC-SKU-Validation-Rules.docx (v1.0) \u2014 canonical V-001 \u2192 V-033 catalog referenced by US-03 and US-05."],
    ["Date", "28 April 2026"],
    ["Status", "In Progress \u2014 additional pages pending"],
    ["Document Owner", "Omkar Charankar"],
  ]),
];

const scopeChildren = [
  H1("Document Scope & Note to Reviewer"),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "This document captures user stories for the Qwipo Seller Store \u2014 Seller Admin persona. With v0.7, the Dashboard, " +
        "My SKU, Customers and Offers & Schemes modules are considered closed out and ready for development. Coverage " +
        "includes: the Phase 1 Dashboard landing page; the My SKU list page; the two Bulk Import flows (Add SKUs stub " +
        "creation and Update Price and Stock) with confirmed validation rules (ERR_IMP_001\u2013004, ERR_PSU_001\u2013004); the " +
        "SKU Detail page (Product Details + Price & Inventory tabs); the Customers module (list page with KPI cards, detail " +
        "page with map, auto-create-on-first-order backend workflow); and the Offers & Schemes module \u2014 QPS list page " +
        "with KPI cards / search / status filter / per-status row actions, and the Create QPS Offer dialog enforcing 1\u20134 " +
        "monotonic non-overlapping slabs with Flat Price / Percentage Discount validation. Stories for Orders, Settings, and " +
        "Support modules will be added in subsequent revisions as the product walkthrough continues."
      }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "GUARDRAILS: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Wherever a business rule, threshold, or flow detail has not yet been specified, the placeholder " }),
      new TextRun({ text: "[NEEDS INPUT]", bold: true, color: COLOR_RED }),
      new TextRun({ text:
        " is used in line with the prompt template's guardrails \u2014 no rules have been invented. Sections that do not " +
        "apply to a given story are marked " }),
      new TextRun({ text: "[NOT APPLICABLE]", bold: true, color: COLOR_MUTED }),
      new TextRun({ text: " with a one-line reason." }),
    ],
  }),
];

const personasChildren = [
  H1("Personas Overview"),
  makeTable(
    ["Persona", "Role", "Goal", "Pain Point"],
    [
      ["Super Admin", "Platform-level administrator", "Onboard and manage Seller Admin accounts on the Qwipo Seller Store",
        "[NEEDS INPUT] Specific Super Admin pain points / responsibilities beyond seller creation"],
      ["Seller Admin", "Distributor using the Seller Store",
        "Manage products (SKUs), pricing, inventory, offers, and orders end-to-end from a single workspace",
        "Currently no unified view; product, pricing and stock updates require multiple tools or manual coordination"],
    ],
    [3, 4, 5, 5],
  ),
];

const navChildren = [
  H1("Seller Admin \u2014 Left Navigation (Phase 1)"),
  P("On successful login, the Seller Admin lands on the Home page. The persistent left-side menu contains the following items, in order:"),
  makeTable(
    ["#", "Menu Item", "Phase 1 Status", "Notes"],
    [
      ["1", "Dashboard", "Phase 1 Landing", "Static \"Coming Soon\" hero plus quick-link tiles to the four Phase 1 modules; full analytics dashboard deferred to a later phase"],
      ["2", "My SKU", "In Scope", "List of all products created by the distributor; covered in this document"],
      ["3", "Customers", "In Scope", "List page with KPI cards / search / filter / export, detail page with map, auto-create on first order; covered by US-07, US-08, US-09"],
      ["4", "Offers & Schemes", "In Scope", "QPS list page (KPI cards / search / status filter / row actions) and Create QPS dialog (1\u20134 slabs); covered by US-10, US-11"],
      ["5", "Orders", "[NEEDS INPUT]", "Seller Admin views incoming orders; details pending"],
      ["6", "Settings", "[NEEDS INPUT]", "Functionality to be detailed"],
      ["7", "Support", "[NEEDS INPUT]", "Functionality to be detailed"],
    ],
    [1, 4, 3, 7],
  ),
];

const indexChildren = [
  H1("Story Index"),
  makeTable(
    ["#", "Story Title", "Module", "Priority", "Dependency", "Status"],
    [
      ["US-01", "Phase 1 Dashboard Landing Page with Quick-Link Modules", "Dashboard", "Medium", "None", "Ready for Dev"],
      ["US-02", "View and Browse My SKU List Page", "My SKU", "High", "None", "Ready for Dev"],
      ["US-03", "Bulk Import \u2014 Add SKUs (Stub Creation)", "My SKU", "High", "US-02", "Ready for Dev"],
      ["US-04", "Bulk Import \u2014 Update Price and Stock", "My SKU", "High", "US-02, US-03", "Ready for Dev"],
      ["US-05", "SKU Detail \u2014 Product Details Tab (DMS / ONDC)", "SKU Detail", "High", "US-02", "Ready for Dev"],
      ["US-06", "SKU Detail \u2014 Price & Inventory Tab", "SKU Detail", "High", "US-02, US-05", "Ready for Dev"],
      ["US-07", "Customers \u2014 List Page (KPI Cards, Search, Filter, Export)", "Customers", "High", "US-09", "Ready for Dev"],
      ["US-08", "Customers \u2014 Detail Page (Basic Info, Address, Business Info, Map)", "Customers", "High", "US-07", "Ready for Dev"],
      ["US-09", "Customers \u2014 Auto-Create on First Order (Backend Workflow)", "Customers", "Critical", "Orders module", "Ready for Dev"],
      ["US-10", "Offers & Schemes \u2014 List Page (KPI Cards, Search, Filter, Row Actions)", "Offers & Schemes", "High", "US-02", "Ready for Dev"],
      ["US-11", "Offers & Schemes \u2014 Create QPS Offer Dialog", "Offers & Schemes", "High", "US-10", "Ready for Dev"],
    ],
    [2, 6, 3, 2, 3, 4],
  ),
];

// ---------- USER STORY 1 ----------
const us01 = [
  ...storyBanner(
    "USER STORY 1",
    "Phase 1 Dashboard Landing Page with Quick-Link Modules",
    "Epic: Seller Admin Navigation   |   Priority: Medium   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Phase 1 Dashboard Landing Page with Quick-Link Modules"],
    ["Epic / Feature Link", "Seller Admin Navigation \u2014 Phase 1"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Medium \u2014 the Dashboard is the post-login landing page; it must set Phase 1 expectations and route users to the available modules in one click."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor using the Seller Store post-login."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "The Seller Admin lands on the Dashboard immediately after login. Full dashboard analytics (KPIs, smart insights, " +
    "recent-orders feed, charts) are not part of Phase 1 \u2014 they are deferred to a later phase. Instead of a blank or " +
    "broken landing screen, the Dashboard must (1) clearly communicate that analytics are coming in a later phase and " +
    "(2) surface the four Phase 1 modules that ARE available, each as a one-click navigation tile. This turns the empty " +
    "moment into an actionable next step and prevents the user from feeling lost."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor using the Seller Store",
      "Land on a working home page that tells me what's available and routes me into work",
      "Blank or vague landing screens waste a click; without a clear next step the user has to hunt through the left nav"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Click-through rate from a Dashboard tile to one of the four Phase 1 modules \u2014 target above 60% of Dashboard sessions."),
  num("Dashboard renders with zero JS / route errors \u2014 target 100% of sessions."),
  num("Support tickets related to \"Dashboard is empty / I don't know where to start\" \u2014 target 0 in Phase 1."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Phase 1 has no dashboard widgets built. A bare \"Coming Soon\" page would tell users what is missing but not where to go next. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin logs in and lands on the Dashboard. A hero block explains that analytics are not in Phase 1, and " +
        "an \"Available now in Phase 1\" panel below it shows four tiles (My SKU, Orders, Customers, Offers & Schemes). " +
        "Clicking any tile takes the user directly to that module. A subtle \"Contact support\" link gives an escape hatch " +
        "for feedback or urgent metric requests."
      }),
    ],
  }),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "land on a Phase 1 Dashboard that explains what's coming and gives me one-click access to the modules that exist today",
    "I'm never stuck on an empty home page \u2014 I always have a clear next action",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin successfully logs into the Seller Store" },
    { key: "When", value: "the application loads" },
    { key: "Then", value: "the user is routed to /dashboard by default and the Dashboard item in the left navigation is marked as active." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Seller Admin is on the Dashboard" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "the hero block is shown with: a rocket icon (gradient blue \u2192 purple), a \"Coming Soon\" badge, the heading \"Dashboard is on the way\", and the body copy explaining that Sales KPIs, smart insights, recent-orders feed and other dashboard visualisations are not part of Phase 1 and will be released in a later phase." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin is on the Dashboard" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "the \"Available now in Phase 1\" card is shown below the hero, containing exactly four navigation tiles in this order: 1) My SKU, 2) Orders, 3) Customers, 4) Offers & Schemes." },
    { key: "And", value: "each tile shows: a module icon (left), the module label (bold), a short description, and a chevron-right indicator (right)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin clicks the My SKU tile" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the system navigates to /products/my-sku and the My SKU item in the left navigation becomes active." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Seller Admin clicks the Orders tile" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the system navigates to /orders and the Orders item in the left navigation becomes active." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Seller Admin clicks the Customers tile" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the system navigates to /customers and the Customers item in the left navigation becomes active." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Seller Admin clicks the Offers & Schemes tile" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the system navigates to /offers and the Offers & Schemes item in the left navigation becomes active." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Seller Admin sees the footer line below the Available Now card" },
    { key: "When", value: "the user clicks the \"Contact support\" link" },
    { key: "Then", value: "the system navigates to /support." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the Seller Admin is on the Dashboard placeholder" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "no API calls are made, no spinners are shown, and no analytics widgets render \u2014 the page is fully static." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Dashboard is the default landing route after login (path: /dashboard)."],
      ["BR-2", "The Phase 1 Dashboard is fully static \u2014 no data fetch, no widgets, no charts, no spinners."],
      ["BR-3", "The hero block content is fixed copy: heading \"Dashboard is on the way\"; body \"Sales KPIs, smart insights, recent-orders feed and other dashboard visualisations are not part of Phase 1. They will be released in a later phase. In the meantime, jump straight into the modules below.\""],
      ["BR-4", "The \"Available now in Phase 1\" card lists exactly four modules in this fixed order: My SKU \u2192 Orders \u2192 Customers \u2192 Offers & Schemes."],
      ["BR-5", "Settings and Support are intentionally NOT shown as quick-link tiles \u2014 they are utility pages reachable from the left navigation only."],
      ["BR-6", "Each quick-link tile must be a single click and must navigate to the canonical route (see AC-4 \u2192 AC-7)."],
      ["BR-7", "The footer line \"Have feedback or need a metric urgently? Contact support\" is shown below the card; the link points to /support."],
      ["BR-8", "If the canonical Phase 1 module list changes (e.g., a new module is added or a module is renamed), this story is the source of truth and must be revised before the change ships."],
      ["BR-9", "[NEEDS INPUT] Should the placeholder include an estimated launch date or a \"Notify me\" CTA in a future iteration?"],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "User refreshes the Dashboard page", "Page re-renders the static placeholder identically; no errors; no API calls."],
      ["2", "User opens /dashboard URL directly (deep link)", "Placeholder loads; left navigation marks Dashboard active; no auth bypass."],
      ["3", "User has a slow network connection", "Static content loads as plain HTML \u2014 no spinner since there is no data fetch."],
      ["4", "User keyboard-tabs through the page", "Tile order matches AC-3 (My SKU \u2192 Orders \u2192 Customers \u2192 Offers & Schemes); each tile is reachable and activatable with Enter / Space."],
      ["5", "User accesses the Dashboard on a small viewport (mobile / narrow window)", "Tiles stack to 1 column instead of 2; hero block remains centred and readable; left nav collapses per existing app shell rules."],
      ["6", "User clicks the icon area of a tile (not the label)", "The whole tile is clickable \u2014 not just the label \u2014 and routes to the same destination."],
      ["7", "Future module is added in a later phase (e.g., Reports)", "[NEEDS INPUT] confirm whether new modules are added to this list automatically or require an explicit story update (per BR-8 the latter is currently the policy)."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  notApplicable("Static placeholder with no data fetch, no API calls, and no user input. There are no failure modes beyond standard page-load failures handled by the application shell."),
  subBanner("Data Specification"),
  notApplicable("No data fields, no inputs, no persistence in Phase 1."),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin logs in successfully.",
    "2. System routes the user to /dashboard (default landing route) and marks Dashboard active in the left navigation.",
    "3. System renders the static hero block (rocket icon, Coming Soon badge, heading, body copy).",
    "4. System renders the \"Available now in Phase 1\" card with four tiles in fixed order: My SKU, Orders, Customers, Offers & Schemes.",
    "5. System renders the footer line with the Contact support link.",
    "6. [DECISION] Seller Admin chooses an action:",
    "   IF clicks a tile (My SKU / Orders / Customers / Offers & Schemes):  Navigate to the corresponding route per AC-4..AC-7.",
    "   IF clicks Contact support:                                          Navigate to /support per AC-8.",
    "   IF clicks a left-nav item:                                          Navigate to that module's route.",
    "   IF refreshes / does nothing:                                         Page re-renders identically; no API calls.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Dashboard (Phase 1 Landing)",
    "\u251c\u2500 App Shell Header (global \u2014 logo, notification bell, profile menu)",
    "\u251c\u2500 Left Navigation (global \u2014 Dashboard active)",
    "\u2514\u2500 Main Content Area (centered, max width ~3xl, soft blue \u2192 white \u2192 purple gradient bg)",
    "    \u251c\u2500 Hero Block (centered)",
    "    \u2502   \u251c\u2500 Rocket icon tile (gradient blue \u2192 purple, rounded, shadow)",
    "    \u2502   \u251c\u2500 \"Coming Soon\" badge (amber, with clock icon)",
    "    \u2502   \u251c\u2500 H1: \"Dashboard is on the way\"",
    "    \u2502   \u2514\u2500 Body copy: \"Sales KPIs, smart insights, recent-orders feed and other dashboard",
    "    \u2502         visualisations are not part of Phase 1. They will be released in a later phase.",
    "    \u2502         In the meantime, jump straight into the modules below.\"",
    "    \u251c\u2500 \"Available now in Phase 1\" Card (border, soft shadow)",
    "    \u2502   \u251c\u2500 Section label: \"AVAILABLE NOW IN PHASE 1\"",
    "    \u2502   \u2514\u2500 Tile Grid (2 cols on desktop, 1 col on mobile)",
    "    \u2502       \u251c\u2500 Tile: [Package icon]  My SKU              \"Manage your catalog and ONDC details\"   \u203a",
    "    \u2502       \u251c\u2500 Tile: [Cart icon]     Orders              \"View and manage incoming orders\"        \u203a",
    "    \u2502       \u251c\u2500 Tile: [Users icon]    Customers           \"Customer list, filters and exports\"     \u203a",
    "    \u2502       \u2514\u2500 Tile: [Tag icon]      Offers & Schemes    \"Quantity Pricing Schemes (QPS)\"         \u203a",
    "    \u2514\u2500 Footer line (small, muted): \"Have feedback or need a metric urgently? Contact support\"",
    "          (Contact support is a link to /support)",
  ]),
  subBanner("Quick-Link Tile Specification"),
  makeTable(
    ["Tile #", "Label", "Description", "Icon", "Target Route"],
    [
      ["1", "My SKU", "Manage your catalog and ONDC details", "Package", "/products/my-sku"],
      ["2", "Orders", "View and manage incoming orders", "ShoppingCart", "/orders"],
      ["3", "Customers", "Customer list, filters and exports", "Users", "/customers"],
      ["4", "Offers & Schemes", "Quantity Pricing Schemes (QPS)", "Tag", "/offers"],
    ],
    [2, 4, 6, 3, 5],
  ),
  subBanner("User Flow"),
  num("Seller Admin logs in."),
  num("System lands user on /dashboard with Dashboard active in the left nav."),
  num("Hero block + Available Now card + Contact support footer render."),
  num("Seller Admin clicks any tile \u2192 navigates to that module's route (per AC-4 \u2192 AC-7)."),
  num("Alternatively, Seller Admin clicks Contact support \u2192 navigates to /support."),
  num("Alternatively, Seller Admin clicks any left-nav item \u2192 navigates to that route; Dashboard is no longer active."),
  num("BACK PATH: Browser back from a destination page returns to the Dashboard with the same static content."),
  subBanner("Field Validations"),
  notApplicable("No input fields on this page."),
  subBanner("Empty States"),
  notApplicable("The page is itself a permanent Phase 1 placeholder; \"empty\" is its intended state. There are no list / collection components that can be empty."),
  subBanner("Error Messages"),
  notApplicable("No error conditions specific to this page."),
];

// ---------- USER STORY 2 ----------
const us02 = [
  ...storyBanner(
    "USER STORY 2",
    "View and Browse My SKU List Page",
    "Epic: Seller Admin \u2014 Product Catalog Management   |   Priority: High   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "View and Browse My SKU List Page"],
    ["Epic / Feature Link", "Seller Admin \u2014 Product Catalog Management"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 central screen the Seller Admin uses to manage their entire product catalog"],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor responsible for SKUs, pricing, and stock"],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "The Seller Admin's day-to-day work revolves around the products they sell. The My SKU page is the single source of " +
    "truth for every product the distributor has created \u2014 it is the entry point for adding products, updating pricing and " +
    "stock, and verifying ONDC compliance. Without a clear, searchable, and paginated list with the right at-a-glance columns " +
    "(status, ONDC compliance, last updated), the admin must hunt through external sheets to find any single SKU, which slows " +
    "down catalog hygiene and delays buyer-facing updates."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor using the Seller Store",
      "Quickly find any SKU, see its status, and act on it (view, update pricing/stock)",
      "Catalog data lives in spreadsheets and disconnected tools; locating a single SKU and confirming its ONDC-readiness takes too long"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Median time to locate a specific SKU (via search) \u2014 target under 5 seconds."),
  num("Page load time for the My SKU list \u2014 target P95 under 2 seconds for up to 25 records."),
  num("Adoption: % of seller admins who view the My SKU page at least once per week \u2014 [NEEDS INPUT] target."),
  num("Reduction in support tickets about \"can't find my product\" \u2014 [NEEDS INPUT] baseline and target."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "A distributor manages 200+ SKUs in external spreadsheets and a separate ERP. To check whether a specific SKU is " +
        "ONDC-compliant or to see when its price was last updated, they cross-reference multiple sources \u2014 taking 5\u201310 minutes per SKU. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "The seller admin opens My SKU, types the brand or SKU code in the search bar, and sees the matching row with status, " +
        "ONDC compliance and last-updated time at a glance. They click View on the action column to drill into details. The whole " +
        "flow takes under 30 seconds."
      }),
    ],
  }),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "view, search, filter and paginate through all my created SKUs in a single list",
    "I can quickly locate any product and see its key status information at a glance",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin has at least one SKU created" },
    { key: "When", value: "the user navigates to \"My SKU\" from the left menu" },
    { key: "Then", value: "the system displays a paginated list with the columns: SKU Code, SKU Name, Brand, Category, Status, ONDC Compliance Status, Last Updated, and Action." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Seller Admin is a brand-new user with zero SKUs created (first-time use)" },
    { key: "When", value: "the user navigates to \"My SKU\"" },
    { key: "Then", value: "the system shows the empty state for the list (no rows, no pagination footer)." },
    { key: "And", value: "the Filter and Bulk Import controls remain visible and usable so the user can start adding SKUs." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the SKU list contains more than 25 records" },
    { key: "When", value: "the page first loads" },
    { key: "Then", value: "the system shows only the first 25 records and renders Previous (disabled) and Next (enabled) pagination controls." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the user is on a page other than the first" },
    { key: "When", value: "the user clicks Previous or Next" },
    { key: "Then", value: "the system loads the corresponding 25-record page; the disabled state of Previous/Next is updated based on whether the user is on the first or last page." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the user enters a value in the search input" },
    { key: "When", value: "the user submits the search (or after debounce on input)" },
    { key: "Then", value: "the system filters the list to rows where SKU name, SKU code OR brand name contains the search term (case-insensitive); pagination resets to page 1." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the user clicks Bulk Import" },
    { key: "When", value: "the dropdown / menu opens" },
    { key: "Then", value: "the system shows two options: \"Add SKUs\" and \"Upload Price and Stock\"." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the user clicks the View action on any row" },
    { key: "When", value: "the action is triggered" },
    { key: "Then", value: "the system navigates to the SKU detail page for that record. [NEEDS INPUT] confirm exact destination and detail-page contract." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Page size is fixed at 25 records per page in Phase 1 (no user-configurable page size)."],
      ["BR-2", "Pagination controls are limited to Previous and Next in Phase 1 \u2014 no jump-to-page or last-page shortcut."],
      ["BR-3", "Search matches against three fields only: SKU name, SKU code, brand name (case-insensitive, contains-match)."],
      ["BR-4", "The list shows only SKUs created by the logged-in Seller Admin \u2014 no cross-tenant visibility."],
      ["BR-5", "[NEEDS INPUT] Default sort order of the list (e.g., Last Updated descending? SKU Name ascending?)."],
      ["BR-6", "[NEEDS INPUT] Exact filter criteria available behind the Filter button (status, category, ONDC compliance, brand, etc.)."],
      ["BR-7", "[NEEDS INPUT] Allowed values for the Status column (e.g., Active, Inactive, Draft) and for the ONDC Compliance Status column (e.g., Compliant, Non-Compliant, Pending Review)."],
      ["BR-8", "[NEEDS INPUT] Minimum search input length and debounce duration."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Brand-new user with zero SKUs lands on My SKU", "Empty state is shown; Filter and Bulk Import remain visible so the user can start adding SKUs."],
      ["2", "Search returns zero matches", "Show \"No SKUs match your search\" with a Clear Search CTA; pagination footer hidden."],
      ["3", "User has exactly 25 SKUs", "Page 1 shows all 25; Previous and Next are both disabled."],
      ["4", "User has 26 SKUs and is on page 2", "Page 2 shows 1 record; Previous enabled, Next disabled."],
      ["5", "User clears search after viewing a filtered page", "List resets to unfiltered state and pagination resets to page 1."],
      ["6", "Slow network \u2014 list takes >2s to load", "Show a loading state on the table area; navigation, search and bulk import remain interactive after data arrives."],
      ["7", "User opens Bulk Import while on page 2 of results", "Menu opens normally; pagination and search context are preserved on the underlying list."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-SKU-01", "API timeout while loading SKU list", "\"Unable to load SKUs. Please retry.\"",
        "Show retry CTA on the table area; log error; preserve filters and search state for the retry."],
      ["ERR-SKU-02", "Search API returns 5xx", "\"Search is temporarily unavailable. Please try again.\"",
        "Keep previously loaded list visible; show non-blocking toast."],
      ["ERR-SKU-03", "Pagination request fails", "\"Could not load the next page. Please retry.\"",
        "Keep current page visible; offer retry; log error with page number."],
      ["ERR-SKU-04", "Session expired while on the list page", "\"Your session has expired. Please log in again.\"",
        "Redirect to login; preserve target URL so the user returns to My SKU after login."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (List Columns)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["SKU Code", "String", "Yes", "Unique per seller; alphanumeric; [NEEDS INPUT] max length", "From SKU master record"],
      ["SKU Name", "String", "Yes", "Non-empty; [NEEDS INPUT] max length", "From SKU master record"],
      ["Brand", "String", "Yes", "[NEEDS INPUT] enum from brand master vs free text", "From SKU master record"],
      ["Category", "String", "Yes", "[NEEDS INPUT] enum from category master", "From SKU master record"],
      ["Status", "Enum", "Yes", "[NEEDS INPUT] allowed values (e.g., Active, Inactive, Draft)", "Set by system / admin actions"],
      ["ONDC Compliance Status", "Enum", "Yes", "[NEEDS INPUT] allowed values (e.g., Compliant, Non-Compliant, Pending)", "Set by ONDC compliance check"],
      ["Last Updated", "DateTime", "Yes", "ISO 8601; auto-populated on any SKU update", "System timestamp"],
      ["Action", "Control", "Yes", "View button always visible; [NEEDS INPUT] additional actions", "UI control"],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow: Browse SKU List"),
  ...workflowBlock([
    "1. Seller Admin clicks \"My SKU\" in the left navigation.",
    "2. System fetches the first 25 SKUs for the current seller (default sort).",
    "3. [DECISION] Does the seller have any SKUs?",
    "   IF no:  Show empty state; keep Filter and Bulk Import visible; EXIT.",
    "   ELSE:   Render the table with the 8 defined columns; show pagination footer; proceed to step 4.",
    "4. User can now perform any of the following actions in any order:",
    "   4a. Type in the Search input -> list filters by SKU name / code / brand; pagination resets to page 1.",
    "   4b. Click Filter -> opens filter panel ([NEEDS INPUT] criteria) and refreshes the list on apply.",
    "   4c. Click Bulk Import -> menu opens with two options: Add SKUs (US-03) or Upload Price and Stock (US-04).",
    "   4d. Click Previous / Next -> system loads the previous / next page of 25 records.",
    "   4e. Click the View action on any row -> system navigates to the SKU detail page for that record.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: My SKU \u2014 List View",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (My SKU active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header",
    "    \u2502   \u2514\u2500 Title: \"My SKU\"",
    "    \u251c\u2500 Action Bar (top-right cluster)",
    "    \u2502   \u251c\u2500 Search Input  (placeholder: \"Search by SKU name, code or brand\")",
    "    \u2502   \u251c\u2500 [Filter] button",
    "    \u2502   \u2514\u2500 [Bulk Import \u25be] split button -> { Add SKUs | Upload Price and Stock }",
    "    \u251c\u2500 Data Table (8 columns)",
    "    \u2502   SKU Code | SKU Name | Brand | Category | Status | ONDC Compliance | Last Updated | Action",
    "    \u2502   Status & ONDC Compliance render as colour-coded badges",
    "    \u2502   Action column = [View] icon button per row",
    "    \u2514\u2500 Pagination Footer",
    "        [Previous]    Page X of Y    [Next]    (max 25 rows per page)",
  ]),
  subBanner("User Flow"),
  num("Seller Admin clicks My SKU in the left navigation."),
  num("System loads the first page (25 records) of the seller's SKUs."),
  num("User optionally types in the search box \u2192 list filters in real-time (debounced)."),
  num("User optionally clicks Filter \u2192 applies additional criteria \u2192 list refreshes."),
  num("User clicks Previous / Next to navigate pages."),
  num("User clicks View on any row \u2192 navigates to the SKU detail page."),
  num("BACK PATH: User clicks browser back or My SKU in the nav \u2192 returns to the list with last applied search / filter / page state preserved. [NEEDS INPUT] confirm state-preservation requirement."),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Search input", "Max 100 chars; [NEEDS INPUT] min length to trigger", "\"Enter at least N characters\"", "On-input (debounced)"],
      ["Pagination \u2014 Previous", "Disabled on page 1", "\u2014", "On-render"],
      ["Pagination \u2014 Next", "Disabled on the last page", "\u2014", "On-render"],
      ["Bulk Import menu", "Opens only on click; closes on outside click or Esc", "\u2014", "On-click"],
    ],
    [3, 5, 4, 2],
  ),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["My SKU list \u2014 first-time user (zero SKUs)", "You haven't added any SKUs yet. Add your first product to start selling.", "\"Bulk Import\" / [NEEDS INPUT] confirm primary CTA"],
      ["My SKU list \u2014 search returns no matches", "No SKUs match your search. Try a different term.", "\"Clear Search\""],
      ["My SKU list \u2014 filter returns no matches", "No SKUs match the selected filters.", "\"Clear Filters\""],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR-SKU-01", "Unable to load SKUs. Please retry.", "GET /skus failed: <statusCode> <correlationId>"],
      ["ERR-SKU-02", "Search is temporarily unavailable. Please try again.", "GET /skus/search failed: <statusCode> <query>"],
      ["ERR-SKU-03", "Could not load the next page. Please retry.", "Pagination request failed: page=<n> <statusCode>"],
      ["ERR-SKU-04", "Your session has expired. Please log in again.", "401 Unauthorized on /skus; redirect to login"],
    ],
    [3, 6, 5],
  ),
];

// ---------- USER STORY 3 ----------
const us03 = [
  ...storyBanner(
    "USER STORY 3",
    "Bulk Import \u2014 Add SKUs (Stub Creation)",
    "Epic: Seller Admin \u2014 Product Catalog Management   |   Priority: High   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Bulk Import \u2014 Add SKUs (Stub Creation)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Product Catalog Management"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 primary mechanism for seller admins to seed their SKU stubs in bulk before per-SKU ONDC enrichment."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor onboarding tens to hundreds of SKUs at once."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Distributors typically manage their catalog in spreadsheets and ERPs and cannot reasonably create hundreds of SKUs " +
    "one row at a time through a UI form. Bulk Import \u2192 Add SKUs lets a Seller Admin upload a structured file containing " +
    "only SKU Code and SKU Name. The system creates one SKU stub per valid row. All other ONDC attributes (Item Code, " +
    "Thumbnail, Descriptions, Measure Unit/Value, Commerce Attributes, Consumer Care, Country of Origin, Brand, etc.) are " +
    "filled in per-SKU on the SKU Detail page (US-05) and validated on Save against ONDC rules V-001 \u2192 V-033. This split " +
    "keeps the bulk path fast and forgiving while ONDC-grade validation lives where it belongs."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor onboarding their catalog",
      "Seed many SKU stubs at once from a structured file, then enrich each on the detail page",
      "Manual one-by-one creation is too slow; needs a fast, low-friction path that does not require ONDC data up front"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Time to seed 100 SKU stubs via Bulk Import \u2014 target under 5 minutes."),
  num("% of rows that import cleanly on first try \u2014 target above 95%."),
  num("Reduction in support tickets related to bulk SKU creation \u2014 [NEEDS INPUT] target."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "A new Seller Admin needs to onboard their 250-SKU catalog. Without bulk import, they must create each SKU through " +
        "the UI one at a time, taking days. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "The admin clicks Bulk Import \u2192 Add SKUs, downloads the sample template, fills the SKU Code and SKU Name columns, " +
        "uploads the file, sees a validation summary, and the valid SKU stubs appear at the top of the My SKU list, ready to be " +
        "enriched on the SKU Detail page. Invalid rows are returned with a per-row error code so the admin can fix and re-upload."
      }),
    ],
  }),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "bulk-upload a file with SKU Code and SKU Name to seed multiple SKU stubs at once",
    "I can onboard my catalog quickly and then enrich each SKU with ONDC details on its detail page",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin is on the My SKU list page" },
    { key: "When", value: "the user clicks Bulk Import \u2192 Add SKUs" },
    { key: "Then", value: "the system opens the Add SKUs upload screen with two visible actions: a Download Sample Template button and an Upload File control." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Seller Admin clicks Download Sample Template" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system downloads the canonical template containing only the SKU Code and SKU Name columns (with header row and a sample row)." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin uploads a file with one or more valid rows" },
    { key: "When", value: "the system finishes processing" },
    { key: "Then", value: "each valid row is created as a new SKU stub with only SKU Code and SKU Name populated; the SKU is flagged as Not ONDC Compliant pending enrichment on the SKU Detail page." },
    { key: "And", value: "the system shows a summary: Created: X | Failed: Y, with the per-row failures and their error codes." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the upload contains a mix of valid and invalid rows" },
    { key: "When", value: "the system finishes validation" },
    { key: "Then", value: "valid rows are created (partial commit) and invalid rows are returned in the error report with their ERR_IMP_xxx code; the Seller Admin can fix and re-upload only the failed rows." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the upload completes successfully (one or more SKUs created)" },
    { key: "When", value: "the Seller Admin closes the upload screen" },
    { key: "Then", value: "the system returns to the My SKU list page with the newly created SKU stubs shown at the top of the list (sorted by Last Updated descending)." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the upload contains rows where SKU Code is missing or has invalid characters" },
    { key: "When", value: "row-level validation runs" },
    { key: "Then", value: "those rows are rejected with code ERR_IMP_001 and the message \"SKU Code is required and must contain only letters, digits, dashes or underscores.\"" },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the upload contains rows where SKU Name is missing or outside 3\u2013100 characters" },
    { key: "When", value: "row-level validation runs" },
    { key: "Then", value: "those rows are rejected with code ERR_IMP_002 and the message \"SKU Name is required and must be 3\u2013100 characters.\"" },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the upload contains the same SKU Code on more than one row in the file" },
    { key: "When", value: "row-level validation runs" },
    { key: "Then", value: "all duplicate occurrences are rejected with code ERR_IMP_003 and the message \"Duplicate SKU Code in this file.\"" },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the upload contains a SKU Code that already exists in the seller's catalog" },
    { key: "When", value: "row-level validation runs" },
    { key: "Then", value: "the row is rejected with code ERR_IMP_004 and the message \"SKU Code already exists in catalog \u2014 use the Price & Stock Update flow to modify it.\"" },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Only two columns are imported: SKU Code and SKU Name. The Add SKUs flow creates SKU stubs only \u2014 it never sets ONDC fields."],
      ["BR-2", "All other ONDC fields (Item Code, Thumbnail, Descriptions, Measure Unit / Value, Commerce Attributes, Consumer Care, Country of Origin, Brand, etc.) are filled per-SKU on the SKU Detail page (US-05) and validated on Save against ONDC rules V-001 \u2192 V-033."],
      ["BR-3", "SKU Code is unique per seller. Duplicates within the file are rejected (ERR_IMP_003); SKU Codes already in the seller's catalog are rejected (ERR_IMP_004)."],
      ["BR-4", "SKU Code allowed character set: letters (A\u2013Z, a\u2013z), digits (0\u20139), dashes (-) and underscores (_). No spaces or other punctuation."],
      ["BR-5", "SKU Name length: 3\u2013100 characters."],
      ["BR-6", "Partial commit is allowed: valid rows are created even when other rows in the same file fail validation."],
      ["BR-7", "Newly created SKUs default to Status = Active and ONDC Compliance = Not ONDC Compliant (with the missing-field count populated by the SKU Detail page on first compute)."],
      ["BR-8", "The Download Sample Template button always serves the current canonical template (header row plus one example row)."],
      ["BR-9", "On successful upload, the user is returned to the My SKU list page with newly created SKUs at the top (Last Updated descending)."],
      ["BR-10", "[NEEDS INPUT] Supported file formats (e.g., .xlsx, .csv) and the maximum rows per upload."],
      ["BR-11", "[NEEDS INPUT] Whether the upload is processed synchronously (UI waits) or asynchronously (background job + notification)."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Empty file (header row only, no data rows)", "Reject with \"File contains no data rows\"; no SKUs created."],
      ["2", "SKU Code present but contains spaces or special characters", "Row rejected with ERR_IMP_001."],
      ["3", "SKU Name is exactly 2 characters or exactly 101 characters", "Row rejected with ERR_IMP_002 (length range is 3\u2013100 inclusive)."],
      ["4", "Same SKU Code appears 3 times in the file", "All 3 occurrences are rejected with ERR_IMP_003."],
      ["5", "Uploaded SKU Code matches an existing catalog SKU Code", "Row rejected with ERR_IMP_004; user is told to use Update Price & Stock to modify it."],
      ["6", "User closes the upload screen mid-validation", "[NEEDS INPUT] confirm cancellation behaviour \u2014 abort or continue in background."],
      ["7", "All rows in the file are invalid", "No SKUs created; show summary Created: 0 | Failed: N with the error report."],
      ["8", "File uses a different encoding (e.g., UTF-16)", "Reject with a clear encoding-error message; advise UTF-8 / use the sample template."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR_IMP_001", "SKU Code missing or contains characters outside [A\u2013Z, a\u2013z, 0\u20139, -, _]", "\"SKU Code is required and must contain only letters, digits, dashes or underscores.\"", "Reject row; record in error report; continue processing other rows."],
      ["ERR_IMP_002", "SKU Name missing or length outside 3\u2013100", "\"SKU Name is required and must be 3\u2013100 characters.\"", "Reject row; record in error report; continue."],
      ["ERR_IMP_003", "Duplicate SKU Code within the same file", "\"Duplicate SKU Code in this file.\"", "Reject all duplicate occurrences; record in error report."],
      ["ERR_IMP_004", "SKU Code already exists in the seller's catalog", "\"SKU Code already exists in catalog \u2014 use the Price & Stock Update flow to modify it.\"", "Reject row; record in error report; continue."],
      ["ERR_IMP_010", "Unsupported file format / corrupt file", "\"Only [supported formats] are allowed. Use the sample template.\"", "Reject upload at file-level validation; no rows processed."],
      ["ERR_IMP_011", "File exceeds row limit", "\"File exceeds the maximum allowed rows.\"", "Reject upload at file-level validation; no rows processed."],
      ["ERR_IMP_099", "Server error during processing", "\"Import failed. Please retry.\"", "Roll back any in-flight commits; log error; allow retry."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Add SKUs template)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["SKU Code", "String", "Yes", "Allowed chars: letters, digits, dashes, underscores; unique per seller; not already in catalog (ERR_IMP_001 / 003 / 004).", "User input via file."],
      ["SKU Name", "String", "Yes", "Length 3\u2013100 characters (ERR_IMP_002).", "User input via file."],
    ],
    [3, 2, 2, 6, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin opens My SKU and clicks Bulk Import \u2192 Add SKUs.",
    "2. System opens the Add SKUs upload screen with: Download Sample Template button + Upload File control.",
    "3. (Optional) Seller Admin clicks Download Sample Template -> system serves the canonical template (SKU Code, SKU Name).",
    "4. Seller Admin selects a file and clicks Upload.",
    "5. [DECISION] File-level validation (format, size, header presence, row count > 0):",
    "   IF invalid:  Reject with ERR_IMP_010 / 011 / encoding error; EXIT.",
    "   ELSE:        Proceed to row-level validation.",
    "6. For each row, run validations in order:",
    "   - SKU Code present and matches allowed character set      -> else ERR_IMP_001",
    "   - SKU Name present and length 3-100                       -> else ERR_IMP_002",
    "   - SKU Code not duplicated within this file                -> else ERR_IMP_003",
    "   - SKU Code not already in seller's catalog                -> else ERR_IMP_004",
    "7. Persist all valid rows as SKU stubs (Status = Active, ONDC Compliance = Not Compliant pending detail-page enrichment).",
    "8. Show summary: Created: X | Failed: Y, with downloadable error report (row #, SKU Code, error code, message).",
    "9. Seller Admin closes the screen -> system returns to My SKU list with newly created SKUs at the top (Last Updated desc).",
    "10. Seller Admin clicks View on any new SKU -> SKU Detail page (US-05) for ONDC enrichment against rules V-001 -> V-033.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Bulk Import \u2014 Add SKUs",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (My SKU active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header",
    "    \u2502   \u251c\u2500 Back to My SKU breadcrumb",
    "    \u2502   \u2514\u2500 Title: \"Bulk Import \u2014 Add SKUs\"",
    "    \u251c\u2500 Step 1: Download Sample Template",
    "    \u2502   \u2514\u2500 Body: short instruction + [ Download Sample ] button",
    "    \u251c\u2500 Step 2: Upload File",
    "    \u2502   \u2514\u2500 Body: drag-drop / file picker; supported format hint",
    "    \u251c\u2500 Validation Summary (after upload)",
    "    \u2502   \u251c\u2500 Pills: Created: X  |  Failed: Y",
    "    \u2502   \u2514\u2500 Error report table: Row # | SKU Code | Error Code | Message  +  [ Download Error Report ]",
    "    \u2514\u2500 Action Bar: [ Cancel ]   [ Done \u2192 Back to My SKU ]",
  ]),
  subBanner("User Flow"),
  num("Seller Admin opens My SKU and clicks Bulk Import \u2192 Add SKUs."),
  num("Seller Admin clicks Download Sample Template (optional) and fills the template offline."),
  num("Seller Admin clicks Upload File and selects the prepared file."),
  num("System validates and shows the summary; Seller Admin reviews errors (if any) and downloads the error report."),
  num("Seller Admin clicks Done \u2192 system returns to My SKU list with newly created SKUs at the top."),
  num("Seller Admin clicks View on a new SKU \u2192 SKU Detail page to start ONDC enrichment."),
  num("BACK / CANCEL PATH: Seller Admin clicks Cancel \u2192 returns to My SKU list; SKUs created in the current attempt remain (partial commit)."),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["File", "Required; supported format; non-empty data rows.", "\"Please upload a valid file using the sample template.\"", "On-submit"],
      ["SKU Code (per row)", "Required; allowed chars only; unique in file; not already in catalog.", "ERR_IMP_001 / 003 / 004 message per row.", "On row-validation"],
      ["SKU Name (per row)", "Required; length 3\u2013100.", "ERR_IMP_002 message per row.", "On row-validation"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Add SKUs \u2014 no file selected", "Drop your file here or click to browse. Use the sample template for guaranteed compatibility.", "\"Download Sample\""],
      ["Validation summary \u2014 zero failures", "All rows imported successfully.", "\"Done\""],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR_IMP_001", "SKU Code is required and must contain only letters, digits, dashes or underscores.", "import_add_sku_invalid_code: row=<n>"],
      ["ERR_IMP_002", "SKU Name is required and must be 3\u2013100 characters.", "import_add_sku_invalid_name: row=<n>"],
      ["ERR_IMP_003", "Duplicate SKU Code in this file.", "import_add_sku_duplicate_in_file: row=<n>, code=<sku>"],
      ["ERR_IMP_004", "SKU Code already exists in catalog \u2014 use the Price & Stock Update flow to modify it.", "import_add_sku_existing_in_catalog: row=<n>, code=<sku>"],
      ["ERR_IMP_010", "Only [supported formats] are allowed. Use the sample template.", "import_add_sku_unsupported_format"],
      ["ERR_IMP_011", "File exceeds the maximum allowed rows.", "import_add_sku_exceeds_row_limit"],
      ["ERR_IMP_099", "Import failed. Please retry.", "import_add_sku_server_error"],
    ],
    [3, 6, 5],
  ),
];

// ---------- USER STORY 4 ----------
const us04 = [
  ...storyBanner(
    "USER STORY 4",
    "Bulk Import \u2014 Update Price and Stock",
    "Epic: Seller Admin \u2014 Product Catalog Management   |   Priority: High   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Bulk Import \u2014 Update Price and Stock"],
    ["Epic / Feature Link", "Seller Admin \u2014 Product Catalog Management"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 pricing and stock are the most frequently changing data on a SKU and must be updatable in bulk."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor managing day-to-day price and inventory updates."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Once SKUs exist in the catalog (created via US-03 and enriched via US-05), the Seller Admin still needs to refresh " +
    "price and stock for many SKUs at once. Update Price and Stock is a focused bulk-update path: the Seller Admin " +
    "downloads the existing data (already populated with their current SKU IDs, names, brand, company, category, MRP, " +
    "Selling Price and Stock Available), edits the price / stock columns, uploads the file, and the matching SKUs are " +
    "updated. The flow never creates new SKUs and never modifies the descriptive columns \u2014 those are display-only."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor performing recurring price/stock updates",
      "Update price and stock for many existing SKUs in one upload",
      "Price and stock change frequently \u2014 updating each SKU through the UI is too slow to keep up"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Time to refresh price / stock for 100 SKUs \u2014 target under 5 minutes."),
  num("% of bulk price/stock updates completed without errors on first try \u2014 target above 95%."),
  num("Zero rows persisted with Selling Price >= MRP \u2014 enforced by validation."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "A distributor's MRP and stock figures change weekly. Updating 200 SKUs one-by-one through a UI form is impractical " +
        "and error-prone. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin clicks Bulk Import \u2192 Update Price and Stock, downloads the existing data (pre-filled with current " +
        "SKU IDs and price / stock), edits the price and stock columns, uploads the file, and the system shows: " +
        "\"180 SKUs updated, 20 failed \u2014 see error report.\" The Seller Admin is then returned to the My SKU list and can " +
        "open any SKU detail to verify the change."
      }),
    ],
  }),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "bulk-upload a file to update price and stock for many existing SKUs at once",
    "I can keep my catalog's pricing and inventory accurate without per-row editing",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin is on the My SKU list page" },
    { key: "When", value: "the user clicks Bulk Import \u2192 Update Price and Stock" },
    { key: "Then", value: "the system opens the Update Price and Stock screen with two visible actions: a Download Existing Data button and an Upload File control." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Seller Admin clicks Download Existing Data" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system downloads a file pre-populated with the seller's current SKUs and the columns: SKU ID, SKU Name, Brand, Company, Category (display-only), MRP, Selling Price, Stock Available." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin uploads a file with valid rows" },
    { key: "When", value: "the system finishes processing" },
    { key: "Then", value: "for each matched SKU the MRP, Selling Price and Stock Available are updated and the Last Updated timestamp is refreshed." },
    { key: "And", value: "the system shows a summary: Updated: X | Failed: Y, with the per-row failures and their error codes." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "a row's SKU ID does not match any existing SKU for the seller (or the SKU ID column has been altered / hampered)" },
    { key: "When", value: "row-level validation runs" },
    { key: "Then", value: "the row is rejected with code ERR_PSU_001 and the message \"SKU ID not found or has been altered \u2014 use the original downloaded file as the source of truth.\"" },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "a row's MRP or Selling Price is non-numeric, blank, or less than or equal to 0" },
    { key: "When", value: "row-level validation runs" },
    { key: "Then", value: "the row is rejected with code ERR_PSU_002 and the message \"MRP and Selling Price must be positive numeric values; decimals are allowed.\"" },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "a row's Selling Price is greater than or equal to MRP" },
    { key: "When", value: "row-level validation runs" },
    { key: "Then", value: "the row is rejected with code ERR_PSU_003 and the message \"Selling Price must be less than MRP.\"" },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "a row's Stock Available value is anything other than \"Yes\" or \"No\" (case-insensitive text)" },
    { key: "When", value: "row-level validation runs" },
    { key: "Then", value: "the row is rejected with code ERR_PSU_004 and the message \"Stock Available must be Yes or No (case-insensitive text only).\"" },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the upload completes (one or more SKUs updated)" },
    { key: "When", value: "the Seller Admin closes the upload screen" },
    { key: "Then", value: "the system returns to the My SKU list page and the affected SKUs reflect their new Last Updated timestamp; the Seller Admin can open any SKU's detail to verify the new MRP, Selling Price and Stock Available." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Update Price and Stock only updates existing SKUs. It NEVER creates new SKUs \u2014 that is US-03's responsibility."],
      ["BR-2", "SKU ID is the immutable matching key. If a row's SKU ID is missing, blank, or does not match any catalog SKU for this seller, the row is rejected (ERR_PSU_001). The Seller Admin is expected to use the file produced by Download Existing Data; manually changing the SKU ID column is treated as data tampering."],
      ["BR-3", "SKU Name, Brand, Company and Category are display-only columns in the downloaded file. They are present so the Seller Admin can visually identify rows. They are NEVER updated by this flow \u2014 the values in the uploaded file for these columns are ignored, and no validation is run on them."],
      ["BR-4", "MRP and Selling Price are numeric. Decimals are allowed. Both must be > 0. Selling Price MUST be strictly less than MRP."],
      ["BR-5", "Stock Available is text only and must be one of \"Yes\" or \"No\". Matching is case-insensitive (yes / Yes / YES and no / No / NO are all accepted). Any other value is rejected (ERR_PSU_004)."],
      ["BR-6", "Partial commit is allowed: valid rows are persisted even when other rows in the same file fail validation."],
      ["BR-7", "On successful upload, the user is returned to the My SKU list. The affected SKUs reflect their new Last Updated timestamp; the user can open any SKU's detail to verify the change."],
      ["BR-8", "[NEEDS INPUT] Currency, decimal precision and upper sanity limits for MRP and Selling Price."],
      ["BR-9", "[NEEDS INPUT] Supported file formats and the maximum rows per upload."],
      ["BR-10", "[NEEDS INPUT] Audit / history requirement \u2014 must each upload be logged with file, user, timestamp, and changed rows?"],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "File contains the same SKU ID on multiple rows", "[NEEDS INPUT] \u2014 confirm: reject duplicates, take last-row-wins, or take first-row-wins."],
      ["2", "Seller Admin manually deletes or edits the SKU ID column before uploading", "Affected rows fail with ERR_PSU_001; the Seller Admin must re-download via Download Existing Data."],
      ["3", "Seller Admin changes the display-only columns (SKU Name, Brand, Company, Category)", "Changes are ignored \u2014 those columns are not updated. No error is raised on those columns."],
      ["4", "Selling Price equals MRP (exactly)", "Row rejected with ERR_PSU_003 (rule is strictly less than)."],
      ["5", "MRP / Selling Price entered with thousand separators (e.g., \"1,200.50\")", "[NEEDS INPUT] \u2014 confirm whether thousand separators are stripped or whether the row is rejected."],
      ["6", "Stock Available value is blank", "Row rejected with ERR_PSU_004."],
      ["7", "Stock Available value is \"Y\" or \"N\" (single letter)", "Row rejected with ERR_PSU_004 (only the words Yes / No are accepted)."],
      ["8", "Seller Admin uploads while a previous Update Price and Stock job is still processing", "[NEEDS INPUT] \u2014 block, queue, or run concurrently."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR_PSU_001", "SKU ID missing, blank, or not matching any catalog SKU for this seller (data tampering)", "\"SKU ID not found or has been altered \u2014 use the original downloaded file as the source of truth.\"", "Reject row; record in error report; continue."],
      ["ERR_PSU_002", "MRP or Selling Price non-numeric, blank, or <= 0", "\"MRP and Selling Price must be positive numeric values; decimals are allowed.\"", "Reject row; record in error report; continue."],
      ["ERR_PSU_003", "Selling Price >= MRP", "\"Selling Price must be less than MRP.\"", "Reject row; record in error report; continue."],
      ["ERR_PSU_004", "Stock Available is not the text \"Yes\" or \"No\" (case-insensitive)", "\"Stock Available must be Yes or No (case-insensitive text only).\"", "Reject row; record in error report; continue."],
      ["ERR_PSU_010", "Unsupported file format / corrupt file", "\"Only [supported formats] are allowed. Use the file produced by Download Existing Data.\"", "Reject upload at file-level validation; no updates applied."],
      ["ERR_PSU_011", "File exceeds row limit", "\"File exceeds the maximum allowed rows.\"", "Reject upload at file-level validation; no updates applied."],
      ["ERR_PSU_099", "Server error during processing", "\"Update failed. Please retry.\"", "Roll back any in-flight commits; log error; allow retry."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Update Price and Stock template)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["SKU ID", "String", "Yes (matching key)", "Must match an existing catalog SKU for this seller; never edited by the user (ERR_PSU_001).", "Pre-populated by Download Existing Data."],
      ["SKU Name", "String", "Display-only", "No validation; ignored on update.", "Pre-populated; representational only."],
      ["Brand", "String", "Display-only", "No validation; ignored on update.", "Pre-populated; representational only."],
      ["Company", "String", "Display-only", "No validation; ignored on update.", "Pre-populated; representational only."],
      ["Category", "String", "Display-only", "No validation; ignored on update.", "Pre-populated; representational only."],
      ["MRP", "Decimal", "Yes", "Numeric; decimals allowed; > 0 (ERR_PSU_002).", "Pre-populated; user edits."],
      ["Selling Price", "Decimal", "Yes", "Numeric; decimals allowed; > 0; strictly less than MRP (ERR_PSU_003).", "Pre-populated; user edits."],
      ["Stock Available", "Text", "Yes", "Text only; one of \"Yes\" or \"No\" (case-insensitive) (ERR_PSU_004).", "Pre-populated; user edits."],
    ],
    [3, 2, 3, 6, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin opens My SKU and clicks Bulk Import \u2192 Update Price and Stock.",
    "2. System opens the Update Price and Stock screen with: Download Existing Data button + Upload File control.",
    "3. (Recommended) Seller Admin clicks Download Existing Data -> system serves a file pre-populated with",
    "   the seller's current SKU ID, SKU Name, Brand, Company, Category, MRP, Selling Price, Stock Available.",
    "4. Seller Admin edits MRP / Selling Price / Stock Available columns offline (display-only columns are ignored).",
    "5. Seller Admin uploads the file.",
    "6. [DECISION] File-level validation (format, size, header):",
    "   IF invalid:  Reject with ERR_PSU_010 / 011; EXIT.",
    "   ELSE:        Proceed to row-level validation.",
    "7. For each row, run validations in order:",
    "   - SKU ID present and matches an existing SKU for this seller       -> else ERR_PSU_001",
    "   - MRP and Selling Price numeric, decimals OK, both > 0              -> else ERR_PSU_002",
    "   - Selling Price < MRP                                                -> else ERR_PSU_003",
    "   - Stock Available is text \"Yes\" or \"No\" (case-insensitive)          -> else ERR_PSU_004",
    "8. Persist all valid rows: update MRP, Selling Price, Stock Available; refresh Last Updated timestamp.",
    "   Display-only columns (SKU Name, Brand, Company, Category) are ignored \u2014 never written back.",
    "9. Show summary: Updated: X | Failed: Y, with downloadable error report (row #, SKU ID, error code, message).",
    "10. Seller Admin closes the screen -> system returns to My SKU list with refreshed Last Updated timestamps.",
    "11. Seller Admin clicks View on any SKU -> SKU Detail page (US-06 Price & Inventory tab) to verify the change.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Bulk Import \u2014 Update Price and Stock",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (My SKU active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header",
    "    \u2502   \u251c\u2500 Back to My SKU breadcrumb",
    "    \u2502   \u2514\u2500 Title: \"Bulk Import \u2014 Update Price and Stock\"",
    "    \u251c\u2500 Step 1: Download Existing Data",
    "    \u2502   \u2514\u2500 Body: short instruction + [ Download Existing Data ] button",
    "    \u2502         (file is pre-populated with current SKUs and price / stock)",
    "    \u251c\u2500 Step 2: Upload File",
    "    \u2502   \u2514\u2500 Body: drag-drop / file picker; supported format hint",
    "    \u2502         Display-only columns hint: SKU Name / Brand / Company / Category will not be updated",
    "    \u251c\u2500 Validation Summary (after upload)",
    "    \u2502   \u251c\u2500 Pills: Updated: X  |  Failed: Y",
    "    \u2502   \u2514\u2500 Error report table: Row # | SKU ID | Error Code | Message  +  [ Download Error Report ]",
    "    \u2514\u2500 Action Bar: [ Cancel ]   [ Done \u2192 Back to My SKU ]",
  ]),
  subBanner("User Flow"),
  num("Seller Admin opens My SKU and clicks Bulk Import \u2192 Update Price and Stock."),
  num("Seller Admin clicks Download Existing Data \u2014 system serves a file pre-populated with current SKUs."),
  num("Seller Admin edits MRP / Selling Price / Stock Available columns offline."),
  num("Seller Admin clicks Upload File and selects the prepared file."),
  num("System validates and shows the summary; Seller Admin reviews errors (if any) and downloads the error report."),
  num("Seller Admin clicks Done \u2192 system returns to My SKU list."),
  num("Seller Admin clicks View on any updated SKU \u2192 SKU Detail \u2192 Price & Inventory tab to verify the change."),
  num("BACK / CANCEL PATH: Seller Admin clicks Cancel \u2192 returns to My SKU list; updates already persisted in the current attempt remain (partial commit)."),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["File", "Required; supported format; non-empty data rows.", "\"Please upload a valid file produced by Download Existing Data.\"", "On-submit"],
      ["SKU ID (per row)", "Required; must match an existing seller SKU; cannot be edited.", "ERR_PSU_001 message per row.", "On row-validation"],
      ["MRP (per row)", "Required; numeric; decimals allowed; > 0.", "ERR_PSU_002 message per row.", "On row-validation"],
      ["Selling Price (per row)", "Required; numeric; decimals allowed; > 0; < MRP.", "ERR_PSU_002 / ERR_PSU_003 message per row.", "On row-validation"],
      ["Stock Available (per row)", "Required; text only; \"Yes\" or \"No\" case-insensitive.", "ERR_PSU_004 message per row.", "On row-validation"],
      ["SKU Name / Brand / Company / Category", "Display-only; ignored.", "\u2014", "No validation"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Update Price and Stock \u2014 no file selected", "Drop your file here or click to browse. Use the file produced by Download Existing Data.", "\"Download Existing Data\""],
      ["Validation summary \u2014 zero failures", "All rows updated successfully.", "\"Done\""],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR_PSU_001", "SKU ID not found or has been altered \u2014 use the original downloaded file as the source of truth.", "import_psu_invalid_sku_id: row=<n>, sku_id=<id>"],
      ["ERR_PSU_002", "MRP and Selling Price must be positive numeric values; decimals are allowed.", "import_psu_invalid_price: row=<n>, mrp=<v>, sp=<v>"],
      ["ERR_PSU_003", "Selling Price must be less than MRP.", "import_psu_selling_price_ge_mrp: row=<n>, mrp=<v>, sp=<v>"],
      ["ERR_PSU_004", "Stock Available must be Yes or No (case-insensitive text only).", "import_psu_invalid_stock_available: row=<n>, value=<v>"],
      ["ERR_PSU_010", "Only [supported formats] are allowed. Use the file produced by Download Existing Data.", "import_psu_unsupported_format"],
      ["ERR_PSU_011", "File exceeds the maximum allowed rows.", "import_psu_exceeds_row_limit"],
      ["ERR_PSU_099", "Update failed. Please retry.", "import_psu_server_error"],
    ],
    [3, 6, 5],
  ),
];

// ---------- USER STORY 5 \u2014 SKU Detail: Product Details Tab ----------
const us05 = [
  ...storyBanner(
    "USER STORY 5",
    "SKU Detail \u2014 Product Details Tab (DMS / ONDC)",
    "Epic: Seller Admin \u2014 Product Catalog Management   |   Priority: High   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "SKU Detail \u2014 Product Details Tab (DMS / ONDC)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Product Catalog Management"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 Product Details is the page where ONDC compliance is achieved for each SKU."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor enriching SKUs created via Bulk Import to make them ONDC-compliant."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "After SKUs are created via Bulk Import (US-03), the imported records carry only the basic DMS attributes (Item Name and " +
    "Item Code). To list a SKU on ONDC the Seller Admin must enrich it with descriptor, quantity, category, fulfillment, " +
    "ONDC attributes, company / brand, manufacturer, country of origin, and product images. The Product Details tab is the " +
    "side-by-side workspace for this: each field shows the read-only DMS value next to an editable ONDC value, so the seller " +
    "can quickly see what was imported and what they still need to provide for ONDC compliance."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor enriching SKUs for ONDC",
      "Make every SKU ONDC-compliant by filling the required attributes against the imported DMS values",
      "ONDC requires far more attributes than DMS \u2014 keeping track of what is missing per SKU is hard without an at-a-glance compliance indicator"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Median time to make an imported SKU ONDC-compliant \u2014 target under 5 minutes per SKU."),
  num("% of SKUs marked ONDC Compliant after first edit session \u2014 [NEEDS INPUT] target."),
  num("Validation-error rate on Save (server rejects) \u2014 target under 5% (most validations caught client-side)."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin imports 250 SKUs from DMS; the SKUs land in the catalog with only Item Name and Item Code populated, and " +
        "are flagged as Not ONDC Compliant. The admin has no easy way to see which fields each SKU is missing. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin clicks View on a row in My SKU, lands on the Product Details tab, sees DMS values on the left and editable " +
        "ONDC fields on the right grouped into clear sections, fills the required attributes, clicks Save ONDC Values, and the " +
        "SKU flips to ONDC Compliant on the My SKU list."
      }),
    ],
  }),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "view and edit the ONDC values for an imported SKU side-by-side with the DMS values",
    "I can enrich the SKU with all required attributes and reach ONDC compliance",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks View on a SKU row in My SKU" },
    { key: "When", value: "the SKU Detail page loads" },
    { key: "Then", value: "the system shows two tabs at the top: Product Details (default selected) and Price & Inventory." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Seller Admin is on the Product Details tab" },
    { key: "When", value: "any field row is rendered" },
    { key: "Then", value: "the row shows three columns: Field Name, DMS Value (read-only), and ONDC Value (editable, except Item Code)." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin enters values for one or more ONDC fields and clicks Save ONDC Values" },
    { key: "When", value: "validation runs" },
    { key: "Then", value: "fields that pass validation are saved and persisted; fields that fail validation remain unsaved with an inline error message; saved fields are no longer shown as dirty." },
    { key: "And", value: "the Seller Admin can fix the failed fields and click Save again \u2014 only the still-dirty / failed fields are re-validated and saved (incremental save model)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin clicks Reset" },
    { key: "When", value: "the action is confirmed" },
    { key: "Then", value: "all unsaved edits in the Product Details tab are discarded and the form returns to the last-saved values." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "all mandatory ONDC fields for the SKU are filled and pass validation" },
    { key: "When", value: "the SKU is saved" },
    { key: "Then", value: "the SKU's ONDC Compliance Status flips to \"ONDC Compliant\" on the My SKU list." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "one or more mandatory ONDC fields are missing or invalid" },
    { key: "When", value: "the SKU Detail page renders or is saved" },
    { key: "Then", value: "the SKU is shown as \"{N} fields not compliant\" with the missing field names listed (tooltip / panel) and the SKU's compliance badge in the My SKU list reflects the same count." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Seller Admin selects a Manufacturer / Packer (Company)" },
    { key: "When", value: "the company is chosen" },
    { key: "Then", value: "the Brand dropdown is filtered to brands attached to that company; selecting a brand outside the company is not possible." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Seller Admin uploads a product image" },
    { key: "When", value: "no image is uploaded yet" },
    { key: "Then", value: "the first uploaded image becomes the primary image; subsequent images become additional images, up to a total of 5 images (1 primary + 4 additional)." },
    { key: "And", value: "the Seller Admin can remove or replace any image; only PNG / JPG files of size <= 2 MB are accepted." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "All DMS columns are read-only. Only ONDC values are editable. Item Code (ONDC column) is also non-editable \u2014 it is the join key against DMS."],
      ["BR-2", "Item Name and Item Code are populated from the Bulk Import file (US-03). Every other field is initially empty (or DMS-derived) and must be filled by the Seller Admin to reach ONDC compliance."],
      ["BR-3", "Save ONDC Values uses an incremental save model \u2014 valid fields are persisted, invalid fields stay flagged for correction. The page does not require all fields to be valid in a single save."],
      ["BR-4", "Reset discards unsaved edits only. It does not change persisted values."],
      ["BR-5", "ONDC Compliant = all mandatory ONDC fields are present and valid. The SKU's compliance badge on the My SKU list reflects the same calculation."],
      ["BR-6", "Brand options depend on the selected Manufacturer / Packer (Company). If the Seller Admin changes the Company after selecting a Brand, the Brand selection must be cleared."],
      ["BR-7", "A SKU may have at most 5 images: 1 primary + 4 additional. Allowed formats: PNG, JPG. Max file size: 2 MB per image."],
      ["BR-8", "The first uploaded image is automatically set as the primary image. The Seller Admin can promote a different image to primary or remove any image."],
      ["BR-9", "Item Status (Active / Inactive) toggle controls whether the SKU is available downstream. [NEEDS INPUT] confirm whether toggling Inactive is allowed when SKU is currently published / has open orders."],
      ["BR-10", "Major Unit and Time to Ship are constrained dropdowns. [NEEDS INPUT] confirm full canonical option lists."],
      ["BR-11", "Fulfillment ID is fixed to \"Store Delivery\" in Phase 1; no other options are selectable."],
      ["BR-12", "Field-level ONDC validation on Save executes the canonical ONDC rule catalog V-001 \u2192 V-033 (referenced from US-03 BR-2). The full catalog is maintained in the companion document \"Seller-Store-ONDC-SKU-Validation-Rules.docx\" (v1.0, 28 Apr 2026) \u2014 any rule change must update both documents."],
    ],
    [1, 9],
  ),
  subBanner("Mandatory Fields for ONDC Compliance"),
  makeTable(
    ["Section", "Field", "Mandatory for ONDC?"],
    [
      ["Descriptor", "Item Name", "Yes"],
      ["Descriptor", "Item Code", "Yes (from import)"],
      ["Descriptor", "Short Description", "Yes"],
      ["Descriptor", "Long Description", "Yes"],
      ["Quantity", "Major Unit", "Yes"],
      ["Quantity", "Unit Value", "Yes"],
      ["Quantity", "Pack Size / Inner Pack", "Yes"],
      ["Quantity", "UPC (Unit per Case)", "Yes"],
      ["Quantity", "SKU Weight", "Yes"],
      ["Quantity", "Minimum Order Quantity", "Yes"],
      ["Quantity", "Maximum Order Quantity", "Yes"],
      ["Category & Fulfillment", "Category ID", "Yes"],
      ["Category & Fulfillment", "Fulfillment ID", "Yes (Store Delivery in Phase 1)"],
      ["Category & Fulfillment", "Location ID (Warehouse)", "Yes"],
      ["ONDC Attributes", "Returnable", "Yes"],
      ["ONDC Attributes", "Cancellable", "Yes"],
      ["ONDC Attributes", "Available COD", "Yes"],
      ["ONDC Attributes", "Time to Ship", "Yes"],
      ["ONDC Attributes", "Customer Care Name", "Yes"],
      ["ONDC Attributes", "Customer Care Email", "Yes"],
      ["ONDC Attributes", "Customer Care Phone", "Yes"],
      ["Company & Brand", "Manufacturer / Packer (Company)", "Yes"],
      ["Company & Brand", "Brand", "Yes"],
      ["Company & Brand", "Manufacturer Address", "Yes"],
      ["Tags & Discovery", "Country of Origin", "Yes"],
      ["Product Images", "Primary Image", "Yes"],
      ["Item Status", "Status (Active / Inactive)", "Yes (must be Active for ONDC visibility) [NEEDS INPUT] confirm"],
    ],
    [4, 6, 4],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller Admin saves with only some valid fields", "Valid fields persist; invalid fields stay flagged; SKU remains \"{N} fields not compliant\" until all mandatory fields pass."],
      ["2", "Seller Admin enters Min Order Qty > Max Order Qty", "Inline validation error on Max Order Qty: \"Max order quantity must be greater than minimum order quantity.\""],
      ["3", "Seller Admin selects Company A then changes to Company B", "Brand selection is cleared; the Brand dropdown re-populates with Company B's brands."],
      ["4", "Seller Admin uploads a 6th image", "Upload is blocked with the message \"Up to 5 images allowed (1 primary + 4 additional). Remove an image to add a new one.\""],
      ["5", "Seller Admin uploads a 3 MB image", "Upload is rejected with the message \"Image must be 2 MB or smaller.\""],
      ["6", "Seller Admin uploads a .gif file", "Upload is rejected with the message \"Only PNG and JPG images are allowed.\""],
      ["7", "Seller Admin removes the primary image while additional images exist", "[NEEDS INPUT] \u2014 confirm whether the next image auto-promotes to primary, or whether the Seller Admin must explicitly choose a new primary."],
      ["8", "Seller Admin clicks Reset after making and partially saving edits", "Only the unsaved edits made since the last save are discarded; previously persisted values remain."],
      ["9", "Seller Admin enters Customer Care Phone with 9 digits", "Inline validation error: \"Phone number must be exactly 10 digits.\""],
      ["10", "Seller Admin enters a Short Description shorter than 10 characters", "Inline validation error: \"Short description must be 10\u2013150 characters.\""],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-PD-01", "Save API timeout", "\"Save is taking longer than usual. Please try again.\"", "Keep edits in form; allow retry; log error with correlation ID."],
      ["ERR-PD-02", "Save API server error", "\"Could not save your changes. Please retry.\"", "Keep edits; show retry CTA; log error."],
      ["ERR-PD-03", "Image upload fails (network / server)", "\"Image upload failed. Please try again.\"", "Remove the failed image from the in-progress list; allow retry."],
      ["ERR-PD-04", "Image rejected (size / format)", "\"Only PNG / JPG images up to 2 MB are allowed.\"", "Block upload at client; do not call API."],
      ["ERR-PD-05", "Concurrent edit (another session updated this SKU)", "\"This SKU was updated elsewhere. Reload to see latest values.\"", "Offer Reload action; preserve unsaved edits behind a confirmation."],
      ["ERR-PD-06", "Session expired during edit", "\"Your session has expired. Please log in again.\"", "Redirect to login; preserve target URL."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Product Details fields)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Item Name", "String", "Yes", "Non-empty; [NEEDS INPUT] max length", "From Bulk Import"],
      ["Item Code", "String", "Yes", "Non-editable; unique per seller", "From Bulk Import"],
      ["Short Description", "String", "Yes", "Alphanumeric; length 10\u2013150", "User input"],
      ["Long Description", "String", "Yes", "Alphanumeric; length 20\u20131000", "User input"],
      ["Major Unit", "Enum", "Yes", "One of: Dozen, Gram, Kilogram, Milliliter, Liter, [NEEDS INPUT] confirm full list", "Dropdown selection"],
      ["Unit Value", "Numeric", "Yes", "Positive number; > 0; decimals allowed", "User input"],
      ["Pack Size / Inner Pack", "Numeric", "Yes", "Integer; > 0", "User input"],
      ["UPC (Unit per Case)", "Numeric", "Yes", "Integer; > 0; no decimals allowed", "User input"],
      ["SKU Weight", "Numeric", "Yes", "Positive number; > 0; decimals allowed", "User input"],
      ["Minimum Order Quantity", "Numeric", "Yes", "Integer; > 0", "User input"],
      ["Maximum Order Quantity", "Numeric", "Yes", "Integer; > 0; must be >= Minimum Order Quantity", "User input"],
      ["Category ID", "Enum", "Yes", "Selected from predefined category master", "Dropdown selection"],
      ["Fulfillment ID", "Enum", "Yes", "Phase 1: only \"Store Delivery\" is selectable", "Dropdown selection (locked)"],
      ["Location ID (Warehouse)", "String", "Yes", "[NEEDS INPUT] format / source (free text vs warehouse master)", "User input"],
      ["Returnable", "Boolean", "Yes", "Yes / No toggle", "Toggle"],
      ["Cancellable", "Boolean", "Yes", "Yes / No toggle", "Toggle"],
      ["Available COD", "Boolean", "Yes", "Yes / No toggle", "Toggle"],
      ["Time to Ship", "Enum", "Yes", "One of: 24 hr, 48 hr, [NEEDS INPUT] confirm full list", "Dropdown selection"],
      ["Customer Care Name", "String", "Yes", "Alphabetic only; [NEEDS INPUT] max length", "User input"],
      ["Customer Care Email", "String", "Yes", "Valid email format; alphabetic with allowed special characters", "User input"],
      ["Customer Care Phone", "Numeric", "Yes", "Exactly 10 digits; numeric only", "User input"],
      ["Manufacturer / Packer (Company)", "Enum", "Yes", "Selected from companies attached to the distributor", "Dropdown selection"],
      ["Brand", "Enum", "Yes", "Selected from brands attached to the chosen Company; cleared on Company change", "Dropdown selection (dependent)"],
      ["Manufacturer Address", "String", "Yes", "Alphanumeric; [NEEDS INPUT] max length", "User input"],
      ["Country of Origin", "String", "Yes", "Alphabetic; [NEEDS INPUT] enum from country master vs free text", "User input"],
      ["Product Images", "File[]", "Yes (>=1 primary)", "PNG / JPG; <= 2 MB each; max 5 (1 primary + 4 additional)", "User upload"],
      ["Item Status", "Enum", "Yes", "Active / Inactive toggle; default Active on creation", "Toggle"],
    ],
    [4, 2, 2, 6, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks View on a SKU row in My SKU.",
    "2. System opens the SKU Detail page on the Product Details tab (default).",
    "3. System loads the SKU's saved values and renders rows as: Field Name | DMS Value (read-only) | ONDC Value (editable).",
    "4. Seller Admin edits one or more ONDC fields across the sections: Descriptor, Quantity, Category & Fulfillment, ONDC Attributes,",
    "   Company & Brand, Tags & Discovery, Product Images, Item Status.",
    "5. [DECISION] Seller Admin clicks an action:",
    "   IF Reset:                Discard unsaved edits; revert form to last-saved values; EXIT.",
    "   IF Save ONDC Values:     Proceed to step 6.",
    "6. System runs client-side and server-side validation per the Data Specification.",
    "7. [DECISION] Validation result:",
    "   IF all fields valid:     Persist all edits; show success toast.",
    "   ELSE:                    Persist valid fields (incremental save); keep invalid fields flagged with inline errors.",
    "8. System recomputes ONDC Compliance based on mandatory fields:",
    "   IF all mandatory present and valid:  Mark SKU as ONDC Compliant.",
    "   ELSE:                                Mark SKU as \"{N} fields not compliant\" with the missing field names.",
    "9. Updated compliance state is reflected on the My SKU list when the Seller Admin returns.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: SKU Detail",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (My SKU active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header",
    "    \u2502   \u251c\u2500 Back to My SKU breadcrumb",
    "    \u2502   \u251c\u2500 Title: \"<Item Name>\"  Sub: \"<Item Code>\"",
    "    \u2502   \u2514\u2500 ONDC Compliance Badge: \"ONDC Compliant\" or \"{N} fields not compliant\"",
    "    \u251c\u2500 Tabs: [ Product Details (active) ] [ Price & Inventory ]",
    "    \u251c\u2500 Section: Descriptor (Product Identity)",
    "    \u2502   \u2514\u2500 Rows: Field Name | DMS Value (read-only) | ONDC Value (editable)",
    "    \u2502       \u2022 Item Name, Item Code (Item Code ONDC value is non-editable)",
    "    \u2502       \u2022 Short Description (10\u2013150 chars), Long Description (20\u20131000 chars)",
    "    \u251c\u2500 Section: Quantity",
    "    \u2502   \u2022 Major Unit (dropdown), Unit Value (>0), Pack Size / Inner Pack (>0)",
    "    \u2502   \u2022 UPC (>0, integer), SKU Weight (>0, decimal allowed)",
    "    \u2502   \u2022 Min Order Qty, Max Order Qty (Max >= Min)",
    "    \u251c\u2500 Section: Category & Fulfillment",
    "    \u2502   \u2022 Category ID (dropdown), Fulfillment ID (Store Delivery only \u2014 Phase 1), Location ID (warehouse)",
    "    \u251c\u2500 Section: ONDC Attributes",
    "    \u2502   \u2022 Returnable / Cancellable / Available COD (Yes / No toggles)",
    "    \u2502   \u2022 Time to Ship (dropdown), Customer Care Name / Email / Phone",
    "    \u251c\u2500 Section: Company & Brand Information",
    "    \u2502   \u2022 Manufacturer / Packer (Company dropdown) -> drives Brand dropdown",
    "    \u2502   \u2022 Manufacturer Address",
    "    \u251c\u2500 Section: Tags & Discovery Attributes",
    "    \u2502   \u2022 Country of Origin",
    "    \u251c\u2500 Section: Product Images",
    "    \u2502   \u2022 Up to 5 images (1 primary + 4 additional); PNG / JPG; <= 2 MB",
    "    \u2502   \u2022 Add / Remove / Replace; first upload becomes primary",
    "    \u251c\u2500 Section: Item Status (Active / Inactive toggle)",
    "    \u2514\u2500 Sticky Action Bar: [ Reset ]   [ Save ONDC Values ]",
  ]),
  subBanner("User Flow"),
  num("Seller Admin clicks View on a SKU row in My SKU."),
  num("System opens SKU Detail \u2192 Product Details tab."),
  num("Seller Admin reviews DMS values and fills / edits ONDC values across sections."),
  num("Seller Admin uploads up to 5 images (first becomes primary)."),
  num("Seller Admin clicks Save ONDC Values."),
  num("System validates and saves valid fields incrementally; flags invalid fields with inline errors."),
  num("Seller Admin fixes flagged fields and saves again until all mandatory fields pass; SKU becomes ONDC Compliant."),
  num("BACK PATH: Seller Admin clicks Reset to discard unsaved edits, or Back to My SKU to leave the page (browser confirms if there are unsaved edits) \u2014 [NEEDS INPUT] confirm unsaved-edit guard requirement."),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Short Description", "Alphanumeric; length 10\u2013150", "\"Short description must be 10\u2013150 characters.\"", "On-blur / on-save"],
      ["Long Description", "Alphanumeric; length 20\u20131000", "\"Long description must be 20\u20131000 characters.\"", "On-blur / on-save"],
      ["Unit Value", "Numeric; > 0", "\"Unit value must be a positive number.\"", "On-blur / on-save"],
      ["Pack Size / Inner Pack", "Integer; > 0", "\"Pack size must be a positive whole number.\"", "On-blur / on-save"],
      ["UPC", "Integer; > 0; no decimals", "\"UPC must be a positive whole number with no decimals.\"", "On-blur / on-save"],
      ["SKU Weight", "Numeric; > 0; decimals allowed", "\"SKU weight must be a positive number.\"", "On-blur / on-save"],
      ["Min Order Qty", "Integer; > 0", "\"Minimum order quantity must be a positive whole number.\"", "On-blur / on-save"],
      ["Max Order Qty", "Integer; > 0; >= Min Order Qty", "\"Max order quantity must be greater than or equal to minimum order quantity.\"", "On-blur / on-save"],
      ["Customer Care Name", "Alphabetic only", "\"Name must contain letters only.\"", "On-blur / on-save"],
      ["Customer Care Email", "Valid email format", "\"Enter a valid email address.\"", "On-blur / on-save"],
      ["Customer Care Phone", "Numeric; exactly 10 digits", "\"Phone number must be exactly 10 digits.\"", "On-blur / on-save"],
      ["Country of Origin", "Alphabetic", "\"Country must contain letters only.\"", "On-blur / on-save"],
      ["Brand", "Required; must belong to selected Company", "\"Select a brand for the chosen company.\"", "On-save"],
      ["Product Image", "PNG / JPG; <= 2 MB; max 5 images", "Format-specific messages (see Edge Cases)", "On-upload"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Product Images section \u2014 no images uploaded", "Add up to 5 images to showcase this product. The first image becomes the primary.", "\"Upload Image\""],
      ["DMS Value column \u2014 field has no DMS value", "\u2014 (em dash placeholder)", "\u2014"],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR-PD-01", "Save is taking longer than usual. Please try again.", "PUT /skus/<id>/ondc timed out"],
      ["ERR-PD-02", "Could not save your changes. Please retry.", "PUT /skus/<id>/ondc failed: <statusCode>"],
      ["ERR-PD-03", "Image upload failed. Please try again.", "POST /skus/<id>/images failed: <statusCode>"],
      ["ERR-PD-04", "Only PNG / JPG images up to 2 MB are allowed.", "client_image_validation_failed: <reason>"],
      ["ERR-PD-05", "This SKU was updated elsewhere. Reload to see latest values.", "409 Conflict on PUT /skus/<id>/ondc"],
      ["ERR-PD-06", "Your session has expired. Please log in again.", "401 Unauthorized on /skus/<id>/ondc"],
    ],
    [3, 6, 5],
  ),
];

// ---------- USER STORY 6 \u2014 SKU Detail: Price & Inventory Tab ----------
const us06 = [
  ...storyBanner(
    "USER STORY 6",
    "SKU Detail \u2014 Price & Inventory Tab",
    "Epic: Seller Admin \u2014 Product Catalog Management   |   Priority: High   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "SKU Detail \u2014 Price & Inventory Tab"],
    ["Epic / Feature Link", "Seller Admin \u2014 Product Catalog Management"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 day-to-day price and stock changes happen at the per-SKU level."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor maintaining MRP, selling price and stock per SKU."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "While Bulk Import \u2192 Upload Price and Stock (US-04) is the path for many SKUs at once, the Seller Admin still needs " +
    "a per-SKU place to update price and stock for a single product \u2014 for a quick correction, a price test, or to toggle " +
    "stock availability. The Price & Inventory tab on the SKU Detail page provides this focused workspace, with the inventory " +
    "summary fields (Pack Size, Inner Pack, UPC) shown for context and the editable Stock Available toggle, MRP and Selling Price."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor maintaining per-SKU price and stock",
      "Update MRP, selling price and stock availability for a single SKU in seconds",
      "Bulk import is overkill for a one-off correction; the per-SKU edit must be fast and prevent obvious pricing mistakes"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Median time to update price / stock for a single SKU \u2014 target under 30 seconds."),
  num("Save success rate (no validation rejection) \u2014 target above 95%."),
  num("Selling Price >= MRP errors caught client-side \u2014 target 100% (zero invalid prices reach the server)."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin notices that one SKU has an outdated MRP. Without a per-SKU edit they would have to re-upload a price " +
        "file or wait for the next bulk job. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin opens the SKU Detail page, switches to the Price & Inventory tab, edits the MRP and Selling Price, " +
        "confirms Stock Available stays Yes, and clicks Save Price and Stock \u2014 the change is live and the My SKU list shows " +
        "the new Last Updated timestamp."
      }),
    ],
  }),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "edit price and stock for a single SKU on its detail page",
    "I can quickly correct or refresh per-SKU pricing and inventory without running a bulk upload",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin is on the SKU Detail page" },
    { key: "When", value: "the user clicks the Price & Inventory tab" },
    { key: "Then", value: "the system displays the inventory summary (Pack Size, Inner Pack, UPC \u2014 read-only), the Stock Available Yes/No toggle, and the editable MRP and Selling Price fields." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Seller Admin enters values for MRP and Selling Price and clicks Save Price and Stock" },
    { key: "When", value: "validation runs" },
    { key: "Then", value: "if Selling Price < MRP and both values are positive numbers, the changes are saved and a success toast is shown." },
    { key: "And", value: "the Last Updated timestamp on the SKU is refreshed and reflected on the My SKU list." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin enters a Selling Price greater than or equal to MRP" },
    { key: "When", value: "the user clicks Save Price and Stock" },
    { key: "Then", value: "the save is blocked with the inline error \"Selling price must be less than MRP.\" and no values are persisted." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin toggles Stock Available between Yes and No" },
    { key: "When", value: "the user clicks Save Price and Stock" },
    { key: "Then", value: "the new toggle value is persisted on the SKU." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Seller Admin clicks Reset" },
    { key: "When", value: "the action is confirmed" },
    { key: "Then", value: "all unsaved edits in the Price & Inventory tab are discarded and the form returns to the last-saved values." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Pack Size / Inner Pack and UPC are shown read-only on this tab \u2014 they are edited on the Product Details tab (US-05)."],
      ["BR-2", "Stock Available is a Yes / No toggle on this tab. Yes = the SKU is in stock and orderable; No = the SKU is shown as out of stock to buyers. [NEEDS INPUT] confirm whether this is the same field as Infinite Stock used elsewhere, or a separate flag."],
      ["BR-3", "MRP and Selling Price are positive decimals. Selling Price MUST be strictly less than MRP."],
      ["BR-4", "Save Price and Stock validates before persisting. If validation fails, no values are saved (atomic save for this tab)."],
      ["BR-5", "Reset discards unsaved edits only. It does not change persisted values."],
      ["BR-6", "Editing this tab does not affect ONDC Compliance (compliance is owned by the Product Details tab)."],
      ["BR-7", "[NEEDS INPUT] Currency, decimal precision, and upper sanity limits for MRP and Selling Price."],
      ["BR-8", "[NEEDS INPUT] Whether single-piece price is the only price model in Phase 1, or whether tier / pack pricing is also editable."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller Admin enters Selling Price = MRP", "Save blocked with \"Selling price must be less than MRP.\""],
      ["2", "Seller Admin enters MRP = 0", "Save blocked with \"MRP must be greater than 0.\""],
      ["3", "Seller Admin enters Selling Price as a negative number", "Save blocked with \"Selling price must be greater than 0.\""],
      ["4", "Seller Admin toggles Stock Available to No while open orders exist", "[NEEDS INPUT] \u2014 confirm whether this is allowed and what happens to open orders / cart."],
      ["5", "Seller Admin saves while another session updated the same SKU", "Show concurrency error (ERR-PI-05); preserve unsaved edits behind a confirmation."],
      ["6", "Seller Admin enters MRP / Selling Price with more decimals than allowed", "Inline validation per BR-7 (decimal precision rule \u2014 [NEEDS INPUT] exact rule)."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-PI-01", "Save API timeout", "\"Save is taking longer than usual. Please try again.\"", "Keep edits in form; allow retry; log error."],
      ["ERR-PI-02", "Save API server error", "\"Could not save price and stock. Please retry.\"", "Keep edits; show retry CTA; log error."],
      ["ERR-PI-03", "Selling Price >= MRP", "\"Selling price must be less than MRP.\"", "Block save at client; do not call API."],
      ["ERR-PI-04", "Negative or zero price entered", "\"Price must be greater than 0.\"", "Block save at client; do not call API."],
      ["ERR-PI-05", "Concurrent edit (another session updated this SKU)", "\"This SKU was updated elsewhere. Reload to see latest values.\"", "Offer Reload action; preserve unsaved edits behind a confirmation."],
      ["ERR-PI-06", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login; preserve target URL."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Price & Inventory fields)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Pack Size / Inner Pack", "Numeric", "Yes (read-only here)", "Integer; > 0; edited on Product Details tab", "From SKU master"],
      ["UPC (Unit per Case)", "Numeric", "Yes (read-only here)", "Integer; > 0; edited on Product Details tab", "From SKU master"],
      ["Stock Available", "Boolean", "Yes", "Yes / No toggle", "Toggle (default per BR-2)"],
      ["MRP", "Decimal", "Yes", "> 0; [NEEDS INPUT] decimal precision and upper limit", "User input"],
      ["Selling Price", "Decimal", "Yes", "> 0; strictly less than MRP", "User input"],
    ],
    [4, 2, 2, 6, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin opens the SKU Detail page and clicks the Price & Inventory tab.",
    "2. System renders the inventory summary (Pack Size, Inner Pack, UPC) read-only and the editable Stock Available toggle, MRP and Selling Price.",
    "3. Seller Admin edits one or more fields.",
    "4. [DECISION] Seller Admin clicks an action:",
    "   IF Reset:                      Discard unsaved edits; revert to last-saved values; EXIT.",
    "   IF Save Price and Stock:       Proceed to step 5.",
    "5. System runs validation:",
    "   - MRP > 0",
    "   - Selling Price > 0",
    "   - Selling Price < MRP",
    "6. [DECISION] Validation result:",
    "   IF any rule fails:    Block save; show inline error(s); no values persist; EXIT.",
    "   ELSE:                 Persist all edits atomically; refresh Last Updated timestamp; show success toast.",
    "7. My SKU list reflects the new Last Updated timestamp on next view.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: SKU Detail \u2014 Price & Inventory Tab",
    "\u251c\u2500 (Tabs from US-05): [ Product Details ] [ Price & Inventory (active) ]",
    "\u251c\u2500 Section: Inventory Summary (read-only)",
    "\u2502   \u2022 Pack Size / Inner Pack",
    "\u2502   \u2022 UPC",
    "\u2502   \u2022 Stock Available (Yes / No toggle \u2014 editable here)",
    "\u251c\u2500 Section: Single-Piece Price",
    "\u2502   \u2022 MRP (decimal, > 0)",
    "\u2502   \u2022 Selling Price (decimal, > 0, < MRP)",
    "\u2514\u2500 Sticky Action Bar: [ Reset ]   [ Save Price and Stock ]",
  ]),
  subBanner("User Flow"),
  num("Seller Admin opens the SKU Detail page and switches to the Price & Inventory tab."),
  num("Seller Admin reviews the read-only inventory summary."),
  num("Seller Admin toggles Stock Available and / or edits MRP / Selling Price."),
  num("Seller Admin clicks Save Price and Stock."),
  num("System validates; on success, persists changes and shows a success toast; on failure, shows inline errors and blocks save."),
  num("BACK PATH: Seller Admin clicks Reset to discard unsaved edits, switches tabs, or returns to My SKU (browser confirms if unsaved \u2014 [NEEDS INPUT] confirm guard)."),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Stock Available", "Yes / No toggle", "\u2014", "On-toggle"],
      ["MRP", "Decimal; > 0", "\"MRP must be greater than 0.\"", "On-blur / on-save"],
      ["Selling Price", "Decimal; > 0; < MRP", "\"Selling price must be greater than 0 and less than MRP.\"", "On-blur / on-save"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Empty States"),
  notApplicable("All fields on this tab always render \u2014 no list / collection that can be empty."),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR-PI-01", "Save is taking longer than usual. Please try again.", "PUT /skus/<id>/price-stock timed out"],
      ["ERR-PI-02", "Could not save price and stock. Please retry.", "PUT /skus/<id>/price-stock failed: <statusCode>"],
      ["ERR-PI-03", "Selling price must be less than MRP.", "client_validation_failed: selling_price >= mrp"],
      ["ERR-PI-04", "Price must be greater than 0.", "client_validation_failed: non_positive_price"],
      ["ERR-PI-05", "This SKU was updated elsewhere. Reload to see latest values.", "409 Conflict on PUT /skus/<id>/price-stock"],
      ["ERR-PI-06", "Your session has expired. Please log in again.", "401 Unauthorized on /skus/<id>/price-stock"],
    ],
    [3, 6, 5],
  ),
];

// ---------- USER STORY 7 \u2014 Customers: List Page ----------
const us07 = [
  ...storyBanner(
    "USER STORY 7",
    "Customers \u2014 List Page (KPI Cards, Search, Filter, Export)",
    "Epic: Seller Admin \u2014 Customer Management   |   Priority: High   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Customers \u2014 List Page (KPI Cards, Search, Filter, Export)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Customer Management"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 the Customers list is the seller's working view of who is buying from them and the entry point to every customer detail."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor managing relationships with retailer / B2B customers."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Once orders start flowing through the Seller Store, the distributor needs a single screen to see who their customers " +
    "are, how the customer base is composed (class types), how many are active, how many are new this month, and how many " +
    "are repeat buyers. The list also has to be searchable (by name, business, mobile, area or pincode), filterable (by " +
    "class type and registration-date range), and exportable for offline analysis. Without this page, the seller has no " +
    "operational view of their customer base and cannot pull lists for follow-up or marketing."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor managing customer relationships",
      "See the customer base at a glance and quickly find / segment / export specific customers",
      "Customer data lives in invoices and chat logs; without a unified, filterable list the seller can't act on it"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Median time to locate a specific customer (via search) \u2014 target under 5 seconds."),
  num("KPI card values reconcile with the underlying list filtered to the same definition \u2014 target 100% accuracy."),
  num("Export completes successfully on date ranges up to 12 months \u2014 target 99%+."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin has 200+ buyers across Kirana, Wholesaler, Bakery and Grocery classes. To plan a quarterly outreach, " +
        "the seller has to compile a list manually from invoices and WhatsApp groups. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin opens Customers, sees the four KPI cards (Total / Active / New This Month / Repeat Buyers), filters " +
        "to Class Type = Kirana with registration date in Q1, exports the result to a file, and uses it for the campaign \u2014 " +
        "all in under 60 seconds."
      }),
    ],
  }),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "view, search, filter, paginate and export my customer base with at-a-glance KPIs",
    "I can quickly find any customer and pull lists for follow-up or analysis",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks Customers in the left navigation" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the system displays four KPI cards in this order: Total Customers, Active Customers, New in This Month, Repeat Buyers." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the customer list has at least one customer" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "the table is shown with columns: Customer Name, Class Type, Business Name, Mobile Number, Area / Pincode, Registered Date, Actions; pagination is fixed at 25 rows per page with Previous / Next." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin types in the search input" },
    { key: "When", value: "the input changes (debounced)" },
    { key: "Then", value: "the list filters to rows where Customer Name OR Business Name OR Mobile Number OR Area OR Pincode contains the search term (case-insensitive); pagination resets to page 1." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin opens the Filter panel" },
    { key: "When", value: "filters are applied (Class Type and / or Registration Date Range with From / To dates)" },
    { key: "Then", value: "the list refreshes to rows matching all selected filters; applied filters are reflected as removable chips above the table; pagination resets to page 1." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Seller Admin clicks Export" },
    { key: "When", value: "the export drawer opens" },
    { key: "Then", value: "the system asks for a Registration Date Range (From / To); on confirmation, the system downloads a file containing all customers whose Registered Date falls in the chosen range." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Seller Admin clicks the Action button on any row" },
    { key: "When", value: "the action is triggered" },
    { key: "Then", value: "the system navigates to the Customer Detail page (US-08) for that customer." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Seller Admin has zero customers (e.g., no orders ever placed)" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the empty state is shown; KPI cards display 0; pagination footer is hidden." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Seller Admin combines search + filter + pagination" },
    { key: "When", value: "any one input changes" },
    { key: "Then", value: "all three are applied together; the list reflects the combined result and pagination resets to page 1." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Page size is fixed at 25 rows per page in Phase 1; pagination controls are limited to Previous and Next."],
      ["BR-2", "The list shows only customers belonging to the logged-in distributor \u2014 no cross-tenant visibility."],
      ["BR-3", "Total Customers = count of all customers for the distributor (no filters applied)."],
      ["BR-4", "Active Customers = count of customers in the Active state. [NEEDS INPUT] confirm canonical definition: a separate Active / Inactive flag, OR derived from \"has placed at least one order\". Current implementation uses the latter; product to confirm."],
      ["BR-5", "New in This Month = count of customers whose Registered Date falls within the current calendar month."],
      ["BR-6", "Repeat Buyers = count of customers who have placed more than one order (totalOrders > 1)."],
      ["BR-7", "Registered Date = date of the customer's FIRST ORDER through this distributor (the customer is auto-created on first order \u2014 see US-09)."],
      ["BR-8", "Search matches against five fields: Customer Name, Business Name, Mobile Number, Area, Pincode (case-insensitive, contains-match)."],
      ["BR-9", "Class Type allowed values: Kirana, Wholesaler, Bakery, Grocery, Supermarket, Restaurant, Hotel, Other."],
      ["BR-10", "Filter \u2014 Registration Date Range: From / To inclusive. Apply button confirms; clearing dates removes the filter."],
      ["BR-11", "Export: download includes only the filtered customers within the Registration Date Range chosen in the export drawer; the seller's currently applied search / filter chips do NOT alter the export \u2014 the date range is the sole scope."],
      ["BR-12", "[NEEDS INPUT] Export file format (.csv, .xlsx) and full set of exported columns."],
      ["BR-13", "[NEEDS INPUT] Default sort order of the list (e.g., Registered Date descending vs Customer Name ascending)."],
    ],
    [1, 9],
  ),
  subBanner("KPI Card Definitions"),
  makeTable(
    ["Card #", "Label", "Definition", "Source"],
    [
      ["1", "Total Customers", "All customers for this distributor.", "COUNT(customers WHERE distributor = current seller)"],
      ["2", "Active Customers", "Customers currently in the Active state. [NEEDS INPUT] confirm: explicit flag vs derived from totalOrders > 0.", "COUNT(customers WHERE active = true)"],
      ["3", "New in This Month", "Customers whose Registered Date is in the current calendar month.", "COUNT(customers WHERE registeredDate IN current month)"],
      ["4", "Repeat Buyers", "Customers who placed more than one order.", "COUNT(customers WHERE totalOrders > 1)"],
    ],
    [1, 4, 7, 5],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller Admin has zero customers", "Empty state shown; all KPI cards = 0; pagination hidden."],
      ["2", "Search returns zero rows", "Show \"No customers match your search\"; pagination footer hidden; Clear Search CTA visible."],
      ["3", "Filter applied returns zero rows", "Show \"No customers match the selected filters\"; chips remain so user can edit; Clear Filters CTA visible."],
      ["4", "Registration date range From > To", "Block Apply with inline error \"From date must be on or before To date.\""],
      ["5", "Export From > To", "Block confirm with the same inline error."],
      ["6", "Export with no rows in range", "Inform the user \"No customers in this date range\"; do not download an empty file."],
      ["7", "Customer name contains non-Latin characters", "Search matches normally (case-insensitive); display preserves original characters."],
      ["8", "User on page 3 changes the search term", "Pagination resets to page 1 of the new filtered set."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-CUS-01", "API timeout while loading customer list", "\"Unable to load customers. Please retry.\"", "Show retry CTA on the table area; preserve filter and search state."],
      ["ERR-CUS-02", "Search request fails", "\"Search is temporarily unavailable. Please try again.\"", "Keep previously loaded list visible; non-blocking toast."],
      ["ERR-CUS-03", "Pagination request fails", "\"Could not load the next page. Please retry.\"", "Keep current page visible; offer retry."],
      ["ERR-CUS-04", "Export request fails", "\"Export failed. Please retry.\"", "Keep export drawer open; offer retry; log error."],
      ["ERR-CUS-05", "Session expired while on the list", "\"Your session has expired. Please log in again.\"", "Redirect to login; preserve target URL."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (List Columns)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Customer Name", "String", "Yes", "Non-empty.", "Customer master."],
      ["Class Type", "Enum", "Yes", "One of Kirana, Wholesaler, Bakery, Grocery, Supermarket, Restaurant, Hotel, Other.", "Customer master."],
      ["Business Name", "String", "Yes", "Non-empty.", "Customer master."],
      ["Mobile Number", "String", "Yes", "Indian format; unique per distributor.", "Customer master (unique key \u2014 see US-09)."],
      ["Area / Pincode", "String", "Yes", "Area + 6-digit pincode.", "Customer master."],
      ["Registered Date", "Date", "Yes", "Date of first order.", "Auto-set on first order (see US-09)."],
      ["Action", "Control", "Yes", "View button; routes to Customer Detail (US-08).", "UI control."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks Customers in the left navigation.",
    "2. System loads customers scoped to the logged-in distributor.",
    "3. System renders the four KPI cards (Total / Active / New This Month / Repeat Buyers) and the table.",
    "4. [DECISION] Seller Admin chooses an action (any order, can combine):",
    "   IF Search:                    Filter list by Name / Business / Mobile / Area / Pincode; reset to page 1.",
    "   IF Filter:                    Apply Class Type and / or Registration Date Range; reset to page 1.",
    "   IF Previous / Next:           Load the corresponding 25-record page.",
    "   IF Export:                    Open drawer -> ask From / To registration dates -> download file.",
    "   IF Action (View) on a row:    Navigate to Customer Detail page (US-08).",
    "5. [DECISION] If filters / search return zero rows: show empty state with Clear CTA; otherwise render rows.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Customers \u2014 List View",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (Customers active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header",
    "    \u2502   \u2514\u2500 Title: \"Customers\"",
    "    \u251c\u2500 KPI Cards Row (4 cards)",
    "    \u2502   \u251c\u2500 Total Customers",
    "    \u2502   \u251c\u2500 Active Customers",
    "    \u2502   \u251c\u2500 New in This Month",
    "    \u2502   \u2514\u2500 Repeat Buyers",
    "    \u251c\u2500 Action Bar (top-right cluster)",
    "    \u2502   \u251c\u2500 Search Input  (placeholder: \"Search by name, business, mobile, area or pincode...\")",
    "    \u2502   \u251c\u2500 [Filter] button \u2192 panel with Class Type checklist + Registration Date Range (From / To) + Apply",
    "    \u2502   \u2514\u2500 [Export] button \u2192 drawer with From / To registration dates + Download",
    "    \u251c\u2500 Filter Chips Bar (only when filters applied) + Clear all",
    "    \u251c\u2500 Data Table (7 columns)",
    "    \u2502   Customer Name | Class Type (badge) | Business Name | Mobile | Area / Pincode | Registered Date | Actions",
    "    \u2514\u2500 Pagination Footer  [Previous]   Page X of Y   [Next]   (max 25 rows per page)",
  ]),
  subBanner("User Flow"),
  num("Seller Admin clicks Customers in the left nav."),
  num("KPI cards + table render."),
  num("Seller Admin optionally searches / filters / paginates."),
  num("Seller Admin clicks Export \u2192 picks From / To dates \u2192 downloads file."),
  num("Seller Admin clicks View on a row \u2192 Customer Detail page (US-08)."),
  num("BACK PATH: Seller Admin clicks any other left-nav item to leave the page; filter / search state is reset on next visit (Phase 1)."),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Search input", "Max 100 chars; trims whitespace.", "\"Search term is too long.\"", "On-input (debounced)"],
      ["Filter \u2014 Class Type", "One or more of the 8 allowed values.", "\u2014", "On-apply"],
      ["Filter \u2014 Registration Date From / To", "Both optional individually; if both provided, From <= To.", "\"From date must be on or before To date.\"", "On-apply"],
      ["Export \u2014 From / To dates", "Both required; From <= To.", "\"From date must be on or before To date.\"", "On-confirm"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Customers \u2014 zero customers (first-time seller)", "You don't have any customers yet. Customers are created automatically when buyers place their first order with you.", "\u2014 (informational)"],
      ["Customers \u2014 search returns no rows", "No customers match your search.", "\"Clear Search\""],
      ["Customers \u2014 filter returns no rows", "No customers match the selected filters.", "\"Clear Filters\""],
      ["Export \u2014 no rows in date range", "No customers were registered in this date range.", "\u2014"],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR-CUS-01", "Unable to load customers. Please retry.", "GET /customers failed: <statusCode>"],
      ["ERR-CUS-02", "Search is temporarily unavailable. Please try again.", "GET /customers/search failed: <statusCode> <query>"],
      ["ERR-CUS-03", "Could not load the next page. Please retry.", "Pagination request failed: page=<n> <statusCode>"],
      ["ERR-CUS-04", "Export failed. Please retry.", "POST /customers/export failed: <statusCode> from=<d> to=<d>"],
      ["ERR-CUS-05", "Your session has expired. Please log in again.", "401 Unauthorized on /customers"],
    ],
    [3, 6, 5],
  ),
];

// ---------- USER STORY 8 \u2014 Customers: Detail Page ----------
const us08 = [
  ...storyBanner(
    "USER STORY 8",
    "Customers \u2014 Detail Page (Basic Info, Address, Business Info, Map)",
    "Epic: Seller Admin \u2014 Customer Management   |   Priority: High   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Customers \u2014 Detail Page (Basic Info, Address, Business Info, Map)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Customer Management"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 the detail view is where the seller verifies customer identity, location and GST status before acting."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor reviewing a single customer's record."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Customers in Phase 1 are created automatically when a buyer places their first order (see US-09). The Customer " +
    "Detail page is the read view for that record \u2014 it shows the business identity (name, contact), full address, " +
    "system identifiers (Customer ID, Registered Date, GST if applicable), and the customer's location on a map. " +
    "Tapping the map opens the location in Google Maps in a new tab so the seller can verify the address or plan a visit."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor reviewing a single customer",
      "See everything I need to know about a customer in one place \u2014 contact, address, GST, location",
      "Without a single detail view, the seller hops between order screens and chat to piece together customer context"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Time to verify customer location (open Google Maps from detail) \u2014 target under 10 seconds."),
  num("Detail page renders all sections (Basic Info, Address, Business Info, Map) without errors \u2014 target 100%."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin needs to verify a customer's GST number and exact shop location before approving a credit line. " +
        "Today the seller hunts through invoices and WhatsApp. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin clicks View on the customer row, lands on the Detail page, sees the GST number in Business Information, " +
        "clicks the embedded map, opens Google Maps with the customer's lat / long pre-pinned, and verifies the location \u2014 " +
        "all in one flow."
      }),
    ],
  }),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "view a single customer's full profile including basic info, address, business info and location map",
    "I have one read view that surfaces everything I need to verify identity, contact and location",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks View on a row in the Customers list" },
    { key: "When", value: "the Customer Detail page loads" },
    { key: "Then", value: "the page header shows the Business Name (large) with Customer Name and Mobile Number directly below it." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Customer Detail page is rendered" },
    { key: "When", value: "the user inspects the body" },
    { key: "Then", value: "three sections are shown in order: 1) Basic Information, 2) Address Details, 3) Business Information." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Basic Information section is rendered" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the section shows: Customer Name, Mobile Number, Class Type / Category, and Email (if present)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Address Details section is rendered" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the section shows: Full Address, City, State, Pincode, Latitude, Longitude." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Business Information section is rendered" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the section shows: Customer ID (system-generated, e.g., CUST-001 \u2014 read-only), Registered Date (date of first order), GST Number (only when present), and a Location on Map sub-component." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the customer has a valid latitude and longitude" },
    { key: "When", value: "the Location on Map sub-component renders" },
    { key: "Then", value: "an embedded map preview is shown with a marker at the customer's lat / long." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Seller Admin clicks the embedded map preview" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the system opens Google Maps in a new browser tab with the customer's lat / long as the destination, so the seller can verify the exact location." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the customer does not have a GST Number" },
    { key: "When", value: "the Business Information section renders" },
    { key: "Then", value: "the GST Number field is not shown (or shown as \"\u2014\") and is never displayed as an empty input." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Customer Detail is a read-only view in Phase 1 \u2014 no editable fields."],
      ["BR-2", "Customer ID is system-generated (e.g., CUST-001) and never editable."],
      ["BR-3", "Registered Date is the date of the customer's FIRST order through this distributor (see US-09); it is never edited."],
      ["BR-4", "GST Number is optional. When absent, the field is hidden / shown as a dash; never an empty input."],
      ["BR-5", "Location on Map renders only when both latitude and longitude are present and within valid ranges (-90 \u2264 lat \u2264 90; -180 \u2264 long \u2264 180)."],
      ["BR-6", "Clicking the embedded map preview opens Google Maps in a new tab using the URL pattern https://maps.google.com/?q=<lat>,<long>. [NEEDS INPUT] confirm canonical URL pattern (e.g., place URL vs query URL)."],
      ["BR-7", "Customer Detail enforces the same tenant scope as the list \u2014 a Seller Admin can only open detail pages for customers that belong to their own distributor record."],
    ],
    [1, 9],
  ),
  subBanner("Data Specification (Detail fields)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Business Name", "String", "Yes", "Non-empty; displayed as page header.", "Customer master."],
      ["Customer Name", "String", "Yes", "Non-empty; displayed beneath Business Name.", "Customer master."],
      ["Mobile Number", "String", "Yes", "Unique per distributor; matching key for auto-creation (US-09).", "Customer master."],
      ["Class Type / Category", "Enum", "Yes", "One of the 8 allowed values (BR-9 of US-07).", "Customer master."],
      ["Email", "String", "No", "Valid email format if present.", "Customer master (optional)."],
      ["Full Address", "String", "Yes", "Non-empty.", "Customer master."],
      ["City", "String", "Yes", "Non-empty.", "Customer master."],
      ["State", "String", "Yes", "Non-empty.", "Customer master."],
      ["Pincode", "String", "Yes", "6-digit Indian pincode.", "Customer master."],
      ["Latitude", "Decimal", "Yes (for map)", "-90 to 90.", "Customer master."],
      ["Longitude", "Decimal", "Yes (for map)", "-180 to 180.", "Customer master."],
      ["Customer ID", "String", "Yes", "System-generated (CUST-NNN); read-only.", "Auto on create (US-09)."],
      ["Registered Date", "Date", "Yes", "Date of first order; read-only.", "Auto on first order (US-09)."],
      ["GST Number", "String", "No", "If present, valid GSTIN format. [NEEDS INPUT] confirm regex.", "Customer master (optional)."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Latitude / Longitude missing or out of range", "Map sub-component is hidden; Address Details still rendered; no error."],
      ["2", "GST Number missing", "GST field hidden / shown as \"\u2014\"; no empty input."],
      ["3", "Email missing", "Email row hidden; no empty input."],
      ["4", "Customer record not found (deep link to deleted / wrong ID)", "Show error state \"Customer not found\"; offer Back to Customers button."],
      ["5", "Pop-up blocker prevents Google Maps tab from opening", "Provide a fallback \"Open in Google Maps\" link the user can right-click / copy."],
      ["6", "Seller Admin opens detail for a customer of another distributor (URL tampering)", "403 Forbidden; redirect to Customers list with error toast."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-CUSD-01", "Detail load API fails", "\"Unable to load customer. Please retry.\"", "Show retry CTA; preserve URL."],
      ["ERR-CUSD-02", "Customer not found / not in distributor scope", "\"Customer not found.\"", "Show error state with Back to Customers button."],
      ["ERR-CUSD-03", "Map tile provider fails", "\"Map preview is unavailable. Use the Open in Google Maps link.\"", "Hide map preview; surface fallback link."],
      ["ERR-CUSD-04", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login; preserve target URL."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks View on a customer row.",
    "2. System loads the customer record scoped to the distributor.",
    "3. [DECISION] Record exists and is in scope?",
    "   IF no:    Show \"Customer not found\" error (ERR-CUSD-02); offer Back to Customers; EXIT.",
    "   ELSE:     Render header (Business Name; Customer Name + Mobile) and the three sections.",
    "4. Render Basic Information (Customer Name, Mobile, Class Type / Category, Email if present).",
    "5. Render Address Details (Full Address, City, State, Pincode, Latitude, Longitude).",
    "6. Render Business Information (Customer ID, Registered Date, GST if present, Map sub-component).",
    "7. [DECISION] Latitude / Longitude valid?",
    "   IF yes:   Render embedded map preview with marker.",
    "   ELSE:     Hide map sub-component.",
    "8. [DECISION] Seller Admin clicks the map preview?",
    "   IF yes:   Open Google Maps in new tab using the customer's lat / long.",
    "9. Seller Admin clicks Back to Customers \u2192 returns to the list.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Customers \u2014 Detail",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (Customers active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header",
    "    \u2502   \u251c\u2500 Back to Customers breadcrumb",
    "    \u2502   \u251c\u2500 H1: <Business Name>",
    "    \u2502   \u2514\u2500 Sub-line: <Customer Name>  \u00b7  <Mobile Number>",
    "    \u251c\u2500 Section: Basic Information",
    "    \u2502   \u251c\u2500 Customer Name",
    "    \u2502   \u251c\u2500 Mobile Number",
    "    \u2502   \u251c\u2500 Class Type / Category",
    "    \u2502   \u2514\u2500 Email (if present)",
    "    \u251c\u2500 Section: Address Details",
    "    \u2502   \u251c\u2500 Full Address",
    "    \u2502   \u251c\u2500 City",
    "    \u2502   \u251c\u2500 State",
    "    \u2502   \u251c\u2500 Pincode",
    "    \u2502   \u251c\u2500 Latitude",
    "    \u2502   \u2514\u2500 Longitude",
    "    \u2514\u2500 Section: Business Information",
    "        \u251c\u2500 Customer ID (e.g., CUST-001)",
    "        \u251c\u2500 Registered Date (date of first order)",
    "        \u251c\u2500 GST Number (only when present)",
    "        \u2514\u2500 Location on Map (embedded preview \u2192 click opens Google Maps in new tab)",
  ]),
  subBanner("User Flow"),
  num("Seller Admin clicks View on a customer row in the Customers list."),
  num("Detail page loads with header + three sections."),
  num("Seller Admin reviews Basic Info / Address / Business Info."),
  num("Seller Admin clicks the embedded map \u2192 Google Maps opens in a new tab pinned to the customer's lat / long."),
  num("Seller Admin clicks Back to Customers \u2192 returns to the list."),
  subBanner("Field Validations"),
  notApplicable("Customer Detail is read-only in Phase 1; there are no input fields. Field-level validation lives on the customer record itself (set on creation in US-09)."),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Location on Map \u2014 lat / long missing or invalid", "Map preview is not available for this customer.", "\u2014"],
      ["Customer not found", "We couldn't find this customer.", "\"Back to Customers\""],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR-CUSD-01", "Unable to load customer. Please retry.", "GET /customers/<id> failed: <statusCode>"],
      ["ERR-CUSD-02", "Customer not found.", "404 on /customers/<id> or out-of-scope tenant"],
      ["ERR-CUSD-03", "Map preview is unavailable. Use the Open in Google Maps link.", "map_tile_provider_failure"],
      ["ERR-CUSD-04", "Your session has expired. Please log in again.", "401 Unauthorized on /customers/<id>"],
    ],
    [3, 6, 5],
  ),
];

// ---------- USER STORY 9 \u2014 Customers: Auto-Create on First Order ----------
const us09 = [
  ...storyBanner(
    "USER STORY 9",
    "Customers \u2014 Auto-Create on First Order (Backend Workflow)",
    "Epic: Seller Admin \u2014 Customer Management   |   Priority: Critical   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Customers \u2014 Auto-Create on First Order (Backend Workflow)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Customer Management"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Critical \u2014 every other Customer story (US-07, US-08) depends on customer records existing in the first place; this rule defines how they come into being."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Backend system \u2014 triggered by a buyer placing an order. End-user-visible side: Seller Admin sees the new customer appear in the Customers list."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "In Phase 1 there is no separate \"customer signup\" flow \u2014 customers are created implicitly the first time a buyer " +
    "places an order with a given distributor. The unique key is the buyer's Mobile Number per distributor: if a customer " +
    "with that mobile already exists for the distributor, the order is attached to the existing customer; if not, a new " +
    "customer record is created on the fly. This rule keeps the seller's customer list accurate and de-duplicated without " +
    "any onboarding burden on either side."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin (read-side)", "Distributor", "See every buyer who has ordered, automatically",
      "Manual customer creation invites typos and duplicates"],
     ["Backend system (write-side)", "Order placement service", "Idempotently link or create the customer record per order",
      "Without a deterministic key, the same buyer can be split across multiple records"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Zero duplicate customer records per distributor for the same Mobile Number \u2014 target 100%."),
  num("Time from order placement to the new customer being visible in the Customers list \u2014 target under 5 seconds."),
  num("First-order auto-create success rate \u2014 target above 99.5%."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "A new Kirana store places its first order with the distributor. There is no customer record yet. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "The order placement service detects no existing customer with that Mobile Number for the distributor, creates a new " +
        "customer record using the order's contact / address fields, generates a Customer ID (CUST-NNN), sets Registered Date " +
        "to today, attaches the order to the new customer, and the Customers list shows the new entry immediately. The next " +
        "order from the same Mobile Number is attached to the same record (no duplicate)."
      }),
    ],
  }),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Order placement service",
    "look up or create the customer record for the buyer using Mobile Number as the unique key per distributor",
    "every order is linked to exactly one customer and the Seller Admin's Customers list stays accurate and de-duplicated",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "a buyer places an order with a distributor and there is no existing customer record for that distributor + Mobile Number combination" },
    { key: "When", value: "the order is accepted by the order placement service" },
    { key: "Then", value: "a new customer record is created with: Customer ID (system-generated), Customer Name, Business Name, Mobile Number, Class Type / Category, Address fields (Full Address, City, State, Pincode, Latitude, Longitude), GST Number (if provided), Email (if provided), Registered Date = today." },
    { key: "And", value: "the order is linked to the newly created customer record." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "a buyer places an order with a distributor and a customer record already exists for that distributor + Mobile Number combination" },
    { key: "When", value: "the order is accepted" },
    { key: "Then", value: "no new customer record is created; the order is linked to the existing customer record; the existing customer's totalOrders count is incremented." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the buyer has placed an order with Distributor A in the past and now places their first order with Distributor B" },
    { key: "When", value: "Distributor B's order placement service runs the lookup" },
    { key: "Then", value: "a new customer record is created for Distributor B (Mobile Number uniqueness is scoped per-distributor, not global)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "two orders from the same Mobile Number arrive concurrently for the same distributor and there is no existing customer yet" },
    { key: "When", value: "the order placement service processes them" },
    { key: "Then", value: "exactly one customer record is created; the second order is linked to the same record (atomic upsert by [distributor, mobile])." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "a customer record was just auto-created" },
    { key: "When", value: "the Seller Admin opens the Customers list" },
    { key: "Then", value: "the new customer appears in the list within 5 seconds; KPI cards (Total / New This Month) reflect the new record." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the order's Mobile Number is missing, malformed, or fails the format check" },
    { key: "When", value: "the order placement service runs" },
    { key: "Then", value: "the order is rejected with a clear error before any customer record is touched." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Mobile Number is the unique customer key, scoped per distributor. The composite key is [distributor_id, mobile_number]."],
      ["BR-2", "Customer creation is implicit \u2014 there is no separate signup or invite flow in Phase 1. Customers come into existence only via first-order placement."],
      ["BR-3", "Registered Date is set to the date of the FIRST order. It is never updated by subsequent orders."],
      ["BR-4", "Customer ID is system-generated, monotonically allocated per distributor (e.g., CUST-001, CUST-002, ...). Format: \"CUST-\" + zero-padded sequence. [NEEDS INPUT] confirm exact format / padding."],
      ["BR-5", "If the order carries fields the existing customer record does not have (e.g., GST Number, Email), [NEEDS INPUT] confirm whether the existing record is enriched or left untouched. Default proposal: enrich missing optional fields, never overwrite filled fields."],
      ["BR-6", "If the order carries fields that conflict with the existing customer record (e.g., different Business Name), the existing record is NOT overwritten by the order. [NEEDS INPUT] confirm whether to flag for manual review."],
      ["BR-7", "totalOrders on the customer record is incremented atomically with the order linkage."],
      ["BR-8", "The auto-create operation MUST be atomic on [distributor_id, mobile_number] to prevent duplicates under concurrent first orders."],
      ["BR-9", "Mobile Number format validation happens before customer lookup. Invalid format -> reject the order; do not create a customer."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "First-time buyer places an order", "New customer created; order linked; Registered Date = today."],
      ["2", "Repeat buyer places second order", "No new record; order linked to existing customer; totalOrders incremented; Registered Date NOT changed."],
      ["3", "Same buyer orders from a new distributor for the first time", "New customer record created scoped to that distributor (per BR-1)."],
      ["4", "Two concurrent first orders from the same Mobile + Distributor", "Atomic upsert ensures exactly one customer; both orders linked (per BR-8)."],
      ["5", "Mobile Number is malformed or missing on the order", "Order rejected before any customer record is created (per BR-9)."],
      ["6", "Existing customer has no GST Number; new order carries a GST Number", "[NEEDS INPUT] enrich existing record vs leave untouched (default proposal: enrich missing optional fields)."],
      ["7", "Existing customer's Business Name differs from the new order's Business Name", "Existing record is NOT overwritten (per BR-6); [NEEDS INPUT] decide flagging behaviour."],
      ["8", "Order is later cancelled before fulfillment", "Customer record is NOT deleted; totalOrders [NEEDS INPUT] confirm whether to decrement on cancellation."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-CUSC-01", "Mobile Number missing / malformed on the order", "\"A valid mobile number is required to place this order.\"", "Reject order; do not create customer; surface error to ordering channel."],
      ["ERR-CUSC-02", "Database conflict during atomic upsert", "(internal)", "Retry once; if still failing, fail the order with a generic order-failure error and alert ops."],
      ["ERR-CUSC-03", "Customer ID generation collision", "(internal)", "Re-allocate next ID; alert ops if collision rate exceeds threshold."],
      ["ERR-CUSC-04", "Persisted customer not visible in list within 5 seconds", "(internal SLO breach)", "Log SLO breach for investigation; user-facing impact is none beyond list latency."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Customer fields populated on first-order auto-create)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Customer ID", "String", "Yes", "System-generated; format CUST-NNN; unique per distributor.", "Auto on create."],
      ["Distributor ID", "String", "Yes", "Composite-key part with Mobile.", "Order context."],
      ["Mobile Number", "String", "Yes", "Indian mobile format; uniqueness key.", "Order's buyer record."],
      ["Customer Name", "String", "Yes", "Non-empty.", "Order's buyer record."],
      ["Business Name", "String", "Yes", "Non-empty.", "Order's buyer record."],
      ["Class Type / Category", "Enum", "Yes", "One of the 8 allowed values (BR-9 of US-07).", "Order context / buyer record."],
      ["Full Address", "String", "Yes", "Non-empty.", "Order's delivery address."],
      ["City / State / Pincode", "String", "Yes", "City + State + 6-digit pincode.", "Order's delivery address."],
      ["Latitude / Longitude", "Decimal", "Yes (when available)", "-90 to 90 / -180 to 180.", "Order's delivery address (when geocoded)."],
      ["Email", "String", "No", "Valid email if present.", "Order's buyer record (optional)."],
      ["GST Number", "String", "No", "Valid GSTIN if present.", "Order's buyer record (optional)."],
      ["Registered Date", "Date", "Yes", "= date of this first order; never updated thereafter.", "Auto on first order."],
      ["totalOrders", "Integer", "Yes", "Initialised to 1 on create; incremented on subsequent orders.", "Auto."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Order placement service receives a new order for distributor D from buyer B.",
    "2. Validate buyer's Mobile Number format.",
    "   IF invalid:  Reject order with ERR-CUSC-01; EXIT.",
    "   ELSE:        Proceed.",
    "3. Look up customer by composite key [distributor_id = D, mobile_number = B.mobile].",
    "4. [DECISION] Customer record exists?",
    "   IF yes:   Link order to existing customer; increment totalOrders; (optionally) enrich missing optional fields per BR-5.",
    "   IF no:    Atomic upsert to create a new customer record:",
    "             - Allocate Customer ID (CUST-NNN)",
    "             - Populate fields from the order: Customer Name, Business Name, Mobile, Class Type, Address",
    "             - Populate optional fields if present: Email, GST, Latitude, Longitude",
    "             - Set Registered Date = today",
    "             - Set totalOrders = 1",
    "             - Link this order to the new customer",
    "5. Persist atomically (idempotent on [distributor_id, mobile_number]).",
    "6. Emit \"customer.created\" or \"customer.linked\" event for downstream consumers (Customers list cache, KPIs, etc.).",
    "7. New / updated customer is visible in the Seller Admin's Customers list within the freshness SLO (\u2264 5 seconds).",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  notApplicable("US-09 is a backend workflow story \u2014 there is no dedicated screen. The user-visible effect is captured by US-07 (new customer appears in the list / KPIs update) and US-08 (the customer's detail page is now reachable). Customer-facing order-placement UI is out of scope for this story."),
];

// ---------- USER STORY 10 \u2014 Offers & Schemes: List Page ----------
const us10 = [
  ...storyBanner(
    "USER STORY 10",
    "Offers & Schemes \u2014 List Page (KPI Cards, Search, Filter, Row Actions)",
    "Epic: Seller Admin \u2014 Offers & Schemes (QPS)   |   Priority: High   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Offers & Schemes \u2014 List Page (KPI Cards, Search, Filter, Row Actions)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Offers & Schemes (QPS)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 the Offers list is the seller's working view of every Quantity Pricing Scheme (QPS) and the entry point to creating, editing or retiring schemes."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor running quantity-based pricing offers."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Phase 1 of Offers & Schemes ships a single offer type: Quantity Pricing Scheme (QPS). A QPS attaches one or more " +
    "quantity slabs to a SKU (e.g., buy 1\u201311 units at \u20b9171, 12\u201347 at 5% off, 48+ at 10% off) and runs over a defined " +
    "validity window. The list page is the seller's working view of every QPS \u2014 KPI cards summarise the portfolio, " +
    "search and filter narrow the table, and per-row actions let the seller view, edit or delete schemes. Without this " +
    "page the seller has no operational visibility into their offers and cannot tell which SKUs are currently discounted."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor managing quantity-based offers",
      "See every QPS at a glance, find a specific scheme quickly, and act on it (view / edit / delete)",
      "Without a unified list, schemes are tracked in spreadsheets and the seller cannot tell which SKUs are currently on offer"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Time to locate a specific scheme by SKU code or name \u2014 target under 5 seconds."),
  num("KPI card values reconcile with the underlying list filtered to the same definition \u2014 target 100% accuracy."),
  num("Active Schemes count is always within \u00b1 1 second of the source-of-truth scheme state (driven by start / end dates)."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin runs 30+ QPS offers across their catalog. To check which are active today and which are about to " +
        "expire, the seller has to open each scheme individually. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin opens Offers & Schemes, sees three KPI cards (Total QPS Schemes / Active Schemes / Total Pricing " +
        "Rules), filters by Status = Active, searches by SKU name, and acts on the row \u2014 view details, edit, or delete \u2014 " +
        "in seconds."
      }),
    ],
  }),

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
    { key: "Then", value: "the system displays three KPI cards in this order: Total QPS Schemes, Active Schemes, Total Pricing Rules." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the seller has at least one scheme" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "the table is shown with columns: SKU Code, SKU Name, Offer Type, Pricing Rules (count), MRP / SP, Validity (Start \u2192 End), Status (badge), Actions." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin types in the search input" },
    { key: "When", value: "the input changes (debounced)" },
    { key: "Then", value: "the list filters to rows where SKU Code OR SKU Name contains the search term (case-insensitive)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin opens the Status filter" },
    { key: "When", value: "one or more statuses are selected from { Active, Inactive, Scheduled, Expired }" },
    { key: "Then", value: "the list refreshes to rows whose Status is in the selected set; applied filters are reflected as removable chips above the table." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Seller Admin clicks the Bulk Import button" },
    { key: "When", value: "the action is triggered" },
    { key: "Then", value: "the system opens the Bulk Import flow for QPS offers. [NEEDS INPUT] full Bulk Import flow specification (template structure, validation rules, partial-commit policy, error codes) to be authored as a separate story when product is ready." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Seller Admin clicks the Create QPS Offer button" },
    { key: "When", value: "the action is triggered" },
    { key: "Then", value: "the system opens the Create QPS Offer dialog (US-11)." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "a row's status is Active, Inactive or Scheduled" },
    { key: "When", value: "the Actions column renders" },
    { key: "Then", value: "all three actions are enabled and visible: View Details, Edit, Delete." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "a row's status is Expired" },
    { key: "When", value: "the Actions column renders" },
    { key: "Then", value: "only View Details and Delete are enabled; Edit is disabled with a tooltip \"Expired schemes cannot be edited.\"" },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the Seller Admin clicks Delete on any row" },
    { key: "When", value: "the action is triggered" },
    { key: "Then", value: "a confirmation dialog is shown; on confirm the scheme is deleted and the list / KPI cards refresh." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Phase 1 supports a single Offer Type: Quantity Pricing Scheme (QPS). The Offer Type column is informational."],
      ["BR-2", "Total QPS Schemes = count of all schemes for this distributor (any status)."],
      ["BR-3", "Active Schemes = count of schemes whose Status is Active right now."],
      ["BR-4", "Total Pricing Rules = total number of pricing slabs across all schemes (sum of slab counts)."],
      ["BR-5", "Status values are: Active, Inactive, Scheduled, Expired. Status is derived from the scheme's Active/Inactive toggle plus the Start / End dates: Scheduled = future-dated; Active = within validity AND toggle is on; Inactive = within validity AND toggle is off; Expired = end date in the past (auto, irreversible)."],
      ["BR-6", "Edit is disabled for Expired schemes (irreversible state)."],
      ["BR-7", "Delete is allowed in any state (subject to confirmation). [NEEDS INPUT] confirm whether deleting an Active scheme is allowed without first deactivating it."],
      ["BR-8", "Search matches against SKU Code OR SKU Name only (case-insensitive, contains-match)."],
      ["BR-9", "The list is scoped to the logged-in distributor."],
      ["BR-10", "[NEEDS INPUT] Default sort order of the list (e.g., Status priority? Validity end date ascending?)."],
      ["BR-11", "[NEEDS INPUT] Pagination model on this list (page size, controls). If 25-per-page like other lists, confirm."],
    ],
    [1, 9],
  ),
  subBanner("KPI Card Definitions"),
  makeTable(
    ["Card #", "Label", "Definition", "Source"],
    [
      ["1", "Total QPS Schemes", "All QPS schemes for this distributor, any status.", "COUNT(schemes WHERE distributor = current seller)"],
      ["2", "Active Schemes", "Schemes whose Status is Active right now.", "COUNT(schemes WHERE status = 'Active')"],
      ["3", "Total Pricing Rules", "Sum of pricing slabs across all schemes.", "SUM(scheme.slabs.count)"],
    ],
    [1, 4, 7, 5],
  ),
  subBanner("Action Permissions by Status"),
  makeTable(
    ["Status", "View Details", "Edit", "Delete"],
    [
      ["Active", "Yes", "Yes", "Yes"],
      ["Inactive", "Yes", "Yes", "Yes"],
      ["Scheduled", "Yes", "Yes", "Yes"],
      ["Expired", "Yes", "No (disabled with tooltip)", "Yes"],
    ],
    [3, 3, 4, 3],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller has zero schemes", "Empty state shown; KPI cards = 0; Bulk Import and Create QPS Offer buttons remain visible so the user can start."],
      ["2", "Search returns zero rows", "Show \"No schemes match your search\"; pagination footer hidden; Clear Search CTA."],
      ["3", "Status filter returns zero rows", "Show \"No schemes match the selected status\"; chips remain editable; Clear Filters CTA."],
      ["4", "Scheme transitions from Scheduled \u2192 Active during the session (start date hits now)", "On next list refresh / interaction, Status badge flips to Active and Active Schemes KPI is incremented."],
      ["5", "Scheme transitions from Active \u2192 Expired (end date passes)", "Status badge flips to Expired; Edit becomes disabled; Active Schemes KPI is decremented."],
      ["6", "Seller deletes the last Active scheme", "Active Schemes KPI \u2192 0; the scheme is removed from the list."],
      ["7", "Seller toggles Active \u2192 Inactive on a scheme that is in validity", "Status flips Active \u2192 Inactive; Active Schemes KPI is decremented; the scheme remains in the list."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-OFR-01", "List load API fails", "\"Unable to load offers. Please retry.\"", "Show retry CTA; preserve search / filter state."],
      ["ERR-OFR-02", "Search request fails", "\"Search is temporarily unavailable. Please try again.\"", "Keep previously loaded list visible; non-blocking toast."],
      ["ERR-OFR-03", "Delete request fails", "\"Could not delete the scheme. Please retry.\"", "Keep scheme in list; offer retry."],
      ["ERR-OFR-04", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login; preserve target URL."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (List Columns)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["SKU Code", "String", "Yes", "Belongs to a SKU in this distributor's catalog.", "Scheme record \u2192 SKU master."],
      ["SKU Name", "String", "Yes", "Display only.", "SKU master."],
      ["Offer Type", "Enum", "Yes", "Phase 1: \"QPS\" only.", "Scheme record."],
      ["Pricing Rules", "Integer", "Yes", "Count of slabs on the scheme; 1\u20134.", "Computed from scheme.slabs."],
      ["MRP / SP", "Decimal", "Yes", "Display reference \u2014 MRP and Selling Price of the SKU.", "SKU master (snapshot)."],
      ["Validity", "DateRange", "Yes", "Start Date \u2192 End Date (DD-MMM-YYYY).", "Scheme record."],
      ["Status", "Enum", "Yes", "One of Active, Inactive, Scheduled, Expired.", "Derived from Active toggle + dates."],
      ["Actions", "Control", "Yes", "View Details / Edit / Delete (Edit disabled when Expired).", "UI control."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks Offers & Schemes in the left navigation.",
    "2. System loads schemes scoped to the distributor and recomputes Status based on start / end dates.",
    "3. System renders three KPI cards (Total / Active / Total Pricing Rules) and the table with row actions per status.",
    "4. [DECISION] Seller Admin chooses an action (any order, can combine):",
    "   IF Search:                          Filter list by SKU Code / SKU Name.",
    "   IF Filter (Status):                 Apply status set; chips render; pagination resets.",
    "   IF Bulk Import:                     Open Bulk Import flow [NEEDS INPUT].",
    "   IF Create QPS Offer:                Open Create QPS dialog (US-11).",
    "   IF View Details (any status):       Open the scheme in read-only detail view.",
    "   IF Edit (Active / Inactive / Sched):Open the scheme in edit dialog (reuse Create dialog form).",
    "   IF Delete (any status):             Confirm \u2192 delete \u2192 refresh list & KPIs.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Offers & Schemes \u2014 List View",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (Offers & Schemes active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header",
    "    \u2502   \u2514\u2500 Title: \"Offers & Schemes\"",
    "    \u251c\u2500 KPI Cards Row (3 cards)",
    "    \u2502   \u251c\u2500 Total QPS Schemes",
    "    \u2502   \u251c\u2500 Active Schemes",
    "    \u2502   \u2514\u2500 Total Pricing Rules",
    "    \u251c\u2500 Action Bar (top-right cluster)",
    "    \u2502   \u251c\u2500 Search Input  (placeholder: \"Search by SKU code or name...\")",
    "    \u2502   \u251c\u2500 [Status Filter] dropdown / chips: Active | Inactive | Scheduled | Expired",
    "    \u2502   \u251c\u2500 [Bulk Import] button",
    "    \u2502   \u2514\u2500 [+ Create QPS Offer] primary button",
    "    \u251c\u2500 Filter Chips Bar (only when filters applied) + Clear all",
    "    \u251c\u2500 Data Table (8 columns)",
    "    \u2502   SKU Code | SKU Name | Offer Type | Pricing Rules | MRP / SP | Validity | Status (badge) | Actions",
    "    \u2502   Actions per row: [View] [Edit] [Delete]  (Edit disabled when Status = Expired)",
    "    \u2514\u2500 Pagination Footer (if applicable) [NEEDS INPUT]",
  ]),
  subBanner("User Flow"),
  num("Seller Admin clicks Offers & Schemes in the left nav."),
  num("KPI cards + table render; all per-row actions reflect the per-status permissions."),
  num("Seller Admin optionally searches / filters."),
  num("Seller Admin clicks + Create QPS Offer \u2192 Create dialog opens (US-11)."),
  num("Seller Admin clicks Bulk Import \u2192 Bulk Import flow opens [NEEDS INPUT]."),
  num("Seller Admin clicks View Details on a row \u2192 read-only detail view of the scheme."),
  num("Seller Admin clicks Edit (when allowed) \u2192 edit dialog (reuses Create form)."),
  num("Seller Admin clicks Delete \u2192 confirm \u2192 scheme removed; KPIs refresh."),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Search input", "Max 100 chars; trims whitespace.", "\"Search term is too long.\"", "On-input (debounced)"],
      ["Status filter", "Subset of { Active, Inactive, Scheduled, Expired }.", "\u2014", "On-apply"],
      ["Delete confirmation", "Required text or button confirm.", "\u2014", "On-confirm"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Offers & Schemes \u2014 zero schemes", "You have not created any QPS schemes yet. Start with a Bulk Import or create your first scheme.", "\"+ Create QPS Offer\""],
      ["Offers & Schemes \u2014 search returns no rows", "No schemes match your search.", "\"Clear Search\""],
      ["Offers & Schemes \u2014 status filter returns no rows", "No schemes match the selected status.", "\"Clear Filters\""],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR-OFR-01", "Unable to load offers. Please retry.", "GET /offers failed: <statusCode>"],
      ["ERR-OFR-02", "Search is temporarily unavailable. Please try again.", "GET /offers/search failed: <statusCode> <query>"],
      ["ERR-OFR-03", "Could not delete the scheme. Please retry.", "DELETE /offers/<id> failed: <statusCode>"],
      ["ERR-OFR-04", "Your session has expired. Please log in again.", "401 Unauthorized on /offers"],
    ],
    [3, 6, 5],
  ),
];

// ---------- USER STORY 11 \u2014 Create QPS Offer Dialog ----------
const us11 = [
  ...storyBanner(
    "USER STORY 11",
    "Offers & Schemes \u2014 Create QPS Offer Dialog",
    "Epic: Seller Admin \u2014 Offers & Schemes (QPS)   |   Priority: High   |   Owner: Product Team",
  ),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Offers & Schemes \u2014 Create QPS Offer Dialog"],
    ["Epic / Feature Link", "Seller Admin \u2014 Offers & Schemes (QPS)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 the Create dialog is the primary path to introduce a QPS for any SKU; it must enforce all pricing-slab validation rules so invalid schemes never reach the catalog."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor configuring a quantity-based discount for a single SKU."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "A Quantity Pricing Scheme rewards bulk buying with tiered prices: \"buy 1\u201311 at \u20b9171, 12\u201347 at 5% off, 48+ at " +
    "10% off.\" The Create QPS Offer dialog is where the Seller Admin defines this for a single SKU \u2014 picks the SKU, " +
    "sets a validity window, and adds up to four pricing slabs (minimum and maximum quantity, discount type and value). " +
    "The dialog must show the seller exactly what the customer pays at each slab and how much the customer saves, so the " +
    "scheme can be reviewed before going live."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor configuring a single-SKU QPS",
      "Define start / end validity and 1\u20134 quantity slabs with confidence that the math is correct",
      "Manual price math invites mistakes; without inline \"customer pays / saves\" preview, mis-priced offers reach customers"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Time to create a 3-slab QPS for an existing SKU \u2014 target under 60 seconds."),
  num("Save success rate (no validation rejection on Create QPS click) \u2014 target above 95%."),
  num("Zero schemes persisted with overlapping or non-monotonic quantity ranges \u2014 enforced by validation."),
  subBanner("Real-World Scenario"),
  new Paragraph({
    spacing: { before: 60, after: 120 },
    children: [
      new TextRun({ text: "CURRENT STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin wants a tiered offer on Sunflower Oil 5L: \u20b9580 for 1\u20139 units, 5% off for 10\u201347, 8% off for 48+. " +
        "Today the seller has to communicate this offline to buyers. " }),
      new TextRun({ text: "DESIRED STATE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Seller Admin clicks + Create QPS Offer, picks the SKU, sees the existing MRP and Selling Price as context, sets " +
        "the start and end dates, adds three slabs (1\u20139 flat \u20b9580; 10\u201347 percent 5%; 48+ percent 8%), reviews the " +
        "live \"Customer Pays\" and \"You Save\" columns, leaves the Active toggle on, and clicks Create QPS \u2014 the scheme " +
        "appears in the list."
      }),
    ],
  }),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "create a Quantity Pricing Scheme by selecting a SKU, setting a validity window, and adding up to four quantity slabs",
    "I can roll out tiered, time-bound discounts for any SKU in under a minute with the math validated for me",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks + Create QPS Offer on the Offers list" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the Create QPS Offer dialog with sections in this order: SKU selector \u2192 Validity (Start / End dates) \u2192 Pricing Slabs editor \u2192 Active / Inactive toggle \u2192 footer actions (Cancel | Create QPS)." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the dialog is open" },
    { key: "When", value: "the Seller Admin selects a SKU from the catalog selector" },
    { key: "Then", value: "the dialog displays the SKU's existing MRP and Selling Price as read-only context above the slab editor; these values are used to compute Customer Pays and Customer Saves for each slab." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "Start Date and End Date are mandatory" },
    { key: "When", value: "the Seller Admin clicks Create QPS without both dates" },
    { key: "Then", value: "save is blocked with the inline error \"Start date and end date are required.\"" },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin enters a Start Date that is after the End Date" },
    { key: "When", value: "validation runs" },
    { key: "Then", value: "save is blocked with the inline error \"Start date must be on or before end date.\"" },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the dialog opens" },
    { key: "When", value: "the slab editor first renders" },
    { key: "Then", value: "Slab 1 is shown with default fields: Min Qty, Max Qty, Discount Type (dropdown: Flat Price | Percentage Discount), Discount Value, computed Customer Pays, computed Customer Saves." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Seller Admin clicks + Add Slab" },
    { key: "When", value: "the action runs and the current slab count is < 4" },
    { key: "Then", value: "a new slab row is appended below; the slab counter increments." },
    { key: "And", value: "when the slab count reaches 4, the + Add Slab button is disabled with a tooltip \"Maximum 4 slabs per scheme.\"" },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "two or more slabs exist" },
    { key: "When", value: "the Seller Admin clicks the Delete (trash) icon on any slab row" },
    { key: "Then", value: "that slab row is removed; remaining slabs renumber from 1; if only one slab remains, its Delete button is disabled (a scheme must have at least one slab)." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Seller Admin selects Discount Type = Flat Price for a slab" },
    { key: "When", value: "the user enters a Discount Value V" },
    { key: "Then", value: "Customer Pays = V; Customer Saves = SP \u2212 V (where SP is the SKU's Selling Price); validation requires V > 0 and V < SP." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the Seller Admin selects Discount Type = Percentage Discount for a slab" },
    { key: "When", value: "the user enters a Discount Value P (percent)" },
    { key: "Then", value: "Customer Pays = round(SP \u00d7 (1 \u2212 P / 100), 2); Customer Saves = SP \u2212 Customer Pays; validation requires 0 < P < 100." },
  ]),
  ...acBlock("AC-10", [
    { key: "Given", value: "the seller defines multiple slabs" },
    { key: "When", value: "validation runs on Create QPS click" },
    { key: "Then", value: "slabs must be monotonic and non-overlapping: for each slab i, Min Qty(i) \u2264 Max Qty(i) (or Max Qty is open-ended); Min Qty(i+1) = Max Qty(i) + 1 (no gaps, no overlaps); only the LAST slab may have an open-ended Max Qty (\"and above\")." },
  ]),
  ...acBlock("AC-11", [
    { key: "Given", value: "a slab fails any validation rule" },
    { key: "When", value: "the user clicks Create QPS" },
    { key: "Then", value: "save is blocked; each invalid field shows an inline error; the user can fix the issues without losing other data; on next click the system re-validates." },
  ]),
  ...acBlock("AC-12", [
    { key: "Given", value: "all sections pass validation" },
    { key: "When", value: "the Seller Admin clicks Create QPS" },
    { key: "Then", value: "the scheme is created with the chosen Active / Inactive toggle state; the dialog closes; the new scheme appears in the Offers list; KPI cards refresh." },
  ]),
  ...acBlock("AC-13", [
    { key: "Given", value: "the Seller Admin clicks Cancel" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "any unsaved input is discarded; the dialog closes with no scheme created. [NEEDS INPUT] confirm whether a confirmation prompt is required when there are unsaved edits." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "A QPS targets exactly one SKU. Multi-SKU bundles are out of scope for Phase 1."],
      ["BR-2", "Start Date and End Date are mandatory; Start \u2264 End."],
      ["BR-3", "A scheme has at least 1 and at most 4 pricing slabs."],
      ["BR-4", "Discount Type is one of: Flat Price (Customer Pays the entered value) or Percentage Discount (off the SKU's Selling Price)."],
      ["BR-5", "Flat Price value must be > 0 AND < the SKU's Selling Price (otherwise the slab is not actually a discount)."],
      ["BR-6", "Percentage Discount value must be > 0 AND < 100."],
      ["BR-7", "Slabs must be monotonic and non-overlapping by quantity: Min Qty(i+1) = Max Qty(i) + 1; only the last slab may have an open-ended Max Qty (\"and above\")."],
      ["BR-8", "Customer Pays and Customer Saves are computed live from the SKU's current Selling Price and the slab's discount; they are display-only \u2014 the seller cannot type into these fields."],
      ["BR-9", "Active / Inactive toggle on create: Active = the scheme is eligible to take effect (and will be Active when within validity, Scheduled when start date is future, Expired after end date); Inactive = the scheme stays paused regardless of dates."],
      ["BR-10", "Status of a saved scheme is derived: Scheduled when start date > today; Active when within validity AND toggle is on; Inactive when within validity AND toggle is off; Expired when end date < today (irreversible)."],
      ["BR-11", "Only one Active QPS per SKU may be in effect at any time. [NEEDS INPUT] confirm: should the Create flow block the user from creating a second Active scheme on the same SKU, or warn-and-allow?"],
      ["BR-12", "Edit reuses this same dialog with values pre-filled. Edit is disabled for schemes whose Status is Expired (per US-10 BR-6)."],
      ["BR-13", "[NEEDS INPUT] Currency, decimal precision and rounding rule for Customer Pays / Customer Saves (current proposal: 2 decimal places)."],
    ],
    [1, 9],
  ),
  subBanner("Slab Editor \u2014 Field Specification"),
  makeTable(
    ["Field", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Min Qty", "Integer", "Yes", "> 0; Slab 1 starts at 1 by default; Slab(i+1) Min = Slab(i) Max + 1.", "User input."],
      ["Max Qty", "Integer | Open", "Yes (except for the last slab)", "> Min Qty; only the LAST slab may be open-ended (no Max Qty = \"and above\").", "User input."],
      ["Discount Type", "Enum", "Yes", "Flat Price | Percentage Discount.", "Dropdown selection."],
      ["Discount Value", "Decimal", "Yes", "Flat: > 0 AND < Selling Price. Percent: > 0 AND < 100.", "User input."],
      ["Customer Pays", "Decimal", "Computed", "Flat: = Discount Value. Percent: = round(SP \u00d7 (1 - V / 100), 2).", "Computed read-only."],
      ["Customer Saves", "Decimal", "Computed", "= SP \u2212 Customer Pays.", "Computed read-only."],
    ],
    [3, 2, 3, 5, 4],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller Admin selects a SKU with no Selling Price set", "Block with error \"This SKU has no Selling Price. Set price on the SKU Detail page first.\"; SKU selector remains usable to pick another."],
      ["2", "Seller Admin tries to add a 5th slab", "+ Add Slab is disabled with tooltip \"Maximum 4 slabs per scheme.\""],
      ["3", "Seller Admin defines Slab 1 = 1\u20135, Slab 2 = 7\u201310 (gap)", "Slab 2 inline error: \"Min Qty must be <previous Max + 1>.\""],
      ["4", "Seller Admin defines Slab 1 = 1\u20135, Slab 2 = 4\u201310 (overlap)", "Slab 2 inline error: \"Min Qty must be <previous Max + 1>.\""],
      ["5", "Seller Admin marks Slab 2 as the last slab and leaves Max Qty empty (\"and above\")", "Allowed; the row visually reads \"\u2265 Min Qty\"; computation works as expected."],
      ["6", "Seller Admin enters Discount Value = SP exactly (Flat)", "Inline error: \"Flat price must be less than the SKU's Selling Price.\""],
      ["7", "Seller Admin enters Discount Value = 100 exactly (Percent)", "Inline error: \"Discount must be less than 100%.\""],
      ["8", "Seller Admin selects an existing Active scheme's SKU and tries to create another Active scheme on the same SKU", "[NEEDS INPUT] confirm: hard block or warn-and-allow (BR-11)."],
      ["9", "Seller Admin sets Start Date = today and toggles Active = ON", "On Save, scheme Status = Active immediately."],
      ["10", "Seller Admin sets Start Date = future and toggles Active = ON", "On Save, scheme Status = Scheduled until start date hits."],
      ["11", "Seller Admin sets End Date = past (typo)", "Inline error \"End date must be today or later.\" \u2014 the seller can fix without losing slab data."],
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
      ["ERR-OFRC-04", "Slab validation failure on Save", "Per-slab inline messages (see Edge Cases).", "Block save; do not call API."],
      ["ERR-OFRC-05", "Session expired during edit", "\"Your session has expired. Please log in again.\"", "Redirect to login; preserve target URL."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Scheme record persisted on Create)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Scheme ID", "String", "Yes", "System-generated; unique per distributor.", "Auto on create."],
      ["Distributor ID", "String", "Yes", "Tenant scope.", "Session."],
      ["SKU ID / Code", "String", "Yes", "Belongs to this distributor's catalog.", "User selection."],
      ["Offer Type", "Enum", "Yes", "Phase 1: \"QPS\" only.", "System."],
      ["Start Date", "Date", "Yes", "<= End Date.", "User input."],
      ["End Date", "Date", "Yes", ">= Start Date; >= today on create.", "User input."],
      ["Slabs[]", "Array (1\u20134)", "Yes", "Per slab: Min, Max, Discount Type, Discount Value (per BR-3..BR-7).", "User input."],
      ["Active Toggle", "Boolean", "Yes", "ON / OFF; combined with dates to derive Status.", "User input."],
      ["Status (derived)", "Enum", "Yes", "Active | Inactive | Scheduled | Expired (per BR-10).", "Computed."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks + Create QPS Offer on the Offers list (US-10).",
    "2. System opens the Create QPS dialog with one empty Slab 1 and the Active toggle set to ON by default.",
    "3. Seller Admin selects a SKU from the catalog selector.",
    "4. System loads the SKU's MRP and Selling Price; renders them as read-only context.",
    "5. Seller Admin enters Start Date and End Date.",
    "6. Seller Admin configures Slab 1: Min Qty / Max Qty / Discount Type / Discount Value.",
    "   - Customer Pays and Customer Saves recompute live as values change.",
    "7. (Optional) Seller Admin clicks + Add Slab to add up to 4 slabs total.",
    "8. (Optional) Seller Admin clicks Delete (trash) on a slab to remove it (cannot delete the last remaining slab).",
    "9. (Optional) Seller Admin toggles Active / Inactive.",
    "10. [DECISION] Seller Admin clicks an action:",
    "    IF Cancel:        Discard inputs; close dialog; EXIT.",
    "    IF Create QPS:    Proceed to step 11.",
    "11. System runs validation (dates, per-slab rules, monotonic / non-overlapping ranges, BR-11 single-active-per-SKU check).",
    "12. [DECISION] Validation result:",
    "    IF any rule fails:  Block save; show inline errors; preserve values; return to step 6/7.",
    "    ELSE:               Persist scheme; derive Status from toggle + dates; close dialog.",
    "13. Offers list refreshes; new scheme appears with the correct Status badge; KPI cards update.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Dialog: Create QPS Offer",
    "\u251c\u2500 Header: \"Create QPS Offer\" + close (X)",
    "\u251c\u2500 Section: Select SKU",
    "\u2502   \u251c\u2500 SKU selector (search + dropdown, scoped to distributor catalog)",
    "\u2502   \u2514\u2500 Read-only context: \"MRP: \u20b9<mrp>   Selling Price: \u20b9<sp>\"",
    "\u251c\u2500 Section: Validity",
    "\u2502   \u251c\u2500 Start Date (date picker, required)",
    "\u2502   \u2514\u2500 End Date (date picker, required)",
    "\u251c\u2500 Section: Pricing Slabs",
    "\u2502   \u251c\u2500 Slab table header: # | Min Qty | Max Qty | Discount Type | Discount Value | Customer Pays | You Save | (delete)",
    "\u2502   \u251c\u2500 Slab 1 row (always present, delete disabled when only 1 slab)",
    "\u2502   \u251c\u2500 Slab 2..4 rows (added via + Add Slab; each has a delete trash icon)",
    "\u2502   \u2514\u2500 [+ Add Slab] button (disabled at 4 slabs)",
    "\u251c\u2500 Section: Status",
    "\u2502   \u2514\u2500 Active / Inactive toggle (default ON)",
    "\u2514\u2500 Footer Action Bar: [ Cancel ]   [ + Create QPS ]",
  ]),
  subBanner("User Flow"),
  num("Click + Create QPS Offer on the Offers list \u2192 dialog opens."),
  num("Pick a SKU \u2192 see MRP / SP context."),
  num("Set Start Date and End Date."),
  num("Configure Slab 1; live preview \"Customer Pays\" and \"You Save\"."),
  num("(Optional) Add up to 4 slabs total; delete any slab except the last remaining one."),
  num("(Optional) Toggle Active / Inactive."),
  num("Click Create QPS \u2192 validation runs \u2192 on success the dialog closes and the new scheme appears in the list with the correct Status."),
  num("BACK / CANCEL PATH: Click Cancel or close (X) \u2192 inputs discarded \u2192 dialog closes [NEEDS INPUT \u2014 unsaved-edits guard]."),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["SKU", "Required; must belong to distributor's catalog; must have a Selling Price.", "\"Select a SKU.\" / \"This SKU has no Selling Price.\"", "On-blur / on-save"],
      ["Start Date", "Required; <= End Date.", "\"Start date is required.\" / \"Start date must be on or before end date.\"", "On-blur / on-save"],
      ["End Date", "Required; >= Start Date; >= today.", "\"End date is required.\" / \"End date must be today or later.\"", "On-blur / on-save"],
      ["Slab Min Qty", "Integer > 0; = previous slab Max + 1 (Slab 1 starts at 1 by default).", "\"Min Qty must be <previous Max + 1>.\"", "On-blur / on-save"],
      ["Slab Max Qty", "Integer > Min Qty (open-ended only on last slab).", "\"Max Qty must be greater than Min Qty.\"", "On-blur / on-save"],
      ["Discount Type", "Required; Flat Price | Percentage Discount.", "\"Select a discount type.\"", "On-save"],
      ["Discount Value (Flat)", "> 0; < Selling Price.", "\"Flat price must be greater than 0 and less than the Selling Price.\"", "On-blur / on-save"],
      ["Discount Value (Percent)", "> 0; < 100.", "\"Discount must be greater than 0 and less than 100.\"", "On-blur / on-save"],
      ["Slab count", "1 <= count <= 4.", "\"Maximum 4 slabs per scheme.\" (on Add at 4) / \"Scheme must have at least one slab.\" (on delete attempt of last)", "On-add / on-delete"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["SKU selector \u2014 no SKU chosen yet", "Pick a SKU to load its MRP and Selling Price.", "\u2014"],
      ["Slabs \u2014 only Slab 1 visible", "Add up to 3 more quantity slabs to build your tier.", "\"+ Add Slab\""],
    ],
    [4, 7, 3],
  ),
  subBanner("Error Messages"),
  makeTable(
    ["Error Code", "User-Facing Message", "Technical Log Message"],
    [
      ["ERR-OFRC-01", "Save is taking longer than usual. Please try again.", "POST /offers timed out"],
      ["ERR-OFRC-02", "Could not create the scheme. Please retry.", "POST /offers failed: <statusCode>"],
      ["ERR-OFRC-03", "The selected SKU is no longer available. Please choose another.", "sku_deleted_during_qps_create: <skuId>"],
      ["ERR-OFRC-04", "Please fix the highlighted slab errors before creating.", "client_validation_failed: qps_slabs"],
      ["ERR-OFRC-05", "Your session has expired. Please log in again.", "401 Unauthorized on /offers"],
    ],
    [3, 6, 5],
  ),
];

const openQuestions = [
  H1("Open Questions for the Next Walkthrough Session"),
  num("Default sort order and filter criteria for the My SKU list."),
  num("Allowed values for Status and ONDC Compliance Status."),
  num("Bulk Import \u2014 Add SKUs: supported file formats (.xlsx / .csv) and maximum rows per upload; sync vs async processing model."),
  num("Bulk Import \u2014 Update Price and Stock: handling of duplicate SKU IDs in the same file; thousand-separator handling on numeric fields; concurrent-job behaviour; currency, decimal precision and upper sanity limits for MRP and Selling Price; audit / history requirement."),
  num("SKU Detail \u2014 Product Details: full canonical option lists for Major Unit and Time to Ship; max-length rules for Item Name, Customer Care Name, Manufacturer Address; Country of Origin source (master vs free text); Location ID source (warehouse master vs free text); rules for promoting a non-primary image to primary; behaviour when toggling a SKU to Inactive while it has open orders or is published."),
  num("SKU Detail \u2014 Price & Inventory: relationship between Stock Available toggle and any Infinite Stock flag; whether tier / pack pricing is editable in Phase 1; behaviour of toggling Stock Available to No while open orders exist."),
  num("Unsaved-edit guard requirement when navigating away from SKU Detail tabs."),
  num("ONDC validation rule catalog (V-001 \u2192 V-033) is now captured in the companion document \"Seller-Store-ONDC-SKU-Validation-Rules.docx\" (v1.0). \u2014 RESOLVED."),
  num("Customers list \u2014 Active Customers definition: explicit Active / Inactive flag vs derived from totalOrders > 0."),
  num("Customers list \u2014 default sort order; export file format (.csv vs .xlsx) and the exact set of exported columns."),
  num("Customers detail \u2014 canonical Google Maps URL pattern; valid GSTIN regex; behaviour for pop-up-blocker fallback."),
  num("Customers auto-create \u2014 enrichment policy when an existing record is missing optional fields the new order carries (default proposal: enrich missing optional, never overwrite filled); flagging policy when fields conflict (e.g., different Business Name); whether totalOrders should decrement on order cancellation; canonical Customer ID format / padding."),
  num("Offers & Schemes list \u2014 default sort order; pagination model (page size, controls); whether deleting an Active scheme is allowed without deactivating first."),
  num("Offers & Schemes \u2014 full Bulk Import flow specification (template, validation rules, partial-commit policy, error codes) to be authored as a separate story."),
  num("Create QPS \u2014 single-Active-scheme-per-SKU policy: hard block on second Active scheme, or warn-and-allow; rounding rule and decimal precision for Customer Pays / Customer Saves; unsaved-edits guard on Cancel."),
  num("Pages still to be specified: Orders, Settings, Support."),
  num("Super Admin user stories \u2014 full scope of Super Admin responsibilities beyond seller-admin creation."),
];

// =====================================================================
// ASSEMBLE
// =====================================================================
const doc = new Document({
  creator: "Omkar Charankar",
  title: "Qwipo Seller Store \u2014 User Stories (Phase 1)",
  description: "User stories for the Seller Admin persona, Phase 1 \u2014 enhanced format.",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: COLOR_PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: COLOR_PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: COLOR_ACCENT, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 },
      },
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
              new TextRun({ text: "Qwipo Seller Store \u2014 User Stories (Phase 1)", color: COLOR_MUTED, size: 18 }),
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
              new TextRun({ text: "v0.8 \u2014 28 Apr 2026", color: COLOR_MUTED, size: 18 }),
              new TextRun({ text: "\tPage ", color: COLOR_MUTED, size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], color: COLOR_MUTED, size: 18 }),
              new TextRun({ text: " of ", color: COLOR_MUTED, size: 18 }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], color: COLOR_MUTED, size: 18 }),
            ],
          })],
        }),
      },
      children: [
        ...coverChildren,
        ...scopeChildren,
        ...personasChildren,
        ...navChildren,
        ...indexChildren,
        ...us01,
        ...us02,
        ...us03,
        ...us04,
        ...us05,
        ...us06,
        ...us07,
        ...us08,
        ...us09,
        ...us10,
        ...us11,
        ...openQuestions,
      ],
    },
  ],
});

const outPath = path.join(__dirname, "..", "Seller-Store-User-Stories-Phase1.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote:", outPath);
});
