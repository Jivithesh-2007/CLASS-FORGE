import { useState } from 'react';
import { MdClose, MdContentCopy, MdLogout, MdDelete } from 'react-icons/md';
import { useToast } from '../../context/ToastContext';
import styles from './GroupDetailsModal.module.css';

const GroupDetailsModal = ({ group, isAdmin, onClose, onInvite, onDelete, onLeave }) => {
  const { success } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    success('Copied to clipboard!');
  };

  const handleDeleteClick = async () => {
    setDeleting(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Group Details</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Group Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Group Information</h3>
            <div className={styles.infoItem}>
              <label>Name</label>
              <p>{group.name}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Description</label>
              <p>{group.description || 'No description'}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Group Code</label>
              <div className={styles.codeContainer}>
                <code>{group.groupCode}</code>
                <button 
                  onClick={() => copyToClipboard(group.groupCode)}
                  className={styles.copyBtn}
                  title="Copy code"
                >
                  <MdContentCopy size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Members ({group.members?.length || 0})</h3>
            <div className={styles.membersList}>
              {group.members?.map((member, idx) => (
                <div key={idx} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>
                    {member.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>{member.user?.fullName}</div>
                    <div className={styles.memberEmail}>{member.user?.email}</div>
                  </div>
                  <div className={styles.memberRole}>
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Actions</h3>
            <div className={styles.actionsList}>
              <button onClick={onInvite} className={styles.actionBtn}>
                <span>Invite Member</span>
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className={`${styles.actionBtn} ${styles.danger}`}
              >
                <MdDelete size={18} />
                <span>Delete Group</span>
              </button>
              <button onClick={onLeave} className={`${styles.actionBtn} ${styles.exit}`}>
                <MdLogout size={18} />
                <span>Exit Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.confirmOverlay} onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmHeader}>
              <h3 className={styles.confirmTitle}>Delete Group</h3>
            </div>
            <div className={styles.confirmContent}>
              <p>Are you sure you want to delete this group?</p>
              <p style={{ marginTop: '12px', color: '#ef4444', fontWeight: '500' }}>
                This action cannot be undone. All messages and group data will be permanently deleted.
              </p>
            </div>
            <div className={styles.confirmFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmDeleteBtn}
                onClick={handleDeleteClick}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailsModal;
