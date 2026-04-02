import {
  insertBusiness,
  selectBusinessById,
  selectAllBusinesses,
  updateBusinessById,
  upsertInventoryConfig,
  selectInventoryConfig,
} from '../query/business.js';

const VALID_OUT_MODES = ['FIFO', 'FEFO', 'BATCH'];

// ─── Business Repository ──────────────────────────────────────────────────────

export const createBusiness = async ({ id, name, email, phone }) => {
  // Validate required fields
  if (!id || !name) {
    const error = new Error('id and name are required fields.');
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate
  const existing = await selectBusinessById(id);
  if (existing) {
    const error = new Error(`Business with id ${id} already exists.`);
    error.statusCode = 409;
    throw error;
  }

  return await insertBusiness({ id, name, email, phone });
};

export const getAllBusinesses = async () => {
  return await selectAllBusinesses();
};

export const getBusinessById = async (id) => {
  const business = await selectBusinessById(id);
  if (!business) {
    const error = new Error(`Business ${id} not found.`);
    error.statusCode = 404;
    throw error;
  }
  return business;
};

export const updateBusiness = async ({ id, name, email, phone }) => {
  // Check business exists first
  const existing = await selectBusinessById(id);
  if (!existing) {
    const error = new Error(`Business ${id} not found.`);
    error.statusCode = 404;
    throw error;
  }

  return await updateBusinessById({
    id,
    name: name || existing.name,
    email: email || existing.email,
    phone: phone || existing.phone,
  });
};

// ─── Inventory Config Repository ──────────────────────────────────────────────

export const setInventoryConfig = async ({ business_id, out_mode }) => {
  // Validate out_mode value
  if (!out_mode) {
    const error = new Error('out_mode is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!VALID_OUT_MODES.includes(out_mode.toUpperCase())) {
    const error = new Error(
      `Invalid out_mode. Must be one of: ${VALID_OUT_MODES.join(', ')}.`
    );
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

  return await upsertInventoryConfig({
    business_id,
    out_mode: out_mode.toUpperCase(),
  });
};

export const getInventoryConfig = async (business_id) => {
  // Check business exists
  const business = await selectBusinessById(business_id);
  if (!business) {
    const error = new Error(`Business ${business_id} not found.`);
    error.statusCode = 404;
    throw error;
  }

  const config = await selectInventoryConfig(business_id);
  if (!config) {
    const error = new Error(
      `No inventory config found for business ${business_id}.`
    );
    error.statusCode = 404;
    throw error;
  }

  return config;
};