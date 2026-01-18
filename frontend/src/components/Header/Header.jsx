import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdNotifications, MdPerson, MdLogout, MdKeyboardArrowDown, MdClose, MdDarkMode, MdLightMode } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    const socket = getSocket();
    if (socket) {
      socket.on('notification', () => {
        fetchNotifications();
      });
    }

    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      const allNotifs = response.data.notifications || [];
      setNotifications(allNotifs.slice(0, 5));
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = () => {
    const basePath = user?.role === 'student' ? '/student-dashboard' : 
                     user?.role === 'teacher' ? '/teacher-dashboard' : '/admin-dashboard';
    navigate(`${basePath}/notifications`);
    setShowNotifications(false);
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await notificationAPI.markAsRead(notifId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

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

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
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
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <MdLightMode className={styles.icon} /> : <MdDarkMode className={styles.icon} />}
        </button>

        <div className={styles.notificationWrapper} ref={notifRef}>
          <button className={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>
            <MdNotifications className={styles.icon} />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.notifHeader}>
                <h3 className={styles.notifTitle}>Notifications</h3>
                <button className={styles.closeBtn} onClick={() => setShowNotifications(false)}>
                  <MdClose />
                </button>
              </div>

              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotif}>No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`${styles.notifItem} ${!notif.isRead ? styles.unread : ''}`}
                      onClick={() => handleMarkAsRead(notif._id)}
                    >
                      <div className={styles.notifContent}>
                        <div className={styles.notifTitle}>{notif.title}</div>
                        <div className={styles.notifMessage}>{notif.message}</div>
                        <div className={styles.notifTime}>{formatTime(notif.createdAt)}</div>
                      </div>
                      {!notif.isRead && <div className={styles.unreadDot}></div>}
                    </div>
                  ))
                )}
              </div>

              <div className={styles.notifFooter}>
                <button className={styles.viewAllBtn} onClick={handleNotificationClick}>
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
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
  );
};

export default Header;
