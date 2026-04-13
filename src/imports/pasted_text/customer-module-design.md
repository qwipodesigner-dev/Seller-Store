# 🧩 CUSTOMER MODULE – UI DESIGN PROMPT (3-TAB ARCHITECTURE)

## 🎯 Objective

Design a **Customer Management Module** for Seller Store that supports:

* Two-way sync between **ONDC (buyer app)** and **DMS**
* Flexible control of **approval workflow (Seller vs DMS)**
* Unified **Master View of Customers**

The system must clearly show:

* Customer source
* Approval status
* DMS sync status
* Brand-level mapping

👉 Master should act as a **superset of DMS + ONDC customers** 

---

# 🧱 1. PAGE STRUCTURE

## Top Layout:

* Page Title: **Customers**

* Tabs:

  1. **Master**
  2. **DMS**
  3. **ONDC**

* Global Filters (sticky across tabs):

  * Brand (Multi-select)
  * Search (Name / Mobile / Customer ID)

---

# 🧩 2. TAB 1: MASTER VIEW (PRIMARY VIEW)

## 🧠 Purpose:

* Unified view of all customers
* Combine:

  * DMS synced customers
  * ONDC requested customers
* Avoid duplicates → **Single customer, multi-brand mapping**

---

## 📊 Columns (IMPORTANT)

| Column            | Description                            |
| ----------------- | -------------------------------------- |
| Customer Name     | दुकान / Business name                  |
| Mobile Number     | Primary identifier                     |
| Customer ID (DMS) | If exists                              |
| Address           | दुकान location                         |
| Brand             | Multi-tag (ITC, HUL etc.)              |
| Brand-wise Status | Example: ITC → Approved, HUL → Pending |
| Source            | DMS / ONDC                             |
| Approval Status   | Pending / Approved / Rejected          |
| DMS Sync Status   | Synced / Not Synced                    |
| Last Updated      | Timestamp                              |
| Actions           | View Details                           |

---

## 🔍 Filters (Master Tab)

* Brand (multi-select)
* Approval Status:

  * Pending
  * Approved
  * Rejected
* Source:

  * DMS
  * ONDC
* DMS Sync Status:

  * Synced
  * Not Synced
* Search:

  * Mobile number
  * Customer name

---

## ⚙️ Key Functionalities

### 1. Brand-Level Status Representation

* Single customer row
* Inside → show:

  * ITC → Approved
  * HUL → Pending

👉 Avoid duplicate rows

---

### 2. Real-Time Sync Visibility

* If ONDC customer not yet in DMS:

  * Show → **“Not Synced”**
* Once synced:

  * Update → **“Synced”**

---

### 3. No Manual Creation

* No “Add Customer” button
* Customers only come from:

  * ONDC request
  * DMS sync

---

# 🧩 3. TAB 2: DMS CUSTOMERS

## 🧠 Purpose:

* Show customers coming ONLY from DMS

---

## 📊 Columns

| Column            | Description   |
| ----------------- | ------------- |
| Customer Name     |               |
| Mobile Number     |               |
| Customer ID (DMS) | Primary       |
| Address           |               |
| Brand             |               |
| Sync Status       | Always Synced |
| Last Synced At    | Timestamp     |

---

## 🔍 Filters

* Brand
* Search (Mobile / ID / Name)

---

## ⚙️ Functional Behavior

* Read-only data
* Always **source = DMS**
* Used for:

  * Matching logic
  * Validation
  * Debugging

---

# 🧩 4. TAB 3: ONDC CUSTOMERS

## 🧠 Purpose:

* Show customers coming from buyer app (new requests)

---

## 📊 Columns

| Column             | Description                   |
| ------------------ | ----------------------------- |
| Customer Name      |                               |
| Mobile Number      |                               |
| Address            |                               |
| Brand              |                               |
| Match Found in DMS | Yes / No                      |
| Approval Status    | Pending / Approved / Rejected |
| DMS Sync Status    | Synced / Not Synced           |
| Source             | ONDC                          |
| Actions            | Approve / Reject              |

---

## 🔍 Filters

* Brand
* Approval Status:

  * Pending
  * Approved
  * Rejected
* Match Found:

  * Yes
  * No
* DMS Sync Status
* Search

---

## ⚙️ Key Functionalities

### 1. DMS Match Check (CRITICAL)

* Based on setting:

  * Mobile Number OR Customer ID

Show:

* ✅ “Match Found” → Already exists in DMS
* ❌ “No Match” → New customer

---

### 2. Approval Flow

#### Case A: DMS Approval Enabled

* Action:

  * “Send to DMS”
* Status:

  * Approval Sent to DMS
  * Approved from DMS

---

#### Case B: Seller Approval

* Buttons:

  * Approve
  * Reject

* After approve:

  * Customer created
  * Sent to DMS in backend

---

### 3. Sync Visibility

* Must show:

  * Exists in DMS → Yes / No

👉 This is mandatory as per Maurice 

---

# 🧩 5. SETTINGS PANEL (CRITICAL)

## Location:

* Top-right → “Customer Settings”

---

## ⚙️ Settings (Brand-Specific)

### 1. Approval Control

| Brand | Approval Mode |
| ----- | ------------- |
| ITC   | DMS / Seller  |
| HUL   | DMS / Seller  |

---

### 2. Match Criteria

| Brand | Match By      |
| ----- | ------------- |
| ITC   | Mobile Number |
| HUL   | Customer ID   |

---

## ⚠️ Rules:

* All settings are **brand-specific**
* Control = “knob” deciding workflow

---

# 🧩 6. UX ENHANCEMENTS (VERY IMPORTANT)

## 🟢 Visual Indicators

* Green → Approved
* Yellow → Pending
* Red → Rejected
* Grey → Not Synced

---

## 🟢 Tags / Badges

* Source:

  * DMS
  * ONDC
* Sync:

  * Synced / Not Synced

---

## 🟢 Debug Visibility (Maurice Highlight)

System should clearly show:

* What came from ONDC
* What came from DMS
* What is matched
* What is pending sync

👉 Helps ops + debugging

---

# 🧩 7. EDGE CASE HANDLING

### Case: ONDC Approved but not in DMS

* Show:

  * Approved
  * Not Synced

---

### Case: Exists in DMS already

* Auto mark:

  * Approved
  * Synced

---

### Case: Waiting DMS Approval

* Show:

  * “Approval Sent to DMS”

---

# 🧩 8. FINAL DESIGN PRINCIPLES

* Single customer → multiple brands
* No duplication
* Brand is mandatory everywhere
* DMS is eventual source of truth
* Clear separation:

  * Master → combined
  * DMS → source
  * ONDC → incoming
