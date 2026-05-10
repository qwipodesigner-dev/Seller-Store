// Build the Support module user-stories Word document.
// Run with: node scripts/build-support-stories.cjs
//
// Produces: Seller-Store-Support-User-Stories-Phase1.docx
//
// Single-story doc (SUP-01). The Support page is a static placeholder with
// support team contact info — no validation, no forms, no list / detail flow.
// Style mirrors the Orders / Offers / Super Admin module docs.
// Grounded against src/app/pages/support.tsx.
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
    children: [new TextRun({ text: "Support \u2014 Phase 1", bold: true, size: 36, color: COLOR_ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
    children: [new TextRun({ text: "User Story Specifications", italics: true, size: 28, color: COLOR_MUTED })],
  }),
  metaTable([
    ["Document Type", "User Story Specifications \u2014 Support Module"],
    ["Module", "Seller Admin \u2014 Support (static contact information page)"],
    ["Persona", "Seller Admin (Distributor)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Total Stories", "1 (SUP-01)"],
    ["Version", "1.0 \u2014 Final (initial dedicated coverage)"],
    ["Date", "29 April 2026"],
    ["Status", "Ready for Dev"],
    ["Document Owner", "Omkar Charankar"],
    ["Companion Documents",
      "Seller-Store-User-Stories-Phase1.docx (Seller Admin); Seller-Store-Super-Admin-User-Stories-Phase1.docx; Seller-Store-Orders-User-Stories-Phase1.docx; Seller-Store-Offers-Schemes-User-Stories-Phase1.docx; Seller-Store-ONDC-SKU-Validation-Rules.docx."],
  ]),
];

const scope = [
  H1("Document Scope & Note to Reviewer"),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "This document is the dedicated user-story specification for the Qwipo Seller Store \u2014 Support module under the " +
        "Seller Admin persona. The Support page in Phase 1 is a static placeholder that publishes the support team's " +
        "contact information (phone lines, email, working hours, FAQ pointer). There are no forms, no validation, no " +
        "ticketing flow, and no data fetched from a backend on this page."
      }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "GROUNDING: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text: "Story is grounded in the actual implementation under " }),
      new TextRun({ text: "src/app/pages/support.tsx", font: "Consolas", color: COLOR_ACCENT }),
      new TextRun({ text: ". The Support route is reachable from the left navigation and from the Phase 1 Dashboard's \"Contact support\" footer link (US-01)." }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "OUT OF SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Ticket creation flows; live chat; in-app messaging; an embedded knowledge base / FAQ search; SLA tracking; CSAT capture. These are deferred beyond Phase 1."
      }),
    ],
  }),
];

const indexChildren = [
  H1("Story Index"),
  makeTable(
    ["#", "Story Title", "Module", "Priority", "Dependency", "Status"],
    [
      ["SUP-01", "Support \u2014 Static Contact Information Page", "Support", "Low", "None", "Ready for Dev"],
    ],
    [2, 7, 2, 2, 3, 3],
  ),
];

// =====================================================================
// SUP-01 — Static Support Page
// =====================================================================
const sup01 = [
  ...storyBanner("USER STORY 1", "Support \u2014 Static Contact Information Page",
    "Epic: Seller Admin \u2014 Support   |   Priority: Low   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Support \u2014 Static Contact Information Page"],
    ["Epic / Feature Link", "Seller Admin \u2014 Support"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Low \u2014 informational placeholder; the seller can reach support via phone or email but there is no in-app ticketing in Phase 1."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Seller Admin \u2014 distributor needing to reach the Qwipo support team."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "When a Seller Admin needs help \u2014 from a stuck order, an integration question, or anything else \u2014 they need a " +
    "predictable, always-reachable place to find the support team's contact information. Phase 1 does not ship in-app " +
    "ticketing or live chat; instead the Support page surfaces two phone lines, an email address, working hours, and a " +
    "pointer to the knowledge base. The page is reachable from the left navigation and from the Dashboard's \"Contact " +
    "support\" footer link (US-01)."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Seller Admin", "Distributor using the Seller Store",
      "Find the support team's contact details quickly when something goes wrong",
      "Without a stable, in-app contact page the seller hunts through old emails / WhatsApp groups for the right number"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Time to find a phone number / email from any page \u2014 target under 10 seconds (one click from left nav, one click from Dashboard footer link)."),
  num("Page renders with zero JS / route errors \u2014 target 100% of sessions."),
  num("Tap-to-call rate from mobile devices \u2014 baseline metric only in Phase 1; not optimised."),
  subBanner("Real-World Scenario"),
  csState(
    "A new Seller Admin gets stuck on an integration step at 11 am on a weekday and wants to call support.",
    "Seller Admin clicks Support in the left navigation, lands on the Support page, sees Support Line 2 (Technical support and integrations: 23456) plus the working hours (Mon\u2013Fri, 9 AM \u2013 6 PM IST), taps the number on mobile to dial, and reaches the team.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Seller Admin",
    "view a static Support page that publishes the support team's phone, email, and working hours",
    "I always have a stable, in-app place to reach the support team when I need help",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Seller Admin clicks Support in the left navigation" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the system renders the Support page with: (1) a top toolbar showing the page sub-text \"Get help and reach our support team\"; (2) two phone Support Line cards; (3) an Email Support card; (4) a Working Hours card; (5) a Frequently Asked Questions info card." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the page is rendered" },
    { key: "When", value: "the user inspects Support Line 1" },
    { key: "Then", value: "the card shows: phone icon (blue), label \"Support Line 1\", number 12345 (rendered as a tel: hyperlink), and the helper text \"General queries and order support\"." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the page is rendered" },
    { key: "When", value: "the user inspects Support Line 2" },
    { key: "Then", value: "the card shows: phone icon (green), label \"Support Line 2\", number 23456 (rendered as a tel: hyperlink), and the helper text \"Technical support and integrations\"." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the page is rendered" },
    { key: "When", value: "the user inspects the Email Support card" },
    { key: "Then", value: "the card shows: email icon (amber), label \"Email Support\", the address support@qwipo.com (rendered as a mailto: hyperlink), and the helper text \"We typically respond within 24 hours\"." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the page is rendered" },
    { key: "When", value: "the user inspects the Working Hours card" },
    { key: "Then", value: "the card shows: clock icon (teal), label \"Working Hours\", \"Monday to Friday\", and the time range \"9:00 AM \u2013 6:00 PM IST\"." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the page is rendered" },
    { key: "When", value: "the user inspects the Frequently Asked Questions card" },
    { key: "Then", value: "the card shows: help icon (blue), heading \"Frequently Asked Questions\", and informational copy pointing the user to the knowledge base or to the support team contacts above." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the user is on a mobile or tap-to-call-capable device" },
    { key: "When", value: "the user taps a phone number" },
    { key: "Then", value: "the device's native dialler opens with the number pre-filled (standard tel: behaviour)." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the user clicks the email address" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the user's default mail client opens with To: support@qwipo.com pre-filled (standard mailto: behaviour)." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the Seller Admin lands on the Support page" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "no API calls are made; no spinners are shown; no data is fetched from a backend \u2014 the page is fully static." },
  ]),
  ...acBlock("AC-10", [
    { key: "Given", value: "the Seller Admin clicks the Dashboard's \"Contact support\" footer link (US-01 AC-8)" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the user is routed to /support and the same Support page renders." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "The Support page is fully static \u2014 no data fetch, no forms, no input fields, no validation, no spinners."],
      ["BR-2", "Phone numbers are rendered as tel: hyperlinks; the email address is rendered as a mailto: hyperlink. These are the only interactive elements on the page."],
      ["BR-3", "Phase 1 contact details are: Support Line 1 = 12345 (general queries / order support); Support Line 2 = 23456 (technical support / integrations); Email = support@qwipo.com; Working Hours = Mon\u2013Fri, 9:00 AM \u2013 6:00 PM IST. [NEEDS INPUT] confirm whether the placeholder numbers (12345 / 23456) are the final published numbers; if not, this story owns the canonical values."],
      ["BR-4", "Email response SLA copy is fixed: \"We typically respond within 24 hours.\" [NEEDS INPUT] confirm whether to differentiate SLAs for working-hours vs after-hours emails."],
      ["BR-5", "The page contains no in-app ticketing, no chat, no FAQ search; the FAQ card is informational copy only."],
      ["BR-6", "The Support route is reachable from the left navigation (always) and from the Dashboard footer link (US-01 AC-8)."],
      ["BR-7", "Page rendering must not depend on the user being inside a tenant; an authenticated Seller Admin sees the same content regardless of distributor."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "User refreshes the Support page", "Page re-renders identically; no API calls."],
      ["2", "User opens /support URL directly (deep link)", "Same content; no auth bypass."],
      ["3", "User has a slow network connection", "Static content loads as plain HTML \u2014 no spinner since there is no data fetch."],
      ["4", "User opens Support on a small viewport (mobile / narrow window)", "Cards stack to 1 column; toolbar and content remain readable; left nav collapses per existing app shell rules."],
      ["5", "User taps a phone number on a desktop browser without a tel: handler", "Browser may show a \"No application available\" prompt; this is standard OS behaviour and is not handled by the page."],
      ["6", "User clicks the email link without a default mail client configured", "Browser may show a \"Choose mail client\" prompt; this is standard OS behaviour."],
      ["7", "Support contact details change (new phone number, new email)", "This story is the source of truth; the page must be updated and the BR-3 values revised before the change ships."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  notApplicable("Static page with no data fetch, no API calls and no user input. There are no failure modes beyond standard page-load failures handled by the application shell."),
  subBanner("Data Specification"),
  notApplicable("No data fields, no inputs, no persistence in Phase 1. The page renders the constants captured in BR-3."),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Seller Admin clicks Support in the left navigation OR clicks \"Contact support\" on the Dashboard footer (US-01).",
    "2. System routes to /support and marks Support active in the left navigation.",
    "3. System renders the static toolbar + 5 cards (Support Line 1, Support Line 2, Email, Working Hours, FAQ info).",
    "4. [DECISION] Seller Admin chooses an action (any order, optional):",
    "    IF tap a phone number:        Native dialler opens with number pre-filled.",
    "    IF click the email address:   Default mail client opens with To: support@qwipo.com pre-filled.",
    "    IF click another nav item:    Navigate away; Support is no longer active.",
    "    IF refresh / do nothing:      Page re-renders identically; no API calls.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Support",
    "\u251c\u2500 App Shell Header (global)",
    "\u251c\u2500 Left Navigation (Support active)",
    "\u2514\u2500 Main Content Area (max width ~4xl, light gray bg)",
    "    \u251c\u2500 Toolbar (white, border-bottom)",
    "    \u2502   \u2514\u2500 Sub-text: \"Get help and reach our support team\"",
    "    \u251c\u2500 Contact Cards (2-col grid on desktop, 1-col on mobile)",
    "    \u2502   \u251c\u2500 Card: Support Line 1",
    "    \u2502   \u2502   \u251c\u2500 Phone icon (blue)",
    "    \u2502   \u2502   \u251c\u2500 Label: \"Support Line 1\"",
    "    \u2502   \u2502   \u251c\u2500 Number: 12345  (tel: link)",
    "    \u2502   \u2502   \u2514\u2500 Helper: \"General queries and order support\"",
    "    \u2502   \u2514\u2500 Card: Support Line 2",
    "    \u2502       \u251c\u2500 Phone icon (green)",
    "    \u2502       \u251c\u2500 Label: \"Support Line 2\"",
    "    \u2502       \u251c\u2500 Number: 23456  (tel: link)",
    "    \u2502       \u2514\u2500 Helper: \"Technical support and integrations\"",
    "    \u251c\u2500 Additional Info (2-col grid on desktop, 1-col on mobile)",
    "    \u2502   \u251c\u2500 Card: Email Support",
    "    \u2502   \u2502   \u251c\u2500 Mail icon (amber)",
    "    \u2502   \u2502   \u251c\u2500 Label: \"Email Support\"",
    "    \u2502   \u2502   \u251c\u2500 Address: support@qwipo.com  (mailto: link)",
    "    \u2502   \u2502   \u2514\u2500 Helper: \"We typically respond within 24 hours\"",
    "    \u2502   \u2514\u2500 Card: Working Hours",
    "    \u2502       \u251c\u2500 Clock icon (teal)",
    "    \u2502       \u251c\u2500 Label: \"Working Hours\"",
    "    \u2502       \u251c\u2500 \"Monday to Friday\"",
    "    \u2502       \u2514\u2500 \"9:00 AM \u2013 6:00 PM IST\"",
    "    \u2514\u2500 Card: Frequently Asked Questions (full width)",
    "        \u251c\u2500 Help icon (blue)",
    "        \u251c\u2500 Heading: \"Frequently Asked Questions\"",
    "        \u2514\u2500 Informational copy pointing to KB / support team",
  ]),
  subBanner("Content Specification"),
  makeTable(
    ["Component", "Label", "Value", "Helper Text", "Interaction"],
    [
      ["Toolbar sub-text", "\u2014", "Get help and reach our support team", "\u2014", "Static text"],
      ["Card 1: Support Line 1", "Support Line 1", "12345", "General queries and order support", "tel:12345"],
      ["Card 2: Support Line 2", "Support Line 2", "23456", "Technical support and integrations", "tel:23456"],
      ["Card 3: Email Support", "Email Support", "support@qwipo.com", "We typically respond within 24 hours", "mailto:support@qwipo.com"],
      ["Card 4: Working Hours", "Working Hours", "Monday to Friday  /  9:00 AM \u2013 6:00 PM IST", "\u2014", "Static text"],
      ["Card 5: FAQ", "Frequently Asked Questions", "(no value, copy only)", "For common queries about catalog sync, order management, connector setup, and ONDC publishing, check our knowledge base or reach out to the support team above.", "Static text"],
    ],
    [3, 3, 4, 5, 4],
  ),
  subBanner("User Flow"),
  num("Entry path A: Seller Admin clicks Support in the left navigation \u2192 lands on /support."),
  num("Entry path B: Seller Admin clicks \"Contact support\" on the Dashboard footer link (US-01) \u2192 lands on /support."),
  num("Page renders with toolbar + 5 cards."),
  num("Seller Admin optionally taps a phone number or clicks the email address \u2192 native dialler / mail client opens."),
  num("BACK PATH: Seller Admin clicks any other left-nav item to leave the page; no state to preserve."),
  subBanner("Field Validations"),
  notApplicable("No input fields on this page."),
  subBanner("Empty States"),
  notApplicable("The page is itself a permanent informational placeholder; it has no list / collection components that can be empty."),
  subBanner("Error Messages"),
  notApplicable("No error conditions specific to this page."),
];

// =====================================================================
// Open Questions
// =====================================================================
const openQuestions = [
  H1("Open Questions for the Next Walkthrough Session"),
  num("Confirm whether the placeholder phone numbers (12345 / 23456) are the final published numbers, and the canonical contact email."),
  num("Email response SLA copy \u2014 confirm whether to differentiate working-hours vs after-hours response times."),
  num("Whether to add a link to a hosted FAQ / knowledge base in Phase 1, or keep the FAQ card as informational copy only."),
  num("Phase 2 scope \u2014 in-app ticket creation, live chat, CSAT capture, SLA tracking."),
];

// =====================================================================
// ASSEMBLE
// =====================================================================
const doc = new Document({
  creator: "Omkar Charankar",
  title: "Qwipo Seller Store \u2014 Support User Stories (Phase 1)",
  description: "User stories for the Support module (Seller Admin persona), Phase 1.",
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
              new TextRun({ text: "Qwipo Seller Store \u2014 Support User Stories (Phase 1)", color: COLOR_MUTED, size: 18 }),
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
        ...indexChildren,
        ...sup01,
        ...openQuestions,
      ],
    },
  ],
});

const outPath = path.join(__dirname, "..", "Seller-Store-Support-User-Stories-Phase1.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote:", outPath);
});
