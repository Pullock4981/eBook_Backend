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
                            { quality: 'auto' },
                        ],
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
        const results = [];

        // Process each file - with memory storage, we always upload manually
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            
            if (!file.buffer) {
                console.error(`Multiple Images Upload - File ${i + 1}: No buffer available`);
                continue;
            }

            try {
                console.log(`Multiple Images Upload - File ${i + 1}: Uploading to Cloudinary...`);
                const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: 'ebook/products',
                            resource_type: 'image',
                            transformation: [
                                { width: 1000, height: 1000, crop: 'limit' },
                                { quality: 'auto' },
                            ],
                        },
                        (error, result) => {
                            if (error) {
                                console.error(`Multiple Images Upload - File ${i + 1} error:`, error);
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    ).end(file.buffer);
                });

                const result = {
                    public_id: uploadResult.public_id,
                    secure_url: uploadResult.secure_url,
                    url: uploadResult.url,
                    width: uploadResult.width,
                    height: uploadResult.height,
                    format: uploadResult.format,
                    bytes: uploadResult.bytes,
                };

                console.log(`Multiple Images Upload - File ${i + 1}: Upload successful`);
                results.push(result);
            } catch (uploadError) {
                console.error(`Multiple Images Upload - File ${i + 1}: Upload failed:`, uploadError);
                // Continue with other files even if one fails
            }
        }

        if (results.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload any images. Please check Cloudinary configuration.',
            });
        }

        console.log('Multiple Images Upload - Final results count:', results.length);

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            data: results,
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

