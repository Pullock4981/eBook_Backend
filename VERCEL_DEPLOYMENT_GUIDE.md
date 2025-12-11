# Vercel Deployment Guide - Fresh Setup

## 🚀 **Complete Deployment Steps**

---

## **Step 1: Vercel Project Setup**

### **Option A: Connect via Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository:
   - Select `eBook_Backend` repository
   - Click **Import**

### **Option B: Connect via Vercel CLI**

```bash
cd eBook_Backend
npm i -g vercel
vercel login
vercel
```

Follow the prompts to link your project.

---

## **Step 2: Configure Build Settings**

Vercel Dashboard → Your Project → Settings → General:

**Build Settings:**
- **Framework Preset:** Other
- **Root Directory:** `eBook_Backend` (if monorepo) or leave empty
- **Build Command:** (leave empty - not needed for Node.js)
- **Output Directory:** (leave empty)
- **Install Command:** `npm install`

---

## **Step 3: Set Environment Variables**

Vercel Dashboard → Settings → Environment Variables:

### **Critical Variables (Must Have):**

```env
# Database
MONGODB_URI=mongodb+srv://ashikpullock99_db_user:AC7Kgufr3ISkl6Nm@cluster0.0bf9be8.mongodb.net/ebook_db?retryWrites=true&w=majority&appName=Cluster0

# JWT Security
JWT_SECRET=a7f3b9c2d8e1f4a6b9c2d5e8f1a4b7c0d3e6f9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d3e6f9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Node Environment
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.vercel.app
# Or for local testing: http://localhost:3000
```

### **Important Variables:**

```env
# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6

# Affiliate
AFFILIATE_COMMISSION_RATE=10
AFFILIATE_MIN_WITHDRAW=500

# eBook Security
EBOOK_TOKEN_EXPIRY_DAYS=365
EBOOK_WATERMARK_FONT_SIZE=12
EBOOK_WATERMARK_OPACITY=0.3
EBOOK_WATERMARK_ANGLE=-45
EBOOK_WATERMARK_SPACING=200
EBOOK_ALLOW_IP_CHANGE=false
EBOOK_ALLOW_DEVICE_CHANGE=false
```

### **Optional Variables:**

```env
# SMS Provider (if using)
SMS_PROVIDER=local

# Payment Gateways (if using)
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_password
SSLCOMMERZ_IS_LIVE=false

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
```

---

## **Step 4: Environment Selection**

For each variable:
- ✅ Select **"Production"** (required)
- ✅ Select **"Preview"** (optional, for testing)
- ✅ Select **"Development"** (optional)

**Or:** Select **"All Environments"** to apply to all.

---

## **Step 5: Deploy**

### **Automatic Deploy (via Git):**

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy: Vercel serverless setup"
   git push
   ```

2. Vercel will automatically detect and deploy

### **Manual Deploy:**

1. Vercel Dashboard → Deployments
2. Click **"Deploy"** button
3. Or use CLI:
   ```bash
   vercel --prod
   ```

---

## **Step 6: Verify Deployment**

### **1. Check Deployment Status:**

Vercel Dashboard → Deployments:
- ✅ Should show "Ready" status
- ✅ Green checkmark

### **2. Test Health Endpoint:**

```
https://your-project.vercel.app/api/health
```

**Expected:**
```json
{
  "success": true,
  "status": "healthy",
  "database": {
    "state": "connected",
    "isConnected": true
  }
}
```

### **3. Test Database Connection:**

```
https://your-project.vercel.app/api/test/db-connection
```

**Expected:**
```json
{
  "success": true,
  "message": "Database connected successfully",
  "connectionString": {
    "exists": true,
    "hasDatabase": true
  }
}
```

---

## **Step 7: Check Logs**

Vercel Dashboard → Deployments → Latest → Logs:

Look for:
- ✅ `✅ Database connected (Serverless)`
- ✅ `✅ MongoDB Connected: ...`
- ✅ No error messages

---

## **Common Issues & Solutions:**

### **Issue 1: 404 Not Found**

**Solution:**
- Check `vercel.json` is correct
- Verify `server.js` exports the app
- Redeploy

### **Issue 2: Database Disconnected**

**Solution:**
- Verify `MONGODB_URI` includes `/ebook_db`
- Check MongoDB Atlas IP whitelist (`0.0.0.0/0`)
- Redeploy after adding variables

### **Issue 3: Environment Variables Not Found**

**Solution:**
- Make sure variables are saved
- Select correct environment (Production)
- Redeploy after adding variables

---

## **Post-Deployment Checklist:**

- [ ] Deployment successful (green checkmark)
- [ ] Health endpoint returns `"isConnected": true`
- [ ] Database connection test passes
- [ ] No errors in logs
- [ ] Frontend can connect to backend
- [ ] Registration works
- [ ] API endpoints respond correctly

---

## **Quick Reference:**

**Project URL:**
```
https://your-project.vercel.app
```

**Health Check:**
```
https://your-project.vercel.app/api/health
```

**Database Test:**
```
https://your-project.vercel.app/api/test/db-connection
```

---

## **Next Steps After Deployment:**

1. ✅ Update frontend `.env` with backend URL
2. ✅ Test registration flow
3. ✅ Test API endpoints
4. ✅ Monitor logs for errors
5. ✅ Set up custom domain (optional)

---

**Last Updated:** Fresh deployment setup guide

