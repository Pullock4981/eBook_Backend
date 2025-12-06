/**
 * Admin Dashboard Routes
 * API endpoints for admin dashboard and user management
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const adminDashboardController = require('../controllers/adminDashboardController');

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard overview
 * @access  Private (Admin)
 */
router.get('/dashboard', adminDashboardController.getDashboard);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin)
 */
router.get('/users/stats', adminDashboardController.getUserStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', adminDashboardController.getAllUsers);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get('/users/:userId', adminDashboardController.getUserById);

/**
 * @route   PUT /api/admin/users/:userId/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.put('/users/:userId/role', adminDashboardController.updateUserRole);

/**
 * @route   PUT /api/admin/users/:userId/status
 * @desc    Update user status
 * @access  Private (Admin)
 */
router.put('/users/:userId/status', adminDashboardController.updateUserStatus);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/users/:userId', adminDashboardController.deleteUser);

module.exports = router;

