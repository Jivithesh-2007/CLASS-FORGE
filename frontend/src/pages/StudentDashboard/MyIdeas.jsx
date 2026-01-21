import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import IdeaDetailModal from '../../components/IdeaDetailModal/IdeaDetailModal';
import { ideaAPI } from '../../services/api';
import styles from './MyIdeas.module.css';

const MyIdeas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [filterStatus, setFilterStatus] = useState(location.state?.filterStatus || 'all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredIdeas(ideas);
    } else {
      setFilteredIdeas(ideas.filter(idea => idea.status === filterStatus));
    }
    setCurrentPage(1);
  }, [filterStatus, ideas]);

  const fetchIdeas = async () => {
    try {
      // Don't pass 'all: true' - this will fetch only current user's ideas
      const response = await ideaAPI.getIdeas();
      console.log('📋 Fetched ideas:', response.data.ideas?.length || 0);
      setIdeas(response.data.ideas || []);
      setFilteredIdeas(response.data.ideas || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      setIdeas([]);
      setFilteredIdeas([]);
    } finally {
      setLoading(false);
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

  const totalPages = Math.ceil(filteredIdeas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIdeas = filteredIdeas.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSubmitIdea = () => {
    navigate('/student-dashboard/submit-idea');
  };

  return (
    <div className={styles.layout}>
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header title="My Ideas" />
        <div className={styles.content}>
          <div className={styles.headerSection}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>My Submissions</h1>
              <p className={styles.pageSubtitle}>Track and manage your personal innovation proposals.</p>
            </div>
            <button className={styles.submitBtn} onClick={handleSubmitIdea}>
              <MdAdd size={18} />
              Submit New Proposal
            </button>
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${filterStatus === 'all' ? styles.active : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterTab} ${filterStatus === 'approved' ? styles.active : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              Approved
            </button>
            <button
              className={`${styles.filterTab} ${filterStatus === 'pending' ? styles.active : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </button>
            <button
              className={`${styles.filterTab} ${filterStatus === 'rejected' ? styles.active : ''}`}
              onClick={() => setFilterStatus('rejected')}
            >
              Rejected
            </button>
           
          </div>

          {filteredIdeas.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyText}>No ideas found</div>
              <div className={styles.emptySubtext}>
                {filterStatus === 'all' 
                  ? 'Submit your first idea to get started' 
                  : `No ${filterStatus} ideas`}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>PROPOSAL DETAILS</div>
                  <div className={styles.headerCell}>AUTHOR</div>
                  <div className={styles.headerCell}>DEPARTMENT</div>
                  <div className={styles.headerCell}>DATE</div>
                  <div className={styles.headerCell}>STATUS</div>
                </div>
                {paginatedIdeas.map((idea) => (
                  <div 
                    key={idea._id} 
                    className={styles.ideaRow}
                    onClick={() => setSelectedIdea(idea)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.proposalDetails}>
                      <h3 className={styles.ideaTitle}>{idea.title}</h3>
                      <p className={styles.ideaDescription}>{idea.description}</p>
                    </div>
                    <div className={styles.authorCell}>
                      <span className={styles.authorInitial}>{idea.submittedBy?.fullName?.charAt(0) || 'U'}</span>
                      <span className={styles.authorName}>{idea.submittedBy?.fullName || 'Unknown'}</span>
                    </div>
                    <div className={styles.departmentCell}>
                      {idea.domain}
                    </div>
                    <div className={styles.dateCell}>
                      {new Date(idea.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className={styles.statusCell}>
                      <span className={`${styles.status} ${getStatusClass(idea.status)}`}>
                        {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className={styles.footerSection}>
                  <span className={styles.resultCount}>Showing {startIndex + 1}-{Math.min(endIndex, filteredIdeas.length)} of {filteredIdeas.length} result{filteredIdeas.length !== 1 ? 's' : ''}</span>
                  <div className={styles.pagination}>
      
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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

export default MyIdeas;
