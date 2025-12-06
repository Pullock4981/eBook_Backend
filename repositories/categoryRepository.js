/**
 * Category Repository
 * Data access layer for Category model
 */

const Category = require('../models/Category');

/**
 * Create a new category
 * @param {Object} data - Category data
 * @returns {Promise<Object>} - Created category document
 */
const create = async (data) => {
    return await Category.create(data);
};

/**
 * Get all categories
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - Category documents
 */
const getAll = async (filters = {}) => {
    const query = { ...filters };

    if (!filters.includeInactive) {
        query.isActive = true;
    }

    return await Category.find(query)
        .populate('parentCategory', 'name slug')
        .sort({ order: 1, createdAt: -1 });
};

/**
 * Get category by ID
 * @param {String} id - Category ID
 * @returns {Promise<Object>} - Category document
 */
const findById = async (id) => {
    return await Category.findById(id)
        .populate('parentCategory', 'name slug');
};

/**
 * Get category by slug
 * @param {String} slug - Category slug
 * @returns {Promise<Object>} - Category document
 */
const findBySlug = async (slug) => {
    return await Category.findOne({ slug })
        .populate('parentCategory', 'name slug');
};

/**
 * Get main categories (no parent)
 * @returns {Promise<Array>} - Main category documents
 */
const getMainCategories = async () => {
    return await Category.find({
        parentCategory: null,
        isActive: true
    }).sort({ order: 1, name: 1 });
};

/**
 * Get subcategories by parent
 * @param {String} parentId - Parent category ID
 * @returns {Promise<Array>} - Subcategory documents
 */
const getSubcategories = async (parentId) => {
    return await Category.find({
        parentCategory: parentId,
        isActive: true
    }).sort({ order: 1, name: 1 });
};

/**
 * Update category by ID
 * @param {String} id - Category ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated category document
 */
const updateById = async (id, data) => {
    return await Category.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');
};

/**
 * Delete category by ID (soft delete)
 * @param {String} id - Category ID
 * @returns {Promise<Object>} - Deleted category document
 */
const deleteById = async (id) => {
    return await Category.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );
};

module.exports = {
    create,
    getAll,
    findById,
    findBySlug,
    getMainCategories,
    getSubcategories,
    updateById,
    deleteById
};

