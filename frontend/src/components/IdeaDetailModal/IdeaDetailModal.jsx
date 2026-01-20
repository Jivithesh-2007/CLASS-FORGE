import React, { useState, useEffect } from 'react';
import { MdClose, MdSend, MdDelete } from 'react-icons/md';
import { ideaAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './IdeaDetailModal.module.css';

const IdeaDetailModal = ({ idea, onClose, showComments = false }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    } else {
      setLoading(false);
    }
  }, [idea._id, showComments]);

  const fetchComments = async () => {
    try {
      const response = await ideaAPI.getComments(idea._id);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await ideaAPI.addComment(idea._id, { text: newComment });
      setComments([...comments, response.data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await ideaAPI.deleteComment(idea._id, commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
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

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{idea.title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.ideaSection}>
            <div className={styles.ideaMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Submitted by</span>
                <span className={styles.metaValue}>{idea.submittedBy?.fullName}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Domain</span>
                <span className={styles.metaValue}>{idea.domain}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                <span className={`${styles.status} ${getStatusClass(idea.status)}`}>
                  {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
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
          </div>

          {showComments && (
            <div className={styles.commentsSection}>
              <h3 className={styles.sectionTitle}>Comments ({comments.length})</h3>

              <div className={styles.commentsList}>
                {loading ? (
                  <div className={styles.loadingText}>Loading comments...</div>
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
      </div>
    </div>
  );
};

export default IdeaDetailModal;
