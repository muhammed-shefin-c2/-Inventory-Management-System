import {
  insertProduct,
  selectProductById,
  selectProductByIdAndBusiness,
  selectAllProductsByBusiness,
  insertInventoryBatch,
  selectBatchByNo,
  selectStockSummary,
} from '../query/inventory.js';

import { selectBusinessById } from '../query/business.js';

// ─── Product Repository ───────────────────────────────────────────────────────

export const createProduct = async ({ id, business_id, name, unit }) => {
  // Validate required fields
  if (!id || !business_id || !name) {
    const error = new Error('id, business_id and name are required.');
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

  // Check duplicate product
  const existing = await selectProductById(id);
  if (existing) {
    const error = new Error(`Product ${id} already exists.`);
    error.statusCode = 409;
    throw error;
  }

  return await insertProduct({ id, business_id, name, unit: unit || 'units' });
};

export const getProductsByBusiness = async (business_id) => {
  // Check business exists
  const business = await selectBusinessById(business_id);
  if (!business) {
    const error = new Error(`Business ${business_id} not found.`);
    error.statusCode = 404;
    throw error;
  }

  return await selectAllProductsByBusiness(business_id);
};

// ─── Inventory Inward Repository ──────────────────────────────────────────────

export const addInventoryBatch = async ({
  business_id,
  product_id,
  batch_no,
  quantity,
  purchase_date,
  expiry_date,
  cost_price,
}) => {
  // Validate required fields
  if (!business_id || !product_id || !batch_no || !quantity || !purchase_date || !cost_price) {
    const error = new Error(
      'business_id, product_id, batch_no, quantity, purchase_date and cost_price are required.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Validate quantity is positive
  if (quantity <= 0) {
    const error = new Error('quantity must be greater than 0.');
    error.statusCode = 400;
    throw error;
  }

  // Validate cost_price is not negative
  if (cost_price < 0) {
    const error = new Error('cost_price cannot be negative.');
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

  // Check product exists and belongs to this business
  const product = await selectProductByIdAndBusiness(product_id, business_id);
  if (!product) {
    const error = new Error(
      `Product ${product_id} not found under business ${business_id}.`
    );
    error.statusCode = 404;
    throw error;
  }

  // Check duplicate batch number for same product
  const existingBatch = await selectBatchByNo(business_id, product_id, batch_no);
  if (existingBatch) {
    const error = new Error(
      `Batch ${batch_no} already exists for product ${product_id}.`
    );
    error.statusCode = 409;
    throw error;
  }

  // Validate expiry_date is in the future if provided
  if (expiry_date && new Date(expiry_date) < new Date()) {
    const error = new Error('expiry_date cannot be in the past.');
    error.statusCode = 400;
    throw error;
  }

  return await insertInventoryBatch({
    business_id,
    product_id,
    batch_no,
    quantity,
    purchase_date,
    expiry_date,
    cost_price,
  });
};

// ─── Stock Summary Repository ─────────────────────────────────────────────────

export const getStockSummary = async (business_id, product_id) => {
  // Check business exists
  const business = await selectBusinessById(business_id);
  if (!business) {
    const error = new Error(`Business ${business_id} not found.`);
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

  const summary = await selectStockSummary(business_id, product_id);

  // If no batches added yet
  if (!summary) {
    return {
      product_id,
      business_id,
      total_available: 0,
      batches: [],
    };
  }

  return summary;
};