# Mentor Collaboration Feature - Implementation Plan

## Overview
Complete mentor-student collaboration workflow with notifications, emails, and Google Meet integration.

## Feature Flow

### 1. Student Submits Idea
- Student submits idea via SubmitIdea page
- **Backend Actions:**
  - Create idea in database
  - Send notification to all teachers/mentors
  - Send email to all teachers/mentors
  - Emit socket event to notify mentors in real-time

### 2. Mentor Shows Interest
- Mentor clicks "Show Interest" button on idea
- **Backend Actions:**
  - Create mentor interest record
  - Send notification to student
  - Send email to student: "Mentor [Name] is interested in your idea"
  - Emit socket event to student

### 3. Mentor Initiates Meeting
- Mentor generates Google Meet link
- Mentor sends meeting link to student
- **Backend Actions:**
  - Create discussion record with meet link
  - Send notification to student with meet link
  - Send email to student with meet link
  - Emit socket event to student

### 4. Mentor Accepts Idea
- After meeting/discussion, mentor clicks "Accept"
- **Backend Actions:**
  - Update idea status to "accepted"
  - Create acceptance record with mentor info
  - Send notification to student
  - Send email to student: "Your idea has been accepted by [Mentor]"
  - Emit socket event to student
  - Update student dashboard to show accepted idea

## Database Schema Updates

### MentorInterest Collection
```javascript
{
  _id: ObjectId,
  ideaId: ObjectId,
  mentorId: ObjectId,
  mentorName: String,
  mentorEmail: String,
  timestamp: Date,
  status: 'interested' | 'withdrawn'
}
```

### Discussion Collection
```javascript
{
  _id: ObjectId,
  ideaId: ObjectId,
  mentorId: ObjectId,
  studentId: ObjectId,
  meetLink: String,
  messages: [{
    sender: ObjectId,
    senderName: String,
    content: String,
    timestamp: Date
  }],
  createdAt: Date
}
```

### Idea Schema Updates
```javascript
{
  // ... existing fields
  acceptedBy: {
    mentorId: ObjectId,
    mentorName: String,
    mentorEmail: String,
    acceptedAt: Date
  },
  interestedMentors: [ObjectId],
  discussions: [ObjectId]
}
```

## API Endpoints Required

### Mentor Interest
- `POST /api/ideas/:ideaId/show-interest` - Mentor shows interest
- `POST /api/ideas/:ideaId/withdraw-interest` - Mentor withdraws interest
- `GET /api/ideas/:ideaId/interested-mentors` - Get interested mentors

### Discussions
- `POST /api/ideas/:ideaId/discussions` - Create discussion with meet link
- `GET /api/ideas/:ideaId/discussions` - Get discussions
- `POST /api/ideas/:ideaId/discussions/:discussionId/messages` - Add message

### Acceptance
- `POST /api/ideas/:ideaId/accept` - Mentor accepts idea
- `GET /api/ideas/:ideaId/acceptance-status` - Get acceptance status

## Notification Types

### For Students
1. **Mentor Interested**: "Mentor [Name] is interested in your idea"
2. **Meeting Scheduled**: "Mentor [Name] scheduled a meeting - [Meet Link]"
3. **Idea Accepted**: "Your idea has been accepted by Mentor [Name]"

### For Mentors/Teachers
1. **New Idea Submitted**: "New idea submitted: [Title]"
2. **Student Accepted Meeting**: "Student accepted your meeting invitation"

## Email Templates

### Student Notifications
1. **Mentor Interest Email**
   - Subject: "Mentor [Name] is interested in your idea!"
   - Body: Details about mentor + link to view

2. **Meeting Scheduled Email**
   - Subject: "Meeting scheduled for your idea"
   - Body: Meeting time + Google Meet link

3. **Idea Accepted Email**
   - Subject: "Congratulations! Your idea has been accepted"
   - Body: Mentor details + next steps

### Mentor Notifications
1. **New Idea Email**
   - Subject: "New idea submitted in your domain"
   - Body: Idea details + link to review

## Frontend Components to Update

### TeacherDashboard
- Add "Show Interest" button to idea cards
- Add "Accept" button after discussion
- Display interested status

### StudentDashboard
- Show mentor interest notifications
- Display meeting links
- Show acceptance status

### IdeaDetailModal
- Add mentor interest section
- Add discussion/meeting section
- Add acceptance status

## Implementation Steps

1. ✅ Create backend API endpoints
2. ✅ Update database schemas
3. ✅ Implement notification system
4. ✅ Implement email system
5. ✅ Update frontend components
6. ✅ Add Google Meet integration
7. ✅ Test complete workflow

## Status
- [ ] Backend API endpoints
- [ ] Database updates
- [ ] Notification system
- [ ] Email system
- [ ] Frontend updates
- [ ] Google Meet integration
- [ ] Testing
