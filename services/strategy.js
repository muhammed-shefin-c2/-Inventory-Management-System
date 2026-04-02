import { runFIFO }  from './strategies/fifo.js';
import { runFEFO }  from './strategies/fefo.js';
import { runBATCH } from './strategies/batch.js';

// Strategy map — to add new strategy (e.g LIFO) just add it here
const strategies = {
  FIFO:  runFIFO,
  FEFO:  runFEFO,
  BATCH: runBATCH,
};

export const runStrategy = async (out_mode, client, payload) => {
  const strategy = strategies[out_mode];

  if (!strategy) {
    const error = new Error(
      `Unknown strategy: ${out_mode}. Supported: ${Object.keys(strategies).join(', ')}.`
    );
    error.statusCode = 400;
    throw error;
  }

  return await strategy(client, payload);
};