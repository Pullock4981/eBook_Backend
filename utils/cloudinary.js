/**
 * Cloudinary Configuration
 * 
 * Helper utilities for Cloudinary image upload
 */

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {Buffer|String} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = async (file, options = {}) => {
    try {
        const uploadOptions = {
            folder: options.folder || 'ebook/products',
            resource_type: 'image',
            ...options,
        };

        // If file is a buffer, upload from buffer
        if (Buffer.isBuffer(file)) {
            return new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(uploadOptions, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    })
                    .end(file);
            });
        }

        // If file is a path, upload from path
        const result = await cloudinary.uploader.upload(file, uploadOptions);
        return result;
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Delete result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
};

/**
 * Upload multiple images
 * @param {Array} files - Array of file buffers or paths
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (files, options = {}) => {
    try {
        const uploadPromises = files.map((file) => uploadImage(file, options));
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        throw new Error(`Multiple image upload failed: ${error.message}`);
    }
};

module.exports = {
    cloudinary,
    uploadImage,
    deleteImage,
    uploadMultipleImages,
};

