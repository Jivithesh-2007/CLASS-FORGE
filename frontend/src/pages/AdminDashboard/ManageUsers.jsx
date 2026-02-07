import { useState, useEffect } from 'react';
import { MdVisibility, MdSupervisorAccount, MdBlock, MdCheckCircle, MdDelete, MdEmail, MdClose, MdSchool, MdPerson, MdWork } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import StudentActivity from './StudentActivity';
import IdeaDetailModal from '../../components/IdeaDetailModal/IdeaDetailModal';
import { adminAPI, ideaAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import styles from '../StudentDashboard/Dashboard.module.css';

const ManageUsers = () => {
  const { success, error: showError } = useToast();
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userIdeas, setUserIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  useEffect(() => {
    if (selectedUser && selectedUser.role === 'student') {
      fetchUserIdeas(selectedUser._id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const params = filterRole !== 'all' ? { role: filterRole } : {};
      const response = await adminAPI.getAllUsers(params);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setConfirmAction({ type: 'toggle', id });
  };

  const handleDelete = async (id) => {
    setConfirmAction({ type: 'delete', id });
  };

  const handleViewActivity = (studentId) => {
    setSelectedStudentId(studentId);
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === 'toggle') {
        await adminAPI.toggleUserStatus(confirmAction.id);
        success('User status updated successfully');
      } else if (confirmAction.type === 'delete') {
        await adminAPI.deleteUser(confirmAction.id);
        success('User deleted successfully');
      } else if (confirmAction.type === 'assign-admin') {
        await adminAPI.assignAdminRole(confirmAction.id);
        success('User promoted to admin successfully');
      } else if (confirmAction.type === 'remove-admin') {
        await adminAPI.removeAdminRole(confirmAction.id);
        success('Admin role removed successfully');
      } else if (confirmAction.type === 'delete-idea') {
        await ideaAPI.deleteIdea(confirmAction.id);
        success('Idea deleted successfully');
        fetchUserIdeas(selectedUser._id);
      }
      fetchUsers();
      setConfirmAction(null);
    } catch (error) {
      console.error('Error:', error);
      showError(error.response?.data?.message || 'Operation failed');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return { bg: '#fef3c7', color: '#d97706', icon: MdPerson };
      case 'teacher':
        return { bg: '#dbeafe', color: '#2563eb', icon: MdWork };
      case 'student':
        return { bg: '#e0e7ff', color: '#4f46e5', icon: MdSchool };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', icon: MdPerson };
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? { bg: '#d1fae5', color: '#059669' }
      : { bg: '#fee2e2', color: '#dc2626' };
  };

  const fetchUserIdeas = async (userId) => {
    try {
      const response = await ideaAPI.getIdeas({ submittedBy: userId });
      setUserIdeas(response.data.ideas || []);
    } catch (error) {
      console.error('Error fetching user ideas:', error);
      setUserIdeas([]);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      showError('Please fill in subject and message');
      return;
    }
    try {
      await adminAPI.sendEmailToUser(selectedUser._id, {
        subject: emailSubject,
        message: emailMessage
      });
      success('Email sent successfully');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      console.error('Error sending email:', error);
      showError(error.response?.data?.message || 'Failed to send email');
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    setConfirmAction({ type: 'delete-idea', id: ideaId });
  };

  if (selectedStudentId) {
    return (
      <StudentActivity 
        studentId={selectedStudentId} 
        onBack={() => setSelectedStudentId(null)}
      />
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="admin" />
      <div className={styles.main}>
        <Header title="Manage Users" subtitle="View and manage all system users" />
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>All Users ({users.length})</h2>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            {users.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>No users found</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const roleColor = getRoleColor(user.role);
                      const statusColor = getStatusColor(user.isActive);
                      return (
                        <tr 
                          key={user._id} 
                          onClick={() => setSelectedUser(user)}
                          style={{ 
                            borderBottom: '1px solid #e5e7eb', 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: selectedUser?._id === user._id ? '#f0f9ff' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = selectedUser?._id === user._id ? '#f0f9ff' : 'transparent';
                          }}
                        >
                          <td style={{ padding: '16px', color: '#1f2937', fontWeight: '500', fontSize: '14px' }}>{user.fullName}</td>
                          <td style={{ padding: '16px', color: '#6b7280', fontSize: '13px' }}>{user.email}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              textTransform: 'capitalize',
                              backgroundColor: roleColor.bg,
                              color: roleColor.color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <roleColor.icon size={18} />
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '16px', color: '#6b7280', fontSize: '13px' }}>{user.department || 'N/A'}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700',
                              backgroundColor: statusColor.bg,
                              color: statusColor.color
                            }}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Actions Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedUser(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            borderTop: `5px solid ${getRoleColor(selectedUser.role).color}`,
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              padding: '40px 40px 32px 40px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: getRoleColor(selectedUser.role).bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {(() => {
                    const RoleIcon = getRoleColor(selectedUser.role).icon;
                    return <RoleIcon size={28} color={getRoleColor(selectedUser.role).color} />;
                  })()}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#1f2937' }}>
                    {selectedUser.fullName}
                  </h3>
                  <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#1f2937'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '32px 40px' }}>
              {/* Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: getRoleColor(selectedUser.role).bg,
                  borderRadius: '12px',
                  border: `1px solid ${getRoleColor(selectedUser.role).color}30`
                }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</p>
                  <p style={{ margin: '0', fontSize: '15px', fontWeight: '700', color: getRoleColor(selectedUser.role).color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(() => {
                      const RoleIcon = getRoleColor(selectedUser.role).icon;
                      return <RoleIcon size={18} />;
                    })()}
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </p>
                </div>
                <div style={{
                  padding: '16px',
                  backgroundColor: selectedUser.isActive ? '#d1fae5' : '#fee2e2',
                  borderRadius: '12px',
                  border: `1px solid ${selectedUser.isActive ? '#059669' : '#dc2626'}30`
                }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</p>
                  <p style={{ margin: '0', fontSize: '15px', fontWeight: '700', color: selectedUser.isActive ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedUser.isActive ? <MdCheckCircle size={18} /> : <MdBlock size={18} />}
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedUser.role === 'student' && (
                  <>
                    <button
                      onClick={() => setShowEmailModal(true)}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: 'white',
                        color: '#1f2937',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <MdEmail size={20} style={{ color: '#2563eb' }} />
                      Send Email
                    </button>
                    <button
                      onClick={() => {
                        handleViewActivity(selectedUser._id);
                        setSelectedUser(null);
                      }}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: 'white',
                        color: '#1f2937',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#1f2937';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <MdVisibility size={20} style={{ color: '#1f2937' }} />
                      View Full Activity
                    </button>
                    <button
                      onClick={() => {
                        setConfirmAction({ type: 'assign-admin', id: selectedUser._id });
                        setSelectedUser(null);
                      }}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: 'white',
                        color: '#1f2937',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <MdSupervisorAccount size={20} style={{ color: '#d97706' }} />
                      Promote to Admin
                    </button>
                  </>
                )}
                {selectedUser.role === 'admin' && selectedUser._id !== localStorage.getItem('userId') && (
                  <button
                    onClick={() => {
                      setConfirmAction({ type: 'remove-admin', id: selectedUser._id });
                      setSelectedUser(null);
                    }}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'white',
                      color: '#1f2937',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <MdSupervisorAccount size={20} style={{ color: '#d97706' }} />
                    Remove Admin Role
                  </button>
                )}
                {selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => {
                      handleToggleStatus(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'white',
                      color: '#1f2937',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <MdBlock size={20} style={{ color: '#dc2626' }} />
                    <span>Deactivate</span>
                  </button>
                )}
                {selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => {
                      handleDelete(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'white',
                      color: '#1f2937',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <MdDelete size={20} style={{ color: '#dc2626' }} />
                    <span>Delete User</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '20px'
        }} onClick={() => setShowEmailModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            borderTop: '5px solid #2563eb'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              padding: '40px 40px 32px 40px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#1f2937' }}>
                  Send Email
                </h3>
                <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
                  To: {selectedUser?.fullName}
                </p>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#1f2937'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '32px 40px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1f2937', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1f2937', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Message
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleSendEmail}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1d4ed8';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Send Email
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction.type === 'toggle' ? 'Change User Status' :
            confirmAction.type === 'assign-admin' ? 'Promote to Admin' :
            confirmAction.type === 'remove-admin' ? 'Remove Admin Role' :
            confirmAction.type === 'delete-idea' ? 'Delete Idea' :
            'Delete User'
          }
          message={
            confirmAction.type === 'toggle' 
              ? 'Are you sure you want to change this user\'s status?' 
              : confirmAction.type === 'assign-admin'
              ? 'Are you sure you want to promote this student to admin? They will have full system access.'
              : confirmAction.type === 'remove-admin'
              ? 'Are you sure you want to remove admin privileges from this user?'
              : confirmAction.type === 'delete-idea'
              ? 'Are you sure you want to delete this idea? This action cannot be undone.'
              : 'Are you sure you want to delete this user? This action cannot be undone.'
          }
          confirmText={
            confirmAction.type === 'toggle' ? 'Change' :
            confirmAction.type === 'assign-admin' ? 'Promote' :
            confirmAction.type === 'remove-admin' ? 'Remove' :
            confirmAction.type === 'delete-idea' ? 'Delete' :
            'Delete'
          }
          cancelText="Cancel"
          isDangerous={confirmAction.type === 'delete' || confirmAction.type === 'remove-admin' || confirmAction.type === 'delete-idea'}
          onConfirm={executeAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Idea Detail Modal */}
      {selectedIdea && (
        <IdeaDetailModal 
          idea={selectedIdea} 
          onClose={() => setSelectedIdea(null)}
          showComments={false}
        />
      )}
    </div>
  );
};

export default ManageUsers;
