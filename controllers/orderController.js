/**
 * Order Controller
 * Presentation layer - Handles HTTP requests and responses for order operations
 */

const orderService = require('../services/orderService');

/**
 * Create order from cart
 * POST /api/orders
 */
exports.createOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.userId, req.body);
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.id, req.userId);
        res.status(200).json({
            success: true,
            message: 'Order retrieved successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get order by order ID (ORD-XXXXXX)
 * GET /api/orders/order-id/:orderId
 */
exports.getOrderByOrderId = async (req, res, next) => {
    try {
        const order = await orderService.getOrderByOrderId(req.params.orderId, req.userId);
        res.status(200).json({
            success: true,
            message: 'Order retrieved successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user orders
 * GET /api/orders
 */
exports.getUserOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await orderService.getUserOrders(req.userId, page, limit);
        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: result.orders,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all orders (Admin)
 * GET /api/orders/admin/all
 */
exports.getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;
        const result = await orderService.getAllOrders(filters, page, limit);
        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: result.orders,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update order status (Admin)
 * PUT /api/orders/:id/status
 */
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(req.params.id, status);
        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update payment status
 * PUT /api/orders/:id/payment-status
 */
exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { paymentStatus, transactionId } = req.body;
        const order = await orderService.updatePaymentStatus(req.params.id, paymentStatus, transactionId);
        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

