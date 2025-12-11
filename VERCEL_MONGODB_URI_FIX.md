# Vercel MONGODB_URI Fix - Step by Step

## 🔴 **Problem:**

Your current `MONGODB_URI` format (example):
```
mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
```
**⚠️ Note: This is an example. Never commit real credentials.**

**Issue:** Database name (`/ebook_db`) is missing before the `?`

---

## ✅ **Solution:**

### **Step 1: Update MONGODB_URI in Vercel**

Vercel Dashboard → Settings → Environment Variables:

1. Find `MONGODB_URI`
2. Click to edit
3. **Update the Value to (replace with your actual credentials):**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ebook_db?retryWrites=true&w=majority&appName=Cluster0
   ```
   **⚠️ Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials.**

**Changes:**
- ✅ Added `/ebook_db` before the `?`
- ✅ Added `retryWrites=true&w=majority` for better reliability
- ✅ Kept `appName=Cluster0`

---

### **Step 2: Verify Environment**

Make sure:
- ✅ "All Environments" is selected
- ✅ Or at least "Production" is selected

---

### **Step 3: Save**

1. Click **Save** button
2. Wait for confirmation

---

### **Step 4: Redeploy**

**Important:** After updating environment variables, you MUST redeploy:

1. Vercel Dashboard → **Deployments**
2. Latest deployment → Click **...** (three dots)
3. Select **Redeploy**
4. Wait for deployment to complete (1-2 minutes)

---

### **Step 5: Test**

After redeploy, test:
```
https://e-book-backend-nu.vercel.app/api/test/db-connection
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database connected successfully",
  "connectionString": {
    "exists": true,
    "hasDatabase": true,
    "length": 150
  },
  "database": {
    "state": "connected",
    "isConnected": true,
    "host": "cluster0-shard-00-00.0bf9be8.mongodb.net",
    "name": "ebook_db"
  }
}
```

---

## 📝 **Correct Connection String Format:**

```
mongodb+srv://username:password@cluster.mongodb.net/ebook_db?retryWrites=true&w=majority&appName=Cluster0
```

**Components:**
- `mongodb+srv://` - Protocol
- `username:password@` - Credentials
- `cluster.mongodb.net` - Host
- `/ebook_db` - **Database name (REQUIRED)**
- `?retryWrites=true&w=majority&appName=Cluster0` - Query parameters

---

## ⚠️ **Important Notes:**

1. **Database name is REQUIRED** - Without it, Mongoose won't know which database to use
2. **Redeploy is REQUIRED** - Environment variable changes don't take effect until redeploy
3. **Environment selection** - Make sure Production environment is selected

---

## 🔄 **After Fixing:**

1. ✅ Connection string includes `/ebook_db`
2. ✅ `retryWrites=true&w=majority` added
3. ✅ Saved in Vercel
4. ✅ Redeployed
5. ✅ Test endpoint shows `"exists": true` and `"hasDatabase": true`
6. ✅ Registration works without timeout

---

**Last Updated:** After identifying missing database name in connection string

