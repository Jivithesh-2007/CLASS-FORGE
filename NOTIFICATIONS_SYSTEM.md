# Notifications System - How It Works

## Overview
The notifications system creates notifications for group members when a new message is posted in a group.

## Flow

### 1. User Sends Message in Group
- User types message and clicks send
- Message is sent to backend via `messageAPI.sendMessage()`

### 2. Backend Processes Message
- Backend receives message in `messageController.sendMessage()`
- Message is saved to MongoDB
- **NEW**: Notifications are created for all other group members:
  ```javascript
  for (const member of otherMembers) {
    await Notification.create({
      recipient: member.user,
      sender: req.user._id,
      type: 'group_message',
      title: `New message in ${group.name}`,
      message: content.substring(0, 100),
      relatedGroup: groupId
    });
  }
  ```

### 3. Notifications Broadcast
- Backend broadcasts message to all group members via Socket.io
- **NEW**: Backend also emits notification event to each member:
  ```javascript
  io.to(member.user.toString()).emit('notification', {
    type: 'group_message',
    title: `New message in ${group.name}`,
    message: content.substring(0, 100),
    groupId
  });
  ```

### 4. Members Receive Notifications
- Frontend socket listener receives notification event
- Notification appears in Header notification dropdown
- Notification is also saved in database

### 5. View Notifications
- Users can click notification icon in Header to see recent notifications
- Users can click "View All Notifications" to go to Notifications page
- On Notifications page, users can:
  - Mark notifications as read
  - Mark all as read
  - Delete notifications
  - View notification details in modal

## Key Features

✅ Notifications created automatically when message is sent  
✅ Only other group members receive notifications (sender doesn't)  
✅ Notifications appear in real-time via Socket.io  
✅ Notifications saved to database  
✅ Notifications page shows all notifications  
✅ Mark as read / Mark all as read functionality  
✅ Delete notifications  
✅ Notification badge shows unread count  

## Notification Types

- `group_message`: New message in a group

## Database Schema

```javascript
{
  recipient: ObjectId,        // User receiving notification
  sender: ObjectId,           // User who sent the message
  type: String,               // 'group_message'
  title: String,              // "New message in GroupName"
  message: String,            // First 100 chars of message
  relatedGroup: ObjectId,     // Group where message was sent
  isRead: Boolean,            // Default: false
  readAt: Date,               // When marked as read
  createdAt: Date,            // When notification was created
  updatedAt: Date
}
```

## Testing

1. Open app in two browser windows as different users
2. Both users join the same group
3. User A sends a message in the group
4. User B should see:
   - Message appears in chat
   - Notification badge appears in Header
   - Notification appears in notification dropdown
   - Notification appears on Notifications page

## Debugging

Check browser console for:
- `📢 Notifications: Joined user room: [userId]` - Socket joined
- `📬 Notifications: New notification received: [notification]` - Notification received

Check backend logs for:
- `✓ Message sent in group [groupId] by [user]` - Message was sent
- Notification creation logs
