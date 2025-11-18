# Econex: Real-Time Recyclable Waste Marketplace
Econex is a full-stack MERN application that creates a real-time, "Uber-for-waste" marketplace. It connects users who have recyclable waste with collectors who can pick it up, and buyers who can purchase the collected materials.

The platform is built on a four-role system (User, Collector, Buyer, Admin) and features a real-time dispatch system, a gamified points-and-rewards loop, and a complete e-commerce marketplace with a built-in commission model.

## Core Features
- 4-Role Architecture: Separate dashboards and permissions for Users, Collectors, Buyers, and Administrators.
- Real-Time "Uber" Dispatch: Collectors set their status to "online" and are dispatched to new waste requests in real-time based on their live GPS location.
- Interactive Map: A Leaflet-based map shows collectors their live position and the locations of all pending pickup requests.
- Gamification & Rewards: Users earn points for their recyclables (10/kg for lightweight, 20/kg for heavyweight) which they can redeem for discount vouchers.
- Full Marketplace: Collectors list their collected waste for sale, and Buyers can browse and purchase this waste.
- Admin Control Panel: Admins control the platform's economy by setting market prices for waste and creating the discount vouchers for the rewards program.
- Commission Revenue Model: The platform generates revenue by taking a 5% commission from the collector's sale and charging a 5% service fee to the buyer.

## User Roles & Application Flow
1. The User
- Request Pickup: Submits a request with waste type, estimated weight, and GPS location.
- Earn Points: Receives points after a collector confirms the pickup and actual weight.
- Redeem Points: Can browse a marketplace of discount vouchers and redeem their points to get them.

2. The Collector
- Go Online: Toggles their availability and broadcasts their live GPS location via Socket.io.
- Receive Jobs: Receives real-time notifications for new, nearby waste requests.
- Manage Jobs: Accepts a job (notifying the user), completes the collection (awarding points), and adds a description.

List for Sale: Lists the collected waste on the marketplace for buyers to purchase.

3. The Buyer
- Browse Marketplace: Views all items currently "listed_for_sale" by collectors.
- Purchase Waste: Buys waste directly through the platform. The system calculates the final price, including the 5% service fee.

4. The Administrator
- Set Market Prices: Sets the base price per/kg for lightweight and heavyweight waste.
- Manage Rewards: Creates the DiscountOffer vouchers that users can redeem with their points.
- Oversee System: (Can be expanded) Has access to all transactions, users, and listings.

## Key Business Logic

## Gamification (Points)
Lightweight Waste (e.g., Plastic): 10 points per kg
Heavyweight Waste (e.g., Metal): 20 points per kg

## Marketplace Revenue Model (5% + 5%)
This platform uses a robust two-sided commission model.
Example Scenario: Admin sets "Heavyweight" price at KSh 20 / kg. A collector lists 10kg.
Base Price: 10 kg * 20 KSh/kg = KSh 200
Collector Side (5% Commission):
The platform deducts a 5% commission: KSh 200 * 0.05 = KSh 10.
Collector Payout: KSh 200 - KSh 10 = KSh 190.
Buyer Side (5% Service Fee):
The platform adds a 5% service fee: KSh 200 * 0.05 = KSh 10.
Total Charged to Buyer: KSh 200 + KSh 10 = KSh 210.
Total Platform Revenue: KSh 10 (from Collector) + KSh 10 (from Buyer) = KSh 20.

## Technology Stack

### Backend (/server)
Runtime: Node.js
Framework: Express.js
Database: MongoDB with Mongoose (utilizing Geospatial queries)
Real-time: Socket.io
Authentication: JSON Web Tokens (JWT) & bcrypt.js
Utils: uuid (for voucher codes)

### Frontend (/client)
Framework: React (via Vite)
Routing: react-router-dom
State Management: React Context API (useAuth hook)
HTTP Client: Axios
Real-time: socket.io-client
Maps: react-leaflet & leaflet

## Getting Started

1. Backend Setup (/server)
- Navigate to the server directory:
    cd server
- Install all required packages:
    npm install
- Create a .env file in the server root and add your environment variables.
    PORT=5001
    MONGO_URI=mongodb+srv://<user>:<password>@yourcluster.mongodb.net/econex
    JWT_SECRET=your_super_secret_key_123
- Start the development server:
    npm run dev
- The server will be running on http://localhost:5001.

2. Frontend Setup (/client)
- In a new terminal, navigate to the client directory:
    cd client
- Install all required packages:
    npm install
- Start the React development server:
    npm run dev
- The app will be running on http://localhost:5173.

## Project structure
econex/
├── client/
│   ├── src/
│   │   ├── api/          # Axios API functions (authApi, wasteApi, etc.)
│   │   ├── components/   # Reusable components (UserDashboard, CollectorDashboard, WasteMap)
│   │   ├── context/      # AuthContext for global state
│   │   ├── hooks/        # Custom hooks (useAuth, useSocket)
│   │   ├── pages/        # Main pages (Login, Register, Dashboard, RewardsPage)
│   │   ├── App.jsx       # Main router
│   │   └── main.jsx
│   └── package.json
└── server/
    ├── config/
    │   └── db.js         # MongoDB connection
    ├── controllers/    # Business logic for routes
    ├── middleware/     # Auth (protect) and role (adminOnly) middleware
    ├── models/         # Mongoose schemas (User, WasteRequest, Transaction, etc.)
    ├── routes/         # API route definitions
    ├── socket/
    │   └── socketLogic.js # All Socket.io logic
    ├── utils/
    │   └── calculatePoints.js
    ├── .env            # Environment variables
    ├── package.json
    └── server.js       # Express + Socket.io server setup

## API Endpoints Overview
### /api/users
POST /register: Create a new user (any role).
POST /login: Authenticate a user, return a JWT.
GET /profile: (Protected) Get the logged-in user's profile.

### /api/waste
POST /request: (User) Submit a new waste request.
GET /collector/requests: (Collector) Get all pending requests.
PUT /accept/:id: (Collector) Accept a request.
PUT /collect/:id: (Collector) Complete a collection, award points.
PUT /list/:id: (Collector) List a collected item for sale.

### /api/buyer
GET /listings: (Buyer) Get all items listed_for_sale.
POST /purchase/:id: (Buyer) Purchase an item and create a transaction.

### /api/admin
POST /price: (Admin) Set or update the pricePerKg for a waste type.
POST /offers: (Admin) Create a new DiscountOffer voucher.

### /api/rewards
GET /offers: (User) Get all active discount offers.
GET /my-vouchers: (User) Get all vouchers owned by the user.
POST /redeem/:id: (User) Redeem points for an offer.

</details>
