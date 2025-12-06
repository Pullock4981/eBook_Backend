/**
 * Commission Model
 * Tracks individual commission records for affiliate referrals
 */

const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
    affiliate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Affiliate',
        required: [true, 'Affiliate is required']
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order is required']
    },
    referredUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Referred user is required']
    },
    // Order details snapshot
    orderAmount: {
        type: Number,
        required: [true, 'Order amount is required'],
        min: 0
    },
    // Commission amount
    amount: {
        type: Number,
        required: [true, 'Commission amount is required'],
        min: 0
    },
    // Commission rate used
    commissionRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid', 'cancelled'],
        default: 'pending'
    },
    // Payment info
    paidAt: {
        type: Date
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Withdraw request reference
    withdrawRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WithdrawRequest',
        default: null
    },
    // Notes
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'commissions'
});

// Indexes
commissionSchema.index({ affiliate: 1 });
commissionSchema.index({ order: 1 });
commissionSchema.index({ referredUser: 1 });
commissionSchema.index({ status: 1 });
commissionSchema.index({ createdAt: -1 });
commissionSchema.index({ affiliate: 1, status: 1 });

// Method to mark as paid
commissionSchema.methods.markAsPaid = async function (paidBy) {
    this.status = 'paid';
    this.paidAt = new Date();
    this.paidBy = paidBy;
    return await this.save();
};

module.exports = mongoose.model('Commission', commissionSchema);

