/**
 * Authentication Routes
 * API endpoints for user authentication (mobile-based with OTP)
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate, commonRules } = require('../middleware/validation');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

/**
 * Register new user
 * POST /api/auth/register
 */
router.post(
    '/register',
    authLimiter,
    otpLimiter,
    [
        commonRules.mobile('mobile')
    ],
    validate,
    authController.register
);

/**
 * Request OTP for login (passwordless)
 * POST /api/auth/login
 */
router.post(
    '/login',
    authLimiter,
    otpLimiter,
    [
        commonRules.mobile('mobile')
    ],
    validate,
    authController.requestOTP
);

/**
 * Verify OTP and login
 * POST /api/auth/verify-otp
 */
router.post(
    '/verify-otp',
    authLimiter,
    [
        commonRules.mobile('mobile'),
        commonRules.otp('otp')
    ],
    validate,
    authController.verifyOTP
);

/**
 * Login with password (if password is set)
 * POST /api/auth/login-password
 */
router.post(
    '/login-password',
    authLimiter,
    [
        commonRules.mobile('mobile'),
        commonRules.password('password', 6)
    ],
    validate,
    authController.loginWithPassword
);

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
router.post(
    '/resend-otp',
    authLimiter,
    otpLimiter,
    [
        commonRules.mobile('mobile')
    ],
    validate,
    authController.resendOTP
);

module.exports = router;

