/**
 * Address Model
 * Schema for user shipping addresses (for physical product delivery)
 */

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    label: {
        type: String,
        required: [true, 'Address label is required'],
        trim: true,
        maxlength: [50, 'Label cannot exceed 50 characters'],
        enum: ['Home', 'Office', 'Other']
    },
    recipientName: {
        type: String,
        required: [true, 'Recipient name is required'],
        trim: true,
        maxlength: [100, 'Recipient name cannot exceed 100 characters']
    },
    recipientMobile: {
        type: String,
        required: [true, 'Recipient mobile is required'],
        trim: true,
        match: [/^01[3-9]\d{8}$/, 'Invalid mobile number format']
    },
    addressLine1: {
        type: String,
        required: [true, 'Address line 1 is required'],
        trim: true,
        maxlength: [200, 'Address line 1 cannot exceed 200 characters']
    },
    addressLine2: {
        type: String,
        trim: true,
        maxlength: [200, 'Address line 2 cannot exceed 200 characters']
    },
    area: {
        type: String,
        required: [true, 'Area is required'],
        trim: true,
        maxlength: [100, 'Area cannot exceed 100 characters']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters']
    },
    district: {
        type: String,
        required: [true, 'District is required'],
        trim: true,
        maxlength: [100, 'District cannot exceed 100 characters']
    },
    postalCode: {
        type: String,
        trim: true,
        maxlength: [10, 'Postal code cannot exceed 10 characters']
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'addresses'
});

// Indexes
addressSchema.index({ user: 1 });
addressSchema.index({ user: 1, isDefault: 1 });
addressSchema.index({ createdAt: -1 });

// Ensure only one default address per user
addressSchema.pre('save', async function (next) {
    if (this.isDefault && this.isNew) {
        // If this is being set as default, unset other defaults for this user
        await mongoose.model('Address').updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }
    next();
});

module.exports = mongoose.model('Address', addressSchema);

