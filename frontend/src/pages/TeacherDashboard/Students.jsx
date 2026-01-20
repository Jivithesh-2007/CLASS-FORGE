import { useState, useEffect } from 'react';
import { MdCalendarToday, MdAssignment, MdCheckCircle, MdSchedule, MdCancel } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './Students.css';

const API_BASE_URL = 'http://localhost:5001/api';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    // Filter students based on search query
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(query) ||
        student.code.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.department.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Fetch students
      const studentsRes = await fetch(`${API_BASE_URL}/teacher/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!studentsRes.ok) {
        throw new Error(`Failed to fetch students: ${studentsRes.status}`);
      }

      const studentsData = await studentsRes.json();
      
      if (!studentsData.success || !studentsData.users) {
        throw new Error('Invalid response format');
      }

      // Fetch ideas to calculate stats
      let allIdeas = [];
      try {
        const ideasRes = await fetch(`${API_BASE_URL}/ideas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (ideasRes.ok) {
          const ideasData = await ideasRes.json();
          allIdeas = ideasData.ideas || [];
        }
      } catch (err) {
        console.warn('Could not fetch ideas:', err);
      }

      // Transform and enrich students with idea stats
      const enrichedStudents = studentsData.users.map((user) => {
        const studentIdeas = allIdeas.filter(idea => idea.submittedBy?._id === user._id || idea.submittedBy === user._id);
        const approved = studentIdeas.filter(i => i.status === 'approved').length;
        const total = studentIdeas.length;
        const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

        return {
          id: user._id,
          name: user.fullName,
          code: user.username || 'N/A',
          department: user.department || 'N/A',
          totalIdeas: total,
          approval: approvalRate,
          lastActive: new Date(user.updatedAt).toLocaleDateString('en-US', { 
            year: '2-digit', 
            month: '2-digit', 
            day: '2-digit' 
          }),
          status: user.isActive ? 'Active' : 'Inactive',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=9ca3af&color=fff`,
          degree: 'Student',
          year: 'SENIOR',
          approved: approved,
          pending: studentIdeas.filter(i => i.status === 'pending').length,
          rejected: studentIdeas.filter(i => i.status === 'rejected').length,
          email: user.email,
          createdAt: user.createdAt
        };
      });

      setStudents(enrichedStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const safeStudents = Array.isArray(students) ? students : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="teacher" />
      <div style={{ flex: 1, marginLeft: '250px', paddingTop: '70px' }}>
        <Header title="Students" />
        <div className="students-page">
          {/* HEADER */}
          <div className="students-header">
            <div>
              <h1>Students</h1>
              <p>Monitor student participation and idea performance across the cohort.</p>
            </div>
            <div className="students-actions">
              <input
                type="text"
                placeholder="Search students by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading students...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {error && !loading && (
            <div className="error-state">
              <p><strong>Error:</strong> {error}</p>
              <button onClick={fetchStudents} className="retry-btn">Retry</button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && safeStudents.length === 0 && (
            <div className="empty-state">
              <p>No students found</p>
            </div>
          )}

          {/* NO RESULTS STATE */}
          {!loading && !error && safeStudents.length > 0 && filteredStudents.length === 0 && (
            <div className="empty-state">
              <p>No students match your search</p>
            </div>
          )}

          {/* GRID */}
          {!loading && !error && filteredStudents.length > 0 && (
            <div className="students-grid">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="student-card"
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="card-top">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="avatar"
                    />
                    <div>
                      <h3>{student.name}</h3>
                      <span className="student-id">{student.code}</span>
                    </div>
                    <span className="arrow">›</span>
                  </div>
                  <div className="dept">
                    <span>Department</span>
                    <strong>{student.department}</strong>
                  </div>
                  <div className="stats">
                    <div>
                      <span>TOTAL IDEAS</span>
                      <strong>{student.totalIdeas}</strong>
                    </div>
                    <div>
                      <span>APPROVAL</span>
                      <strong>{student.approval}%</strong>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className="last-active">
                      <MdCalendarToday size={14} />
                      {student.lastActive}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PANEL (ALWAYS MOUNTED → NEVER BLANK) */}
          <StudentProfilePanel
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        </div>
      </div>
    </div>
  );
}

function StudentProfilePanel({ student, onClose }) {
  const [ideas, setIdeas] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (student) {
      fetchStudentIdeas();
    }
  }, [student]);

  const fetchStudentIdeas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/ideas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const studentIdeas = data.ideas?.filter(idea => 
          idea.submittedBy?._id === student.id || idea.submittedBy === student.id
        ) || [];
        setIdeas(studentIdeas.slice(0, 3));
      }
    } catch (err) {
      console.warn('Could not fetch ideas:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    setSendingMessage(true);
    try {
      // Simulate sending message with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Message sent to ${student.name}!`);
      setMessageText('');
      setShowMessageModal(false);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error sending message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`profile-panel ${student ? 'open' : ''}`}>
      <div className="panel-header">
        <h2>Student Profile</h2>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>
      {!student ? (
        <div className="panel-empty">
          <p>Select a student to view statistics</p>
        </div>
      ) : (
        <div className="panel-content">
          <div className="panel-profile">
            <div className="profile-avatar">
              <img src={student.avatar} alt={student.name} />
            </div>
            <div className="profile-info">
              <h3>{student.name}</h3>
              <p className="degree">B.Tech in {student.department}</p>
              <div className="badges">
                <span>{student.code}</span>
                <span>{student.year}</span>
              </div>
            </div>
          </div>

          <div className="panel-stats">
            <div className="stat-item">
              <div className="stat-icon" style={{ color: 'var(--primary-color)' }}>
                <MdAssignment size={24} />
              </div>
              <div className="stat-content">
                <strong>{student.totalIdeas}</strong>
                <span>Total Ideas</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon" style={{ color: 'var(--status-success)' }}>
                <MdCheckCircle size={24} />
              </div>
              <div className="stat-content">
                <strong>{student.approved}</strong>
                <span>Approved</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon" style={{ color: 'var(--status-warning)' }}>
                <MdSchedule size={24} />
              </div>
              <div className="stat-content">
                <strong>{student.pending}</strong>
                <span>Pending Review</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon" style={{ color: 'var(--status-danger)' }}>
                <MdCancel size={24} />
              </div>
              <div className="stat-content">
                <strong>{student.rejected}</strong>
                <span>Rejected</span>
              </div>
            </div>
          </div>

          <div className="approval-distribution">
            <h4>APPROVAL DISTRIBUTION</h4>
            <div className="donut-chart">
              <svg viewBox="0 0 100 100" className="donut-svg">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--status-success)" strokeWidth="12" 
                  strokeDasharray={`${(student.approved / student.totalIdeas * 100) * 2.51} 251`} 
                  transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--status-warning)" strokeWidth="12" 
                  strokeDasharray={`${(student.pending / student.totalIdeas * 100) * 2.51} 251`}
                  strokeDashoffset={`-${(student.approved / student.totalIdeas * 100) * 2.51}`}
                  transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--status-danger)" strokeWidth="12" 
                  strokeDasharray={`${(student.rejected / student.totalIdeas * 100) * 2.51} 251`}
                  strokeDashoffset={`-${((student.approved + student.pending) / student.totalIdeas * 100) * 2.51}`}
                  transform="rotate(-90 50 50)" />
                <text x="50" y="50" textAnchor="middle" dy="0.3em" className="donut-text">
                  Approved: {student.approved}
                </text>
              </svg>
            </div>
            <div className="distribution-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: 'var(--status-success)' }}></span>
                <span>Approved ({Math.round(student.approved / student.totalIdeas * 100)}%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: 'var(--status-warning)' }}></span>
                <span>Pending ({Math.round(student.pending / student.totalIdeas * 100)}%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: 'var(--status-danger)' }}></span>
                <span>Rejected ({Math.round(student.rejected / student.totalIdeas * 100)}%)</span>
              </div>
            </div>
          </div>

          <div className="recent-ideas">
            <div className="recent-header">
              <h4>RECENT IDEAS</h4>
              <a href="#" className="view-all">View all</a>
            </div>
            {ideas.length > 0 ? (
              <div className="ideas-list">
                {ideas.map((idea) => (
                  <div key={idea._id} className="idea-item">
                    <div className="idea-content">
                      <h5>{idea.title}</h5>
                      <p className="idea-domain">{idea.domain} • {new Date(idea.createdAt).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })}</p>
                    </div>
                    <span className={`idea-status ${idea.status}`}>{idea.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-ideas">No ideas submitted yet</p>
            )}
          </div>

          <div className="panel-actions">
            <button className="primary" onClick={() => setShowMessageModal(true)}>Send Message</button>
          </div>
        </div>
      )}

      {showMessageModal && (
        <div className="message-modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Message to {student?.name}</h3>
              <button className="modal-close" onClick={() => setShowMessageModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="message-textarea"
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowMessageModal(false)}>Cancel</button>
              <button 
                className="btn-send" 
                onClick={handleSendMessage}
                disabled={sendingMessage}
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-box">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export { StudentProfilePanel };
