// server/routes/userRoutes.js
import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js'; // Import middleware
const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- NEW PROTECTED ROUTE ---
// To use middleware, just put it before the controller function
// The request will go through protect() first, then getUserProfile()
router.get('/profile', protect, getUserProfile);

// Example of an admin-only route
router.get('/all-users', protect, adminOnly, (req, res) => {
  // This block will only run if user is logged in AND is an admin
  res.json({ message: 'You are an admin!' });
});

export default router;

// {
  //"email": "collector@test.com",
 // "password": "password123"
//}