import express from 'express';
import {
  createSale,
  getSale,
  getSalesByBusiness,
} from '../controller/sales.js';


const router = express.Router();

// IMPORTANT: /business/:business_id must come BEFORE /:sale_code
// otherwise express will treat "business" as a sale_code
router.post('/',                        createSale);
router.get('/business/:business_id',    getSalesByBusiness);
router.get('/:sale_code',               getSale);

export default router;