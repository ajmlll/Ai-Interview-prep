import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Control Panel</h1>
        <p>Monitor platform usage analytics, audit mock interviews, and manage registered accounts.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Registered Users</h3>
          <p className="stat-number">120</p>
        </div>
        <div className="stat-card">
          <h3>Total Mock Interviews</h3>
          <p className="stat-number">450</p>
        </div>
        <div className="stat-card">
          <h3>OpenAI Token Consumption</h3>
          <p className="stat-number">980,000</p>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: '20px' }}>
        <h3>Platform Actions</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button className="btn btn-secondary" onClick={() => alert('Feature flag adjustments coming soon!')}>Configure AI Prompt Templates</button>
          <button className="btn btn-secondary" onClick={() => alert('User audit log feature is coming soon!')}>Audit Usage Logs</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
