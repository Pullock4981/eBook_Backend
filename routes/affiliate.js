/**
 * Affiliate Routes
 * API endpoints for affiliate operations
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const affiliateController = require('../controllers/affiliateController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/affiliates/register
 * @desc    Register as affiliate
 * @access  Private
 */
router.post('/register', affiliateController.registerAsAffiliate);

/**
 * @route   GET /api/affiliates/profile
 * @desc    Get affiliate profile
 * @access  Private
 */
router.get('/profile', affiliateController.getAffiliateProfile);

/**
 * @route   GET /api/affiliates/statistics
 * @desc    Get affiliate statistics
 * @access  Private
 */
router.get('/statistics', affiliateController.getStatistics);

/**
 * @route   GET /api/affiliates/commissions
 * @desc    Get commissions
 * @access  Private
 */
router.get('/commissions', affiliateController.getCommissions);

/**
 * @route   POST /api/affiliates/withdraw
 * @desc    Create withdraw request
 * @access  Private
 */
router.post('/withdraw', affiliateController.createWithdrawRequest);

/**
 * @route   GET /api/affiliates/withdraw-requests
 * @desc    Get withdraw requests
 * @access  Private
 */
router.get('/withdraw-requests', affiliateController.getWithdrawRequests);

/**
 * @route   PUT /api/affiliates/payment-details
 * @desc    Update payment details
 * @access  Private
 */
router.put('/payment-details', affiliateController.updatePaymentDetails);

/**
 * @route   DELETE /api/affiliates/cancel
 * @desc    Cancel affiliate registration (only if pending)
 * @access  Private
 */
router.delete('/cancel', affiliateController.cancelAffiliateRegistration);

/**
 * @route   POST /api/affiliates/coupons
 * @desc    Generate affiliate coupon
 * @access  Private
 */
router.post('/coupons', affiliateController.generateCoupon);

/**
 * @route   GET /api/affiliates/coupons
 * @desc    Get affiliate coupons
 * @access  Private
 */
router.get('/coupons', affiliateController.getCoupons);

module.exports = router;

