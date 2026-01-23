import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import IdeaDetailModal from '../../components/IdeaDetailModal/IdeaDetailModal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { ideaAPI } from '../../services/api';
import styles from './TeacherDashboard.module.css';

const ApprovedIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    fetchApprovedIdeas();
  }, []);

  const fetchApprovedIdeas = async () => {
    try {
      const response = await ideaAPI.getIdeas({ status: 'approved' });
      setIdeas(response.data.ideas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return styles.statusPending;
      case 'approved': return styles.statusApproved;
      case 'rejected': return styles.statusRejected;
      case 'merged': return styles.statusMerged;
      default: return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar role="teacher" />
        <div className={styles.main}>
          <Header title="Approved Ideas" />
          <div className={styles.content}>
            <LoadingSpinner message="Loading approved ideas..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="teacher" />
      <div className={styles.main}>
        <Header title="Approved Ideas" />
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Approved Ideas</h2>
                <p className={styles.sectionSubtitle}>View all approved student ideas</p>
              </div>
            </div>

            {ideas.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>No approved ideas yet</div>
                <div className={styles.emptySubtext}>
                  Approved ideas will appear here
                </div>
              </div>
            ) : (
              <div className={styles.ideaTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>PROPOSAL DETAILS</div>
                  <div className={styles.headerCell}>STUDENT</div>
                  <div className={styles.headerCell}>DEPARTMENT</div>
                  <div className={styles.headerCell}>DATE</div>
                  <div className={styles.headerCell}>STATUS</div>
                </div>
                {ideas.map((idea) => (
                  <div 
                    key={idea._id} 
                    className={styles.ideaRow}
                    onClick={() => setSelectedIdea(idea)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.proposalDetails}>
                      <h3 className={styles.ideaRowTitleText}>{idea.title}</h3>
                      <p className={styles.ideaRowDescription}>{idea.description}</p>
                    </div>
                    <div className={styles.authorCell}>
                      <span className={styles.authorInitial}>{idea.submittedBy?.fullName?.charAt(0) || 'U'}</span>
                      <span className={styles.authorName}>{idea.submittedBy?.fullName || 'Unknown'}</span>
                    </div>
                    <div className={styles.departmentCell}>
                      {idea.domain}
                    </div>
                    <div className={styles.dateCell}>
                      {new Date(idea.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className={styles.statusCell}>
                      <span className={`${styles.status} ${getStatusClass(idea.status)}`}>
                        {idea.status === 'pending' ? 'Under Review' : idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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

export default ApprovedIdeas;
