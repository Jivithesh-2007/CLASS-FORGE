# Mentor-Idea Collaboration - Testing Guide

## Test Environment Setup

### Prerequisites
- Backend running on `http://localhost:5001`
- Frontend running on `http://localhost:5173` (or your dev server)
- MongoDB connected
- At least 2 teacher accounts and 1 student account

### Test Accounts
```
Student: student@test.com / password
Teacher1: teacher1@test.com / password
Teacher2: teacher2@test.com / password
```

## Test Cases

### TC-1: Idea Submission Notification
**Objective**: Verify teachers receive notification when student submits idea

**Steps**:
1. Login as student
2. Submit a new idea with title "Test Idea 1"
3. Logout and login as teacher1
4. Check notification panel

**Expected Result**:
- ✅ Notification appears: "New Idea Submitted"
- ✅ Notification shows student name and idea title
- ✅ Notification is clickable and opens idea detail

---

### TC-2: Show Interest
**Objective**: Verify mentor can show interest and student is notified

**Steps**:
1. Login as teacher1
2. Go to Teacher Dashboard → All Ideas
3. Click on "Test Idea 1"
4. Click "Show Interest" button
5. Logout and login as student
6. Check notifications

**Expected Result**:
- ✅ Button changes to "Withdraw Interest"
- ✅ Student receives notification: "Mentor Interested"
- ✅ Mentor appears in "Interested Mentors" list on idea detail

---

### TC-3: Multiple Mentors Show Interest
**Objective**: Verify multiple mentors can show interest in same idea

**Steps**:
1. Login as teacher1, show interest in "Test Idea 1"
2. Logout, login as teacher2
3. Show interest in same idea
4. Login as student, view idea detail

**Expected Result**:
- ✅ Both mentors appear in "Interested Mentors" list
- ✅ Count shows "2" interested mentors
- ✅ Student received 2 separate notifications

---

### TC-4: Send Message
**Objective**: Verify mentor can send message to student

**Steps**:
1. Login as teacher1
2. Go to "Interested Ideas"
3. Click "View Details" on "Test Idea 1"
4. Type message: "This is a great idea! Let's discuss."
5. Click "Send Message"
6. Logout and login as student
7. View idea detail

**Expected Result**:
- ✅ Message appears in "Discussions" section
- ✅ Shows mentor name and message content
- ✅ Student receives notification: "New Message from Mentor"
- ✅ Message timestamp is correct

---

### TC-5: Add Google Meet Link
**Objective**: Verify mentor can add Google Meet link

**Steps**:
1. Login as teacher1
2. Go to "Interested Ideas" → "View Details"
3. In "Add Google Meet link" field, paste: `https://meet.google.com/abc-defg-hij`
4. Click "Add Meet Link"
5. Logout and login as student
6. View idea detail

**Expected Result**:
- ✅ Meet link appears in discussion
- ✅ Link is clickable and opens in new tab
- ✅ Link shows with "Join Google Meet" label
- ✅ Student can access the link

---

### TC-6: Accept Idea
**Objective**: Verify mentor can accept idea

**Steps**:
1. Login as teacher1
2. Go to "Interested Ideas" → "View Details"
3. Click "Accept Idea" button
4. Verify idea moves to "Accepted Ideas"
5. Logout and login as student
6. Check notifications and idea detail

**Expected Result**:
- ✅ Idea moves to "Accepted Ideas" tab
- ✅ Student receives notification: "Idea Accepted"
- ✅ Notification shows mentor name
- ✅ Idea shows "Accepted" status with mentor name
- ✅ Teacher2 receives notification: "Idea Accepted by Another Mentor"

---

### TC-7: Prevent Double Acceptance
**Objective**: Verify only one mentor can accept idea

**Steps**:
1. Login as teacher2
2. Go to "Interested Ideas"
3. Try to click "Accept Idea" on "Test Idea 1"

**Expected Result**:
- ✅ Error message: "Idea already accepted by another mentor"
- ✅ Button is disabled or shows error
- ✅ Idea is not accepted by teacher2

---

### TC-8: Withdraw Interest
**Objective**: Verify mentor can withdraw interest

**Steps**:
1. Create new idea "Test Idea 2"
2. Login as teacher1, show interest
3. Click "Withdraw Interest"
4. Verify interest is removed
5. Login as student, check idea detail

**Expected Result**:
- ✅ Button changes back to "Show Interest"
- ✅ Mentor removed from "Interested Mentors" list
- ✅ Student no longer sees teacher1 in interested mentors

---

### TC-9: View Interested Ideas
**Objective**: Verify mentor can view all interested ideas

**Steps**:
1. Login as teacher1
2. Show interest in 3 different ideas
3. Go to "Interested Ideas" tab

**Expected Result**:
- ✅ All 3 ideas appear in the list
- ✅ Each shows title, description, domain
- ✅ Can click "View Details" on each

---

### TC-10: View Accepted Ideas
**Objective**: Verify mentor can view accepted ideas

**Steps**:
1. Login as teacher1
2. Go to "Accepted Ideas" tab

**Expected Result**:
- ✅ Only accepted ideas appear
- ✅ Shows student name for each
- ✅ Can view discussion history
- ✅ Can access Google Meet links

---

### TC-11: Discussion History
**Objective**: Verify discussion history is maintained

**Steps**:
1. Login as teacher1
2. Send 3 messages to student
3. Go to "Accepted Ideas" → "View Discussion"
4. Verify all messages appear

**Expected Result**:
- ✅ All 3 messages appear in order
- ✅ Each shows sender name and timestamp
- ✅ Messages are in chronological order
- ✅ Meet link is visible

---

### TC-12: Notification Panel
**Objective**: Verify all notifications appear in panel

**Steps**:
1. Perform actions: submit idea, show interest, send message, accept
2. Check notification panel for all events

**Expected Result**:
- ✅ All 4 notifications appear
- ✅ Notifications are in reverse chronological order
- ✅ Can mark as read
- ✅ Can delete notifications

---

### TC-13: Responsive Design
**Objective**: Verify UI works on mobile

**Steps**:
1. Open browser DevTools
2. Set to mobile view (375px width)
3. Navigate through all mentor collaboration features

**Expected Result**:
- ✅ All buttons are clickable
- ✅ Text is readable
- ✅ Modals fit on screen
- ✅ No horizontal scrolling

---

### TC-14: Error Handling
**Objective**: Verify error messages are shown

**Steps**:
1. Try to send empty message
2. Try to add invalid Meet link
3. Try to accept already accepted idea

**Expected Result**:
- ✅ Clear error messages appear
- ✅ User is guided on what to fix
- ✅ No console errors

---

### TC-15: Concurrent Actions
**Objective**: Verify system handles concurrent mentor actions

**Steps**:
1. Open 2 browser windows
2. Login as teacher1 in window 1, teacher2 in window 2
3. Both try to accept same idea simultaneously
4. Refresh both windows

**Expected Result**:
- ✅ Only one acceptance succeeds
- ✅ Other gets error message
- ✅ No data corruption
- ✅ Notifications are correct

---

## Performance Tests

### PT-1: Load Time
- Load "Interested Ideas" with 50+ ideas
- Should load in < 2 seconds

### PT-2: Message Sending
- Send 10 messages rapidly
- All should be saved correctly
- No duplicates

### PT-3: Notification Delivery
- Submit idea with 10 teachers
- All 10 should receive notification within 1 second

---

## Edge Cases

### EC-1: Student Deletes Idea
- Idea has interested mentors
- Student deletes idea
- Mentors should be notified or idea should be removed from their list

### EC-2: Mentor Accepts Then Withdraws
- Not possible - once accepted, can't withdraw
- Should show error if attempted

### EC-3: Same Mentor Shows Interest Twice
- Should not create duplicate
- Should show error: "Already interested"

### EC-4: Very Long Message
- Send 5000 character message
- Should be saved and displayed correctly

### EC-5: Special Characters in Message
- Send message with emojis, special chars
- Should display correctly

---

## Regression Tests

Run these after any changes:

- [ ] Existing idea submission still works
- [ ] Existing notifications still work
- [ ] Existing comments still work
- [ ] Existing merge functionality still works
- [ ] Admin dashboard still works
- [ ] Student dashboard still works

---

## Test Data Cleanup

After testing, clean up:
```javascript
// Delete test ideas
db.ideas.deleteMany({ title: /Test Idea/ })

// Delete test notifications
db.notifications.deleteMany({ message: /Test/ })
```

---

## Automated Testing (Optional)

Consider adding Cypress tests for:
- Show interest workflow
- Message sending workflow
- Idea acceptance workflow
- Notification verification

Example Cypress test:
```javascript
describe('Mentor Collaboration', () => {
  it('should show interest in idea', () => {
    cy.login('teacher1@test.com', 'password')
    cy.visit('/teacher-dashboard')
    cy.contains('All Ideas').click()
    cy.contains('Test Idea').click()
    cy.contains('Show Interest').click()
    cy.contains('Withdraw Interest').should('exist')
  })
})
```

---

## Sign-Off

- [ ] All test cases passed
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Ready for production

**Tested by**: _______________
**Date**: _______________
**Notes**: _______________
