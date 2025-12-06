/**
 * Cart Service
 * Business logic layer for Cart operations
 */

const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const couponRepository = require('../repositories/couponRepository');

/**
 * Get user's cart
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Cart document
 */
const getCart = async (userId) => {
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    const cart = await cartRepository.getOrCreateCart(userId);
    return cart;
};

/**
 * Add item to cart
 * @param {String} userId - User ID
 * @param {String} productId - Product ID
 * @param {Number} quantity - Quantity to add
 * @returns {Promise<Object>} - Updated cart
 */
const addToCart = async (userId, productId, quantity) => {
    // Validate inputs
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }
    if (!productId || productId.length !== 24) {
        throw new Error('Invalid product ID format');
    }
    if (!quantity || quantity < 1) {
        throw new Error('Quantity must be at least 1');
    }

    // Get product
    const product = await productRepository.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }
    if (!product.isActive) {
        throw new Error('Product is not available');
    }

    // Check stock for physical products
    if (product.type === 'physical') {
        if (product.stock < quantity) {
            throw new Error(`Insufficient stock. Only ${product.stock} available.`);
        }
    }

    // Get or create cart
    const cart = await cartRepository.getOrCreateCart(userId);

    // Calculate price (use discount price if available)
    const price = product.discountPrice && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;

    // Product snapshot
    const productSnapshot = {
        name: product.name,
        type: product.type,
        thumbnail: product.thumbnail || (product.images && product.images[0]) || null
    };

    // Add item to cart
    cart.addItem(productId, quantity, price, productSnapshot);
    await cart.save();

    // Recalculate totals
    cart.calculateTotals();
    await cart.save();

    // Apply coupon discount if coupon exists
    // Note: Coupon functionality will be fully implemented in Part 9
    // if (cart.coupon) {
    //   await applyCouponDiscount(userId, cart.coupon);
    // }

    return await cartRepository.findByUser(userId);
};

/**
 * Update item quantity in cart
 * @param {String} userId - User ID
 * @param {String} productId - Product ID
 * @param {Number} quantity - New quantity
 * @returns {Promise<Object>} - Updated cart
 */
const updateCartItem = async (userId, productId, quantity) => {
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }
    if (!productId || productId.length !== 24) {
        throw new Error('Invalid product ID format');
    }
    if (quantity < 0) {
        throw new Error('Quantity cannot be negative');
    }

    const cart = await cartRepository.findByUser(userId);
    if (!cart) {
        throw new Error('Cart not found');
    }

    // Check product stock if updating quantity
    if (quantity > 0) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (product.type === 'physical' && product.stock < quantity) {
            throw new Error(`Insufficient stock. Only ${product.stock} available.`);
        }
    }

    // Update item quantity
    cart.updateItemQuantity(productId, quantity);
    await cart.save();

    // Recalculate totals
    cart.calculateTotals();
    await cart.save();

    // Reapply coupon if exists
    if (cart.coupon) {
        await applyCouponDiscount(userId, cart.coupon);
    }

    return await cartRepository.findByUser(userId);
};

/**
 * Remove item from cart
 * @param {String} userId - User ID
 * @param {String} productId - Product ID
 * @returns {Promise<Object>} - Updated cart
 */
const removeFromCart = async (userId, productId) => {
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }
    if (!productId || productId.length !== 24) {
        throw new Error('Invalid product ID format');
    }

    const cart = await cartRepository.findByUser(userId);
    if (!cart) {
        throw new Error('Cart not found');
    }

    cart.removeItem(productId);
    await cart.save();

    // Recalculate totals
    cart.calculateTotals();
    await cart.save();

    // Reapply coupon if exists
    // Note: Coupon functionality will be fully implemented in Part 9
    // if (cart.coupon) {
    //   await applyCouponDiscount(userId, cart.coupon);
    // }

    return await cartRepository.findByUser(userId);
};

/**
 * Clear cart
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Cleared cart
 */
const clearCart = async (userId) => {
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    return await cartRepository.clearCart(userId);
};

/**
 * Apply coupon to cart
 * @param {String} userId - User ID
 * @param {String} couponCode - Coupon code
 * @returns {Promise<Object>} - Updated cart
 */
const applyCoupon = async (userId, couponCode) => {
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }
    if (!couponCode || couponCode.trim().length === 0) {
        throw new Error('Coupon code is required');
    }

    // Get cart
    const cart = await cartRepository.findByUser(userId);
    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    // Find coupon
    const coupon = await couponRepository.findByCode(couponCode.toUpperCase());
    if (!coupon) {
        throw new Error('Invalid coupon code');
    }
    if (!coupon.isActive) {
        throw new Error('Coupon is not active');
    }
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
        throw new Error('Coupon has expired');
    }
    if (coupon.usedCount >= coupon.usageLimit) {
        throw new Error('Coupon usage limit reached');
    }

    // Check minimum purchase
    if (coupon.minPurchase && cart.subtotal < coupon.minPurchase) {
        throw new Error(`Minimum purchase of ${coupon.minPurchase} required`);
    }

    // Apply coupon
    await cartRepository.applyCoupon(userId, coupon._id);

    // Calculate discount
    await applyCouponDiscount(userId, coupon._id);

    return await cartRepository.findByUser(userId);
};

/**
 * Apply coupon discount calculation
 * @param {String} userId - User ID
 * @param {String} couponId - Coupon ID
 * @returns {Promise<Object>} - Updated cart
 */
const applyCouponDiscount = async (userId, couponId) => {
    const cart = await cartRepository.findByUser(userId);
    if (!cart) {
        throw new Error('Cart not found');
    }

    const coupon = await couponRepository.findById(couponId);
    if (!coupon) {
        throw new Error('Coupon not found');
    }

    let discount = 0;

    if (coupon.type === 'percentage') {
        discount = (cart.subtotal * coupon.value) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
    } else if (coupon.type === 'fixed') {
        discount = coupon.value;
        if (discount > cart.subtotal) {
            discount = cart.subtotal;
        }
    }

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
    if (!userId || userId.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    await cartRepository.removeCoupon(userId);
    return await cartRepository.findByUser(userId);
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

