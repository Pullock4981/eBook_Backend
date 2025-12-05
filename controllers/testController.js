/**
 * Test Controller
 * Presentation layer - Handles HTTP requests and responses
 * Routes requests to service layer
 */

const testService = require('../services/testService');

/**
 * Create a new test document
 * POST /api/test
 */
exports.createTest = async (req, res, next) => {
    try {
        const test = await testService.createTest(req.body);
        res.status(201).json({
            success: true,
            message: 'Test created successfully',
            data: test
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all test documents
 * GET /api/test
 */
exports.getAllTests = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;
        const result = await testService.getAllTests(filters, page, limit);

        res.status(200).json({
            success: true,
            message: 'Tests retrieved successfully',
            data: result.tests,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get test document by ID
 * GET /api/test/:id
 */
exports.getTestById = async (req, res, next) => {
    try {
        const test = await testService.getTestById(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Test retrieved successfully',
            data: test
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update test document by ID
 * PUT /api/test/:id
 */
exports.updateTest = async (req, res, next) => {
    try {
        const test = await testService.updateTest(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Test updated successfully',
            data: test
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete test document by ID
 * DELETE /api/test/:id
 */
exports.deleteTest = async (req, res, next) => {
    try {
        const test = await testService.deleteTest(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Test deleted successfully',
            data: test
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get database connection status
 * GET /api/test/db-status
 */
exports.getDatabaseStatus = async (req, res, next) => {
    try {
        const status = await testService.getDatabaseStatus();
        res.status(200).json({
            success: true,
            message: 'Database status retrieved',
            data: status
        });
    } catch (error) {
        next(error);
    }
};

