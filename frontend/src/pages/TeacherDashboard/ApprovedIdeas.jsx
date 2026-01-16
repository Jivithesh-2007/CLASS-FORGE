import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ideaAPI } from '../../services/api';
import styles from '../StudentDashboard/Dashboard.module.css';
import Spinner from '../../components/Spinner/Spinner'; // Moved to top level

const ApprovedIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);

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

  const handleCardClick = (ideaId) => {
    setSelectedIdeaId(ideaId);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedIdeaId(null);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="teacher" />
      <div className={styles.main}>
        <Header title="Approved Ideas" subtitle="View all approved student ideas" />
        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Approved Ideas ({ideas.length})</h2>
            {ideas.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>No approved ideas yet</div>
              </div>
            ) : (
              <div className={styles.ideaGrid}>
                {ideas.map((idea) => (
                  <div key={idea._id} className={styles.ideaCard} onClick={() => handleCardClick(idea._id)}>
                    <h3 className={styles.ideaTitle}>{idea.title}</h3>
                    <p className={styles.ideaDescription}>{idea.description}</p>
                    <div className={styles.ideaFooter}>
                      <div className={styles.ideaMeta}>
                        <span>{idea.domain}</span>
                        <span>•</span>
                        <span>{idea.submittedBy?.fullName}</span>
                      </div>
                      <span className={`${styles.status} ${styles.statusApproved}`}>
                        Approved
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetailsModal && (
        <IdeaDetailsModal ideaId={selectedIdeaId} onClose={handleCloseModal} />
      )}
    </div>
  );
};
export default ApprovedIdeas;