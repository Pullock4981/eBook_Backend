/**
 * User Repository
 * Data access layer for User model
 * Handles all database operations for User
 */

const User = require('../models/User');

/**
 * Create a new user
 * @param {Object} data - User data
 * @returns {Promise<Object>} - Created user document
 */
const create = async (data) => {
    return await User.create(data);
};

/**
 * Find user by mobile number
 * @param {String} mobile - Mobile number
 * @param {Boolean} includePassword - Include password in result (default: false)
 * @param {Boolean} includeOTP - Include OTP in result (default: false)
 * @returns {Promise<Object>} - User document
 */
const findByMobile = async (mobile, includePassword = false, includeOTP = false) => {
    let query = User.findOne({ mobile });

    if (includePassword) {
        query = query.select('+password');
    }

    if (includeOTP) {
        query = query.select('+otp');
    }

    return await query;
};

/**
 * Find user by ID
 * @param {String} id - User ID
 * @param {Boolean} includePassword - Include password in result (default: false)
 * @returns {Promise<Object>} - User document
 */
const findById = async (id, includePassword = false) => {
    let query = User.findById(id);

    if (includePassword) {
        query = query.select('+password');
    }

    return await query;
};

/**
 * Find user by email
 * @param {String} email - Email address
 * @returns {Promise<Object>} - User document
 */
const findByEmail = async (email) => {
    return await User.findOne({ 'profile.email': email.toLowerCase() });
};

/**
 * Update user by ID
 * @param {String} id - User ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated user document
 */
const updateById = async (id, data) => {
    return await User.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );
};

/**
 * Update OTP for user
 * @param {String} mobile - Mobile number
 * @param {String} otp - OTP code
 * @param {Date} otpExpiry - OTP expiry date
 * @returns {Promise<Object>} - Updated user document
 */
const updateOTP = async (mobile, otp, otpExpiry) => {
    return await User.findOneAndUpdate(
        { mobile },
        { otp, otpExpiry },
        { new: true, select: '+otp' }
    );
};

/**
 * Verify user (set isVerified to true and clear OTP)
 * @param {String} mobile - Mobile number
 * @returns {Promise<Object>} - Updated user document
 */
const verifyUser = async (mobile) => {
    return await User.findOneAndUpdate(
        { mobile },
        {
            isVerified: true,
            otp: null,
            otpExpiry: null
        },
        { new: true }
    );
};

/**
 * Update user password
 * @param {String} id - User ID
 * @param {String} password - New password (will be hashed by pre-save hook)
 * @returns {Promise<Object>} - Updated user document
 */
const updatePassword = async (id, password) => {
    const user = await User.findById(id).select('+password');
    if (!user) {
        throw new Error('User not found');
    }

    user.password = password;
    return await user.save();
};

/**
 * Update last login timestamp
 * @param {String} id - User ID
 * @returns {Promise<Object>} - Updated user document
 */
const updateLastLogin = async (id) => {
    return await User.findByIdAndUpdate(
        id,
        { lastLogin: new Date() },
        { new: true }
    );
};

/**
 * Get all users with pagination (for admin)
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Users with pagination
 */
const getAll = async (filters = {}, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find(filters)
            .select('-otp -otpExpiry')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments(filters)
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Add address reference to user
 * @param {String} userId - User ID
 * @param {String} addressId - Address ID
 * @returns {Promise<Object>} - Updated user document
 */
const addAddress = async (userId, addressId) => {
    return await User.findByIdAndUpdate(
        userId,
        { $addToSet: { addresses: addressId } },
        { new: true }
    );
};

/**
 * Remove address reference from user
 * @param {String} userId - User ID
 * @param {String} addressId - Address ID
 * @returns {Promise<Object>} - Updated user document
 */
const removeAddress = async (userId, addressId) => {
    return await User.findByIdAndUpdate(
        userId,
        { $pull: { addresses: addressId } },
        { new: true }
    );
};

module.exports = {
    create,
    findByMobile,
    findById,
    findByEmail,
    updateById,
    updateOTP,
    verifyUser,
    updatePassword,
    updateLastLogin,
    getAll,
    addAddress,
    removeAddress
};

