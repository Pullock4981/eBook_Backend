/**
 * Payment Routes
 * API endpoints for payment gateway integration
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate, commonRules } = require('../middleware/validation');
const paymentController = require('../controllers/paymentController');

// Initiate payment (requires authentication)
router.post(
    '/initiate',
    authenticate,
    [
        commonRules.objectIdBody('orderId'),
        body('paymentMethod').isIn(['bkash', 'nagad', 'cash_on_delivery'])
            .withMessage('Invalid payment method')
    ],
    validate,
    paymentController.initiatePayment
);

// bKash callback
router.post('/bkash/callback', paymentController.bkashCallback);

// Nagad callback
router.post('/nagad/callback', paymentController.nagadCallback);

module.exports = router;

