import React, { useState } from 'react';
import { MdClose, MdCheckCircle, MdSchedule, MdCancel, MdFileDownload, MdSend, MdCheckBox, MdCheckBoxOutlineBlank, MdArrowBack } from 'react-icons/md';
import IdeaDetailModal from '../IdeaDetailModal/IdeaDetailModal';
import styles from './StudentDetail.module.css';

const StudentDetail = ({ student, onClose }) => {
  const [showAllIdeas, setShowAllIdeas] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [selectedIdeasForMerge, setSelectedIdeasForMerge] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTitle, setMergeTitle] = useState('');
  const [mergeDescription, setMergeDescription] = useState('');
  const [mergeDomain, setMergeDomain] = useState('');
  const [merging, setMerging] = useState(false);

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

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          to: student.email,
          subject: emailSubject,
          message: emailMessage
        })
      });
      
      if (response.ok) {
        setEmailSubject('');
        setEmailMessage('');
        setShowEmailModal(false);
      } else {
        alert('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email');
    } finally {
      setSending(false);
    }
  };

  const toggleIdeaSelection = (ideaId) => {
    setSelectedIdeasForMerge(prev => {
      if (prev.includes(ideaId)) {
        return prev.filter(id => id !== ideaId);
      } else if (prev.length < 2) {
        return [...prev, ideaId];
      }
      return prev;
    });
  };

  const handleMergeIdeas = async (e) => {
    e.preventDefault();
    if (selectedIdeasForMerge.length !== 2) {
      alert('Please select exactly 2 ideas to merge');
      return;
    }

    setMerging(true);
    try {
      const response = await fetch('http://localhost:5001/api/ideas/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ideaIds: selectedIdeasForMerge,
          title: mergeTitle || `${student.recentIdeas.find(i => i._id === selectedIdeasForMerge[0])?.title} + ${student.recentIdeas.find(i => i._id === selectedIdeasForMerge[1])?.title}`,
          description: mergeDescription,
          domain: mergeDomain
        })
      });

      if (response.ok) {
        alert('Ideas merged successfully!');
        setSelectedIdeasForMerge([]);
        setShowMergeModal(false);
        setMergeTitle('');
        setMergeDescription('');
        setMergeDomain('');
        window.location.reload();
      } else {
        alert('Failed to merge ideas');
      }
    } catch (error) {
      console.error('Error merging ideas:', error);
      alert('Error merging ideas');
    } finally {
      setMerging(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = `
Student Profile Report
======================

Name: ${student.fullName}
Department: ${student.department}
Student ID: ${student.studentId || student._id.slice(0, 8)}
Year: ${student.year || 'N/A'}

Statistics
==========
Total Ideas: ${student.totalIdeas}
Approved: ${student.approvedIdeas}
Pending Review: ${student.pendingIdeas}
Rejected: ${student.rejectedIdeas}
Approval Rate: ${student.totalIdeas > 0 ? Math.round((student.approvedIdeas / student.totalIdeas) * 100) : 0}%

Recent Ideas
============
${student.recentIdeas?.map(idea => `
- ${idea.title}
  Domain: ${idea.domain}
  Status: ${idea.status}
  Date: ${new Date(idea.createdAt).toLocaleDateString()}
`).join('\n') || 'No ideas submitted'}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(doc));
    element.setAttribute('download', `${student.fullName}_Report.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onClose} className={styles.backBtn} title="Back to Students">
          <MdArrowBack size={24} color="#ef4444" />
        </button>
        <h2 className={styles.title}>Student Profile</h2>
        <button onClick={onClose} className={styles.closeBtn} title="Close">
          <MdClose size={24} color="#ef4444" />
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
            <span 
              className={styles.viewAll}
              onClick={() => setShowAllIdeas(!showAllIdeas)}
              style={{ cursor: 'pointer', color: '#000000', fontWeight: '600' }}
            >
              {showAllIdeas ? 'Show Less' : 'View all'}
            </span>
          </div>
          <div className={styles.ideasList}>
            {student.recentIdeas && student.recentIdeas.length > 0 ? (
              (showAllIdeas ? student.recentIdeas : student.recentIdeas.slice(0, 5)).map((idea) => (
                <div key={idea._id} className={styles.ideaItemWrapper}>
                  <div 
                    className={styles.ideaItem}
                    onClick={() => setSelectedIdea(idea)}
                    style={{ cursor: 'pointer' }}
                  >
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
                            : idea.status === 'merged'
                            ? styles.mergedBadge
                            : styles.rejectedBadge
                        }`}
                      >
                        {idea.status}
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.checkboxBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleIdeaSelection(idea._id);
                    }}
                    title={selectedIdeasForMerge.includes(idea._id) ? 'Deselect for merge' : 'Select for merge'}
                  >
                    {selectedIdeasForMerge.includes(idea._id) ? (
                      <MdCheckBox size={20} color="#000000" />
                    ) : (
                      <MdCheckBoxOutlineBlank size={20} color="#999999" />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No submissions found</p>
              </div>
            )}
          </div>
          {selectedIdeasForMerge.length === 2 && (
            <button 
              className={styles.mergeBtn}
              onClick={() => setShowMergeModal(true)}
            >
              Merge Selected Ideas
            </button>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <button className={styles.secondaryBtn} onClick={handleDownloadPDF}>
          <MdFileDownload size={16} /> Download PDF Report
        </button>
        <button 
          className={styles.primaryBtn}
          onClick={() => setShowEmailModal(true)}
          style={{ backgroundColor: '#000000', color: '#ffffff' }}
        >
          <MdSend size={16} /> Send Message
        </button>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#000000' }}>
              Send Message to {student.fullName}
            </h3>
            <form onSubmit={handleSendEmail}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter subject"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Message
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter your message"
                  required
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f0f0f0',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: sending ? 0.6 : 1
                  }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {showMergeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#000000' }}>
              Merge Ideas
            </h3>
            <form onSubmit={handleMergeIdeas}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Merged Title
                </label>
                <input
                  type="text"
                  value={mergeTitle}
                  onChange={(e) => setMergeTitle(e.target.value)}
                  placeholder="Enter merged idea title (optional)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Domain
                </label>
                <input
                  type="text"
                  value={mergeDomain}
                  onChange={(e) => setMergeDomain(e.target.value)}
                  placeholder="Enter domain (optional)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Description
                </label>
                <textarea
                  value={mergeDescription}
                  onChange={(e) => setMergeDescription(e.target.value)}
                  placeholder="Enter merged description (optional)"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f0f0f0',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={merging}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: merging ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: merging ? 0.6 : 1
                  }}
                >
                  {merging ? 'Merging...' : 'Merge Ideas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Idea Detail Modal */}
      {selectedIdea && (
        <IdeaDetailModal 
          idea={selectedIdea} 
          onClose={() => setSelectedIdea(null)}
          showComments={true}
        />
      )}
    </div>
  );
};

export default StudentDetail;
