import React, { useState, useEffect } from 'react';
import { MdPeople, MdLightbulb, MdSchool, MdPerson } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StatCard from '../../components/StatCard/StatCard';
import { adminAPI } from '../../services/api';
import styles from '../StudentDashboard/Dashboard.module.css';
import Spinner from '../../components/Spinner/Spinner'; // Moved to top level

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getSystemStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="admin" />
      <div className={styles.main}>
        <Header title="Admin Dashboard" subtitle="System Overview" />
        <div className={styles.content}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>User Statistics</h3>
          <div className={styles.stats}>
            <StatCard
              label="Total Users"
              value={stats?.users?.total || 0}
              icon={MdPeople}
              color="blue"
            />
            <StatCard
              label="Students"
              value={stats?.users?.students || 0}
              icon={MdPerson}
              color="green"
            />
            <StatCard
              label="Teachers"
              value={stats?.users?.teachers || 0}
              icon={MdSchool}
              color="orange"
            />
          </div>
          <h3 style={{ marginTop: '30px', marginBottom: '20px', color: 'var(--text-primary)' }}>Idea Statistics</h3>
          <div className={styles.stats}>
            <StatCard
              label="Total Ideas"
              value={stats?.ideas?.total || 0}
              icon={MdLightbulb}
              color="blue"
            />
            <StatCard
              label="Pending"
              value={stats?.ideas?.pending || 0}
              icon={MdLightbulb}
              color="orange"
            />
            <StatCard
              label="Approved"
              value={stats?.ideas?.approved || 0}
              icon={MdLightbulb}
              color="green"
            />
            <StatCard
              label="Rejected"
              value={stats?.ideas?.rejected || 0}
              icon={MdLightbulb}
              color="red"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;