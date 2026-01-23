import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ fullPage = false, message = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div className={styles.fullPageContainer}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner}></div>
          <p className={styles.message}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
