const User = require('../models/User');
const Idea = require('../models/Idea');

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate admin users'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    
    const totalIdeas = await Idea.countDocuments();
    const pendingIdeas = await Idea.countDocuments({ status: 'pending' });
    const approvedIdeas = await Idea.countDocuments({ status: 'approved' });
    const rejectedIdeas = await Idea.countDocuments({ status: 'rejected' });
    const mergedIdeas = await Idea.countDocuments({ status: 'merged' });

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          teachers: totalTeachers
        },
        ideas: {
          total: totalIdeas,
          pending: pendingIdeas,
          approved: approvedIdeas,
          rejected: rejectedIdeas,
          merged: mergedIdeas
        }
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system statistics',
      error: error.message
    });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users: students,
      count: students.length
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
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
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const idea = await Idea.findById(id);
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

const mergeIdeas = async (req, res) => {
  try {
    const { ideaIds, title, description, domain } = req.body;

    if (!ideaIds || ideaIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 ideas are required to merge'
      });
    }

    const ideas = await Idea.find({ _id: { $in: ideaIds } });
    if (ideas.length !== ideaIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more ideas not found'
      });
    }

    const mergedIdea = new Idea({
      title,
      description,
      domain,
      status: 'approved',
      submittedBy: ideas[0].submittedBy,
      submittedByMultiple: ideaIds.map(id => ideas.find(i => i._id.toString() === id).submittedBy),
      mergedFrom: ideaIds,
      reviewedBy: req.user._id,
      reviewedAt: new Date()
    });

    await mergedIdea.save();

    await Idea.updateMany(
      { _id: { $in: ideaIds } },
      { status: 'merged', mergedInto: mergedIdea._id }
    );

    res.status(201).json({
      success: true,
      message: 'Ideas merged successfully',
      idea: mergedIdea
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

const getStudentActivity = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const ideas = await Idea.find({ submittedBy: studentId })
      .populate('submittedBy', 'fullName email')
      .sort({ createdAt: -1 });

    const stats = {
      totalIdeas: ideas.length,
      pending: ideas.filter(i => i.status === 'pending').length,
      approved: ideas.filter(i => i.status === 'approved').length,
      rejected: ideas.filter(i => i.status === 'rejected').length,
      merged: ideas.filter(i => i.status === 'merged').length
    };

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        department: student.department
      },
      stats,
      ideas
    });
  } catch (error) {
    console.error('Get student activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student activity',
      error: error.message
    });
  }
};

const assignAdminRole = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (student.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }

    student.role = 'admin';
    await student.save();

    res.status(200).json({
      success: true,
      message: 'User promoted to admin successfully',
      user: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role
      }
    });
  } catch (error) {
    console.error('Assign admin role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning admin role',
      error: error.message
    });
  }
};

const removeAdminRole = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is not an admin'
      });
    }

    // Check if this is the only admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the last admin from the system'
      });
    }

    admin.role = 'student';
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin role removed successfully',
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Remove admin role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing admin role',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getSystemStats,
  getStudents,
  reviewIdea,
  mergeIdeas,
  getStudentActivity,
  assignAdminRole,
  removeAdminRole
};
