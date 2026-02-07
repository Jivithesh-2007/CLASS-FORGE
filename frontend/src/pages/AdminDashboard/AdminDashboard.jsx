import { useState, useEffect } from 'react';
import { MdPeople, MdLightbulb, MdRateReview } from 'react-icons/md';
import { FaChartBar, FaCheckCircle as FaCheckCircleIcon, FaClock, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import IdeaDetailModal from '../../components/IdeaDetailModal/IdeaDetailModal';
import styles from '../StudentDashboard/Dashboard.module.css';
import { adminAPI, ideaAPI } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ideasRes] = await Promise.all([
        adminAPI.getSystemStats(),
        ideaAPI.getIdeas({})
      ]);
      setStats(statsRes.data.stats);
      setRecentIdeas(ideasRes.data.ideas.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const StatCard = ({ label, value, total, color, trend, onClick }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    const colorMap = {
      blue: {
        bar: "#4A90E2",
        icon: <FaChartBar />,
        trendColor: "#4A90E2",
      },
      green: {
        bar: "#10b981",
        icon: <FaCheckCircleIcon />,
        trendColor: "#10b981",
      },
      orange: {
        bar: "#f59e0b",
        icon: <FaClock />,
        trendColor: "#f59e0b",
      },
      red: {
        bar: "#ef4444",
        icon: <FaTimesCircle />,
        trendColor: "#ef4444",
      },
    };

    const config = colorMap[color] || colorMap.blue;

    return (
      <div 
        onClick={onClick}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '32px', color: config.trendColor }}>{config.icon}</div>
          <span style={{ 
            fontSize: '12px', 
            color: config.trendColor, 
            fontWeight: '600',
            backgroundColor: `${config.trendColor}15`,
            padding: '4px 10px',
            borderRadius: '6px'
          }}>
            {trend}
          </span>
        </div>
        
        <div>
          <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
            {value}
          </div>
        </div>

        <div>
          <div style={{
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${percentage}%`,
              backgroundColor: config.bar,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
            {value} of {total} ideas
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.layout}>
      <Sidebar role="admin" />
      <div className={styles.main}>
        <Header title="Dashboard" />
        <div className={styles.content}>
          {/* Welcome Section */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '32px',
            borderRadius: '12px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ 
                margin: '0 0 16px 0', 
                fontSize: '12px', 
                color: '#6b7280', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: '#f3f4f6',
                padding: '8px 12px',
                borderRadius: '6px',
                display: 'inline-block'
              }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px', marginTop: '16px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '14px', 
                    color: '#9ca3af', 
                    fontWeight: '500'
                  }}>
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
                  </p>
                  <h1 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '36px', 
                    fontWeight: '800', 
                    color: '#000000',
                    letterSpacing: '-0.5px'
                  }}>
                    Admin
                  </h1>
                  <p style={{ 
                    margin: '0', 
                    fontSize: '14px', 
                    color: '#6b7280',
                    lineHeight: '1.5'
                  }}>
                    You have <span style={{ fontWeight: '600', color: '#000000' }}>{stats?.ideas?.pending || 0} pending ideas</span> waiting for your review today.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.stats}>
            <StatCard
              label="Total Users"
              value={stats?.users?.total || 0}
              total={stats?.users?.total || 1}
              color="blue"
              trend={`${stats?.users?.students || 0} students`}
              onClick={() => navigate('/admin-dashboard/manage-users')}
            />
            <StatCard
              label="Pending Review"
              value={stats?.ideas?.pending || 0}
              total={stats?.ideas?.total || 1}
              color="orange"
              trend={`of ${stats?.ideas?.total || 0} total`}
              onClick={() => navigate('/admin-dashboard/review-ideas')}
            />
            <StatCard
              label="Approved"
              value={stats?.ideas?.approved || 0}
              total={stats?.ideas?.total || 1}
              color="green"
              trend={`${Math.round((stats?.ideas?.approved / (stats?.ideas?.total || 1)) * 100)}% success`}
              onClick={() => navigate('/admin-dashboard/all-ideas')}
            />
            <StatCard
              label="Total Ideas"
              value={stats?.ideas?.total || 0}
              total={stats?.ideas?.total || 1}
              color="red"
              trend={`${stats?.ideas?.rejected || 0} rejected`}
              onClick={() => navigate('/admin-dashboard/all-ideas')}
            />
          </div>

          {/* Recent Ideas Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Ideas</h2>
              <button className={styles.button} onClick={() => navigate('/admin-dashboard/all-ideas')}>
                View All Ideas
              </button>
            </div>
            {recentIdeas.length === 0 ? (
              <div className={styles.emptyState}>
                <MdLightbulb className={styles.emptyIcon} />
                <div className={styles.emptyText}>No ideas yet</div>
                <div className={styles.emptySubtext}>
                  Ideas will appear here as they are submitted
                </div>
              </div>
            ) : (
              <div className={styles.ideaGrid}>
                {recentIdeas.map((idea) => (
                  <div 
                    key={idea._id} 
                    className={styles.ideaCard}
                    onClick={() => setSelectedIdea(idea)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.ideaHeader}>
                      <h3 className={styles.ideaTitle}>{idea.title}</h3>
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

          {/* Quick Actions */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginTop: '32px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 20px 0', color: '#000' }}>
              Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px'
            }}>
              <button
                onClick={() => navigate('/admin-dashboard/review-ideas')}
                style={{
                  padding: '16px',
                  background: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#333'}
                onMouseLeave={(e) => e.target.style.background = '#000'}
              >
                <MdRateReview size={18} />
                Review Ideas
              </button>
              <button
                onClick={() => navigate('/admin-dashboard/all-ideas')}
                style={{
                  padding: '16px',
                  background: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#333'}
                onMouseLeave={(e) => e.target.style.background = '#000'}
              >
                <MdLightbulb size={18} />
                All Ideas
              </button>
              <button
                onClick={() => navigate('/admin-dashboard/manage-users')}
                style={{
                  padding: '16px',
                  background: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#333'}
                onMouseLeave={(e) => e.target.style.background = '#000'}
              >
                <MdPeople size={18} />
                Manage Users
              </button>
            </div>
          </div>
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

export default AdminDashboard;