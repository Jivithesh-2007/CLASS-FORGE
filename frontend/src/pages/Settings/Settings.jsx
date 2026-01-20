import React, { useState } from 'react';
import { MdPerson, MdSecurity } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import styles from './Settings.module.css';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    lastName: user?.lastName || '',
    department: user?.department || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

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
      updateUser(updatedUser);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateClick = () => {
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    setDeactivateLoading(true);
    try {
      await authAPI.deactivateAccount();
      logout();
      window.location.href = '/login';
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to deactivate account' 
      });
      setDeactivateLoading(false);
      setShowDeactivateModal(false);
    }
  };

  const handleCancelDeactivate = () => {
    setShowDeactivateModal(false);
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
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
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
                    <div className={styles.dangerItem}>
                      <div className={styles.dangerContent}>
                        <h4 className={styles.dangerItemTitle}>Deactivate Account</h4>
                        <p className={styles.dangerItemDesc}>Once deactivated, you will lose access to all your project data.</p>
                      </div>
                      <button className={styles.dangerBtn} onClick={handleDeactivateClick}>Deactivate</button>
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

        {/* Deactivate Confirmation Modal */}
        {showDeactivateModal && (
          <div className={styles.modalOverlay} onClick={handleCancelDeactivate}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Deactivate Account</h3>
              </div>
              <div className={styles.modalContent}>
                <p>Are you sure you want to deactivate your account?</p>
                <p style={{ marginTop: '12px', color: '#ef4444', fontWeight: '500' }}>
                  This action cannot be undone. You will lose access to all your project data.
                </p>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  className={styles.cancelBtn} 
                  onClick={handleCancelDeactivate}
                  disabled={deactivateLoading}
                >
                  Cancel
                </button>
                <button 
                  className={styles.confirmBtn} 
                  onClick={handleConfirmDeactivate}
                  disabled={deactivateLoading}
                >
                  {deactivateLoading ? 'Deactivating...' : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
