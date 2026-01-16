const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }],
  pendingInvites: [{
    email: String,
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
groupSchema.statics.generateUniqueInviteCode = async function () {
  let inviteCode;
  let existingGroup;
  do {
    inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    existingGroup = await this.findOne({ inviteCode });
  } while (existingGroup);
  return inviteCode;
};
module.exports = mongoose.model('Group', groupSchema);