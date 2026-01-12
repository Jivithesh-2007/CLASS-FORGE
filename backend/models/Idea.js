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
  }]
}, {
  timestamps: true
});
module.exports = mongoose.model('Idea', ideaSchema);