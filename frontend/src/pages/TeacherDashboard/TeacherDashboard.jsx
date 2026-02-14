import React, { useState, useEffect } from 'react';
import IdeaModal from '../../components/IdeaModal/IdeaModal';
import styles from './TeacherDashboard.module.css';

const TeacherDashboard = () => {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetch('/api/ideas');
        const data = await response.json();
        setIdeas(data);
      } catch (error) {
        console.error('Error fetching ideas:', error);
      }
    };
    fetchIdeas();
  }, []);

  const handleIdeaClick = (idea) => {
    setSelectedIdea(idea);
  };

  const closeModal = () => {
    setSelectedIdea(null);
  };

  return (
    <div className={styles.content}>
      {/* ROW 1: Stat Cards - 4 columns */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Total Ideas</div>
              <div className={styles.statValue}>9</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>0 of 9 ideas</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Approved</div>
              <div className={styles.statValue}>53</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>0 of 53 ideas</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Pending</div>
              <div className={styles.statValue}>3</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>0 of 3 ideas</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Success Rate</div>
              <div className={styles.statValue}>64%</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>with 100 ideas</div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Charts Grid - 60/40 split (Submission Trend wider, Domain Engagement narrower) */}
      <div className={styles.chartsGrid}>
        {/* Submission Trend - 60% width */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Submission Trend</h3>
            <p>Daily idea submissions</p>
          </div>
          <div className={styles.chartPlaceholder}>
            <svg viewBox="0 0 300 150" style={{ width: '100%', height: '100%' }}>
              <polyline points="10,120 40,100 70,110 100,80 130,90 160,60 190,70 220,40 250,50 280,30" 
                        fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="120" r="3" fill="#000000" />
              <circle cx="40" cy="100" r="3" fill="#000000" />
              <circle cx="70" cy="110" r="3" fill="#000000" />
              <circle cx="100" cy="80" r="3" fill="#000000" />
              <circle cx="130" cy="90" r="3" fill="#000000" />
              <circle cx="160" cy="60" r="3" fill="#000000" />
              <circle cx="190" cy="70" r="3" fill="#000000" />
              <circle cx="220" cy="40" r="3" fill="#000000" />
              <circle cx="250" cy="50" r="3" fill="#000000" />
              <circle cx="280" cy="30" r="3" fill="#000000" />
            </svg>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
            DATES (LAST 7 DAYS)
          </div>
        </div>

        {/* Domain Engagement - 40% width */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Domain Engagement</h3>
          </div>
          <div className={styles.departmentBars}>
            {[
              { label: 'Technology', value: 20 },
              { label: 'Science', value: 9 },
              { label: 'Education', value: 7 },
              { label: 'Healthcare', value: 5 },
              { label: 'Arts', value: 4 },
              { label: 'Environment', value: 3 },
              { label: 'Social', value: 1 },
              { label: 'AI', value: 1 },
              { label: 'Business', value: 1 },
              { label: 'Sports', value: 1 }
            ].map((item, idx) => (
              <div key={idx} className={styles.barItem}>
                <div className={styles.barLabel}>{item.label}</div>
                <div className={styles.barContainer}>
                  <div className={styles.bar} style={{ width: `${(item.value / 20) * 100}%`, background: '#000000' }}></div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '600', minWidth: '30px', textAlign: 'right' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3: Recent Pending Ideas - Full Width */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3>Recent Pending Ideas</h3>
          <a href="#" style={{ fontSize: '12px', color: 'var(--primary-color)', textDecoration: 'none' }}>VIEW QUEUE</a>
        </div>
        <div style={{ marginTop: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>PROPOSAL DETAILS</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>STUDENT</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>DEPARTMENT</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>DATE</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px 0', fontSize: '13px', fontWeight: '500' }}>
                  <div style={{ fontWeight: '700' }}>Chotta</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AGRICULTURE / OTHERS</div>
                </td>
                <td style={{ padding: '16px 0', fontSize: '13px', fontWeight: '500' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>A</div>
                    <span>Abhi</span>
                  </div>
                </td>
                <td style={{ padding: '16px 0', fontSize: '13px', fontWeight: '500' }}>Environment</td>
                <td style={{ padding: '16px 0', fontSize: '13px', fontWeight: '500' }}>Feb 13, 2026</td>
                <td style={{ padding: '16px 0' }}><span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>UNDER REVIEW</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {selectedIdea && <IdeaModal idea={selectedIdea} onClose={closeModal} />}
    </div>
  );
};

export default TeacherDashboard;