import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdCancel, MdSearch, MdClose, MdVisibility, MdMoreVert, MdArrowDropDown, MdPerson, MdCheckBox, MdCheckBoxOutlineBlank, MdMergeType } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ideaAPI } from '../../services/api';
import styles from './TeacherDashboard.module.css';
import formStyles from '../Login/Login.module.css';
import reviewStyles from './ReviewIdeas.module.css';

const ReviewIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [similarIdeas, setSimilarIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTitle, setMergeTitle] = useState('');
  const [mergeDescription, setMergeDescription] = useState('');
  const [mergeDomain, setMergeDomain] = useState('');

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

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleSelectIdea = async (idea) => {
    setSelectedIdea(idea);
    setFeedback('');
    setShowDetailModal(true);
    
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
      showMessage('success', `Idea ${status} successfully!`);
      setShowDetailModal(false);
      setSelectedIdea(null);
      setFeedback('');
      fetchPendingIdeas();
    } catch (error) {
      console.error('Error reviewing idea:', error);
      showMessage('error', error.response?.data?.message || 'Failed to review idea');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleViewInsights = async (idea) => {
    setSelectedIdea(idea);
    setFeedback('');
    setLoadingInsights(true);
    try {
      const response = await ideaAPI.getAiInsights(idea._id);
      
      // Show loading for minimum 3 seconds
      setTimeout(() => {
        setAiInsights(response.data);
        setLoadingInsights(false);
      }, 3000);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setLoadingInsights(false);
      showMessage('error', 'Failed to generate AI insights. Please try again.');
    }
  };

  const handleAiModalReview = async (status) => {
    if (!selectedIdea) return;
    setReviewLoading(true);
    try {
      await ideaAPI.reviewIdea(selectedIdea._id, { status, feedback });
      showMessage('success', `Idea ${status} successfully!`);
      setAiInsights(null);
      setSelectedIdea(null);
      setFeedback('');
      fetchPendingIdeas();
    } catch (error) {
      console.error('Error reviewing idea:', error);
      showMessage('error', error.response?.data?.message || 'Failed to review idea');
    } finally {
      setReviewLoading(false);
    }
  };

  const getFilteredAndSortedIdeas = () => {
    let filtered = ideas.filter(idea =>
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.submittedBy?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return filtered;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleSelectForMerge = (ideaId) => {
    setSelectedForMerge(prev => 
      prev.includes(ideaId) 
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const handleMergeClick = () => {
    if (selectedForMerge.length < 2) {
      showMessage('error', 'Please select at least 2 ideas to merge');
      return;
    }
    
    const selectedIdeas = ideas.filter(idea => selectedForMerge.includes(idea._id));
    setMergeTitle(selectedIdeas[0].title);
    setMergeDescription(selectedIdeas.map(i => i.description).join('\n\n'));
    setMergeDomain(selectedIdeas[0].domain);
    setShowMergeModal(true);
  };

  const handleMergeIdeas = async () => {
    if (!mergeTitle.trim()) {
      showMessage('error', 'Please enter a title for the merged idea');
      return;
    }

    setReviewLoading(true);
    try {
      await ideaAPI.mergeIdeas({
        ideaIds: selectedForMerge,
        title: mergeTitle,
        description: mergeDescription,
        domain: mergeDomain
      });
      
      showMessage('success', 'Ideas merged successfully!');
      setShowMergeModal(false);
      setSelectedForMerge([]);
      setMergeTitle('');
      setMergeDescription('');
      setMergeDomain('');
      fetchPendingIdeas();
    } catch (error) {
      console.error('Error merging ideas:', error);
      showMessage('error', error.response?.data?.message || 'Failed to merge ideas');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredIdeas = getFilteredAndSortedIdeas();

  return (
    <div className={styles.layout}>
      <Sidebar role="teacher" />
      <div className={styles.main}>
        <Header title="Review Ideas" />
        <div className={styles.content}>
          {message.text && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'slideDown 0.3s ease-out',
              backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
              border: `1px solid ${message.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`,
              color: message.type === 'success' ? '#2e7d32' : '#c62828'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{message.text}</span>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <MdClose size={18} />
              </button>
            </div>
          )}

          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          <div className={reviewStyles.splitContainer}>
            {/* LEFT SIDE - PENDING SUBMISSIONS */}
            <div className={reviewStyles.leftPanel}>
              <div className={reviewStyles.panelHeader}>
                <h2>Pending Submissions</h2>
                <span className={reviewStyles.badge}>{filteredIdeas.length}</span>
              </div>

              {filteredIdeas.length === 0 ? (
                <div className={reviewStyles.emptyPanel}>
                  <MdPerson size={40} />
                  <p>No pending ideas</p>
                </div>
              ) : (
                <div className={reviewStyles.submissionsList}>
                  {filteredIdeas.map((idea) => (
                    <div
                      key={idea._id}
                      className={`${reviewStyles.submissionItem} ${selectedIdea?._id === idea._id ? reviewStyles.active : ''} ${selectedForMerge.includes(idea._id) ? reviewStyles.selectedForMerge : ''}`}
                    >
                      <div className={reviewStyles.submissionItemContent}>
                        <button
                          className={reviewStyles.checkboxBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectForMerge(idea._id);
                          }}
                        >
                          {selectedForMerge.includes(idea._id) ? (
                            <MdCheckBox size={20} />
                          ) : (
                            <MdCheckBoxOutlineBlank size={20} />
                          )}
                        </button>
                        <div 
                          className={reviewStyles.submissionContent}
                          onClick={() => handleViewInsights(idea)}
                        >
                          <div className={reviewStyles.submissionTitle}>{idea.title}</div>
                          <div className={reviewStyles.submissionMeta}>
                            <span className={reviewStyles.domain}>{idea.domain}</span>
                            <span className={reviewStyles.date}>{formatDate(idea.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedForMerge.length > 0 && (
                <div className={reviewStyles.mergeActionBar}>
                  <span className={reviewStyles.selectedCount}>
                    {selectedForMerge.length} selected
                  </span>
                  <button
                    className={reviewStyles.mergeBtn}
                    onClick={handleMergeClick}
                  >
                    <MdMergeType size={18} /> Merge Ideas
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT SIDE - AI INSIGHTS */}
            <div className={reviewStyles.rightPanel}>
              {!selectedIdea ? (
                <div className={reviewStyles.emptyPanel}>
                  <MdPerson size={40} />
                  <p>Select an idea to view insights</p>
                </div>
              ) : loadingInsights ? (
                <div className={reviewStyles.loadingPanel}>
                  <div className={reviewStyles.loadingSpinner}></div>
                  <h3>Analysing the potential...</h3>
                  <p>Our AI is evaluating this idea for innovation, feasibility, and market potential</p>
                </div>
              ) : aiInsights ? (
                <div className={reviewStyles.insightsPanel}>
                  <div className={reviewStyles.insightHeader}>
                    <div>
                      <span className={reviewStyles.domainBadge}>{selectedIdea.domain}</span>
                      <h3>{selectedIdea.title}</h3>
                    </div>
                    <div className={reviewStyles.scoreDisplay}>
                      <div className={reviewStyles.scoreNumber}>{aiInsights.score}</div>
                      <div className={reviewStyles.scoreLabel}>SCORE</div>
                    </div>
                  </div>

                  <div className={reviewStyles.aiBox}>
                    <div className={reviewStyles.aiBoxHeader}>
                      <span className={reviewStyles.aiIcon}>✨</span>
                      <h4>AI Innovation Audit</h4>
                    </div>
                    <p className={reviewStyles.aiText}>{aiInsights.insight}</p>
                    
                    <div className={reviewStyles.keyPointsList}>
                      {aiInsights.keyPoints?.map((point, idx) => (
                        <div key={idx} className={reviewStyles.keyPointItem}>
                          <span className={reviewStyles.bullet}>•</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={reviewStyles.metricsRow}>
                    <div className={reviewStyles.metricItem}>
                      <span className={reviewStyles.metricLabel}>Feasibility</span>
                      <span className={reviewStyles.metricValue}>{aiInsights.feasibility}/10</span>
                    </div>
                    <div className={reviewStyles.metricItem}>
                      <span className={reviewStyles.metricLabel}>Realistic Impact</span>
                      <span className={reviewStyles.metricValue}>{aiInsights.impact}/10</span>
                    </div>
                    <div className={reviewStyles.metricItem}>
                      <span className={reviewStyles.metricLabel}>Expect Viability</span>
                      <span className={reviewStyles.metricValue}>{aiInsights.marketPotential}/10</span>
                    </div>
                  </div>

                  <div className={reviewStyles.feedbackBox}>
                    <label>Provide Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the student..."
                      rows="3"
                    />
                  </div>

                  <div className={reviewStyles.actionButtons}>
                    <button
                      onClick={() => handleAiModalReview('rejected')}
                      disabled={reviewLoading}
                      className={reviewStyles.rejectBtn}
                    >
                      <MdCancel /> Reject
                    </button>
                    <button
                      onClick={() => handleAiModalReview('approved')}
                      disabled={reviewLoading}
                      className={reviewStyles.approveBtn}
                    >
                      <MdCheckCircle /> Approve Submission
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showMergeModal && (
        <div className={reviewStyles.modalOverlay} onClick={() => setShowMergeModal(false)}>
          <div className={reviewStyles.mergeModal} onClick={(e) => e.stopPropagation()}>
            <div className={reviewStyles.mergeModalHeader}>
              <h2>Merge Ideas</h2>
              <button className={reviewStyles.closeBtn} onClick={() => setShowMergeModal(false)}>
                <MdClose size={24} />
              </button>
            </div>

            <div className={reviewStyles.mergeModalContent}>
              <div className={reviewStyles.mergeSection}>
                <label>Merged Idea Title</label>
                <input
                  type="text"
                  value={mergeTitle}
                  onChange={(e) => setMergeTitle(e.target.value)}
                  placeholder="Enter title for merged idea"
                  className={reviewStyles.mergeInput}
                />
              </div>

              <div className={reviewStyles.mergeSection}>
                <label>Domain</label>
                <input
                  type="text"
                  value={mergeDomain}
                  onChange={(e) => setMergeDomain(e.target.value)}
                  placeholder="Enter domain"
                  className={reviewStyles.mergeInput}
                />
              </div>

              <div className={reviewStyles.mergeSection}>
                <label>Combined Description</label>
                <textarea
                  value={mergeDescription}
                  onChange={(e) => setMergeDescription(e.target.value)}
                  placeholder="Combined description of merged ideas"
                  rows="6"
                  className={reviewStyles.mergeTextarea}
                />
              </div>

              <div className={reviewStyles.mergeInfo}>
                <h4>Ideas to Merge ({selectedForMerge.length})</h4>
                <div className={reviewStyles.mergeList}>
                  {ideas.filter(idea => selectedForMerge.includes(idea._id)).map((idea) => (
                    <div key={idea._id} className={reviewStyles.mergeListItem}>
                      <div>
                        <div className={reviewStyles.mergeListTitle}>{idea.title}</div>
                        <div className={reviewStyles.mergeListSubmitter}>
                          by {idea.submittedBy?.fullName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={reviewStyles.mergeModalActions}>
              <button
                className={reviewStyles.cancelBtn}
                onClick={() => setShowMergeModal(false)}
              >
                Cancel
              </button>
              <button
                className={reviewStyles.confirmMergeBtn}
                onClick={handleMergeIdeas}
                disabled={reviewLoading}
              >
                <MdMergeType size={18} /> Confirm Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewIdeas;
