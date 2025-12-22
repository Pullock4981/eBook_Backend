/**
 * Coupon Service
 * Business logic layer for Coupon operations
 */

const couponRepository = require('../repositories/couponRepository');

/**
 * Create a new coupon
 * @param {Object} couponData - Coupon data
 * @returns {Promise<Object>} - Created coupon
 */
const createCoupon = async (couponData) => {
    // Validate coupon code uniqueness
    const existing = await couponRepository.findByCode(couponData.code);
    if (existing) {
        throw new Error('Coupon code already exists');
    }

    // Validate coupon value
    if (couponData.type === 'percentage' && couponData.value > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
    }

    if (couponData.type === 'percentage' && couponData.value < 0) {
        throw new Error('Percentage discount cannot be negative');
    }

    if (couponData.type === 'fixed' && couponData.value <= 0) {
        throw new Error('Fixed discount must be greater than 0');
    }

    // Validate max discount for percentage
    if (couponData.type === 'percentage' && couponData.maxDiscount) {
        if (couponData.maxDiscount <= 0) {
            throw new Error('Max discount must be greater than 0');
        }
    }

    // Validate expiry date
    if (couponData.expiryDate && new Date(couponData.expiryDate) < new Date()) {
        throw new Error('Expiry date cannot be in the past');
    }

    // Remove approvalStatus if it's null or undefined (for admin-created coupons)
    // Only affiliate-created coupons should have approvalStatus
    if (couponData.approvalStatus === null || couponData.approvalStatus === undefined) {
        delete couponData.approvalStatus;
    }

    // Create coupon
    const coupon = await couponRepository.create(couponData);
    return coupon;
};

/**
 * Get all coupons
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Coupons with pagination
 */
const getAllCoupons = async (filters = {}, page = 1, limit = 10) => {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Auto-disable expired coupons
    const now = new Date();
    await couponRepository.updateExpiredCoupons(now);

    return await couponRepository.getAll(filters, pageNum, limitNum);
};

/**
 * Get coupon by ID
 * @param {String} id - Coupon ID
 * @returns {Promise<Object>} - Coupon document
 */
const getCouponById = async (id) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid coupon ID format');
    }

    const coupon = await couponRepository.findById(id);
    if (!coupon) {
        throw new Error('Coupon not found');
    }

    return coupon;
};

/**
 * Get coupon by code
 * @param {String} code - Coupon code
 * @returns {Promise<Object>} - Coupon document
 */
const getCouponByCode = async (code) => {
    if (!code || code.trim().length === 0) {
        throw new Error('Coupon code is required');
    }

    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
        throw new Error('Coupon not found');
    }

    return coupon;
};

/**
 * Validate coupon for use
 * @param {String} code - Coupon code
 * @param {Number} cartAmount - Cart subtotal amount
 * @returns {Promise<Object>} - Validation result with coupon
 */
const validateCoupon = async (code, cartAmount) => {
    if (!code || code.trim().length === 0) {
        throw new Error('Coupon code is required');
    }

    if (!cartAmount || cartAmount < 0) {
        throw new Error('Invalid cart amount');
    }

    // Get coupon
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
        throw new Error('Invalid coupon code');
    }

    // For affiliate coupons, check approval status
    if (coupon.affiliate) {
        if (coupon.approvalStatus !== 'approved') {
            if (coupon.approvalStatus === 'pending') {
                throw new Error('This coupon is pending admin approval');
            } else if (coupon.approvalStatus === 'rejected') {
                throw new Error('This coupon has been rejected');
            }
        }
    }

    // Check if coupon is valid
    const validityCheck = coupon.isValid();
    if (!validityCheck.valid) {
        throw new Error(validityCheck.reason);
    }

    // Check if can apply to amount
    const amountCheck = coupon.canApplyToAmount(cartAmount);
    if (!amountCheck.canApply) {
        throw new Error(amountCheck.reason);
    }

    return coupon;
};

/**
 * Calculate discount for cart
 * @param {String} code - Coupon code
 * @param {Number} cartAmount - Cart subtotal
 * @returns {Promise<Object>} - Discount calculation result
 */
const calculateDiscount = async (code, cartAmount) => {
    const coupon = await validateCoupon(code, cartAmount);
    const discount = coupon.calculateDiscount(cartAmount);

    return {
        coupon,
        discount,
        finalAmount: cartAmount - discount
    };
};

/**
 * Update coupon
 * @param {String} id - Coupon ID
 * @param {Object} couponData - Update data
 * @returns {Promise<Object>} - Updated coupon
 */
const updateCoupon = async (id, couponData) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid coupon ID format');
    }

    const existing = await couponRepository.findById(id);
    if (!existing) {
        throw new Error('Coupon not found');
    }

    // Validate code uniqueness if changing code
    if (couponData.code && couponData.code !== existing.code) {
        const codeExists = await couponRepository.findByCode(couponData.code);
        if (codeExists) {
            throw new Error('Coupon code already exists');
        }
    }

    // Validate value
    if (couponData.type === 'percentage' && couponData.value > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
    }

    const updated = await couponRepository.updateById(id, couponData);
    return updated;
};

/**
 * Delete coupon (soft delete)
 * @param {String} id - Coupon ID
 * @returns {Promise<Object>} - Deleted coupon
 */
const deleteCoupon = async (id) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid coupon ID format');
    }

    const existing = await couponRepository.findById(id);
    if (!existing) {
        throw new Error('Coupon not found');
    }

    const deleted = await couponRepository.deleteById(id);
    return deleted;
};

/**
 * Increment coupon usage
 * @param {String} id - Coupon ID
 * @returns {Promise<Object>} - Updated coupon
 */
const incrementCouponUsage = async (id) => {
    if (!id || id.length !== 24) {
        throw new Error('Invalid coupon ID format');
    }

    return await couponRepository.incrementUsage(id);
};

/**
 * Get active coupons for public display
 * @param {Number} limit - Maximum number of coupons to return
 * @returns {Promise<Object>} - Active coupons
 */
const getActiveCoupons = async (limit = 5) => {
    const now = new Date();
    const coupons = await couponRepository.findActive(limit);

    // Filter out expired coupons and those that reached usage limit
    const validCoupons = coupons.filter(coupon => {
        // Check if expired
        if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
            return false;
        }
        // Check if usage limit reached
        if (coupon.usedCount >= coupon.usageLimit) {
            return false;
        }
        return true;
    });

    return {
        coupons: validCoupons
    };
};

/**
 * Generate unique coupon code
 * @returns {Promise<String>} - Unique coupon code
 */
const generateCouponCode = async () => {
    const crypto = require('crypto');
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        code = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 8); // 8 characters
        const existing = await couponRepository.findByCode(code);
        if (!existing) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Failed to generate unique coupon code');
    }
    return code;
};

/**
 * Create affiliate coupon
 * @param {String} affiliateId - Affiliate ID
 * @param {Object} couponData - Coupon data
 * @returns {Promise<Object>} - Created coupon
 */
const createAffiliateCoupon = async (affiliateId, couponData) => {
    // Check if affiliate already has a pending coupon request
    // Use mongoose.Types.ObjectId to ensure proper comparison
    const mongoose = require('mongoose');
    const pendingCoupons = await couponRepository.findPendingAffiliateCoupons(
        { affiliate: mongoose.Types.ObjectId(affiliateId) }, 
        1, 
        1
    );
    if (pendingCoupons.coupons && pendingCoupons.coupons.length > 0) {
        throw new Error('You already have a pending coupon request. Please wait for admin approval before creating a new one.');
    }
    
    // Use provided code or generate one
    let code;
    if (couponData.code && couponData.code.trim()) {
        // User provided code - validate uniqueness
        const trimmedCode = couponData.code.trim().toUpperCase();
        const existing = await couponRepository.findByCode(trimmedCode);
        if (existing) {
            throw new Error('Coupon code already exists. Please choose a different code.');
        }
        code = trimmedCode;
    } else {
        // Auto-generate code
        code = await generateCouponCode();
    }
    
    const dataToCreate = {
        ...couponData,
        code, // Use provided code or auto-generated
        affiliate: affiliateId,
        approvalStatus: 'pending', // Affiliate coupons need admin approval
        isActive: false, // Inactive until approved
        usedCount: 0,
        totalEarnings: 0, // Track earnings from this coupon
        // Ensure usageLimit is at least 1
        usageLimit: Math.max(1, couponData.usageLimit || 1),
        // Ensure value is positive
        value: Math.max(0, couponData.value || 0),
        // Ensure minPurchase is non-negative
        minPurchase: Math.max(0, couponData.minPurchase || 0),
        // Ensure maxDiscount is non-negative if set
        maxDiscount: couponData.maxDiscount !== null ? Math.max(0, couponData.maxDiscount) : null,
    };

    // Basic validation (more detailed validation can be added)
    if (dataToCreate.type === 'percentage' && dataToCreate.value > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
    }
    if (dataToCreate.expiryDate) {
        const expiryDate = new Date(dataToCreate.expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        expiryDate.setHours(0, 0, 0, 0);
        if (expiryDate < today) {
            throw new Error('Expiry date cannot be in the past');
        }
    }

    const coupon = await couponRepository.create(dataToCreate);
    return coupon;
};

/**
 * Get affiliate coupons
 * @param {String} affiliateId - Affiliate ID
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Coupons with pagination
 */
const getAffiliateCoupons = async (affiliateId, page = 1, limit = 10) => {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    return await couponRepository.findByAffiliate(affiliateId, {}, pageNum, limitNum);
};

/**
 * Approve affiliate coupon
 * @param {String} couponId - Coupon ID
 * @returns {Promise<Object>} - Updated coupon
 */
const approveAffiliateCoupon = async (couponId) => {
    const coupon = await couponRepository.findById(couponId);
    if (!coupon) {
        throw new Error('Coupon not found');
    }
    if (!coupon.affiliate) {
        throw new Error('This is not an affiliate coupon');
    }
    if (coupon.approvalStatus === 'approved') {
        throw new Error('Coupon is already approved');
    }
    
    coupon.approvalStatus = 'approved';
    coupon.isActive = true; // Activate the coupon
    return await coupon.save();
};

/**
 * Reject affiliate coupon
 * @param {String} couponId - Coupon ID
 * @returns {Promise<Object>} - Updated coupon
 */
const rejectAffiliateCoupon = async (couponId) => {
    const coupon = await couponRepository.findById(couponId);
    if (!coupon) {
        throw new Error('Coupon not found');
    }
    if (!coupon.affiliate) {
        throw new Error('This is not an affiliate coupon');
    }
    if (coupon.approvalStatus === 'rejected') {
        throw new Error('Coupon is already rejected');
    }
    
    coupon.approvalStatus = 'rejected';
    coupon.isActive = false; // Deactivate the coupon
    return await coupon.save();
};

/**
 * Get pending affiliate coupons (for admin)
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Coupons with pagination
 */
const getPendingAffiliateCoupons = async (page = 1, limit = 10) => {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    return await couponRepository.findPendingAffiliateCoupons({}, pageNum, limitNum);
};

/**
 * Add earnings to affiliate coupon
 * @param {String} couponId - Coupon ID
 * @param {Number} earnings - Earnings amount to add
 * @returns {Promise<Object>} - Updated coupon
 */
const addCouponEarnings = async (couponId, earnings) => {
    const coupon = await couponRepository.findById(couponId);
    if (!coupon) {
        throw new Error('Coupon not found');
    }
    if (!coupon.affiliate) {
        return coupon; // Not an affiliate coupon, no earnings tracking
    }
    
    coupon.totalEarnings = (coupon.totalEarnings || 0) + earnings;
    return await coupon.save();
};

module.exports = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    getCouponByCode,
    validateCoupon,
    calculateDiscount,
    updateCoupon,
    deleteCoupon,
    incrementCouponUsage,
    getActiveCoupons,
    createAffiliateCoupon,
    getAffiliateCoupons,
    approveAffiliateCoupon,
    rejectAffiliateCoupon,
    getPendingAffiliateCoupons,
    addCouponEarnings
};

