import React, { useState } from 'react';
import { MdPerson, MdEmail, MdSchool, MdSave } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import styles from './Settings.module.css';

const Settings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    department: user?.department || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile(formData);
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Profile updated! Refreshing...' });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar role={user?.role} />
      <div className={styles.main}>
        <Header title="Settings" subtitle="Manage your account settings" />
        <div className={styles.content}>
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Edit Profile</h2>
              <p className={styles.cardSubtitle}>Update your personal information</p>
            </div>

            {message.text && (
              <div className={message.type === 'success' ? styles.success : styles.error}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <MdPerson className={styles.labelIcon} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <MdEmail className={styles.labelIcon} />
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className={styles.input}
                  disabled
                  style={{ backgroundColor: 'var(--background)', cursor: 'not-allowed' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <MdSchool className={styles.labelIcon} />
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter your department"
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                <MdSave />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Account Information</h3>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Role:</span>
              <span className={styles.infoValue}>{user?.role}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Username:</span>
              <span className={styles.infoValue}>{user?.username}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
