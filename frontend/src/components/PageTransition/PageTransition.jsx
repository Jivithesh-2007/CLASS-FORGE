import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location, children]);

  return (
    <div className={styles.pageWrapper}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loaderContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading...</p>
          </div>
        </div>
      )}
      <div className={`${styles.pageContent} ${isLoading ? styles.fadeOut : styles.fadeIn}`}>
        {displayChildren}
      </div>
    </div>
  );
};

export default PageTransition;
