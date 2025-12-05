/**
 * Test Service
 * Business logic layer for Test operations
 * Handles business rules and data processing
 */

const testRepository = require('../repositories/testRepository');

/**
 * Create a new test document
 * @param {Object} data - Test data
 * @returns {Promise<Object>} - Created test document
 */
const createTest = async (data) => {
    // Business logic: Validate data before creating
    if (!data.name || data.name.trim().length === 0) {
        throw new Error('Name is required');
    }

    // Create test document
    const test = await testRepository.create(data);
    return test;
};

/**
 * Get all test documents with pagination
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Test documents with pagination
 */
const getAllTests = async (filters = {}, page = 1, limit = 10) => {
    // Business logic: Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Max 100 items per page

    // Get tests from repository
    const result = await testRepository.getAll(filters, pageNum, limitNum);
    return result;
};

/**
 * Get test document by ID
 * @param {String} id - Test document ID
 * @returns {Promise<Object>} - Test document
 */
const getTestById = async (id) => {
    // Business logic: Validate ID format
    if (!id || id.length !== 24) {
        throw new Error('Invalid test ID format');
    }

    const test = await testRepository.getById(id);

    if (!test) {
        throw new Error('Test not found');
    }

    return test;
};

/**
 * Update test document by ID
 * @param {String} id - Test document ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated test document
 */
const updateTest = async (id, data) => {
    // Business logic: Validate ID format
    if (!id || id.length !== 24) {
        throw new Error('Invalid test ID format');
    }

    // Check if test exists
    const existingTest = await testRepository.getById(id);
    if (!existingTest) {
        throw new Error('Test not found');
    }

    // Update test
    const updatedTest = await testRepository.updateById(id, data);
    return updatedTest;
};

/**
 * Delete test document by ID
 * @param {String} id - Test document ID
 * @returns {Promise<Object>} - Deleted test document
 */
const deleteTest = async (id) => {
    // Business logic: Validate ID format
    if (!id || id.length !== 24) {
        throw new Error('Invalid test ID format');
    }

    // Check if test exists
    const existingTest = await testRepository.getById(id);
    if (!existingTest) {
        throw new Error('Test not found');
    }

    // Delete test
    const deletedTest = await testRepository.deleteById(id);
    return deletedTest;
};

/**
 * Get database connection status
 * @returns {Promise<Object>} - Database status
 */
const getDatabaseStatus = async () => {
    return await testRepository.getDatabaseStatus();
};

module.exports = {
    createTest,
    getAllTests,
    getTestById,
    updateTest,
    deleteTest,
    getDatabaseStatus
};

