import express from 'express';
import {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  updateBusiness,
  setInventoryConfig,
  getInventoryConfig,
} from '../controller/business.js';

const router = express.Router();

router.post('/', createBusiness);
router.get('/', getAllBusinesses);
router.get('/:business_id', getBusinessById);
router.put('/:business_id', updateBusiness);

router.post('/:business_id/inventory-config', setInventoryConfig);
router.get('/:business_id/inventory-config', getInventoryConfig);

export default router;
