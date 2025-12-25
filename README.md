# eBook Backend API

A comprehensive MERN stack backend application for an e-commerce platform that supports physical product sales, digital eBook sales, affiliate marketing system, coupon/promo codes, and multiple payment gateway integrations.

## 🚀 Project Overview

This backend API provides a complete e-commerce solution with the following features:

- **Physical Product Sales** - Complete product catalog with inventory management
- **Digital eBook Sales** - Secure online reading with IP/device restrictions
- **Affiliate Marketing System** - Referral tracking, commission management, and withdrawal system
- **Coupon/Promo Code System** - Discount codes with usage tracking
- **Multiple Payment Gateways** - SSLCommerz, bKash, and Nagad integration
- **User Authentication** - Mobile-based OTP authentication system
- **Admin Dashboard** - Complete admin panel with analytics and management tools
- **Order Management** - Full order lifecycle management
- **Cart System** - Shopping cart with persistent storage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or MongoDB Atlas) - [Download](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

## 🛠️ Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd eBook_Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` file with your configuration:

**Required Variables:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/ebook_db
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ebook_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Optional Variables (for full functionality):**
- SMS API credentials (for OTP)
- Payment gateway credentials (bKash, Nagad, SSLCommerz)
- Cloudinary credentials (for file uploads)
- Email configuration (for notifications)

See `.env.example` for complete list of available variables.

### Step 4: Start MongoDB

**Local MongoDB:**
```bash
# Make sure MongoDB is running on your system
mongod
```

**MongoDB Atlas (Cloud):**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env`
- Add your IP address to Network Access whitelist

### Step 5: Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Step 6: Verify Installation

Open your browser or use Postman/curl:
```bash
GET http://localhost:5000/
```

Expected response:
```json
{
  "success": true,
  "message": "eBook Backend API is running! (v1.1.3)",
  "version": "1.1.3",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Health Check:**
```bash
GET http://localhost:5000/api/health
```

## 📁 Project Structure

```
eBook_Backend/
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   └── jwt.js           # JWT configuration
│
├── models/              # Mongoose models (Data Layer)
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── Cart.js
│   ├── Coupon.js
│   ├── eBookAccess.js
│   ├── Affiliate.js
│   ├── Commission.js
│   └── WithdrawRequest.js
│
├── repositories/        # Repository pattern (Data Access Layer)
│   ├── userRepository.js
│   ├── productRepository.js
│   ├── categoryRepository.js
│   ├── orderRepository.js
│   └── ...
│
├── services/            # Business logic layer
│   ├── authService.js
│   ├── productService.js
│   ├── orderService.js
│   ├── paymentService.js
│   ├── ebookService.js
│   ├── affiliateService.js
│   └── ...
│
├── controllers/         # Route controllers (Presentation Layer)
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   └── ...
│
├── routes/              # API routes
│   ├── auth.js
│   ├── product.js
│   ├── order.js
│   ├── cart.js
│   ├── payment.js
│   ├── ebook.js
│   ├── affiliate.js
│   └── ...
│
├── middleware/          # Custom middleware
│   ├── auth.js          # Authentication middleware
│   ├── roleCheck.js     # Role-based access control
│   ├── errorHandler.js  # Global error handler
│   ├── rateLimiter.js   # Rate limiting
│   ├── sanitize.js      # Input sanitization
│   ├── validation.js    # Request validation
│   └── upload.js        # File upload handling
│
├── utils/               # Utility functions
│   ├── otpService.js    # OTP generation
│   ├── cloudinary.js    # Cloudinary integration
│   ├── pdfWatermark.js  # PDF watermarking
│   └── deviceFingerprint.js
│
├── scripts/             # Utility scripts
│   ├── seedProducts.js
│   └── testConnection.js
│
├── docs/                # Documentation
│   ├── README.md
│   └── PART*.md
│
├── server.js            # Main server file
├── vercel.json          # Vercel deployment config
├── package.json         # Dependencies and scripts
├── .env.example         # Environment variables template
└── README.md            # This file
```

## 🏗️ Architecture

This project follows **3-Layer Architecture**:

### 1. Presentation Layer (Routes + Controllers)
- Handles HTTP requests/responses
- Request validation
- Authentication/Authorization
- Error formatting

### 2. Business Logic Layer (Services)
- Business rules implementation
- Data transformation
- External API integration
- Complex calculations

### 3. Data Access Layer (Models + Repositories)
- Database operations
- Data persistence
- Query optimization
- Model relationships

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (OTP)
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/refresh-token` - Refresh JWT token

### Products
- `GET /api/products` - Get all products (with pagination, filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/products/search` - Search products
- `GET /api/products/featured` - Get featured products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove item from cart
- `POST /api/cart/apply-coupon` - Apply coupon to cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/admin/orders` - Get all orders (Admin)
- `PUT /api/admin/orders/:id/status` - Update order status (Admin)

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/callback` - Payment callback

### eBooks
- `GET /api/ebooks/my-ebooks` - Get user's eBooks
- `GET /api/ebooks/:id/access` - Get eBook access token
- `GET /api/ebooks/:id/viewer` - Get secure PDF viewer URL

### Affiliates
- `POST /api/affiliates/register` - Register as affiliate
- `GET /api/affiliates/profile` - Get affiliate profile
- `GET /api/affiliates/statistics` - Get affiliate statistics
- `GET /api/affiliates/commissions` - Get commission history
- `POST /api/affiliates/withdraw` - Create withdraw request

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/affiliates` - Get all affiliates
- `GET /api/admin/commissions` - Get all commissions
- `PUT /api/admin/commissions/:id/approve` - Approve commission
- `GET /api/admin/withdraw-requests` - Get withdraw requests
- `PUT /api/admin/withdraw-requests/:id/approve` - Approve withdraw

### Health & Testing
- `GET /` - API status
- `GET /api/health` - Health check with DB status
- `GET /api/test` - Test route
- `GET /api/test/db-connection` - Database connection test

## 🔧 Available Scripts

- `npm start` - Start server in production mode
- `npm run dev` - Start server in development mode (with nodemon auto-reload)
- `npm run seed` - Seed database with sample products

## 🔐 Authentication & Authorization

### Authentication Flow
1. User registers/logs in with mobile number
2. OTP is sent via SMS
3. User verifies OTP
4. JWT token is issued
5. Token is used for subsequent requests

### Role-Based Access Control
- **User** - Can access user-specific endpoints
- **Admin** - Can access admin endpoints + all user endpoints

### Protected Routes
Most routes require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for password security
- **Input Sanitization** - XSS protection
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Protection** - Configurable CORS policies
- **Helmet** - Security headers
- **Request Validation** - Input validation using express-validator
- **eBook Security** - IP restriction, device fingerprinting, PDF watermarking

## 📦 Key Features

### 1. Product Management
- Physical and digital products
- Category and subcategory support
- Search and filtering
- Stock management
- Featured products
- Product images

### 2. Order Management
- Order creation and tracking
- Order status updates
- Order history
- Order cancellation

### 3. Cart System
- Persistent cart
- Quantity management
- Coupon application
- Price calculation

### 4. Payment Integration
- SSLCommerz integration
- bKash integration
- Nagad integration
- Payment verification
- Payment callbacks

### 5. eBook System
- Secure PDF serving
- IP restriction
- Device fingerprinting
- PDF watermarking
- Access token management

### 6. Affiliate Program
- Referral link generation
- Commission tracking
- Withdrawal system
- Performance analytics

### 7. Admin Dashboard
- Sales analytics
- User management
- Product management
- Order management
- Affiliate management
- Revenue reports

## 🌐 Deployment

### Vercel Deployment

The project is configured for Vercel serverless deployment:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The `vercel.json` file is already configured.

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- Payment gateway credentials
- SMS API credentials

## 🧪 Testing

### Database Connection Test
```bash
GET http://localhost:5000/api/test/db-connection
```

### Health Check
```bash
GET http://localhost:5000/api/health
```

## 📚 Documentation

Detailed documentation is available in the [`docs/`](./docs/) folder:

- [Part 1: Project Setup](./docs/PART1_DOCUMENTATION.md)
- [Part 2: Database Connection](./docs/PART2_DOCUMENTATION.md)
- [Part 3: Middleware Setup](./docs/PART3_DOCUMENTATION.md)
- [Part 4: User Model](./docs/PART4_DOCUMENTATION.md)
- [Part 5: OTP Service](./docs/PART5_DOCUMENTATION.md)
- [Part 6: Authentication](./docs/PART6_DOCUMENTATION.md)
- [Part 7: Product Management](./docs/PART7_DOCUMENTATION.md)
- [Part 8: Cart & Orders](./docs/PART8_DOCUMENTATION.md)
- [Part 9: Coupon System](./docs/PART9_DOCUMENTATION.md)
- [Part 10: Payment Integration](./docs/PART10_DOCUMENTATION.md)
- [Part 11: eBook Security](./docs/PART11_DOCUMENTATION.md)
- [Part 12: Affiliate Program](./docs/PART12_DOCUMENTATION.md)
- [Part 13: Admin Panel](./docs/PART13_DOCUMENTATION.md)

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running (local) or connection string is correct (Atlas)
- Verify `MONGODB_URI` in `.env`
- Check MongoDB Atlas Network Access (IP whitelist)
- Check MongoDB Atlas database user credentials

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:5000 | xargs kill
  ```

### JWT Token Issues
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration time
- Ensure token is included in Authorization header

### CORS Errors
- Update `FRONTEND_URL` in `.env`
- Check CORS configuration in `server.js`

## 📄 License

ISC

## 👥 Contributors

- Your Name

---

**Version:** 1.1.3  
**Last Updated:** 2024  
**Status:** Production Ready
