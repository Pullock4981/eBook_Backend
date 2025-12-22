/**
 * Order Routes
 * API endpoints for order management
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { body, param } = require('express-validator');
const { validate, commonRules } = require('../middleware/validation');
const orderController = require('../controllers/orderController');

// User routes (require authentication)
router.post(
    '/',
    authenticate,
    [
        body('paymentMethod')
            .notEmpty()
            .withMessage('Payment method is required')
            .isIn(['bkash', 'nagad', 'cash_on_delivery'])
            .withMessage('Invalid payment method'),
        body('shippingAddress')
            .optional({ nullable: true, checkFalsy: true })
            .isMongoId()
            .withMessage('Invalid shipping address ID')
    ],
    validate,
    orderController.createOrder
);

router.get('/', authenticate, orderController.getUserOrders);
router.get('/order-id/:orderId', authenticate, orderController.getOrderByOrderId);
router.get('/:id', authenticate, orderController.getOrderById);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, orderController.getAllOrders);
router.put(
    '/:id/status',
    authenticate,
    requireAdmin,
    [
        commonRules.objectId('id'),
        body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
            .withMessage('Invalid order status')
    ],
    validate,
    orderController.updateOrderStatus
);

router.put(
    '/:id/payment-status',
    authenticate,
    requireAdmin,
    [
        commonRules.objectId('id'),
        body('paymentStatus').isIn(['pending', 'processing', 'paid', 'failed', 'refunded'])
            .withMessage('Invalid payment status'),
        body('transactionId').optional().isString()
    ],
    validate,
    orderController.updatePaymentStatus
);

module.exports = router;

