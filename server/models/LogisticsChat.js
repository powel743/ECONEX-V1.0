// server/models/LogisticsChat.js
import mongoose from 'mongoose';

// A sub-document for each message
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['user', 'collector'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false } // <-- **THIS IS THE NEW LINE**
}, { timestamps: true });

const logisticsChatSchema = new mongoose.Schema(
  {
    // The waste request this chat is about
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteRequest',
      required: true,
      unique: true, // Ensures only ONE logistics chat per request
    },
    // The two participants
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // The array of all messages
    messages: [messageSchema],
  },
  { timestamps: true } // Creates createdAt and updatedAt
);

const LogisticsChat = mongoose.model('LogisticsChat', logisticsChatSchema);
export default LogisticsChat;