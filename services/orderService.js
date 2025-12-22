/**
 * Order Service
 * Business logic layer for Order operations
 */

const orderRepository = require('../repositories/orderRepository');
const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const addressRepository = require('../repositories/addressRepository');
const couponService = require('./couponService');

/**
 * Create order from cart
 * @param {String} userId - User ID
 * @param {Object} orderData - Order data (shippingAddress, paymentMethod, etc.)
 * @returns {Promise<Object>} - Created order
 */
const createOrder = async (userId, orderData) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    // Validate user ID
    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    // Get cart
    const cart = await cartRepository.findByUser(userIdStr);
    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    // Validate shipping address for physical products
    const hasPhysicalProducts = cart.items.some(item => {
        const product = item.product;
        return product && product.type === 'physical';
    });

    if (hasPhysicalProducts) {
        if (!orderData.shippingAddress) {
            throw new Error('Shipping address is required for physical products');
        }

        // Validate address belongs to user
        const address = await addressRepository.findById(orderData.shippingAddress);
        if (!address) {
            throw new Error('Shipping address not found');
        }
        if (address.user.toString() !== userIdStr) {
            throw new Error('Shipping address does not belong to this user');
        }
    }

    // Validate payment method
    const validPaymentMethods = ['bkash', 'nagad', 'cash_on_delivery'];
    if (!orderData.paymentMethod || !validPaymentMethods.includes(orderData.paymentMethod)) {
        throw new Error('Invalid payment method');
    }

    // Prepare order items
    const orderItems = [];
    let subtotal = 0;
    let shipping = 0;

    for (const cartItem of cart.items) {
        const product = await productRepository.findById(cartItem.product._id || cartItem.product);

        if (!product) {
            throw new Error(`Product ${cartItem.product._id || cartItem.product} not found`);
        }
        if (!product.isActive) {
            throw new Error(`Product ${product.name} is not available`);
        }

        // Check stock for physical products
        if (product.type === 'physical') {
            if (product.stock < cartItem.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`);
            }
        }

        // Calculate item price
        const itemPrice = cartItem.price; // Use price from cart (snapshot)
        const itemTotal = itemPrice * cartItem.quantity;
        subtotal += itemTotal;

        // Calculate shipping (if physical product)
        if (product.type === 'physical') {
            // TODO: Calculate shipping based on address/weight
            // For now, default shipping
            shipping += 50; // Default shipping per item
        }

        // Prepare productSnapshot as JSON string
        const productSnapshot = JSON.stringify({
            name: product.name || '',
            type: product.type || '',
            thumbnail: (product.thumbnail || (product.images && product.images[0]) || null) || null,
            digitalFile: product.digitalFile || null
        });

        orderItems.push({
            product: product._id,
            quantity: cartItem.quantity,
            price: itemPrice,
            type: product.type,
            productSnapshot: productSnapshot
        });
    }

    // Calculate discount (from coupon if applied)
    let discount = cart.discount || 0;
    let couponId = null;
    let couponCode = null;

    if (cart.coupon) {
        try {
            const coupon = await couponService.getCouponById(cart.coupon._id || cart.coupon);
            if (coupon) {
                couponId = coupon._id;
                couponCode = coupon.code;
                // Discount already calculated in cart
                // Increment coupon usage
                await couponService.incrementCouponUsage(couponId);
                
                // Track earnings for affiliate coupons
                // Earnings = 10% of discount amount (can be configured)
                if (coupon.affiliate && coupon.approvalStatus === 'approved') {
                    const earningsRate = 0.10; // 10% of discount goes to affiliate
                    const earnings = discount * earningsRate;
                    await couponService.addCouponEarnings(couponId, earnings);
                }
            }
        } catch (error) {
            // Coupon not found - ignore
            discount = 0;
        }
    }

    // Calculate total
    const total = subtotal - discount + shipping;

    // Generate order ID before creating
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(100000 + Math.random() * 900000);
    const orderId = `ORD-${dateStr}-${random}`.toUpperCase();

    // Create order
    const order = await orderRepository.create({
        orderId, // Explicitly set orderId to avoid validation error
        user: userIdStr,
        items: orderItems,
        subtotal,
        discount,
        shipping,
        total,
        coupon: couponId,
        couponCode,
        shippingAddress: orderData.shippingAddress || null,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        notes: orderData.notes || null,
        affiliate: orderData.affiliate || null,
        referralCode: orderData.referralCode || null
    });

    // Update product stock (for physical products)
    for (const item of orderItems) {
        if (item.type === 'physical') {
            await productRepository.updateStock(item.product, -item.quantity);
        }
    }

    // Clear cart after order creation
    await cartRepository.clearCart(userIdStr);

    return await orderRepository.findById(order._id);
};

/**
 * Get order by ID
 * @param {String} orderId - Order ID
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Order document
 */
const getOrderById = async (orderId, userId = null) => {
    if (!orderId || orderId.length !== 24) {
        throw new Error('Invalid order ID format');
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    // Check if user is authorized (user can only see their own orders unless admin)
    if (userId) {
        const userIdStr = userId?.toString ? userId.toString() : String(userId);
        if (order.user._id.toString() !== userIdStr) {
            throw new Error('Unauthorized access to this order');
        }
    }

    return order;
};

/**
 * Get order by order ID (ORD-XXXXXX)
 * @param {String} orderIdString - Order ID string
 * @param {String} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Order document
 */
const getOrderByOrderId = async (orderIdString, userId = null) => {
    if (!orderIdString) {
        throw new Error('Order ID is required');
    }

    const order = await orderRepository.findByOrderId(orderIdString);
    if (!order) {
        throw new Error('Order not found');
    }

    // Check if user is authorized
    if (userId) {
        const userIdStr = userId?.toString ? userId.toString() : String(userId);
        if (order.user._id.toString() !== userIdStr) {
            throw new Error('Unauthorized access to this order');
        }
    }

    return order;
};

/**
 * Get user orders
 * @param {String} userId - User ID
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Orders with pagination
 */
const getUserOrders = async (userId, page = 1, limit = 10) => {
    // Convert to string if it's an ObjectId
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    if (!userIdStr || userIdStr.length !== 24) {
        throw new Error('Invalid user ID format');
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    return await orderRepository.findByUser(userIdStr, pageNum, limitNum);
};

/**
 * Get all orders (Admin)
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} - Orders with pagination
 */
const getAllOrders = async (filters = {}, page = 1, limit = 10) => {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    return await orderRepository.getAll(filters, pageNum, limitNum);
};

/**
 * Update order status (Admin)
 * @param {String} orderId - Order ID
 * @param {String} status - New status
 * @returns {Promise<Object>} - Updated order
 */
const updateOrderStatus = async (orderId, status) => {
    if (!orderId || orderId.length !== 24) {
        throw new Error('Invalid order ID format');
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    // If cancelling, restore stock
    if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
        for (const item of order.items) {
            if (item.type === 'physical') {
                await productRepository.updateStock(item.product, item.quantity);
            }
        }
    }

    return await orderRepository.updateStatus(orderId, status);
};

/**
 * Update payment status
 * @param {String} orderId - Order ID
 * @param {String} paymentStatus - New payment status
 * @param {String} transactionId - Payment transaction ID
 * @returns {Promise<Object>} - Updated order
 */
const updatePaymentStatus = async (orderId, paymentStatus, transactionId = null, req = null) => {
    if (!orderId || orderId.length !== 24) {
        throw new Error('Invalid order ID format');
    }

    const validStatuses = ['pending', 'processing', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
        throw new Error('Invalid payment status');
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    // If payment successful, update order status and create eBook access
    if (paymentStatus === 'paid' && order.paymentStatus !== 'paid') {
        await orderRepository.updateStatus(orderId, 'confirmed');

        // Create eBook access for digital products (lazy load to avoid circular dependency)
        try {
            const eBookService = require('./eBookService');
            await eBookService.createAccessForOrder(orderId, req);
        } catch (error) {
            // Log error but don't fail payment update
            console.error('Failed to create eBook access:', error.message);
        }

        // Create affiliate commission based on coupon code (priority) or referral code
        // Priority: Coupon code > Referral code
        let affiliateId = null;
        let commissionSource = null;
        let sourceCode = null;
        
        // First, check if order has an affiliate coupon
        if (order.coupon) {
            try {
                const coupon = await couponService.getCouponById(order.coupon);
                if (coupon && coupon.affiliate && coupon.approvalStatus === 'approved' && coupon.isActive) {
                    affiliateId = coupon.affiliate._id || coupon.affiliate;
                    commissionSource = 'coupon';
                    sourceCode = coupon.code;
                    console.log(`Commission will be created for affiliate ${affiliateId} from coupon ${coupon.code}`);
                }
            } catch (error) {
                console.error('Failed to get coupon for commission:', error.message);
            }
        }
        
        // If no coupon affiliate, check referral code (fallback)
        if (!affiliateId && order.referralCode) {
            try {
                const affiliateService = require('./affiliateService');
                await affiliateService.createCommission(
                    order.referralCode,
                    orderId,
                    order.user.toString(),
                    order.total
                );
                console.log(`Commission created from referral code ${order.referralCode}`);
            } catch (error) {
                console.error('Failed to create commission from referral code:', error.message);
            }
        } else if (affiliateId) {
            // Create commission from coupon affiliate
            try {
                const affiliateService = require('./affiliateService');
                const affiliateRepository = require('../repositories/affiliateRepository');
                const commissionRepository = require('../repositories/commissionRepository');
                
                // Get affiliate details
                const affiliate = await affiliateRepository.findById(affiliateId);
                if (!affiliate || affiliate.status !== 'active') {
                    console.log(`Affiliate ${affiliateId} not found or not active`);
                    return await orderRepository.updatePaymentStatus(orderId, paymentStatus, transactionId);
                }
                
                // Check if commission already exists for this order
                const existingCommission = await commissionRepository.findByOrder(orderId);
                if (existingCommission) {
                    console.log(`Commission already exists for order ${orderId}`);
                    return await orderRepository.updatePaymentStatus(orderId, paymentStatus, transactionId);
                }
                
                // Calculate commission based on order total
                const commissionAmount = (order.total * affiliate.commissionRate) / 100;
                
                // Create commission record
                await commissionRepository.create({
                    affiliate: affiliateId,
                    order: orderId,
                    referredUser: order.user,
                    orderAmount: order.total,
                    amount: commissionAmount,
                    commissionRate: affiliate.commissionRate,
                    status: 'pending',
                    notes: `Commission from coupon code: ${sourceCode}`
                });
                
                // Update affiliate statistics
                await affiliate.updateStats();
                
                console.log(`Commission created: ${commissionAmount} (${affiliate.commissionRate}% of ${order.total}) for affiliate ${affiliateId} from coupon ${sourceCode}`);
            } catch (error) {
                // Log error but don't fail payment update
                console.error('Failed to create affiliate commission from coupon:', error.message);
            }
        }
    }

    return await orderRepository.updatePaymentStatus(orderId, paymentStatus, transactionId);
};

module.exports = {
    createOrder,
    getOrderById,
    getOrderByOrderId,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus
};

