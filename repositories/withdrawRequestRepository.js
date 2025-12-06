/**
 * Withdraw Request Repository
 * Data access layer for WithdrawRequest operations
 */

const WithdrawRequest = require('../models/WithdrawRequest');

/**
 * Create new withdraw request
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} - Created request
 */
const create = async (requestData) => {
    try {
        const request = new WithdrawRequest(requestData);
        return await request.save();
    } catch (error) {
        throw new Error(`Failed to create withdraw request: ${error.message}`);
    }
};

/**
 * Find withdraw requests by affiliate
 * @param {String} affiliateId - Affiliate ID
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Requests with pagination
 */
const findByAffiliate = async (affiliateId, page = 1, limit = 10) => {
    try {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        const [requests, total] = await Promise.all([
            WithdrawRequest.find({ affiliate: affiliateId })
                .populate('reviewedBy', 'profile.name')
                .populate('paidBy', 'profile.name')
                .populate('commissions', 'amount order')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            WithdrawRequest.countDocuments({ affiliate: affiliateId })
        ]);

        return {
            requests,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        throw new Error(`Failed to find withdraw requests: ${error.message}`);
    }
};

/**
 * Find all withdraw requests with filters (Admin)
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Requests with pagination
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

        const [requests, total] = await Promise.all([
            WithdrawRequest.find(query)
                .populate('affiliate', 'user referralCode')
                .populate('reviewedBy', 'profile.name')
                .populate('paidBy', 'profile.name')
                .populate('commissions', 'amount order')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            WithdrawRequest.countDocuments(query)
        ]);

        return {
            requests,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        throw new Error(`Failed to find withdraw requests: ${error.message}`);
    }
};

/**
 * Find withdraw request by ID
 * @param {String} requestId - Request ID
 * @returns {Promise<Object|null>} - Request or null
 */
const findById = async (requestId) => {
    try {
        return await WithdrawRequest.findById(requestId)
            .populate('affiliate', 'user referralCode')
            .populate('reviewedBy', 'profile.name')
            .populate('paidBy', 'profile.name')
            .populate('commissions', 'amount order');
    } catch (error) {
        throw new Error(`Failed to find withdraw request: ${error.message}`);
    }
};

/**
 * Find pending requests
 * @returns {Promise<Array>} - Array of pending requests
 */
const findPending = async () => {
    try {
        return await WithdrawRequest.find({ status: 'pending' })
            .populate('affiliate', 'user referralCode')
            .sort({ createdAt: 1 });
    } catch (error) {
        throw new Error(`Failed to find pending requests: ${error.message}`);
    }
};

/**
 * Update withdraw request
 * @param {String} requestId - Request ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} - Updated request
 */
const update = async (requestId, updateData) => {
    try {
        return await WithdrawRequest.findByIdAndUpdate(
            requestId,
            updateData,
            { new: true, runValidators: true }
        );
    } catch (error) {
        throw new Error(`Failed to update withdraw request: ${error.message}`);
    }
};

module.exports = {
    create,
    findByAffiliate,
    findAll,
    findById,
    findPending,
    update
};

