const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendGroupInviteEmail } = require('../services/emailService');
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
    }

    // Generate unique group code
    let groupCode;
    let isUnique = false;
    while (!isUnique) {
      groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await Group.findOne({ groupCode });
      if (!existing) {
        isUnique = true;
      }
    }

    const group = new Group({
      name,
      description,
      groupCode,
      createdBy: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });
    await group.save();
    await group.populate('members.user', 'fullName email username');

    console.log(`✓ Group created: ${name} with code: ${groupCode}`);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating group',
      error: error.message
    });
  }
};
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id,
      isActive: true
    })
      .populate('createdBy', 'fullName email username')
      .populate('members.user', 'fullName email username')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: groups.length,
      groups
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching groups',
      error: error.message
    });
  }
};
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id)
      .populate('createdBy', 'fullName email username')
      .populate('members.user', 'fullName email username department');
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    const isMember = group.members.some(
      member => member.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }
    res.status(200).json({
      success: true,
      group
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching group',
      error: error.message
    });
  }
};
const inviteToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    const isAdmin = group.members.some(
      member => member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );
    if (!isAdmin && group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can invite members'
      });
    }
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }
    const alreadyMember = group.members.some(
      member => member.user.toString() === invitedUser._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }
    const alreadyInvited = group.pendingInvites.some(
      invite => invite.email === email
    );
    if (alreadyInvited) {
      return res.status(400).json({
        success: false,
        message: 'User has already been invited'
      });
    }
    group.pendingInvites.push({ email });
    await group.save();
    const notification = new Notification({
      recipient: invitedUser._id,
      sender: req.user._id,
      type: 'group_invite',
      title: 'Group Invitation',
      message: `You have been invited to join ${group.name}`,
      relatedGroup: group._id
    });
    await notification.save();
    await sendGroupInviteEmail(email, group.name, req.user.fullName);
    const io = req.app.get('io');
    if (io) {
      io.to(invitedUser._id.toString()).emit('notification', notification);
    }
    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Invite to group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invitation',
      error: error.message
    });
  }
};
const acceptInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    const inviteIndex = group.pendingInvites.findIndex(
      invite => invite.email === req.user.email
    );
    if (inviteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'No pending invitation found'
      });
    }
    group.pendingInvites.splice(inviteIndex, 1);
    group.members.push({
      user: req.user._id,
      role: 'member'
    });
    await group.save();
    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      group
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting invitation',
      error: error.message
    });
  }
};
const rejectInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    const inviteIndex = group.pendingInvites.findIndex(
      invite => invite.email === req.user.email
    );
    if (inviteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'No pending invitation found'
      });
    }
    group.pendingInvites.splice(inviteIndex, 1);
    await group.save();
    res.status(200).json({
      success: true,
      message: 'Invitation rejected'
    });
  } catch (error) {
    console.error('Reject invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting invitation',
      error: error.message
    });
  }
};
const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    if (group.createdBy.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Group creator cannot leave. Delete the group instead.'
      });
    }
    const memberIndex = group.members.findIndex(
      member => member.user.toString() === req.user._id.toString()
    );
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }
    group.members.splice(memberIndex, 1);
    await group.save();
    res.status(200).json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving group',
      error: error.message
    });
  }
};
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group creator can delete the group'
      });
    }
    await Group.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting group',
      error: error.message
    });
  }
};

const joinGroupByCode = async (req, res) => {
  try {
    const { groupCode } = req.body;
    
    console.log('Join group attempt - Code received:', groupCode);
    console.log('User ID:', req.user._id);
    
    if (!groupCode) {
      return res.status(400).json({
        success: false,
        message: 'Group code is required'
      });
    }

    // Search for group with exact code match (case-insensitive)
    const searchCode = groupCode.toUpperCase().trim();
    console.log('Searching for group with code:', searchCode);
    
    const group = await Group.findOne({ 
      groupCode: searchCode
    });
    
    console.log('Group search result:', group ? `Found - ${group._id}` : 'Not found');
    
    if (!group) {
      console.log('Available group codes in DB:');
      const allGroups = await Group.find({}, 'name groupCode');
      console.log(allGroups);
      
      return res.status(404).json({
        success: false,
        message: 'Invalid group code'
      });
    }

    if (!group.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This group is no longer active'
      });
    }

    const alreadyMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    group.members.push({
      user: req.user._id,
      role: 'member'
    });

    await group.save();
    await group.populate('members.user', 'fullName email username');
    await group.populate('createdBy', 'fullName email username');

    const notification = new Notification({
      recipient: group.createdBy._id,
      sender: req.user._id,
      type: 'group_join',
      title: 'New Group Member',
      message: `${req.user.fullName} joined ${group.name}`,
      relatedGroup: group._id
    });
    await notification.save();

    const io = req.app.get('io');
    if (io) {
      io.to(group.createdBy._id.toString()).emit('notification', notification);
    }

    console.log(`✓ User ${req.user.fullName} joined group ${group.name} using code ${searchCode}`);

    res.status(200).json({
      success: true,
      message: 'Joined group successfully',
      group
    });
  } catch (error) {
    console.error('Join group by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining group: ' + error.message,
      error: error.message
    });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  inviteToGroup,
  acceptInvite,
  rejectInvite,
  leaveGroup,
  deleteGroup,
  joinGroupByCode
};