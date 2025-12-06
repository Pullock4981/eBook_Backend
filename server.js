/**
 * eBook Backend - Main Server File
 * Express server setup with middleware configuration
 */

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
// Routes will be added here in future parts
// app.use('/api/orders', orderRoutes);

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
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📡 API URL: http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    });

