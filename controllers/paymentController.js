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
 * SSLCommerz webhook handler
 * POST /api/payments/sslcommerz/webhook
 */
exports.sslcommerzWebhook = async (req, res, next) => {
    try {
        const result = await paymentService.verifySSLCommerzPayment(req.body);

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: result
        });
    } catch (error) {
        // Log error but return success to SSLCommerz (to prevent retries)
        console.error('SSLCommerz webhook error:', error);
        res.status(200).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * SSLCommerz success callback
 * GET /api/payments/sslcommerz/success
 */
exports.sslcommerzSuccess = async (req, res, next) => {
    try {
        const { tran_id, val_id } = req.query;

        if (tran_id && val_id) {
            await paymentService.verifySSLCommerzPayment({
                tran_id,
                val_id,
                amount: req.query.amount,
                store_amount: req.query.store_amount,
                currency: req.query.currency,
                status: req.query.status
            });
        }

        // Redirect to frontend success page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/payment/success?orderId=${tran_id}`);
    } catch (error) {
        next(error);
    }
};

/**
 * SSLCommerz fail callback
 * GET /api/payments/sslcommerz/fail
 */
exports.sslcommerzFail = async (req, res, next) => {
    try {
        const { tran_id } = req.query;

        if (tran_id) {
            const order = await orderRepository.findByOrderId(tran_id);
            if (order && order.paymentStatus !== 'paid') {
                await orderRepository.updatePaymentStatus(order._id, 'failed');
            }
        }

        // Redirect to frontend fail page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/payment/fail?orderId=${tran_id}`);
    } catch (error) {
        next(error);
    }
};

/**
 * SSLCommerz cancel callback
 * GET /api/payments/sslcommerz/cancel
 */
exports.sslcommerzCancel = async (req, res, next) => {
    try {
        const { tran_id } = req.query;

        // Redirect to frontend cancel page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/payment/cancel?orderId=${tran_id}`);
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

