import * as salesRepo from '../repository/sales.js';

// ─── POST /api/v1/sales ───────────────────────────────────────────────────────
export const createSale = async (req, res, next) => {
  try {
    const { business_id, product_id, quantity, batch_no } = req.body;

    const data = await salesRepo.createSale({
      business_id,
      product_id,
      quantity,
      batch_no,
    });

    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/sales/:sale_id ───────────────────────────────────────────────
export const getSale = async (req, res, next) => {
  try {
    const { sale_code } = req.params;
    const data = await salesRepo.getSale(sale_code);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/sales/business/:business_id ──────────────────────────────────
export const getSalesByBusiness = async (req, res, next) => {
  try {
    const { business_id } = req.params;
    const data = await salesRepo.getAllSalesByBusiness(business_id);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};