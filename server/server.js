import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import wasteRoutes from './routes/wasteRoutes.js';
import { initializeSocket } from './socket/socketLogic.js';
import adminRoutes from './routes/adminRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import rewardsRoutes from './routes/rewardsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Load env vars
dotenv.config();

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    console.log('MongoDB successfully connected.');

    const app = express();

    // 2. Configure CORS (The Fix)
    // You cannot use '*' with credentials: true. You must list the specific URLs.
    const allowedOrigins = [
      "http://localhost:5173",             // Local Development
      "https://econex.vercel.app"          // Production Frontend (Vercel)
    ];

    app.use(cors({
      origin: allowedOrigins,
      credentials: true
    }));

    app.use(express.json()); // To accept JSON data in the body

    // --- NEW: Create HTTP server and Socket.io server ---
    const httpServer = createServer(app);
    
    // 3. Configure Socket.io CORS
    const io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins, // Use the same allowed origins list
        methods: ['GET', 'POST'],
        credentials: true
      },
    });

    // Pass the 'io' instance to our socket logic file
    initializeSocket(io);

    // --- Pass 'io' to our routes ---
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

    // Simple base route (Health Check for Render)
    app.get('/', (req, res) => {
      res.send('Econex API is running...');
    });

    const PORT = process.env.PORT || 5001;

    httpServer.listen(PORT, () =>
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    );

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the app
startServer();