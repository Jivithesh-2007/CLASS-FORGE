import React, { useState, useEffect } from 'react';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ideaAPI } from '../../services/api';
import styles from './Dashboard.module.css';
import Spinner from '../../components/Spinner/Spinner';
import IdeaDetailsModal from '../../components/IdeaDetailsModal/IdeaDetailsModal';

const MyIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredIdeas(ideas);
    } else {
      setFilteredIdeas(ideas.filter(idea => idea.status === filterStatus));
    }
  }, [filterStatus, ideas]);

  const fetchIdeas = async () => {
    try {
      const response = await ideaAPI.getIdeas({});
      setIdeas(response.data.ideas);
      setFilteredIdeas(response.data.ideas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await ideaAPI.deleteIdea(id);
        fetchIdeas();
      } catch (error) {
        console.error('Error deleting idea:', error);
        alert(error.response?.data?.message || 'Failed to delete idea');
      }
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
    return <Spinner />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header title="My Ideas" subtitle="Manage your submitted ideas" />
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>All My Ideas</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="merged">Merged</option>
                </select>
              </div>
            </div>
            {filteredIdeas.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>No ideas found</div>
                <div className={styles.emptySubtext}>
                  {filterStatus === 'all' 
                    ? 'Submit your first idea to get started' 
                    : `No ${filterStatus} ideas`}
                </div>
              </div>
            ) : (
              <div className={styles.ideaGrid}>
                {filteredIdeas.map((idea) => (
                  <div key={idea._id} className={styles.ideaCard} onClick={() => handleCardClick(idea._id)}>
                    <div className={styles.ideaHeader}>
                      <h3 className={styles.ideaTitle}>{idea.title}</h3>
                    </div>
                    <span className={`${styles.status} ${getStatusClass(idea.status)}`}>
                      {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                    </span>
                    <p className={styles.ideaDescription}>{idea.description}</p>
                    <div className={styles.ideaFooter}>
                      <div className={styles.ideaMeta}>
                        <span>{idea.domain}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {idea.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(idea._id); }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--danger-color)',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title="Delete"
                            >
                              <MdDelete size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {idea.feedback && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#f5f7fa',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}>
                        <strong>Feedback:</strong> {idea.feedback}
                      </div>
                    )}
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
export default MyIdeas;