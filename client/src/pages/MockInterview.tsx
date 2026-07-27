import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type { Interview, Question } from '@ai-interview/shared';
import { generateInterview, submitAnswer } from '../api/interview';
import type { QuestionFeedback } from '../api/interview';
import { useAuth } from '../context/AuthContext';
import { runCode } from '../api/code';
import { MockInterviewIcon, ZapIcon } from '../components/Icons';

// Global Real-World Job Roles Catalog
const GLOBAL_JOB_ROLES = [
  'Full Stack Developer',
  'Senior Frontend Architect',
  'Backend Systems Engineer',
  'DevOps & Cloud Infrastructure Engineer',
  'AI / ML Research Engineer',
  'Data Scientist & Analytics Engineer',
  'Cybersecurity Analyst & Ethical Hacker',
  'Site Reliability Engineer (SRE)',
  'Mobile iOS / Android Developer',
  'Technical Product Manager (TPM)',
  'Embedded Systems & IoT Engineer',
  'Database Administrator (DBA)',
  'QA Automation Test Engineer',
  'Solutions Architect',
  'Blockchain & Smart Contract Developer',
  'Robotics & Computer Vision Engineer',
  'Game Engine Developer',
  'Security & Compliance Engineer'
];

const MockInterview: React.FC = () => {
  // Step State: 'setup' | 'interview' | 'completed'
  const [step, setStep] = useState<'setup' | 'interview' | 'completed'>('setup');
  
  // Setup Options
  const [roleInput, setRoleInput] = useState('Full Stack Developer');
  const [roleSearchFilter, setRoleSearchFilter] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [level, setLevel] = useState<'junior' | 'mid' | 'senior' | 'staff'>('mid');
  const [techStack, setTechStack] = useState('React, TypeScript, Node.js, PostgreSQL');
  const [questionFocus, setQuestionFocus] = useState('balanced');
  const [useResume, setUseResume] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    const cachedJd = sessionStorage.getItem('jd_tailored_text');
    if (cachedJd) {
      setJobDescription(cachedJd);
      setUseResume(true);
    }
  }, []);

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
    if (!roleInput.trim()) {
      alert('Please enter or select a target job role.');
      return;
    }

    setLoading(true);
    try {
      const session = await generateInterview(
        roleInput.trim(),
        level,
        techStack,
        useResume,
        jobDescription,
        questionFocus
      );
      setInterview(session);
      setStep('interview');
      setCurrentIdx(0);
      resetInputs(session.questions[0]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate interview with Gemini AI.');
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

  // Filter global job roles catalog
  const filteredRoles = GLOBAL_JOB_ROLES.filter(r =>
    r.toLowerCase().includes((roleSearchFilter || roleInput).toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.25rem' }}>
          <div className="card-header-icon card-icon-indigo" style={{ margin: 0 }}>
            <MockInterviewIcon size={24} />
          </div>
          <h1>Simulated Mock Interview Studio</h1>
        </div>
        <p>Harness tailored AI evaluations based on global job roles, seniority levels, CV uploads, and real-world tech stacks.</p>
      </div>

      {/* STEP PROGRESS INDICATOR */}
      <div className="section-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: step === 'setup' ? '#0284c7' : '#10b981',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem'
            }}>1</span>
            <span style={{ fontWeight: step === 'setup' ? '700' : '600', color: step === 'setup' ? '#0f172a' : '#64748b' }}>Configure Interview</span>
          </div>

          <div style={{ flex: 1, height: 2, backgroundColor: '#e2e8f0', minWidth: 40 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: step === 'interview' ? '#0284c7' : step === 'completed' ? '#10b981' : '#cbd5e1',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem'
            }}>2</span>
            <span style={{ fontWeight: step === 'interview' ? '700' : '600', color: step === 'interview' ? '#0f172a' : '#64748b' }}>
              {step === 'interview' ? `Question ${currentIdx + 1} of ${interview?.questions.length || 10}` : 'Live Mock Session'}
            </span>
          </div>

          <div style={{ flex: 1, height: 2, backgroundColor: '#e2e8f0', minWidth: 40 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: step === 'completed' ? '#10b981' : '#cbd5e1',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem'
            }}>3</span>
            <span style={{ fontWeight: step === 'completed' ? '700' : '600', color: step === 'completed' ? '#0f172a' : '#64748b' }}>Evaluation Summary</span>
          </div>
        </div>
      </div>

      {/* STEP 1: SETUP FORM */}
      {step === 'setup' && (
        <div className="section-card" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Select Target Role & Career Parameters</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            Search or type any real-world job title in the world. Gemini AI will craft 10 customized questions matching your target seniority and focus areas.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div className="card-header-icon card-icon-indigo" style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 1rem auto' }}>
                <ZapIcon size={32} />
              </div>
              <h3 style={{ margin: 0 }}>Generating 10 Tailored Questions with Gemini AI...</h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.5rem' }}>
                Calibrating queries for <strong>{roleInput}</strong> ({level.toUpperCase()} level)...
              </p>
            </div>
          ) : (
            <form onSubmit={handleStartInterview} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Global Role Search / Custom Input */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label htmlFor="global-role-input" style={{ fontWeight: '700', color: '#0f172a' }}>
                  Target Job Role (Search or type any role in the world)
                </label>
                <input
                  id="global-role-input"
                  type="text"
                  placeholder="e.g. Senior Full Stack Developer, AI Engineer, DevOps..."
                  value={roleInput}
                  onChange={(e) => {
                    setRoleInput(e.target.value);
                    setRoleSearchFilter(e.target.value);
                    setShowRoleDropdown(true);
                  }}
                  onFocus={() => setShowRoleDropdown(true)}
                  required
                />

                {showRoleDropdown && filteredRoles.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    marginTop: '4px'
                  }}>
                    {filteredRoles.map((r, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setRoleInput(r);
                          setShowRoleDropdown(false);
                        }}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          fontSize: '0.92rem',
                          color: '#334155',
                          fontWeight: roleInput === r ? '700' : '500',
                          backgroundColor: roleInput === r ? '#f0f9ff' : 'transparent'
                        }}
                      >
                        {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Real-World Seniority Level */}
              <div className="form-group">
                <label style={{ fontWeight: '700', color: '#0f172a' }}>Experience Seniority Level</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  {[
                    { id: 'junior', label: 'Junior / Entry', desc: '0–2 yrs exp' },
                    { id: 'mid', label: 'Mid-Level', desc: '3–5 yrs exp' },
                    { id: 'senior', label: 'Senior Lead', desc: '5–8 yrs exp' },
                    { id: 'staff', label: 'Staff Architect', desc: '8+ yrs exp' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      className={`btn ${level === lvl.id ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setLevel(lvl.id as any)}
                      style={{
                        padding: '0.75rem 0.5rem',
                        flexDirection: 'column',
                        gap: '2px',
                        borderRadius: '10px'
                      }}
                    >
                      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lvl.label}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Focus Mode */}
              <div className="form-group">
                <label style={{ fontWeight: '700', color: '#0f172a' }}>Question Category Focus</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                  {[
                    { id: 'balanced', label: 'Balanced Mix', desc: 'Technical & Behavioral' },
                    { id: 'system_design', label: 'System Design', desc: 'High Scalability & Microservices' },
                    { id: 'behavioral', label: 'Behavioral STAR', desc: 'Leadership & Incident Response' },
                    { id: 'algorithms', label: 'Coding & Algos', desc: 'Technical Problem Solving' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`btn ${questionFocus === f.id ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setQuestionFocus(f.id)}
                      style={{
                        padding: '0.75rem 0.5rem',
                        flexDirection: 'column',
                        gap: '2px',
                        borderRadius: '10px'
                      }}
                    >
                      <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>{f.label}</span>
                      <span style={{ fontSize: '0.73rem', opacity: 0.85 }}>{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Tech Stack */}
              <div className="form-group">
                <label htmlFor="tech-stack-input" style={{ fontWeight: '700', color: '#0f172a' }}>
                  Primary Tech Stack & Core Libraries
                </label>
                <input
                  id="tech-stack-input"
                  type="text"
                  placeholder="e.g. React, TypeScript, Node.js, Python, AWS, Docker..."
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  required
                />
              </div>

              {/* CV Integration Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <input
                  id="use-resume"
                  type="checkbox"
                  checked={useResume}
                  onChange={(e) => setUseResume(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="use-resume" style={{ fontSize: '0.92rem', cursor: 'pointer', userSelect: 'none', color: '#334155', fontWeight: '600' }}>
                  Tailor questions using my uploaded CV resume details
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.9rem', fontSize: '1.05rem', fontWeight: '700' }}>
                <ZapIcon size={20} color="#ffffff" />
                Launch 10-Question Gemini Mock Session
              </button>
            </form>
          )}
        </div>
      )}

      {/* STEP 2: ACTIVE INTERVIEW */}
      {step === 'interview' && activeQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header tracker & Progress Bar */}
          <div className="section-card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Session Title</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>{interview?.title}</h3>
              </div>
              <span className="badge badge-in_progress" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                Question {currentIdx + 1} of {interview?.questions.length || 10}
              </span>
            </div>

            {/* Progress bar fill */}
            <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                width: `${((currentIdx + 1) / (interview?.questions.length || 10)) * 100}%`,
                height: '100%',
                backgroundColor: '#0284c7',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          <div className="grid-2col">
            {/* Question description card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="section-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                  <span className="badge badge-completed">{activeQuestion.category}</span>
                  <span className="badge badge-pending">{activeQuestion.difficulty}</span>
                </div>

                <h3 style={{ margin: '0 0 1rem 0', lineHeight: 1.5, fontSize: '1.15rem', color: '#0f172a' }}>
                  {activeQuestion.text}
                </h3>
                
                {/* Regular input text area for Behavioral / System Design questions */}
                {activeQuestion.category !== 'Technical' && (
                  <div className="form-group" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <label htmlFor="behavioral-text-answer" style={{ fontWeight: '700' }}>Your Response Answer:</label>
                    <textarea
                      id="behavioral-text-answer"
                      rows={10}
                      placeholder="Write your response using structured STAR methodology (Situation, Task, Action, Result)..."
                      value={behavioralAnswer}
                      onChange={(e) => setBehavioralAnswer(e.target.value)}
                      disabled={feedback !== null || submittingAnswer}
                      style={{ width: '100%', padding: '12px', fontSize: '0.95rem', borderRadius: '10px', border: '1px solid #cbd5e1', resize: 'vertical' }}
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
                  style={{ width: 'fit-content', alignSelf: 'flex-end', padding: '0.75rem 1.75rem' }}
                >
                  {submittingAnswer ? 'Evaluating Response with AI...' : 'Submit Answer for AI Review'}
                </button>
              )}
            </div>

            {/* Technical Monaco Viewport (Side-by-side if technical) OR Feedback view */}
            <div>
              {activeQuestion.category === 'Technical' && feedback === null && (
                <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Code Editor Sandbox</strong>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={handleRunCode}
                        className="btn btn-secondary btn-sm"
                        disabled={runningCode}
                        style={{ height: '34px', display: 'flex', alignItems: 'center' }}
                      >
                        {runningCode ? 'Running...' : '▶ Run Code'}
                      </button>
                      <select
                        value={editorLanguage}
                        onChange={(e) => setEditorLanguage(e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', height: '34px', fontSize: '0.85rem' }}
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                    <Editor
                      height="320px"
                      language={editorLanguage}
                      theme="vs-dark"
                      value={technicalAnswer}
                      onChange={(val) => setTechnicalAnswer(val || '')}
                      options={{ minimap: { enabled: false }, fontSize: 14 }}
                    />
                  </div>

                  {codeOutput && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '5px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Console Terminal Output</span>
                      <pre style={{
                        backgroundColor: '#0f172a',
                        color: codeOutput.stderr ? '#f87171' : '#38bdf8',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        margin: 0,
                        maxHeight: '150px'
                      }}>
                        {codeOutput.stderr ? codeOutput.stderr : codeOutput.stdout ? codeOutput.stdout : 'Code executed cleanly with zero error outputs.'}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* FEEDBACK DETAILS CARD */}
              {feedback !== null && (
                <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '5px solid #10b981', height: '100%', boxSizing: 'border-box' }}>
                  <h3 style={{ color: '#10b981', margin: 0 }}>Instant AI Evaluation Review</h3>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Correctness Score</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${feedback.correctnessScore}%`, height: '100%', backgroundColor: '#10b981' }} />
                        </div>
                        <strong style={{ fontSize: '0.95rem' }}>{feedback.correctnessScore}%</strong>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Clarity & Structure</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${feedback.clarityScore}%`, height: '100%', backgroundColor: '#0284c7' }} />
                        </div>
                        <strong style={{ fontSize: '0.95rem' }}>{feedback.clarityScore}%</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', fontWeight: '700' }}>Evaluation Review</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.93rem', color: '#334155', lineHeight: 1.5 }}>{feedback.feedbackText}</p>
                  </div>

                  <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderLeft: '4px solid #10b981', borderRadius: '8px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#166534', display: 'block' }}>Key Recommended Improvement:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', color: '#14532d', lineHeight: 1.5 }}>{feedback.suggestedImprovement}</p>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="btn btn-primary"
                    style={{ marginTop: 'auto', width: 'fit-content', alignSelf: 'flex-end', padding: '0.75rem 1.5rem' }}
                  >
                    {currentIdx === (interview?.questions.length || 10) - 1 ? 'Finish Session & Log Metrics' : 'Next Question ▶'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: COMPLETED SCREEN */}
      {step === 'completed' && (
        <div className="section-card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: '#10b981', margin: '0 0 1rem 0' }}>Practice Session Finalized!</h2>
          <p style={{ color: '#475569', lineHeight: 1.6, margin: '0 0 2rem 0', fontSize: '1.05rem' }}>
            Congratulations on completing your mock session for the <strong>{roleInput}</strong> profile! Your responses and scores have been recorded in MongoDB.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary">Return to Dashboard</Link>
            <button onClick={() => setStep('setup')} className="btn btn-secondary">Start New Session</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
