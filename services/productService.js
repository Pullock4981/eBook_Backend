/**
 * Product Service
 * Business logic layer for Product operations
 */

const productRepository = require('../repositories/productRepository');
const categoryRepository = require('../repositories/categoryRepository');

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} - Created product
 */
const createProduct = async (productData) => {
    // Validate category exists
    const category = await categoryRepository.findById(productData.category);
    if (!category) {
        throw new Error('Category not found');
    }

    // Validate subcategory if provided
    if (productData.subcategory) {
        const subcategory = await categoryRepository.findById(productData.subcategory);
        if (!subcategory) {
            throw new Error('Subcategory not found');
        }
        if (subcategory.parentCategory?.toString() !== productData.category) {
            throw new Error('Subcategory does not belong to the selected category');
        }
    }

    // Validate digital file for digital products
    if (productData.type === 'digital' && !productData.digitalFile) {
        throw new Error('Digital file is required for digital products');
    }

    // Validate stock for physical products
    if (productData.type === 'physical' && productData.stock === undefined) {
        throw new Error('Stock is required for physical products');
    }

    // Create product
    const product = await productRepository.create(productData);
    return product;
};

/**
 * Get all products with filters
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @param {String} sortBy - Sort field
 * @param {String} sortOrder - Sort order
 * @returns {Promise<Object>} - Products with pagination
 */
const getAllProducts = async (filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') => {
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Build filter object
    const filterObj = {};

    if (filters.type) {
        filterObj.type = filters.type;
    }

    if (filters.category) {
        filterObj.category = filters.category;
    }

    if (filters.subcategory) {
        filterObj.subcategory = filters.subcategory;
    }

    if (filters.tags && filters.tags.length > 0) {
        filterObj.tags = { $in: filters.tags };
    }

    if (filters.minPrice) {
        filterObj.price = { ...filterObj.price, $gte: parseFloat(filters.minPrice) };
    }

    if (filters.maxPrice) {
        filterObj.price = { ...filterObj.price, $lte: parseFloat(filters.maxPrice) };
    }

    if (filters.isFeatured !== undefined) {
        filterObj.isFeatured = filters.isFeatured === 'true';
    }

    if (filters.includeInactive) {
        filterObj.includeInactive = true;
    }

    const result = await productRepository.getAll(filterObj, pageNum, limitNum, sortBy, sortOrder);
    return result;
};

/**
 * Get product by ID
 * @param {String} id - Product ID
 * @param {Boolean} incrementViews - Whether to increment view count
 * @returns {Promise<Object>} - Product document
 */
const getProductById = async (id, incrementViews = false) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid product ID format');
    }

    const product = await productRepository.findById(id);

    if (!product) {
        throw new Error('Product not found');
    }

    if (!product.isActive) {
        throw new Error('Product is not available');
    }

    // Increment views if requested
    if (incrementViews) {
        await productRepository.incrementViews(id);
        product.views += 1;
    }

    return product;
};

/**
 * Get product by slug
 * @param {String} slug - Product slug
 * @param {Boolean} incrementViews - Whether to increment view count
 * @returns {Promise<Object>} - Product document
 */
const getProductBySlug = async (slug, incrementViews = false) => {
    if (!slug) {
        throw new Error('Product slug is required');
    }

    const product = await productRepository.findBySlug(slug);

    if (!product) {
        throw new Error('Product not found');
    }

    if (!product.isActive) {
        throw new Error('Product is not available');
    }

    // Increment views if requested
    if (incrementViews) {
        await productRepository.incrementViews(product._id);
        product.views += 1;
    }

    return product;
};

/**
 * Update product
 * @param {String} id - Product ID
 * @param {Object} productData - Update data
 * @returns {Promise<Object>} - Updated product
 */
const updateProduct = async (id, productData) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid product ID format');
    }

    // Check if product exists
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
        throw new Error('Product not found');
    }

    // Validate category if provided
    if (productData.category) {
        const category = await categoryRepository.findById(productData.category);
        if (!category) {
            throw new Error('Category not found');
        }
    }

    // Validate subcategory if provided
    if (productData.subcategory) {
        const subcategory = await categoryRepository.findById(productData.subcategory);
        if (!subcategory) {
            throw new Error('Subcategory not found');
        }
    }

    // Update product
    const updatedProduct = await productRepository.updateById(id, productData);
    return updatedProduct;
};

/**
 * Delete product (soft delete)
 * @param {String} id - Product ID
 * @returns {Promise<Object>} - Deleted product
 */
const deleteProduct = async (id) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid product ID format');
    }

    const product = await productRepository.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }

    const deletedProduct = await productRepository.deleteById(id);
    return deletedProduct;
};

/**
 * Search products
 * @param {String} searchText - Search text
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Products with pagination
 */
const searchProducts = async (searchText, page = 1, limit = 10) => {
    if (!searchText || searchText.trim().length === 0) {
        throw new Error('Search text is required');
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await productRepository.search(searchText.trim(), pageNum, limitNum);
    return result;
};

/**
 * Get products by category
 * @param {String} categoryId - Category ID
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Products with pagination
 */
const getProductsByCategory = async (categoryId, page = 1, limit = 10) => {
    if (!categoryId || categoryId.length !== 24) {
        throw new Error('Invalid category ID format');
    }

    const category = await categoryRepository.findById(categoryId);
    if (!category) {
        throw new Error('Category not found');
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await productRepository.findByCategory(categoryId, pageNum, limitNum);
    return result;
};

/**
 * Get featured products
 * @param {Number} limit - Number of products
 * @returns {Promise<Array>} - Featured products
 */
const getFeaturedProducts = async (limit = 10) => {
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    return await productRepository.getFeatured(limitNum);
};

/**
 * Update product stock
 * @param {String} id - Product ID
 * @param {Number} quantity - Quantity to add/subtract
 * @returns {Promise<Object>} - Updated product
 */
const updateProductStock = async (id, quantity) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid product ID format');
    }

    return await productRepository.updateStock(id, quantity);
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductBySlug,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByCategory,
    getFeaturedProducts,
    updateProductStock
};

