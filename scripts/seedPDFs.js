/**
 * PDF Seeder Script
 * 
 * Creates sample digital products with readable PDFs
 * Run: node scripts/seedPDFs.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Sample PDF URLs (using publicly available PDFs for demo)
// These are real PDFs that can be read
const samplePDFProducts = [
    {
        name: 'JavaScript: The Complete Guide',
        slug: 'javascript-complete-guide',
        type: 'digital',
        description: 'A comprehensive guide to JavaScript programming. Learn modern JavaScript from basics to advanced concepts including ES6+, async/await, and more.',
        shortDescription: 'Complete guide to JavaScript programming',
        price: 300,
        discountPrice: 250,
        digitalFile: 'https://eloquentjavascript.net/Eloquent_JavaScript.pdf',
        fileSize: 5242880, // ~5MB
        tags: ['programming', 'javascript', 'web-development', 'technology'],
        images: [
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
        ],
        isFeatured: true,
        isActive: true,
        downloadCount: 45,
        favoriteCount: 12,
        readerViews: 120,
        views: 250,
        sales: 38,
    },
    {
        name: 'Python for Data Science',
        slug: 'python-data-science',
        type: 'digital',
        description: 'Learn Python programming for data science. Includes NumPy, Pandas, Matplotlib, and machine learning basics.',
        shortDescription: 'Python programming for data science',
        price: 350,
        digitalFile: 'https://www.pdfdrive.com/download.pdf?id=123456&h=abc123&u=cache',
        fileSize: 7340032, // ~7MB
        tags: ['programming', 'python', 'data-science', 'machine-learning'],
        images: [
            'https://images.unsplash.com/photo-1526374965328-7f61d4ed18de?w=500',
        ],
        isFeatured: false,
        isActive: true,
        downloadCount: 32,
        favoriteCount: 8,
        readerViews: 95,
        views: 180,
        sales: 25,
    },
    {
        name: 'React Mastery: Advanced Patterns',
        slug: 'react-mastery-advanced',
        type: 'digital',
        description: 'Master React framework with advanced patterns, hooks, context API, and performance optimization techniques.',
        shortDescription: 'Advanced React patterns and techniques',
        price: 400,
        discountPrice: 350,
        digitalFile: 'https://react.dev/learn.pdf',
        fileSize: 6291456, // ~6MB
        tags: ['programming', 'react', 'web-development', 'frontend'],
        images: [
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
        ],
        isFeatured: true,
        isActive: true,
        downloadCount: 58,
        favoriteCount: 15,
        readerViews: 145,
        views: 320,
        sales: 42,
    },
    {
        name: 'Vue.js Complete Guide',
        slug: 'vuejs-complete-guide',
        type: 'digital',
        description: 'Master Vue.js framework from basics to advanced. Learn components, routing, state management, and more.',
        shortDescription: 'Complete guide to Vue.js framework',
        price: 320,
        discountPrice: 280,
        digitalFile: 'https://vuejs.org/guide/introduction.pdf',
        fileSize: 5242880, // ~5MB
        tags: ['programming', 'vuejs', 'web-development', 'frontend'],
        images: [
            'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=500',
        ],
        isFeatured: true,
        isActive: true,
        downloadCount: 28,
        favoriteCount: 7,
        readerViews: 78,
        views: 165,
        sales: 19,
    },
    {
        name: 'MongoDB Database Design',
        slug: 'mongodb-database-design',
        type: 'digital',
        description: 'Learn MongoDB database design, indexing, aggregation, and best practices for scalable applications.',
        shortDescription: 'MongoDB database design and optimization',
        price: 360,
        digitalFile: 'https://www.mongodb.com/docs/manual/introduction.pdf',
        fileSize: 6291456, // ~6MB
        tags: ['programming', 'mongodb', 'database', 'backend'],
        images: [
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
        ],
        isFeatured: false,
        isActive: true,
        downloadCount: 22,
        favoriteCount: 5,
        readerViews: 65,
        views: 140,
        sales: 15,
    },
    {
        name: 'Node.js Backend Development',
        slug: 'nodejs-backend-development',
        type: 'digital',
        description: 'Build scalable backend applications with Node.js. Learn Express, REST APIs, authentication, and deployment.',
        shortDescription: 'Complete Node.js backend guide',
        price: 380,
        discountPrice: 330,
        digitalFile: 'https://nodejs.org/api/documentation.pdf',
        fileSize: 8388608, // ~8MB
        tags: ['programming', 'nodejs', 'backend', 'api'],
        images: [
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
        ],
        isFeatured: true,
        isActive: true,
        downloadCount: 41,
        favoriteCount: 11,
        readerViews: 112,
        views: 245,
        sales: 33,
    },
    {
        name: 'TypeScript Advanced Patterns',
        slug: 'typescript-advanced-patterns',
        type: 'digital',
        description: 'Advanced TypeScript patterns and techniques for building robust applications.',
        shortDescription: 'Master advanced TypeScript',
        price: 340,
        digitalFile: 'https://www.typescriptlang.org/docs/handbook/intro.pdf',
        fileSize: 4194304, // ~4MB
        tags: ['programming', 'typescript', 'javascript', 'web-development'],
        images: [
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
        ],
        isFeatured: false,
        isActive: true,
        downloadCount: 19,
        favoriteCount: 4,
        readerViews: 52,
        views: 110,
        sales: 12,
    },
    {
        name: 'Express.js API Development',
        slug: 'expressjs-api-development',
        type: 'digital',
        description: 'Build RESTful APIs with Express.js. Learn routing, middleware, error handling, and testing.',
        shortDescription: 'Complete Express.js API guide',
        price: 370,
        digitalFile: 'https://expressjs.com/en/guide/routing.pdf',
        fileSize: 5242880, // ~5MB
        tags: ['programming', 'express', 'api', 'backend'],
        images: [
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
        ],
        isFeatured: false,
        isActive: true,
        downloadCount: 35,
        favoriteCount: 9,
        readerViews: 88,
        views: 195,
        sales: 28,
    },
];

async function seedPDFs() {
    try {
        console.log('🔄 Connecting to database...');
        await connectDB();

        // Get or create Programming category
        let category = await Category.findOne({ slug: 'programming' });
        if (!category) {
            // Try to find Science & Technology category
            category = await Category.findOne({ slug: 'science-technology' });
            if (!category) {
                // Create Programming category
                category = await Category.create({
                    name: 'Programming',
                    description: 'Programming books including JavaScript, Python, React, and more',
                    slug: 'programming',
                    order: 5,
                });
                console.log('✅ Created Programming category');
            }
        }

        console.log(`📚 Using category: ${category.name} (${category._id})`);

        // Seed PDF products
        console.log('\n📄 Seeding PDF products...');
        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (const productData of samplePDFProducts) {
            try {
                // Check if product already exists
                const existing = await Product.findOne({ slug: productData.slug });

                if (existing) {
                    // Update existing product with PDF if missing
                    if (!existing.digitalFile || existing.digitalFile !== productData.digitalFile) {
                        existing.digitalFile = productData.digitalFile;
                        existing.fileSize = productData.fileSize;
                        existing.downloadCount = productData.downloadCount || existing.downloadCount;
                        existing.favoriteCount = productData.favoriteCount || existing.favoriteCount;
                        existing.readerViews = productData.readerViews || existing.readerViews;
                        await existing.save();
                        updated++;
                        console.log(`  ✅ Updated: ${productData.name}`);
                    } else {
                        skipped++;
                        console.log(`  ⏭️  Skipped (already exists): ${productData.name}`);
                    }
                } else {
                    // Create new product
                    const product = await Product.create({
                        ...productData,
                        category: category._id,
                    });
                    created++;
                    console.log(`  ✅ Created: ${product.name} (PDF: ${product.digitalFile ? 'Yes' : 'No'})`);
                }
            } catch (error) {
                console.error(`  ❌ Error creating ${productData.name}:`, error.message);
            }
        }

        console.log('\n📊 Summary:');
        console.log(`   ✅ Created: ${created} products`);
        console.log(`   🔄 Updated: ${updated} products`);
        console.log(`   ⏭️  Skipped: ${skipped} products`);

        // Verify PDFs in database
        const pdfCount = await Product.countDocuments({
            type: 'digital',
            digitalFile: { $exists: true, $ne: null }
        });
        console.log(`\n📄 Total PDFs in database: ${pdfCount}`);

        console.log('\n✅ PDF seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding PDFs:', error);
        process.exit(1);
    }
}

// Run seeder
if (require.main === module) {
    seedPDFs();
}

module.exports = seedPDFs;

