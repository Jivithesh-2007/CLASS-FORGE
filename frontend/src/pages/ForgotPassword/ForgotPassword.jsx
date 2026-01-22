import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { authAPI } from '../../services/api';
import styles from '../Login/Login.module.css';
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    domain: '@karunya.edu.in',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const email = formData.username + formData.domain;
    try {
      const response = await authAPI.forgotPassword({ email });
      setSuccess(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const email = formData.username + formData.domain;
    try {
      const response = await authAPI.verifyOTP({ email, otp: formData.otp });
      setSuccess(response.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const email = formData.username + formData.domain;
    try {
      const response = await authAPI.resetPassword({
        email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>ClassForge</div>
          <div className={styles.subtitle}>Reset your password</div>
        </div>
        <div className={styles.title}>Forgot Password?</div>
        <div className={styles.description}>We'll help you reset it</div>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        {step === 1 && (
          <form className={styles.form} onSubmit={handleSendOTP}>
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
              <div className={styles.hint}>
                            Student: @karunya.edu.in | Faculty: @karunya.edu
                          </div>
             
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}
        {step === 2 && (
          <form className={styles.form} onSubmit={handleVerifyOTP}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Enter OTP</label>
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                className={styles.input}
                value={formData.otp}
                onChange={handleChange}
                maxLength="6"
                required
              />
              <div className={styles.hint}>
                Check your email for the OTP
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}
        {step === 3 && (
          <form className={styles.form} onSubmit={handleResetPassword}>
            <div className={styles.formGroup}>
              <label className={styles.label}>New Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Min 6 characters"
                  className={styles.input}
                  value={formData.newPassword}
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        <div className={styles.footer}>
          <Link to="/login" className={styles.footerLink}>
            <MdArrowBack /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
