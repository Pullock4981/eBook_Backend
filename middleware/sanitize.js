/**
 * Input Sanitization Middleware
 * Cleans and sanitizes user input to prevent XSS attacks
 */

/**
 * Sanitize string input
 * Removes HTML tags and trims whitespace
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;

    return str
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, ''); // Remove remaining angle brackets
};

/**
 * Recursively sanitize object
 */
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }

    return obj;
};

/**
 * Middleware to sanitize request body, query, and params
 */
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

module.exports = {
    sanitizeInput,
    sanitizeString,
    sanitizeObject
};

