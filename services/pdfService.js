/**
 * PDF Service
 * Handles secure PDF serving with watermarking
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { addWatermark, generateWatermarkText } = require('../utils/pdfWatermark');
const eBookAccessRepository = require('../repositories/eBookAccessRepository');

/**
 * Download PDF from Cloudinary or URL
 * @param {String} digitalFileUrl - Digital file URL (Cloudinary or external)
 * @returns {Promise<Buffer>} - PDF buffer
 */
const downloadPDF = async (digitalFileUrl) => {
    try {
        // If it's a Cloudinary or external URL, download it
        if (digitalFileUrl.startsWith('http://') || digitalFileUrl.startsWith('https://')) {
            const response = await axios.get(digitalFileUrl, {
                responseType: 'arraybuffer',
                timeout: 30000, // 30 seconds timeout
                headers: {
                    'User-Agent': 'eBook-Server/1.0'
                }
            });
            return Buffer.from(response.data);
        }

        // If it's a local path, read from filesystem
        const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
        const pdfPath = path.join(process.cwd(), uploadsDir, digitalFileUrl);

        // Check if file exists
        try {
            await fs.access(pdfPath);
        } catch (error) {
            throw new Error('PDF file not found locally');
        }

        return await fs.readFile(pdfPath);
    } catch (error) {
        throw new Error(`Failed to download PDF: ${error.message}`);
    }
};

/**
 * Get PDF file path (for local files only)
 * @param {String} digitalFileUrl - Digital file URL or path
 * @returns {String} - File path
 */
const getPDFPath = (digitalFileUrl) => {
    // If it's a full URL, it's not a local path
    if (digitalFileUrl.startsWith('http://') || digitalFileUrl.startsWith('https://')) {
        return null; // Not a local file
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

        // Download PDF (handles both Cloudinary URLs and local files)
        const pdfBuffer = await downloadPDF(product.digitalFile);

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
        // For URLs, download and get size
        if (digitalFileUrl.startsWith('http://') || digitalFileUrl.startsWith('https://')) {
            const buffer = await downloadPDF(digitalFileUrl);
            return {
                size: buffer.length,
                url: digitalFileUrl,
                isCloud: true
            };
        }

        // For local files
        const pdfPath = getPDFPath(digitalFileUrl);
        if (!pdfPath) {
            throw new Error('Invalid file path');
        }

        const stats = await fs.stat(pdfPath);
        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            path: pdfPath,
            isCloud: false
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
        // For URLs, try to download (head request would be better but axios doesn't always support it)
        if (digitalFileUrl.startsWith('http://') || digitalFileUrl.startsWith('https://')) {
            try {
                await axios.head(digitalFileUrl, { timeout: 5000 });
                return true;
            } catch (error) {
                // If HEAD fails, try GET with range
                try {
                    const response = await axios.get(digitalFileUrl, {
                        responseType: 'arraybuffer',
                        timeout: 5000,
                        headers: { 'Range': 'bytes=0-1' }
                    });
                    return response.status === 200 || response.status === 206;
                } catch {
                    return false;
                }
            }
        }

        // For local files
        const pdfPath = getPDFPath(digitalFileUrl);
        if (!pdfPath) {
            return false;
        }

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
    getPDFPath,
    downloadPDF
};

