/**
 * Product Controller
 * Presentation layer - Handles HTTP requests and responses for products
 */

const productService = require('../services/productService');

/**
 * Get all products
 * GET /api/products
 */
exports.getAllProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = req.query;
        const result = await productService.getAllProducts(filters, page, limit, sortBy, sortOrder);

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: result.products,
            pagination: result.pagination
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
        const incrementViews = req.query.views !== 'false'; // Default true
        const product = await productService.getProductById(req.params.id, incrementViews);

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
        const { q: searchText, page = 1, limit = 10 } = req.query;
        const result = await productService.searchProducts(searchText, page, limit);

        res.status(200).json({
            success: true,
            message: 'Search completed successfully',
            data: result.products,
            pagination: result.pagination
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
        const { page = 1, limit = 10 } = req.query;
        const result = await productService.getProductsByCategory(req.params.categoryId, page, limit);

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: result.products,
            pagination: result.pagination
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

