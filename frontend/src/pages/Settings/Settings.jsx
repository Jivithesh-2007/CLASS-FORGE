import React, { useState } from 'react';
import { MdPerson, MdEmail, MdSchool, MdSave, MdNotifications, MdSecurity, MdVpnKey, MdLogout } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import styles from './Settings.module.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
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
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar role={user?.role} />
      <div className={styles.main}>
        <Header title="Settings" />
        
        <div className={styles.container}>
          <div className={styles.settingsWrapper}>
            {/* Sidebar Navigation */}
            <div className={styles.sidebar}>
              <nav className={styles.nav}>
                <button
                  className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <MdPerson className={styles.navIcon} />
                  Profile
                </button>
                <button
                  className={`${styles.navItem} ${activeTab === 'notifications' ? styles.active : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <MdNotifications className={styles.navIcon} />
                  Notifications
                </button>
                <button
                  className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <MdSecurity className={styles.navIcon} />
                  Security
                </button>
                
              </nav>

  
            </div>

            {/* Main Content */}
            <div className={styles.content}>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className={styles.tabContent}>
                  <div className={styles.contentHeader}>
                    <h2 className={styles.contentTitle}>Personal Information</h2>
                    <p className={styles.contentDescription}>This information is shared across the Innovation Management System.</p>
                  </div>

                  {message.text && (
                    <div className={`${styles.alert} ${styles[message.type]}`}>
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Avatar Section */}
                    <div className={styles.avatarSection}>
                      <div className={styles.avatarPlaceholder}>
                        <MdPerson className={styles.avatarIcon} />
                      </div>
                      <div className={styles.avatarInfo}>
                        <h3 className={styles.avatarTitle}>Change avatar</h3>
                        <p className={styles.avatarSubtext}>JPG, GIF or PNG. Max 1MB.</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>FIRST NAME</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>LAST NAME</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Enter your last name"
                          disabled
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>DEPARTMENT</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        <option value="">Select Department</option>
                        <option value="Faculty of Computer Science">Faculty of Computer Science</option>
                        <option value="Faculty of Engineering">Faculty of Engineering</option>
                        <option value="Faculty of Business">Faculty of Business</option>
                        <option value="Faculty of Arts">Faculty of Arts</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>EMAIL</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className={styles.input}
                        disabled
                      />
                    </div>

                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className={styles.tabContent}>
                  <div className={styles.contentHeader}>
                    <h2 className={styles.contentTitle}>Notifications</h2>
                    <p className={styles.contentDescription}>Manage your notification preferences.</p>
                  </div>
                  <div className={styles.comingSoon}>
                    <p>Notification settings coming soon...</p>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className={styles.tabContent}>
                  <div className={styles.contentHeader}>
                    <h2 className={styles.contentTitle}>Security</h2>
                    <p className={styles.contentDescription}>Manage your account security settings.</p>
                  </div>
                  
                  <div className={styles.dangerZone}>
                    <h3 className={styles.dangerTitle}>Danger Zone</h3>
                    <div className={styles.dangerItem}>
                      <div className={styles.dangerContent}>
                        <h4 className={styles.dangerItemTitle}>Deactivate Account</h4>
                        <p className={styles.dangerItemDesc}>Once deactivated, you will lose access to all your project data.</p>
                      </div>
                      <button className={styles.dangerBtn}>Deactivate</button>
                    </div>
                  </div>
                </div>
              )}

              {/* API Access Tab */}
              {activeTab === 'api' && (
                <div className={styles.tabContent}>
                  <div className={styles.contentHeader}>
                    <h2 className={styles.contentTitle}>API Access</h2>
                    <p className={styles.contentDescription}>Manage your API keys and access tokens.</p>
                  </div>
                  <div className={styles.comingSoon}>
                    <p>API access settings coming soon...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
