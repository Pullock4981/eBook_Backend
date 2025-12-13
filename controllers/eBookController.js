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
                        name: access.product.name,
                        slug: access.product.slug,
                        images: access.product.images || [],
                        digitalFile: access.product.digitalFile,
                        fileSize: access.product.fileSize
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
        const user = req.user; // User object from auth middleware

        // Find access for this user and product
        const eBookAccessRepository = require('../repositories/eBookAccessRepository');
        const access = await eBookAccessRepository.findByUserAndProduct(userId, productId);

        // TESTING MODE: Allow admin users to access any PDF without purchase
        // Remove this in production or add environment variable check
        const isAdmin = user && user.role === 'admin';
        const isTestingMode = process.env.NODE_ENV !== 'production' || process.env.ALLOW_TESTING_ACCESS === 'true';

        if (!access || !access.isActive) {
            // If admin or testing mode, allow direct PDF access
            if (isAdmin || isTestingMode) {
                const productRepository = require('../repositories/productRepository');
                const product = await productRepository.findById(productId);
                
                if (product && product.digitalFile) {
                    // Return direct PDF URL for testing (no access token needed)
                    return res.status(200).json({
                        success: true,
                        message: 'eBook access granted (testing mode)',
                        data: {
                            accessToken: 'TESTING_TOKEN', // Dummy token
                            product: {
                                id: product._id,
                                name: product.name,
                                slug: product.slug,
                                digitalFile: product.digitalFile
                            },
                            tokenExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                            lastAccess: new Date(),
                            isTesting: true,
                            directPDFUrl: product.digitalFile // Direct URL for testing
                        }
                    });
                }
            }

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
                    name: access.product.name,
                    slug: access.product.slug,
                    digitalFile: access.product.digitalFile
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

        // Set headers for PDF viewing (inline prevents download prompt)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="ebook.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);

        // Security headers to prevent download and caching
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Prevent embedding in other sites
        res.setHeader('Content-Security-Policy', "frame-ancestors 'self'"); // Additional frame protection
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Prevent PDF download via browser
        res.setHeader('X-Download-Options', 'noopen'); // IE/Edge
        res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

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

