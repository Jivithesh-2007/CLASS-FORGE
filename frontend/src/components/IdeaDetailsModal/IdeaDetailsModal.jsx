import React, { useState, useEffect } from 'react';
import { MdClose, MdPerson, MdLightbulb, MdSchool, MdTag, MdChatBubble, MdAccessTime } from 'react-icons/md';
import styles from './IdeaDetailsModal.module.css';
import Spinner from '../Spinner/Spinner';
import { ideaAPI } from '../../services/api';

const IdeaDetailsModal = ({ ideaId, onClose }) => {
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIdeaDetails = async () => {
      try {
        setLoading(true);
        const response = await ideaAPI.getIdeaById(ideaId);
        setIdea(response.data.idea);
      } catch (err) {
        console.error('Error fetching idea details:', err);
        setError('Failed to load idea details.');
      } finally {
        setLoading(false);
      }
    };

    if (ideaId) {
      fetchIdeaDetails();
    }
  }, [ideaId]);

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
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Error</h3>
            <button onClick={onClose} className={styles.closeButton}>
              <MdClose />
            </button>
          </div>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return null; // Should not happen if error is handled
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{idea.title}</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <MdClose />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.metaInfo}>
            <span className={`${styles.status} ${getStatusClass(idea.status)}`}>
              {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
            </span>
            <div className={styles.metaItem}>
              <MdPerson />
              <span>Submitted by: <strong>{idea.submittedBy?.fullName}</strong></span>
            </div>
            <div className={styles.metaItem}>
              <MdLightbulb />
              <span>Domain: <strong>{idea.domain}</strong></span>
            </div>
            {idea.groupId && (
                <div className={styles.metaItem}>
                    <MdGroup />
                    <span>Group: <strong>{idea.groupId.name}</strong></span>
                </div>
            )}
            <div className={styles.metaItem}>
              <MdAccessTime />
              <span>Submitted on: {new Date(idea.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <p className={styles.description}>{idea.description}</p>

          {idea.tags && idea.tags.length > 0 && (
            <div className={styles.tags}>
              {idea.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  <MdTag /> {tag}
                </span>
              ))}
            </div>
          )}

          {idea.contributors && idea.contributors.length > 0 && (
            <div className={styles.contributors}>
              <h4>Contributors:</h4>
              <div className={styles.contributorList}>
                {idea.contributors.map((contributor, index) => (
                  <span key={index} className={styles.contributorItem}>
                    <MdPerson /> {contributor.fullName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {idea.feedback && (
            <div className={styles.feedback}>
              <h4><MdChatBubble /> Feedback:</h4>
              <p>{idea.feedback}</p>
              {idea.reviewedBy && (
                <span>Reviewed by: {idea.reviewedBy.fullName} on {new Date(idea.reviewedAt).toLocaleDateString()}</span>
              )}
            </div>
          )}

          {idea.mergedInto && (
            <div className={styles.mergedInfo}>
              <h4>Merged Info:</h4>
              <p>This idea was merged into: <strong>{idea.mergedInto.title}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailsModal;
