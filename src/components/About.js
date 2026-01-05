import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="about-header">
          <h1>About Our Platform</h1>
          <div className="about-divider"></div>
        </div>
        
        <div className="about-content">
          <p>
            Our customer support automation solution offers a seamless experience through two powerful modes designed to enhance business efficiency and customer satisfaction.
          </p>
          
          <div className="about-feature">
            <h3>📞 Voice Mode</h3>
            <p>
              Connect with customers directly using our advanced voice agent. It resolves queries instantly, mimicking the empathy and efficiency of a human agent, but available at scale.
            </p>
          </div>

          <div className="about-feature">
            <h3>💬 Chat Mode</h3>
            <p>
              Provide 24/7 assistance where users can interact via text or voice. Whether it's simple FAQs or complex troubleshooting, our intelligent assistant is always ready.
            </p>
          </div>

          <div className="about-feature">
            <h3>📚 Knowledge Base (RAG)</h3>
            <p>
              Business owners can upload their own documents (PDFs, manuals, policies). Our system uses Retrieval-Augmented Generation (RAG) to provide accurate, context-aware answers based specifically on your business data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
