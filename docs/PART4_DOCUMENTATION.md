# Part 4: User Model & Schema - Documentation

## 📋 What Was Implemented

### 1. User Model (Complete)
- ✅ Completed `models/User.js` with all required fields
- ✅ Mobile number authentication support
- ✅ OTP fields (otp, otpExpiry)
- ✅ Password field with bcrypt hashing
- ✅ Profile management (name, email, avatar)
- ✅ Role-based access (user, admin)
- ✅ Address references
- ✅ Password hashing with pre-save hook
- ✅ Password comparison method
- ✅ OTP validation method

### 2. Address Model
- ✅ Created `models/Address.js` for shipping addresses
- ✅ Complete address fields (recipient, address lines, area, city, district)
- ✅ Default address management
- ✅ User reference
- ✅ Soft delete support

### 3. User Repository
- ✅ Created `repositories/userRepository.js`
- ✅ Complete CRUD operations
- ✅ Mobile number lookup
- ✅ OTP management
- ✅ Password management
- ✅ Address reference management
- ✅ User verification

### 4. Address Repository
- ✅ Created `repositories/addressRepository.js`
- ✅ Complete CRUD operations
- ✅ User-specific address queries
- ✅ Default address management
- ✅ Soft delete support

### 5. User Service
- ✅ Created `services/userService.js`
- ✅ Business logic for user operations
- ✅ Profile management
- ✅ Password change/set
- ✅ Address management
- ✅ Validation and error handling

### 6. User Controller
- ✅ Created `controllers/userController.js`
- ✅ Profile endpoints
- ✅ Password management endpoints
- ✅ Address management endpoints
- ✅ Consistent response format

### 7. User Routes
- ✅ Created `routes/user.js`
- ✅ All routes protected with authentication
- ✅ Input validation
- ✅ RESTful API structure

### 8. Server Updates
- ✅ Integrated user routes in `server.js`

---

## 🔧 How It Works

### User Model Features:

#### Password Hashing:
```javascript
// Password is automatically hashed before saving
user.password = 'plaintext';
await user.save(); // Password is hashed with bcrypt
```

#### Password Comparison:
```javascript
const isMatch = await user.comparePassword('plaintext');
```

#### OTP Validation:
```javascript
const isValid = user.isOTPValid('123456');
```

### Address Management:
- Each user can have multiple addresses
- Only one default address per user
- Addresses are soft-deleted (isActive: false)
- Address references stored in User model

---

## 🚀 How to Use

### 1. Get User Profile

**Endpoint:** `GET /api/users/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "...",
    "mobile": "01712345678",
    "isVerified": true,
    "role": "user",
    "profile": {
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": null
    },
    "addresses": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 2. Update Profile

**Endpoint:** `PUT /api/users/me`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

### 3. Change Password

**Endpoint:** `PUT /api/users/me/password`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 4. Set Password (First Time)

**Endpoint:** `POST /api/users/me/password`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "password": "newpassword123"
}
```

### 5. Get Addresses

**Endpoint:** `GET /api/users/me/addresses`

**Response:**
```json
{
  "success": true,
  "message": "Addresses retrieved successfully",
  "data": [
    {
      "_id": "...",
      "label": "Home",
      "recipientName": "John Doe",
      "recipientMobile": "01712345678",
      "addressLine1": "123 Main Street",
      "area": "Dhanmondi",
      "city": "Dhaka",
      "district": "Dhaka",
      "isDefault": true,
      ...
    }
  ]
}
```

### 6. Create Address

**Endpoint:** `POST /api/users/me/addresses`

**Body:**
```json
{
  "label": "Home",
  "recipientName": "John Doe",
  "recipientMobile": "01712345678",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apartment 4B",
  "area": "Dhanmondi",
  "city": "Dhaka",
  "district": "Dhaka",
  "postalCode": "1205",
  "isDefault": true
}
```

### 7. Update Address

**Endpoint:** `PUT /api/users/me/addresses/:id`

**Body:**
```json
{
  "recipientName": "John Doe Updated",
  "addressLine1": "456 New Street"
}
```

### 8. Delete Address

**Endpoint:** `DELETE /api/users/me/addresses/:id`

### 9. Set Default Address

**Endpoint:** `PUT /api/users/me/addresses/:id/default`

---

## 📁 Files Created

### Models:
- `models/User.js` - Complete user schema
- `models/Address.js` - Address schema

### Repositories:
- `repositories/userRepository.js` - User data access
- `repositories/addressRepository.js` - Address data access

### Services:
- `services/userService.js` - User business logic

### Controllers:
- `controllers/userController.js` - User request handlers

### Routes:
- `routes/user.js` - User API endpoints

### Updated Files:
- `server.js` - Added user routes

---

## ✅ Testing Checklist

Before moving to Part 5, verify:

- [ ] User model works correctly
- [ ] Password hashing works (check database)
- [ ] Password comparison works
- [ ] OTP validation works
- [ ] Address model works correctly
- [ ] Default address logic works (only one default)
- [ ] All user endpoints require authentication
- [ ] Profile update works
- [ ] Password change works (with current password)
- [ ] Address CRUD operations work
- [ ] Address belongs to correct user (security check)

### Test Scenarios:

1. **Create User** (will be in Part 5/6)
2. **Get Profile** - Requires authentication
3. **Update Profile** - Update name, email
4. **Change Password** - With current password
5. **Set Password** - First time setup
6. **Create Address** - Multiple addresses
7. **Set Default Address** - Only one default
8. **Update Address** - Modify address
9. **Delete Address** - Soft delete

---

## 🔍 Code Quality Features

### Clean Architecture:
- ✅ 3-layer separation maintained
- ✅ Clear responsibilities
- ✅ Reusable code

### Security:
- ✅ Password hashing with bcrypt
- ✅ Password not included in queries by default
- ✅ OTP not included in queries by default
- ✅ Address ownership validation
- ✅ Authentication required for all routes

### Validation:
- ✅ Input validation at route level
- ✅ Business logic validation at service level
- ✅ Model-level validation

### Best Practices:
- ✅ Soft delete for addresses
- ✅ Default address management
- ✅ Email uniqueness check
- ✅ Proper error messages

---

## 🎯 What's Next?

### Part 5: OTP Service
- OTP generation
- SMS API integration
- OTP verification
- OTP expiry handling

### Part 6: Authentication Routes & Controllers
- Register endpoint
- Login endpoint (OTP request)
- OTP verification endpoint
- JWT token generation

---

## 📝 Notes

1. **Password Field**: Optional. Users can use passwordless login (OTP only) or set a password.
2. **Address Management**: Addresses are soft-deleted. Set `isActive: false` instead of removing.
3. **Default Address**: Only one address can be default per user. Setting a new default unsets the previous one.
4. **Email Uniqueness**: Email is checked for uniqueness when updating profile.
5. **Authentication**: All user routes require authentication. Use `authenticate` middleware.

---

## 🐛 Common Issues & Solutions

### Issue: "User not found" error
**Solution**: 
- Check if user ID is correct (24 characters)
- Verify user exists in database
- Check authentication token is valid

### Issue: "Password already set" error
**Solution**: 
- Use `PUT /api/users/me/password` (change password) instead
- Provide current password

### Issue: "Address does not belong to this user"
**Solution**: 
- Check address ID is correct
- Verify address belongs to authenticated user
- Don't try to access other users' addresses

### Issue: Password not hashing
**Solution**: 
- Check if password field is modified
- Verify pre-save hook is working
- Check bcrypt is installed

---

## ✨ Key Features Implemented

1. ✅ **Complete User Model** - All required fields
2. ✅ **Password Management** - Hashing, comparison, change
3. ✅ **Profile Management** - Update name, email, avatar
4. ✅ **Address Management** - CRUD operations
5. ✅ **Default Address** - Automatic management
6. ✅ **Security** - Password/OTP not exposed in queries
7. ✅ **Validation** - Input and business logic validation
8. ✅ **3-Layer Architecture** - Clean separation

---

## 🔐 Security Features

### Implemented:
- ✅ Password hashing with bcrypt (cost: 12)
- ✅ Password not included in default queries
- ✅ OTP not included in default queries
- ✅ Address ownership validation
- ✅ Authentication required for all routes
- ✅ Email uniqueness check

### Best Practices:
- ✅ Soft delete for addresses
- ✅ Input sanitization (global middleware)
- ✅ Input validation at route level
- ✅ Business logic validation at service level

---

## 📚 Model Relationships

```
User
├── addresses: [ObjectId] → Address
└── profile: {
    name, email, avatar
}

Address
└── user: ObjectId → User
```

---

**Part 4 Complete! ✅**

User model and address management fully implemented. Ready to move to Part 5: OTP Service

