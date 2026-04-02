import express from 'express';
import {
  createProduct,
  getProductsByBusiness,
  addInventoryInward,
  getStockSummary,
} from '../controller/inventory.js';

const router = express.Router();

// ─── Product Routes ───────────────────────────────────────────────────────────
router.post('/product', createProduct);
router.get('/product/:business_id', getProductsByBusiness);

// ─── Inventory Inward ─────────────────────────────────────────────────────────
router.post('/inward', addInventoryInward);

// ─── Stock Summary (Bonus) ────────────────────────────────────────────────────
router.get('/summary', getStockSummary);

export default router;
