# Part 3: Basic Middleware Setup - Documentation

## 📋 What Was Implemented

### 1. Request Validation Middleware
- ✅ Created `middleware/validation.js`
- ✅ Uses express-validator for input validation
- ✅ Consistent error response format
- ✅ Common validation rules (ObjectId, mobile, email, password, OTP)

### 2. Authentication Middleware
- ✅ Created `middleware/auth.js`
- ✅ JWT token verification
- ✅ User authentication check
- ✅ Optional authentication (for public routes with user info)
- ✅ Token expiry handling

### 3. Role-Based Access Control
- ✅ Created `middleware/roleCheck.js`
- ✅ Role checking middleware (admin, user)
- ✅ Permission-based access control
- ✅ Reusable role check functions

### 4. Rate Limiting Middleware
- ✅ Created `middleware/rateLimiter.js`
- ✅ General API rate limiter (100 requests/15min)
- ✅ Authentication rate limiter (5 requests/15min)
- ✅ OTP rate limiter (3 requests/hour)
- ✅ Password reset rate limiter (3 requests/hour)

### 5. Input Sanitization
- ✅ Created `middleware/sanitize.js`
- ✅ XSS attack prevention
- ✅ HTML tag removal
- ✅ Recursive object sanitization

### 6. JWT Configuration
- ✅ Created `config/jwt.js`
- ✅ Token generation utilities
- ✅ Refresh token support
- ✅ Token verification

### 7. User Model (Placeholder)
- ✅ Created `models/User.js`
- ✅ Basic user schema structure
- ✅ Mobile number, OTP fields
- ✅ Role-based access fields
- ✅ Profile management fields

### 8. Server Updates
- ✅ Integrated all middleware in `server.js`
- ✅ Input sanitization applied globally
- ✅ Rate limiting applied to API routes
- ✅ Request size limits configured

---

## 🔧 How It Works

### Middleware Execution Order:

```
1. Security (Helmet)
    ↓
2. CORS
    ↓
3. Body Parser
    ↓
4. Input Sanitization (Global)
    ↓
5. Rate Limiting (API routes)
    ↓
6. Routes
    ↓
7. Error Handler
```

### Authentication Flow:

```
Request with Bearer Token
    ↓
authenticate middleware
    ↓
Extract token from header
    ↓
Verify JWT token
    ↓
Get user from database
    ↓
Attach user to req.user
    ↓
Continue to route handler
```

### Role Check Flow:

```
Authenticated Request
    ↓
requireRole/requireAdmin middleware
    ↓
Check req.user exists
    ↓
Check user role matches required role
    ↓
Allow or deny access
```

---

## 🚀 How to Use

### 1. Request Validation

#### Example: Validate mobile number
```javascript
const { body } = require('express-validator');
const { validate, commonRules } = require('../middleware/validation');

router.post('/register',
  commonRules.mobile('mobile'),
  validate,
  controller.register
);
```

#### Example: Validate multiple fields
```javascript
router.post('/login',
  [
    commonRules.mobile('mobile'),
    commonRules.otp('otp')
  ],
  validate,
  controller.login
);
```

### 2. Authentication Middleware

#### Protect a route:
```javascript
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, controller.getProfile);
```

#### Optional authentication (user info if available):
```javascript
const { optionalAuth } = require('../middleware/auth');

router.get('/public-data', optionalAuth, controller.getData);
```

### 3. Role-Based Access

#### Admin-only route:
```javascript
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.delete('/users/:id', authenticate, requireAdmin, controller.deleteUser);
```

#### User or Admin route:
```javascript
const { authenticate } = require('../middleware/auth');
const { requireUser } = require('../middleware/roleCheck');

router.get('/orders', authenticate, requireUser, controller.getOrders);
```

#### Custom role check:
```javascript
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/admin-panel', authenticate, requireRole('admin', 'moderator'), controller.getPanel);
```

### 4. Rate Limiting

#### Apply to specific routes:
```javascript
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, controller.login);
router.post('/register', authLimiter, controller.register);
```

#### OTP rate limiting:
```javascript
const { otpLimiter } = require('../middleware/rateLimiter');

router.post('/send-otp', otpLimiter, controller.sendOTP);
```

### 5. Input Sanitization

Already applied globally in `server.js`. All requests are automatically sanitized.

### 6. JWT Token Generation

```javascript
const { generateToken, generateRefreshToken } = require('../config/jwt');

// Generate access token
const token = generateToken(userId);

// Generate refresh token
const refreshToken = generateRefreshToken(userId);
```

---

## 📁 Files Created

### Middleware:
- `middleware/validation.js` - Request validation
- `middleware/auth.js` - Authentication
- `middleware/roleCheck.js` - Role-based access
- `middleware/rateLimiter.js` - Rate limiting
- `middleware/sanitize.js` - Input sanitization

### Configuration:
- `config/jwt.js` - JWT utilities

### Models:
- `models/User.js` - User schema (placeholder for Part 4)

### Updated Files:
- `server.js` - Integrated all middleware

---

## ✅ Testing Checklist

Before moving to Part 4, verify:

- [ ] Server starts without errors
- [ ] Rate limiting works (try making many requests)
- [ ] Input sanitization works (try sending HTML in request)
- [ ] Validation middleware works (try invalid data)
- [ ] Authentication middleware structure ready (will test in Part 6)
- [ ] Role check middleware structure ready (will test in Part 6)

### Test Rate Limiting:
```bash
# Make 101 requests quickly
for i in {1..101}; do curl http://localhost:5000/api/test; done
# Should get rate limit error after 100 requests
```

### Test Input Sanitization:
```bash
POST http://localhost:5000/api/test
{
  "name": "<script>alert('xss')</script>Test",
  "description": "<b>HTML</b> content"
}
# HTML tags should be removed in response
```

---

## 🔍 Code Quality Features

### Clean Code:
- ✅ Reusable middleware functions
- ✅ Consistent error messages
- ✅ Clear function names
- ✅ Proper error handling

### Comments:
- ✅ Function-level documentation
- ✅ Usage examples in code
- ✅ Parameter descriptions

### Security:
- ✅ XSS prevention (sanitization)
- ✅ Rate limiting (DDoS protection)
- ✅ JWT token verification
- ✅ Role-based access control

---

## 🎯 What's Next?

### Part 4: User Model & Schema
- Complete User model implementation
- OTP management
- Profile management
- User verification flow

### Part 5: OTP Service
- OTP generation
- SMS API integration
- OTP verification
- OTP expiry handling

### Part 6: Authentication Routes & Controllers
- Register endpoint
- Login endpoint
- OTP verification
- JWT token generation

---

## 📝 Notes

1. **User Model**: Currently a placeholder. Will be fully implemented in Part 4.
2. **Authentication**: Middleware is ready but needs routes to test (Part 6).
3. **Rate Limiting**: Applied globally to `/api/` routes. Can be customized per route.
4. **Input Sanitization**: Applied globally. All request data is sanitized automatically.
5. **Validation**: Use express-validator rules + `validate` middleware.

---

## 🐛 Common Issues & Solutions

### Issue: "Token is required" error
**Solution**: 
- Include `Authorization: Bearer <token>` header
- Check token format (must start with "Bearer ")

### Issue: "Access denied" error
**Solution**: 
- Check user role matches required role
- Verify user is authenticated first
- Check role enum values in User model

### Issue: Rate limit error
**Solution**: 
- Wait for rate limit window to reset
- Use different IP address
- Adjust rate limit settings in `rateLimiter.js`

### Issue: Validation errors
**Solution**: 
- Check validation rules match your data
- Verify required fields are present
- Check data format (mobile, email, etc.)

---

## ✨ Key Features Implemented

1. ✅ **Request Validation** - Input validation with express-validator
2. ✅ **Authentication** - JWT token verification
3. ✅ **Role-Based Access** - Admin/User permission control
4. ✅ **Rate Limiting** - API abuse prevention
5. ✅ **Input Sanitization** - XSS attack prevention
6. ✅ **JWT Utilities** - Token generation and verification
7. ✅ **User Model** - Basic schema structure (placeholder)

---

## 🔐 Security Features

### Implemented:
- ✅ XSS prevention (input sanitization)
- ✅ Rate limiting (DDoS protection)
- ✅ JWT token security
- ✅ Role-based access control
- ✅ Request size limits (10MB)

### Best Practices:
- ✅ Token expiry handling
- ✅ Secure token verification
- ✅ Input validation before processing
- ✅ Consistent error messages (don't leak info)

---

## 📚 Middleware Usage Examples

### Complete Route Example:
```javascript
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate, commonRules } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { authLimiter } = require('../middleware/rateLimiter');
const controller = require('../controllers/userController');

// Public route with validation
router.post('/register',
  authLimiter,
  commonRules.mobile('mobile'),
  validate,
  controller.register
);

// Protected route
router.get('/profile',
  authenticate,
  controller.getProfile
);

// Admin-only route
router.delete('/users/:id',
  authenticate,
  requireAdmin,
  controller.deleteUser
);
```

---

**Part 3 Complete! ✅**

All middleware is set up and ready. Ready to move to Part 4: User Model & Schema

