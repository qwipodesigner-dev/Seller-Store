// Build the Super Admin user-stories Word document.
// Run with: node scripts/build-super-admin-stories.cjs
//
// Produces: Seller-Store-Super-Admin-User-Stories-Phase1.docx
//
// Style mirrors the Seller Admin doc (build-user-stories.cjs). Stories grounded
// against the actual code in src/app/pages/admin and src/app/lib/admin-catalog.ts.
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

function num(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
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
    children: [new TextRun({ text: "Super Admin \u2014 Phase 1", bold: true, size: 36, color: COLOR_ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
    children: [new TextRun({ text: "User Story Specifications", italics: true, size: 28, color: COLOR_MUTED })],
  }),
  metaTable([
    ["Document Type", "User Story Specifications \u2014 Super Admin"],
    ["Module", "Super Admin \u2014 Login, Dashboard, Sellers, Companies & Brands, Connectors"],
    ["Persona", "Super Admin (Qwipo internal operator)"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Total Stories", "9 (SA-01 through SA-09)"],
    ["Version", "1.0 \u2014 Draft (initial coverage of Super Admin Phase 1)"],
    ["Date", "29 April 2026"],
    ["Status", "Ready for Dev"],
    ["Document Owner", "Omkar Charankar"],
    ["Companion Documents",
      "Seller-Store-User-Stories-Phase1.docx (Seller Admin persona); Seller-Store-ONDC-SKU-Validation-Rules.docx (V-001 \u2192 V-033 catalog)."],
  ]),
];

const scope = [
  H1("Document Scope & Note to Reviewer"),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "This document captures user stories for the Qwipo Seller Store \u2014 Super Admin persona. The Super Admin is " +
        "the Qwipo internal operator who provisions and configures Seller Admin accounts and the catalog of companies and " +
        "brands that sellers work with. Coverage in this version: Login, Phase 1 Dashboard placeholder, the Sellers module " +
        "(list / add / manage with three tabs: Profile, Companies & Brands, Connector), and the Companies & Brands module " +
        "(list / create / manage with 37 ONDC categories auto-linked per company, brand images, and active / inactive toggle)."
      }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "GROUNDING: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Stories are grounded in the actual implementation under "
      }),
      new TextRun({ text: "src/app/pages/admin/", font: "Consolas", color: COLOR_ACCENT }),
      new TextRun({ text: " and " }),
      new TextRun({ text: "src/app/lib/admin-catalog.ts", font: "Consolas", color: COLOR_ACCENT }),
      new TextRun({ text:
        ". Where the user walkthrough did not mention a feature that is already in the code (e.g., KYC fields on the " +
        "Profile tab, Permissions toggles, the ONDC connector field set, the top-level Connectors menu item), the story " +
        "captures the implemented behaviour and flags any open product decisions with " }),
      new TextRun({ text: "[NEEDS INPUT]", bold: true, color: COLOR_RED }),
      new TextRun({ text: "." }),
    ],
  }),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: "OUT OF SCOPE: ", bold: true, color: COLOR_PRIMARY }),
      new TextRun({ text:
        "Bizom (DMS) connector beyond a Phase 2 placeholder; full network analytics on the Super Admin Dashboard; bulk " +
        "import of sellers or companies; Super Admin self-service onboarding (Phase 1 Super Admin accounts are provisioned " +
        "out-of-band against a specific phone number)."
      }),
    ],
  }),
];

const persona = [
  H1("Persona Overview \u2014 Super Admin"),
  makeTable(
    ["Persona", "Role", "Goal", "Pain Point"],
    [["Super Admin", "Qwipo internal platform operator",
      "Provision Seller Admin accounts, maintain the canonical company / brand catalog, and configure ONDC connectors so that sellers can transact on the network.",
      "Without a Super Admin console, every new seller needs hand-holding from engineering to wire up companies, brands, ONDC keys and 37 categories."]],
    [3, 4, 5, 5],
  ),
  P(" "),
  P("The Seller Admin persona (the distributor using the Seller Store day-to-day) is captured in the companion document Seller-Store-User-Stories-Phase1.docx."),
];

const nav = [
  H1("Super Admin \u2014 Left Navigation (Phase 1)"),
  P("On successful login, the Super Admin lands on the Dashboard. The persistent left-side menu contains the following items, in order, sourced from src/app/components/admin/admin-navigation.ts:"),
  makeTable(
    ["#", "Menu Item", "Phase 1 Status", "Notes"],
    [
      ["1", "Dashboard", "Phase 1 Landing", "Static \"Coming Soon\" page with quick-link tiles to the available Phase 1 modules; full network analytics deferred to Phase 2 (covered by SA-02)."],
      ["2", "Sellers", "In Scope", "List, add, and manage Seller Admin accounts; each seller has a 3-tab manage page (Profile, Companies & Brands, Connector). Covered by SA-03 \u2192 SA-06."],
      ["3", "Companies & Brands", "In Scope", "Canonical catalog of companies, their brands, and per-company ONDC categories (37). Covered by SA-07 \u2192 SA-09."],
      ["4", "Connectors", "In Scope (top-level)", "Top-level view of configured connectors. In Phase 1 only ONDC connectors are configured per-seller via SA-06; this top-level view exposes the same data in aggregate. [NEEDS INPUT] confirm whether this top-level page remains as its own menu item or is rolled into the Sellers list in a later phase."],
    ],
    [1, 4, 3, 8],
  ),
  P(" "),
  P("Note: The walkthrough mentioned three left-nav items (Dashboard, Sellers, Companies & Brands). The shipped code adds a fourth top-level item, Connectors. This document captures all four and flags Connectors for product confirmation.", { run: { italics: true, color: COLOR_MUTED } }),
];

const indexChildren = [
  H1("Story Index"),
  makeTable(
    ["#", "Story Title", "Module", "Priority", "Dependency", "Status"],
    [
      ["SA-01", "Super Admin Login (Phone + OTP)", "Auth", "Critical", "None", "Ready for Dev"],
      ["SA-02", "Phase 1 Super Admin Dashboard Landing Page", "Dashboard", "Medium", "SA-01", "Ready for Dev"],
      ["SA-03", "Sellers \u2014 List Page (Search, Add Seller)", "Sellers", "High", "SA-01", "Ready for Dev"],
      ["SA-04", "Sellers \u2014 Add Seller (Profile + Company / Brand Selection)", "Sellers", "Critical", "SA-03, SA-08", "Ready for Dev"],
      ["SA-05", "Sellers \u2014 Manage Seller (Profile / Companies & Brands / Connector tabs)", "Sellers", "High", "SA-04", "Ready for Dev"],
      ["SA-06", "Sellers \u2014 ONDC Connector Configuration", "Sellers / Connectors", "High", "SA-05", "Ready for Dev"],
      ["SA-07", "Companies & Brands \u2014 List Page (Search, Active / Inactive Toggle)", "Companies & Brands", "High", "SA-01", "Ready for Dev"],
      ["SA-08", "Companies & Brands \u2014 Create Company (Logo, Brands, Auto-Linked 37 Categories)", "Companies & Brands", "Critical", "SA-07", "Ready for Dev"],
      ["SA-09", "Companies & Brands \u2014 Manage Company (Edit, Brand Images, Category Images, Deactivate)", "Companies & Brands", "High", "SA-08", "Ready for Dev"],
    ],
    [2, 7, 3, 2, 3, 3],
  ),
];

// =====================================================================
// SA-01 — Super Admin Login
// =====================================================================
const sa01 = [
  ...storyBanner("USER STORY 1", "Super Admin Login (Phone + OTP)",
    "Epic: Super Admin Auth   |   Priority: Critical   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Super Admin Login (Phone + OTP)"],
    ["Epic / Feature Link", "Super Admin Auth"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Critical \u2014 every other Super Admin story is gated by this."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Super Admin \u2014 Qwipo internal operator with a provisioned admin phone number."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Phase 1 Super Admin accounts are provisioned out-of-band against a specific phone number. The user authenticates " +
    "via mobile + OTP and lands in the /admin section of the app. Role-based routing (allow=\"admin\") gates all Super " +
    "Admin pages so Seller Admins cannot reach them, and vice versa. There is no self-service Super Admin signup in " +
    "Phase 1."
  ),
  subBanner("User Persona"),
  makeTable(
    ["Persona Name", "Role", "Goal", "Pain Point"],
    [["Super Admin", "Qwipo internal operator",
      "Authenticate quickly and reach the Super Admin console",
      "Account confusion when a phone number is registered as both a seller and an admin"]],
    [3, 4, 5, 5],
  ),
  subBanner("Success Metrics"),
  num("Time from entering OTP to landing on Dashboard \u2014 target under 3 seconds."),
  num("Failed-login rate due to wrong-role routing \u2014 target 0% (clear error if a seller phone tries an admin URL)."),
  subBanner("Real-World Scenario"),
  csState(
    "A Qwipo operator joins to onboard new distributors. Their phone number has been provisioned as a Super Admin out-of-band.",
    "The operator opens the app, enters their phone, receives the OTP, enters 1234 (demo) / production OTP, and lands on /admin/dashboard. Direct navigation to /products/my-sku redirects with a role error.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Super Admin",
    "log in with my provisioned mobile number and OTP",
    "I am taken to the Super Admin console with role-scoped navigation",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Super Admin enters a 10-digit mobile number on the login screen" },
    { key: "When", value: "the user clicks Send OTP" },
    { key: "Then", value: "the system validates the format (numeric, exactly 10 digits) and sends an OTP to the registered number." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the OTP screen is shown" },
    { key: "When", value: "the user enters the correct OTP" },
    { key: "Then", value: "the system creates an authenticated session with role = \"admin\" and routes to /admin (Dashboard)." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the user enters an invalid mobile (non-numeric, < 10 digits, > 10 digits)" },
    { key: "When", value: "the user clicks Send OTP" },
    { key: "Then", value: "the request is blocked with an inline error \"Please enter a valid 10-digit mobile number.\"" },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the user enters a wrong OTP" },
    { key: "When", value: "the user clicks Verify OTP" },
    { key: "Then", value: "the request is rejected with \"Invalid OTP. Please try again.\" and the OTP field is cleared." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "an unauthenticated user types /admin/users in the URL" },
    { key: "When", value: "the route resolves" },
    { key: "Then", value: "the user is redirected to the login screen with a \"Please log in to continue\" notice." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "a Seller Admin (role = \"seller\") tries to open /admin/users" },
    { key: "When", value: "the protected route resolves" },
    { key: "Then", value: "access is denied and the user is routed to their seller-side default page; no admin data is rendered." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Phase 1 supports two roles only: admin (Super Admin) and seller (Seller Admin). Legacy admin_seller impersonation has been removed."],
      ["BR-2", "Super Admin accounts are provisioned out-of-band against a specific phone number. There is no self-service signup."],
      ["BR-3", "Mobile number format: numeric only, exactly 10 digits."],
      ["BR-4", "Demo / sandbox credentials: phone 9900000001, OTP 1234. Production OTP delivery contract is owned by the auth service."],
      ["BR-5", "All routes under /admin are wrapped in ProtectedRoute allow=\"admin\". Seller-role users are blocked."],
      ["BR-6", "Default landing route after admin login is /admin (Dashboard)."],
      ["BR-7", "[NEEDS INPUT] Session lifetime, refresh policy, and forced logout behaviour."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "User refreshes the app while logged in as admin", "Session persists; user lands on the same admin page."],
      ["2", "User logs in on Device A, then logs in on Device B with the same number", "[NEEDS INPUT] confirm: allow concurrent sessions or invalidate Device A."],
      ["3", "User's number is provisioned as both a seller and an admin", "[NEEDS INPUT] confirm: prompt for role choice on login or block this configuration in provisioning."],
      ["4", "OTP request rate-limit is hit", "Surface \"Too many requests. Try again in N seconds.\""],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-AUTH-01", "OTP request API fails", "\"Could not send OTP. Please retry.\"", "Stay on login; allow retry."],
      ["ERR-AUTH-02", "OTP verify API fails", "\"Could not verify OTP. Please retry.\"", "Stay on OTP screen; preserve mobile."],
      ["ERR-AUTH-03", "Wrong OTP entered", "\"Invalid OTP. Please try again.\"", "Clear OTP field; allow re-entry."],
      ["ERR-AUTH-04", "Role mismatch on protected route", "\"You don't have access to this page.\"", "Redirect to the user's role-default landing page."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. User opens the app at the login screen.",
    "2. User enters mobile number and clicks Send OTP.",
    "3. System validates format and triggers OTP delivery.",
    "4. User enters OTP and clicks Verify OTP.",
    "5. [DECISION] OTP correct?",
    "   IF no:   ERR-AUTH-03; clear OTP; EXIT.",
    "   ELSE:    Create session with role; proceed.",
    "6. [DECISION] Role = admin?",
    "   IF yes:  Route to /admin (Dashboard \u2014 SA-02).",
    "   ELSE:    Route to seller-side default per Seller Admin auth.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  notApplicable("Login UI is shared with the Seller Admin login flow and is fully covered there. The only Super-Admin-specific behaviour is the post-login routing decision (BR-5, AC-2, AC-6), which is captured above."),
];

// =====================================================================
// SA-02 — Super Admin Dashboard
// =====================================================================
const sa02 = [
  ...storyBanner("USER STORY 2", "Phase 1 Super Admin Dashboard Landing Page",
    "Epic: Super Admin Navigation   |   Priority: Medium   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Phase 1 Super Admin Dashboard Landing Page"],
    ["Epic / Feature Link", "Super Admin Navigation \u2014 Phase 1"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Medium \u2014 the Dashboard is the post-login landing page; it must set Phase 1 expectations and route the operator to the available Super Admin modules in one click."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Super Admin \u2014 Qwipo internal operator post-login."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "The Super Admin lands on /admin (Dashboard) immediately after login. Network-level KPIs (active sellers, request " +
    "feed, GMV per channel, etc.) are not part of Phase 1 \u2014 they are deferred to Phase 2. Instead of a blank screen, " +
    "the Dashboard mirrors the Seller Admin pattern: a hero \"Coming Soon\" block that sets expectations and a panel " +
    "of one-click navigation tiles for the Phase 1 modules (Sellers, Companies & Brands, Connectors)."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "A new Super Admin logs in for the first time. Without a landing page, the operator would have to discover modules through the left nav.",
    "Super Admin lands on the Dashboard, reads a one-paragraph note that network analytics are coming in Phase 2, and clicks one of three quick-link tiles \u2014 Sellers, Companies & Brands, or Connectors \u2014 to start work.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Super Admin",
    "land on a Phase 1 Dashboard that explains what's coming and gives me one-click access to Sellers, Companies & Brands, and Connectors",
    "I'm never stuck on an empty home page \u2014 I always have a clear next action",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Super Admin successfully logs in" },
    { key: "When", value: "the application loads" },
    { key: "Then", value: "the user is routed to /admin and the Dashboard item in the left navigation is marked active." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Super Admin is on the Dashboard" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "a hero block is shown with: an icon, a \"Coming Soon\" badge, a heading announcing the Phase 2 dashboard, and body copy explaining that network-level KPIs and request feeds are deferred." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Super Admin is on the Dashboard" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "an \"Available now in Phase 1\" card is shown below the hero, containing exactly three navigation tiles in this order: 1) Sellers, 2) Companies & Brands, 3) Connectors." },
    { key: "And", value: "each tile shows: a module icon, the module label, a short description, and a chevron-right indicator." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Super Admin clicks the Sellers tile" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the system navigates to /admin/users and the Sellers item in the left navigation becomes active." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Super Admin clicks the Companies & Brands tile" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the system navigates to /admin/companies." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Super Admin clicks the Connectors tile" },
    { key: "When", value: "the click is registered" },
    { key: "Then", value: "the system navigates to /admin/connectors." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Super Admin is on the Dashboard placeholder" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "no API calls are made, no spinners are shown, and no analytics widgets render \u2014 the page is fully static." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Dashboard is the default landing route after Super Admin login (path: /admin)."],
      ["BR-2", "Phase 1 Dashboard is fully static \u2014 no data fetch, no widgets, no charts."],
      ["BR-3", "The \"Available now in Phase 1\" card lists exactly three modules in this fixed order: Sellers \u2192 Companies & Brands \u2192 Connectors."],
      ["BR-4", "Each tile must be a single click and must navigate to the canonical route (AC-4 \u2192 AC-6)."],
      ["BR-5", "If the canonical Phase 1 module list changes, this story is the source of truth and must be revised before the change ships."],
    ],
    [1, 9],
  ),
  subBanner("Quick-Link Tile Specification"),
  makeTable(
    ["Tile #", "Label", "Description", "Target Route"],
    [
      ["1", "Sellers", "Onboard, view and manage Seller Admin accounts.", "/admin/users"],
      ["2", "Companies & Brands", "Maintain the canonical company \u2192 brand catalog with ONDC categories.", "/admin/companies"],
      ["3", "Connectors", "View and configure ONDC connectors (per-seller).", "/admin/connectors"],
    ],
    [2, 4, 7, 5],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "User refreshes /admin", "Page re-renders the static placeholder identically; no errors."],
      ["2", "User deep-links to /admin", "Placeholder loads; left nav marks Dashboard active; no auth bypass."],
      ["3", "User keyboard-tabs through the page", "Tile order matches AC-3; each tile is reachable and activatable with Enter / Space."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  notApplicable("Static placeholder \u2014 no data fetch, no failure modes beyond standard page-load failures handled by the application shell."),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Super Admin Dashboard (Phase 1 Landing)",
    "\u251c\u2500 App Shell Header",
    "\u251c\u2500 Left Navigation (Dashboard active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Hero Block (centered)",
    "    \u2502   \u251c\u2500 Icon tile",
    "    \u2502   \u251c\u2500 \"Coming Soon\" badge",
    "    \u2502   \u251c\u2500 H1: Phase 2 dashboard heading",
    "    \u2502   \u2514\u2500 Body copy: network analytics deferred to Phase 2",
    "    \u2514\u2500 \"Available now in Phase 1\" Card",
    "        \u2514\u2500 Tile Grid (3 tiles)",
    "            \u251c\u2500 Sellers              \u2192 /admin/users",
    "            \u251c\u2500 Companies & Brands   \u2192 /admin/companies",
    "            \u2514\u2500 Connectors           \u2192 /admin/connectors",
  ]),
];

// =====================================================================
// SA-03 — Sellers List
// =====================================================================
const sa03 = [
  ...storyBanner("USER STORY 3", "Sellers \u2014 List Page (Search, Add Seller)",
    "Epic: Super Admin \u2014 Sellers   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Sellers \u2014 List Page (Search, Add Seller)"],
    ["Epic / Feature Link", "Super Admin \u2014 Sellers"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 the Sellers list is the Super Admin's primary working view of every onboarded distributor."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Super Admin \u2014 onboarding and managing distributor accounts."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Once a Super Admin starts onboarding distributors, they need a single screen to see every Seller Admin account, " +
    "search across the list to find a specific record, and click through to add a new seller or open the manage page. " +
    "The list is the entry point to every other Sellers-module action."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "A new Qwipo distributor signs up for the platform. The Super Admin needs to onboard them.",
    "Super Admin clicks Sellers in the left nav, sees the existing accounts in a table, clicks + Add Seller, and lands on the Add Seller form (SA-04). After save, the new seller appears in the list.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Super Admin",
    "view, search, and add Seller Admin accounts from a single list",
    "I can manage the entire seller roster from one screen",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Super Admin clicks Sellers in the left navigation" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the table is shown with columns: Seller (Name), Business, Phone, Status, Actions." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Super Admin types in the search input" },
    { key: "When", value: "the input changes (debounced)" },
    { key: "Then", value: "the list filters to rows where Name OR Business Name OR Email OR Phone OR City contains the search term (case-insensitive)." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Super Admin clicks + Add Seller" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system navigates to /admin/users/add (Add Seller form \u2014 SA-04)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Super Admin clicks the Action (View / Manage) button on any row" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system navigates to /admin/users/<sellerId> (Manage Seller \u2014 SA-05)." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Super Admin has zero sellers onboarded" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the empty state is shown with a primary + Add Seller CTA." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "List is scoped to all sellers in the Qwipo network (no tenant scope at this level \u2014 the Super Admin is global)."],
      ["BR-2", "Search matches across five fields (case-insensitive, contains-match): Name, Business Name, Email, Phone, City."],
      ["BR-3", "Status badge values: Active, Inactive."],
      ["BR-4", "[NEEDS INPUT] Pagination model on this list (page size, controls). Phase 1 implementation uses an in-memory filtered array \u2014 confirm whether 25-per-page like other Phase 1 lists is required."],
      ["BR-5", "[NEEDS INPUT] Sort order \u2014 default sort key (e.g., Created Desc vs Name Asc)."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Search returns zero rows", "Show \"No sellers match your search\"; preserve search term; offer Clear Search."],
      ["2", "Status of a seller is toggled to Inactive elsewhere", "On next list refresh the badge reflects Inactive."],
      ["3", "Action clicked for a seller that was deleted in another tab", "Show ERR-SLR-02 \"Seller not found\" with a Back to Sellers button."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-SLR-01", "List load API fails", "\"Unable to load sellers. Please retry.\"", "Show retry CTA; preserve search."],
      ["ERR-SLR-02", "Action target seller not found", "\"This seller is no longer available.\"", "Stay on list; refresh affected row."],
      ["ERR-SLR-03", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (List Columns)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Seller (Name)", "String", "Yes", "Non-empty.", "Seller record."],
      ["Business", "String", "Yes", "Non-empty.", "Seller record."],
      ["Phone", "String", "Yes", "10-digit; unique per seller.", "Seller record."],
      ["Status", "Enum", "Yes", "Active | Inactive.", "Seller record."],
      ["Actions", "Control", "Yes", "View / Manage \u2192 SA-05.", "UI control."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Super Admin clicks Sellers in the left nav.",
    "2. System loads the seller list (all sellers across the network).",
    "3. [DECISION] Seller count = 0?",
    "   IF yes:  Render empty state with primary + Add Seller CTA; EXIT.",
    "   ELSE:    Render table.",
    "4. Super Admin can: search, click + Add Seller (-> SA-04), click View / Manage (-> SA-05).",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Sellers \u2014 List View",
    "\u251c\u2500 App Shell Header",
    "\u251c\u2500 Left Navigation (Sellers active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header  Title: \"Sellers\"",
    "    \u251c\u2500 Action Bar",
    "    \u2502   \u251c\u2500 Search Input  (placeholder: \"Search by name, business, email, phone or city\")",
    "    \u2502   \u2514\u2500 [+ Add Seller] primary button",
    "    \u251c\u2500 Data Table (5 columns)",
    "    \u2502   Seller | Business | Phone | Status (badge) | Actions",
    "    \u2514\u2500 Pagination Footer  [NEEDS INPUT]",
  ]),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Sellers \u2014 zero sellers onboarded", "No sellers yet. Onboard your first distributor.", "\"+ Add Seller\""],
      ["Sellers \u2014 search returns no rows", "No sellers match your search.", "\"Clear Search\""],
    ],
    [4, 7, 3],
  ),
];

// =====================================================================
// SA-04 — Add Seller
// =====================================================================
const sa04 = [
  ...storyBanner("USER STORY 4", "Sellers \u2014 Add Seller (Profile + Company / Brand Selection)",
    "Epic: Super Admin \u2014 Sellers   |   Priority: Critical   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Sellers \u2014 Add Seller (Profile + Company / Brand Selection)"],
    ["Epic / Feature Link", "Super Admin \u2014 Sellers"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Critical \u2014 the only Phase 1 path to onboard a new Seller Admin account."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Super Admin \u2014 onboarding a new distributor."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Adding a seller in one form captures the seller's profile (full name, mobile, business name, address, status, " +
    "optional photo) and the seller's working catalog (which companies they sell, and within each company either " +
    "All Brands or a specific brand subset). The catalog selection is mandatory \u2014 a seller cannot be onboarded " +
    "without at least one company / brand row. This is what gates which products the seller will see on their My SKU " +
    "page (Seller Admin US-02)."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "A new distributor onboards. They sell Brand X and Brand Y under Company A, and \"all brands\" under Company B.",
    "Super Admin opens + Add Seller, fills the profile section, adds two company / brand rows (Company A with two brands selected; Company B with All Brands), saves, and the seller appears in the list with the correct catalog scope.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Super Admin",
    "create a new Seller Admin account in one form by filling profile fields and selecting one or more companies with their brands",
    "I can onboard a distributor end-to-end \u2014 profile and catalog scope \u2014 in a single action",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Super Admin clicks + Add Seller on the list" },
    { key: "When", value: "the page renders" },
    { key: "Then", value: "the form shows two sections in order: 1) Seller Information, 2) Companies & Brands, plus a footer with Cancel and + Add Seller actions." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Seller Information section is rendered" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the section shows: Full Name (required), Mobile Number (required), Business Name (required), Full Address (optional), Status toggle (Active / Inactive, default Active), Profile Photo upload (optional)." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Companies & Brands section is rendered" },
    { key: "When", value: "the user inspects the controls" },
    { key: "Then", value: "the section starts with one empty row and a + Add Company row button; each row contains a Company dropdown (sourced from SA-08) and a Brands selector that activates only after a company is chosen." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Super Admin selects a Company in a row" },
    { key: "When", value: "the company is chosen" },
    { key: "Then", value: "the row's Brands selector is populated with that company's brands and an \"All brands\" shortcut; selecting All Brands persists as an empty array semantically." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Super Admin selects All Brands for a company row" },
    { key: "When", value: "the row renders" },
    { key: "Then", value: "the explicit brand checkboxes are hidden / disabled, and a chip / label clearly indicates \"All brands\"." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the user clicks + Add Seller without all required fields" },
    { key: "When", value: "validation runs" },
    { key: "Then", value: "save is blocked with inline errors per field and an aggregate banner; specifically: Full Name, Mobile, Business Name must be present; at least one company row must be filled; each filled company row must have at least one brand (or All Brands)." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "all validations pass" },
    { key: "When", value: "the Super Admin clicks + Add Seller" },
    { key: "Then", value: "the seller is created with the chosen status, and the system routes back to the Sellers list (SA-03) where the new entry is visible." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Super Admin clicks Cancel" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "all unsaved input is discarded and the user returns to the Sellers list." },
  ]),
  ...acBlock("AC-9", [
    { key: "Given", value: "the Super Admin uploads a Profile Photo" },
    { key: "When", value: "the file is selected" },
    { key: "Then", value: "the image is shown as a preview; the user can remove or replace it before saving; if no photo is uploaded, the seller is created without one (the photo can be added later via SA-05)." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Profile required fields: Full Name, Mobile Number, Business Name."],
      ["BR-2", "Profile optional fields: Full Address, Profile Photo."],
      ["BR-3", "Mobile Number format: 10 digits numeric; uniqueness across all sellers (the same number cannot belong to two sellers)."],
      ["BR-4", "Status toggle defaults to Active on create."],
      ["BR-5", "Catalog scope: at least one company row is required; for each filled row at least one brand must be selected (or All Brands chosen)."],
      ["BR-6", "All Brands is encoded as an empty brand-id array on the company row \u2014 it semantically means \"future-proof: any brand currently or later attached to this company is in scope.\""],
      ["BR-7", "The Companies dropdown is populated from the Companies & Brands catalog (SA-07 / SA-08). If no companies exist yet, the Companies & Brands section shows an inline notice with a link to /admin/companies."],
      ["BR-8", "Profile Photo: PNG / JPG; recommended size [NEEDS INPUT \u2014 confirm max MB and dimensions]."],
      ["BR-9", "On save, a managedCompanies (legacy Qwipo-list) array and the new companyBrandSelections array are both persisted on the Seller record."],
      ["BR-10", "[NEEDS INPUT] Whether KYC fields (PAN, Aadhaar, GSTIN, Bank Account) are collected on create or only later on the manage page (current implementation collects them only on the manage page \u2014 SA-05)."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Mobile Number already exists on another seller", "Inline error \"This mobile number is already used by another seller.\""],
      ["2", "Super Admin selects a Company then changes it", "The row's brand selection is cleared; brands repopulate for the new company."],
      ["3", "Super Admin adds two rows for the same Company", "[NEEDS INPUT] confirm: block as duplicate, or merge selections client-side."],
      ["4", "Photo file is too large or wrong format", "Inline error per BR-8 / [NEEDS INPUT] limits."],
      ["5", "Super Admin removes the only company row", "+ Add Seller is disabled until at least one company row is added back."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-SLRA-01", "Create API timeout", "\"Save is taking longer than usual. Please try again.\"", "Keep form open; preserve inputs."],
      ["ERR-SLRA-02", "Create API server error", "\"Could not create seller. Please retry.\"", "Keep form open; allow retry."],
      ["ERR-SLRA-03", "Mobile number duplicate (server-side check)", "\"This mobile number is already used by another seller.\"", "Highlight Mobile field; do not save."],
      ["ERR-SLRA-04", "Image upload fails", "\"Image upload failed. Please try again.\"", "Drop the image; allow retry."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Seller record persisted on create)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["id", "String", "Yes", "System-generated.", "Auto."],
      ["name", "String", "Yes", "Non-empty.", "User input (Full Name)."],
      ["phone", "String", "Yes", "10 digits; unique across sellers.", "User input."],
      ["businessName", "String", "Yes", "Non-empty.", "User input."],
      ["address (city / street etc.)", "String", "No", "Free-form; [NEEDS INPUT] structured vs single-line.", "User input."],
      ["imageUrl", "String", "No", "PNG / JPG; size limits per BR-8.", "User upload."],
      ["status (active / inactive)", "Enum", "Yes", "Active | Inactive (default Active).", "Toggle."],
      ["managedCompanies", "String[]", "Yes", "Legacy Qwipo company id list (kept for backward compatibility).", "Derived from selections."],
      ["companyBrandSelections", "Array", "Yes", "[{ companyId, brandIds[] }]; brandIds = [] means All Brands; \u2265 1 entry required.", "User input."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Super Admin clicks + Add Seller on /admin/users.",
    "2. System opens the Add Seller form.",
    "3. Super Admin fills the Seller Information section and (optionally) uploads a profile photo.",
    "4. Super Admin adds 1..N company rows; for each row picks a Company, then either All Brands or specific brands.",
    "5. [DECISION] Super Admin clicks an action:",
    "   IF Cancel:        Discard inputs; route back to /admin/users; EXIT.",
    "   IF + Add Seller:  Run validation -> step 6.",
    "6. Validate per AC-6 / BR-1..BR-7.",
    "   IF invalid: Show inline errors; remain on form.",
    "   ELSE:       Persist seller; route to /admin/users with the new entry visible.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Sellers \u2014 Add Seller",
    "\u251c\u2500 App Shell Header",
    "\u251c\u2500 Left Navigation (Sellers active)",
    "\u2514\u2500 Main Content Area",
    "    \u251c\u2500 Page Header (breadcrumb \"Sellers\" \u203a \"Add Seller\")",
    "    \u251c\u2500 Section: Seller Information",
    "    \u2502   \u251c\u2500 Full Name (required)",
    "    \u2502   \u251c\u2500 Mobile Number (required, 10 digits)",
    "    \u2502   \u251c\u2500 Business Name (required)",
    "    \u2502   \u251c\u2500 Full Address (optional)",
    "    \u2502   \u251c\u2500 Status toggle (Active / Inactive, default Active)",
    "    \u2502   \u2514\u2500 Profile Photo upload (optional)",
    "    \u251c\u2500 Section: Companies & Brands",
    "    \u2502   \u251c\u2500 Row 1: [Company \u25be]   [Brands selector \u2014 All Brands | checkboxes]   [\u00d7]",
    "    \u2502   \u251c\u2500 Row 2..N (added via + Add Company)",
    "    \u2502   \u2514\u2500 [+ Add Company] button",
    "    \u2514\u2500 Action Bar: [ Cancel ]   [ + Add Seller ]",
  ]),
  subBanner("Field Validations"),
  makeTable(
    ["Field", "Validation Rule", "Error Message", "Trigger"],
    [
      ["Full Name", "Required; non-empty.", "\"Full name is required.\"", "On-blur / on-save"],
      ["Mobile Number", "Required; 10 digits numeric; unique.", "\"Enter a valid 10-digit mobile.\" / \"This mobile is already used.\"", "On-blur / on-save"],
      ["Business Name", "Required.", "\"Business name is required.\"", "On-blur / on-save"],
      ["Profile Photo", "PNG / JPG; size limit per BR-8.", "Format / size error.", "On-upload"],
      ["Companies & Brands", "\u2265 1 row; each filled row must have \u2265 1 brand or All Brands.", "\"Add at least one company.\" / \"Select brands or choose All Brands.\"", "On-save"],
    ],
    [3, 5, 5, 2],
  ),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Companies & Brands \u2014 catalog is empty (no companies created yet)", "No companies yet. Create a company first.", "\"Go to Companies & Brands\""],
    ],
    [4, 7, 3],
  ),
];

// =====================================================================
// SA-05 — Manage Seller (3 tabs)
// =====================================================================
const sa05 = [
  ...storyBanner("USER STORY 5", "Sellers \u2014 Manage Seller (Profile / Companies & Brands / Connector tabs)",
    "Epic: Super Admin \u2014 Sellers   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Sellers \u2014 Manage Seller (Profile / Companies & Brands / Connector tabs)"],
    ["Epic / Feature Link", "Super Admin \u2014 Sellers"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 the manage page is where seller data is reviewed and updated post-onboarding (KYC, additional companies, ONDC connector)."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Super Admin \u2014 maintaining a single Seller Admin account."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "After onboarding, a seller record is rarely complete on day one. The Super Admin needs a stable place to fill " +
    "or update KYC details, set per-module permissions, link additional companies and brands, and configure the ONDC " +
    "connector that lets the seller transact on the network. The Manage Seller page is a three-tab workspace: Profile, " +
    "Companies & Brands, Connector \u2014 with the Connector tab driving SA-06."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "A seller was onboarded last week with the basics. KYC paperwork has just been received and the seller is ready to start ONDC transactions.",
    "Super Admin opens the seller's manage page, completes KYC (PAN, Aadhaar, GSTIN, Bank, Address) on the Profile tab, links a new company on the Companies & Brands tab, and configures the ONDC connector on the Connector tab.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Super Admin",
    "open a Seller Admin account in a single workspace and update profile / KYC / catalog / connector data across three tabs",
    "I have one place to maintain everything about a seller post-onboarding",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Super Admin clicks Manage on a row in the Sellers list" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the system navigates to /admin/users/<sellerId> and shows three tabs in this order: Profile (default), Companies & Brands, Connector." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Profile tab is open" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the tab shows two sub-sections: 1) Basic Information (Name, Mobile, Business Name, Email, City, Address, Photo, Status toggle); 2) KYC (PAN, Aadhaar, GSTIN, Bank Account, KYC Address, KYC Status)." },
    { key: "And", value: "Permissions toggles for the seller are also exposed: View, Write, Edit, Update." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Profile tab has unsaved edits" },
    { key: "When", value: "the user clicks Save" },
    { key: "Then", value: "valid fields are persisted; invalid fields stay flagged with inline errors. [NEEDS INPUT] confirm whether the save model is incremental (per-field) or atomic (whole tab)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Companies & Brands tab is open" },
    { key: "When", value: "the tab renders" },
    { key: "Then", value: "the seller's currently linked companies and brands are listed; each row has a Remove (\u00d7 / close) button to unlink that company or brand; an + Add Company button opens a flow to link an additional company (same Company / Brands picker as SA-04)." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Super Admin clicks Remove on a linked company" },
    { key: "When", value: "the action is confirmed" },
    { key: "Then", value: "the link is removed; the seller's catalog scope is updated; the change is reflected on the seller's My SKU page (Seller Admin US-02)." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Connector tab is open" },
    { key: "When", value: "the tab renders" },
    { key: "Then", value: "the tab shows a list of supported connector types for Phase 1: ONDC (configurable) and Bizom (placeholder, marked \"Coming in Phase 2\")." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Super Admin clicks Add / Configure on the ONDC connector" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the ONDC Connector configuration dialog (SA-06)." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the seller record is updated by another Super Admin in another session" },
    { key: "When", value: "the current user attempts to save" },
    { key: "Then", value: "the system surfaces a concurrency error and offers to reload the latest values. [NEEDS INPUT] confirm concurrency policy."},
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "The Profile tab exposes Basic Information + KYC + Permissions toggles (view, write, edit, update)."],
      ["BR-2", "The Companies & Brands tab is the only place to add or remove companies / brands post-onboarding (the Add Seller form is one-shot at creation)."],
      ["BR-3", "Removing a company / brand link from a seller takes effect immediately on the seller's Catalog scope (My SKU)."],
      ["BR-4", "Connector tab \u2014 Phase 1: only ONDC is configurable; Bizom (DMS) is a Phase 2 placeholder kept as an empty array on the Seller record."],
      ["BR-5", "Permissions toggles default values are [NEEDS INPUT] (current implementation defaults all to true on create \u2014 confirm)."],
      ["BR-6", "Manage page enforces tenant scope: a Super Admin can manage any seller in the network."],
      ["BR-7", "[NEEDS INPUT] Save model on the Profile tab \u2014 incremental (per-field) like SKU Detail, or atomic (whole tab)."],
    ],
    [1, 9],
  ),
  subBanner("Tab Specification"),
  makeTable(
    ["Tab", "Sections", "Editable?", "Notes"],
    [
      ["Profile", "Basic Information; KYC; Permissions", "Yes", "Photo upload supported here too (deferred from SA-04)."],
      ["Companies & Brands", "Linked companies + brands; + Add Company; Remove buttons", "Yes", "Mirror of SA-04's selector but operates on an existing seller."],
      ["Connector", "ONDC (configurable, SA-06); Bizom (Phase 2 placeholder)", "Yes (ONDC only)", "Bizom slot rendered with a 'Coming in Phase 2' notice."],
    ],
    [2, 6, 2, 7],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Seller has no KYC fields filled", "KYC sub-section shows empty state with \"Complete KYC to enable ONDC\" hint; the form is editable."],
      ["2", "Super Admin removes the last linked company", "[NEEDS INPUT] confirm: block (a seller must have \u2265 1 company), or warn-and-allow."],
      ["3", "Super Admin toggles seller Status to Inactive", "The seller cannot log in to the seller-side; their existing data is preserved."],
      ["4", "Super Admin opens a Seller URL that does not exist", "Show 404 \"Seller not found\" with Back to Sellers."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-SLRM-01", "Detail load API fails", "\"Unable to load seller. Please retry.\"", "Show retry CTA."],
      ["ERR-SLRM-02", "Save API fails", "\"Could not save changes. Please retry.\"", "Keep form; allow retry."],
      ["ERR-SLRM-03", "Concurrent edit detected", "\"This seller was updated elsewhere. Reload to see latest values.\"", "Offer Reload."],
      ["ERR-SLRM-04", "Seller not found", "\"Seller not found.\"", "Show error state with Back to Sellers."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (key Seller fields editable on Manage)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["name / phone / businessName", "String", "Yes", "Per SA-04 BR-1..BR-3.", "Seller record."],
      ["email / city / address / imageUrl", "String", "No", "Free-form; image format / size per SA-04 BR-8.", "Seller record."],
      ["status (active / inactive)", "Enum", "Yes", "Active | Inactive.", "Toggle."],
      ["kyc.pan", "String", "No (Phase 1)", "Valid Indian PAN format if present.", "User input."],
      ["kyc.aadhaar", "String", "No (Phase 1)", "12-digit numeric if present.", "User input."],
      ["kyc.gstin", "String", "No (Phase 1)", "Valid GSTIN format if present.", "User input."],
      ["kyc.bankAcct", "String / Object", "No (Phase 1)", "[NEEDS INPUT] structure (account number, IFSC, holder name).", "User input."],
      ["kyc.address", "String", "No (Phase 1)", "Free-form.", "User input."],
      ["kyc.status", "Enum", "Yes (when KYC fields present)", "Pending | Verified | Rejected. [NEEDS INPUT] confirm canonical list.", "Set by ops."],
      ["permissions {view, write, edit, update}", "Boolean[4]", "Yes", "[NEEDS INPUT] semantic of each flag and default on create.", "Toggle."],
      ["managedCompanies / companyBrandSelections", "Array", "Yes", "Per SA-04.", "Companies & Brands tab."],
      ["connectors.ondc", "Object", "No (Phase 1)", "Per SA-06 spec.", "Connector tab."],
      ["connectors.bizom", "Array", "[NOT APPLICABLE] in Phase 1", "Empty array placeholder.", "Phase 2."],
    ],
    [4, 2, 2, 5, 3],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Super Admin clicks Manage on a Seller row.",
    "2. System loads /admin/users/<sellerId> and renders the three tabs (Profile default).",
    "3. [DECISION] Active tab:",
    "   IF Profile:               Render Basic Info + KYC + Permissions; user edits and saves.",
    "   IF Companies & Brands:    Render linked companies; user adds (-> SA-04 picker) or removes.",
    "   IF Connector:             Render connector slots; user opens ONDC config (-> SA-06).",
    "4. On Save (Profile tab) or Add / Remove (other tabs): persist changes; reflect updates on the Sellers list and on the seller-side scope.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Sellers \u2014 Manage Seller",
    "\u251c\u2500 Page Header (breadcrumb \"Sellers\" \u203a \"<Business Name>\")",
    "\u251c\u2500 Tabs: [ Profile (active) ] [ Companies & Brands ] [ Connector ]",
    "\u251c\u2500 Tab Body \u2014 Profile",
    "\u2502   \u251c\u2500 Basic Information (Name, Mobile, Business, Email, City, Address, Photo, Status)",
    "\u2502   \u251c\u2500 KYC (PAN, Aadhaar, GSTIN, Bank, KYC Address, KYC Status)",
    "\u2502   \u2514\u2500 Permissions toggles (view, write, edit, update)",
    "\u251c\u2500 Tab Body \u2014 Companies & Brands",
    "\u2502   \u251c\u2500 Linked companies list (each row has [\u00d7] Remove)",
    "\u2502   \u2514\u2500 [+ Add Company] button",
    "\u2514\u2500 Tab Body \u2014 Connector",
    "    \u251c\u2500 ONDC slot \u2014 [Configure] (\u2192 SA-06)",
    "    \u2514\u2500 Bizom slot \u2014 \"Coming in Phase 2\" (disabled)",
  ]),
];

// =====================================================================
// SA-06 — ONDC Connector
// =====================================================================
const sa06 = [
  ...storyBanner("USER STORY 6", "Sellers \u2014 ONDC Connector Configuration",
    "Epic: Super Admin \u2014 Sellers / Connectors   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Sellers \u2014 ONDC Connector Configuration"],
    ["Epic / Feature Link", "Super Admin \u2014 Sellers / Connectors"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 ONDC connector configuration is what enables the seller to transact on the ONDC network."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Super Admin \u2014 wiring a seller to ONDC."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Phase 1 ships a single connector type: ONDC. The Super Admin opens the ONDC config dialog from the Connector tab " +
    "of a seller's Manage page (SA-05), enters the seller's network credentials (subscriber ID, key, private key), the " +
    "API and webhook endpoints, and tunes the sync behaviour (which entity types to sync, how often, retry policy). " +
    "Once saved and toggled on, the seller's catalog and orders flow through the ONDC connector."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "A seller has been onboarded and KYC is verified. They now need to be wired to ONDC.",
    "Super Admin opens the seller's Manage page \u2192 Connector tab \u2192 ONDC \u2192 Configure. They paste the seller-specific subscriber ID, unique key, and private key, set the API endpoint, the webhook URL, choose to sync SKU + Orders + Customers every 15 minutes with auto-retry on, and click Save.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Super Admin",
    "configure a seller's ONDC connector with credentials, endpoints and sync policy",
    "the seller can transact on the ONDC network with the right entities syncing on the right cadence",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Super Admin clicks Configure on the ONDC connector slot" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the ONDC Connector dialog with sections: Credentials, Endpoints, Sync Policy, Toggles, footer (Cancel | Save)." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Credentials section is rendered" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the section shows: Subscriber ID (required), Unique Key ID (required), Private Key (required, masked input)." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Endpoints section is rendered" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the section shows: API Endpoint (required, valid HTTPS URL), Webhook URL (required, valid HTTPS URL)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Sync Policy section is rendered" },
    { key: "When", value: "the user inspects the fields" },
    { key: "Then", value: "the section shows: Data Sync Types (multi-select \u2014 SKU, Orders, Customers; [NEEDS INPUT] confirm the canonical list), Sync Frequency Minutes (numeric, > 0), Max Retries (numeric, \u2265 0)." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Toggles section is rendered" },
    { key: "When", value: "the user inspects the controls" },
    { key: "Then", value: "the section shows two toggles: Auto Retry (default ON), Auto Sync Enabled (default OFF \u2014 the connector is dormant until the operator turns it on)." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "any required field is missing or invalid" },
    { key: "When", value: "the Super Admin clicks Save" },
    { key: "Then", value: "save is blocked with inline errors per field." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "all fields pass validation" },
    { key: "When", value: "the Super Admin clicks Save" },
    { key: "Then", value: "the connector config is persisted on the seller record and the dialog closes; the Connector tab reflects the saved state (configured / dormant per the toggles)." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Super Admin clicks Cancel" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "any unsaved input is discarded; previously saved values remain unchanged." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Phase 1: ONDC is the only configurable connector. Bizom is a Phase 2 placeholder."],
      ["BR-2", "Auto Sync Enabled defaults to OFF on first save. The operator must explicitly turn it on to start syncing."],
      ["BR-3", "Auto Retry defaults to ON. Max Retries default [NEEDS INPUT] (current code: confirm)."],
      ["BR-4", "Sync Frequency Minutes must be > 0. [NEEDS INPUT] confirm minimum (e.g., 1 min) and maximum (e.g., 1440 min)."],
      ["BR-5", "Private Key is stored encrypted at rest; the dialog renders it as a masked input and never displays the saved value back to the user. [NEEDS INPUT] confirm key handling and rotation policy."],
      ["BR-6", "API Endpoint and Webhook URL must be HTTPS."],
      ["BR-7", "Data Sync Types canonical list: [NEEDS INPUT] (current code uses string array \u2014 confirm allowed values)."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Saved config exists; user reopens the dialog", "Dialog pre-fills with saved values; Private Key is masked and never displayed in plaintext."],
      ["2", "Super Admin toggles Auto Sync Enabled OFF after a successful save", "Sync stops; existing in-flight jobs complete; new jobs are not scheduled."],
      ["3", "API Endpoint or Webhook URL is HTTP (not HTTPS)", "Inline error \"Endpoints must use HTTPS.\""],
      ["4", "Webhook URL fails reachability test (if performed)", "[NEEDS INPUT] confirm whether reachability is checked synchronously on save or async (warning) on first sync attempt."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-CONN-01", "Save API timeout", "\"Save is taking longer than usual. Please try again.\"", "Keep dialog open; preserve inputs."],
      ["ERR-CONN-02", "Save API server error", "\"Could not save the connector. Please retry.\"", "Keep dialog; allow retry."],
      ["ERR-CONN-03", "Required field missing", "Per-field message.", "Block save."],
      ["ERR-CONN-04", "Endpoint not HTTPS", "\"Endpoints must use HTTPS.\"", "Block save."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (OndcConfig persisted on seller.connectors.ondc)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["subscriberId", "String", "Yes", "Non-empty.", "User input."],
      ["uniqueKeyId", "String", "Yes", "Non-empty.", "User input."],
      ["privateKey", "String", "Yes", "Non-empty; stored encrypted; masked input.", "User input."],
      ["apiEndpoint", "String", "Yes", "Valid HTTPS URL.", "User input."],
      ["webhookUrl", "String", "Yes", "Valid HTTPS URL.", "User input."],
      ["dataSyncTypes", "String[]", "Yes (\u2265 1)", "Subset of canonical list (e.g., SKU, Orders, Customers \u2014 [NEEDS INPUT]).", "Multi-select."],
      ["syncFrequencyMinutes", "Integer", "Yes", "> 0; range [NEEDS INPUT].", "Numeric input."],
      ["maxRetries", "Integer", "Yes", "\u2265 0; default per BR-3.", "Numeric input."],
      ["autoRetry", "Boolean", "Yes", "Default ON.", "Toggle."],
      ["autoSyncEnabled", "Boolean", "Yes", "Default OFF on first save (BR-2).", "Toggle."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Super Admin opens Manage Seller -> Connector tab and clicks Configure on ONDC.",
    "2. System opens the ONDC Connector dialog (pre-filled if a saved config exists).",
    "3. Super Admin fills Credentials, Endpoints, Sync Policy, Toggles.",
    "4. [DECISION] Super Admin clicks an action:",
    "   IF Cancel:  Discard inputs; close dialog; EXIT.",
    "   IF Save:    Validate all required fields and HTTPS endpoints.",
    "5. [DECISION] Validation result:",
    "   IF invalid: Show inline errors; remain on dialog.",
    "   ELSE:       Persist OndcConfig on seller record; close dialog; reflect state on Connector tab.",
    "6. If Auto Sync Enabled was toggled ON, the sync scheduler picks up the config on its next tick.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Dialog: ONDC Connector Configuration",
    "\u251c\u2500 Header: \"ONDC Connector\"  +  close (\u00d7)",
    "\u251c\u2500 Section: Credentials",
    "\u2502   \u251c\u2500 Subscriber ID",
    "\u2502   \u251c\u2500 Unique Key ID",
    "\u2502   \u2514\u2500 Private Key (masked)",
    "\u251c\u2500 Section: Endpoints",
    "\u2502   \u251c\u2500 API Endpoint (HTTPS)",
    "\u2502   \u2514\u2500 Webhook URL (HTTPS)",
    "\u251c\u2500 Section: Sync Policy",
    "\u2502   \u251c\u2500 Data Sync Types (multi-select)",
    "\u2502   \u251c\u2500 Sync Frequency Minutes",
    "\u2502   \u2514\u2500 Max Retries",
    "\u251c\u2500 Section: Toggles",
    "\u2502   \u251c\u2500 Auto Retry (default ON)",
    "\u2502   \u2514\u2500 Auto Sync Enabled (default OFF on first save)",
    "\u2514\u2500 Footer: [ Cancel ]   [ Save ]",
  ]),
];

// =====================================================================
// SA-07 — Companies & Brands List
// =====================================================================
const sa07 = [
  ...storyBanner("USER STORY 7", "Companies & Brands \u2014 List Page (Search, Active / Inactive Toggle)",
    "Epic: Super Admin \u2014 Companies & Brands   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Companies & Brands \u2014 List Page (Search, Active / Inactive Toggle)"],
    ["Epic / Feature Link", "Super Admin \u2014 Companies & Brands"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 the canonical company catalog drives Add Seller (SA-04) and the seller's My SKU scope."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Super Admin \u2014 maintaining the canonical company \u2192 brand \u2192 category catalog."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Companies & Brands is the canonical catalog used everywhere else in the platform. A Seller Admin's working scope " +
    "(SA-04 selections; Seller Admin US-02 list) is constrained by which companies / brands the Super Admin has " +
    "created. The list page is the Super Admin's working view of this catalog \u2014 it supports search, an Active / " +
    "Inactive toggle (so a mistakenly-created or retired company can be hidden without deletion), and the entry point " +
    "to create a new company (SA-08)."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Qwipo onboards a new FMCG company \"AgriCorp\" with three brands.",
    "Super Admin opens Companies & Brands, clicks + Add Company, fills the form (SA-08), and the new company appears in the list with all 37 ONDC categories auto-linked.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Super Admin",
    "view, search, deactivate, and create companies with their brands from a single list",
    "the canonical catalog stays clean and reflects only what sellers should see",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Super Admin clicks Companies & Brands in the left navigation" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "the table is shown with columns: Logo, Company Name, Brands (count + chips), Status (Active / Inactive), Actions." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Super Admin types in the search input" },
    { key: "When", value: "the input changes (debounced)" },
    { key: "Then", value: "the list filters to rows where Company Name OR any Brand Name contains the search term (case-insensitive)." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Super Admin clicks the Active / Inactive toggle on a company row" },
    { key: "When", value: "the toggle changes" },
    { key: "Then", value: "the company's isActive flag is updated; the row's badge reflects the new state; the change is reflected wherever the company is referenced (e.g., the Add Seller picker hides Inactive companies). [NEEDS INPUT] confirm whether existing seller links to a now-Inactive company are preserved or surfaced as a warning."},
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Super Admin clicks + Add Company" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the Create Company dialog (SA-08)." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Super Admin clicks the Action (View / Manage) on a row" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the Manage Company dialog / page (SA-09)." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Super Admin has no companies yet" },
    { key: "When", value: "the page loads" },
    { key: "Then", value: "an empty state is shown with a primary + Add Company CTA." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Search matches Company Name OR any Brand Name (case-insensitive, contains-match)."],
      ["BR-2", "Status (isActive) toggle is per-company and is the canonical inactivate path \u2014 deletion is not a Phase 1 action (deactivate-not-delete)."],
      ["BR-3", "Inactive companies are hidden from the Add Seller picker (SA-04) and from the seller-side My SKU scope. [NEEDS INPUT] confirm whether existing seller links survive deactivation."],
      ["BR-4", "[NEEDS INPUT] Pagination model on this list (page size, controls)."],
      ["BR-5", "[NEEDS INPUT] Default sort order."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Search returns zero rows", "Show \"No companies match your search\"; offer Clear Search."],
      ["2", "Super Admin deactivates a company that 50 sellers are linked to", "Surface a confirmation: \"50 sellers currently sell this company. Deactivate anyway?\""],
      ["3", "Super Admin creates a company with the same name as an existing one", "[NEEDS INPUT] confirm: block as duplicate or warn-and-allow."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-CMP-01", "List load API fails", "\"Unable to load companies. Please retry.\"", "Show retry CTA."],
      ["ERR-CMP-02", "Toggle save fails", "\"Could not update status. Please retry.\"", "Revert toggle visual state."],
      ["ERR-CMP-03", "Session expired", "\"Your session has expired. Please log in again.\"", "Redirect to login."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (List Columns)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["Logo", "Image", "No", "PNG / JPG; size limits per SA-08 BR-7.", "Company record."],
      ["Company Name", "String", "Yes", "Non-empty.", "Company record."],
      ["Brands", "Array", "Yes", "\u2265 1 brand per SA-08 BR-3.", "Company record."],
      ["Status", "Boolean", "Yes", "Active | Inactive.", "Toggle."],
      ["Actions", "Control", "Yes", "Manage \u2192 SA-09; Toggle Active.", "UI control."],
    ],
    [3, 2, 2, 5, 4],
  ),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Companies & Brands \u2014 List View",
    "\u251c\u2500 Page Header  Title: \"Companies & Brands\"",
    "\u251c\u2500 Action Bar",
    "\u2502   \u251c\u2500 Search Input  (placeholder: \"Search by company or brand name\")",
    "\u2502   \u2514\u2500 [+ Add Company] primary button",
    "\u251c\u2500 Data Table",
    "\u2502   Logo | Company Name | Brands (chips) | Status (toggle) | Actions",
    "\u2514\u2500 Pagination Footer  [NEEDS INPUT]",
  ]),
  subBanner("Empty States"),
  makeTable(
    ["Screen / Component", "Empty State Message", "CTA Button"],
    [
      ["Companies & Brands \u2014 zero companies", "No companies in the catalog yet. Create the first one.", "\"+ Add Company\""],
      ["Companies & Brands \u2014 search returns no rows", "No companies match your search.", "\"Clear Search\""],
    ],
    [4, 7, 3],
  ),
];

// =====================================================================
// SA-08 — Create Company
// =====================================================================
const sa08 = [
  ...storyBanner("USER STORY 8", "Companies & Brands \u2014 Create Company (Logo, Brands, Auto-Linked 37 Categories)",
    "Epic: Super Admin \u2014 Companies & Brands   |   Priority: Critical   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Companies & Brands \u2014 Create Company (Logo, Brands, Auto-Linked 37 Categories)"],
    ["Epic / Feature Link", "Super Admin \u2014 Companies & Brands"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "Critical \u2014 every Seller's catalog scope and every SKU's category linkage descends from this."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Super Admin \u2014 creating a new company in the canonical catalog."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "Creating a company in the catalog seeds three things at once: (1) the company record itself with its name and " +
    "logo; (2) one or more brands under that company (each brand may have its own image); (3) a per-company copy of " +
    "the canonical 37 ONDC categories (sourced from ONDC_CATEGORY_NAMES in admin-catalog.ts). The 37-category seed is " +
    "automatic so the Super Admin never has to attach categories manually \u2014 they're always present and ready for " +
    "per-category image uploads (SA-09)."
  ),
  subBanner("Real-World Scenario"),
  csState(
    "Qwipo signs up a new FMCG company. The category structure is shared across all companies (37 ONDC categories) and the company brings two brands.",
    "Super Admin clicks + Add Company, uploads the company logo, types the company name, adds Brand 1 and Brand 2 (with brand images), clicks Create. The system creates the company, attaches both brands, and seeds 37 ONDC categories under the company \u2014 all in one operation.",
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Super Admin",
    "create a new company with its logo, name and at least one brand, with the 37 ONDC categories auto-linked",
    "the canonical catalog grows in one operation and is immediately usable in the Add Seller picker",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Super Admin clicks + Add Company on the Companies list" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "the system opens the Create Company dialog with sections: 1) Logo upload (optional), 2) Company Name (required), 3) Brands editor (\u2265 1 required), footer (Cancel | Create)." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the dialog is open" },
    { key: "When", value: "the Super Admin enters a Company Name" },
    { key: "Then", value: "the field accepts non-empty input; on Create, the field is validated as required and within the allowed length range." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Super Admin clicks + Add Brand" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "a new brand row is appended with: Brand Name (required) and Brand Image upload (optional); rows can be added until the [NEEDS INPUT] maximum is reached (current code: no hard cap \u2014 confirm)." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "any brand row has an empty Brand Name" },
    { key: "When", value: "the Super Admin clicks Create" },
    { key: "Then", value: "save is blocked with an inline error on the offending row; at least one valid brand row is required." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "all required fields pass validation" },
    { key: "When", value: "the Super Admin clicks Create" },
    { key: "Then", value: "the company is persisted with: name, optional logo URL, brands array (id, name, optional imageUrl per brand), categories array auto-seeded with 37 entries from ONDC_CATEGORY_NAMES (each entry: id, name, optional imageUrl), isActive = true; the dialog closes; the new company appears in the Companies list (SA-07)." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Super Admin uploads a Logo or a Brand Image" },
    { key: "When", value: "the file is selected" },
    { key: "Then", value: "the image is shown as a preview using a blob URL; the user can remove or replace it before saving; on save the image is persisted server-side and the blob URL is revoked." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Super Admin clicks Cancel" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "any unsaved input (including in-progress image uploads) is discarded and the dialog closes." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Company Name is required."],
      ["BR-2", "Logo is optional."],
      ["BR-3", "At least one Brand row is required; each brand row must have a non-empty Brand Name. Brand Image is optional."],
      ["BR-4", "On Create, the system auto-seeds 37 ONDC categories for the company (per-company copy) sourced from ONDC_CATEGORY_NAMES \u2014 the Super Admin never picks them manually at create time."],
      ["BR-5", "Per-company category images are managed on the Manage Company page (SA-09); on Create, each category starts with no image."],
      ["BR-6", "isActive defaults to true on Create."],
      ["BR-7", "Image format / size limits: PNG / JPG; size [NEEDS INPUT] (current code uses blob URLs without an explicit cap \u2014 confirm canonical limit, e.g., 2 MB)."],
      ["BR-8", "[NEEDS INPUT] Whether a duplicate Company Name is rejected hard or allowed (current implementation does not enforce uniqueness \u2014 confirm)."],
      ["BR-9", "[NEEDS INPUT] Whether duplicate Brand Names within the same company are rejected (recommended: yes)."],
      ["BR-10", "When new ONDC categories are added to ONDC_CATEGORY_NAMES, existing companies are NOT automatically backfilled \u2014 only NEW companies get the new list. [NEEDS INPUT] confirm desired migration behaviour."],
    ],
    [1, 9],
  ),
  subBanner("The 37 Auto-Linked ONDC Categories"),
  P("On Create, the system seeds the company with 37 ONDC categories (per-company copy). The canonical list is maintained in src/app/lib/admin-catalog.ts as ONDC_CATEGORY_NAMES. New categories are added by editing that constant; existing companies are NOT automatically backfilled (BR-10)."),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Super Admin tries to Create with zero brands", "Block with \"At least one brand is required.\""],
      ["2", "Super Admin uploads a logo larger than the size limit", "Inline error per BR-7."],
      ["3", "Super Admin enters two brand rows with the same name", "[NEEDS INPUT] confirm: hard block as duplicate, or allow."],
      ["4", "Super Admin closes the dialog mid-image-upload", "Cancel the upload; revoke the blob URL; close cleanly."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-CMPC-01", "Create API timeout", "\"Save is taking longer than usual. Please try again.\"", "Keep dialog open."],
      ["ERR-CMPC-02", "Create API server error", "\"Could not create the company. Please retry.\"", "Keep dialog; allow retry."],
      ["ERR-CMPC-03", "Required field missing", "Per-field message.", "Block save."],
      ["ERR-CMPC-04", "Image upload fails", "\"Image upload failed. Please try again.\"", "Drop image; allow retry."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Company record persisted on Create)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["id", "String", "Yes", "System-generated.", "Auto."],
      ["name", "String", "Yes", "Non-empty.", "User input."],
      ["imageUrl", "String | null", "No", "PNG / JPG; size per BR-7.", "User upload (logo)."],
      ["brands[]", "Array (\u2265 1)", "Yes", "Each brand: { id (auto), name (required), imageUrl (optional) }.", "User input."],
      ["categories[]", "Array (37)", "Yes", "Auto-seeded from ONDC_CATEGORY_NAMES; each entry: { id (auto), name, imageUrl: null }.", "Auto on create (BR-4)."],
      ["isActive", "Boolean", "Yes", "Default true on Create.", "Auto."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Super Admin clicks + Add Company on /admin/companies.",
    "2. System opens the Create Company dialog with one empty Brand row.",
    "3. Super Admin (optionally) uploads a Logo.",
    "4. Super Admin enters Company Name.",
    "5. Super Admin fills Brand 1 (and optionally adds more brand rows via + Add Brand).",
    "6. [DECISION] Super Admin clicks an action:",
    "   IF Cancel:  Discard inputs; revoke blob URLs; close dialog; EXIT.",
    "   IF Create:  Validate per BR-1..BR-9.",
    "7. [DECISION] Validation result:",
    "   IF invalid: Show inline errors; remain on dialog.",
    "   ELSE:       Persist company with logo, brands; auto-seed 37 ONDC categories; close dialog.",
    "8. New company appears in the Companies list (SA-07) with isActive = true.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Dialog: Create Company",
    "\u251c\u2500 Header: \"Create Company\"  +  close (\u00d7)",
    "\u251c\u2500 Section: Logo (optional)",
    "\u2502   \u2514\u2500 Image upload control with preview",
    "\u251c\u2500 Section: Company Name (required)",
    "\u251c\u2500 Section: Brands (\u2265 1)",
    "\u2502   \u251c\u2500 Brand Row 1: Name (required) | Image (optional) | [\u00d7]",
    "\u2502   \u251c\u2500 Brand Row 2..N (added via + Add Brand)",
    "\u2502   \u2514\u2500 [+ Add Brand] button",
    "\u2514\u2500 Footer: [ Cancel ]   [ Create ]",
    "",
    "Note: Categories are NOT shown in this dialog \u2014 the system auto-seeds the 37 ONDC categories on Create.",
  ]),
];

// =====================================================================
// SA-09 — Manage Company
// =====================================================================
const sa09 = [
  ...storyBanner("USER STORY 9", "Companies & Brands \u2014 Manage Company (Edit, Brand Images, Category Images, Deactivate)",
    "Epic: Super Admin \u2014 Companies & Brands   |   Priority: High   |   Owner: Product Team"),

  sectionBanner("Section 1 \u2014 Basic Information"),
  metaTable([
    ["Story Title", "Companies & Brands \u2014 Manage Company (Edit, Brand Images, Category Images, Deactivate)"],
    ["Epic / Feature Link", "Super Admin \u2014 Companies & Brands"],
    ["Business Owner", "Product Team (Qwipo Seller Store)"],
    ["Priority", "High \u2014 ongoing maintenance of brand assets and per-category imagery; deactivation path."],
    ["Sprint Target", "[NEEDS INPUT] Sprint ID / target date"],
    ["User Persona", "Super Admin \u2014 maintaining an existing company."],
  ]),

  sectionBanner("Section 2 \u2014 Business Context"),
  whyParagraph(
    "After a company is created (SA-08), the Super Admin still needs to: update the company name or logo; add or " +
    "remove brands; upload images for the 37 ONDC categories under the company (so each category surfaces nicely on " +
    "the seller-side); and toggle the company Active / Inactive when it is mistakenly created or no longer relevant. " +
    "Manage Company is the workspace for all of this."
  ),

  sectionBanner("Section 3 \u2014 Functional Clarity"),
  userStoryLine(
    "Super Admin",
    "edit a company's name / logo, add or remove brands, upload images for the 37 categories, and deactivate the company when needed",
    "the canonical catalog stays current and visually correct without needing engineering involvement",
  ),
  subBanner("Acceptance Criteria"),
  ...acBlock("AC-1", [
    { key: "Given", value: "the Super Admin clicks Manage on a company row" },
    { key: "When", value: "the page / dialog opens" },
    { key: "Then", value: "the workspace shows: Company Name (editable), Logo (editable), Brands editor, Categories editor (37 rows for image upload), Active / Inactive toggle, Save / Cancel actions." },
  ]),
  ...acBlock("AC-2", [
    { key: "Given", value: "the Brands editor is rendered" },
    { key: "When", value: "the user inspects the rows" },
    { key: "Then", value: "each existing brand has: Name (editable), Image (editable / replaceable), Remove (\u00d7) button; an + Add Brand button is available." },
  ]),
  ...acBlock("AC-3", [
    { key: "Given", value: "the Categories editor is rendered" },
    { key: "When", value: "the user inspects the rows" },
    { key: "Then", value: "exactly 37 rows are shown in the canonical ONDC_CATEGORY_NAMES order; each row has: Category Name (read-only), Image (uploadable / replaceable / removable). Category Names cannot be edited per company \u2014 the canonical list is system-owned." },
  ]),
  ...acBlock("AC-4", [
    { key: "Given", value: "the Super Admin replaces a brand image or category image" },
    { key: "When", value: "the new file is selected" },
    { key: "Then", value: "the previous blob URL is revoked (revokeImage()) before the new image is rendered, to avoid memory leaks." },
  ]),
  ...acBlock("AC-5", [
    { key: "Given", value: "the Super Admin clicks Remove on a brand row" },
    { key: "When", value: "the action is confirmed" },
    { key: "Then", value: "that brand is removed from the company; if any sellers had selected this specific brand on the seller's catalog scope, [NEEDS INPUT] confirm the cascade behaviour."},
    { key: "And", value: "the company must still have \u2265 1 brand after removal \u2014 attempting to remove the last brand is blocked." },
  ]),
  ...acBlock("AC-6", [
    { key: "Given", value: "the Super Admin toggles Active / Inactive" },
    { key: "When", value: "the change is saved" },
    { key: "Then", value: "the company's isActive flag is updated and the Companies list (SA-07) reflects the new state; the Add Seller picker (SA-04) hides Inactive companies." },
  ]),
  ...acBlock("AC-7", [
    { key: "Given", value: "the Super Admin clicks Save" },
    { key: "When", value: "validation passes" },
    { key: "Then", value: "all edits to name, logo, brands, category images, and the Active toggle are persisted in one save." },
  ]),
  ...acBlock("AC-8", [
    { key: "Given", value: "the Super Admin clicks Cancel" },
    { key: "When", value: "the action runs" },
    { key: "Then", value: "all unsaved edits are discarded; persisted state is restored; in-progress image uploads have their blob URLs revoked." },
  ]),
  subBanner("Business Rules"),
  makeTable(
    ["#", "Rule"],
    [
      ["BR-1", "Company Name is required and must remain non-empty."],
      ["BR-2", "A company must have \u2265 1 brand at all times \u2014 attempting to remove the last brand is blocked."],
      ["BR-3", "Category Names per company are read-only (system-owned canonical ONDC_CATEGORY_NAMES list). Only the per-category Image is editable."],
      ["BR-4", "Image lifecycle: replaceImage() and removeImage() must call revokeImage() on the previous blob URL to avoid memory leaks (see admin-catalog.ts)."],
      ["BR-5", "Active / Inactive toggle is the only deactivation path \u2014 deletion is not Phase 1."],
      ["BR-6", "[NEEDS INPUT] Cascade behaviour when a brand is removed: should existing seller selections referencing that brand be auto-pruned, or surfaced as a warning?"],
      ["BR-7", "[NEEDS INPUT] Save model \u2014 incremental (per-section) or atomic (whole page)."],
    ],
    [1, 9],
  ),
  subBanner("Edge Cases"),
  makeTable(
    ["#", "Scenario", "Expected Behavior"],
    [
      ["1", "Super Admin removes the last brand of a company", "Block with \"A company must have at least one brand.\""],
      ["2", "Super Admin tries to upload a brand image > size limit", "Inline error per SA-08 BR-7."],
      ["3", "Super Admin clicks Save with no changes", "No-op; show \"No changes to save\" toast or close silently. [NEEDS INPUT] confirm preferred UX."],
      ["4", "ONDC_CATEGORY_NAMES is updated to add a new category after this company was created", "Existing company's category list is NOT auto-updated (per SA-08 BR-10)."],
      ["5", "Super Admin opens Manage on a now-Inactive company", "All editors remain functional; the toggle reflects Inactive."],
    ],
    [1, 5, 6],
  ),
  subBanner("Error Scenarios"),
  makeTable(
    ["Code", "Trigger", "User-Facing Message", "System Behavior"],
    [
      ["ERR-CMPM-01", "Detail load API fails", "\"Unable to load company. Please retry.\"", "Show retry CTA."],
      ["ERR-CMPM-02", "Save API fails", "\"Could not save changes. Please retry.\"", "Keep edits; allow retry."],
      ["ERR-CMPM-03", "Remove last brand attempted", "\"A company must have at least one brand.\"", "Block remove."],
      ["ERR-CMPM-04", "Image upload fails", "\"Image upload failed. Please try again.\"", "Drop image; allow retry; preserve other edits."],
    ],
    [3, 4, 5, 6],
  ),
  subBanner("Data Specification (Company record fields editable on Manage)"),
  makeTable(
    ["Field Name", "Type", "Required", "Validation Rule", "Source / Default"],
    [
      ["name", "String", "Yes", "Non-empty.", "User input."],
      ["imageUrl (logo)", "String | null", "No", "PNG / JPG; size per SA-08 BR-7.", "User upload."],
      ["brands[].name", "String", "Yes (per row)", "Non-empty.", "User input."],
      ["brands[].imageUrl", "String | null", "No", "PNG / JPG; size per SA-08 BR-7.", "User upload."],
      ["categories[].name", "String", "Yes", "Read-only canonical name (BR-3).", "System."],
      ["categories[].imageUrl", "String | null", "No", "PNG / JPG; size per SA-08 BR-7.", "User upload."],
      ["isActive", "Boolean", "Yes", "Active | Inactive.", "Toggle."],
    ],
    [3, 2, 2, 5, 4],
  ),
  subBanner("Workflow"),
  ...workflowBlock([
    "1. Super Admin clicks Manage on a company row.",
    "2. System opens the Manage Company workspace.",
    "3. Super Admin edits any of: name, logo, brand names / images, category images, Active toggle.",
    "4. [DECISION] Super Admin clicks an action:",
    "   IF Cancel:  Revoke any in-progress blob URLs; discard edits; close.",
    "   IF Save:    Validate per BR-1..BR-3; on success persist all changes atomically (or per-section per BR-7).",
    "5. List (SA-07) reflects new state on next render.",
  ]),

  sectionBanner("Section 4 \u2014 UI/UX"),
  subBanner("Wireframe Notes (Component Hierarchy)"),
  ...wireframeBlock([
    "Page: Companies & Brands \u2014 Manage Company",
    "\u251c\u2500 Page Header (breadcrumb \"Companies & Brands\" \u203a \"<Company Name>\")",
    "\u251c\u2500 Section: Company",
    "\u2502   \u251c\u2500 Logo (uploadable / replaceable / removable)",
    "\u2502   \u2514\u2500 Company Name (editable)",
    "\u251c\u2500 Section: Brands",
    "\u2502   \u251c\u2500 Brand Row 1: Name (editable) | Image (replaceable / removable) | [\u00d7]",
    "\u2502   \u251c\u2500 Brand Row 2..N",
    "\u2502   \u2514\u2500 [+ Add Brand] button",
    "\u251c\u2500 Section: Categories (37, system-ordered)",
    "\u2502   \u2514\u2500 For each category: Name (read-only) | Image (uploadable / replaceable / removable)",
    "\u251c\u2500 Section: Status",
    "\u2502   \u2514\u2500 Active / Inactive toggle",
    "\u2514\u2500 Footer: [ Cancel ]   [ Save ]",
  ]),
];

// =====================================================================
// Open Questions
// =====================================================================
const openQuestions = [
  H1("Open Questions for the Next Walkthrough Session"),
  num("Auth: session lifetime / refresh policy; concurrent-session policy on the same number; resolution if a number is provisioned as both seller and admin."),
  num("Sellers list \u2014 pagination model and default sort order."),
  num("Add Seller \u2014 Profile Photo size / format limits; whether KYC is collected on create or only on Manage; behaviour when two rows pick the same Company."),
  num("Manage Seller \u2014 save model (incremental vs atomic); concurrency policy; semantic of each Permission flag (view / write / edit / update) and defaults; cascade rule when removing a linked company; KYC bank-account structure and KYC status enum."),
  num("ONDC Connector \u2014 canonical list of Data Sync Types; sync-frequency min / max; default Max Retries; private-key encryption / rotation policy; webhook reachability check (sync vs async)."),
  num("Companies & Brands list \u2014 pagination model and default sort order; behaviour for existing seller links when a company / brand is deactivated."),
  num("Create Company \u2014 image size / format canonical limit; duplicate Company / Brand name policy; backfill behaviour when ONDC_CATEGORY_NAMES grows."),
  num("Manage Company \u2014 cascade behaviour when a brand is removed (auto-prune seller selections vs warn); save model (incremental vs atomic)."),
  num("Connectors top-level menu item \u2014 confirm whether it remains as a separate item or is rolled into the Sellers list."),
  num("Bizom (DMS) connector \u2014 confirm Phase 2 scope and timing."),
];

// =====================================================================
// ASSEMBLE
// =====================================================================
const doc = new Document({
  creator: "Omkar Charankar",
  title: "Qwipo Seller Store \u2014 Super Admin User Stories (Phase 1)",
  description: "User stories for the Super Admin persona, Phase 1.",
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
              new TextRun({ text: "Qwipo Seller Store \u2014 Super Admin User Stories (Phase 1)", color: COLOR_MUTED, size: 18 }),
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
        ...persona,
        ...nav,
        ...indexChildren,
        ...sa01,
        ...sa02,
        ...sa03,
        ...sa04,
        ...sa05,
        ...sa06,
        ...sa07,
        ...sa08,
        ...sa09,
        ...openQuestions,
      ],
    },
  ],
});

const outPath = path.join(__dirname, "..", "Seller-Store-Super-Admin-User-Stories-Phase1.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote:", outPath);
});
