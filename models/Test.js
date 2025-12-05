/**
 * Test Model
 * Simple model for testing database connection and CRUD operations
 * This will be removed in production or kept for testing purposes
 */

const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    value: {
        type: Number,
        default: 0,
        min: [0, 'Value cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'tests' // Explicit collection name
});

// Index for better query performance
testSchema.index({ name: 1 });
testSchema.index({ createdAt: -1 });

// Export model
module.exports = mongoose.model('Test', testSchema);

