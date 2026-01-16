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
      console.log('✓ Socket connected');
      if (userId) {
        socket.emit('join', userId);
      }
    });
    socket.on('disconnect', () => {
      console.log('✗ Socket disconnected');
    });
    socket.on('new_message', (message) => {
      console.log('✓ New message received:', message);
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