import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import styles from '../Login/Login.module.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    domain: '@karunya.edu.in',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    const email = formData.username + formData.domain;
    try {
      const result = await signup({
        fullName: formData.fullName,
        username: formData.username,
        email,
        department: formData.department,
        password: formData.password
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Account created successfully! Redirecting...' });
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
        setMessage({ type: 'error', text: result.message || 'Signup failed. Please try again.' });
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

          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

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
            <p>Already Have a Account? <Link to="/login" className={styles.footerLink}>Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
