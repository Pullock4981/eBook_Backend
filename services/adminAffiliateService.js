/**
 * Admin Affiliate Service
 * Business logic layer for admin affiliate management
 */

const affiliateRepository = require('../repositories/affiliateRepository');
const commissionRepository = require('../repositories/commissionRepository');
const withdrawRequestRepository = require('../repositories/withdrawRequestRepository');

/**
 * Get all affiliates (Admin)
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Affiliates with pagination
 */
const getAllAffiliates = async (filters = {}, page = 1, limit = 10) => {
    try {
        return await affiliateRepository.findAll(filters, page, limit);
    } catch (error) {
        throw new Error(`Failed to get affiliates: ${error.message}`);
    }
};

/**
 * Approve affiliate (Admin)
 * @param {String} affiliateId - Affiliate ID
 * @param {String} adminId - Admin user ID
 * @returns {Promise<Object>} - Updated affiliate
 */
const approveAffiliate = async (affiliateId, adminId) => {
    try {
        return await affiliateRepository.approve(affiliateId, adminId);
    } catch (error) {
        throw new Error(`Failed to approve affiliate: ${error.message}`);
    }
};

/**
 * Reject affiliate (Admin)
 * @param {String} affiliateId - Affiliate ID
 * @param {String} adminId - Admin user ID
 * @param {String} reason - Rejection reason
 * @returns {Promise<Object>} - Updated affiliate
 */
const rejectAffiliate = async (affiliateId, adminId, reason) => {
    try {
        return await affiliateRepository.reject(affiliateId, adminId, reason);
    } catch (error) {
        throw new Error(`Failed to reject affiliate: ${error.message}`);
    }
};

/**
 * Suspend affiliate (Admin)
 * @param {String} affiliateId - Affiliate ID
 * @returns {Promise<Object>} - Updated affiliate
 */
const suspendAffiliate = async (affiliateId) => {
    try {
        return await affiliateRepository.suspend(affiliateId);
    } catch (error) {
        throw new Error(`Failed to suspend affiliate: ${error.message}`);
    }
};

/**
 * Get all commissions (Admin)
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Commissions with pagination
 */
const getAllCommissions = async (filters = {}, page = 1, limit = 10) => {
    try {
        return await commissionRepository.findAll(filters, page, limit);
    } catch (error) {
        throw new Error(`Failed to get commissions: ${error.message}`);
    }
};

/**
 * Get all withdraw requests (Admin)
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Requests with pagination
 */
const getAllWithdrawRequests = async (filters = {}, page = 1, limit = 10) => {
    try {
        return await withdrawRequestRepository.findAll(filters, page, limit);
    } catch (error) {
        throw new Error(`Failed to get withdraw requests: ${error.message}`);
    }
};

/**
 * Approve withdraw request (Admin)
 * @param {String} requestId - Request ID
 * @param {String} adminId - Admin user ID
 * @param {String} notes - Optional notes
 * @returns {Promise<Object>} - Updated request
 */
const approveWithdrawRequest = async (requestId, adminId, notes = null) => {
    try {
        const request = await withdrawRequestRepository.findById(requestId);
        if (!request) {
            throw new Error('Withdraw request not found');
        }

        await request.approve(adminId, notes);
        return request;
    } catch (error) {
        throw new Error(`Failed to approve withdraw request: ${error.message}`);
    }
};

/**
 * Reject withdraw request (Admin)
 * @param {String} requestId - Request ID
 * @param {String} adminId - Admin user ID
 * @param {String} reason - Rejection reason
 * @returns {Promise<Object>} - Updated request
 */
const rejectWithdrawRequest = async (requestId, adminId, reason) => {
    try {
        const request = await withdrawRequestRepository.findById(requestId);
        if (!request) {
            throw new Error('Withdraw request not found');
        }

        await request.reject(adminId, reason);
        return request;
    } catch (error) {
        throw new Error(`Failed to reject withdraw request: ${error.message}`);
    }
};

/**
 * Mark withdraw request as paid (Admin)
 * @param {String} requestId - Request ID
 * @param {String} adminId - Admin user ID
 * @param {String} transactionId - Transaction ID (optional)
 * @returns {Promise<Object>} - Updated request
 */
const markWithdrawAsPaid = async (requestId, adminId, transactionId = null) => {
    try {
        const request = await withdrawRequestRepository.findById(requestId);
        if (!request) {
            throw new Error('Withdraw request not found');
        }

        if (request.status !== 'approved') {
            throw new Error('Withdraw request must be approved before marking as paid');
        }

        await request.markAsPaid(adminId, transactionId);

        // Update affiliate stats
        const affiliate = await affiliateRepository.findByUser(request.affiliate);
        if (affiliate) {
            await affiliate.updateStats();
        }

        return request;
    } catch (error) {
        throw new Error(`Failed to mark withdraw as paid: ${error.message}`);
    }
};

/**
 * Get affiliate analytics (Admin)
 * @returns {Promise<Object>} - Analytics data
 */
const getAffiliateAnalytics = async () => {
    try {
        const [allAffiliates, allCommissions, pendingRequests] = await Promise.all([
            affiliateRepository.findAll({}, 1, 1000),
            commissionRepository.findAll({}, 1, 1000),
            withdrawRequestRepository.findPending()
        ]);

        const totalAffiliates = allAffiliates.affiliates.length;
        const activeAffiliates = allAffiliates.affiliates.filter(a => a.status === 'active').length;
        const pendingAffiliates = allAffiliates.affiliates.filter(a => a.status === 'pending').length;

        const totalCommissions = allCommissions.commissions.reduce((sum, c) => sum + c.amount, 0);
        const paidCommissions = allCommissions.commissions
            .filter(c => c.status === 'paid')
            .reduce((sum, c) => sum + c.amount, 0);
        const pendingCommissions = allCommissions.commissions
            .filter(c => c.status === 'pending')
            .reduce((sum, c) => sum + c.amount, 0);

        const totalWithdrawRequests = pendingRequests.length;
        const totalWithdrawAmount = pendingRequests.reduce((sum, r) => sum + r.amount, 0);

        return {
            affiliates: {
                total: totalAffiliates,
                active: activeAffiliates,
                pending: pendingAffiliates
            },
            commissions: {
                total: totalCommissions,
                paid: paidCommissions,
                pending: pendingCommissions
            },
            withdrawRequests: {
                pending: totalWithdrawRequests,
                pendingAmount: totalWithdrawAmount
            }
        };
    } catch (error) {
        throw new Error(`Failed to get affiliate analytics: ${error.message}`);
    }
};

module.exports = {
    getAllAffiliates,
    approveAffiliate,
    rejectAffiliate,
    suspendAffiliate,
    getAllCommissions,
    getAllWithdrawRequests,
    approveWithdrawRequest,
    rejectWithdrawRequest,
    markWithdrawAsPaid,
    getAffiliateAnalytics
};

