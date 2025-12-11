/**
 * Test Routes
 * API endpoints for testing database connection and CRUD operations
 */

const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Database connection test endpoint (public for debugging)
// This endpoint tests MongoDB connection and provides detailed status
router.get('/db-connection', async (req, res) => {
    const mongoose = require('mongoose');
    const connectDB = require('../config/database');

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

// Database status check
router.get('/db-status', testController.getDatabaseStatus);

// CRUD operations
router.post('/', testController.createTest);
router.get('/', testController.getAllTests);
router.get('/:id', testController.getTestById);
router.put('/:id', testController.updateTest);
router.delete('/:id', testController.deleteTest);

module.exports = router;

