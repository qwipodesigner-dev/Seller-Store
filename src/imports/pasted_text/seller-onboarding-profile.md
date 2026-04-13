Design a "Seller Onboarding & Profile Management" flow for a B2B Seller Application (Distributor / Brand App).

Objective:
Enable seamless onboarding of sellers (brands/distributors) and allow easy profile management with validation and verification controls.

---

## 🧩 PART 1: Seller Registration (Onboarding Flow)

### 🧠 Step-Based Flow (Recommended)

Use a multi-step form (progress indicator at top):

Step 1: Basic Details  
Step 2: Business Details  
Step 3: Bank Details  
Step 4: Service Areas  
Step 5: Verification  

---

### 📄 Step 1: Basic Details

Fields:

- Seller Type (Dropdown):
  - Brand
  - Distributor
  - C&F

- Company Name (Text input)

- Primary Contact:
  - Name
  - Phone Number (OTP verification required)
  - Email ID

CTA:
- "Continue"

---

### 🏢 Step 2: Business Details

Fields:

- GST ID
  - Validate against GST registry
  - Auto-fetch company details (if valid)

- Company Address (auto-fill + editable)

---

### 💳 Step 3: Bank Details

Fields:

- Account Holder Name
- Bank Account Number
- IFSC Code
- Bank Name (auto-fetch via IFSC)

Note:
- Required for settlements

---

### 📍 Step 4: Service Areas

Options:

- Add by Pincode (multi-entry)
- Add by Distributor Mapping (optional future)

UI:
- Tag-based input
- Ability to add/remove areas

---

### 🔐 Step 5: Verification

- OTP Verification (Phone)
- Summary Review Screen

CTA:
- "Submit & Register"

---

### 🎨 Design Guidelines (Onboarding)

- Clean stepper UI
- Minimal fields per screen
- Auto-fetch wherever possible
- Show validation inline
- Reduce typing effort

---

## 🧩 PART 2: Profile Management (Post Login)

### 📂 Page Layout

Use card-based sections (similar to Settings page):

Sections:

1. Business Details  
2. Contact Information  
3. Bank Details  
4. Service Areas  
5. Branding  

---

### 🏢 1. Business Details

- Company Name
- GST ID
- Address

👉 Editable with "Edit" button

---

### 👤 2. Contact Information

- Primary Contact Name
- Phone
- Email

---

### 💳 3. Bank Details

- Account Number (masked)
- IFSC
- Bank Name

---

### 📍 4. Service Areas

- List of pincodes / regions
- Add / remove option

---

### 🎨 5. Branding

- Upload Logo
- Upload Banner

---

### ⚠️ Sensitive Field Handling (IMPORTANT)

If user edits:
- GST
- Bank Details
- Phone Number

Then:
- Trigger re-verification
- Show warning:
  "Changes to this field require verification"

---

### ⚡ UX Enhancements

- Each section editable independently
- Save button per section
- Show verification status (Verified / Pending)

---

### 🎨 Design Guidelines

- Card-based layout
- Clean spacing
- Minimal clutter
- Mobile friendly

---

### 🚫 Avoid

- No long single-page forms
- No technical jargon
- No unnecessary fields

---

### 🎯 Goal

Enable:
- Fast onboarding (low friction)
- Accurate business verification
- Easy profile updates with control

---
