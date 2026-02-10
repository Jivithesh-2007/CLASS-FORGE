# Mentor Collaboration Workflow - Complete Guide

## Overview
This document explains the complete workflow for mentor-student collaboration on ideas, including interest expression, meeting arrangement, and idea approval.

---

## Workflow Steps

### Step 1: Student Submits Idea
**Location**: Student Dashboard → Submit Idea

1. Student fills out idea form with:
   - Title
   - Description
   - Domain/Category
   - Tags
   - Attachments/Images

2. Student clicks "Submit Idea"

3. **Backend Actions**:
   - Idea is created with status: `pending`
   - Idea appears in Teacher/Admin dashboards
   - Notifications sent to all teachers/admins

4. **Frontend Updates**:
   - Idea appears in Student Dashboard
   - Idea appears in Teacher Dashboard (Recent Ideas section)
   - Idea appears in Admin Dashboard (Recent Ideas section)

---

### Step 2: Mentor Shows Interest
**Location**: Teacher/Admin Dashboard → Idea Card → Show Interest

1. Teacher/Admin views pending ideas in their dashboard

2. Teacher/Admin clicks "Show Interest" button on idea card

3. **Backend Actions**:
   - Mentor added to `interestedMentors` array
   - Discussion thread created for this mentor
   - Notification created for student
   - **Email sent to student** with subject:
     ```
     "ClassForge - Mentor Interested in Your Idea: [Idea Title]"
     ```
   - Email includes:
     - Mentor name
     - Idea title
     - What happens next (meeting arrangement)
     - Link to dashboard
   - Real-time socket notification sent

4. **Frontend Updates**:
   - Button changes to "Withdraw Interest"
   - "Arrange Meeting" button appears
   - Mentor appears in interested mentors list

5. **Student Receives**:
   - In-app notification
   - Email notification
   - Real-time socket notification

---

### Step 3: Mentor Arranges Meeting
**Location**: Teacher/Admin Dashboard → Idea Card → Arrange Meeting

1. Mentor clicks "Arrange Meeting" button

2. Modal opens with two steps:
   - **Step 1**: Click "Open Google Meet" button
     - Opens Google Meet in new tab
     - Mentor creates new meeting
   - **Step 2**: Copy meeting link and paste it
     - Mentor copies link from Google Meet
     - Pastes link in input field
     - Clicks "Send Meeting Link"

3. **Backend Actions**:
   - Meeting link stored in database
   - Notification created for student
   - **Professional email sent to student** with subject:
     ```
     "ClassForge - Meeting Link for Your Idea: [Idea Title]"
     ```
   - Email includes:
     - Mentor name
     - Idea title
     - **Clickable "Join Google Meet" button**
     - Meeting link (copyable)
     - Reminders (join early, prepare details, etc.)
     - Link to dashboard
   - Real-time socket notification sent

4. **Frontend Updates**:
   - Modal closes
   - Success message shown
   - Meeting link displayed in idea details

5. **Student Receives**:
   - In-app notification
   - **Professional email with meeting link**
   - Real-time socket notification
   - Can click link to join meeting

---

### Step 4: Meeting Discussion
**Location**: Google Meet (external)

1. Student joins Google Meet using link from email
2. Mentor and student discuss the idea
3. Mentor provides feedback and suggestions
4. Student answers questions about the idea

---

### Step 5: Mentor Approves Idea
**Location**: Teacher/Admin Dashboard → Idea Card → Accept (after discussion)

1. After meeting, mentor clicks "Accept" button

2. **Backend Actions**:
   - Idea status changed to: `accepted`
   - Mentor info stored in `acceptedBy` field
   - Notification created for student
   - **Congratulations email sent to student** with subject:
     ```
     "ClassForge - Your Idea Has Been Accepted! 🎊"
     ```
   - Email includes:
     - Congratulations message
     - Idea title
     - Mentor name
     - What happens next
     - Link to dashboard
   - Real-time socket notification sent

3. **Frontend Updates**:
   - Idea status changes to "Accepted"
   - Idea moves to "Accepted Ideas" section
   - Mentor name displayed as approver

4. **Student Receives**:
   - In-app notification
   - **Congratulations email**
   - Real-time socket notification
   - Idea appears in "Accepted Ideas" section

---

## Email Notifications Summary

### 1. Mentor Interest Email
- **Trigger**: When mentor clicks "Show Interest"
- **Recipient**: Student
- **Subject**: "ClassForge - Mentor Interested in Your Idea: [Title]"
- **Content**:
  - Mentor name
  - Idea title
  - What's next (meeting arrangement)
  - Dashboard link
- **Color Theme**: Blue (#3B82F6)

### 2. Meeting Link Email
- **Trigger**: When mentor shares Google Meet link
- **Recipient**: Student
- **Subject**: "ClassForge - Meeting Link for Your Idea: [Title]"
- **Content**:
  - Mentor name
  - Idea title
  - **Clickable "Join Google Meet" button**
  - Meeting link (copyable)
  - Reminders (join early, prepare, etc.)
  - Dashboard link
- **Color Theme**: Google Blue (#4285F4)

### 3. Idea Accepted Email
- **Trigger**: When mentor clicks "Accept"
- **Recipient**: Student
- **Subject**: "ClassForge - Your Idea Has Been Accepted! 🎊"
- **Content**:
  - Congratulations message
  - Idea title
  - Mentor name
  - What happens next
  - Dashboard link
- **Color Theme**: Green (#10B981)

---

## Database Schema

### Idea Model - Relevant Fields

```javascript
{
  // ... other fields ...
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'merged', 'accepted'],
    default: 'pending'
  },
  
  interestedMentors: [
    {
      type: ObjectId,
      ref: 'User'
    }
  ],
  
  acceptedBy: {
    mentorId: ObjectId,
    mentorName: String,
    mentorEmail: String,
    acceptedAt: Date,
    meetLink: String
  },
  
  discussions: [
    {
      _id: ObjectId,
      mentorId: ObjectId,
      mentorName: String,
      messages: [
        {
          content: String,
          sentBy: ObjectId,
          senderName: String,
          createdAt: Date
        }
      ],
      meetLink: String,
      createdAt: Date
    }
  ]
}
```

---

## API Endpoints

### 1. Show Interest
```
POST /api/ideas/:ideaId/show-interest
Authorization: Bearer <token>
```
**Response**:
```json
{
  "success": true,
  "message": "Interest shown successfully",
  "idea": { ... }
}
```

### 2. Withdraw Interest
```
POST /api/ideas/:ideaId/withdraw-interest
Authorization: Bearer <token>
```

### 3. Get Interested Mentors
```
GET /api/ideas/:ideaId/interested-mentors
Authorization: Bearer <token>
```
**Response**:
```json
{
  "success": true,
  "interestedMentors": [
    {
      "mentorId": "...",
      "mentorName": "...",
      "mentorEmail": "..."
    }
  ]
}
```

### 4. Share Meeting Link
```
POST /api/ideas/:ideaId/share-meet-link
Authorization: Bearer <token>
Content-Type: application/json

{
  "meetLink": "https://meet.google.com/abc-defg-hij"
}
```

### 5. Accept Idea
```
POST /api/ideas/:ideaId/accept
Authorization: Bearer <token>
Content-Type: application/json

{
  "meetLink": "https://meet.google.com/abc-defg-hij"
}
```

---

## Frontend Components

### MentorInterestPanel
- **Location**: `frontend/src/components/MentorInterestPanel/MentorInterestPanel.jsx`
- **Features**:
  - Show/Withdraw Interest button
  - Arrange Meeting button
  - Meeting link modal
  - Interested mentors list
  - Google Meet integration

### IdeaDetailModal
- **Location**: `frontend/src/components/IdeaDetailModal/IdeaDetailModal.jsx`
- **Features**:
  - Displays idea details
  - Integrates MentorInterestPanel
  - Shows comments
  - Shows mentor interest status

---

## Notification System

### Notification Types
1. `mentor_interested` - Mentor showed interest
2. `meet_link_shared` - Meeting link shared
3. `idea_accepted` - Idea accepted by mentor

### Notification Delivery
- ✅ In-app notifications (database)
- ✅ Real-time socket notifications
- ✅ Email notifications

---

## Testing Checklist

- [ ] Student submits idea
- [ ] Idea appears in Teacher Dashboard
- [ ] Idea appears in Admin Dashboard
- [ ] Teacher clicks "Show Interest"
- [ ] Student receives notification + email
- [ ] Teacher clicks "Arrange Meeting"
- [ ] Teacher creates Google Meet
- [ ] Teacher shares meeting link
- [ ] Student receives meeting link email
- [ ] Student can click link to join meeting
- [ ] Teacher clicks "Accept"
- [ ] Student receives acceptance email
- [ ] Idea status changes to "accepted"
- [ ] All emails are properly formatted
- [ ] All notifications appear in real-time

---

## Troubleshooting

### Email Not Sending
1. Check `.env` file for email credentials
2. Verify `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`
3. Check email service logs
4. Ensure SMTP is enabled for email account

### Meeting Link Not Shared
1. Verify mentor is logged in
2. Check if idea exists
3. Verify meeting link format
4. Check browser console for errors

### Notifications Not Appearing
1. Check Socket.io connection
2. Verify user is logged in
3. Check browser console for errors
4. Verify notification recipient ID

---

## Future Enhancements

1. **Automatic Meeting Generation**
   - Generate Google Meet links automatically
   - No need to copy-paste

2. **Meeting Reminders**
   - Send reminder emails before meeting
   - Automatic reminders 1 hour before

3. **Meeting Recording**
   - Store meeting recordings
   - Share recordings with student

4. **Feedback Form**
   - Post-meeting feedback form
   - Mentor provides structured feedback

5. **Multiple Mentors**
   - Allow multiple mentors to collaborate
   - Shared discussion threads

---

## Summary

The mentor collaboration workflow provides a complete system for:
1. ✅ Mentors to express interest in ideas
2. ✅ Arranging Google Meet meetings
3. ✅ Professional email notifications at each step
4. ✅ Real-time in-app notifications
5. ✅ Idea approval after discussion
6. ✅ Complete audit trail of interactions

All components are fully implemented and ready to use!
