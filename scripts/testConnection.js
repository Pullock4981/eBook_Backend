/**
 * Test MongoDB Connection Script
 * Run this to diagnose MongoDB connection issues
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    console.log('🔍 Testing MongoDB Connection...\n');

    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is not set in .env file');
        process.exit(1);
    }

    console.log('📋 Connection String:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    console.log('');

    // Fix URI if needed
    let mongoUri = process.env.MONGODB_URI.trim();

    if (mongoUri.includes('mongodb+srv://')) {
        const uriParts = mongoUri.split('?');
        const baseUri = uriParts[0];
        const queryParams = uriParts.length > 1 ? '?' + uriParts.slice(1).join('?') : '';

        if (baseUri.endsWith('.mongodb.net/') || baseUri.endsWith('.mongodb.net')) {
            mongoUri = baseUri.replace(/\.mongodb\.net\/?$/, '.mongodb.net/ebook_db') + queryParams;
            console.log('⚠️  Database name was missing. Using:', mongoUri.replace(/:[^:@]+@/, ':****@'));
            console.log('');
        }
    }

    try {
        console.log('🔄 Attempting to connect...');

        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ MongoDB Connected Successfully!');
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
        console.log(`   Ready State: ${conn.connection.readyState} (1 = connected)`);

        // Test a simple query
        const collections = await conn.connection.db.listCollections().toArray();
        console.log(`\n📊 Collections found: ${collections.length}`);
        if (collections.length > 0) {
            console.log('   Collections:', collections.map(c => c.name).join(', '));
        }

        await mongoose.connection.close();
        console.log('\n✅ Connection test completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Connection Failed!');
        console.error('Error:', error.message);
        console.error('');

        // Provide specific solutions
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.error('💡 Solution: Check your internet connection and MongoDB Atlas cluster URL');
        } else if (error.message.includes('authentication failed')) {
            console.error('💡 Solution: Check your username and password in MONGODB_URI');
            console.error('   - Go to MongoDB Atlas > Database Access');
            console.error('   - Verify your database user credentials');
        } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
            console.error('💡 Solution: Add your IP address to MongoDB Atlas whitelist');
            console.error('   1. Go to MongoDB Atlas > Network Access');
            console.error('   2. Click "Add IP Address"');
            console.error('   3. Click "Add Current IP Address" (or add 0.0.0.0/0 for all IPs)');
        } else if (error.message.includes('timeout')) {
            console.error('💡 Solution: Connection timeout - check your network and MongoDB Atlas status');
            console.error('   - Verify MongoDB Atlas cluster is running');
            console.error('   - Check your firewall settings');
        } else {
            console.error('💡 Common solutions:');
            console.error('   1. Verify MONGODB_URI in .env file');
            console.error('   2. Check MongoDB Atlas IP whitelist');
            console.error('   3. Verify database user credentials');
            console.error('   4. Check internet connection');
        }

        process.exit(1);
    }
}

testConnection();

