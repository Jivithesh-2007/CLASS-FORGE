import React, { useState, useEffect } from 'react';
import { MdClose, MdSend, MdDelete, MdDeleteOutline } from 'react-icons/md';
import { ideaAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import { useToast } from '../../context/ToastContext';
import styles from './IdeaDetailModal.module.css';

const IdeaDetailModal = ({ idea, onClose, showComments = false }) => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const socketRef = React.useRef(null);

  useEffect(() => {
    if (showComments && idea && idea._id) {
      fetchComments();
      setupSocket();
    } else {
      setLoading(false);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_comment');
      }
    };
  }, [idea._id, showComments]);

  const fetchComments = async () => {
    try {
      const response = await ideaAPI.getComments(idea._id);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      showError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const socket = getSocket();
    if (socket) {
      socketRef.current = socket;
      socket.emit('join_idea', idea._id.toString());
      console.log('💬 IdeaDetailModal: Joined idea room:', idea._id.toString());
      
      socket.on('new_comment', (comment) => {
        console.log('💬 IdeaDetailModal: New comment received:', comment);
        setComments(prev => [...prev, comment]);
      });
    } else {
      console.log('⚠️ IdeaDetailModal: Socket not available');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showError('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await ideaAPI.addComment(idea._id, { text: newComment });
      if (response.data.success) {
        setComments([...comments, response.data.comment]);
        setNewComment('');
        success('Comment added successfully!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showError(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await ideaAPI.deleteComment(idea._id, commentId);
      setComments(comments.filter(c => c._id !== commentId));
      success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showError('Failed to delete comment');
    }
  };

  const handleDeleteIdea = async () => {
    setDeleting(true);
    try {
      await ideaAPI.deleteIdea(idea._id);
      showMessage('success', 'Idea deleted successfully');
      setTimeout(() => {
        setShowDeleteConfirm(false);
        onClose();
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error deleting idea:', error);
      showMessage('error', error.response?.data?.message || 'Failed to delete idea');
      setDeleting(false);
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

  const getMergedIdeas = async () => {
    if (!idea.mergedInto) return null;
    try {
      const response = await ideaAPI.getIdeaById(idea.mergedInto);
      return response.data.idea;
    } catch (error) {
      console.error('Error fetching merged idea:', error);
      return null;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{idea.title}</h2>
          <div className={styles.headerActions}>
            {user.role === 'teacher' && (
              <button 
                className={styles.deleteBtn} 
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete idea"
              >
                <MdDeleteOutline size={20} />
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>
              <MdClose size={24} />
            </button>
          </div>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.ideaSection}>
            <div className={styles.ideaMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Submitted by</span>
                <span className={styles.metaValue}>
                  {idea.submittedBy?.fullName || (idea.contributors && idea.contributors.length > 0
                    ? idea.contributors.map(c => c.fullName || c).join(', ')
                    : 'Unknown')}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Domain</span>
                <span className={styles.metaValue}>{idea.domain}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                <span className={`${styles.status} ${getStatusClass(idea.status)}`}>
                  {idea.status === 'pending' ? 'Under Review' : idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Date</span>
                <span className={styles.metaValue}>
                  {new Date(idea.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            <div className={styles.description}>
              <h3 className={styles.sectionTitle}>Description</h3>
              <p className={styles.descriptionText}>{idea.description}</p>
            </div>

            {idea.tags && idea.tags.length > 0 && (
              <div className={styles.tags}>
                <h3 className={styles.sectionTitle}>Tags</h3>
                <div className={styles.tagsList}>
                  {idea.tags.map((tag, idx) => (
                    <span key={idx} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {idea.images && idea.images.length > 0 && (
              <div className={styles.imagesSection}>
                <h3 className={styles.sectionTitle}>Images ({idea.images.length})</h3>
                <div className={styles.imageGrid}>
                  {idea.images.map((image, idx) => {
                    const imageUrl = image.url.startsWith('http') 
                      ? image.url 
                      : `http://localhost:5001${image.url}`;
                    return (
                      <div 
                        key={idx} 
                        className={styles.imageGridItem}
                        onClick={() => setSelectedImage({ ...image, url: imageUrl })}
                      >
                        <img 
                          src={imageUrl} 
                          alt={`Idea ${idx}`} 
                          className={styles.gridImage}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {showComments && (
            <div className={styles.commentsSection}>
              <h3 className={styles.sectionTitle}>Comments ({comments.length})</h3>

              <div className={styles.commentsList}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid #e5e7eb', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>Loading comments...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className={styles.emptyText}>No comments yet. Be the first to comment!</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <div className={styles.commentAuthor}>
                          <span className={styles.authorInitial}>
                            {comment.author?.fullName?.charAt(0) || 'U'}
                          </span>
                          <div className={styles.authorInfo}>
                            <span className={styles.authorName}>{comment.author?.fullName}</span>
                            <span className={styles.commentTime}>
                              {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        {(user._id === comment.author?._id || user.role === 'teacher' || user.role === 'admin') && (
                          <button
                            className={styles.deleteCommentBtn}
                            onClick={() => handleDeleteComment(comment._id)}
                            title="Delete comment"
                          >
                            <MdDelete size={16} />
                          </button>
                        )}
                      </div>
                      <p className={styles.commentText}>{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form className={styles.commentForm} onSubmit={handleAddComment}>
                <input
                  type="text"
                  className={styles.commentInput}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting || !newComment.trim()}
                >
                  <MdSend size={18} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className={styles.confirmOverlay} onClick={() => !deleting && setShowDeleteConfirm(false)}>
            <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.confirmHeader}>
                <h3 className={styles.confirmTitle}>Delete Idea</h3>
              </div>
              <div className={styles.confirmContent}>
                <p>Are you sure you want to delete this idea?</p>
                <p style={{ marginTop: '12px', color: '#ef4444', fontWeight: '500' }}>
                  This action cannot be undone. The idea and all its comments will be permanently deleted.
                </p>
              </div>
              <div className={styles.confirmFooter}>
                <button 
                  className={styles.cancelBtn}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  className={styles.confirmDeleteBtn}
                  onClick={handleDeleteIdea}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Idea'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Lightbox */}
        {selectedImage && (
          <div className={styles.imageLightbox} onClick={() => setSelectedImage(null)}>
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <button 
                className={styles.lightboxClose}
                onClick={() => setSelectedImage(null)}
              >
                <MdClose size={28} />
              </button>
              <img 
                src={selectedImage.url} 
                alt="Full view" 
                className={styles.lightboxImage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaDetailModal;
