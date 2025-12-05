/**
 * Test Repository
 * Data access layer for Test model
 * Handles all database operations for Test
 */

const Test = require('../models/Test');

/**
 * Create a new test document
 * @param {Object} data - Test data
 * @returns {Promise<Object>} - Created test document
 */
const create = async (data) => {
    return await Test.create(data);
};

/**
 * Get all test documents
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number (default: 1)
 * @param {Number} limit - Items per page (default: 10)
 * @returns {Promise<Object>} - Test documents with pagination
 */
const getAll = async (filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [tests, total] = await Promise.all([
        Test.find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Test.countDocuments(filters)
    ]);

    return {
        tests,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get test document by ID
 * @param {String} id - Test document ID
 * @returns {Promise<Object>} - Test document
 */
const getById = async (id) => {
    return await Test.findById(id);
};

/**
 * Update test document by ID
 * @param {String} id - Test document ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated test document
 */
const updateById = async (id, data) => {
    return await Test.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true } // Return updated document and run validators
    );
};

/**
 * Delete test document by ID
 * @param {String} id - Test document ID
 * @returns {Promise<Object>} - Deleted test document
 */
const deleteById = async (id) => {
    return await Test.findByIdAndDelete(id);
};

/**
 * Get database connection status
 * @returns {Promise<Object>} - Database status information
 */
const getDatabaseStatus = async () => {
    try {
        const mongoose = require('mongoose');
        const connectionState = mongoose.connection.readyState;

        // Connection states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        const status = {
            state: states[connectionState] || 'unknown',
            readyState: connectionState,
            host: mongoose.connection.host,
            name: mongoose.connection.name,
            isConnected: connectionState === 1
        };

        // Test a simple query to verify connection works
        if (connectionState === 1) {
            try {
                await Test.countDocuments();
                status.queryTest = 'success';
            } catch (error) {
                status.queryTest = 'failed';
                status.queryError = error.message;
            }
        }

        return status;
    } catch (error) {
        return {
            state: 'error',
            error: error.message
        };
    }
};

module.exports = {
    create,
    getAll,
    getById,
    updateById,
    deleteById,
    getDatabaseStatus
};

