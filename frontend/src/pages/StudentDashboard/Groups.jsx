import { useState, useEffect } from 'react';
import { MdAdd, MdGroup, MdClose, MdSearch, MdRefresh } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import GroupChat from '../../components/GroupChat/GroupChat';
import GroupDetailsModal from '../../components/GroupDetailsModal/GroupDetailsModal';
import { groupAPI } from '../../services/api';
import styles from './Groups.module.css';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    console.log('🔄 Groups component mounted');
    console.log('👤 Current user:', user);
    if (user && user._id) {
      console.log('📋 Fetching groups for user:', user._id);
      fetchGroups();
    } else {
      console.warn('⚠️ User not authenticated');
      setLoading(false);
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      console.log('📋 Fetching groups...');
      const response = await groupAPI.getGroups();
      console.log('✅ Groups fetched:', response.data);
      console.log('📊 Number of groups:', response.data.groups?.length || 0);
      setGroups(response.data.groups || []);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      showMessage('error', 'Failed to fetch groups');
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
      // Force refresh groups
      setTimeout(() => fetchGroups(), 500);
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
      await groupAPI.joinByCode({ groupCode: joinCode });
      setJoinCode('');
      setShowJoinModal(false);
      showMessage('success', 'Joined group successfully!');
      fetchGroups();
    } catch (error) {
      console.error('Join error:', error);
      showMessage('error', error.response?.data?.message || 'Failed to join group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await groupAPI.deleteGroup(groupId);
        showMessage('success', 'Group deleted successfully');
        setSelectedGroup(null);
        fetchGroups();
      } catch (error) {
        showMessage('error', error.response?.data?.message || 'Failed to delete group');
      }
    }
  };

  const handleLeaveGroup = async () => {
    try {
      console.log('👋 Leaving group:', selectedGroup._id);
      await groupAPI.leaveGroup(selectedGroup._id);
      console.log('✅ Left group successfully');
      showMessage('success', 'Left group successfully');
      setSelectedGroup(null);
      setShowGroupDetails(false);
      fetchGroups();
    } catch (error) {
      console.error('❌ Error leaving group:', error);
      showMessage('error', error.response?.data?.message || 'Failed to leave group');
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isGroupAdmin = selectedGroup && selectedGroup.createdBy?._id === user?._id;

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar role="student" />
        <div className={styles.main}>
          <Header title="My GROUPS" />
          <div className={styles.whatsappContainer}>
            <div className={styles.loadingContainer}>Loading groups...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header title="My GROUPS" />
        
        {message.text && (
          <div className={`${styles.alert} ${styles[message.type]}`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })}>
              <MdClose size={18} />
            </button>
          </div>
        )}

        <div className={styles.whatsappContainer}>
          {/* Sidebar - Groups List */}
          <div className={styles.groupsSidebar}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Chats</h2>
              <div className={styles.sidebarActions}>
                <button 
                  className={styles.iconButton}
                  onClick={() => fetchGroups()}
                  title="Refresh groups"
                >
                  <MdRefresh size={24} />
                </button>
                <button 
                  className={styles.iconButton}
                  onClick={() => setShowCreateModal(true)}
                  title="Create group"
                >
                  <MdAdd size={24} />
                </button>
                <button 
                  className={styles.iconButton}
                  onClick={() => setShowJoinModal(true)}
                  title="Join group"
                >
                  <MdGroup size={24} />
                </button>
              </div>
            </div>

            <div className={styles.searchContainer}>
              <MdSearch size={20} />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.groupsList}>
              {filteredGroups.length === 0 ? (
                <div className={styles.emptyGroups}>
                  <MdGroup size={40} />
                  <p>No groups yet</p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div
                    key={group._id}
                    className={`${styles.groupItem} ${selectedGroup?._id === group._id ? styles.active : ''}`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className={styles.groupItemAvatar}>
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.groupItemInfo}>
                      <div className={styles.groupItemName}>{group.name}</div>
                      <div className={styles.groupItemMembers}>
                        {group.members?.length || 0} members
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={styles.chatArea}>
            {selectedGroup ? (
              <GroupChat 
                group={selectedGroup}
                currentUser={user}
                onShowDetails={() => setShowGroupDetails(true)}
              />
            ) : (
              <div className={styles.emptyChat}>
                <h3>Select a group to start chatting</h3>
                <p>Choose a group from the list or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Create New Group</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter group name"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter group description"
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.primaryBtn}>
                  Create Group
                </button>
                <button 
                  type="button" 
                  className={styles.secondaryBtn}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Join Group</h3>
              <button onClick={() => setShowJoinModal(false)}>
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleJoinByCode} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Group Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength="6"
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.primaryBtn}>
                  Join Group
                </button>
                <button 
                  type="button" 
                  className={styles.secondaryBtn}
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && selectedGroup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Invite Member</h3>
              <button onClick={() => setShowInviteModal(false)}>
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleInviteMember} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@karunya.edu.in"
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.primaryBtn}>
                  Send Invitation
                </button>
                <button 
                  type="button" 
                  className={styles.secondaryBtn}
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {showGroupDetails && selectedGroup && (
        <GroupDetailsModal
          group={selectedGroup}
          isAdmin={isGroupAdmin}
          onClose={() => setShowGroupDetails(false)}
          onInvite={() => {
            setShowGroupDetails(false);
            setShowInviteModal(true);
          }}
          onDelete={() => {
            handleDeleteGroup(selectedGroup._id);
            setShowGroupDetails(false);
          }}
          onLeave={handleLeaveGroup}
        />
      )}
    </div>
  );
};

export default Groups;
