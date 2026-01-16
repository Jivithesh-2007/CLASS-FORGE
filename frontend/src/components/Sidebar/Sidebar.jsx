import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdLightbulb, 
  MdSearch, 
  MdList, 
  MdNotifications, 
  MdSettings,
  MdLogout,
  MdGroup,
  MdPeople,
  MdCheckCircle,
  MdRateReview
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { path: '/student-dashboard', icon: MdDashboard, label: 'Dashboard' },
    { path: '/student-dashboard/submit-idea', icon: MdLightbulb, label: 'Submit Idea' },
    { path: '/student-dashboard/my-ideas', icon: MdList, label: 'My Ideas' },
    { path: '/student-dashboard/groups', icon: MdGroup, label: 'My Groups' },
    { path: '/student-dashboard/notifications', icon: MdNotifications, label: 'Notifications' },
    { path: '/student-dashboard/settings', icon: MdSettings, label: 'Settings' }
  ];

  const teacherLinks = [
    { path: '/teacher-dashboard', icon: MdDashboard, label: 'Dashboard' },
    { path: '/teacher-dashboard/review', icon: MdRateReview, label: 'Review Ideas' },
    { path: '/teacher-dashboard/approved', icon: MdCheckCircle, label: 'Approved Ideas' },
    { path: '/teacher-dashboard/students', icon: MdPeople, label: 'Students' },
    { path: '/teacher-dashboard/notifications', icon: MdNotifications, label: 'Notifications' },
    { path: '/teacher-dashboard/settings', icon: MdSettings, label: 'Settings' }
  ];

  const adminLinks = [
    { path: '/admin-dashboard', icon: MdDashboard, label: 'Dashboard' },
    { path: '/admin-dashboard/users', icon: MdPeople, label: 'Manage Users' },
    { path: '/admin-dashboard/ideas', icon: MdLightbulb, label: 'All Ideas' },
    { path: '/admin-dashboard/notifications', icon: MdNotifications, label: 'Notifications' },
    { path: '/admin-dashboard/settings', icon: MdSettings, label: 'Settings' }
  ];

  const links = role === 'student' ? studentLinks : role === 'teacher' ? teacherLinks : adminLinks;

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoText}>ClassForge</div>
      </div>
      
      <nav className={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <link.icon className={styles.navIcon} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      
      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <MdLogout className={styles.logoutIcon} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
