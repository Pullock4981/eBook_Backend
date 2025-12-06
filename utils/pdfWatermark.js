/**
 * PDF Watermarking Utility
 * Adds dynamic watermarks to PDF files for security
 * Uses pdf-lib for PDF manipulation
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

/**
 * Add watermark to PDF
 * @param {Buffer} pdfBuffer - Original PDF buffer
 * @param {String} watermarkText - Text to watermark (e.g., "user@email.com - OrderID123")
 * @param {Object} options - Watermark options
 * @returns {Promise<Buffer>} - Watermarked PDF buffer
 */
const addWatermark = async (pdfBuffer, watermarkText, options = {}) => {
    try {
        // Default options
        const {
            fontSize = 12,
            opacity = 0.3,
            color = rgb(0.5, 0.5, 0.5), // Gray color
            angle = -45, // Diagonal watermark
            spacing = 200 // Spacing between watermarks
        } = options;

        // Load PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Add watermark to each page
        for (const page of pages) {
            const { width, height } = page.getSize();

            // Calculate watermark positions (diagonal pattern)
            const positions = calculateWatermarkPositions(width, height, spacing);

            // Add watermark at each position
            for (const pos of positions) {
                page.drawText(watermarkText, {
                    x: pos.x,
                    y: pos.y,
                    size: fontSize,
                    font: font,
                    color: color,
                    opacity: opacity,
                    rotate: { angleRadians: angle * Math.PI / 180 }
                });
            }
        }

        // Save and return watermarked PDF
        const watermarkedPdf = await pdfDoc.save();
        return Buffer.from(watermarkedPdf);
    } catch (error) {
        throw new Error(`Failed to add watermark: ${error.message}`);
    }
};

/**
 * Calculate watermark positions for diagonal pattern
 * @param {Number} width - Page width
 * @param {Number} height - Page height
 * @param {Number} spacing - Spacing between watermarks
 * @returns {Array} - Array of {x, y} positions
 */
const calculateWatermarkPositions = (width, height, spacing) => {
    const positions = [];

    // Create diagonal pattern
    for (let x = -width; x < width * 2; x += spacing) {
        for (let y = -height; y < height * 2; y += spacing) {
            positions.push({ x, y });
        }
    }

    return positions;
};

/**
 * Add header/footer watermark
 * Adds watermark at top and bottom of each page
 * @param {Buffer} pdfBuffer - Original PDF buffer
 * @param {String} headerText - Header watermark text
 * @param {String} footerText - Footer watermark text
 * @param {Object} options - Watermark options
 * @returns {Promise<Buffer>} - Watermarked PDF buffer
 */
const addHeaderFooterWatermark = async (pdfBuffer, headerText, footerText, options = {}) => {
    try {
        const {
            fontSize = 10,
            opacity = 0.4,
            color = rgb(0.3, 0.3, 0.3)
        } = options;

        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        for (const page of pages) {
            const { width, height } = page.getSize();

            // Header watermark
            if (headerText) {
                page.drawText(headerText, {
                    x: width / 2 - (headerText.length * fontSize / 4),
                    y: height - 30,
                    size: fontSize,
                    font: font,
                    color: color,
                    opacity: opacity
                });
            }

            // Footer watermark
            if (footerText) {
                page.drawText(footerText, {
                    x: width / 2 - (footerText.length * fontSize / 4),
                    y: 20,
                    size: fontSize,
                    font: font,
                    color: color,
                    opacity: opacity
                });
            }
        }

        const watermarkedPdf = await pdfDoc.save();
        return Buffer.from(watermarkedPdf);
    } catch (error) {
        throw new Error(`Failed to add header/footer watermark: ${error.message}`);
    }
};

/**
 * Generate watermark text from user and order info
 * @param {String} userEmail - User email
 * @param {String} orderId - Order ID
 * @param {String} userName - User name (optional)
 * @returns {String} - Watermark text
 */
const generateWatermarkText = (userEmail, orderId, userName = null) => {
    const parts = [];

    if (userName) {
        parts.push(userName);
    }

    if (userEmail) {
        parts.push(userEmail);
    }

    if (orderId) {
        parts.push(`Order: ${orderId}`);
    }

    // Add timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    parts.push(timestamp);

    return parts.join(' | ');
};

/**
 * Watermark PDF file from path
 * @param {String} filePath - Path to PDF file
 * @param {String} watermarkText - Watermark text
 * @param {String} outputPath - Output file path (optional)
 * @returns {Promise<Buffer>} - Watermarked PDF buffer
 */
const watermarkPDFFile = async (filePath, watermarkText, outputPath = null) => {
    try {
        // Read PDF file
        const pdfBuffer = await fs.readFile(filePath);

        // Add watermark
        const watermarkedBuffer = await addWatermark(pdfBuffer, watermarkText);

        // Save to output path if provided
        if (outputPath) {
            await fs.writeFile(outputPath, watermarkedBuffer);
        }

        return watermarkedBuffer;
    } catch (error) {
        throw new Error(`Failed to watermark PDF file: ${error.message}`);
    }
};

module.exports = {
    addWatermark,
    addHeaderFooterWatermark,
    generateWatermarkText,
    watermarkPDFFile,
    calculateWatermarkPositions
};

