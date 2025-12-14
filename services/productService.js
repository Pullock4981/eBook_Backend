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

    // Validate discount price - must be less than regular price
    if (productData.discountPrice !== undefined && productData.discountPrice !== null) {
        if (productData.discountPrice >= productData.price) {
            throw new Error('Discount price must be less than regular price');
        }
        if (productData.discountPrice < 0) {
            throw new Error('Discount price cannot be negative');
        }
    }

    // Log PDF information for digital products
    if (productData.type === 'digital' && productData.digitalFile) {
        console.log('📄 Creating digital product with PDF:');
        console.log('   - PDF URL:', productData.digitalFile);
        console.log('   - File Size:', productData.fileSize ? `${(productData.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Not specified');
    }

    // Create product
    const product = await productRepository.create(productData);

    // Verify PDF was saved
    if (productData.type === 'digital' && product.digitalFile) {
        console.log('✅ PDF saved successfully in database');
        console.log('   - Stored URL:', product.digitalFile);
    }

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
const getAllProducts = async (filters = {}, page = 1, limit = 8, sortBy = 'createdAt', sortOrder = 'desc') => {
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 8);

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
        // Handle both boolean and string values
        if (filters.isFeatured === true || filters.isFeatured === 'true') {
            filterObj.isFeatured = true;
        } else if (filters.isFeatured === false || filters.isFeatured === 'false') {
            filterObj.isFeatured = false;
        }
    }

    // Handle includeInactive flag (for admin to see all products)
    if (filters.includeInactive === true || filters.includeInactive === 'true') {
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
    if (!id) {
        throw new Error('Product ID is required');
    }

    // Convert to string and trim whitespace
    const productId = String(id).trim();

    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    if (!isValidObjectId) {
        // Log for debugging
        if (process.env.NODE_ENV !== 'production') {
            console.log(`⚠️ Invalid product ID format: "${productId}" (length: ${productId.length})`);
        }
        throw new Error('Invalid product ID format');
    }

    // Debug log in development
    if (process.env.NODE_ENV !== 'production') {
        console.log(`🔍 Service - getProductById - ID: "${productId}" (length: ${productId.length})`);
    }

    const product = await productRepository.findById(productId);

    // Debug log in development
    if (process.env.NODE_ENV !== 'production') {
        console.log(`🔍 Service - getProductById - Product found:`, product ? 'Yes' : 'No');
        if (product) {
            console.log(`🔍 Service - getProductById - Product name:`, product.name);
            console.log(`🔍 Service - getProductById - Product isActive:`, product.isActive);
        }
    }

    if (!product) {
        throw new Error('Product not found');
    }

    if (!product.isActive) {
        throw new Error('Product is not available');
    }

    // Increment views if requested
    if (incrementViews) {
        // Only increment in database - don't manually increment the product object
        // The incrementViews function already increments in the database
        await productRepository.incrementViews(id);
        // Fetch the updated product to get the correct view count
        const updatedProduct = await productRepository.findById(productId);
        if (updatedProduct) {
            product.views = updatedProduct.views;
        }
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
        // Only increment in database - don't manually increment the product object
        // The incrementViews function already increments in the database
        await productRepository.incrementViews(product._id);
        // Fetch the updated product to get the correct view count
        const updatedProduct = await productRepository.findById(product._id);
        if (updatedProduct) {
            product.views = updatedProduct.views;
        }
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

    // Validate discount price - must be less than regular price
    // IMPORTANT: Always use the price from update data if provided, otherwise use existing price
    // Convert to numbers to ensure proper comparison
    
    // Get the price to compare against (new price takes priority)
    let priceToCompare;
    
    if (productData.price !== undefined && productData.price !== null) {
        // New price is being sent in update
        priceToCompare = typeof productData.price === 'number' 
            ? productData.price 
            : parseFloat(String(productData.price));
    } else {
        // Use existing price from database
        priceToCompare = typeof existingProduct.price === 'number' 
            ? existingProduct.price 
            : parseFloat(String(existingProduct.price));
    }
    
    // Validate discount price only if both discountPrice and priceToCompare are valid
    if (productData.discountPrice !== undefined && productData.discountPrice !== null) {
        // Convert discount price to number
        const discountPriceNum = typeof productData.discountPrice === 'number' 
            ? productData.discountPrice 
            : parseFloat(String(productData.discountPrice));
        
        // Check for invalid numbers
        if (isNaN(discountPriceNum)) {
            throw new Error('Invalid discount price value');
        }
        
        if (isNaN(priceToCompare) || priceToCompare === undefined || priceToCompare === null) {
            throw new Error('Invalid regular price value');
        }
        
        console.log('Product Update - Price Validation:', {
            productId: id,
            priceFromUpdate: productData.price,
            existingPrice: existingProduct.price,
            priceToCompare: priceToCompare,
            discountPrice: discountPriceNum,
            comparison: `${discountPriceNum} < ${priceToCompare} = ${discountPriceNum < priceToCompare}`,
            isValid: discountPriceNum < priceToCompare,
            rawProductData: {
                price: productData.price,
                discountPrice: productData.discountPrice
            }
        });
        
        // Validate: discount price must be less than regular price
        if (discountPriceNum >= priceToCompare) {
            console.error('Product Update - Discount Price Validation Failed:', {
                discountPrice: discountPriceNum,
                priceToCompare: priceToCompare,
                comparison: `${discountPriceNum} >= ${priceToCompare}`,
                rawData: {
                    discountPrice: productData.discountPrice,
                    price: productData.price,
                    existingPrice: existingProduct.price
                }
            });
            throw new Error(`Discount price (${discountPriceNum}) must be less than regular price (${priceToCompare})`);
        }
        
        if (discountPriceNum < 0) {
            throw new Error('Discount price cannot be negative');
        }
    }

    // Log PDF information if updating digital file
    if (productData.type === 'digital' && productData.digitalFile) {
        console.log('📄 Updating digital product PDF:');
        console.log('   - New PDF URL:', productData.digitalFile);
        console.log('   - File Size:', productData.fileSize ? `${(productData.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Not specified');
    }

    // Update product
    const updatedProduct = await productRepository.updateById(id, productData);

    // Verify PDF was updated
    if (productData.type === 'digital' && updatedProduct.digitalFile) {
        console.log('✅ PDF updated successfully in database');
        console.log('   - Stored URL:', updatedProduct.digitalFile);
    }

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
const searchProducts = async (searchText, page = 1, limit = 8) => {
    if (!searchText || searchText.trim().length === 0) {
        throw new Error('Search text is required');
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 8);

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
const getProductsByCategory = async (categoryId, page = 1, limit = 8) => {
    if (!categoryId || categoryId.length !== 24) {
        throw new Error('Invalid category ID format');
    }

    const category = await categoryRepository.findById(categoryId);
    if (!category) {
        throw new Error('Category not found');
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 8);

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

/**
 * Get last updated products for home page
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products
 */
const getLastUpdates = async (limit = 3) => {
    return await productRepository.getLastUpdates(limit);
};

/**
 * Get coming soon products for home page
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products
 */
const getComingSoon = async (limit = 3) => {
    return await productRepository.getComingSoon(limit);
};

/**
 * Get popular reader products for home page
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products
 */
const getPopularReader = async (limit = 3) => {
    return await productRepository.getPopularReader(limit);
};

/**
 * Get frequently downloaded products for home page
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products
 */
const getFrequentlyDownloaded = async (limit = 3) => {
    return await productRepository.getFrequentlyDownloaded(limit);
};

/**
 * Get all digital products with PDFs (Admin)
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Products with pagination
 */
const getDigitalProducts = async (page = 1, limit = 20) => {
    return await productRepository.getDigitalProducts(page, limit);
};

/**
 * Get most viewed/clicked products for home page (Favourited section)
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products sorted by views
 */
const getFavourited = async (limit = 3) => {
    return await productRepository.getFavourited(limit);
};

/**
 * Get newly added products for home page
 * @param {Number} limit - Number of products to return
 * @returns {Promise<Array>} - Array of products sorted by createdAt
 */
const getNewAdded = async (limit = 3) => {
    return await productRepository.getNewAdded(limit);
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
    updateProductStock,
    getLastUpdates,
    getComingSoon,
    getPopularReader,
    getFrequentlyDownloaded,
    getFavourited,
    getNewAdded,
    getDigitalProducts
};

