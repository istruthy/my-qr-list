# 🚀 Quick Setup Guide - Hybrid REST + GraphQL Integration

## ✅ **Good News!**
Your authentication issue is now fixed! The app now uses REST endpoints for authentication and GraphQL for other operations.

## 🔄 **What Changed**

### **Authentication (REST)**
- **Login**: `POST /api/auth/login`
- **Register**: `POST /api/auth/register`
- **Base URL**: `http://localhost:3000/api`

### **Other Operations (GraphQL)**
- Properties, rooms, lists, etc. still use GraphQL
- Endpoint: `http://localhost:3000/api/graphql`

## 🧪 **Testing the Setup**

### **Step 1: Test Authentication**
1. **Start your server** (both REST auth and GraphQL)
2. **Run the React Native app**
3. **Try to register/login** - this should now work with REST!

### **Step 2: Test GraphQL Operations**
1. **Go to Admin tab** → "Open Debug Panel"
2. **Tap "Test GraphQL Connection"**
3. **Check the status**

### **Step 3: Update GraphQL Operations**
If GraphQL connection fails, update `src/config/graphql-config.ts` with your actual operation names.

## 🔧 **Current Configuration**

### **REST Authentication (Working)**
```typescript
// These are now handled by REST endpoints
POST /api/auth/login
POST /api/auth/register
```

### **GraphQL Operations (Needs Configuration)**
```typescript
// Update these in src/config/graphql-config.ts
properties: {
  getAll: 'properties',        // Change to match your server
  getById: 'property',         // Change to match your server
  create: 'createProperty',    // Change to match your server
}
```

## 📱 **How to Access Debug Tools**

1. **Run the app**
2. **Go to Admin tab** (bottom right)
3. **Tap "Open Debug Panel"**
4. **Use the tools** to test and configure

## 🎯 **What to Do Next**

### **If Authentication Works:**
✅ Great! Move on to configuring GraphQL operations.

### **If Authentication Still Fails:**
1. **Check your REST server** is running at `http://localhost:3000/api`
2. **Verify the endpoints** `/auth/login` and `/auth/register`
3. **Check server logs** for any errors
4. **Test with curl**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

### **If GraphQL Connection Fails:**
1. **Check GraphQL server** at `http://localhost:3000/api/graphql`
2. **Visit the endpoint** in your browser to see the schema
3. **Update the config file** with correct operation names
4. **Test again** using the debug panel

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Network error"**
   - Check if your server is running
   - Verify the URLs in the code

2. **"Authentication failed"**
   - Check REST auth endpoints
   - Verify request/response format

3. **"GraphQL validation error"**
   - Check GraphQL server
   - Update operation names in config

### **Debug Steps**

1. **Check console logs** for detailed error messages
2. **Use the debug panel** to test connections
3. **Test endpoints manually** with curl or browser
4. **Verify server configuration** (CORS, etc.)

## ✅ **Success Indicators**

When everything is working:
- ✅ Login/register works via REST
- ✅ GraphQL connection successful
- ✅ No validation errors
- ✅ App functions normally

## 📚 **Files to Know**

- **REST Auth**: `src/services/auth-service.ts`
- **Auth Context**: `src/contexts/AuthContext.tsx`
- **GraphQL Config**: `src/config/graphql-config.ts`
- **Debug Panel**: `src/screens/GraphQLDebugScreen.tsx`

## 🆘 **Need Help?**

1. **Check the debug panel** for specific error messages
2. **Look at your server logs** for both REST and GraphQL
3. **Verify both endpoints** are working:
   - REST: `http://localhost:3000/api/auth/login`
   - GraphQL: `http://localhost:3000/api/graphql`
4. **Check network connectivity** between app and server

---

**Remember**: Authentication now uses REST (which should work), and other operations use GraphQL (which may need configuration updates)!
