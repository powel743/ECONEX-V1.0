// server/models/MarketPrice.js
import mongoose from 'mongoose';

const MarketPriceSchema = new mongoose.Schema({
  wasteType: {
    type: String,
    enum: ['lightweight', 'heavyweight'],
    required: true,
    unique: true, // We only want one price document per type
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0, // Price cannot be negative
  },
}, { timestamps: true });

const MarketPrice = mongoose.model('MarketPrice', MarketPriceSchema);
export default MarketPrice;