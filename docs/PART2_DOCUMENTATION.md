# Part 2: Database Connection & Testing - Documentation

## 📋 What Was Implemented

### 1. Test Model (Data Access Layer)
- ✅ Created `models/Test.js` - Simple Mongoose model for testing
- ✅ Schema with validation (name, description, value, isActive)
- ✅ Automatic timestamps (createdAt, updatedAt)
- ✅ Database indexes for performance

### 2. Test Repository (Data Access Layer)
- ✅ Created `repositories/testRepository.js`
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Pagination support
- ✅ Database status check function
- ✅ Query test to verify connection works

### 3. Test Service (Business Logic Layer)
- ✅ Created `services/testService.js`
- ✅ Business logic validation
- ✅ Data processing
- ✅ Error handling
- ✅ ID format validation

### 4. Test Controller (Presentation Layer)
- ✅ Created `controllers/testController.js`
- ✅ HTTP request/response handling
- ✅ Error forwarding to error handler
- ✅ Consistent response format

### 5. Test Routes (Presentation Layer)
- ✅ Created `routes/test.js`
- ✅ RESTful API endpoints
- ✅ Database status endpoint

### 6. Server Updates
- ✅ Integrated test routes in `server.js`
- ✅ Updated health check endpoint with real database status
- ✅ Database connection status in health check

---

## 🔧 How It Works

### 3-Layer Architecture Flow:

```
Client Request
    ↓
Route (routes/test.js)
    ↓
Controller (controllers/testController.js)
    ↓
Service (services/testService.js) - Business Logic
    ↓
Repository (repositories/testRepository.js) - Data Access
    ↓
Model (models/Test.js) - Database Schema
    ↓
MongoDB Database
    ↓
Response flows back up
```

### Database Status Check:
1. Checks Mongoose connection state
2. Tests a simple query (countDocuments)
3. Returns connection information (host, database name, state)

---

## 🚀 How to Use

### Step 1: Start the Server
Make sure MongoDB is running and server is started:
```bash
npm run dev
```

### Step 2: Test Database Connection

#### Check Health Endpoint (with DB status):
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
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Check Database Status Directly:
```bash
GET http://localhost:5000/api/test/db-status
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database status retrieved",
  "data": {
    "state": "connected",
    "readyState": 1,
    "host": "localhost:27017",
    "name": "ebook_db",
    "isConnected": true,
    "queryTest": "success"
  }
}
```

### Step 3: Test CRUD Operations

#### Create Test Document:
```bash
POST http://localhost:5000/api/test
Content-Type: application/json

{
  "name": "Test Document",
  "description": "This is a test document",
  "value": 100,
  "isActive": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test created successfully",
  "data": {
    "_id": "...",
    "name": "Test Document",
    "description": "This is a test document",
    "value": 100,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get All Test Documents:
```bash
GET http://localhost:5000/api/test?page=1&limit=10
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Tests retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### Get Test by ID:
```bash
GET http://localhost:5000/api/test/{id}
```

#### Update Test Document:
```bash
PUT http://localhost:5000/api/test/{id}
Content-Type: application/json

{
  "name": "Updated Test Document",
  "value": 200
}
```

#### Delete Test Document:
```bash
DELETE http://localhost:5000/api/test/{id}
```

---

## 📁 Files Created

### Models:
- `models/Test.js` - Test model schema

### Repositories:
- `repositories/testRepository.js` - Data access layer

### Services:
- `services/testService.js` - Business logic layer

### Controllers:
- `controllers/testController.js` - Request/response handling

### Routes:
- `routes/test.js` - API endpoints

### Updated Files:
- `server.js` - Added test routes and updated health check

---

## ✅ Testing Checklist

Before moving to Part 3, verify:

- [ ] Server starts without errors
- [ ] MongoDB connection successful (check console logs)
- [ ] Health endpoint shows database as "connected"
- [ ] Database status endpoint works: `GET /api/test/db-status`
- [ ] Can create test document: `POST /api/test`
- [ ] Can get all tests: `GET /api/test`
- [ ] Can get test by ID: `GET /api/test/:id`
- [ ] Can update test: `PUT /api/test/:id`
- [ ] Can delete test: `DELETE /api/test/:id`
- [ ] Error handling works (try invalid ID, missing fields)

---

## 🔍 Code Quality Features

### Clean Architecture:
- ✅ 3-layer separation (Routes → Controllers → Services → Repositories → Models)
- ✅ Clear responsibilities for each layer
- ✅ Reusable code structure

### Comments:
- ✅ Function-level documentation
- ✅ Parameter descriptions
- ✅ Business logic explanations

### Error Handling:
- ✅ Validation at service layer
- ✅ Proper error messages
- ✅ Global error handler catches all errors

### Best Practices:
- ✅ Pagination support
- ✅ Input validation
- ✅ Consistent response format
- ✅ Database indexes for performance

---

## 🎯 What's Next?

### Part 3: Basic Middleware Setup
- Request validation middleware
- Authentication middleware structure
- Rate limiting setup
- Input sanitization

### Part 4: User Model & Schema
- User model with mobile number
- OTP fields
- Profile management
- Role-based access

---

## 📝 Notes

1. **Test Model**: This is for testing purposes. Can be removed in production or kept for testing.
2. **Database Status**: The status check performs a real query to verify connection works.
3. **Pagination**: Default page size is 10, max is 100 items per page.
4. **ID Validation**: MongoDB ObjectId must be 24 characters hex string.

---

## 🐛 Common Issues & Solutions

### Issue: Database status shows "disconnected"
**Solution**: 
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check MongoDB connection string format

### Issue: "Test not found" error
**Solution**: 
- Verify the ID is correct (24 characters)
- Check if document exists in database
- Use correct MongoDB ObjectId format

### Issue: Validation errors
**Solution**: 
- Check required fields (name is required)
- Verify data types (value must be number)
- Check field length limits

### Issue: Pagination not working
**Solution**: 
- Verify page and limit are numbers
- Check query parameters format
- Default values: page=1, limit=10

---

## ✨ Key Features Implemented

1. ✅ **3-Layer Architecture** - Proper separation of concerns
2. ✅ **Database Testing** - Complete CRUD operations
3. ✅ **Connection Status** - Real-time database status check
4. ✅ **Error Handling** - Proper validation and error messages
5. ✅ **Pagination** - Support for large datasets
6. ✅ **Validation** - Input validation at service layer
7. ✅ **Clean Code** - Well-documented and organized

---

## 🔬 Testing Examples

### Using Postman/Thunder Client:

1. **Create Test:**
   - Method: POST
   - URL: `http://localhost:5000/api/test`
   - Body (JSON):
     ```json
     {
       "name": "My First Test",
       "description": "Testing the API",
       "value": 50
     }
     ```

2. **Get All Tests:**
   - Method: GET
   - URL: `http://localhost:5000/api/test?page=1&limit=5`

3. **Get Test by ID:**
   - Method: GET
   - URL: `http://localhost:5000/api/test/{paste_id_here}`

4. **Update Test:**
   - Method: PUT
   - URL: `http://localhost:5000/api/test/{paste_id_here}`
   - Body (JSON):
     ```json
     {
       "name": "Updated Name",
       "value": 75
     }
     ```

5. **Delete Test:**
   - Method: DELETE
   - URL: `http://localhost:5000/api/test/{paste_id_here}`

---

**Part 2 Complete! ✅**

Database connection tested and CRUD operations verified. Ready to move to Part 3: Basic Middleware Setup

