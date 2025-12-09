/**
 * Affiliate Model
 * Tracks affiliate users, referral links, and commission statistics
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const affiliateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        unique: true
    },
    // Unique referral code (auto-generated in pre-save hook)
    referralCode: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true
    },
    // Referral link (auto-generated in pre-save hook)
    referralLink: {
        type: String,
        unique: true
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'rejected'],
        default: 'pending'
    },
    // Commission rate (percentage)
    commissionRate: {
        type: Number,
        default: 10, // Default 10% from env
        min: 0,
        max: 100
    },
    // Statistics
    totalReferrals: {
        type: Number,
        default: 0
    },
    totalSales: {
        type: Number,
        default: 0
    },
    totalCommission: {
        type: Number,
        default: 0
    },
    paidCommission: {
        type: Number,
        default: 0
    },
    pendingCommission: {
        type: Number,
        default: 0
    },
    // Bank details for withdrawal
    bankDetails: {
        accountName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        bankName: { type: String, trim: true },
        branchName: { type: String, trim: true },
        routingNumber: { type: String, trim: true }
    },
    // Payment method preference
    paymentMethod: {
        type: String,
        enum: ['bank', 'mobile_banking', 'cash'],
        default: 'bank'
    },
    // Mobile banking details (for bKash, Nagad, etc.)
    mobileBanking: {
        provider: { type: String, enum: ['bkash', 'nagad', 'rocket', 'other'] },
        accountNumber: { type: String, trim: true },
        accountName: { type: String, trim: true }
    },
    // Approval info
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    // Rejection reason
    rejectionReason: {
        type: String,
        trim: true
    },
    // Notes
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'affiliates'
});

// Indexes
affiliateSchema.index({ user: 1 }, { unique: true });
affiliateSchema.index({ referralCode: 1 }, { unique: true });
affiliateSchema.index({ referralLink: 1 }, { unique: true });
affiliateSchema.index({ status: 1 });
affiliateSchema.index({ createdAt: -1 });

// Generate unique referral code
affiliateSchema.statics.generateReferralCode = function () {
    let code;
    let isUnique = false;

    while (!isUnique) {
        // Generate 8 character code
        code = crypto.randomBytes(4).toString('hex').toUpperCase();
        // Check if code exists (will be checked in pre-save)
        isUnique = true; // Will be validated in pre-save hook
    }

    return code;
};

// Generate referral link
affiliateSchema.statics.generateReferralLink = function (referralCode) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/ref/${referralCode}`;
};

// Pre-save hook to generate referral code and link
affiliateSchema.pre('save', async function (next) {
    try {
        // Generate referral code if not exists
        if (!this.referralCode) {
            let code;
            let isUnique = false;
            let attempts = 0;
            const maxAttempts = 10;

            while (!isUnique && attempts < maxAttempts) {
                code = crypto.randomBytes(4).toString('hex').toUpperCase();
                const existing = await this.constructor.findOne({ referralCode: code });
                if (!existing) {
                    isUnique = true;
                }
                attempts++;
            }

            if (!isUnique) {
                return next(new Error('Failed to generate unique referral code'));
            }

            this.referralCode = code;
        }

        // Generate referral link if not exists
        if (!this.referralLink && this.referralCode) {
            this.referralLink = affiliateSchema.statics.generateReferralLink(this.referralCode);
        }

        // Set default commission rate from env if not set
        if (!this.commissionRate) {
            this.commissionRate = parseFloat(process.env.AFFILIATE_COMMISSION_RATE || '10');
        }

        // Ensure referralCode and referralLink are set before saving
        if (!this.referralCode || !this.referralLink) {
            return next(new Error('Failed to generate referral code or link'));
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Post-save validation to ensure required fields are set
affiliateSchema.post('save', function (doc) {
    if (!doc.referralCode || !doc.referralLink) {
        throw new Error('Affiliate saved without referralCode or referralLink');
    }
});

// Method to calculate commission
affiliateSchema.methods.calculateCommission = function (orderAmount) {
    return (orderAmount * this.commissionRate) / 100;
};

// Method to update statistics
affiliateSchema.methods.updateStats = async function () {
    const Commission = mongoose.model('Commission');

    // Calculate total commission
    const commissions = await Commission.find({ affiliate: this._id });
    this.totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);
    this.paidCommission = commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0);
    this.pendingCommission = commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0);

    // Calculate total sales
    this.totalSales = commissions.reduce((sum, c) => sum + c.orderAmount, 0);

    // Count unique referrals
    const uniqueUsers = new Set(commissions.map(c => c.referredUser?.toString()));
    this.totalReferrals = uniqueUsers.size;

    return await this.save();
};

module.exports = mongoose.model('Affiliate', affiliateSchema);

