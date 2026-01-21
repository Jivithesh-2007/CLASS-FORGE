# Group Messaging System - How It Works

## Overview
The group messaging system uses WebSocket (Socket.io) for real-time message delivery to all group members.

## Flow

### 1. User Sends a Message
- User types a message in the input field and clicks send
- `handleSendMessage()` is triggered
- Message is sent to backend via `messageAPI.sendMessage()`

### 2. Backend Processes Message
- Backend receives message in `messageController.sendMessage()`
- Message is saved to MongoDB
- Backend broadcasts message to all group members via Socket.io:
  ```javascript
  io.to(groupId.toString()).emit('new_message', message)
  ```

### 3. All Group Members Receive Message
- Every user in the group (who has joined the group room via `socket.emit('join_group', groupId)`) receives the message
- Frontend socket listener receives the message:
  ```javascript
  socket.on('new_message', (message) => {
    setMessages(prev => [...prev, message]);
  });
  ```
- Message is added to the messages state and displayed in the chat

### 4. Clicking a Group Opens Chat
- User clicks on a group in the sidebar
- `onClick={() => setSelectedGroup(group)}` is triggered
- `selectedGroup` state is updated
- GroupChat component renders with the selected group
- Socket joins the group room: `socket.emit('join_group', group._id)`
- Messages are fetched and displayed

## Key Components

### Frontend
- **Groups.jsx**: Displays list of groups, handles group selection
- **GroupChat.jsx**: Displays messages, handles message sending, listens for new messages
- **socket.js**: Manages Socket.io connection

### Backend
- **server.js**: Sets up Socket.io server
- **messageController.js**: Handles message creation and broadcasting
- **messageRoutes.js**: API endpoints for messages

## Socket Events

### Client → Server
- `join`: Join user's personal room
- `join_group`: Join a group room
- `typing`: Emit typing indicator (optional)

### Server → Client
- `new_message`: Broadcast new message to all group members
- `notification`: Send notifications

## Testing

1. Open the app in two different browser windows/tabs
2. Log in as different users
3. Both users join the same group
4. Send a message from one user
5. The message should appear in real-time for the other user

## Debugging

Check browser console for:
- `✓ Socket connected: [socket-id]` - Socket is connected
- `📤 Sending message: [message-data]` - Message is being sent
- `✓ Message sent successfully: [message]` - Message was saved
- `📨 New message received: [message]` - Message received via socket

Check backend logs for:
- `✓ User [socket-id] joined group [groupId]` - User joined group room
- `✓ Message sent in group [groupId] by [user]` - Message was broadcast
