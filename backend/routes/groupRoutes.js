const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroupById,
  inviteToGroup,
  acceptInvite,
  rejectInvite,
  leaveGroup,
  deleteGroup,
  joinGroupWithCode
} = require('../controllers/groupController');
const { authMiddleware, roleCheck } = require('../middleware/auth');
router.use(authMiddleware);
router.post('/', roleCheck('student', 'teacher'), createGroup);
router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/:id/invite', inviteToGroup);
router.post('/:id/accept', acceptInvite);
router.post('/:id/reject', rejectInvite);
router.post('/:id/leave', leaveGroup);
router.delete('/:id', deleteGroup);
router.post('/join-with-code', roleCheck('student', 'teacher'), joinGroupWithCode);
module.exports = router;