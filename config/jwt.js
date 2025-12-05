/**
 * JWT Configuration
 * Token generation and verification utilities
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {String} userId - User ID to encode in token
 * @param {String} expiresIn - Token expiration (default: 7d)
 * @returns {String} - JWT token
 */
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

/**
 * Generate refresh token
 * @param {String} userId - User ID to encode in token
 * @returns {String} - Refresh token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken
};

