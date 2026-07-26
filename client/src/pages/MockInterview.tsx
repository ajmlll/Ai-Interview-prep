import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Question } from '@ai-interview/shared';

const MockInterview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('id');
  const navigate = useNavigate();

  // Mock Questions
  const mockQuestions: Question[] = [
    {
      id: 'q_1',
      text: 'Tell me about a time you resolved a major production outage. What was the impact and what did you learn?',
      category: 'Behavioral',
      difficulty: 'medium'
    },
    {
      id: 'q_2',
      text: 'How would you design a rate limiter for a distributed API service with millions of users?',
      category: 'System Design',
      difficulty: 'hard'
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = () => {
    console.log(`Saved answer for ${mockQuestions[currentIdx].id}:`, answer);
    setAnswer('');
    if (currentIdx < mockQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mock Interview Session</h1>
        <p>ID: {interviewId || 'New Practice Session'}</p>
      </div>

      {!isFinished ? (
        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="badge badge-pending">Question {currentIdx + 1} of {mockQuestions.length}</span>
            <span className="badge badge-completed">{mockQuestions[currentIdx].category}</span>
          </div>
          
          <h2 style={{ margin: '15px 0' }}>{mockQuestions[currentIdx].text}</h2>
          
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label htmlFor="answer-input">Your Answer Response</label>
            <textarea
              id="answer-input"
              rows={8}
              placeholder="Structure your answer using the STAR method (Situation, Task, Action, Result)..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleNext} className="btn btn-primary">
              {currentIdx === mockQuestions.length - 1 ? 'Finish Interview' : 'Next Question'}
            </button>
          </div>
        </div>
      ) : (
        <div className="section-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ color: '#2e7d32' }}>Interview Completed!</h2>
          <p style={{ margin: '15px 0 25px 0' }}>Your responses are being analyzed by our AI model. Check back shortly for feedback.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">Return to Dashboard</button>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
