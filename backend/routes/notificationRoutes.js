const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');
const Notification = require('../models/Notification');

router.use(authMiddleware);

// Test endpoint to create a test notification
router.post('/test/create', async (req, res) => {
  try {
    const notification = new Notification({
      recipient: req.user._id,
      sender: req.user._id,
      type: 'comment_added',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working',
      isRead: false
    });
    await notification.save();
    res.status(201).json({
      success: true,
      message: 'Test notification created',
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating test notification',
      error: error.message
    });
  }
});

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
module.exports = router;