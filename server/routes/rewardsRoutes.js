// server/routes/rewardsRoutes.js
import express from 'express';
import {
  getAvailableOffers,
  getMyRedemptions,
  redeemOffer,
} from '../controllers/rewardsController.js';
import { protect, userOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Chain protect and userOnly to all routes
router.use(protect, userOnly);

// @route   GET /api/rewards/offers
router.get('/offers', getAvailableOffers);

// @route   GET /api/rewards/my-vouchers
router.get('/my-vouchers', getMyRedemptions);

// @route   POST /api/rewards/redeem/:id
router.post('/redeem/:id', redeemOffer);

export default router;