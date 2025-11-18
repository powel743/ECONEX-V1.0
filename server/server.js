// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import wasteRoutes from './routes/wasteRoutes.js';
import { initializeSocket } from './socket/socketLogic.js'; // We will create this file
import adminRoutes from './routes/adminRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import rewardsRoutes from './routes/rewardsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To accept JSON data in the body

// --- Pass 'io' to our routes ---
// We can attach 'io' to the request object so controllers can access it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/chat', chatRoutes);

// Simple base route
app.get('/', (req, res) => {
  res.send('Econex API is running...');
});

// --- NEW: Create HTTP server and Socket.io server ---
const httpServer = createServer(app);

// Configure Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Allow our React app
    methods: ['GET', 'POST'],
  },
});

// Pass the 'io' instance to our socket logic file
initializeSocket(io);

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);