/**
 * Admin Analytics Service
 * Business logic layer for admin dashboard analytics
 */

const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const userRepository = require('../repositories/userRepository');
const couponRepository = require('../repositories/couponRepository');
const adminAffiliateService = require('./adminAffiliateService');

/**
 * Get dashboard overview statistics
 * @returns {Promise<Object>} - Dashboard statistics
 */
const getDashboardStats = async () => {
    try {
        const [
            usersData,
            productsData,
            ordersData,
            totalRevenue,
            recentOrders,
            affiliateStats
        ] = await Promise.all([
            userRepository.getAll({}, 1, 1),
            productRepository.getAll({ includeInactive: true }, 1, 1),
            orderRepository.getAll({}, 1, 1),
            getTotalRevenue(),
            getRecentOrders(5),
            adminAffiliateService.getAffiliateAnalytics()
        ]);

        const totalUsers = usersData.pagination.total;
        const totalProducts = productsData.pagination.total;
        const totalOrders = ordersData.pagination.total;

        // Get orders by status
        const ordersByStatus = await getOrdersByStatus();

        // Get revenue by period
        const revenueByPeriod = await getRevenueByPeriod();

        // Get top products
        const topProducts = await getTopProducts(5);

        // Get sales trends
        const salesTrends = await getSalesTrends();

        return {
            overview: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                activeAffiliates: affiliateStats.affiliates.active,
                pendingAffiliates: affiliateStats.affiliates.pending
            },
            orders: {
                byStatus: ordersByStatus,
                recent: recentOrders
            },
            revenue: {
                total: totalRevenue,
                byPeriod: revenueByPeriod,
                trends: salesTrends
            },
            products: {
                topSelling: topProducts
            },
            affiliates: affiliateStats
        };
    } catch (error) {
        throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
};

/**
 * Get total revenue
 * @returns {Promise<Number>} - Total revenue
 */
const getTotalRevenue = async () => {
    try {
        const orders = await orderRepository.getAll({ paymentStatus: 'paid' }, 1, 10000);
        return orders.orders.reduce((sum, order) => sum + order.total, 0);
    } catch (error) {
        throw new Error(`Failed to get total revenue: ${error.message}`);
    }
};

/**
 * Get recent orders
 * @param {Number} limit - Number of orders
 * @returns {Promise<Array>} - Recent orders
 */
const getRecentOrders = async (limit = 10) => {
    try {
        const result = await orderRepository.getAll({}, 1, limit);
        return result.orders.map(order => ({
            id: order._id,
            orderId: order.orderId,
            total: order.total,
            status: order.orderStatus,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt
        }));
    } catch (error) {
        throw new Error(`Failed to get recent orders: ${error.message}`);
    }
};

/**
 * Get orders by status
 * @returns {Promise<Object>} - Orders grouped by status
 */
const getOrdersByStatus = async () => {
    try {
        const orders = await orderRepository.getAll({}, 1, 10000);
        const statusCounts = {
            pending: 0,
            confirmed: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        orders.orders.forEach(order => {
            const status = order.orderStatus || 'pending';
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }
        });

        return statusCounts;
    } catch (error) {
        throw new Error(`Failed to get orders by status: ${error.message}`);
    }
};

/**
 * Get revenue by period (last 7 days, 30 days, etc.)
 * @returns {Promise<Object>} - Revenue by period
 */
const getRevenueByPeriod = async () => {
    try {
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const periods = {
            today: today,
            last7Days: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
            last30Days: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
            last90Days: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
        };

        const orders = await orderRepository.getAll({ paymentStatus: 'paid' }, 1, 10000);

        const revenue = {
            today: 0,
            last7Days: 0,
            last30Days: 0,
            last90Days: 0
        };

        orders.orders.forEach(order => {
            const orderDate = new Date(order.paymentDate || order.createdAt);
            const amount = order.total;

            if (orderDate >= periods.today) {
                revenue.today += amount;
            }
            if (orderDate >= periods.last7Days) {
                revenue.last7Days += amount;
            }
            if (orderDate >= periods.last30Days) {
                revenue.last30Days += amount;
            }
            if (orderDate >= periods.last90Days) {
                revenue.last90Days += amount;
            }
        });

        return revenue;
    } catch (error) {
        throw new Error(`Failed to get revenue by period: ${error.message}`);
    }
};

/**
 * Get top selling products
 * @param {Number} limit - Number of products
 * @returns {Promise<Array>} - Top products
 */
const getTopProducts = async (limit = 10) => {
    try {
        const orders = await orderRepository.getAll({ paymentStatus: 'paid' }, 1, 10000);

        // Count product sales
        const productSales = {};
        orders.orders.forEach(order => {
            order.items.forEach(item => {
                // Handle both populated object and ObjectId
                const productId = item.product?._id ? item.product._id.toString() : item.product.toString();
                if (!productSales[productId]) {
                    productSales[productId] = {
                        productId,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[productId].quantity += item.quantity;
                productSales[productId].revenue += item.price * item.quantity;
            });
        });

        // Sort by revenue and get top products
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);

        // Populate product details
        const productsWithDetails = await Promise.all(
            topProducts.map(async (item) => {
                const product = await productRepository.findById(item.productId);
                return {
                    product: {
                        id: product?._id,
                        name: product?.name,
                        slug: product?.slug,
                        thumbnail: product?.thumbnail
                    },
                    quantity: item.quantity,
                    revenue: item.revenue
                };
            })
        );

        return productsWithDetails;
    } catch (error) {
        throw new Error(`Failed to get top products: ${error.message}`);
    }
};

/**
 * Get sales trends (daily for last 30 days)
 * @returns {Promise<Array>} - Sales trends
 */
const getSalesTrends = async () => {
    try {
        const orders = await orderRepository.getAll({ paymentStatus: 'paid' }, 1, 10000);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Group by date
        const dailySales = {};
        orders.orders.forEach(order => {
            const orderDate = new Date(order.paymentDate || order.createdAt);
            if (orderDate >= thirtyDaysAgo) {
                const dateKey = orderDate.toISOString().split('T')[0];
                if (!dailySales[dateKey]) {
                    dailySales[dateKey] = {
                        date: dateKey,
                        orders: 0,
                        revenue: 0
                    };
                }
                dailySales[dateKey].orders++;
                dailySales[dateKey].revenue += order.total;
            }
        });

        // Convert to array and sort by date
        return Object.values(dailySales).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );
    } catch (error) {
        throw new Error(`Failed to get sales trends: ${error.message}`);
    }
};

/**
 * Get user statistics
 * @returns {Promise<Object>} - User statistics
 */
const getUserStats = async () => {
    try {
        const users = await userRepository.getAll({}, 1, 10000);

        const stats = {
            total: users.pagination.total,
            verified: 0,
            unverified: 0,
            byRole: {
                user: 0,
                admin: 0
            },
            recent: users.users
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
                .map(user => ({
                    id: user._id,
                    name: user.profile?.name,
                    email: user.profile?.email || user.mobile,
                    role: user.role,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt
                }))
        };

        users.users.forEach(user => {
            if (user.isVerified) {
                stats.verified++;
            } else {
                stats.unverified++;
            }
            if (user.role === 'admin') {
                stats.byRole.admin++;
            } else {
                stats.byRole.user++;
            }
        });

        return stats;
    } catch (error) {
        throw new Error(`Failed to get user stats: ${error.message}`);
    }
};

module.exports = {
    getDashboardStats,
    getTotalRevenue,
    getRecentOrders,
    getOrdersByStatus,
    getRevenueByPeriod,
    getTopProducts,
    getSalesTrends,
    getUserStats
};

