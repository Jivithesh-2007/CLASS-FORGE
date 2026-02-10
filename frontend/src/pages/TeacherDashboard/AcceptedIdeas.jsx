import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdMessage, MdLink } from 'react-icons/md';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './TeacherDashboard.module.css';

const AcceptedIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    fetchAcceptedIdeas();
  }, []);

  const fetchAcceptedIdeas = async () => {
    try {
      const response = await fetch('/api/ideas/mentor/accepted-ideas', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setIdeas(data.ideas);
      }
    } catch (error) {
      console.error('Error fetching accepted ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading accepted ideas..." />;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>My Accepted Ideas</h2>
      {ideas.length === 0 ? (
        <div className={styles.emptyState}>
          <MdCheckCircle className={styles.emptyIcon} />
          <div className={styles.emptyText}>No accepted ideas yet</div>
        </div>
      ) : (
        <div className={styles.ideasList}>
          {ideas.map((idea) => (
            <div key={idea._id} className={styles.ideaCard}>
              <div className={styles.ideaCardHeader}>
                <h3>{idea.title}</h3>
                <span className={styles.domain}>{idea.domain}</span>
              </div>
              <p className={styles.description}>{idea.description.substring(0, 150)}...</p>
              <div className={styles.studentInfo}>
                <strong>Student:</strong> {idea.submittedBy?.fullName}
              </div>
              <div className={styles.ideaCardFooter}>
                <button 
                  className={styles.btnSecondary}
                  onClick={() => setSelectedIdea(idea)}
                >
                  <MdMessage /> View Discussion
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedIdea && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{selectedIdea.title}</h3>
            <p>{selectedIdea.description}</p>
            
            <div className={styles.discussionSection}>
              <h4>Discussion History</h4>
              {selectedIdea.discussions && selectedIdea.discussions.length > 0 ? (
                <div className={styles.messages}>
                  {selectedIdea.discussions.map((discussion) => (
                    <div key={discussion._id}>
                      {discussion.messages.map((msg, idx) => (
                        <div key={idx} className={styles.message}>
                          <strong>{msg.senderName}:</strong> {msg.content}
                        </div>
                      ))}
                      {discussion.meetLink && (
                        <div className={styles.meetLink}>
                          <MdLink /> <a href={discussion.meetLink} target="_blank" rel="noopener noreferrer">Join Meet Discussion</a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No discussion history yet</p>
              )}
            </div>

            <button 
              className={styles.btnClose}
              onClick={() => setSelectedIdea(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptedIdeas;
