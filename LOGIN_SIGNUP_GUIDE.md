# Login & Signup Guide - Role-Based Authentication

## Overview
The login and signup pages now feature 3 distinct sections for Student, Teacher, and Admin roles. Each role has specific requirements and redirects to their respective dashboards upon successful authentication.

## Login Page Features

### Tab-Based Navigation
The login page displays 3 tabs at the top:
- **Student** - For student account login
- **Teacher** - For teacher account login  
- **Admin** - For admin account login

### Login Requirements by Role

#### Student Login
- Email: `username@karunya.edu.in`
- Password: Your account password
- Redirects to: `/student-dashboard`

#### Teacher Login
- Email: `username@karunya.edu.in`
- Password: Your account password
- Redirects to: `/teacher-dashboard`

#### Admin Login
- Email: `admin@karunya.edu.in`
- Password: Your account password
- Redirects to: `/admin-dashboard`

### Role Validation
- The system validates that the account role matches the selected tab
- If you try to login with a student account in the teacher tab, you'll get an error
- This prevents accidental login to the wrong dashboard

## Signup Page Features

### Tab-Based Account Creation
The signup page also has 3 tabs:
- **Student** - Create a student account
- **Teacher** - Create a teacher account
- **Admin** - Create an admin account

### Signup Requirements by Role

#### Student Account Creation
- Full Name: Your complete name
- Email: `username@karunya.edu.in`
- Department: Your department (e.g., Computer Science)
- Password: Minimum 6 characters
- Confirm Password: Must match password
- Redirects to: `/student-dashboard`

#### Teacher Account Creation
- Full Name: Your complete name
- Email: `username@karunya.edu.in`
- Department: Your department
- Password: Minimum 6 characters
- Confirm Password: Must match password
- Redirects to: `/teacher-dashboard`

#### Admin Account Creation
- Full Name: Your complete name
- Email: `admin@karunya.edu.in`
- Department: Your department
- Password: Minimum 6 characters
- Confirm Password: Must match password
- Redirects to: `/admin-dashboard`

### Domain Requirement
- All accounts must use `@karunya.edu.in` domain
- The domain is automatically appended to the email
- Users only need to enter the username part

### Tab-Specific Descriptions
Each tab shows a description of the role:
- **Student**: "Create a student account to submit ideas and collaborate with peers."
- **Teacher**: "Create a teacher account to review and mentor student ideas."
- **Admin**: "Create an admin account to manage the system and oversee all activities."

## Admin Role Assignment

### Promoting Students to Admin
Main admins can promote students to admin status:

1. Go to Admin Dashboard → Manage Users
2. Filter by "Students"
3. Click "Make Admin" button on the desired student
4. Confirm the promotion in the modal
5. Student is now promoted to admin with full system access

### Removing Admin Privileges
Admins can remove admin privileges from other admins:

1. Go to Admin Dashboard → Manage Users
2. Filter by "Admins"
3. Click "Remove Admin" button on the desired admin
4. Confirm the removal in the modal
5. Admin is demoted back to student role

### Restrictions
- Cannot remove the last admin from the system
- Cannot remove your own admin privileges
- Only existing admins can perform these operations

## Backend Changes

### Updated Signup Endpoint
```
POST /api/auth/signup
Body: {
  fullName: string,
  username: string,
  email: string,
  password: string,
  department: string,
  role: 'student' | 'teacher' | 'admin'
}
```

### New Admin Endpoints
```
POST /api/admin/users/:studentId/assign-admin
- Promote a student to admin

POST /api/admin/users/:adminId/remove-admin
- Remove admin privileges from an admin
```

### Role Validation
- Admin and teacher accounts must use `@karunya.edu.in` domain
- Student accounts must use `@karunya.edu.in` domain
- Invalid role selection returns 400 error
- Domain mismatch returns 400 error

## Frontend Changes

### Login Component
- Added tab navigation for role selection
- Added role validation on login
- Shows appropriate error if role doesn't match tab
- Simplified email input (domain auto-appended)

### Signup Component
- Added tab navigation for role selection
- Added role-specific descriptions
- Passes selected role to backend
- Simplified email input (domain auto-appended)

### ManageUsers Component
- Added "Make Admin" button for students
- Added "Remove Admin" button for admins
- Updated confirmation modals for new actions
- Proper permission checks

## User Flow Examples

### Example 1: Student Signup and Login
1. Go to `/signup`
2. Click "Student" tab
3. Fill in details (name, email, department, password)
4. Click "Create Account"
5. Redirected to `/student-dashboard`
6. To login later: Go to `/login` → Student tab → Enter credentials

### Example 2: Teacher Signup and Login
1. Go to `/signup`
2. Click "Teacher" tab
3. Fill in details (name, email, department, password)
4. Click "Create Account"
5. Redirected to `/teacher-dashboard`
6. To login later: Go to `/login` → Teacher tab → Enter credentials

### Example 3: Admin Signup and Login
1. Go to `/signup`
2. Click "Admin" tab
3. Fill in details (name, email, department, password)
4. Click "Create Account"
5. Redirected to `/admin-dashboard`
6. To login later: Go to `/login` → Admin tab → Enter credentials

### Example 4: Promoting a Student to Admin
1. Login as admin
2. Go to Admin Dashboard → Manage Users
3. Filter by "Students"
4. Find the student to promote
5. Click "Make Admin"
6. Confirm in the modal
7. Student is now an admin
8. They can login using the Admin tab

## Security Considerations

1. **Role Validation**: System validates role matches selected tab
2. **Domain Enforcement**: Only @karunya.edu.in domain allowed
3. **Password Requirements**: Minimum 6 characters
4. **Admin Protection**: Cannot remove last admin
5. **Email Uniqueness**: Each email can only be registered once
6. **Role-Based Access**: Each role has specific dashboard access

## Troubleshooting

### "This account is not a student account"
- You're trying to login with a non-student account in the Student tab
- Use the correct tab for your account type

### "Admin and teacher accounts must use @karunya.edu.in domain"
- You selected Admin or Teacher but used a different domain
- Make sure to use @karunya.edu.in domain

### "Email already registered"
- This email is already in use
- Try a different email or use forgot password if it's your account

### Cannot promote student to admin
- Make sure you're logged in as an admin
- The user must be a student (not already an admin)
- Check that the user exists and is active

## Best Practices

1. **Use Correct Tab**: Always select the correct role tab for your account type
2. **Strong Passwords**: Use passwords longer than 6 characters for security
3. **Email Format**: Use your institutional email (username@karunya.edu.in)
4. **Admin Assignment**: Only promote trusted students to admin
5. **Regular Audits**: Periodically review admin assignments

## Support
For issues with login/signup or role assignment, contact the system administrator.
