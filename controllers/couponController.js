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
 * Get active coupons (Public)
 * GET /api/coupons/public/active
 */
exports.getActiveCoupons = async (req, res, next) => {
    try {
        const { limit = 5 } = req.query;
        const result = await couponService.getActiveCoupons(parseInt(limit));
        res.status(200).json({
            success: true,
            message: 'Active coupons retrieved successfully',
            data: result.coupons || result,
            count: result.coupons?.length || result.length || 0
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

/**
 * Get pending affiliate coupons (Admin)
 * GET /api/coupons/pending-affiliate
 */
exports.getPendingAffiliateCoupons = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await couponService.getPendingAffiliateCoupons(page, limit);
        res.status(200).json({
            success: true,
            message: 'Pending affiliate coupons retrieved successfully',
            data: {
                coupons: result.coupons.map(c => ({
                    id: c._id,
                    code: c.code,
                    type: c.type,
                    value: c.value,
                    usageLimit: c.usageLimit,
                    minPurchase: c.minPurchase,
                    maxDiscount: c.maxDiscount,
                    expiryDate: c.expiryDate,
                    description: c.description,
                    oneTimeUse: c.oneTimeUse,
                    approvalStatus: c.approvalStatus,
                    affiliate: c.affiliate,
                    createdAt: c.createdAt
                })),
                pagination: result.pagination
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Approve affiliate coupon (Admin)
 * POST /api/coupons/:id/approve
 */
exports.approveAffiliateCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.approveAffiliateCoupon(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Coupon approved successfully',
            data: {
                coupon: {
                    id: coupon._id,
                    code: coupon.code,
                    approvalStatus: coupon.approvalStatus,
                    isActive: coupon.isActive
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reject affiliate coupon (Admin)
 * POST /api/coupons/:id/reject
 */
exports.rejectAffiliateCoupon = async (req, res, next) => {
    try {
        const coupon = await couponService.rejectAffiliateCoupon(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Coupon rejected successfully',
            data: {
                coupon: {
                    id: coupon._id,
                    code: coupon.code,
                    approvalStatus: coupon.approvalStatus,
                    isActive: coupon.isActive
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

