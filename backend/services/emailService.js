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
    merged: '#FF9800',
    mentor_interested: '#3B82F6',
    accepted: '#10B981'
  };

  let subject = '';
  let htmlContent = '';

  if (status === 'mentor_interested') {
    subject = `ClassForge - Mentor Interested in Your Idea: ${ideaTitle}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #3B82F6; margin-top: 0;">Great News! 🎉</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            A mentor is interested in your idea <strong>"${ideaTitle}"</strong>!
          </p>
          <div style="background-color: #EFF6FF; padding: 20px; border-left: 4px solid #3B82F6; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #1E40AF; font-weight: 600;">What's Next?</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #1E40AF;">
              <li>The mentor will arrange a Google Meet to discuss your idea</li>
              <li>You'll receive a meeting link via email</li>
              <li>After the discussion, the mentor can approve your idea</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            ${feedback || 'Check your dashboard to see more details about the mentor\'s interest.'}
          </p>
          <a href="${process.env.FRONTEND_URL}/student-dashboard" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600;">View Your Dashboard</a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #888; font-size: 12px; margin: 0;">ClassForge - Idea Submission Portal</p>
        </div>
      </div>
    `;
  } else if (status === 'accepted') {
    subject = `ClassForge - Your Idea Has Been Accepted! 🎊`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #10B981; margin-top: 0;">Congratulations! 🎉</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your idea <strong>"${ideaTitle}"</strong> has been <strong style="color: #10B981;">ACCEPTED</strong>!
          </p>
          <div style="background-color: #F0FDF4; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #166534; font-weight: 600;">What Happens Now?</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #166534;">
              <li>Your idea has been approved by the mentor</li>
              <li>You can now proceed with implementation</li>
              <li>Stay in touch with your mentor for guidance</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            ${feedback || 'Thank you for your contribution to ClassForge!'}
          </p>
          <a href="${process.env.FRONTEND_URL}/student-dashboard" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600;">View Your Dashboard</a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #888; font-size: 12px; margin: 0;">ClassForge - Idea Submission Portal</p>
        </div>
      </div>
    `;
  } else {
    // Default status email
    subject = `ClassForge - Idea ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4A90E2;">ClassForge - Idea Status Update</h2>
        <p>Your idea "<strong>${ideaTitle}</strong>" has been <strong style="color: ${statusColors[status] || '#4A90E2'}">${status}</strong>.</p>
        ${feedback ? `<div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #4A90E2;"><p><strong>Feedback:</strong></p><p>${feedback}</p></div>` : ''}
        <a href="${process.env.FRONTEND_URL}/student-dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Dashboard</a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">ClassForge - Idea Submission Portal</p>
      </div>
    `;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};
const sendMeetingLinkEmail = async (email, studentName, mentorName, ideaTitle, meetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `ClassForge - Meeting Link for Your Idea: ${ideaTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4285F4; margin-top: 0;">📞 Meeting Link Ready!</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hi ${studentName},
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            <strong>${mentorName}</strong> has arranged a Google Meet to discuss your idea <strong>"${ideaTitle}"</strong>.
          </p>
          <div style="background-color: #F0F4FF; padding: 25px; border-left: 4px solid #4285F4; margin: 25px 0; border-radius: 4px; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #1a73e8; font-weight: 600; font-size: 14px;">CLICK BELOW TO JOIN THE MEETING</p>
            <a href="${meetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 16px;">Join Google Meet</a>
            <p style="margin: 15px 0 0 0; color: #666; font-size: 12px;">Or copy this link: <code style="background-color: #f0f0f0; padding: 4px 8px; border-radius: 3px;">${meetLink}</code></p>
          </div>
          <div style="background-color: #FFF3CD; padding: 15px; border-left: 4px solid #FFC107; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404; font-weight: 600;">⏰ Important Reminders:</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #856404;">
              <li>Join a few minutes early to test your audio/video</li>
              <li>Have your idea details ready to discuss</li>
              <li>Be prepared to answer questions about your idea</li>
            </ul>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            After the discussion, the mentor will review your idea and provide feedback. If everything looks good, your idea will be approved!
          </p>
          <a href="${process.env.FRONTEND_URL}/student-dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600;">View Your Dashboard</a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #888; font-size: 12px; margin: 0;">ClassForge - Idea Submission Portal</p>
        </div>
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

module.exports = { sendOTPEmail, sendGroupInviteEmail, sendIdeaStatusEmail, sendMeetingLinkEmail };