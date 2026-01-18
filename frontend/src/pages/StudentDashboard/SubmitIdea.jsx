import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdSend } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ideaAPI } from '../../services/api';
import styles from './SubmitIdea.module.css';

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
      const response = await ideaAPI.createIdea({
        title: formData.title,
        description: formData.description,
        domain: formData.domain,
        tags
      });
      console.log('Idea created successfully:', response.data);
      setSuccess('Idea submitted successfully!');
      setTimeout(() => {
        navigate('/student-dashboard/my-ideas');
      }, 1500);
    } catch (err) {
      console.error('Idea submission error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit idea';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar role="student" />
      <div className={styles.main}>
        <Header title="New Proposal" />
        <div className={styles.content}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <div>
                <h2 className={styles.formTitle}>New Idea Submission</h2>
                <p className={styles.formSubtitle}>Fill in the details for your innovation proposal.</p>
              </div>
              <button 
                className={styles.closeBtn}
                onClick={() => navigate('/student-dashboard')}
              >
                <MdClose size={24} />
              </button>
            </div>

            {error && (
              <div className={styles.alert} style={{ backgroundColor: '#ffebee', borderColor: '#ffcdd2', color: 'var(--status-danger)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className={styles.alert} style={{ backgroundColor: 'var(--icon-teal-bg)', borderColor: 'var(--icon-teal-text)', color: 'var(--icon-teal-text)' }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Project Title */}
              <div className={styles.formGroup}>
                <label className={styles.label}>PROJECT TITLE</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Next-Gen Vertical Farming"
                  className={styles.input}
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Domain and Stage Row */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>TARGET DOMAIN</label>
                  <select
                    name="domain"
                    className={styles.select}
                    value={formData.domain}
                    onChange={handleChange}
                    required
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
                <div className={styles.formGroup}>
                  <label className={styles.label}>STAGE</label>
                  <select
                    name="stage"
                    className={styles.select}
                    defaultValue="Concept"
                  >
                    <option value="Concept">Concept</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Implementation">Implementation</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label className={styles.label}>DESCRIPTION</label>
                <textarea
                  name="description"
                  placeholder="Summarize the problem, solution, and impact in 2-3 sentences..."
                  className={styles.textarea}
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

              {/* Guidelines */}
              <div className={styles.guidelines}>
                <h4 className={styles.guidelinesTitle}>GUIDELINES</h4>
                <p className={styles.guidelinesText}>
                  Submissions are reviewed weekly by our innovation mentors. Ensure your pitch clearly states the value proposition. You can edit your submission until it moves to "reviewing" status.
                </p>
              </div>

              {/* Tags */}
              <div className={styles.formGroup}>
                <label className={styles.label}>TAGS (optional)</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="e.g., AI, Machine Learning, Innovation"
                  className={styles.input}
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>

              {/* Buttons */}
              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={loading}
                >
                  <MdSend size={18} />
                  {loading ? 'Submitting...' : 'Submit Proposal'}
                </button>
                <button 
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => navigate('/student-dashboard')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitIdea;