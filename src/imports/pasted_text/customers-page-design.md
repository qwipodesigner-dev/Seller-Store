Design a "Customers Page" for a B2B Seller Application (Distributor Dashboard).

Objective:
Create a clean, operational customer management screen where sellers can:
- View all customers
- Track source (network/manual)
- Approve or reject new customers
- Identify auto-approved customers

---

### 🧩 Page Structure

1. Header
2. Summary Cards (Minimal)
3. Action Bar (Search + Filters)
4. Customers List (Primary)
5. Approval Workflow (Manual + Auto)

---

### 🧠 1. Header

- Title: "Customers"
- Subtitle: "Manage your buyers and approvals"

---

### 🔢 2. Summary Cards (Minimal)

Display 3–4 small cards:

- Total Customers
- Pending Approvals
- Active Customers
- Auto Approved Customers

👉 No charts, only numbers

---

### 🔍 3. Action Bar

LEFT:
- Search:
  - "Search by customer name / phone / store"

- Filters:
  - Status:
    - Pending Approval
    - Active
    - Rejected
  - Source:
    - ONDC / Network
    - Manual
  - Approval Type:
    - Auto Approved
    - Manual

RIGHT:
- (Optional future) "+ Add Customer"

---

### 📋 4. Customers List (Main Table)

Columns:

- [Checkbox]
- Customer Name (Store Name)
- Owner Name
- Phone Number
- Location (City / Area)
- Source
  - Network / ONDC / Manual
- Sync Status (Synced / Pending)
- Approval Type
  - Auto / Manual
- Status
  - Pending
  - Active
  - Rejected
- Actions

---

### 🎨 5. Status & Tags

Use badges:

- Pending → Blue
- Active → Green
- Rejected → Red

Approval Type:
- Auto Approved → Purple tag
- Manual → Default

---

### ⚡ 6. New Customer Approval Flow

For customers coming from network (ONDC):

Status = "Pending Approval"

Actions:

- ✅ Approve
- ❌ Reject

---

### ✅ Approve Flow

Click "Approve" → Modal:

Title:
"Approve Customer"

Fields:
- Optional Notes

CTA:
- Confirm Approval

Result:
- Status → Active

---

### ❌ Reject Flow

Click "Reject" → Modal:

Title:
"Reject Customer"

Fields:
- Reason:
  - Invalid Details
  - Service Not Available
  - Duplicate
  - Other

CTA:
- Confirm Rejection

Result:
- Status → Rejected

---

### 🟣 7. Auto Approved Customers

- Show tag:
  - "Auto Approved"

- Behavior:
  - Directly Active (no manual action needed)

- Visual differentiation:
  - Subtle highlight or badge

---

### 📦 8. Bulk Actions (Optional but Recommended)

- Select multiple customers via checkbox

Show bulk action bar:

- Bulk Approve
- Bulk Reject

---

### ⚡ 9. UX Enhancements

- Highlight pending customers
- Sticky filters
- Quick scan layout
- Row click → Customer detail page

---

### 🎨 Design Guidelines

- Clean SaaS table UI
- Minimal clutter
- Focus on operations

---

### 🚫 Avoid

- No complex CRM-style UI
- No deep nested pages
- No analytics here

---

### 🎯 Goal

Enable seller to:
- Quickly review new customers
- Approve/reject efficiently
- Track customer source and status

with minimal effort.