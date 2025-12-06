/**
 * eBook Access Repository
 * Data access layer for eBook access tracking
 */

const eBookAccess = require('../models/eBookAccess');

/**
 * Create new eBook access record
 * @param {Object} accessData - Access data
 * @returns {Promise<Object>} - Created access record
 */
const create = async (accessData) => {
    try {
        const access = new eBookAccess(accessData);
        return await access.save();
    } catch (error) {
        throw new Error(`Failed to create eBook access: ${error.message}`);
    }
};

/**
 * Find access by token
 * @param {String} token - Access token
 * @returns {Promise<Object|null>} - Access record or null
 */
const findByToken = async (token) => {
    try {
        return await eBookAccess.findOne({ accessToken: token })
            .populate('user', 'profile.name profile.email mobile')
            .populate('order', 'orderId')
            .populate('product', 'title slug');
    } catch (error) {
        throw new Error(`Failed to find eBook access: ${error.message}`);
    }
};

/**
 * Find access by user and product
 * @param {String} userId - User ID
 * @param {String} productId - Product ID
 * @returns {Promise<Object|null>} - Access record or null
 */
const findByUserAndProduct = async (userId, productId) => {
    try {
        return await eBookAccess.findOne({
            user: userId,
            product: productId,
            isActive: true
        })
            .populate('user', 'profile.name profile.email mobile')
            .populate('order', 'orderId')
            .populate('product', 'title slug digitalFile');
    } catch (error) {
        throw new Error(`Failed to find eBook access: ${error.message}`);
    }
};

/**
 * Find all access records for a user
 * @param {String} userId - User ID
 * @returns {Promise<Array>} - Array of access records
 */
const findByUser = async (userId) => {
    try {
        return await eBookAccess.find({ user: userId })
            .populate('order', 'orderId createdAt')
            .populate('product', 'title slug thumbnail')
            .sort({ createdAt: -1 });
    } catch (error) {
        throw new Error(`Failed to find user eBook access: ${error.message}`);
    }
};

/**
 * Find access by order
 * @param {String} orderId - Order ID
 * @returns {Promise<Array>} - Array of access records
 */
const findByOrder = async (orderId) => {
    try {
        return await eBookAccess.find({ order: orderId })
            .populate('product', 'title slug');
    } catch (error) {
        throw new Error(`Failed to find order eBook access: ${error.message}`);
    }
};

/**
 * Update access record
 * @param {String} accessId - Access ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} - Updated access record
 */
const update = async (accessId, updateData) => {
    try {
        return await eBookAccess.findByIdAndUpdate(
            accessId,
            updateData,
            { new: true, runValidators: true }
        );
    } catch (error) {
        throw new Error(`Failed to update eBook access: ${error.message}`);
    }
};

/**
 * Deactivate access
 * @param {String} accessId - Access ID
 * @returns {Promise<Object>} - Updated access record
 */
const deactivate = async (accessId) => {
    try {
        return await eBookAccess.findByIdAndUpdate(
            accessId,
            { isActive: false },
            { new: true }
        );
    } catch (error) {
        throw new Error(`Failed to deactivate eBook access: ${error.message}`);
    }
};

/**
 * Delete expired access records
 * @returns {Promise<Number>} - Number of deleted records
 */
const deleteExpired = async () => {
    try {
        const result = await eBookAccess.deleteMany({
            tokenExpiry: { $lt: new Date() }
        });
        return result.deletedCount;
    } catch (error) {
        throw new Error(`Failed to delete expired access: ${error.message}`);
    }
};

/**
 * Add allowed IP
 * @param {String} accessId - Access ID
 * @param {String} ipAddress - IP address to add
 * @returns {Promise<Object>} - Updated access record
 */
const addAllowedIP = async (accessId, ipAddress) => {
    try {
        return await eBookAccess.findByIdAndUpdate(
            accessId,
            { $addToSet: { allowedIPs: ipAddress } },
            { new: true }
        );
    } catch (error) {
        throw new Error(`Failed to add allowed IP: ${error.message}`);
    }
};

/**
 * Add allowed device
 * @param {String} accessId - Access ID
 * @param {String} deviceFingerprint - Device fingerprint to add
 * @returns {Promise<Object>} - Updated access record
 */
const addAllowedDevice = async (accessId, deviceFingerprint) => {
    try {
        return await eBookAccess.findByIdAndUpdate(
            accessId,
            { $addToSet: { allowedDevices: deviceFingerprint } },
            { new: true }
        );
    } catch (error) {
        throw new Error(`Failed to add allowed device: ${error.message}`);
    }
};

module.exports = {
    create,
    findByToken,
    findByUserAndProduct,
    findByUser,
    findByOrder,
    update,
    deactivate,
    deleteExpired,
    addAllowedIP,
    addAllowedDevice
};

