# Email Notification Templates

## Overview
This document shows the exact email templates that will be sent to students at each stage of the mentor collaboration process.

---

## Email 1: Mentor Interest Notification

### When Sent
When a mentor/teacher clicks "Show Interest" on a student's idea

### Recipient
Student who submitted the idea

### Subject Line
```
ClassForge - Mentor Interested in Your Idea: [Idea Title]
```

### Email Content

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Great News! 🎉                                            │
│                                                             │
│  A mentor is interested in your idea "[Idea Title]"!       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ What's Next?                                        │   │
│  │                                                     │   │
│  │ • The mentor will arrange a Google Meet to         │   │
│  │   discuss your idea                                │   │
│  │ • You'll receive a meeting link via email          │   │
│  │ • After the discussion, the mentor can approve     │   │
│  │   your idea                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Check your dashboard to see more details about the        │
│  mentor's interest.                                        │
│                                                             │
│  [View Your Dashboard Button]                              │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  ClassForge - Idea Submission Portal                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Theme
- **Color**: Blue (#3B82F6)
- **Tone**: Encouraging and positive
- **Emojis**: 🎉

---

## Email 2: Meeting Link Notification

### When Sent
When a mentor/teacher shares a Google Meet link for discussion

### Recipient
Student who submitted the idea

### Subject Line
```
ClassForge - Meeting Link for Your Idea: [Idea Title]
```

### Email Content

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  📞 Meeting Link Ready!                                    │
│                                                             │
│  Hi [Student Name],                                        │
│                                                             │
│  [Mentor Name] has arranged a Google Meet to discuss       │
│  your idea "[Idea Title]".                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CLICK BELOW TO JOIN THE MEETING                    │   │
│  │                                                     │   │
│  │  [Join Google Meet Button - Blue]                  │   │
│  │                                                     │   │
│  │  Or copy this link:                                │   │
│  │  https://meet.google.com/abc-defg-hij             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⏰ Important Reminders:                             │   │
│  │                                                     │   │
│  │ • Join a few minutes early to test your audio/     │   │
│  │   video                                            │   │
│  │ • Have your idea details ready to discuss          │   │
│  │ • Be prepared to answer questions about your idea  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  After the discussion, the mentor will review your idea    │
│  and provide feedback. If everything looks good, your      │
│  idea will be approved!                                    │
│                                                             │
│  [View Your Dashboard Button]                              │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  ClassForge - Idea Submission Portal                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Theme
- **Color**: Google Blue (#4285F4)
- **Tone**: Professional and helpful
- **Emojis**: 📞 ⏰
- **Key Feature**: Clickable "Join Google Meet" button

---

## Email 3: Idea Accepted Notification

### When Sent
When a mentor/teacher clicks "Accept" to approve the idea

### Recipient
Student who submitted the idea

### Subject Line
```
ClassForge - Your Idea Has Been Accepted! 🎊
```

### Email Content

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Congratulations! 🎉                                       │
│                                                             │
│  Your idea "[Idea Title]" has been ACCEPTED!              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ What Happens Now?                                  │   │
│  │                                                     │   │
│  │ • Your idea has been approved by the mentor        │   │
│  │ • You can now proceed with implementation          │   │
│  │ • Stay in touch with your mentor for guidance      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Thank you for your contribution to ClassForge!            │
│                                                             │
│  [View Your Dashboard Button]                              │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  ClassForge - Idea Submission Portal                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Theme
- **Color**: Green (#10B981)
- **Tone**: Celebratory and congratulatory
- **Emojis**: 🎉 🎊

---

## Email Template Specifications

### HTML Structure
All emails follow this structure:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <!-- Email content -->
  </div>
</div>
```

### Button Styling
```css
display: inline-block;
padding: 12px 24px;
background-color: [theme-color];
color: white;
text-decoration: none;
border-radius: 5px;
margin: 20px 0;
font-weight: 600;
```

### Color Scheme
- **Mentor Interest**: Blue (#3B82F6)
- **Meeting Link**: Google Blue (#4285F4)
- **Idea Accepted**: Green (#10B981)
- **Text**: Dark gray (#333333)
- **Secondary Text**: Medium gray (#666666)
- **Background**: Light gray (#f9fafb)

### Typography
- **Font Family**: Arial, sans-serif
- **Heading Size**: 24px, bold
- **Body Size**: 16px
- **Secondary Size**: 14px
- **Small Text**: 12px

### Responsive Design
- **Max Width**: 600px
- **Padding**: 20px (outer), 30px (inner)
- **Mobile Friendly**: Yes
- **Tested On**: Gmail, Outlook, Apple Mail

---

## Personalization Variables

### Mentor Interest Email
- `[Idea Title]` - Title of the submitted idea
- `[Mentor Name]` - Name of the mentor showing interest (in backend)

### Meeting Link Email
- `[Student Name]` - Full name of the student
- `[Mentor Name]` - Full name of the mentor
- `[Idea Title]` - Title of the idea
- `[Meeting Link]` - Google Meet URL

### Idea Accepted Email
- `[Idea Title]` - Title of the accepted idea
- `[Mentor Name]` - Name of the mentor (in backend)

---

## Email Delivery

### Service
- **Provider**: Gmail/SMTP
- **Configuration**: Via `.env` file
- **Credentials**: EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM

### Timing
- **Mentor Interest**: Immediate (within seconds)
- **Meeting Link**: Immediate (within seconds)
- **Idea Accepted**: Immediate (within seconds)

### Reliability
- ✅ Retry logic implemented
- ✅ Error logging enabled
- ✅ Fallback notifications in-app
- ✅ Socket.io real-time backup

---

## Testing Emails

### How to Test
1. Submit an idea as a student
2. Show interest as a mentor
3. Check student's email for notification
4. Arrange meeting and share link
5. Check student's email for meeting link
6. Accept idea
7. Check student's email for acceptance

### Expected Results
- All three emails should arrive
- All links should be clickable
- All formatting should be correct
- All personalization should be accurate

---

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify email address is correct
3. Check `.env` email credentials
4. Check server logs for errors
5. Verify SMTP is enabled

### Email Formatting Issues
1. Check email client compatibility
2. Try different email provider
3. Check HTML syntax
4. Verify CSS is inline
5. Test on mobile device

### Links Not Working
1. Verify FRONTEND_URL in `.env`
2. Check meeting link format
3. Verify URL encoding
4. Test link in browser
5. Check for special characters

---

## Best Practices

### For Students
- ✅ Check email regularly
- ✅ Add ClassForge to contacts
- ✅ Check spam folder
- ✅ Click links promptly
- ✅ Join meetings on time

### For Mentors
- ✅ Verify email addresses
- ✅ Use valid meeting links
- ✅ Send links promptly
- ✅ Follow up with students
- ✅ Keep records

### For Admins
- ✅ Monitor email delivery
- ✅ Check error logs
- ✅ Verify SMTP settings
- ✅ Test regularly
- ✅ Update templates as needed

---

## Future Enhancements

1. **Email Customization**
   - Allow custom email templates
   - Add institution branding
   - Support multiple languages

2. **Advanced Features**
   - Email scheduling
   - Reminder emails
   - Digest emails
   - Email preferences

3. **Analytics**
   - Track email opens
   - Track link clicks
   - Delivery reports
   - Engagement metrics

---

## Summary

Three professional email templates are sent at key stages:

1. **Mentor Interest** - Notifies student of mentor interest
2. **Meeting Link** - Provides clickable meeting link
3. **Idea Accepted** - Congratulates student on approval

All emails are:
- ✅ Professional and well-formatted
- ✅ Mobile responsive
- ✅ Personalized with student/mentor names
- ✅ Actionable with clear next steps
- ✅ Branded with ClassForge styling

---

**Last Updated**: February 2026
**Version**: 1.0
