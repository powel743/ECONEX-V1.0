// server/socket/socketLogic.js
import User from '../models/User.js';
import LogisticsChat from '../models/LogisticsChat.js';
import SalesChat from '../models/SalesChat.js'; // <-- 1. IMPORT SALESCHAT

let onlineUsers = {}; // We store { userId: socketId }

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // --- A generic "user:go_online" event for ALL users ---
    socket.on('user:go_online', async (userId) => {
      // Store the user
      onlineUsers[userId] = socket.id;
      console.log(`User ${userId} is online. Socket: ${socket.id}`);

      // If they are a collector, update their DB status
      try {
        const user = await User.findById(userId);
        if (user && user.role === 'collector') {
          user.availability = 'online';
          await user.save();
          console.log(`Collector ${userId} status set to online.`);
        }
      } catch (err) {
        console.error('Error finding user on go_online:', err);
      }
    });

    // --- A Collector Updates Their Location ---
    socket.on('collector:update_location', async ({ userId, location }) => {
      if (onlineUsers[userId]) {
        try {
          await User.findByIdAndUpdate(userId, {
            currentLocation: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude],
            },
          });
        } catch (err) {
          console.error('Error updating collector location:', err);
        }
      }
    });

    // --- User Disconnects ---
    socket.on('disconnect', async () => {
      console.log(`Client disconnected: ${socket.id}`);

      const userId = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );

      if (userId) {
        delete onlineUsers[userId];
        console.log(`User ${userId} went offline.`);

        try {
          const user = await User.findById(userId);
          if (user && user.role === 'collector') {
            user.availability = 'offline';
            await user.save();
            console.log(`Collector ${userId} status set to offline.`);
          }
        } catch (err) {
          console.error('Error on disconnect:', err);
        }
      }
    });

    // --- LOGISTICS CHAT (User <-> Collector) ---
    socket.on('chat:join_logistics_room', (requestId) => {
      const roomName = `logistics-${requestId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    socket.on('chat:send_logistics_message', async (data) => {
      const { requestId, senderId, senderRole, message } = data;
      const roomName = `logistics-${requestId}`;

      try {
        const chat = await LogisticsChat.findOne({ requestId });
        if (!chat) {
          return console.error('LogisticsChat not found');
        }
        if (
          chat.userId.toString() !== senderId &&
          chat.collectorId.toString() !== senderId
        ) {
          return console.error('Unauthorized chat message attempt.');
        }

        // --- **THIS IS THE FIX** ---
        const newMessage = {
          requestId: requestId, // <-- ADDED THIS LINE
          senderId,
          senderRole,
          message,
          timestamp: new Date(),
        };
        // --- END FIX ---

        chat.messages.push(newMessage);
        await chat.save();
        io.to(roomName).emit('chat:new_logistics_message', newMessage);
      } catch (err) {
        console.error('Error sending logistics message:', err);
      }
    });

    // --- SALES CHAT (Buyer <-> Collector) ---
    socket.on('chat:join_sales_room', (salesChatId) => {
      const roomName = `sales-${salesChatId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    socket.on('chat:send_sales_message', async (data) => {
      const { salesChatId, senderId, senderRole, message } = data;
      const roomName = `sales-${salesChatId}`;

      try {
        const chat = await SalesChat.findById(salesChatId);
        if (!chat) {
          return console.error('SalesChat not found');
        }
        if (
          chat.buyerId.toString() !== senderId &&
          chat.collectorId.toString() !== senderId
        ) {
          return console.error('Unauthorized sales chat message attempt.');
        }

        // --- **THIS IS THE FIX** ---
        const newMessage = {
          salesChatId: salesChatId, // <-- ADDED THIS LINE
          senderId,
          senderRole,
          message,
          timestamp: new Date(),
        };
        // --- END FIX ---

        chat.messages.push(newMessage);
        await chat.save();
        io.to(roomName).emit('chat:new_sales_message', newMessage);
      } catch (err) {
        console.error('Error sending sales message:', err);
      }
    });
  }); // --- THIS IS THE END of io.on('connection') ---

  // --- ALL FUNCTIONS ATTACHED TO 'io' GO HERE ---
  // (Inside initializeSocket, but Outside io.on('connection'))

  // For dispatching "Uber" requests
  io.dispatchRequest = async (wasteRequest) => {
    console.log('Dispatching request:', wasteRequest._id);
    try {
      const nearbyCollectors = await User.find({
        role: 'collector',
        availability: 'online',
        currentLocation: {
          $near: {
            $geometry: wasteRequest.pickupLocation,
            $maxDistance: 10000, // 10km
          },
        },
      }).limit(10);

      console.log(`Found ${nearbyCollectors.length} nearby collectors.`);
      nearbyCollectors.forEach((collector) => {
        const socketId = onlineUsers[collector._id.toString()];
        if (socketId) {
          io.to(socketId).emit('collector:new_request', wasteRequest);
          console.log(`Notifying collector ${collector._id}`);
        }
      });
    } catch (err) {
      console.error('Error dispatching request:', err);
    }
  };

  // Helper for controllers to get the list of online users
  io.getOnlineUsers = () => onlineUsers;
}; // --- THIS IS THE FINAL CLOSING BRACE ---