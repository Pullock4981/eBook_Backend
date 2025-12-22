# eBook Backend API

E-commerce Backend API for Physical + eBook Sales with Affiliate System

## 🚀 Project Overview

This is a MERN stack backend application for an e-commerce platform that supports:
- Physical product sales
- Digital eBook sales (secure online reading)
- Affiliate marketing system
- Coupon/Promo code system
- Multiple payment gateway integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation & Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` file with your configuration:
   - MongoDB connection string
   - JWT secret key
   - SMS API credentials
   - Payment gateway credentials

### Step 3: Start MongoDB

**Local MongoDB:**
```bash
# Make sure MongoDB is running on your system
mongod
```

**MongoDB Atlas (Cloud):**
- Update `MONGODB_URI` in `.env` with your Atlas connection string

### Step 4: Run the Server

**Development mode (with nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Step 5: Verify Installation

Open your browser or use Postman:
```
GET https://e-book-backend-tau.vercel.app/
```

Expected response:
```json
{
  "success": true,
  "message": "eBook Backend API is running!",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📁 Project Structure

```
eBook_Backend/
├── config/              # Configuration files
│   └── database.js      # MongoDB connection
├── models/              # Mongoose models (to be added)
├── routes/              # API routes (to be added)
├── controllers/         # Route controllers (to be added)
├── services/            # Business logic layer (to be added)
├── middleware/          # Custom middleware
│   └── errorHandler.js  # Global error handler
├── utils/               # Utility functions (to be added)
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore file
├── package.json         # Dependencies and scripts
├── server.js            # Main server file
└── README.md            # This file
```

## 🔧 Available Scripts

- `npm start` - Start server in production mode
- `npm run dev` - Start server in development mode (with nodemon)

## 📝 API Endpoints

### Health Check
- `GET /` - API status
- `GET /api/health` - Health check endpoint

More endpoints will be added in future parts.

## 🔐 Environment Variables

Key environment variables (see `.env.example` for full list):

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS

## 🏗️ Architecture

This project follows **3-Layer Architecture**:

1. **Presentation Layer** (Routes + Controllers)
2. **Business Logic Layer** (Services)
3. **Data Access Layer** (Models + Repositories)

## 📚 Documentation

All detailed documentation is available in the [`docs/`](./docs/) folder.

- [Part 1: Project Setup Documentation](./docs/PART1_DOCUMENTATION.md)
- [Documentation Index](./docs/README.md)

## 📚 Development Progress

### ✅ Part 1: Project Setup (Current)
- [x] Project initialization
- [x] Folder structure
- [x] Basic Express server
- [x] MongoDB connection
- [x] Error handling middleware
- [x] Environment configuration

### 🔄 Upcoming Parts
- Part 2: Database Connection & Testing
- Part 3: Basic Middleware Setup
- Part 4: User Model & Schema
- Part 5: OTP Service
- ... (see project plan)

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check MongoDB connection string format

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using the port

## 📄 License

ISC

## 👥 Contributors

- Your Name

---

**Note:** This is Part 1 setup. More features will be added in subsequent parts.

