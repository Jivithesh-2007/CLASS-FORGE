# Mentor-Idea Collaboration - Implementation Tasks

## Phase 1: Backend Foundation

- [ ] 1.1 Update Idea schema with interestedMentors, acceptedBy, and discussions fields
- [ ] 1.2 Create show-interest endpoint (POST /api/ideas/:ideaId/show-interest)
- [ ] 1.3 Create withdraw-interest endpoint (DELETE /api/ideas/:ideaId/show-interest)
- [ ] 1.4 Add notification creation for interest events
- [ ] 1.5 Add Socket.io emission for interest notifications

## Phase 2: Discussion System

- [ ] 2.1 Create send-message endpoint (POST /api/ideas/:ideaId/discussions)
- [ ] 2.2 Implement meet-link update in discussion
- [ ] 2.3 Create notification system for messages
- [ ] 2.4 Add Socket.io events for real-time message updates
- [ ] 2.5 Implement get-discussions endpoint (GET /api/ideas/:ideaId/discussions)

## Phase 3: Acceptance Flow

- [ ] 3.1 Create accept-idea endpoint (POST /api/ideas/:ideaId/accept)
- [ ] 3.2 Implement single-mentor acceptance validation
- [ ] 3.3 Update idea status to "accepted" on acceptance
- [ ] 3.4 Create acceptance notifications for student and other mentors
- [ ] 3.5 Add Socket.io events for acceptance

## Phase 4: Mentor Query Endpoints

- [ ] 4.1 Create get-interested-ideas endpoint (GET /api/mentor/interested-ideas)
- [ ] 4.2 Create get-accepted-ideas endpoint (GET /api/mentor/accepted-ideas)
- [ ] 4.3 Add pagination and filtering support
- [ ] 4.4 Implement proper authorization checks

## Phase 5: Student Query Endpoints

- [ ] 5.1 Create get-interested-mentors endpoint (GET /api/ideas/:ideaId/interested-mentors)
- [ ] 5.2 Create get-accepted-ideas endpoint (GET /api/student/accepted-ideas)
- [ ] 5.3 Add proper authorization checks
- [ ] 5.4 Implement pagination support

## Phase 6: Mentor Dashboard Frontend

- [ ] 6.1 Create InterestedIdeasSection component
- [ ] 6.2 Create AcceptedIdeasSection component
- [ ] 6.3 Create DiscussionPanel component with messaging
- [ ] 6.4 Integrate sections into TeacherDashboard
- [ ] 6.5 Add Socket.io listeners for real-time updates

## Phase 7: Student Dashboard Frontend

- [ ] 7.1 Create InterestedMentorsWidget component
- [ ] 7.2 Create DiscussionsWidget component
- [ ] 7.3 Create AcceptanceStatus component
- [ ] 7.4 Integrate widgets into StudentDashboard
- [ ] 7.5 Add Socket.io listeners for notifications

## Phase 8: Testing & Polish

- [ ] 8.1 Write unit tests for show-interest endpoint
- [ ] 8.2 Write unit tests for accept-idea endpoint
- [ ] 8.3 Write integration tests for discussion workflow
- [ ] 8.4 Test Socket.io real-time updates
- [ ] 8.5 Performance testing and optimization
- [ ] 8.6 Security review and fixes
- [ ] 8.7 UI/UX polish and refinement

