# Students Section - Debug Guide

## What to Check

### 1. Open Browser Console (F12)

Look for these messages:

**Good signs:**
```
Fetching students...
Students API response: {data: {success: true, users: [...], count: 5}}
Students list: [...]
```

**Bad signs:**
```
Error fetching students: ...
Failed to load students
Network error
```

### 2. Check Network Tab (F12 → Network)

Look for request to: `/api/teacher/students`

**Good response:**
- Status: 200
- Response body shows: `{success: true, users: [...], count: X}`

**Bad response:**
- Status: 401 (Not authenticated)
- Status: 403 (Not authorized)
- Status: 500 (Server error)
- No response body

### 3. Check Backend Console

When you access the Students page, you should see:

```
GET /api/teacher/students - 200 OK
```

If you see errors, note them down.

### 4. Test the API Directly

Open a new terminal and run:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/teacher/students
```

Replace `YOUR_TOKEN` with your actual token from localStorage.

**Expected response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "...",
      "fullName": "Student Name",
      "email": "student@karunya.edu.in",
      "department": "CSE",
      "isActive": true,
      "role": "student"
    }
  ],
  "count": 1
}
```

## Common Issues and Solutions

### Issue 1: Page is Completely Blank

**Possible causes:**
1. Component is crashing
2. Sidebar or Header not rendering
3. CSS not loading

**Debug:**
1. Open F12 → Console
2. Look for red error messages
3. Check if you see "Loading students..." text
4. Check if sidebar is visible

**Fix:**
1. Restart frontend: `npm run dev`
2. Hard refresh browser: Ctrl+Shift+R
3. Check browser console for errors

### Issue 2: "Loading students..." Shows Forever

**Possible causes:**
1. API call is hanging
2. Backend not responding
3. Network issue

**Debug:**
1. Check Network tab (F12)
2. Look for `/api/teacher/students` request
3. Check if it's pending or failed
4. Check backend console

**Fix:**
1. Restart backend: `npm run dev`
2. Check if backend is running on port 5001
3. Check MongoDB connection

### Issue 3: Error Message Shows

**Possible causes:**
1. API endpoint not working
2. Authentication failed
3. Database error

**Debug:**
1. Read the error message
2. Check backend console for details
3. Check Network tab response

**Fix:**
1. Click "Retry" button
2. Restart backend
3. Check backend logs

### Issue 4: No Students Show (Empty State)

**Possible causes:**
1. No students in database
2. All students are inactive
3. Query filtering issue

**Debug:**
1. Create a test student account
2. Make sure student is active
3. Check backend database

**Fix:**
1. Create test student
2. Make sure student account is active
3. Check database directly

## Step-by-Step Debug Process

### Step 1: Check if Page Loads

1. Go to http://localhost:5173/teacher-dashboard/students
2. Do you see anything? (sidebar, header, loading message)
3. If blank, check browser console for errors

### Step 2: Check Console Logs

1. Open F12 → Console
2. Look for "Fetching students..." message
3. Look for "Students API response:" message
4. Look for any red error messages

### Step 3: Check Network Request

1. Open F12 → Network
2. Refresh page
3. Look for `/api/teacher/students` request
4. Check status code (should be 200)
5. Check response body

### Step 4: Check Backend

1. Look at backend console
2. Should see: `GET /api/teacher/students - 200 OK`
3. If error, note the error message

### Step 5: Test API Directly

1. Get your token from browser localStorage
2. Run curl command with token
3. Check if you get student data back

## What Should Happen

1. Page loads
2. "Loading students..." appears
3. After 1-2 seconds, students appear in grid
4. Or error message with retry button
5. Or empty state if no students

## Files to Check

**Frontend:**
- `CLASS-FORGE/frontend/src/pages/TeacherDashboard/Students.jsx`
- `CLASS-FORGE/frontend/src/services/api.js`
- `CLASS-FORGE/frontend/src/pages/StudentDashboard/Dashboard.module.css`

**Backend:**
- `CLASS-FORGE/backend/routes/teacherRoutes.js`
- `CLASS-FORGE/backend/controllers/adminController.js`
- `CLASS-FORGE/backend/middleware/auth.js`

## Quick Commands

```bash
# Restart backend
cd CLASS-FORGE/backend && npm run dev

# Restart frontend
cd CLASS-FORGE/frontend && npm run dev

# Check backend health
curl http://localhost:5001/api/health

# Test API with token
curl -H "Authorization: Bearer TOKEN" http://localhost:5001/api/teacher/students
```

## If Still Stuck

1. **Take a screenshot** of the blank page
2. **Open F12 console** and take screenshot of any errors
3. **Check backend console** for error messages
4. **Share these screenshots** for help

---

**Remember:** The page should NOT be completely blank. You should at least see the sidebar and header. If you see nothing, there's a component rendering error.
