import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff, MdPerson, MdSchool, MdSupervisorAccount } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from '../Login/Login.module.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('student');
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const email = formData.username + '@karunya.edu.in';
    try {
      const result = await signup({
        fullName: formData.fullName,
        username: formData.username,
        email,
        department: formData.department,
        password: formData.password,
        role: activeTab
      });
      
      if (result.success) {
        success('Account created successfully! Redirecting...');
        setTimeout(() => {
          const role = result.user.role;
          if (role === 'student') {
            navigate('/student-dashboard');
          } else if (role === 'teacher') {
            navigate('/teacher-dashboard');
          } else if (role === 'admin') {
            navigate('/admin-dashboard');
          }
        }, 1000);
      } else {
        showError(result.message || 'Signup failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      showError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const getTabDescription = () => {
    switch(activeTab) {
      case 'student':
        return 'Create a student account to submit ideas and collaborate with peers.';
      case 'teacher':
        return 'Create a teacher account to review and mentor student ideas.';
      case 'admin':
        return 'Create an admin account to manage the system and oversee all activities.';
      default:
        return '';
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
            Join our community of innovators and contribute your ideas to shape the future of institutional excellence.
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
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join the institution. Create your account to participate in collaborative innovation.</p>

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

          <p style={{
            fontSize: '13px',
            color: '#666',
            marginBottom: '20px',
            fontStyle: 'italic'
          }}>
            {getTabDescription()}
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>FULL NAME</label>
              <input
                type="text"
                name="fullName"
                placeholder="Your full name"
                className={styles.input}
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>EMAIL</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="username"
                  placeholder={activeTab === 'admin' ? 'admin.name' : 'your.email'}
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
                  @karunya.edu.in
                </span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>DEPARTMENT</label>
              <input
                type="text"
                name="department"
                placeholder="e.g., Computer Science"
                className={styles.input}
                value={formData.department}
                onChange={handleChange}
                required
              />
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
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CONFIRM PASSWORD</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  className={styles.input}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>Already Have an Account? <Link to="/login" className={styles.footerLink}>Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
