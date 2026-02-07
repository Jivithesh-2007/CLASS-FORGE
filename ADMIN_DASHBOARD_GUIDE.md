# Admin Dashboard Guide

## Overview
The Admin Dashboard provides comprehensive control over both teacher and student activities. Admins have all the capabilities that teachers have, plus additional user management and system oversight features.

## Admin Capabilities

### 1. Dashboard Overview
- **System Statistics**: View real-time statistics on users and ideas
  - Total users, students, and teachers count
  - Total ideas and their status breakdown (pending, approved, rejected, merged)
- **Quick Actions**: Fast access to key admin functions
  - Review Ideas
  - View All Ideas
  - Manage Users

### 2. Review Ideas (Admin Feature)
**Path**: `/admin-dashboard/review-ideas`

Admins can review and approve/reject pending student ideas, just like teachers.

**Features**:
- View all pending ideas in a split-panel interface
- Left panel: List of pending submissions with filtering
- Right panel: Detailed idea view with:
  - Project description
  - Supporting images with lightbox viewer
  - Evaluation notes textarea
  - Approve/Reject buttons
- **Merge Ideas**: Select multiple ideas to merge into one
  - Combine similar ideas from different students
  - Create a new merged idea with custom title and description
  - Original ideas are marked as "merged"

**Workflow**:
1. Navigate to Review Ideas
2. Click on an idea to view details
3. Add evaluation notes (optional)
4. Click Approve or Reject
5. Student receives notification via email

### 3. All Ideas Management
**Path**: `/admin-dashboard/all-ideas`

View and manage all ideas in the system regardless of status.

**Features**:
- Filter ideas by status (All, Pending, Approved, Rejected, Merged)
- View idea cards with:
  - Title and description
  - Domain and submitter
  - Current status
- Delete inappropriate ideas
- Full idea lifecycle visibility

### 4. Manage Users
**Path**: `/admin-dashboard/manage-users`

Complete user management system for admins.

**Features**:
- View all users (Students, Teachers, Admins)
- Filter by role
- For each user:
  - View name, email, role, department, status
  - **View Activity** (Students only): See all ideas submitted by a student
  - **Activate/Deactivate**: Toggle user status
  - **Delete**: Remove user from system (cannot delete admins)

**Student Activity View**:
- Shows student profile information
- Statistics on submitted ideas:
  - Total ideas
  - Pending count
  - Approved count
  - Rejected count
  - Merged count
- List of all student ideas with:
  - Title and description preview
  - Domain and submission date
  - Current status with color coding

### 5. System Statistics
Real-time monitoring of:
- **User Statistics**:
  - Total users in system
  - Number of active students
  - Number of active teachers
- **Idea Statistics**:
  - Total ideas submitted
  - Pending ideas awaiting review
  - Approved ideas
  - Rejected ideas
  - Merged ideas

## Admin Sidebar Navigation
The admin sidebar provides quick access to:
1. **Dashboard** - Overview and statistics
2. **Review Ideas** - Approve/reject pending ideas
3. **All Ideas** - View and manage all ideas
4. **Manage Users** - User administration
5. **Settings** - Admin preferences

## Key Differences from Teacher Role

| Feature | Teacher | Admin |
|---------|---------|-------|
| Review Ideas | ✓ | ✓ |
| Merge Ideas | ✓ | ✓ |
| View All Ideas | ✗ | ✓ |
| Manage Users | ✗ | ✓ |
| View Student Activity | ✗ | ✓ |
| Activate/Deactivate Users | ✗ | ✓ |
| Delete Users | ✗ | ✓ |
| Delete Ideas | ✗ | ✓ |
| System Statistics | ✗ | ✓ |

## API Endpoints

### Admin-Specific Endpoints
```
POST /api/admin/ideas/:id/review
- Review and approve/reject ideas
- Body: { status: 'approved'|'rejected', feedback: string }

POST /api/admin/ideas/merge
- Merge multiple ideas
- Body: { ideaIds: [], title: string, description: string, domain: string }

GET /api/admin/students/:studentId/activity
- Get student's idea submission activity
- Returns: student info, statistics, and all submitted ideas

PUT /api/admin/users/:id/toggle-status
- Activate/deactivate user account

DELETE /api/admin/users/:id
- Delete user from system

GET /api/admin/users
- Get all users (with optional role filter)

GET /api/admin/stats
- Get system statistics
```

## Workflow Examples

### Example 1: Reviewing and Approving an Idea
1. Go to Admin Dashboard → Review Ideas
2. Click on a pending idea from the left panel
3. Read the description and view supporting images
4. Add evaluation notes if needed
5. Click "Approve Submission"
6. Student receives approval notification

### Example 2: Merging Similar Ideas
1. Go to Admin Dashboard → Review Ideas
2. Check the checkbox for first idea
3. Check the checkbox for second idea
4. Click "Merge Ideas" button
5. Enter merged idea title and description
6. Click "Confirm Merge"
7. Both original ideas are marked as merged
8. New merged idea is created and approved

### Example 3: Monitoring Student Activity
1. Go to Admin Dashboard → Manage Users
2. Filter by "Students"
3. Click "Activity" button for a student
4. View their submission statistics
5. See all their submitted ideas with status
6. Return to user list to check other students

### Example 4: Managing User Access
1. Go to Admin Dashboard → Manage Users
2. Find a user to manage
3. Click "Deactivate" to disable their account
4. Or click "Delete" to remove them permanently
5. Confirm the action
6. User status is updated immediately

## Security Notes
- Admins cannot delete other admin accounts
- Admins cannot deactivate other admin accounts
- All admin actions are logged (in production)
- Email notifications are sent to students when ideas are reviewed
- Deleted users cannot be recovered

## Best Practices
1. **Regular Monitoring**: Check dashboard statistics regularly
2. **Timely Reviews**: Review pending ideas within 48 hours
3. **Constructive Feedback**: Provide helpful feedback when rejecting ideas
4. **User Management**: Deactivate inactive users rather than deleting them
5. **Idea Merging**: Merge similar ideas to reduce duplicates and encourage collaboration

## Troubleshooting

### Ideas not appearing in review queue
- Check if ideas are in "pending" status
- Verify student accounts are active
- Refresh the page

### Cannot delete a user
- Check if user is an admin (admins cannot be deleted)
- Verify you have admin privileges
- Try deactivating instead

### Merge operation failed
- Ensure at least 2 ideas are selected
- Check that all selected ideas exist
- Verify merge title is not empty

## Support
For issues or questions about the admin dashboard, contact the system administrator.
