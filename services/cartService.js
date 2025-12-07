/**
 * Cart Service
 * Business logic layer for Cart operations
 */

const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const couponService = require('./couponService');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');

/**
 * Get user's cart
 * @param {String|ObjectId} userId - User ID
 * @returns {Promise<Object>} - Cart document
 */
const getCart = async (userId) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    const cart = await cartRepository.getOrCreateCart(userIdStr);
    return cart;
};

/**
 * Add item to cart
 * @param {String|ObjectId} userId - User ID
 * @param {String|ObjectId} productId - Product ID
 * @param {Number} quantity - Quantity to add
 * @returns {Promise<Object>} - Updated cart
 */
const addToCart = async (userId, productId, quantity) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);
    const productIdStr = productId?.toString ? productId.toString() : String(productId);

    // Validate inputs
    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }
    if (!productIdStr || productIdStr.length !== 24) {
        throw new Error('Invalid product ID format');
    }
    if (!quantity || quantity < 1) {
        throw new Error('Quantity must be at least 1');
    }

    // Get product
    const product = await productRepository.findById(productIdStr);
    if (!product) {
        throw new Error('Product not found');
    }
    if (!product.isActive) {
        throw new Error('Product is not available');
    }

    // Check stock for physical products
    if (product.type === 'physical') {
        if (product.stock === 0) {
            throw new Error('Product is out of stock');
        }
        if (product.stock < quantity) {
            throw new Error(`Insufficient stock. Only ${product.stock} available.`);
        }
    }

    // Get or create cart (without populate for update operations)
    let cart = await Cart.findOne({ user: userIdStr });
    if (!cart) {
        throw new Error('Cart not found');
    }

    // Calculate price (use discount price if available)
    const price = product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;

    // Product snapshot - ensure all fields are strings
    const productSnapshot = {
        name: String(product.name || ''),
        type: String(product.type || ''),
        thumbnail: String(product.thumbnail || (product.images && product.images[0]) || '')
    };

    // Add item to cart - convert productIdStr to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productIdStr);
    cart.addItem(productObjectId, quantity, price, productSnapshot);
    await cart.save();

    // Recalculate totals
    cart.calculateTotals();
    await cart.save();

    // Apply coupon discount if coupon exists
    if (cart.coupon) {
        await applyCouponDiscount(userIdStr, cart.coupon._id || cart.coupon);
    }

    return await cartRepository.findByUser(userIdStr);
};

/**
 * Update item quantity in cart
 * @param {String} userId - User ID
 * @param {String} productId - Product ID
 * @param {Number} quantity - New quantity
 * @returns {Promise<Object>} - Updated cart
 */
const updateCartItem = async (userId, productId, quantity) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);
    const productIdStr = productId?.toString ? productId.toString() : String(productId);

    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }
    if (!productIdStr || productIdStr.length !== 24) {
        throw new Error('Invalid product ID format');
    }
    if (quantity < 0) {
        throw new Error('Quantity cannot be negative');
    }

    // Get cart without populate for update operations (to avoid populated object issues)
    let cart = await Cart.findOne({ user: userIdStr });
    if (!cart) {
        throw new Error('Cart not found');
    }

    // Check product stock if updating quantity
    if (quantity > 0) {
        const product = await productRepository.findById(productIdStr);
        if (!product) {
            throw new Error('Product not found');
        }

        if (product.type === 'physical') {
            if (product.stock === 0) {
                throw new Error('Product is out of stock');
            }
            if (product.stock < quantity) {
                throw new Error(`Insufficient stock. Only ${product.stock} available.`);
            }
        }
    }

    // Update item quantity - convert productIdStr to ObjectId for comparison
    const productObjectId = new mongoose.Types.ObjectId(productIdStr);
    cart.updateItemQuantity(productObjectId, quantity);
    await cart.save();

    // Recalculate totals
    cart.calculateTotals();
    await cart.save();

    // Reapply coupon if exists
    if (cart.coupon) {
        await applyCouponDiscount(userIdStr, cart.coupon);
    }

    // Return populated cart
    return await Cart.findById(cart._id)
        .populate('items.product', 'name type price discountPrice thumbnail images stock')
        .populate('coupon', 'code type value');
};

/**
 * Remove item from cart
 * @param {String} userId - User ID
 * @param {String} productId - Product ID
 * @returns {Promise<Object>} - Updated cart
 */
const removeFromCart = async (userId, productId) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);
    const productIdStr = productId?.toString ? productId.toString() : String(productId);

    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }
    if (!productIdStr || productIdStr.length !== 24) {
        throw new Error('Invalid product ID format');
    }

    // Get cart without populate for update operations (to avoid populated object issues)
    let cart = await Cart.findOne({ user: userIdStr });
    if (!cart) {
        throw new Error('Cart not found');
    }

    // Remove item - convert productIdStr to ObjectId for comparison
    const productObjectId = new mongoose.Types.ObjectId(productIdStr);
    cart.removeItem(productObjectId);
    await cart.save();

    // Recalculate totals
    cart.calculateTotals();
    await cart.save();

    // Reapply coupon if exists
    if (cart.coupon) {
        await applyCouponDiscount(userIdStr, cart.coupon._id || cart.coupon);
    }

    // Return populated cart
    return await Cart.findById(cart._id)
        .populate('items.product', 'name type price discountPrice thumbnail images stock')
        .populate('coupon', 'code type value');
};

/**
 * Clear cart
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Cleared cart
 */
const clearCart = async (userId) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    return await cartRepository.clearCart(userIdStr);
};

/**
 * Apply coupon to cart
 * @param {String} userId - User ID
 * @param {String} couponCode - Coupon code
 * @returns {Promise<Object>} - Updated cart
 */
const applyCoupon = async (userId, couponCode) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }
    if (!couponCode || couponCode.trim().length === 0) {
        throw new Error('Coupon code is required');
    }

    // Get cart
    const cart = await cartRepository.findByUser(userIdStr);
    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    // Validate coupon using coupon service
    const coupon = await couponService.validateCoupon(couponCode, cart.subtotal);

    // Apply coupon to cart
    await cartRepository.applyCoupon(userIdStr, coupon._id);

    // Calculate and apply discount
    await applyCouponDiscount(userIdStr, coupon._id);

    return await cartRepository.findByUser(userIdStr);
};

/**
 * Apply coupon discount calculation
 * @param {String} userId - User ID
 * @param {String} couponId - Coupon ID
 * @returns {Promise<Object>} - Updated cart
 */
const applyCouponDiscount = async (userId, couponId) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);
    const cart = await cartRepository.findByUser(userIdStr);
    if (!cart) {
        throw new Error('Cart not found');
    }

    const coupon = await couponService.getCouponById(couponId);
    if (!coupon) {
        throw new Error('Coupon not found');
    }

    // Calculate discount using coupon method
    const discount = coupon.calculateDiscount(cart.subtotal);

    cart.discount = discount;
    cart.calculateTotals();
    await cart.save();

    return cart;
};

/**
 * Remove coupon from cart
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Updated cart
 */
const removeCoupon = async (userId) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    await cartRepository.removeCoupon(userIdStr);
    return await cartRepository.findByUser(userIdStr);
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
};

