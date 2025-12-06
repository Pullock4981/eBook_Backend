/**
 * IP Restriction Middleware
 * Restricts eBook access based on IP address and device
 */

const eBookAccessRepository = require('../repositories/eBookAccessRepository');
const { getClientIP, generateFingerprint } = require('../utils/deviceFingerprint');

/**
 * Middleware to check IP and device restrictions for eBook access
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const checkeBookAccess = async (req, res, next) => {
    try {
        // Get access token from query or header
        const accessToken = req.query.token || req.headers['x-access-token'];

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Get current IP and device fingerprint
        const currentIP = getClientIP(req);
        const currentDevice = generateFingerprint(req);

        // Get eBook access record
        const access = await eBookAccessRepository.findByToken(accessToken);

        if (!access) {
            return res.status(404).json({
                success: false,
                message: 'Invalid access token'
            });
        }

        // Check if user is authorized
        if (req.userId && access.user.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to this eBook'
            });
        }

        // Validate access
        const validation = access.isAccessValid(currentIP, currentDevice);

        if (!validation.valid) {
            return res.status(403).json({
                success: false,
                message: validation.reason || 'Access denied'
            });
        }

        // Update access tracking
        await access.updateAccess(currentIP, currentDevice);

        // Attach access info to request
        req.eBookAccess = access;
        req.currentIP = currentIP;
        req.currentDevice = currentDevice;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    checkeBookAccess
};

