Design a modern "Reports" page for a B2B Seller Application (Distributor Dashboard).

Objective:
Move away from traditional tab-based reporting (like Orders, Revenue, etc.) and create a category-driven, visually engaging reporting experience.

---

### 🧩 Page Structure

1. Header Section
2. Category Cards (Primary Navigation)
3. Dynamic Report View (based on selected category)

---

### 🧠 1. Header Section

- Title: "Reports"
- Subtitle: "Analyze your business performance"
- Global Filters:
  - Date Range (Last 7 days, 30 days, Custom)
  - Channel (ONDC / Marketplace / All)

---

### 📦 2. Category-Based Report Navigation (KEY CHANGE)

Instead of tabs, show large clickable cards:

Create categories:

1. Sales & Orders
   - Icon: Chart / Sales
   - Description: "Orders, revenue, and trends"

2. Inventory Insights
   - Icon: Boxes / Inventory
   - Description: "Stock levels and movement"

3. Product Performance
   - Icon: Product / Star
   - Description: "Top & low performing SKUs"

4. Customer Insights
   - Icon: Users
   - Description: "Buyer behavior and trends"

5. Scheme & Offers Performance
   - Icon: Tag / Discount
   - Description: "Impact of schemes and discounts"

6. Operations & Delivery
   - Icon: Truck
   - Description: "Fulfillment and delivery metrics"

---

### 🎨 Category Card Design

- Grid layout (2–3 columns)
- Each card includes:
  - Icon
  - Title
  - Short description
- Hover effect (elevation / highlight)
- Clean, modern SaaS style

---

### 🔄 3. Dynamic Report View

When user clicks a category:

- Load a dedicated view BELOW or navigate to a sub-page

Example (Sales & Orders):

- Total Orders
- Total Revenue
- Avg Order Value
- Order Trends (simple line – optional minimal chart)

Example (Inventory):

- Total SKUs
- Low stock items
- Stock movement list

---

### ⚡ UX Behavior

- Category cards act as entry points (not tabs)
- Keep initial screen clean and decision-focused
- Avoid overwhelming user with all reports at once

---

### 🎯 Design Philosophy

- Category-first navigation
- Progressive disclosure (show details after click)
- Clean + modern + non-cluttered

---

### 🚫 Avoid

- No traditional horizontal tabs (like Orders, Revenue, etc.)
- No overloaded dashboard with too many charts
- No complex analytics jargon

---

### 🎯 Goal

Make reports:
- Easy to explore
- Intuitive to understand
- Structured by business thinking (categories, not metrics)