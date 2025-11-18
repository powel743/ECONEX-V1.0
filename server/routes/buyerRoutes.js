// server/routes/buyerRoutes.js
import express from 'express';
import {
  getMarketplaceListings,
  purchaseWasteRequest,
} from '../controllers/buyerController.js';
import { protect, buyerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all available listings
router.get('/listings', protect, buyerOnly, getMarketplaceListings);

// Purchase an item
router.post('/purchase/:id', protect, buyerOnly, purchaseWasteRequest);

export default router;