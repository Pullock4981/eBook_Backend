/**
 * Coupon Repository
 * Data access layer for Coupon model
 */

const Coupon = require('../models/Coupon');

/**
 * Create a new coupon
 * @param {Object} data - Coupon data
 * @returns {Promise<Object>} - Created coupon document
 */
const create = async (data) => {
    return await Coupon.create(data);
};

/**
 * Find coupon by code
 * @param {String} code - Coupon code
 * @returns {Promise<Object>} - Coupon document
 */
const findByCode = async (code) => {
    return await Coupon.findOne({ code: code.toUpperCase() });
};

/**
 * Find coupon by ID
 * @param {String} id - Coupon ID
 * @returns {Promise<Object>} - Coupon document
 */
const findById = async (id) => {
    return await Coupon.findById(id).populate('affiliate', 'referralCode status commissionRate');
};

/**
 * Get all coupons
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Coupons with pagination
 */
const getAll = async (filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const query = { ...filters };
    if (!filters.includeInactive) {
        query.isActive = true;
    }

    const [coupons, total] = await Promise.all([
        Coupon.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Coupon.countDocuments(query)
    ]);

    return {
        coupons,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Update coupon by ID
 * @param {String} id - Coupon ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated coupon document
 */
const updateById = async (id, data) => {
    return await Coupon.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );
};

/**
 * Delete coupon by ID (soft delete)
 * @param {String} id - Coupon ID
 * @returns {Promise<Object>} - Deleted coupon document
 */
const deleteById = async (id) => {
    return await Coupon.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );
};

/**
 * Increment coupon usage
 * @param {String} id - Coupon ID
 * @returns {Promise<Object>} - Updated coupon document
 */
const incrementUsage = async (id) => {
    return await Coupon.findByIdAndUpdate(
        id,
        { $inc: { usedCount: 1 } },
        { new: true }
    );
};

/**
 * Find active coupons for public display
 * @param {Number} limit - Maximum number of coupons to return
 * @returns {Promise<Array>} - Active coupon documents
 */
const findActive = async (limit = 5) => {
    const now = new Date();
    const coupons = await Coupon.find({
        isActive: true,
        $or: [
            { expiryDate: null },
            { expiryDate: { $gt: now } }
        ]
    })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

    // Filter coupons where usedCount < usageLimit
    return coupons.filter(coupon => (coupon.usedCount || 0) < coupon.usageLimit);
};

/**
 * Auto-disable expired coupons
 * @param {Date} now - Current date
 * @returns {Promise<Object>} - Update result
 */
const updateExpiredCoupons = async (now) => {
    return await Coupon.updateMany(
        {
            isActive: true,
            expiryDate: { $exists: true, $ne: null, $lt: now }
        },
        {
            $set: { isActive: false }
        }
    );
};

/**
 * Find coupons by affiliate ID
 * @param {String} affiliateId - Affiliate ID
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Coupons with pagination
 */
/**
 * Find pending affiliate coupons (for admin)
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Coupons with pagination
 */
const findPendingAffiliateCoupons = async (filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const query = {
        affiliate: { $exists: true, $ne: null },
        approvalStatus: 'pending',
        ...filters // Apply custom filters (like specific affiliate ID) after base query
    };

    const [coupons, total] = await Promise.all([
        Coupon.find(query)
            .populate('affiliate', 'referralCode status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Coupon.countDocuments(query)
    ]);

    return {
        coupons,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
        }
    };
};

const findByAffiliate = async (affiliateId, filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const query = { affiliate: affiliateId, ...filters };

    const [coupons, total] = await Promise.all([
        Coupon.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Coupon.countDocuments(query)
    ]);

    return {
        coupons,
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
    findByCode,
    findById,
    getAll,
    updateById,
    deleteById,
    incrementUsage,
    findActive,
    updateExpiredCoupons,
    findByAffiliate,
    findPendingAffiliateCoupons
};

