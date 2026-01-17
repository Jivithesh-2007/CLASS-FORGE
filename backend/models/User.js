const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true
  },
  department: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('User', userSchema);