/**
 * MongoDB Database Connection
 * Mongoose setup with connection handling
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @returns {Promise} - Database connection promise
 */
const connectDB = async () => {
    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not set in .env file. Please add: MONGODB_URI=mongodb://localhost:27017/ebook_db');
        }

        // Fix MONGODB_URI if database name is missing
        let mongoUri = process.env.MONGODB_URI.trim();

        // Fix MONGODB_URI if database name is missing
        if (mongoUri.includes('mongodb+srv://')) {
            // Extract the base part before query parameters
            const uriParts = mongoUri.split('?');
            const baseUri = uriParts[0];
            const queryParams = uriParts.length > 1 ? '?' + uriParts.slice(1).join('?') : '';

            // Check if database name is missing
            // Cases: ...mongodb.net/ or ...mongodb.net (with or without trailing slash, but no database name)
            const hasDatabaseName = /\.mongodb\.net\/[^?\/]+/.test(mongoUri);

            if (!hasDatabaseName) {
                // Add database name before query params
                if (baseUri.endsWith('/')) {
                    // Case: ...mongodb.net/?
                    mongoUri = baseUri + 'ebook_db' + queryParams;
                } else if (baseUri.endsWith('.mongodb.net')) {
                    // Case: ...mongodb.net?
                    mongoUri = baseUri + '/ebook_db' + queryParams;
                } else {
                    // Fallback: try to add after .net
                    mongoUri = baseUri.replace(/\.mongodb\.net\/?$/, '.mongodb.net/ebook_db') + queryParams;
                }
                console.log('⚠️  Database name was missing in MONGODB_URI. Added: /ebook_db');
                console.log('📝 Updated URI:', mongoUri.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
            }
        }

        // Check if already connected (for serverless function reuse)
        if (mongoose.connection.readyState === 1) {
            console.log('✅ MongoDB already connected (reusing connection)');
            return mongoose.connection;
        }

        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000, // Increased timeout for serverless (30s)
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 1, // Maintain at least 1 socket connection
            maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
            // Serverless-friendly options
            bufferCommands: false, // Disable mongoose buffering
            bufferMaxEntries: 0, // Disable mongoose buffering
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
            // Auto-reconnect after 5 seconds
            setTimeout(() => {
                console.log('🔄 Attempting to reconnect to MongoDB...');
                mongoose.connect(mongoUri, {
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                }).catch((err) => {
                    console.error('❌ Reconnection failed:', err.message);
                });
            }, 5000);
        });

        // Handle reconnection
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        // Provide helpful error messages
        let errorMessage = error.message;

        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            errorMessage = 'Could not resolve MongoDB host. Please check your MONGODB_URI.';
        } else if (error.message.includes('authentication failed')) {
            errorMessage = 'MongoDB authentication failed. Please check your username and password.';
        } else if (error.message.includes('IP')) {
            errorMessage = 'Could not connect to MongoDB Atlas. Your IP address may not be whitelisted. Please add your IP to MongoDB Atlas whitelist.';
        } else if (error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Connection refused. Is MongoDB running? For local MongoDB, make sure MongoDB service is started.';
        }

        console.error('❌ Database connection error:', errorMessage);
        console.error('💡 Common solutions:');
        console.error('   1. For local MongoDB: Make sure MongoDB service is running');
        console.error('   2. For MongoDB Atlas: Check IP whitelist and connection string');
        console.error('   3. Verify MONGODB_URI in .env file');

        throw new Error(errorMessage);
    }
};

module.exports = connectDB;

