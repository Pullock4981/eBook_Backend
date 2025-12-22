# Quick Start Guide - Backend Server

## সমস্যা: Network Error / Connection Refused

যদি আপনি `ERR_CONNECTION_REFUSED` বা `Network error` দেখছেন, তাহলে backend server চালু নেই।

## সমাধান:

### 1. MongoDB Setup করুন

#### Option A: Local MongoDB (আপনার কম্পিউটারে)
```bash
# MongoDB install করুন (যদি না থাকে)
# Windows: https://www.mongodb.com/try/download/community

# MongoDB service start করুন
# Windows Services থেকে "MongoDB" service start করুন
```

`.env` file-এ:
```
MONGODB_URI=mongodb://localhost:27017/ebook_db
```

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. https://www.mongodb.com/cloud/atlas এ account করুন
2. Free cluster তৈরি করুন
3. Database Access এ user তৈরি করুন
4. Network Access এ আপনার IP address whitelist করুন (বা `0.0.0.0/0` সব IP-এর জন্য)
5. Connect button থেকে connection string নিন

`.env` file-এ:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ebook_db
```

### 2. Backend Server Start করুন

```bash
# Backend folder-এ যান
cd eBook_Backend

# Dependencies install করুন (যদি না করে থাকেন)
npm install

# Server start করুন
npm run dev
```

### 3. Verify করুন

Browser এ যান: https://e-book-backend-tau.vercel.app/api/health

আপনি দেখবেন:
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

## Common Errors:

### Error: "MONGODB_URI is not set"
- `.env` file আছে কিনা check করুন
- `MONGODB_URI` variable আছে কিনা check করুন

### Error: "Connection refused" (Local MongoDB)
- MongoDB service running আছে কিনা check করুন
- Windows: Services.msc থেকে MongoDB service start করুন

### Error: "IP whitelist" (MongoDB Atlas)
- MongoDB Atlas dashboard এ যান
- Network Access section এ আপনার IP add করুন
- অথবা `0.0.0.0/0` add করুন (সব IP-এর জন্য - development-এর জন্য)

### Error: "Authentication failed"
- Username/password check করুন
- MongoDB Atlas এ user আছে কিনা verify করুন

## Helpful Commands:

```bash
# Backend start
npm run dev

# Backend start (production mode)
npm start

# Check if MongoDB is running (Windows)
# Services.msc এ MongoDB service check করুন

# Check if port 5000 is in use
netstat -ano | findstr :5000
```

## Next Steps:

1. Backend server start করুন
2. Frontend refresh করুন
3. Error message আরও specific হবে এখন

