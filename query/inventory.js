import pool from '../config/db.js';

// ─── Product Queries ──────────────────────────────────────────────────────────

export const insertProduct = async ({ id, business_id, name, unit }) => {
  const result = await pool.query(
    `INSERT INTO products (id, business_id, name, unit)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, business_id, name, unit]
  );
  return result.rows[0];
};

export const selectProductById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM products WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

export const selectProductByIdAndBusiness = async (id, business_id) => {
  const result = await pool.query(
    `SELECT * FROM products WHERE id = $1 AND business_id = $2`,
    [id, business_id]
  );
  return result.rows[0];
};

export const selectAllProductsByBusiness = async (business_id) => {
  const result = await pool.query(
    `SELECT * FROM products WHERE business_id = $1 ORDER BY created_at DESC`,
    [business_id]
  );
  return result.rows;
};

// ─── Inventory Batch Queries ──────────────────────────────────────────────────

export const insertInventoryBatch = async ({
  business_id,
  product_id,
  batch_no,
  quantity,
  purchase_date,
  expiry_date,
  cost_price,
}) => {
  const result = await pool.query(
    `INSERT INTO inventory_batches
      (business_id, product_id, batch_no, quantity, remaining_quantity, purchase_date, expiry_date, cost_price)
     VALUES ($1, $2, $3, $4, $4, $5, $6, $7)
     RETURNING *`,
    [business_id, product_id, batch_no, quantity, purchase_date, expiry_date || null, cost_price]
  );
  return result.rows[0];
};

export const selectBatchByNo = async (business_id, product_id, batch_no) => {
  const result = await pool.query(
    `SELECT * FROM inventory_batches
     WHERE business_id = $1 AND product_id = $2 AND batch_no = $3`,
    [business_id, product_id, batch_no]
  );
  return result.rows[0];
};

// For FIFO — sort by purchase_date ASC, only batches with stock
export const selectBatchesFIFO = async (business_id, product_id) => {
  const result = await pool.query(
    `SELECT * FROM inventory_batches
     WHERE business_id = $1
       AND product_id = $2
       AND remaining_quantity > 0
     ORDER BY purchase_date ASC`,
    [business_id, product_id]
  );
  return result.rows;
};

// For FEFO — sort by expiry_date ASC, skip expired, only batches with stock
export const selectBatchesFEFO = async (business_id, product_id) => {
  const result = await pool.query(
    `SELECT * FROM inventory_batches
     WHERE business_id = $1
       AND product_id = $2
       AND remaining_quantity > 0
       AND (expiry_date IS NULL OR expiry_date > CURRENT_DATE)
     ORDER BY expiry_date ASC NULLS LAST`,
    [business_id, product_id]
  );
  return result.rows;
};

// For BATCH mode — get specific batch only
export const selectBatchForBatchMode = async (business_id, product_id, batch_no) => {
  const result = await pool.query(
    `SELECT * FROM inventory_batches
     WHERE business_id = $1
       AND product_id = $2
       AND batch_no = $3
       AND remaining_quantity > 0`,
    [business_id, product_id, batch_no]
  );
  return result.rows[0];
};

// Deduct quantity from a specific batch (used inside transaction)
export const deductBatchQuantity = async (client, batch_id, quantity_to_deduct) => {
  const result = await client.query(
    `UPDATE inventory_batches
     SET remaining_quantity = remaining_quantity - $1
     WHERE id = $2
       AND remaining_quantity >= $1
     RETURNING *`,
    [quantity_to_deduct, batch_id]
  );
  return result.rows[0];
};

// ─── Stock Summary Query ──────────────────────────────────────────────────────

export const selectStockSummary = async (business_id, product_id) => {
  const result = await pool.query(
    `SELECT
       b.product_id,
       b.business_id,
       SUM(b.remaining_quantity) AS total_available,
       JSON_AGG(
         JSON_BUILD_OBJECT(
           'batch_id',        b.id,
           'batch_no',        b.batch_no,
           'original_qty',    b.quantity,
           'remaining_qty',   b.remaining_quantity,
           'purchase_date',   b.purchase_date,
           'expiry_date',     b.expiry_date,
           'cost_price',      b.cost_price
         ) ORDER BY b.purchase_date ASC
       ) AS batches
     FROM inventory_batches b
     WHERE b.business_id = $1 AND b.product_id = $2
     GROUP BY b.product_id, b.business_id`,
    [business_id, product_id]
  );
  return result.rows[0];
};