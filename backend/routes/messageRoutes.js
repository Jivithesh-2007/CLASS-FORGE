const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  sendMessage,
  sendMessageWithFile,
  getGroupMessages,
  markMessageAsRead
} = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow all file types
    cb(null, true);
  }
});

router.use(authMiddleware);

router.post('/', sendMessage);
router.post('/upload', upload.single('file'), sendMessageWithFile);
router.get('/:groupId', getGroupMessages);
router.put('/:messageId/read', markMessageAsRead);

module.exports = router;
