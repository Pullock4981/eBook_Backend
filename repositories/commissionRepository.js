/**
 * Commission Repository
 * Data access layer for Commission operations
 */

const Commission = require('../models/Commission');

/**
 * Create new commission
 * @param {Object} commissionData - Commission data
 * @returns {Promise<Object>} - Created commission
 */
const create = async (commissionData) => {
    try {
        const commission = new Commission(commissionData);
        return await commission.save();
    } catch (error) {
        throw new Error(`Failed to create commission: ${error.message}`);
    }
};

/**
 * Find commissions by affiliate
 * @param {String} affiliateId - Affiliate ID
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Commissions with pagination
 */
const findByAffiliate = async (affiliateId, filters = {}, page = 1, limit = 10) => {
    try {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        const query = { affiliate: affiliateId };

        if (filters.status) {
            query.status = filters.status;
        }

        const [commissions, total] = await Promise.all([
            Commission.find(query)
                .populate('order', 'orderId total createdAt')
                .populate('referredUser', 'profile.name profile.email mobile')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Commission.countDocuments(query)
        ]);

        return {
            commissions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        throw new Error(`Failed to find commissions: ${error.message}`);
    }
};

/**
 * Find commission by order
 * @param {String} orderId - Order ID
 * @returns {Promise<Object|null>} - Commission or null
 */
const findByOrder = async (orderId) => {
    try {
        return await Commission.findOne({ order: orderId })
            .populate('affiliate', 'user referralCode')
            .populate('referredUser', 'profile.name');
    } catch (error) {
        throw new Error(`Failed to find commission by order: ${error.message}`);
    }
};

/**
 * Find pending commissions for affiliate
 * @param {String} affiliateId - Affiliate ID
 * @returns {Promise<Array>} - Array of pending commissions
 */
const findPendingByAffiliate = async (affiliateId) => {
    try {
        return await Commission.find({
            affiliate: affiliateId,
            status: 'pending'
        })
            .populate('order', 'orderId total')
            .sort({ createdAt: -1 });
    } catch (error) {
        throw new Error(`Failed to find pending commissions: ${error.message}`);
    }
};

/**
 * Find all commissions with filters (Admin)
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Commissions with pagination
 */
const findAll = async (filters = {}, page = 1, limit = 10) => {
    try {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        const query = {};

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.affiliate) {
            query.affiliate = filters.affiliate;
        }

        const [commissions, total] = await Promise.all([
            Commission.find(query)
                .populate('affiliate', 'user referralCode')
                .populate('order', 'orderId total')
                .populate('referredUser', 'profile.name profile.email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Commission.countDocuments(query)
        ]);

        return {
            commissions,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        throw new Error(`Failed to find commissions: ${error.message}`);
    }
};

/**
 * Update commission status
 * @param {String} commissionId - Commission ID
 * @param {String} status - New status
 * @returns {Promise<Object>} - Updated commission
 */
const updateStatus = async (commissionId, status) => {
    try {
        return await Commission.findByIdAndUpdate(
            commissionId,
            { status },
            { new: true }
        );
    } catch (error) {
        throw new Error(`Failed to update commission status: ${error.message}`);
    }
};

/**
 * Get commission statistics for affiliate
 * @param {String} affiliateId - Affiliate ID
 * @returns {Promise<Object>} - Statistics
 */
const getStatistics = async (affiliateId) => {
    try {
        const commissions = await Commission.find({ affiliate: affiliateId });

        const stats = {
            total: commissions.length,
            totalAmount: commissions.reduce((sum, c) => sum + c.amount, 0),
            pending: commissions.filter(c => c.status === 'pending').length,
            pendingAmount: commissions
                .filter(c => c.status === 'pending')
                .reduce((sum, c) => sum + c.amount, 0),
            paid: commissions.filter(c => c.status === 'paid').length,
            paidAmount: commissions
                .filter(c => c.status === 'paid')
                .reduce((sum, c) => sum + c.amount, 0),
            approved: commissions.filter(c => c.status === 'approved').length,
            approvedAmount: commissions
                .filter(c => c.status === 'approved')
                .reduce((sum, c) => sum + c.amount, 0)
        };

        return stats;
    } catch (error) {
        throw new Error(`Failed to get commission statistics: ${error.message}`);
    }
};

module.exports = {
    create,
    findByAffiliate,
    findByOrder,
    findPendingByAffiliate,
    findAll,
    updateStatus,
    getStatistics
};

