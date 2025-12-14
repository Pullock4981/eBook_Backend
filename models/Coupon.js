/**
 * Coupon Model
 * Schema for discount coupons and promo codes
 */

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: [50, 'Coupon code cannot exceed 50 characters']
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: [true, 'Coupon type is required']
    },
    value: {
        type: Number,
        required: [true, 'Coupon value is required'],
        min: [0, 'Coupon value cannot be negative']
    },
    // For percentage coupons, maximum discount limit
    maxDiscount: {
        type: Number,
        default: null,
        min: [0, 'Max discount cannot be negative']
    },
    // Minimum purchase amount required
    minPurchase: {
        type: Number,
        default: 0,
        min: [0, 'Minimum purchase cannot be negative']
    },
    // Usage limits
    usageLimit: {
        type: Number,
        required: [true, 'Usage limit is required'],
        min: [1, 'Usage limit must be at least 1']
    },
    usedCount: {
        type: Number,
        default: 0,
        min: [0, 'Used count cannot be negative']
    },
    // Expiry
    expiryDate: {
        type: Date,
        default: null
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    // Approval status for affiliate coupons (pending, approved, rejected)
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: null // null means not an affiliate coupon or auto-approved
    },
    // Affiliate who created this coupon
    affiliate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Affiliate',
        default: null
    },
    // Total earnings from this coupon (for affiliate coupons)
    totalEarnings: {
        type: Number,
        default: 0,
        min: [0, 'Total earnings cannot be negative']
    },
    // Description
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // Applicable to specific products/categories (optional)
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    // One-time use per user
    oneTimeUse: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: 'coupons'
});

// Indexes
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ createdAt: -1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function () {
    // Check if active
    if (!this.isActive) {
        return { valid: false, reason: 'Coupon is not active' };
    }

    // Check if expired
    if (this.expiryDate && new Date() > this.expiryDate) {
        return { valid: false, reason: 'Coupon has expired' };
    }

    // Check usage limit
    if (this.usedCount >= this.usageLimit) {
        return { valid: false, reason: 'Coupon usage limit reached' };
    }

    return { valid: true };
};

// Method to check if coupon can be applied to amount
couponSchema.methods.canApplyToAmount = function (amount) {
    // Check minimum purchase
    if (this.minPurchase && amount < this.minPurchase) {
        return {
            canApply: false,
            reason: `Minimum purchase of ${this.minPurchase} required`
        };
    }

    return { canApply: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (amount) {
    let discount = 0;

    if (this.type === 'percentage') {
        discount = (amount * this.value) / 100;
        // Apply max discount if set
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else if (this.type === 'fixed') {
        discount = this.value;
        // Don't exceed the amount
        if (discount > amount) {
            discount = amount;
        }
    }

    return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to increment usage
couponSchema.methods.incrementUsage = async function () {
    this.usedCount += 1;
    return await this.save();
};

module.exports = mongoose.model('Coupon', couponSchema);

