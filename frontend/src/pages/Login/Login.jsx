import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Login.module.css';
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    domain: '@karunya.edu.in',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = formData.username + formData.domain;
    try {
      const result = await login({ email, password: formData.password });
      if (result.success) {
        const role = result.user.role;
        if (role === 'student') {
          navigate('/student-dashboard');
        } else if (role === 'teacher') {
          navigate('/teacher-dashboard');
        } else if (role === 'admin') {
          navigate('/admin-dashboard');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
         
          <div className={styles.logo}>ClassForge</div>
          <div className={styles.subtitle}>Manage and share your innovative ideas</div>
        </div>
        <div className={styles.title}>Welcome back</div>
        <div className={styles.description}>Login to your account</div>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="username"
                placeholder="username"
                className={styles.input}
                value={formData.username}
                onChange={handleChange}
                required
              />
              <select
                name="domain"
                className={styles.select}
                value={formData.domain}
                onChange={handleChange}
                required
              >
                <option value="@karunya.edu.in">@ karunya.edu.in</option>
                <option value="@karunya.edu">@ karunya.edu</option>
              </select>
            </div>
<<<<<<< HEAD
=======
            
>>>>>>> frontendfix
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
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
                Forgot password?
              </Link>
            </div>
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className={styles.footer}>
          New to ClassForge?
          <Link to="/signup" className={styles.footerLink}>
            Create Account →
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
