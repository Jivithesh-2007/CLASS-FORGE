# Mentor-Idea Collaboration - Design Document

## Architecture Overview

This feature extends the existing idea submission system to enable mentor-student collaboration through a multi-stage workflow: interest expression → discussion → acceptance.

## Data Model Design

### 1. Idea Schema Extensions

```javascript
// Add to existing Idea model
{
  // ... existing fields ...
  
  // Mentor interest tracking
  interestedMentors: [{
    mentorId: ObjectId,
    mentorName: String,
    mentorEmail: String,
    showInterestAt: Date,
    _id: false
  }],
  
  // Acceptance tracking
  acceptedBy: {
    mentorId: ObjectId,
    mentorName: String,
    mentorEmail: String,
    acceptedAt: Date
  },
  
  // Discussion threads
  discussions: [{
    _id: ObjectId,
    mentorId: ObjectId,
    mentorName: String,
    mentorEmail: String,
    meetLink: String,
    createdAt: Date,
    updatedAt: Date,
    messages: [{
      sender: ObjectId,
      senderName: String,
      senderRole: String, // 'mentor' or 'student'
      content: String,
      timestamp: Date,
      _id: false
    }]
  }]
}
```

### 2. Notification Schema Extensions

New notification types:
- `mentor_interested` - Mentor showed interest in idea
- `mentor_message` - Mentor sent message in discussion
- `idea_accepted` - Idea accepted by mentor
- `idea_accepted_by_other` - Another mentor accepted the idea

## API Endpoints Design

### Mentor Endpoints

#### 1. Show Interest in Idea
```
POST /api/ideas/:ideaId/show-interest
Headers: Authorization: Bearer {token}
Response: { success: true, idea: {...} }
```
- Adds mentor to interestedMentors array
- Creates notification for student
- Emits Socket.io event to student room

#### 2. Withdraw Interest
```
DELETE /api/ideas/:ideaId/show-interest
Headers: Authorization: Bearer {token}
Response: { success: true }
```
- Removes mentor from interestedMentors array
- Only allowed if idea not yet accepted

#### 3. Send Message in Discussion
```
POST /api/ideas/:ideaId/discussions
Headers: Authorization: Bearer {token}
Body: { content: String, meetLink?: String }
Response: { success: true, discussion: {...} }
```
- Creates discussion if doesn't exist
- Adds message to discussion
- If meetLink provided, updates discussion meetLink
- Creates notification for student
- Emits Socket.io event

#### 4. Accept Idea
```
POST /api/ideas/:ideaId/accept
Headers: Authorization: Bearer {token}
Response: { success: true, idea: {...} }
```
- Sets acceptedBy field
- Only first mentor can accept
- Creates notifications for student and other interested mentors
- Emits Socket.io events

#### 5. Get Interested Ideas
```
GET /api/mentor/interested-ideas
Headers: Authorization: Bearer {token}
Query: ?page=1&limit=10&status=pending|accepted|all
Response: { ideas: [...], total: Number, page: Number }
```
- Returns ideas where mentor has shown interest
- Includes discussion count and acceptance status

#### 6. Get Accepted Ideas
```
GET /api/mentor/accepted-ideas
Headers: Authorization: Bearer {token}
Query: ?page=1&limit=10
Response: { ideas: [...], total: Number }
```
- Returns ideas accepted by mentor
- Includes student info and discussion history

### Student Endpoints

#### 1. Get Interested Mentors
```
GET /api/ideas/:ideaId/interested-mentors
Headers: Authorization: Bearer {token}
Response: { mentors: [...], total: Number }
```
- Returns list of mentors who showed interest
- Includes mentor details and interest timestamp

#### 2. Get Discussions
```
GET /api/ideas/:ideaId/discussions
Headers: Authorization: Bearer {token}
Response: { discussions: [...] }
```
- Returns all discussions for the idea
- Includes messages and Meet links

#### 3. Get Accepted Ideas
```
GET /api/student/accepted-ideas
Headers: Authorization: Bearer {token}
Response: { ideas: [...], total: Number }
```
- Returns ideas accepted by mentors
- Includes mentor info and discussion history

## Frontend Components Design

### Mentor Dashboard Components

#### 1. InterestedIdeasSection
- Displays ideas mentor has shown interest in
- Shows: idea title, student name, domain, interest date
- Actions: View details, withdraw interest
- Filters: All, Pending, Accepted

#### 2. AcceptedIdeasSection
- Displays ideas mentor has accepted
- Shows: idea title, student name, acceptance date
- Actions: View details, access discussions
- Includes discussion history

#### 3. DiscussionPanel
- Shows messages between mentor and student
- Input field for new messages
- Meet link display and generation
- "Accept Idea" button (if not yet accepted)

### Student Dashboard Components

#### 1. InterestedMentorsWidget
- Shows mentors interested in the idea
- Displays: mentor name, department, interest date
- Badge showing count of interested mentors

#### 2. DiscussionsWidget
- Shows all discussions for the idea
- Displays: mentor name, last message, Meet link
- Expandable to show full discussion thread

#### 3. AcceptanceStatus
- Shows if idea has been accepted
- Displays: mentor name, acceptance date
- Highlighted/special styling for accepted ideas

## Correctness Properties

### Property 1: Interest Uniqueness
**Validates: Requirement 2.2**
- For any idea, a mentor can only appear once in interestedMentors array
- Attempting to show interest twice should be idempotent (no duplicate entries)

### Property 2: Single Acceptance
**Validates: Requirement 4.2**
- An idea can only be accepted by one mentor
- Once acceptedBy is set, no other mentor can accept it
- Attempting to accept an already-accepted idea should fail

### Property 3: Notification Delivery
**Validates: Requirements 2.3, 3.3, 4.4**
- When mentor shows interest, student receives notification
- When mentor sends message, student receives notification
- When mentor accepts idea, student receives notification
- Notifications are created before Socket.io emission

### Property 4: Discussion Isolation
**Validates: Requirement 3.6**
- Each mentor has separate discussion thread with student
- Messages in one discussion don't appear in another
- Meet links are specific to each discussion

### Property 5: State Consistency
**Validates: Requirement 4.3**
- When idea is accepted, status field is updated
- acceptedBy field is populated
- Idea appears in both mentor's and student's accepted lists

### Property 6: Permission Enforcement
**Validates: Security**
- Only teachers can show interest, send messages, accept ideas
- Only idea author can view interested mentors and discussions
- Only mentors can accept ideas
- Mentors can only withdraw interest from their own interests

## Implementation Phases

### Phase 1: Backend Foundation
1. Update Idea schema with new fields
2. Implement show-interest endpoint
3. Implement withdraw-interest endpoint
4. Create notification system for interest

### Phase 2: Discussion System
1. Implement send-message endpoint
2. Implement meet-link update
3. Create discussion notifications
4. Add Socket.io events for real-time updates

### Phase 3: Acceptance Flow
1. Implement accept-idea endpoint
2. Add acceptance validation (single mentor only)
3. Create acceptance notifications
4. Update idea status

### Phase 4: Mentor Dashboard
1. Create InterestedIdeasSection component
2. Create AcceptedIdeasSection component
3. Create DiscussionPanel component
4. Integrate with TeacherDashboard

### Phase 5: Student Dashboard
1. Create InterestedMentorsWidget component
2. Create DiscussionsWidget component
3. Create AcceptanceStatus component
4. Integrate with StudentDashboard

### Phase 6: Testing & Polish
1. Write unit tests for endpoints
2. Write integration tests for workflows
3. Test Socket.io real-time updates
4. Performance optimization

## Technology Stack

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Socket.io client
- **Real-time**: Socket.io for notifications and discussions
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens

## Security Considerations

1. **Authorization**: Verify user role and ownership before allowing actions
2. **Input Validation**: Sanitize all message content
3. **Rate Limiting**: Limit message frequency to prevent spam
4. **Data Privacy**: Ensure students can only see their own ideas' discussions
5. **Idempotency**: Show-interest should be idempotent

## Performance Considerations

1. **Indexing**: Add indexes on mentorId, studentId, ideaId for queries
2. **Pagination**: Implement pagination for interested/accepted ideas lists
3. **Caching**: Cache mentor and student lists for ideas
4. **Socket.io Rooms**: Use specific rooms for idea discussions to limit broadcast scope

## Error Handling

1. **Duplicate Interest**: Return 409 if mentor already interested
2. **Already Accepted**: Return 400 if trying to accept already-accepted idea
3. **Permission Denied**: Return 403 if user lacks required role
4. **Not Found**: Return 404 if idea doesn't exist
5. **Validation Error**: Return 400 for invalid input

