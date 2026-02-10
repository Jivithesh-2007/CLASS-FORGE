import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdMessage, MdLink } from 'react-icons/md';
import { ideaAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './TeacherDashboard.module.css';

const InterestedIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [message, setMessage] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchInterestedIdeas();
  }, []);

  const fetchInterestedIdeas = async () => {
    try {
      const response = await fetch('/api/ideas/mentor/interested-ideas', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setIdeas(data.ideas);
      }
    } catch (error) {
      console.error('Error fetching interested ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (ideaId) => {
    if (!message.trim()) return;
    setSendingMessage(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: message })
      });
      const data = await response.json();
      if (data.success) {
        setMessage('');
        fetchInterestedIdeas();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAddMeetLink = async (ideaId, discussionId) => {
    if (!meetLink.trim()) return;
    try {
      const response = await fetch(`/api/ideas/${ideaId}/discussions/${discussionId}/meet-link`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ meetLink })
      });
      const data = await response.json();
      if (data.success) {
        setMeetLink('');
        fetchInterestedIdeas();
      }
    } catch (error) {
      console.error('Error adding meet link:', error);
    }
  };

  const handleAcceptIdea = async (ideaId) => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchInterestedIdeas();
        setSelectedIdea(null);
      }
    } catch (error) {
      console.error('Error accepting idea:', error);
    }
  };

  if (loading) return <LoadingSpinner message="Loading interested ideas..." />;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Ideas I'm Interested In</h2>
      {ideas.length === 0 ? (
        <div className={styles.emptyState}>
          <MdMessage className={styles.emptyIcon} />
          <div className={styles.emptyText}>No interested ideas yet</div>
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
              <div className={styles.ideaCardFooter}>
                <button 
                  className={styles.btnSecondary}
                  onClick={() => setSelectedIdea(idea)}
                >
                  <MdMessage /> View Details
                </button>
                <button 
                  className={styles.btnPrimary}
                  onClick={() => handleAcceptIdea(idea._id)}
                >
                  <MdCheckCircle /> Accept Idea
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
              <h4>Discussion</h4>
              <div className={styles.messageInput}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send a message to the student..."
                  rows="3"
                />
                <button 
                  onClick={() => handleSendMessage(selectedIdea._id)}
                  disabled={sendingMessage}
                >
                  Send Message
                </button>
              </div>

              <div className={styles.meetLinkInput}>
                <input
                  type="text"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  placeholder="Add Google Meet link..."
                />
                <button 
                  onClick={() => handleAddMeetLink(selectedIdea._id, selectedIdea.discussions?.[0]?._id)}
                >
                  <MdLink /> Add Meet Link
                </button>
              </div>
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

export default InterestedIdeas;
