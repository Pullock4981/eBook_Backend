/**
 * Affiliate Repository
 * Data access layer for Affiliate operations
 */

const Affiliate = require('../models/Affiliate');

/**
 * Create new affiliate
 * @param {Object} affiliateData - Affiliate data
 * @returns {Promise<Object>} - Created affiliate
 */
const create = async (affiliateData) => {
    try {
        const affiliate = new Affiliate(affiliateData);
        return await affiliate.save();
    } catch (error) {
        throw new Error(`Failed to create affiliate: ${error.message}`);
    }
};

/**
 * Find affiliate by user ID
 * @param {String} userId - User ID
 * @returns {Promise<Object|null>} - Affiliate or null
 */
const findByUser = async (userId) => {
    try {
        const affiliate = await Affiliate.findOne({ user: userId })
            .populate({
                path: 'user',
                select: 'profile.name profile.email mobile',
                model: 'User'
            })
            .populate('approvedBy', 'profile.name');

        console.log('findByUser - userId:', userId);
        console.log('findByUser - affiliate found:', affiliate ? 'Yes' : 'No');
        if (affiliate) {
            console.log('findByUser - affiliate user:', affiliate.user);
        }

        return affiliate;
    } catch (error) {
        console.error('findByUser error:', error);
        throw new Error(`Failed to find affiliate: ${error.message}`);
    }
};

/**
 * Find affiliate by referral code
 * @param {String} referralCode - Referral code
 * @returns {Promise<Object|null>} - Affiliate or null
 */
const findByReferralCode = async (referralCode) => {
    try {
        return await Affiliate.findOne({
            referralCode: referralCode.toUpperCase(),
            status: 'active'
        })
            .populate('user', 'profile.name profile.email mobile');
    } catch (error) {
        throw new Error(`Failed to find affiliate by referral code: ${error.message}`);
    }
};

/**
 * Find all affiliates with filters
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Affiliates with pagination
 */
const findAll = async (filters = {}, page = 1, limit = 10) => {
    try {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        const query = {};

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.search && filters.search.trim()) {
            const searchRegex = { $regex: filters.search.trim(), $options: 'i' };
            query.$or = [
                { referralCode: searchRegex },
                { referralLink: searchRegex }
            ];
            // Note: User fields will be searched after populate in service layer if needed
        }

        // Build query - if no filters, get all
        const affiliateQuery = Affiliate.find(query);

        // Always populate user
        affiliateQuery.populate({
            path: 'user',
            select: 'profile.name profile.email mobile',
            model: 'User'
        });

        // Populate approvedBy if exists
        affiliateQuery.populate('approvedBy', 'profile.name');

        // Sort, skip, limit
        affiliateQuery.sort({ createdAt: -1 }).skip(skip).limit(limitNum);

        const [affiliates, total] = await Promise.all([
            affiliateQuery.exec(),
            Affiliate.countDocuments(query)
        ]);

        console.log('Repository - Query:', JSON.stringify(query));
        console.log('Repository - Found affiliates:', affiliates.length);
        console.log('Repository - Total count:', total);

        if (affiliates.length > 0) {
            console.log('Repository - First affiliate:', {
                id: affiliates[0]._id?.toString(),
                status: affiliates[0].status,
                referralCode: affiliates[0].referralCode,
                user: affiliates[0].user ? {
                    id: affiliates[0].user._id?.toString(),
                    name: affiliates[0].user.profile?.name,
                    email: affiliates[0].user.profile?.email,
                    mobile: affiliates[0].user.mobile
                } : 'Not populated',
                paymentMethod: affiliates[0].paymentMethod,
                mobileBanking: affiliates[0].mobileBanking,
                bankDetails: affiliates[0].bankDetails
            });
        } else {
            console.log('Repository - No affiliates found with query:', query);
        }

        return {
            affiliates,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    } catch (error) {
        throw new Error(`Failed to find affiliates: ${error.message}`);
    }
};

/**
 * Update affiliate
 * @param {String} affiliateId - Affiliate ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} - Updated affiliate
 */
const update = async (affiliateId, updateData) => {
    try {
        return await Affiliate.findByIdAndUpdate(
            affiliateId,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'profile.name profile.email mobile');
    } catch (error) {
        throw new Error(`Failed to update affiliate: ${error.message}`);
    }
};

/**
 * Approve affiliate
 * @param {String} affiliateId - Affiliate ID
 * @param {String} approvedBy - Admin user ID
 * @returns {Promise<Object>} - Updated affiliate
 */
const approve = async (affiliateId, approvedBy) => {
    try {
        return await Affiliate.findByIdAndUpdate(
            affiliateId,
            {
                status: 'active',
                approvedBy,
                approvedAt: new Date()
            },
            { new: true }
        ).populate('user', 'profile.name profile.email mobile');
    } catch (error) {
        throw new Error(`Failed to approve affiliate: ${error.message}`);
    }
};

/**
 * Reject affiliate
 * @param {String} affiliateId - Affiliate ID
 * @param {String} reviewedBy - Admin user ID
 * @param {String} reason - Rejection reason
 * @returns {Promise<Object>} - Updated affiliate
 */
const reject = async (affiliateId, reviewedBy, reason) => {
    try {
        return await Affiliate.findByIdAndUpdate(
            affiliateId,
            {
                status: 'rejected',
                reviewedBy,
                reviewedAt: new Date(),
                rejectionReason: reason
            },
            { new: true }
        ).populate('user', 'profile.name profile.email mobile');
    } catch (error) {
        throw new Error(`Failed to reject affiliate: ${error.message}`);
    }
};

/**
 * Suspend affiliate
 * @param {String} affiliateId - Affiliate ID
 * @returns {Promise<Object>} - Updated affiliate
 */
const suspend = async (affiliateId) => {
    try {
        return await Affiliate.findByIdAndUpdate(
            affiliateId,
            { status: 'suspended' },
            { new: true }
        );
    } catch (error) {
        throw new Error(`Failed to suspend affiliate: ${error.message}`);
    }
};

/**
 * Delete affiliate by ID
 * @param {String} affiliateId - Affiliate ID
 * @returns {Promise<Object|null>} - Deleted affiliate or null
 */
const deleteById = async (affiliateId) => {
    try {
        const affiliate = await Affiliate.findByIdAndDelete(affiliateId);
        return affiliate;
    } catch (error) {
        throw new Error(`Failed to delete affiliate: ${error.message}`);
    }
};

module.exports = {
    create,
    findByUser,
    findByReferralCode,
    findAll,
    update,
    approve,
    reject,
    suspend,
    deleteById
};

