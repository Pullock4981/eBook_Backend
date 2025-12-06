/**
 * Payment Service
 * Business logic layer for payment gateway integration
 * Supports SSLCommerz, bKash, and Nagad
 */

const axios = require('axios');
const crypto = require('crypto');
const orderRepository = require('../repositories/orderRepository');

/**
 * Payment Gateway Types
 */
const PAYMENT_GATEWAYS = {
    SSLCOMMERZ: 'sslcommerz',
    BKASH: 'bkash',
    NAGAD: 'nagad',
    CASH_ON_DELIVERY: 'cash_on_delivery'
};

/**
 * Initiate payment with SSLCommerz
 * @param {Object} order - Order document
 * @returns {Promise<Object>} - Payment initiation result
 */
const initiateSSLCommerzPayment = async (order) => {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';

    if (!storeId || !storePassword) {
        throw new Error('SSLCommerz credentials not configured');
    }

    const baseUrl = isLive
        ? 'https://securepay.sslcommerz.com'
        : 'https://sandbox.sslcommerz.com';

    // Prepare payment data
    const paymentData = {
        store_id: storeId,
        store_passwd: storePassword,
        total_amount: order.total,
        currency: 'BDT',
        tran_id: order.orderId,
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
        fail_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/fail`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
        ipn_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/sslcommerz/webhook`,
        cus_name: order.user.profile?.name || order.user.mobile,
        cus_email: order.user.profile?.email || `${order.user.mobile}@ebook.com`,
        cus_add1: order.shippingAddress?.addressLine1 || 'N/A',
        cus_city: order.shippingAddress?.city || 'N/A',
        cus_postcode: order.shippingAddress?.postalCode || '0000',
        cus_country: 'Bangladesh',
        cus_phone: order.user.mobile,
        shipping_method: 'NO',
        product_name: order.items.map(item => item.productSnapshot?.name || 'Product').join(', '),
        product_category: 'E-commerce',
        product_profile: 'general'
    };

    try {
        const response = await axios.post(`${baseUrl}/gwprocess/v4/api.php`, paymentData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.status === 'SUCCESS' && response.data.GatewayPageURL) {
            return {
                success: true,
                gateway: 'sslcommerz',
                paymentUrl: response.data.GatewayPageURL,
                sessionKey: response.data.sessionkey,
                orderId: order.orderId
            };
        } else {
            throw new Error(response.data.failedreason || 'Payment initiation failed');
        }
    } catch (error) {
        throw new Error(`SSLCommerz payment failed: ${error.response?.data?.message || error.message}`);
    }
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
                callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/bkash/callback`,
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
            callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/nagad/callback`
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
        case PAYMENT_GATEWAYS.SSLCOMMERZ:
            return await initiateSSLCommerzPayment(order);

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
 * Verify SSLCommerz payment
 * @param {Object} paymentData - Payment data from webhook
 * @returns {Promise<Object>} - Verification result
 */
const verifySSLCommerzPayment = async (paymentData) => {
    const { tran_id, val_id, amount, store_amount, currency, status } = paymentData;

    // Verify payment with SSLCommerz
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
    const baseUrl = isLive
        ? 'https://securepay.sslcommerz.com'
        : 'https://sandbox.sslcommerz.com';

    try {
        const response = await axios.get(
            `${baseUrl}/validator/api/validationserverAPI.php`,
            {
                params: {
                    val_id,
                    store_id: storeId,
                    store_passwd: storePassword,
                    format: 'json'
                }
            }
        );

        if (response.data.status === 'VALID' || response.data.status === 'VALIDATED') {
            // Find order by transaction ID
            const order = await orderRepository.findByOrderId(tran_id);
            if (!order) {
                throw new Error('Order not found');
            }

            // Verify amount matches
            if (parseFloat(amount) !== order.total) {
                throw new Error('Payment amount mismatch');
            }

            // Update order payment status (with req for IP/device tracking)
            const orderService = require('./orderService');
            await orderService.updatePaymentStatus(order._id, 'paid', val_id, null);
            // Update order status to confirmed
            await orderRepository.updateStatus(order._id, 'confirmed');

            return {
                success: true,
                orderId: order.orderId,
                transactionId: val_id,
                amount: parseFloat(amount)
            };
        } else {
            throw new Error('Payment verification failed');
        }
    } catch (error) {
        throw new Error(`SSLCommerz verification failed: ${error.message}`);
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
    verifySSLCommerzPayment,
    verifyBkashPayment,
    verifyNagadPayment,
    PAYMENT_GATEWAYS
};

