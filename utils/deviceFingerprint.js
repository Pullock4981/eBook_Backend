/**
 * Device Fingerprinting Utility
 * Generates unique device fingerprint for security tracking
 */

const crypto = require('crypto');

/**
 * Generate device fingerprint from request
 * Uses user agent, accept headers, and other browser characteristics
 * @param {Object} req - Express request object
 * @returns {String} - Device fingerprint
 */
const generateFingerprint = (req) => {
    // Collect device characteristics
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const accept = req.headers['accept'] || '';

    // Get IP address
    const ip = getClientIP(req);

    // Combine all characteristics
    const deviceString = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${accept}|${ip}`;

    // Generate hash
    const fingerprint = crypto
        .createHash('sha256')
        .update(deviceString)
        .digest('hex')
        .substring(0, 32); // Use first 32 characters

    return fingerprint;
};

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 * @param {Object} req - Express request object
 * @returns {String} - Client IP address
 */
const getClientIP = (req) => {
    // Check various headers (for proxies/load balancers)
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare

    if (forwarded) {
        // X-Forwarded-For can contain multiple IPs, take the first one
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    // Fallback to connection remote address
    return req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || 'unknown';
};

/**
 * Validate device fingerprint
 * @param {String} storedFingerprint - Stored fingerprint
 * @param {String} currentFingerprint - Current fingerprint
 * @returns {Boolean} - True if fingerprints match
 */
const validateFingerprint = (storedFingerprint, currentFingerprint) => {
    return storedFingerprint === currentFingerprint;
};

module.exports = {
    generateFingerprint,
    getClientIP,
    validateFingerprint
};

