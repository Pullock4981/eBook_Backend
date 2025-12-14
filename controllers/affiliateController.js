/**
 * Affiliate Controller
 * Presentation layer - Handles HTTP requests and responses for affiliate operations
 */

const affiliateService = require('../services/affiliateService');
const couponService = require('../services/couponService');

/**
 * Register as affiliate
 * POST /api/affiliates/register
 */
exports.registerAsAffiliate = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { bankDetails, mobileBanking, paymentMethod } = req.body;

        const affiliate = await affiliateService.registerAsAffiliate(userId, {
            bankDetails,
            mobileBanking,
            paymentMethod
        });

        res.status(201).json({
            success: true,
            message: 'Affiliate registration submitted successfully. Waiting for admin approval.',
            data: {
                affiliate: {
                    id: affiliate._id,
                    referralCode: affiliate.referralCode,
                    referralLink: affiliate.referralLink,
                    status: affiliate.status
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get affiliate profile
 * GET /api/affiliates/profile
 */
exports.getAffiliateProfile = async (req, res, next) => {
    try {
        const userId = req.userId;

        const affiliate = await affiliateService.getAffiliateByUser(userId);

        if (!affiliate) {
            // User is not affiliate - return 404 silently (this is normal, not an error)
            return res.status(404).json({
                success: false,
                message: 'Affiliate profile not found',
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Affiliate profile retrieved successfully',
            data: {
                affiliate: {
                    id: affiliate._id,
                    referralCode: affiliate.referralCode,
                    referralLink: affiliate.referralLink,
                    status: affiliate.status,
                    commissionRate: affiliate.commissionRate,
                    totalReferrals: affiliate.totalReferrals,
                    totalSales: affiliate.totalSales,
                    totalCommission: affiliate.totalCommission,
                    paidCommission: affiliate.paidCommission,
                    pendingCommission: affiliate.pendingCommission,
                    bankDetails: affiliate.bankDetails,
                    mobileBanking: affiliate.mobileBanking,
                    paymentMethod: affiliate.paymentMethod
                }
            }
        });
    } catch (error) {
        // If affiliate not found, return 404 silently (this is normal, not an error)
        // Most users are not affiliates, so this is expected behavior
        if (error.message && (error.message.includes('not found') || error.message.includes('Affiliate not found'))) {
            return res.status(404).json({
                success: false,
                message: 'Affiliate profile not found',
                data: null
            });
        }
        // Only log and forward actual errors (not "not found" cases)
        if (process.env.NODE_ENV !== 'production') {
            console.error('getAffiliateProfile - unexpected error:', error.message);
        }
        next(error);
    }
};

/**
 * Get affiliate statistics
 * GET /api/affiliates/statistics
 */
exports.getStatistics = async (req, res, next) => {
    try {
        const userId = req.userId;
        const statistics = await affiliateService.getAffiliateStatistics(userId);

        res.status(200).json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: statistics
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get commissions
 * GET /api/affiliates/commissions
 */
exports.getCommissions = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { status, page = 1, limit = 10 } = req.query;

        const result = await affiliateService.getCommissions(userId, { status }, page, limit);

        res.status(200).json({
            success: true,
            message: 'Commissions retrieved successfully',
            data: {
                commissions: result.commissions.map(c => ({
                    id: c._id,
                    order: {
                        id: c.order._id,
                        orderId: c.order.orderId,
                        total: c.order.total
                    },
                    referredUser: {
                        id: c.referredUser._id,
                        name: c.referredUser.profile?.name,
                        email: c.referredUser.profile?.email || c.referredUser.mobile
                    },
                    orderAmount: c.orderAmount,
                    amount: c.amount,
                    commissionRate: c.commissionRate,
                    status: c.status,
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
 * Create withdraw request
 * POST /api/affiliates/withdraw
 */
exports.createWithdrawRequest = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { amount, paymentDetails } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required and must be greater than 0'
            });
        }

        const request = await affiliateService.createWithdrawRequest(userId, amount, paymentDetails);

        res.status(201).json({
            success: true,
            message: 'Withdraw request submitted successfully. Waiting for admin approval.',
            data: {
                request: {
                    id: request._id,
                    amount: request.amount,
                    status: request.status,
                    paymentMethod: request.paymentMethod,
                    createdAt: request.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get withdraw requests
 * GET /api/affiliates/withdraw-requests
 */
exports.getWithdrawRequests = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;

        const result = await affiliateService.getWithdrawRequests(userId, page, limit);

        res.status(200).json({
            success: true,
            message: 'Withdraw requests retrieved successfully',
            data: {
                requests: result.requests.map(r => ({
                    id: r._id,
                    amount: r.amount,
                    status: r.status,
                    paymentMethod: r.paymentMethod,
                    reviewedAt: r.reviewedAt,
                    paidAt: r.paidAt,
                    rejectionReason: r.rejectionReason,
                    createdAt: r.createdAt
                })),
                pagination: result.pagination
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update payment details
 * PUT /api/affiliates/payment-details
 */
exports.updatePaymentDetails = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { bankDetails, mobileBanking, paymentMethod } = req.body;

        const affiliate = await affiliateService.updatePaymentDetails(userId, {
            bankDetails,
            mobileBanking,
            paymentMethod
        });

        res.status(200).json({
            success: true,
            message: 'Payment details updated successfully',
            data: {
                affiliate: {
                    id: affiliate._id,
                    bankDetails: affiliate.bankDetails,
                    mobileBanking: affiliate.mobileBanking,
                    paymentMethod: affiliate.paymentMethod
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel affiliate registration
 * DELETE /api/affiliates/cancel
 */
exports.cancelAffiliateRegistration = async (req, res, next) => {
    try {
        const userId = req.userId;

        await affiliateService.cancelAffiliateRegistration(userId);

        res.status(200).json({
            success: true,
            message: 'Affiliate registration cancelled successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate affiliate coupon
 * POST /api/affiliates/coupons
 */
exports.generateCoupon = async (req, res, next) => {
    try {
        const userId = req.userId;
        const couponData = req.body;

        // Get affiliate by user
        const affiliate = await affiliateService.getAffiliateByUser(userId);
        if (!affiliate) {
            return res.status(404).json({
                success: false,
                message: 'Affiliate account not found'
            });
        }

        // Allow any affiliated user to generate coupon requests (backend will handle approval)
        // No need to check status - pending/active/rejected all can request coupons
        // Admin will approve/reject them

        // Create coupon
        const coupon = await couponService.createAffiliateCoupon(affiliate._id, couponData);

        res.status(201).json({
            success: true,
            message: 'Coupon request submitted successfully. Waiting for admin approval.',
            data: {
                coupon: {
                    id: coupon._id,
                    code: coupon.code,
                    type: coupon.type,
                    value: coupon.value,
                    usageLimit: coupon.usageLimit,
                    usedCount: coupon.usedCount,
                    minPurchase: coupon.minPurchase,
                    maxDiscount: coupon.maxDiscount,
                    expiryDate: coupon.expiryDate,
                    description: coupon.description,
                    oneTimeUse: coupon.oneTimeUse,
                    isActive: coupon.isActive,
                    approvalStatus: coupon.approvalStatus,
                    totalEarnings: coupon.totalEarnings || 0,
                    createdAt: coupon.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get affiliate coupons
 * GET /api/affiliates/coupons
 */
exports.getCoupons = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;

        // Get affiliate by user
        const affiliate = await affiliateService.getAffiliateByUser(userId);
        if (!affiliate) {
            return res.status(404).json({
                success: false,
                message: 'Affiliate account not found'
            });
        }

        // Get coupons
        const result = await couponService.getAffiliateCoupons(affiliate._id, page, limit);

        res.status(200).json({
            success: true,
            message: 'Coupons retrieved successfully',
            data: {
                coupons: result.coupons.map(c => ({
                    id: c._id,
                    code: c.code,
                    type: c.type,
                    value: c.value,
                    usageLimit: c.usageLimit,
                    usedCount: c.usedCount,
                    minPurchase: c.minPurchase,
                    maxDiscount: c.maxDiscount,
                    expiryDate: c.expiryDate,
                    description: c.description,
                    oneTimeUse: c.oneTimeUse,
                    isActive: c.isActive,
                    approvalStatus: c.approvalStatus,
                    totalEarnings: c.totalEarnings || 0,
                    createdAt: c.createdAt
                })),
                pagination: result.pagination
            }
        });
    } catch (error) {
        next(error);
    }
};

