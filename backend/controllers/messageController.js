const Message = require('../models/Message');
const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');

const sendMessage = async (req, res) => {
  try {
    const { groupId, content } = req.body;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'Group ID is required'
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    const message = new Message({
      groupId,
      sender: req.user._id,
      content: content || ''
    });

    await message.save();
    await message.populate('sender', 'fullName username avatar');

    const io = req.app.get('io');
    if (io) {
      io.to(groupId.toString()).emit('new_message', {
        _id: message._id,
        groupId,
        sender: message.sender,
        content: message.content,
        attachment: message.attachment,
        createdAt: message.createdAt
      });
    }

    // Create notifications for all other group members
    const otherMembers = group.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );

    for (const member of otherMembers) {
      const notification = new Notification({
        recipient: member.user,
        sender: req.user._id,
        type: 'group_message',
        title: `New message in ${group.name}`,
        message: content.substring(0, 100),
        relatedGroup: groupId
      });
      await notification.save();

      if (io) {
        io.to(member.user.toString()).emit('notification', {
          type: 'group_message',
          title: `New message in ${group.name}`,
          message: content.substring(0, 100),
          groupId
        });
      }
    }

    console.log(`✓ Message sent in group ${groupId} by ${req.user.fullName}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

const sendMessageWithFile = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const file = req.file;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'Group ID is required'
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    const messageData = {
      groupId,
      sender: req.user._id,
      content: content || ''
    };

    if (file) {
      messageData.attachment = {
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        size: file.size,
        type: file.mimetype
      };
    }

    const message = new Message(messageData);
    await message.save();
    await message.populate('sender', 'fullName username avatar');

    const io = req.app.get('io');
    if (io) {
      io.to(groupId.toString()).emit('new_message', {
        _id: message._id,
        groupId,
        sender: message.sender,
        content: message.content,
        attachment: message.attachment,
        createdAt: message.createdAt
      });
    }

    // Create notifications for all other group members
    const otherMembers = group.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );

    for (const member of otherMembers) {
      const notification = new Notification({
        recipient: member.user,
        sender: req.user._id,
        type: 'group_message',
        title: `New message in ${group.name}`,
        message: (content || 'Sent a file').substring(0, 100),
        relatedGroup: groupId
      });
      await notification.save();

      if (io) {
        io.to(member.user.toString()).emit('notification', {
          type: 'group_message',
          title: `New message in ${group.name}`,
          message: (content || 'Sent a file').substring(0, 100),
          groupId
        });
      }
    }

    console.log(`✓ Message with file sent in group ${groupId} by ${req.user.fullName}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message with file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    const messages = await Message.find({ groupId })
      .populate('sender', 'fullName username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalMessages = await Message.countDocuments({ groupId });

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      totalMessages,
      hasMore: skip + limit < totalMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const alreadyRead = message.readBy.some(
      read => read.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({
        user: req.user._id,
        readAt: new Date()
      });
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  sendMessageWithFile,
  getGroupMessages,
  markMessageAsRead
};
