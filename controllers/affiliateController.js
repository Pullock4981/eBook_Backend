/**
 * Affiliate Controller
 * Presentation layer - Handles HTTP requests and responses for affiliate operations
 */

const affiliateService = require('../services/affiliateService');

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

