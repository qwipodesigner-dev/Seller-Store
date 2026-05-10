// Build the Qwipo Seller Store walkthrough deck.
const pptxgen = require("pptxgenjs");
const path = require("path");

const SHOTS = path.resolve(__dirname, "screenshots");
const OUT = path.resolve(__dirname, "..", "..", "Seller-Store-Walkthrough.pptx");

// ---------- palette ----------
const C = {
  ink: "0F172A",          // primary dark
  inkSoft: "1E293B",
  body: "334155",
  muted: "64748B",
  border: "E2E8F0",
  bg: "F8FAFC",
  card: "FFFFFF",
  primary: "4338CA",      // indigo-700
  primarySoft: "EEF2FF",  // indigo-50
  accent: "F59E0B",       // amber-500
  accent2: "EC4899",      // pink-500
  green: "10B981",
  blue: "0EA5E9",
};

const FONT_HEAD = "Calibri";
const FONT_BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";  // 13.333 x 7.5
pres.title = "Qwipo Seller Store - Walkthrough";
pres.author = "Qwipo";
const W = 13.333, H = 7.5;

// ---------- helpers ----------
function makeShadow() {
  return { type: "outer", color: "0F172A", blur: 18, offset: 4, angle: 90, opacity: 0.18 };
}

function pageHeader(slide, eyebrow, title, options = {}) {
  // top color band
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.55, fill: { color: C.primary }, line: { color: C.primary },
  });
  // accent stripe
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0.55, w: W, h: 0.05, fill: { color: C.accent }, line: { color: C.accent },
  });
  slide.addText(eyebrow.toUpperCase(), {
    x: 0.5, y: 0.05, w: 8, h: 0.45, fontFace: FONT_HEAD, fontSize: 11, bold: true,
    color: "FFFFFF", charSpacing: 2, valign: "middle", margin: 0,
  });
  // step / page number on right
  if (options.pageNum) {
    slide.addText(options.pageNum, {
      x: W - 1.8, y: 0.05, w: 1.3, h: 0.45, fontFace: FONT_HEAD, fontSize: 11, bold: true,
      color: "FFFFFF", align: "right", valign: "middle", margin: 0, charSpacing: 2,
    });
  }
  // title
  slide.addText(title, {
    x: 0.5, y: 0.78, w: W - 1, h: 0.7, fontFace: FONT_HEAD, fontSize: 30, bold: true,
    color: C.ink, valign: "top", margin: 0,
  });
}

function footer(slide, label) {
  slide.addText("Qwipo  ·  Phase 1 Walkthrough", {
    x: 0.5, y: H - 0.35, w: 6, h: 0.25, fontFace: FONT_BODY, fontSize: 9, color: C.muted, valign: "middle", margin: 0,
  });
  if (label) {
    slide.addText(label, {
      x: W - 5.5, y: H - 0.35, w: 5, h: 0.25, fontFace: FONT_BODY, fontSize: 9, color: C.muted,
      align: "right", valign: "middle", margin: 0,
    });
  }
}

function screenshotCard(slide, file, x, y, w, h) {
  // White card behind to give padding around the screenshot
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x, y: y, w: w, h: h, fill: { color: C.card }, line: { color: C.border, width: 1 },
    shadow: makeShadow(),
  });
  slide.addImage({
    path: path.join(SHOTS, file),
    x: x + 0.1, y: y + 0.1, w: w - 0.2, h: h - 0.2,
    sizing: { type: "contain", w: w - 0.2, h: h - 0.2 },
  });
}

function stepBadge(slide, x, y, n, color = C.primary) {
  slide.addShape(pres.shapes.OVAL, {
    x: x, y: y, w: 0.55, h: 0.55, fill: { color: color }, line: { color: color },
  });
  slide.addText(String(n), {
    x: x, y: y, w: 0.55, h: 0.55, fontFace: FONT_HEAD, fontSize: 18, bold: true,
    color: "FFFFFF", align: "center", valign: "middle", margin: 0,
  });
}

// ============================================================
// SLIDE 1 — Title
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.ink };
  // accent geometry
  s.addShape(pres.shapes.OVAL, { x: -2.5, y: -2.5, w: 6, h: 6, fill: { color: C.primary, transparency: 60 }, line: { color: C.primary, transparency: 100 } });
  s.addShape(pres.shapes.OVAL, { x: W - 3, y: H - 3, w: 5.5, h: 5.5, fill: { color: C.accent2, transparency: 70 }, line: { color: C.accent2, transparency: 100 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 1, y: 3.4, w: 0.12, h: 1.2, fill: { color: C.accent }, line: { color: C.accent } });

  s.addText("QWIPO  ·  PHASE 1", {
    x: 1.3, y: 3.4, w: 8, h: 0.4, fontFace: FONT_HEAD, fontSize: 13, bold: true,
    color: C.accent, charSpacing: 8, margin: 0,
  });
  s.addText("Seller Management Platform", {
    x: 1.3, y: 3.85, w: 11, h: 0.9, fontFace: FONT_HEAD, fontSize: 44, bold: true,
    color: "FFFFFF", margin: 0,
  });
  s.addText("Super Admin & Seller Admin — End-to-End Walkthrough", {
    x: 1.3, y: 4.85, w: 11, h: 0.6, fontFace: FONT_BODY, fontSize: 20,
    color: "CADCFC", margin: 0,
  });
  s.addText("Distributor onboarding · Catalog · Orders · Customers · Offers · Settings", {
    x: 1.3, y: 5.55, w: 11, h: 0.4, fontFace: FONT_BODY, fontSize: 13,
    color: "94A3B8", italic: true, margin: 0,
  });
  // bottom bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - 0.5, w: W, h: 0.5, fill: { color: "000000", transparency: 20 }, line: { color: "000000", transparency: 100 } });
  s.addText("Prepared for the product walkthrough  ·  Built on the live Phase 1 build", {
    x: 1.3, y: H - 0.5, w: 11, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: "94A3B8", valign: "middle", margin: 0,
  });
}

// ============================================================
// SLIDE 2 — Agenda
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Agenda", "What we'll cover today", { pageNum: "01" });

  const items = [
    { n: "01", title: "Roles & Sign-In", desc: "Single login surface. Super Admin and Seller see different consoles.", color: C.primary },
    { n: "02", title: "Super Admin", desc: "Onboard distributors, manage users, brands, connectors, and approval requests.", color: C.accent2 },
    { n: "03", title: "Seller Admin", desc: "Catalog, inventory, customers, orders, offers, settings and reports.", color: C.blue },
    { n: "04", title: "Recap", desc: "Step-by-step checklist for go-live.", color: C.green },
  ];
  const cardW = 2.95, cardH = 3.6, gap = 0.18, startX = 0.5, startY = 1.9;
  items.forEach((it, i) => {
    const x = startX + i * (cardW + gap);
    s.addShape(pres.shapes.RECTANGLE, {
      x: x, y: startY, w: cardW, h: cardH, fill: { color: C.card }, line: { color: C.border, width: 1 },
      shadow: makeShadow(),
    });
    // colored stripe top
    s.addShape(pres.shapes.RECTANGLE, {
      x: x, y: startY, w: cardW, h: 0.18, fill: { color: it.color }, line: { color: it.color },
    });
    s.addText(it.n, {
      x: x + 0.3, y: startY + 0.45, w: 1.5, h: 0.7, fontFace: FONT_HEAD, fontSize: 38, bold: true,
      color: it.color, margin: 0,
    });
    s.addText(it.title, {
      x: x + 0.3, y: startY + 1.3, w: cardW - 0.6, h: 0.55, fontFace: FONT_HEAD, fontSize: 18, bold: true,
      color: C.ink, margin: 0,
    });
    s.addText(it.desc, {
      x: x + 0.3, y: startY + 1.95, w: cardW - 0.6, h: 1.5, fontFace: FONT_BODY, fontSize: 12,
      color: C.body, margin: 0, valign: "top",
    });
  });
  footer(s, "Agenda");
}

// ============================================================
// SLIDE 3 — Roles overview / Login
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Roles & Access", "One login. Two consoles.", { pageNum: "02" });

  // Left: screenshot
  screenshotCard(s, "01-login.png", 0.5, 1.85, 5.4, 4.9);

  // Right: two role cards
  const rx = 6.3, ry = 1.85;
  // Super Admin card
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: ry, w: 6.5, h: 2.3, fill: { color: C.card }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: ry, w: 0.12, h: 2.3, fill: { color: C.primary }, line: { color: C.primary } });
  s.addText("Super Admin", { x: rx + 0.35, y: ry + 0.2, w: 6, h: 0.5, fontFace: FONT_HEAD, fontSize: 22, bold: true, color: C.ink, margin: 0 });
  s.addText("9900000001  ·  OTP 1234 (demo)", { x: rx + 0.35, y: ry + 0.7, w: 6, h: 0.35, fontFace: FONT_BODY, fontSize: 11, color: C.muted, italic: true, margin: 0 });
  s.addText([
    { text: "Manages distributors, master data, connectors", options: { bullet: true, breakLine: true } },
    { text: "Approves new requests and assigns brands", options: { bullet: true, breakLine: true } },
    { text: "Routes to /admin on sign-in", options: { bullet: true } },
  ], { x: rx + 0.35, y: ry + 1.05, w: 6, h: 1.2, fontFace: FONT_BODY, fontSize: 12, color: C.body, paraSpaceAfter: 6, margin: 0, valign: "top" });

  // Seller card
  const ry2 = ry + 2.55;
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: ry2, w: 6.5, h: 2.3, fill: { color: C.card }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: ry2, w: 0.12, h: 2.3, fill: { color: C.accent2 }, line: { color: C.accent2 } });
  s.addText("Seller (Distributor)", { x: rx + 0.35, y: ry2 + 0.2, w: 6, h: 0.5, fontFace: FONT_HEAD, fontSize: 22, bold: true, color: C.ink, margin: 0 });
  s.addText("9900000002  ·  OTP 1234 (demo)", { x: rx + 0.35, y: ry2 + 0.7, w: 6, h: 0.35, fontFace: FONT_BODY, fontSize: 11, color: C.muted, italic: true, margin: 0 });
  s.addText([
    { text: "Catalog, pricing, inventory and orders", options: { bullet: true, breakLine: true } },
    { text: "Customers, offers, settings, reports", options: { bullet: true, breakLine: true } },
    { text: "Routes to / on sign-in", options: { bullet: true } },
  ], { x: rx + 0.35, y: ry2 + 1.05, w: 6, h: 1.2, fontFace: FONT_BODY, fontSize: 12, color: C.body, paraSpaceAfter: 6, margin: 0, valign: "top" });

  footer(s, "Roles & Sign-In");
}

// ============================================================
// SLIDE 4 — Section divider: SUPER ADMIN
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.ink };
  s.addShape(pres.shapes.OVAL, { x: -3, y: -3, w: 8, h: 8, fill: { color: C.primary, transparency: 65 }, line: { color: C.primary, transparency: 100 } });
  s.addShape(pres.shapes.OVAL, { x: W - 4, y: H - 4, w: 7, h: 7, fill: { color: C.accent2, transparency: 75 }, line: { color: C.accent2, transparency: 100 } });

  s.addText("PART 02", {
    x: 1, y: 2.6, w: 6, h: 0.4, fontFace: FONT_HEAD, fontSize: 13, bold: true,
    color: C.accent, charSpacing: 8, margin: 0,
  });
  s.addText("Super Admin", {
    x: 1, y: 3.05, w: 12, h: 1.3, fontFace: FONT_HEAD, fontSize: 64, bold: true,
    color: "FFFFFF", margin: 0,
  });
  s.addText("Onboarding distributors and running the network", {
    x: 1, y: 4.45, w: 12, h: 0.6, fontFace: FONT_BODY, fontSize: 22, color: "CADCFC", margin: 0,
  });
  // module pills
  const pills = ["Sellers", "Companies & Brands", "Connectors", "Requests"];
  let px = 1;
  pills.forEach((p) => {
    const w = 0.18 + p.length * 0.13;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: px, y: 5.4, w: w, h: 0.45, fill: { color: "FFFFFF", transparency: 85 }, line: { color: "FFFFFF", transparency: 70 }, rectRadius: 0.08,
    });
    s.addText(p, { x: px, y: 5.4, w: w, h: 0.45, fontFace: FONT_BODY, fontSize: 11, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    px += w + 0.18;
  });
}

// ============================================================
// SLIDE 5 — Super Admin Dashboard / Modules
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Super Admin", "Phase 1 modules at a glance", { pageNum: "03" });

  screenshotCard(s, "10-admin-dashboard.png", 0.5, 1.85, 8.0, 5.0);

  // Right side: module list
  const rx = 8.7;
  s.addText("Available now", { x: rx, y: 1.9, w: 4.2, h: 0.4, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C.muted, margin: 0 });

  const modules = [
    { t: "Sellers", d: "Approve, manage, edit seller accounts." },
    { t: "Companies & Brands", d: "Master catalog with categories." },
    { t: "Connectors", d: "DMS / ONDC connector configuration." },
    { t: "Requests", d: "Pending seller approvals queue." },
  ];
  modules.forEach((m, i) => {
    const y = 2.35 + i * 1.02;
    s.addShape(pres.shapes.RECTANGLE, {
      x: rx, y: y, w: 4.2, h: 0.92, fill: { color: C.card }, line: { color: C.border, width: 1 },
    });
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 0.08, h: 0.92, fill: { color: C.primary }, line: { color: C.primary } });
    s.addText(m.t, { x: rx + 0.25, y: y + 0.1, w: 4, h: 0.35, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText(m.d, { x: rx + 0.25, y: y + 0.45, w: 4, h: 0.45, fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0 });
  });
  footer(s, "Super Admin · Modules");
}

// ============================================================
// SLIDE 6 — Add a Distributor: Step 1 - Open Sellers
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Super Admin · Step 1", "Open Sellers and click \"Add Seller\"", { pageNum: "04" });

  // step strip on top
  const stripY = 1.65;
  const steps = [
    { n: 1, t: "Open Sellers", active: true },
    { n: 2, t: "Add Seller form", active: false },
    { n: 3, t: "Assign brands", active: false },
    { n: 4, t: "Save & activate", active: false },
  ];
  let sx = 0.5;
  steps.forEach((st, i) => {
    const isLast = i === steps.length - 1;
    const w = 2.7;
    s.addShape(pres.shapes.OVAL, {
      x: sx, y: stripY, w: 0.5, h: 0.5, fill: { color: st.active ? C.primary : C.border }, line: { color: st.active ? C.primary : C.border },
    });
    s.addText(String(st.n), { x: sx, y: stripY, w: 0.5, h: 0.5, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: st.active ? "FFFFFF" : C.muted, align: "center", valign: "middle", margin: 0 });
    s.addText(st.t, { x: sx + 0.6, y: stripY + 0.05, w: w - 0.6, h: 0.4, fontFace: FONT_HEAD, fontSize: 13, bold: st.active, color: st.active ? C.ink : C.muted, valign: "middle", margin: 0 });
    if (!isLast) {
      s.addShape(pres.shapes.LINE, { x: sx + 0.55 + 1.65, y: stripY + 0.25, w: 0.55, h: 0, line: { color: C.border, width: 2 } });
    }
    sx += w + 0.05;
  });

  screenshotCard(s, "11-admin-users.png", 0.5, 2.45, 8.5, 4.6);

  // Right call-out
  const rx = 9.3;
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: 2.45, w: 3.5, h: 4.6, fill: { color: C.primarySoft }, line: { color: C.primary, width: 1 } });
  s.addText("Why Sellers first?", { x: rx + 0.25, y: 2.6, w: 3.1, h: 0.4, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C.primary, margin: 0, valign: "top" });
  s.addText([
    { text: "Sellers list shows every distributor on the network", options: { bullet: true, breakLine: true } },
    { text: "Search by name, business, city or phone", options: { bullet: true, breakLine: true } },
    { text: "\"Add Seller\" creates a fresh account end-to-end", options: { bullet: true, breakLine: true } },
    { text: "Click any row to open Seller Detail", options: { bullet: true } },
  ], { x: rx + 0.25, y: 3.1, w: 3.1, h: 3.8, fontFace: FONT_BODY, fontSize: 12, color: C.body, paraSpaceAfter: 8, margin: 0, valign: "top" });

  footer(s, "Step 1 of 4");
}

// ============================================================
// SLIDE 7 — Add Seller form
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Super Admin · Step 2", "Fill out the Seller details", { pageNum: "05" });

  screenshotCard(s, "12-admin-add-user.png", 0.5, 1.7, 8.3, 5.4);

  const rx = 9.1;
  s.addText("What to capture", { x: rx, y: 1.75, w: 3.7, h: 0.4, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C.muted, margin: 0 });

  const fields = [
    { t: "Profile photo", d: "Optional · helps in seller picker", color: C.muted },
    { t: "Full Name *", d: "Primary contact's name", color: C.primary },
    { t: "Mobile Number *", d: "Used for OTP login", color: C.primary },
    { t: "Business Name *", d: "Trading name of the distributor", color: C.primary },
    { t: "Full Address", d: "Street, area, city, state, PIN", color: C.muted },
    { t: "Status toggle", d: "Active by default — flip if you need to stage", color: C.accent },
  ];
  fields.forEach((f, i) => {
    const y = 2.2 + i * 0.78;
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 0.08, h: 0.65, fill: { color: f.color }, line: { color: f.color } });
    s.addText(f.t, { x: rx + 0.2, y: y, w: 3.5, h: 0.32, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C.ink, margin: 0 });
    s.addText(f.d, { x: rx + 0.2, y: y + 0.32, w: 3.5, h: 0.32, fontFace: FONT_BODY, fontSize: 10.5, color: C.body, margin: 0 });
  });

  footer(s, "Step 2 of 4");
}

// ============================================================
// SLIDE 8 — Companies & Brands assignment
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Super Admin · Step 3", "Assign Companies & Brands the seller works with", { pageNum: "06" });

  // Left: explanatory blocks
  const lx = 0.5;
  s.addText("How assignment works", { x: lx, y: 1.75, w: 5.5, h: 0.4, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C.muted, margin: 0 });

  const blocks = [
    { n: 1, t: "Pick at least one Company", d: "Companies = manufacturers (e.g. ITC, HUL, Nestlé). They live in the master Companies & Brands module." },
    { n: 2, t: "Choose specific brands or All", d: "Either select individual brands, or use \"All brands\" to auto-include any future brands added to that company." },
    { n: 3, t: "Stack multiple companies", d: "Repeat the picker for every company the distributor carries. Each company can have its own brand mix." },
  ];
  blocks.forEach((b, i) => {
    const y = 2.25 + i * 1.55;
    s.addShape(pres.shapes.RECTANGLE, {
      x: lx, y: y, w: 6.0, h: 1.4, fill: { color: C.card }, line: { color: C.border, width: 1 },
    });
    stepBadge(s, lx + 0.25, y + 0.4, b.n, C.primary);
    s.addText(b.t, { x: lx + 1.0, y: y + 0.2, w: 4.7, h: 0.4, fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C.ink, margin: 0 });
    s.addText(b.d, { x: lx + 1.0, y: y + 0.6, w: 4.7, h: 0.85, fontFace: FONT_BODY, fontSize: 11.5, color: C.body, margin: 0 });
  });

  screenshotCard(s, "14-admin-companies.png", 6.9, 1.75, 5.95, 5.3);

  footer(s, "Step 3 of 4");
}

// ============================================================
// SLIDE 9 — Save & activate / Seller Detail
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Super Admin · Step 4", "Save — distributor is live and editable", { pageNum: "07" });

  screenshotCard(s, "16-admin-seller-detail.png", 0.5, 1.7, 8.3, 5.4);

  const rx = 9.1;
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: 1.7, w: 3.7, h: 5.4, fill: { color: C.card }, line: { color: C.border, width: 1 } });
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: 1.7, w: 3.7, h: 0.55, fill: { color: C.green }, line: { color: C.green } });
  s.addText("After Save", { x: rx + 0.25, y: 1.75, w: 3.4, h: 0.45, fontFace: FONT_HEAD, fontSize: 16, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });

  s.addText([
    { text: "Account appears in the Sellers list", options: { bullet: true, breakLine: true } },
    { text: "Mobile number can sign in via OTP", options: { bullet: true, breakLine: true } },
    { text: "Seller Detail page opens for review", options: { bullet: true, breakLine: true } },
    { text: "Edit Profile, brand assignment, status", options: { bullet: true, breakLine: true } },
    { text: "Connectors tab lets you wire DMS / ONDC", options: { bullet: true, breakLine: true } },
    { text: "Deactivate any time without losing data", options: { bullet: true } },
  ], { x: rx + 0.25, y: 2.4, w: 3.4, h: 4.6, fontFace: FONT_BODY, fontSize: 12, color: C.body, paraSpaceAfter: 10, margin: 0, valign: "top" });

  footer(s, "Step 4 of 4");
}

// ============================================================
// SLIDE 10 — Companies & Brands master
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Super Admin", "Companies & Brands master data", { pageNum: "08" });

  screenshotCard(s, "14-admin-companies.png", 0.5, 1.7, 8.5, 5.4);

  const rx = 9.3;
  s.addText("Why this lives at the top", { x: rx, y: 1.75, w: 3.7, h: 0.4, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C.muted, margin: 0 });
  const points = [
    { t: "Companies", d: "Manufacturer-level entities (ITC, HUL …)." },
    { t: "Brands", d: "Belong to a company; visible in seller picker." },
    { t: "Categories", d: "Each company carries category tags for filtering." },
    { t: "Single source", d: "Sellers can only pick from this master list." },
  ];
  points.forEach((p, i) => {
    const y = 2.3 + i * 1.15;
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 3.7, h: 1.0, fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 0.08, h: 1.0, fill: { color: C.accent2 }, line: { color: C.accent2 } });
    s.addText(p.t, { x: rx + 0.25, y: y + 0.1, w: 3.3, h: 0.35, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText(p.d, { x: rx + 0.25, y: y + 0.45, w: 3.3, h: 0.55, fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0 });
  });
  footer(s, "Companies & Brands");
}

// ============================================================
// SLIDE 11 — Connectors
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Super Admin", "Connectors — DMS & ONDC plumbing", { pageNum: "09" });

  screenshotCard(s, "13-admin-connectors.png", 0.5, 1.7, 8.5, 5.4);

  const rx = 9.3;
  const cards = [
    { t: "DMS", d: "Distributor Management System sync — masters, stock, pricing." , color: C.primary},
    { t: "ONDC", d: "Open Network for Digital Commerce participation.", color: C.accent2 },
    { t: "Per-seller config", d: "Connectors can be wired from the seller detail too.", color: C.blue },
  ];
  cards.forEach((c, i) => {
    const cardH = 1.7;
    const y = 1.7 + i * (cardH + 0.1);
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 3.7, h: cardH, fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 3.7, h: 0.4, fill: { color: c.color }, line: { color: c.color } });
    s.addText(c.t, { x: rx + 0.25, y: y, w: 3.3, h: 0.4, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
    s.addText(c.d, { x: rx + 0.25, y: y + 0.5, w: 3.3, h: cardH - 0.6, fontFace: FONT_BODY, fontSize: 12, color: C.body, margin: 0, valign: "top" });
  });
  footer(s, "Connectors");
}

// ============================================================
// SLIDE 12 — Super Admin checklist (recap)
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Super Admin", "Distributor onboarding checklist", { pageNum: "10" });

  const items = [
    { t: "Create the seller account", d: "Name, mobile, business name, address, status." },
    { t: "Pick companies", d: "Add every manufacturer the distributor carries." },
    { t: "Assign brands per company", d: "Specific brands, or All to auto-include future ones." },
    { t: "Wire connectors", d: "DMS for stock & price, ONDC for digital commerce." },
    { t: "Activate", d: "Seller can now sign in via OTP at the same login screen." },
    { t: "Monitor requests", d: "Watch the Requests queue for approvals & changes." },
  ];

  // 2x3 grid of cards
  const cardW = 6.0, cardH = 1.55, gapX = 0.3, gapY = 0.25, startX = 0.5, startY = 1.85;
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cardW, h: cardH, fill: { color: C.card }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
    stepBadge(s, x + 0.3, y + 0.5, i + 1, C.primary);
    s.addText(it.t, { x: x + 1.05, y: y + 0.25, w: cardW - 1.3, h: 0.4, fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C.ink, margin: 0 });
    s.addText(it.d, { x: x + 1.05, y: y + 0.7, w: cardW - 1.3, h: 0.85, fontFace: FONT_BODY, fontSize: 12, color: C.body, margin: 0, valign: "top" });
  });
  footer(s, "Onboarding checklist");
}

// ============================================================
// SLIDE 13 — Section divider: SELLER ADMIN
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.ink };
  s.addShape(pres.shapes.OVAL, { x: -3, y: -3, w: 8, h: 8, fill: { color: C.accent2, transparency: 65 }, line: { color: C.accent2, transparency: 100 } });
  s.addShape(pres.shapes.OVAL, { x: W - 4, y: H - 4, w: 7, h: 7, fill: { color: C.primary, transparency: 75 }, line: { color: C.primary, transparency: 100 } });

  s.addText("PART 03", {
    x: 1, y: 2.6, w: 6, h: 0.4, fontFace: FONT_HEAD, fontSize: 13, bold: true,
    color: C.accent, charSpacing: 8, margin: 0,
  });
  s.addText("Seller Admin", {
    x: 1, y: 3.05, w: 12, h: 1.3, fontFace: FONT_HEAD, fontSize: 64, bold: true,
    color: "FFFFFF", margin: 0,
  });
  s.addText("Catalog · Inventory · Customers · Orders · Offers · Settings", {
    x: 1, y: 4.45, w: 12, h: 0.6, fontFace: FONT_BODY, fontSize: 22, color: "CADCFC", margin: 0,
  });
  const pills = ["My SKU", "Add SKU", "Orders", "Customers", "Offers & Schemes", "Settings", "Reports", "KYC"];
  let px = 1;
  pills.forEach((p) => {
    const w = 0.18 + p.length * 0.11;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: px, y: 5.4, w: w, h: 0.45, fill: { color: "FFFFFF", transparency: 85 }, line: { color: "FFFFFF", transparency: 70 }, rectRadius: 0.08,
    });
    s.addText(p, { x: px, y: 5.4, w: w, h: 0.45, fontFace: FONT_BODY, fontSize: 11, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    px += w + 0.18;
  });
}

// ============================================================
// SLIDE 14 — Seller Dashboard
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Seller Admin", "Phase 1 modules at a glance", { pageNum: "11" });

  screenshotCard(s, "20-seller-dashboard.png", 0.5, 1.85, 8.0, 5.0);

  const rx = 8.7;
  s.addText("Available now", { x: rx, y: 1.9, w: 4.2, h: 0.4, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C.muted, margin: 0 });

  const modules = [
    { t: "My SKU", d: "Catalog & ONDC details." },
    { t: "Orders", d: "View & manage incoming orders." },
    { t: "Customers", d: "Customer list, filters and exports." },
    { t: "Offers & Schemes", d: "Quantity Pricing Schemes (QPS)." },
  ];
  modules.forEach((m, i) => {
    const y = 2.35 + i * 1.02;
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 4.2, h: 0.92, fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 0.08, h: 0.92, fill: { color: C.accent2 }, line: { color: C.accent2 } });
    s.addText(m.t, { x: rx + 0.25, y: y + 0.1, w: 4, h: 0.35, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText(m.d, { x: rx + 0.25, y: y + 0.45, w: 4, h: 0.45, fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0 });
  });
  footer(s, "Seller Admin · Modules");
}

// ============================================================
// SLIDE 15 — My SKU
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Catalog · My SKU", "Every SKU the seller carries", { pageNum: "12" });

  screenshotCard(s, "21-my-sku.png", 0.5, 1.7, 8.5, 5.4);

  const rx = 9.3;
  s.addText("Highlights", { x: rx, y: 1.75, w: 3.7, h: 0.4, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C.muted, margin: 0 });
  s.addText([
    { text: "Filters by brand, category, status, ONDC", options: { bullet: true, breakLine: true } },
    { text: "Search by name, code or HSN", options: { bullet: true, breakLine: true } },
    { text: "Inline price & inventory edits", options: { bullet: true, breakLine: true } },
    { text: "Click any row for SKU detail", options: { bullet: true, breakLine: true } },
    { text: "Bulk actions for status change", options: { bullet: true } },
  ], { x: rx, y: 2.2, w: 3.7, h: 4.8, fontFace: FONT_BODY, fontSize: 13, color: C.body, paraSpaceAfter: 8, margin: 0, valign: "top" });

  footer(s, "My SKU");
}

// ============================================================
// SLIDE 16 — Add SKU options
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Catalog · Add SKU", "Three ways to grow the catalog", { pageNum: "13" });

  screenshotCard(s, "22-add-sku.png", 0.5, 1.7, 5.8, 5.4);

  // Right grid of three options
  const rx = 6.6;
  const opts = [
    { t: "Manual entry", d: "One SKU at a time — full control over fields and ONDC attributes.", color: C.primary, file: "23-add-sku-manual.png" },
    { t: "Bulk import", d: "Upload a CSV / Excel template to onboard hundreds of SKUs.", color: C.accent2, file: "24-add-sku-bulk.png" },
    { t: "Central Catalog Sync", d: "Pull pre-validated SKUs from Qwipo's master catalog.", color: C.blue, file: "25-add-sku-central.png" },
  ];
  opts.forEach((o, i) => {
    const y = 1.7 + i * 1.85;
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 6.25, h: 1.7, fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 0.12, h: 1.7, fill: { color: o.color }, line: { color: o.color } });
    stepBadge(s, rx + 0.35, y + 0.6, i + 1, o.color);
    s.addText(o.t, { x: rx + 1.05, y: y + 0.25, w: 5.0, h: 0.4, fontFace: FONT_HEAD, fontSize: 16, bold: true, color: C.ink, margin: 0 });
    s.addText(o.d, { x: rx + 1.05, y: y + 0.7, w: 5.0, h: 0.95, fontFace: FONT_BODY, fontSize: 12, color: C.body, margin: 0, valign: "top" });
  });
  footer(s, "Add SKU");
}

// ============================================================
// SLIDE 17 — Add SKU Manual deep dive
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Add SKU · Manual entry", "Capture product, price, ONDC and media", { pageNum: "14" });

  screenshotCard(s, "23-add-sku-manual.png", 0.5, 1.7, 8.5, 5.4);

  const rx = 9.3;
  const fields = [
    { t: "Identity", d: "Name, brand, category, HSN" },
    { t: "Pricing", d: "MRP, list price, GST, discount tiers" },
    { t: "Inventory", d: "Pack info, MOQ, stock on hand" },
    { t: "ONDC fields", d: "Validation rules from the master sheet" },
    { t: "Media", d: "Primary image plus gallery" },
  ];
  fields.forEach((f, i) => {
    const y = 1.85 + i * 1.05;
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 3.7, h: 0.92, fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 0.08, h: 0.92, fill: { color: C.primary }, line: { color: C.primary } });
    s.addText(f.t, { x: rx + 0.25, y: y + 0.1, w: 3.3, h: 0.35, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText(f.d, { x: rx + 0.25, y: y + 0.45, w: 3.3, h: 0.45, fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0 });
  });
  footer(s, "Add SKU · Manual");
}

// ============================================================
// SLIDE 18 — Bulk Import + Central Catalog (side by side)
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Add SKU · At scale", "Bulk Import and Central Catalog Sync", { pageNum: "15" });

  // Two columns
  const colW = 6.1, colY = 1.75, colH = 5.3;
  // Left column - Bulk
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: colY, w: colW, h: colH, fill: { color: C.card }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: colY, w: colW, h: 0.5, fill: { color: C.accent2 }, line: { color: C.accent2 } });
  s.addText("Bulk Import", { x: 0.7, y: colY, w: colW - 0.4, h: 0.5, fontFace: FONT_HEAD, fontSize: 16, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
  s.addImage({ path: path.join(SHOTS, "24-add-sku-bulk.png"), x: 0.65, y: colY + 0.65, w: colW - 0.3, h: 3.0, sizing: { type: "contain", w: colW - 0.3, h: 3.0 } });
  s.addText([
    { text: "Download template (CSV / XLSX)", options: { bullet: true, breakLine: true } },
    { text: "Upload completed file", options: { bullet: true, breakLine: true } },
    { text: "Validation report flags ONDC errors", options: { bullet: true, breakLine: true } },
    { text: "Commit valid rows in one go", options: { bullet: true } },
  ], { x: 0.7, y: colY + 3.75, w: colW - 0.4, h: 1.4, fontFace: FONT_BODY, fontSize: 12, color: C.body, paraSpaceAfter: 6, margin: 0, valign: "top" });

  // Right column - Central
  const cx = 6.75;
  s.addShape(pres.shapes.RECTANGLE, { x: cx, y: colY, w: colW, h: colH, fill: { color: C.card }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: cx, y: colY, w: colW, h: 0.5, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("Central Catalog Sync", { x: cx + 0.2, y: colY, w: colW - 0.4, h: 0.5, fontFace: FONT_HEAD, fontSize: 16, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
  s.addImage({ path: path.join(SHOTS, "25-add-sku-central.png"), x: cx + 0.15, y: colY + 0.65, w: colW - 0.3, h: 3.0, sizing: { type: "contain", w: colW - 0.3, h: 3.0 } });
  s.addText([
    { text: "Browse Qwipo's master catalog", options: { bullet: true, breakLine: true } },
    { text: "Filter by brand, category, status", options: { bullet: true, breakLine: true } },
    { text: "Pick SKUs and add them to your store", options: { bullet: true, breakLine: true } },
    { text: "Pre-validated for ONDC out of the box", options: { bullet: true } },
  ], { x: cx + 0.2, y: colY + 3.75, w: colW - 0.4, h: 1.4, fontFace: FONT_BODY, fontSize: 12, color: C.body, paraSpaceAfter: 6, margin: 0, valign: "top" });

  footer(s, "Add SKU · Scale");
}

// ============================================================
// SLIDE 19 — Price List & Inventory
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Catalog · Pricing & Stock", "Price list, price-inventory, and stock at a glance", { pageNum: "16" });

  // 3 mini cards stacked horizontally with images
  const cardW = 4.1, cardH = 5.3, startX = 0.5, startY = 1.7, gap = 0.2;
  const items = [
    { t: "Price List", d: "Bulk-edit MRP, list price, GST and tier discounts.", file: "26-price-list.png", color: C.primary },
    { t: "Price-Inventory", d: "Combined pricing + stock view for fast updates.", file: "27-price-inventory.png", color: C.accent2 },
    { t: "Inventory", d: "Stock on hand by SKU with low-stock signals.", file: "28-inventory.png", color: C.green },
  ];
  items.forEach((it, i) => {
    const x = startX + i * (cardW + gap);
    s.addShape(pres.shapes.RECTANGLE, { x, y: startY, w: cardW, h: cardH, fill: { color: C.card }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: startY, w: cardW, h: 0.5, fill: { color: it.color }, line: { color: it.color } });
    s.addText(it.t, { x: x + 0.2, y: startY, w: cardW - 0.4, h: 0.5, fontFace: FONT_HEAD, fontSize: 16, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
    s.addImage({ path: path.join(SHOTS, it.file), x: x + 0.2, y: startY + 0.65, w: cardW - 0.4, h: 3.4, sizing: { type: "contain", w: cardW - 0.4, h: 3.4 } });
    s.addText(it.d, { x: x + 0.2, y: startY + 4.2, w: cardW - 0.4, h: 1.0, fontFace: FONT_BODY, fontSize: 12, color: C.body, margin: 0, valign: "top" });
  });
  footer(s, "Pricing & Stock");
}

// ============================================================
// SLIDE 20 — Orders list
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Orders", "Track every incoming order in one queue", { pageNum: "17" });

  screenshotCard(s, "30-orders.png", 0.5, 1.7, 8.5, 5.4);

  const rx = 9.3;
  s.addText("On the Orders page", { x: rx, y: 1.75, w: 3.7, h: 0.4, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C.muted, margin: 0 });
  s.addText([
    { text: "Status pipeline — New, Processing, Shipped, Delivered", options: { bullet: true, breakLine: true } },
    { text: "Channel filter — ONDC, Amazon, Flipkart, direct", options: { bullet: true, breakLine: true } },
    { text: "Search by order ID or customer", options: { bullet: true, breakLine: true } },
    { text: "Quick actions — accept, ship, cancel", options: { bullet: true, breakLine: true } },
    { text: "Click any row for full detail", options: { bullet: true } },
  ], { x: rx, y: 2.2, w: 3.7, h: 4.8, fontFace: FONT_BODY, fontSize: 12, color: C.body, paraSpaceAfter: 8, margin: 0, valign: "top" });

  footer(s, "Orders");
}

// ============================================================
// SLIDE 21 — Order Detail
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Orders · Detail", "Everything about one order on a single page", { pageNum: "18" });

  screenshotCard(s, "31-order-detail.png", 0.5, 1.7, 8.5, 5.4);

  const rx = 9.3;
  const sections = [
    { t: "Customer & address", d: "Who placed it, where it goes." },
    { t: "Line items", d: "SKU, qty, price, taxes, totals." },
    { t: "Timeline", d: "Status changes with timestamps." },
    { t: "Actions", d: "Accept, ship, cancel, invoice." },
  ];
  sections.forEach((sec, i) => {
    const y = 1.85 + i * 1.32;
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 3.7, h: 1.18, fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 0.08, h: 1.18, fill: { color: C.primary }, line: { color: C.primary } });
    s.addText(sec.t, { x: rx + 0.25, y: y + 0.15, w: 3.3, h: 0.35, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText(sec.d, { x: rx + 0.25, y: y + 0.5, w: 3.3, h: 0.65, fontFace: FONT_BODY, fontSize: 11.5, color: C.body, margin: 0 });
  });
  footer(s, "Order detail");
}

// ============================================================
// SLIDE 22 — Customers list
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Customers", "All retailers who buy from this distributor", { pageNum: "19" });

  screenshotCard(s, "40-customers.png", 0.5, 1.7, 8.5, 5.4);

  const rx = 9.3;
  s.addText("What you can do", { x: rx, y: 1.75, w: 3.7, h: 0.4, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C.muted, margin: 0 });
  s.addText([
    { text: "Filter by company approval status", options: { bullet: true, breakLine: true } },
    { text: "Selection key is customer + company", options: { bullet: true, breakLine: true } },
    { text: "Bulk approve / reject / reopen", options: { bullet: true, breakLine: true } },
    { text: "Export filtered list to CSV", options: { bullet: true, breakLine: true } },
    { text: "Click row for full customer detail", options: { bullet: true } },
  ], { x: rx, y: 2.2, w: 3.7, h: 4.8, fontFace: FONT_BODY, fontSize: 12, color: C.body, paraSpaceAfter: 8, margin: 0, valign: "top" });

  footer(s, "Customers");
}

// ============================================================
// SLIDE 23 — Customer Detail
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Customers · Detail", "Per-company approvals and history", { pageNum: "20" });

  screenshotCard(s, "41-customer-detail.png", 0.5, 1.7, 8.5, 5.4);

  const rx = 9.3;
  const sections = [
    { t: "Profile", d: "Name, mobile, GSTIN, address." },
    { t: "Company approvals", d: "Status across each brand company." },
    { t: "Order history", d: "Past orders, totals, frequency." },
    { t: "Per-company actions", d: "Reopen rejected, deactivate, edit." },
  ];
  sections.forEach((sec, i) => {
    const y = 1.85 + i * 1.32;
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 3.7, h: 1.18, fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 0.08, h: 1.18, fill: { color: C.accent2 }, line: { color: C.accent2 } });
    s.addText(sec.t, { x: rx + 0.25, y: y + 0.15, w: 3.3, h: 0.35, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText(sec.d, { x: rx + 0.25, y: y + 0.5, w: 3.3, h: 0.65, fontFace: FONT_BODY, fontSize: 11.5, color: C.body, margin: 0 });
  });
  footer(s, "Customer detail");
}

// ============================================================
// SLIDE 24 — Offers & Schemes list
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Offers & Schemes", "Quantity Pricing Schemes (QPS)", { pageNum: "21" });

  screenshotCard(s, "50-offers.png", 0.5, 1.7, 8.5, 5.4);

  const rx = 9.3;
  s.addText("Why QPS matters", { x: rx, y: 1.75, w: 3.7, h: 0.4, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: C.muted, margin: 0 });
  s.addText([
    { text: "Slab-based discounts that drive volume", options: { bullet: true, breakLine: true } },
    { text: "Scope by brand, category or specific SKUs", options: { bullet: true, breakLine: true } },
    { text: "Time-bound — start and end dates", options: { bullet: true, breakLine: true } },
    { text: "Status filter — active, scheduled, expired", options: { bullet: true, breakLine: true } },
    { text: "One-click duplicate to roll forward", options: { bullet: true } },
  ], { x: rx, y: 2.2, w: 3.7, h: 4.8, fontFace: FONT_BODY, fontSize: 12, color: C.body, paraSpaceAfter: 8, margin: 0, valign: "top" });

  footer(s, "Offers & Schemes");
}

// ============================================================
// SLIDE 25 — Create Scheme
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Offers · Create scheme", "Build a QPS in four small steps", { pageNum: "22" });

  screenshotCard(s, "51-offer-create.png", 0.5, 1.7, 7.6, 5.4);

  const rx = 8.4;
  const steps = [
    { t: "Pick a scope", d: "All catalog, brand, category, or specific SKUs." },
    { t: "Define slabs", d: "Buy ≥ N → discount %, or buy N get M free." },
    { t: "Schedule it", d: "Start date, end date, time zone." },
    { t: "Save & activate", d: "Visible to customers immediately on save." },
  ];
  steps.forEach((st, i) => {
    const y = 1.85 + i * 1.32;
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 4.6, h: 1.18, fill: { color: C.card }, line: { color: C.border, width: 1 } });
    stepBadge(s, rx + 0.18, y + 0.32, i + 1, C.accent2);
    s.addText(st.t, { x: rx + 0.9, y: y + 0.15, w: 3.6, h: 0.35, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0 });
    s.addText(st.d, { x: rx + 0.9, y: y + 0.5, w: 3.6, h: 0.65, fontFace: FONT_BODY, fontSize: 11.5, color: C.body, margin: 0 });
  });
  footer(s, "Create scheme");
}

// ============================================================
// SLIDE 26 — Settings overview
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Settings", "Seven settings groups — configure once, run forever", { pageNum: "23" });

  screenshotCard(s, "60-settings.png", 0.5, 1.7, 5.8, 5.4);

  const rx = 6.6;
  const groups = [
    { t: "Store", d: "Branding, business info", color: C.primary },
    { t: "Order", d: "Order rules, prefixes, statuses", color: C.accent2 },
    { t: "Shipping", d: "Couriers, weight & rate cards", color: C.blue },
    { t: "Serviceability", d: "PIN codes you ship to", color: C.green },
    { t: "Payment", d: "Methods, gateways, terms", color: C.accent },
    { t: "Customer", d: "Onboarding & approvals", color: "8B5CF6" },
    { t: "Communication", d: "SMS, email, WhatsApp templates", color: "EF4444" },
  ];
  // 7 stacked cards in a column
  const cellW = 6.3, cellH = 0.7, gy = 0.07;
  const startY = 1.7;
  groups.forEach((g, i) => {
    const x = rx;
    const y = startY + i * (cellH + gy);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cellW, h: cellH, fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.1, h: cellH, fill: { color: g.color }, line: { color: g.color } });
    s.addText(g.t, { x: x + 0.25, y: y + 0.08, w: 2.0, h: 0.55, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: C.ink, margin: 0, valign: "middle" });
    s.addText(g.d, { x: x + 2.3, y: y + 0.08, w: cellW - 2.5, h: 0.55, fontFace: FONT_BODY, fontSize: 11.5, color: C.body, margin: 0, valign: "middle" });
  });
  footer(s, "Settings");
}

// ============================================================
// SLIDE 27 — Settings strip 1 (Store / Order / Shipping)
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Settings · Operations", "Store, Order, Shipping", { pageNum: "24" });

  const cardW = 4.1, cardH = 5.3, startX = 0.5, startY = 1.7, gap = 0.2;
  const items = [
    { t: "Store", d: "Logo, business profile, registered address.", file: "61-settings-store.png", color: C.primary },
    { t: "Order", d: "Order ID prefixes, default statuses, auto-cancel rules.", file: "62-settings-order.png", color: C.accent2 },
    { t: "Shipping", d: "Carriers, weight bands, rate cards, packaging.", file: "63-settings-shipping.png", color: C.blue },
  ];
  items.forEach((it, i) => {
    const x = startX + i * (cardW + gap);
    s.addShape(pres.shapes.RECTANGLE, { x, y: startY, w: cardW, h: cardH, fill: { color: C.card }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: startY, w: cardW, h: 0.5, fill: { color: it.color }, line: { color: it.color } });
    s.addText(it.t, { x: x + 0.2, y: startY, w: cardW - 0.4, h: 0.5, fontFace: FONT_HEAD, fontSize: 16, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
    s.addImage({ path: path.join(SHOTS, it.file), x: x + 0.2, y: startY + 0.65, w: cardW - 0.4, h: 3.4, sizing: { type: "contain", w: cardW - 0.4, h: 3.4 } });
    s.addText(it.d, { x: x + 0.2, y: startY + 4.2, w: cardW - 0.4, h: 1.0, fontFace: FONT_BODY, fontSize: 12, color: C.body, margin: 0, valign: "top" });
  });
  footer(s, "Settings · Operations");
}

// ============================================================
// SLIDE 28 — Settings strip 2 (Serviceability / Payment / Customer / Communication)
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Settings · Customer-facing", "Serviceability, Payment, Customer, Communication", { pageNum: "25" });

  const cardW = 3.05, cardH = 5.3, startX = 0.5, startY = 1.7, gap = 0.16;
  const items = [
    { t: "Serviceability", d: "Allowed PIN codes & zones.", file: "64-settings-serviceability.png", color: C.primary },
    { t: "Payment", d: "Methods, gateways, credit terms.", file: "65-settings-payment.png", color: C.accent2 },
    { t: "Customer", d: "Onboarding & approval policy.", file: "66-settings-customer.png", color: C.green },
    { t: "Communication", d: "SMS, email, WhatsApp templates.", file: "67-settings-communication.png", color: C.blue },
  ];
  items.forEach((it, i) => {
    const x = startX + i * (cardW + gap);
    s.addShape(pres.shapes.RECTANGLE, { x, y: startY, w: cardW, h: cardH, fill: { color: C.card }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: startY, w: cardW, h: 0.5, fill: { color: it.color }, line: { color: it.color } });
    s.addText(it.t, { x: x + 0.15, y: startY, w: cardW - 0.3, h: 0.5, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
    s.addImage({ path: path.join(SHOTS, it.file), x: x + 0.15, y: startY + 0.6, w: cardW - 0.3, h: 3.4, sizing: { type: "contain", w: cardW - 0.3, h: 3.4 } });
    s.addText(it.d, { x: x + 0.15, y: startY + 4.15, w: cardW - 0.3, h: 1.05, fontFace: FONT_BODY, fontSize: 11.5, color: C.body, margin: 0, valign: "top" });
  });
  footer(s, "Settings · Customer-facing");
}

// ============================================================
// SLIDE 29 — Reports
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Reports", "Six dashboards covering the whole business", { pageNum: "26" });

  screenshotCard(s, "70-reports.png", 0.5, 1.7, 8.5, 5.4);

  const rx = 9.3;
  const reports = [
    { t: "Sales & Orders", c: C.primary },
    { t: "Inventory", c: C.accent2 },
    { t: "Product Performance", c: C.blue },
    { t: "Customer Insights", c: C.green },
    { t: "Schemes & Offers", c: C.accent },
    { t: "Operations & Delivery", c: "8B5CF6" },
  ];
  reports.forEach((r, i) => {
    const y = 1.8 + i * 0.85;
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y, w: 3.7, h: 0.72, fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape(pres.shapes.OVAL, { x: rx + 0.18, y: y + 0.18, w: 0.35, h: 0.35, fill: { color: r.c }, line: { color: r.c } });
    s.addText(String(i + 1), { x: rx + 0.18, y: y + 0.18, w: 0.35, h: 0.35, fontFace: FONT_HEAD, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    s.addText(r.t, { x: rx + 0.65, y: y + 0.16, w: 3.0, h: 0.4, fontFace: FONT_HEAD, fontSize: 13, bold: true, color: C.ink, valign: "middle", margin: 0 });
  });
  footer(s, "Reports");
}

// ============================================================
// SLIDE 30 — Profile · KYC · Support
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  pageHeader(s, "Account · KYC · Support", "Personal account essentials", { pageNum: "27" });

  const cardW = 4.1, cardH = 5.3, startX = 0.5, startY = 1.7, gap = 0.2;
  const items = [
    { t: "Profile", d: "Personal info, password, mobile, role.", file: "80-profile.png", color: C.primary },
    { t: "KYC", d: "Upload PAN, GST, bank docs and track status.", file: "82-kyc.png", color: C.accent2 },
    { t: "Support", d: "Raise tickets, track resolution, FAQs.", file: "81-support.png", color: C.blue },
  ];
  items.forEach((it, i) => {
    const x = startX + i * (cardW + gap);
    s.addShape(pres.shapes.RECTANGLE, { x, y: startY, w: cardW, h: cardH, fill: { color: C.card }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: startY, w: cardW, h: 0.5, fill: { color: it.color }, line: { color: it.color } });
    s.addText(it.t, { x: x + 0.2, y: startY, w: cardW - 0.4, h: 0.5, fontFace: FONT_HEAD, fontSize: 16, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
    s.addImage({ path: path.join(SHOTS, it.file), x: x + 0.2, y: startY + 0.65, w: cardW - 0.4, h: 3.4, sizing: { type: "contain", w: cardW - 0.4, h: 3.4 } });
    s.addText(it.d, { x: x + 0.2, y: startY + 4.2, w: cardW - 0.4, h: 1.0, fontFace: FONT_BODY, fontSize: 12, color: C.body, margin: 0, valign: "top" });
  });
  footer(s, "Account & support");
}

// ============================================================
// SLIDE 31 — Recap (closing)
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.ink };
  s.addShape(pres.shapes.OVAL, { x: -3, y: -3, w: 8, h: 8, fill: { color: C.primary, transparency: 70 }, line: { color: C.primary, transparency: 100 } });
  s.addShape(pres.shapes.OVAL, { x: W - 4, y: H - 4, w: 7, h: 7, fill: { color: C.accent2, transparency: 80 }, line: { color: C.accent2, transparency: 100 } });

  s.addText("RECAP", { x: 1, y: 0.9, w: 6, h: 0.4, fontFace: FONT_HEAD, fontSize: 13, bold: true, color: C.accent, charSpacing: 8, margin: 0 });
  s.addText("Two roles. One platform. Six steps to live.", {
    x: 1, y: 1.4, w: 11.3, h: 1.0, fontFace: FONT_HEAD, fontSize: 34, bold: true, color: "FFFFFF", margin: 0,
  });

  // Two columns: Super Admin steps and Seller steps
  const colW = 5.6, colY = 2.7, colH = 3.2;
  // Super Admin
  s.addShape(pres.shapes.RECTANGLE, { x: 1, y: colY, w: colW, h: colH, fill: { color: "FFFFFF", transparency: 90 }, line: { color: "FFFFFF", transparency: 70 } });
  s.addText("Super Admin", { x: 1.25, y: colY + 0.15, w: colW - 0.4, h: 0.4, fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.accent, margin: 0 });
  s.addText([
    { text: "Add seller (name, mobile, business)", options: { bullet: true, breakLine: true } },
    { text: "Assign companies + brands", options: { bullet: true, breakLine: true } },
    { text: "Wire DMS / ONDC connectors", options: { bullet: true, breakLine: true } },
    { text: "Activate & monitor requests", options: { bullet: true } },
  ], { x: 1.25, y: colY + 0.7, w: colW - 0.4, h: 2.4, fontFace: FONT_BODY, fontSize: 14, color: "FFFFFF", paraSpaceAfter: 8, margin: 0, valign: "top" });

  // Seller
  s.addShape(pres.shapes.RECTANGLE, { x: 6.8, y: colY, w: colW, h: colH, fill: { color: "FFFFFF", transparency: 90 }, line: { color: "FFFFFF", transparency: 70 } });
  s.addText("Seller", { x: 7.05, y: colY + 0.15, w: colW - 0.4, h: 0.4, fontFace: FONT_HEAD, fontSize: 18, bold: true, color: C.accent, margin: 0 });
  s.addText([
    { text: "Build catalog — manual / bulk / central", options: { bullet: true, breakLine: true } },
    { text: "Set price list and inventory", options: { bullet: true, breakLine: true } },
    { text: "Approve customers, run offers (QPS)", options: { bullet: true, breakLine: true } },
    { text: "Configure settings, watch reports", options: { bullet: true } },
  ], { x: 7.05, y: colY + 0.7, w: colW - 0.4, h: 2.4, fontFace: FONT_BODY, fontSize: 14, color: "FFFFFF", paraSpaceAfter: 8, margin: 0, valign: "top" });

  s.addText("Thank you.", { x: 1, y: 6.4, w: 11.3, h: 0.6, fontFace: FONT_HEAD, fontSize: 26, bold: true, color: "CADCFC", align: "center", margin: 0 });
}

// Write
pres.writeFile({ fileName: OUT }).then((f) => {
  console.log("WROTE", f);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
