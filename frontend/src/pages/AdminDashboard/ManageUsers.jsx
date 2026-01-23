import React, { useState, useEffect } from 'react';
import { MdBlock, MdCheckCircle, MdDelete } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import styles from '../StudentDashboard/Dashboard.module.css';

const ManageUsers = () => {
  const { success, error: showError } = useToast();
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  useEffect(() => {
    fetchUsers();
  }, [filterRole]);
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

  const executeAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === 'toggle') {
        await adminAPI.toggleUserStatus(confirmAction.id);
        success('User status updated successfully');
      } else if (confirmAction.type === 'delete') {
        await adminAPI.deleteUser(confirmAction.id);
        success('User deleted successfully');
      }
      fetchUsers();
      setConfirmAction(null);
    } catch (error) {
      console.error('Error:', error);
      showError(error.response?.data?.message || 'Operation failed');
    }
  };
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
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
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
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f7fa', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Department</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>{user.fullName}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          textTransform: 'capitalize'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{user.department || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: user.isActive ? '#e8f5e9' : '#ffebee',
                          color: user.isActive ? '#388e3c' : '#d32f2f'
                        }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleToggleStatus(user._id)}
                            disabled={user.role === 'admin'}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: user.isActive ? '#ffebee' : '#e8f5e9',
                              color: user.isActive ? '#d32f2f' : '#388e3c',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {user.isActive ? <MdBlock /> : <MdCheckCircle />}
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={user.role === 'admin'}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#ffebee',
                              color: '#d32f2f',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <MdDelete />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.type === 'toggle' ? 'Change User Status' : 'Delete User'}
          message={confirmAction.type === 'toggle' 
            ? 'Are you sure you want to change this user\'s status?' 
            : 'Are you sure you want to delete this user? This action cannot be undone.'}
          confirmText={confirmAction.type === 'toggle' ? 'Change' : 'Delete'}
          cancelText="Cancel"
          isDangerous={confirmAction.type === 'delete'}
          onConfirm={executeAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default ManageUsers;