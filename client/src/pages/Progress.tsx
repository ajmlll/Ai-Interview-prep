import React from 'react';

const Progress: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Preparation Progress</h1>
        <p>Monitor your performance scores across categories and track improvement timelines.</p>
      </div>

      <div className="grid-2col">
        <div className="section-card">
          <h3>Topic breakdown</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
            <li><strong>Behavioral Questions:</strong> 3 completed (Average score: 82%)</li>
            <li><strong>System Design:</strong> 1 completed (Average score: 75%)</li>
            <li><strong>Coding / Technical:</strong> 1 completed (Average score: 78%)</li>
          </ul>
        </div>

        <div className="section-card">
          <h3>Preparation Tips</h3>
          <p>Based on your recent mock reviews:</p>
          <div style={{ background: '#f9f9f9', borderLeft: '4px solid #0056b3', padding: '10px', marginTop: '10px' }}>
            <strong>Recommendation:</strong> Improve on providing concrete metrics (e.g. latency reduced by 30%, sales increased by 15%) when replying to STAR-format behavioral questions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
