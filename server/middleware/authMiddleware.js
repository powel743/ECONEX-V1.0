// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * @desc    Middleware to protect routes by checking for valid JWT
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Read the token from the 'Authorization' header
  // It's usually sent as "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get token from header (split "Bearer" and the token)
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user by the ID from the token
      // We attach the user to the request object, excluding the password
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Call the next middleware
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  // If no token is found
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/**
 * @desc    Middleware to check for Admin role
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403); // 403 Forbidden
    throw new Error('Not authorized as an admin');
  }
};

/**
 * @desc    Middleware to check for Collector role
 */
const collectorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'collector') {
    next(); // User is collector, proceed
  } else {
    res.status(403); // 403 Forbidden
    throw new Error('Not authorized as a collector');
  }
};

/**
 * @desc    Middleware to check for Buyer role
 */
const buyerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'buyer') {
    next(); // User is buyer, proceed
  } else {
    res.status(403); // 403 Forbidden
    throw new Error('Not authorized as a buyer');
  }
};

// --- NEW FUNCTION TO ADD ---

/**
 * @desc    Middleware to check for 'user' role
 */
const userOnly = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    next(); // User is a 'user', proceed
  } else {
    res.status(403); // 403 Forbidden
    throw new Error("Not authorized as a 'user'");
  }
};

// --- UPDATE THE EXPORTS ---
export { protect, adminOnly, collectorOnly, buyerOnly, userOnly };