const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
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
  deleteComment,
  showInterest,
  withdrawInterest,
  getInterestedMentors,
  acceptIdea,
  getMentorInterestedIdeas,
  getMentorAcceptedIdeas,
  getDiscussions,
  addDiscussionMessage,
  addMeetLink,
  shareMeetLink
} = require('../controllers/ideaController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authMiddleware);

// Specific routes first (before :id routes)
router.post('/', roleCheck('student'), upload.array('images', 10), createIdea);
router.get('/', getIdeas);
router.get('/stats/student', roleCheck('student'), getStudentStats);
router.get('/stats/teacher', roleCheck('teacher', 'admin'), getTeacherStats);
router.post('/merge', roleCheck('teacher', 'admin'), mergeIdeas);

// Mentor Dashboard Routes (must be before /:id routes)
router.get('/mentor/interested-ideas', roleCheck('teacher', 'admin'), getMentorInterestedIdeas);
router.get('/mentor/accepted-ideas', roleCheck('teacher', 'admin'), getMentorAcceptedIdeas);

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

// Mentor Collaboration Routes
router.post('/:ideaId/show-interest', roleCheck('teacher', 'admin'), showInterest);
router.post('/:ideaId/withdraw-interest', roleCheck('teacher', 'admin'), withdrawInterest);
router.get('/:ideaId/interested-mentors', getInterestedMentors);
router.post('/:ideaId/accept', roleCheck('teacher', 'admin'), acceptIdea);
router.get('/:ideaId/discussions', getDiscussions);
router.post('/:ideaId/discussions', roleCheck('teacher', 'admin'), addDiscussionMessage);
router.put('/:ideaId/discussions/:discussionId/meet-link', roleCheck('teacher', 'admin'), addMeetLink);
router.post('/:ideaId/share-meet-link', roleCheck('teacher', 'admin'), shareMeetLink);

module.exports = router;