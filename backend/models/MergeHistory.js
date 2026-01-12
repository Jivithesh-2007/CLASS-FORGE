const mongoose = require('mongoose');
const mergeHistorySchema = new mongoose.Schema({
  finalIdea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: true
  },
  mergedIdeas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea'
  }],
  mergedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  similarityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  contributors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});
module.exports = mongoose.model('MergeHistory', mergeHistorySchema);