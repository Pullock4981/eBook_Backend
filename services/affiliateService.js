/**
 * Affiliate Service
 * Business logic layer for affiliate operations
 */

const affiliateRepository = require('../repositories/affiliateRepository');
const commissionRepository = require('../repositories/commissionRepository');
const withdrawRequestRepository = require('../repositories/withdrawRequestRepository');
const userRepository = require('../repositories/userRepository');

/**
 * Register user as affiliate
 * @param {String} userId - User ID
 * @param {Object} affiliateData - Affiliate data (bank details, etc.)
 * @returns {Promise<Object>} - Created affiliate
 */
const registerAsAffiliate = async (userId, affiliateData = {}) => {
    try {
        // Check if user already has affiliate account
        const existing = await affiliateRepository.findByUser(userId);
        if (existing) {
            throw new Error('User is already registered as affiliate');
        }

        // Get user
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create affiliate
        const affiliateDataToSave = {
            user: userId,
            status: 'pending',
            commissionRate: parseFloat(process.env.AFFILIATE_COMMISSION_RATE || '10'),
            ...affiliateData
        };

        const affiliate = await affiliateRepository.create(affiliateDataToSave);
        return affiliate;
    } catch (error) {
        throw new Error(`Failed to register as affiliate: ${error.message}`);
    }
};

/**
 * Get affiliate by user ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Affiliate
 */
const getAffiliateByUser = async (userId) => {
    try {
        const affiliate = await affiliateRepository.findByUser(userId);
        if (!affiliate) {
            throw new Error('Affiliate not found');
        }
        return affiliate;
    } catch (error) {
        throw new Error(`Failed to get affiliate: ${error.message}`);
    }
};

/**
 * Get affiliate statistics
 * @param {String} affiliateId - Affiliate ID
 * @returns {Promise<Object>} - Statistics
 */
const getAffiliateStatistics = async (affiliateId) => {
    try {
        const affiliate = await affiliateRepository.findByUser(affiliateId);
        if (!affiliate) {
            throw new Error('Affiliate not found');
        }

        // Update stats
        await affiliate.updateStats();

        // Get commission stats
        const commissionStats = await commissionRepository.getStatistics(affiliate._id);

        return {
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
                pendingCommission: affiliate.pendingCommission
            },
            commissions: commissionStats
        };
    } catch (error) {
        throw new Error(`Failed to get affiliate statistics: ${error.message}`);
    }
};

/**
 * Create commission for referral
 * Called when a referred user makes a purchase
 * @param {String} referralCode - Referral code used
 * @param {String} orderId - Order ID
 * @param {String} referredUserId - User ID who made the purchase
 * @param {Number} orderAmount - Order total amount
 * @returns {Promise<Object>} - Created commission
 */
const createCommission = async (referralCode, orderId, referredUserId, orderAmount) => {
    try {
        // Find affiliate by referral code
        const affiliate = await affiliateRepository.findByReferralCode(referralCode);
        if (!affiliate) {
            throw new Error('Invalid referral code');
        }

        // Check if affiliate is active
        if (affiliate.status !== 'active') {
            throw new Error('Affiliate is not active');
        }

        // Check if commission already exists for this order
        const existing = await commissionRepository.findByOrder(orderId);
        if (existing) {
            throw new Error('Commission already exists for this order');
        }

        // Calculate commission
        const commissionAmount = affiliate.calculateCommission(orderAmount);

        // Create commission
        const commission = await commissionRepository.create({
            affiliate: affiliate._id,
            order: orderId,
            referredUser: referredUserId,
            orderAmount,
            amount: commissionAmount,
            commissionRate: affiliate.commissionRate,
            status: 'pending'
        });

        // Update affiliate stats
        await affiliate.updateStats();

        return commission;
    } catch (error) {
        throw new Error(`Failed to create commission: ${error.message}`);
    }
};

/**
 * Create withdraw request
 * @param {String} affiliateId - Affiliate ID
 * @param {Number} amount - Requested amount
 * @param {Object} paymentDetails - Payment details
 * @returns {Promise<Object>} - Created request
 */
const createWithdrawRequest = async (affiliateId, amount, paymentDetails) => {
    try {
        // Get affiliate
        const affiliate = await affiliateRepository.findByUser(affiliateId);
        if (!affiliate) {
            throw new Error('Affiliate not found');
        }

        // Check if affiliate is active
        if (affiliate.status !== 'active') {
            throw new Error('Affiliate is not active');
        }

        // Check minimum withdraw amount
        const minWithdraw = parseFloat(process.env.AFFILIATE_MIN_WITHDRAW || '500');
        if (amount < minWithdraw) {
            throw new Error(`Minimum withdraw amount is ${minWithdraw}`);
        }

        // Get pending commissions
        const pendingCommissions = await commissionRepository.findPendingByAffiliate(affiliate._id);
        const availableAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);

        // Check if requested amount is available
        if (amount > availableAmount) {
            throw new Error(`Insufficient balance. Available: ${availableAmount}`);
        }

        // Select commissions to include (FIFO - First In First Out)
        let selectedCommissions = [];
        let selectedAmount = 0;
        for (const commission of pendingCommissions) {
            if (selectedAmount < amount) {
                selectedCommissions.push(commission._id);
                selectedAmount += commission.amount;
            }
        }

        // Get payment method from affiliate or request
        const paymentMethod = paymentDetails.paymentMethod || affiliate.paymentMethod || 'bank';

        // Create withdraw request
        const request = await withdrawRequestRepository.create({
            affiliate: affiliate._id,
            amount,
            paymentMethod,
            paymentDetails: {
                ...paymentDetails,
                ...(affiliate.bankDetails || {}),
                ...(affiliate.mobileBanking || {})
            },
            commissions: selectedCommissions,
            status: 'pending'
        });

        return request;
    } catch (error) {
        throw new Error(`Failed to create withdraw request: ${error.message}`);
    }
};

/**
 * Get withdraw requests for affiliate
 * @param {String} affiliateId - Affiliate ID
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Requests with pagination
 */
const getWithdrawRequests = async (affiliateId, page = 1, limit = 10) => {
    try {
        return await withdrawRequestRepository.findByAffiliate(affiliateId, page, limit);
    } catch (error) {
        throw new Error(`Failed to get withdraw requests: ${error.message}`);
    }
};

/**
 * Get commissions for affiliate
 * @param {String} affiliateId - Affiliate ID
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Commissions with pagination
 */
const getCommissions = async (affiliateId, filters = {}, page = 1, limit = 10) => {
    try {
        const affiliate = await affiliateRepository.findByUser(affiliateId);
        if (!affiliate) {
            throw new Error('Affiliate not found');
        }

        return await commissionRepository.findByAffiliate(affiliate._id, filters, page, limit);
    } catch (error) {
        throw new Error(`Failed to get commissions: ${error.message}`);
    }
};

/**
 * Update affiliate payment details
 * @param {String} affiliateId - Affiliate ID
 * @param {Object} paymentDetails - Payment details
 * @returns {Promise<Object>} - Updated affiliate
 */
const updatePaymentDetails = async (affiliateId, paymentDetails) => {
    try {
        const affiliate = await affiliateRepository.findByUser(affiliateId);
        if (!affiliate) {
            throw new Error('Affiliate not found');
        }

        const updateData = {};

        if (paymentDetails.bankDetails) {
            updateData.bankDetails = paymentDetails.bankDetails;
        }

        if (paymentDetails.mobileBanking) {
            updateData.mobileBanking = paymentDetails.mobileBanking;
        }

        if (paymentDetails.paymentMethod) {
            updateData.paymentMethod = paymentDetails.paymentMethod;
        }

        return await affiliateRepository.update(affiliate._id, updateData);
    } catch (error) {
        throw new Error(`Failed to update payment details: ${error.message}`);
    }
};

module.exports = {
    registerAsAffiliate,
    getAffiliateByUser,
    getAffiliateStatistics,
    createCommission,
    createWithdrawRequest,
    getWithdrawRequests,
    getCommissions,
    updatePaymentDetails
};

