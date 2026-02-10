import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff, MdPerson, MdSchool, MdSupervisorAccount } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let email = formData.username;
    if (!email.includes('@')) {
      if (activeTab === 'teacher') {
        email = formData.username + '@karunya.edu';
      } else {
        email = formData.username + '@karunya.edu.in';
      }
    }

    try {
      const result = await login({ email, password: formData.password });
      
      if (result.success) {
        const userRole = result.user.role;
        
        // Validate role matches tab
        if (activeTab === 'student' && userRole !== 'student') {
          showError('This account is not a student account. Please use the correct login section.');
          setLoading(false);
          return;
        }
        if (activeTab === 'teacher' && userRole !== 'teacher') {
          showError('This account is not a teacher account. Please use the correct login section.');
          setLoading(false);
          return;
        }
        if (activeTab === 'admin' && userRole !== 'admin') {
          showError('This account is not an admin account. Please use the correct login section.');
          setLoading(false);
          return;
        }

        success('Login successful! Redirecting...');
        setTimeout(() => {
          if (userRole === 'student') {
            navigate('/student-dashboard');
          } else if (userRole === 'teacher') {
            navigate('/teacher-dashboard');
          } else if (userRole === 'admin') {
            navigate('/admin-dashboard');
          }
        }, 1000);
      } else {
        showError(result.message || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      showError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.logo}>C</div>
          <div className={styles.brandName}>CLASSFORGE</div>
          <div className={styles.tagline}>
            Where Ideas<br />Meet <span className={styles.impact}>Impact.</span>
          </div>
          <div className={styles.description}>
            Access your institutional account to collaborate on innovative ideas and contribute to institutional growth.
          </div>
          <blockquote className={styles.quote}>
            <p>"Institutional excellence is realized when visionary ideas are forged into the enduring foundations of progress."</p>
            <p className={styles.quoteAttribution}>— CLASSFORGE EDITORIAL</p>
          </blockquote>
          <div className={styles.copyright}>© 2026 CLASSFORGE SYSTEMS. ALL RIGHTS RESERVED<br />PRIVATE & CONFIDENTIAL</div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h1 className={styles.formTitle}>Login</h1>
          <p className={styles.formSubtitle}>Welcome back. Please authenticate your institutional identity.</p>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setActiveTab('student')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'student' ? '3px solid #000' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'student' ? '700' : '500',
                color: activeTab === 'student' ? '#000' : '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <MdPerson size={18} />
              Student
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'teacher' ? '3px solid #000' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'teacher' ? '700' : '500',
                color: activeTab === 'teacher' ? '#000' : '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <MdSchool size={18} />
              Teacher
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'admin' ? '3px solid #000' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'admin' ? '700' : '500',
                color: activeTab === 'admin' ? '#000' : '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <MdSupervisorAccount size={18} />
              Admin
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>EMAIL</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="username"
                  placeholder={activeTab === 'teacher' ? 'your.email' : (activeTab === 'admin' ? 'admin@karunya.edu.in' : 'your.email')}
                  className={styles.input}
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <span style={{
                  padding: '8px 12px',
                  color: '#999',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {activeTab === 'teacher' ? '@karunya.edu' : '@karunya.edu.in'}
                </span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>PASSWORD</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  className={styles.input}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              <div className={styles.forgotPassword}>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  FORGOT CREDENTIALS?
                </Link>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>Don't Have an Account? <Link to="/signup" className={styles.footerLink}>Sign Up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
