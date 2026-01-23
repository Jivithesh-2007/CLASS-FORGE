import React, { useState, useEffect } from 'react';
import { MdClose, MdNotifications, MdClear, MdCheckCircle, MdDelete } from 'react-icons/md';
import styles from './NotificationPanel.module.css';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Increased to 10 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const notifs = data.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Optimistic update - update UI immediately
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true, read: true } : notif
        )
      );
      const newUnreadCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newUnreadCount);

      // Then make API call
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        // Revert on error
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      // Check if notification is unread before deleting
      const notif = notifications.find(n => n._id === notificationId);
      const wasUnread = notif && (!notif.isRead && !notif.read);
      
      // Optimistic update - remove from UI immediately
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Then make API call
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        // Revert on error
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5001/api/notifications/clear-all', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationCategory = (type) => {
    if (type.includes('mentor') || type.includes('approval')) return 'MENTOR';
    if (type.includes('comment') || type.includes('peer')) return 'PEER';
    if (type.includes('system') || type.includes('update')) return 'SYSTEM';
    return 'GENERAL';
  };

  const getCategoryColor = (category) => {
    const colors = {
      MENTOR: '#10b981',
      PEER: '#f59e0b',
      SYSTEM: '#3b82f6',
      GENERAL: '#6b7280'
    };
    return colors[category] || colors.GENERAL;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <MdNotifications className={styles.headerIcon} />
            <h2>Notifications</h2>
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {loading && notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.spinner}></div>
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <MdNotifications className={styles.emptyIcon} />
              <p>No notifications yet</p>
              <span>You're all caught up!</span>
            </div>
          ) : (
            <div className={styles.notificationsList}>
              {notifications.map((notification) => {
                const category = getNotificationCategory(notification.type);
                const categoryColor = getCategoryColor(category);
                return (
                  <div
                    key={notification._id}
                    className={`${styles.notificationItem} ${!notification.isRead && !notification.read ? styles.unread : ''}`}
                  >
                    <div className={styles.categoryBadge} style={{ backgroundColor: categoryColor }}>
                      {category.charAt(0)}
                    </div>
                    <div className={styles.notificationContent}>
                      <div className={styles.categoryLabel}>{category}</div>
                      <h4 className={styles.title}>{notification.title}</h4>
                      <p className={styles.message}>{notification.message}</p>
                      <span className={styles.time}>{getTimeAgo(notification.createdAt)}</span>
                    </div>
                    <div className={styles.actions}>
                      {!notification.isRead && (
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          title="Mark as read"
                        >
                          <MdCheckCircle size={18} />
                        </button>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => deleteNotification(notification._id, e)}
                        title="Delete notification"
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                    {!notification.isRead && !notification.read && <div className={styles.unreadDot} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={styles.clearBtn} onClick={clearAllNotifications}>
                <MdClear size={16} />
                CLEAR ALL
              </button>
              <button 
                className={styles.markAllReadBtn}
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://localhost:5001/api/notifications/read-all', {
                      method: 'PUT',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.ok) {
                      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
                      setUnreadCount(0);
                    }
                  } catch (error) {
                    console.error('Error marking all as read:', error);
                  }
                }}
              >
                <MdCheckCircle size={16} />
                MARK ALL READ
              </button>
            </div>
          </div>
      </div>
    </>
  );
};

export default NotificationPanel;
