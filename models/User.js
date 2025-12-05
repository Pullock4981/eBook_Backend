/**
 * User Model
 * Schema for user authentication and profile management
 * Supports mobile-based authentication with OTP
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        trim: true,
        match: [/^01[3-9]\d{8}$/, 'Invalid mobile number format (must be 01XXXXXXXXX)']
    },
    otp: {
        type: String,
        default: null,
        select: false // Don't include OTP in queries by default
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        select: false, // Don't include password in queries by default
        minlength: [6, 'Password must be at least 6 characters']
    },
    profile: {
        name: {
            type: String,
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true, // Allow multiple null values but unique for non-null
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
        },
        avatar: {
            type: String,
            default: null
        }
    },
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: 'users'
});

// Indexes for better query performance
userSchema.index({ mobile: 1 }, { unique: true });
userSchema.index({ 'profile.email': 1 }, { sparse: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

// Method to hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified (or new)
    if (!this.isModified('password')) {
        return next();
    }

    // Hash password with cost of 12
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if OTP is valid
userSchema.methods.isOTPValid = function (otp) {
    if (!this.otp || !this.otpExpiry) {
        return false;
    }

    // Check if OTP matches and not expired
    return this.otp === otp && this.otpExpiry > new Date();
};

// Method to clear OTP
userSchema.methods.clearOTP = function () {
    this.otp = null;
    this.otpExpiry = null;
    return this.save();
};

// Export model
module.exports = mongoose.model('User', userSchema);

