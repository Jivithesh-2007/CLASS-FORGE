import React from 'react';
import { MdChevronRight, MdCheckCircle, MdSchedule, MdCancel } from 'react-icons/md';
import styles from './StudentCard.module.css';

const StudentCard = ({ student, onClick }) => {
  const approvalRate = student.totalIdeas > 0 
    ? Math.round((student.approvedIdeas / student.totalIdeas) * 100) 
    : 0;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div onClick={onClick} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.studentInfo}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              {getInitials(student.fullName)}
            </div>
            <div className={`${styles.statusIndicator} ${student.isActive ? styles.active : styles.inactive}`} />
          </div>
          <div>
            <h3 className={styles.name}>{student.fullName}</h3>
            <p className={styles.studentId}>{student.studentId || student._id.slice(0, 8)}</p>
          </div>
        </div>
        <MdChevronRight className={styles.chevron} size={18} />
      </div>

      <div className={styles.content}>
        <div className={styles.department}>
          <span className={styles.label}>Department</span>
          <span className={styles.value}>{student.department}</span>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <p className={styles.statLabel}>Total Ideas</p>
            <p className={styles.statValue}>{student.totalIdeas}</p>
          </div>
          <div className={styles.statBox}>
            <p className={styles.statLabel}>Approval</p>
            <p className={styles.statValue}>{approvalRate}%</p>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.lastActive}>Last active: {student.lastActivityDate || 'N/A'}</span>
        <span className={`${styles.statusBadge} ${student.isActive ? styles.activeBadge : styles.inactiveBadge}`}>
          {student.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

export default StudentCard;
