# Part 8: Cart & Order System - Documentation

## 📋 What Was Implemented

### 1. Cart Model
- ✅ Created `models/Cart.js`
- ✅ Cart items with product references
- ✅ Quantity management
- ✅ Price snapshot (for price changes)
- ✅ Coupon support
- ✅ Automatic total calculation
- ✅ Cart methods (add, update, remove, clear)

### 2. Order Model
- ✅ Created `models/Order.js`
- ✅ Order items with product snapshots
- ✅ Order ID generation (ORD-YYYYMMDD-XXXXXX)
- ✅ Pricing (subtotal, discount, shipping, total)
- ✅ Payment tracking
- ✅ Order status management
- ✅ Shipping address
- ✅ Affiliate tracking

### 3. Cart Repository & Service
- ✅ Created `repositories/cartRepository.js`
- ✅ Created `services/cartService.js`
- ✅ Get/create cart
- ✅ Add/update/remove items
- ✅ Clear cart
- ✅ Apply/remove coupon
- ✅ Stock validation
- ✅ Price calculation

### 4. Order Repository & Service
- ✅ Created `repositories/orderRepository.js`
- ✅ Created `services/orderService.js`
- ✅ Create order from cart
- ✅ Get orders (user & admin)
- ✅ Update order status
- ✅ Update payment status
- ✅ Stock management
- ✅ Address validation

### 5. Controllers & Routes
- ✅ Cart controller and routes
- ✅ Order controller and routes
- ✅ Authentication required
- ✅ Admin routes for order management

---

## 🔧 How It Works

### Cart Flow:
```
1. User adds product to cart
   ↓
2. Validate product & stock
   ↓
3. Add item with price snapshot
   ↓
4. Calculate totals
   ↓
5. Apply coupon (if any)
   ↓
6. Return updated cart
```

### Order Creation Flow:
```
1. Get cart items
   ↓
2. Validate shipping address (for physical products)
   ↓
3. Validate stock availability
   ↓
4. Calculate totals (subtotal, discount, shipping)
   ↓
5. Create order
   ↓
6. Update product stock
   ↓
7. Clear cart
   ↓
8. Return order
```

---

## 🚀 How to Use

### Cart Endpoints

#### 1. Get Cart
**Endpoint:** `GET /api/cart`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "items": [...],
    "subtotal": 1000,
    "discount": 100,
    "total": 900,
    "coupon": null
  }
}
```

#### 2. Add to Cart
**Endpoint:** `POST /api/cart/items`

**Body:**
```json
{
  "productId": "product_id",
  "quantity": 2
}
```

#### 3. Update Cart Item
**Endpoint:** `PUT /api/cart/items/:productId`

**Body:**
```json
{
  "quantity": 3
}
```

#### 4. Remove from Cart
**Endpoint:** `DELETE /api/cart/items/:productId`

#### 5. Clear Cart
**Endpoint:** `DELETE /api/cart`

#### 6. Apply Coupon
**Endpoint:** `POST /api/cart/coupon`

**Body:**
```json
{
  "couponCode": "DISCOUNT10"
}
```

**Note:** Coupon system will be fully implemented in Part 9

### Order Endpoints

#### 1. Create Order
**Endpoint:** `POST /api/orders`

**Body:**
```json
{
  "shippingAddress": "address_id",
  "paymentMethod": "sslcommerz",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "ORD-20241205-123456",
    "total": 900,
    "paymentStatus": "pending",
    "orderStatus": "pending",
    ...
  }
}
```

#### 2. Get User Orders
**Endpoint:** `GET /api/orders?page=1&limit=10`

#### 3. Get Order by ID
**Endpoint:** `GET /api/orders/:id`

#### 4. Get Order by Order ID
**Endpoint:** `GET /api/orders/order-id/:orderId`

#### 5. Update Order Status (Admin)
**Endpoint:** `PUT /api/orders/:id/status`

**Body:**
```json
{
  "status": "shipped"
}
```

#### 6. Update Payment Status (Admin)
**Endpoint:** `PUT /api/orders/:id/payment-status`

**Body:**
```json
{
  "paymentStatus": "paid",
  "transactionId": "TXN123456"
}
```

---

## 📁 Files Created

### Models:
- `models/Cart.js` - Cart schema
- `models/Order.js` - Order schema

### Repositories:
- `repositories/cartRepository.js` - Cart data access
- `repositories/orderRepository.js` - Order data access
- `repositories/couponRepository.js` - Placeholder (Part 9)

### Services:
- `services/cartService.js` - Cart business logic
- `services/orderService.js` - Order business logic

### Controllers:
- `controllers/cartController.js` - Cart request handlers
- `controllers/orderController.js` - Order request handlers

### Routes:
- `routes/cart.js` - Cart API endpoints
- `routes/order.js` - Order API endpoints

### Updated Files:
- `server.js` - Added cart and order routes

---

## ✅ Testing Checklist

Before moving to next part, verify:

- [ ] Cart model works correctly
- [ ] Order model works correctly
- [ ] Can add items to cart
- [ ] Can update cart items
- [ ] Can remove items from cart
- [ ] Can clear cart
- [ ] Cart totals calculate correctly
- [ ] Can create order from cart
- [ ] Order ID generation works
- [ ] Stock updates on order creation
- [ ] Cart clears after order
- [ ] Can get user orders
- [ ] Admin can update order status
- [ ] Admin can update payment status

---

## 🔍 Code Quality Features

### Clean Architecture:
- ✅ 3-layer separation maintained
- ✅ Clear responsibilities
- ✅ Reusable code

### Features:
- ✅ Cart management
- ✅ Order creation
- ✅ Stock management
- ✅ Price snapshots
- ✅ Coupon support (structure ready)
- ✅ Order tracking
- ✅ Status management

---

## 🎯 What's Next?

### Part 9: Coupon System
- Complete coupon model
- Coupon CRUD (Admin)
- Discount calculation
- Usage tracking

### Part 10: Payment Gateway Integration
- SSLCommerz integration
- bKash integration
- Nagad integration
- Payment webhooks

---

## 📝 Notes

1. **Coupon System**: Structure is ready but will be fully implemented in Part 9. Cart service has coupon support prepared.

2. **Stock Management**: Physical products' stock is automatically updated when order is created.

3. **Price Snapshots**: Product prices are stored in cart/order to prevent price changes from affecting existing orders.

4. **Order ID**: Auto-generated format: ORD-YYYYMMDD-XXXXXX

5. **Shipping**: Currently default shipping (50 per item). Can be enhanced with shipping calculation logic.

6. **Payment**: Payment status tracking is ready. Payment gateway integration will be in Part 10.

---

## ✨ Key Features Implemented

1. ✅ **Cart Management** - Complete CRUD operations
2. ✅ **Order Creation** - From cart to order
3. ✅ **Stock Management** - Automatic stock updates
4. ✅ **Price Snapshots** - Price protection
5. ✅ **Order Tracking** - Status management
6. ✅ **Payment Tracking** - Payment status
7. ✅ **Coupon Support** - Structure ready
8. ✅ **Address Validation** - Shipping address check

---

**Part 8 Complete! ✅**

Cart and Order system fully implemented. Ready to move to Part 9: Coupon System

