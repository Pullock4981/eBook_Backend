/**
 * Seed Demo eBook Access Data
 * 
 * Creates demo purchase data for testing "Read Now" functionality
 * This script creates:
 * - Demo orders with digital products
 * - eBook access records for those orders
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const eBookAccess = require('../models/eBookAccess');
const crypto = require('crypto');

/**
 * Generate secure access token
 */
const generateAccessToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Calculate token expiry date
 */
const getTokenExpiry = (days = 365) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
};

/**
 * Generate device fingerprint
 */
const generateFingerprint = () => {
    return crypto.randomBytes(16).toString('hex');
};

async function seedEBookAccess() {
    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to database');

        // Find a test user (first user in database)
        const user = await User.findOne().sort({ createdAt: 1 });
        if (!user) {
            console.error('❌ No user found in database. Please create a user first.');
            process.exit(1);
        }
        console.log(`✅ Found user: ${user.email} (${user._id})`);

        // Find digital products
        const digitalProducts = await Product.find({ type: 'digital' }).limit(4);
        if (digitalProducts.length === 0) {
            console.error('❌ No digital products found. Please run seedProducts.js first.');
            process.exit(1);
        }
        console.log(`✅ Found ${digitalProducts.length} digital products`);

        // Create demo orders and eBook access
        const createdAccess = [];

        for (let i = 0; i < Math.min(3, digitalProducts.length); i++) {
            const product = digitalProducts[i];

            // Check if access already exists
            const existingAccess = await eBookAccess.findOne({
                user: user._id,
                product: product._id,
                isActive: true
            });

            if (existingAccess) {
                console.log(`  ⏭️  Access already exists for: ${product.name}`);
                continue;
            }

            // Create a demo order
            const orderId = `ORD-${Date.now()}-${i}`;
            const itemPrice = product.discountPrice || product.price;
            const order = await Order.create({
                user: user._id,
                orderId: orderId,
                items: [{
                    product: product._id,
                    quantity: 1,
                    price: itemPrice,
                    type: product.type,
                    productSnapshot: JSON.stringify({
                        name: product.name,
                        type: product.type,
                        thumbnail: product.images?.[0] || product.thumbnail
                    })
                }],
                subtotal: itemPrice,
                total: itemPrice,
                totalAmount: itemPrice,
                paymentStatus: 'paid',
                orderStatus: 'delivered',
                paymentMethod: 'cash_on_delivery',
                shippingAddress: user.addresses?.[0] || null,
                createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) // Different dates
            });

            console.log(`  ✅ Created demo order: ${order.orderId}`);

            // Create eBook access
            const accessToken = generateAccessToken();
            const tokenExpiry = getTokenExpiry(365); // 1 year expiry
            const deviceFingerprint = generateFingerprint();
            const ipAddress = '127.0.0.1'; // Demo IP

            const access = await eBookAccess.create({
                user: user._id,
                order: order._id,
                product: product._id,
                ipAddress: ipAddress,
                deviceFingerprint: deviceFingerprint,
                accessToken: accessToken,
                tokenExpiry: tokenExpiry,
                lastAccess: new Date(),
                accessCount: 0,
                isActive: true,
                ipChanged: false,
                deviceChanged: false,
                allowedIPs: [ipAddress],
                allowedDevices: [deviceFingerprint]
            });

            createdAccess.push({
                product: product.name,
                orderId: order.orderId,
                accessToken: accessToken.substring(0, 16) + '...'
            });

            console.log(`  ✅ Created eBook access for: ${product.name}`);
        }

        console.log(`\n✅ Seeding completed!`);
        console.log(`   User: ${user.email}`);
        console.log(`   Orders created: ${createdAccess.length}`);
        console.log(`   eBook access created: ${createdAccess.length}`);
        console.log(`\n📚 Purchased eBooks:`);
        createdAccess.forEach((access, index) => {
            console.log(`   ${index + 1}. ${access.product} (Order: ${access.orderId})`);
        });

        // Close database connection
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        console.log('\n💡 Now refresh your browser to see "Read Now" buttons!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding eBook access:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run seeder
seedEBookAccess();

