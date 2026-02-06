import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdSend } from 'react-icons/md';
import { MdPhotoCamera } from 'react-icons/md';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { ideaAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import styles from './SubmitIdea.module.css';

const LABORATORIES = [
  'NVIDIA DGX Station',
  'CISCO Centre of Excellence',
  'IBM Big Data Software Center of Excellence',
  'SUSE Centre of Excellence for Cloud Computing',
  'IoT Center for Artificial Intelligence',
  'Software Product Development Lab',
  'kLab (Data Science Lab)'
];

const SDG_DATA = {
  'SDG 1': {
    title: 'No Poverty',
    highlights: ['Eradicate extreme poverty', 'Reduce poverty in all dimensions', 'Equal rights to economic resources']
  },
  'SDG 2': {
    title: 'Zero Hunger',
    highlights: ['End hunger and malnutrition', 'Sustainable agriculture', 'Support small-scale farmers']
  },
  'SDG 3': {
    title: 'Good Health and Well-Being',
    highlights: ['Reduce mortality rates', 'Combat diseases', 'Universal health coverage']
  },
  'SDG 4': {
    title: 'Quality Education',
    highlights: ['Inclusive and equitable education', 'Build effective learning facilities', 'Increase qualified teachers']
  },
  'SDG 5': {
    title: 'Gender Equality',
    highlights: ['End discrimination and violence', 'Ensure participation and leadership', 'Universal health and rights']
  },
  'SDG 6': {
    title: 'Clean Water and Sanitation',
    highlights: ['Safe drinking water access', 'Adequate sanitation and hygiene', 'Protect water ecosystems']
  },
  'SDG 7': {
    title: 'Affordable and Clean Energy',
    highlights: ['Universal energy access', 'Increase renewable energy', 'Improve energy efficiency']
  },
  'SDG 8': {
    title: 'Decent Work and Economic Growth',
    highlights: ['Full employment opportunities', 'Safe working conditions', 'Support entrepreneurship']
  },
  'SDG 9': {
    title: 'Industry, Innovation and Infrastructure',
    highlights: ['Develop reliable infrastructure', 'Foster innovation', 'Support small businesses']
  },
  'SDG 10': {
    title: 'Reduced Inequalities',
    highlights: ['Promote social, economic, political inclusion', 'Reduce inequality', 'Facilitate safe migration']
  },
  'SDG 11': {
    title: 'Sustainable Cities and Communities',
    highlights: ['Safe, affordable housing', 'Sustainable transport', 'Reduce disaster deaths']
  },
  'SDG 12': {
    title: 'Responsible Consumption and Production',
    highlights: ['Reduce waste generation', 'Decrease food waste', 'Reduce chemical pollution']
  },
  'SDG 13': {
    title: 'Climate Action',
    highlights: ['Strengthen resilience to climate hazards', 'Integrate climate change mitigation', 'Improve education on climate change']
  },
  'SDG 14': {
    title: 'Life Below Water',
    highlights: ['Conserve marine ecosystems', 'End overfishing', 'Protect marine biodiversity']
  },
  'SDG 15': {
    title: 'Life on Land',
    highlights: ['Protect terrestrial ecosystems', 'Combat desertification', 'Prevent species extinction']
  },
  'SDG 16': {
    title: 'Peace, Justice and Strong Institutions',
    highlights: ['Reduce violence and crime', 'Promote rule of law', 'Build effective institutions']
  },
  'SDG 17': {
    title: 'Partnerships for the Goals',
    highlights: ['Strengthen global partnership', 'Encourage technology transfer', 'Promote fair trade']
  }
};

const SubmitIdea = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    karunyaThrustArea: '',
    sdg: '',
    laboratory: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedSDGData, setSelectedSDGData] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'sdg' && value) {
      setSelectedSDGData(SDG_DATA[value]);
    } else if (name === 'sdg') {
      setSelectedSDGData(null);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImages(prev => [...prev, {
            file: file,
            preview: event.target.result,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description);
      submitFormData.append('domain', formData.domain);
      submitFormData.append('karunyaThrustArea', formData.karunyaThrustArea);
      submitFormData.append('sdg', formData.sdg);
      submitFormData.append('laboratory', formData.laboratory);
      submitFormData.append('tags', JSON.stringify(tags));

      uploadedImages.forEach((img) => {
        submitFormData.append('images', img.file);
      });

      const response = await ideaAPI.createIdea(submitFormData);
      console.log('Idea created successfully:', response.data);
      success('Idea submitted successfully!');
      setTimeout(() => {
        navigate('/student-dashboard/my-ideas');
      }, 1500);
    } catch (err) {
      console.error('Idea submission error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit idea';
      showError(errorMessage);
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

            <div className={styles.guidelines}>
              <h4 className={styles.guidelinesTitle}>GUIDELINES</h4>
              <p className={styles.guidelinesText}>
                Submissions are reviewed weekly by our innovation mentors. Ensure your pitch clearly states the value proposition. You can edit your submission until it moves to "reviewing" status.
              </p>
            </div>

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

              {/* Karunya Thrust Area - Full Width */}
              <div className={styles.formGroup}>
                <label className={styles.label}>KARUNYA THRUST AREA</label>
                <select
                  name="karunyaThrustArea"
                  className={styles.select}
                  value={formData.karunyaThrustArea}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select thrust area</option>
                  <option value="Water">Water</option>
                  <option value="Food">Food</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Energy">Energy</option>
                </select>
              </div>

              {/* SDG - Full Width */}
              <div className={styles.formGroup}>
                <label className={styles.label}>SUSTAINABLE DEVELOPMENT GOAL</label>
                <select
                  name="sdg"
                  className={styles.select}
                  value={formData.sdg}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select SDG</option>
                  {Object.keys(SDG_DATA).map((sdg) => (
                    <option key={sdg} value={sdg}>
                      {sdg} - {SDG_DATA[sdg].title}
                    </option>
                  ))}
                </select>
              </div>

              {/* SDG Preview */}
              {selectedSDGData && (
                <div className={styles.sdgPreview}>
                  <div className={styles.sdgPreviewHeader}>
                    <h4 className={styles.sdgPreviewTitle}>{formData.sdg} - {selectedSDGData.title}</h4>
                  </div>
                  <div className={styles.sdgHighlights}>
                    {selectedSDGData.highlights.map((highlight, index) => (
                      <div key={index} className={styles.sdgHighlight}>
                        <span className={styles.sdgBullet}>•</span>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Laboratory - Full Width */}
              <div className={styles.formGroup}>
                <label className={styles.label}>RELATED LABORATORY</label>
                <select
                  name="laboratory"
                  className={styles.select}
                  value={formData.laboratory}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select laboratory</option>
                  {LABORATORIES.map((lab) => (
                    <option key={lab} value={lab}>
                      {lab}
                    </option>
                  ))}
                </select>
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

              {/* Image Upload */}
              <div className={styles.formGroup}>
                <label className={styles.label}>UPLOAD IMAGES (optional)</label>
                <div 
                  className={`${styles.imageUploadContainer} ${dragActive ? styles.dragActive : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                    id="imageInput"
                  />
                  <label htmlFor="imageInput" className={styles.uploadLabel}>
                    <div className={styles.uploadIcon}>
                      <MdPhotoCamera size={40} />
                    </div>
                    <div className={styles.uploadText}>Click to upload images or drag and drop</div>
                    <div className={styles.uploadSubtext}>PNG, JPG, GIF up to 10MB</div>
                  </label>
                </div>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className={styles.imagePreviewGrid}>
                    {uploadedImages.map((img, index) => (
                      <div key={index} className={styles.imagePreviewItem}>
                        <img src={img.preview} alt={`Preview ${index}`} className={styles.previewImage} />
                        <button
                          type="button"
                          className={styles.removeImageBtn}
                          onClick={() => removeImage(index)}
                          title="Remove image"
                        >
                          ✕
                        </button>
                        <div className={styles.imageName}>{img.name}</div>
                      </div>
                    ))}
                  </div>
                )}
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
