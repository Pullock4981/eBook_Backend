/**
 * Admin Affiliate Routes
 * API endpoints for admin affiliate management
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const adminAffiliateController = require('../controllers/adminAffiliateController');

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/affiliates
 * @desc    Get all affiliates
 * @access  Private (Admin)
 */
router.get('/affiliates', adminAffiliateController.getAllAffiliates);

/**
 * @route   PUT /api/admin/affiliates/:affiliateId/approve
 * @desc    Approve affiliate
 * @access  Private (Admin)
 */
router.put('/affiliates/:affiliateId/approve', adminAffiliateController.approveAffiliate);

/**
 * @route   PUT /api/admin/affiliates/:affiliateId/reject
 * @desc    Reject affiliate
 * @access  Private (Admin)
 */
router.put('/affiliates/:affiliateId/reject', adminAffiliateController.rejectAffiliate);

/**
 * @route   PUT /api/admin/affiliates/:affiliateId/suspend
 * @desc    Suspend affiliate
 * @access  Private (Admin)
 */
router.put('/affiliates/:affiliateId/suspend', adminAffiliateController.suspendAffiliate);

/**
 * @route   GET /api/admin/commissions
 * @desc    Get all commissions
 * @access  Private (Admin)
 */
router.get('/commissions', adminAffiliateController.getAllCommissions);

/**
 * @route   GET /api/admin/withdraw-requests
 * @desc    Get all withdraw requests
 * @access  Private (Admin)
 */
router.get('/withdraw-requests', adminAffiliateController.getAllWithdrawRequests);

/**
 * @route   PUT /api/admin/withdraw-requests/:requestId/approve
 * @desc    Approve withdraw request
 * @access  Private (Admin)
 */
router.put('/withdraw-requests/:requestId/approve', adminAffiliateController.approveWithdrawRequest);

/**
 * @route   PUT /api/admin/withdraw-requests/:requestId/reject
 * @desc    Reject withdraw request
 * @access  Private (Admin)
 */
router.put('/withdraw-requests/:requestId/reject', adminAffiliateController.rejectWithdrawRequest);

/**
 * @route   PUT /api/admin/withdraw-requests/:requestId/paid
 * @desc    Mark withdraw as paid
 * @access  Private (Admin)
 */
router.put('/withdraw-requests/:requestId/paid', adminAffiliateController.markWithdrawAsPaid);

/**
 * @route   GET /api/admin/affiliates/analytics
 * @desc    Get affiliate analytics
 * @access  Private (Admin)
 */
router.get('/affiliates/analytics', adminAffiliateController.getAffiliateAnalytics);

module.exports = router;

