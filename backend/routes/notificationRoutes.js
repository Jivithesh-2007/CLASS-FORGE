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

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
});

// Mark as read
router.patch('/:id/read', markAsRead);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Clear all notifications
router.delete('/clear-all', async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.status(200).json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing notifications',
      error: error.message
    });
  }
});

// Delete single notification
router.delete('/:id', deleteNotification);

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

module.exports = router;