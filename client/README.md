Econex: Real-Time Recyclable Waste Marketplace

Econex is a full-stack MERN application designed to revolutionize waste management. It acts as a three-sided marketplace connecting Users (households with recyclables), Collectors (logistics providers), and Buyers (recycling plants/businesses).

The platform features a real-time "Uber-like" dispatch system, live GPS tracking, a gamified rewards program, and a secure e-commerce marketplace for trading collected waste.

🚀 Key Features

1. Role-Based Ecosystem

User: Requests waste pickups, earns points, and redeems rewards.

Collector: Receives real-time pickup jobs, tracks location via GPS, and lists collected waste for sale.

Buyer: Browses the marketplace and purchases bulk recyclable waste.

Admin: Manages market prices, creates voucher offers, and oversees the platform economy.

2. Real-Time Operations

"Uber" Dispatch: Users request pickups, and the system instantly notifies the nearest online Collectors via Socket.io.

Live Map: Interactive maps powered by Leaflet show pending requests and collector locations in real-time.

Instant Chat: Two separate, secure chat systems:

Logistics Chat: Private communication between User and Collector after job acceptance.

Sales Chat: Private pre-sales inquiries between Buyer and Collector.

3. Marketplace & Economy

Waste Trading: Collectors can list their inventory. Buyers can purchase items with a transparent fee structure (5% platform commission + 5% buyer service fee).

Gamification: Users earn points based on waste weight (10 pts/kg for light, 20 pts/kg for heavy).

Rewards: Points can be redeemed for real-world vouchers (e.g., Airtime, Discounts) created by Admins.

🛠️ Technology Stack

Backend (/server)

Runtime: Node.js

Framework: Express.js

Database: MongoDB (Mongoose) with Geospatial Indexing

Real-Time: Socket.io

Auth: JWT (JSON Web Tokens) & Bcrypt

Security: Role-based middleware protection

Frontend (/client)

Framework: React 18 (Vite)

Styling: Tailwind CSS (v3/v4 compatible)

Maps: React-Leaflet & Leaflet CSS

State Management: React Context API (AuthContext, SocketContext)

HTTP Client: Axios

Real-Time: Socket.io-client
## Installation & Setup
### Prerequisites
Node.js (v14 or higher)
MongoDB Atlas Account (for the database)

1. Clone the Repository
git clone [https://github.com/yourusername/econex.git](https://github.com/yourusername/econex.git)
cd econex

2. Backend Setup
Navigate to the server folder and install dependencies:
cd server
npm install

### Create a .env file in the server directory with the following variables:
NODE_ENV=development
PORT=5001
#### Replace with your actual MongoDB connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/econex
JWT_SECRET=your_super_secret_key_123

Start the backend server:
npm run dev
    You should see "MongoDB Connected" and "Server running on port 5001".

3. Frontend Setup
Open a new terminal, navigate to the client folder, and install dependencies:
    cd ../client
    npm install

Start the React development server:
    npm run dev
The app will launch at http://localhost:5173.

## Usage Guide
### Registering Users
Since the registration form hides the "Admin" role for security, use the following flows:
User/Collector/Buyer: Use the /register page on the frontend.
Admin: (For testing) Use Postman to send a POST request to http://localhost:5001/api/users/register with "role": "admin".

### The Operational Flow
User logs in and clicks "Request Pickup".
Collector logs in (on a different browser/device), toggles status to "Online", and accepts the job from the "Pending Requests" list.
Logistics Chat opens up for both parties to coordinate.
Collector clicks "Complete Collection", enters the weight, and the User receives points.
Collector goes to "Completed Jobs" and clicks "List for Sale".
Buyer logs in, sees the listing, asks a question via Sales Chat, and clicks "Purchase".

## Project Structure

econex/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # API service files (wasteApi, chatApi, etc.)
│   │   ├── components/     # Reusable UI components (Dashboards, Modals, Map)
│   │   ├── context/        # Global State (Auth & Socket)
│   │   ├── hooks/          # Custom Hooks (useAuth, useSocket)
│   │   └── pages/          # Main route pages (Login, Dashboard, Rewards)
│   └── ...
└── server/                 # Node.js Backend
    ├── config/             # DB Connection
    ├── controllers/        # Logic for API endpoints
    ├── middleware/         # Auth & Role verification
    ├── models/             # Mongoose Schemas (User, WasteRequest, Chat, etc.)
    ├── routes/             # API Routes definition
    ├── socket/             # Socket.io event logic
    └── server.js           # Entry point


