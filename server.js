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

// Import routes
const testRoutes = require('./routes/test');
// const authRoutes = require('./routes/auth');

// ==================== Middleware Setup ====================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// Test routes (for database testing - Part 2)
app.use('/api/test', testRoutes);
// Routes will be added here in future parts
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
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

