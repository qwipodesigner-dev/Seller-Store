Design a "My SKU" page for a B2B Seller Application (Distributor Dashboard).

Objective:
Replace the old "Add SKU" page with a more practical "My SKU" management page where users can:
- View all SKUs in a list
- Search & filter SKUs
- Add new SKUs via existing flow

---

### 🧩 Page Structure

1. Header Section
2. Action Bar (Search + Filters + CTA)
3. SKU List Table

---

### 🧠 1. Header

- Title: "My SKU"
- Subtitle (optional): "Manage your product catalog"

---

### ⚡ 2. Action Bar

LEFT:
- Search Bar
  - Placeholder: "Search SKU by name"

- Filters:
  - Category (dropdown)
  - Brand (dropdown)
  - Source (dropdown: Manual / Brand Sync / Import / DMS)

RIGHT:
- Primary CTA Button:
  - "+ Add SKU"

👉 Clicking "Add SKU" opens the existing 3-option flow:
  - Add Manually
  - Bulk Import
  - Brand Sync

---

### 📋 3. SKU List Table

Columns:

- SKU Name
- Category
- Brand
- Source
  - (Manual / Brand Sync / Excel / DMS)
- Last Updated (optional)
- Actions

---

### 🎨 Actions Column

- View (icon: eye)
- Edit (icon: pencil)

Optional:
- More menu (⋯) for future scalability

---

### 🎨 Table Design

- Clean, minimal rows
- Sticky header
- Hover highlight on rows
- Pagination (or infinite scroll)

---

### 🔍 Empty State

If no SKUs:

- Show illustration
- Text: "No SKUs added yet"
- CTA: "Add Your First SKU"

---

### 🎯 UX Behavior

- Clicking "View" → opens SKU detail page
- Clicking "Edit" → opens edit form
- Clicking "+ Add SKU" → opens 3-option SKU creation screen

---

### 🎨 Design Guidelines

- Modern SaaS table design (Shopify / Zoho style)
- Keep it simple and operational
- Avoid clutter

---

### 📱 Responsiveness

- Mobile: Convert table to card list
- Actions accessible via menu

---

### 🚫 Avoid

- No complex layouts
- No unnecessary columns
- No analytics here

---

### 🎯 Goal

Enable users to:
- Quickly find SKUs
- Manage catalog easily
- Add new SKUs without confusion