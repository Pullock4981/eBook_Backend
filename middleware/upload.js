/**
 * Upload Middleware
 * 
 * Multer configuration for file uploads with Cloudinary
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary').cloudinary;

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ebook/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
        ],
    },
});

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
});

// Single image upload middleware
const uploadSingle = upload.single('image');

// Multiple images upload middleware
const uploadMultiple = upload.array('images', 10); // Max 10 images

module.exports = {
    uploadSingle,
    uploadMultiple,
    upload,
};

