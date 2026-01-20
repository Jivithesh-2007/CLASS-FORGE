const express = require('express');
const router = express.Router();
const {
  createIdea,
  getIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
  reviewIdea,
  getSimilarIdeas,
  mergeIdeas,
  getStudentStats,
  getTeacherStats,
  getAiInsights,
  addComment,
  getComments,
  deleteComment
} = require('../controllers/ideaController');
const { authMiddleware, roleCheck } = require('../middleware/auth');
router.use(authMiddleware);

// Specific routes first (before :id routes)
router.post('/', roleCheck('student'), createIdea);
router.get('/', getIdeas);
router.get('/stats/student', roleCheck('student'), getStudentStats);
router.get('/stats/teacher', roleCheck('teacher', 'admin'), getTeacherStats);
router.post('/merge', roleCheck('teacher', 'admin'), mergeIdeas);

// Dynamic routes last (after specific routes)
router.get('/:id', getIdeaById);
router.put('/:id', updateIdea);
router.delete('/:id', deleteIdea);
router.post('/:id/review', roleCheck('teacher', 'admin'), reviewIdea);
router.get('/:id/similar', roleCheck('teacher', 'admin'), getSimilarIdeas);
router.get('/:id/ai-insights', roleCheck('teacher', 'admin'), getAiInsights);

// Comment routes
router.post('/:id/comments', addComment);
router.get('/:id/comments', getComments);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;