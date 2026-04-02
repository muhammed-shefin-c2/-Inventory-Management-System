import {
  getBatchByNo,
  deductBatchQuantity,
  insertSaleItem,
} from '../../query/sales.js';

// BATCH — deduct only from the specific batch_no provided
export const runBATCH = async (client, { sale_id, business_id, product_id, quantity, batch_no }) => {
  // batch_no is mandatory for BATCH mode
  if (!batch_no) {
    const error = new Error('batch_no is required when out_mode is BATCH.');
    error.statusCode = 400;
    throw error;
  }

  const batch = await getBatchByNo(client, business_id, product_id, batch_no);

  // Check batch exists
  if (!batch) {
    const error = new Error(
      `Batch ${batch_no} not found for product ${product_id}.`
    );
    error.statusCode = 404;
    throw error;
  }

  // Check sufficient stock in this specific batch
  if (batch.remaining_quantity < quantity) {
    const error = new Error(
      `Batch ${batch_no} has only ${batch.remaining_quantity} units. Cannot fulfill ${quantity}.`
    );
    error.statusCode = 422;
    throw error;
  }

  const updated = await deductBatchQuantity(client, batch.id, quantity);
  if (!updated) {
    const error = new Error(`Failed to deduct from batch ${batch_no}.`);
    error.statusCode = 500;
    throw error;
  }

  await insertSaleItem(client, {
    sale_id,
    batch_id:          batch.id,
    batch_no:          batch.batch_no,
    quantity_deducted: quantity,
  });

  return [{ batch_no: batch.batch_no, quantity }];
};