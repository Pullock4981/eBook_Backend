/**
 * Admin Dashboard Controller
 * Presentation layer - Handles HTTP requests and responses for admin dashboard
 */

const adminAnalyticsService = require('../services/adminAnalyticsService');
const adminUserService = require('../services/adminUserService');

/**
 * Get dashboard overview
 * GET /api/admin/dashboard
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const stats = await adminAnalyticsService.getDashboardStats();

        res.status(200).json({
            success: true,
            message: 'Dashboard data retrieved successfully',
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user statistics
 * GET /api/admin/users/stats
 */
exports.getUserStats = async (req, res, next) => {
    try {
        const stats = await adminAnalyticsService.getUserStats();

        res.status(200).json({
            success: true,
            message: 'User statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all users
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const { role, isVerified, search, page = 1, limit = 10 } = req.query;

        const filters = {};
        if (role) filters.role = role;
        if (isVerified !== undefined) filters.isVerified = isVerified === 'true';

        let result;
        if (search) {
            result = await adminUserService.searchUsers(search, page, limit);
        } else {
            result = await adminUserService.getAllUsers(filters, page, limit);
        }

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users: result.users.map(user => ({
                    id: user._id,
                    mobile: user.mobile,
                    profile: user.profile,
                    role: user.role,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt
                })),
                pagination: result.pagination
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by ID
 * GET /api/admin/users/:userId
 */
exports.getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const userData = await adminUserService.getUserById(userId);

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: userData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user role
 * PUT /api/admin/users/:userId/role
 */
exports.updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Role is required'
            });
        }

        const user = await adminUserService.updateUserRole(userId, role);

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: {
                user: {
                    id: user._id,
                    role: user.role
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user status
 * PUT /api/admin/users/:userId/status
 */
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean'
            });
        }

        const user = await adminUserService.updateUserStatus(userId, isActive);

        res.status(200).json({
            success: true,
            message: 'User status updated successfully',
            data: {
                user: {
                    id: user._id,
                    isVerified: user.isVerified
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user
 * DELETE /api/admin/users/:userId
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        await adminUserService.deleteUser(userId);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

