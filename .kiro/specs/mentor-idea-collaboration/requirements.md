# Mentor-Student Idea Collaboration Feature

## Overview
Enable teachers (mentors) to discover, express interest in, and collaborate with students on submitted ideas. Mentors can initiate discussions via Google Meet links and accept ideas they're interested in.

## User Stories

### 1. Idea Submission Notification
**As a** teacher/mentor  
**I want to** receive a notification when a student submits a new idea  
**So that** I can review and potentially collaborate on it

**Acceptance Criteria:**
- 1.1 When a student submits an idea, all teachers receive a notification
- 1.2 Notification includes: idea title, student name, domain, brief description
- 1.3 Notification appears in the notification panel and dashboard
- 1.4 Notification is marked as read when teacher views it
- 1.5 Teachers can navigate to the idea from the notification

### 2. Show Interest in Idea
**As a** mentor  
**I want to** express interest in an idea  
**So that** the student knows I'm interested in collaborating

**Acceptance Criteria:**
- 2.1 Mentor can click "Show Interest" button on an idea
- 2.2 Multiple mentors can show interest in the same idea
- 2.3 Student receives notification when a mentor shows interest
- 2.4 Mentor's interest is tracked and visible to the student
- 2.5 Mentor can view list of ideas they've shown interest in

### 3. Contact Student & Schedule Discussion
**As a** mentor  
**I want to** contact the student and schedule a Google Meet discussion  
**So that** we can discuss the idea in detail

**Acceptance Criteria:**
- 3.1 Mentor can send a message to the student from the idea detail view
- 3.2 Mentor can generate/add a Google Meet link for discussion
- 3.3 Student receives notification of mentor's message and Meet link
- 3.4 Meet link is stored and accessible to both mentor and student
- 3.5 Discussion history is maintained for reference
- 3.6 Multiple mentors can have separate discussions with the same student

### 4. Accept Idea
**As a** mentor  
**I want to** accept an idea after discussion  
**So that** the collaboration is formalized

**Acceptance Criteria:**
- 4.1 Mentor can click "Accept Idea" button after discussion
- 4.2 Only one mentor can accept an idea (first to accept wins)
- 4.3 Idea status changes to "accepted" with mentor name
- 4.4 Student receives notification that their idea was accepted
- 4.5 Other interested mentors are notified that idea was accepted
- 4.6 Accepted idea appears in student's "Accepted Ideas" section
- 4.7 Accepted idea appears in mentor's "Accepted Ideas" section

### 5. Student Dashboard Reflection
**As a** student  
**I want to** see mentor interest and acceptance status on my dashboard  
**So that** I can track collaboration progress

**Acceptance Criteria:**
- 5.1 Student can see which mentors are interested in their idea
- 5.2 Student can see discussion messages and Meet links from mentors
- 5.3 Student can see if idea has been accepted and by which mentor
- 5.4 Accepted ideas are highlighted/marked differently
- 5.5 Student receives notifications for all mentor interactions

### 6. Mentor Dashboard
**As a** mentor  
**I want to** see all ideas I'm interested in and have accepted  
**So that** I can manage my collaborations

**Acceptance Criteria:**
- 6.1 Mentor has "Interested Ideas" section showing ideas they've shown interest in
- 6.2 Mentor has "Accepted Ideas" section showing ideas they've accepted
- 6.3 Mentor can view discussion history with each student
- 6.4 Mentor can access Meet links from their dashboard
- 6.5 Mentor can withdraw interest before accepting

## Data Model Changes

### Idea Schema Updates
```
- interestedMentors: [{ mentorId, mentorName, timestamp }]
- acceptedBy: { mentorId, mentorName, timestamp }
- discussions: [{
    mentorId,
    mentorName,
    messages: [{ sender, content, timestamp }],
    meetLink: string,
    createdAt
  }]
```

### Notification Types
- `idea_submitted` - New idea submitted (to all teachers)
- `mentor_interested` - Mentor showed interest (to student)
- `mentor_message` - Mentor sent message (to student)
- `idea_accepted` - Idea accepted by mentor (to student)
- `idea_accepted_by_other` - Another mentor accepted idea (to interested mentors)

## API Endpoints Required

### Mentor Actions
- `POST /api/ideas/:ideaId/show-interest` - Show interest in idea
- `POST /api/ideas/:ideaId/withdraw-interest` - Withdraw interest
- `POST /api/ideas/:ideaId/discussions` - Create/send message in discussion
- `PUT /api/ideas/:ideaId/discussions/:discussionId/meet-link` - Add Meet link
- `POST /api/ideas/:ideaId/accept` - Accept idea
- `GET /api/mentor/interested-ideas` - Get mentor's interested ideas
- `GET /api/mentor/accepted-ideas` - Get mentor's accepted ideas

### Student Actions
- `GET /api/ideas/:ideaId/interested-mentors` - Get list of interested mentors
- `GET /api/ideas/:ideaId/discussions` - Get all discussions
- `GET /api/student/accepted-ideas` - Get student's accepted ideas

## UI Components Needed

### Mentor Side
- "Show Interest" button on idea cards
- "Interested Ideas" section in dashboard
- "Accepted Ideas" section in dashboard
- Discussion panel with messaging and Meet link
- "Accept Idea" button in discussion

### Student Side
- "Interested Mentors" badge/section on idea
- "Discussions" section showing mentor messages and Meet links
- "Accepted" status indicator
- Notification for mentor interactions

## Implementation Priority
1. Backend: Notification system for idea submission
2. Backend: Show interest functionality
3. Backend: Discussion/messaging system
4. Backend: Accept idea functionality
5. Frontend: Mentor dashboard sections
6. Frontend: Student idea detail enhancements
7. Frontend: Notification handling
