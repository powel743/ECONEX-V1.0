// server/models/UserRedemption.js
import mongoose from 'mongoose';

const UserRedemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscountOffer',
      required: true,
    },
    // The unique code the user presents at the store
    uniqueCode: {
      type: String,
      required: true,
      unique: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    // We'll copy the offer details in case the original offer is deleted
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const UserRedemption = mongoose.model('UserRedemption', UserRedemptionSchema);
export default UserRedemption;