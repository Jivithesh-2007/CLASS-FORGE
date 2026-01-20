import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdTrendingUp } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
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
  const [stats, setStats] = useState(null);
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [submissionTrend, setSubmissionTrend] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [allIdeas, setAllIdeas] = useState([]);

  useEffect(() => {
    fetchDashboardData();
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
      setRecentIdeas(allIdeasData.filter(idea => idea.status === 'pending').slice(0, 6));
      
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
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    const trend = last7Days.map(date => {
      const count = ideas.filter(idea => {
        const ideaDate = new Date(idea.createdAt);
        ideaDate.setHours(0, 0, 0, 0);
        return ideaDate.getTime() === date.getTime();
      }).length;
      return count;
    });

    console.log('📊 Submission Trend Data:', trend);
    return trend;
  };

  const generateCurvePoints = (data) => {
    if (!data || data.length === 0) return { path: '', points: [] };
    
    const padding = 70;
    const width = 900 - 2 * padding;
    const height = 280 - 2 * padding;
    const maxValue = Math.max(...data, 1);
    
    console.log('📈 Graph Data:', { data, maxValue, height });
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const y = padding + height - (value / maxValue) * height;
      console.log(`Day ${days[index]}: value=${value}, y=${y}, scaledHeight=${(value / maxValue) * height}`);
      return { x, y, value, day: days[index] };
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
      if (label === "Pending Review") {
        // For pending review, lower is better (green), higher is worse (red)
        return trendValue <= 20 ? "#10b981" : trendValue <= 40 ? "#f59e0b" : "#ef4444";
      } else if (label === "Approval Rate") {
        // For approval rate, higher is better (green), lower is worse (red)
        return trendValue >= 70 ? "#10b981" : trendValue >= 50 ? "#f59e0b" : "#ef4444";
      } else {
        // For other metrics, positive is better (green), negative is worse (red)
        return trendValue >= 0 ? "#10b981" : "#ef4444";
      }
    };

    const colorMap = {
      blue: {
        bar: "#4A90E2",
        icon: <FaUsers />,
        trendColor: getTrendColor()
      },
      purple: {
        bar: "#8b5cf6",
        icon: <FaPaperPlane />,
        trendColor: getTrendColor()
      },
      orange: {
        bar: "#f59e0b",
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
          <div style={{ fontSize: '32px', color: config.bar }}>{config.icon}</div>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: '600',
            color: config.trendColor,
            backgroundColor: config.trendColor + '15',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            {trendValue >= 0 ? '+' : ''}{trendValue}% {trendText}
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
                color="purple"
                trendValue={submissionTrendValue}
                trendText="vs last week"
              />
            </div>

            <div onClick={() => navigate('/teacher-dashboard/review')}>
              <StatCardNew
                label="Pending Review"
                value={pendingReview}
                total={totalSubmissions}
                color="orange"
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

          {/* CHARTS SECTION */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>Submission Trend</h3>
                <p>Daily idea submissions</p>
              </div>
              <div className={styles.chartPlaceholder}>
                <div className={styles.trendChart}>
                  <svg viewBox="0 0 900 350" className={styles.trendSvg}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 0.15 }} />
                        <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0.02 }} />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const { path, points, maxValue } = generateCurvePoints(submissionTrend);
                      if (!path || points.length === 0) {
                        return (
                          <text x="450" y="175" textAnchor="middle" fill="var(--text-secondary)" fontSize="14">
                            No submission data available
                          </text>
                        );
                      }

                      // Y-axis labels
                      const yLabels = [0, Math.ceil(maxValue / 3), Math.ceil((maxValue * 2) / 3), maxValue];
                      
                      return (
                        <>
                          {/* Y-axis */}
                          <line x1="70" y1="50" x2="70" y2="300" stroke="var(--border-light)" strokeWidth="2" />
                          {/* X-axis */}
                          <line x1="70" y1="300" x2="870" y2="300" stroke="var(--border-light)" strokeWidth="2" />
                          
                          {/* Y-axis labels and grid lines */}
                          {yLabels.map((label, idx) => {
                            const y = 300 - (idx / (yLabels.length - 1)) * 250;
                            return (
                              <g key={`y-${idx}`}>
                                <line x1="60" y1={y} x2="70" y2={y} stroke="var(--border-light)" strokeWidth="1" />
                                <text x="55" y={y + 5} textAnchor="end" fontSize="13" fill="var(--text-secondary)" fontWeight="500">
                                  {label}
                                </text>
                                {idx > 0 && (
                                  <line x1="70" y1={y} x2="870" y2={y} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
                                )}
                              </g>
                            );
                          })}

                          {/* X-axis labels */}
                          {points.map((point, idx) => (
                            <text key={`x-${idx}`} x={point.x} y="325" textAnchor="middle" fontSize="13" fill="var(--text-secondary)" fontWeight="500">
                              {point.day}
                            </text>
                          ))}

                          {/* Y-axis label */}
                          <text x="20" y="175" textAnchor="middle" fontSize="12" fill="var(--text-secondary)" fontWeight="500" transform="rotate(-90 20 175)">
                            Submissions
                          </text>

                          {/* X-axis label */}
                          <text x="470" y="345" textAnchor="middle" fontSize="12" fill="var(--text-secondary)" fontWeight="500">
                            Days
                          </text>

                          {/* Gradient fill under the curve */}
                          <path d={`${path} L ${points[points.length - 1].x},300 L 70,300 Z`} fill="url(#trendGradient)" />
                          
                          {/* Smooth curve line */}
                          <path d={path} stroke="var(--primary-color)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {/* Interactive data points with hover */}
                          {points.map((point, idx) => (
                            <g key={idx}>
                              <circle 
                                cx={point.x} 
                                cy={point.y} 
                                r="5" 
                                fill="var(--primary-color)"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredPoint(idx)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                              {hoveredPoint === idx && (
                                <g>
                                  <rect 
                                    x={point.x - 60} 
                                    y={point.y - 60} 
                                    width="120" 
                                    height="55" 
                                    fill="var(--background-alt)" 
                                    stroke="var(--primary-color)" 
                                    strokeWidth="2"
                                    rx="8"
                                    filter="drop-shadow(0 4px 12px rgba(0,0,0,0.15))"
                                  />
                                  <text 
                                    x={point.x} 
                                    y={point.y - 35} 
                                    textAnchor="middle" 
                                    fontSize="13" 
                                    fontWeight="700"
                                    fill="var(--text-primary)"
                                  >
                                    {point.day}
                                  </text>
                                  <text 
                                    x={point.x} 
                                    y={point.y - 12} 
                                    textAnchor="middle" 
                                    fontSize="12" 
                                    fill="var(--text-secondary)"
                                  >
                                    {point.value} submissions
                                  </text>
                                </g>
                              )}
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>Domain Engagement</h3>
              </div>
              <div className={styles.departmentBars}>
                {departmentStats.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No department data available
                  </div>
                ) : (
                  (() => {
                    const maxCount = Math.max(...departmentStats.map(d => d.count), 1);
                    return departmentStats.map((dept, idx) => (
                      <div key={idx} className={styles.barItem}>
                        <span className={styles.barLabel}>{dept._id || 'Unknown'}</span>
                        <div className={styles.barContainer}>
                          <div 
                            className={styles.bar} 
                            style={{ 
                              width: `${(dept.count / maxCount) * 100}%`, 
                              background: 'var(--primary-color)' 
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                          {dept.count}
                        </span>
                      </div>
                    ));
                  })()
                )}
              </div>
              <div className={styles.chartFooter}>
                <MdTrendingUp size={16} style={{ color: 'var(--success-color)' }} />
                <span>
                  {departmentStats.length > 0 
                    ? `${departmentStats[0]._id} leading with ${departmentStats[0].count} ideas`
                    : 'No data available'
                  }
                </span>
              </div>
            </div>
          </div>



          {/* RECENT IDEAS SECTION */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Pending Ideas</h2>
              <button 
                onClick={() => navigate('/teacher-dashboard/review')}
                style={{
                  padding: '0',
                  background: 'none',
                  color: 'var(--primary-color)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.textDecoration = 'none';
                }}
              >
                REVIEW QUEUE
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
                  <div className={styles.headerCell}>PROPOSAL DETAILS</div>
                  <div className={styles.headerCell}>STUDENT</div>
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

export default TeacherDashboard;
