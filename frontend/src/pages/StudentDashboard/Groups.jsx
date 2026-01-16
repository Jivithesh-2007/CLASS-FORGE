import React, { useState, useEffect } from 'react';
import { MdAdd, MdGroup, MdPeople, MdEmail, MdDelete, MdExitToApp, MdContentCopy } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { groupAPI } from '../../services/api';
import styles from './Dashboard.module.css';
import Spinner from '../../components/Spinner/Spinner';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupAPI.getGroups();
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await groupAPI.createGroup(formData);
      alert(response.data.message + ` Invite Code: ${response.data.group.inviteCode}`);
      setFormData({ name: '', description: '' });
      setShowCreateModal(false);
      fetchGroups();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create group');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      await groupAPI.inviteToGroup(selectedGroup._id, { email: inviteEmail });
      setInviteEmail('');
      setShowInviteModal(false);
      alert('Invitation sent successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleJoinGroupWithCode = async (e) => {
    e.preventDefault();
    try {
      const response = await groupAPI.joinGroupWithCode({ inviteCode: joinCode });
      alert(response.data.message);
      setJoinCode('');
      setShowJoinByCodeModal(false);
      fetchGroups();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    try {
      await groupAPI.leaveGroup(groupId);
      fetchGroups();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await groupAPI.deleteGroup(groupId);
      fetchGroups();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete group');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Invite code copied to clipboard!');
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header title="My Groups" subtitle="Collaborate with your peers" />
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <MdGroup /> Groups
              </h2>
              <div>
                <button className={styles.button} onClick={() => setShowCreateModal(true)} style={{ marginRight: '10px' }}>
                  <MdAdd /> Create Group
                </button>
                <button className={styles.button} onClick={() => setShowJoinByCodeModal(true)}>
                  <MdGroup /> Join Group by Code
                </button>
              </div>
            </div>

            {groups.length === 0 ? (
              <div className={styles.emptyState}>
                <MdGroup className={styles.emptyIcon} />
                <div className={styles.emptyText}>No groups yet</div>
                <div className={styles.emptySubtext}>Create or join a group to collaborate with other students</div>
              </div>
            ) : (
              <div className={styles.ideaGrid}>
                {groups.map((group) => (
                  <div key={group._id} className={styles.ideaCard}>
                    <h3 className={styles.ideaTitle}>{group.name}</h3>
                    <p className={styles.ideaDescription}>{group.description}</p>
                    
                    <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <MdPeople />
                        <span>{group.members?.length || 0} members</span>
                      </div>
                      {group.inviteCode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                          <span>Invite Code: <strong>{group.inviteCode}</strong></span>
                          <button 
                            onClick={() => copyToClipboard(group.inviteCode)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                          >
                            <MdContentCopy />
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button 
                        onClick={() => { setSelectedGroup(group); setShowInviteModal(true); }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          backgroundColor: 'var(--primary-color)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        <MdEmail style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Invite
                      </button>
                      <button 
                        onClick={() => handleLeaveGroup(group._id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'var(--warning-color)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius)',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        <MdExitToApp />
                      </button>
                      <button 
                        onClick={() => handleDeleteGroup(group._id)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'var(--danger-color)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius)',
                          cursor: 'pointer',
                          fontSize: '13px'
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

      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            padding: '32px',
            borderRadius: 'var(--radius-md)',
            width: '90%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Create New Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px',
                    minHeight: '100px'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Create Group
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ccc',
                    color: 'var(--text-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            padding: '32px',
            borderRadius: 'var(--radius-md)',
            width: '90%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Invite Member</h3>
            <form onSubmit={handleInviteMember}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@karunya.edu.in"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Send Invitation
                </button>
                <button
                  type="button"
                  onClick={() => { setShowInviteModal(false); setInviteEmail(''); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ccc',
                    color: 'var(--text-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinByCodeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            padding: '32px',
            borderRadius: 'var(--radius-md)',
            width: '90%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Join Group by Code</h3>
            <form onSubmit={handleJoinGroupWithCode}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Invite Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter 6-digit invite code"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Join Group
                </button>
                <button
                  type="button"
                  onClick={() => { setShowJoinByCodeModal(false); setJoinCode(''); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ccc',
                    color: 'var(--text-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
