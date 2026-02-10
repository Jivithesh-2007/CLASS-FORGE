# Frontend Integration Guide - Mentor Collaboration

## Quick Start

### 1. Update IdeaDetailModal Component

Add these buttons to the modal:

```jsx
// For mentors/teachers
{(user?.role === 'teacher' || user?.role === 'admin') && (
  <div className={styles.mentorActions}>
    <button 
      onClick={handleShowInterest}
      className={isInterested ? styles.withdrawBtn : styles.interestBtn}
    >
      {isInterested ? 'Withdraw Interest' : 'Show Interest'}
    </button>
    
    {isInterested && (
      <button 
        onClick={handleAcceptIdea}
        className={styles.acceptBtn}
      >
        Accept Idea
      </button>
    )}
  </div>
)}

// For students - show interested mentors
{idea?.interestedMentors?.length > 0 && (
  <div className={styles.interestedMentors}>
    <h4>Interested Mentors ({idea.interestedMentors.length})</h4>
    {idea.interestedMentors.map(mentor => (
      <div key={mentor._id} className={styles.mentorItem}>
        <span>{mentor.fullName}</span>
        <span>{mentor.email}</span>
      </div>
    ))}
  </div>
)}

// Show acceptance status
{idea?.acceptedBy && (
  <div className={styles.acceptedStatus}>
    <h4>✓ Accepted by {idea.acceptedBy.mentorName}</h4>
    {idea.acceptedBy.meetLink && (
      <a href={idea.acceptedBy.meetLink} target="_blank" rel="noopener noreferrer">
        Join Google Meet
      </a>
    )}
  </div>
)}
```

### 2. API Calls

```javascript
// Show Interest
const handleShowInterest = async () => {
  try {
    const response = await fetch(`/api/ideas/${idea._id}/show-interest`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (data.success) {
      setIsInterested(true);
      // Refresh idea data
      fetchIdea();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Accept Idea
const handleAcceptIdea = async () => {
  const meetLink = prompt('Enter Google Meet link:');
  if (!meetLink) return;
  
  try {
    const response = await fetch(`/api/ideas/${idea._id}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ meetLink })
    });
    const data = await response.json();
    if (data.success) {
      // Refresh idea data
      fetchIdea();
      alert('Idea accepted successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Get Interested Mentors
const fetchInterestedMentors = async () => {
  try {
    const response = await fetch(`/api/ideas/${idea._id}/interested-mentors`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    if (data.success) {
      setInterestedMentors(data.interestedMentors);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 3. Socket.io Listeners

Add to your component that displays notifications:

```javascript
useEffect(() => {
  const socket = getSocket();
  
  socket?.on('notification', (notification) => {
    if (notification.type === 'mentor_interested') {
      // Show mentor interest notification
      showToast(`${notification.message}`, 'info');
      // Refresh idea data
      fetchIdea();
    }
    
    if (notification.type === 'idea_accepted') {
      // Show acceptance notification
      showToast(`${notification.message}`, 'success');
      // Refresh idea data
      fetchIdea();
    }
  });
  
  return () => {
    socket?.off('notification');
  };
}, []);
```

### 4. Update TeacherDashboard

Add to idea cards:

```jsx
<div className={styles.cardActions}>
  {user?.role === 'teacher' && (
    <>
      <button 
        onClick={() => handleShowInterest(idea._id)}
        className={styles.interestBtn}
      >
        Show Interest
      </button>
      
      {idea.interestedMentors?.includes(user._id) && (
        <button 
          onClick={() => handleAcceptIdea(idea._id)}
          className={styles.acceptBtn}
        >
          Accept
        </button>
      )}
    </>
  )}
</div>
```

### 5. Update StudentDashboard

Show accepted ideas:

```jsx
{idea?.acceptedBy && (
  <div className={styles.acceptedBadge}>
    <span>✓ Accepted by {idea.acceptedBy.mentorName}</span>
    {idea.acceptedBy.meetLink && (
      <a href={idea.acceptedBy.meetLink} target="_blank">
        Join Meeting
      </a>
    )}
  </div>
)}
```

## Notification Display

### In-App Notifications
- Already handled by existing notification system
- New types: `mentor_interested`, `idea_accepted`

### Email Notifications
- Automatically sent by backend
- Uses existing emailService

### Real-Time Notifications
- Socket.io events emitted automatically
- Listen for `notification` events

## Testing Flow

1. **Student submits idea**
   - Check: Teachers receive notification

2. **Teacher shows interest**
   - Check: Student receives notification + email
   - Check: Interest appears in student dashboard

3. **Teacher accepts idea**
   - Check: Student receives notification + email with meet link
   - Check: Idea status changes to "accepted"
   - Check: Meet link is accessible

## CSS Classes to Add

```css
.mentorActions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.interestBtn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.interestBtn:hover {
  background: #2563eb;
}

.acceptBtn {
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.acceptBtn:hover {
  background: #059669;
}

.withdrawBtn {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.withdrawBtn:hover {
  background: #dc2626;
}

.interestedMentors {
  margin-top: 16px;
  padding: 16px;
  background: #f3f4f6;
  border-radius: 8px;
}

.mentorItem {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.acceptedStatus {
  margin-top: 16px;
  padding: 16px;
  background: #d1fae5;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.acceptedStatus a {
  display: inline-block;
  margin-top: 8px;
  padding: 8px 16px;
  background: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.acceptedStatus a:hover {
  background: #059669;
}
```

## Common Issues & Solutions

### Issue: Notifications not appearing
- Check Socket.io connection
- Verify notification listener is set up
- Check browser console for errors

### Issue: Email not sent
- Check emailService configuration
- Verify SMTP settings in .env
- Check email logs

### Issue: Meet link not working
- Ensure valid Google Meet URL format
- Check URL is accessible
- Verify user has Google account

## Next Steps

1. ✅ Backend API - Complete
2. ⏳ Update IdeaDetailModal
3. ⏳ Update TeacherDashboard
4. ⏳ Update StudentDashboard
5. ⏳ Add Google Meet integration
6. ⏳ Test complete workflow
7. ⏳ Deploy to production
