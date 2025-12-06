/**
 * eBook Controller
 * Presentation layer - Handles HTTP requests and responses for eBook operations
 */

const eBookService = require('../services/eBookService');
const pdfService = require('../services/pdfService');

/**
 * Get user's eBooks
 * GET /api/ebooks
 */
exports.getUserEBooks = async (req, res, next) => {
    try {
        const userId = req.userId;
        const eBooks = await eBookService.getUserEBooks(userId);

        res.status(200).json({
            success: true,
            message: 'eBooks retrieved successfully',
            data: {
                eBooks: eBooks.map(access => ({
                    id: access._id,
                    accessToken: access.accessToken,
                    product: {
                        id: access.product._id,
                        title: access.product.title,
                        slug: access.product.slug,
                        thumbnail: access.product.thumbnail
                    },
                    order: {
                        id: access.order._id,
                        orderId: access.order.orderId
                    },
                    lastAccess: access.lastAccess,
                    accessCount: access.accessCount,
                    tokenExpiry: access.tokenExpiry
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get eBook access token
 * GET /api/ebooks/:productId/access
 */
exports.geteBookAccess = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        // Find access for this user and product
        const eBookAccessRepository = require('../repositories/eBookAccessRepository');
        const access = await eBookAccessRepository.findByUserAndProduct(userId, productId);

        if (!access || !access.isActive) {
            return res.status(404).json({
                success: false,
                message: 'eBook access not found. Please ensure you have purchased this eBook.'
            });
        }

        // Check if token is expired
        if (new Date() > access.tokenExpiry) {
            return res.status(403).json({
                success: false,
                message: 'eBook access has expired'
            });
        }

        res.status(200).json({
            success: true,
            message: 'eBook access retrieved successfully',
            data: {
                accessToken: access.accessToken,
                product: {
                    id: access.product._id,
                    title: access.product.title,
                    slug: access.product.slug
                },
                tokenExpiry: access.tokenExpiry,
                lastAccess: access.lastAccess
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Serve watermarked PDF
 * GET /api/ebooks/view?token=xxx
 * Protected by IP restriction middleware
 */
exports.servePDF = async (req, res, next) => {
    try {
        const access = req.eBookAccess; // Set by checkeBookAccess middleware

        // Get watermarked PDF
        const pdfBuffer = await pdfService.serveWatermarkedPDF(access);

        // Set headers for PDF viewing
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="ebook.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);

        // Security headers to prevent download
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Send PDF
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

/**
 * Get eBook viewer URL
 * GET /api/ebooks/:productId/viewer
 */
exports.getViewerURL = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        // Find access
        const eBookAccessRepository = require('../repositories/eBookAccessRepository');
        const access = await eBookAccessRepository.findByUserAndProduct(userId, productId);

        if (!access || !access.isActive) {
            return res.status(404).json({
                success: false,
                message: 'eBook access not found'
            });
        }

        // Generate viewer URL with access token
        const viewerURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ebook/viewer?token=${access.accessToken}`;

        res.status(200).json({
            success: true,
            message: 'Viewer URL generated successfully',
            data: {
                viewerURL,
                accessToken: access.accessToken,
                tokenExpiry: access.tokenExpiry
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Revoke eBook access
 * DELETE /api/ebooks/:accessId
 */
exports.revokeeBookAccess = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { accessId } = req.params;

        const access = await eBookService.revokeeBookAccess(accessId, userId);

        res.status(200).json({
            success: true,
            message: 'eBook access revoked successfully',
            data: {
                access: {
                    id: access._id,
                    isActive: access.isActive
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

