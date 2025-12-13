# PDF Upload Error Fix Guide

## 🔴 Error: "Server Error" / "Failed to upload PDF"

### Possible Reasons:

#### 1. **Missing Cloudinary Configuration** ⚠️ (Most Common)
The PDF upload requires Cloudinary to be configured. If Cloudinary environment variables are missing, uploads will fail.

**Check:**
- `CLOUDINARY_CLOUD_NAME` is set in Vercel environment variables
- `CLOUDINARY_API_KEY` is set in Vercel environment variables
- `CLOUDINARY_API_SECRET` is set in Vercel environment variables

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these three variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Redeploy the backend

#### 2. **Authentication/Authorization Issues** 🔐
The `/api/upload/pdf` route requires:
- User must be authenticated (JWT token)
- User must have `admin` role

**Check:**
- Are you logged in as admin?
- Is the JWT token being sent in the request header?
- Check browser console for 401/403 errors

**Solution:**
- Make sure you're logged in as an admin user
- Check that the token is being sent: `Authorization: Bearer <token>`

#### 3. **Cloudinary Account Not Set Up** 📦
If you haven't created a Cloudinary account, uploads will fail.

**Solution:**
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. Get your credentials from Dashboard
4. Add them to Vercel environment variables

#### 4. **File Size Exceeds Limit** 📏
PDF files larger than 50MB will be rejected.

**Check:**
- File size should be ≤ 50MB

**Solution:**
- Compress the PDF or use a smaller file

#### 5. **Invalid File Type** 📄
Only PDF files are accepted.

**Check:**
- File must be `.pdf` format
- MIME type must be `application/pdf`

**Solution:**
- Ensure the file is a valid PDF

#### 6. **Network/Connection Issues** 🌐
Cloudinary connection might be failing.

**Check:**
- Check Vercel logs for Cloudinary connection errors
- Check if Cloudinary service is accessible

**Solution:**
- Check Vercel function logs
- Verify Cloudinary service status

#### 7. **Multer Storage Configuration Issue** ⚙️
The multer-storage-cloudinary might have configuration issues.

**Check:**
- Verify `middleware/upload.js` is correctly configured
- Check if `multer-storage-cloudinary` package is installed

**Solution:**
- Ensure `multer-storage-cloudinary` is in `package.json`
- Check that Cloudinary config is correct

---

## 🔧 Quick Fix Steps:

### Step 1: Check Environment Variables in Vercel
```bash
# In Vercel Dashboard:
Settings → Environment Variables

# Required variables:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 2: Verify Cloudinary Account
1. Login to Cloudinary Dashboard
2. Check if account is active
3. Verify API credentials

### Step 3: Test Upload Endpoint
```bash
# Test with curl (replace with your token and file)
curl -X POST https://your-backend.vercel.app/api/upload/pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "pdf=@/path/to/file.pdf"
```

### Step 4: Check Backend Logs
- Go to Vercel Dashboard → Your Project → Functions → Logs
- Look for error messages related to Cloudinary or upload

### Step 5: Verify Admin Access
- Make sure you're logged in as admin
- Check user role in database or JWT token

---

## 📋 Checklist:

- [ ] Cloudinary environment variables set in Vercel
- [ ] Cloudinary account created and active
- [ ] User is logged in as admin
- [ ] JWT token is being sent in requests
- [ ] PDF file is valid and ≤ 50MB
- [ ] Backend is deployed with latest changes
- [ ] No CORS errors in browser console
- [ ] Network connection is stable

---

## 🐛 Debug Steps:

### 1. Check Browser Console
- Open Developer Tools (F12)
- Go to Network tab
- Try uploading PDF
- Check the request/response for error details

### 2. Check Vercel Logs
- Go to Vercel Dashboard
- Navigate to Functions → Logs
- Look for errors during upload attempt

### 3. Test API Directly
```bash
# Test upload endpoint
POST /api/upload/pdf
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: multipart/form-data
Body:
  pdf: <file>
```

### 4. Verify Cloudinary Config
```javascript
// In backend, check if Cloudinary is configured
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
});
```

---

## 💡 Alternative Solution (If Cloudinary Not Available):

If you can't use Cloudinary, you can:
1. Use manual URL entry instead of file upload
2. Host PDFs on another service (AWS S3, Google Cloud Storage, etc.)
3. Use a different file upload service

The form allows manual URL entry as an alternative to file upload.

---

## 📞 Still Having Issues?

If the problem persists:
1. Check Vercel function logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a small PDF file (< 1MB) to rule out size issues
4. Check Cloudinary dashboard for upload activity
5. Verify admin authentication is working

