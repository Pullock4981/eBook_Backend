# Part 12: Affiliate Program - Documentation

## 📋 Overview

Part 12 implements a comprehensive affiliate program system, including:
- User affiliate registration
- Unique referral links and codes
- Commission tracking
- Withdraw request system
- Admin approval workflow

---

## 🎯 Features Implemented

### 1. **Affiliate Registration**
- Users can register as affiliates
- Unique referral code generation
- Referral link creation
- Admin approval required

### 2. **Commission Tracking**
- Automatic commission creation on order payment
- Commission calculation based on order amount
- Commission status tracking (pending, approved, paid)
- Commission statistics

### 3. **Withdraw System**
- Affiliates can request commission withdrawal
- Minimum withdraw amount enforcement
- Payment method selection (bank, mobile banking)
- Admin approval workflow

### 4. **Admin Management**
- Approve/reject affiliate applications
- Suspend affiliates
- Approve/reject withdraw requests
- Mark withdraws as paid
- Analytics dashboard

---

## 📁 Files Created

### Models
- `models/Affiliate.js` - Affiliate user model
- `models/Commission.js` - Commission tracking model
- `models/WithdrawRequest.js` - Withdraw request model

### Repositories
- `repositories/affiliateRepository.js` - Affiliate data access
- `repositories/commissionRepository.js` - Commission data access
- `repositories/withdrawRequestRepository.js` - Withdraw request data access

### Services
- `services/affiliateService.js` - Affiliate business logic
- `services/adminAffiliateService.js` - Admin affiliate management

### Controllers
- `controllers/affiliateController.js` - Affiliate API endpoints
- `controllers/adminAffiliateController.js` - Admin affiliate API endpoints

### Routes
- `routes/affiliate.js` - Affiliate API routes
- `routes/adminAffiliate.js` - Admin affiliate API routes

---

## 🔧 Implementation Details

### 1. Affiliate Model

**File:** `models/Affiliate.js`

**Key Features:**
- Unique referral code (auto-generated)
- Referral link (auto-generated)
- Commission rate (configurable)
- Statistics tracking
- Payment details (bank, mobile banking)
- Status management (pending, active, suspended, rejected)

**Schema Fields:**
```javascript
{
  user: ObjectId (ref: User),
  referralCode: String (unique, uppercase),
  referralLink: String (unique),
  status: String (pending/active/suspended/rejected),
  commissionRate: Number (default: 10%),
  totalReferrals: Number,
  totalSales: Number,
  totalCommission: Number,
  paidCommission: Number,
  pendingCommission: Number,
  bankDetails: Object,
  mobileBanking: Object,
  paymentMethod: String
}
```

**Methods:**
- `calculateCommission(orderAmount)` - Calculate commission
- `updateStats()` - Update statistics

---

### 2. Commission Model

**File:** `models/Commission.js`

**Key Features:**
- Links affiliate, order, and referred user
- Commission amount calculation
- Status tracking (pending, approved, paid, cancelled)
- Withdraw request reference

**Schema Fields:**
```javascript
{
  affiliate: ObjectId (ref: Affiliate),
  order: ObjectId (ref: Order),
  referredUser: ObjectId (ref: User),
  orderAmount: Number,
  amount: Number,
  commissionRate: Number,
  status: String (pending/approved/paid/cancelled),
  withdrawRequest: ObjectId (ref: WithdrawRequest)
}
```

---

### 3. Withdraw Request Model

**File:** `models/WithdrawRequest.js`

**Key Features:**
- Withdraw amount tracking
- Payment method and details
- Admin approval workflow
- Commission linking

**Schema Fields:**
```javascript
{
  affiliate: ObjectId (ref: Affiliate),
  amount: Number,
  status: String (pending/approved/rejected/paid),
  paymentMethod: String (bank/mobile_banking/cash),
  paymentDetails: Object,
  commissions: [ObjectId] (ref: Commission),
  reviewedBy: ObjectId (ref: User),
  paidBy: ObjectId (ref: User),
  transactionId: String
}
```

**Methods:**
- `approve(reviewedBy, notes)` - Approve request
- `reject(reviewedBy, reason)` - Reject request
- `markAsPaid(paidBy, transactionId)` - Mark as paid

---

### 4. Affiliate Service

**File:** `services/affiliateService.js`

**Functions:**
- `registerAsAffiliate(userId, affiliateData)` - Register as affiliate
- `getAffiliateByUser(userId)` - Get affiliate profile
- `getAffiliateStatistics(affiliateId)` - Get statistics
- `createCommission(referralCode, orderId, referredUserId, orderAmount)` - Create commission
- `createWithdrawRequest(affiliateId, amount, paymentDetails)` - Create withdraw request
- `getWithdrawRequests(affiliateId, page, limit)` - Get withdraw requests
- `getCommissions(affiliateId, filters, page, limit)` - Get commissions
- `updatePaymentDetails(affiliateId, paymentDetails)` - Update payment details

---

### 5. Admin Affiliate Service

**File:** `services/adminAffiliateService.js`

**Functions:**
- `getAllAffiliates(filters, page, limit)` - Get all affiliates
- `approveAffiliate(affiliateId, adminId)` - Approve affiliate
- `rejectAffiliate(affiliateId, adminId, reason)` - Reject affiliate
- `suspendAffiliate(affiliateId)` - Suspend affiliate
- `getAllCommissions(filters, page, limit)` - Get all commissions
- `getAllWithdrawRequests(filters, page, limit)` - Get all withdraw requests
- `approveWithdrawRequest(requestId, adminId, notes)` - Approve withdraw
- `rejectWithdrawRequest(requestId, adminId, reason)` - Reject withdraw
- `markWithdrawAsPaid(requestId, adminId, transactionId)` - Mark as paid
- `getAffiliateAnalytics()` - Get analytics

---

## 🔌 API Endpoints

### User Affiliate Endpoints

#### 1. Register as Affiliate
```
POST /api/affiliates/register
Headers: { Authorization: Bearer <token> }
Body: {
  "bankDetails": {
    "accountName": "...",
    "accountNumber": "...",
    "bankName": "...",
    "branchName": "...",
    "routingNumber": "..."
  },
  "mobileBanking": {
    "provider": "bkash",
    "accountNumber": "...",
    "accountName": "..."
  },
  "paymentMethod": "bank"
}
```

#### 2. Get Affiliate Profile
```
GET /api/affiliates/profile
Headers: { Authorization: Bearer <token> }
```

#### 3. Get Statistics
```
GET /api/affiliates/statistics
Headers: { Authorization: Bearer <token> }
```

#### 4. Get Commissions
```
GET /api/affiliates/commissions?status=pending&page=1&limit=10
Headers: { Authorization: Bearer <token> }
```

#### 5. Create Withdraw Request
```
POST /api/affiliates/withdraw
Headers: { Authorization: Bearer <token> }
Body: {
  "amount": 1000,
  "paymentDetails": {
    "accountName": "...",
    "accountNumber": "..."
  }
}
```

#### 6. Get Withdraw Requests
```
GET /api/affiliates/withdraw-requests?page=1&limit=10
Headers: { Authorization: Bearer <token> }
```

#### 7. Update Payment Details
```
PUT /api/affiliates/payment-details
Headers: { Authorization: Bearer <token> }
Body: {
  "bankDetails": {...},
  "mobileBanking": {...},
  "paymentMethod": "bank"
}
```

---

### Admin Affiliate Endpoints

#### 1. Get All Affiliates
```
GET /api/admin/affiliates?status=active&search=ABC&page=1&limit=10
Headers: { Authorization: Bearer <admin_token> }
```

#### 2. Approve Affiliate
```
PUT /api/admin/affiliates/:affiliateId/approve
Headers: { Authorization: Bearer <admin_token> }
```

#### 3. Reject Affiliate
```
PUT /api/admin/affiliates/:affiliateId/reject
Headers: { Authorization: Bearer <admin_token> }
Body: {
  "reason": "Invalid documents"
}
```

#### 4. Suspend Affiliate
```
PUT /api/admin/affiliates/:affiliateId/suspend
Headers: { Authorization: Bearer <admin_token> }
```

#### 5. Get All Commissions
```
GET /api/admin/commissions?status=pending&affiliate=<id>&page=1&limit=10
Headers: { Authorization: Bearer <admin_token> }
```

#### 6. Get All Withdraw Requests
```
GET /api/admin/withdraw-requests?status=pending&page=1&limit=10
Headers: { Authorization: Bearer <admin_token> }
```

#### 7. Approve Withdraw Request
```
PUT /api/admin/withdraw-requests/:requestId/approve
Headers: { Authorization: Bearer <admin_token> }
Body: {
  "notes": "Approved for payment"
}
```

#### 8. Reject Withdraw Request
```
PUT /api/admin/withdraw-requests/:requestId/reject
Headers: { Authorization: Bearer <admin_token> }
Body: {
  "reason": "Invalid account details"
}
```

#### 9. Mark Withdraw as Paid
```
PUT /api/admin/withdraw-requests/:requestId/paid
Headers: { Authorization: Bearer <admin_token> }
Body: {
  "transactionId": "TXN123456"
}
```

#### 10. Get Analytics
```
GET /api/admin/affiliates/analytics
Headers: { Authorization: Bearer <admin_token> }
```

---

## 🔄 Integration with Order System

**Automatic Commission Creation:**

When an order payment is confirmed:
1. Check if order has `referralCode`
2. Find affiliate by referral code
3. Create commission record
4. Update affiliate statistics

**Flow:**
```
Order Payment Confirmed
  ↓
orderService.updatePaymentStatus()
  ↓
Check order.referralCode
  ↓
affiliateService.createCommission()
  ↓
commissionRepository.create()
  ↓
affiliate.updateStats()
```

**Order Creation:**
- Frontend can pass `referralCode` in order creation request
- Referral code stored in order
- Commission created when payment confirmed

---

## ⚙️ Environment Variables

Add to `.env`:

```env
# Affiliate Configuration
AFFILIATE_COMMISSION_RATE=10
AFFILIATE_MIN_WITHDRAW=500
```

---

## 🔒 Security Features

### 1. **Admin Approval**
- Affiliate registration requires admin approval
- Withdraw requests require admin approval
- Two-step approval process

### 2. **Status Management**
- Affiliates can be suspended
- Commissions tracked by status
- Withdraw requests tracked by status

### 3. **Validation**
- Minimum withdraw amount
- Available balance check
- Payment details validation

---

## 📝 Usage Examples

### Frontend Integration

**1. Register as Affiliate:**
```javascript
const response = await fetch('/api/affiliates/register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bankDetails: {
      accountName: 'John Doe',
      accountNumber: '1234567890',
      bankName: 'Bank Name',
      branchName: 'Branch Name',
      routingNumber: '123456'
    },
    paymentMethod: 'bank'
  })
});
```

**2. Get Referral Link:**
```javascript
const response = await fetch('/api/affiliates/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();
// Use data.affiliate.referralLink
```

**3. Create Order with Referral Code:**
```javascript
// Get referral code from URL or cookie
const referralCode = getReferralCodeFromURL(); // e.g., /ref/ABC123

const response = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    shippingAddress: addressId,
    paymentMethod: 'sslcommerz',
    referralCode: referralCode // Pass referral code
  })
});
```

**4. Create Withdraw Request:**
```javascript
const response = await fetch('/api/affiliates/withdraw', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1000,
    paymentDetails: {
      accountName: 'John Doe',
      accountNumber: '1234567890'
    }
  })
});
```

---

## 🧪 Testing Checklist

- [ ] Register as affiliate
- [ ] Get affiliate profile
- [ ] Get statistics
- [ ] Create order with referral code
- [ ] Verify commission created on payment
- [ ] Get commissions list
- [ ] Create withdraw request
- [ ] Get withdraw requests
- [ ] Admin: Approve affiliate
- [ ] Admin: Approve withdraw request
- [ ] Admin: Mark withdraw as paid
- [ ] Admin: Get analytics

---

## 🐛 Error Handling

**Common Errors:**

1. **Already Registered:**
   ```json
   {
     "success": false,
     "message": "User is already registered as affiliate"
   }
   ```

2. **Insufficient Balance:**
   ```json
   {
     "success": false,
     "message": "Insufficient balance. Available: 500"
   }
   ```

3. **Minimum Withdraw:**
   ```json
   {
     "success": false,
     "message": "Minimum withdraw amount is 500"
   }
   ```

4. **Invalid Referral Code:**
   ```json
   {
     "success": false,
     "message": "Invalid referral code"
   }
   ```

---

## 📊 Database Indexes

**Affiliate Model:**
- `user` (unique)
- `referralCode` (unique)
- `referralLink` (unique)
- `status`
- `createdAt`

**Commission Model:**
- `affiliate`
- `order`
- `referredUser`
- `status`
- `affiliate + status` (compound)

**WithdrawRequest Model:**
- `affiliate`
- `status`
- `affiliate + status` (compound)
- `createdAt`

---

## 🚀 Next Steps

1. **Frontend Integration:**
   - Affiliate registration form
   - Referral link sharing
   - Commission dashboard
   - Withdraw request form

2. **Referral Tracking:**
   - Cookie/session tracking
   - Referral link click tracking
   - Conversion tracking

3. **Analytics:**
   - Commission reports
   - Performance metrics
   - Top affiliates

---

## ✅ Part 12 Complete

**Status:** ✅ **COMPLETE**

All affiliate program features implemented:
- ✅ Affiliate registration
- ✅ Referral code generation
- ✅ Commission tracking
- ✅ Withdraw system
- ✅ Admin management
- ✅ Integration with order system
- ✅ API endpoints
- ✅ Analytics

**Ready for:** Frontend integration and testing

---

**Documentation Date:** 2025-12-06  
**Part:** 12 - Affiliate Program

