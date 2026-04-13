Design a modern left-side navigation menu for a B2B Seller Application (SMP platform).

Context:
This is a distributor/seller dashboard used for managing products, inventory, orders, and promotions.

Sidebar Structure:
- Vertical left sidebar (fixed)
- Clean, minimal, icon + label layout
- Highlight active section clearly

Menu Order (Important):
1. Dashboard
2. Products
3. Inventory
4. Offers & Schemes  ← (New Section to Design)
5. Orders
6. Customers
7. Reports
8. Settings

---

Now, design the "Offers & Schemes" section experience.

When user clicks "Offers & Schemes":

Page Objective:
Allow sellers to create and manage promotions, discounts, and schemes for products/customers.

---

### 🧩 Page Layout

Top Section:
- Page Title: "Offers & Schemes"
- Primary CTA button: "+ Create Offer"
- Optional filter bar (status, date, type)

---

### 📊 Main Content – Offer Cards/List

Display existing offers as:
- Card view (preferred) OR table view toggle

Each Offer Card should show:
- Offer Name
- Type (Discount / Scheme / Combo / Coupon)
- Applicable Scope (Product / Category / Brand / Customer)
- Validity (Start & End Date)
- Status (Active / Scheduled / Expired)
- Discount Summary (e.g., "10% off", "Buy 2 Get 1")
- Actions: Edit | Pause | Delete

---

### 🧱 Offer Types to Support

1. Discount Offers
   - % discount
   - Flat discount

2. Scheme Offers
   - Buy X Get Y
   - Quantity-based slabs

3. Combo Offers
   - Bundle multiple products

4. Coupon Codes
   - Code-based redemption

---

### 🎨 Design Guidelines

- Use clean card-based UI (similar to Shopify / Razorpay dashboard)
- Color code status:
  - Green = Active
  - Yellow = Scheduled
  - Grey = Expired
- Use badges for offer type
- Cards should be easily scannable
- Maintain good spacing and hierarchy

---

### ⚡ Interaction

- Clicking "+ Create Offer" opens a step-based flow:
  Step 1: Select Offer Type
  Step 2: Configure Rules
  Step 3: Select Products / Customers
  Step 4: Set Validity
  Step 5: Review & Publish

---

### 🎯 UX Goals

- Make it easy to understand and manage promotions
- Avoid complexity in first view
- Ensure scalability for advanced schemes later

---

### 🚫 Avoid

- No cluttered tables with too many columns
- No complex rule builder on main screen
- No overwhelming filters

---

Tone:
Modern B2B SaaS UI (inspired by Shopify, Zoho, Stripe dashboards)