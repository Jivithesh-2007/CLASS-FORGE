import React, { useState, useEffect } from 'react';
import IdeaModal from '../../components/IdeaModal/IdeaModal';
import styles from './TeacherDashboard.module.css';

const TeacherDashboard = () => {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    // Fetch all ideas (replace with your API call)
    const fetchIdeas = async () => {
      try {
        const response = await fetch('/api/ideas'); // Replace with your API endpoint
        const data = await response.json();
        setIdeas(data);
      } catch (error) {
        console.error('Error fetching ideas:', error);
      }
    };
    fetchIdeas();
  }, []);

  const handleIdeaClick = (idea) => {
    setSelectedIdea(idea);
  };

  const closeModal = () => {
    setSelectedIdea(null);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Teacher Dashboard</h1>
      <div className={styles.ideasList}>
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className={styles.ideaCard}
            onClick={() => handleIdeaClick(idea)}
          >
            <h3>{idea.title}</h3>
            <p>{idea.description.substring(0, 100)}...</p>
          </div>
        ))}
      </div>
      {selectedIdea && <IdeaModal idea={selectedIdea} onClose={closeModal} />}
    </div>
  );
};

export default TeacherDashboard;