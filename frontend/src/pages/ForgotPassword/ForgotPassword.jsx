import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
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
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);
    const email = formData.username + formData.domain;
    try {
      const response = await authAPI.forgotPassword({ email });
      setMessage({ type: 'success', text: response.data.message });
      setStep(2);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);
    const email = formData.username + formData.domain;
    try {
      const response = await authAPI.verifyOTP({ email, otp: formData.otp });
      setMessage({ type: 'success', text: response.data.message });
      setStep(3);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
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
      setMessage({ type: 'success', text: response.data.message });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to reset password' });
    } finally {
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
            Secure your account and regain access to your institutional portal with our simple verification process.
          </div>
          <blockquote className={styles.quote}>
            <p>"Security is the foundation of trust in any institutional system."</p>
            <p className={styles.quoteAttribution}>— CLASSFORGE EDITORIAL</p>
          </blockquote>
          <div className={styles.copyright}>© 2026 CLASSFORGE SYSTEMS. ALL RIGHTS RESERVED<br />PRIVATE & CONFIDENTIAL</div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h1 className={styles.formTitle}>Reset Password</h1>
          <p className={styles.formSubtitle}>Recover access to your account through our secure verification process.</p>

          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          {step === 1 && (
            <form className={styles.form} onSubmit={handleSendOTP}>
              <div className={styles.formGroup}>
                <label className={styles.label}>OFFICIAL EMAIL</label>
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
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'SENDING OTP...' : 'SEND OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className={styles.form} onSubmit={handleVerifyOTP}>
              <div className={styles.formGroup}>
                <label className={styles.label}>VERIFICATION CODE</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit code"
                  className={styles.input}
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength="6"
                  required
                />
                <p style={{ fontSize: '12px', color: '#999999', marginTop: '8px' }}>
                  Check your email for the verification code
                </p>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'VERIFYING...' : 'VERIFY CODE'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form className={styles.form} onSubmit={handleResetPassword}>
              <div className={styles.formGroup}>
                <label className={styles.label}>NEW PASSWORD</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="••••••••"
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
                {loading ? 'RESETTING...' : 'RESET PASSWORD'}
              </button>
            </form>
          )}

          <div className={styles.footer}>
            <p className={styles.footerText}><Link to="/login" className={styles.footerLink}>Back to Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
