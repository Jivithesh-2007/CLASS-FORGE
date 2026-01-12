import React, { useState, useEffect } from 'react';
import { MdPerson, MdEmail, MdSchool } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { teacherAPI } from '../../services/api';
import styles from '../StudentDashboard/Dashboard.module.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading...</div>;
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
                  <div key={student._id} className={styles.ideaCard} style={{ cursor: 'default' }}>
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
    </div>
  );
};

export default Students;
