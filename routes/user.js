/**
 * User Routes
 * API endpoints for user profile and address management
 * All routes require authentication
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate, commonRules } = require('../middleware/validation');
const userController = require('../controllers/userController');

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);

// Password routes
router.put(
    '/me/password',
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        commonRules.password('newPassword', 6)
    ],
    validate,
    userController.changePassword
);

router.post(
    '/me/password',
    [
        commonRules.password('password', 6)
    ],
    validate,
    userController.setPassword
);

// Address routes
router.get('/me/addresses', userController.getAddresses);
router.post('/me/addresses', userController.createAddress);
router.put('/me/addresses/:id', userController.updateAddress);
router.delete('/me/addresses/:id', userController.deleteAddress);
router.put('/me/addresses/:id/default', userController.setDefaultAddress);

module.exports = router;

