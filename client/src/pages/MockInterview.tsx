import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type { Interview, Question } from '@ai-interview/shared';
import { generateInterview, submitAnswer } from '../api/interview';
import type { QuestionFeedback } from '../api/interview';
import { useAuth } from '../context/AuthContext';
import { runCode } from '../api/code';

const MockInterview: React.FC = () => {
  // Step State: 'setup' | 'interview' | 'completed'
  const [step, setStep] = useState<'setup' | 'interview' | 'completed'>('setup');
  
  // Setup Options
  const [role, setRole] = useState('Full Stack Developer');
  const [level, setLevel] = useState('mid');
  const [techStack, setTechStack] = useState('React, TypeScript, Node.js');
  const [useResume, setUseResume] = useState(false);

  // Active Session Details
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // User Inputs for current question
  const [behavioralAnswer, setBehavioralAnswer] = useState('');
  const [technicalAnswer, setTechnicalAnswer] = useState('// Write your solution code here\n');
  const [editorLanguage, setEditorLanguage] = useState('typescript');

  // Answer Submission states
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [feedback, setFeedback] = useState<QuestionFeedback | null>(null);

  // Code execution states
  const { token } = useAuth();
  const [runningCode, setRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState<{ stdout: string; stderr: string } | null>(null);

  const handleRunCode = async () => {
    if (!technicalAnswer.trim()) {
      alert('Please write some code before executing.');
      return;
    }
    setRunningCode(true);
    setCodeOutput(null);
    try {
      const result = await runCode(editorLanguage, technicalAnswer, token || '');
      setCodeOutput({
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: any) {
      setCodeOutput({
        stdout: '',
        stderr: err.message || 'Failed to execute code'
      });
    } finally {
      setRunningCode(false);
    }
  };

  // Setup Form Handler
  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await generateInterview(role, level, techStack, useResume);
      setInterview(session);
      setStep('interview');
      setCurrentIdx(0);
      resetInputs(session.questions[0]);
    } catch (err) {
      console.error(err);
      alert('Failed to start interview.');
    } finally {
      setLoading(false);
    }
  };

  const resetInputs = (question: Question) => {
    setBehavioralAnswer('');
    if (question.category === 'Technical') {
      setTechnicalAnswer('// Write your solution code here\n');
    }
    setFeedback(null);
    setCodeOutput(null);
  };

  // Submit current answer
  const handleSubmitAnswer = async () => {
    if (!interview) return;
    const currentQuestion = interview.questions[currentIdx];
    const finalAnswer = currentQuestion.category === 'Technical' ? technicalAnswer : behavioralAnswer;

    if (!finalAnswer.trim()) {
      alert('Please write or code an answer before submitting.');
      return;
    }

    setSubmittingAnswer(true);
    try {
      const evaluation = await submitAnswer(currentQuestion.id, finalAnswer);
      setFeedback(evaluation);
    } catch (err) {
      console.error(err);
      alert('Evaluation failed.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Next Question or Finish
  const handleNextQuestion = () => {
    if (!interview) return;
    if (currentIdx < interview.questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      resetInputs(interview.questions[nextIdx]);
    } else {
      setStep('completed');
    }
  };

  const activeQuestion = interview?.questions[currentIdx];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Simulated Mock Interview Workspace</h1>
        <p>Harness tailored AI evaluations based on target roles, CV uploads, and key tech stack parameters.</p>
      </div>

      {/* STEP 1: SETUP FORM */}
      {step === 'setup' && (
        <div className="section-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3>Interview Setup Criteria</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <strong>Generating custom questions...</strong>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>Tailoring queries to your target job profile...</p>
            </div>
          ) : (
            <form onSubmit={handleStartInterview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="role-select">Target Role</label>
                <select
                  id="role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.95rem' }}
                >
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="DevOps / Cloud Engineer">DevOps / Cloud Engineer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Experience Level</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['junior', 'mid', 'senior'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`btn ${level === lvl ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setLevel(lvl)}
                      style={{ flex: 1, textTransform: 'capitalize' }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tech-stack-input">Primary Tech Stack & Core Libraries</label>
                <input
                  id="tech-stack-input"
                  type="text"
                  placeholder="e.g. React, Node.js, AWS, Postgres"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
                <input
                  id="use-resume"
                  type="checkbox"
                  checked={useResume}
                  onChange={(e) => setUseResume(e.target.checked)}
                />
                <label htmlFor="use-resume" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                  Tailor questions using my uploaded resume doc
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Start Custom Interview
              </button>
            </form>
          )}
        </div>
      )}

      {/* STEP 2: ACTIVE INTERVIEW */}
      {step === 'interview' && activeQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header tracker */}
          <div className="section-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
            <strong>Session: {interview?.title}</strong>
            <span className="badge badge-in_progress" style={{ fontSize: '0.85rem' }}>
              Question {currentIdx + 1} of 5
            </span>
          </div>

          <div className="grid-2col">
            {/* Question description card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="section-card" style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                  <span className="badge badge-completed">{activeQuestion.category}</span>
                  <span className="badge badge-pending">{activeQuestion.difficulty}</span>
                </div>
                <h3 style={{ margin: '0 0 1rem 0', lineHeight: 1.4 }}>{activeQuestion.text}</h3>
                
                {/* Regular input text area for Behavioral questions */}
                {activeQuestion.category !== 'Technical' && (
                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label htmlFor="behavioral-text-answer">Write your response answer here:</label>
                    <textarea
                      id="behavioral-text-answer"
                      rows={12}
                      placeholder="Respond using the STAR framework..."
                      value={behavioralAnswer}
                      onChange={(e) => setBehavioralAnswer(e.target.value)}
                      disabled={feedback !== null || submittingAnswer}
                      style={{ width: '100%', padding: '10px', fontSize: '0.95rem', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {feedback === null && (
                <button
                  onClick={handleSubmitAnswer}
                  className="btn btn-primary"
                  disabled={submittingAnswer}
                  style={{ width: 'fit-content', alignSelf: 'flex-end' }}
                >
                  {submittingAnswer ? 'Evaluating Response...' : 'Submit Answer'}
                </button>
              )}
            </div>

            {/* Technical Monaco Viewport (Side-by-side if technical) OR Feedback view */}
            <div>
              {activeQuestion.category === 'Technical' && feedback === null && (
                <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Code Editor Workspace</strong>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={handleRunCode}
                        className="btn btn-secondary btn-sm"
                        disabled={runningCode}
                        style={{ height: '34px', display: 'flex', alignItems: 'center' }}
                      >
                        {runningCode ? 'Running...' : 'Run Code'}
                      </button>
                      <select
                        value={editorLanguage}
                        onChange={(e) => setEditorLanguage(e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', height: '34px' }}
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                    <Editor
                      height="300px"
                      language={editorLanguage}
                      theme="vs-dark"
                      value={technicalAnswer}
                      onChange={(val) => setTechnicalAnswer(val || '')}
                      options={{ minimap: { enabled: false }, fontSize: 14 }}
                    />
                  </div>

                  {codeOutput && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '5px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Console Terminal Output</span>
                      <pre style={{
                        backgroundColor: '#1e1e1e',
                        color: codeOutput.stderr ? '#f43f5e' : '#38bdf8',
                        padding: '12px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                        maxHeight: '150px'
                      }}>
                        {codeOutput.stderr ? codeOutput.stderr : codeOutput.stdout ? codeOutput.stdout : 'Code executed successfully with no output prints.'}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* FEEDBACK DETAILS CARD */}
              {feedback !== null && (
                <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '5px solid #10b981', height: '100%', boxSizing: 'border-box' }}>
                  <h3 style={{ color: '#10b981', margin: 0 }}>Instant AI Review Feedback</h3>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Correctness Score</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${feedback.correctnessScore}%`, height: '100%', backgroundColor: '#10b981' }}></div>
                        </div>
                        <strong style={{ fontSize: '0.95rem' }}>{feedback.correctnessScore}%</strong>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Clarity & Structure</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${feedback.clarityScore}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
                        </div>
                        <strong style={{ fontSize: '0.95rem' }}>{feedback.clarityScore}%</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', fontWeight: '600' }}>Evaluation Review</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#334155', lineHeight: 1.4 }}>{feedback.feedbackText}</p>
                  </div>

                  <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderLeft: '4px solid #10b981', borderRadius: '4px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#166534', display: 'block' }}>Key Recommended Improvement:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#14532d', lineHeight: 1.4 }}>{feedback.suggestedImprovement}</p>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="btn btn-primary"
                    style={{ marginTop: 'auto', width: 'fit-content', alignSelf: 'flex-end' }}
                  >
                    {currentIdx === interview.questions.length - 1 ? 'Finish Session' : 'Next Question'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: COMPLETED SCREEN */}
      {step === 'completed' && (
        <div className="section-card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: '#10b981', margin: '0 0 1rem 0' }}>Practice Session Finalized!</h2>
          <p style={{ color: '#475569', lineHeight: 1.5, margin: '0 0 2rem 0' }}>
            Congratulations on completing your mock session for the **{role}** profile! Your scores and evaluations have been compiled and sent to your progress dashboard logs.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/" className="btn btn-primary">Return to Dashboard</Link>
            <button onClick={() => setStep('setup')} className="btn btn-secondary">Start New Session</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
