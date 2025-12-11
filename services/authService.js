/**
 * Authentication Service
 * Business logic layer for authentication operations
 * Handles registration, login, OTP verification
 */

const userRepository = require('../repositories/userRepository');
const otpService = require('../utils/otpService');
const { generateToken } = require('../config/jwt');

/**
 * Register a new user (mobile number based)
 * Sends OTP for verification
 * @param {String} mobile - Mobile number
 * @param {String} name - Full name
 * @param {String} password - Password
 * @returns {Promise<Object>} - Registration result
 */
const register = async (mobile, name, password) => {
    // Check if user already exists
    const existingUser = await userRepository.findByMobile(mobile);

    if (existingUser && existingUser.isVerified) {
        throw new Error('User already registered and verified');
    }

    // Prepare user data
    const userData = {
        mobile,
        isVerified: false
    };

    // Add name to profile if provided
    if (name) {
        userData.profile = {
            name: name.trim()
        };
    }

    // Add password if provided
    if (password) {
        userData.password = password;
    }

    // If user exists but not verified, update user data and resend OTP
    // Otherwise create new user
    let user;
    let otpResult;
    if (existingUser) {
        // Update existing user with name and password if provided
        if (name || password) {
            const updateData = {};
            if (name) {
                updateData.profile = {
                    ...(existingUser.profile || {}),
                    name: name.trim()
                };
            }
            if (password) {
                updateData.password = password;
            }
            await userRepository.updateById(existingUser._id, updateData);
        }
        // Resend OTP for unverified user
        otpResult = await otpService.generateAndSendOTP(mobile);
        user = await userRepository.findByMobile(mobile);
    } else {
        // Create new user
        user = await userRepository.create(userData);

        // Generate and send OTP
        otpResult = await otpService.generateAndSendOTP(mobile);
    }

    return {
        success: true,
        message: 'OTP sent to your mobile number',
        mobile: user.mobile,
        otpExpiry: otpService.getOTPExpiry(),
        // Return OTP for frontend display (SMS will be implemented later)
        ...(otpResult?.otp && {
            otp: otpResult.otp
        })
    };
};

/**
 * Request OTP for login (passwordless login)
 * @param {String} mobile - Mobile number
 * @returns {Promise<Object>} - OTP sending result
 */
const requestOTP = async (mobile) => {
    // Check if user exists
    const user = await userRepository.findByMobile(mobile);

    if (!user) {
        throw new Error('User not found. Please register first.');
    }

    // Generate and send OTP
    const otpResult = await otpService.generateAndSendOTP(mobile);

    return {
        success: true,
        message: 'OTP sent to your mobile number',
        mobile: user.mobile,
        otpExpiry: otpService.getOTPExpiry(),
        // Return OTP for frontend display (SMS will be implemented later)
        ...(otpResult?.otp && {
            otp: otpResult.otp
        })
    };
};

/**
 * Verify OTP and login user
 * @param {String} mobile - Mobile number
 * @param {String} otp - OTP code
 * @returns {Promise<Object>} - Login result with token
 */
const verifyOTPAndLogin = async (mobile, otp) => {
    // Verify OTP
    await otpService.verifyOTP(mobile, otp);

    // Get user
    const user = await userRepository.findByMobile(mobile);

    if (!user) {
        throw new Error('User not found');
    }

    // Verify user (if not already verified)
    if (!user.isVerified) {
        await userRepository.verifyUser(mobile);
        user.isVerified = true;
    }

    // Update last login
    await userRepository.updateLastLogin(user._id);

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data (without sensitive info)
    const userData = {
        _id: user._id,
        mobile: user.mobile,
        isVerified: user.isVerified,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt
    };

    return {
        success: true,
        message: 'Login successful',
        token,
        user: userData
    };
};

/**
 * Login with password (if password is set)
 * @param {String} mobile - Mobile number
 * @param {String} password - Password
 * @returns {Promise<Object>} - Login result with token
 */
const loginWithPassword = async (mobile, password) => {
    // Get user with password
    const user = await userRepository.findByMobile(mobile, true);

    if (!user) {
        throw new Error('User not found');
    }

    if (!user.isVerified) {
        throw new Error('User not verified. Please verify with OTP first.');
    }

    if (!user.password) {
        throw new Error('Password not set. Please use OTP login or set password first.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    // Update last login
    await userRepository.updateLastLogin(user._id);

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data
    const userData = {
        _id: user._id,
        mobile: user.mobile,
        isVerified: user.isVerified,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt
    };

    return {
        success: true,
        message: 'Login successful',
        token,
        user: userData
    };
};

/**
 * Resend OTP
 * @param {String} mobile - Mobile number
 * @returns {Promise<Object>} - OTP sending result
 */
const resendOTP = async (mobile) => {
    // Check if user exists
    const user = await userRepository.findByMobile(mobile);

    if (!user) {
        throw new Error('User not found');
    }

    // Generate and send new OTP
    const otpResult = await otpService.generateAndSendOTP(mobile);

    return {
        success: true,
        message: 'OTP resent to your mobile number',
        mobile: user.mobile,
        otpExpiry: otpService.getOTPExpiry(),
        // Return OTP for frontend display (SMS will be implemented later)
        ...(otpResult?.otp && {
            otp: otpResult.otp
        })
    };
};

module.exports = {
    register,
    requestOTP,
    verifyOTPAndLogin,
    loginWithPassword,
    resendOTP
};

