/**
 * Address Repository
 * Data access layer for Address model
 * Handles all database operations for Address
 */

const Address = require('../models/Address');

/**
 * Create a new address
 * @param {Object} data - Address data
 * @returns {Promise<Object>} - Created address document
 */
const create = async (data) => {
    return await Address.create(data);
};

/**
 * Get address by ID
 * @param {String} id - Address ID
 * @returns {Promise<Object>} - Address document
 */
const findById = async (id) => {
    return await Address.findById(id);
};

/**
 * Get all addresses for a user
 * @param {String} userId - User ID
 * @returns {Promise<Array>} - Array of address documents
 */
const findByUser = async (userId) => {
    return await Address.find({ user: userId, isActive: true })
        .sort({ isDefault: -1, createdAt: -1 });
};

/**
 * Get default address for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Default address document
 */
const findDefaultByUser = async (userId) => {
    return await Address.findOne({ user: userId, isDefault: true, isActive: true });
};

/**
 * Update address by ID
 * @param {String} id - Address ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated address document
 */
const updateById = async (id, data) => {
    // If setting as default, unset other defaults for this user
    if (data.isDefault) {
        const address = await Address.findById(id);
        if (address) {
            await Address.updateMany(
                { user: address.user, _id: { $ne: id } },
                { $set: { isDefault: false } }
            );
        }
    }

    return await Address.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );
};

/**
 * Delete address by ID (soft delete)
 * @param {String} id - Address ID
 * @returns {Promise<Object>} - Deleted address document
 */
const deleteById = async (id) => {
    return await Address.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );
};

/**
 * Set address as default
 * @param {String} id - Address ID
 * @returns {Promise<Object>} - Updated address document
 */
const setAsDefault = async (id) => {
    const address = await Address.findById(id);
    if (!address) {
        throw new Error('Address not found');
    }

    // Unset other defaults for this user
    await Address.updateMany(
        { user: address.user, _id: { $ne: id } },
        { $set: { isDefault: false } }
    );

    // Set this as default
    return await Address.findByIdAndUpdate(
        id,
        { isDefault: true },
        { new: true }
    );
};

module.exports = {
    create,
    findById,
    findByUser,
    findDefaultByUser,
    updateById,
    deleteById,
    setAsDefault
};

