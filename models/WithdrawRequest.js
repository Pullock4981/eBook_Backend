/**
 * Withdraw Request Model
 * Tracks affiliate commission withdrawal requests
 */

const mongoose = require('mongoose');

const withdrawRequestSchema = new mongoose.Schema({
    affiliate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Affiliate',
        required: [true, 'Affiliate is required']
    },
    // Requested amount
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be at least 1']
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'paid'],
        default: 'pending'
    },
    // Payment method
    paymentMethod: {
        type: String,
        enum: ['bank', 'mobile_banking', 'cash'],
        required: true
    },
    // Payment details (snapshot at request time)
    paymentDetails: {
        accountName: { type: String },
        accountNumber: { type: String },
        bankName: { type: String },
        branchName: { type: String },
        routingNumber: { type: String },
        // Mobile banking
        provider: { type: String },
        mobileAccountNumber: { type: String },
        mobileAccountName: { type: String }
    },
    // Admin actions
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    // Rejection reason
    rejectionReason: {
        type: String,
        trim: true
    },
    // Payment transaction ID
    transactionId: {
        type: String,
        trim: true
    },
    // Paid at
    paidAt: {
        type: Date
    },
    // Paid by
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Notes
    notes: {
        type: String,
        trim: true
    },
    // Commissions included in this request
    commissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commission'
    }]
}, {
    timestamps: true,
    collection: 'withdraw_requests'
});

// Indexes
withdrawRequestSchema.index({ affiliate: 1 });
withdrawRequestSchema.index({ status: 1 });
withdrawRequestSchema.index({ createdAt: -1 });
withdrawRequestSchema.index({ affiliate: 1, status: 1 });

// Method to approve request
withdrawRequestSchema.methods.approve = async function (reviewedBy, notes = null) {
    this.status = 'approved';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    if (notes) {
        this.notes = notes;
    }
    return await this.save();
};

// Method to reject request
withdrawRequestSchema.methods.reject = async function (reviewedBy, reason) {
    this.status = 'rejected';
    this.reviewedBy = reviewedBy;
    this.reviewedAt = new Date();
    this.rejectionReason = reason;
    return await this.save();
};

// Method to mark as paid
withdrawRequestSchema.methods.markAsPaid = async function (paidBy, transactionId = null) {
    this.status = 'paid';
    this.paidAt = new Date();
    this.paidBy = paidBy;
    if (transactionId) {
        this.transactionId = transactionId;
    }

    // Mark all commissions as paid
    const Commission = mongoose.model('Commission');
    await Commission.updateMany(
        { _id: { $in: this.commissions } },
        {
            $set: {
                status: 'paid',
                paidAt: new Date(),
                paidBy: paidBy,
                withdrawRequest: this._id
            }
        }
    );

    return await this.save();
};

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema);

