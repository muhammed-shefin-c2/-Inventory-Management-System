import dotenv from 'dotenv';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3130;

// Routes
import businessRoutes from './routes/business.js';
import inventoryRoutes from './routes/inventory.js';
import salesRoutes from './routes/sales.js';

app.use('/api/v1/business', businessRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/sales', salesRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Inventory Management API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// 404 handler - must be after all routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler - must be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});