import { useState, useEffect } from 'react';
import { MdAdd, MdCheckCircle, MdComment, MdRefresh } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import IdeaDetailModal from '../../components/IdeaDetailModal/IdeaDetailModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import styles from './MergedIdeas.module.css';

const MergedIdeas = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [mergedIdeas, setMergedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMergedIdeas();
    const interval = setInterval(fetchMergedIdeas, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMergedIdeas = async () => {
    try {
      if (!loading && !refreshing) setRefreshing(true);
      const response = await fetch('http://localhost:5001/api/ideas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ideas: ${response.status}`);
      }
      const data = await response.json();
      const merged = (data.ideas || []).filter(idea => idea.status === 'merged');
      setMergedIdeas(merged);
      setError(null);
    } catch (error) {
      console.error('Error fetching merged ideas:', error);
      setError(error.message);
      setMergedIdeas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMergedIdeas();
    success('Refreshed merged ideas');
  };

  const handleDeleteIdea = async (ideaId) => {
    if (!deleteConfirm) {
      setDeleteConfirm(ideaId);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/ideas/${ideaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMergedIdeas(prev => prev.filter(idea => idea._id !== ideaId));
        success('Idea deleted successfully');
      } else {
        showError('Failed to delete idea');
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
      showError('Error deleting idea');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar role="teacher" />
        <div className={styles.main}>
          <Header title="Merged Ideas" />
          <div className={styles.content}>
            <LoadingSpinner message="Loading merged ideas..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.layout}>
        <Sidebar role="teacher" />
        <div className={styles.main}>
          <Header title="Merged Ideas" />
          <div className={styles.content}>
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              color: '#dc2626'
            }}>
              <p style={{ margin: '0' }}>Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="teacher" />
      <div className={styles.main}>
        <Header title="Merged Ideas" />
        <div className={styles.content}>
          <div className={styles.headerSection}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Merged Ideas</h1>
              <p className={styles.pageSubtitle}>View all merged ideas and manage them</p>
            </div>
            <div className={styles.buttonGroup}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={styles.refreshBtn}
              >
                <MdRefresh size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
              <button
                onClick={() => navigate('/teacher-dashboard/merge-select')}
                className={styles.mergeBtn}
              >
                <MdAdd size={20} />
                Merge New Ideas
              </button>
            </div>
          </div>

          {mergedIdeas.length === 0 ? (
            <div className={styles.emptyState}>
              <MdCheckCircle className={styles.emptyIcon} />
              <p className={styles.emptyText}>No merged ideas yet</p>
              <p className={styles.emptySubtext}>Create your first merged idea</p>
            </div>
          ) : (
            <div className={styles.ideasGrid}>
              {mergedIdeas.map((idea) => (
                <div
                  key={idea._id}
                  className={styles.ideaCard}
                >
                  <div className={styles.ideaContent} onClick={() => setSelectedIdea(idea)}>
                    <h3 className={styles.ideaTitle}>
                      {idea.title || 'Untitled'}
                    </h3>
                    <p className={styles.ideaDescription}>
                      {idea.description?.substring(0, 100) || 'No description'}...
                    </p>
                    <div className={styles.ideaMeta}>
                      <span>Domain: {idea.domain || 'N/A'}</span>
                      <span>
                        Merged from: {idea.submittedByMultiple && idea.submittedByMultiple.length > 0
                          ? idea.submittedByMultiple.map(u => u?.fullName || 'Unknown').join(', ')
                          : 'N/A'
                        }
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MdComment size={14} />
                        {idea.comments ? idea.comments.length : 0} comments
                      </span>
                    </div>
                  </div>
                  <div className={styles.ideaActions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIdea(idea);
                      }}
                      className={`${styles.actionBtn} ${styles.viewBtn}`}
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIdea(idea._id);
                      }}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedIdea && (
            <IdeaDetailModal 
              idea={selectedIdea} 
              onClose={() => setSelectedIdea(null)}
              showComments={true}
            />
          )}

          {deleteConfirm && (
            <ConfirmModal
              title="Delete Merged Idea"
              message="Are you sure you want to delete this merged idea? This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              isDangerous={true}
              onConfirm={() => handleDeleteIdea(deleteConfirm)}
              onCancel={() => setDeleteConfirm(null)}
            />
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MergedIdeas;
