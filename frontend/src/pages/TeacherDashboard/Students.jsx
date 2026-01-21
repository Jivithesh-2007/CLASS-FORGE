import { useState, useEffect } from 'react';
import { MdCalendarToday, MdAssignment, MdCheckCircle, MdSchedule, MdCancel } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StudentDetail from '../../components/StudentDetail/StudentDetail';
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
          _id: user._id,
          name: user.fullName,
          fullName: user.fullName,
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
          approvedIdeas: approved,
          pending: studentIdeas.filter(i => i.status === 'pending').length,
          pendingIdeas: studentIdeas.filter(i => i.status === 'pending').length,
          rejected: studentIdeas.filter(i => i.status === 'rejected').length,
          rejectedIdeas: studentIdeas.filter(i => i.status === 'rejected').length,
          email: user.email,
          createdAt: user.createdAt,
          recentIdeas: studentIdeas.slice(0, 5),
          program: user.program || 'B.Tech',
          studentId: user.username
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

          {/* STUDENT DETAIL PANEL */}
          {selectedStudent && (
            <StudentDetail
              student={selectedStudent}
              onClose={() => setSelectedStudent(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
