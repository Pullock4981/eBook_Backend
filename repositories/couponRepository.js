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
    return await Coupon.findById(id);
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

module.exports = {
    create,
    findByCode,
    findById,
    getAll,
    updateById,
    deleteById,
    incrementUsage
};

