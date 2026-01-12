const Idea = require('../models/Idea');
const User = require('../models/User');
const Notification = require('../models/Notification');
const MergeHistory = require('../models/MergeHistory');
const { findSimilarIdeas } = require('../services/similarityService');
const { sendIdeaStatusEmail } = require('../services/emailService');

const createIdea = async (req, res) => {
  try {
    const { title, description, domain, tags, groupId } = req.body;

    if (!title || !description || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and domain are required'
      });
    }

    const idea = new Idea({
      title,
      description,
      domain,
      tags: tags || [],
      submittedBy: req.user._id,
      groupId: groupId || null,
      contributors: [req.user._id]
    });

    await idea.save();
    await idea.populate('submittedBy', 'fullName email username');

    const teachers = await User.find({ role: 'teacher', isActive: true });
    const io = req.app.get('io');
    
    for (const teacher of teachers) {
      const notification = new Notification({
        recipient: teacher._id,
        sender: req.user._id,
        type: 'idea_submitted',
        title: 'New Idea Submitted',
        message: `${req.user.fullName} submitted "${title}"`,
        relatedIdea: idea._id
      });
      await notification.save();
      
      if (io) {
        io.to(teacher._id.toString()).emit('notification', {
          type: 'idea_submitted',
          message: `New idea submitted by ${req.user.fullName}`,
          idea: idea
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Idea submitted successfully',
      idea
    });
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating idea',
      error: error.message
    });
  }
};

const getIdeas = async (req, res) => {
  try {
    const { status, domain, search } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.submittedBy = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (domain) {
      query.domain = domain;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const ideas = await Idea.find(query)
      .populate('submittedBy', 'fullName email username department')
      .populate('reviewedBy', 'fullName email')
      .populate('contributors', 'fullName email username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ideas.length,
      ideas
    });
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ideas',
      error: error.message
    });
  }
};

const getIdeaById = async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findById(id)
      .populate('submittedBy', 'fullName email username department')
      .populate('reviewedBy', 'fullName email')
      .populate('contributors', 'fullName email username')
      .populate('groupId', 'name');

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    if (req.user.role === 'student' && idea.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      idea
    });
  } catch (error) {
    console.error('Get idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching idea',
      error: error.message
    });
  }
};

const updateIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, domain, tags } = req.body;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    if (req.user.role === 'student') {
      if (idea.submittedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own ideas'
        });
      }

      if (idea.status !== 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Cannot edit idea after review'
        });
      }
    }

    if (title) idea.title = title;
    if (description) idea.description = description;
    if (domain) idea.domain = domain;
    if (tags) idea.tags = tags;

    await idea.save();
    await idea.populate('submittedBy', 'fullName email username');

    res.status(200).json({
      success: true,
      message: 'Idea updated successfully',
      idea
    });
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating idea',
      error: error.message
    });
  }
};

const deleteIdea = async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    if (req.user.role === 'student') {
      if (idea.submittedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own ideas'
        });
      }

      if (idea.status !== 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete idea after review'
        });
      }
    }

    await Idea.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Idea deleted successfully'
    });
  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting idea',
      error: error.message
    });
  }
};

const reviewIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const idea = await Idea.findById(id).populate('submittedBy', 'email fullName');
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    idea.status = status;
    idea.feedback = feedback || '';
    idea.reviewedBy = req.user._id;
    idea.reviewedAt = new Date();
    await idea.save();

    const notification = new Notification({
      recipient: idea.submittedBy._id,
      sender: req.user._id,
      type: 'idea_status',
      title: `Idea ${status}`,
      message: `Your idea "${idea.title}" has been ${status}`,
      relatedIdea: idea._id
    });
    await notification.save();

    await sendIdeaStatusEmail(idea.submittedBy.email, idea.title, status, feedback);

    const io = req.app.get('io');
    if (io) {
      io.to(idea.submittedBy._id.toString()).emit('notification', notification);
    }

    res.status(200).json({
      success: true,
      message: `Idea ${status} successfully`,
      idea
    });
  } catch (error) {
    console.error('Review idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing idea',
      error: error.message
    });
  }
};

const getSimilarIdeas = async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    const similarIdeas = await findSimilarIdeas(
      Idea,
      idea.title,
      idea.description,
      idea._id
    );

    res.status(200).json({
      success: true,
      similarIdeas: similarIdeas.map(item => ({
        ...item.idea.toObject(),
        similarityScore: item.score
      }))
    });
  } catch (error) {
    console.error('Get similar ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding similar ideas',
      error: error.message
    });
  }
};

const mergeIdeas = async (req, res) => {
  try {
    const { ideaIds, title, description, domain, tags } = req.body;

    if (!ideaIds || ideaIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 ideas are required for merging'
      });
    }

    const ideas = await Idea.find({ _id: { $in: ideaIds } })
      .populate('submittedBy', 'email fullName');

    if (ideas.length !== ideaIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more ideas not found'
      });
    }

    const allContributors = [...new Set(ideas.flatMap(idea => 
      idea.contributors.map(c => c.toString())
    ))];

    const mergedIdea = new Idea({
      title: title || ideas[0].title,
      description: description || ideas.map(i => i.description).join('\n\n'),
      domain: domain || ideas[0].domain,
      tags: tags || [...new Set(ideas.flatMap(i => i.tags))],
      submittedBy: req.user._id,
      contributors: allContributors,
      status: 'approved'
    });

    await mergedIdea.save();

    for (const idea of ideas) {
      idea.status = 'merged';
      idea.mergedInto = mergedIdea._id;
      await idea.save();

      const notification = new Notification({
        recipient: idea.submittedBy._id,
        sender: req.user._id,
        type: 'merge_request',
        title: 'Ideas Merged',
        message: `Your idea "${idea.title}" has been merged into a new idea`,
        relatedIdea: mergedIdea._id
      });
      await notification.save();

      const io = req.app.get('io');
      if (io) {
        io.to(idea.submittedBy._id.toString()).emit('notification', notification);
      }
    }

    const mergeHistory = new MergeHistory({
      finalIdea: mergedIdea._id,
      mergedIdeas: ideaIds,
      mergedBy: req.user._id,
      contributors: allContributors
    });
    await mergeHistory.save();

    res.status(200).json({
      success: true,
      message: 'Ideas merged successfully',
      mergedIdea
    });
  } catch (error) {
    console.error('Merge ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Error merging ideas',
      error: error.message
    });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalIdeas = await Idea.countDocuments({ submittedBy: userId });
    const pendingIdeas = await Idea.countDocuments({ submittedBy: userId, status: 'pending' });
    const approvedIdeas = await Idea.countDocuments({ submittedBy: userId, status: 'approved' });
    const rejectedIdeas = await Idea.countDocuments({ submittedBy: userId, status: 'rejected' });
    const mergedIdeas = await Idea.countDocuments({ submittedBy: userId, status: 'merged' });

    res.status(200).json({
      success: true,
      stats: {
        totalIdeas,
        pendingIdeas,
        approvedIdeas,
        rejectedIdeas,
        mergedIdeas
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

const getTeacherStats = async (req, res) => {
  try {
    const totalSubmissions = await Idea.countDocuments();
    const pendingReview = await Idea.countDocuments({ status: 'pending' });
    const approved = await Idea.countDocuments({ status: 'approved' });
    const rejected = await Idea.countDocuments({ status: 'rejected' });

    res.status(200).json({
      success: true,
      stats: {
        totalSubmissions,
        pendingReview,
        approved,
        rejected
      }
    });
  } catch (error) {
    console.error('Get teacher stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  createIdea,
  getIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
  reviewIdea,
  getSimilarIdeas,
  mergeIdeas,
  getStudentStats,
  getTeacherStats
};
