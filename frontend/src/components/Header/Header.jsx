import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdNotifications, MdPerson, MdLogout, MdKeyboardArrowDown, MdDarkMode, MdLightMode } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationPanel from '../NotificationPanel/NotificationPanel';
import { notificationAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import styles from './Header.module.css';

const Header = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user && user._id) {
      fetchUnreadCount();
      setupSocket();
      
      // Set up polling to refresh unread count every 10 seconds
      const pollInterval = setInterval(() => {
        fetchUnreadCount();
      }, 10000);
      
      return () => {
        clearInterval(pollInterval);
        const socket = getSocket();
        if (socket) {
          socket.off('notification');
        }
      };
    }
  }, [user]);

  const setupSocket = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('join', user._id.toString());
      console.log('📢 Header: Joined user room:', user._id.toString());
      
      socket.on('notification', (data) => {
        console.log('📬 Header: Notification received:', data);
        fetchUnreadCount();
      });
    } else {
      console.log('⚠️ Header: Socket not available');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditProfile = () => {
    setShowProfileMenu(false);
    const basePath = user?.role === 'student' ? '/student-dashboard' : 
                     user?.role === 'teacher' ? '/teacher-dashboard' : '/admin-dashboard';
    navigate(`${basePath}/settings`);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/login');
  };



  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.greeting}>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbApp}>ClassForge</span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbPage}>{title || 'Dashboard'}</span>
          </div>
          {subtitle && <p className={styles.greetingSubtext}>{subtitle}</p>}
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.themeToggle} 
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <MdLightMode className={styles.icon} /> : <MdDarkMode className={styles.icon} />}
          </button>
          
          <button 
            className={styles.iconBtn} 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <MdNotifications className={styles.icon} />
            {unreadCount > 0 && <span className={`${styles.badge} ${styles.animate}`}>{unreadCount}</span>}
          </button>
          
          <div className={styles.profileWrapper} ref={profileRef}>
            <div 
              className={styles.profile} 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className={styles.avatar}>
                {getInitials(user?.fullName)}
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{user?.fullName || 'User'}</div>
                <div className={styles.profileRole}>{user?.role || 'Student'}</div>
              </div>
              <MdKeyboardArrowDown className={`${styles.dropdownIcon} ${showProfileMenu ? styles.rotated : ''}`} />
            </div>

            {showProfileMenu && (
              <div className={styles.profileMenu}>
                <button className={styles.menuItem} onClick={handleEditProfile}>
                  <MdPerson className={styles.menuIcon} />
                  <span>Edit Profile</span>
                </button>
                <button className={styles.menuItem} onClick={handleLogout}>
                  <MdLogout className={styles.menuIcon} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => {
          setShowNotifications(false);
          // Refresh unread count when panel closes
          fetchUnreadCount();
        }} 
      />
    </>
  );
};

export default Header;
