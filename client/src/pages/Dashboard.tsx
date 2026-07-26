import React from 'react';
import { Link } from 'react-router-dom';
import type { Interview } from '@ai-interview/shared';

const Dashboard: React.FC = () => {
  // Mock data using the shared Interview type
  const mockInterviews: Interview[] = [
    {
      id: 'int_1',
      userId: 'user_1',
      title: 'Full Stack Engineer - Behavioral Practice',
      status: 'completed',
      questions: [],
      feedback: {
        overallScore: 82,
        detailedFeedback: 'Excellent star-method structuring. Try to add more metrics to results.',
        questionWiseScore: []
      },
      createdAt: '2026-07-25T10:00:00Z',
      updatedAt: '2026-07-25T10:30:00Z'
    },
    {
      id: 'int_2',
      userId: 'user_1',
      title: 'Backend Engineer - System Design Practice',
      status: 'in_progress',
      questions: [],
      createdAt: '2026-07-26T09:15:00Z',
      updatedAt: '2026-07-26T09:20:00Z'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Prepare for your next technical or behavioral interview with tailored AI evaluations.</p>
      </div>

      <div className="action-banner">
        <h3>Ready to practice?</h3>
        <p>Create a new simulated interview session instantly.</p>
        <Link to="/mock-interview" className="btn btn-primary">Start New Mock Interview</Link>
      </div>

      <div className="section-card">
        <h3>Your Recent Interviews</h3>
        {mockInterviews.length === 0 ? (
          <p>No interviews taken yet. Get started by clicking above!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Score</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockInterviews.map((interview) => (
                <tr key={interview.id}>
                  <td><strong>{interview.title}</strong></td>
                  <td>
                    <span className={`badge badge-${interview.status}`}>
                      {interview.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{interview.feedback ? `${interview.feedback.overallScore}%` : 'N/A'}</td>
                  <td>{new Date(interview.createdAt).toLocaleDateString()}</td>
                  <td>
                    {interview.status === 'in_progress' ? (
                      <Link to={`/mock-interview?id=${interview.id}`} className="btn btn-secondary btn-sm">Resume</Link>
                    ) : (
                      <Link to={`/mock-interview?id=${interview.id}`} className="btn btn-secondary btn-sm">View Feedback</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
