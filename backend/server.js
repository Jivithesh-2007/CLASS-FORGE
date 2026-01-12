require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const groupRoutes = require('./routes/groupRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
connectDB();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('io', io);
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ClassForge API is running',
    timestamp: new Date().toISOString()
  });
});
io.on('connection', (socket) => {
  console.log('✓ User connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`✓ User ${userId} joined their room`);
  });
  socket.on('disconnect', () => {
    console.log('✗ User disconnected:', socket.id);
  });
});
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log('=================================');
  console.log('   ClassForge Backend Server');
  console.log('=================================');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
  console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log('=================================');
});
module.exports = { app, server, io };