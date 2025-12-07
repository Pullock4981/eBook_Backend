/**
 * Upload Routes
 * 
 * API endpoints for file uploads
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// Admin only routes
router.post(
    '/image',
    authenticate,
    requireAdmin,
    uploadSingle,
    uploadController.uploadSingleImage
);

router.post(
    '/images',
    authenticate,
    requireAdmin,
    uploadMultiple,
    uploadController.uploadMultipleImages
);

module.exports = router;

