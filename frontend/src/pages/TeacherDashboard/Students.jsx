import React, { useState, useEffect } from 'react';
import { MdPerson, MdRefresh } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StudentCard from '../../components/StudentCard/StudentCard';
import StudentDetail from '../../components/StudentDetail/StudentDetail';
import { teacherAPI, ideaAPI } from '../../services/api';
import styles from '../StudentDashboard/Dashboard.module.css';
import pageStyles from './StudentsPage.module.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      // Fetch students
      const studentsRes = await Promise.race([
        teacherAPI.getStudents(),
        timeoutPromise
      ]);
      
      const studentsList = studentsRes.data?.users || [];
      
      if (studentsList.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Fetch all ideas
      let allIdeas = [];
      try {
        const ideasRes = await Promise.race([
          ideaAPI.getIdeas({}),
          timeoutPromise
        ]);
        allIdeas = ideasRes.data?.ideas || [];
      } catch (err) {
        console.warn('Could not fetch ideas:', err.message);
      }

      // Map students with stats
      const enrichedStudents = studentsList.map((student) => {
        const studentIdeas = allIdeas.filter(
          (idea) => idea.submittedBy?._id === student._id
        );

        return {
          ...student,
          totalIdeas: studentIdeas.length,
          approvedIdeas: studentIdeas.filter((i) => i.status === 'approved').length,
          pendingIdeas: studentIdeas.filter((i) => i.status === 'pending').length,
          rejectedIdeas: studentIdeas.filter((i) => i.status === 'rejected').length,
          recentIdeas: studentIdeas.slice(0, 5),
          lastActivityDate: student.updatedAt
            ? new Date(student.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            : 'N/A',
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

  return (
    <div className={styles.layout}>
      <Sidebar role="teacher" />
      <div className={styles.main}>
        <Header 
          title="Registered Students" 
          subtitle={`Total: ${students.length}`} 
        />
        <div className={styles.content}>
          <div className={pageStyles.container}>
            {loading && (
              <div className={pageStyles.loadingState}>
                <div className={pageStyles.spinner}></div>
                <p>Loading students...</p>
              </div>
            )}

            {error && !loading && (
              <div className={pageStyles.errorState}>
                <p><strong>Error:</strong> {error}</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Make sure you are logged in as a teacher.
                </p>
                <button 
                  onClick={fetchStudents} 
                  className={pageStyles.retryBtn}
                >
                  <MdRefresh size={16} /> Retry
                </button>
              </div>
            )}

            {!loading && !error && students.length === 0 && (
              <div className={pageStyles.emptyState}>
                <MdPerson size={48} />
                <h3>No students found</h3>
                <p>There are no registered students yet</p>
              </div>
            )}

            {!loading && !error && students.length > 0 && (
              <div className={pageStyles.grid}>
                {students.map((student) => (
                  <StudentCard
                    key={student._id}
                    student={student}
                    onClick={() => setSelectedStudent(student)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default Students;
