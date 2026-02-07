const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getSystemStats,
  reviewIdea,
  mergeIdeas,
  getStudentActivity,
  assignAdminRole,
  removeAdminRole
} = require('../controllers/adminController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

router.use(authMiddleware);
router.use(roleCheck('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/stats', getSystemStats);

// Admin can review ideas (like teachers)
router.post('/ideas/:id/review', reviewIdea);
router.post('/ideas/merge', mergeIdeas);

// Admin can view student activity
router.get('/students/:studentId/activity', getStudentActivity);

// Admin role management
router.post('/users/:studentId/assign-admin', assignAdminRole);
router.post('/users/:adminId/remove-admin', removeAdminRole);

module.exports = router;