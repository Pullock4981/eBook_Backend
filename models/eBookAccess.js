/**
 * eBook Access Model
 * Tracks user access to eBooks with IP and device restrictions
 */

const mongoose = require('mongoose');

const eBookAccessSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order is required']
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    // IP Address tracking
    ipAddress: {
        type: String,
        required: [true, 'IP address is required']
    },
    // Device fingerprinting
    deviceFingerprint: {
        type: String,
        required: [true, 'Device fingerprint is required']
    },
    // Access token for secure PDF access
    accessToken: {
        type: String,
        required: [true, 'Access token is required'],
        unique: true
    },
    // Token expiry
    tokenExpiry: {
        type: Date,
        required: [true, 'Token expiry is required']
    },
    // Access tracking
    lastAccess: {
        type: Date,
        default: Date.now
    },
    accessCount: {
        type: Number,
        default: 0
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    // Security flags
    ipChanged: {
        type: Boolean,
        default: false
    },
    deviceChanged: {
        type: Boolean,
        default: false
    },
    // Allowed IPs (for dynamic IP handling)
    allowedIPs: [{
        type: String,
        default: []
    }],
    // Allowed devices (if multiple device support enabled)
    allowedDevices: [{
        type: String,
        default: []
    }]
}, {
    timestamps: true,
    collection: 'ebook_access'
});

// Indexes
eBookAccessSchema.index({ user: 1, product: 1 });
eBookAccessSchema.index({ accessToken: 1 }, { unique: true });
eBookAccessSchema.index({ order: 1 });
eBookAccessSchema.index({ ipAddress: 1 });
eBookAccessSchema.index({ deviceFingerprint: 1 });
eBookAccessSchema.index({ tokenExpiry: 1 });
eBookAccessSchema.index({ isActive: 1 });

// Method to check if access is valid
eBookAccessSchema.methods.isAccessValid = function (currentIP, currentDevice) {
    // Check if active
    if (!this.isActive) {
        return { valid: false, reason: 'Access is not active' };
    }

    // Check token expiry
    if (new Date() > this.tokenExpiry) {
        return { valid: false, reason: 'Access token has expired' };
    }

    // Check IP (allow if in allowedIPs or matches original)
    const ipAllowed = this.allowedIPs.includes(currentIP) || this.ipAddress === currentIP;
    if (!ipAllowed) {
        return { valid: false, reason: 'IP address not authorized' };
    }

    // Check device (allow if in allowedDevices or matches original)
    const deviceAllowed = this.allowedDevices.includes(currentDevice) || this.deviceFingerprint === currentDevice;
    if (!deviceAllowed) {
        return { valid: false, reason: 'Device not authorized' };
    }

    return { valid: true };
};

// Method to update access
eBookAccessSchema.methods.updateAccess = async function (currentIP, currentDevice) {
    // Check if IP changed
    if (this.ipAddress !== currentIP && !this.allowedIPs.includes(currentIP)) {
        this.ipChanged = true;
        // Optionally add to allowedIPs if policy allows
        if (process.env.EBOOK_ALLOW_IP_CHANGE === 'true') {
            this.allowedIPs.push(currentIP);
        }
    }

    // Check if device changed
    if (this.deviceFingerprint !== currentDevice && !this.allowedDevices.includes(currentDevice)) {
        this.deviceChanged = true;
        // Optionally add to allowedDevices if policy allows
        if (process.env.EBOOK_ALLOW_DEVICE_CHANGE === 'true') {
            this.allowedDevices.push(currentDevice);
        }
    }

    this.lastAccess = new Date();
    this.accessCount += 1;
    return await this.save();
};

module.exports = mongoose.model('eBookAccess', eBookAccessSchema);

