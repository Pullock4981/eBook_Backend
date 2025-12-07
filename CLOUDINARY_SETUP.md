# Cloudinary Setup Guide

## 📋 Overview

This project uses Cloudinary for image uploads. Cloudinary provides a free tier with:
- 25GB storage
- 25GB bandwidth/month
- Image optimization
- CDN included

## 🚀 Setup Steps

### 1. Create Cloudinary Account

1. Go to: https://cloudinary.com/users/register/free
2. Sign up for a free account
3. Verify your email

### 2. Get Your Credentials

After signing up, go to your Dashboard:
- **Cloud Name**: Found in Dashboard URL or Account Details
- **API Key**: Found in Dashboard
- **API Secret**: Found in Dashboard (click "Reveal")

### 3. Add to Environment Variables

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Test Upload

Once configured, you can test image uploads through:
- Admin panel: `/admin/products/create`
- API endpoint: `POST /api/upload/image` (Admin only)

## 📁 Image Storage

Images are stored in Cloudinary with:
- **Folder**: `ebook/products`
- **Max file size**: 5MB
- **Supported formats**: JPG, JPEG, PNG, WebP, GIF
- **Auto optimization**: Enabled
- **Max dimensions**: 1000x1000px (auto-cropped)

## 🔧 Usage

### Backend Upload

```javascript
// Single image
POST /api/upload/image
Content-Type: multipart/form-data
Body: { image: File }

// Multiple images
POST /api/upload/images
Content-Type: multipart/form-data
Body: { images: File[] }
```

### Frontend Upload

```javascript
import { uploadSingleImage, uploadMultipleImages } from '../services/uploadService';

// Single image
const response = await uploadSingleImage(file, (progress) => {
    console.log(`Upload progress: ${progress}%`);
});

// Multiple images
const response = await uploadMultipleImages(files, (progress) => {
    console.log(`Upload progress: ${progress}%`);
});
```

## 📝 Notes

- Images are automatically optimized by Cloudinary
- URLs are returned as `secure_url` (HTTPS)
- Images can be deleted using the `public_id` from upload response
- Free tier is sufficient for development and small projects

