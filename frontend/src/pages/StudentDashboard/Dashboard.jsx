import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdLightbulb, MdList, MdCheckCircle, MdCancel, MdMerge } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StatCard from '../../components/StatCard/StatCard';
import { ideaAPI } from '../../services/api';
import styles from './Dashboard.module.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ideasRes] = await Promise.all([
        ideaAPI.getStudentStats(),
        ideaAPI.getIdeas({})
      ]);
      setStats(statsRes.data.stats);
      setRecentIdeas(ideasRes.data.ideas.slice(0, 6));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIdea = () => {
    navigate('/student-dashboard/submit-idea');
  };

  const handleStatCardClick = (status) => {
    navigate('/student-dashboard/my-ideas', { state: { filterStatus: status } });
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header />
        <div className={styles.content}>
          <div className={styles.stats}>
            <div onClick={() => handleStatCardClick('all')} style={{ cursor: 'pointer' }}>
              <StatCard
                label="Total Ideas"
                value={stats?.totalIdeas || 0}
                icon={MdList}
                color="blue"
              />
            </div>
            <div onClick={() => handleStatCardClick('approved')} style={{ cursor: 'pointer' }}>
              <StatCard
                label="Approved"
                value={stats?.approvedIdeas || 0}
                icon={MdCheckCircle}
                color="green"
              />
            </div>
            <div onClick={() => handleStatCardClick('pending')} style={{ cursor: 'pointer' }}>
              <StatCard
                label="Pending"
                value={stats?.pendingIdeas || 0}
                icon={MdLightbulb}
                color="orange"
              />
            </div>
            <div onClick={() => handleStatCardClick('rejected')} style={{ cursor: 'pointer' }}>
              <StatCard
                label="Rejected"
                value={stats?.rejectedIdeas || 0}
                icon={MdCancel}
                color="red"
              />
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Recent Ideas</h2>
              <button className={styles.button} onClick={handleSubmitIdea}>
                <MdAdd />
                Submit New
              </button>
            </div>
            {recentIdeas.length === 0 ? (
              <div className={styles.emptyState}>
                <MdLightbulb className={styles.emptyIcon} />
                <div className={styles.emptyText}>No ideas yet</div>
                <div className={styles.emptySubtext}>
                  Submit your first idea
                </div>
                <button className={styles.button} onClick={handleSubmitIdea}>
                  <MdAdd />
                  Submit Your First Idea
                </button>
              </div>
            ) : (
              <div className={styles.ideaTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>PROPOSAL DETAILS</div>
                  <div className={styles.headerCell}>AUTHOR</div>
                  <div className={styles.headerCell}>DEPARTMENT</div>
                  <div className={styles.headerCell}>DATE</div>
                  <div className={styles.headerCell}>STATUS</div>
                </div>
                {recentIdeas.map((idea) => (
                  <div key={idea._id} className={styles.ideaRow}>
                    <div className={styles.proposalDetails}>
                      <h3 className={styles.ideaRowTitleText}>{idea.title}</h3>
                      <p className={styles.ideaRowDescription}>{idea.description}</p>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;