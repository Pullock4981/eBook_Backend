/**
 * Database Connection Middleware
 * Ensures database is connected before handling requests (especially for serverless)
 */

const mongoose = require('mongoose');
const connectDB = require('../config/database');

// Store connection promise to avoid multiple simultaneous connection attempts
let connectionPromise = null;

/**
 * Middleware to ensure database connection before handling requests
 * This is especially important for serverless functions where connection
 * might not be established when the function is invoked
 */
const ensureDBConnection = async (req, res, next) => {
    try {
        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            return next();
        }

        // If connecting, wait for existing connection attempt
        if (mongoose.connection.readyState === 2) {
            // Wait up to 10 seconds for connection to complete
            let attempts = 0;
            while (mongoose.connection.readyState === 2 && attempts < 100) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            if (mongoose.connection.readyState === 1) {
                return next();
            }
        }

        // If there's already a connection attempt in progress, wait for it
        if (connectionPromise) {
            try {
                await connectionPromise;
                if (mongoose.connection.readyState === 1) {
                    return next();
                }
            } catch (err) {
                // Connection attempt failed, will try again below
                connectionPromise = null;
            }
        }

        // Try to connect
        console.log('🔄 Database not connected, attempting connection...');
        connectionPromise = connectDB();

        try {
            await connectionPromise;

            // Verify connection
            if (mongoose.connection.readyState === 1) {
                console.log('✅ Database connected successfully');
                connectionPromise = null; // Clear promise on success
                return next();
            } else {
                throw new Error('Database connection state is not connected after connect()');
            }
        } catch (connectError) {
            connectionPromise = null; // Clear promise on error
            throw connectError;
        }
    } catch (error) {
        console.error('❌ Database connection error in middleware:', error.message);
        console.error('Connection state:', mongoose.connection.readyState);

        // Return error response
        return res.status(503).json({
            success: false,
            message: 'Database connection unavailable. Please try again in a moment.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            connectionState: mongoose.connection.readyState
        });
    }
};

module.exports = { ensureDBConnection };

