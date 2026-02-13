import React, { useState, useEffect } from 'react';
import { MdThumbUp, MdThumbDown, MdVideoCall, MdContentCopy, MdCheck } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './MentorInterestPanel.module.css';

const MentorInterestPanel = ({ ideaId, onInterestChange }) => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [interestedMentors, setInterestedMentors] = useState([]);
  const [isInterested, setIsInterested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  const [submittingMeetLink, setSubmittingMeetLink] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMentorData();
  }, [ideaId]);

  const fetchMentorData = async () => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/interested-mentors`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await response.json();
      if (data.success) {
        setInterestedMentors(data.interestedMentors);
        setIsInterested(data.interestedMentors.some(m => m.mentorId === user?._id));
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    }
  };

  const handleShowInterest = async () => {
    if (user?.role !== 'teacher' && user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/show-interest`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setIsInterested(true);
        success('Interest shown successfully!');
        onInterestChange?.();
      } else if (data.alreadyInterested) {
        setIsInterested(true);
      } else {
        showError(data.message || 'Failed to show interest');
      }
    } catch (error) {
      console.error('Error showing interest:', error);
      showError('Error showing interest');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawInterest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/withdraw-interest`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setIsInterested(false);
        success('Interest withdrawn');
        onInterestChange?.();
      } else {
        showError(data.message || 'Failed to withdraw interest');
      }
    } catch (error) {
      console.error('Error withdrawing interest:', error);
      showError('Error withdrawing interest');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGMeet = async () => {
    // Mark meeting as arranged when mentor clicks to arrange meeting
    try {
      const response = await fetch(`/api/ideas/${ideaId}/mark-meeting-arranged`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        success('Meeting arrangement started!');
        onInterestChange?.();
      }
    } catch (error) {
      console.error('Error marking meeting as arranged:', error);
    }

    window.open('https://meet.google.com/new', '_blank');
  };

  const handleCopyMeetLink = () => {
    if (meetLink.trim()) {
      navigator.clipboard.writeText(meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareMeetLink = async () => {
    if (!meetLink.trim()) {
      showError('Please paste the Google Meet link');
      return;
    }

    setSubmittingMeetLink(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/share-meet-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ meetLink })
      });

      const data = await response.json();
      if (data.success) {
        setMeetLink('');
        setShowMeetModal(false);
        success('Meeting link shared with student!');
        onInterestChange?.();
      } else {
        showError(data.message || 'Failed to share meeting link');
      }
    } catch (error) {
      console.error('Error sharing meet link:', error);
      showError('Error sharing meeting link');
    } finally {
      setSubmittingMeetLink(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <MdThumbUp /> Mentor Interest ({interestedMentors.length})
        </h4>
        
        {user?.role === 'teacher' || user?.role === 'admin' ? (
          <div className={styles.buttonGroup}>
            {/* Step 1: Show Interest */}
            {!isInterested && (
              <button
                className={styles.interestBtn}
                onClick={handleShowInterest}
                disabled={loading}
              >
                <MdThumbUp /> Show Interest
              </button>
            )}

            {/* Step 2: After Interest - Arrange Meeting & Withdraw */}
            {isInterested && (
              <>
                <button
                  className={styles.meetBtn}
                  onClick={() => setShowMeetModal(true)}
                >
                  <MdVideoCall /> Arrange Meeting
                </button>
                <button
                  className={styles.withdrawBtn}
                  onClick={handleWithdrawInterest}
                  disabled={loading}
                >
                  <MdThumbDown /> Withdraw Interest
                </button>
              </>
            )}
          </div>
        ) : null}

        {interestedMentors.length > 0 && (
          <div className={styles.mentorsList}>
            {interestedMentors.map((mentor) => (
              <div key={mentor.mentorId} className={styles.mentorItem}>
                <span className={styles.mentorName}>{mentor.mentorName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meet Link Modal */}
      {showMeetModal && (
        <div className={styles.modalOverlay} onClick={() => setShowMeetModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Arrange Meeting</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowMeetModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.step}>
                <h4>Step 1: Create Meeting</h4>
                <p>Click the button below to create a new Google Meet in a new tab</p>
                <button 
                  className={styles.gmeetBtn}
                  onClick={handleOpenGMeet}
                >
                  <MdVideoCall /> Open Google Meet
                </button>
              </div>

              <div className={styles.divider}>
                <span>After creating the meeting</span>
              </div>

              <div className={styles.step}>
                <h4>Step 2: Copy & Paste Meeting Link</h4>
                <p>Copy the meeting link from Google Meet and paste it below</p>
                <div className={styles.linkInputGroup}>
                  <input
                    type="text"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="Paste Google Meet link (e.g., https://meet.google.com/abc-defg-hij)"
                    className={styles.linkInput}
                  />
                  {meetLink.trim() && (
                    <button
                      className={styles.copyBtn}
                      onClick={handleCopyMeetLink}
                      title="Copy link"
                    >
                      {copied ? <MdCheck /> : <MdContentCopy />}
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  className={styles.cancelBtn}
                  onClick={() => setShowMeetModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className={styles.submitBtn}
                  onClick={handleShareMeetLink}
                  disabled={submittingMeetLink || !meetLink.trim()}
                >
                  {submittingMeetLink ? 'Sending...' : 'Send Meeting Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorInterestPanel;
