# Port Management Guide - EADDRINUSE Error Solutions

## Problem
The error `EADDRINUSE` occurs when trying to start a server on a port that's already in use by another process.

## Solutions

### Solution 1: Kill the Process Using the Port (Quick Fix)
On macOS/Linux:
```bash
# Find the process using port 5001
lsof -i :5001

# Kill the process (replace PID with the actual process ID)
kill -9 PID

# Example:
kill -9 32734
```

On Windows:
```bash
# Find the process using port 5001
netstat -ano | findstr :5001

# Kill the process (replace PID with the actual process ID)
taskkill /PID PID /F

# Example:
taskkill /PID 12345 /F
```

### Solution 2: Change the Port
If you want to use a different port, update your backend configuration:

**File: `backend/server.js`**
```javascript
const PORT = process.env.PORT || 5002; // Change from 5001 to 5002
```

**File: `frontend/src/services/socket.js`**
```javascript
const SOCKET_URL = 'http://localhost:5002'; // Update to match
```

**File: `frontend/src/services/api.js`**
```javascript
const API_BASE_URL = 'http://localhost:5002/api'; // Update to match
```

### Solution 3: Use Environment Variables
Create a `.env` file in the backend directory:

**File: `backend/.env`**
```
PORT=5001
NODE_ENV=development
```

Then update `backend/server.js`:
```javascript
const PORT = process.env.PORT || 5001;
```

### Solution 4: Graceful Shutdown
Add proper shutdown handling to your server:

**File: `backend/server.js`**
```javascript
const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

## Prevention Tips

1. **Always use Ctrl+C to stop servers** instead of force-killing them
2. **Use different ports** for different services
3. **Check for zombie processes** regularly
4. **Use process managers** like PM2 for production
5. **Set up proper error handling** in your server code

## Common Ports
- Frontend (Vite): 5173
- Backend API: 5001
- MongoDB: 27017
- Redis: 6379

## Quick Reference Commands

### macOS/Linux
```bash
# List all processes using a port
lsof -i :PORT_NUMBER

# Kill a process
kill -9 PID

# Kill all node processes
killall node

# Find and kill in one command
lsof -ti:5001 | xargs kill -9
```

### Windows
```bash
# List all processes using a port
netstat -ano | findstr :PORT_NUMBER

# Kill a process
taskkill /PID PID /F

# Kill all node processes
taskkill /IM node.exe /F
```

## What We Did
We killed process ID 32734 that was using port 5001, freeing up the port for your backend server to start successfully.

Now you can restart your backend with:
```bash
cd backend
npm run dev
```
