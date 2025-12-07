/**
 * Product Seeder Script
 * 
 * Creates sample categories and products for testing
 * Run: node scripts/seedProducts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Sample categories
const sampleCategories = [
    {
        name: 'Fiction',
        description: 'Fiction books including novels, short stories, and more',
        slug: 'fiction',
        order: 1,
    },
    {
        name: 'Non-Fiction',
        description: 'Non-fiction books including biographies, history, and more',
        slug: 'non-fiction',
        order: 2,
    },
    {
        name: 'Science & Technology',
        description: 'Books about science, technology, and innovation',
        slug: 'science-technology',
        order: 3,
    },
    {
        name: 'Business & Finance',
        description: 'Business and finance related books',
        slug: 'business-finance',
        order: 4,
    },
];

// Sample products with placeholder images
const sampleProducts = [
    // Physical Products
    {
        name: 'The Great Gatsby',
        type: 'physical',
        description: 'A classic American novel by F. Scott Fitzgerald. Set in the Jazz Age, it tells the story of Jay Gatsby and his obsession with Daisy Buchanan.',
        shortDescription: 'A classic American novel set in the Jazz Age',
        price: 500,
        discountPrice: 400,
        stock: 50,
        sku: 'BOOK-FIC-001',
        tags: ['fiction', 'classic', 'novel', 'american'],
        images: [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        ],
        isFeatured: true,
        isActive: true,
    },
    {
        name: '1984 by George Orwell',
        type: 'physical',
        description: 'A dystopian social science fiction novel. The story takes place in an imagined future where the world is controlled by a totalitarian regime.',
        shortDescription: 'A dystopian novel about totalitarian control',
        price: 450,
        discountPrice: 350,
        stock: 30,
        sku: 'BOOK-FIC-002',
        tags: ['fiction', 'dystopian', 'classic', 'science-fiction'],
        images: [
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
        ],
        isFeatured: true,
        isActive: true,
    },
    {
        name: 'Sapiens: A Brief History of Humankind',
        type: 'physical',
        description: 'A book by Yuval Noah Harari that explores how Homo sapiens conquered the world through cognitive, agricultural, and scientific revolutions.',
        shortDescription: 'A brief history of humankind',
        price: 600,
        stock: 25,
        sku: 'BOOK-NF-001',
        tags: ['non-fiction', 'history', 'anthropology', 'science'],
        images: [
            'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
        ],
        isFeatured: false,
        isActive: true,
    },
    {
        name: 'The Lean Startup',
        type: 'physical',
        description: 'A business book by Eric Ries about how to build a successful startup using lean principles and continuous innovation.',
        shortDescription: 'How to build a successful startup',
        price: 550,
        discountPrice: 450,
        stock: 40,
        sku: 'BOOK-BUS-001',
        tags: ['business', 'startup', 'entrepreneurship', 'innovation'],
        images: [
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500',
        ],
        isFeatured: true,
        isActive: true,
    },
    // Digital Products (eBooks) - Demo PDFs
    {
        name: 'JavaScript: The Complete Guide',
        type: 'digital',
        description: 'A comprehensive guide to JavaScript programming. Learn modern JavaScript from basics to advanced concepts including ES6+, async/await, and more.',
        shortDescription: 'Complete guide to JavaScript programming',
        price: 300,
        discountPrice: 250,
        digitalFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: 5242880, // 5MB
        tags: ['programming', 'javascript', 'web-development', 'technology'],
        images: [
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
        ],
        isFeatured: true,
        isActive: true,
    },
    {
        name: 'Python for Data Science',
        type: 'digital',
        description: 'Learn Python programming for data science. Includes NumPy, Pandas, Matplotlib, and machine learning basics.',
        shortDescription: 'Python programming for data science',
        price: 350,
        digitalFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: 7340032, // 7MB
        tags: ['programming', 'python', 'data-science', 'machine-learning'],
        images: [
            'https://images.unsplash.com/photo-1526374965328-7f61d4ed18de?w=500',
        ],
        isFeatured: false,
        isActive: true,
    },
    {
        name: 'React Mastery: Advanced Patterns',
        type: 'digital',
        description: 'Advanced React patterns and best practices. Learn hooks, context, performance optimization, and more.',
        shortDescription: 'Advanced React patterns and best practices',
        price: 400,
        discountPrice: 320,
        digitalFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: 6291456, // 6MB
        tags: ['programming', 'react', 'web-development', 'frontend'],
        images: [
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
        ],
        isFeatured: true,
        isActive: true,
    },
    {
        name: 'Node.js Backend Development',
        type: 'digital',
        description: 'Complete guide to building backend applications with Node.js, Express, MongoDB, and more.',
        shortDescription: 'Backend development with Node.js',
        price: 380,
        digitalFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: 8388608, // 8MB
        tags: ['programming', 'nodejs', 'backend', 'api'],
        images: [
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
        ],
        isFeatured: false,
        isActive: true,
    },
    {
        name: 'Vue.js Complete Guide',
        type: 'digital',
        description: 'Master Vue.js framework from basics to advanced. Learn components, routing, state management, and more.',
        shortDescription: 'Complete guide to Vue.js framework',
        price: 320,
        discountPrice: 280,
        digitalFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: 5242880, // 5MB
        tags: ['programming', 'vuejs', 'web-development', 'frontend'],
        images: [
            'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=500',
        ],
        isFeatured: true,
        isActive: true,
    },
    {
        name: 'MongoDB Database Design',
        type: 'digital',
        description: 'Learn MongoDB database design, indexing, aggregation, and best practices for scalable applications.',
        shortDescription: 'MongoDB database design and optimization',
        price: 360,
        digitalFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: 6291456, // 6MB
        tags: ['programming', 'mongodb', 'database', 'backend'],
        images: [
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
        ],
        isFeatured: false,
        isActive: true,
    },
];

async function seedDatabase() {
    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to database');

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await Category.deleteMany({});
        // await Product.deleteMany({});
        // console.log('✅ Cleared existing data');

        // Create categories
        console.log('📚 Creating categories...');
        const createdCategories = {};

        for (const catData of sampleCategories) {
            // Check if category already exists
            let category = await Category.findOne({ slug: catData.slug });

            if (!category) {
                category = await Category.create(catData);
                console.log(`  ✅ Created category: ${category.name}`);
            } else {
                console.log(`  ⏭️  Category already exists: ${category.name}`);
            }

            createdCategories[catData.slug] = category;
        }

        // Create products
        console.log('📦 Creating products...');
        let productCount = 0;

        for (const productData of sampleProducts) {
            // Assign category based on product type/tags
            let categoryId;
            if (productData.tags.includes('fiction') || productData.tags.includes('novel') || productData.tags.includes('dystopian')) {
                categoryId = createdCategories['fiction']._id;
            } else if (productData.tags.includes('history') || productData.tags.includes('anthropology')) {
                categoryId = createdCategories['non-fiction']._id;
            } else if (productData.tags.includes('programming') || productData.tags.includes('technology')) {
                categoryId = createdCategories['science-technology']._id;
            } else if (productData.tags.includes('business') || productData.tags.includes('startup')) {
                categoryId = createdCategories['business-finance']._id;
            } else {
                categoryId = createdCategories['fiction']._id; // Default
            }

            // Check if product already exists
            const existingProduct = await Product.findOne({ name: productData.name });

            if (!existingProduct) {
                const product = await Product.create({
                    ...productData,
                    category: categoryId,
                });
                productCount++;
                console.log(`  ✅ Created product: ${product.name} (${product.type})`);
            } else {
                console.log(`  ⏭️  Product already exists: ${productData.name}`);
            }
        }

        console.log(`\n✅ Seeding completed!`);
        console.log(`   Categories: ${sampleCategories.length}`);
        console.log(`   Products: ${productCount} new products created`);

        // Close database connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run seeder
seedDatabase();

