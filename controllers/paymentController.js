/**
 * Payment Controller
 * Presentation layer - Handles HTTP requests and responses for payment operations
 */

const paymentService = require('../services/paymentService');
const orderRepository = require('../repositories/orderRepository');

/**
 * Initiate payment
 * POST /api/payments/initiate
 */
exports.initiatePayment = async (req, res, next) => {
    try {
        const { orderId, paymentMethod } = req.body;
        const result = await paymentService.initiatePayment(orderId, paymentMethod);

        res.status(200).json({
            success: true,
            message: 'Payment initiated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * bKash callback
 * POST /api/payments/bkash/callback
 */
exports.bkashCallback = async (req, res, next) => {
    try {
        // TODO: Implement bKash callback handling
        const { paymentID, status } = req.body;

        if (status === 'success') {
            await paymentService.verifyBkashPayment(paymentID);
        }

        res.status(200).json({
            success: true,
            message: 'Payment processed'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Nagad callback
 * POST /api/payments/nagad/callback
 */
exports.nagadCallback = async (req, res, next) => {
    try {
        // TODO: Implement Nagad callback handling
        const { paymentReferenceId, status } = req.body;

        if (status === 'success') {
            await paymentService.verifyNagadPayment(paymentReferenceId);
        }

        res.status(200).json({
            success: true,
            message: 'Payment processed'
        });
    } catch (error) {
        next(error);
    }
};

