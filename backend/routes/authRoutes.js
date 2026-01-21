const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getProfile,
  updateProfile,
  deactivateAccount,
  sendEmail
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/deactivate', authMiddleware, deactivateAccount);
router.post('/send-email', authMiddleware, sendEmail);

module.exports = router;
