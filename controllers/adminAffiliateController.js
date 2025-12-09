/**
 * Admin Affiliate Controller
 * Presentation layer - Handles HTTP requests and responses for admin affiliate management
 */

const adminAffiliateService = require('../services/adminAffiliateService');

/**
 * Get all affiliates (Admin)
 * GET /api/admin/affiliates
 */
exports.getAllAffiliates = async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;

        console.log('Admin getAllAffiliates - Query params:', { status, search, page, limit });

        const result = await adminAffiliateService.getAllAffiliates(
            { status, search },
            page,
            limit
        );

        console.log('Service result:', {
            affiliatesCount: result.affiliates?.length || 0,
            pagination: result.pagination
        });

        const mappedAffiliates = result.affiliates.map(a => {
            // Handle user data - check if populated or just ObjectId
            let userData = {
                id: null,
                name: 'N/A',
                email: null,
                mobile: null
            };

            if (a.user) {
                if (typeof a.user === 'object' && a.user._id) {
                    // User is populated
                    userData.id = a.user._id.toString();
                    userData.name = a.user.profile?.name || a.user.name || 'N/A';
                    userData.email = a.user.profile?.email || a.user.email || null;
                    userData.mobile = a.user.mobile || null;
                } else if (typeof a.user === 'string' || (a.user && a.user.toString)) {
                    // User is just ObjectId
                    userData.id = a.user.toString();
                    userData.name = 'User ID: ' + userData.id;
                }
            }

            const mapped = {
                id: a._id?.toString() || a.id?.toString() || 'unknown',
                user: userData,
                referralCode: a.referralCode || 'N/A',
                referralLink: a.referralLink || 'N/A',
                status: a.status || 'pending',
                commissionRate: a.commissionRate || 10,
                paymentMethod: a.paymentMethod || 'bank',
                bankDetails: a.bankDetails || null,
                mobileBanking: a.mobileBanking || null,
                totalReferrals: a.totalReferrals || 0,
                totalSales: a.totalSales || 0,
                totalCommission: a.totalCommission || 0,
                paidCommission: a.paidCommission || 0,
                pendingCommission: a.pendingCommission || 0,
                approvedAt: a.approvedAt || null,
                createdAt: a.createdAt || new Date()
            };

            console.log('Mapped affiliate:', {
                id: mapped.id,
                status: mapped.status,
                userName: mapped.user.name,
                referralCode: mapped.referralCode
            });

            return mapped;
        });

        console.log('Mapped affiliates count:', mappedAffiliates.length);

        res.status(200).json({
            success: true,
            message: 'Affiliates retrieved successfully',
            data: {
                affiliates: mappedAffiliates,
                pagination: result.pagination
            }
        });
    } catch (error) {
        console.error('Error in getAllAffiliates controller:', error);
        next(error);
    }
};

/**
 * Approve affiliate (Admin)
 * PUT /api/admin/affiliates/:affiliateId/approve
 */
exports.approveAffiliate = async (req, res, next) => {
    try {
        const { affiliateId } = req.params;
        const adminId = req.userId;

        const affiliate = await adminAffiliateService.approveAffiliate(affiliateId, adminId);

        res.status(200).json({
            success: true,
            message: 'Affiliate approved successfully',
            data: {
                affiliate: {
                    id: affiliate._id,
                    status: affiliate.status,
                    approvedAt: affiliate.approvedAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reject affiliate (Admin)
 * PUT /api/admin/affiliates/:affiliateId/reject
 */
exports.rejectAffiliate = async (req, res, next) => {
    try {
        const { affiliateId } = req.params;
        const { reason } = req.body;
        const adminId = req.userId;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const affiliate = await adminAffiliateService.rejectAffiliate(affiliateId, adminId, reason);

        res.status(200).json({
            success: true,
            message: 'Affiliate rejected successfully',
            data: {
                affiliate: {
                    id: affiliate._id,
                    status: affiliate.status,
                    rejectionReason: affiliate.rejectionReason
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Suspend affiliate (Admin)
 * PUT /api/admin/affiliates/:affiliateId/suspend
 */
exports.suspendAffiliate = async (req, res, next) => {
    try {
        const { affiliateId } = req.params;

        const affiliate = await adminAffiliateService.suspendAffiliate(affiliateId);

        res.status(200).json({
            success: true,
            message: 'Affiliate suspended successfully',
            data: {
                affiliate: {
                    id: affiliate._id,
                    status: affiliate.status
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all commissions (Admin)
 * GET /api/admin/commissions
 */
exports.getAllCommissions = async (req, res, next) => {
    try {
        const { status, affiliate, page = 1, limit = 10 } = req.query;

        const result = await adminAffiliateService.getAllCommissions(
            { status, affiliate },
            page,
            limit
        );

        res.status(200).json({
            success: true,
            message: 'Commissions retrieved successfully',
            data: {
                commissions: result.commissions.map(c => ({
                    id: c._id,
                    affiliate: {
                        id: c.affiliate._id,
                        referralCode: c.affiliate.referralCode
                    },
                    order: {
                        id: c.order._id,
                        orderId: c.order.orderId,
                        total: c.order.total
                    },
                    referredUser: {
                        id: c.referredUser._id,
                        name: c.referredUser.profile?.name,
                        email: c.referredUser.profile?.email
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
 * Get all withdraw requests (Admin)
 * GET /api/admin/withdraw-requests
 */
exports.getAllWithdrawRequests = async (req, res, next) => {
    try {
        const { status, affiliate, page = 1, limit = 10 } = req.query;

        const result = await adminAffiliateService.getAllWithdrawRequests(
            { status, affiliate },
            page,
            limit
        );

        res.status(200).json({
            success: true,
            message: 'Withdraw requests retrieved successfully',
            data: {
                requests: result.requests.map(r => ({
                    id: r._id,
                    affiliate: {
                        id: r.affiliate._id,
                        referralCode: r.affiliate.referralCode
                    },
                    amount: r.amount,
                    status: r.status,
                    paymentMethod: r.paymentMethod,
                    paymentDetails: r.paymentDetails,
                    reviewedAt: r.reviewedAt,
                    paidAt: r.paidAt,
                    transactionId: r.transactionId,
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
 * Approve withdraw request (Admin)
 * PUT /api/admin/withdraw-requests/:requestId/approve
 */
exports.approveWithdrawRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { notes } = req.body;
        const adminId = req.userId;

        const request = await adminAffiliateService.approveWithdrawRequest(requestId, adminId, notes);

        res.status(200).json({
            success: true,
            message: 'Withdraw request approved successfully',
            data: {
                request: {
                    id: request._id,
                    status: request.status,
                    reviewedAt: request.reviewedAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reject withdraw request (Admin)
 * PUT /api/admin/withdraw-requests/:requestId/reject
 */
exports.rejectWithdrawRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { reason } = req.body;
        const adminId = req.userId;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const request = await adminAffiliateService.rejectWithdrawRequest(requestId, adminId, reason);

        res.status(200).json({
            success: true,
            message: 'Withdraw request rejected successfully',
            data: {
                request: {
                    id: request._id,
                    status: request.status,
                    rejectionReason: request.rejectionReason
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark withdraw as paid (Admin)
 * PUT /api/admin/withdraw-requests/:requestId/paid
 */
exports.markWithdrawAsPaid = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { transactionId } = req.body;
        const adminId = req.userId;

        const request = await adminAffiliateService.markWithdrawAsPaid(requestId, adminId, transactionId);

        res.status(200).json({
            success: true,
            message: 'Withdraw marked as paid successfully',
            data: {
                request: {
                    id: request._id,
                    status: request.status,
                    paidAt: request.paidAt,
                    transactionId: request.transactionId
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get affiliate analytics (Admin)
 * GET /api/admin/affiliates/analytics
 */
exports.getAffiliateAnalytics = async (req, res, next) => {
    try {
        const analytics = await adminAffiliateService.getAffiliateAnalytics();

        res.status(200).json({
            success: true,
            message: 'Analytics retrieved successfully',
            data: analytics
        });
    } catch (error) {
        next(error);
    }
};

