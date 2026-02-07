import { useState, useEffect } from 'react';
import { MdDelete } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import IdeaDetailModal from '../../components/IdeaDetailModal/IdeaDetailModal';
import { ideaAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import styles from '../StudentDashboard/Dashboard.module.css';

const AllIdeas = () => {
  const { success, error: showError } = useToast();
  const [ideas, setIdeas] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, [filterStatus]);

  const fetchIdeas = async () => {
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const response = await ideaAPI.getIdeas(params);
      setIdeas(response.data.ideas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeleteConfirm(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await ideaAPI.deleteIdea(deleteConfirm);
      success('Idea deleted successfully');
      fetchIdeas();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting idea:', error);
      showError(error.response?.data?.message || 'Failed to delete idea');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#d97706' };
      case 'approved':
        return { backgroundColor: '#d1fae5', color: '#059669' };
      case 'rejected':
        return { backgroundColor: '#fee2e2', color: '#dc2626' };
      case 'merged':
        return { backgroundColor: '#dbeafe', color: '#2563eb' };
      default:
        return { backgroundColor: '#fef3c7', color: '#d97706' };
    }
  };
  return (
    <div className={styles.layout}>
      <Sidebar role="admin" />
      <div className={styles.main}>
        <Header title="All Ideas" subtitle="View and manage all submitted ideas" />
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>All Ideas ({ideas.length})</h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="merged">Merged</option>
              </select>
            </div>
            {ideas.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>No ideas found</div>
              </div>
            ) : (
              <div className={styles.ideaGrid}>
                {ideas.map((idea) => (
                  <div 
                    key={idea._id} 
                    className={styles.ideaCard}
                    onClick={() => setSelectedIdea(idea)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <div className={styles.ideaHeader}>
                      <h3 className={styles.ideaTitle}>{idea.title}</h3>
                      <button
                        onClick={(e) => handleDelete(idea._id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '4px',
                          fontSize: '18px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        <MdDelete />
                      </button>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      display: 'inline-block',
                      width: 'fit-content',
                      ...getStatusStyle(idea.status)
                    }}>
                      {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                    </div>
                    <p className={styles.ideaDescription}>{idea.description}</p>
                    <div className={styles.ideaFooter}>
                      <div className={styles.ideaMeta}>
                        <span>{idea.domain}</span>
                        <span>•</span>
                        <span>{idea.submittedBy?.fullName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmModal
          title="Delete Idea"
          message="Are you sure you want to delete this idea? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
          onConfirm={executeDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Idea Detail Modal */}
      {selectedIdea && (
        <IdeaDetailModal 
          idea={selectedIdea} 
          onClose={() => setSelectedIdea(null)}
          showComments={false}
        />
      )}
    </div>
  );
};

export default AllIdeas;