import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ideaAPI } from '../../services/api';
import styles from './Dashboard.module.css';
import formStyles from '../Login/Login.module.css';
const SubmitIdea = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    tags: ''
  });
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    try {
      await ideaAPI.createIdea({
        title: formData.title,
        description: formData.description,
        domain: formData.domain,
        tags
      });
      setSuccess('Idea submitted successfully!');
      setTimeout(() => {
        navigate('/student-dashboard/my-ideas');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit idea');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.layout}>
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header title="Submit New Idea" subtitle="Share your innovative thoughts" />
        <div className={styles.content}>
          <div className={styles.section}>
            <button 
              className={styles.button} 
              onClick={() => navigate('/student-dashboard')}
              style={{ marginBottom: '20px' }}
            >
              <MdArrowBack />
              Back to Dashboard
            </button>
            {error && <div className={formStyles.error}>{error}</div>}
            {success && <div className={formStyles.success}>{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Idea Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter a catchy title for your idea"
                  className={formStyles.input}
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe your idea in detail..."
                  className={formStyles.input}
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Domain</label>
                <select
                  name="domain"
                  className={formStyles.select}
                  value={formData.domain}
                  onChange={handleChange}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">Select domain</option>
                  <option value="Technology">Technology</option>
                  <option value="Science">Science</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Environment">Environment</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts</option>
                  <option value="Social">Social</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="e.g., AI, Machine Learning, Innovation"
                  className={formStyles.input}
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className={formStyles.submitBtn} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Idea'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SubmitIdea;