import {
  getBatchesFEFO,
  deductBatchQuantity,
  insertSaleItem,
} from '../../query/sales.js';

// FEFO — consume earliest expiry_date first, skip expired batches
export const runFEFO = async (client, { sale_id, business_id, product_id, quantity }) => {
  const batches = await getBatchesFEFO(client, business_id, product_id);

  if (batches.length === 0) {
    const error = new Error(
      `No valid non-expired batches available for product ${product_id}.`
    );
    error.statusCode = 422;
    throw error;
  }

  // Check total available stock across valid batches
  const totalAvailable = batches.reduce((sum, b) => sum + b.remaining_quantity, 0);
  if (totalAvailable < quantity) {
    const error = new Error(
      `Insufficient stock. Requested: ${quantity}, Available: ${totalAvailable}.`
    );
    error.statusCode = 422;
    throw error;
  }

  const deductions = [];
  let remaining = quantity;

  for (const batch of batches) {
    if (remaining <= 0) break;

    const toDeduct = Math.min(batch.remaining_quantity, remaining);

    const updated = await deductBatchQuantity(client, batch.id, toDeduct);
    if (!updated) {
      const error = new Error(`Failed to deduct from batch ${batch.batch_no}.`);
      error.statusCode = 500;
      throw error;
    }

    await insertSaleItem(client, {
      sale_id,
      batch_id:          batch.id,
      batch_no:          batch.batch_no,
      quantity_deducted: toDeduct,
    });

    deductions.push({
      batch_no: batch.batch_no,
      quantity: toDeduct,
    });

    remaining -= toDeduct;
  }

  return deductions;
};