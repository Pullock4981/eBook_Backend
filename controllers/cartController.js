/**
 * Cart Controller
 * Presentation layer - Handles HTTP requests and responses for cart operations
 */

const cartService = require('../services/cartService');

/**
 * Get user's cart
 * GET /api/cart
 */
exports.getCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.userId);
        res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add item to cart
 * POST /api/cart/items
 */
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await cartService.addToCart(req.userId, productId, quantity);
        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update cart item quantity
 * PUT /api/cart/items/:productId
 */
exports.updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const cart = await cartService.updateCartItem(req.userId, req.params.productId, quantity);
        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:productId
 */
exports.removeFromCart = async (req, res, next) => {
    try {
        const cart = await cartService.removeFromCart(req.userId, req.params.productId);
        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
exports.clearCart = async (req, res, next) => {
    try {
        const cart = await cartService.clearCart(req.userId);
        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Apply coupon to cart
 * POST /api/cart/coupon
 */
exports.applyCoupon = async (req, res, next) => {
    try {
        const { couponCode } = req.body;
        const cart = await cartService.applyCoupon(req.userId, couponCode);
        res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove coupon from cart
 * DELETE /api/cart/coupon
 */
exports.removeCoupon = async (req, res, next) => {
    try {
        const cart = await cartService.removeCoupon(req.userId);
        res.status(200).json({
            success: true,
            message: 'Coupon removed successfully',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

