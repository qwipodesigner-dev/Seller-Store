Perfect — this is exactly how you should structure it 👍
I’ll give you a **clean Excel-ready mapping**:

👉 Column 1: **Business Field Name (UI label)**
👉 Column 2: **Field Description (for clarity)**
👉 Column 3: **ONDC Field Mapping (payload key)**

You can directly copy this into Excel.

---

# 📊 SKU Creation → UI to ONDC Mapping Sheet

| Business Field Name (UI) | Description                          | ONDC Configuration (Payload Mapping)  |
| ------------------------ | ------------------------------------ | ------------------------------------- |
| Product Name             | Name of the product shown to buyer   | `descriptor.name`                     |
| Short Description        | Short product summary                | `descriptor.short_desc`               |
| Long Description         | Detailed product description         | `descriptor.long_desc`                |
| Product Images           | Product image URLs                   | `descriptor.images[]`                 |
| SKU Code                 | Unique product identifier            | `descriptor.code`                     |
| Category                 | Product category (e.g., Oil, Masala) | `category_id`                         |
| Brand Name               | Brand of the product                 | (custom → can go in `tags` if needed) |

---

### 💰 Pricing

| Business Field Name (UI) | Description                    | ONDC Mapping          |
| ------------------------ | ------------------------------ | --------------------- |
| Selling Price            | Price at which product is sold | `price.value`         |
| MRP                      | Maximum retail price           | `price.maximum_value` |
| Currency                 | Default INR                    | `price.currency`      |

---

### 📦 Inventory & Packaging

| Business Field Name (UI) | Description                      | ONDC Mapping                          |
| ------------------------ | -------------------------------- | ------------------------------------- |
| Available Quantity       | Current stock available          | `quantity.available.count`            |
| Maximum Order Quantity   | Max quantity per order           | `quantity.maximum.count`              |
| Unit Type                | Unit (unit/kg/litre)             | `quantity.unitized.measure.unit`      |
| Unit Value               | Base unit value (usually 1)      | `quantity.unitized.measure.value`     |
| Pack Size                | Case/bundle info (e.g., 1L x 12) | (custom → include in name/descriptor) |
| Packaging Type           | Single / Case / Bundle           | (custom → optional tag)               |

---

### 🚚 Fulfillment

| Business Field Name (UI) | Description              | ONDC Mapping     |
| ------------------------ | ------------------------ | ---------------- |
| Fulfillment Type         | Delivery / Pickup / Both | `fulfillment_id` |
| Store / Warehouse        | Seller location mapping  | `location_id`    |

---

### ⏱️ Logistics & SLA

| Business Field Name (UI) | Description              | ONDC Mapping             |
| ------------------------ | ------------------------ | ------------------------ |
| Time to Ship             | Time to dispatch product | `@ondc/org/time_to_ship` |

---

### 🔁 Return & Cancellation

| Business Field Name (UI) | Description                  | ONDC Mapping                     |
| ------------------------ | ---------------------------- | -------------------------------- |
| Returnable               | Is product returnable        | `@ondc/org/returnable`           |
| Cancellable              | Can order be cancelled       | `@ondc/org/cancellable`          |
| Return Pickup Available  | Seller handles return pickup | `@ondc/org/seller_pickup_return` |

---

### 💳 Payment

| Business Field Name (UI) | Description      | ONDC Mapping                 |
| ------------------------ | ---------------- | ---------------------------- |
| Cash on Delivery         | COD availability | `@ondc/org/available_on_cod` |

---

### 📜 Compliance (CRITICAL)

| Business Field Name (UI) | Description                 | ONDC Mapping                                                                             |
| ------------------------ | --------------------------- | ---------------------------------------------------------------------------------------- |
| Manufacturer Name        | Name of manufacturer/packer | `@ondc/org/statutory_reqs_packaged_commodities.manufacturer_or_packer_name`              |
| Manufacturer Address     | Address of manufacturer     | `@ondc/org/statutory_reqs_packaged_commodities.manufacturer_or_packer_address`           |
| Generic Product Name     | Common name of product      | `@ondc/org/statutory_reqs_packaged_commodities.common_or_generic_name_of_commodity`      |
| Manufacture Month & Year | MFG / Packing details       | `@ondc/org/statutory_reqs_packaged_commodities.month_year_of_manufacture_packing_import` |

---

### 📞 Customer Support

| Business Field Name (UI) | Description        | ONDC Mapping                              |
| ------------------------ | ------------------ | ----------------------------------------- |
| Support Details          | Name, email, phone | `@ondc/org/contact_details_consumer_care` |

---

### 🌍 Origin

| Business Field Name (UI) | Description            | ONDC Mapping              |
| ------------------------ | ---------------------- | ------------------------- |
| Country of Origin        | Product origin country | `tags → origin → country` |

---

### 🧩 Additional (Optional but Useful)

| Business Field Name (UI) | Description          | ONDC Mapping           |
| ------------------------ | -------------------- | ---------------------- |
| Weight                   | Product weight       | (custom attribute)     |
| Volume                   | Product volume       | (custom attribute)     |
| Variant                  | Size / flavor / type | (custom or descriptor) |
| Tags                     | Keywords             | `tags[]`               |

---

# 💡 Important Notes (for your Excel + ONDC config)

* Some fields are **not strictly in ONDC schema** → you still keep them in UI
  👉 (Brand, Pack Size, Variant, etc.)
  👉 Push them into:

  * `descriptor`
  * or `tags`

* ONDC is **strict on these**:

  * Descriptor (name, desc, images)
  * Price
  * Quantity
  * Fulfillment
  * Compliance fields ⚠️

---

# 🚀 How you’ll use this

### 1. Excel

* Sheet 1 → UI Fields
* Sheet 2 → ONDC Mapping
* Or combine as above

### 2. ONDC Config Prompt

* Use column 3 directly for payload mapping
* Your connector team can plug this into APIs

---

If you want next level:
I can convert this into a **ready Excel file format (with columns + sample values + validation rules)** exactly like your order import sheet.
