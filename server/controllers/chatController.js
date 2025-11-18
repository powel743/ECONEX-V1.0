import asyncHandler from 'express-async-handler';
import LogisticsChat from '../models/LogisticsChat.js';
import SalesChat from '../models/SalesChat.js';
import WasteRequest from '../models/WasteRequest.js';
import User from '../models/User.js';

/**
 * @desc    Get Logistics (User/Collector) chat history
 * @route   GET /api/chat/logistics/:requestId
 * @access  Private (User or Collector)
 */
export const getLogisticsChat = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user.id; // From 'protect' middleware

  const chat = await LogisticsChat.findOne({ requestId }).populate(
    'messages.senderId',
    'name' // Populate the sender's name
  );

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found. The request may not be accepted yet.');
  }

  // --- SECURITY CHECK ---
  if (
    chat.userId.toString() !== userId &&
    chat.collectorId.toString() !== userId
  ) {
    res.status(403); // 403 Forbidden
    throw new Error('You are not authorized to view this chat.');
  }

  res.status(200).json(chat.messages);
});

/**
 * @desc    Find or create a Sales (Buyer/Collector) chat
 * @route   POST /api/chat/sales/inquire/:requestId
 * @access  Private (Buyer only)
 */
export const initiateSalesChat = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const buyerId = req.user.id; // from 'protect'

  const request = await WasteRequest.findById(requestId).select('collectorId');
  if (!request || !request.collectorId) {
    res.status(404);
    throw new Error('Listing not found or no collector assigned');
  }
  const collectorId = request.collectorId;

  const chat = await SalesChat.findOneAndUpdate(
    {
      requestId: requestId,
      buyerId: buyerId,
    },
    {
      $setOnInsert: {
        collectorId: collectorId,
        messages: [],
      },
    },
    {
      new: true,
      upsert: true,
      populate: { path: 'messages.senderId', select: 'name' },
    }
  );

  if (chat.messages.length === 0) {
    const io = req.io;
    const onlineUsers = io.getOnlineUsers();
    const collectorSocketId = onlineUsers[collectorId.toString()];
    
    if (collectorSocketId) {
      io.to(collectorSocketId).emit('chat:new_sales_inquiry', chat);
    }
  }

  res.status(200).json(chat);
});

/**
 * @desc    Get all of the user's Sales Chats
 * @route   GET /api/chat/sales/inbox
 * @access  Private (Buyer or Collector)
 */
export const getSalesChatInbox = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const chats = await SalesChat.find({
    $or: [{ buyerId: userId }, { collectorId: userId }],
  })
    .populate('buyerId', 'name')
    .populate('collectorId', 'name')
    .populate('requestId', 'listingDescription')
    .populate('messages.senderId', 'name') // <-- Fetch messages
    .sort({ updatedAt: -1 });

  res.status(200).json(chats);
});

/**
 * @desc    Get all of a User's Logistics Chats (their inbox)
 * @route   GET /api/chat/logistics/inbox
 * @access  Private (User only)
 */
export const getLogisticsChatInbox = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // --- **THIS IS THE FIX** ---
  // I have added .populate('messages.senderId', 'name')
  // This now fetches all the messages, just like the sales inbox.
  const chats = await LogisticsChat.find({ userId: userId })
    .populate('collectorId', 'name')
    .populate('requestId', 'status type') // Get request status
    .populate('messages.senderId', 'name') // <-- **THE FIX: Fetch messages**
    .sort({ updatedAt: -1 });
  // --- END FIX ---

  res.status(200).json(chats);
});

// --- NEW "Mark as Read" FUNCTION (LOGISTICS) ---
export const markLogisticsChatAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id; // The person who is reading

  await LogisticsChat.updateOne(
    { _id: chatId, $or: [{ userId: userId }, { collectorId: userId }] },
    {
      $set: { "messages.$[elem].isRead": true }
    },
    {
      arrayFilters: [
        { "elem.senderId": { $ne: userId }, "elem.isRead": false }
      ]
    }
  );
  res.status(200).json({ message: 'Messages marked as read' });
});

// --- NEW "Mark as Read" FUNCTION (SALES) ---
export const markSalesChatAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id; // The person who is reading

  await SalesChat.updateOne(
    { _id: chatId, $or: [{ buyerId: userId }, { collectorId: userId }] },
    {
      $set: { "messages.$[elem].isRead": true }
    },
    {
      arrayFilters: [
        { "elem.senderId": { $ne: userId }, "elem.isRead": false }
      ]
    }
  );
  res.status(200).json({ message: 'Messages marked as read' });
});

// --- **THIS IS THE MISSING FUNCTION** ---
/**
 * @desc    Get all of a Collector's Logistics Chats (inbox)
 * @route   GET /api/chat/logistics/inbox/collector
 * @access  Private (Collector only)
 */
export const getCollectorLogisticsInbox = asyncHandler(async (req, res) => {
  const userId = req.user.id; // This is the collector

  const chats = await LogisticsChat.find({ collectorId: userId })
    .populate('userId', 'name') // Populate the user's name
    .populate('requestId', 'status type')
    .populate('messages.senderId', 'name')
    .sort({ updatedAt: -1 });

  res.status(200).json(chats);
});
