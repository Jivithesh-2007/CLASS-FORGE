import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdLightbulb, MdBarChart, MdCheckCircle, MdPending, MdPeople, MdSend } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import IdeaDetailModal from '../../components/IdeaDetailModal/IdeaDetailModal';
import { useAuth } from '../../context/AuthContext';
import { ideaAPI } from '../../services/api';
import styles from './Dashboard.module.css';
import { FaChartBar, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState({});
  const [selectedIdea, setSelectedIdea] = useState(null);

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
      
      // Calculate real trends from data
      calculateTrends(ideasRes.data.ideas, statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrends = (ideas, stats) => {
    // Calculate ideas added this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const ideasThisWeek = ideas.filter(idea => new Date(idea.createdAt) > oneWeekAgo).length;

    // Calculate success rate (approved / total)
    const totalIdeas = stats.totalIdeas || 1;
    const successRate = Math.round((stats.approvedIdeas / totalIdeas) * 100);

    // Calculate pending count
    const pendingCount = stats.pendingIdeas || 0;

    // Calculate rejection rate
    const rejectionRate = Math.round((stats.rejectedIdeas / totalIdeas) * 100);

    setTrends({
      thisWeek: ideasThisWeek > 0 ? `+${ideasThisWeek} this week` : 'No ideas this week',
      successRate: `${successRate}% success rate`,
      pending: pendingCount > 0 ? `${pendingCount} awaiting review` : 'All reviewed',
      rejectionRate: rejectionRate > 0 ? `-${rejectionRate}% rejection rate` : 'No rejections'
    });
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

  const StatCardNew = ({ label, value, total, color, trend, onClick }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    const colorMap = {
      blue: {
        bar: "#4A90E2",
        icon: <FaChartBar />,
        trendColor: "#4A90E2",
      },
      green: {
        bar: "#10b981",
        icon: <FaCheckCircle />,
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

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalIdeas = stats?.totalIdeas || 0;

  return (
    <div className={styles.layout}>
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header />
        <div className={styles.content}>
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
                    {user?.fullName || 'User'}
                  </h1>
                  <p style={{ 
                    margin: '0', 
                    fontSize: '14px', 
                    color: '#6b7280',
                    lineHeight: '1.5'
                  }}>
                    You have <span style={{ fontWeight: '600', color: '#000000' }}>{stats?.pendingIdeas || 0} submissions</span> waiting for your final review today.
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.stats}>
            <div onClick={() => handleStatCardClick('all')}>
              <StatCardNew
                label="Total Ideas"
                value={totalIdeas}
                total={totalIdeas}
                color="blue"
                trend={trends.thisWeek}
              />
            </div>
            <div onClick={() => handleStatCardClick('approved')}>
              <StatCardNew
                label="Approved"
                value={stats?.approvedIdeas || 0}
                total={totalIdeas}
                color="green"
                trend={trends.successRate}
              />
            </div>
            <div onClick={() => handleStatCardClick('pending')}>
              <StatCardNew
                label="Pending"
                value={stats?.pendingIdeas || 0}
                total={totalIdeas}
                color="orange"
                trend={trends.pending}
              />
            </div>
            <div onClick={() => handleStatCardClick('rejected')}>
              <StatCardNew
                label="Rejected"
                value={stats?.rejectedIdeas || 0}
                total={totalIdeas}
                color="red"
                trend={trends.rejectionRate}
              />
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Recent Ideas</h2>
              <button className={styles.button} onClick={handleSubmitIdea}>
                <MdAdd />
                Submit Your Idea
              </button>
            </div>
            {recentIdeas.length === 0 ? (
              <div className={styles.emptyState}>
                <MdLightbulb className={styles.emptyIcon} />
                <div className={styles.emptyText}>No ideas yet</div>
                <div className={styles.emptySubtext}>
                  Submit your first idea
                </div>
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
                  <div key={idea._id} className={styles.ideaRow} onClick={() => setSelectedIdea(idea)} style={{ cursor: 'pointer' }}>
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

export default StudentDashboard;