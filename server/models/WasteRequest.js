// server/models/WasteRequest.js
import mongoose from 'mongoose';

// GeoJSON schema for location
// We can re-use the one from User.js, but defining it here
// makes the model self-contained.
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});

const WasteRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['lightweight', 'heavyweight'],
      required: true,
    },
    // This is the user's estimated weight
    weight: {
      type: Number,
      required: true,
    },
    // Points are awarded *after* collection
    points: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'pending', // User requested
        'accepted', // Collector accepted
        'collected', // Collector confirmed pickup
        'listed_for_sale', // Collector listed it for sale
        'sold', // Buyer purchased
      ],
      default: 'pending',
    },
    pickupLocation: {
      type: pointSchema,
      required: true,
      index: '2dsphere', // Index for geospatial queries
    },
    // --- NEW FIELD ---
    listingDescription: {
      type: String,
      default: ''
    },
    // This will be filled in when a collector accepts
    collectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

  },
  { timestamps: true }
);

const WasteRequest = mongoose.model('WasteRequest', WasteRequestSchema);
export default WasteRequest;