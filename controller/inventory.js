import * as inventoryRepo from '../repository/inventory.js';

// ─── POST /api/v1/inventory/product ──────────────────────────────────────────
export const createProduct = async (req, res, next) => {
  try {
    const { id, business_id, name, unit } = req.body;
    const data = await inventoryRepo.createProduct({ id, business_id, name, unit });
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/inventory/product/:business_id ───────────────────────────────
export const getProductsByBusiness = async (req, res, next) => {
  try {
    const { business_id } = req.params;
    const data = await inventoryRepo.getProductsByBusiness(business_id);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/inventory/inward ───────────────────────────────────────────
export const addInventoryInward = async (req, res, next) => {
  try {
    const {
      business_id,
      product_id,
      batch_no,
      quantity,
      purchase_date,
      expiry_date,
      cost_price,
    } = req.body;

    const data = await inventoryRepo.addInventoryBatch({
      business_id,
      product_id,
      batch_no,
      quantity,
      purchase_date,
      expiry_date,
      cost_price,
    });

    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/inventory/summary ───────────────────────────────────────────
export const getStockSummary = async (req, res, next) => {
  try {
    const { business_id, product_id } = req.query;

    if (!business_id || !product_id) {
      return res.status(400).json({
        success: false,
        error: 'business_id and product_id are required as query params.',
      });
    }

    const data = await inventoryRepo.getStockSummary(business_id, product_id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};