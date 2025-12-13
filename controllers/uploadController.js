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

/**
 * Upload PDF file
 * POST /api/upload/pdf
 */
exports.uploadPDF = async (req, res, next) => {
    try {
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file provided',
            });
        }

        // File is already uploaded by multer middleware
        // Cloudinary returns the result in req.file
        // For raw files (PDFs), multer-storage-cloudinary might return different structure
        console.log('PDF Upload - req.file structure:', JSON.stringify(req.file, null, 2));
        
        const result = {
            public_id: req.file.public_id,
            secure_url: req.file.secure_url || req.file.path || req.file.url,
            url: req.file.url || req.file.path || req.file.secure_url,
            format: req.file.format,
            bytes: req.file.bytes || req.file.size,
            resource_type: req.file.resource_type || 'raw',
        };
        
        // If secure_url and url are both missing, try to construct from public_id
        if (!result.secure_url && !result.url && req.file.public_id) {
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
            result.secure_url = `https://res.cloudinary.com/${cloudName}/raw/upload/${req.file.public_id}`;
            result.url = result.secure_url;
        }
        
        console.log('PDF Upload - Final result:', JSON.stringify(result, null, 2));

        res.status(200).json({
            success: true,
            message: 'PDF uploaded successfully',
            data: result,
        });
    } catch (error) {
        // Provide more specific error messages
        if (error.message && error.message.includes('Cloudinary')) {
            return res.status(500).json({
                success: false,
                message: `Cloudinary upload failed: ${error.message}. Please check your Cloudinary configuration.`,
            });
        }
        next(error);
    }
};

