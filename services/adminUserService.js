/**
 * Admin User Service
 * Business logic layer for admin user management
 */

const userRepository = require('../repositories/userRepository');
const orderRepository = require('../repositories/orderRepository');

/**
 * Get all users with filters
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Users with pagination
 */
const getAllUsers = async (filters = {}, page = 1, limit = 10) => {
    try {
        return await userRepository.getAll(filters, page, limit);
    } catch (error) {
        throw new Error(`Failed to get users: ${error.message}`);
    }
};

/**
 * Get user by ID with details
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - User with details
 */
const getUserById = async (userId) => {
    try {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get user orders
        const orders = await orderRepository.findByUser(userId, 1, 10);

        // Get user statistics
        const stats = {
            totalOrders: orders.orders.length,
            totalSpent: orders.orders
                .filter(o => o.paymentStatus === 'paid')
                .reduce((sum, o) => sum + o.total, 0),
            lastOrder: orders.orders[0] || null
        };

        return {
            user: {
                id: user._id,
                mobile: user.mobile,
                profile: user.profile,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            statistics: stats,
            recentOrders: orders.orders.slice(0, 5)
        };
    } catch (error) {
        throw new Error(`Failed to get user: ${error.message}`);
    }
};

/**
 * Update user role
 * @param {String} userId - User ID
 * @param {String} role - New role
 * @returns {Promise<Object>} - Updated user
 */
const updateUserRole = async (userId, role) => {
    try {
        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role');
        }

        return await userRepository.updateById(userId, { role });
    } catch (error) {
        throw new Error(`Failed to update user role: ${error.message}`);
    }
};

/**
 * Update user status
 * @param {String} userId - User ID
 * @param {Boolean} isActive - Active status
 * @returns {Promise<Object>} - Updated user
 */
const updateUserStatus = async (userId, isActive) => {
    try {
        // Note: User model might need isActive field
        // For now, we can use isVerified or add isActive field
        return await userRepository.updateById(userId, { isVerified: isActive });
    } catch (error) {
        throw new Error(`Failed to update user status: ${error.message}`);
    }
};

/**
 * Delete user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Deletion result
 */
const deleteUser = async (userId) => {
    try {
        // Check if user has orders
        const orders = await orderRepository.findByUser(userId, 1, 1);
        if (orders.orders.length > 0) {
            throw new Error('Cannot delete user with existing orders');
        }

        // Note: User repository might need delete method
        // For now, we'll use updateById to mark as deleted or implement soft delete
        return await userRepository.updateById(userId, { isVerified: false });
    } catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
};

/**
 * Search users
 * @param {String} searchTerm - Search term
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Users with pagination
 */
const searchUsers = async (searchTerm, page = 1, limit = 10) => {
    try {
        // Build search query
        const filters = {
            $or: [
                { mobile: { $regex: searchTerm, $options: 'i' } },
                { 'profile.name': { $regex: searchTerm, $options: 'i' } },
                { 'profile.email': { $regex: searchTerm, $options: 'i' } }
            ]
        };
        return await userRepository.getAll(filters, page, limit);
    } catch (error) {
        throw new Error(`Failed to search users: ${error.message}`);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    searchUsers
};

