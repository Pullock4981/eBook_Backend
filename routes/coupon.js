/**
 * Coupon Routes
 * API endpoints for coupon management
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { body, param } = require('express-validator');
const { validate, commonRules } = require('../middleware/validation');
const couponController = require('../controllers/couponController');

// Public routes (for coupon validation)
router.get('/code/:code', couponController.getCouponByCode);
router.get('/public/active', couponController.getActiveCoupons); // Public route for active coupons
router.post(
    '/validate',
    [
        body('code').trim().notEmpty().withMessage('Coupon code is required'),
        body('cartAmount').isFloat({ min: 0 }).withMessage('Cart amount must be a positive number')
    ],
    validate,
    couponController.validateCoupon
);

// Admin routes (require authentication and admin role)
router.get('/', authenticate, requireAdmin, couponController.getAllCoupons);
router.get('/:id', authenticate, requireAdmin, couponController.getCouponById);
router.post(
    '/',
    authenticate,
    requireAdmin,
    [
        body('code').trim().notEmpty().withMessage('Coupon code is required'),
        body('type').isIn(['percentage', 'fixed']).withMessage('Invalid coupon type'),
        body('value').isFloat({ min: 0 }).withMessage('Coupon value must be a positive number'),
        body('usageLimit').isInt({ min: 1 }).withMessage('Usage limit must be at least 1'),
        body('minPurchase').optional().isFloat({ min: 0 }),
        body('maxDiscount').optional().isFloat({ min: 0 }),
        body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date format')
    ],
    validate,
    couponController.createCoupon
);
router.put(
    '/:id',
    authenticate,
    requireAdmin,
    [
        commonRules.objectId('id')
    ],
    validate,
    couponController.updateCoupon
);
router.delete(
    '/:id',
    authenticate,
    requireAdmin,
    [
        commonRules.objectId('id')
    ],
    validate,
    couponController.deleteCoupon
);

module.exports = router;

