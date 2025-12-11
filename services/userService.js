/**
 * User Service
 * Business logic layer for User operations
 * Handles business rules and data processing
 */

const userRepository = require('../repositories/userRepository');
const addressRepository = require('../repositories/addressRepository');

/**
 * Register a new user (mobile number based)
 * @param {String} mobile - Mobile number
 * @returns {Promise<Object>} - User document
 */
const registerUser = async (mobile) => {
    // Check if user already exists
    const existingUser = await userRepository.findByMobile(mobile);

    if (existingUser) {
        throw new Error('User already registered with this mobile number');
    }

    // Create new user
    const user = await userRepository.create({
        mobile,
        isVerified: false
    });

    return user;
};

/**
 * Get user by mobile number
 * @param {String} mobile - Mobile number
 * @returns {Promise<Object>} - User document
 */
const getUserByMobile = async (mobile) => {
    const user = await userRepository.findByMobile(mobile);

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

/**
 * Get user by ID
 * @param {String|ObjectId} id - User ID
 * @returns {Promise<Object>} - User document
 */
const getUserById = async (id) => {
    // Convert to string if it's an ObjectId
    const idStr = id?.toString ? id.toString() : String(id);

    if (!idStr || idStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    const user = await userRepository.findById(idStr);

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

/**
 * Update user profile
 * @param {String|ObjectId} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} - Updated user document
 */
const updateProfile = async (userId, profileData) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    // Validate user ID
    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    // Check if user exists
    const existingUser = await userRepository.findById(userIdStr);
    if (!existingUser) {
        throw new Error('User not found');
    }

    // Prepare update data
    const updateData = {};

    if (profileData.name !== undefined) {
        updateData['profile.name'] = profileData.name;
    }

    if (profileData.email !== undefined) {
        // Check if email is already taken by another user
        if (profileData.email) {
            const emailUser = await userRepository.findByEmail(profileData.email);
            if (emailUser && emailUser._id.toString() !== userIdStr) {
                throw new Error('Email already registered with another account');
            }
            updateData['profile.email'] = profileData.email.toLowerCase();
        } else {
            updateData['profile.email'] = null;
        }
    }

    if (profileData.avatar !== undefined) {
        updateData['profile.avatar'] = profileData.avatar;
    }

    // Update user
    const updatedUser = await userRepository.updateById(userIdStr, updateData);
    return updatedUser;
};

/**
 * Change user password
 * @param {String} userId - User ID
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Promise<Object>} - Updated user document
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    // Validate user ID
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    // Validate password length
    if (!newPassword || newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters');
    }

    // Get user with password
    const user = await userRepository.findById(userIdStr, true);

    if (!user) {
        throw new Error('User not found');
    }

    // Check if user has a password set
    if (!user.password) {
        throw new Error('Password not set. Please set a password first.');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
    }

    // Update password (will be hashed by pre-save hook)
    await userRepository.updatePassword(userIdStr, newPassword);

    return { message: 'Password changed successfully' };
};

/**
 * Set password for user (first time setup)
 * @param {String} userId - User ID
 * @param {String} password - New password
 * @returns {Promise<Object>} - Success message
 */
const setPassword = async (userId, password) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    // Validate user ID
    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    // Validate password length
    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    // Get user
    const user = await userRepository.findById(userIdStr);

    if (!user) {
        throw new Error('User not found');
    }

    // Check if password already exists
    const userWithPassword = await userRepository.findById(userIdStr, true);
    if (userWithPassword && userWithPassword.password) {
        throw new Error('Password already set. Use change password instead.');
    }

    // Set password (will be hashed by pre-save hook)
    await userRepository.updatePassword(userIdStr, password);

    return { message: 'Password set successfully' };
};

/**
 * Get user addresses
 * @param {String} userId - User ID
 * @returns {Promise<Array>} - Array of addresses
 */
const getUserAddresses = async (userId) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    const addresses = await addressRepository.findByUser(userIdStr);
    return addresses;
};

/**
 * Create new address for user
 * @param {String} userId - User ID
 * @param {Object} addressData - Address data
 * @returns {Promise<Object>} - Created address
 */
const createAddress = async (userId, addressData) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    // Check if user exists
    const user = await userRepository.findById(userIdStr);
    if (!user) {
        throw new Error('User not found');
    }

    // Create address
    const address = await addressRepository.create({
        ...addressData,
        user: userIdStr
    });

    // Add address reference to user
    await userRepository.addAddress(userIdStr, address._id);

    return address;
};

/**
 * Update address
 * @param {String} userId - User ID
 * @param {String} addressId - Address ID
 * @param {Object} addressData - Address data to update
 * @returns {Promise<Object>} - Updated address
 */
const updateAddress = async (userId, addressId, addressData) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);
    const addressIdStr = addressId?.toString ? addressId.toString() : String(addressId);

    if (!userIdStr || userIdStr.length !== 24 || !addressIdStr || addressIdStr.length !== 24) {
        throw new Error('Invalid ID format');
    }

    // Check if address exists and belongs to user
    const address = await addressRepository.findById(addressIdStr);
    if (!address) {
        throw new Error('Address not found');
    }

    if (address.user.toString() !== userIdStr) {
        throw new Error('Address does not belong to this user');
    }

    // Update address
    const updatedAddress = await addressRepository.updateById(addressIdStr, addressData);
    return updatedAddress;
};

/**
 * Delete address
 * @param {String} userId - User ID
 * @param {String} addressId - Address ID
 * @returns {Promise<Object>} - Success message
 */
const deleteAddress = async (userId, addressId) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);
    const addressIdStr = addressId?.toString ? addressId.toString() : String(addressId);

    if (!userIdStr || userIdStr.length !== 24 || !addressIdStr || addressIdStr.length !== 24) {
        throw new Error('Invalid ID format');
    }

    // Check if address exists and belongs to user
    const address = await addressRepository.findById(addressIdStr);
    if (!address) {
        throw new Error('Address not found');
    }

    if (address.user.toString() !== userIdStr) {
        throw new Error('Address does not belong to this user');
    }

    // Soft delete address
    await addressRepository.deleteById(addressIdStr);

    // Remove address reference from user
    await userRepository.removeAddress(userIdStr, addressIdStr);

    return { message: 'Address deleted successfully' };
};

/**
 * Set default address
 * @param {String} userId - User ID
 * @param {String} addressId - Address ID
 * @returns {Promise<Object>} - Updated address
 */
const setDefaultAddress = async (userId, addressId) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);
    const addressIdStr = addressId?.toString ? addressId.toString() : String(addressId);

    if (!userIdStr || userIdStr.length !== 24 || !addressIdStr || addressIdStr.length !== 24) {
        throw new Error('Invalid ID format');
    }

    // Check if address exists and belongs to user
    const address = await addressRepository.findById(addressIdStr);
    if (!address) {
        throw new Error('Address not found');
    }

    if (address.user.toString() !== userIdStr) {
        throw new Error('Address does not belong to this user');
    }

    // Set as default
    const updatedAddress = await addressRepository.setAsDefault(addressIdStr);
    return updatedAddress;
};

/**
 * Get all users (simple list)
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Users with pagination
 */
const getAllUsers = async (page = 1, limit = 50) => {
    try {
        return await userRepository.getAll({}, page, limit);
    } catch (error) {
        throw new Error(`Failed to get users: ${error.message}`);
    }
};

module.exports = {
    registerUser,
    getUserByMobile,
    getUserById,
    updateProfile,
    changePassword,
    setPassword,
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getAllUsers
};

