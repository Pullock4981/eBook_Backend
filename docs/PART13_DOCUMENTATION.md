# Part 13: Admin Panel - Documentation

## 📋 Overview

Part 13 implements a comprehensive admin panel system, including:
- Dashboard analytics
- User management
- Sales analytics
- Product performance tracking
- Revenue reporting

---

## 🎯 Features Implemented

### 1. **Dashboard Analytics**
- Overview statistics (users, products, orders, revenue)
- Order status breakdown
- Revenue by period (today, 7 days, 30 days, 90 days)
- Top selling products
- Sales trends (last 30 days)
- Affiliate performance

### 2. **User Management**
- View all users with filters
- User details with order history
- Update user role (user/admin)
- Update user status
- Search users
- User statistics

### 3. **Sales Analytics**
- Total revenue tracking
- Revenue by period
- Sales trends
- Order status distribution

### 4. **Product Analytics**
- Top selling products
- Product performance metrics
- Revenue by product

---

## 📁 Files Created

### Services
- `services/adminAnalyticsService.js` - Dashboard analytics business logic
- `services/adminUserService.js` - User management business logic

### Controllers
- `controllers/adminDashboardController.js` - Admin dashboard API endpoints

### Routes
- `routes/adminDashboard.js` - Admin dashboard API routes

---

## 🔧 Implementation Details

### 1. Admin Analytics Service

**File:** `services/adminAnalyticsService.js`

**Functions:**
- `getDashboardStats()` - Get complete dashboard overview
- `getTotalRevenue()` - Calculate total revenue
- `getRecentOrders(limit)` - Get recent orders
- `getOrdersByStatus()` - Get orders grouped by status
- `getRevenueByPeriod()` - Get revenue for different periods
- `getTopProducts(limit)` - Get top selling products
- `getSalesTrends()` - Get sales trends (last 30 days)
- `getUserStats()` - Get user statistics

**Dashboard Stats Includes:**
- Overview: Total users, products, orders, revenue, affiliates
- Orders: By status, recent orders
- Revenue: Total, by period, trends
- Products: Top selling
- Affiliates: Statistics

---

### 2. Admin User Service

**File:** `services/adminUserService.js`

**Functions:**
- `getAllUsers(filters, page, limit)` - Get all users with pagination
- `getUserById(userId)` - Get user with details and statistics
- `updateUserRole(userId, role)` - Update user role
- `updateUserStatus(userId, isActive)` - Update user status
- `deleteUser(userId)` - Delete user (with validation)
- `searchUsers(searchTerm, page, limit)` - Search users

---

### 3. Admin Dashboard Controller

**File:** `controllers/adminDashboardController.js`

**Endpoints:**
- `GET /api/admin/dashboard` - Get dashboard overview
- `GET /api/admin/users/stats` - Get user statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user by ID
- `PUT /api/admin/users/:userId/role` - Update user role
- `PUT /api/admin/users/:userId/status` - Update user status
- `DELETE /api/admin/users/:userId` - Delete user

---

## 🔌 API Endpoints

### Dashboard Endpoints

#### 1. Get Dashboard Overview
```
GET /api/admin/dashboard
Headers: { Authorization: Bearer <admin_token> }
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "overview": {
      "totalUsers": 100,
      "totalProducts": 50,
      "totalOrders": 200,
      "totalRevenue": 50000,
      "activeAffiliates": 10,
      "pendingAffiliates": 5
    },
    "orders": {
      "byStatus": {
        "pending": 10,
        "confirmed": 50,
        "processing": 20,
        "shipped": 30,
        "delivered": 80,
        "cancelled": 10
      },
      "recent": [...]
    },
    "revenue": {
      "total": 50000,
      "byPeriod": {
        "today": 1000,
        "last7Days": 5000,
        "last30Days": 20000,
        "last90Days": 50000
      },
      "trends": [...]
    },
    "products": {
      "topSelling": [...]
    },
    "affiliates": {...}
  }
}
```

#### 2. Get User Statistics
```
GET /api/admin/users/stats
Headers: { Authorization: Bearer <admin_token> }
```

**Response:**
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "total": 100,
    "verified": 80,
    "unverified": 20,
    "byRole": {
      "user": 95,
      "admin": 5
    },
    "recent": [...]
  }
}
```

---

### User Management Endpoints

#### 1. Get All Users
```
GET /api/admin/users?role=user&isVerified=true&search=john&page=1&limit=10
Headers: { Authorization: Bearer <admin_token> }
```

**Query Parameters:**
- `role` - Filter by role (user/admin)
- `isVerified` - Filter by verification status (true/false)
- `search` - Search by mobile, name, or email
- `page` - Page number
- `limit` - Items per page

#### 2. Get User by ID
```
GET /api/admin/users/:userId
Headers: { Authorization: Bearer <admin_token> }
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "...",
      "mobile": "01700000000",
      "profile": {...},
      "role": "user",
      "isVerified": true
    },
    "statistics": {
      "totalOrders": 10,
      "totalSpent": 5000,
      "lastOrder": {...}
    },
    "recentOrders": [...]
  }
}
```

#### 3. Update User Role
```
PUT /api/admin/users/:userId/role
Headers: { Authorization: Bearer <admin_token> }
Body: {
  "role": "admin"
}
```

#### 4. Update User Status
```
PUT /api/admin/users/:userId/status
Headers: { Authorization: Bearer <admin_token> }
Body: {
  "isActive": true
}
```

#### 5. Delete User
```
DELETE /api/admin/users/:userId
Headers: { Authorization: Bearer <admin_token> }
```

---

## 📊 Analytics Features

### 1. **Revenue Analytics**
- Total revenue from all paid orders
- Revenue breakdown by period:
  - Today
  - Last 7 days
  - Last 30 days
  - Last 90 days
- Sales trends (daily for last 30 days)

### 2. **Order Analytics**
- Orders by status (pending, confirmed, processing, shipped, delivered, cancelled)
- Recent orders
- Order trends

### 3. **Product Analytics**
- Top selling products (by revenue)
- Product sales quantity
- Product revenue

### 4. **User Analytics**
- Total users
- Verified vs unverified
- Users by role
- Recent registrations

### 5. **Affiliate Analytics**
- Total affiliates
- Active affiliates
- Pending affiliates
- Commission statistics

---

## 🔒 Security Features

### 1. **Admin Only Access**
- All endpoints require admin role
- Role-based access control
- Authentication required

### 2. **Data Validation**
- Input validation
- User existence checks
- Order validation before user deletion

---

## 📝 Usage Examples

### Frontend Integration

**1. Get Dashboard Data:**
```javascript
const response = await fetch('/api/admin/dashboard', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const { data } = await response.json();
// Use data.overview, data.orders, data.revenue, etc.
```

**2. Get All Users:**
```javascript
const response = await fetch('/api/admin/users?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const { data } = await response.json();
// Use data.users and data.pagination
```

**3. Update User Role:**
```javascript
const response = await fetch(`/api/admin/users/${userId}/role`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'admin'
  })
});
```

---

## 🧪 Testing Checklist

- [ ] Get dashboard overview
- [ ] Get user statistics
- [ ] Get all users
- [ ] Get users with filters
- [ ] Search users
- [ ] Get user by ID
- [ ] Update user role
- [ ] Update user status
- [ ] Delete user
- [ ] Verify admin-only access
- [ ] Test pagination
- [ ] Test error handling

---

## 🐛 Error Handling

**Common Errors:**

1. **Unauthorized:**
   ```json
   {
     "success": false,
     "message": "Access denied. Insufficient permissions."
   }
   ```

2. **User Not Found:**
   ```json
   {
     "success": false,
     "message": "User not found"
   }
   ```

3. **Cannot Delete User:**
   ```json
   {
     "success": false,
     "message": "Cannot delete user with existing orders"
   }
   ```

---

## 🔄 Integration

**Admin Panel integrates with:**
- User Management (Part 4)
- Product Management (Part 7)
- Order Management (Part 8)
- Coupon Management (Part 9)
- Affiliate Program (Part 12)

**All admin endpoints are consolidated under:**
- `/api/admin/*` - All admin routes

---

## 📊 Dashboard Components

### 1. **Overview Cards**
- Total Users
- Total Products
- Total Orders
- Total Revenue
- Active Affiliates
- Pending Affiliates

### 2. **Charts & Graphs**
- Revenue trends (line chart)
- Order status distribution (pie chart)
- Top products (bar chart)
- Sales by period (bar chart)

### 3. **Tables**
- Recent orders
- Top products
- Recent users
- Pending affiliates

---

## 🚀 Next Steps

1. **Frontend Integration:**
   - Dashboard UI components
   - Charts and graphs
   - Data tables
   - Filters and search

2. **Additional Analytics:**
   - Export reports (PDF/Excel)
   - Custom date range selection
   - Advanced filtering
   - Real-time updates

3. **Notifications:**
   - New order alerts
   - Low stock alerts
   - Pending affiliate alerts
   - Withdraw request alerts

---

## ✅ Part 13 Complete

**Status:** ✅ **COMPLETE**

All admin panel features implemented:
- ✅ Dashboard analytics
- ✅ User management
- ✅ Sales analytics
- ✅ Product analytics
- ✅ Revenue reporting
- ✅ API endpoints
- ✅ Security & validation

**Ready for:** Frontend integration and testing

---

**Documentation Date:** 2025-12-06  
**Part:** 13 - Admin Panel

