import { useState, useEffect } from 'react';
import { MdArrowBack, MdLightbulb } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import IdeaDetailModal from '../../components/IdeaDetailModal/IdeaDetailModal';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import styles from '../StudentDashboard/Dashboard.module.css';

const StudentActivity = ({ studentId, onBack }) => {
  const { error: showError } = useToast();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    fetchStudentActivity();
  }, [studentId]);

  const fetchStudentActivity = async () => {
    try {
      const response = await adminAPI.getStudentActivity(studentId);
      setActivity(response.data);
    } catch (error) {
      console.error('Error fetching student activity:', error);
      showError('Failed to load student activity');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar role="admin" />
        <div className={styles.main}>
          <Header title="Student Activity" />
          <div className={styles.content}>
            <LoadingSpinner message="Loading student activity..." />
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className={styles.layout}>
        <Sidebar role="admin" />
        <div className={styles.main}>
          <Header title="Student Activity" />
          <div className={styles.content}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No activity found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'merged': return '#2196f3';
      default: return '#999';
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar role="admin" />
      <div className={styles.main}>
        <Header title="Student Activity" subtitle={`${activity.student.fullName}'s Ideas`} />
        <div className={styles.content}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'white',
              border: '1px solid #e5e7eb',
              color: '#1f2937',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '24px',
              padding: '12px 16px',
              borderRadius: '10px',
              transition: 'all 0.2s ease'
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
            <MdArrowBack size={18} style={{ color: '#1f2937' }} /> Back to Users
          </button>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
              {activity.student.fullName}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <span style={{ color: '#999', fontSize: '12px' }}>Email</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{activity.student.email}</p>
              </div>
              <div>
                <span style={{ color: '#999', fontSize: '12px' }}>Department</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{activity.student.department || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#000' }}>
                {activity.stats.totalIdeas}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Total Ideas</div>
            </div>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ff9800' }}>
                {activity.stats.pending}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Pending</div>
            </div>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50' }}>
                {activity.stats.approved}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Approved</div>
            </div>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f44336' }}>
                {activity.stats.rejected}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Rejected</div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700' }}>
              Ideas ({activity.ideas.length})
            </h3>
            {activity.ideas.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                <MdLightbulb size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>No ideas submitted yet</p>
              </div>
            ) : (
              <div className={styles.ideaGrid}>
                {activity.ideas.map((idea) => (
                  <div 
                    key={idea._id} 
                    className={styles.ideaCard}
                    onClick={() => setSelectedIdea(idea)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.ideaHeader}>
                      <h3 className={styles.ideaTitle}>{idea.title}</h3>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      display: 'inline-block',
                      width: 'fit-content',
                      backgroundColor: idea.status === 'approved' ? '#d1fae5' : idea.status === 'pending' ? '#fef3c7' : idea.status === 'merged' ? '#dbeafe' : '#fee2e2',
                      color: idea.status === 'approved' ? '#059669' : idea.status === 'pending' ? '#d97706' : idea.status === 'merged' ? '#2563eb' : '#dc2626'
                    }}>
                      {idea.status}
                    </div>
                    <p className={styles.ideaDescription}>{idea.description}</p>
                    <div className={styles.ideaFooter}>
                      <div className={styles.ideaMeta}>
                        <span>{idea.domain}</span>
                        <span>•</span>
                        <span>{new Date(idea.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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

export default StudentActivity;
