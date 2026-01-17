import React, { useState, useEffect } from 'react';
import { MdAdd, MdGroup, MdPeople, MdEmail, MdDelete, MdExitToApp, MdContentCopy, MdClose, MdChat, MdMoreVert } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import GroupChat from '../../components/GroupChat/GroupChat';
import { groupAPI } from '../../services/api';
import styles from './Groups.module.css';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupAPI.getGroups();
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      showMessage('error', 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await groupAPI.createGroup(formData);
      setFormData({ name: '', description: '' });
      setShowCreateModal(false);
      showMessage('success', 'Group created successfully!');
      fetchGroups();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to create group');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      await groupAPI.inviteToGroup(selectedGroup._id, { email: inviteEmail });
      setInviteEmail('');
      setShowInviteModal(false);
      showMessage('success', 'Invitation sent successfully!');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    try {
      const response = await groupAPI.joinByCode({ groupCode: joinCode });
      console.log('Join response:', response.data);
      setJoinCode('');
      setShowJoinModal(false);
      showMessage('success', 'Joined group successfully!');
      fetchGroups();
    } catch (error) {
      console.error('Join error:', error);
      showMessage('error', error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await groupAPI.leaveGroup(groupId);
      showMessage('success', 'Left group successfully');
      fetchGroups();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await groupAPI.deleteGroup(groupId);
      showMessage('success', 'Group deleted successfully');
      fetchGroups();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to delete group');
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getGroupRole = (group) => {
    if (group.founder?._id === user?._id) return 'FOUNDER';
    return 'CONTRIBUTOR';
  };

  const getGroupStatus = (group) => {
    const memberCount = group.members?.length || 0;
    if (memberCount >= 5) return 'IN PROGRESS';
    if (memberCount >= 3) return 'PLANNING';
    return 'ACTIVE';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header title="My GROUPS" />
        <div className={styles.content}>
          {message.text && (
            <div style={{
              marginBottom: '20px',
              padding: '16px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'slideDown 0.3s ease-out',
              backgroundColor: message.type === 'success' ? 'var(--icon-teal-bg)' : '#ffebee',
              border: `1px solid ${message.type === 'success' ? 'var(--icon-teal-text)' : '#ffcdd2'}`,
              color: message.type === 'success' ? 'var(--icon-teal-text)' : 'var(--status-danger)'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{message.text}</span>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <MdClose size={18} />
              </button>
            </div>
          )}

          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          <div className={styles.headerSection}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Project Groups</h1>
              <p className={styles.pageSubtitle}>Collaborate with peers on innovation challenges.</p>
            </div>
            <div className={styles.headerRight}>
              <button className={styles.codeButton} onClick={() => setShowJoinModal(true)}>
                ENTER JOIN CODE
              </button>
              <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                <MdAdd size={18} />
                Create New Group
              </button>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className={styles.emptyState}>
              <MdGroup className={styles.emptyIcon} />
              <div className={styles.emptyText}>No groups yet</div>
              <div className={styles.emptySubtext}>Create a group or join one using a code to collaborate with other students</div>
            </div>
          ) : (
            <div className={styles.groupsGrid}>
              {groups.map((group) => (
                <div key={group._id} className={styles.groupCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.groupIcon}>
                      <MdPeople size={24} />
                    </div>
                    <div>
                      <div className={styles.statusBadge}>
                        {getGroupStatus(group)}
                      </div>
                      <div className={styles.codeSection}>
                        <span className={styles.groupCodeText}>CODE: {group.groupCode}</span>
                        <button 
                          onClick={() => copyToClipboard(group.groupCode)}
                          className={styles.copyCodeBtn}
                          title="Copy code"
                        >
                          <MdContentCopy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 className={styles.groupName}>{group.name}</h3>
                  <p className={styles.groupRole}>{getGroupRole(group)}</p>
                  <p className={styles.groupDescription}>{group.description}</p>

                  <div className={styles.groupMembers}>
                    {group.members?.slice(0, 3).map((member, idx) => (
                      <div key={idx} className={styles.memberAvatar}>
                        {member.user?.fullName?.charAt(0) || 'U'}
                      </div>
                    ))}
                    {group.members?.length > 3 && (
                      <div className={styles.memberAvatar}>
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    {group.members?.length >= 2 && (
                      <button 
                        onClick={() => { setSelectedGroup(group); setShowChatModal(true); }}
                        className={styles.actionBtn}
                        title="Chat"
                      >
                        <MdChat size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => { setSelectedGroup(group); setShowInviteModal(true); }}
                      className={styles.actionBtn}
                      title="Invite"
                    >
                      <MdEmail size={18} />
                    </button>
                    {group.founder?._id === user?._id && (
                      <button 
                        onClick={() => handleDeleteGroup(group._id)}
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Delete group"
                      >
                        <MdDelete size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                    fontSize: '14px',
                    boxSizing: 'border-box'
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
                    minHeight: '100px',
                    boxSizing: 'border-box'
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
                    backgroundColor: 'black',
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

      {showJoinModal && (
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
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Join Group</h3>
            <form onSubmit={handleJoinByCode}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Group Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character group code"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                  maxLength="6"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor:'black',
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
                  onClick={() => { setShowJoinModal(false); setJoinCode(''); }}
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
                    fontSize: '14px',
                    boxSizing: 'border-box'
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

      {showChatModal && selectedGroup && (
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius-md)',
            width: '90%',
            maxWidth: '600px',
            height: '80vh',
            maxHeight: '600px',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <GroupChat 
              group={selectedGroup} 
              onClose={() => { setShowChatModal(false); setSelectedGroup(null); }}
              currentUser={user}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
