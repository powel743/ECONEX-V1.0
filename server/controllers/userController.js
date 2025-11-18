// server/controllers/userController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'; // Simple async middleware

// Helper to create a token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. Basic Validation
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // 2. Check if role is valid
  const validRoles = ['user', 'collector', 'admin', 'buyer'];
  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid user role');
  }

  // 3. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // 4. Hash password (happens automatically from our User.js model)

  // 5. Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // 6. Respond with user data and token
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

//loginUser
/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Check if email and password are provided
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // 2. Find user by email
  const user = await User.findOne({ email });

  // 3. Check if user exists AND if password matches
  //    (We are using the matchPassword method we defined in our User model)
  if (user && (await user.matchPassword(password))) {
    // 4. Respond with user data and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points, // Send points on login
      availability: user.availability, // Send availability on login
      token: generateToken(user._id),
    });
  } else {
    // 4. If login fails
    res.status(401); // 401 means Unauthorized
    throw new Error('Invalid email or password');
  }
});


// server/controllers/userController.js
// ... (imports and other functions are still here)

// --- ADD THIS NEW FUNCTION ---

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is attached by our 'protect' middleware
  const user = req.user;

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
      availability: user.availability,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// --- UPDATE YOUR EXPORTS AT THE BOTTOM ---
export { registerUser, loginUser, getUserProfile };