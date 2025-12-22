/**
 * Payment Service
 * Business logic layer for payment gateway integration
 * Supports bKash and Nagad
 */

const axios = require('axios');
const crypto = require('crypto');
const orderRepository = require('../repositories/orderRepository');

/**
 * Payment Gateway Types
 */
const PAYMENT_GATEWAYS = {
    BKASH: 'bkash',
    NAGAD: 'nagad',
    CASH_ON_DELIVERY: 'cash_on_delivery'
};

/**
 * Initiate payment with bKash
 * @param {Object} order - Order document
 * @returns {Promise<Object>} - Payment initiation result
 */
const initiateBkashPayment = async (order) => {
    const appKey = process.env.BKASH_APP_KEY;
    const appSecret = process.env.BKASH_APP_SECRET;
    const username = process.env.BKASH_USERNAME;
    const password = process.env.BKASH_PASSWORD;
    const isSandbox = process.env.BKASH_IS_SANDBOX === 'true';

    if (!appKey || !appSecret || !username || !password) {
        throw new Error('bKash credentials not configured');
    }

    const baseUrl = isSandbox
        ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
        : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

    try {
        // Step 1: Get access token
        const tokenResponse = await axios.post(
            `${baseUrl}/tokenized/checkout/token/grant`,
            {
                app_key: appKey,
                app_secret: appSecret
            },
            {
                headers: {
                    username,
                    password,
                    'Content-Type': 'application/json'
                }
            }
        );

        const accessToken = tokenResponse.data.id_token;

        // Step 2: Create payment
        const paymentResponse = await axios.post(
            `${baseUrl}/tokenized/checkout/payment/create`,
            {
                mode: '0011',
                payerReference: order.user.mobile,
                callbackURL: `${process.env.BACKEND_URL || 'https://e-book-backend-tau.vercel.app'}/api/payments/bkash/callback`,
                amount: order.total.toString(),
                currency: 'BDT',
                intent: 'sale',
                merchantInvoiceNumber: order.orderId
            },
            {
                headers: {
                    Authorization: accessToken,
                    'X-APP-Key': appKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (paymentResponse.data.statusCode === '0000') {
            return {
                success: true,
                gateway: 'bkash',
                paymentUrl: paymentResponse.data.bkashURL,
                paymentID: paymentResponse.data.paymentID,
                orderId: order.orderId
            };
        } else {
            throw new Error(paymentResponse.data.statusMessage || 'bKash payment failed');
        }
    } catch (error) {
        throw new Error(`bKash payment failed: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Initiate payment with Nagad
 * @param {Object} order - Order document
 * @returns {Promise<Object>} - Payment initiation result
 */
const initiateNagadPayment = async (order) => {
    const merchantId = process.env.NAGAD_MERCHANT_ID;
    const merchantKey = process.env.NAGAD_MERCHANT_KEY;
    const isSandbox = process.env.NAGAD_IS_SANDBOX === 'true';

    if (!merchantId || !merchantKey) {
        throw new Error('Nagad credentials not configured');
    }

    const baseUrl = isSandbox
        ? 'https://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs'
        : 'https://api.mynagad.com/api/dfs';

    try {
        // Generate datetime
        const datetime = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + '000';

        // Generate challenge
        const challenge = crypto.randomBytes(16).toString('hex');

        // Prepare payment data
        const paymentData = {
            merchantId,
            orderId: order.orderId,
            datetime,
            challenge,
            amount: order.total.toString(),
            currencyCode: '050',
            callbackURL: `${process.env.BACKEND_URL || 'https://e-book-backend-tau.vercel.app'}/api/payments/nagad/callback`
        };

        // Create signature (simplified - actual implementation may vary)
        // Note: Nagad signature generation is more complex, this is a placeholder
        const signature = crypto
            .createHash('sha256')
            .update(JSON.stringify(paymentData) + merchantKey)
            .digest('hex');

        const response = await axios.post(
            `${baseUrl}/check-out/initialize/${merchantId}/${order.orderId}`,
            {
                ...paymentData,
                signature
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.reasonCode === '0000' && response.data.paymentReferenceId) {
            return {
                success: true,
                gateway: 'nagad',
                paymentUrl: response.data.callBackUrl,
                paymentReferenceId: response.data.paymentReferenceId,
                orderId: order.orderId
            };
        } else {
            throw new Error(response.data.reason || 'Nagad payment failed');
        }
    } catch (error) {
        throw new Error(`Nagad payment failed: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Initiate payment
 * @param {String} orderId - Order ID
 * @param {String} paymentMethod - Payment method
 * @returns {Promise<Object>} - Payment initiation result
 */
const initiatePayment = async (orderId, paymentMethod) => {
    if (!orderId || orderId.length !== 24) {
        throw new Error('Invalid order ID format');
    }

    // Get order
    const order = await orderRepository.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
        throw new Error('Order is already paid');
    }

    // Initiate payment based on method
    switch (paymentMethod) {
        case PAYMENT_GATEWAYS.BKASH:
            return await initiateBkashPayment(order);

        case PAYMENT_GATEWAYS.NAGAD:
            return await initiateNagadPayment(order);

        case PAYMENT_GATEWAYS.CASH_ON_DELIVERY:
            // For cash on delivery, just update order status directly
            // Import orderService here to avoid circular dependency
            const orderService = require('./orderService');
            await orderService.updatePaymentStatus(orderId, 'paid', 'CASH_ON_DELIVERY', null);
            // Update order status to confirmed
            await orderRepository.updateStatus(orderId, 'confirmed');
            return {
                success: true,
                gateway: 'cash_on_delivery',
                message: 'Order confirmed. Payment on delivery.',
                orderId: order.orderId
            };

        default:
            throw new Error('Invalid payment method');
    }
};

/**
 * Verify bKash payment
 * @param {String} paymentID - Payment ID
 * @returns {Promise<Object>} - Verification result
 */
const verifyBkashPayment = async (paymentID) => {
    // TODO: Implement bKash payment verification
    // This requires calling bKash execute payment API
    throw new Error('bKash payment verification not yet fully implemented');
};

/**
 * Verify Nagad payment
 * @param {String} paymentReferenceId - Payment reference ID
 * @returns {Promise<Object>} - Verification result
 */
const verifyNagadPayment = async (paymentReferenceId) => {
    // TODO: Implement Nagad payment verification
    // This requires calling Nagad verify payment API
    throw new Error('Nagad payment verification not yet fully implemented');
};

module.exports = {
    initiatePayment,
    verifyBkashPayment,
    verifyNagadPayment,
    PAYMENT_GATEWAYS
};

