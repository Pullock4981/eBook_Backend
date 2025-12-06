/**
 * PDF Service
 * Handles secure PDF serving with watermarking
 */

const fs = require('fs').promises;
const path = require('path');
const { addWatermark, generateWatermarkText } = require('../utils/pdfWatermark');
const eBookAccessRepository = require('../repositories/eBookAccessRepository');

/**
 * Get PDF file path
 * @param {String} digitalFileUrl - Digital file URL or path
 * @returns {String} - File path
 */
const getPDFPath = (digitalFileUrl) => {
    // If it's a full URL, extract path
    if (digitalFileUrl.startsWith('http://') || digitalFileUrl.startsWith('https://')) {
        // For cloud storage, you'd need to download first
        // For now, assume it's a local path or handle cloud URLs separately
        throw new Error('Cloud storage URLs require download first');
    }

    // Assume it's a relative path from uploads directory
    const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
    return path.join(process.cwd(), uploadsDir, digitalFileUrl);
};

/**
 * Serve PDF with watermark
 * @param {Object} access - eBook access record
 * @param {Object} options - Options (watermark type, etc.)
 * @returns {Promise<Buffer>} - Watermarked PDF buffer
 */
const serveWatermarkedPDF = async (access, options = {}) => {
    try {
        const product = access.product;

        if (!product.digitalFile) {
            throw new Error('Product does not have a digital file');
        }

        // Get PDF path
        const pdfPath = getPDFPath(product.digitalFile);

        // Check if file exists
        try {
            await fs.access(pdfPath);
        } catch (error) {
            throw new Error('PDF file not found');
        }

        // Read PDF file
        const pdfBuffer = await fs.readFile(pdfPath);

        // Generate watermark text
        // Ensure user and order are populated
        if (!access.user || !access.order) {
            // Populate if not already populated
            await access.populate('user', 'profile.name profile.email mobile');
            await access.populate('order', 'orderId');
        }

        const user = access.user;
        const order = access.order;
        const userEmail = user?.profile?.email || user?.mobile || 'Unknown';
        const userName = user?.profile?.name || 'User';
        const orderId = order?.orderId || order?._id?.toString() || 'Unknown';

        const watermarkText = generateWatermarkText(userEmail, orderId, userName);

        // Add watermark
        const watermarkedPDF = await addWatermark(pdfBuffer, watermarkText, {
            fontSize: parseInt(process.env.EBOOK_WATERMARK_FONT_SIZE || '12'),
            opacity: parseFloat(process.env.EBOOK_WATERMARK_OPACITY || '0.3'),
            angle: parseInt(process.env.EBOOK_WATERMARK_ANGLE || '-45'),
            spacing: parseInt(process.env.EBOOK_WATERMARK_SPACING || '200')
        });

        return watermarkedPDF;
    } catch (error) {
        throw new Error(`Failed to serve watermarked PDF: ${error.message}`);
    }
};

/**
 * Get PDF metadata
 * @param {String} digitalFileUrl - Digital file URL or path
 * @returns {Promise<Object>} - PDF metadata
 */
const getPDFMetadata = async (digitalFileUrl) => {
    try {
        const pdfPath = getPDFPath(digitalFileUrl);
        const stats = await fs.stat(pdfPath);

        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            path: pdfPath
        };
    } catch (error) {
        throw new Error(`Failed to get PDF metadata: ${error.message}`);
    }
};

/**
 * Check if PDF file exists
 * @param {String} digitalFileUrl - Digital file URL or path
 * @returns {Promise<Boolean>} - True if file exists
 */
const pdfExists = async (digitalFileUrl) => {
    try {
        const pdfPath = getPDFPath(digitalFileUrl);
        await fs.access(pdfPath);
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = {
    serveWatermarkedPDF,
    getPDFMetadata,
    pdfExists,
    getPDFPath
};

