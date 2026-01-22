# Real-Time Notifications Setup Guide

## Overview
The notifications system now works in real-time with both Socket.io and polling mechanisms for reliability.

## How It Works

### 1. **Socket.io Real-Time Updates**
- When a notification is created on the backend, it's emitted via Socket.io
- The frontend listens for `notification` events on the user's personal room
- Notifications appear instantly in the Header dropdown and Notifications page

### 2. **Polling Fallback (Every 10 seconds)**
- If Socket.io connection drops, polling ensures notifications still arrive
- Both Header and Notifications page poll every 10 seconds
- Provides reliability even with network interruptions

### 3. **Notification Types**
The system supports these notification types:
- `idea_submitted` - When a student submits a new idea
- `idea_status` - When an idea is approved/rejected
- `comment_added` - When someone comments on an idea
- `group_invite` - When invited to a group
- `merge_request` - When ideas are merged
- `group_message` - When a message is sent in a group

## Backend Implementation

### Notification Creation
Notifications are created in these controllers:
- **ideaController.js** - For idea submissions, approvals, rejections, comments, merges
- **groupController.js** - For group invitations
- **messageController.js** - For group messages

### Socket.io Emission
```javascript
const io = req.app.get('io');
if (io) {
  io.to(recipientUserId.toString()).emit('notification', {
    type: 'notification_type',
    message: 'Notification message',
    notification: notificationObject
  });
}
```

## Frontend Implementation

### Header Component
- Displays unread notification count as a badge
- Shows last 5 notifications in dropdown
- Polls every 10 seconds for updates
- Listens to Socket.io for real-time updates

### Notifications Page
- Shows all notifications with full details
- Mark as read / Mark all as read functionality
- Delete notifications
- Polls every 10 seconds for updates
- Listens to Socket.io for real-time updates

## Testing Notifications

### 1. **Test Idea Submission Notification**
- Student submits an idea
- Teacher should see notification immediately
- Check Header badge and Notifications page

### 2. **Test Idea Status Notification**
- Teacher approves/rejects an idea
- Student should see notification immediately
- Check Header badge and Notifications page

### 3. **Test Comment Notification**
- Teacher/Student comments on an idea
- Idea author should see notification immediately
- Check Header badge and Notifications page

### 4. **Test Group Invite Notification**
- Group admin invites a student
- Student should see notification immediately
- Check Header badge and Notifications page

## Troubleshooting

### Notifications Not Appearing
1. Check browser console for errors
2. Verify Socket.io connection in browser DevTools
3. Check that notifications are being created in MongoDB
4. Verify user IDs match between frontend and backend

### Notifications Delayed
- If using polling only (Socket.io down), expect 10-second delay
- Check network tab in DevTools for API calls
- Verify backend is running and accessible

### Unread Count Not Updating
- Clear browser cache and reload
- Check that `isRead` field is being updated in MongoDB
- Verify user authentication token is valid

## Database Schema

### Notification Document
```javascript
{
  _id: ObjectId,
  recipient: ObjectId (User),
  sender: ObjectId (User),
  type: String (notification type),
  title: String,
  message: String,
  relatedIdea: ObjectId (Idea) - optional,
  relatedGroup: ObjectId (Group) - optional,
  isRead: Boolean (default: false),
  readAt: Date - optional,
  createdAt: Date,
  updatedAt: Date
}
```

## Performance Considerations

- Polling interval: 10 seconds (balance between real-time and server load)
- Notifications limit: 50 per user (configurable)
- Header shows: Last 5 notifications
- Notifications page shows: All notifications

## Future Improvements

1. Add notification preferences (email, push, in-app)
2. Add notification categories/filtering
3. Add notification sound/desktop notifications
4. Implement notification archiving
5. Add notification search functionality
