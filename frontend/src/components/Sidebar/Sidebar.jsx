import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MdGridView,
  MdAddCircleOutline,
  MdLightbulb,
  MdPeople,
  MdSettings,
  MdLogout,
  MdRateReview,
  MdPersonOutline,
  MdDarkMode,
  MdLightMode
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { path: '/student-dashboard', icon: MdGridView, label: 'Dashboard' },
    { path: '/student-dashboard/submit-idea', icon: MdAddCircleOutline, label: 'Submit Idea' },
    { path: '/student-dashboard/my-ideas', icon: MdLightbulb, label: 'My Ideas' },
    { path: '/student-dashboard/explore-ideas', icon: MdRateReview, label: 'Explore Ideas' },
    { path: '/student-dashboard/groups', icon: MdPeople, label: 'My Groups' },
    { path: '/student-dashboard/settings', icon: MdSettings, label: 'Settings' }
  ];

  const teacherLinks = [
    { path: '/teacher-dashboard', icon: MdGridView, label: 'Dashboard' },
    { path: '/teacher-dashboard/review', icon: MdRateReview, label: 'Review Ideas' },
    { path: '/teacher-dashboard/ideas', icon: MdLightbulb, label: 'Ideas' },
    { path: '/teacher-dashboard/students', icon: MdPersonOutline, label: 'Students' },
    { path: '/teacher-dashboard/settings', icon: MdSettings, label: 'Settings' }
  ];

  const adminLinks = [
    { path: '/admin-dashboard', icon: MdGridView, label: 'Dashboard' },
    { path: '/admin-dashboard/users', icon: MdPeople, label: 'Manage Users' },
    { path: '/admin-dashboard/ideas', icon: MdLightbulb, label: 'All Ideas' },
    { path: '/admin-dashboard/settings', icon: MdSettings, label: 'Settings' }
  ];

  const links = role === 'student' ? studentLinks : role === 'teacher' ? teacherLinks : adminLinks;

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoText}>
          <span className={styles.logoBold}>C</span>
          <span>lass</span>
          <span className={styles.logoBold}>F</span>
          <span>orge</span>
        </div>
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
        <button className={styles.themeToggleBtn} onClick={toggleDarkMode} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
          {isDarkMode ? <MdLightMode className={styles.themeIcon} /> : <MdDarkMode className={styles.themeIcon} />}
          <span className={styles.themeLabel}>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <MdLogout className={styles.logoutIcon} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
