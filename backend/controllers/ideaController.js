const mongoose = require('mongoose');
const Idea = require('../models/Idea');
const User = require('../models/User');
const Notification = require('../models/Notification');
const MergeHistory = require('../models/MergeHistory');
const { findSimilarIdeas } = require('../services/similarityService');
const { sendIdeaStatusEmail, sendMeetingLinkEmail } = require('../services/emailService');
const { generateAiInsights } = require('../services/aiInsightsService');

const createIdea = async (req, res) => {
  try {
    const { title, description, domain, tags, groupId, karunyaThrustArea, sdg, laboratory } = req.body;

    if (!title || !description || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and domain are required'
      });
    }

    // Parse tags if it's a JSON string
    let parsedTags = tags || [];
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = [];
      }
    }

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          filename: file.filename,
          url: `/uploads/${file.filename}`
        });
      });
    }

    const idea = new Idea({
      title,
      description,
      domain,
      karunyaThrustArea: karunyaThrustArea || null,
      sdg: sdg || null,
      laboratory: laboratory || null,
      tags: parsedTags,
      images: images,
      submittedBy: req.user._id,
      groupId: groupId || null,
      contributors: [req.user._id]
    });

    await idea.save();
    await idea.populate('submittedBy', 'fullName email username');

    const teachers = await User.find({ role: 'teacher', isActive: true });
    const io = req.app.get('io');
    
    // Send notifications asynchronously without blocking response
    setImmediate(async () => {
      try {
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
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }
    });

    console.log('✓ Idea created successfully:', idea._id);
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
    const { status, domain, search, all } = req.query;
    const query = {};

    // If 'all' parameter is passed, show all ideas (for Explore Ideas)
    // Otherwise, if student, show only their own ideas (for My Ideas)
    if (req.user.role === 'student' && !all) {
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
      .populate('comments.author', 'fullName username')
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
      .populate('comments.author', 'fullName username')
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
      title: `Idea ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your idea "${idea.title}" has been ${status}`,
      relatedIdea: idea._id
    });
    await notification.save();
    
    // Populate notification for Socket.io emission
    await notification.populate('sender', 'fullName email');
    await notification.populate('relatedIdea', 'title');

    await sendIdeaStatusEmail(idea.submittedBy.email, idea.title, status, feedback);

    const io = req.app.get('io');
    if (io) {
      console.log('📢 Emitting notification to:', idea.submittedBy._id.toString());
      console.log('📬 Notification data:', notification);
      io.to(idea.submittedBy._id.toString()).emit('notification', {
        type: 'idea_status',
        message: `Your idea "${idea.title}" has been ${status}`,
        notification: notification
      });
    } else {
      console.log('⚠️ Socket.io not available');
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
      .populate('submittedBy', 'email fullName')
      .populate('comments.author', 'fullName username');

    if (ideas.length !== ideaIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more ideas not found'
      });
    }

    const allContributors = [...new Set(ideas.flatMap(idea => 
      idea.contributors.map(c => c.toString())
    ))];

    // Get all original submitters as ObjectIds
    const allSubmitters = [...new Set(ideas.map(idea => idea.submittedBy._id))];

    // Combine all comments from both ideas
    const allComments = ideas.flatMap(idea => idea.comments || []);

    const mergedIdea = new Idea({
      title: title || ideas[0].title,
      description: description || ideas.map(i => i.description).join('\n\n'),
      domain: domain || ideas[0].domain,
      tags: tags || [...new Set(ideas.flatMap(i => i.tags))],
      submittedBy: req.user._id,
      submittedByMultiple: allSubmitters,
      contributors: allContributors,
      comments: allComments,
      status: 'approved'
    });

    await mergedIdea.save();
    await mergedIdea.populate('comments.author', 'fullName username');
    await mergedIdea.populate('submittedByMultiple', 'fullName email');

    for (const idea of ideas) {
      idea.status = 'merged';
      idea.mergedInto = mergedIdea._id;
      idea.mergedFrom = ideaIds.filter(id => id !== idea._id.toString());
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

    // Get department engagement data
    const departmentStats = await Idea.aggregate([
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalSubmissions,
        pendingReview,
        approved,
        rejected,
        departmentStats
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

const getAiInsights = async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    const result = await generateAiInsights(idea);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Error generating AI insights',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      ...result.insights
    });
  } catch (error) {
    console.error('Get AI insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI insights',
      error: error.message
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    console.log('📝 Adding comment to idea:', id);
    console.log('👤 Commenter:', req.user._id, req.user.fullName);

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const idea = await Idea.findById(id).populate('submittedBy', 'fullName email _id');
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    console.log('💡 Idea found:', idea.title);
    console.log('👨‍💼 Idea author:', idea.submittedBy._id, idea.submittedBy.fullName);

    const comment = {
      _id: new mongoose.Types.ObjectId(),
      author: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    };

    idea.comments.push(comment);
    await idea.save();

    await idea.populate('comments.author', 'fullName username');

    // Send notification to idea author if commenter is not the author
    const ideaAuthorId = idea.submittedBy._id.toString();
    const commenterId = req.user._id.toString();
    
    console.log('🔍 Comparing IDs:', { ideaAuthorId, commenterId, isSame: ideaAuthorId === commenterId });

    if (ideaAuthorId !== commenterId) {
      try {
        const notification = new Notification({
          recipient: idea.submittedBy._id,
          sender: req.user._id,
          type: 'comment_added',
          title: 'New Comment on Your Idea',
          message: `${req.user.fullName} commented on "${idea.title}"`,
          relatedIdea: idea._id,
          isRead: false
        });
        await notification.save();
        console.log('✅ Notification created:', notification._id);
        console.log('📬 Notification recipient:', notification.recipient);

        const io = req.app.get('io');
        if (io) {
          // Emit to idea room for real-time comment update
          io.to(id).emit('new_comment', idea.comments[idea.comments.length - 1]);
          console.log('✓ Comment emitted to idea room:', id);
          
          // Emit notification to idea author's personal room
          const recipientRoom = idea.submittedBy._id.toString();
          io.to(recipientRoom).emit('notification', {
            type: 'comment_added',
            message: `${req.user.fullName} commented on "${idea.title}"`,
            notification: notification
          });
          console.log('✓ Notification emitted to user room:', recipientRoom);
        } else {
          console.log('⚠ Socket.io not available');
        }
      } catch (notifError) {
        console.error('❌ Error creating notification:', notifError);
      }
    } else {
      console.log('ℹ️ Skipping notification - user commented on own idea');
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: idea.comments[idea.comments.length - 1]
    });
  } catch (error) {
    console.error('❌ Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findById(id).populate('comments.author', 'fullName username');
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    res.status(200).json({
      success: true,
      comments: idea.comments || []
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    const comment = idea.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    idea.comments.id(commentId).deleteOne();
    await idea.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
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
  getTeacherStats,
  getAiInsights,
  addComment,
  getComments,
  deleteComment
};


// ============================================
// MENTOR COLLABORATION ENDPOINTS
// ============================================

const showInterest = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const mentorId = req.user._id;

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers/mentors can show interest'
      });
    }

    const idea = await Idea.findById(ideaId).populate('submittedBy', 'email fullName');
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Check if already interested
    if (idea.interestedMentors && idea.interestedMentors.includes(mentorId)) {
      return res.status(200).json({
        success: false,
        message: 'You have already shown interest in this idea',
        alreadyInterested: true,
        idea
      });
    }

    // Add mentor to interested list
    if (!idea.interestedMentors) {
      idea.interestedMentors = [];
    }
    idea.interestedMentors.push(mentorId);
    
    // Create a discussion thread for this mentor if it doesn't exist
    const discussionExists = idea.discussions && idea.discussions.some(d => d.mentorId.toString() === mentorId.toString());
    if (!discussionExists) {
      if (!idea.discussions) {
        idea.discussions = [];
      }
      idea.discussions.push({
        _id: new mongoose.Types.ObjectId(),
        mentorId: mentorId,
        mentorName: req.user.fullName,
        messages: [],
        createdAt: new Date()
      });
    }
    
    await idea.save();

    // Create notification for student
    const notification = new Notification({
      recipient: idea.submittedBy._id,
      sender: mentorId,
      type: 'mentor_interested',
      title: 'Mentor Interested',
      message: `${req.user.fullName} is interested in your idea "${idea.title}"`,
      relatedIdea: idea._id
    });
    await notification.save();

    // Send email to student
    await sendIdeaStatusEmail(
      idea.submittedBy.email,
      idea.title,
      'mentor_interested',
      `Mentor ${req.user.fullName} is interested in your idea`
    );

    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(idea.submittedBy._id.toString()).emit('notification', {
        type: 'mentor_interested',
        message: `${req.user.fullName} is interested in your idea`,
        notification: notification
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interest shown successfully',
      idea
    });
  } catch (error) {
    console.error('Show interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Error showing interest',
      error: error.message
    });
  }
};

const withdrawInterest = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const mentorId = req.user._id;

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    if (!idea.interestedMentors || !idea.interestedMentors.includes(mentorId)) {
      return res.status(400).json({
        success: false,
        message: 'You have not shown interest in this idea'
      });
    }

    idea.interestedMentors = idea.interestedMentors.filter(id => id.toString() !== mentorId.toString());
    await idea.save();

    res.status(200).json({
      success: true,
      message: 'Interest withdrawn successfully',
      idea
    });
  } catch (error) {
    console.error('Withdraw interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Error withdrawing interest',
      error: error.message
    });
  }
};

const getInterestedMentors = async (req, res) => {
  try {
    const { ideaId } = req.params;

    const idea = await Idea.findById(ideaId).populate('interestedMentors', 'fullName email');
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    const interestedMentors = (idea.interestedMentors || []).map(mentor => ({
      mentorId: mentor._id,
      mentorName: mentor.fullName,
      mentorEmail: mentor.email
    }));

    res.status(200).json({
      success: true,
      interestedMentors
    });
  } catch (error) {
    console.error('Get interested mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interested mentors',
      error: error.message
    });
  }
};

const acceptIdea = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const { meetLink } = req.body;
    const mentorId = req.user._id;

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers/mentors can accept ideas'
      });
    }

    const idea = await Idea.findById(ideaId).populate('submittedBy', 'email fullName');
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Update idea with acceptance
    idea.status = 'accepted';
    idea.acceptedBy = {
      mentorId: mentorId,
      mentorName: req.user.fullName,
      mentorEmail: req.user.email,
      acceptedAt: new Date(),
      meetLink: meetLink || null
    };
    await idea.save();

    // Create notification for student
    const notification = new Notification({
      recipient: idea.submittedBy._id,
      sender: mentorId,
      type: 'idea_accepted',
      title: 'Idea Accepted',
      message: `Your idea "${idea.title}" has been accepted by ${req.user.fullName}`,
      relatedIdea: idea._id
    });
    await notification.save();

    // Send email to student
    await sendIdeaStatusEmail(
      idea.submittedBy.email,
      idea.title,
      'accepted',
      `Congratulations! Your idea has been accepted by ${req.user.fullName}`
    );

    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(idea.submittedBy._id.toString()).emit('notification', {
        type: 'idea_accepted',
        message: `Your idea has been accepted by ${req.user.fullName}`,
        notification: notification
      });
    }

    res.status(200).json({
      success: true,
      message: 'Idea accepted successfully',
      idea
    });
  } catch (error) {
    console.error('Accept idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting idea',
      error: error.message
    });
  }
};

const getMentorInterestedIdeas = async (req, res) => {
  try {
    const mentorId = req.user._id;

    const ideas = await Idea.find({
      interestedMentors: mentorId
    }).populate('submittedBy', 'fullName email').populate('interestedMentors', 'fullName email');

    res.status(200).json({
      success: true,
      ideas
    });
  } catch (error) {
    console.error('Get mentor interested ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interested ideas',
      error: error.message
    });
  }
};

const getMentorAcceptedIdeas = async (req, res) => {
  try {
    const mentorId = req.user._id;

    const ideas = await Idea.find({
      'acceptedBy.mentorId': mentorId
    }).populate('submittedBy', 'fullName email').populate('interestedMentors', 'fullName email');

    res.status(200).json({
      success: true,
      ideas
    });
  } catch (error) {
    console.error('Get mentor accepted ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accepted ideas',
      error: error.message
    });
  }
};

const getDiscussions = async (req, res) => {
  try {
    const { ideaId } = req.params;

    const idea = await Idea.findById(ideaId).populate('discussions.mentorId', 'fullName email').populate('discussions.messages.sentBy', 'fullName email');
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    res.status(200).json({
      success: true,
      discussions: idea.discussions || []
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discussions',
      error: error.message
    });
  }
};

const addDiscussionMessage = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const { content } = req.body;
    const mentorId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Find or create discussion for this mentor
    let discussion = idea.discussions.find(d => d.mentorId.toString() === mentorId.toString());
    
    if (!discussion) {
      discussion = {
        _id: new mongoose.Types.ObjectId(),
        mentorId: mentorId,
        mentorName: req.user.fullName,
        messages: [],
        createdAt: new Date()
      };
      idea.discussions.push(discussion);
    }

    // Add message to discussion
    discussion.messages.push({
      content: content,
      sentBy: mentorId,
      senderName: req.user.fullName,
      createdAt: new Date()
    });

    await idea.save();

    // Emit socket notification to student
    const io = req.app.get('io');
    if (io) {
      io.to(idea.submittedBy.toString()).emit('new_discussion_message', {
        ideaId: idea._id,
        mentorName: req.user.fullName,
        message: content
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      discussion
    });
  } catch (error) {
    console.error('Add discussion message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
};

const addMeetLink = async (req, res) => {
  try {
    const { ideaId, discussionId } = req.params;
    const { meetLink } = req.body;
    const mentorId = req.user._id;

    if (!meetLink || !meetLink.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Meet link is required'
      });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    const discussion = idea.discussions.find(d => d._id.toString() === discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Verify mentor owns this discussion
    if (discussion.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only add meet links to your own discussions'
      });
    }

    discussion.meetLink = meetLink;
    await idea.save();

    // Create notification for student
    const notification = new Notification({
      recipient: idea.submittedBy._id,
      sender: mentorId,
      type: 'meet_link_shared',
      title: 'Meeting Link Shared',
      message: `${req.user.fullName} shared a Google Meet link for your idea "${idea.title}"`,
      relatedIdea: idea._id,
      metadata: {
        meetLink: meetLink,
        mentorName: req.user.fullName
      }
    });
    await notification.save();

    // Send email to student
    const emailContent = `
      <h2>Meeting Link Shared</h2>
      <p>Hi ${idea.submittedBy.fullName},</p>
      <p>${req.user.fullName} has shared a Google Meet link to discuss your idea "${idea.title}".</p>
      <p><strong>Join the meeting:</strong></p>
      <p><a href="${meetLink}" target="_blank" style="background-color: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Join Google Meet</a></p>
      <p>Meeting Link: ${meetLink}</p>
      <p>Best regards,<br/>CLASSFORGE Team</p>
    `;

    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: idea.submittedBy.email,
        subject: `Meeting Link: ${idea.title}`,
        html: emailContent
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    // Emit socket notification to student
    const io = req.app.get('io');
    if (io) {
      io.to(idea.submittedBy._id.toString()).emit('meet_link_added', {
        ideaId: idea._id,
        mentorName: req.user.fullName,
        meetLink: meetLink,
        title: idea.title
      });
    }

    res.status(200).json({
      success: true,
      message: 'Meet link added successfully',
      discussion
    });
  } catch (error) {
    console.error('Add meet link error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding meet link',
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
  addMeetLink
};


const shareMeetLink = async (req, res) => {
  try {
    const { ideaId } = req.params;
    const { meetLink } = req.body;
    const mentorId = req.user._id;

    if (!meetLink || !meetLink.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Meet link is required'
      });
    }

    const idea = await Idea.findById(ideaId).populate('submittedBy', 'email fullName');
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Create notification for student
    const notification = new Notification({
      recipient: idea.submittedBy._id,
      sender: mentorId,
      type: 'meet_link_shared',
      title: 'Meeting Link Shared',
      message: `${req.user.fullName} shared a Google Meet link for your idea "${idea.title}"`,
      relatedIdea: idea._id,
      metadata: {
        meetLink: meetLink,
        mentorName: req.user.fullName
      }
    });
    await notification.save();

    // Send professional email to student with meeting link
    await sendMeetingLinkEmail(
      idea.submittedBy.email,
      idea.submittedBy.fullName,
      req.user.fullName,
      idea.title,
      meetLink
    );

    // Emit socket notification to student
    const io = req.app.get('io');
    if (io) {
      io.to(idea.submittedBy._id.toString()).emit('meet_link_added', {
        ideaId: idea._id,
        mentorName: req.user.fullName,
        meetLink: meetLink,
        title: idea.title
      });
    }

    res.status(200).json({
      success: true,
      message: 'Meeting link shared successfully'
    });
  } catch (error) {
    console.error('Share meet link error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing meeting link',
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
};
