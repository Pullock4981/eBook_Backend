# Testing Guide - Part 4: User Model & Schema

## Prerequisites

1. Server should be running: `npm run dev`
2. MongoDB should be connected
3. You need a valid JWT token for authenticated endpoints

---

## Step 1: Test Server Health

### Test Basic Health Check
```bash
GET http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": {
    "state": "connected",
    "isConnected": true,
    "host": "localhost:27017",
    "name": "ebook_db"
  }
}
```

---

## Step 2: Test User Endpoints (Requires Authentication)

**Note:** User endpoints require authentication. You'll need a JWT token first.

### Option A: Use Postman/Thunder Client
1. Create a new request
2. Add header: `Authorization: Bearer <your_token>`
3. Test endpoints below

### Option B: Get Token First (Will be available in Part 6)
For now, you can manually create a test user and generate token, or wait for Part 6.

---

## Test Endpoints

### 1. Get User Profile
```bash
GET http://localhost:5000/api/users/me
Headers:
  Authorization: Bearer <token>
```

### 2. Update Profile
```bash
PUT http://localhost:5000/api/users/me
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "name": "Test User",
  "email": "test@example.com"
}
```

### 3. Change Password
```bash
PUT http://localhost:5000/api/users/me/password
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### 4. Set Password (First Time)
```bash
POST http://localhost:5000/api/users/me/password
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "password": "newpass123"
}
```

### 5. Get Addresses
```bash
GET http://localhost:5000/api/users/me/addresses
Headers:
  Authorization: Bearer <token>
```

### 6. Create Address
```bash
POST http://localhost:5000/api/users/me/addresses
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "label": "Home",
  "recipientName": "John Doe",
  "recipientMobile": "01712345678",
  "addressLine1": "123 Main Street",
  "area": "Dhanmondi",
  "city": "Dhaka",
  "district": "Dhaka",
  "postalCode": "1205",
  "isDefault": true
}
```

### 7. Update Address
```bash
PUT http://localhost:5000/api/users/me/addresses/{addressId}
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "recipientName": "John Doe Updated",
  "addressLine1": "456 New Street"
}
```

### 8. Delete Address
```bash
DELETE http://localhost:5000/api/users/me/addresses/{addressId}
Headers:
  Authorization: Bearer <token>
```

### 9. Set Default Address
```bash
PUT http://localhost:5000/api/users/me/addresses/{addressId}/default
Headers:
  Authorization: Bearer <token>
```

---

## Quick Test Without Authentication

Since authentication endpoints aren't ready yet (Part 6), you can test the models directly:

### Test User Model (Using Test Endpoint)
You can use the test endpoint from Part 2 to verify database operations work.

---

## Expected Test Results

### ✅ Success Cases:
- Profile retrieved successfully
- Profile updated successfully
- Password changed successfully
- Addresses retrieved successfully
- Address created successfully
- Address updated successfully
- Address deleted successfully
- Default address set successfully

### ❌ Error Cases to Test:
- **401 Unauthorized** - No token provided
- **401 Unauthorized** - Invalid token
- **400 Bad Request** - Invalid input data
- **404 Not Found** - User/Address not found
- **403 Forbidden** - Address doesn't belong to user

---

## Testing Checklist

- [ ] Server is running
- [ ] Database is connected
- [ ] Health check works
- [ ] User endpoints require authentication (test without token)
- [ ] Profile endpoints work (with token)
- [ ] Password endpoints work (with token)
- [ ] Address endpoints work (with token)
- [ ] Validation works (test invalid data)
- [ ] Error handling works

---

## Note

**Authentication is required for all user endpoints.** 
You'll be able to fully test these endpoints after Part 6 (Authentication Routes) is complete.

For now, you can:
1. Test that endpoints return 401 without token
2. Test validation errors with invalid data
3. Verify server and database are working

