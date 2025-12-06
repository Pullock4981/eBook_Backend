/**
 * Cart Repository
 * Data access layer for Cart model
 */

const Cart = require('../models/Cart');

/**
 * Get or create cart for user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Cart document
 */
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId })
        .populate('items.product', 'name type price discountPrice thumbnail images stock')
        .populate('coupon', 'code type value');

    if (!cart) {
        cart = await Cart.create({ user: userId });
    }

    return cart;
};

/**
 * Get cart by user ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Cart document
 */
const findByUser = async (userId) => {
    return await Cart.findOne({ user: userId })
        .populate('items.product', 'name type price discountPrice thumbnail images stock')
        .populate('coupon', 'code type value');
};

/**
 * Update cart
 * @param {String} userId - User ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated cart document
 */
const updateCart = async (userId, data) => {
    const cart = await Cart.findOneAndUpdate(
        { user: userId },
        data,
        { new: true, runValidators: true, upsert: true }
    )
        .populate('items.product', 'name type price discountPrice thumbnail images stock')
        .populate('coupon', 'code type value');

    return cart;
};

/**
 * Clear cart
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Cleared cart document
 */
const clearCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
        cart.items = [];
        cart.coupon = null;
        cart.subtotal = 0;
        cart.discount = 0;
        cart.total = 0;
        cart.lastUpdated = new Date();
        await cart.save();
    }
    return cart;
};

/**
 * Apply coupon to cart
 * @param {String} userId - User ID
 * @param {String} couponId - Coupon ID
 * @returns {Promise<Object>} - Updated cart document
 */
const applyCoupon = async (userId, couponId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new Error('Cart not found');
    }

    cart.coupon = couponId;
    // Recalculate totals (discount will be calculated in service)
    cart.calculateTotals();
    await cart.save();

    return await Cart.findById(cart._id)
        .populate('items.product', 'name type price discountPrice thumbnail images stock')
        .populate('coupon', 'code type value');
};

/**
 * Remove coupon from cart
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Updated cart document
 */
const removeCoupon = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new Error('Cart not found');
    }

    cart.coupon = null;
    cart.discount = 0;
    cart.calculateTotals();
    await cart.save();

    return await Cart.findById(cart._id)
        .populate('items.product', 'name type price discountPrice thumbnail images stock')
        .populate('coupon', 'code type value');
};

module.exports = {
    getOrCreateCart,
    findByUser,
    updateCart,
    clearCart,
    applyCoupon,
    removeCoupon
};

