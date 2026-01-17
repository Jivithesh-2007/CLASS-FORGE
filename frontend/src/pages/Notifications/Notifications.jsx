import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdDelete, MdDoneAll, MdClose } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import styles from '../StudentDashboard/Dashboard.module.css';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);

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
      setSelectedNotif(null);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role={user?.role} />
      <div className={styles.main}>
        <Header title="Notifications"/>
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
                <div className={styles.emptySubtext}>Your inbox is empty !</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => setSelectedNotif(notification)}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f5f5f5',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eeeeee'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'var(--icon-teal-bg)',
                            color: 'var(--icon-teal-text)',
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ffebee',
                          color: 'var(--status-danger)',
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

      {/* Modal for notification details */}
      {selectedNotif && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedNotif(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <MdClose />
            </button>

            <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
              {selectedNotif.title}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
              {selectedNotif.message}
            </p>
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>
              {new Date(selectedNotif.createdAt).toLocaleString()}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {!selectedNotif.isRead && (
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedNotif._id);
                    setSelectedNotif(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--icon-teal-bg)',
                    color: 'var(--icon-teal-text)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MdCheckCircle />
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedNotif._id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <MdDelete />
                Delete
              </button>
              <button
                onClick={() => setSelectedNotif(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;