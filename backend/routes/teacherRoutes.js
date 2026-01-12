const express = require('express');
const router = express.Router();
const { getStudents } = require('../controllers/adminController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

router.use(authMiddleware);
router.use(roleCheck('teacher'));

router.get('/students', getStudents);

module.exports = router;
