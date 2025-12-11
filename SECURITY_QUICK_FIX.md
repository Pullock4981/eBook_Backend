# 🚨 QUICK SECURITY FIX - Do This NOW

## ⚠️ **URGENT: Your credentials are exposed!**

---

## **STEP 1: Rotate MongoDB Credentials (5 minutes)**

1. **MongoDB Atlas → Database Access**
2. **Delete:** `ashikpullock99_db_user`
3. **Create New User:**
   - Username: `ebook_db_user_v2` (or any new name)
   - Password: Click "Autogenerate Secure Password" (SAVE IT!)
   - Role: `readWrite` on `ebook_db`
4. **Get Connection String:**
   - Database → Connect → Connect your application
   - Copy string
   - **Add `/ebook_db` before `?`**
   - **Add `?retryWrites=true&w=majority&appName=Cluster0`**

---

## **STEP 2: Update Vercel (2 minutes)**

1. **Vercel Dashboard → Settings → Environment Variables**
2. **Edit `MONGODB_URI`:**
   - Delete old value
   - Paste new connection string
   - Save
3. **Edit `JWT_SECRET`:**
   - Generate new: `openssl rand -base64 64`
   - Paste new secret
   - Save
4. **Redeploy:**
   - Deployments → Latest → ... → Redeploy

---

## **STEP 3: Commit Fixed Files (1 minute)**

```bash
cd eBook_Backend
git add .
git commit -m "Security: Remove exposed credentials from documentation"
git push
```

---

## **STEP 4: Verify (2 minutes)**

1. **Test API:**
   ```
   https://your-project.vercel.app/api/health
   ```
   Should show: `"isConnected": true`

2. **Check GitHub:**
   - Go to your repository
   - Search for: `AC7Kgufr3ISkl6Nm`
   - Should find nothing (except in SECURITY_FIX.md which is documentation)

---

## ✅ **Done!**

Your credentials are now:
- ✅ Rotated in MongoDB Atlas
- ✅ Updated in Vercel
- ✅ Removed from code files
- ✅ Application redeployed

**Note:** Git history still contains old credentials. See `SECURITY_FIX.md` for cleaning Git history (optional).

---

**Total Time: ~10 minutes**

