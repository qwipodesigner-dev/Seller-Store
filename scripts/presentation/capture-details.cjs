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
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const t = await page.evaluate((el) => el.textContent, b);
    if (t && t.trim().toLowerCase() === "send otp") { await b.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 700));
  const inputs = await page.$$("input");
  let otpInput = inputs[inputs.length - 1];
  await otpInput.type(OTP, { delay: 30 });
  const submitBtns = await page.$$("button");
  for (const b of submitBtns) {
    const t = await page.evaluate((el) => el.textContent, b);
    if (t && /verify|sign in|login|continue/i.test(t)) { await b.click(); break; }
  }
  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 8000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 600));
}

async function snap(page, route, name, wait = 900) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, wait));
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  console.log("captured", name);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    args: ["--no-sandbox"],
  });

  // Super Admin -> seller detail
  {
    const page = await browser.newPage();
    await login(page, SUPER_ADMIN);
    await snap(page, "/admin/users/seller-1", "16-admin-seller-detail");
    await page.close();
  }

  // Seller -> order detail, customer detail
  {
    const page = await browser.newPage();
    await login(page, SELLER);
    await snap(page, "/orders/ORD-1234", "31-order-detail");
    await snap(page, "/customers/CUST-001", "41-customer-detail");
    // Sub reports
    await snap(page, "/reports/sales-orders", "71-reports-sales");
    await snap(page, "/reports/inventory", "72-reports-inventory");
    await snap(page, "/kyc", "82-kyc");
    await page.close();
  }

  await browser.close();
  console.log("done");
})();
