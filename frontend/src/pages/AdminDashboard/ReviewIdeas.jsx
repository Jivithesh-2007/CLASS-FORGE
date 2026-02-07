import { useState, useEffect } from 'react';
import { MdCheckCircle, MdCancel, MdClose, MdPerson, MdCheckBox, MdCheckBoxOutlineBlank, MdMergeType, MdDescription, MdNotes, MdAutoAwesome } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { ideaAPI, adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import styles from '../StudentDashboard/Dashboard.module.css';
import reviewStyles from '../TeacherDashboard/ReviewIdeas.module.css';

const AdminReviewIdeas = () => {
  const { success, error: showError } = useToast();
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTitle, setMergeTitle] = useState('');
  const [mergeDescription, setMergeDescription] = useState('');
  const [mergeDomain, setMergeDomain] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    setFeedback('');
  };

  const handleReviewIdea = async (status) => {
    if (!selectedIdea) return;
    setReviewLoading(true);
    try {
      await adminAPI.reviewIdea(selectedIdea._id, { status, feedback });
      success(`Idea ${status} successfully!`);
      setSelectedIdea(null);
      setFeedback('');
      fetchPendingIdeas();
    } catch (error) {
      console.error('Error reviewing idea:', error);
      showError(error.response?.data?.message || 'Failed to review idea');
    } finally {
      setReviewLoading(false);
    }
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
      showError('Please select at least 2 ideas to merge');
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
      showError('Please enter a title for the merged idea');
      return;
    }

    setReviewLoading(true);
    try {
      await adminAPI.mergeIdeas({
        ideaIds: selectedForMerge,
        title: mergeTitle,
        description: mergeDescription,
        domain: mergeDomain
      });
      
      success('Ideas merged successfully!');
      setShowMergeModal(false);
      setSelectedForMerge([]);
      setMergeTitle('');
      setMergeDescription('');
      setMergeDomain('');
      fetchPendingIdeas();
    } catch (error) {
      console.error('Error merging ideas:', error);
      showError(error.response?.data?.message || 'Failed to merge ideas');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar role="admin" />
        <div className={styles.main}>
          <Header title="Review Ideas" />
          <div className={styles.content}>
            <LoadingSpinner message="Loading pending ideas..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="admin" />
      <div className={styles.main}>
        <Header title="Review Ideas" subtitle="Review and manage all pending ideas" />
        <div className={styles.content}>
          <div className={reviewStyles.splitContainer}>
            {/* LEFT SIDE - PENDING SUBMISSIONS */}
            <div className={reviewStyles.leftPanel}>
              <div className={reviewStyles.panelHeader}>
                <h2>Pending Submissions</h2>
                <span className={reviewStyles.badge}>{ideas.length}</span>
              </div>

              {ideas.length === 0 ? (
                <div className={reviewStyles.emptyPanel}>
                  <MdPerson size={40} />
                  <p>No pending ideas</p>
                </div>
              ) : (
                <div className={reviewStyles.submissionsList}>
                  {ideas.map((idea) => (
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
                          onClick={() => handleSelectIdea(idea)}
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

            {/* RIGHT SIDE - IDEA DETAILS */}
            <div className={reviewStyles.rightPanel}>
              {!selectedIdea ? (
                <div className={reviewStyles.emptyPanel}>
                  <MdPerson size={40} />
                  <p>Select an idea to review</p>
                </div>
              ) : (
                <div className={reviewStyles.insightsPanel}>
                  <div className={reviewStyles.insightHeader}>
                    <div>
                      <span className={reviewStyles.domainBadge}>{selectedIdea.domain}</span>
                      <h3>{selectedIdea.title}</h3>
                      <p>Proposal by <strong>{selectedIdea.submittedBy?.fullName || 'Unknown'}</strong></p>
                    </div>
                  </div>

                  <div className={reviewStyles.leftContent}>
                    <div className={reviewStyles.projectCoreSection}>
                      <h4><MdDescription size={18} /> PROJECT CORE CONCEPT</h4>
                      <p>{selectedIdea.description}</p>
                    </div>

                    {selectedIdea.images && selectedIdea.images.length > 0 && (
                      <div className={reviewStyles.imagesSection}>
                        <h4>📷 SUPPORTING IMAGES ({selectedIdea.images.length})</h4>
                        <div className={reviewStyles.imageGrid}>
                          {selectedIdea.images.map((image, idx) => {
                            const imageUrl = image.url.startsWith('http') 
                              ? image.url 
                              : `http://localhost:5001${image.url}`;
                            return (
                              <div 
                                key={idx} 
                                className={reviewStyles.imageGridItem}
                                onClick={() => setSelectedImage({ ...image, url: imageUrl })}
                              >
                                <img 
                                  src={imageUrl} 
                                  alt={`Idea ${idx}`} 
                                  className={reviewStyles.gridImage}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className={reviewStyles.evaluationNotesSection}>
                      <h4><MdNotes size={18} /> EVALUATION NOTES</h4>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide specific feedback or improvement suggestions..."
                      />
                    </div>
                  </div>

                  <div className={reviewStyles.actionButtons}>
                    <button
                      onClick={() => handleReviewIdea('rejected')}
                      disabled={reviewLoading}
                      className={reviewStyles.rejectBtn}
                    >
                      <MdCancel /> Reject
                    </button>
                    <button
                      onClick={() => handleReviewIdea('approved')}
                      disabled={reviewLoading}
                      className={reviewStyles.approveBtn}
                    >
                      <MdCheckCircle /> Approve
                    </button>
                  </div>

                  <div className={reviewStyles.footerText}>
                    Processing this will notify <strong>{selectedIdea.submittedBy?.fullName || 'the student'}</strong> immediately via email.
                  </div>
                </div>
              )}
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

      {/* Image Lightbox */}
      {selectedImage && (
        <div className={reviewStyles.imageLightbox} onClick={() => setSelectedImage(null)}>
          <div className={reviewStyles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={reviewStyles.lightboxClose}
              onClick={() => setSelectedImage(null)}
            >
              <MdClose size={28} />
            </button>
            <img 
              src={selectedImage.url} 
              alt="Full view" 
              className={reviewStyles.lightboxImage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewIdeas;
