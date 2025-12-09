/**
 * Seed Home Sections Demo Data
 * 
 * This script creates demo products for home page sections
 * Run with: node scripts/seedHomeSections.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ebook', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Demo products data
const demoProducts = [
    // Last Updates
    {
        name: 'The Art of Modern JavaScript',
        slug: 'the-art-of-modern-javascript',
        type: 'digital',
        description: 'A comprehensive guide to modern JavaScript development',
        shortDescription: 'Learn modern JavaScript patterns and best practices',
        price: 29.99,
        discountPrice: 24.99,
        isActive: true,
        isLastUpdate: true,
        isFeatured: false,
        downloadCount: 150,
        favoriteCount: 45,
        readerViews: 320,
        views: 500,
        sales: 120,
        images: [],
        digitalFile: '/uploads/books/javascript-guide.pdf',
        fileSize: 5242880,
        tags: ['javascript', 'programming', 'web development'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
        name: 'React Mastery: Complete Guide',
        slug: 'react-mastery-complete-guide',
        type: 'digital',
        description: 'Master React from basics to advanced concepts',
        shortDescription: 'Complete React development guide',
        price: 34.99,
        discountPrice: 29.99,
        isActive: true,
        isLastUpdate: true,
        isFeatured: false,
        downloadCount: 200,
        favoriteCount: 60,
        readerViews: 450,
        views: 650,
        sales: 180,
        images: [],
        digitalFile: '/uploads/books/react-guide.pdf',
        fileSize: 7340032,
        tags: ['react', 'frontend', 'javascript'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
        name: 'Node.js Backend Development',
        slug: 'nodejs-backend-development',
        type: 'digital',
        description: 'Build scalable backend applications with Node.js',
        shortDescription: 'Complete Node.js backend guide',
        price: 39.99,
        isActive: true,
        isLastUpdate: true,
        isFeatured: false,
        downloadCount: 180,
        favoriteCount: 55,
        readerViews: 380,
        views: 580,
        sales: 150,
        images: [],
        digitalFile: '/uploads/books/nodejs-guide.pdf',
        fileSize: 6291456,
        tags: ['nodejs', 'backend', 'server'],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    // Coming Soon
    {
        name: 'Python Data Science Handbook',
        slug: 'python-data-science-handbook',
        type: 'digital',
        description: 'Comprehensive guide to data science with Python',
        shortDescription: 'Master data science with Python',
        price: 44.99,
        isActive: true,
        isComingSoon: true,
        isFeatured: false,
        releaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        downloadCount: 0,
        favoriteCount: 25,
        readerViews: 0,
        views: 100,
        sales: 0,
        images: [],
        digitalFile: null,
        fileSize: null,
        tags: ['python', 'data science', 'machine learning'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
        name: 'Vue.js 3 Complete Course',
        slug: 'vuejs-3-complete-course',
        type: 'digital',
        description: 'Learn Vue.js 3 from scratch to advanced',
        shortDescription: 'Complete Vue.js 3 development course',
        price: 37.99,
        isActive: true,
        isComingSoon: true,
        isFeatured: false,
        releaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        downloadCount: 0,
        favoriteCount: 30,
        readerViews: 0,
        views: 120,
        sales: 0,
        images: [],
        digitalFile: null,
        fileSize: null,
        tags: ['vuejs', 'frontend', 'javascript'],
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
        name: 'TypeScript Advanced Patterns',
        slug: 'typescript-advanced-patterns',
        type: 'digital',
        description: 'Advanced TypeScript patterns and techniques',
        shortDescription: 'Master advanced TypeScript',
        price: 42.99,
        isActive: true,
        isComingSoon: true,
        isFeatured: false,
        releaseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        downloadCount: 0,
        favoriteCount: 20,
        readerViews: 0,
        views: 90,
        sales: 0,
        images: [],
        digitalFile: null,
        fileSize: null,
        tags: ['typescript', 'javascript', 'programming'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    // Popular Reader
    {
        name: 'MongoDB Complete Guide',
        slug: 'mongodb-complete-guide',
        type: 'digital',
        description: 'Master MongoDB database administration and development',
        shortDescription: 'Complete MongoDB guide',
        price: 35.99,
        discountPrice: 29.99,
        isActive: true,
        isPopularReader: true,
        isFeatured: true,
        downloadCount: 300,
        favoriteCount: 80,
        readerViews: 1200,
        views: 1500,
        sales: 250,
        images: [],
        digitalFile: '/uploads/books/mongodb-guide.pdf',
        fileSize: 8388608,
        tags: ['mongodb', 'database', 'nosql'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
        name: 'Express.js API Development',
        slug: 'expressjs-api-development',
        type: 'digital',
        description: 'Build RESTful APIs with Express.js',
        shortDescription: 'Complete Express.js API guide',
        price: 32.99,
        isActive: true,
        isPopularReader: true,
        isFeatured: true,
        downloadCount: 280,
        favoriteCount: 75,
        readerViews: 1100,
        views: 1400,
        sales: 230,
        images: [],
        digitalFile: '/uploads/books/expressjs-guide.pdf',
        fileSize: 6291456,
        tags: ['expressjs', 'api', 'backend'],
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
        name: 'Full Stack Development Guide',
        slug: 'full-stack-development-guide',
        type: 'digital',
        description: 'Complete guide to full stack web development',
        shortDescription: 'Master full stack development',
        price: 49.99,
        discountPrice: 39.99,
        isActive: true,
        isPopularReader: true,
        isFeatured: true,
        downloadCount: 350,
        favoriteCount: 95,
        readerViews: 1500,
        views: 1800,
        sales: 300,
        images: [],
        digitalFile: '/uploads/books/fullstack-guide.pdf',
        fileSize: 10485760,
        tags: ['fullstack', 'web development', 'programming'],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    // Frequently Downloaded
    {
        name: 'JavaScript Fundamentals',
        slug: 'javascript-fundamentals',
        type: 'digital',
        description: 'Learn JavaScript from the ground up',
        shortDescription: 'JavaScript basics and fundamentals',
        price: 24.99,
        discountPrice: 19.99,
        isActive: true,
        isFeatured: false,
        downloadCount: 500,
        favoriteCount: 120,
        readerViews: 800,
        views: 2000,
        sales: 450,
        images: [],
        digitalFile: '/uploads/books/javascript-fundamentals.pdf',
        fileSize: 4194304,
        tags: ['javascript', 'basics', 'programming'],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
        name: 'CSS Mastery',
        slug: 'css-mastery',
        type: 'digital',
        description: 'Master CSS3 and modern styling techniques',
        shortDescription: 'Complete CSS guide',
        price: 27.99,
        isActive: true,
        isFeatured: false,
        downloadCount: 450,
        favoriteCount: 110,
        readerViews: 750,
        views: 1800,
        sales: 400,
        images: [],
        digitalFile: '/uploads/books/css-mastery.pdf',
        fileSize: 5242880,
        tags: ['css', 'styling', 'frontend'],
        createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    {
        name: 'HTML5 Complete Reference',
        slug: 'html5-complete-reference',
        type: 'digital',
        description: 'Complete HTML5 reference and guide',
        shortDescription: 'HTML5 complete reference',
        price: 22.99,
        discountPrice: 18.99,
        isActive: true,
        isFeatured: false,
        downloadCount: 400,
        favoriteCount: 100,
        readerViews: 700,
        views: 1600,
        sales: 350,
        images: [],
        digitalFile: '/uploads/books/html5-reference.pdf',
        fileSize: 3145728,
        tags: ['html5', 'web', 'basics'],
        createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
];

const seedHomeSections = async () => {
    try {
        await connectDB();

        // Get a category (or create one if none exists)
        let category = await Category.findOne();
        if (!category) {
            console.log('⚠️  No category found. Please create categories first.');
            console.log('   Creating a default category...');
            category = await Category.create({
                name: 'Programming',
                slug: 'programming',
                description: 'Programming books',
                isActive: true
            });
            console.log('✅ Created default category:', category.name);
        }

        // Add category to all products
        const productsWithCategory = demoProducts.map(product => ({
            ...product,
            category: category._id
        }));

        // Insert products
        console.log('📦 Seeding home sections demo data...');
        const insertedProducts = await Product.insertMany(productsWithCategory);
        console.log(`✅ Successfully inserted ${insertedProducts.length} demo products`);

        console.log('\n📊 Summary:');
        console.log(`   - Last Updates: ${insertedProducts.filter(p => p.isLastUpdate).length}`);
        console.log(`   - Coming Soon: ${insertedProducts.filter(p => p.isComingSoon).length}`);
        console.log(`   - Popular Reader: ${insertedProducts.filter(p => p.isPopularReader).length}`);
        console.log(`   - Frequently Downloaded: ${insertedProducts.filter(p => p.downloadCount > 300).length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding home sections:', error);
        process.exit(1);
    }
};

// Run seeder
if (require.main === module) {
    seedHomeSections();
}

module.exports = seedHomeSections;

