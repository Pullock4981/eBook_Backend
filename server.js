/**
 * eBook Backend - Main Server File
 * Express server setup with middleware configuration
 */

// Suppress punycode deprecation warning (DEP0040)
// This warning comes from dependencies like nodemailer, axios, etc.
// It's safe to suppress as it doesn't affect functionality
process.removeAllListeners('warning');
process.on('warning', (warning) => {
    if (warning.name !== 'DeprecationWarning' || !warning.message.includes('punycode')) {
        console.warn(warning.name, warning.message);
    }
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Initialize Express app
const app = express();

// Import database connection
const connectDB = require('./config/database');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const testRoutes = require('./routes/test');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const couponRoutes = require('./routes/coupon');
const paymentRoutes = require('./routes/payment');
const eBookRoutes = require('./routes/ebook');
const affiliateRoutes = require('./routes/affiliate');
const adminAffiliateRoutes = require('./routes/adminAffiliate');
const adminDashboardRoutes = require('./routes/adminDashboard');
const uploadRoutes = require('./routes/upload');

// ==================== Middleware Setup ====================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware (protect against XSS)
app.use(sanitizeInput);

// Rate limiting middleware (apply to all routes)
app.use('/api/', apiLimiter);

// ==================== Basic Routes ====================

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'eBook Backend API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API status route with database status
app.get('/api/health', async (req, res) => {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        success: true,
        status: 'healthy',
        database: {
            state: dbStates[dbState] || 'unknown',
            isConnected: dbState === 1,
            host: mongoose.connection.host,
            name: mongoose.connection.name
        },
        timestamp: new Date().toISOString()
    });
});

// Manual database reconnection endpoint (for admin/testing)
app.post('/api/admin/reconnect-db', async (req, res) => {
    const mongoose = require('mongoose');
    const connectDB = require('./config/database');

    try {
        // Close existing connection if any
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        // Reconnect
        await connectDB();

        res.json({
            success: true,
            message: 'Database reconnected successfully',
            database: {
                state: 'connected',
                isConnected: true,
                host: mongoose.connection.host,
                name: mongoose.connection.name
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to reconnect database',
            error: error.message
        });
    }
});

// ==================== API Routes ====================
// Authentication routes (Part 6)
app.use('/api/auth', authRoutes);
// Test routes (for database testing - Part 2)
app.use('/api/test', testRoutes);
// User routes (profile and address management - Part 4)
app.use('/api/users', userRoutes);
// Product routes (Part 7)
app.use('/api/products', productRoutes);
// Category routes (Part 7)
app.use('/api/categories', categoryRoutes);
// Cart routes (Part 8)
app.use('/api/cart', cartRoutes);
// Order routes (Part 8)
app.use('/api/orders', orderRoutes);
// Coupon routes (Part 9)
app.use('/api/coupons', couponRoutes);
// Payment routes (Part 10)
app.use('/api/payments', paymentRoutes);
// eBook routes (Part 11)
app.use('/api/ebooks', eBookRoutes);
// Affiliate routes (Part 12)
app.use('/api/affiliates', affiliateRoutes);
// Admin affiliate routes (Part 12)
app.use('/api/admin', adminAffiliateRoutes);
// Admin dashboard routes (Part 13)
app.use('/api/admin', adminDashboardRoutes);
// Upload routes (Part 14)
app.use('/api/upload', uploadRoutes);

// ==================== Error Handling ====================

// 404 handler - Route not found
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// ==================== Server Start ====================

const PORT = process.env.PORT || 5000;

// Connect to database and start server
// Only start server if running directly (not as serverless function)
// Vercel will use the exported app directly without starting a server
if (require.main === module) {
    // Running directly (local development)
    connectDB()
        .then(() => {
            startServer();
        })
        .catch((error) => {
            console.error('❌ Database connection failed:', error.message);
            console.warn('⚠️  Server will start without database connection.');
            console.warn('⚠️  API endpoints will return errors until database is connected.');
            console.warn('💡 Please check your MONGODB_URI in .env file');
            console.warn('💡 For local MongoDB: mongodb://localhost:27017/ebook_db');
            console.warn('💡 For MongoDB Atlas: Check your IP whitelist and connection string');
            // Start server anyway to show proper error messages
            startServer();
        });
} else {
    // Being imported (Vercel serverless)
    // Connect to database but don't start server
    connectDB()
        .then(() => {
            console.log('✅ Database connected (Serverless)');
        })
        .catch((error) => {
            console.error('❌ Database connection failed (Serverless):', error.message);
        });
}

function startServer() {
    app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📡 API URL: http://localhost:${PORT}`);
        console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    });
}

// Export app for Vercel serverless functions
// For local development, the server will start normally
// For Vercel, it will use the exported app
module.exports = app;

