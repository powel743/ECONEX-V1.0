// server/controllers/wasteController.js
import asyncHandler from 'express-async-handler';
import WasteRequest from '../models/WasteRequest.js';
import User from '../models/User.js';
import { calculatePoints } from '../utils/calculatePoints.js';
import LogisticsChat from '../models/LogisticsChat.js';

/**
 * @desc    Create a new waste pickup request
 * @route   POST /api/waste/request
 * @access  Private (User only)
 */
const createWasteRequest = asyncHandler(async (req, res) => {
  const { type, weight, location } = req.body;

  // 1. Basic validation
  if (!type || !weight || !location) {
    res.status(400);
    throw new Error('Please provide type, weight, and location');
  }

  // 2. Validate location data (must have lat and lng)
  if (!location.latitude || !location.longitude) {
    res.status(400);
    throw new Error('Location must include latitude and longitude');
  }

  // 3. Create the new request
  const wasteRequest = new WasteRequest({
    userId: req.user.id, // from our 'protect' middleware
    type,
    weight, // This is the user's estimated weight
    pickupLocation: {
      type: 'Point',
      // Mongoose expects [longitude, latitude]
      coordinates: [location.longitude, location.latitude],
    },
    status: 'pending',
  });

  // 4. Save to the database
  const createdRequest = await wasteRequest.save();

  // 5. DISPATCH THE REQUEST
  // req.io was attached in server.js
  if (req.io) {
    req.io.dispatchRequest(createdRequest);
  } else {
    console.error('Socket.io instance not found on request object');
  }

  res.status(201).json(createdRequest);
});

// --- NEW FUNCTION 1: Get Pending Requests ---

/**
 * @desc    Get all pending waste requests (for collector list view)
 * @route   GET /api/waste/collector/requests
 * @access  Private (Collector only)
 */
const getCollectorPendingRequests = asyncHandler(async (req, res) => {
  // Find all requests that are 'pending' and sort by newest first
  const requests = await WasteRequest.find({ status: 'pending' })
    .populate('userId', 'name') // Show the user's name
    .sort({ createdAt: -1 });

  res.status(200).json(requests);
});

// --- NEW FUNCTION 2: Accept a Request ---

/**
 * @desc    Collector accepts a waste request
 * @route   PUT /api/waste/accept/:id
 * @access  Private (Collector only)
 */
const acceptWasteRequest = asyncHandler(async (req, res) => {
  const request = await WasteRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  // 1. Check if it's still pending
  if (request.status !== 'pending') {
    res.status(400);
    throw new Error('Request is no longer pending');
  }

  // 2. Assign collector and update status
  request.status = 'accepted';
  request.collectorId = req.user.id; // from 'protect' middleware
  await request.save();

  // --- 2. CREATE THE PRIVATE CHAT ROOM ---
  try {
    // This will only succeed once because of the 'unique' index on requestId
    await LogisticsChat.create({
      requestId: request._id,
      userId: request.userId,
      collectorId: request.collectorId,
    });
    console.log(`LogisticsChat created for request ${request._id}`);
  } catch (error) {
    // If it fails (e.g., 'duplicate key'), it means the chat already exists,
    // which is fine. We can just log it.
    console.log(`LogisticsChat for ${request._id} already exists.`);
  }

  // 3. Notify the original User in real-time
  const io = req.io;
  const onlineUsers = io.getOnlineUsers();
  const userSocketId = onlineUsers[request.userId.toString()];

  if (userSocketId) {
    // Send the collector's data so the user can see who is coming
    const collector = await User.findById(req.user.id).select('name');
    io.to(userSocketId).emit('user:request_accepted', { request, collector });
  }

  // TODO: Notify other collectors that this request is gone

  res.status(200).json(request);
});

// --- NEW FUNCTION 3: Complete a Collection ---

/**
 * @desc    Collector confirms collection and awards points
 * @route   PUT /api/waste/collect/:id
 * @access  Private (Collector only)
 */
const collectWasteRequest = asyncHandler(async (req, res) => {
  // Collector must provide the *actual* weight
  const { actualWeight } = req.body;

  if (!actualWeight || actualWeight <= 0) {
    res.status(400);
    throw new Error('Please provide a valid actualWeight');
  }

  const request = await WasteRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  // 1. Security check: Is this collector assigned to this job?
  if (
    request.status !== 'accepted' ||
    request.collectorId.toString() !== req.user.id
  ) {
    res.status(403); // Forbidden
    throw new Error('You are not authorized to complete this request');
  }

  // 2. Calculate points based on *actual* weight
  const points = calculatePoints(request.type, actualWeight);

  // 3. Update the request
  request.status = 'collected'; // Next step: 'listed_for_sale'
  request.weight = actualWeight; // Update to the *actual* weight
  request.points = points;
  await request.save();

  // 4. Find the user and give them their points
  const user = await User.findById(request.userId);
  if (user) {
    user.points = (user.points || 0) + points;
    await user.save();
  }

  // 5. Notify the user in real-time
  const io = req.io;
  const onlineUsers = io.getOnlineUsers();
  const userSocketId = onlineUsers[request.userId.toString()];

  if (userSocketId) {
    io.to(userSocketId).emit('user:request_completed', {
      message: `You earned ${points} points!`,
      newPointTotal: user.points,
    });
  }

  res.status(200).json(request);
});

// --- NEW FUNCTION 4: List Waste for Sale (Collector) ---

/**
 * @desc    Collector lists a completed collection for sale
 * @route   PUT /api/waste/list/:id
 * @access  Private (Collector only)
 */
const listWasteForSale = asyncHandler(async (req, res) => {
  const { description } = req.body;
  const request = await WasteRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  // 1. Security Check: Is this the collector who collected it?
  if (request.collectorId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('You are not authorized to list this item');
  }

  // 2. Status Check: Can this item be listed?
  if (request.status !== 'collected') {
    res.status(400);
    throw new Error(
      'This item is not in a "collected" state and cannot be listed'
    );
  }

  // 3. Update the status
  request.status = 'listed_for_sale';
  request.listingDescription = description || '';
  await request.save();

  res.status(200).json(request);
});

/**
 * @desc    Get all active requests for the logged-in user
 * @route   GET /api/waste/user/requests
 * @access  Private (User only)
 */
export const getUserRequests = asyncHandler(async (req, res) => {
  const requests = await WasteRequest.find({
    userId: req.user.id,
    // Find jobs that are not yet finished
    status: { $in: ['pending', 'accepted'] },
  })
    .populate('collectorId', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(requests);
});

/**
 * @desc    Get all 'accepted' requests for the logged-in collector
 * @route   GET /api/waste/collector/accepted
 * @access  Private (Collector only)
 */
export const getAcceptedRequests = asyncHandler(async (req, res) => {
  const requests = await WasteRequest.find({
    collectorId: req.user.id,
    status: 'accepted', // Only find jobs you've accepted
  })
    .populate('userId', 'name') // We don't need this, but good to have
    .sort({ createdAt: -1 });

  res.status(200).json(requests);
});

// --- EXPORT ALL FUNCTIONS ---
export {
  createWasteRequest,
  getCollectorPendingRequests,
  acceptWasteRequest,
  collectWasteRequest,
  listWasteForSale,
};