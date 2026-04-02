import pool from '../config/db.js';
import { insertSale, getSaleById, getSalesByBusiness, getSaleBySaleCode} from '../query/sales.js';
import { selectBusinessById }       from '../query/business.js';
import { selectInventoryConfig }    from '../query/business.js';
import { selectProductByIdAndBusiness } from '../query/inventory.js';
import { runStrategy }              from '../services/strategy.js';


// ─── Create Sale ──────────────────────────────────────────────────────────────
export const createSale = async ({
  business_id,
  product_id,
  quantity,
  batch_no,
}) => {
  // Validate required fields
  if (!business_id || !product_id || !quantity) {
    const error = new Error('business_id, product_id and quantity are required.');
    error.statusCode = 400;
    throw error;
  }

  if (quantity <= 0) {
    const error = new Error('quantity must be greater than 0.');
    error.statusCode = 400;
    throw error;
  }

  // Check business exists
  const business = await selectBusinessById(business_id);
  if (!business) {
    const error = new Error(`Business ${business_id} not found.`);
    error.statusCode = 404;
    throw error;
  }

  // Check inventory config exists
  const config = await selectInventoryConfig(business_id);
  if (!config) {
    const error = new Error(
      `No inventory config found for business ${business_id}. Please set out_mode first.`
    );
    error.statusCode = 404;
    throw error;
  }

  // Check product exists under this business
  const product = await selectProductByIdAndBusiness(product_id, business_id);
  if (!product) {
    const error = new Error(
      `Product ${product_id} not found under business ${business_id}.`
    );
    error.statusCode = 404;
    throw error;
  }

  // BATCH mode requires batch_no
  if (config.out_mode === 'BATCH' && !batch_no) {
    const error = new Error('batch_no is required when out_mode is BATCH.');
    error.statusCode = 400;
    throw error;
  }

  // Begin DB Transaction
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert sale record
    const sale = await insertSale(client, {
      business_id,
      product_id,
      total_quantity: quantity,
      out_mode_used:  config.out_mode,
    });

    // 2. Run strategy — FIFO / FEFO / BATCH
    const deductions = await runStrategy(config.out_mode, client, {
      sale_id: sale.id,
      business_id,
      product_id,
      quantity,
      batch_no,
    });

    // 3. Commit
    await client.query('COMMIT');

    // 4. Return response matching project requirements exactly
    return {
      sale_id:        sale.sale_code,   // returns S001, S002... as per requirements
      business_id:    sale.business_id,
      product_id:     sale.product_id,
      out_mode_used:  sale.out_mode_used,
      total_quantity: sale.total_quantity,
      deductions,                        // [{ batch_no, quantity }]
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─── Get Single Sale ──────────────────────────────────────────────────────────
export const getSale = async (sale_code) => {
  const sale = await getSaleBySaleCode(sale_code);
  if (!sale) {
    const error = new Error(`Sale ${sale_code} not found.`);
    error.statusCode = 404;
    throw error;
  }
  return {
    sale_id:        sale.sale_code,
    business_id:    sale.business_id,
    product_id:     sale.product_id,
    out_mode_used:  sale.out_mode_used,
    total_quantity: sale.total_quantity,
    created_at:     sale.created_at,
    deductions:     sale.deductions,
  };
};

// ─── Get All Sales of a Business ─────────────────────────────────────────────
export const getAllSalesByBusiness = async (business_id) => {
  const business = await selectBusinessById(business_id);
  if (!business) {
    const error = new Error(`Business ${business_id} not found.`);
    error.statusCode = 404;
    throw error;
  }
  return await getSalesByBusiness(business_id);
};