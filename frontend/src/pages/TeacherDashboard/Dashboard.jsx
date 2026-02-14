import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdTrendingUp, MdPeople, MdAssignment, MdSchedule, MdSend, MdPending } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ideaAPI } from '../../services/api';
import styles from './TeacherDashboard.module.css';
import {
  FaUsers,
  FaPaperPlane,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [submissionTrend, setSubmissionTrend] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [allIdeas, setAllIdeas] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling to refresh data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ideasRes, studentsRes] = await Promise.all([
        ideaAPI.getTeacherStats(),
        ideaAPI.getIdeas({}),
        fetch(`http://localhost:5001/api/teacher/students`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json())
      ]);
      setStats(statsRes.data.stats);
      setDepartmentStats(statsRes.data.stats.departmentStats || []);
      
      // Get all ideas for trend calculation
      const allIdeasData = ideasRes.data.ideas;
      setAllIdeas(allIdeasData);
      setRecentIdeas(allIdeasData.filter(idea => idea.status === 'pending').slice(0, 10));
      
      // Store student count
      const studentCount = studentsRes.users?.length || 0;
      setStats(prev => ({ ...prev, totalStudents: studentCount }));
      
      // Calculate submission trend for last 7 days using ALL ideas
      const trend = calculateSubmissionTrend(allIdeasData);
      setSubmissionTrend(trend);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubmissionTrend = (ideas) => {
    // Get last 7 days starting from 6 days ago to today
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    // Count ideas submitted on each day
    const trend = last7Days.map(date => {
      const count = ideas.filter(idea => {
        if (!idea.createdAt) return false;
        const ideaDate = new Date(idea.createdAt);
        ideaDate.setHours(0, 0, 0, 0);
        return ideaDate.getTime() === date.getTime();
      }).length;
      return count;
    });

    console.log('📊 Submission Trend Data (Real):', trend);
    console.log('📅 Date Range:', last7Days.map(d => d.toLocaleDateString()));
    console.log('📝 Total Ideas:', ideas.length);
    console.log('💾 Ideas with dates:', ideas.filter(i => i.createdAt).length);
    
    return trend;
  };

  const generateCurvePoints = (data) => {
    if (!data || data.length === 0) return { path: '', points: [] };
    
    const padding = 70;
    const width = 900 - 2 * padding;
    const height = 280 - 2 * padding;
    const maxValue = Math.max(...data, 1);
    
    console.log('📈 Graph Data:', { data, maxValue, height });
    
    // Generate dates for last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const y = padding + height - (value / maxValue) * height;
      console.log(`Day ${dates[index]}: value=${value}, y=${y}, scaledHeight=${(value / maxValue) * height}`);
      return { x, y, value, day: dates[index] };
    });

    // Generate smooth curve using cubic Bezier curves for smoother transitions
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate control points for smooth curve
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y;
      const cp2x = next.x - (next.x - current.x) / 3;
      const cp2y = next.y;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }

    return { path, points, maxValue };
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

  const calculateTrends = (stats, allIdeasData) => {
    // Calculate trends based on last 7 days vs previous 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const thisWeekIdeas = allIdeasData.filter(idea => new Date(idea.createdAt) >= sevenDaysAgo).length;
    const lastWeekIdeas = allIdeasData.filter(idea => {
      const date = new Date(idea.createdAt);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    }).length;

    const submissionChange = lastWeekIdeas > 0 
      ? Math.round(((thisWeekIdeas - lastWeekIdeas) / lastWeekIdeas) * 100)
      : thisWeekIdeas > 0 ? 100 : 0;

    const approvalRate = stats.totalSubmissions > 0 
      ? Math.round((stats.approved / stats.totalSubmissions) * 100)
      : 0;

    const pendingPercentage = stats.totalSubmissions > 0
      ? Math.round((stats.pendingReview / stats.totalSubmissions) * 100)
      : 0;

    // Calculate student growth
    const studentGrowth = 12; // This would need historical data to calculate accurately

    return {
      submissionTrendValue: submissionChange,
      approvalRate,
      pendingPercentage,
      studentGrowth
    };
  };

  const StatCardNew = ({ label, value, total, color, trendValue, trendText, onClick }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    // Determine trend color based on card type and trend value
    const getTrendColor = () => {
      if (label === "Total Students") {
        return trendValue >= 0 ? "#3b82f6" : "#ef4444";
      } else if (label === "Ideas Submitted") {
        return trendValue >= 0 ? "#f97316" : "#ef4444";
      } else if (label === "Pending Review") {
        return trendValue <= 20 ? "#a855f7" : trendValue <= 40 ? "#f59e0b" : "#ef4444";
      } else if (label === "Approval Rate") {
        return trendValue >= 70 ? "#10b981" : trendValue >= 50 ? "#f59e0b" : "#ef4444";
      } else {
        return trendValue >= 0 ? "#10b981" : "#ef4444";
      }
    };

    const colorMap = {
      blue: {
        bar: "#3b82f6",
        icon: <FaUsers />,
        trendColor: getTrendColor()
      },
      purple: {
        bar: "#a855f7",
        icon: <FaPaperPlane />,
        trendColor: getTrendColor()
      },
      orange: {
        bar: "#f97316",
        icon: <FaClock />,
        trendColor: getTrendColor()
      },
      green: {
        bar: "#10b981",
        icon: <FaCheckCircle />,
        trendColor: getTrendColor()
      },
    };

    const config = colorMap[color] || colorMap.blue;

    return (
      <div 
        onClick={onClick}
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: isDarkMode ? '1px solid #333333' : '1px solid #e5e7eb',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = isDarkMode ? '0 8px 16px rgba(0, 0, 0, 0.5)' : '0 8px 16px rgba(0, 0, 0, 0.12)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.backgroundColor = isDarkMode ? '#2a2a2a' : '#f9fafb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '32px', color: config.bar }}>{config.icon}</div>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: '600',
            color: config.trendColor === '#f59e0b' ? '#10b981' : config.trendColor,
            backgroundColor: (config.trendColor === '#f59e0b' ? '#10b981' : config.trendColor) + '20',
            padding: '6px 12px',
            borderRadius: '6px'
          }}>
            {trendValue >= 0 ? '+' : ''}{trendValue}% {trendText}
          </span>
        </div>
        
        <div>
          <div style={{ fontSize: '12px', color: isDarkMode ? '#999999' : '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            {label}
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: isDarkMode ? '#ffffff' : '#1f2937' }}>
            {value}
          </div>
        </div>

        <div>
          <div style={{
            height: '6px',
            backgroundColor: isDarkMode ? '#333333' : '#e5e7eb',
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
          <div style={{ fontSize: '11px', color: isDarkMode ? '#999999' : '#9ca3af', marginTop: '6px' }}>
            {value} of {total} ideas
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar role="teacher" />
        <div className={styles.main}>
          <Header />
          <div className={styles.content}>
            <LoadingSpinner message="Loading dashboard..." />
          </div>
        </div>
      </div>
    );
  }

  const totalSubmissions = stats?.totalSubmissions || 0;
  const pendingReview = stats?.pendingReview || 0;
  const approved = stats?.approved || 0;
  const rejected = stats?.rejected || 0;
  const totalStudents = stats?.totalStudents || 0;
  
  const trends = calculateTrends(stats, allIdeas);
  const approvalRate = trends.approvalRate;
  const submissionTrendValue = trends.submissionTrendValue;
  const pendingPercentage = trends.pendingPercentage;
  const studentGrowth = trends.studentGrowth;

  return (
    <div className={styles.layout}>
      <Sidebar role="teacher" />
      <div className={styles.main}>
        <Header title="Dashboard" />
        <div className={styles.content}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '32px',
            borderRadius: '50px',
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
                    {user?.fullName || 'Teacher'}
                  </h1>
                  <p style={{ 
                    margin: '0', 
                    fontSize: '14px', 
                    color: '#6b7280',
                    lineHeight: '1.5'
                  }}>
                    You have <span style={{ fontWeight: '600', color: '#000000' }}>{stats?.pendingReview || 0} submissions</span> waiting for your final review today.
                  </p>
                </div>
                

              </div>
            </div>
          </div>
          {/* TOP STAT CARDS */}
          <div className={styles.statsGrid}>
            <div onClick={() => navigate('/teacher-dashboard/students')}>
              <StatCardNew
                label="Total Students"
                value={totalStudents}
                total={totalStudents}
                color="blue"
                trendValue={studentGrowth}
                trendText="this week"
              />
            </div>

            <div onClick={() => navigate('/teacher-dashboard/ideas')}>
              <StatCardNew
                label="Ideas Submitted"
                value={totalSubmissions}
                total={totalSubmissions}
                color="orange"
                trendValue={submissionTrendValue}
                trendText="vs last week"
              />
            </div>

            <div onClick={() => navigate('/teacher-dashboard/review')}>
              <StatCardNew
                label="Pending Review"
                value={pendingReview}
                total={totalSubmissions}
                color="purple"
                trendValue={pendingPercentage}
                trendText="of total"
              />
            </div>

            <div onClick={() => navigate('/teacher-dashboard/approved')}>
              <StatCardNew
                label="Approval Rate"
                value={`${approvalRate}%`}
                total={100}
                color="green"
                trendValue={approvalRate}
                trendText="success rate"
              />
            </div>
          </div>

          {/* CHARTS SECTION - ROW 1: 60/40 split */}
          <div className={styles.chartsGrid}>
            {/* LEFT: Review Pending Ideas - 60% (moved from Row 2) */}
            <div className={styles.chartCard} style={{ borderRadius: '60px' }}>
              <div className={styles.sectionHeader} style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <h2 className={styles.sectionTitle}>Review Pending ideas</h2>
                  <p className={styles.sectionSubtitle}>Pending ideas that require attention</p>
                </div>
                <button 
                  onClick={() => navigate('/teacher-dashboard/review')}
                  style={{
                    padding: '8px 16px',
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    borderRadius: '50px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#333333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#141414ff';
                  }}
                >
                  Review Queue →
                </button>
              </div>

              {recentIdeas.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyText}>No pending ideas</div>
                  <div className={styles.emptySubtext}>
                    All submissions have been reviewed
                  </div>
                </div>
              ) : (
                <div className={styles.ideaTable}>
                  <div className={styles.tableHeader}>
                    <div className={styles.headerCell}>IDEA</div>
                    <div className={styles.headerCell}>STUDENT</div>
                    <div className={styles.headerCell}>DOMAIN</div>
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
                          {idea.status === 'pending' ? 'UNDER REVIEW' : idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Submission Trend - 40% */}
            <div className={styles.chartCard} style={{ borderRadius: '60px' }}>
              <div className={styles.chartHeader}>
                <h3>Submission Trend</h3>
                <p>Daily idea submissions</p>
              </div>
              <div className={styles.chartPlaceholder}>
                <div className={styles.trendChart}>
                  <svg viewBox="0 0 900 350" className={styles.trendSvg}>
                    {(() => {
                      const data = submissionTrend;
                      if (!data || data.length === 0) {
                        return (
                          <text x="450" y="175" textAnchor="middle" fill="var(--text-secondary)" fontSize="14">
                            No submission data available
                          </text>
                        );
                      }

                      const maxValue = Math.max(...data, 1);
                      const dates = [];
                      for (let i = 6; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                      }
                      const barWidth = 70;
                      const barGap = 30;
                      const padding = 70;

                      return (
                        <>
                          <line x1="70" y1="50" x2="70" y2="300" stroke="#000000" strokeWidth="2" />
                          <line x1="70" y1="300" x2="870" y2="300" stroke="#000000" strokeWidth="2" />
                          
                          {[0, Math.ceil(maxValue / 3), Math.ceil((maxValue * 2) / 3), maxValue].map((label, idx) => {
                            const yLabels = [0, Math.ceil(maxValue / 3), Math.ceil((maxValue * 2) / 3), maxValue];
                            const y = 300 - (idx / (yLabels.length - 1)) * 250;
                            return (
                              <g key={`y-${idx}`}>
                                <line x1="60" y1={y} x2="70" y2={y} stroke="#000000" strokeWidth="1" />
                                <text x="55" y={y + 5} textAnchor="end" fontSize="13" fill="#000000" fontWeight="500">
                                  {label}
                                </text>
                                {idx > 0 && (
                                  <line x1="70" y1={y} x2="870" y2={y} stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4" />
                                )}
                              </g>
                            );
                          })}

                          {data.map((value, idx) => {
                            const barX = 70 + (idx * (barWidth + barGap)) + barGap;
                            const barHeight = (value / maxValue) * 250;
                            const barY = 300 - barHeight;
                            
                            return (
                              <g key={`bar-${idx}`}>
                                <rect
                                  x={barX}
                                  y={barY}
                                  width={barWidth}
                                  height={barHeight}
                                  fill="#000000"
                                  rx="4"
                                  style={{ cursor: 'pointer' }}
                                  onMouseEnter={() => setHoveredPoint(idx)}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                                {hoveredPoint === idx && (
                                  <g>
                                    <polygon
                                      points={`${barX + barWidth / 2},${barY - 18} ${barX + barWidth / 2 - 10},${barY - 28} ${barX + barWidth / 2 + 10},${barY - 28}`}
                                      fill="#ffffff"
                                      stroke="#000000"
                                      strokeWidth="2"
                                      strokeLinejoin="round"
                                    />
                                    <rect 
                                      x={barX + barWidth / 2 - 60} 
                                      y={barY - 85} 
                                      width="120" 
                                      height="60" 
                                      fill="#ffffff" 
                                      stroke="#000000" 
                                      strokeWidth="2"
                                      rx="8"
                                    />
                                    <text 
                                      x={barX + barWidth / 2} 
                                      y={barY - 52} 
                                      textAnchor="middle" 
                                      fontSize="18" 
                                      fontWeight="700"
                                      fill="#000000"
                                    >
                                      {value}
                                    </text>
                                    <text 
                                      x={barX + barWidth / 2} 
                                      y={barY - 32} 
                                      textAnchor="middle" 
                                      fontSize="13" 
                                      fill="#666666"
                                      fontWeight="500"
                                    >
                                      submissions
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })}

                          {dates.map((date, idx) => {
                            const barX = 70 + (idx * (barWidth + barGap)) + barGap + barWidth / 2;
                            return (
                              <text key={`x-${idx}`} x={barX} y="325" textAnchor="middle" fontSize="13" fill="#000000" fontWeight="500">
                                {date}
                              </text>
                            );
                          })}

                          <text x="20" y="175" textAnchor="middle" fontSize="12" fill="#000000" fontWeight="500" transform="rotate(-90 20 175)">
                            Submissions
                          </text>

                          <text x="470" y="345" textAnchor="middle" fontSize="12" fill="#000000" fontWeight="500">
                            Dates (Last 7 Days)
                          </text>
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT IDEAS SECTION - ROW 2: 60/40 split */}
          <div className={styles.chartsGrid}>
            {/* LEFT: Domain Engagement - 60% (moved from Row 2 RIGHT) */}
            <div className={styles.chartCard} style={{ borderRadius: '60px' }}>
              <div className={styles.chartHeader}>
                <h3>Domain Engagement</h3>
                <p>Daily idea submissions</p>
              </div>
              <div className={styles.chartPlaceholder}>
                <div style={{ display: 'flex', gap: '48px', alignItems: 'center', width: '100%', padding: '24px' }}>
                  {/* Pie Chart */}
                  <div style={{ flex: 0.4, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))' }}>
                        {(() => {
                          const total = departmentStats.reduce((sum, d) => sum + d.count, 0);
                          const colors = ['#10b981', '#3b82f6', '#a855f7', '#fbbf24', '#ef4444', '#06b6d4'];
                          let currentAngle = -90;

                          return (
                            <>
                              {departmentStats.slice(0, 6).map((dept, idx) => {
                                const sliceAngle = (dept.count / total) * 360;
                                const startAngle = currentAngle;
                                const endAngle = currentAngle + sliceAngle;
                                
                                const startRad = (startAngle * Math.PI) / 180;
                                const endRad = (endAngle * Math.PI) / 180;
                                
                                const x1 = 100 + 70 * Math.cos(startRad);
                                const y1 = 100 + 70 * Math.sin(startRad);
                                const x2 = 100 + 70 * Math.cos(endRad);
                                const y2 = 100 + 70 * Math.sin(endRad);
                                
                                const largeArc = sliceAngle > 180 ? 1 : 0;
                                const pathData = `M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`;
                                
                                currentAngle = endAngle;
                                
                                return (
                                  <path key={idx} d={pathData} fill={colors[idx % colors.length]} style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))', transition: 'all 0.3s ease', cursor: 'pointer' }} />
                                );
                              })}
                              {/* Center circle for donut */}
                              <circle cx="100" cy="100" r="45" fill="white" />
                              <text x="100" y="108" textAnchor="middle" fontSize="28" fontWeight="700" fill="#059669">
                                62%
                              </text>
                              <text x="100" y="125" textAnchor="middle" fontSize="12" fill="#6b7280">
                                Approved
                              </text>
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  </div>

                  {/* Legend */}
                  <div style={{ flex: 0.6, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {departmentStats.slice(0, 5).map((dept, idx) => {
                      const colors = ['#10b981', '#3b82f6', '#a855f7', '#fbbf24', '#ef4444'];
                      const total = departmentStats.reduce((sum, d) => sum + d.count, 0);
                      const percentage = Math.round((dept.count / total) * 100);
                      
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#f9fafb', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                          <span style={{ width: '14px', height: '14px', background: colors[idx], borderRadius: '50%', boxShadow: `0 2px 8px ${colors[idx]}40` }}></span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{dept._id}</span>
                          <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: '700', color: colors[idx] }}>{dept.count}</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af' }}>({percentage}%)</span>
                        </div>
                      );
                    })}
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #e5e7eb', fontWeight: '600' }}>
                      ✓ Total ideas — {departmentStats.reduce((sum, d) => sum + d.count, 0)} of {totalSubmissions} total
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Submission Status - 40% (moved from Row 1 LEFT) */}
            <div className={styles.chartCard} style={{ borderRadius: '60px' }}>
              <div className={styles.chartHeader}>
                <h3>Submission Status</h3>
                <p>Total submitted ideas</p>
              </div>
              <div className={styles.chartPlaceholder}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
                  {/* Stacked Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ flex: 1, height: '32px', display: 'flex', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                      <div style={{ width: `${(approved / (approved + pendingReview + rejected)) * 100}%`, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', transition: 'all 0.3s ease' }}></div>
                      <div style={{ width: `${(pendingReview / (approved + pendingReview + rejected)) * 100}%`, background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', transition: 'all 0.3s ease' }}></div>
                      <div style={{ width: `${(rejected / (approved + pendingReview + rejected)) * 100}%`, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', transition: 'all 0.3s ease' }}></div>
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: '700', minWidth: '60px', color: '#059669' }}>62%</span>
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f0fdf4', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                      <span style={{ width: '14px', height: '14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '4px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}></span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Approved</span>
                      <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: '700', color: '#059669' }}>{approved} (62%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#fffbeb', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                      <span style={{ width: '14px', height: '14px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '4px', boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)' }}></span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Pending</span>
                      <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>{pendingReview} (29%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#fef2f2', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                      <span style={{ width: '14px', height: '14px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '4px', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)' }}></span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rejected</span>
                      <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: '700', color: '#dc2626' }}>{rejected} (9%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
