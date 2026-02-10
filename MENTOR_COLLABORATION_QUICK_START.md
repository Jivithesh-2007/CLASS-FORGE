# Mentor-Idea Collaboration - Quick Start Guide

## What's New?

Teachers can now collaborate with students on ideas through a structured workflow:
1. Show interest in student ideas
2. Send messages and schedule Google Meet discussions
3. Accept ideas to formalize collaboration

## For Teachers/Mentors

### Viewing Ideas
- Go to Teacher Dashboard
- Use tabs to navigate:
  - **All Ideas**: Browse all submitted ideas
  - **Interested Ideas**: Ideas you've shown interest in
  - **Accepted Ideas**: Ideas you've accepted

### Showing Interest
1. Click on an idea in "All Ideas"
2. In the detail view, click "Show Interest" button
3. Student receives notification immediately

### Starting a Discussion
1. Go to "Interested Ideas" tab
2. Click "View Details" on an idea
3. Type your message in the discussion box
4. Click "Send Message"
5. Student receives notification with your message

### Adding Google Meet Link
1. In the discussion section
2. Paste your Google Meet link in the "Add Google Meet link" field
3. Click "Add Meet Link"
4. Student can now access the link

### Accepting an Idea
1. After discussion, click "Accept Idea" button
2. Idea moves to "Accepted Ideas" tab
3. Student receives acceptance notification
4. Other interested mentors are notified

### Withdrawing Interest
- Click "Withdraw Interest" before accepting
- You can show interest again later

## For Students

### Viewing Mentor Interest
1. Open your idea detail
2. Scroll to "Mentor Interest" section
3. See all mentors who showed interest

### Viewing Discussions
1. In the same section, see "Discussions"
2. View all messages from mentors
3. Access Google Meet links directly

### Tracking Acceptance
- When a mentor accepts, you'll see:
  - Notification in notification panel
  - "Accepted" status on the idea
  - Mentor name who accepted

## API Endpoints Reference

### Mentor Actions
```
POST   /api/ideas/:id/show-interest
POST   /api/ideas/:id/withdraw-interest
POST   /api/ideas/:id/discussions
PUT    /api/ideas/:id/discussions/:discussionId/meet-link
POST   /api/ideas/:id/accept
GET    /api/ideas/mentor/interested-ideas
GET    /api/ideas/mentor/accepted-ideas
```

### View Data
```
GET    /api/ideas/:id/interested-mentors
GET    /api/ideas/:id/discussions
```

## Database Schema

### Idea Model - New Fields
```javascript
interestedMentors: [{
  mentorId: ObjectId,
  mentorName: String,
  timestamp: Date
}]

acceptedBy: {
  mentorId: ObjectId,
  mentorName: String,
  timestamp: Date
}

discussions: [{
  mentorId: ObjectId,
  mentorName: String,
  messages: [{
    sender: ObjectId,
    senderName: String,
    content: String,
    timestamp: Date
  }],
  meetLink: String,
  createdAt: Date
}]
```

### Notification Types
- `mentor_interested` - Mentor showed interest
- `mentor_message` - Mentor sent message
- `idea_accepted` - Idea was accepted
- `idea_accepted_by_other` - Another mentor accepted

## Key Rules

✅ **Multiple mentors** can show interest in same idea
✅ **Only one mentor** can accept an idea
✅ **First mentor to accept** wins (others get notified)
✅ **Mentors can withdraw** interest anytime before accepting
✅ **Discussions are separate** for each mentor-student pair
✅ **All interactions** trigger notifications

## Common Scenarios

### Scenario 1: Mentor Reviews and Accepts
1. Mentor sees new idea notification
2. Shows interest
3. Sends message asking questions
4. Adds Google Meet link
5. After discussion, accepts idea
6. Student sees acceptance notification

### Scenario 2: Multiple Mentors Interested
1. Mentor A shows interest
2. Mentor B shows interest
3. Student sees both mentors in interest list
4. Mentor A accepts first
5. Mentor B gets notified that idea was accepted
6. Mentor B can still withdraw interest

### Scenario 3: Student Tracks Progress
1. Student submits idea
2. Sees mentors showing interest
3. Reads mentor messages
4. Joins Google Meet discussion
5. Sees when idea is accepted
6. Tracks collaboration in "Accepted Ideas"

## Troubleshooting

**Q: Why can't I accept an idea?**
A: Another mentor already accepted it. Only one mentor can accept per idea.

**Q: How do I send a message?**
A: Go to "Interested Ideas", click "View Details", type in the message box, and click "Send Message".

**Q: Can I withdraw interest after accepting?**
A: No, once accepted, the collaboration is formalized. Contact admin to reverse.

**Q: Where do I add the Google Meet link?**
A: In the discussion section, there's an "Add Google Meet link" field below the message box.

**Q: Will students see my messages immediately?**
A: Yes, they receive a notification and can see the message in their idea detail view.

## Performance Notes

- Interested ideas are indexed by mentorId for fast queries
- Discussions are embedded in ideas for quick access
- Notifications are created asynchronously to avoid blocking
- Consider pagination for mentors with many interested ideas

## Security Notes

- Only teachers/admins can show interest or accept ideas
- Students can only view discussions for their own ideas
- Mentors can only see discussions they're part of
- Only idea author can see all discussions
