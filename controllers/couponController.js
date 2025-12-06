/**
 * Coupon Controller
 * Presentation layer - Handles HTTP requests and responses for coupon operations
 */

const couponService = require('../services/couponService');

/**
 * Get all coupons (Admin)
 * GET /api/coupons
 */
exports.getAllCoupons = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;
        const result = await couponService.getAllCoupons(filters, page, limit);

        res.status(200).json({
            success: true,
            message: 'Coupons retrieved successfully',
            data: result.coupons,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get coupon by ID (Admin)
 * GET /api/coupons/:id
 */
exports.getCouponById = async (req, res, next) => {
    try {
        const coupon = await couponService.getCouponById(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Coupon retrieved successfully',
            data: coupon
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get coupon by code (Public - for validation)
 * GET /api/coupons/code/:code
 */
exports.getCouponByCode = async (req, res, next) => {
    try {
        const coupon = await couponService.getCouponByCode(req.params.code);
        res.status(200).json({
            success: true,
            message: 'Coupon retrieved successfully',
            data: coupon
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Validate coupon (Public)
 * POST /api/coupons/validate
 */
exports.validateCoupon = async (req, res, next) => {
    try {
        const { code, cartAmount } = req.body;
        const coupon = await couponService.validateCoupon(code, cartAmount);
        const discount = coupon.calculateDiscount(cartAmount);

        res.status(200).json({
            success: true,
            message: 'Coupon is valid',
            data: {
                coupon: {
                    code: coupon.code,
                    type: coupon.type,
                    value: coupon.value,
                    maxDiscount: coupon.maxDiscount
                },
                discount,
                finalAmount: cartAmount - discount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create coupon (Admin)
 * POST /api/coupons
 */
exports.createCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.createCoupon(req.body);
        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update coupon (Admin)
 * PUT /api/coupons/:id
 */
exports.updateCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.updateCoupon(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            data: coupon
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete coupon (Admin)
 * DELETE /api/coupons/:id
 */
exports.deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.deleteCoupon(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully',
            data: coupon
        });
    } catch (error) {
        next(error);
    }
};

