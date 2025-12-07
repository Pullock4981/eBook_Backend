/**
 * Order Model
 * Schema for customer orders
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    type: {
        type: String,
        enum: ['physical', 'digital'],
        required: true
    },
    // Store product details at time of order (for history)
    // Stored as JSON string to preserve exact snapshot
    productSnapshot: {
        type: String,
        default: null
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    items: [orderItemSchema],

    // Pricing
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
    },
    shipping: {
        type: Number,
        default: 0,
        min: [0, 'Shipping cannot be negative']
    },
    total: {
        type: Number,
        required: [true, 'Total is required'],
        min: [0, 'Total cannot be negative']
    },

    // Coupon
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null
    },
    couponCode: {
        type: String,
        default: null
    },

    // Shipping address (for physical products)
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        default: null
    },

    // Payment
    paymentMethod: {
        type: String,
        enum: ['sslcommerz', 'bkash', 'nagad', 'cash_on_delivery'],
        required: [true, 'Payment method is required']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentTransactionId: {
        type: String,
        default: null
    },
    paymentDate: {
        type: Date,
        default: null
    },

    // Order status
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },

    // Tracking
    trackingNumber: {
        type: String,
        default: null
    },
    shippedDate: {
        type: Date,
        default: null
    },
    deliveredDate: {
        type: Date,
        default: null
    },

    // Notes
    notes: {
        type: String,
        default: null,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },

    // Affiliate tracking
    affiliate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Affiliate',
        default: null
    },
    referralCode: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    collection: 'orders'
});

// Generate order ID before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        // Generate unique order ID: ORD-YYYYMMDD-XXXXXX
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(100000 + Math.random() * 900000);
        this.orderId = `ORD-${dateStr}-${random}`.toUpperCase();
    }
    next();
});

// Indexes
orderSchema.index({ orderId: 1 }, { unique: true });
orderSchema.index({ user: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ affiliate: 1 });
orderSchema.index({ referralCode: 1 });

// Virtual for order summary
orderSchema.virtual('summary').get(function () {
    return {
        orderId: this.orderId,
        total: this.total,
        status: this.orderStatus,
        paymentStatus: this.paymentStatus,
        itemCount: this.items.length
    };
});

// Ensure virtuals are included in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);

