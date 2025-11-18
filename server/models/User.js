// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// GeoJSON schema for location
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [0, 0],
  },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['user', 'collector', 'admin', 'buyer'],
      default: 'user',
    },
    // For Users
    points: { type: Number, default: 0 },
    // For Collectors
    availability: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    currentLocation: {
      type: pointSchema,
    },
    // For Buyers/Collectors (M-Pesa, etc.)
    paymentDetails: { type: String, default: '' },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

// Create a 2dsphere index for geospatial queries
UserSchema.index({ currentLocation: '2dsphere' });

// Middleware to hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;