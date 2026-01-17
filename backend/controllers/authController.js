const User = require('../models/User');
const OTP = require('../models/OTP');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { generateOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../services/emailService');
const signup = async (req, res) => {
  try {
    const { fullName, username, email, password, department } = req.body;
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    let role = 'student';
    if (email.endsWith('@karunya.edu')) {
      role = 'teacher';
    } else if (email.endsWith('@karunya.edu.in')) {
      role = 'student';
    }
    const hashedPassword = await hashPassword(password);
    const user = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      role,
      department
    });
    await user.save();
    const token = generateToken(user._id, user.role);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    if (!user.isActive) {
      console.log(`Login attempt failed: User ${email} is inactive`);
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }
    
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login attempt failed: Invalid password for ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const token = generateToken(user._id, user.role);
    console.log(`✓ Login successful for ${email} (${user.role})`);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }
    await OTP.deleteMany({ email, verified: false });
    const otp = generateOTP();
    const otpDoc = new OTP({
      email,
      otp
    });
    await otpDoc.save();
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
};
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }
    const otpDoc = await OTP.findOne({
      email,
      otp,
      verified: false,
      expiresAt: { $gt: new Date() }
    });
    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    otpDoc.verified = true;
    await otpDoc.save();
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }
    const otpDoc = await OTP.findOne({
      email,
      otp,
      verified: true,
      expiresAt: { $gt: new Date() }
    });
    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    await OTP.deleteMany({ email });
    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        lastName: req.user.lastName,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, lastName, department } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (fullName) user.fullName = fullName;
    if (lastName) user.lastName = lastName;
    if (department) user.department = department;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating account'
    });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getProfile,
  updateProfile,
  deactivateAccount
};
