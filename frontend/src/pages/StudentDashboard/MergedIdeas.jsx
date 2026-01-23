import { useState, useEffect } from 'react';
import { MdLightbulb, MdCheckCircle, MdRefresh } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ideaAPI } from '../../services/api';
import styles from './MergedIdeas.module.css';
import IdeaDetailModal from '../../components/IdeaDetailModal/IdeaDetailModal';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const MergedIdeas = () => {
  const { success } = useToast();
  const [mergedIdeas, setMergedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMergedIdeas();
    const interval = setInterval(fetchMergedIdeas, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMergedIdeas = async () => {
    try {
      if (!loading && !refreshing) setRefreshing(true);
      const response = await ideaAPI.getIdeas({ status: 'merged', all: true });
      const userMergedIdeas = (response.data.ideas || []).filter(idea => 
        idea.submittedByMultiple && idea.submittedByMultiple.length > 0
      );
      setMergedIdeas(userMergedIdeas);
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'merged': return styles.statusMerged;
      default: return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar role="student" />
        <div className={styles.main}>
          <Header />
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
        <Sidebar role="student" />
        <div className={styles.main}>
          <Header />
          <div className={styles.content}>
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              color: '#dc2626',
              margin: '20px'
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
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header />
        <div className={styles.content}>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#000' }}>Merged Ideas</h1>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>Ideas that have been merged from your submissions</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: '10px 16px',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: refreshing ? 0.6 : 1,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => !refreshing && (e.target.style.backgroundColor = '#1a1a1a')}
              onMouseLeave={(e) => !refreshing && (e.target.style.backgroundColor = '#000000')}
            >
              <MdRefresh size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          {mergedIdeas.length === 0 ? (
            <div className={styles.emptyState}>
              <MdLightbulb className={styles.emptyIcon} />
              <div className={styles.emptyText}>No merged ideas yet</div>
              <div className={styles.emptySubtext}>
                Your ideas will appear here when they are merged
              </div>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <div className={styles.tableHeader}>
                <div className={styles.headerCell}>PROPOSAL DETAILS</div>
                <div className={styles.headerCell}>MERGED FROM</div>
                <div className={styles.headerCell}>DATE</div>
                <div className={styles.headerCell}>STATUS</div>
              </div>
              {mergedIdeas.map((idea) => (
                <div 
                  key={idea._id} 
                  className={styles.ideaRow}
                  onClick={() => setSelectedIdea(idea)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.proposalDetails}>
                    <h3 className={styles.ideaRowTitleText}>{idea.title || 'Untitled'}</h3>
                    <p className={styles.ideaRowDescription}>{idea.description || 'No description'}</p>
                  </div>
                  <div className={styles.authorCell}>
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                      {idea.submittedByMultiple && idea.submittedByMultiple.length > 0
                        ? idea.submittedByMultiple.map(user => user?.fullName || 'Unknown').join(', ')
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div className={styles.dateCell}>
                    {new Date(idea.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className={styles.statusCell}>
                    <span className={`${styles.status} ${getStatusClass(idea.status)}`}>
                      <MdCheckCircle style={{ marginRight: '4px' }} />
                      Merged
                    </span>
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
