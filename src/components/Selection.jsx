import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Selection.css';

const Selection = () => {
  const navigate = useNavigate();

  return (
    <div className="selection-container">
      <div className="selection-header">
        <h1>How would you like to connect?</h1>
        <p>Choose the mode that best fits your needs.</p>
      </div>

      <div className="selection-cards">
        {/* Call Option */}
        <div className="selection-card" onClick={() => navigate('/voice')}>
          <div className="card-icon">📞</div>
          <h2>Voice Call</h2>
          <p>
            Call your customers and resolve their queries like a real-time customer support agent.
          </p>
          <button className="card-btn">Start Call</button>
        </div>

        {/* Chat Option */}
        <div className="selection-card" onClick={() => navigate('/chat')}>
          <div className="card-icon">💬</div>
          <h2>Chat Support</h2>
          <p>
            Talk through chat in voice or text mode with our intelligent assistant.
          </p>
          <button className="card-btn">Start Chat</button>
        </div>
      </div>
    </div>
  );
};

export default Selection;
