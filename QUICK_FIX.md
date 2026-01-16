# Quick Fix for Login Issue

## Problem
The backend was failing to start because the Anthropic SDK wasn't installed, which prevented the entire application from running.

## Solution

### Step 1: Install the Anthropic SDK (Optional but Recommended)

If you want to use the AI Insights feature, run this in the backend directory:

```bash
npm install @anthropic-ai/sdk
```

### Step 2: Add API Key (Only if using AI Insights)

Add this to your `.env` file in the backend:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

Get your API key from: https://console.anthropic.com

### Step 3: Restart the Backend

```bash
npm run dev
```

## What Changed

- The AI Insights Service now gracefully handles missing dependencies
- Backend will start even without Anthropic SDK installed
- If SDK is missing, AI Insights will show an error message instead of crashing
- Login and all other features will work normally

## Testing Login

1. Start backend: `npm run dev` (in backend directory)
2. Start frontend: `npm run dev` (in frontend directory)
3. Try logging in with your credentials
4. You should now be able to login successfully

## If Login Still Fails

Check these things:

1. **Backend is running:**
   - Open http://localhost:5001/api/health in browser
   - Should see: `{"success":true,"message":"ClassForge API is running"...}`

2. **Frontend is running:**
   - Open http://localhost:5173 in browser
   - Should see the login page

3. **Database connection:**
   - Check backend console for MongoDB connection message
   - Should see: `✓ Connected to MongoDB`

4. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for any error messages
   - Share the error message if you need help

5. **Check backend console:**
   - Look for any error messages when you try to login
   - Share the error if you need help

## Common Issues

### "Cannot find module '@anthropic-ai/sdk'"
- Run: `npm install @anthropic-ai/sdk` in backend directory
- Restart backend

### "ECONNREFUSED" or "Cannot connect to server"
- Make sure backend is running on port 5001
- Check if port 5001 is already in use

### "Invalid email or password"
- Make sure you're using the correct credentials
- Check if your account exists in the database
- Try creating a new account if needed

### "Account is inactive"
- Your account has been deactivated by an admin
- Contact your administrator

## Need More Help?

1. Check the backend console for detailed error messages
2. Check the browser console (F12) for frontend errors
3. Verify MongoDB is running and connected
4. Make sure all environment variables are set correctly
