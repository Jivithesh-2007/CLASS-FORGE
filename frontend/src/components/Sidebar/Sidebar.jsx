import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MdGridView,
  MdAddCircleOutline,
  MdLightbulb,
  MdPeople,
  MdNotifications, 
  MdSettings,
  MdLogout,
  MdRateReview,
  MdPersonOutline
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Sidebar.module.css';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { path: '/student-dashboard', icon: MdGridView, label: 'Dashboard' },
    { path: '/student-dashboard/submit-idea', icon: MdAddCircleOutline, label: 'Submit Idea' },
    { path: '/student-dashboard/my-ideas', icon: MdLightbulb, label: 'My Ideas' },
    { path: '/student-dashboard/groups', icon: MdPeople, label: 'My Groups' },
    { path: '/student-dashboard/notifications', icon: MdNotifications, label: 'Notifications' },
    { path: '/student-dashboard/settings', icon: MdSettings, label: 'Settings' }
  ];

  const teacherLinks = [
    { path: '/teacher-dashboard', icon: MdGridView, label: 'Dashboard' },
    { path: '/teacher-dashboard/review', icon: MdRateReview, label: 'Review Ideas' },
    { path: '/teacher-dashboard/ideas', icon: MdLightbulb, label: 'Ideas' },
    { path: '/teacher-dashboard/students', icon: MdPersonOutline, label: 'Students' },
    { path: '/teacher-dashboard/notifications', icon: MdNotifications, label: 'Notifications' },
    { path: '/teacher-dashboard/settings', icon: MdSettings, label: 'Settings' }
  ];

  const adminLinks = [
    { path: '/admin-dashboard', icon: MdGridView, label: 'Dashboard' },
    { path: '/admin-dashboard/users', icon: MdPeople, label: 'Manage Users' },
    { path: '/admin-dashboard/ideas', icon: MdLightbulb, label: 'All Ideas' },
    { path: '/admin-dashboard/notifications', icon: MdNotifications, label: 'Notifications' },
    { path: '/admin-dashboard/settings', icon: MdSettings, label: 'Settings' }
  ];

  const links = role === 'student' ? studentLinks : role === 'teacher' ? teacherLinks : adminLinks;

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <img 
          src={isDarkMode ? "/dark-mode-logo.png" : "/light-mode-logo.png"} 
          alt="ClassForge" 
          className={styles.logoImage} 
        />
      
      </div>
      
      <nav className={styles.nav}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive && window.location.pathname === link.path ? styles.active : ''}`
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
