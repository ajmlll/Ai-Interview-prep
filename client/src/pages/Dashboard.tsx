import React from 'react';
import { Link } from 'react-router-dom';
import type { Interview } from '@ai-interview/shared';
import { useAuth } from '../context/AuthContext';
import {
  MockInterviewIcon,
  ResumeIcon,
  JdMatchIcon,
  CoverLetterIcon,
  AnalyticsIcon
} from '../components/Icons';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const mockInterviews: Interview[] = [
    {
      id: 'int_1',
      userId: 'user_1',
      title: 'Senior Full Stack Engineer — 10 Gemini AI Questions',
      status: 'completed',
      questions: [],
      feedback: {
        overallScore: 88,
        detailedFeedback: 'Excellent star-method structuring. Try to add more metrics to results.',
        questionWiseScore: []
      },
      createdAt: '2026-07-26T10:00:00Z',
      updatedAt: '2026-07-26T10:30:00Z'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Welcome back, {user?.name || 'Candidate'}! 👋</h1>
        <p>Prepare for your next job opportunity with AI-powered mock interviews, resume audits, ATS match scoring, and custom cover letters.</p>
      </div>

      <h3 style={{ margin: '0.5rem 0 -0.5rem 0', color: '#0f172a', fontSize: '1.25rem' }}>Job Seeker Career Toolkit</h3>

      <div className="quick-start-grid">
        <div className="quick-start-card">
          <div className="card-header-icon card-icon-indigo">
            <MockInterviewIcon size={24} />
          </div>
          <h4>Mock Interview Studio</h4>
          <p>Practice 10 tailored questions powered by Gemini AI with live code execution & instant scoring.</p>
          <Link to="/mock-interview" className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '10px' }}>
            Start Interview
          </Link>
        </div>

        <div className="quick-start-card">
          <div className="card-header-icon card-icon-teal">
            <ResumeIcon size={24} />
          </div>
          <h4>Resume Studio & AI Audit</h4>
          <p>Upload PDF/DOCX resumes, run instant ATS score audits, and get high-impact AI bullet rewrites.</p>
          <Link to="/resume" className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '10px' }}>
            Open Resume Studio
          </Link>
        </div>

        <div className="quick-start-card">
          <div className="card-header-icon card-icon-rose">
            <JdMatchIcon size={24} />
          </div>
          <h4>JD Match & ATS Analyzer</h4>
          <p>Paste target job postings to compute Match Score %, find missing keywords, and launch tailored prep.</p>
          <Link to="/jd-analyzer" className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '10px' }}>
            Analyze Job Posting
          </Link>
        </div>

        <div className="quick-start-card">
          <div className="card-header-icon card-icon-violet">
            <CoverLetterIcon size={24} />
          </div>
          <h4>Cover Letter & Cold Email</h4>
          <p>Generate tailored, high-converting Cover Letters and hiring manager cold outreach emails in seconds.</p>
          <Link to="/cover-letter" className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '10px' }}>
            Generate Letters
          </Link>
        </div>

        <div className="quick-start-card">
          <div className="card-header-icon card-icon-cyan">
            <AnalyticsIcon size={24} />
          </div>
          <h4>Performance & Analytics</h4>
          <p>Track your score trends over time, category breakdowns, and weakest interview topics.</p>
          <Link to="/progress" className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '10px' }}>
            View Analytics
          </Link>
        </div>
      </div>

      <div className="section-card">
        <h3>Your Recent Interview Sessions</h3>
        {mockInterviews.length === 0 ? (
          <p style={{ color: '#64748b' }}>No interviews taken yet. Get started by clicking above!</p>
        ) : (
          <div className="table-responsive">
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
                      <Link to="/mock-interview" className="btn btn-secondary btn-sm">View Feedback</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
