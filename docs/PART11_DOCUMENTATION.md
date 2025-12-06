# Part 11: eBook Security System - Documentation

## 📋 Overview

Part 11 implements a comprehensive security system for eBook access, including:
- IP address restriction
- Device fingerprinting
- Dynamic PDF watermarking
- Secure PDF serving
- Access token management

---

## 🎯 Features Implemented

### 1. **eBook Access Tracking**
- Tracks user access to eBooks with IP and device restrictions
- Generates secure access tokens
- Monitors access patterns and violations

### 2. **Device Fingerprinting**
- Generates unique device fingerprints from browser characteristics
- Tracks user agent, accept headers, and IP address
- Validates device on each access

### 3. **IP Restriction**
- Restricts eBook access to specific IP addresses
- Supports multiple allowed IPs (configurable)
- Tracks IP changes and violations

### 4. **PDF Watermarking**
- Dynamic watermarking with user email, name, and order ID
- Diagonal watermark pattern across pages
- Configurable opacity, font size, and spacing

### 5. **Secure PDF Serving**
- Serves watermarked PDFs only
- Prevents direct file access
- Security headers to prevent download

---

## 📁 Files Created

### Models
- `models/eBookAccess.js` - eBook access tracking model

### Utilities
- `utils/deviceFingerprint.js` - Device fingerprinting utility
- `utils/pdfWatermark.js` - PDF watermarking utility

### Middleware
- `middleware/ipRestriction.js` - IP and device restriction middleware

### Repositories
- `repositories/eBookAccessRepository.js` - eBook access data access layer

### Services
- `services/eBookService.js` - eBook access business logic
- `services/pdfService.js` - Secure PDF serving service

### Controllers
- `controllers/eBookController.js` - eBook API endpoints

### Routes
- `routes/ebook.js` - eBook API routes

---

## 🔧 Implementation Details

### 1. eBook Access Model

**File:** `models/eBookAccess.js`

**Key Features:**
- Tracks user, order, and product
- Stores IP address and device fingerprint
- Access token with expiry
- Access count and last access tracking
- Support for multiple allowed IPs/devices

**Schema Fields:**
```javascript
{
  user: ObjectId (ref: User),
  order: ObjectId (ref: Order),
  product: ObjectId (ref: Product),
  ipAddress: String,
  deviceFingerprint: String,
  accessToken: String (unique),
  tokenExpiry: Date,
  lastAccess: Date,
  accessCount: Number,
  isActive: Boolean,
  allowedIPs: [String],
  allowedDevices: [String]
}
```

**Methods:**
- `isAccessValid(currentIP, currentDevice)` - Validates access
- `updateAccess(currentIP, currentDevice)` - Updates access tracking

---

### 2. Device Fingerprinting

**File:** `utils/deviceFingerprint.js`

**Functions:**
- `generateFingerprint(req)` - Generates device fingerprint
- `getClientIP(req)` - Gets client IP (handles proxies)
- `validateFingerprint(stored, current)` - Validates fingerprint

**Fingerprint Components:**
- User Agent
- Accept Language
- Accept Encoding
- Accept Headers
- IP Address

---

### 3. PDF Watermarking

**File:** `utils/pdfWatermark.js`

**Functions:**
- `addWatermark(pdfBuffer, watermarkText, options)` - Adds diagonal watermark
- `addHeaderFooterWatermark(pdfBuffer, headerText, footerText, options)` - Adds header/footer
- `generateWatermarkText(userEmail, orderId, userName)` - Generates watermark text
- `watermarkPDFFile(filePath, watermarkText, outputPath)` - Watermarks file

**Watermark Options:**
- `fontSize` - Font size (default: 12)
- `opacity` - Opacity (default: 0.3)
- `angle` - Rotation angle (default: -45)
- `spacing` - Spacing between watermarks (default: 200)

---

### 4. IP Restriction Middleware

**File:** `middleware/ipRestriction.js`

**Function:**
- `checkeBookAccess(req, res, next)` - Validates IP, device, and token

**Validation:**
- Checks access token
- Validates IP address
- Validates device fingerprint
- Updates access tracking

---

### 5. eBook Service

**File:** `services/eBookService.js`

**Functions:**
- `createeBookAccess(userId, orderId, productId, req)` - Creates access record
- `getUserEBooks(userId)` - Gets user's eBooks
- `geteBookAccess(token)` - Gets access by token
- `generateeBookWatermark(access)` - Generates watermark text
- `createAccessForOrder(orderId, req)` - Creates access for all eBooks in order
- `revokeeBookAccess(accessId, userId)` - Revokes access

**Automatic Access Creation:**
- Automatically creates eBook access when order payment is confirmed
- Integrated with `orderService.updatePaymentStatus()`

---

### 6. PDF Service

**File:** `services/pdfService.js`

**Functions:**
- `serveWatermarkedPDF(access, options)` - Serves watermarked PDF
- `getPDFMetadata(digitalFileUrl)` - Gets PDF metadata
- `pdfExists(digitalFileUrl)` - Checks if PDF exists

**Security:**
- Only serves watermarked PDFs
- Prevents direct file access
- Security headers to prevent download

---

## 🔌 API Endpoints

### 1. Get User's eBooks
```
GET /api/ebooks
Headers: { Authorization: Bearer <token> }
```

**Response:**
```json
{
  "success": true,
  "message": "eBooks retrieved successfully",
  "data": {
    "eBooks": [
      {
        "id": "...",
        "accessToken": "...",
        "product": {
          "id": "...",
          "title": "...",
          "slug": "...",
          "thumbnail": "..."
        },
        "order": {
          "id": "...",
          "orderId": "..."
        },
        "lastAccess": "...",
        "accessCount": 0,
        "tokenExpiry": "..."
      }
    ]
  }
}
```

---

### 2. Get eBook Access Token
```
GET /api/ebooks/:productId/access
Headers: { Authorization: Bearer <token> }
```

**Response:**
```json
{
  "success": true,
  "message": "eBook access retrieved successfully",
  "data": {
    "accessToken": "...",
    "product": {
      "id": "...",
      "title": "...",
      "slug": "..."
    },
    "tokenExpiry": "...",
    "lastAccess": "..."
  }
}
```

---

### 3. Get eBook Viewer URL
```
GET /api/ebooks/:productId/viewer
Headers: { Authorization: Bearer <token> }
```

**Response:**
```json
{
  "success": true,
  "message": "Viewer URL generated successfully",
  "data": {
    "viewerURL": "http://localhost:3000/ebook/viewer?token=...",
    "accessToken": "...",
    "tokenExpiry": "..."
  }
}
```

---

### 4. Serve Watermarked PDF
```
GET /api/ebooks/view?token=<access_token>
```

**Response:**
- PDF file with watermark
- Security headers to prevent download

**Security:**
- Validates IP address
- Validates device fingerprint
- Validates access token
- Updates access tracking

---

### 5. Revoke eBook Access
```
DELETE /api/ebooks/:accessId
Headers: { Authorization: Bearer <token> }
```

**Response:**
```json
{
  "success": true,
  "message": "eBook access revoked successfully",
  "data": {
    "access": {
      "id": "...",
      "isActive": false
    }
  }
}
```

---

## ⚙️ Environment Variables

Add to `.env`:

```env
# eBook Security Configuration
EBOOK_TOKEN_EXPIRY_DAYS=365
EBOOK_WATERMARK_FONT_SIZE=12
EBOOK_WATERMARK_OPACITY=0.3
EBOOK_WATERMARK_ANGLE=-45
EBOOK_WATERMARK_SPACING=200
EBOOK_ALLOW_IP_CHANGE=false
EBOOK_ALLOW_DEVICE_CHANGE=false
UPLOADS_DIR=uploads
```

---

## 🔒 Security Features

### 1. **IP Restriction**
- Only allows access from registered IP addresses
- Tracks IP changes
- Configurable to allow IP changes

### 2. **Device Fingerprinting**
- Unique device identification
- Tracks device changes
- Configurable to allow device changes

### 3. **Access Token**
- Secure random token generation
- Token expiry (default: 365 days)
- One token per access record

### 4. **PDF Watermarking**
- Dynamic watermark with user info
- Prevents unauthorized sharing
- Visible but non-intrusive

### 5. **Secure Serving**
- No direct file access
- Security headers
- Access tracking

---

## 🔄 Integration with Order System

**Automatic eBook Access Creation:**

When an order payment is confirmed:
1. `orderService.updatePaymentStatus()` is called
2. Checks if order contains digital products
3. Creates eBook access for each digital product
4. Records IP and device from request

**Flow:**
```
Order Payment Confirmed
  ↓
orderService.updatePaymentStatus()
  ↓
eBookService.createAccessForOrder()
  ↓
eBookAccessRepository.create() (for each eBook)
```

---

## 📝 Usage Examples

### Frontend Integration

**1. Get User's eBooks:**
```javascript
const response = await fetch('/api/ebooks', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();
```

**2. Get Viewer URL:**
```javascript
const response = await fetch(`/api/ebooks/${productId}/viewer`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();
// Redirect to data.viewerURL
```

**3. Embed PDF Viewer:**
```html
<iframe 
  src={`/api/ebooks/view?token=${accessToken}`}
  style="width: 100%; height: 600px; border: none;"
></iframe>
```

---

## 🧪 Testing Checklist

- [ ] Create order with eBook
- [ ] Confirm payment
- [ ] Verify eBook access created
- [ ] Get user's eBooks
- [ ] Get access token
- [ ] View PDF with watermark
- [ ] Test IP restriction (change IP)
- [ ] Test device restriction (change device)
- [ ] Test token expiry
- [ ] Revoke access

---

## 🐛 Error Handling

**Common Errors:**

1. **Invalid Access Token:**
   ```json
   {
     "success": false,
     "message": "Invalid access token"
   }
   ```

2. **IP Not Authorized:**
   ```json
   {
     "success": false,
     "message": "IP address not authorized"
   }
   ```

3. **Device Not Authorized:**
   ```json
   {
     "success": false,
     "message": "Device not authorized"
   }
   ```

4. **Token Expired:**
   ```json
   {
     "success": false,
     "message": "Access token has expired"
   }
   ```

---

## 📊 Database Indexes

**eBookAccess Model:**
- `user + product` (compound)
- `accessToken` (unique)
- `order`
- `ipAddress`
- `deviceFingerprint`
- `tokenExpiry`
- `isActive`

---

## 🚀 Next Steps

1. **Frontend Integration:**
   - Create eBook viewer component
   - Implement PDF viewer with iframe
   - Add access management UI

2. **Additional Security:**
   - Rate limiting for PDF access
   - Session-based access
   - Download prevention (client-side)

3. **Analytics:**
   - Track reading progress
   - Monitor access patterns
   - Generate reports

---

## ✅ Part 11 Complete

**Status:** ✅ **COMPLETE**

All eBook security features implemented:
- ✅ eBook access tracking
- ✅ Device fingerprinting
- ✅ IP restriction
- ✅ PDF watermarking
- ✅ Secure PDF serving
- ✅ Automatic access creation
- ✅ API endpoints
- ✅ Integration with order system

**Ready for:** Frontend integration and testing

---

**Documentation Date:** 2025-12-05  
**Part:** 11 - eBook Security System

