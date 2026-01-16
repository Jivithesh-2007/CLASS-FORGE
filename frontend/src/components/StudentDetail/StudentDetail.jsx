import React from 'react';
import { MdClose, MdCheckCircle, MdSchedule, MdCancel, MdFileDownload, MdSend } from 'react-icons/md';
import styles from './StudentDetail.module.css';

const StudentDetail = ({ student, onClose }) => {
  const chartData = [
    { name: 'Approved', value: student.approvedIdeas, color: '#10b981' },
    { name: 'Pending', value: student.pendingIdeas, color: '#f59e0b' },
    { name: 'Rejected', value: student.rejectedIdeas, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const kpis = [
    { label: 'Total Ideas', value: student.totalIdeas, icon: MdFileDownload, color: 'indigo' },
    { label: 'Approved', value: student.approvedIdeas, icon: MdCheckCircle, color: 'emerald' },
    { label: 'Pending Review', value: student.pendingIdeas, icon: MdSchedule, color: 'amber' },
    { label: 'Rejected', value: student.rejectedIdeas, icon: MdCancel, color: 'rose' }
  ];

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getColorClass = (color) => {
    const colors = {
      indigo: { bg: '#eef2ff', text: '#4f46e5' },
      emerald: { bg: '#ecfdf5', text: '#10b981' },
      amber: { bg: '#fffbeb', text: '#f59e0b' },
      rose: { bg: '#ffe4e6', text: '#ef4444' }
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Student Profile</h2>
        <button onClick={onClose} className={styles.closeBtn}>
          <MdClose size={20} />
        </button>
      </div>

      <div className={styles.scrollContainer}>
        {/* Profile Overview */}
        <div className={styles.profileSection}>
          <div className={styles.profileHeader}>
            <div className={styles.largeAvatar}>
              {getInitials(student.fullName)}
            </div>
            <div>
              <h3 className={styles.profileName}>{student.fullName}</h3>
              <p className={styles.profileSubtitle}>
                {student.program || 'Student'} in {student.department}
              </p>
              <div className={styles.badges}>
                <span className={styles.badge}>{student.studentId || student._id.slice(0, 8)}</span>
                <span className={styles.yearBadge}>{student.year || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className={styles.kpiGrid}>
            {kpis.map((kpi) => {
              const colors = getColorClass(kpi.color);
              return (
                <div key={kpi.label} className={styles.kpiCard}>
                  <div className={styles.kpiIcon} style={{ backgroundColor: colors.bg, color: colors.text }}>
                    <kpi.icon size={18} />
                  </div>
                  <span className={styles.kpiValue}>{kpi.value}</span>
                  <span className={styles.kpiLabel}>{kpi.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics Chart */}
        {student.totalIdeas > 0 && (
          <div className={styles.chartSection}>
            <h4 className={styles.sectionTitle}>Approval Distribution</h4>
            <div className={styles.chartContainer}>
              <div className={styles.pieChart}>
                {chartData.map((item, idx) => (
                  <div
                    key={item.name}
                    className={styles.chartSegment}
                    style={{
                      width: `${(item.value / student.totalIdeas) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                ))}
              </div>
              <div className={styles.chartLegend}>
                {chartData.map((item) => (
                  <div key={item.name} className={styles.legendItem}>
                    <div
                      className={styles.legendColor}
                      style={{ backgroundColor: item.color }}
                    />
                    <span className={styles.legendText}>
                      {item.name} ({Math.round((item.value / student.totalIdeas) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Ideas */}
        <div className={styles.ideasSection}>
          <div className={styles.ideasHeader}>
            <h4 className={styles.sectionTitle}>Recent Ideas</h4>
            <span className={styles.viewAll}>View all</span>
          </div>
          <div className={styles.ideasList}>
            {student.recentIdeas && student.recentIdeas.length > 0 ? (
              student.recentIdeas.slice(0, 5).map((idea) => (
                <div key={idea._id} className={styles.ideaItem}>
                  <div>
                    <h5 className={styles.ideaTitle}>{idea.title}</h5>
                    <div className={styles.ideaMeta}>
                      <span className={styles.ideaDomain}>{idea.domain}</span>
                      <span className={styles.metaSeparator}>•</span>
                      <span className={styles.ideaDate}>
                        {idea.submissionDate || new Date(idea.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.ideaStatus}>
                    <span
                      className={`${styles.statusBadge} ${
                        idea.status === 'approved'
                          ? styles.approvedBadge
                          : idea.status === 'pending'
                          ? styles.pendingBadge
                          : styles.rejectedBadge
                      }`}
                    >
                      {idea.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No submissions found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <button className={styles.secondaryBtn}>
          <MdFileDownload size={16} /> Download PDF Report
        </button>
        <button className={styles.primaryBtn}>
          <MdSend size={16} /> Send Message
        </button>
      </div>
    </div>
  );
};

export default StudentDetail;
