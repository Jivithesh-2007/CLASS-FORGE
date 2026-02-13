# Updated Mentor Collaboration Flow

## 🎯 Step-by-Step UI Flow

### Step 1: Initial State - Show Interest Button Only
```
┌─────────────────────────────────────┐
│ Mentor Interest (0)                 │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐   │
│  │  👍 Show Interest            │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**What happens:**
- Teacher clicks "Show Interest"
- Teacher is added to interestedMentors array
- Student receives notification + email
- UI updates to Step 2

---

### Step 2: After Show Interest - Arrange Meeting + Withdraw
```
┌─────────────────────────────────────┐
│ Mentor Interest (1)                 │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐   │
│  │  🎥 Arrange Meeting          │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  👎 Withdraw Interest        │   │
│  └──────────────────────────────┘   │
│                                     │
│  Interested Mentors:                │
│  • Jivithesh                        │
│                                     │
└─────────────────────────────────────┘
```

**What happens:**
- Teacher clicks "Arrange Meeting"
- Modal opens with Google Meet guide
- Teacher creates Google Meet
- Teacher pastes meeting link
- Teacher clicks "Send Meeting Link"
- Student receives email with link
- UI updates to Step 3

---

### Step 3: After Meeting Scheduled - Approve/Reject
```
┌─────────────────────────────────────┐
│ Mentor Interest (1)                 │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐   │
│  │  ✅ Approve                  │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  ❌ Reject                   │   │
│  └──────────────────────────────┘   │
│                                     │
│  Interested Mentors:                │
│  • Jivithesh                        │
│                                     │
└─────────────────────────────────────┘
```

**What happens:**
- Teacher clicks "Approve" or "Reject"
- Idea status updates
- Student receives notification + email
- Idea appears in appropriate section

---

## 📋 Complete Workflow

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: STUDENT SUBMITS IDEA                                 │
│ Status: PENDING                                              │
│ Teacher sees: "Show Interest" button                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: TEACHER SHOWS INTEREST                               │
│ Status: MENTOR INTERESTED                                    │
│ Teacher sees: "Arrange Meeting" + "Withdraw Interest"        │
│ Student receives: Notification + Email                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: TEACHER ARRANGES MEETING                             │
│ Status: MEETING SCHEDULED                                    │
│ Teacher sees: "Approve" + "Reject" buttons                   │
│ Student receives: Email with Google Meet link                │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: TEACHER & STUDENT MEET ON GOOGLE MEET                │
│ Status: MEETING SCHEDULED                                    │
│ Both discuss the idea                                        │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ STEP 5: TEACHER MAKES DECISION                               │
│ Status: APPROVED or REJECTED                                 │
│ Teacher sees: Buttons disabled (decision made)               │
│ Student receives: Notification + Email                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Management

### Component State Variables
```javascript
isInterested: boolean        // Is current teacher interested?
meetingScheduled: boolean    // Has meeting link been sent?
```

### Button Display Logic

| State | isInterested | meetingScheduled | Buttons Shown |
|-------|--------------|------------------|---------------|
| 1 | false | false | Show Interest |
| 2 | true | false | Arrange Meeting, Withdraw Interest |
| 3 | true | true | Approve, Reject |

---

## 📧 Email Notifications

### Email 1: Mentor Interest
- **Sent to:** Student
- **When:** After teacher clicks "Show Interest"
- **Subject:** "A mentor has shown interest in your idea!"
- **Contains:** Mentor name, idea title

### Email 2: Meeting Link
- **Sent to:** Student
- **When:** After teacher sends meeting link
- **Subject:** "Your mentor has scheduled a meeting!"
- **Contains:** Mentor name, clickable Google Meet link

### Email 3: Approval/Rejection
- **Sent to:** Student
- **When:** After teacher approves or rejects
- **Subject:** "Congratulations! Your idea has been accepted" or "Feedback on your idea"
- **Contains:** Mentor name, decision, feedback

---

## 🎨 UI Components

### MentorInterestPanel Component
- **Location:** `frontend/src/components/MentorInterestPanel/MentorInterestPanel.jsx`
- **Props:**
  - `ideaId` (required) - The idea ID
  - `onInterestChange` (optional) - Callback when interest changes

### Button States

**Show Interest Button**
- Color: Gray
- Icon: 👍
- Visible: When not interested
- Action: Show interest in idea

**Arrange Meeting Button**
- Color: Green
- Icon: 🎥
- Visible: After showing interest, before meeting scheduled
- Action: Open modal to arrange meeting

**Withdraw Interest Button**
- Color: Red
- Icon: 👎
- Visible: After showing interest, before meeting scheduled
- Action: Withdraw interest

**Approve Button**
- Color: Green
- Icon: ✅
- Visible: After meeting scheduled
- Action: Approve idea

**Reject Button**
- Color: Red
- Icon: ❌
- Visible: After meeting scheduled
- Action: Reject idea

---

## 🔐 Access Control

### Teachers/Admins Can:
- ✅ Show interest in ideas
- ✅ Arrange meetings
- ✅ Withdraw interest
- ✅ Approve ideas
- ✅ Reject ideas

### Students Can:
- ✅ View interested mentors
- ✅ View meeting links
- ✅ See approval status
- ❌ Cannot show interest
- ❌ Cannot arrange meetings
- ❌ Cannot approve/reject

---

## 🧪 Testing the Flow

### Test Case 1: Show Interest
1. Login as teacher
2. Go to Review Ideas
3. Click "Show Interest"
4. Verify button changes to "Arrange Meeting" + "Withdraw Interest"
5. Verify student receives notification + email

### Test Case 2: Arrange Meeting
1. Click "Arrange Meeting"
2. Modal opens with Google Meet guide
3. Click "Open Google Meet"
4. Create meeting and copy link
5. Paste link in modal
6. Click "Send Meeting Link"
7. Verify buttons change to "Approve" + "Reject"
8. Verify student receives email with link

### Test Case 3: Approve/Reject
1. Click "Approve" or "Reject"
2. Verify idea status updates
3. Verify student receives notification + email
4. Verify idea appears in appropriate section

---

## 📊 Database Updates

### When Show Interest is Clicked
```javascript
idea.interestedMentors.push({
  mentorId: teacher._id,
  mentorName: teacher.fullName,
  mentorEmail: teacher.email,
  interestTimestamp: new Date()
})
```

### When Meeting Link is Sent
```javascript
idea.acceptedBy = {
  mentorId: teacher._id,
  mentorName: teacher.fullName,
  mentorEmail: teacher.email,
  acceptedAt: new Date(),
  meetLink: "https://meet.google.com/abc-defg-hij"
}
```

### When Approved/Rejected
```javascript
idea.status = "approved" // or "rejected"
idea.reviewedBy = teacher._id
idea.reviewedAt = new Date()
```

---

## ✨ Key Features

✅ **Clear Step-by-Step Flow** - Users know exactly what to do next
✅ **Visual Feedback** - Buttons change based on state
✅ **Email Notifications** - Students get updates at each step
✅ **Real-Time Updates** - Dashboard updates without refresh
✅ **Easy to Understand** - Simple, intuitive UI
✅ **Mobile Responsive** - Works on all devices

---

## 🚀 Implementation Status

- [x] Step 1: Show Interest button
- [x] Step 2: Arrange Meeting + Withdraw Interest buttons
- [x] Step 3: Approve + Reject buttons
- [x] Email notifications
- [x] Real-time updates
- [x] Database schema
- [x] API endpoints
- [x] CSS styling

**Status:** ✅ Ready for Testing

---

**Updated:** February 13, 2026
**Version:** 2.0
