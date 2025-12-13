/**
 * Product Model
 * Schema for products (Physical + Digital eBooks)
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['physical', 'digital'],
        required: [true, 'Product type is required']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    discountPrice: {
        type: Number,
        default: null,
        min: [0, 'Discount price cannot be negative'],
        // Validation is handled in pre-save hook and service layer
        // to properly handle updates where price might be changing
    },
    // For physical products
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative'],
        validate: {
            validator: function (value) {
                if (this.type === 'physical') {
                    return value !== undefined;
                }
                return true;
            },
            message: 'Stock is required for physical products'
        }
    },
    sku: {
        type: String,
        trim: true,
        uppercase: true,
        sparse: true // Allow multiple null values but unique for non-null
    },
    // For digital products (eBooks)
    digitalFile: {
        type: String, // URL or path to PDF file
        default: null,
        validate: {
            validator: function (value) {
                if (this.type === 'digital') {
                    return value !== null && value !== undefined;
                }
                return true;
            },
            message: 'Digital file is required for digital products'
        }
    },
    fileSize: {
        type: Number, // Size in bytes
        default: null
    },
    // Images
    images: [{
        type: String, // URL or path to image
        default: []
    }],
    thumbnail: {
        type: String, // Main thumbnail image
        default: null
    },
    // Product status
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    // SEO
    metaTitle: {
        type: String,
        trim: true,
        maxlength: [200, 'Meta title cannot exceed 200 characters']
    },
    metaDescription: {
        type: String,
        trim: true,
        maxlength: [500, 'Meta description cannot exceed 500 characters']
    },
    // Statistics
    views: {
        type: Number,
        default: 0
    },
    sales: {
        type: Number,
        default: 0
    },
    // Ratings (will be calculated from reviews)
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    // Home page sections
    isLastUpdate: {
        type: Boolean,
        default: false
    },
    isComingSoon: {
        type: Boolean,
        default: false
    },
    isPopularReader: {
        type: Boolean,
        default: false
    },
    downloadCount: {
        type: Number,
        default: 0,
        min: [0, 'Download count cannot be negative']
    },
    favoriteCount: {
        type: Number,
        default: 0,
        min: [0, 'Favorite count cannot be negative']
    },
    readerViews: {
        type: Number,
        default: 0,
        min: [0, 'Reader views cannot be negative']
    },
    releaseDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: 'products'
});

// Generate slug from name before saving
productSchema.pre('save', function (next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    
    // Validate discount price in pre-save hook ONLY for new documents
    // For updates (findByIdAndUpdate), validation is handled in service layer
    // Pre-save hook doesn't run for findByIdAndUpdate, so this is safe
    if (this.isNew && this.discountPrice !== null && this.discountPrice !== undefined && this.price !== undefined) {
        const discountNum = typeof this.discountPrice === 'number' ? this.discountPrice : parseFloat(this.discountPrice);
        const priceNum = typeof this.price === 'number' ? this.price : parseFloat(this.price);
        
        if (!isNaN(discountNum) && !isNaN(priceNum) && discountNum >= priceNum) {
            return next(new Error('Discount price must be less than regular price'));
        }
    }
    
    next();
});

// Virtual for final price (after discount)
productSchema.virtual('finalPrice').get(function () {
    return this.discountPrice !== null && this.discountPrice < this.price
        ? this.discountPrice
        : this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.discountPrice && this.price > 0) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
});

// Virtual for stock status
productSchema.virtual('inStock').get(function () {
    if (this.type === 'digital') {
        return true; // Digital products are always in stock
    }
    return this.stock > 0;
});

// Indexes
productSchema.index({ name: 1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ type: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sales: -1 });
productSchema.index({ averageRating: -1 });

// Text search index
productSchema.index({
    name: 'text',
    description: 'text',
    tags: 'text'
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);

