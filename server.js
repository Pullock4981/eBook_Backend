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
const { ensureDBConnection } = require('./middleware/dbConnection');

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
// Allow multiple origins: localhost for development and Netlify for production
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173', // Vite default port
    // Add Netlify domains (wildcard for all Netlify subdomains)
    /^https:\/\/.*\.netlify\.app$/,
    // Add custom domain if set
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // When credentials are used, we must return the specific origin, not true
        // This is required by CORS spec when credentials: true

        // Allow requests with no origin (like mobile apps, Postman, server-to-server, etc.)
        // These are typically safe as they don't use credentials
        if (!origin) {
            // Allow no-origin requests (they won't use credentials anyway)
            return callback(null, true);
        }

        // Allow ALL origins by returning the origin itself
        callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware (protect against XSS)
app.use(sanitizeInput);

// ==================== Basic Routes (Before Rate Limiting) ====================
// These routes are defined before rate limiting to ensure they're always accessible

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'eBook Backend API is running! (v1.1.0)',
        version: '1.1.0',
        timestamp: new Date().toISOString()
    });
});

// API status route with database status
app.get('/api/health', async (req, res) => {
    const mongoose = require('mongoose');
    const connectDB = require('./config/database');

    let dbState = mongoose.connection.readyState;
    const dbStates = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    // If disconnected and MONGODB_URI is set, try to connect
    if (dbState === 0 && process.env.MONGODB_URI) {
        try {
            console.log('🔄 Health check: Attempting database connection...');
            await connectDB();
            dbState = mongoose.connection.readyState;
        } catch (error) {
            console.error('❌ Health check: Database connection failed:', error.message);
        }
    }

    res.json({
        success: true,
        status: 'healthy',
        database: {
            state: dbStates[dbState] || 'unknown',
            isConnected: dbState === 1,
            host: mongoose.connection.host || null,
            name: mongoose.connection.name || null,
            readyState: dbState
        },
        timestamp: new Date().toISOString()
    });
});

// Simple test route to verify routing works
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Test route is working!',
        timestamp: new Date().toISOString()
    });
});

// Database connection test endpoint (direct route for Vercel compatibility)
// Defined BEFORE rate limiting middleware to ensure accessibility
app.get('/api/test/db-connection', async (req, res) => {
    const mongoose = require('mongoose');
    const connectDB = require('./config/database');

    const result = {
        success: false,
        message: '',
        database: {
            state: 'unknown',
            isConnected: false,
            readyState: mongoose.connection.readyState,
            host: null,
            name: null
        },
        connectionString: {
            exists: !!process.env.MONGODB_URI,
            hasDatabase: process.env.MONGODB_URI?.includes('/ebook_db'),
            length: process.env.MONGODB_URI?.length || 0
        },
        error: null,
        timestamp: new Date().toISOString()
    };

    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            result.message = 'MONGODB_URI is not set in environment variables';
            return res.status(500).json(result);
        }

        // Check current state
        if (mongoose.connection.readyState === 1) {
            result.success = true;
            result.message = 'Database already connected';
            result.database = {
                state: 'connected',
                isConnected: true,
                readyState: 1,
                host: mongoose.connection.host,
                name: mongoose.connection.name
            };
            return res.json(result);
        }

        // Try to connect
        console.log('🔄 Test endpoint: Attempting database connection...');
        await connectDB();

        // Check connection after attempt
        if (mongoose.connection.readyState === 1) {
            result.success = true;
            result.message = 'Database connected successfully';
            result.database = {
                state: 'connected',
                isConnected: true,
                readyState: 1,
                host: mongoose.connection.host,
                name: mongoose.connection.name
            };
        } else {
            result.message = 'Connection attempt completed but state is not connected';
            result.database.readyState = mongoose.connection.readyState;
        }

        res.json(result);
    } catch (error) {
        result.message = 'Database connection failed';
        result.error = error.message;
        result.database.readyState = mongoose.connection.readyState;

        // Provide helpful error details
        if (error.message.includes('authentication failed')) {
            result.error = 'Authentication failed - Check username and password';
        } else if (error.message.includes('ENOTFOUND')) {
            result.error = 'Could not resolve MongoDB host - Check connection string';
        } else if (error.message.includes('IP')) {
            result.error = 'IP not whitelisted - Add 0.0.0.0/0 to MongoDB Atlas Network Access';
        } else if (error.message.includes('timeout')) {
            result.error = 'Connection timeout - Check network and MongoDB Atlas settings';
        }

        res.status(500).json(result);
    }
});

// Rate limiting middleware (apply to all API routes EXCEPT those defined above)
// Routes defined above (/, /api/health, /api/test, /api/test/db-connection) are not rate limited
app.use('/api/', apiLimiter);

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
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ==================== API Routes ====================
// Ensure database connection for all API routes (except health check, admin reconnect, and test endpoints)
// Health check, reconnect, and test routes are excluded to allow checking DB status
app.use('/api', (req, res, next) => {
    // Skip DB connection check for health, reconnect, and test endpoints
    const path = req.path || req.originalUrl?.replace('/api', '') || '';
    const originalUrl = req.originalUrl || '';

    // Exclude health check, admin reconnect, and all test routes
    if (path === '/health' ||
        path === '/admin/reconnect-db' ||
        path.startsWith('/test/') ||
        originalUrl.includes('/api/test/')) {
        return next();
    }
    return ensureDBConnection(req, res, next);
});

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
    // For serverless, we'll connect on first request if not already connected
    // This prevents connection issues on cold starts
    console.log('📦 Serverless mode detected - Database will connect on first request');

    // Try to connect in background (non-blocking)
    connectDB()
        .then(() => {
            console.log('✅ Database connected (Serverless - background)');
        })
        .catch((error) => {
            console.warn('⚠️  Database connection failed (Serverless - will retry on request):', error.message);
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

