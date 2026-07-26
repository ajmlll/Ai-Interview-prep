import React from 'react';
import { Link } from 'react-router-dom';
import type { Interview } from '@ai-interview/shared';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

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
        <h1>Welcome back, {user?.name || 'User'}!</h1>
        <p>Prepare for your next technical or behavioral interview with tailored AI evaluations.</p>
      </div>

      <div className="quick-start-grid">
        <div className="quick-start-card">
          <h4>Mock Interview Simulator</h4>
          <p>Practice under simulated pressure. Get real-time AI questions tailored to your target job profile.</p>
          <Link to="/mock-interview" className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '10px' }}>
            Start Mock Interview
          </Link>
        </div>

        <div className="quick-start-card">
          <h4>Resume Analyzer</h4>
          <p>Upload your resume to extract skills, compute years of experience, and tailor interview topics.</p>
          <Link to="/resume" className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '10px' }}>
            Analyze Resume
          </Link>
        </div>

        <div className="quick-start-card">
          <h4>Progress Trends</h4>
          <p>Monitor your performance scores across behavioral, coding, and system design categories.</p>
          <Link to="/progress" className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '10px' }}>
            Check Progress
          </Link>
        </div>
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
