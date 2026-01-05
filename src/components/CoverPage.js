import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CoverPage.css';

const CoverPage = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/selection');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="cover-page">
      <div className="cover-content">
        <h1 className="cover-title">
          <span className="cover-title-strong">
            Intelligent Customer Support
          </span>
          <span className="cover-title-highlight">
            Powered by AI
          </span>
        </h1>

        <p className="cover-subtitle">
        Unlock the power of conversational AI for your business.
        <br />
        Deliver instant, accurate responses <strong>24/7</strong> via <strong>voice or text</strong>, ensuring a seamless experience for every user interaction.
      </p>

        <div className="cover-buttons">
          <button onClick={handleGetStarted} className="cover-btn btn-lg-primary">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;
