# Vercel Environment Variables Setup Guide

## ✅ **Critical (Must Have)**

এই variables গুলো অবশ্যই সেট করতে হবে:

### 1. **Database**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ebook_db
```
- MongoDB Atlas connection string ব্যবহার করুন
- Local MongoDB Vercel-এ কাজ করবে না

### 2. **JWT Security**
```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```
- `JWT_SECRET` অবশ্যই strong random string হতে হবে (minimum 32 characters)

### 3. **Frontend URL (CORS)**
```
FRONTEND_URL=https://your-frontend-domain.vercel.app
```
- Production frontend URL
- Development: `http://localhost:3000`

### 4. **Node Environment**
```
NODE_ENV=production
```

---

## ⚠️ **Important (Should Have)**

### 5. **OTP Configuration**
```
OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6
```

### 6. **SMS Provider** (যেটা ব্যবহার করবেন)
```
SMS_PROVIDER=local
# অথবা twilio, nexmo, custom
```

যদি Twilio ব্যবহার করেন:
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 7. **Payment Gateways** (যেগুলো ব্যবহার করবেন)

**SSLCommerz:**
```
SSLCOMMERZ_STORE_ID=your_sslcommerz_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sslcommerz_store_password
SSLCOMMERZ_IS_LIVE=false
```

**bKash:**
```
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password
BKASH_IS_SANDBOX=true
```

**Nagad:**
```
NAGAD_MERCHANT_ID=your_nagad_merchant_id
NAGAD_MERCHANT_KEY=your_nagad_merchant_key
NAGAD_IS_SANDBOX=true
```

---

## 📦 **Optional (Nice to Have)**

### 8. **Cloudinary** (Image/PDF uploads)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 9. **Email** (Notifications)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 10. **eBook Security** (আপনার মতো আছে, কিন্তু check করুন)
```
EBOOK_TOKEN_EXPIRY_DAYS=365
EBOOK_WATERMARK_FONT_SIZE=12
EBOOK_WATERMARK_OPACITY=0.3
EBOOK_WATERMARK_ANGLE=-45
EBOOK_WATERMARK_SPACING=200
EBOOK_ALLOW_IP_CHANGE=false
EBOOK_ALLOW_DEVICE_CHANGE=false
```

**Note:** আপনার screenshot-এ `EBOOK_ACCESS_TOKEN_EXPIRY=24h` আছে, কিন্তু code-এ `EBOOK_TOKEN_EXPIRY_DAYS` expect করে। এটা check করুন।

### 11. **Affiliate** (আপনার মতো আছে ✅)
```
AFFILIATE_COMMISSION_RATE=10
AFFILIATE_MIN_WITHDRAW=500
```

### 12. **Upload Directory**
```
UPLOADS_DIR=uploads
```

---

## 🚀 **Quick Setup Steps:**

1. **Vercel Dashboard** → আপনার project → **Settings** → **Environment Variables**

2. **Add these variables one by one:**
   - `MONGODB_URI` (most important!)
   - `JWT_SECRET` (generate a strong random string)
   - `FRONTEND_URL` (your frontend domain)
   - `NODE_ENV=production`

3. **Save** করুন

4. **Redeploy** করুন (automatic হতে পারে)

---

## 🔍 **Checklist:**

- [ ] MONGODB_URI (MongoDB Atlas connection string)
- [ ] JWT_SECRET (strong random string, min 32 chars)
- [ ] JWT_EXPIRES_IN (default: 7d)
- [ ] FRONTEND_URL (your frontend domain)
- [ ] NODE_ENV=production
- [ ] OTP_EXPIRY_MINUTES (default: 5)
- [ ] SMS_PROVIDER (local/twilio/nexmo)
- [ ] Payment gateway credentials (if using)
- [ ] Cloudinary credentials (if using)
- [ ] AFFILIATE_COMMISSION_RATE (already set ✅)
- [ ] AFFILIATE_MIN_WITHDRAW (already set ✅)

---

## ⚠️ **Important Notes:**

1. **MONGODB_URI** সবচেয়ে গুরুত্বপূর্ণ - এটা ছাড়া API কাজ করবে না
2. **JWT_SECRET** production-এ strong হতে হবে
3. **FRONTEND_URL** CORS-এর জন্য প্রয়োজন
4. সব variables **Save** করুন
5. Deploy করার পর **Logs** check করুন errors-এর জন্য

---

## 🐛 **Troubleshooting:**

যদি 404 error আসে:
- ✅ `vercel.json` ঠিক আছে (আমরা fix করেছি)
- ✅ Environment variables সেট করুন
- ✅ Redeploy করুন

যদি Database connection error আসে:
- MongoDB Atlas-এ IP whitelist check করুন (0.0.0.0/0 allow করুন)
- MONGODB_URI সঠিক আছে কিনা check করুন

