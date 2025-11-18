// server/models/SalesChat.js
import mongoose from 'mongoose';

// We can reuse the same message sub-document structure
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['buyer', 'collector'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const salesChatSchema = new mongoose.Schema(
  {
    // The waste request (listing) this chat is about
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteRequest',
      required: true,
    },
    // The two participants
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // The array of all messages
    messages: [messageSchema],
  },
  { timestamps: true }
);

// We create a compound unique index.
// This ensures that ONE buyer can only start ONE chat with ONE collector
// about ONE specific listing.
salesChatSchema.index({ requestId: 1, buyerId: 1 }, { unique: true });

const SalesChat = mongoose.model('SalesChat', salesChatSchema);
export default SalesChat;