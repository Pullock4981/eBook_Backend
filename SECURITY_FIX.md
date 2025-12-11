# 🔒 Security Fix - Exposed Credentials

## ⚠️ **CRITICAL: Credentials Were Exposed**

Your MongoDB Atlas database credentials and JWT secret were exposed in the Git repository. **Immediate action required.**

---

## 🚨 **IMMEDIATE ACTIONS REQUIRED:**

### **1. Rotate MongoDB Atlas Credentials (URGENT)**

**Steps:**

1. **Go to MongoDB Atlas Dashboard:**
   - Login: https://cloud.mongodb.com
   - Navigate to: **Database Access**

2. **Delete the Exposed User:**
   - Find user: `ashikpullock99_db_user`
   - Click **Delete** (⚠️ This will break current connections)
   - Confirm deletion

3. **Create New Database User:**
   - Click **Add New Database User**
   - **Username:** Choose a new username (e.g., `ebook_db_user_prod`)
   - **Password:** Generate a strong password (click "Autogenerate Secure Password")
   - **Database User Privileges:** 
     - Select: **Built-in Role**
     - Role: `readWrite`
     - Database: `ebook_db`
   - Click **Add User**

4. **Get New Connection String:**
   - Go to: **Database → Connect**
   - Select: **Connect your application**
   - Copy the connection string
   - **Important:** Add `/ebook_db` before the `?`
   - Add query params: `?retryWrites=true&w=majority&appName=Cluster0`

5. **Update Vercel Environment Variable:**
   - Vercel Dashboard → Settings → Environment Variables
   - Edit `MONGODB_URI`
   - Paste the new connection string
   - Save
   - **Redeploy** (required!)

---

### **2. Rotate JWT Secret (URGENT)**

**Steps:**

1. **Generate New JWT Secret:**
   ```bash
   # Using OpenSSL (recommended)
   openssl rand -base64 64
   
   # Or using Node.js
   node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
   ```

2. **Update Vercel Environment Variable:**
   - Vercel Dashboard → Settings → Environment Variables
   - Edit `JWT_SECRET`
   - Paste the new secret
   - Save
   - **Redeploy** (required!)

3. **⚠️ Important:** All existing user sessions will be invalidated. Users will need to log in again.

---

### **3. Remove Credentials from Git History**

**Option A: Using BFG Repo-Cleaner (Recommended):**

```bash
# Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
git clone --mirror https://github.com/your-username/eBook_Backend.git

# Remove credentials
java -jar bfg.jar --replace-text credentials.txt eBook_Backend.git

# credentials.txt should contain:
# mongodb+srv://ashikpullock99_db_user:AC7Kgufr3ISkl6Nm@cluster0.0bf9be8.mongodb.net
# a7f3b9c2d8e1f4a6b9c2d5e8f1a4b7c0d3e6f9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d3e6f9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3

# Clean up
cd eBook_Backend.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ This rewrites history)
git push --force
```

**Option B: Using git-filter-repo (Alternative):**

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove credentials from history
git filter-repo --replace-text <(echo "mongodb+srv://ashikpullock99_db_user:AC7Kgufr3ISkl6Nm@cluster0.0bf9be8.mongodb.net==>mongodb+srv://[REDACTED]")

# Force push
git push origin --force --all
```

**⚠️ WARNING:** Force pushing rewrites Git history. Coordinate with your team first!

---

### **4. Verify No More Exposed Secrets**

**Check all files for exposed credentials:**
```bash
# Search for MongoDB URIs
grep -r "mongodb+srv://" . --exclude-dir=node_modules

# Search for JWT secrets (if you know the pattern)
grep -r "JWT_SECRET=" . --exclude-dir=node_modules

# Check .env files are in .gitignore
cat .gitignore | grep .env
```

**Expected:** No real credentials should appear (only placeholders).

---

## ✅ **Files Already Fixed:**

The following files have been sanitized (real credentials replaced with placeholders):

- ✅ `VERCEL_CONNECTION_FIX.md`
- ✅ `VERCEL_DEPLOYMENT_GUIDE.md`
- ✅ `VERCEL_MONGODB_URI_FIX.md`

---

## 🔒 **Security Best Practices:**

### **1. Never Commit Secrets:**

❌ **DON'T:**
- Commit `.env` files
- Commit connection strings with real credentials
- Commit API keys, passwords, or tokens
- Hardcode secrets in code

✅ **DO:**
- Use `.env` files (already in `.gitignore`)
- Use environment variables in deployment platforms
- Use placeholder examples in documentation
- Use secret management services (Vercel, AWS Secrets Manager, etc.)

---

### **2. Use .env.example Files:**

Create `.env.example` with placeholders:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ebook_db
JWT_SECRET=your-secret-key-here
```

**Never commit `.env`** (already in `.gitignore`).

---

### **3. Regular Security Audits:**

- Use GitHub's secret scanning (already enabled)
- Use tools like `git-secrets` to prevent committing secrets
- Regularly rotate credentials
- Monitor access logs in MongoDB Atlas

---

### **4. MongoDB Atlas Security:**

- ✅ Enable IP whitelist (already done: `0.0.0.0/0` for Vercel)
- ✅ Use strong passwords
- ✅ Limit user permissions (readWrite only, not admin)
- ✅ Enable MongoDB Atlas monitoring/alerts
- ✅ Regularly review database access logs

---

## 📋 **Post-Fix Checklist:**

- [ ] MongoDB credentials rotated
- [ ] JWT secret rotated
- [ ] Vercel environment variables updated
- [ ] Vercel redeployed
- [ ] All users logged out (JWT rotation)
- [ ] Git history cleaned (if using force push)
- [ ] No more exposed secrets in repository
- [ ] MongoDB Atlas old user deleted
- [ ] New database user created with limited permissions
- [ ] Application tested with new credentials

---

## 🆘 **If You Need Help:**

1. **MongoDB Atlas Support:**
   - Dashboard → Support → Create a case
   - Or: https://www.mongodb.com/support

2. **Vercel Support:**
   - Dashboard → Help → Contact Support
   - Or: https://vercel.com/support

3. **GitHub Security:**
   - Repository → Security → Security Advisories
   - Report the issue if needed

---

## 📝 **Notes:**

- **Git History:** Even after removing from current files, old commits still contain the secrets. Use BFG or git-filter-repo to clean history (optional but recommended).

- **Force Push Warning:** If you clean Git history, coordinate with your team. Everyone will need to re-clone the repository.

- **Session Invalidation:** After rotating JWT secret, all users must log in again. This is expected and secure.

---

**Last Updated:** After fixing exposed credentials security issue

