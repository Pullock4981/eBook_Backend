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
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Mongoose 6+ doesn't need these options, but keeping for older versions
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        throw error;
    }
};

module.exports = connectDB;

