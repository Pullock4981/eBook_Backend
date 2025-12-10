# Vercel Database Connection Troubleshooting

## 🔴 **Error: "Operation `users.findOne()` buffering timed out after 10000ms"**

এই error-টি MongoDB connection timeout নির্দেশ করে।

---

## ✅ **সমাধান (Solution):**

### **1. MongoDB Atlas IP Whitelist Check:**

MongoDB Atlas-এ **Network Access** section-এ যান:

1. **MongoDB Atlas Dashboard** → **Network Access**
2. **IP Whitelist** check করুন
3. **Vercel-এর জন্য:** `0.0.0.0/0` allow করুন (সব IP থেকে access)
   - অথবা Vercel-এর specific IP ranges add করুন

**Important:** Production-এ `0.0.0.0/0` safe, কিন্তু যদি specific IP চান:
- Vercel uses dynamic IPs, তাই `0.0.0.0/0` recommended

---

### **2. MongoDB Connection String Check:**

Vercel Environment Variables-এ `MONGODB_URI` check করুন:

**Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/ebook_db?retryWrites=true&w=majority
```

**Checklist:**
- ✅ Username correct?
- ✅ Password correct? (special characters properly encoded)
- ✅ Database name (`ebook_db`) আছে?
- ✅ Connection string complete?

---

### **3. MongoDB Atlas Database User:**

1. **MongoDB Atlas Dashboard** → **Database Access**
2. User-এর **Password** verify করুন
3. User-এর **Database User Privileges** check করুন:
   - Should have: `readWrite` access to `ebook_db` database

---

### **4. Connection Timeout Settings:**

Code-এ timeout settings update করা হয়েছে:
- `serverSelectionTimeoutMS: 30000` (30 seconds)
- Connection pooling enabled
- Serverless-friendly settings

---

### **5. Vercel Environment Variables:**

Vercel Dashboard-এ verify করুন:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ebook_db?retryWrites=true&w=majority
NODE_ENV=production
```

**Important:** 
- Connection string-এ **no spaces** থাকবে না
- Special characters properly encoded
- Database name (`ebook_db`) include করা আছে

---

### **6. Test Connection:**

Vercel Logs check করুন:

1. **Vercel Dashboard** → আপনার project → **Deployments**
2. Latest deployment-এ click করুন
3. **Logs** tab-এ যান
4. Look for:
   - `✅ Database connected (Serverless)`
   - `✅ MongoDB Connected: ...`
   - অথবা error messages

---

### **7. Manual Test:**

Health check endpoint test করুন:

```bash
curl https://e-book-backend-nu.vercel.app/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "database": {
    "state": "connected",
    "isConnected": true,
    "host": "...",
    "name": "ebook_db"
  }
}
```

---

## 🔧 **Quick Fixes:**

### **Fix 1: Update MongoDB Atlas IP Whitelist**

1. MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow from anywhere)
3. Save
4. Wait 1-2 minutes
5. Redeploy on Vercel

### **Fix 2: Verify Connection String**

1. Vercel → Settings → Environment Variables
2. `MONGODB_URI` check করুন
3. Format: `mongodb+srv://user:pass@cluster.net/ebook_db`
4. Save
5. Redeploy

### **Fix 3: Check Database User**

1. MongoDB Atlas → Database Access
2. User-এর password verify করুন
3. Permissions check করুন (readWrite on ebook_db)
4. If needed, create new user with proper permissions

---

## 📝 **Common Issues:**

### **Issue 1: Connection String Missing Database Name**
```
❌ mongodb+srv://user:pass@cluster.net
✅ mongodb+srv://user:pass@cluster.net/ebook_db
```

### **Issue 2: IP Not Whitelisted**
```
❌ Error: IP not whitelisted
✅ Solution: Add 0.0.0.0/0 to Network Access
```

### **Issue 3: Wrong Password**
```
❌ Error: Authentication failed
✅ Solution: Verify password in MongoDB Atlas
```

### **Issue 4: User Doesn't Have Permissions**
```
❌ Error: Not authorized
✅ Solution: Grant readWrite permissions
```

---

## 🚀 **After Fixing:**

1. **Redeploy on Vercel:**
   - Push changes to Git
   - Vercel automatically redeploys
   - Or manually trigger redeploy

2. **Check Logs:**
   - Vercel Dashboard → Deployments → Logs
   - Look for database connection messages

3. **Test API:**
   ```bash
   curl https://e-book-backend-nu.vercel.app/api/health
   ```

4. **Test Registration:**
   - Try registering a new user
   - Should work without timeout error

---

## 📞 **Still Having Issues?**

1. Check Vercel Logs for detailed error messages
2. Verify MongoDB Atlas connection string format
3. Ensure IP whitelist includes `0.0.0.0/0`
4. Check database user permissions
5. Verify environment variables in Vercel

---

**Last Updated:** After adding serverless-friendly database connection handling

