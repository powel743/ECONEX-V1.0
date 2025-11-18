// server/models/DiscountOffer.js
import mongoose from 'mongoose';

const DiscountOfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g., "10% Off at Supermarket"
    description: { type: String, required: true },
    partnerName: { type: String, required: true }, // e.g., "Supermarket"
    pointsCost: { type: Number, required: true, min: 1 }, // e.g., 500
    isActive: { type: Boolean, default: true }, // Admin can toggle this
    // Optional: for "limited time" offers
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

const DiscountOffer = mongoose.model('DiscountOffer', DiscountOfferSchema);
export default DiscountOffer;