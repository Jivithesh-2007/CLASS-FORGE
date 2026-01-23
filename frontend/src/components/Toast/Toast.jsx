import { useEffect } from 'react';
import { MdCheckCircle, MdError, MdInfo } from 'react-icons/md';
import styles from './Toast.module.css';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <MdCheckCircle className={styles.icon} />;
      case 'error':
        return <MdError className={styles.icon} />;
      case 'info':
        return <MdInfo className={styles.icon} />;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        {getIcon()}
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
