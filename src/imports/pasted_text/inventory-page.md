Design a clean and highly functional "Inventory Page" for a B2B Seller Application (Distributor Dashboard).

Objective:
Create a simple, operations-focused inventory screen with NO graphs or analytics. The goal is fast stock management, not insights.

---

### 🧩 Page Structure

1. Top Summary Section (Minimal Cards)
2. Action Bar (Search + Filters + Bulk Actions)
3. Inventory Table/List View

---

### 🔢 1. Top Summary Cards (Minimal – No Charts)

Display 3–4 small number cards:

- Total SKUs
- Low Stock SKUs
- Out of Stock SKUs
- Active SKUs

Design:
- Small horizontal cards
- Clean numbers, no graphs, no charts
- Subtle background colors

---

### ⚡ 2. Action Bar (Highly Important)

Include:

- Search Bar
  - Placeholder: "Search by product name or SKU"

- Filters:
  - Category dropdown
  - Brand dropdown
  - Stock Status:
    - In Stock
    - Low Stock
    - Out of Stock

- Action Buttons (Right aligned):
  - "Bulk Update Stock"
  - "Import Stock" (Excel upload)
  - "Export Data"
  - "Threshold Settings"

Design:
- Sticky top bar (remains visible on scroll)
- Clean alignment and spacing

---

### 📋 3. Inventory List/Table

Display a clean table with the following columns:

- Product Name
- SKU ID
- Category
- Available Stock
- Reserved / In Progress (Sales in progress)
- Threshold Level (Min stock)
- Status:
  - In Stock
  - Low Stock
  - Out of Stock
- Last Updated
- Actions (Edit / Update)

---

### 🎨 Table Design

- Minimal, clean rows
- Highlight low stock in amber/yellow
- Highlight out-of-stock in red
- Use badges for status
- Sticky header for table

---

### ⚙️ 4. Threshold Settings (Important Feature)

Clicking "Threshold Settings" should:

Open a modal or new page with:

Options:
1. Category-wise Threshold
   - Select category
   - Set minimum stock value

2. SKU-wise Threshold
   - Select SKU
   - Set custom threshold

3. Bulk Threshold Upload (optional)
   - Upload via Excel

Design:
- Tab-based inside modal:
  - Category
  - SKU
- Simple input fields

---

### 🔁 5. Bulk Actions

- Bulk Update Stock:
  - Upload Excel OR inline edit multiple SKUs

- Import Stock:
  - Upload template

- Export:
  - Download current inventory

---

### 🎯 UX Principles

- Fast operations > Visual complexity
- Everything accessible in 1–2 clicks
- No charts, no graphs
- Focus on clarity and speed

---

### 📱 Responsiveness

- Table collapses into cards on mobile
- Actions remain accessible

---

### 🎨 Style Inspiration

- Zoho Inventory
- Shopify product list
- Razorpay dashboard

---

### 🚫 Avoid

- No charts or graphs
- No cluttered UI
- No excessive columns

---

### 🎯 Goal

Enable users to:
- Quickly view stock
- Identify low stock
- Update inventory in bulk
- Manage thresholds easily

with minimum effort and maximum clarity.