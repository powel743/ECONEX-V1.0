// server/routes/wasteRoutes.js
import express from 'express';
import {
  createWasteRequest,
  getCollectorPendingRequests,
  acceptWasteRequest,
  collectWasteRequest,
  listWasteForSale,
  getUserRequests,
  getAcceptedRequests,
} from '../controllers/wasteController.js';

import {
  protect,
  userOnly,
  collectorOnly,
  buyerOnly,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/waste/request
// We chain the middleware: must be logged in, must be a 'user'
router.post('/request', protect, userOnly, createWasteRequest);

router.get('/user/requests', protect, userOnly, getUserRequests);

// We will add more routes here later (e.g., GET /api/waste/history)
// --- Collector Routes ---
router.get(
  '/collector/requests',
  protect,
  collectorOnly,
  getCollectorPendingRequests
);
router.get(
  '/collector/accepted',
  protect,
  collectorOnly,
  getAcceptedRequests
);
router.put(
  '/accept/:id',
  protect,
  collectorOnly,
  acceptWasteRequest
);
router.put(
  '/collect/:id',
  protect,
  collectorOnly,
  collectWasteRequest
);
// --- NEW COLLECTOR ROUTE ---
router.put(
  '/list/:id',
  protect,
  collectorOnly,
  listWasteForSale
);

export default router;