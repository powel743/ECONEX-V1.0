// server/models/Transaction.js
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteRequest',
      required: true,
      unique: true, // Only one transaction per request
    },
    basePrice: {
      type: Number,
      required: true,
    },
    // Buyer's side
    buyerServiceFee: {
      type: Number,
      required: true,
    },
    totalChargedToBuyer: {
      type: Number,
      required: true,
    },
    // Collector's side
    collectorCommission: {
      type: Number,
      required: true,
    },
    collectorPayout: {
      type: Number,
      required: true,
    },
    // Platform's total revenue
    platformRevenue: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed', // For this v1, we'll assume it's instant
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;