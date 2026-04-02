import * as businessRepo from '../repository/business.js';

// ─── POST /api/v1/business ───────────────────────────────────────────────────
export const createBusiness = async (req, res, next) => {
  try {
    const { id, name, email, phone } = req.body;
    const data = await businessRepo.createBusiness({ id, name, email, phone });
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/business ────────────────────────────────────────────────────
export const getAllBusinesses = async (req, res, next) => {
  try {
    const data = await businessRepo.getAllBusinesses();
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/business/:business_id ──────────────────────────────────────
export const getBusinessById = async (req, res, next) => {
  try {
    const data = await businessRepo.getBusinessById(req.params.business_id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/v1/business/:business_id ──────────────────────────────────────
export const updateBusiness = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const data = await businessRepo.updateBusiness({
      id: req.params.business_id,
      name,
      email,
      phone,
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/business/:business_id/inventory-config ────────────────────
export const setInventoryConfig = async (req, res, next) => {
  try {
    const { out_mode } = req.body;
    const data = await businessRepo.setInventoryConfig({
      business_id: req.params.business_id,
      out_mode,
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/business/:business_id/inventory-config ─────────────────────
export const getInventoryConfig = async (req, res, next) => {
  try {
    const data = await businessRepo.getInventoryConfig(req.params.business_id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};