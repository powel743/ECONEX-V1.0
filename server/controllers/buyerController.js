// server/controllers/buyerController.js
import asyncHandler from 'express-async-handler';
import WasteRequest from '../models/WasteRequest.js';
import MarketPrice from '../models/MarketPrice.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

/**
 * @desc    Get all waste items listed for sale
 * @route   GET /api/buyer/listings
 * @access  Private (Buyer only)
 */
export const getMarketplaceListings = asyncHandler(async (req, res) => {
  const listings = await WasteRequest.find({ status: 'listed_for_sale' })
    .populate('collectorId', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(listings);
});

/**
 * @desc    Purchase a waste item
 * @route   POST /api/buyer/purchase/:id
 * @access  Private (Buyer only)
 */
export const purchaseWasteRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const buyerId = req.user.id;

  // 1. Find the waste request
  const wasteRequest = await WasteRequest.findById(requestId);

  if (!wasteRequest) {
    res.status(404);
    throw new Error('Waste request not found');
  }

  // 2. Check if it's for sale
  if (wasteRequest.status !== 'listed_for_sale') {
    res.status(400);
    throw new Error('This item is not listed for sale');
  }

  // 3. Find the market price for this waste type
  const marketPrice = await MarketPrice.findOne({
    wasteType: wasteRequest.type,
  });

  if (!marketPrice) {
    res.status(500);
    throw new Error(
      `Market price for '${wasteRequest.type}' is not set. Contact admin.`
    );
  }

  // 4. --- PERFORM THE CORE FINANCIAL CALCULATION ---
  const basePrice = wasteRequest.weight * marketPrice.pricePerKg;

  // Buyer Side
  const buyerServiceFee = basePrice * 0.05; // 5% fee on top
  const totalChargedToBuyer = basePrice + buyerServiceFee;

  // Collector Side
  const collectorCommission = basePrice * 0.05; // 5% commission deducted
  const collectorPayout = basePrice - collectorCommission;

  // Platform Side
  const platformRevenue = buyerServiceFee + collectorCommission;

  // 5. --- (Payment Gateway Logic) ---
  // In a real app, you would charge `totalChargedToBuyer` to the
  // buyer's card (e.g., via Stripe) RIGHT HERE.
  // For now, we'll assume the payment is successful.

  // 6. Create the transaction record
  const transaction = await Transaction.create({
    buyerId,
    collectorId: wasteRequest.collectorId,
    requestId,
    basePrice,
    buyerServiceFee,
    totalChargedToBuyer,
    collectorCommission,
    collectorPayout,
    platformRevenue,
    paymentStatus: 'completed',
  });

  // 7. Update the waste request status to 'sold'
  wasteRequest.status = 'sold';
  await wasteRequest.save();

  // 8. TODO: Add the `collectorPayout` to the collector's "wallet"
  // (For now, just creating the transaction is enough)

  res.status(201).json(transaction);
});