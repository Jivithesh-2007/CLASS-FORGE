# Mentor Google Meet Link Sharing - Complete Workflow

## Overview
Teachers/Mentors can now share Google Meet links directly with students through the MentorInterestPanel. When a meet link is shared, the student receives:
1. **Email notification** with the meet link
2. **Website notification** in real-time via socket

## Complete Workflow

### Step 1: Teacher Shows Interest in an Idea
1. Teacher navigates to **Ideas** page
2. Clicks on an idea to open the detail modal
3. In the **Mentor Interest Panel**, clicks **"Show Interest"** button
4. Status changes to "Withdraw Interest" (indicating interest is shown)

### Step 2: Teacher Shares Google Meet Link
1. After showing interest, a new section appears: **"Share Meeting Link"**
2. Teacher pastes their Google Meet link in the input field
   - Example: `https://meet.google.com/abc-defg-hij`
3. Clicks **"Share Link"** button
4. System automatically:
   - Saves the meet link to the discussion
   - Sends email to student with the meet link
   - Sends real-time socket notification to student
   - Displays success message

### Step 3: Student Receives Notifications

#### Email Notification
- **Subject**: "Meeting Link: [Idea Title]"
- **Content**: 
  - Mentor name
  - Idea title
  - Clickable "Join Google Meet" button
  - Direct meet link URL
- **Sent to**: Student's registered email

#### Website Notification
- Real-time notification appears in the notification panel
- Shows mentor name and idea title
- Notification type: "meet_link_shared"

### Step 4: Student Views Meet Link
1. Student opens the idea detail modal
2. In **Mentor Interest Panel**, sees the discussion with the meet link
3. Clicks **"Join Google Meet"** button to join the meeting
4. Can view all messages and meet links in the discussion history

## Technical Implementation

### Frontend Components

#### MentorInterestPanel.jsx
**New Features:**
- Show Interest button (for teachers only)
- Meet Link sharing form (appears after showing interest)
- Discussion threads with expandable messages
- Meet link display with direct join button

**Key Functions:**
```javascript
handleShowInterest()      // Show interest in idea
handleWithdrawInterest()  // Withdraw interest
handleShareMeetLink()     // Share Google Meet link
```

**State Management:**
- `isInterested` - Whether mentor has shown interest
- `meetLink` - Current meet link input value
- `discussions` - Array of discussion threads
- `expandedDiscussion` - Currently expanded discussion ID

### Backend Endpoints

#### POST `/api/ideas/:ideaId/show-interest`
- **Role**: teacher, admin
- **Purpose**: Show interest in an idea
- **Response**: Updated idea with mentor added to interestedMentors

#### PUT `/api/ideas/:ideaId/discussions/:discussionId/meet-link`
- **Role**: teacher, admin
- **Purpose**: Share Google Meet link
- **Body**: `{ meetLink: "https://meet.google.com/..." }`
- **Response**: Updated discussion with meet link
- **Side Effects**:
  - Creates notification in database
  - Sends email to student
  - Emits socket event to student

#### GET `/api/ideas/:ideaId/discussions`
- **Role**: all
- **Purpose**: Fetch all discussions for an idea
- **Response**: Array of discussions with messages and meet links

### Database Schema

#### Idea.discussions[]
```javascript
{
  _id: ObjectId,
  mentorId: ObjectId (ref: User),
  mentorName: String,
  messages: [{
    content: String,
    sentBy: ObjectId (ref: User),
    senderName: String,
    createdAt: Date
  }],
  meetLink: String,  // Google Meet URL
  createdAt: Date
}
```

#### Notification
```javascript
{
  recipient: ObjectId (ref: User),
  sender: ObjectId (ref: User),
  type: 'meet_link_shared',
  title: 'Meeting Link Shared',
  message: String,
  relatedIdea: ObjectId (ref: Idea),
  metadata: {
    meetLink: String,
    mentorName: String
  }
}
```

### Email Template
```html
<h2>Meeting Link Shared</h2>
<p>Hi [Student Name],</p>
<p>[Mentor Name] has shared a Google Meet link to discuss your idea "[Idea Title]".</p>
<p><strong>Join the meeting:</strong></p>
<p><a href="[MEET_LINK]">Join Google Meet</a></p>
<p>Meeting Link: [MEET_LINK]</p>
```

### Socket Events

#### Emitted to Student
```javascript
io.to(studentId).emit('meet_link_added', {
  ideaId: String,
  mentorName: String,
  meetLink: String,
  title: String
});
```

## UI/UX Flow

### Mentor View (in Idea Detail Modal)

```
┌─────────────────────────────────────────┐
│ Mentor Interest (0)                     │
├─────────────────────────────────────────┤
│ [👍 Show Interest]                      │
└─────────────────────────────────────────┘

After clicking "Show Interest":

┌─────────────────────────────────────────┐
│ Mentor Interest (1)                     │
├─────────────────────────────────────────┤
│ [👎 Withdraw Interest]                  │
│                                         │
│ Share Meeting Link                      │
│ [Google Meet Link Input] [Share Link]   │
│                                         │
│ Discussions (1)                         │
│ ┌─────────────────────────────────────┐ │
│ │ Mentor Name          1 messages ✓   │ │
│ │ (Click to expand)                   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Student View (in Idea Detail Modal)

```
┌─────────────────────────────────────────┐
│ Mentor Interest (1)                     │
├─────────────────────────────────────────┤
│ Mentor Name                             │
│ Feb 9, 2026                             │
│                                         │
│ Discussions (1)                         │
│ ┌─────────────────────────────────────┐ │
│ │ Mentor Name          1 messages ✓   │ │
│ │ (Click to expand)                   │ │
│ │                                     │ │
│ │ Mentor: Let's discuss your idea     │ │
│ │ [🔗 Join Google Meet]               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Error Handling

### Frontend Validation
- ✅ Validates meet link is not empty
- ✅ Shows error if no discussion exists
- ✅ Displays loading state while sharing
- ✅ Shows success/error toast messages

### Backend Validation
- ✅ Verifies mentor owns the discussion
- ✅ Checks idea exists
- ✅ Validates meet link format
- ✅ Handles email sending failures gracefully

## Testing Checklist

- [ ] Teacher can show interest in ideas
- [ ] "Share Meeting Link" section appears after showing interest
- [ ] Teacher can paste and share Google Meet link
- [ ] Student receives email with meet link
- [ ] Student receives real-time socket notification
- [ ] Student can see meet link in discussion
- [ ] Student can click "Join Google Meet" button
- [ ] Meet link opens in new tab
- [ ] Teacher can withdraw interest
- [ ] Discussion history persists
- [ ] Multiple mentors can share different meet links
- [ ] Error messages display correctly

## Environment Variables Required

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## API Response Examples

### Share Meet Link Success
```json
{
  "success": true,
  "message": "Meet link added successfully",
  "discussion": {
    "_id": "507f1f77bcf86cd799439011",
    "mentorId": "507f1f77bcf86cd799439012",
    "mentorName": "Dr. Smith",
    "messages": [...],
    "meetLink": "https://meet.google.com/abc-defg-hij",
    "createdAt": "2026-02-09T10:30:00Z"
  }
}
```

### Get Discussions Success
```json
{
  "success": true,
  "discussions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "mentorId": "507f1f77bcf86cd799439012",
      "mentorName": "Dr. Smith",
      "messages": [
        {
          "content": "Let's discuss your idea",
          "sentBy": "507f1f77bcf86cd799439012",
          "senderName": "Dr. Smith",
          "createdAt": "2026-02-09T10:25:00Z"
        }
      ],
      "meetLink": "https://meet.google.com/abc-defg-hij",
      "createdAt": "2026-02-09T10:20:00Z"
    }
  ]
}
```

## Troubleshooting

### Meet Link Not Appearing
1. Check if teacher has shown interest
2. Verify discussion exists (may need to send message first)
3. Check browser console for errors
4. Verify socket connection is active

### Email Not Received
1. Check EMAIL_USER and EMAIL_PASSWORD in .env
2. Verify student email is correct
3. Check spam/junk folder
4. Check backend logs for email errors

### Socket Notification Not Appearing
1. Verify socket connection is established
2. Check browser console for socket errors
3. Verify student is logged in
4. Check if socket event listener is registered

## Future Enhancements

- [ ] Multiple meet links per discussion
- [ ] Meet link scheduling with calendar integration
- [ ] Recording links after meeting
- [ ] Meeting notes/summary
- [ ] Attendance tracking
- [ ] Meeting duration tracking
