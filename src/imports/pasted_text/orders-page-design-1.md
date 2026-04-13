Design an advanced "Orders Page" for a B2B Seller Application (Distributor Dashboard).

Objective:
Enable fast order handling with:
- Manual Accept/Reject
- Auto-approved orders visibility
- Bulk approval/rejection for efficiency

Focus on high-volume operations and quick decision-making.

---

### 🧩 Page Structure

1. Order Summary (Top)
2. Action Bar (Filters + Bulk Actions)
3. Orders List (Primary)
4. Action Modals (Accept / Reject / Bulk)

---

### 🔢 1. Top Summary Cards

Show key metrics:

- New Orders
- Auto Approved Orders
- Confirmed Orders
- Rejected Orders

👉 Keep minimal (no charts)

---

### 🔍 2. Action Bar

LEFT:
- Search (Order ID / Retailer)
- Filters:
  - Status:
    - New
    - Auto Approved
    - Confirmed
    - Rejected
  - Payment Mode
  - Date

RIGHT:
- Bulk Actions (disabled until selection):
  - ✅ Bulk Accept
  - ❌ Bulk Reject

---

### 📋 3. Orders List (Enhanced Table)

Add checkbox selection for each order:

Columns:

- [Checkbox]
- Order ID
- Retailer Name
- Items Summary
- Payment Mode
- Order Time
- Status
- Actions

---

### 🟦 4. Auto Approved Orders (NEW FEATURE)

- Show status badge: "Auto Approved"
- Add label or tag:
  - "Auto-approved via rules"

- Visually differentiate:
  - Slight background tint OR icon

- These orders:
  - Skip manual Accept
  - Already in "Confirmed" state

---

### ✅ 5. Manual Actions (Per Order)

For "New" orders:

- Show:
  - Accept
  - Reject

For "Auto Approved":
- Show:
  - View
  - Edit (optional override)

---

### 📦 6. Bulk Selection Behavior

- User selects multiple orders via checkbox
- Show floating/sticky bulk action bar:

Options:
- Bulk Accept
- Bulk Reject

---

### ⚡ 7. Bulk Accept Flow

On clicking "Bulk Accept":

Modal:

Title:
"Accept Selected Orders"

Fields:

- Estimated Dispatch Time (common for all)
- Optional Notes

CTA:
- Confirm All

---

### ❌ 8. Bulk Reject Flow

On clicking "Bulk Reject":

Modal:

Title:
"Reject Selected Orders"

Fields:

- Reason Selection:
  - Out of Stock
  - Capacity Issue
  - Delivery Not Available
  - Other

CTA:
- Reject All

---

### 🎨 9. Status System

Badges:

- New → Blue
- Auto Approved → Purple (distinct)
- Confirmed → Green
- In Progress → Yellow
- Rejected → Red

---

### ⚡ UX Enhancements

- Sticky table header
- Sticky bulk action bar (appears on selection)
- Highlight new orders
- Fast scanning layout

---

### 🎯 Smart Behavior

- Auto-approved orders should:
  - Bypass manual queue
  - Directly appear in confirmed list
- Allow override (optional)

---

### 🎨 Design Guidelines

- Clean, operational UI
- Focus on speed & bulk efficiency
- Minimal distractions

---

### 🚫 Avoid

- No heavy analytics
- No complex workflows
- No unnecessary clicks

---

### 🎯 Goal

Enable seller to:
- Handle high volume orders efficiently
- Quickly approve/reject multiple orders
- Clearly distinguish auto vs manual orders

with minimal effort and maximum clarity.