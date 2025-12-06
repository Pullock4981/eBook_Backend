/**
 * SMS Service
 * Handles SMS sending through various providers
 * Supports multiple SMS providers with fallback mechanism
 */

const axios = require('axios');

/**
 * SMS Provider Types
 */
const SMS_PROVIDERS = {
    TWILIO: 'twilio',
    NEXMO: 'nexmo',
    LOCAL: 'local', // Local Bangladesh providers
    CUSTOM: 'custom'
};

/**
 * Get SMS provider from environment
 * @returns {String} - Provider name
 */
const getProvider = () => {
    return process.env.SMS_PROVIDER || 'local';
};

/**
 * Format mobile number for SMS
 * @param {String} mobile - Mobile number
 * @returns {String} - Formatted mobile number
 */
const formatMobile = (mobile) => {
    // Remove any spaces or dashes
    let formatted = mobile.replace(/\s|-/g, '');

    // If starts with 0, replace with country code
    if (formatted.startsWith('0')) {
        formatted = '88' + formatted;
    }

    // If doesn't start with country code, add it
    if (!formatted.startsWith('88')) {
        formatted = '88' + formatted;
    }

    return formatted;
};

/**
 * Send SMS via Twilio
 * @param {String} mobile - Mobile number
 * @param {String} message - SMS message
 * @returns {Promise<Object>} - SMS sending result
 */
const sendViaTwilio = async (mobile, message) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        throw new Error('Twilio credentials not configured');
    }

    const formattedMobile = formatMobile(mobile);

    try {
        const response = await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            new URLSearchParams({
                To: `+${formattedMobile}`,
                From: fromNumber,
                Body: message
            }),
            {
                auth: {
                    username: accountSid,
                    password: authToken
                }
            }
        );

        return {
            success: true,
            provider: 'twilio',
            messageId: response.data.sid,
            status: response.data.status
        };
    } catch (error) {
        throw new Error(`Twilio SMS failed: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Send SMS via Nexmo (Vonage)
 * @param {String} mobile - Mobile number
 * @param {String} message - SMS message
 * @returns {Promise<Object>} - SMS sending result
 */
const sendViaNexmo = async (mobile, message) => {
    const apiKey = process.env.NEXMO_API_KEY;
    const apiSecret = process.env.NEXMO_API_SECRET;
    const fromNumber = process.env.NEXMO_FROM_NUMBER;

    if (!apiKey || !apiSecret || !fromNumber) {
        throw new Error('Nexmo credentials not configured');
    }

    const formattedMobile = formatMobile(mobile);

    try {
        const response = await axios.post('https://rest.nexmo.com/sms/json', {
            api_key: apiKey,
            api_secret: apiSecret,
            to: formattedMobile,
            from: fromNumber,
            text: message
        });

        if (response.data.messages[0].status !== '0') {
            throw new Error(`Nexmo SMS failed: ${response.data.messages[0]['error-text']}`);
        }

        return {
            success: true,
            provider: 'nexmo',
            messageId: response.data.messages[0]['message-id'],
            status: 'sent'
        };
    } catch (error) {
        throw new Error(`Nexmo SMS failed: ${error.message}`);
    }
};

/**
 * Send SMS via Local Provider (Generic API)
 * Supports most Bangladesh SMS providers
 * @param {String} mobile - Mobile number
 * @param {String} message - SMS message
 * @returns {Promise<Object>} - SMS sending result
 */
const sendViaLocalProvider = async (mobile, message) => {
    const apiUrl = process.env.SMS_API_URL;
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID;

    if (!apiUrl || !apiKey) {
        // Fallback to console log in development
        console.log(`📱 SMS to ${mobile}: ${message}`);
        console.log(`⚠️ SMS API not configured. Using development mode.`);
        return {
            success: true,
            provider: 'console',
            message: 'SMS logged to console (development mode)'
        };
    }

    const formattedMobile = formatMobile(mobile);

    try {
        // Generic API structure - adjust based on your provider
        const response = await axios.post(apiUrl, {
            mobile: formattedMobile,
            message: message,
            api_key: apiKey,
            sender_id: senderId || 'eBook',
            type: 'text'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check response based on provider format
        // Adjust this based on your SMS provider's response format
        if (response.data.success || response.data.status === 'success' || response.status === 200) {
            return {
                success: true,
                provider: 'local',
                messageId: response.data.message_id || response.data.id || 'unknown',
                status: 'sent'
            };
        } else {
            throw new Error(`SMS API returned error: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        // Log error but don't fail completely in development
        console.error('SMS sending error:', error.message);

        // In development, fallback to console
        if (process.env.NODE_ENV === 'development') {
            console.log(`📱 SMS to ${mobile}: ${message}`);
            return {
                success: true,
                provider: 'console',
                message: 'SMS logged to console (API failed, development mode)'
            };
        }

        throw new Error(`SMS sending failed: ${error.message}`);
    }
};

/**
 * Send SMS via Custom Provider
 * @param {String} mobile - Mobile number
 * @param {String} message - SMS message
 * @returns {Promise<Object>} - SMS sending result
 */
const sendViaCustom = async (mobile, message) => {
    // Implement custom provider logic here
    // This is a placeholder for custom SMS provider integration

    const customApiUrl = process.env.CUSTOM_SMS_API_URL;
    const customApiKey = process.env.CUSTOM_SMS_API_KEY;

    if (!customApiUrl || !customApiKey) {
        throw new Error('Custom SMS provider not configured');
    }

    // Add your custom provider implementation here
    // Example:
    // const response = await axios.post(customApiUrl, {
    //   mobile,
    //   message,
    //   api_key: customApiKey
    // });

    throw new Error('Custom SMS provider not implemented');
};

/**
 * Send SMS using configured provider
 * @param {String} mobile - Mobile number
 * @param {String} message - SMS message
 * @returns {Promise<Object>} - SMS sending result
 */
const sendSMS = async (mobile, message) => {
    const provider = getProvider();

    try {
        switch (provider) {
            case SMS_PROVIDERS.TWILIO:
                return await sendViaTwilio(mobile, message);

            case SMS_PROVIDERS.NEXMO:
                return await sendViaNexmo(mobile, message);

            case SMS_PROVIDERS.LOCAL:
                return await sendViaLocalProvider(mobile, message);

            case SMS_PROVIDERS.CUSTOM:
                return await sendViaCustom(mobile, message);

            default:
                // Default to local provider
                return await sendViaLocalProvider(mobile, message);
        }
    } catch (error) {
        // Log error for monitoring
        console.error(`SMS sending failed (${provider}):`, error.message);

        // In development, fallback to console
        if (process.env.NODE_ENV === 'development') {
            console.log(`📱 SMS to ${mobile}: ${message}`);
            console.log(`⚠️ SMS provider failed, using console fallback`);
            return {
                success: true,
                provider: 'console',
                message: 'SMS logged to console (provider failed, development mode)'
            };
        }

        // In production, rethrow error
        throw error;
    }
};

/**
 * Send OTP via SMS
 * @param {String} mobile - Mobile number
 * @param {String} otp - OTP code
 * @returns {Promise<Object>} - SMS sending result
 */
const sendOTP = async (mobile, otp) => {
    // Format OTP message
    const message = `Your OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes. Do not share this code with anyone.`;

    // Send SMS
    const result = await sendSMS(mobile, message);

    return result;
};

module.exports = {
    sendSMS,
    sendOTP,
    SMS_PROVIDERS,
    formatMobile
};

