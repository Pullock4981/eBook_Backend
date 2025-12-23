/**
 * Product Controller
 * Presentation layer - Handles HTTP requests and responses for products
 */

const productService = require('../services/productService');
const axios = require('axios');

/**
 * Get all products
 * GET /api/products
 */
exports.getAllProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 8, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = req.query;

        // Remove sortBy and sortOrder from filters if they exist
        const cleanFilters = { ...filters };
        delete cleanFilters.sortBy;
        delete cleanFilters.sortOrder;

        // Default to 8 items per page
        const finalLimit = parseInt(limit) || 8;

        const result = await productService.getAllProducts(cleanFilters, page, finalLimit, sortBy, sortOrder);

        // Ensure we have products array
        const products = Array.isArray(result.products) ? result.products : [];
        const backendPagination = result.pagination || {
            page: parseInt(page) || 1,
            limit: finalLimit,
            total: products.length,
            pages: 1
        };

        // Transform pagination to match frontend format
        const pagination = {
            currentPage: backendPagination.page || parseInt(page) || 1,
            totalPages: backendPagination.pages || Math.ceil((backendPagination.total || products.length) / finalLimit) || 1,
            totalItems: backendPagination.total || products.length,
            itemsPerPage: backendPagination.limit || finalLimit
        };

        // Debug log in development
        if (process.env.NODE_ENV !== 'production') {
            console.log(`📦 Products API - Fetched ${products.length} products out of ${pagination.totalItems}`);
            console.log(`📦 Limit used: ${finalLimit}, Page: ${page}`);
            console.log(`📦 Pagination:`, pagination);
            console.log(`📦 Product names:`, products.map(p => p.name));
            console.log(`📦 All product IDs:`, products.map(p => p._id));
        }

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: products,
            pagination: pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
exports.getProductById = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const incrementViews = req.query.views !== 'false'; // Default true

        // Debug log in development
        if (process.env.NODE_ENV !== 'production') {
            console.log(`📦 Controller - getProductById - ID: "${productId}" (length: ${productId.length})`);
            console.log(`📦 Controller - getProductById - Increment views: ${incrementViews}`);
        }

        const product = await productService.getProductById(productId, incrementViews);

        // Debug log in development
        if (process.env.NODE_ENV !== 'production') {
            console.log(`📦 Controller - getProductById - Product retrieved:`, product ? 'Yes' : 'No');
        }

        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully',
            data: product
        });
    } catch (error) {
        // Debug log in development
        if (process.env.NODE_ENV !== 'production') {
            console.error(`❌ Controller - getProductById - Error:`, error.message);
        }
        next(error);
    }
};

/**
 * Get product by slug
 * GET /api/products/slug/:slug
 */
exports.getProductBySlug = async (req, res, next) => {
    try {
        const incrementViews = req.query.views !== 'false'; // Default true
        const product = await productService.getProductBySlug(req.params.slug, incrementViews);

        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create product (Admin only)
 * POST /api/products
 */
exports.createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update product (Admin only)
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete product (Admin only)
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Search products
 * GET /api/products/search?q=searchText
 */
exports.searchProducts = async (req, res, next) => {
    try {
        const { q: searchText, page = 1, limit = 8 } = req.query;
        const finalLimit = parseInt(limit) || 8;
        const result = await productService.searchProducts(searchText, page, finalLimit);

        const backendPagination = result.pagination || {
            page: parseInt(page) || 1,
            limit: finalLimit,
            total: result.products?.length || 0,
            pages: 1
        };

        // Transform pagination to match frontend format
        const pagination = {
            currentPage: backendPagination.page || parseInt(page) || 1,
            totalPages: backendPagination.pages || Math.ceil((backendPagination.total || 0) / finalLimit) || 1,
            totalItems: backendPagination.total || result.products?.length || 0,
            itemsPerPage: backendPagination.limit || finalLimit
        };

        res.status(200).json({
            success: true,
            message: 'Search completed successfully',
            data: result.products || [],
            pagination: pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all digital products with PDFs (Admin only)
 * GET /api/products/admin/digital
 */
exports.getDigitalProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const finalLimit = parseInt(limit) || 20;

        const result = await productService.getDigitalProducts(page, finalLimit);

        const backendPagination = result.pagination || {
            page: parseInt(page) || 1,
            limit: finalLimit,
            total: result.products?.length || 0,
            pages: 1
        };

        const pagination = {
            currentPage: backendPagination.page || parseInt(page) || 1,
            totalPages: backendPagination.pages || Math.ceil((backendPagination.total || 0) / finalLimit) || 1,
            totalItems: backendPagination.total || result.products?.length || 0,
            itemsPerPage: backendPagination.limit || finalLimit
        };

        res.status(200).json({
            success: true,
            message: 'Digital products retrieved successfully',
            data: result.products || [],
            pagination: pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get products by category
 * GET /api/products/category/:categoryId
 */
exports.getProductsByCategory = async (req, res, next) => {
    try {
        const { page = 1, limit = 8 } = req.query;
        const finalLimit = parseInt(limit) || 8;
        const result = await productService.getProductsByCategory(req.params.categoryId, page, finalLimit);

        const backendPagination = result.pagination || {
            page: parseInt(page) || 1,
            limit: finalLimit,
            total: result.products?.length || 0,
            pages: 1
        };

        // Transform pagination to match frontend format
        const pagination = {
            currentPage: backendPagination.page || parseInt(page) || 1,
            totalPages: backendPagination.pages || Math.ceil((backendPagination.total || 0) / finalLimit) || 1,
            totalItems: backendPagination.total || result.products?.length || 0,
            itemsPerPage: backendPagination.limit || finalLimit
        };

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: result.products || [],
            pagination: pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get last updated products for home page
 * GET /api/products/sections/last-updates
 */
exports.getLastUpdates = async (req, res, next) => {
    try {
        const { limit = 3 } = req.query;
        const products = await productService.getLastUpdates(parseInt(limit));
        res.status(200).json({
            success: true,
            message: 'Last updated products retrieved successfully',
            data: products
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get coming soon products for home page
 * GET /api/products/sections/coming-soon
 */
exports.getComingSoon = async (req, res, next) => {
    try {
        const { limit = 3 } = req.query;
        const products = await productService.getComingSoon(parseInt(limit));
        res.status(200).json({
            success: true,
            message: 'Coming soon products retrieved successfully',
            data: products
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get popular reader products for home page
 * GET /api/products/sections/popular-reader
 */
exports.getPopularReader = async (req, res, next) => {
    try {
        const { limit = 3 } = req.query;
        const products = await productService.getPopularReader(parseInt(limit));
        res.status(200).json({
            success: true,
            message: 'Popular reader products retrieved successfully',
            data: products
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get frequently downloaded products for home page
 * GET /api/products/sections/frequently-downloaded
 */
exports.getFrequentlyDownloaded = async (req, res, next) => {
    try {
        const { limit = 3 } = req.query;
        const products = await productService.getFrequentlyDownloaded(parseInt(limit));
        res.status(200).json({
            success: true,
            message: 'Frequently downloaded products retrieved successfully',
            data: products
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get most viewed/clicked products for home page (Favourited section)
 * GET /api/products/sections/favourited
 */
exports.getFavourited = async (req, res, next) => {
    try {
        const { limit = 3 } = req.query;
        const products = await productService.getFavourited(parseInt(limit));
        res.status(200).json({
            success: true,
            message: 'Most viewed products retrieved successfully',
            data: products
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get newly added products for home page
 * GET /api/products/sections/new-added
 */
exports.getNewAdded = async (req, res, next) => {
    try {
        const { limit = 3 } = req.query;
        const products = await productService.getNewAdded(parseInt(limit));
        res.status(200).json({
            success: true,
            message: 'Newly added products retrieved successfully',
            data: products
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get featured products
 * GET /api/products/featured
 */
exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const products = await productService.getFeaturedProducts(limit);

        res.status(200).json({
            success: true,
            message: 'Featured products retrieved successfully',
            data: products
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Proxy PDF file to avoid CORS issues
 * GET /api/products/:id/pdf-proxy
 */
exports.proxyPDF = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId; // May be undefined if not authenticated

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Get product - use repository directly to avoid isActive check
        const productRepository = require('../repositories/productRepository');
        let product;
        try {
            product = await productRepository.findById(id);
        } catch (error) {
            console.error('Error fetching product:', error.message);
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.digitalFile) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found for this product'
            });
        }

        // NO ACCESS CHECKS - Direct PDF access from Cloudinary
        const pdfURL = product.digitalFile;
        console.log('Proxying PDF:', pdfURL);

        // If it's an external URL, proxy it through the backend
        if (pdfURL.startsWith('http://') || pdfURL.startsWith('https://')) {
            try {
                const { cloudinary } = require('../utils/cloudinary');

                // Helper: Robust Cloudinary Meta Extraction
                const getCloudinaryMeta = (url) => {
                    if (!url.includes('cloudinary.com')) return null;
                    const urlParts = url.split('/');
                    const rIndex = urlParts.findIndex(p => ['raw', 'image', 'video'].includes(p));
                    if (rIndex === -1) return null;

                    const resourceType = urlParts[rIndex];
                    const type = urlParts[rIndex + 1];

                    // Extract parts after type, skipping version (v123456) and transformations
                    let idStartIndex = rIndex + 2;
                    while (idStartIndex < urlParts.length) {
                        const part = urlParts[idStartIndex];
                        // If it's a version (v followed by digits) or contains transform markers (comma, etc), skip it
                        if (/^v\d+$/.test(part) || part.includes(',') || part.includes('_')) {
                            idStartIndex++;
                        } else {
                            break;
                        }
                    }

                    const remaining = urlParts.slice(idStartIndex).join('/');
                    const fullPath = decodeURIComponent(remaining);

                    // For image type, the publicId is usually without extension
                    // For raw type, the publicId MUST include the extension
                    let publicId = fullPath;
                    let format = '';

                    if (resourceType === 'image') {
                        const dotIndex = fullPath.lastIndexOf('.');
                        if (dotIndex !== -1) {
                            publicId = fullPath.substring(0, dotIndex);
                            format = fullPath.substring(dotIndex + 1);
                        }
                    }

                    return { resourceType, type, publicId, format };
                };

                const performFetch = async (url) => {
                    console.log('📦 Proxy - Fetching URL:', url);
                    return await axios.get(url, {
                        responseType: 'arraybuffer',
                        timeout: 120000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'application/pdf,*/*'
                        }
                    });
                };

                let response;
                try {
                    // Strategy 1: Attempt Direct Fetch
                    response = await performFetch(pdfURL);
                } catch (firstError) {
                    const status = firstError.response?.status;
                    console.log(`📦 Proxy - Initial fetch failed with ${status}.`);

                    const meta = getCloudinaryMeta(pdfURL);
                    if (meta && (status === 401 || status === 403 || status === 404)) {
                        try {
                            console.log(`📦 Proxy - Attempting Signed Fallback for [${meta.resourceType}] ${meta.publicId}`);
                            // Strategy 2: Official Signed URL
                            const signedURL = cloudinary.utils.private_download_url(meta.publicId, meta.format, {
                                resource_type: meta.resourceType,
                                type: meta.type,
                                expires_at: Math.floor(Date.now() / 1000) + 3600
                            });
                            response = await performFetch(signedURL);
                        } catch (secondError) {
                            console.error('❌ Proxy - Signed Fallback also failed.');
                            throw firstError;
                        }
                    } else {
                        throw firstError;
                    }
                }

                const pdfBuffer = Buffer.from(response.data);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'inline; filename="ebook.pdf"');
                res.setHeader('Content-Length', pdfBuffer.length);
                res.setHeader('Cache-Control', 'public, max-age=3600');
                return res.send(pdfBuffer);

            } catch (error) {
                console.error('Error proxying PDF:', error.message);
                const statusCode = error.response?.status || 500;
                return res.status(statusCode).json({
                    success: false,
                    message: `Failed to load PDF: Request failed with status code ${statusCode}`
                });
            }
        } else {
            return res.status(404).json({ success: false, message: 'Invalid external URL' });
        }
    } catch (error) {
        console.error('Unexpected error in proxyPDF:', error);
        next(error);
    }
};

