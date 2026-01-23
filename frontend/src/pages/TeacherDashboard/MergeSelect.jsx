import { useState, useEffect } from 'react';
import { MdCheckBox, MdCheckBoxOutlineBlank, MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const MergeSelect = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [allIdeas, setAllIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [mergeTitle, setMergeTitle] = useState('');
  const [mergeDescription, setMergeDescription] = useState('');
  const [mergeDomain, setMergeDomain] = useState('');
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    fetchAllIdeas();
  }, []);

  const fetchAllIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5001/api/ideas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ideas: ${response.status}`);
      }
      const data = await response.json();
      // Filter out already merged ideas and ensure submittedBy exists and has fullName
      const nonMergedIdeas = (data.ideas || [])
        .filter(idea => idea.status !== 'merged' && idea.submittedBy && idea.submittedBy.fullName)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllIdeas(nonMergedIdeas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      setError(error.message);
      setAllIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleIdeaSelection = (ideaId) => {
    setSelectedIdeas(prev => {
      if (prev.includes(ideaId)) {
        return prev.filter(id => id !== ideaId);
      } else {
        return [...prev, ideaId];
      }
    });
  };

  const handleMergeIdeas = async (e) => {
    e.preventDefault();
    if (selectedIdeas.length < 2) {
      showError('Please select at least 2 ideas to merge');
      return;
    }

    setMerging(true);
    try {
      const response = await fetch('http://localhost:5001/api/ideas/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ideaIds: selectedIdeas,
          title: mergeTitle || `Merged: ${selectedIdeas.length} ideas`,
          description: mergeDescription,
          domain: mergeDomain
        })
      });

      if (response.ok) {
        success('Ideas merged successfully!');
        navigate('/teacher-dashboard/merged');
      } else {
        showError('Failed to merge ideas');
      }
    } catch (error) {
      console.error('Error merging ideas:', error);
      showError('Error merging ideas');
    } finally {
      setMerging(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar role="teacher" />
        <div style={{ flex: 1, marginLeft: '250px', paddingTop: '70px' }}>
          <Header title="Select Ideas to Merge" />
          <div style={{ padding: '32px' }}>
            <LoadingSpinner message="Loading ideas..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar role="teacher" />
        <div style={{ flex: 1, marginLeft: '250px', paddingTop: '70px' }}>
          <Header title="Select Ideas to Merge" />
          <div style={{ padding: '32px' }}>
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              color: '#dc2626'
            }}>
              <p style={{ margin: '0' }}>Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="teacher" />
      <div style={{ flex: 1, marginLeft: '250px', paddingTop: '70px' }}>
        <Header title="Select Ideas to Merge" />
        <div style={{ padding: '32px' }}>
          <button
            onClick={() => navigate('/teacher-dashboard/merged')}
            style={{
              marginBottom: '24px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <MdArrowBack size={20} />
            Back to Merged Ideas
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Ideas List */}
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
                Select Ideas ({selectedIdeas.length} selected)
              </h2>
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                {allIdeas.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
                    No ideas available to merge
                  </div>
                ) : (
                  allIdeas.map(idea => (
                    <div
                      key={idea._id}
                      onClick={() => toggleIdeaSelection(idea._id)}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        backgroundColor: selectedIdeas.includes(idea._id) ? '#f0f9ff' : '#fff',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = selectedIdeas.includes(idea._id) ? '#e0f2fe' : '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = selectedIdeas.includes(idea._id) ? '#f0f9ff' : '#fff';
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {selectedIdeas.includes(idea._id) ? (
                          <MdCheckBox size={24} color="#3b82f6" />
                        ) : (
                          <MdCheckBoxOutlineBlank size={24} color="#d1d5db" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#000' }}>
                          {idea.title}
                        </h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                          {idea.description?.substring(0, 80) || 'No description'}...
                        </p>
                        <div style={{ fontSize: '11px', color: '#999', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span>by {idea.submittedBy?.fullName || 'Unknown'}</span>
                          <span>{idea.domain || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Merge Form */}
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>
                Merge Details
              </h2>
              <form onSubmit={handleMergeIdeas} style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Merged Title *
                  </label>
                  <input
                    type="text"
                    value={mergeTitle}
                    onChange={(e) => setMergeTitle(e.target.value)}
                    placeholder="Enter merged idea title"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Domain *
                  </label>
                  <input
                    type="text"
                    value={mergeDomain}
                    onChange={(e) => setMergeDomain(e.target.value)}
                    placeholder="Enter domain"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Description *
                  </label>
                  <textarea
                    value={mergeDescription}
                    onChange={(e) => setMergeDescription(e.target.value)}
                    placeholder="Enter merged description"
                    required
                    rows="6"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{
                  backgroundColor: '#fff',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#666',
                  border: '1px solid #e5e7eb'
                }}>
                  <strong>Selected Ideas:</strong> {selectedIdeas.length}
                  {selectedIdeas.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px' }}>
                      {allIdeas
                        .filter(idea => selectedIdeas.includes(idea._id))
                        .map(idea => (
                          <div key={idea._id} style={{ color: '#999', marginTop: '4px' }}>
                            • {idea.title}
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={merging || selectedIdeas.length < 2}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: selectedIdeas.length < 2 ? '#ccc' : '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: selectedIdeas.length < 2 ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    opacity: merging ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {merging ? 'Merging...' : `Merge ${selectedIdeas.length} Ideas`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergeSelect;
