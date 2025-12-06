/**
 * eBook Service
 * Business logic layer for eBook access and security
 */

const crypto = require('crypto');
const eBookAccessRepository = require('../repositories/eBookAccessRepository');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const userRepository = require('../repositories/userRepository');
const { generateWatermarkText } = require('../utils/pdfWatermark');
const { getClientIP, generateFingerprint } = require('../utils/deviceFingerprint');

/**
 * Generate secure access token
 * @returns {String} - Access token
 */
const generateAccessToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Calculate token expiry date
 * @param {Number} days - Number of days (default: 365)
 * @returns {Date} - Expiry date
 */
const getTokenExpiry = (days = 365) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
};

/**
 * Create eBook access for user
 * Called when order is completed and contains eBook
 * @param {String} userId - User ID
 * @param {String} orderId - Order ID
 * @param {String} productId - Product ID
 * @param {Object} req - Express request (for IP and device)
 * @returns {Promise<Object>} - Created access record
 */
const createeBookAccess = async (userId, orderId, productId, req = null) => {
    try {
        // Verify order belongs to user and is paid
        const order = await orderRepository.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.user.toString() !== userId) {
            throw new Error('Order does not belong to user');
        }

        if (order.paymentStatus !== 'paid') {
            throw new Error('Order is not paid');
        }

        // Verify product is eBook
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (product.type !== 'digital' || !product.digitalFile) {
            throw new Error('Product is not an eBook');
        }

        // Check if access already exists
        const existingAccess = await eBookAccessRepository.findByUserAndProduct(userId, productId);
        if (existingAccess && existingAccess.isActive) {
            // Update existing access
            const ip = req ? getClientIP(req) : 'unknown';
            const device = req ? generateFingerprint(req) : 'unknown';

            existingAccess.ipAddress = ip;
            existingAccess.deviceFingerprint = device;
            existingAccess.lastAccess = new Date();
            existingAccess.accessCount += 1;

            return await existingAccess.save();
        }

        // Get IP and device from request
        const ipAddress = req ? getClientIP(req) : 'unknown';
        const deviceFingerprint = req ? generateFingerprint(req) : 'unknown';

        // Generate access token
        const accessToken = generateAccessToken();
        const tokenExpiry = getTokenExpiry(parseInt(process.env.EBOOK_TOKEN_EXPIRY_DAYS || '365'));

        // Create access record
        const accessData = {
            user: userId,
            order: orderId,
            product: productId,
            ipAddress,
            deviceFingerprint,
            accessToken,
            tokenExpiry,
            allowedIPs: [ipAddress],
            allowedDevices: [deviceFingerprint]
        };

        const access = await eBookAccessRepository.create(accessData);
        return access;
    } catch (error) {
        throw new Error(`Failed to create eBook access: ${error.message}`);
    }
};

/**
 * Get user's eBooks
 * @param {String} userId - User ID
 * @returns {Promise<Array>} - Array of eBook access records
 */
const getUserEBooks = async (userId) => {
    try {
        return await eBookAccessRepository.findByUser(userId);
    } catch (error) {
        throw new Error(`Failed to get user eBooks: ${error.message}`);
    }
};

/**
 * Get eBook access by token
 * @param {String} token - Access token
 * @returns {Promise<Object>} - Access record
 */
const geteBookAccess = async (token) => {
    try {
        const access = await eBookAccessRepository.findByToken(token);
        if (!access) {
            throw new Error('Invalid access token');
        }
        return access;
    } catch (error) {
        throw new Error(`Failed to get eBook access: ${error.message}`);
    }
};

/**
 * Generate watermark text for eBook
 * @param {Object} access - eBook access record
 * @returns {String} - Watermark text
 */
const generateeBookWatermark = (access) => {
    const user = access.user;
    const order = access.order;

    const userEmail = user.profile?.email || user.mobile;
    const userName = user.profile?.name || 'User';
    const orderId = order.orderId || order._id.toString();

    return generateWatermarkText(userEmail, orderId, userName);
};

/**
 * Create eBook access for all digital products in an order
 * Called automatically when order payment is confirmed
 * @param {String} orderId - Order ID
 * @param {Object} req - Express request (optional)
 * @returns {Promise<Array>} - Array of created access records
 */
const createAccessForOrder = async (orderId, req = null) => {
    try {
        const order = await orderRepository.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.paymentStatus !== 'paid') {
            throw new Error('Order is not paid');
        }

        const userId = order.user.toString();
        const accessRecords = [];

        // Check each item in order
        for (const item of order.items) {
            // Handle both populated and non-populated product
            const productId = item.product?._id?.toString() || item.product?.toString() || item.product;
            const product = item.product?.type ? item.product : await productRepository.findById(productId);

            if (product && product.type === 'digital' && product.digitalFile) {
                // Create access for this eBook
                const access = await createeBookAccess(userId, orderId, productId, req);
                accessRecords.push(access);
            }
        }

        return accessRecords;
    } catch (error) {
        throw new Error(`Failed to create access for order: ${error.message}`);
    }
};

/**
 * Revoke eBook access
 * @param {String} accessId - Access ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Deactivated access record
 */
const revokeeBookAccess = async (accessId, userId) => {
    try {
        const access = await eBookAccessRepository.findByToken(accessId);

        if (!access) {
            throw new Error('Access not found');
        }

        // Check authorization (admin or owner)
        if (access.user.toString() !== userId) {
            // Check if user is admin (would need to verify from user model)
            throw new Error('Unauthorized to revoke this access');
        }

        return await eBookAccessRepository.deactivate(accessId);
    } catch (error) {
        throw new Error(`Failed to revoke eBook access: ${error.message}`);
    }
};

module.exports = {
    createeBookAccess,
    getUserEBooks,
    geteBookAccess,
    generateeBookWatermark,
    createAccessForOrder,
    revokeeBookAccess,
    generateAccessToken,
    getTokenExpiry
};

