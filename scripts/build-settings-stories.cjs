// Build the Settings module user-stories Word document.
// Run with: node scripts/build-settings-stories.cjs
//
// Produces: Seller-Store-Settings-User-Stories-Phase1.docx
//
// Style mirrors the Orders / Offers / Support module docs.
// Stories are grounded against:
//   src/app/pages/settings.tsx (hub)
//   src/app/pages/settings/store-settings.tsx
//   src/app/pages/settings/order-settings.tsx
//   src/app/pages/settings/shipping-settings.tsx
//   src/app/pages/settings/serviceability-settings.tsx
//   src/app/pages/settings/payment-settings.tsx
//   src/app/pages/settings/customer-settings.tsx
//   src/app/pages/settings/communication-settings.tsx
//   src/app/components/CustomerSettingsDrawer.tsx
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
    children: [new TextRun({ text: "Settings \u2014 Phase 1", bold: true, size: 36, color: COLOR_ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
    children: [new TextRun({ text: "User Story Specifications", italics: true, size: 28, color: COLOR_MUTED })],
  }),
  metaTable([
    ["Document Type", "User Story Specifications \u2014 Settings Module"],
    ["Module", "Seller Admin \u2014 Settings (Hub + 7 sub-pages)"],
    ["Persona", "Seller Admin (Distributor)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Total Stories", "8 (ST-01 through ST-08)"],
    ["Version", "1.0 \u2014 Draft (initial dedicated coverage of Settings module)"],
    ["Date", "2 May 2026"],
    ["Status", "Ready for Dev"],
    ["Document Owner", "Omkar Charankar"],
    ["Companion Documents",
      "Seller-Store-User-Stories-Phase1.docx; Seller-Store-Super-Admin-User-Stories-Phase1.docx; Seller-Store-Orders-User-Stories-Phase1.docx; Seller-Store-Offers-Schemes-User-Stories-Phase1.docx; Seller-Store-Support-User-Stories-Phase1.docx; Seller-Store-ONDC-SKU-Validation-Rules.docx."],
  ]),
];

const scope = [
  H1("Document Scope & Note to Reviewer"),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "This document is the dedicated user-story specification for the Qwipo Seller Store \u2014 Settings module under the " +
        "Seller Admin persona. The Settings hub at /settings exposes a 6-card grid that links to seven sub-pages: Store, " +
        "Order, Shipping, Serviceability, Payment, Customer, and Communication. Two of the sub-pages \u2014 Shipping and " +
        "Payment \u2014 are gated as \"Coming Soon\" on the hub even though their underlying implementations are present in " +
        "the codebase; this document captures the desired Phase 1 behaviour for both the gated state and the full " +
        "implementation so the spec is ready when product flips them on."
      }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "GROUNDING: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text: "Stories are grounded in the actual implementation under " }),
      new TextRun({ text: "src/app/pages/settings.tsx", font: "Consolas", color: COLOR_ACCENT }),
      new TextRun({ text: " and the seven sub-pages under " }),
      new TextRun({ text: "src/app/pages/settings/", font: "Consolas", color: COLOR_ACCENT }),
      new TextRun({ text: ", plus the brand-specific " }),
      new TextRun({ text: "CustomerSettingsDrawer", font: "Consolas", color: COLOR_ACCENT }),
      new TextRun({ text: " referenced from the Customer module." }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "OUT OF SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Profile Management (route: /profile) and KYC (route: /kyc) are top-level Seller Admin routes \u2014 they are NOT " +
        "nested under /settings/. They cover the seller's account / company / bank / identity verification surface and " +
        "warrant their own dedicated document; they are intentionally excluded here to keep this document focused on the " +
        "/settings/ subtree. Reports (route: /reports) and Connectors (route: /connectors) are also out of scope."
      }),
    ],
  }),
];

const subpageMap = [
  H1("Settings Subtree \u2014 Map"),
  P("The complete /settings/ surface with hub-card status, dependent module references and the story that owns each surface."),
  makeTable(
    ["#", "Route", "Hub Card", "Phase 1 Status (in hub)", "Owner Story"],
    [
      ["1", "/settings", "Hub itself (6 cards in 2-col / 3-col grid)", "Available", "ST-01"],
      ["2", "/settings/store", "Store Settings (Store icon, blue)", "Available \u2014 clickable", "ST-02"],
      ["3", "/settings/order", "Order Settings (Cart icon, purple)", "Available \u2014 clickable", "ST-03"],
      ["4", "/settings/shipping", "Shipping Settings (Truck icon, amber)", "Coming Soon \u2014 disabled card (opacity 50)", "ST-04"],
      ["5", "/settings/serviceability", "Serviceability (Map-pin icon, green)", "Available \u2014 clickable", "ST-05"],
      ["6", "/settings/payment", "Payment Settings (Wallet icon, rose)", "Coming Soon \u2014 disabled card (opacity 50)", "ST-06"],
      ["7", "/settings/customer", "(NOT on the hub)", "Reachable from the Customer module / brand drawer only", "ST-07"],
      ["8", "/settings/communication", "Communication Settings (Message icon, cyan)", "Available \u2014 clickable", "ST-08"],
    ],
    [1, 5, 6, 5, 3],
  ),
];

const indexChildren = [
  H1("Story Index"),
  makeTable(
    ["#", "Story Title", "Module", "Priority", "Dependency", "Status"],
    [
      ["ST-01", "Settings \u2014 Hub Landing Page (Card Grid + Coming Soon Gating)", "Settings", "Medium", "None", "Ready for Dev"],
      ["ST-02", "Settings \u2014 Store Settings (Status, Working Hours, Holidays, Store Info)", "Settings", "High", "ST-01", "Ready for Dev"],
      ["ST-03", "Settings \u2014 Order Settings (Min / Max, Processing Time, Cancellation, Returns)", "Settings", "High", "ST-01", "Ready for Dev"],
      ["ST-04", "Settings \u2014 Shipping Settings (Phase 1 Coming Soon; full spec for next phase)", "Settings", "Medium", "ST-01", "Ready for Dev"],
      ["ST-05", "Settings \u2014 Serviceability (Polygon-based Delivery Areas per Company)", "Settings", "High", "ST-01", "Ready for Dev"],
      ["ST-06", "Settings \u2014 Payment Settings (Phase 1 Coming Soon; full spec for next phase)", "Settings", "Medium", "ST-01", "Ready for Dev"],
      ["ST-07", "Settings \u2014 Customer Settings (Auto-Approval + Brand-Specific Drawer)", "Settings", "Medium", "Customer module", "Ready for Dev"],
      ["ST-08", "Settings \u2014 Communication Settings (WhatsApp Connect + Notification Preferences)", "Settings", "High", "ST-01", "Ready for Dev"],
    ],
    [2, 7, 2, 2, 3, 3],
  ),
];

// =====================================================================
// ST-01 — Hub
// =====================================================================
const st01 = [
  ...storyBanner("USER STORY 1", "Settings \u2014 Hub Landing Page (Card Grid + Coming Soon Gating)",
    "Epic: Seller Admin \u2014 Settings   |   Priority: Medium   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Settings \u2014 Hub Landing Page (Card Grid + Coming Soon Gating)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Settings"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Medium \u2014 the hub is the entry point to every Settings sub-page; it must clearly indicate which configurations are available in Phase 1 and which are gated."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor configuring their store."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Settings consists of seven distinct configuration surfaces. The Hub gives the Seller Admin a single landing page " +
    "with one card per area, a short description, and a clear visual gate for any area not yet released in Phase 1. " +
    "Cards that are released route on click; cards marked Coming Soon are visibly disabled (opacity 50, cursor not-allowed, " +
    "Coming Soon badge) and do not navigate. This keeps expectations honest while reserving the IA for future releases."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Seller Admin needs to set their working hours for next week's holidays.",
    "Seller Admin clicks Settings in the left nav, lands on the Hub, sees six cards in a 3-column grid (2-column on tablet, 1-column on mobile), clicks Store Settings, and is taken to /settings/store.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "land on a clean Settings hub that shows all configuration areas as cards and clearly gates the Coming Soon ones",
    "I always know what's configurable in Phase 1 and where to start",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks Settings in the left navigation" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the system renders the Hub with: (1) a top toolbar showing the sub-text \"Manage your store configurations\"; (2) a card grid showing exactly six cards in this order: Store Settings, Order Settings, Shipping Settings, Serviceability, Payment Settings, Communication Settings." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Hub is rendered" },
    { key: "When", value: "the user inspects the cards available in Phase 1 (Store, Order, Serviceability, Communication)" },
    { key: "Then", value: "each card shows: a colour-coded icon, the card title, a one-line description, and a \"Configure \u203a\" affordance; the card is hover-elevated and clickable." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Hub is rendered" },
    { key: "When", value: "the user inspects the Shipping Settings and Payment Settings cards" },
    { key: "Then", value: "both cards show a \"Coming Soon\" badge in the top-right; the card is rendered at 50% opacity with cursor: not-allowed; the \"Configure \u203a\" affordance is hidden; clicking does NOT navigate." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the user clicks any non-gated card" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the system navigates to the card's path: Store \u2192 /settings/store; Order \u2192 /settings/order; Serviceability \u2192 /settings/serviceability; Communication \u2192 /settings/communication." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the user clicks a Coming Soon card (Shipping or Payment)" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "no navigation happens; no error or modal appears; the badge alone communicates the state." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the user navigates directly to /settings/shipping or /settings/payment via deep link or browser back" },
    { key: "When", value: "the route resolves" },
    { key: "Then", value: "the underlying page renders normally (the Coming Soon gating is at the hub card only, not at the route guard \u2014 see ST-04 / ST-06 BR-1). [NEEDS INPUT] confirm whether deep links to gated routes should be blocked / 404'd or kept reachable for QA." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the user opens the Hub on a small viewport" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "the grid stacks: 1 column on mobile, 2 columns on tablet, 3 columns on desktop." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "Customer Settings exists at /settings/customer" },
    { key: "When", value: "the Hub renders" },
    { key: "Then", value: "Customer Settings is intentionally NOT exposed on the Hub; it is reachable from the Customer module / CustomerSettingsDrawer only (see ST-07 BR-1)." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "The Hub is fully static \u2014 no API calls, no spinners. Card metadata (id, title, description, icon, path, comingSoon flag) is hardcoded for Phase 1."],
      ["BR-2", "Six cards are exposed on the Hub in this fixed order: Store Settings, Order Settings, Shipping Settings, Serviceability, Payment Settings, Communication Settings."],
      ["BR-3", "Coming Soon cards in Phase 1: Shipping Settings, Payment Settings. Both must render at 50% opacity, with cursor: not-allowed, a Coming Soon badge in the top-right, and the Configure CTA hidden."],
      ["BR-4", "Customer Settings (/settings/customer) is intentionally not exposed on the Hub. It is reachable from the Customer module via the CustomerSettingsDrawer (per-brand approval mode) and via direct route only."],
      ["BR-5", "If the Phase 1 status of any card changes (e.g., Payment is released), this story is the source of truth and must be revised before the change ships."],
      ["BR-6", "[NEEDS INPUT] Whether a Customer Settings card should be added to the Hub once the brand-drawer flow is consolidated."],
    ],
    [1, 9],
  ),
  subBanner("Hub Card Specification"),
  makeTable(
    ["#", "Card", "Icon (lucide)", "Description", "Route", "Phase 1 Status"],
    [
      ["1", "Store Settings", "Store (blue)", "Manage holidays and store availability", "/settings/store", "Available"],
      ["2", "Order Settings", "ShoppingCart (purple)", "Configure minimum order values and order rules", "/settings/order", "Available"],
      ["3", "Shipping Settings", "Truck (amber)", "Set delivery charges and shipping rules", "/settings/shipping", "Coming Soon"],
      ["4", "Serviceability", "MapPin (green)", "Configure company-level delivery areas", "/settings/serviceability", "Available"],
      ["5", "Payment Settings", "Wallet (rose)", "Configure payment providers and modes", "/settings/payment", "Coming Soon"],
      ["6", "Communication Settings", "MessageCircle (cyan)", "Configure email and SMS settings", "/settings/communication", "Available"],
    ],
    [1, 4, 3, 6, 4, 3],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "User refreshes the Hub", "Page re-renders identically; no API calls."],
      ["2", "User opens /settings URL directly (deep link)", "Same content; no auth bypass."],
      ["3", "User uses keyboard tab navigation through the cards", "Tab order matches BR-2 (Store \u2192 Order \u2192 Shipping \u2192 Serviceability \u2192 Payment \u2192 Communication); Enter / Space activates clickable cards; Coming Soon cards are skipped or non-activatable."],
      ["4", "User clicks a Coming Soon card", "No-op; no toast, no modal."],
      ["5", "User has slow network", "Static content loads immediately; no spinner."],
      ["6", "Future card is added (e.g., Customer Settings)", "Hub layout extends to a 7th card without reflowing the existing IA; per BR-5 this story is updated first."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  notApplicable("Static page with no data fetch, no API calls, no user input. There are no failure modes beyond standard page-load failures handled by the application shell."),
  subBanner("Data Specification"),
  notApplicable("No data fields, no inputs, no persistence. Card metadata is hardcoded per BR-1."),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks Settings in the left navigation.",
    "2. System routes to /settings; left nav marks Settings active.",
    "3. System renders the toolbar + the 6 cards in fixed order (BR-2).",
    "4. [DECISION] Seller Admin chooses an action:",
    "    IF clicks an Available card:        Navigate to that card's route.",
    "    IF clicks a Coming Soon card:       No-op (BR-3).",
    "    IF clicks any other left-nav item:  Navigate; Settings is no longer active.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Settings \u2014 Hub",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (Settings active)",
    "\u2514\u2500 Main Content Area (gray bg)",
    "    \u251c\u2500 Toolbar  Sub-text: \"Manage your store configurations\"",
    "    \u2514\u2500 Card Grid (3-col desktop, 2-col tablet, 1-col mobile)",
    "        \u251c\u2500 Card 1: Store Settings           [available]",
    "        \u251c\u2500 Card 2: Order Settings           [available]",
    "        \u251c\u2500 Card 3: Shipping Settings        [Coming Soon \u2014 50% opacity]",
    "        \u251c\u2500 Card 4: Serviceability           [available]",
    "        \u251c\u2500 Card 5: Payment Settings         [Coming Soon \u2014 50% opacity]",
    "        \u2514\u2500 Card 6: Communication Settings   [available]",
    "",
    "Each available card:",
    "    [icon tile (colour-coded)]   Card Title",
    "    Description (1 line)",
    "    Configure \u203a   (link-styled)",
    "",
    "Each Coming Soon card:",
    "    [icon tile]   Card Title    [Coming Soon badge \u2014 top-right]",
    "    Description (1 line)",
    "    (no Configure CTA)",
  ]),
];

// =====================================================================
// ST-02 — Store Settings
// =====================================================================
const st02 = [
  ...storyBanner("USER STORY 2", "Settings \u2014 Store Settings (Status, Working Hours, Holidays, Store Info)",
    "Epic: Seller Admin \u2014 Settings   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Settings \u2014 Store Settings (Status, Working Hours, Holidays, Store Info)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Settings"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 working hours, holidays and the Accept-Orders toggle govern when buyers can place orders against this seller."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 configuring when the store accepts orders."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "The store has to advertise consistent availability to buyers \u2014 weekly working hours, fixed holidays the seller " +
    "observes, plus an emergency Accept Orders toggle to pause intake without changing the schedule. Store Settings is " +
    "the single screen for all of this. It also surfaces read-only Store Information (name, contact, email) drawn from " +
    "the seller's onboarding profile so the seller can verify what buyers see."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Seller is closing for Diwali on 12 Nov. Working hours change to 10am\u20137pm starting next month.",
    "Seller Admin opens Store Settings, adjusts the per-day working hours grid (using Apply to All to set a baseline), adds 12 Nov to Fixed Holidays, and saves \u2014 a toast confirms the update.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "configure my store status, weekly working hours, fixed holidays, and view my store information",
    "buyers see consistent availability and I can pause / resume order intake at will",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin opens Store Settings" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the page renders four sections in this order: Store Status, Working Hours, Fixed Holidays, Store Information." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Store Status section is shown" },
    { key: "When", value: "the user inspects the Accept Orders toggle" },
    { key: "Then", value: "the toggle reflects the current state; toggling it ON / OFF updates the local state immediately and surfaces a status message (e.g., \"Currently accepting orders\" / \"Order intake paused\")." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Working Hours section is shown" },
    { key: "When", value: "the user inspects the grid" },
    { key: "Then", value: "a 7-day grid is displayed (Monday \u2192 Sunday) with per-day Open Time, Close Time, and a Closed toggle; an \"Apply to All\" helper sets the same Open / Close times across all days that are not marked Closed." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "a day is marked Closed" },
    { key: "When", value: "the row renders" },
    { key: "Then", value: "the Open / Close inputs for that day are disabled; the row visually indicates Closed." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Fixed Holidays section is shown" },
    { key: "When", value: "the user adds a holiday (date + label)" },
    { key: "Then", value: "the new entry appears in the list; the user can remove any entry via a delete control." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Store Information section is shown" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "Store Name, Description, Contact Phone, Email are displayed as read-only context (sourced from Profile)." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the user makes any change in Store Status, Working Hours, or Fixed Holidays" },
    { key: "When", value: "the user clicks Save" },
    { key: "Then", value: "the change is persisted; a success toast is shown (e.g., \"Store settings updated.\"). [NEEDS INPUT] confirm whether saves are per-section or page-wide." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Sections rendered in order: 1) Store Status; 2) Working Hours; 3) Fixed Holidays; 4) Store Information (read-only)."],
      ["BR-2", "Accept Orders toggle is independent of Working Hours \u2014 turning it OFF pauses intake even during working hours; turning it ON does NOT make the store available outside working hours."],
      ["BR-3", "Working Hours grid covers all 7 days; each day independently has Open / Close times or a Closed flag."],
      ["BR-4", "\"Apply to All\" copies the currently focused day's Open / Close times to every other day that is not marked Closed."],
      ["BR-5", "Fixed Holidays accept date + label; duplicates by date are not allowed. [NEEDS INPUT] confirm date format and recurring-holiday support."],
      ["BR-6", "Store Information fields (Name, Description, Phone, Email) are read-only on this page; edits live on the Profile page (out of scope here)."],
      ["BR-7", "Phase 1 implementation persists to local component state with a toast confirmation; backend API integration is [NEEDS INPUT]."],
      ["BR-8", "[NEEDS INPUT] Time-zone the Working Hours are interpreted in (proposal: IST, locked)."],
    ],
    [1, 9],
  ),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Working Hours \u2014 Open Time", "Required when day is not Closed; format HH:MM; < Close Time.", "\"Open time must be before close time.\"", "On-blur"],
      ["Working Hours \u2014 Close Time", "Required when day is not Closed; format HH:MM; > Open Time.", "\"Close time must be after open time.\"", "On-blur"],
      ["Fixed Holiday \u2014 Date", "Required; not duplicated within the list.", "\"This date is already in your holidays.\"", "On-add"],
      ["Fixed Holiday \u2014 Label", "Required; max 50 chars (proposed).", "\"Label is required.\"", "On-add"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "User marks all 7 days as Closed", "Allowed (effectively the store is closed every day); Accept Orders toggle becomes informational."],
      ["2", "User toggles a day from Closed back to Open", "Open / Close inputs become editable with sensible defaults; user can adjust."],
      ["3", "User adds a holiday that has already passed", "Allowed; informational only \u2014 holiday is still recorded for audit."],
      ["4", "User clicks Apply to All without entering any times", "Either no-op (silently) or surface a hint \"Set Open / Close times first.\""],
      ["5", "User toggles Accept Orders OFF mid-day", "Existing in-flight orders are unaffected; new incoming orders are paused per BR-2."],
    ],
    [1, 5, 6],
  ),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes"),
  ...wireframeBlock([
    "Page: Settings \u2014 Store Settings",
    "\u251c\u2500 Page Header  /  Back to Settings breadcrumb",
    "\u251c\u2500 Section: Store Status",
    "\u2502   \u2514\u2500 [Toggle] Accept Orders   |  status text",
    "\u251c\u2500 Section: Working Hours",
    "\u2502   \u251c\u2500 7-day grid: Day | Open | Close | Closed toggle",
    "\u2502   \u2514\u2500 [ Apply to All ] helper",
    "\u251c\u2500 Section: Fixed Holidays",
    "\u2502   \u251c\u2500 Add row: [ Date picker ] [ Label ] [ + Add ]",
    "\u2502   \u2514\u2500 List of holidays with delete (\u00d7) per row",
    "\u251c\u2500 Section: Store Information (read-only, sourced from Profile)",
    "\u2502   \u251c\u2500 Store Name",
    "\u2502   \u251c\u2500 Description",
    "\u2502   \u251c\u2500 Contact Phone",
    "\u2502   \u2514\u2500 Email",
    "\u2514\u2500 Action Bar: [ Save ]",
  ]),
];

// =====================================================================
// ST-03 — Order Settings
// =====================================================================
const st03 = [
  ...storyBanner("USER STORY 3", "Settings \u2014 Order Settings (Min / Max Amounts, Processing Time, Cancellation, Returns)",
    "Epic: Seller Admin \u2014 Settings   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Settings \u2014 Order Settings (Min / Max Amounts, Processing Time, Cancellation, Returns)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Settings"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 these knobs govern what orders the seller is willing to accept and how long the buyer has to cancel or return."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 configuring order acceptance rules."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Order Settings exposes four independent controls: minimum / maximum order amount; default processing time " +
    "(how long the seller commits to dispatch); order cancellation window (how long the buyer can self-cancel after " +
    "placing); and order return rules (with Phase 1 limited to full-order returns)."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Seller wants to enforce a \u20b9500 minimum order, set processing time to 24 hours, allow buyer cancellations within 6 hours.",
    "Seller Admin opens Order Settings, sets Minimum Order Amount = 500, Processing Time = 24h, Cancellation Window = 6h, leaves Returns toggled on at Full Order Only / 24h, clicks Save \u2014 a toast confirms.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "configure my order acceptance rules \u2014 amount thresholds, processing time, cancellation window and return policy",
    "buyers see clear order rules and the seller's commitments are codified",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin opens Order Settings" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the page renders four sections in this order: Minimum / Maximum Order Amount, Default Processing Time, Order Cancellation Window, Order Return." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Min / Max section is shown" },
    { key: "When", value: "the user enters Minimum Order Amount and Maximum Order Amount" },
    { key: "Then", value: "both are required positive numbers; Maximum > Minimum; INR." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Default Processing Time section is shown" },
    { key: "When", value: "the user opens the dropdown" },
    { key: "Then", value: "options are 6h, 12h, 24h, 48h, 72h; one value must be selected." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Cancellation Window section is shown" },
    { key: "When", value: "the user opens the dropdown" },
    { key: "Then", value: "options are 1h, 3h, 6h, 12h, 24h; one value must be selected." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Order Return section is shown" },
    { key: "When", value: "the user inspects the section" },
    { key: "Then", value: "the section shows: Returns Allowed toggle (default ON); Return Type field locked to \"Full Order Only\" with the note \"Phase 1 supports full-order returns only\"; Return Window dropdown with options 24h or 48h." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "Returns Allowed = OFF" },
    { key: "When", value: "the section re-renders" },
    { key: "Then", value: "Return Type and Return Window inputs are disabled / hidden." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the user clicks Save" },
    { key: "When", value: "validation passes" },
    { key: "Then", value: "the changes are persisted; a success toast is shown." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Currency in Phase 1 is INR."],
      ["BR-2", "Minimum Order Amount and Maximum Order Amount are both required; Maximum > Minimum."],
      ["BR-3", "Default Processing Time options: 6h, 12h, 24h, 48h, 72h."],
      ["BR-4", "Cancellation Window options: 1h, 3h, 6h, 12h, 24h."],
      ["BR-5", "Return Type is locked to \"Full Order Only\" in Phase 1; partial-item returns are out of scope."],
      ["BR-6", "Return Window options: 24h, 48h. The window starts from the order's Delivered timestamp (Orders OR-03 BR-6 \u2014 deliveredAt)."],
      ["BR-7", "When Returns Allowed = OFF, Return Type and Return Window are not collected."],
      ["BR-8", "Phase 1 implementation persists to local component state with a toast confirmation; backend API integration is [NEEDS INPUT]."],
    ],
    [1, 9],
  ),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Minimum Order Amount", "Required; numeric; > 0.", "\"Minimum order amount is required.\"", "On-blur"],
      ["Maximum Order Amount", "Required; numeric; > Minimum Order Amount.", "\"Maximum must be greater than minimum.\"", "On-blur"],
      ["Default Processing Time", "Required; one of 6 / 12 / 24 / 48 / 72 hours.", "\"Select a processing time.\"", "On-save"],
      ["Cancellation Window", "Required; one of 1 / 3 / 6 / 12 / 24 hours.", "\"Select a cancellation window.\"", "On-save"],
      ["Return Window", "Required when Returns Allowed = ON; one of 24 / 48 hours.", "\"Select a return window.\"", "On-save"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller enters Min = Max", "Validation fails per BR-2; inline error on Maximum."],
      ["2", "Seller toggles Returns Allowed OFF after configuring a window", "The window value is preserved in state but hidden / inactive; toggling back ON restores the previous selection."],
      ["3", "Seller picks the lowest cancellation window (1h) and the slowest processing time (72h)", "Allowed; both are independent."],
      ["4", "Seller leaves Min Amount blank", "Inline error; save blocked."],
    ],
    [1, 5, 6],
  ),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes"),
  ...wireframeBlock([
    "Page: Settings \u2014 Order Settings",
    "\u251c\u2500 Page Header  /  Back to Settings",
    "\u251c\u2500 Section: Order Amount Limits",
    "\u2502   \u251c\u2500 Minimum Order Amount (\u20b9 input)",
    "\u2502   \u2514\u2500 Maximum Order Amount (\u20b9 input)",
    "\u251c\u2500 Section: Default Processing Time",
    "\u2502   \u2514\u2500 Dropdown: 6h / 12h / 24h / 48h / 72h",
    "\u251c\u2500 Section: Order Cancellation Window",
    "\u2502   \u2514\u2500 Dropdown: 1h / 3h / 6h / 12h / 24h",
    "\u251c\u2500 Section: Order Return",
    "\u2502   \u251c\u2500 [Toggle] Returns Allowed (default ON)",
    "\u2502   \u251c\u2500 Return Type: \"Full Order Only\" (locked, with Phase 1 note)",
    "\u2502   \u2514\u2500 Return Window dropdown: 24h / 48h",
    "\u2514\u2500 Action Bar: [ Save ]",
  ]),
];

// =====================================================================
// ST-04 — Shipping Settings (Coming Soon in Phase 1)
// =====================================================================
const st04 = [
  ...storyBanner("USER STORY 4", "Settings \u2014 Shipping Settings (Phase 1 Coming Soon; Full Spec for Next Phase)",
    "Epic: Seller Admin \u2014 Settings   |   Priority: Medium   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Settings \u2014 Shipping Settings (Phase 1 Coming Soon; Full Spec for Next Phase)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Settings"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Medium \u2014 the page is implementation-ready but gated as Coming Soon on the Hub for Phase 1; this story locks the desired behaviour for both states."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date for un-gating"],
    ["User Persona", "Seller Admin \u2014 configuring delivery charges and COD."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Shipping Settings governs delivery charges, free-shipping thresholds, COD availability, and weight-based shipping " +
    "tiers. The implementation exists in the codebase, but the Hub gates the card as Coming Soon for Phase 1. This story " +
    "captures both: (a) the gated state on the Hub; (b) the full functional spec to ship when the gate is lifted."
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "configure shipping charges, free-shipping thresholds, COD availability, and weight-based delivery tiers",
    "buyers see consistent delivery costs and COD support reflects what the seller can actually fulfil",
  ),
  subBanner("Acceptance Criteria \u2014 Phase 1 (Gated)"),
  ...acBlock("AC-1", [
    { key: "Given", value: "Phase 1 is in effect" },
    { key: "When", value: "the Seller Admin views the Settings Hub" },
    { key: "Then", value: "the Shipping Settings card is rendered with the Coming Soon badge per ST-01 BR-3 and clicking is a no-op." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "Phase 1 is in effect and the user navigates directly to /settings/shipping" },
    { key: "When", value: "the route resolves" },
    { key: "Then", value: "the underlying page renders normally for QA / preview purposes. [NEEDS INPUT] confirm whether deep link should be 404'd in production." },
  ]),
  subBanner("Acceptance Criteria \u2014 Full Functionality (Next Phase)"),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Shipping Settings page is open (post-un-gating)" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "the page shows three sections: Free Shipping, Cash on Delivery (COD), Weight-based Charges." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Free Shipping section is shown" },
    { key: "When", value: "the user inspects the controls" },
    { key: "Then", value: "the section shows: Free Shipping toggle; Base Shipping Charge (\u20b9); Free Shipping Above (\u20b9, threshold)." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "Free Shipping toggle = ON" },
    { key: "When", value: "the user enters thresholds" },
    { key: "Then", value: "Base Shipping Charge applies to orders below the Free Shipping Above threshold; orders above the threshold are charged \u20b90." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the COD section is shown" },
    { key: "When", value: "the user inspects the toggle" },
    { key: "Then", value: "COD Availability is a single toggle (ON / OFF); when OFF, buyers cannot select COD at checkout." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Weight-based Charges section is shown" },
    { key: "When", value: "the user inspects the grid" },
    { key: "Then", value: "the grid shows weight tiers (e.g., 0\u20131kg, 1\u20135kg, 5\u201310kg, 10kg+) with editable charges per tier." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the user clicks Save" },
    { key: "When", value: "validation passes" },
    { key: "Then", value: "changes are persisted; success toast." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Phase 1: the Hub gates this card as Coming Soon (ST-01 BR-3). The route remains reachable for development / QA. [NEEDS INPUT] confirm production behaviour for direct deep links."],
      ["BR-2", "When the gate is lifted, the page must render the three sections per AC-3 in that order."],
      ["BR-3", "Free Shipping Above threshold is only meaningful when Free Shipping toggle = ON."],
      ["BR-4", "Weight tiers are seller-editable; the canonical default tier set is [NEEDS INPUT]."],
      ["BR-5", "Currency: INR."],
      ["BR-6", "Phase 1 implementation persists to local component state with a toast confirmation; backend API integration is [NEEDS INPUT]."],
    ],
    [1, 9],
  ),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Base Shipping Charge", "Numeric; \u2265 0.", "\"Charge must be a non-negative number.\"", "On-blur"],
      ["Free Shipping Above", "Required when Free Shipping = ON; numeric; > 0.", "\"Threshold must be greater than 0.\"", "On-blur"],
      ["Weight tier charge", "Numeric; \u2265 0.", "\"Charge must be a non-negative number.\"", "On-blur"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Out of Scope"),
  notApplicable("Per-pincode rate cards, courier integration, AWB generation, real-time rate quotes, multi-warehouse shipping origin selection \u2014 these are explicitly deferred."),
];

// =====================================================================
// ST-05 — Serviceability
// =====================================================================
const st05 = [
  ...storyBanner("USER STORY 5", "Settings \u2014 Serviceability (Polygon-based Delivery Areas per Company)",
    "Epic: Seller Admin \u2014 Settings   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Settings \u2014 Serviceability (Polygon-based Delivery Areas per Company)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Settings"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 serviceability defines where the seller will deliver; without it, buyers outside the area can place undeliverable orders."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 defining geographic service areas per company they sell for."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Serviceability is configured per company (one or more companies are linked to the seller during onboarding by the " +
    "Super Admin). For each company the seller uploads a GeoJSON polygon that delineates the deliverable area. The page " +
    "uses a dual-mode UX: a List mode showing all companies and their polygon status, and a Configure mode where the " +
    "seller picks a company without a polygon (or one already configured to overwrite) and uploads the GeoJSON."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Seller Admin works with Brand A and Brand B and needs to set up delivery areas for both.",
    "Seller Admin opens Serviceability, sees both companies on the List with status \"Not configured\", clicks Add (or Edit), enters Configure mode, picks Brand A, drops the brand-A.geojson polygon file, sees a green \"Polygon configured\" badge, and repeats for Brand B.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "configure a delivery polygon per company I sell for, with the option to add or edit",
    "buyers outside my serviceable area cannot place undeliverable orders",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin opens Serviceability" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the page is in List mode showing all companies linked to the seller, each with a status (Polygon configured \u2705 / Not configured) and an Edit button; an Add new CTA is present." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Seller Admin clicks Add new (or Edit on a row)" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the page switches to Configure mode showing: a Company dropdown (selectable only for companies without a polygon, OR pre-selected if Edit was clicked), a GeoJSON file upload area, and a back-to-list affordance." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Seller Admin uploads a file" },
    { key: "When", value: "the upload completes" },
    { key: "Then", value: "the system validates: (a) file size \u2264 5 MB; (b) parses as JSON; (c) is a GeoJSON FeatureCollection, Feature, or Polygon. On any failure, surface a clear error and stay in Configure mode." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "validation passes" },
    { key: "When", value: "the user confirms" },
    { key: "Then", value: "the polygon is associated with the chosen company; a success state renders; the Verified \"Polygon configured\" badge appears for that company in List mode." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the user is in Configure mode" },
    { key: "When", value: "the user clicks the back affordance" },
    { key: "Then", value: "the page returns to List mode without applying any unsaved upload." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "all companies already have polygons" },
    { key: "When", value: "the user clicks Add new" },
    { key: "Then", value: "the Company dropdown is empty (or shows a hint \"All companies already configured\"); the user can use Edit on a row to overwrite an existing polygon instead." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Serviceability is scoped per company. Each company linked to the seller has at most one polygon."],
      ["BR-2", "List mode displays every company linked to the seller (sourced from the seller's onboarding by Super Admin). Status pills: \"Polygon configured\" (green tick) or \"Not configured\" (neutral)."],
      ["BR-3", "Configure mode pre-selects the company when entered via Edit; pre-selects nothing when entered via Add new."],
      ["BR-4", "Uploaded file constraints: max 5 MB; must parse as JSON; must be one of GeoJSON FeatureCollection, Feature, or Polygon."],
      ["BR-5", "Editing replaces the existing polygon entirely \u2014 the seller is asked to confirm the overwrite. [NEEDS INPUT] confirm whether to keep version history."],
      ["BR-6", "Phase 1 implementation persists to local component state with a toast confirmation; backend integration is [NEEDS INPUT]."],
      ["BR-7", "[NEEDS INPUT] Whether the page should preview the uploaded polygon on a map (currently the file is validated but not rendered)."],
    ],
    [1, 9],
  ),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Company dropdown", "Required in Configure mode.", "\"Select a company.\"", "On-submit"],
      ["GeoJSON file", "Required; \u2264 5 MB; valid JSON; type \u2208 {FeatureCollection, Feature, Polygon}.", "\"Upload a valid GeoJSON file under 5 MB.\"", "On-upload"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "User uploads a GeoJSON with a non-Polygon geometry (e.g., LineString)", "Reject with a clear error referencing the supported types."],
      ["2", "User uploads a > 5 MB file", "Reject with the file-size error."],
      ["3", "User edits an existing polygon and uploads a new one", "Confirmation prompt before overwrite; on confirm, replace."],
      ["4", "Seller has zero companies linked", "List mode shows an empty state with a hint to contact Super Admin to link a company first."],
      ["5", "User uploads malformed JSON", "Parse error surfaces a friendly message."],
    ],
    [1, 5, 6],
  ),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes"),
  ...wireframeBlock([
    "Page: Settings \u2014 Serviceability  (Dual-Mode)",
    "",
    "MODE: List",
    "\u251c\u2500 Header  /  Back to Settings",
    "\u251c\u2500 [ + Add new ] CTA",
    "\u2514\u2500 Companies table:",
    "    Company | Status (badge: Polygon configured \u2713 / Not configured) | [Edit]",
    "",
    "MODE: Configure",
    "\u251c\u2500 [ \u2190 Back to list ]",
    "\u251c\u2500 Company dropdown (selectable only for companies without a polygon, OR pre-filled if Edit)",
    "\u251c\u2500 File upload area (drop / browse): GeoJSON; max 5 MB",
    "\u251c\u2500 Inline validation status (success / error)",
    "\u2514\u2500 Footer: [ Cancel ]   [ Save Polygon ]",
  ]),
];

// =====================================================================
// ST-06 — Payment Settings (Coming Soon in Phase 1)
// =====================================================================
const st06 = [
  ...storyBanner("USER STORY 6", "Settings \u2014 Payment Settings (Phase 1 Coming Soon; Full Spec for Next Phase)",
    "Epic: Seller Admin \u2014 Settings   |   Priority: Medium   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Settings \u2014 Payment Settings (Phase 1 Coming Soon; Full Spec for Next Phase)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Settings"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Medium \u2014 the page is implementation-ready but gated as Coming Soon on the Hub for Phase 1."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date for un-gating"],
    ["User Persona", "Seller Admin \u2014 configuring payment gateways and accepted modes."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Payment Settings owns the seller's payment gateway, accepted payment modes (UPI / Cards / Net Banking / Wallets), " +
    "payment terms (Immediate / Net 7 / 15 / 30 / 45), credit limit, settlement frequency, and payout bank account. " +
    "The Phase 1 Hub gates this card as Coming Soon. This story locks both the gated state and the full functional spec."
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "configure my payment gateway, accepted modes, payment terms, settlement frequency and payout bank account",
    "buyers can pay through supported channels and the seller receives settlements on a clear schedule",
  ),
  subBanner("Acceptance Criteria \u2014 Phase 1 (Gated)"),
  ...acBlock("AC-1", [
    { key: "Given", value: "Phase 1 is in effect" },
    { key: "When", value: "the Seller Admin views the Settings Hub" },
    { key: "Then", value: "the Payment Settings card is rendered with the Coming Soon badge per ST-01 BR-3 and clicking is a no-op." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "Phase 1 is in effect and the user navigates directly to /settings/payment" },
    { key: "When", value: "the route resolves" },
    { key: "Then", value: "the underlying page renders normally for QA / preview purposes. [NEEDS INPUT] confirm production behaviour for direct deep links." },
  ]),
  subBanner("Acceptance Criteria \u2014 Full Functionality (Next Phase)"),
  ...acBlock("AC-3", [
    { key: "Given", value: "Payment Settings page is open" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "six sections are shown: Primary Gateway, Accepted Payment Modes, Payment Terms, Settlement Frequency, Bank Account, Transaction Charges (read-only)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Primary Gateway section is shown" },
    { key: "When", value: "the user opens the dropdown" },
    { key: "Then", value: "options are: Razorpay, Paytm, PhonePe, Stripe, Cashfree; selecting one reveals two masked secret inputs (API Key, Secret Key)." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Accepted Modes section is shown" },
    { key: "When", value: "the user inspects the controls" },
    { key: "Then", value: "the section shows four toggles (UPI, Cards, Net Banking, Wallets) with badge lists summarising the active set." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Payment Terms section is shown" },
    { key: "When", value: "the user opens the dropdown" },
    { key: "Then", value: "options are: Immediate, Net 7, Net 15, Net 30, Net 45; a Credit Limit input (\u20b9) is shown when terms != Immediate." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Settlement Frequency section is shown" },
    { key: "When", value: "the user opens the dropdown" },
    { key: "Then", value: "options are: T+0, T+1, Weekly, Monthly." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Bank Account section is shown" },
    { key: "When", value: "the user inspects the section" },
    { key: "Then", value: "Bank Name, IFSC, Masked Account Number are displayed; an Edit affordance opens secured inputs. [NEEDS INPUT] confirm whether bank changes here require KYC re-verification." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the Transaction Charges section is shown" },
    { key: "When", value: "the user inspects the table" },
    { key: "Then", value: "the table is read-only; rows show the gateway's charges per mode." },
  ]),
  ...acBlock("AC-10", [
    { key: "Given", value: "the user clicks Save" },
    { key: "When", value: "validation passes" },
    { key: "Then", value: "settings are persisted; success toast." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Phase 1: gated as Coming Soon on the Hub (ST-01 BR-3). Route remains reachable for QA. [NEEDS INPUT] confirm production deep-link behaviour."],
      ["BR-2", "Primary Gateway choices: Razorpay, Paytm, PhonePe, Stripe, Cashfree (Phase 1 supports one active gateway at a time)."],
      ["BR-3", "API Key and Secret Key are masked once entered; the seller may rotate but cannot view the persisted secret."],
      ["BR-4", "At least one Payment Mode must be enabled when the gateway is set."],
      ["BR-5", "Credit Limit is required when Payment Terms != Immediate."],
      ["BR-6", "Settlement Frequency options: T+0, T+1, Weekly, Monthly."],
      ["BR-7", "Bank Account changes are sensitive and may require additional verification \u2014 [NEEDS INPUT] confirm KYC dependency."],
      ["BR-8", "Transaction Charges are read-only \u2014 sourced from the gateway / contract; not seller-editable."],
      ["BR-9", "Phase 1 implementation persists to local component state with a toast confirmation; backend integration is [NEEDS INPUT]."],
    ],
    [1, 9],
  ),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Primary Gateway", "Required when any other Payment field is changed.", "\"Select a payment gateway.\"", "On-save"],
      ["API Key / Secret Key", "Required when Gateway is selected; non-empty after trim.", "\"API Key and Secret Key are required.\"", "On-save"],
      ["Accepted Modes", "At least one toggle must be ON.", "\"Enable at least one payment mode.\"", "On-save"],
      ["Credit Limit", "Required when Payment Terms != Immediate; numeric; \u2265 0.", "\"Credit limit is required for net terms.\"", "On-save"],
      ["IFSC", "Format check (4 letters + 0 + 6 alphanumerics).", "\"Invalid IFSC code.\"", "On-blur"],
      ["Account Number", "Required; numeric; 9\u201318 digits.", "\"Invalid account number.\"", "On-blur"],
    ],
    [3, 5, 5, 2],
  ),
];

// =====================================================================
// ST-07 — Customer Settings
// =====================================================================
const st07 = [
  ...storyBanner("USER STORY 7", "Settings \u2014 Customer Settings (Auto-Approval + Brand-Specific Drawer)",
    "Epic: Seller Admin \u2014 Settings   |   Priority: Medium   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Settings \u2014 Customer Settings (Auto-Approval + Brand-Specific Drawer)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Settings"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Medium \u2014 governs whether new customer registrations are auto-approved, and configures per-brand approval / matching rules."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 controlling customer onboarding behaviour."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Customer Settings exposes a single store-level Auto-Approval toggle: when ON, new customer registrations are " +
    "approved without seller review; when OFF, every new registration requires manual approval. The page is reachable " +
    "at /settings/customer but is intentionally NOT exposed on the Settings Hub (ST-01 AC-8). A separate, related " +
    "surface \u2014 the Customer Settings Drawer \u2014 launches from the Customer module and configures per-brand rules: who " +
    "approves new customers (DMS or Seller) and how customers are matched (Mobile or Customer ID)."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Seller wants to manually review every new customer for the next two weeks while a promotion runs.",
    "Seller Admin opens /settings/customer (deep link or via the Customer module), sets Auto Approval = OFF, sees the status indicator turn amber (Manual Required), and resumes auto-approval after the promotion ends.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "control whether new customer registrations are auto-approved store-wide, and configure per-brand approval and matching rules",
    "I get the right balance of speed and control over customer onboarding",
  ),
  subBanner("Acceptance Criteria \u2014 Store-Level Page"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin navigates to /settings/customer" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the page shows: Auto Approval toggle, a status indicator (green \"Auto-approval enabled\" when ON; amber \"Manual approval required\" when OFF), and a brief explanatory paragraph." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Auto Approval toggle is changed" },
    { key: "When", value: "the user toggles ON \u2192 OFF or OFF \u2192 ON" },
    { key: "Then", value: "the status indicator updates immediately; a toast confirms the change." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the page is rendered" },
    { key: "When", value: "the user inspects the IA" },
    { key: "Then", value: "this page is NOT exposed on the Settings Hub (ST-01 AC-8). It is reachable only via direct route or via the Customer module entry point." },
  ]),
  subBanner("Acceptance Criteria \u2014 Brand Drawer"),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Seller Admin opens the Customer Settings Drawer from the Customer module (per-brand)" },
    { key: "When", value: "the drawer renders" },
    { key: "Then", value: "two sections are shown: (a) Approval Mode \u2014 radio selection between \"DMS approval\" and \"Seller approval\"; (b) Match Criteria \u2014 radio selection between \"Mobile Number\" and \"Customer ID\"." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the user picks an Approval Mode and Match Criteria for the brand" },
    { key: "When", value: "the user clicks Save" },
    { key: "Then", value: "the per-brand configuration is persisted; the drawer closes; a toast confirms." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the user clicks Cancel in the drawer" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the drawer closes with no change to the brand's configuration." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Customer Settings is intentionally not exposed on the Settings Hub. Users reach it via direct route (/settings/customer) or via the Customer module / brand drawer."],
      ["BR-2", "Auto Approval is a single store-level boolean. ON: new customer registrations are auto-approved on first order (Seller Admin US-09 auto-create flow); OFF: registrations require manual seller review."],
      ["BR-3", "Status indicator: ON \u2192 green pill \"Auto-approval enabled\"; OFF \u2192 amber pill \"Manual approval required\"."],
      ["BR-4", "Brand Drawer is per-brand: Approval Mode is one of {DMS approval, Seller approval}; Match Criteria is one of {Mobile Number, Customer ID}."],
      ["BR-5", "Brand Drawer applies only to multi-brand sellers; for single-brand sellers it falls back to the store-level setting. [NEEDS INPUT] confirm precedence rules between store-level toggle and per-brand drawer."],
      ["BR-6", "Phase 1 implementation persists to local component state with a toast confirmation; backend integration is [NEEDS INPUT]."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller toggles Auto Approval OFF while customers are auto-creating", "In-flight auto-creates already in progress complete; new registrations from that moment require manual approval."],
      ["2", "Brand Drawer Approval Mode = DMS approval but no DMS is configured for the seller", "Validation fails with a clear hint to configure DMS first. [NEEDS INPUT] confirm flow."],
      ["3", "User opens /settings/customer with no brands linked", "Store-level toggle is fully usable; brand-drawer flow is not surfaced."],
    ],
    [1, 5, 6],
  ),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes"),
  ...wireframeBlock([
    "Page: Settings \u2014 Customer Settings  (NOT on the Hub)",
    "\u251c\u2500 Header  /  Back to (entry point)",
    "\u251c\u2500 Section: Auto Approval",
    "\u2502   \u251c\u2500 [Toggle] Auto Approval",
    "\u2502   \u2514\u2500 Status pill (green: enabled / amber: manual required)",
    "\u2514\u2500 Explanatory paragraph",
    "",
    "Drawer: Customer Settings Drawer  (launched from Customer module per brand)",
    "\u251c\u2500 Header: \"Customer Settings \u2014 <brand name>\"",
    "\u251c\u2500 Section: Approval Mode",
    "\u2502   \u251c\u2500 ( ) DMS approval",
    "\u2502   \u2514\u2500 ( ) Seller approval",
    "\u251c\u2500 Section: Match Criteria",
    "\u2502   \u251c\u2500 ( ) Mobile Number",
    "\u2502   \u2514\u2500 ( ) Customer ID",
    "\u2514\u2500 Footer: [ Cancel ]   [ Save ]",
  ]),
];

// =====================================================================
// ST-08 — Communication Settings
// =====================================================================
const st08 = [
  ...storyBanner("USER STORY 8", "Settings \u2014 Communication Settings (WhatsApp Connect + Notification Preferences)",
    "Epic: Seller Admin \u2014 Settings   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Settings \u2014 Communication Settings (WhatsApp Connect + Notification Preferences)"],
    ["Epic / Feature Link", "Seller Admin \u2014 Settings"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 the seller depends on real-time order notifications; WhatsApp is the primary channel in Phase 1."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 connecting a WhatsApp number for order and event notifications."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Communication Settings owns the seller's WhatsApp connection and per-event notification preferences. The seller " +
    "enters a phone number, receives a 6-digit verification code, enters it, and the number is connected (subsequently " +
    "displayed masked). Below the connection block, the seller toggles individual notification events on / off; in Phase " +
    "1 the only event surfaced is \"New Order Received\". A summary line shows \"X of N\" notifications enabled."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Seller wants every new ONDC order to ping their WhatsApp.",
    "Seller Admin opens Communication Settings, enters their mobile number, taps Send Code, enters the 6-digit code, sees the masked number with a Disconnect button, leaves the New Order Received toggle ON, and walks away.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "connect a WhatsApp number via verification and select which events I want to be notified about",
    "I'm reliably alerted in real time on the channel I check most often",
  ),
  subBanner("Acceptance Criteria \u2014 WhatsApp Connect"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin opens Communication Settings and no WhatsApp number is connected" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the WhatsApp Connect section shows: a phone-number input, a Send Code button, and explanatory copy." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the user enters a mobile number and clicks Send Code" },
    { key: "When", value: "validation passes" },
    { key: "Then", value: "a 6-digit code is sent to that number; the UI transitions to the verification step with a code-input field, a Verify button, a Resend Code option, and a back affordance to change the number." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the user enters the 6-digit code and clicks Verify" },
    { key: "When", value: "validation passes" },
    { key: "Then", value: "the number is marked Connected; the UI transitions to a connected state showing the masked number (e.g., \"+91 \u2022\u2022\u2022\u2022\u2022 12345\") and a Disconnect button; a success toast confirms." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "a number is connected" },
    { key: "When", value: "the user clicks Disconnect" },
    { key: "Then", value: "the system confirms the action and removes the connection on confirm; the UI returns to the entry step." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the user enters an invalid or expired code" },
    { key: "When", value: "Verify is clicked" },
    { key: "Then", value: "an inline error is shown (\"Invalid or expired code. Please request a new one.\"); the user can resend the code." },
  ]),
  subBanner("Acceptance Criteria \u2014 Notification Preferences"),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Notification Preferences section is shown" },
    { key: "When", value: "the user inspects the section" },
    { key: "Then", value: "the section shows a list of available events with a toggle per event; the section header shows a summary \"X of N enabled\"; in Phase 1 the only event listed is \"New Order Received\"." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the user toggles a notification event" },
    { key: "When", value: "the toggle is flipped" },
    { key: "Then", value: "the change is reflected immediately in the summary count; a toast confirms." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "no WhatsApp number is connected" },
    { key: "When", value: "the user inspects the Notification Preferences section" },
    { key: "Then", value: "[NEEDS INPUT] confirm whether toggles are disabled until a number is connected, or whether they remain togglable as future-state preferences." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "WhatsApp is the only notification channel in Phase 1. SMS / email are out of scope."],
      ["BR-2", "Connection flow is two-step: (1) phone entry + Send Code; (2) code entry + Verify."],
      ["BR-3", "Verification code is 6 digits; expiry [NEEDS INPUT] (proposal: 10 minutes)."],
      ["BR-4", "Once connected, the phone number is displayed masked; the seller can Disconnect (with confirmation) and reconnect with a different number."],
      ["BR-5", "Notification events list in Phase 1: \"New Order Received\". Future events (Order Status Changed, Stock Low, etc.) are out of scope."],
      ["BR-6", "Summary header reads \"X of N enabled\" where N is the count of available events for Phase 1 (currently 1)."],
      ["BR-7", "Phase 1 implementation persists to local component state with a toast confirmation; backend integration is [NEEDS INPUT]."],
    ],
    [1, 9],
  ),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Mobile Number", "Required; numeric; 10 digits (Indian mobile).", "\"Enter a valid 10-digit mobile number.\"", "On-blur / on-Send-Code"],
      ["Verification Code", "Required; 6 digits; numeric.", "\"Enter the 6-digit code.\"", "On-Verify"],
      ["Verification Code (server-side)", "Must match the most-recent issued code; not expired.", "\"Invalid or expired code. Please request a new one.\"", "On-Verify"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "User clicks Send Code repeatedly", "Throttle requests; show \"Code sent. You can resend in <N>s.\" Disable Resend until cooldown expires."],
      ["2", "User enters a number that already has a Qwipo account elsewhere", "[NEEDS INPUT] confirm whether to allow connection or block / reassign."],
      ["3", "User refreshes the page during verification step", "[NEEDS INPUT] confirm whether the verification state survives a refresh or restarts."],
      ["4", "User disconnects while there are pending notification deliveries", "Pending deliveries fail silently; new notifications are paused."],
      ["5", "User toggles New Order Received OFF", "Seller stops receiving WhatsApp notifications for new orders; orders still arrive in the Orders module."],
    ],
    [1, 5, 6],
  ),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes"),
  ...wireframeBlock([
    "Page: Settings \u2014 Communication Settings",
    "\u251c\u2500 Header  /  Back to Settings",
    "\u251c\u2500 Section: WhatsApp Connect",
    "\u2502   STATE: Disconnected",
    "\u2502   \u251c\u2500 Phone number input",
    "\u2502   \u2514\u2500 [ Send Code ]",
    "\u2502   STATE: Awaiting verification",
    "\u2502   \u251c\u2500 6-digit code input",
    "\u2502   \u251c\u2500 [ Verify ]   [ Resend Code (cooldown) ]",
    "\u2502   \u2514\u2500 [ \u2190 Change number ]",
    "\u2502   STATE: Connected",
    "\u2502   \u251c\u2500 Masked number display: \"+91 \u2022\u2022\u2022\u2022\u2022 12345\"",
    "\u2502   \u2514\u2500 [ Disconnect ]",
    "\u2514\u2500 Section: Notification Preferences",
    "    \u251c\u2500 Header: \"Notifications  \u2014  X of N enabled\"",
    "    \u2514\u2500 Event row: New Order Received  [Toggle]",
  ]),
];

// =====================================================================
// Open Questions
// =====================================================================
const openQuestions = [
  H1("Open Questions for the Next Walkthrough Session"),
  num("Hub: confirm whether the route for a Coming Soon page (/settings/shipping, /settings/payment) should be 404'd in production or remain reachable for QA."),
  num("Hub: should Customer Settings be promoted to a 7th card on the Hub once the brand-drawer flow is consolidated?"),
  num("Store Settings: confirm save model (per-section vs page-wide save), date format and whether recurring holidays are supported, and the locked time-zone (proposal: IST)."),
  num("Order Settings: confirm whether partial-item returns are on the Phase 2 roadmap and the precise definition of \"order delivered\" timestamp the return window is anchored to."),
  num("Shipping Settings: canonical default weight tiers; whether per-pincode overrides are required at any phase."),
  num("Serviceability: whether the page should preview the uploaded polygon on a map; confirm overwrite vs version-history behaviour."),
  num("Payment Settings: KYC dependency for bank changes; whether multiple gateways can be active simultaneously in any phase."),
  num("Customer Settings: precedence between store-level Auto Approval and brand-level Approval Mode; whether the page should be added to the Hub."),
  num("Communication Settings: code expiry duration; cooldown / throttling rules on Send Code; behaviour on page refresh during verification; whether toggles are disabled until a number is connected."),
  num("All sub-pages: backend persistence model (current Phase 1 implementation persists to local state with a toast); audit / change-history requirements."),
];

// =====================================================================
// ASSEMBLE
// =====================================================================
const doc = new Document({
  creator: "Omkar Charankar",
  title: "Qwipo Seller Store \u2014 Settings User Stories (Phase 1)",
  description: "User stories for the Settings module (Seller Admin persona), Phase 1.",
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
              new TextRun({ text: "Qwipo Seller Store \u2014 Settings User Stories (Phase 1)", color: COLOR_MUTED, size: 18 }),
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
              new TextRun({ text: "v1.0 \u2014 2 May 2026", color: COLOR_MUTED, size: 18 }),
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
        ...subpageMap,
        ...indexChildren,
        ...st01,
        ...st02,
        ...st03,
        ...st04,
        ...st05,
        ...st06,
        ...st07,
        ...st08,
        ...openQuestions,
      ],
    },
  ],
});

const outPath = path.join(__dirname, "..", "Seller-Store-Settings-User-Stories-Phase1.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote:", outPath);
});
