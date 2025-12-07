/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting requests per IP
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Higher limit for development, lower for production
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Very high limit for development
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting for localhost in development
        if (process.env.NODE_ENV !== 'production') {
            const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
            return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip?.includes('127.0.0.1');
        }
        return false;
    },
    // Use memory store (default) - will reset on server restart
    store: undefined
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * OTP request rate limiter
 * 3 OTP requests per hour per IP
 */
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 OTP requests per hour
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Password reset rate limiter
 * 3 requests per hour per IP
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many password reset attempts. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    apiLimiter,
    authLimiter,
    otpLimiter,
    passwordResetLimiter
};

