/**
 * Cart Model
 * Schema for user shopping cart
 */

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    // Store product details at time of adding (for price changes)
    productSnapshot: {
        name: String,
        type: String,
        thumbnail: String
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        unique: true
    },
    items: [cartItemSchema],
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null
    },
    // Calculated totals
    subtotal: {
        type: Number,
        default: 0,
        min: [0, 'Subtotal cannot be negative']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
    },
    total: {
        type: Number,
        default: 0,
        min: [0, 'Total cannot be negative']
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'carts'
});

// Indexes
cartSchema.index({ user: 1 }, { unique: true });
cartSchema.index({ 'items.product': 1 });
cartSchema.index({ lastUpdated: -1 });

// Method to calculate totals
cartSchema.methods.calculateTotals = function () {
    this.subtotal = this.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    // Discount will be calculated when coupon is applied
    this.total = this.subtotal - this.discount;

    this.lastUpdated = new Date();
    return this;
};

// Method to add item to cart
cartSchema.methods.addItem = function (productId, quantity, price, productSnapshot) {
    const existingItemIndex = this.items.findIndex(
        item => item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
        // Update existing item
        this.items[existingItemIndex].quantity += quantity;
        this.items[existingItemIndex].price = price; // Update price
        this.items[existingItemIndex].productSnapshot = productSnapshot;
    } else {
        // Add new item
        this.items.push({
            product: productId,
            quantity,
            price,
            productSnapshot
        });
    }

    this.calculateTotals();
    return this;
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (productId, quantity) {
    const item = this.items.find(
        item => item.product.toString() === productId.toString()
    );

    if (!item) {
        throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
        // Remove item
        this.items = this.items.filter(
            item => item.product.toString() !== productId.toString()
        );
    } else {
        item.quantity = quantity;
    }

    this.calculateTotals();
    return this;
};

// Method to remove item
cartSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter(
        item => item.product.toString() !== productId.toString()
    );
    this.calculateTotals();
    return this;
};

// Method to clear cart
cartSchema.methods.clear = function () {
    this.items = [];
    this.coupon = null;
    this.subtotal = 0;
    this.discount = 0;
    this.total = 0;
    this.lastUpdated = new Date();
    return this;
};

module.exports = mongoose.model('Cart', cartSchema);

