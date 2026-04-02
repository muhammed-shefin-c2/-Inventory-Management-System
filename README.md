# 📦 Inventory Management System (Backend)

A backend system that allows businesses to manage inventory using configurable stock consumption strategies such as FIFO, FEFO, and Batch-wise deduction.

🚀 Features
🔧 Configure inventory outflow strategy per business
📥 Add inventory as batches
🛒 Create sales with automatic stock deduction
🔄 Supports FIFO, FEFO, and Batch-based consumption
🧾 Tracks deductions at batch level
🔐 Transaction-safe operations (no partial updates)
📊 Stock summary API (bonus)
🏗️ Tech Stack
Backend: Node.js (Express)
Database: PostgreSQL
Architecture: Controller → Repository → Query → Strategy Pattern
# 📂 Project Structure
src/
 ├── controller/     # API controllers
 ├── repository/     # Business logic layer
 ├── query/          # Raw SQL queries
 ├── services/
 │    └── strategies/  # FIFO, FEFO, BATCH logic
 ├── routes/         # Express routes
 ├── config/         # DB connection
 └── middleware/     # Error handling
# 🗄️ Database Schema
1. business
id (PK)
name
email
phone
2. inventory_config
business_id (FK)
out_mode (FIFO / FEFO / BATCH)
3. products
id (PK)
business_id (FK)
name
unit
4. inventory_batches
id (PK)
business_id
product_id
batch_no
quantity
remaining_quantity
purchase_date
expiry_date
cost_price
5. sales
id (PK)
sale_code (auto-generated like S001)
business_id
product_id
total_quantity
out_mode_used
6. sale_items
id (PK)
sale_id (FK)
batch_id
batch_no
quantity_deducted
⚙️ Setup Instructions
1. Clone Repository
git clone <your-repo-link>
cd inventory-system
2. Install Dependencies
npm install
3. Setup PostgreSQL
Create a database
Run your SQL schema (tables + constraints)
4. Configure Environment

Create .env file:

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=inventory_db
DB_PORT=5432
PORT=5000
5. Run Server
npm run dev

# 🧪 API Testing (Sample Requests)

You can test all APIs using Postman / cURL.

🔹 1. Create Business

POST /api/v1/business

{
  "id": "B001",
  "name": "Test Business",
  "email": "test@example.com",
  "phone": "9999999999"
}
🔹 2. Get All Businesses

GET /api/v1/business

🔹 3. Get Business By ID

GET /api/v1/business/B001

🔹 4. Update Business

PUT /api/v1/business/B001

{
  "name": "Updated Business Name"
}
🔹 5. Set Inventory Strategy

POST /api/v1/business/B001/inventory-config

{
  "out_mode": "FIFO"
}
🔹 6. Get Inventory Strategy

GET /api/v1/business/B001/inventory-config

🔹 7. Create Product

POST /api/v1/inventory/product

{
  "id": "P001",
  "business_id": "B001",
  "name": "Product A",
  "unit": "pcs"
}
🔹 8. Get Products By Business

GET /api/v1/inventory/product/B001

🔹 9. Add Inventory Batch

POST /api/v1/inventory/inward

{
  "business_id": "B001",
  "product_id": "P001",
  "batch_no": "BATCH-01",
  "quantity": 10,
  "purchase_date": "2025-01-01",
  "expiry_date": "2025-06-01",
  "cost_price": 100
}
🔹 10. Add Another Batch (for testing split deduction)

POST /api/v1/inventory/inward

{
  "business_id": "B001",
  "product_id": "P001",
  "batch_no": "BATCH-02",
  "quantity": 10,
  "purchase_date": "2025-02-01",
  "expiry_date": "2025-07-01",
  "cost_price": 120
}
🔹 11. Create Sale (FIFO / FEFO)

POST /api/v1/sales

{
  "business_id": "B001",
  "product_id": "P001",
  "quantity": 15
}

✅ Expected:

Deducts from multiple batches
Oldest or earliest expiry first
🔹 12. Create Sale (BATCH Mode)

⚠️ First set strategy to BATCH

{
  "out_mode": "BATCH"
}

Then:

POST /api/v1/sales

{
  "business_id": "B001",
  "product_id": "P001",
  "quantity": 5,
  "batch_no": "BATCH-02"
}
🔹 13. Get Sale By Code

GET /api/v1/sales/S001

🔹 14. Get All Sales By Business

GET /api/v1/sales/business/B001

🔹 15. Stock Summary (Bonus)

GET
/api/v1/inventory/summary?business_id=B001&product_id=P001

# 🧠 Inventory Outflow Logic
🔹 FIFO (First In First Out)
Sort by purchase_date ASC
Oldest stock consumed first
🔹 FEFO (First Expiry First Out)
Sort by expiry_date ASC
Expired batches are ignored
🔹 BATCH
Deduct only from specified batch_no
Fails if insufficient stock
# ⚠️ Assumptions
Each product belongs to one business
Batch numbers are unique per product
Expired stock cannot be sold in FEFO
Inventory must exist before sale
Strategy must be configured before sales
🔒 Data Integrity & Safety
✅ No negative stock (DB + query level)
✅ Transactions used for all sales
✅ Atomic operations (commit/rollback)
✅ Validations at every layer
🧩 Extensibility

The system uses a Strategy Pattern:

const strategies = {
  FIFO,
  FEFO,
  BATCH
};

# 👉 Adding new strategy (e.g. LIFO) is easy:

Create new strategy file
Register in strategy map
⏱️ Time Taken

Approximately 48 hours

# 📌 Notes / Trade-offs
No authentication (not required)
No frontend (API-only as per requirement)
Focused on correctness and clean architecture
Concurrency handling (row locking) can be added for scaling
# ✅ Conclusion

This system ensures:

Correct inventory deduction
Clean and extensible architecture
Real-world backend design practices
