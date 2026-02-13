const mongoose = require('mongoose');
const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    trim: true
  },
  karunyaThrustArea: {
    type: String,
    enum: ['Water', 'Food', 'Healthcare', 'Energy'],
    trim: true
  },
  sdg: {
    type: String,
    trim: true
  },
  laboratory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    filename: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'merged'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedByMultiple: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  contributors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  feedback: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  mergedInto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea'
  },
  mergedFrom: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea'
  }],
  comments: [{
    _id: mongoose.Schema.Types.ObjectId,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  interestedMentors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  acceptedBy: {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    mentorName: String,
    mentorEmail: String,
    acceptedAt: Date,
    meetLink: String
  },
  meetingArranged: {
    type: Boolean,
    default: false
  },
  meetingArrangedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  meetingArrangedAt: {
    type: Date
  },
  discussions: [{
    _id: mongoose.Schema.Types.ObjectId,
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    mentorName: String,
    messages: [{
      content: String,
      sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      senderName: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    meetLink: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});
module.exports = mongoose.model('Idea', ideaSchema);