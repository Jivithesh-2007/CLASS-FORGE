const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getSystemStats
} = require('../controllers/adminController');
const { authMiddleware, roleCheck } = require('../middleware/auth');
router.use(authMiddleware);
router.use(roleCheck('admin'));
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/stats', getSystemStats);
module.exports = router;