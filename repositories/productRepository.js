/**
 * Product Repository
 * Data access layer for Product model
 */

const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Create a new product
 * @param {Object} data - Product data
 * @returns {Promise<Object>} - Created product document
 */
const create = async (data) => {
    return await Product.create(data);
};

/**
 * Get all products with filters and pagination
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @param {String} sortBy - Sort field
 * @param {String} sortOrder - Sort order (asc/desc)
 * @returns {Promise<Object>} - Products with pagination
 */
const getAll = async (filters = {}, page = 1, limit = 100, sortBy = 'createdAt', sortOrder = 'desc') => {
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Extract includeInactive flag (not a MongoDB field)
    // Handle both boolean and string 'true' values
    const includeInactive = filters.includeInactive === true || filters.includeInactive === 'true';

    // Build query (exclude includeInactive from MongoDB query)
    const query = { ...filters };
    delete query.includeInactive;

    // Only show active products by default (unless admin requests all)
    if (!includeInactive) {
        query.isActive = true;
    }

    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Product.countDocuments(query)
    ]);

    // Debug log in development
    if (process.env.NODE_ENV !== 'production') {
        console.log(`📦 Repository - Query:`, JSON.stringify(query, null, 2));
        console.log(`📦 Repository - Found ${products.length} products out of ${total} total`);
        console.log(`📦 Repository - Limit: ${limit}, Skip: ${skip}, Page: ${page}`);
        console.log(`📦 Repository - Product names:`, products.map(p => p.name));
    }

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get product by ID
 * @param {String} id - Product ID
 * @returns {Promise<Object>} - Product document
 */
const findById = async (id) => {
    return await Product.findById(id)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug');
};

/**
 * Get product by slug
 * @param {String} slug - Product slug
 * @returns {Promise<Object>} - Product document
 */
const findBySlug = async (slug) => {
    return await Product.findOne({ slug })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug');
};

/**
 * Update product by ID
 * @param {String} id - Product ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated product document
 */
const updateById = async (id, data) => {
    // For updates, we need to handle discountPrice validation carefully
    // The model validator uses this.price which might be the old price
    // So we validate in service layer first, then update
    // We'll run validators but the service layer validation should catch issues first
    return await Product.findByIdAndUpdate(
        id,
        data,
        { 
            new: true, 
            runValidators: true,
            setDefaultsOnInsert: true
        }
    ).populate('category', 'name slug')
        .populate('subcategory', 'name slug');
};

/**
 * Delete product by ID (soft delete)
 * @param {String} id - Product ID
 * @returns {Promise<Object>} - Deleted product document
 */
const deleteById = async (id) => {
    return await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );
};

/**
 * Search products by text
 * @param {String} searchText - Search text
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Products with pagination
 */
const search = async (searchText, page = 1, limit = 100) => {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Product.find({
            $text: { $search: searchText },
            isActive: true
        })
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug')
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(limit),
        Product.countDocuments({
            $text: { $search: searchText },
            isActive: true
        })
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get products by category
 * @param {String} categoryId - Category ID
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Products with pagination
 */
const findByCategory = async (categoryId, page = 1, limit = 100) => {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Product.find({
            category: categoryId,
            isActive: true
        })
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Product.countDocuments({
            category: categoryId,
            isActive: true
        })
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get featured products
 * @param {Number} limit - Number of products
 * @returns {Promise<Array>} - Featured products
 */
const getFeatured = async (limit = 10) => {
    return await Product.find({
        isFeatured: true,
        isActive: true
    })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort({ createdAt: -1 })
        .limit(limit);
};

/**
 * Update product stock
 * @param {String} id - Product ID
 * @param {Number} quantity - Quantity to add/subtract (negative for subtraction)
 * @returns {Promise<Object>} - Updated product document
 */
const updateStock = async (id, quantity) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }

    if (product.type === 'digital') {
        throw new Error('Cannot update stock for digital products');
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
        throw new Error('Insufficient stock');
    }

    product.stock = newStock;
    return await product.save();
};

/**
 * Increment product views
 * @param {String} id - Product ID
 * @returns {Promise<Object>} - Updated product document
 */
const incrementViews = async (id) => {
    return await Product.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
    );
};

/**
 * Get last updated products
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products
 */
const getLastUpdates = async (limit = 3) => {
    return await Product.find({ isActive: true, isLastUpdate: true })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit));
};

/**
 * Get coming soon products
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products
 */
const getComingSoon = async (limit = 3) => {
    return await Product.find({ isActive: true, isComingSoon: true })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort({ releaseDate: 1, createdAt: -1 })
        .limit(parseInt(limit));
};

/**
 * Get popular reader products (sorted by readerViews)
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products
 */
const getPopularReader = async (limit = 3) => {
    return await Product.find({ isActive: true, isPopularReader: true })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort({ readerViews: -1, views: -1 })
        .limit(parseInt(limit));
};

/**
 * Get frequently downloaded products
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products
 */
const getFrequentlyDownloaded = async (limit = 3) => {
    return await Product.find({ isActive: true, type: 'digital' })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort({ downloadCount: -1, sales: -1 })
        .limit(parseInt(limit));
};

/**
 * Get user's favorited products
 * @param {String} userId - User ID
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products
 */
const getFavourited = async (userId, limit = 3) => {
    // Note: This requires a UserFavorite model or similar
    // For now, we'll return products sorted by favoriteCount
    // In future, implement proper user favorites tracking
    return await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort({ favoriteCount: -1, createdAt: -1 })
        .limit(parseInt(limit));
};

/**
 * Get all digital products with PDFs (Admin)
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Products with pagination
 */
const getDigitalProducts = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const query = {
        type: 'digital',
        digitalFile: { $exists: true, $ne: null }
    };

    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug')
            .select('name slug digitalFile fileSize images isActive createdAt updatedAt sales downloadCount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Product.countDocuments(query)
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    create,
    getAll,
    findById,
    findBySlug,
    updateById,
    deleteById,
    search,
    findByCategory,
    getFeatured,
    updateStock,
    incrementViews,
    getLastUpdates,
    getComingSoon,
    getPopularReader,
    getFrequentlyDownloaded,
    getFavourited,
    getDigitalProducts
};

