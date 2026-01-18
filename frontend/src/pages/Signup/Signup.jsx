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
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
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
          <div className={styles.subtitle}>Join and share your innovative ideas</div>
        </div>
        <div className={styles.title}>Create Account</div>
        <div className={styles.description}>Sign up to start submitting your ideas</div>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
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
            
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Department</label>
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
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Min 6 characters"
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
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm password"
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div className={styles.footer}>
          Already have an account?
          <Link to="/login" className={styles.footerLink}>
            Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Signup;