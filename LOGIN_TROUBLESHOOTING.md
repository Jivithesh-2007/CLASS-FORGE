# Login Troubleshooting Guide

## What Was Fixed

The backend was crashing because it was trying to load the Anthropic SDK which wasn't installed. This has been fixed - the backend now gracefully handles the missing dependency.

## Step-by-Step Debugging

### 1. Check if Backend is Running

Open a terminal and run:

```bash
curl http://localhost:5001/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "ClassForge API is running",
  "timestamp": "2024-01-16T..."
}
```

**If you get an error:**
- Backend is not running
- Start it with: `npm run dev` (in backend directory)

### 2. Check Backend Console Output

When you start the backend, you should see:

```
=================================
   ClassForge Backend Server
=================================
✓ Server running on port 5001
✓ Environment: development
✓ Frontend URL: http://localhost:5173
=================================
```

**If you see errors:**
- Check the error message
- Common issues:
  - Port 5001 already in use
  - MongoDB connection failed
  - Missing environment variables

### 3. Check Frontend is Running

Open http://localhost:5173 in your browser

**Expected:** Login page loads

**If blank or error:**
- Frontend is not running
- Start it with: `npm run dev` (in frontend directory)

### 4. Try Logging In

Use these test credentials:

**Student Account:**
- Email: `student@karunya.edu.in`
- Password: (whatever you set during signup)

**Teacher Account:**
- Email: `teacher@karunya.edu`
- Password: (whatever you set during signup)

### 5. Check Browser Console for Errors

1. Open DevTools: Press `F12`
2. Go to **Console** tab
3. Look for red error messages
4. Common errors:

**"Failed to fetch"**
- Backend is not running
- CORS issue
- Network problem

**"Invalid email or password"**
- Credentials are wrong
- Account doesn't exist
- Try creating a new account

**"Token is invalid or expired"**
- Clear localStorage and try again
- Open DevTools → Application → Local Storage → Clear All

### 6. Check Backend Console for Login Errors

When you attempt login, the backend should log:

**Successful login:**
```
✓ Login successful for student@karunya.edu.in (student)
```

**Failed login:**
```
Login attempt failed: User not found for email student@karunya.edu.in
Login attempt failed: Invalid password for student@karunya.edu.in
Login attempt failed: User student@karunya.edu.in is inactive
```

## Common Issues and Solutions

### Issue: "Cannot find module '@anthropic-ai/sdk'"

**Solution:**
```bash
cd CLASS-FORGE/backend
npm install @anthropic-ai/sdk
npm run dev
```

### Issue: "ECONNREFUSED" - Cannot connect to MongoDB

**Solution:**
1. Make sure MongoDB is running
2. Check MONGODB_URI in `.env` is correct
3. Verify MongoDB credentials are correct

**Check MongoDB connection:**
```bash
# In backend console, you should see:
✓ Connected to MongoDB
```

### Issue: "Port 5001 already in use"

**Solution:**
```bash
# Find process using port 5001
netstat -ano | findstr :5001

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F

# Or use a different port
PORT=5002 npm run dev
```

### Issue: "CORS error" or "Access denied"

**Solution:**
1. Make sure frontend URL is correct in `.env`
2. Should be: `FRONTEND_URL=http://localhost:5173`
3. Restart backend after changing `.env`

### Issue: "Account is inactive"

**Solution:**
- Your account has been deactivated
- Contact your administrator to reactivate
- Or create a new account

### Issue: "Email already registered"

**Solution:**
- Account already exists with that email
- Try logging in instead of signing up
- Or use a different email

## Step-by-Step Login Test

1. **Start Backend:**
   ```bash
   cd CLASS-FORGE/backend
   npm run dev
   ```
   Wait for: `✓ Server running on port 5001`

2. **Start Frontend:**
   ```bash
   cd CLASS-FORGE/frontend
   npm run dev
   ```
   Wait for: `VITE v... ready in ... ms`

3. **Open Browser:**
   - Go to http://localhost:5173
   - You should see the login page

4. **Create Test Account (if needed):**
   - Click "Create Account"
   - Fill in details
   - Use email ending in `@karunya.edu.in` for student
   - Use email ending in `@karunya.edu` for teacher
   - Click "Sign Up"

5. **Login:**
   - Enter username and select domain
   - Enter password
   - Click "Sign In"
   - Should redirect to dashboard

## Checking Logs

### Backend Logs

Look for these messages:

```
✓ Connected to MongoDB
✓ Server running on port 5001
✓ Login successful for [email] ([role])
```

### Frontend Logs

Open DevTools Console (F12) and look for:
- No red errors
- Network requests to `http://localhost:5001/api/auth/login` should return 200

## If Still Not Working

1. **Clear everything and restart:**
   ```bash
   # Clear browser cache
   # Close all terminals
   # Restart backend: npm run dev
   # Restart frontend: npm run dev
   ```

2. **Check all environment variables:**
   - Backend `.env` has all required variables
   - Frontend `.env` (if any) is correct

3. **Check database:**
   - MongoDB is running
   - Database has users collection
   - User account exists

4. **Collect debug info:**
   - Backend console output
   - Frontend console errors (F12)
   - Network tab showing failed requests
   - Share this info if asking for help

## Quick Restart Guide

```bash
# Terminal 1 - Backend
cd CLASS-FORGE/backend
npm run dev

# Terminal 2 - Frontend
cd CLASS-FORGE/frontend
npm run dev

# Terminal 3 - Open browser
# Go to http://localhost:5173
```

## Success Indicators

✅ Backend console shows: `✓ Server running on port 5001`
✅ Frontend loads at http://localhost:5173
✅ Login page displays correctly
✅ Can enter credentials and click "Sign In"
✅ Redirects to dashboard after successful login
✅ No red errors in browser console

If all these are true, login is working!
