# Part 6: Authentication Routes & Controllers - Documentation

## 📋 What Was Implemented

### 1. OTP Service Utility
- ✅ Created `utils/otpService.js`
- ✅ OTP generation (6-digit random)
- ✅ OTP expiry calculation
- ✅ OTP saving to user record
- ✅ OTP verification
- ✅ SMS sending structure (ready for Part 5 integration)
- ✅ Development mode: OTP logged to console

### 2. Authentication Service
- ✅ Created `services/authService.js`
- ✅ User registration (mobile-based)
- ✅ OTP request for login
- ✅ OTP verification and login
- ✅ Password-based login (if password set)
- ✅ Resend OTP functionality
- ✅ JWT token generation

### 3. Authentication Controller
- ✅ Created `controllers/authController.js`
- ✅ Register endpoint handler
- ✅ Login endpoint handler
- ✅ OTP verification handler
- ✅ Password login handler
- ✅ Resend OTP handler

### 4. Authentication Routes
- ✅ Created `routes/auth.js`
- ✅ All routes with rate limiting
- ✅ Input validation
- ✅ OTP rate limiting
- ✅ RESTful API structure

### 5. Server Integration
- ✅ Integrated auth routes in `server.js`
- ✅ Routes available at `/api/auth/*`

---

## 🔧 How It Works

### Authentication Flow:

#### Registration Flow:
```
1. User sends mobile number
   ↓
2. Check if user exists
   ↓
3. If new: Create user
   If exists but not verified: Update OTP
   ↓
4. Generate OTP
   ↓
5. Save OTP to user record
   ↓
6. Send OTP via SMS (console in dev)
   ↓
7. Return success with OTP expiry
```

#### Login Flow (Passwordless):
```
1. User sends mobile number
   ↓
2. Check if user exists
   ↓
3. Generate and send OTP
   ↓
4. User sends OTP
   ↓
5. Verify OTP
   ↓
6. Generate JWT token
   ↓
7. Return token and user data
```

#### Password Login Flow:
```
1. User sends mobile + password
   ↓
2. Get user with password
   ↓
3. Verify password
   ↓
4. Generate JWT token
   ↓
5. Return token and user data
```

---

## 🚀 How to Use

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "mobile": "01712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your mobile number",
  "data": {
    "mobile": "01712345678",
    "otpExpiry": "2024-01-01T00:05:00.000Z"
  }
}
```

**Note:** In development, OTP is logged to console. Check server logs for OTP.

### 2. Request OTP for Login

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "mobile": "01712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your mobile number",
  "data": {
    "mobile": "01712345678",
    "otpExpiry": "2024-01-01T00:05:00.000Z"
  }
}
```

### 3. Verify OTP and Login

**Endpoint:** `POST /api/auth/verify-otp`

**Body:**
```json
{
  "mobile": "01712345678",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "mobile": "01712345678",
      "isVerified": true,
      "role": "user",
      "profile": {
        "name": null,
        "email": null,
        "avatar": null
      },
      "createdAt": "..."
    }
  }
}
```

**Use this token in Authorization header:**
```
Authorization: Bearer <token>
```

### 4. Login with Password

**Endpoint:** `POST /api/auth/login-password`

**Body:**
```json
{
  "mobile": "01712345678",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### 5. Resend OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Body:**
```json
{
  "mobile": "01712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent to your mobile number",
  "data": {
    "mobile": "01712345678",
    "otpExpiry": "2024-01-01T00:05:00.000Z"
  }
}
```

---

## 📁 Files Created

### Utilities:
- `utils/otpService.js` - OTP generation and verification

### Services:
- `services/authService.js` - Authentication business logic

### Controllers:
- `controllers/authController.js` - Authentication request handlers

### Routes:
- `routes/auth.js` - Authentication API endpoints

### Updated Files:
- `server.js` - Added authentication routes

---

## ✅ Testing Checklist

Before moving to Part 5, verify:

- [ ] Server starts without errors
- [ ] Register endpoint works
- [ ] OTP is generated and logged to console
- [ ] OTP verification works
- [ ] JWT token is generated
- [ ] Login with OTP works
- [ ] Resend OTP works
- [ ] Rate limiting works (try multiple requests)
- [ ] Validation works (try invalid mobile/OTP)
- [ ] Token can be used to access protected routes

### Test Scenarios:

1. **Register New User:**
   ```bash
   POST /api/auth/register
   Body: { "mobile": "01712345678" }
   ```
   - Check console for OTP
   - Verify OTP expiry time

2. **Verify OTP:**
   ```bash
   POST /api/auth/verify-otp
   Body: { "mobile": "01712345678", "otp": "<from_console>" }
   ```
   - Should return token
   - Save token for next tests

3. **Use Token:**
   ```bash
   GET /api/users/me
   Headers: { "Authorization": "Bearer <token>" }
   ```
   - Should return user profile

4. **Test Rate Limiting:**
   - Make 6 register requests quickly
   - Should get rate limit error after 5

5. **Test Validation:**
   - Try invalid mobile number
   - Try invalid OTP
   - Should get validation errors

---

## 🔍 Code Quality Features

### Clean Architecture:
- ✅ 3-layer separation maintained
- ✅ Clear responsibilities
- ✅ Reusable code

### Security:
- ✅ Rate limiting on all auth endpoints
- ✅ OTP rate limiting (3 per hour)
- ✅ Password hashing (if password used)
- ✅ JWT token security
- ✅ Input validation

### Best Practices:
- ✅ OTP expiry management
- ✅ OTP cleared after verification
- ✅ User verification on first OTP verify
- ✅ Last login tracking

---

## 🎯 What's Next?

### Part 5: OTP Service (SMS Integration)
- Integrate SMS API provider
- Real SMS sending
- SMS delivery tracking
- Error handling for SMS failures

### Part 7: Product Management
- Product model
- Product CRUD operations
- Category management
- Image upload

---

## 📝 Notes

1. **OTP in Development**: OTP is logged to console. Check server logs to get OTP.
2. **SMS Integration**: Currently OTP is logged. Will integrate SMS API in Part 5.
3. **Rate Limiting**: 
   - Auth endpoints: 5 requests per 15 minutes
   - OTP endpoints: 3 requests per hour
4. **Token Expiry**: Default 7 days (configurable in .env)
5. **Password Login**: Optional. Users can use passwordless login (OTP) or set password.

---

## 🐛 Common Issues & Solutions

### Issue: "OTP not received"
**Solution**: 
- Check server console logs (development mode)
- Verify mobile number format
- Check rate limiting (max 3 OTP per hour)
- Wait for SMS API integration (Part 5)

### Issue: "Invalid or expired OTP"
**Solution**: 
- Check OTP from console (development)
- Verify OTP is not expired (5 minutes default)
- Request new OTP if expired

### Issue: "Too many requests"
**Solution**: 
- Wait for rate limit window to reset
- Auth endpoints: 15 minutes
- OTP endpoints: 1 hour

### Issue: "User not found" on login
**Solution**: 
- Register user first
- Verify mobile number is correct

---

## ✨ Key Features Implemented

1. ✅ **Mobile-based Registration** - No email required
2. ✅ **Passwordless Login** - OTP-based authentication
3. ✅ **Password Login** - Optional password support
4. ✅ **OTP Management** - Generation, verification, expiry
5. ✅ **JWT Token Generation** - Secure token-based auth
6. ✅ **Rate Limiting** - API abuse prevention
7. ✅ **Input Validation** - Mobile and OTP validation
8. ✅ **User Verification** - Automatic on first OTP verify

---

## 🔐 Security Features

### Implemented:
- ✅ Rate limiting (auth and OTP)
- ✅ OTP expiry (5 minutes default)
- ✅ OTP cleared after verification
- ✅ JWT token security
- ✅ Input validation
- ✅ Password hashing (if password used)

### Best Practices:
- ✅ OTP not exposed in responses
- ✅ Token expiry management
- ✅ Last login tracking
- ✅ User verification check

---

## 📚 Complete Authentication Flow Example

### Step 1: Register
```bash
POST /api/auth/register
{ "mobile": "01712345678" }
# Response: OTP sent, check console
```

### Step 2: Verify OTP
```bash
POST /api/auth/verify-otp
{ "mobile": "01712345678", "otp": "123456" }
# Response: Token + User data
```

### Step 3: Use Token
```bash
GET /api/users/me
Headers: { "Authorization": "Bearer <token>" }
# Response: User profile
```

### Step 4: Update Profile
```bash
PUT /api/users/me
Headers: { "Authorization": "Bearer <token>" }
Body: { "name": "John Doe", "email": "john@example.com" }
```

---

## 🧪 Testing with Postman/Thunder Client

### Collection Setup:
1. Create environment variable: `token`
2. Register user → Get OTP from console
3. Verify OTP → Save token to environment
4. Use token in Authorization header for protected routes

### Example Flow:
```
1. Register → Save OTP from console
2. Verify OTP → Save token
3. Get Profile → Use saved token
4. Update Profile → Use saved token
5. Create Address → Use saved token
```

---

**Part 6 Complete! ✅**

Authentication system fully implemented. Ready to move to Part 5: OTP Service (SMS Integration)

