/**
 * Role-Based Access Control Middleware
 * Checks user roles and permissions
 */

/**
 * Check if user has required role
 * @param {...String} roles - Allowed roles (e.g., 'admin', 'user')
 * @returns {Function} - Express middleware function
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        // Check if user is authenticated (should use after authenticate middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user has required role
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

/**
 * Check if user is admin
 * Shorthand for requireRole('admin')
 */
const requireAdmin = requireRole('admin');

/**
 * Check if user is authenticated (not admin-specific)
 * Can be used for user-only routes
 */
const requireUser = requireRole('user', 'admin');

module.exports = {
    requireRole,
    requireAdmin,
    requireUser
};

