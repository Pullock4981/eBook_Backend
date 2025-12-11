/**
 * User Controller
 * Presentation layer - Handles HTTP requests and responses for user operations
 * Routes requests to service layer
 */

const userService = require('../services/userService');

/**
 * Get current user profile
 * GET /api/users/me
 */
exports.getProfile = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.userId);
        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 * PUT /api/users/me
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const updatedUser = await userService.updateProfile(req.userId, req.body);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change user password
 * PUT /api/users/me/password
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await userService.changePassword(req.userId, currentPassword, newPassword);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Set password (first time)
 * POST /api/users/me/password
 */
exports.setPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const result = await userService.setPassword(req.userId, password);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user addresses
 * GET /api/users/me/addresses
 */
exports.getAddresses = async (req, res, next) => {
    try {
        const addresses = await userService.getUserAddresses(req.userId);
        res.status(200).json({
            success: true,
            message: 'Addresses retrieved successfully',
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new address
 * POST /api/users/me/addresses
 */
exports.createAddress = async (req, res, next) => {
    try {
        const address = await userService.createAddress(req.userId, req.body);
        res.status(201).json({
            success: true,
            message: 'Address created successfully',
            data: address
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update address
 * PUT /api/users/me/addresses/:id
 */
exports.updateAddress = async (req, res, next) => {
    try {
        const address = await userService.updateAddress(req.userId, req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: address
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete address
 * DELETE /api/users/me/addresses/:id
 */
exports.deleteAddress = async (req, res, next) => {
    try {
        const result = await userService.deleteAddress(req.userId, req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Set default address
 * PUT /api/users/me/addresses/:id/default
 */
exports.setDefaultAddress = async (req, res, next) => {
    try {
        const address = await userService.setDefaultAddress(req.userId, req.params.id);
        res.status(200).json({
            success: true,
            message: 'Default address updated successfully',
            data: address
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all users
 * GET /api/users/all
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const result = await userService.getAllUsers(parseInt(page), parseInt(limit));

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users: result.users,
                pagination: result.pagination
            }
        });
    } catch (error) {
        next(error);
    }
};

