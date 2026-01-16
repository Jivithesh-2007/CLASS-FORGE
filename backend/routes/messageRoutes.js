const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getGroupMessages,
  markMessageAsRead
} = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', sendMessage);
router.get('/:groupId', getGroupMessages);
router.put('/:messageId/read', markMessageAsRead);

module.exports = router;
