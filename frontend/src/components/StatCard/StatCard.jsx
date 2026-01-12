import React from 'react';
import styles from './StatCard.module.css';
const StatCard = ({ label, value, icon: Icon, color = 'blue' }) => {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
      </div>
      <div className={`${styles.iconWrapper} ${styles[color]}`}>
        <Icon />
      </div>
    </div>
  );
};
export default StatCard;