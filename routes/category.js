/**
 * Category Routes
 * API endpoints for category management
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const categoryController = require('../controllers/categoryController');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/main', categoryController.getMainCategories);
router.get('/:parentId/subcategories', categoryController.getSubcategories);
router.get('/:id', categoryController.getCategoryById);

// Admin routes (require authentication and admin role)
router.post('/', authenticate, requireAdmin, categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router;

