// server/routes/adminRoutes.js
import express from 'express';
import { setMarketPrice, createDiscountOffer } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/admin/price
// We chain the middleware: must be logged in AND must be an admin
router.post('/price', protect, adminOnly, setMarketPrice);

// We will add more admin routes here (e.g., GET /api/admin/transactions)
router.post('/offers', protect, adminOnly, createDiscountOffer);

export default router;