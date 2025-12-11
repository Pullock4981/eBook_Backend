# Vercel Deployment Checklist

## ✅ **Pre-Deployment:**

- [ ] Code committed to GitHub
- [ ] `vercel.json` file exists and is correct
- [ ] `server.js` exports the app
- [ ] MongoDB Atlas IP whitelist: `0.0.0.0/0` added
- [ ] MongoDB connection string ready (with `/ebook_db`)

---

## ✅ **Vercel Project Setup:**

- [ ] Project created in Vercel
- [ ] GitHub repository connected
- [ ] Build settings configured

---

## ✅ **Environment Variables (Vercel Dashboard):**

### **Critical:**
- [ ] `MONGODB_URI` (with `/ebook_db` database name)
- [ ] `JWT_SECRET` (strong random string, 64+ chars)
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `JWT_REFRESH_EXPIRES_IN=30d`
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` (your frontend domain)

### **Important:**
- [ ] `OTP_EXPIRY_MINUTES=5`
- [ ] `OTP_LENGTH=6`
- [ ] `AFFILIATE_COMMISSION_RATE=10`
- [ ] `AFFILIATE_MIN_WITHDRAW=500`
- [ ] `EBOOK_TOKEN_EXPIRY_DAYS=365` (or `EBOOK_ACCESS_TOKEN_EXPIRY=24h`)

### **Optional:**
- [ ] `SMS_PROVIDER=local`
- [ ] Payment gateway credentials (if using)
- [ ] Cloudinary credentials (if using)

---

## ✅ **Environment Selection:**

- [ ] All variables set for **Production** environment
- [ ] Variables saved
- [ ] No typos in variable names

---

## ✅ **Deploy:**

- [ ] Code pushed to GitHub (if auto-deploy)
- [ ] Or manual deploy triggered
- [ ] Deployment completed successfully
- [ ] Status shows "Ready" (green checkmark)

---

## ✅ **Post-Deployment Tests:**

- [ ] Health check: `https://your-project.vercel.app/api/health`
  - [ ] Returns `"isConnected": true`
- [ ] Database test: `https://your-project.vercel.app/api/test/db-connection`
  - [ ] Returns `"success": true`
  - [ ] Shows `"exists": true` and `"hasDatabase": true`
- [ ] Registration test (from frontend)
  - [ ] No timeout errors
  - [ ] User can register successfully

---

## ✅ **Logs Check:**

- [ ] Vercel Logs → No critical errors
- [ ] Database connection messages present
- [ ] No timeout errors

---

## 🎯 **Quick Deploy Commands:**

```bash
# 1. Commit and push
git add .
git commit -m "Deploy: Vercel serverless backend"
git push

# 2. Vercel will auto-deploy
# Or use CLI:
vercel --prod
```

---

## 📝 **MONGODB_URI Format (Important!):**

**Correct:**
```
mongodb+srv://user:pass@cluster.net/ebook_db?retryWrites=true&w=majority&appName=Cluster0
```

**Wrong:**
```
mongodb+srv://user:pass@cluster.net/?appName=Cluster0
```
(Missing `/ebook_db` before `?`)

---

**Ready to deploy!** Follow the checklist above. 🚀

