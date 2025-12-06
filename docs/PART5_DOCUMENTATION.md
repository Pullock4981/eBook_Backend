# Part 5: OTP Service (SMS Integration) - Documentation

## 📋 What Was Implemented

### 1. SMS Service
- ✅ Created `services/smsService.js`
- ✅ Multiple SMS provider support (Twilio, Nexmo, Local, Custom)
- ✅ Provider selection via environment variable
- ✅ Mobile number formatting (Bangladesh format)
- ✅ Error handling with fallback mechanism
- ✅ Development mode console logging

### 2. OTP Service Integration
- ✅ Updated `utils/otpService.js`
- ✅ Integrated with SMS service
- ✅ Error handling for SMS failures
- ✅ Development mode fallback
- ✅ Production error handling

### 3. Environment Configuration
- ✅ Updated `env.example` with SMS provider options
- ✅ Multiple provider configurations
- ✅ Easy provider switching

---

## 🔧 How It Works

### SMS Provider Selection:

```
Environment Variable: SMS_PROVIDER
    ↓
Provider Selection (local/twilio/nexmo/custom)
    ↓
Call Appropriate Provider Function
    ↓
Send SMS
    ↓
Return Result or Fallback
```

### OTP Sending Flow:

```
1. Generate OTP
    ↓
2. Save OTP to user record
    ↓
3. Format OTP message
    ↓
4. Send via SMS service
    ↓
5. Handle success/error
    ↓
6. Log in development mode
```

### Error Handling:

```
SMS Send Attempt
    ↓
Success? → Return result
    ↓
Failure?
    ↓
Development Mode? → Console log + Return success
    ↓
Production Mode? → Throw error
```

---

## 🚀 How to Use

### 1. Configure SMS Provider

#### Option A: Local/Bangladesh Provider (Recommended for BD)
```env
SMS_PROVIDER=local
SMS_API_KEY=your_api_key
SMS_API_URL=https://api.yourprovider.com/send
SMS_SENDER_ID=YOUR_SENDER_ID
```

#### Option B: Twilio
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Option C: Nexmo (Vonage)
```env
SMS_PROVIDER=nexmo
NEXMO_API_KEY=your_api_key
NEXMO_API_SECRET=your_api_secret
NEXMO_FROM_NUMBER=YOUR_BRAND_NAME
```

#### Option D: Custom Provider
```env
SMS_PROVIDER=custom
CUSTOM_SMS_API_URL=https://api.customprovider.com/send
CUSTOM_SMS_API_KEY=your_api_key
```

### 2. Development Mode (No SMS API)

If SMS API is not configured, the system will:
- Log OTP to console
- Return success (for testing)
- Work seamlessly for development

**Console Output:**
```
📱 OTP for 01712345678: 123456
⏰ OTP expires in 5 minutes
⚠️ SMS API not configured. Using development mode.
```

### 3. Production Mode

In production (`NODE_ENV=production`):
- SMS will be sent via configured provider
- Errors will be thrown if SMS fails
- No console logging

---

## 📁 Files Created/Updated

### Services:
- `services/smsService.js` - SMS sending service

### Updated Files:
- `utils/otpService.js` - Integrated with SMS service
- `env.example` - Added SMS provider configurations

---

## ✅ Testing Checklist

Before moving to next part, verify:

- [ ] SMS service loads without errors
- [ ] Development mode works (console logging)
- [ ] OTP generation works
- [ ] OTP sending works (console in dev)
- [ ] Error handling works
- [ ] Provider switching works (if testing multiple providers)
- [ ] Production mode configured (if deploying)

### Test Scenarios:

1. **Development Mode (No API):**
   - Register/login user
   - Check console for OTP
   - Should log OTP to console

2. **With SMS API:**
   - Configure SMS provider
   - Register/login user
   - Check SMS received on mobile
   - Verify OTP works

3. **Error Handling:**
   - Use invalid API credentials
   - Should fallback to console in development
   - Should throw error in production

---

## 🔍 Code Quality Features

### Clean Code:
- ✅ Provider abstraction
- ✅ Easy provider switching
- ✅ Consistent error handling
- ✅ Clear function names

### Security:
- ✅ API keys in environment variables
- ✅ No sensitive data in logs
- ✅ Error messages don't leak credentials

### Best Practices:
- ✅ Fallback mechanism
- ✅ Development mode support
- ✅ Mobile number formatting
- ✅ Provider-specific implementations

---

## 🎯 What's Next?

### Part 7: Product Management
- Product model
- Product CRUD operations
- Category management
- Image upload

### Part 8: Cart & Order System
- Cart model
- Add to cart
- Order creation
- Order management

---

## 📝 Notes

1. **SMS Provider**: Default is 'local'. Change `SMS_PROVIDER` in `.env` to switch.
2. **Development Mode**: If SMS API not configured, OTP is logged to console.
3. **Mobile Format**: Automatically formats to international format (88XXXXXXXXX).
4. **Error Handling**: In development, errors fallback to console. In production, errors are thrown.
5. **Provider Support**: Currently supports Twilio, Nexmo, and generic local providers.

---

## 🐛 Common Issues & Solutions

### Issue: "SMS API not configured"
**Solution**: 
- In development: This is normal. OTP will be logged to console.
- In production: Configure SMS provider in `.env`

### Issue: "SMS sending failed"
**Solution**: 
- Check API credentials
- Verify API URL is correct
- Check network connectivity
- Verify mobile number format
- Check provider-specific requirements

### Issue: "OTP not received"
**Solution**: 
- Check SMS provider account balance
- Verify API credentials
- Check mobile number format
- Check SMS provider logs
- In development, check console for OTP

### Issue: "Provider not working"
**Solution**: 
- Switch to different provider
- Check provider documentation
- Verify API credentials
- Test with provider's test API

---

## ✨ Key Features Implemented

1. ✅ **Multiple Provider Support** - Twilio, Nexmo, Local, Custom
2. ✅ **Easy Provider Switching** - Environment variable
3. ✅ **Development Mode** - Console logging fallback
4. ✅ **Error Handling** - Graceful fallback
5. ✅ **Mobile Formatting** - Automatic Bangladesh format
6. ✅ **Production Ready** - Error handling for production
7. ✅ **Flexible Integration** - Easy to add new providers

---

## 🔐 Security Features

### Implemented:
- ✅ API keys in environment variables
- ✅ No credentials in code
- ✅ Secure error messages
- ✅ Provider-specific authentication

### Best Practices:
- ✅ Environment-based configuration
- ✅ No sensitive data logging
- ✅ Secure API calls
- ✅ Error message sanitization

---

## 📚 SMS Provider Integration Examples

### Example 1: Local Bangladesh Provider

Most Bangladesh SMS providers use similar API structure:

```javascript
// Generic structure
POST https://api.provider.com/send
{
  "mobile": "8801712345678",
  "message": "Your OTP is: 123456",
  "api_key": "your_key",
  "sender_id": "YOUR_ID"
}
```

### Example 2: Twilio

```javascript
// Twilio uses Basic Auth
POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json
Auth: Basic (AccountSid:AuthToken)
Body: {
  To: "+8801712345678",
  From: "+1234567890",
  Body: "Your OTP is: 123456"
}
```

### Example 3: Nexmo (Vonage)

```javascript
// Nexmo uses API key/secret
POST https://rest.nexmo.com/sms/json
{
  api_key: "your_key",
  api_secret: "your_secret",
  to: "8801712345678",
  from: "YOUR_BRAND",
  text: "Your OTP is: 123456"
}
```

---

## 🧪 Testing Different Providers

### Test Local Provider:
```env
SMS_PROVIDER=local
SMS_API_URL=https://your-provider.com/api/send
SMS_API_KEY=your_key
```

### Test Twilio:
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Test Nexmo:
```env
SMS_PROVIDER=nexmo
NEXMO_API_KEY=your_key
NEXMO_API_SECRET=your_secret
NEXMO_FROM_NUMBER=YOUR_BRAND
```

---

## 📊 SMS Service Architecture

```
OTP Service
    ↓
SMS Service
    ↓
Provider Selection
    ↓
┌─────────┬─────────┬─────────┬─────────┐
│ Twilio  │  Nexmo  │  Local  │ Custom  │
└─────────┴─────────┴─────────┴─────────┘
    ↓
SMS API
    ↓
Mobile Device
```

---

**Part 5 Complete! ✅**

SMS integration fully implemented with multiple provider support. Ready to move to Part 7: Product Management

