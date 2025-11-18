// server/routes/chatRoutes.js
import express from 'express';
import {
  getLogisticsChat,
  initiateSalesChat,
  getSalesChatInbox,
  getLogisticsChatInbox,
  markLogisticsChatAsRead,
  markSalesChatAsRead,
  getCollectorLogisticsInbox, // <-- 1. IMPORT
} from '../controllers/chatController.js';
// --- 2. IMPORT collectorOnly ---
import { protect, buyerOnly, userOnly, collectorOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Logistics Chat (User <-> Collector) ---

// Mark a Logistics Chat as read
router.put('/logistics/read/:chatId', protect, markLogisticsChatAsRead);

// Get all of a User's Logistics Chats (their inbox)
router.get('/logistics/inbox', protect, userOnly, getLogisticsChatInbox);

// --- 3. ADD NEW ROUTE ---
// Get all of a Collector's Logistics Chats (their inbox)
router.get('/logistics/inbox/collector', protect, collectorOnly, getCollectorLogisticsInbox);

// Get specific Logistics chat history
router.get('/logistics/:requestId', protect, getLogisticsChat);


// --- Sales Chat (Buyer <-> Collector) ---

// Mark a Sales Chat as read
router.put('/sales/read/:chatId', protect, markSalesChatAsRead);

// Start or get a sales inquiry
router.post(
  '/sales/inquire/:requestId',
  protect,
  buyerOnly,
  initiateSalesChat
);

// Get a user's sales chat inbox
router.get(
  '/sales/inbox',
  protect, // Security is in the controller
  getSalesChatInbox
);

export default router;