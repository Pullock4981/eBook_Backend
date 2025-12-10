/**
 * Database Connection Middleware
 * Ensures database is connected before handling requests (especially for serverless)
 */

const mongoose = require('mongoose');
const connectDB = require('../config/database');

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

        // If connecting, wait a bit
        if (mongoose.connection.readyState === 2) {
            // Wait up to 5 seconds for connection to complete
            let attempts = 0;
            while (mongoose.connection.readyState === 2 && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            if (mongoose.connection.readyState === 1) {
                return next();
            }
        }

        // Try to connect
        console.log('🔄 Database not connected, attempting connection...');
        await connectDB();

        // Verify connection
        if (mongoose.connection.readyState === 1) {
            console.log('✅ Database connected successfully');
            return next();
        } else {
            throw new Error('Database connection failed');
        }
    } catch (error) {
        console.error('❌ Database connection error in middleware:', error.message);
        return res.status(503).json({
            success: false,
            message: 'Database connection unavailable. Please try again in a moment.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { ensureDBConnection };

