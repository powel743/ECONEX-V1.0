// server/controllers/adminController.js
import asyncHandler from 'express-async-handler';
import MarketPrice from '../models/MarketPrice.js';
import DiscountOffer from '../models/DiscountOffer.js';

/**
 * @desc    Set or update the market price for a waste type
 * @route   POST /api/admin/price
 * @access  Private (Admin only)
 */
export const setMarketPrice = asyncHandler(async (req, res) => {
  const { wasteType, pricePerKg } = req.body;

  // 1. Validate input
  if (!wasteType || !pricePerKg) {
    res.status(400);
    throw new Error('Please provide wasteType and pricePerKg');
  }

  if (pricePerKg <= 0) {
    res.status(400);
    throw new Error('Price must be greater than 0');
  }

  if (!['lightweight', 'heavyweight'].includes(wasteType)) {
    res.status(400);
    throw new Error("Invalid wasteType. Must be 'lightweight' or 'heavyweight'");
  }

  // 2. Find and update (or create if it doesn't exist)
  // This "upsert" logic is perfect for this use case.
  const updatedPrice = await MarketPrice.findOneAndUpdate(
    { wasteType: wasteType }, // The filter to find the document
    { pricePerKg: pricePerKg }, // The data to update with
    {
      new: true, // Return the new, updated document
      upsert: true, // Create the document if it doesn't exist
    }
  );

  res.status(201).json(updatedPrice);
});

/**
 * @desc    Create a new discount offer
 * @route   POST /api/admin/offers
 * @access  Private (Admin only)
 */
export const createDiscountOffer = asyncHandler(async (req, res) => {
  const { title, description, partnerName, pointsCost, expiryDate } = req.body;

  if (!title || !description || !partnerName || !pointsCost) {
    res.status(400);
    throw new Error('Please provide title, description, partnerName, and pointsCost');
  }

  const offer = await DiscountOffer.create({
    title,
    description,
    partnerName,
    pointsCost,
    expiryDate, // This is optional
  });

  res.status(201).json(offer);
});