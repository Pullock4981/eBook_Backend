/**
 * OTP Service Utility
 * Handles OTP generation, validation, and SMS sending
 * Basic structure - will be expanded in Part 5 with SMS API integration
 */

const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');

/**
 * Generate random OTP
 * @param {Number} length - OTP length (default: 6)
 * @returns {String} - Generated OTP
 */
const generateOTP = (length = 6) => {
    // Generate random OTP using crypto
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    return otp;
};

/**
 * Calculate OTP expiry date
 * @param {Number} minutes - Expiry time in minutes (default: 5)
 * @returns {Date} - Expiry date
 */
const getOTPExpiry = (minutes = 5) => {
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || minutes;
    return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

/**
 * Save OTP to user record
 * @param {String} mobile - Mobile number
 * @param {String} otp - OTP code
 * @returns {Promise<Object>} - Updated user document
 */
const saveOTP = async (mobile, otp) => {
    const otpExpiry = getOTPExpiry();
    return await userRepository.updateOTP(mobile, otp, otpExpiry);
};

/**
 * Send OTP via SMS
 * TODO: Integrate with SMS API provider in Part 5
 * @param {String} mobile - Mobile number
 * @param {String} otp - OTP code
 * @returns {Promise<Object>} - SMS sending result
 */
const sendOTP = async (mobile, otp) => {
    // TODO: Integrate SMS API (Twilio, local provider, etc.)
    // For now, just log the OTP (development only)
    console.log(`📱 OTP for ${mobile}: ${otp}`);
    console.log(`⏰ OTP expires in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes`);

    // In production, this should call SMS API
    // Example:
    // const axios = require('axios');
    // return await axios.post(process.env.SMS_API_URL, {
    //   mobile,
    //   message: `Your OTP is: ${otp}`,
    //   api_key: process.env.SMS_API_KEY
    // });

    return {
        success: true,
        message: 'OTP sent successfully (logged to console in development)'
    };
};

/**
 * Generate and send OTP to user
 * @param {String} mobile - Mobile number
 * @returns {Promise<Object>} - Result with OTP info
 */
const generateAndSendOTP = async (mobile) => {
    // Generate OTP
    const otpLength = parseInt(process.env.OTP_LENGTH) || 6;
    const otp = generateOTP(otpLength);

    // Save OTP to user record
    await saveOTP(mobile, otp);

    // Send OTP via SMS
    await sendOTP(mobile, otp);

    return {
        success: true,
        otpExpiry: getOTPExpiry(),
        message: 'OTP sent successfully'
    };
};

/**
 * Verify OTP
 * @param {String} mobile - Mobile number
 * @param {String} otp - OTP code to verify
 * @returns {Promise<Object>} - Verification result
 */
const verifyOTP = async (mobile, otp) => {
    // Get user with OTP
    const user = await userRepository.findByMobile(mobile, false, true);

    if (!user) {
        throw new Error('User not found');
    }

    // Check if OTP is valid
    if (!user.isOTPValid(otp)) {
        throw new Error('Invalid or expired OTP');
    }

    // Clear OTP after successful verification
    await user.clearOTP();

    return {
        success: true,
        message: 'OTP verified successfully'
    };
};

module.exports = {
    generateOTP,
    getOTPExpiry,
    saveOTP,
    sendOTP,
    generateAndSendOTP,
    verifyOTP
};

