import React, { useState, useEffect } from 'react';
import { MdList, MdCheckCircle, MdCancel, MdPending } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StatCard from '../../components/StatCard/StatCard';
import { ideaAPI } from '../../services/api';
import styles from '../StudentDashboard/Dashboard.module.css';
import Spinner from '../../components/Spinner/Spinner'; // Moved to top level

const TeacherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ideasRes] = await Promise.all([
        ideaAPI.getTeacherStats(),
        ideaAPI.getIdeas({ status: 'pending' })
      ]);
      setStats(statsRes.data.stats);
      setRecentIdeas(ideasRes.data.ideas.slice(0, 6));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="teacher" />
      <div className={styles.main}>
        <Header />
        <div className={styles.content}>
          <div className={styles.stats}>
            <StatCard
              label="Total Submissions"
              value={stats?.totalSubmissions || 0}
              icon={MdList}
              color="blue"
            />
            <StatCard
              label="Pending Review"
              value={stats?.pendingReview || 0}
              icon={MdPending}
              color="orange"
            />
            <StatCard
              label="Approved"
              value={stats?.approved || 0}
              icon={MdCheckCircle}
              color="green"
            />
            <StatCard
              label="Rejected"
              value={stats?.rejected || 0}
              icon={MdCancel}
              color="red"
            />
          </div>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Pending Ideas</h2>
            </div>
            {recentIdeas.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>No pending ideas</div>
                <div className={styles.emptySubtext}>
                  All submissions have been reviewed
                </div>
              </div>
            ) : (
              <div className={styles.ideaGrid}>
                {recentIdeas.map((idea) => (
                  <div key={idea._id} className={styles.ideaCard}>
                    <h3 className={styles.ideaTitle}>{idea.title}</h3>
                    <p className={styles.ideaDescription}>{idea.description}</p>
                    <div className={styles.ideaFooter}>
                      <div className={styles.ideaMeta}>
                        <span>{idea.domain}</span>
                        <span>•</span>
                        <span>{idea.submittedBy?.fullName}</span>
                      </div>
                      <span className={`${styles.status} ${styles.statusPending}`}>
                        Pending
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
export default TeacherDashboard;