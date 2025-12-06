# Part 9: Coupon/Promo Code System - Documentation

## 📋 What Was Implemented

### 1. Coupon Model
- ✅ Created `models/Coupon.js`
- ✅ Coupon code (unique, uppercase)
- ✅ Coupon types (percentage, fixed)
- ✅ Value and max discount
- ✅ Minimum purchase requirement
- ✅ Usage limit and tracking
- ✅ Expiry date
- ✅ Active/inactive status
- ✅ Applicable products/categories (optional)
- ✅ One-time use per user (optional)
- ✅ Validation methods
- ✅ Discount calculation methods

### 2. Coupon Repository
- ✅ Updated `repositories/couponRepository.js`
- ✅ Complete CRUD operations
- ✅ Find by code
- ✅ Usage tracking
- ✅ Pagination support

### 3. Coupon Service
- ✅ Created `services/couponService.js`
- ✅ Business logic for coupons
- ✅ Coupon validation
- ✅ Discount calculation
- ✅ Usage tracking

### 4. Coupon Controller & Routes
- ✅ Created `controllers/couponController.js`
- ✅ Created `routes/coupon.js`
- ✅ Public routes (validation)
- ✅ Admin routes (CRUD)

### 5. Cart Service Integration
- ✅ Updated `services/cartService.js`
- ✅ Coupon application
- ✅ Discount calculation
- ✅ Coupon validation

### 6. Order Service Integration
- ✅ Updated `services/orderService.js`
- ✅ Coupon usage increment on order
- ✅ Coupon tracking in orders

---

## 🔧 How It Works

### Coupon Types:

#### Percentage Coupon:
- Discount = (Cart Amount × Percentage) / 100
- Can have max discount limit
- Example: 10% off, max 500 Tk

#### Fixed Coupon:
- Discount = Fixed Amount
- Cannot exceed cart amount
- Example: 100 Tk off

### Coupon Application Flow:

```
1. User enters coupon code
   ↓
2. Validate coupon (active, not expired, usage limit)
   ↓
3. Check minimum purchase
   ↓
4. Calculate discount
   ↓
5. Apply to cart
   ↓
6. Update cart totals
   ↓
7. On order creation, increment coupon usage
```

---

## 🚀 How to Use

### 1. Create Coupon (Admin)

**Endpoint:** `POST /api/coupons`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body (Percentage Coupon):**
```json
{
  "code": "DISCOUNT10",
  "type": "percentage",
  "value": 10,
  "maxDiscount": 500,
  "minPurchase": 1000,
  "usageLimit": 100,
  "expiryDate": "2024-12-31T23:59:59.000Z",
  "description": "10% off, max 500 Tk"
}
```

**Body (Fixed Coupon):**
```json
{
  "code": "FLAT100",
  "type": "fixed",
  "value": 100,
  "minPurchase": 500,
  "usageLimit": 50,
  "expiryDate": "2024-12-31T23:59:59.000Z",
  "description": "100 Tk off"
}
```

### 2. Get All Coupons (Admin)

**Endpoint:** `GET /api/coupons?page=1&limit=10`

### 3. Get Coupon by ID (Admin)

**Endpoint:** `GET /api/coupons/:id`

### 4. Validate Coupon (Public)

**Endpoint:** `POST /api/coupons/validate`

**Body:**
```json
{
  "code": "DISCOUNT10",
  "cartAmount": 1500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "coupon": {
      "code": "DISCOUNT10",
      "type": "percentage",
      "value": 10,
      "maxDiscount": 500
    },
    "discount": 150,
    "finalAmount": 1350
  }
}
```

### 5. Get Coupon by Code (Public)

**Endpoint:** `GET /api/coupons/code/:code`

### 6. Update Coupon (Admin)

**Endpoint:** `PUT /api/coupons/:id`

### 7. Delete Coupon (Admin)

**Endpoint:** `DELETE /api/coupons/:id`

### 8. Apply Coupon to Cart (User)

**Endpoint:** `POST /api/cart/coupon`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "couponCode": "DISCOUNT10"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "items": [...],
    "subtotal": 1500,
    "discount": 150,
    "total": 1350,
    "coupon": {
      "_id": "...",
      "code": "DISCOUNT10",
      ...
    }
  }
}
```

### 9. Remove Coupon from Cart (User)

**Endpoint:** `DELETE /api/cart/coupon`

---

## 📁 Files Created

### Models:
- `models/Coupon.js` - Coupon schema

### Updated Files:
- `repositories/couponRepository.js` - Complete implementation
- `services/couponService.js` - New service
- `services/cartService.js` - Coupon integration
- `services/orderService.js` - Coupon usage tracking
- `controllers/couponController.js` - New controller
- `routes/coupon.js` - New routes
- `server.js` - Added coupon routes

---

## ✅ Testing Checklist

Before moving to next part, verify:

- [ ] Coupon model works correctly
- [ ] Can create coupon (admin)
- [ ] Can get all coupons (admin)
- [ ] Can validate coupon (public)
- [ ] Can apply coupon to cart
- [ ] Discount calculates correctly
- [ ] Minimum purchase check works
- [ ] Usage limit check works
- [ ] Expiry date check works
- [ ] Coupon usage increments on order
- [ ] Can remove coupon from cart

---

## 🔍 Code Quality Features

### Clean Architecture:
- ✅ 3-layer separation maintained
- ✅ Clear responsibilities
- ✅ Reusable code

### Features:
- ✅ Percentage and fixed discounts
- ✅ Usage limit tracking
- ✅ Expiry date management
- ✅ Minimum purchase validation
- ✅ Max discount limit (for percentage)
- ✅ Automatic discount calculation
- ✅ Cart integration
- ✅ Order integration

---

## 🎯 What's Next?

### Part 10: Payment Gateway Integration
- SSLCommerz integration
- bKash integration
- Nagad integration
- Payment webhooks

---

## 📝 Notes

1. **Coupon Types**: Percentage (with max discount) or Fixed amount.

2. **Usage Tracking**: Coupon usage increments automatically when order is created.

3. **Validation**: Coupon is validated before applying (active, not expired, usage limit, minimum purchase).

4. **Discount Calculation**: 
   - Percentage: (amount × value) / 100, capped at maxDiscount
   - Fixed: value, capped at cart amount

5. **Cart Integration**: Coupon discount is automatically recalculated when cart items change.

---

## 🐛 Common Issues & Solutions

### Issue: "Coupon usage limit reached"
**Solution**: 
- Check coupon usage limit
- Create new coupon or increase limit

### Issue: "Minimum purchase required"
**Solution**: 
- Increase cart amount
- Or use different coupon with lower minimum

### Issue: "Coupon has expired"
**Solution**: 
- Check expiry date
- Use different coupon or extend expiry

### Issue: "Coupon is not active"
**Solution**: 
- Activate coupon (admin)
- Or use different active coupon

---

## ✨ Key Features Implemented

1. ✅ **Coupon Management** - Complete CRUD operations
2. ✅ **Coupon Types** - Percentage and fixed
3. ✅ **Usage Tracking** - Automatic increment
4. ✅ **Validation** - Active, expiry, usage limit
5. ✅ **Discount Calculation** - Automatic calculation
6. ✅ **Cart Integration** - Apply/remove coupon
7. ✅ **Order Integration** - Usage tracking
8. ✅ **Minimum Purchase** - Validation

---

## 📚 Coupon Examples

### Example 1: 10% Off (Max 500 Tk)
```json
{
  "code": "SAVE10",
  "type": "percentage",
  "value": 10,
  "maxDiscount": 500,
  "minPurchase": 1000,
  "usageLimit": 100
}
```

### Example 2: 100 Tk Off
```json
{
  "code": "FLAT100",
  "type": "fixed",
  "value": 100,
  "minPurchase": 500,
  "usageLimit": 50
}
```

### Example 3: 20% Off (No Max)
```json
{
  "code": "BIG20",
  "type": "percentage",
  "value": 20,
  "minPurchase": 2000,
  "usageLimit": 200
}
```

---

**Part 9 Complete! ✅**

Coupon/Promo Code system fully implemented. Ready to move to Part 10: Payment Gateway Integration

