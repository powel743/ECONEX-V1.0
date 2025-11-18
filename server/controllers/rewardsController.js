// server/controllers/rewardsController.js
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid'; // For generating unique codes
import DiscountOffer from '../models/DiscountOffer.js';
import UserRedemption from '../models/UserRedemption.js';
import User from '../models/User.js';

/**
 * @desc    Get all active discount offers (marketplace)
 * @route   GET /api/rewards/offers
 * @access  Private (User only)
 */
export const getAvailableOffers = asyncHandler(async (req, res) => {
  const offers = await DiscountOffer.find({ isActive: true }).sort({ pointsCost: 1 });
  res.status(200).json(offers);
});

/**
 * @desc    Get all vouchers owned by the logged-in user
 * @route   GET /api/rewards/my-vouchers
 * @access  Private (User only)
 */
export const getMyRedemptions = asyncHandler(async (req, res) => {
  const vouchers = await UserRedemption.find({ userId: req.user.id })
    .sort({ createdAt: -1 });
  res.status(200).json(vouchers);
});

/**
 * @desc    Redeem points for a discount offer
 * @route   POST /api/rewards/redeem/:id
 * @access  Private (User only)
 */
export const redeemOffer = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user.id;

  // 1. Get both the offer and the user
  const offer = await DiscountOffer.findById(offerId);
  const user = await User.findById(userId);

  if (!offer || !offer.isActive) {
    res.status(404);
    throw new Error('Offer not found or is no longer active');
  }

  // 2. Check if user has enough points
  if (!user || user.points < offer.pointsCost) {
    res.status(400);
    throw new Error('You do not have enough points to redeem this offer');
  }

  // 3. Deduct points
  user.points -= offer.pointsCost;
  await user.save();

  // 4. Generate a unique code (e.g., "ECO-X7K-9P2")
  const uniqueCode = `ECO-${uuidv4().split('-')[0].toUpperCase()}`;

  // 5. Create the redemption voucher
  const redemption = await UserRedemption.create({
    userId,
    offerId,
    uniqueCode,
    title: offer.title,
    description: offer.description,
  });

  res.status(201).json(redemption);
});