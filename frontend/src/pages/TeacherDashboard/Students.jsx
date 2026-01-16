import React, { useState, useEffect } from 'react';
import { MdPerson, MdEmail, MdSchool, MdLightbulb, MdClose } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { teacherAPI, ideaAPI } from '../../services/api';
import styles from '../StudentDashboard/Dashboard.module.css';
import Spinner from '../../components/Spinner/Spinner';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentIdeas, setStudentIdeas] = useState([]);
  const [showIdeasModal, setShowIdeasModal] = useState(false);
  const [ideasLoading, setIdeasLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await teacherAPI.getStudents();
      setStudents(response.data.users);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentIdeas = async (student) => {
    setSelectedStudent(student);
    setShowIdeasModal(true);
    setIdeasLoading(true);
    try {
      const response = await ideaAPI.getIdeas({ userId: student._id });
      setStudentIdeas(response.data.ideas);
    } catch (error) {
      console.error('Error fetching student ideas:', error);
      setStudentIdeas([]);
    } finally {
      setIdeasLoading(false);
    }
  };

  const closeIdeasModal = () => {
    setShowIdeasModal(false);
    setSelectedStudent(null);
    setStudentIdeas([]);
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
    return <Spinner />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="teacher" />
      <div className={styles.main}>
        <Header title="Registered Students" subtitle={`Total: ${students.length} students`} />
        <div className={styles.content}>
          <div className={styles.section}>
            {students.length === 0 ? (
              <div className={styles.emptyState}>
                <MdPerson className={styles.emptyIcon} />
                <div className={styles.emptyText}>No students registered yet</div>
              </div>
            ) : (
              <div className={styles.ideaGrid}>
                {students.map((student) => (
                  <div 
                    key={student._id} 
                    className={styles.ideaCard} 
                    onClick={() => fetchStudentIdeas(student)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: '600',
                        margin: '0 auto 12px'
                      }}>
                        {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', textAlign: 'center', marginBottom: '8px' }}>
                        {student.fullName}
                      </h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <MdEmail />
                        <span>{student.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <MdSchool />
                        <span>{student.department || 'N/A'}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
                      <span className={styles.statusApproved}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showIdeasModal && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            padding: '32px',
            borderRadius: 'var(--radius-md)',
            width: '90%',
            maxWidth: '800px',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Ideas by {selectedStudent.fullName}</h3>
              <button onClick={closeIdeasModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <MdClose />
              </button>
            </div>
            {ideasLoading ? (
              <Spinner />
            ) : studentIdeas.length === 0 ? (
              <div className={styles.emptyState}>
                <MdLightbulb className={styles.emptyIcon} />
                <div className={styles.emptyText}>No ideas submitted by this student</div>
              </div>
            ) : (
              <div className={styles.ideaGrid}>
                {studentIdeas.map((idea) => (
                  <div key={idea._id} className={styles.ideaCard}>
                    <div className={styles.ideaHeader}>
                      <h3 className={styles.ideaTitle}>{idea.title}</h3>
                      <span className={`${styles.status} ${getStatusClass(idea.status)}`}>
                        {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                      </span>
                    </div>
                    <p className={styles.ideaDescription}>{idea.description}</p>
                    <div className={styles.ideaFooter}>
                      <div className={styles.ideaMeta}>
                        <span>{idea.domain}</span>
                        <span>•</span>
                        <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;

