/**
 * Cart Routes
 * API endpoints for cart management
 * All routes require authentication
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate, commonRules } = require('../middleware/validation');
const cartController = require('../controllers/cartController');

// All routes require authentication
router.use(authenticate);

// Get cart
router.get('/', cartController.getCart);

// Add item to cart
router.post(
    '/items',
    [
        commonRules.objectId('productId'),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ],
    validate,
    cartController.addToCart
);

// Update cart item
router.put(
    '/items/:productId',
    [
        param('productId').isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId'),
        body('quantity').isInt({ min: 0 }).withMessage('Quantity cannot be negative')
    ],
    validate,
    cartController.updateCartItem
);

// Remove item from cart
router.delete(
    '/items/:productId',
    [
        param('productId').isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId')
    ],
    validate,
    cartController.removeFromCart
);

// Clear cart
router.delete('/', cartController.clearCart);

// Apply coupon
router.post(
    '/coupon',
    [
        body('couponCode').trim().notEmpty().withMessage('Coupon code is required')
    ],
    validate,
    cartController.applyCoupon
);

// Remove coupon
router.delete('/coupon', cartController.removeCoupon);

module.exports = router;

