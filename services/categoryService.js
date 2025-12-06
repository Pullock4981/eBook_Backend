/**
 * Category Service
 * Business logic layer for Category operations
 */

const categoryRepository = require('../repositories/categoryRepository');

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} - Created category
 */
const createCategory = async (categoryData) => {
    // Validate parent category if provided
    if (categoryData.parentCategory) {
        const parent = await categoryRepository.findById(categoryData.parentCategory);
        if (!parent) {
            throw new Error('Parent category not found');
        }
    }

    // Check if category name already exists
    const existing = await categoryRepository.getAll({ name: categoryData.name });
    if (existing.length > 0) {
        throw new Error('Category with this name already exists');
    }

    const category = await categoryRepository.create(categoryData);
    return category;
};

/**
 * Get all categories
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - Categories
 */
const getAllCategories = async (filters = {}) => {
    return await categoryRepository.getAll(filters);
};

/**
 * Get main categories (no parent)
 * @returns {Promise<Array>} - Main categories
 */
const getMainCategories = async () => {
    return await categoryRepository.getMainCategories();
};

/**
 * Get subcategories by parent
 * @param {String} parentId - Parent category ID
 * @returns {Promise<Array>} - Subcategories
 */
const getSubcategories = async (parentId) => {
    if (!parentId || parentId.length !== 24) {
        throw new Error('Invalid parent category ID format');
    }

    const parent = await categoryRepository.findById(parentId);
    if (!parent) {
        throw new Error('Parent category not found');
    }

    return await categoryRepository.getSubcategories(parentId);
};

/**
 * Get category by ID
 * @param {String} id - Category ID
 * @returns {Promise<Object>} - Category document
 */
const getCategoryById = async (id) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid category ID format');
    }

    const category = await categoryRepository.findById(id);
    if (!category) {
        throw new Error('Category not found');
    }

    return category;
};

/**
 * Update category
 * @param {String} id - Category ID
 * @param {Object} categoryData - Update data
 * @returns {Promise<Object>} - Updated category
 */
const updateCategory = async (id, categoryData) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid category ID format');
    }

    const existing = await categoryRepository.findById(id);
    if (!existing) {
        throw new Error('Category not found');
    }

    // Validate parent category if provided
    if (categoryData.parentCategory) {
        if (categoryData.parentCategory === id) {
            throw new Error('Category cannot be its own parent');
        }
        const parent = await categoryRepository.findById(categoryData.parentCategory);
        if (!parent) {
            throw new Error('Parent category not found');
        }
    }

    const updated = await categoryRepository.updateById(id, categoryData);
    return updated;
};

/**
 * Delete category (soft delete)
 * @param {String} id - Category ID
 * @returns {Promise<Object>} - Deleted category
 */
const deleteCategory = async (id) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid category ID format');
    }

    const existing = await categoryRepository.findById(id);
    if (!existing) {
        throw new Error('Category not found');
    }

    const deleted = await categoryRepository.deleteById(id);
    return deleted;
};

module.exports = {
    createCategory,
    getAllCategories,
    getMainCategories,
    getSubcategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};

