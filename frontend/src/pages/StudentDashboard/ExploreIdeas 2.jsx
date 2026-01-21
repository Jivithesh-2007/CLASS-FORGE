import React, { useState, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import IdeaDetailModal from '../../components/IdeaDetailModal/IdeaDetailModal';
import { ideaAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './ExploreIdeas.module.css';

const ExploreIdeas = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    fetchAllIdeas();
  }, []);

  useEffect(() => {
    filterIdeas();
  }, [ideas, searchTerm, filterDomain, filterStatus, sortBy]);

  const fetchAllIdeas = async () => {
    try {
      // Pass 'all=true' to get all ideas from all students
      const response = await ideaAPI.getIdeas({ all: true });
      // Show all ideas from all students
      const allIdeas = response.data.ideas;
      setIdeas(allIdeas);
      
      // Extract unique domains
      const uniqueDomains = [...new Set(allIdeas.map(idea => idea.domain))];
      setDomains(uniqueDomains);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIdeas = () => {
    let filtered = ideas;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Domain filter
    if (filterDomain !== 'all') {
      filtered = filtered.filter(idea => idea.domain === filterDomain);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(idea => idea.status === filterStatus);
    }

    // Sorting
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'most-comments':
        filtered.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
        break;
      case 'least-comments':
        filtered.sort((a, b) => (a.comments?.length || 0) - (b.comments?.length || 0));
        break;
      case 'a-z':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // No sorting applied when empty
        break;
    }

    setFilteredIdeas(filtered);
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
    <div className={styles.layout}>
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header title="Explore Ideas" />
        <div className={styles.content}>
          <div className={styles.headerSection}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Explore All Ideas</h1>
              <p className={styles.pageSubtitle}>Discover and comment on ideas from your peers.</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className={styles.filterSection}>
            <div className={styles.searchBox}>
              <MdSearch className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search ideas by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.filterControls}>
              <select
                className={styles.filterSelect}
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
              >
                <option value="all">Select Domain</option>
                {domains.length > 0 ? (
                  domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))
                ) : (
                  <option disabled>No domains available</option>
                )}
              </select>

              <select
                className={styles.filterSelect}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="merged">Merged</option>
              </select>

              <select
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="oldest">Oldest First</option>
                <option value="most-comments">Most Comments</option>
                <option value="least-comments">Least Comments</option>
                <option value="a-z">Title A-Z</option>
                <option value="z-a">Title Z-A</option>
              </select>
            </div>
          </div>

          {filteredIdeas.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyText}>No ideas found</div>
              <div className={styles.emptySubtext}>Try adjusting your search or filters</div>
            </div>
          ) : (
            <div className={styles.ideasGrid}>
              {filteredIdeas.map((idea) => (
                <div
                  key={idea._id}
                  className={styles.ideaCard}
                  onClick={() => setSelectedIdea(idea)}
                >
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{idea.title}</h3>
                    <span className={`${styles.status} ${getStatusClass(idea.status)}`}>
                      {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                    </span>
                  </div>

                  <p className={styles.cardDescription}>{idea.description}</p>

                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>By</span>
                      <span className={styles.metaValue}>{idea.submittedBy?.fullName}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Domain</span>
                      <span className={styles.metaValue}>{idea.domain}</span>
                    </div>
                  </div>

                  {idea.tags && idea.tags.length > 0 && (
                    <div className={styles.tags}>
                      {idea.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className={styles.tag}>{tag}</span>
                      ))}
                      {idea.tags.length > 3 && (
                        <span className={styles.tag}>+{idea.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <span className={styles.date}>
                      {new Date(idea.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className={styles.commentCount}>
                      {idea.comments?.length || 0} comments
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.resultInfo}>
            Showing {filteredIdeas.length} of {ideas.length} ideas
          </div>
        </div>
      </div>

      {selectedIdea && (
        <IdeaDetailModal 
          idea={selectedIdea} 
          onClose={() => setSelectedIdea(null)}
          showComments={true}
        />
      )}
    </div>
  );
};

export default ExploreIdeas;
