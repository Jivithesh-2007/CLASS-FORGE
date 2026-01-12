const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'ClassForge - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4A90E2;">ClassForge - Password Reset</h2>
        <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4A90E2; font-size: 36px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">ClassForge - Idea Submission Portal</p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};
const sendGroupInviteEmail = async (email, groupName, inviterName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `ClassForge - Invitation to join ${groupName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4A90E2;">ClassForge - Group Invitation</h2>
        <p>${inviterName} has invited you to join the group <strong>${groupName}</strong>.</p>
        <p>Log in to ClassForge to accept or decline this invitation.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 24px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Go to ClassForge</a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">ClassForge - Idea Submission Portal</p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};
const sendIdeaStatusEmail = async (email, ideaTitle, status, feedback = '') => {
  const statusColors = {
    approved: '#4CAF50',
    rejected: '#F44336',
    merged: '#FF9800'
  };
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `ClassForge - Idea ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4A90E2;">ClassForge - Idea Status Update</h2>
        <p>Your idea "<strong>${ideaTitle}</strong>" has been <strong style="color: ${statusColors[status] || '#4A90E2'}">${status}</strong>.</p>
        ${feedback ? `<div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #4A90E2;"><p><strong>Feedback:</strong></p><p>${feedback}</p></div>` : ''}
        <a href="${process.env.FRONTEND_URL}/student-dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Dashboard</a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">ClassForge - Idea Submission Portal</p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};
module.exports = { sendOTPEmail, sendGroupInviteEmail, sendIdeaStatusEmail };