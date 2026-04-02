import {
  getBatchesFIFO,
  deductBatchQuantity,
  insertSaleItem,
} from '../../query/sales.js';

// FIFO — consume oldest purchase_date first
export const runFIFO = async (client, { sale_id, business_id, product_id, quantity }) => {
  const batches = await getBatchesFIFO(client, business_id, product_id);

  // Check total available stock
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

    // How much to take from this batch
    const toDeduct = Math.min(batch.remaining_quantity, remaining);

    // Deduct from batch
    const updated = await deductBatchQuantity(client, batch.id, toDeduct);
    if (!updated) {
      const error = new Error(`Failed to deduct from batch ${batch.batch_no}.`);
      error.statusCode = 500;
      throw error;
    }

    // Record sale item
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