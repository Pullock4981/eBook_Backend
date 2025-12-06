/**
 * Category Controller
 * Presentation layer - Handles HTTP requests and responses for categories
 */

const categoryService = require('../services/categoryService');

/**
 * Get all categories
 * GET /api/categories
 */
exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories(req.query);
        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get main categories
 * GET /api/categories/main
 */
exports.getMainCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getMainCategories();
        res.status(200).json({
            success: true,
            message: 'Main categories retrieved successfully',
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get subcategories
 * GET /api/categories/:parentId/subcategories
 */
exports.getSubcategories = async (req, res, next) => {
    try {
        const subcategories = await categoryService.getSubcategories(req.params.parentId);
        res.status(200).json({
            success: true,
            message: 'Subcategories retrieved successfully',
            data: subcategories
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Category retrieved successfully',
            data: category
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create category (Admin only)
 * POST /api/categories
 */
exports.createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update category (Admin only)
 * PUT /api/categories/:id
 */
exports.updateCategory = async (req, res, next) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete category (Admin only)
 * DELETE /api/categories/:id
 */
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await categoryService.deleteCategory(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: category
        });
    } catch (error) {
        next(error);
    }
};

