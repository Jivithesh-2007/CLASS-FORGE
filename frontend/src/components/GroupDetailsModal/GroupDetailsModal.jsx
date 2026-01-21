import { MdClose, MdContentCopy, MdLogout } from 'react-icons/md';
import styles from './GroupDetailsModal.module.css';

const GroupDetailsModal = ({ group, isAdmin, onClose, onInvite, onDelete, onLeave }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
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
              {isAdmin && (
                <button onClick={onDelete} className={`${styles.actionBtn} ${styles.danger}`}>
                  <span>Delete Group</span>
                </button>
              )}
              <button onClick={onLeave} className={`${styles.actionBtn} ${styles.exit}`}>
                <MdLogout size={18} />
                <span>Exit Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsModal;
