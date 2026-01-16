import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdCancel, MdMerge, MdSearch, MdClose } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ideaAPI } from '../../services/api';
import styles from '../StudentDashboard/Dashboard.module.css';
import formStyles from '../Login/Login.module.css';
import Spinner from '../../components/Spinner/Spinner';

const ReviewIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [similarIdeas, setSimilarIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedIdeasToMerge, setSelectedIdeasToMerge] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeFormData, setMergeFormData] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchPendingIdeas();
  }, []);

  const fetchPendingIdeas = async () => {
    try {
      const response = await ideaAPI.getIdeas({ status: 'pending' });
      setIdeas(response.data.ideas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIdea = async (idea) => {
    setSelectedIdea(idea);
    setFeedback('');
    
    try {
      const response = await ideaAPI.getSimilarIdeas(idea._id);
      setSimilarIdeas(response.data.similarIdeas || []);
    } catch (error) {
      console.error('Error fetching similar ideas:', error);
      setSimilarIdeas([]);
    }
  };

  const handleReview = async (status) => {
    if (!selectedIdea) return;
    setReviewLoading(true);
    try {
      await ideaAPI.reviewIdea(selectedIdea._id, { status, feedback });
      alert(`Idea ${status} successfully!`);
      setSelectedIdea(null);
      setFeedback('');
      fetchPendingIdeas();
    } catch (error) {
      console.error('Error reviewing idea:', error);
      alert(error.response?.data?.message || 'Failed to review idea');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleMergeCheckboxChange = (ideaId) => {
    setSelectedIdeasToMerge(prev => 
      prev.includes(ideaId) ? prev.filter(id => id !== ideaId) : [...prev, ideaId]
    );
  };

  const handleInitiateMerge = () => {
    if (selectedIdeasToMerge.length < 2) {
      alert('Please select at least two ideas to merge.');
      return;
    }
    const firstIdea = ideas.find(idea => idea._id === selectedIdeasToMerge[0]);
    if (firstIdea) {
      setMergeFormData({
        title: firstIdea.title,
        description: firstIdea.description
      });
    }
    setShowMergeModal(true);
  };

  const handleConfirmMerge = async (e) => {
    e.preventDefault();
    if (selectedIdeasToMerge.length < 2) {
      alert('Please select at least two ideas to merge.');
      return;
    }
    setReviewLoading(true);
    try {
      await ideaAPI.mergeIdeas({ 
        ideaIds: selectedIdeasToMerge,
        title: mergeFormData.title,
        description: mergeFormData.description
      });
      alert('Ideas merged successfully!');
      setSelectedIdea(null);
      setSelectedIdeasToMerge([]);
      setMergeFormData({ title: '', description: '' });
      setShowMergeModal(false);
      fetchPendingIdeas();
    } catch (error) {
      console.error('Error merging ideas:', error);
      alert(error.response?.data?.message || 'Failed to merge ideas');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="teacher" />
      <div className={styles.main}>
        <Header title="Review Ideas" subtitle="Review and manage student submissions" />
        <div className={styles.content}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Pending Ideas</h2>
                <button 
                  className={styles.button} 
                  onClick={handleInitiateMerge} 
                  disabled={selectedIdeasToMerge.length < 2 || reviewLoading}
                  style={{ 
                    backgroundColor: selectedIdeasToMerge.length < 2 ? '#ccc' : 'var(--primary-color)',
                    cursor: selectedIdeasToMerge.length < 2 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <MdMerge /> Merge Selected Ideas
                </button>
              </div>

              {ideas.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyText}>No pending ideas</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ideas.map((idea) => (
                    <div
                      key={idea._id}
                      style={{
                        padding: '16px',
                        border: selectedIdea?._id === idea._id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedIdea?._id === idea._id ? '#e3f2fd' : 'var(--white)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedIdeasToMerge.includes(idea._id)}
                        onChange={() => handleMergeCheckboxChange(idea._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div onClick={() => handleSelectIdea(idea)} style={{ flexGrow: 1 }}>
                        <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{idea.title}</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          {idea.description.substring(0, 100)}...
                        </p>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <span>{idea.submittedBy?.fullName}</span> • <span>{idea.domain}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.section}>
              {selectedIdea ? (
                <>
                  <h2 className={styles.sectionTitle}>Idea Details</h2>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{selectedIdea.title}</h3>
                    <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>{selectedIdea.description}</p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <span><strong>Domain:</strong> {selectedIdea.domain}</span>
                      <span><strong>Student:</strong> {selectedIdea.submittedBy?.fullName}</span>
                    </div>
                    {selectedIdea.tags && selectedIdea.tags.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedIdea.tags.map((tag, idx) => (
                          <span key={idx} style={{
                            padding: '4px 12px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {similarIdeas.length > 0 && (
                    <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
                      <h4 style={{ marginBottom: '12px', color: '#f57c00' }}>
                        <MdSearch /> Similar Ideas Found ({similarIdeas.length})
                      </h4>
                      <p style={{ fontSize: '13px', marginBottom: '12px' }}>
                        Consider merging similar ideas to avoid duplication
                      </p>
                      {similarIdeas.map((similar, idx) => (
                        <div key={idx} style={{ fontSize: '13px', marginBottom: '8px' }}>
                          • {similar.idea.title} (Similarity: {similar.similarityScore}%)
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={formStyles.formGroup}>
                    <label className={formStyles.label}>Feedback (Optional)</label>
                    <textarea
                      className={formStyles.input}
                      rows="4"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the student..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button
                      onClick={() => handleReview('approved')}
                      disabled={reviewLoading}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: 'var(--success-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <MdCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => handleReview('rejected')}
                      disabled={reviewLoading}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: 'var(--danger-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <MdCancel /> Reject
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyText}>Select an idea to review</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMergeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            padding: '32px',
            borderRadius: 'var(--radius-md)',
            width: '90%',
            maxWidth: '600px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Confirm Merge Ideas</h3>
              <button onClick={() => setShowMergeModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <MdClose />
              </button>
            </div>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              You are about to merge {selectedIdeasToMerge.length} ideas into one.
              Optionally, provide a new title and description for the merged idea.
            </p>
            <form onSubmit={handleConfirmMerge}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Merged Idea Title (Optional)</label>
                <input
                  type="text"
                  value={mergeFormData.title}
                  onChange={(e) => setMergeFormData({...mergeFormData, title: e.target.value})}
                  className={formStyles.input}
                  placeholder="Leave blank to use title of first selected idea"
                />
              </div>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Merged Idea Description (Optional)</label>
                <textarea
                  value={mergeFormData.description}
                  onChange={(e) => setMergeFormData({...mergeFormData, description: e.target.value})}
                  className={formStyles.input}
                  rows="5"
                  placeholder="Leave blank to concatenate descriptions of selected ideas"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {reviewLoading ? 'Merging...' : <><MdMerge /> Confirm Merge</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  disabled={reviewLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ccc',
                    color: 'var(--text-primary)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReviewIdeas;