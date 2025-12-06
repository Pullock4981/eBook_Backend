/**
 * Request Validation Middleware
 * Uses express-validator to validate request data
 * Returns validation errors in consistent format
 */

const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 * Must be used after express-validator rules
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Format errors for consistent response
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }

    next();
};

/**
 * Validation rules for common fields
 */
const commonRules = {
    // MongoDB ObjectId validation
    objectId: (field = 'id') => {
        const { param, body, query } = require('express-validator');
        const location = field.includes('params') ? param : field.includes('query') ? query : body;
        return location(field)
            .isMongoId()
            .withMessage(`${field} must be a valid MongoDB ObjectId`);
    },

    // Mobile number validation (Bangladesh format: 11 digits starting with 01)
    mobile: (field = 'mobile') => {
        const { body } = require('express-validator');
        return body(field)
            .trim()
            .notEmpty()
            .withMessage('Mobile number is required')
            .isLength({ min: 11, max: 11 })
            .withMessage('Mobile number must be 11 digits')
            .matches(/^01[3-9]\d{8}$/)
            .withMessage('Invalid mobile number format (must be 01XXXXXXXXX)');
    },

    // Email validation
    email: (field = 'email', required = true) => {
        const { body } = require('express-validator');
        let rule = body(field).trim();

        if (required) {
            rule = rule.notEmpty().withMessage('Email is required');
        }

        return rule
            .isEmail()
            .withMessage('Invalid email format')
            .normalizeEmail();
    },

    // Password validation
    password: (field = 'password', minLength = 6) => {
        const { body } = require('express-validator');
        return body(field)
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: minLength })
            .withMessage(`Password must be at least ${minLength} characters`);
    },

    // OTP validation (6 digits)
    otp: (field = 'otp') => {
        const { body } = require('express-validator');
        return body(field)
            .trim()
            .notEmpty()
            .withMessage('OTP is required')
            .isLength({ min: 6, max: 6 })
            .withMessage('OTP must be 6 digits')
            .isNumeric()
            .withMessage('OTP must contain only numbers');
    },

    // Name validation
    name: (field = 'name', required = true) => {
        const { body } = require('express-validator');
        let rule = body(field).trim();

        if (required) {
            rule = rule.notEmpty().withMessage('Name is required');
        }

        return rule
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters');
    }
};

module.exports = {
    validate,
    commonRules
};

