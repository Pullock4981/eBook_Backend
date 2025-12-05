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
 * @param {String} id - User ID
 * @returns {Promise<Object>} - User document
 */
const getUserById = async (id) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    const user = await userRepository.findById(id);

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};

/**
 * Update user profile
 * @param {String} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} - Updated user document
 */
const updateProfile = async (userId, profileData) => {
    // Validate user ID
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    // Check if user exists
    const existingUser = await userRepository.findById(userId);
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
            if (emailUser && emailUser._id.toString() !== userId) {
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
    const updatedUser = await userRepository.updateById(userId, updateData);
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
    const user = await userRepository.findById(userId, true);

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
    await userRepository.updatePassword(userId, newPassword);

    return { message: 'Password changed successfully' };
};

/**
 * Set password for user (first time setup)
 * @param {String} userId - User ID
 * @param {String} password - New password
 * @returns {Promise<Object>} - Success message
 */
const setPassword = async (userId, password) => {
    // Validate user ID
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    // Validate password length
    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    // Get user
    const user = await userRepository.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Check if password already exists
    const userWithPassword = await userRepository.findById(userId, true);
    if (userWithPassword && userWithPassword.password) {
        throw new Error('Password already set. Use change password instead.');
    }

    // Set password (will be hashed by pre-save hook)
    await userRepository.updatePassword(userId, password);

    return { message: 'Password set successfully' };
};

/**
 * Get user addresses
 * @param {String} userId - User ID
 * @returns {Promise<Array>} - Array of addresses
 */
const getUserAddresses = async (userId) => {
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    const addresses = await addressRepository.findByUser(userId);
    return addresses;
};

/**
 * Create new address for user
 * @param {String} userId - User ID
 * @param {Object} addressData - Address data
 * @returns {Promise<Object>} - Created address
 */
const createAddress = async (userId, addressData) => {
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Create address
    const address = await addressRepository.create({
        ...addressData,
        user: userId
    });

    // Add address reference to user
    await userRepository.addAddress(userId, address._id);

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
    if (!userId || userId.length !== 24 || !addressId || addressId.length !== 24) {
        throw new Error('Invalid ID format');
    }

    // Check if address exists and belongs to user
    const address = await addressRepository.findById(addressId);
    if (!address) {
        throw new Error('Address not found');
    }

    if (address.user.toString() !== userId) {
        throw new Error('Address does not belong to this user');
    }

    // Update address
    const updatedAddress = await addressRepository.updateById(addressId, addressData);
    return updatedAddress;
};

/**
 * Delete address
 * @param {String} userId - User ID
 * @param {String} addressId - Address ID
 * @returns {Promise<Object>} - Success message
 */
const deleteAddress = async (userId, addressId) => {
    if (!userId || userId.length !== 24 || !addressId || addressId.length !== 24) {
        throw new Error('Invalid ID format');
    }

    // Check if address exists and belongs to user
    const address = await addressRepository.findById(addressId);
    if (!address) {
        throw new Error('Address not found');
    }

    if (address.user.toString() !== userId) {
        throw new Error('Address does not belong to this user');
    }

    // Soft delete address
    await addressRepository.deleteById(addressId);

    // Remove address reference from user
    await userRepository.removeAddress(userId, addressId);

    return { message: 'Address deleted successfully' };
};

/**
 * Set default address
 * @param {String} userId - User ID
 * @param {String} addressId - Address ID
 * @returns {Promise<Object>} - Updated address
 */
const setDefaultAddress = async (userId, addressId) => {
    if (!userId || userId.length !== 24 || !addressId || addressId.length !== 24) {
        throw new Error('Invalid ID format');
    }

    // Check if address exists and belongs to user
    const address = await addressRepository.findById(addressId);
    if (!address) {
        throw new Error('Address not found');
    }

    if (address.user.toString() !== userId) {
        throw new Error('Address does not belong to this user');
    }

    // Set as default
    const updatedAddress = await addressRepository.setAsDefault(addressId);
    return updatedAddress;
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
    setDefaultAddress
};

