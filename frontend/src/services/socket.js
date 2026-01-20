import { io } from 'socket.io-client';
const SOCKET_URL = 'http://localhost:5001';
let socket = null;
export const initSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socket.on('connect', () => {
      console.log('✓ Socket connected:', socket.id);
      if (userId) {
        socket.emit('join', userId.toString());
        console.log('✓ Joined user room:', userId.toString());
      }
    });
    socket.on('disconnect', () => {
      console.log('✗ Socket disconnected');
    });
    socket.on('new_message', (message) => {
      console.log('✓ New message received:', message);
    });
    socket.on('notification', (notification) => {
      console.log('✓ Notification received via socket:', notification);
    });
  }
  return socket;
};
export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
export default { initSocket, getSocket, disconnectSocket };