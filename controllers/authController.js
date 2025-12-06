/**
 * Authentication Controller
 * Presentation layer - Handles HTTP requests and responses for authentication
 */

const authService = require('../services/authService');

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
    try {
        const { mobile, name, password } = req.body;
        const result = await authService.register(mobile, name, password);
        res.status(201).json({
            success: true,
            message: result.message,
            data: {
                mobile: result.mobile,
                otpExpiry: result.otpExpiry
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Request OTP for login
 * POST /api/auth/login
 */
exports.requestOTP = async (req, res, next) => {
    try {
        const { mobile } = req.body;
        const result = await authService.requestOTP(mobile);
        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                mobile: result.mobile,
                otpExpiry: result.otpExpiry
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify OTP and login
 * POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res, next) => {
    try {
        const { mobile, otp } = req.body;
        const result = await authService.verifyOTPAndLogin(mobile, otp);
        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                token: result.token,
                user: result.user
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login with password
 * POST /api/auth/login-password
 */
exports.loginWithPassword = async (req, res, next) => {
    try {
        const { mobile, password } = req.body;
        const result = await authService.loginWithPassword(mobile, password);
        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                token: result.token,
                user: result.user
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
exports.resendOTP = async (req, res, next) => {
    try {
        const { mobile } = req.body;
        const result = await authService.resendOTP(mobile);
        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                mobile: result.mobile,
                otpExpiry: result.otpExpiry
            }
        });
    } catch (error) {
        next(error);
    }
};

