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

        // Log req.file structure for debugging
        console.log('Image Upload - req.file structure:', JSON.stringify(req.file, null, 2));
        console.log('Image Upload - req.file keys:', Object.keys(req.file || {}));
        console.log('Image Upload - req.file has buffer?', !!req.file.buffer);
        console.log('Image Upload - req.file buffer size:', req.file.buffer ? req.file.buffer.length : 0);

        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
            });
        }

        // With memory storage, we always upload manually to Cloudinary
        // req.file will have: { fieldname, originalname, encoding, mimetype, buffer, size }
        const cloudinary = require('../utils/cloudinary').cloudinary;
        
        let result;
        
        try {
            // Upload to Cloudinary using the buffer
            if (!req.file.buffer) {
                return res.status(400).json({
                    success: false,
                    message: 'File buffer not available',
                });
            }

            console.log('Image Upload - Uploading to Cloudinary...');
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'ebook/products',
                        resource_type: 'image',
                        transformation: [
                            { width: 1000, height: 1000, crop: 'limit' },
                            { quality: 'auto:good' }, // Optimized quality for faster upload
                        ],
                        eager: [], // Don't generate eager transformations
                        eager_async: false, // Disable async transformations
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Image Upload - Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(req.file.buffer);
            });

            result = {
                public_id: uploadResult.public_id,
                secure_url: uploadResult.secure_url,
                url: uploadResult.url,
                width: uploadResult.width,
                height: uploadResult.height,
                format: uploadResult.format,
                bytes: uploadResult.bytes,
            };

            console.log('Image Upload - Upload successful:', result.secure_url);
        } catch (uploadError) {
            console.error('Image Upload - Upload failed:', uploadError);
            return res.status(500).json({
                success: false,
                message: `Failed to upload image to Cloudinary: ${uploadError.message}. Please check Cloudinary configuration.`,
            });
        }

        console.log('Image Upload - Final result:', JSON.stringify(result, null, 2));

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: result,
        });
    } catch (error) {
        console.error('Image Upload Error:', error);
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

        console.log('Multiple Images Upload - req.files count:', req.files.length);
        console.log('Multiple Images Upload - First file structure:', JSON.stringify(req.files[0], null, 2));

        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
            });
        }

        const cloudinary = require('../utils/cloudinary').cloudinary;
        
        // Process files in parallel for faster upload (optimized)
        const uploadPromises = req.files
            .filter(file => file.buffer) // Filter out files without buffer
            .map((file, index) => {
                return new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: 'ebook/products',
                            resource_type: 'image',
                            transformation: [
                                { width: 1000, height: 1000, crop: 'limit' },
                                { quality: 'auto:good' }, // Optimized quality for faster upload
                            ],
                            eager: [], // Don't generate eager transformations
                            eager_async: false, // Disable async transformations
                        },
                        (error, result) => {
                            if (error) {
                                console.error(`Multiple Images Upload - File ${index + 1} error:`, error);
                                reject(error);
                            } else {
                                resolve({
                                    public_id: result.public_id,
                                    secure_url: result.secure_url,
                                    url: result.url,
                                    width: result.width,
                                    height: result.height,
                                    format: result.format,
                                    bytes: result.bytes,
                                });
                            }
                        }
                    ).end(file.buffer);
                });
            });

        // Wait for all uploads to complete (parallel processing)
        const results = await Promise.allSettled(uploadPromises);
        
        // Extract successful uploads
        const successfulResults = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);

        if (successfulResults.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload any images. Please check Cloudinary configuration.',
            });
        }

        console.log('Multiple Images Upload - Final results count:', successfulResults.length);

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            data: successfulResults,
        });
    } catch (error) {
        console.error('Multiple Images Upload Error:', error);
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

        console.log('PDF Upload - req.file structure:', JSON.stringify(req.file, null, 2));
        console.log('PDF Upload - req.file has buffer?', !!req.file.buffer);
        console.log('PDF Upload - req.file buffer size:', req.file.buffer ? req.file.buffer.length : 0);

        // With memory storage, we always upload manually to Cloudinary
        const cloudinary = require('../utils/cloudinary').cloudinary;
        
        let result;
        
        try {
            // Upload to Cloudinary using the buffer
            if (!req.file.buffer) {
                return res.status(400).json({
                    success: false,
                    message: 'File buffer not available',
                });
            }

            console.log('PDF Upload - Uploading to Cloudinary...');
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'ebook/digital-files',
                        resource_type: 'raw', // PDFs are raw files
                    },
                    (error, result) => {
                        if (error) {
                            console.error('PDF Upload - Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(req.file.buffer);
            });

            result = {
                public_id: uploadResult.public_id,
                secure_url: uploadResult.secure_url,
                url: uploadResult.url,
                format: uploadResult.format || 'pdf',
                bytes: uploadResult.bytes,
                resource_type: uploadResult.resource_type || 'raw',
            };

            console.log('PDF Upload - Upload successful:', result.secure_url);
        } catch (uploadError) {
            console.error('PDF Upload - Upload failed:', uploadError);
            return res.status(500).json({
                success: false,
                message: `Failed to upload PDF to Cloudinary: ${uploadError.message}. Please check Cloudinary configuration.`,
            });
        }

        res.status(200).json({
            success: true,
            message: 'PDF uploaded successfully',
            data: result,
        });
    } catch (error) {
        console.error('PDF Upload - Unexpected error:', error);
        next(error);
    }
};

