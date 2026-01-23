import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    domain: '@karunya.edu.in',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (message.type === 'success') {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);
    const email = formData.username + formData.domain;
    try {
      const result = await login({ email, password: formData.password });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        setTimeout(() => {
          const role = result.user.role;
          if (role === 'student') {
            navigate('/student-dashboard');
          } else if (role === 'teacher') {
            navigate('/teacher-dashboard');
          } else if (role === 'admin') {
            navigate('/admin-dashboard');
          }
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Login failed. Please try again.' });
        setLoading(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
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

          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>EMAIL</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="username"
                 
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
                  <option value="@karunya.edu.in">@karunya.edu.in</option>
                  <option value="@karunya.edu">@karunya.edu</option>
                </select>
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
              {loading ? 'LOGIN SUCESSFULL...' : 'LOGIN'}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>Don't Have a Account? <Link to="/signup" className={styles.footerLink}>Sign Up</Link></p>
           
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
