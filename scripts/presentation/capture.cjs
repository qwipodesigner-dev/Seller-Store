// Capture screenshots of key Seller Store flows for the deck.
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:5180";
const OUT = path.resolve(__dirname, "screenshots");
fs.mkdirSync(OUT, { recursive: true });

const SUPER_ADMIN = "9900000001";
const SELLER = "9900000002";
const OTP = "1234";

async function login(page, mobile) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle0" });
  await page.waitForSelector('input[placeholder*="mobile" i]');
  await page.type('input[placeholder*="mobile" i]', mobile, { delay: 30 });
  // Click Send OTP
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const t = await page.evaluate((el) => el.textContent, b);
    if (t && t.trim().toLowerCase() === "send otp") {
      await b.click();
      break;
    }
  }
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll("input")).some((i) => /otp/i.test(i.placeholder || "") || i.maxLength === 4 || i.inputMode === "numeric"),
    { timeout: 5000 }
  ).catch(() => {});
  // Find OTP input - look for the second input or an input with smaller maxLength
  const inputs = await page.$$("input");
  let otpInput = null;
  for (const inp of inputs) {
    const ph = await page.evaluate((el) => el.placeholder || "", inp);
    if (/otp|code|4-digit|digit/i.test(ph)) {
      otpInput = inp;
      break;
    }
  }
  if (!otpInput && inputs.length > 1) otpInput = inputs[inputs.length - 1];
  await otpInput.type(OTP, { delay: 30 });
  // Click Verify / Login button
  const submitBtns = await page.$$("button");
  for (const b of submitBtns) {
    const t = await page.evaluate((el) => el.textContent, b);
    if (t && /verify|sign in|login|continue/i.test(t)) {
      await b.click();
      break;
    }
  }
  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 8000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 600));
}

async function snap(page, route, name, opts = {}) {
  const url = `${BASE}${route}`;
  await page.goto(url, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, opts.wait || 800));
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: !!opts.fullPage });
  console.log("captured", name, "->", file);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    args: ["--no-sandbox"],
  });

  // ---------- Login screen (no auth needed) ----------
  {
    const page = await browser.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT, "01-login.png") });
    console.log("captured 01-login");
    await page.close();
  }

  // ---------- Super Admin flow ----------
  {
    const page = await browser.newPage();
    await login(page, SUPER_ADMIN);

    const adminRoutes = [
      ["/admin", "10-admin-dashboard"],
      ["/admin/users", "11-admin-users"],
      ["/admin/users/add", "12-admin-add-user"],
      ["/admin/connectors", "13-admin-connectors"],
      ["/admin/companies", "14-admin-companies"],
      ["/admin/requests", "15-admin-requests"],
    ];
    for (const [r, n] of adminRoutes) {
      await snap(page, r, n);
    }

    // Click into a specific seller from active sellers list to capture seller detail
    await page.goto(`${BASE}/admin/users`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 600));
    const links = await page.$$('a[href*="/admin/users/"]');
    if (links.length) {
      await links[0].click();
      await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 5000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: path.join(OUT, "16-admin-seller-detail.png") });
      console.log("captured 16-admin-seller-detail");
    }
    await page.close();
  }

  // ---------- Seller Admin flow ----------
  {
    const page = await browser.newPage();
    await login(page, SELLER);

    const sellerRoutes = [
      ["/", "20-seller-dashboard"],
      ["/products/my-sku", "21-my-sku"],
      ["/products/add-sku", "22-add-sku"],
      ["/products/add-sku/manual", "23-add-sku-manual"],
      ["/products/add-sku/import", "24-add-sku-bulk"],
      ["/products/add-sku/central-catalog", "25-add-sku-central"],
      ["/products/price-list", "26-price-list"],
      ["/products/price-inventory", "27-price-inventory"],
      ["/inventory", "28-inventory"],
      ["/orders", "30-orders"],
      ["/customers", "40-customers"],
      ["/offers", "50-offers"],
      ["/offers/create", "51-offer-create"],
      ["/settings", "60-settings"],
      ["/settings/store", "61-settings-store"],
      ["/settings/order", "62-settings-order"],
      ["/settings/shipping", "63-settings-shipping"],
      ["/settings/serviceability", "64-settings-serviceability"],
      ["/settings/payment", "65-settings-payment"],
      ["/settings/customer", "66-settings-customer"],
      ["/settings/communication", "67-settings-communication"],
      ["/reports", "70-reports"],
      ["/profile", "80-profile"],
      ["/support", "81-support"],
    ];
    for (const [r, n] of sellerRoutes) {
      await snap(page, r, n);
    }

    // Click into an order detail
    await page.goto(`${BASE}/orders`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 700));
    const orderLinks = await page.$$('a[href*="/orders/"]');
    if (orderLinks.length) {
      await orderLinks[0].click();
      await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 5000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 700));
      await page.screenshot({ path: path.join(OUT, "31-order-detail.png") });
      console.log("captured 31-order-detail");
    }

    // Click into a customer detail
    await page.goto(`${BASE}/customers`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 700));
    const custLinks = await page.$$('a[href*="/customers/"]');
    if (custLinks.length) {
      await custLinks[0].click();
      await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 5000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 700));
      await page.screenshot({ path: path.join(OUT, "41-customer-detail.png") });
      console.log("captured 41-customer-detail");
    }

    await page.close();
  }

  await browser.close();
  console.log("done");
})();
