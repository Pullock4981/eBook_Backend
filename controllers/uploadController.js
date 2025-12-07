/**
 * Upload Controller
 * 
 * Handles file upload requests
 */

const { uploadImage, uploadMultipleImages } = require('../utils/cloudinary');

/**
 * Upload single image
 * POST /api/upload/image
 */
exports.uploadSingleImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }

        // File is already uploaded by multer middleware
        // Cloudinary returns the result in req.file
        const result = {
            public_id: req.file.public_id,
            secure_url: req.file.secure_url,
            url: req.file.url,
            width: req.file.width,
            height: req.file.height,
            format: req.file.format,
            bytes: req.file.bytes,
        };

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload multiple images
 * POST /api/upload/images
 */
exports.uploadMultipleImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided',
            });
        }

        // Files are already uploaded by multer middleware
        const results = req.files.map((file) => ({
            public_id: file.public_id,
            secure_url: file.secure_url,
            url: file.url,
            width: file.width,
            height: file.height,
            format: file.format,
            bytes: file.bytes,
        }));

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            data: results,
        });
    } catch (error) {
        next(error);
    }
};

