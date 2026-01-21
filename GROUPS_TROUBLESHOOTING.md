# Groups Page Troubleshooting Guide

## Issue: Blank Page

### What We Fixed
1. **Recreated Groups.jsx** - The file had structural issues
2. **Updated CSS** - Added proper height and overflow handling
3. **Fixed Layout** - Ensured flex containers have proper dimensions

### If You Still See a Blank Page

#### Step 1: Check Browser Console
1. Open Developer Tools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for any red error messages
4. Take a screenshot and share the error

#### Step 2: Verify Backend is Running
```bash
# Check if backend is running on port 5001
curl http://localhost:5001/api/health

# Should return:
# {"success":true,"message":"ClassForge API is running","timestamp":"..."}
```

#### Step 3: Check Network Requests
1. Open Developer Tools
2. Go to Network tab
3. Refresh the page
4. Look for failed requests (red)
5. Check the `/api/groups` request specifically

#### Step 4: Clear Cache and Reload
```bash
# In browser:
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Common Issues and Solutions

#### Issue: "Cannot read property 'groups' of undefined"
**Solution**: Backend is not returning data properly
- Check if backend is running: `npm run dev` in backend folder
- Verify database connection
- Check MongoDB is running

#### Issue: "GroupDetailsModal is not defined"
**Solution**: Component import issue
- Verify file exists: `frontend/src/components/GroupDetailsModal/GroupDetailsModal.jsx`
- Check import path in Groups.jsx

#### Issue: "Styles not loading"
**Solution**: CSS module issue
- Verify CSS file exists: `frontend/src/pages/StudentDashboard/Groups.module.css`
- Check for typos in className references
- Clear node_modules and reinstall: `npm install`

#### Issue: "Socket connection failed"
**Solution**: Socket.io not configured
- Verify backend has Socket.io: `npm list socket.io`
- Check server.js has Socket.io setup
- Verify frontend socket.js has correct URL

### Quick Fixes to Try

1. **Restart Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Clear Browser Cache**
   - Ctrl+Shift+Delete (Windows/Linux)
   - Cmd+Shift+Delete (Mac)

4. **Check File Permissions**
   ```bash
   # Ensure files are readable
   ls -la frontend/src/pages/StudentDashboard/Groups.jsx
   ls -la frontend/src/components/GroupChat/GroupChat.jsx
   ```

5. **Verify All Files Exist**
   ```bash
   # Check all required files
   ls -la frontend/src/pages/StudentDashboard/Groups.jsx
   ls -la frontend/src/pages/StudentDashboard/Groups.module.css
   ls -la frontend/src/components/GroupChat/GroupChat.jsx
   ls -la frontend/src/components/GroupChat/GroupChat.module.css
   ls -la frontend/src/components/GroupDetailsModal/GroupDetailsModal.jsx
   ls -la frontend/src/components/GroupDetailsModal/GroupDetailsModal.module.css
   ```

### Debug Mode

Add this to Groups.jsx temporarily to see what's happening:

```javascript
useEffect(() => {
  console.log('Groups component mounted');
  console.log('User:', user);
  console.log('Groups:', groups);
  console.log('Loading:', loading);
}, [groups, loading, user]);
```

### Expected Behavior

1. **On Load**: Should show "Loading groups..."
2. **After Load**: Should show:
   - Left sidebar with "Chats" title
   - Search box
   - Create and Join buttons
   - List of groups (or "No groups yet")
   - Right side with empty chat area

### If Nothing Works

1. Check browser console for errors
2. Check backend console for errors
3. Verify all files were created correctly
4. Try a hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
5. Restart both frontend and backend servers

### Contact Information
If you're still having issues:
1. Share the browser console error
2. Share the backend console output
3. Verify all files exist with correct names
4. Check that ports 5001 (backend) and 5173 (frontend) are available
