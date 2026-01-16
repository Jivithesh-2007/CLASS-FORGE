import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdDelete, MdDoneAll } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import styles from '../StudentDashboard/Dashboard.module.css';
import Spinner from '../../components/Spinner/Spinner'; // Moved to top level

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role={user?.role} />
      <div className={styles.main}>
        <Header title="Notifications" subtitle="Stay updated with your activities" />
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>All Notifications</h2>
              {notifications.some(n => !n.isRead) && (
                <button className={styles.button} onClick={handleMarkAllAsRead}>
                  <MdDoneAll />
                  Mark All as Read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>No notifications</div>
                <div className={styles.emptySubtext}>You're all caught up!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    style={{
                      padding: '16px',
                      backgroundColor: notification.isRead ? 'white' : '#e3f2fd',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
                        {notification.title}
                      </h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {notification.message}
                      </p>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#e8f5e9',
                            color: '#388e3c',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <MdCheckCircle />
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ffebee',
                          color: '#d32f2f',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Notifications;