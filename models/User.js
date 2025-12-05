/**
 * User Model
 * Schema for user authentication and profile management
 * This is a placeholder - will be fully implemented in Part 4
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        trim: true,
        match: [/^01[3-9]\d{8}$/, 'Invalid mobile number format']
    },
    otp: {
        type: String,
        default: null
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
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
        },
        avatar: {
            type: String,
            default: null
        }
    }
}, {
    timestamps: true,
    collection: 'users'
});

// Indexes for better query performance
userSchema.index({ mobile: 1 }, { unique: true });
userSchema.index({ 'profile.email': 1 });
userSchema.index({ createdAt: -1 });

// Export model
module.exports = mongoose.model('User', userSchema);

