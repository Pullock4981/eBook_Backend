# Sample Data Seeder

## 📋 Overview

This seeder script creates sample categories and products for testing the application.

## 🚀 How to Run

```bash
cd eBook_Backend
npm run seed
```

Or directly:

```bash
node scripts/seedProducts.js
```

## 📦 What It Creates

### Categories (4)
1. Fiction
2. Non-Fiction
3. Science & Technology
4. Business & Finance

### Products (8)
- **Physical Products (4)**:
  - The Great Gatsby
  - 1984 by George Orwell
  - Sapiens: A Brief History of Humankind
  - The Lean Startup

- **Digital Products (4)**:
  - JavaScript: The Complete Guide
  - Python for Data Science
  - React Mastery: Advanced Patterns
  - Node.js Backend Development

## 🖼️ Images

Products use placeholder images from Unsplash. In production, you should:
1. Upload real product images via admin panel
2. Or replace URLs in the seeder script

## ⚠️ Notes

- The script checks for existing categories/products before creating
- It won't duplicate data if run multiple times
- To clear and reseed, uncomment the delete lines in the script

## 🔄 Re-seeding

To clear existing data and reseed:

1. Edit `scripts/seedProducts.js`
2. Uncomment these lines:
```javascript
await Category.deleteMany({});
await Product.deleteMany({});
```
3. Run the seeder again

