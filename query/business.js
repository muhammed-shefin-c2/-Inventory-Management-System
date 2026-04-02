import pool from '../config/db.js';

// ─── Business Queries ─────────────────────────────────────────────────────────

export const insertBusiness = async ({ id, name, email, phone }) => {
  const result = await pool.query(
    `INSERT INTO business (id, name, email, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, name, email, phone]
  );
  return result.rows[0];
};

export const selectBusinessById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM business WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

export const selectAllBusinesses = async () => {
  const result = await pool.query(
    `SELECT * FROM business ORDER BY created_at DESC`
  );
  return result.rows;
};

export const updateBusinessById = async ({ id, name, email, phone }) => {
  const result = await pool.query(
    `UPDATE business
     SET name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [name, email, phone, id]
  );
  return result.rows[0];
};

// ─── Inventory Config Queries ─────────────────────────────────────────────────

export const upsertInventoryConfig = async ({ business_id, out_mode }) => {
  const result = await pool.query(
    `INSERT INTO inventory_config (business_id, out_mode)
     VALUES ($1, $2)
     ON CONFLICT (business_id)
     DO UPDATE SET out_mode = $2, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [business_id, out_mode]
  );
  return result.rows[0];
};

export const selectInventoryConfig = async (business_id) => {
  const result = await pool.query(
    `SELECT * FROM inventory_config WHERE business_id = $1`,
    [business_id]
  );
  return result.rows[0];
};