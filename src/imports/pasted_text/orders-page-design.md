Design a modern "Orders Page" for a B2B Seller Application (Distributor Dashboard).

Objective:
Create a highly actionable order management screen where sellers can quickly review, accept, or reject incoming orders with clear status flows and minimal friction.

---

### 🧩 Page Structure

1. Order Summary (Top – minimal)
2. Orders List (Primary focus)
3. Actionable Order Cards / Table
4. Accept / Reject Flow (Modal-based)

---

### 🔔 1. Incoming Order Awareness

- Highlight new orders with:
  - "New" badge
  - Subtle highlight background

- Assume seller also receives SMS externally (no need to design SMS UI)

---

### 📋 2. Orders List (Main Section)

Display orders in a clean table or card layout:

Columns / Fields:

- Order ID (e.g., #DKN-2025-12345)
- Retailer Name (e.g., Ramesh’s Kirana)
- Items Summary (e.g., "15 units Parle-G")
- Delivery Address (shortened)
- Payment Mode (COD / Prepaid)
- Order Time
- Status (New / Confirmed / Rejected / In Progress)

---

### 🎨 3. Actions (VERY IMPORTANT)

For NEW orders:

- Show 2 primary buttons:
  - ✅ Accept
  - ❌ Reject

Buttons should be clearly visible and prominent

---

### ✅ 4. Accept Order Flow

When user clicks "Accept":

Open Modal:

Title:
"You are accepting this order"

Fields:

- Estimated Dispatch Time
  - Default: "Tomorrow, 8:00 AM"
  - Editable (date + time picker)

- Optional Notes (textarea)

CTA:
- Confirm Order

---

After confirmation:

- Order status → "Confirmed"
- Order moves to "Confirmed / Processing" state
- Retailer gets notification (assume backend)

---

### ❌ 5. Reject Order Flow

When user clicks "Reject":

Open Modal:

Title:
"Reject this order"

Fields:

- Reason Selection (dropdown or radio buttons):
  - Out of Stock
  - Capacity Issue
  - Delivery Not Available
  - Other (with input)

CTA:
- Submit Rejection

---

After rejection:

- Order status → "Rejected"
- Removed from active queue
- Retailer notified with reason

---

### 🎨 6. Status Design

Use clear status badges:

- New → Blue
- Confirmed → Green
- In Progress → Yellow
- Rejected → Red

---

### ⚡ UX Enhancements

- Sticky filters at top:
  - Status filter
  - Date filter

- Search by:
  - Order ID
  - Retailer name

- Quick scan layout (important for high order volume)

---

### 📦 Optional (Nice to Have)

- Expand row / card to see:
  - Full item list
  - Total amount
  - Full address

---

### 🎨 Design Guidelines

- Clean, operational UI (no heavy analytics)
- Focus on speed and clarity
- Use clear buttons and spacing
- Avoid clutter

---

### 🚫 Avoid

- No complex dashboards
- No unnecessary charts
- No deep navigation for actions

---

### 🎯 Goal

Enable seller to:
- Identify new orders instantly
- Take action (Accept/Reject) in seconds
- Manage order flow efficiently

with minimal clicks and zero confusion.