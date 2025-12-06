/**
 * Order Repository
 * Data access layer for Order model
 */

const Order = require('../models/Order');

/**
 * Create a new order
 * @param {Object} data - Order data
 * @returns {Promise<Object>} - Created order document
 */
const create = async (data) => {
    return await Order.create(data);
};

/**
 * Get order by ID
 * @param {String} id - Order ID
 * @returns {Promise<Object>} - Order document
 */
const findById = async (id) => {
    return await Order.findById(id)
        .populate('user', 'mobile profile.name profile.email')
        .populate('items.product', 'name type thumbnail')
        .populate('shippingAddress')
        .populate('coupon', 'code type value')
        .populate('affiliate', 'referralCode');
};

/**
 * Get order by order ID
 * @param {String} orderId - Order ID (ORD-XXXXXX)
 * @returns {Promise<Object>} - Order document
 */
const findByOrderId = async (orderId) => {
    return await Order.findOne({ orderId: orderId.toUpperCase() })
        .populate('user', 'mobile profile.name profile.email')
        .populate('items.product', 'name type thumbnail')
        .populate('shippingAddress')
        .populate('coupon', 'code type value')
        .populate('affiliate', 'referralCode');
};

/**
 * Get all orders for a user
 * @param {String} userId - User ID
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Orders with pagination
 */
const findByUser = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        Order.find({ user: userId })
            .populate('items.product', 'name type thumbnail')
            .populate('shippingAddress')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order.countDocuments({ user: userId })
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get all orders (Admin)
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Orders with pagination
 */
const getAll = async (filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        Order.find(filters)
            .populate('user', 'mobile profile.name')
            .populate('items.product', 'name type')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order.countDocuments(filters)
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Update order by ID
 * @param {String} id - Order ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated order document
 */
const updateById = async (id, data) => {
    return await Order.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    )
        .populate('user', 'mobile profile.name profile.email')
        .populate('items.product', 'name type thumbnail')
        .populate('shippingAddress')
        .populate('coupon', 'code type value');
};

/**
 * Update order status
 * @param {String} id - Order ID
 * @param {String} status - New status
 * @returns {Promise<Object>} - Updated order document
 */
const updateStatus = async (id, status) => {
    const updateData = { orderStatus: status };

    // Set dates based on status
    if (status === 'shipped') {
        updateData.shippedDate = new Date();
    } else if (status === 'delivered') {
        updateData.deliveredDate = new Date();
    }

    return await Order.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    );
};

/**
 * Update payment status
 * @param {String} id - Order ID
 * @param {String} paymentStatus - New payment status
 * @param {String} transactionId - Payment transaction ID
 * @returns {Promise<Object>} - Updated order document
 */
const updatePaymentStatus = async (id, paymentStatus, transactionId = null) => {
    const updateData = {
        paymentStatus,
        paymentDate: paymentStatus === 'paid' ? new Date() : null
    };

    if (transactionId) {
        updateData.paymentTransactionId = transactionId;
    }

    return await Order.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    );
};

/**
 * Get orders by payment status
 * @param {String} paymentStatus - Payment status
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Orders with pagination
 */
const findByPaymentStatus = async (paymentStatus, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        Order.find({ paymentStatus })
            .populate('user', 'mobile profile.name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order.countDocuments({ paymentStatus })
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    create,
    findById,
    findByOrderId,
    findByUser,
    getAll,
    updateById,
    updateStatus,
    updatePaymentStatus,
    findByPaymentStatus
};

