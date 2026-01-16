import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPeople, MdLightbulb, MdPending, MdCheckCircle, MdTrendingUp } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ideaAPI } from '../../services/api';
import styles from './TeacherDashboard.module.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentIdeas, setRecentIdeas] = useState([]);
  const [submissionTrend, setSubmissionTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

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
      
      // Calculate submission trend for last 7 days using ALL ideas (not just pending)
      const allIdeasRes = await ideaAPI.getIdeas({});
      const trend = calculateSubmissionTrend(allIdeasRes.data.ideas);
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

    return trend;
  };

  const generateCurvePoints = (data) => {
    if (!data || data.length === 0) return { path: '', points: [] };
    
    const padding = 50;
    const width = 400 - 2 * padding;
    const height = 200 - 2 * padding;
    const maxValue = Math.max(...data, 1);
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const y = padding + height - (value / maxValue) * height;
      return { x, y, value, day: days[index] };
    });

    // Generate smooth curve using quadratic Bezier curves
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp = {
        x: (points[i - 1].x + points[i].x) / 2,
        y: (points[i - 1].y + points[i].y) / 2
      };
      path += ` Q ${cp.x},${cp.y} ${points[i].x},${points[i].y}`;
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

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalSubmissions = stats?.totalSubmissions || 0;
  const pendingReview = stats?.pendingReview || 0;
  const approved = stats?.approved || 0;
  const rejected = stats?.rejected || 0;
  const approvalRate = totalSubmissions > 0 ? Math.round((approved / totalSubmissions) * 100) : 0;

  return (
    <div className={styles.layout}>
      <Sidebar role="teacher" />
      <div className={styles.main}>
        <Header title="Dashboard" />
        <div className={styles.content}>
          {/* TOP STAT CARDS */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                  <MdPeople size={24} />
                </div>
                <span className={`${styles.statTrend} ${styles.trendUp}`}>+12% ↑</span>
              </div>
              <div className={styles.statLabel}>Total Students</div>
              <div className={styles.statValue}>5</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.iconTeal}`}>
                  <MdLightbulb size={24} />
                </div>
                <span className={`${styles.statTrend} ${styles.trendUp}`}>+18% ↑</span>
              </div>
              <div className={styles.statLabel}>Ideas Submitted</div>
              <div className={styles.statValue}>{totalSubmissions}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.iconOrange}`}>
                  <MdPending size={24} />
                </div>
                <span className={`${styles.statTrend} ${styles.trendDown}`}>-5% ↓</span>
              </div>
              <div className={styles.statLabel}>Pending Review</div>
              <div className={styles.statValue}>{pendingReview}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                  <MdCheckCircle size={24} />
                </div>
                <span className={`${styles.statTrend} ${styles.trendUp}`}>+2% ↑</span>
              </div>
              <div className={styles.statLabel}>Approval Rate</div>
              <div className={styles.statValue}>{approvalRate}%</div>
            </div>
          </div>

          {/* CHARTS SECTION */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>Submission Trend</h3>
                <p>Daily idea submissions over the last 7 days</p>
              </div>
              <div className={styles.chartPlaceholder}>
                <div className={styles.trendChart}>
                  <svg viewBox="0 0 500 280" className={styles.trendSvg}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 0.05 }} />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const { path, points, maxValue } = generateCurvePoints(submissionTrend);
                      if (!path || points.length === 0) {
                        return (
                          <text x="250" y="140" textAnchor="middle" fill="#9ca3af" fontSize="14">
                            No submission data available
                          </text>
                        );
                      }

                      // Y-axis labels
                      const yLabels = [0, Math.ceil(maxValue / 3), Math.ceil((maxValue * 2) / 3), maxValue];
                      
                      return (
                        <>
                          {/* Y-axis */}
                          <line x1="50" y1="30" x2="50" y2="230" stroke="#e5e7eb" strokeWidth="2" />
                          {/* X-axis */}
                          <line x1="50" y1="230" x2="480" y2="230" stroke="#e5e7eb" strokeWidth="2" />
                          
                          {/* Y-axis labels and grid lines */}
                          {yLabels.map((label, idx) => {
                            const y = 230 - (idx / (yLabels.length - 1)) * 200;
                            return (
                              <g key={`y-${idx}`}>
                                <line x1="45" y1={y} x2="50" y2={y} stroke="#e5e7eb" strokeWidth="1" />
                                <text x="40" y={y + 4} textAnchor="end" fontSize="12" fill="#9ca3af">
                                  {label}
                                </text>
                                {idx > 0 && (
                                  <line x1="50" y1={y} x2="480" y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
                                )}
                              </g>
                            );
                          })}

                          {/* X-axis labels */}
                          {points.map((point, idx) => (
                            <text key={`x-${idx}`} x={point.x} y="250" textAnchor="middle" fontSize="12" fill="#9ca3af">
                              {point.day}
                            </text>
                          ))}

                          {/* Y-axis label */}
                          <text x="15" y="130" textAnchor="middle" fontSize="11" fill="#9ca3af" transform="rotate(-90 15 130)">
                            Submissions
                          </text>

                          {/* X-axis label */}
                          <text x="265" y="275" textAnchor="middle" fontSize="11" fill="#9ca3af">
                            Days
                          </text>

                          {/* Gradient fill under the curve */}
                          <path d={`${path} L ${points[points.length - 1].x},230 L 50,230 Z`} fill="url(#trendGradient)" />
                          
                          {/* Smooth curve line */}
                          <path d={path} stroke="#4f46e5" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {/* Interactive data points with hover */}
                          {points.map((point, idx) => (
                            <g key={idx}>
                              <circle 
                                cx={point.x} 
                                cy={point.y} 
                                r="4" 
                                fill="#4f46e5"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredPoint(idx)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                              {hoveredPoint === idx && (
                                <g>
                                  <rect 
                                    x={point.x - 50} 
                                    y={point.y - 50} 
                                    width="100" 
                                    height="45" 
                                    fill="white" 
                                    stroke="#4f46e5" 
                                    strokeWidth="1.5"
                                    rx="6"
                                    filter="drop-shadow(0 2px 8px rgba(0,0,0,0.1))"
                                  />
                                  <text 
                                    x={point.x} 
                                    y={point.y - 30} 
                                    textAnchor="middle" 
                                    fontSize="12" 
                                    fontWeight="600"
                                    fill="#1f2937"
                                  >
                                    {point.day}
                                  </text>
                                  <text 
                                    x={point.x} 
                                    y={point.y - 12} 
                                    textAnchor="middle" 
                                    fontSize="11" 
                                    fill="#6b7280"
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
              <select className={styles.chartSelect}>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>

            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>Department Engagement</h3>
              </div>
              <div className={styles.departmentBars}>
                <div className={styles.barItem}>
                  <span className={styles.barLabel}>CS</span>
                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ width: '85%', background: '#4f46e5' }}></div>
                  </div>
                </div>
                <div className={styles.barItem}>
                  <span className={styles.barLabel}>Engineering</span>
                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ width: '60%', background: '#cbd5e1' }}></div>
                  </div>
                </div>
                <div className={styles.barItem}>
                  <span className={styles.barLabel}>Business</span>
                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ width: '50%', background: '#cbd5e1' }}></div>
                  </div>
                </div>
                <div className={styles.barItem}>
                  <span className={styles.barLabel}>Design</span>
                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ width: '45%', background: '#cbd5e1' }}></div>
                  </div>
                </div>
                <div className={styles.barItem}>
                  <span className={styles.barLabel}>BioTech</span>
                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ width: '55%', background: '#cbd5e1' }}></div>
                  </div>
                </div>
              </div>
              <div className={styles.chartFooter}>
                <MdTrendingUp size={16} style={{ color: '#10b981' }} />
                <span>Computer Science leading with 42 ideas</span>
              </div>
            </div>
          </div>



          {/* RECENT IDEAS SECTION */}
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
