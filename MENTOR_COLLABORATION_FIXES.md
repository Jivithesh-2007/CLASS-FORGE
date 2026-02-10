# Mentor Collaboration Feature - Complete Fix

## Issues Fixed

### 1. **Database Model** ✅
Updated `backend/models/Idea.js` to include:
- `interestedMentors[]` - Array of mentor IDs who showed interest
- `acceptedBy` - Object storing mentor acceptance info with meet link
- `discussions[]` - Array of discussion threads with messages and meet links

### 2. **Backend Controllers** ✅
Added 5 new functions to `backend/controllers/ideaController.js`:

#### `getMentorInterestedIdeas()`
- Fetches all ideas where the mentor has shown interest
- Returns: `{ success: true, ideas: [...] }`
- Route: `GET /api/ideas/mentor/interested-ideas`

#### `getMentorAcceptedIdeas()`
- Fetches all ideas accepted by the mentor
- Returns: `{ success: true, ideas: [...] }`
- Route: `GET /api/ideas/mentor/accepted-ideas`

#### `getDiscussions()`
- Retrieves all discussions for an idea
- Returns: `{ success: true, discussions: [...] }`
- Route: `GET /api/ideas/:ideaId/discussions`

#### `addDiscussionMessage()`
- Mentor sends a message to student about an idea
- Creates discussion thread if it doesn't exist
- Emits socket notification to student
- Returns: `{ success: true, discussion: {...} }`
- Route: `POST /api/ideas/:ideaId/discussions`

#### `addMeetLink()`
- Mentor adds Google Meet link to discussion
- Emits socket notification to student
- Returns: `{ success: true, discussion: {...} }`
- Route: `PUT /api/ideas/:ideaId/discussions/:discussionId/meet-link`

### 3. **Backend Routes** ✅
Updated `backend/routes/ideaRoutes.js`:
- Added mentor dashboard routes (before `:id` routes to prevent conflicts)
- Added discussion management routes
- Properly ordered routes for correct matching

### 4. **Frontend Components** ✅

#### MentorInterestPanel.jsx
- Fetches discussions from `/api/ideas/:ideaId/discussions`
- Displays mentor interest status
- Shows discussion threads with messages
- Displays meet links

#### InterestedIdeas.jsx
- Fetches interested ideas from `/api/ideas/mentor/interested-ideas`
- Allows mentor to send messages to students
- Allows mentor to add Google Meet links
- Allows mentor to accept ideas

#### AcceptedIdeas.jsx
- Fetches accepted ideas from `/api/ideas/mentor/accepted-ideas`
- Displays discussion history
- Shows meet links for each discussion

## Complete Mentor Workflow

### 1. **Show Interest**
- Mentor browses ideas in Ideas page
- Clicks on idea to open detail modal
- Clicks "Show Interest" button in MentorInterestPanel
- Endpoint: `POST /api/ideas/:ideaId/show-interest`

### 2. **View Interested Ideas**
- Mentor goes to "Interested Ideas" tab
- Sees all ideas they've shown interest in
- Endpoint: `GET /api/ideas/mentor/interested-ideas`

### 3. **Send Messages**
- Mentor clicks "View Details" on an interested idea
- Types message in discussion section
- Clicks "Send Message"
- Endpoint: `POST /api/ideas/:ideaId/discussions`
- Student receives socket notification

### 4. **Arrange Meeting**
- Mentor adds Google Meet link in discussion
- Clicks "Add Meet Link"
- Endpoint: `PUT /api/ideas/:ideaId/discussions/:discussionId/meet-link`
- Student receives socket notification with meet link

### 5. **Accept Idea**
- Mentor clicks "Accept Idea" button
- Idea status changes to "accepted"
- Endpoint: `POST /api/ideas/:ideaId/accept`
- Student receives notification

### 6. **View Accepted Ideas**
- Mentor goes to "Accepted Ideas" tab
- Sees all ideas they've accepted
- Can view discussion history and meet links
- Endpoint: `GET /api/ideas/mentor/accepted-ideas`

## Data Flow

```
Mentor Shows Interest
  ↓
Idea.interestedMentors[] += mentorId
  ↓
Mentor Sends Message
  ↓
Idea.discussions[] += { mentorId, messages: [...] }
  ↓
Mentor Adds Meet Link
  ↓
Idea.discussions[].meetLink = "https://meet.google.com/..."
  ↓
Mentor Accepts Idea
  ↓
Idea.acceptedBy = { mentorId, mentorName, meetLink, acceptedAt }
```

## Testing Checklist

- [ ] Mentor can show interest in ideas
- [ ] Mentor can see interested ideas in dashboard
- [ ] Mentor can send messages to students
- [ ] Student receives message notifications
- [ ] Mentor can add Google Meet links
- [ ] Student can see meet links
- [ ] Mentor can accept ideas
- [ ] Mentor can see accepted ideas
- [ ] Discussion history displays correctly
- [ ] Socket notifications work for all events

## Files Modified

1. `backend/models/Idea.js` - Added schema fields
2. `backend/controllers/ideaController.js` - Added 5 new functions
3. `backend/routes/ideaRoutes.js` - Added 7 new routes
4. `frontend/src/components/MentorInterestPanel/MentorInterestPanel.jsx` - Updated
5. `frontend/src/pages/TeacherDashboard/InterestedIdeas.jsx` - Updated
6. `frontend/src/pages/TeacherDashboard/AcceptedIdeas.jsx` - Already correct

## API Endpoints Summary

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/api/ideas/:ideaId/show-interest` | teacher/admin | Show interest in idea |
| POST | `/api/ideas/:ideaId/withdraw-interest` | teacher/admin | Withdraw interest |
| GET | `/api/ideas/:ideaId/interested-mentors` | all | Get interested mentors |
| POST | `/api/ideas/:ideaId/accept` | teacher/admin | Accept idea |
| GET | `/api/ideas/:ideaId/discussions` | all | Get discussions |
| POST | `/api/ideas/:ideaId/discussions` | teacher/admin | Add message |
| PUT | `/api/ideas/:ideaId/discussions/:discussionId/meet-link` | teacher/admin | Add meet link |
| GET | `/api/ideas/mentor/interested-ideas` | teacher/admin | Get interested ideas |
| GET | `/api/ideas/mentor/accepted-ideas` | teacher/admin | Get accepted ideas |
