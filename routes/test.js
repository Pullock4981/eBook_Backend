/**
 * Test Routes
 * API endpoints for testing database connection and CRUD operations
 */

const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Database status check
router.get('/db-status', testController.getDatabaseStatus);

// CRUD operations
router.post('/', testController.createTest);
router.get('/', testController.getAllTests);
router.get('/:id', testController.getTestById);
router.put('/:id', testController.updateTest);
router.delete('/:id', testController.deleteTest);

module.exports = router;

