/**
 * Upload Middleware
 * 
 * Multer configuration for file uploads with Cloudinary
 */

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary').cloudinary;

// Configure Cloudinary Storage for Images
const imageStorage = new CloudinaryStorage({
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

// Configure Cloudinary Storage for PDFs
const pdfStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ebook/digital-files',
        resource_type: 'raw', // PDFs are raw files, not images
        allowed_formats: ['pdf'],
    },
});

// Check if Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️  WARNING: Cloudinary environment variables are not set. File uploads will fail.');
    console.warn('   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
}

// Configure multer for images
// Use memory storage to ensure we have buffer access for manual Cloudinary upload
// This gives us more control and ensures we can handle uploads even if CloudinaryStorage fails
const memoryStorage = multer.memoryStorage();

const imageUpload = multer({
    storage: memoryStorage, // Use memory storage instead of CloudinaryStorage
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

// Configure multer for PDFs
// Use memory storage like images to ensure we have buffer access for manual Cloudinary upload
const pdfUpload = multer({
    storage: memoryStorage, // Use memory storage instead of CloudinaryStorage
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size for PDFs
    },
    fileFilter: (req, file, cb) => {
        // Accept only PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    },
});

// Single image upload middleware
const uploadSingle = imageUpload.single('image');

// Multiple images upload middleware
const uploadMultiple = imageUpload.array('images', 10); // Max 10 images

// PDF upload middleware
const uploadPDF = pdfUpload.single('pdf');

module.exports = {
    uploadSingle,
    uploadMultiple,
    uploadPDF,
    upload: imageUpload,
};

