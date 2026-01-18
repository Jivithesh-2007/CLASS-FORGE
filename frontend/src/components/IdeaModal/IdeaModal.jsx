import React, { useState } from 'react';
import styles from './IdeaModal.module.css';
import { MdClose } from 'react-icons/md';

const IdeaModal = ({ idea, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Replace with your API call to submit a comment
    const response = await fetch(`/api/ideas/${idea.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newComment })
    });

    if (response.ok) {
      const updatedComments = await response.json();
      setComments(updatedComments);
      setNewComment('');
    }
  };

  if (!idea) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <MdClose />
        </button>
        <h2 className={styles.title}>{idea.title}</h2>
        <div className={styles.status}>
          <span className={styles.approved}>{idea.status}</span>
          <span className={styles.domain}>Domain: {idea.domain}</span>
          <span className={styles.date}>Submitted on: {idea.date}</span>
        </div>
        <p className={styles.description}>{idea.description}</p>
        <div className={styles.tags}>
          {idea.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
        <div className={styles.contributors}>
          <h4>Contributors:</h4>
          {idea.contributors.map((contributor, index) => (
            <div key={index} className={styles.contributor}>
              {contributor}
            </div>
          ))}
        </div>
        <div className={styles.commentsSection}>
          <h4>Comments</h4>
          <ul className={styles.commentsList}>
            {comments.map((comment, index) => (
              <li key={index} className={styles.comment}>
                {comment.text}
              </li>
            ))}
          </ul>
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={styles.commentInput}
            />
            <button type="submit" className={styles.commentButton}>
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IdeaModal;