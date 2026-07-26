import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeDoc } from '@ai-interview/shared';
import { getMyResume, analyzeJobDescription, type JDAnalysisResult } from '../api/resume';

const JdAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeDoc | null>(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<JDAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const doc = await getMyResume();
        setResume(doc);
      } catch (err) {
        // No resume found
      } finally {
        setLoadingResume(false);
      }
    };
    fetchResume();
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescriptionInput.trim()) {
      setErrorMsg('Please paste target Job Description text.');
      return;
    }
    if (!resume) {
      setErrorMsg('Please upload a resume first before running JD Match Analysis.');
      return;
    }

    setErrorMsg(null);
    setAnalyzing(true);
    try {
      const data = await analyzeJobDescription(jobDescriptionInput);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze Job Description.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartJdInterview = () => {
    sessionStorage.setItem('jd_tailored_text', jobDescriptionInput);
    navigate('/mock-interview');
  };

  if (loadingResume) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p>Loading candidate resume context...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎯 JD Match & ATS Skill Gap Analyzer</h1>
        <p>Paste target job postings to compute AI Match Scores, audit missing keywords, and launch tailored mock interviews.</p>
      </div>

      {!resume && (
        <div style={{ backgroundColor: '#fffbebfb', color: '#b45309', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fde047', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>No Resume Uploaded Yet:</strong> Please upload your CV on the Resume page to enable AI Match analysis against Job Descriptions.
          </div>
          <button onClick={() => navigate('/resume')} className="btn btn-primary btn-sm">
            Upload Resume
          </button>
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 15px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
          {errorMsg}
        </div>
      )}

      <div className="section-card">
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Paste Job Description</h3>
        <textarea
          rows={7}
          placeholder="Paste Job Description text here (duties, responsibilities, required skills, tools)..."
          value={jobDescriptionInput}
          onChange={(e) => setJobDescriptionInput(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            marginBottom: '1.25rem'
          }}
        />

        <button
          onClick={handleAnalyze}
          disabled={analyzing || !jobDescriptionInput.trim() || !resume}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
        >
          {analyzing ? 'Analyzing Match with Gemini AI...' : 'Analyze Match & Skill Gaps'}
        </button>
      </div>

      {result && (
        <div className="section-card" style={{ animation: 'fadeIn 0.3s ease-in' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>Match Summary</h2>
              <p style={{ margin: '0.35rem 0 0 0', color: '#475569', fontSize: '1.05rem' }}>{result.summary}</p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '1rem 2rem',
              borderRadius: '10px',
              backgroundColor: result.matchScore >= 80 ? '#dcfce7' : result.matchScore >= 60 ? '#fef3c7' : '#fee2e2',
              border: `1px solid ${result.matchScore >= 80 ? '#86efac' : result.matchScore >= 60 ? '#fde047' : '#fca5a5'}`
            }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', fontWeight: 'bold' }}>Match Score</span>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                lineHeight: 1.1,
                color: result.matchScore >= 80 ? '#15803d' : result.matchScore >= 60 ? '#b45309' : '#b91c1c'
              }}>
                {result.matchScore}%
              </div>
            </div>
          </div>

          <div className="grid-2col" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#166534', fontSize: '1.1rem' }}>✅ Matching Skills & Tech Stack</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {result.matchingSkills.map((skill, idx) => (
                  <span key={idx} style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '5px 12px', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: '600' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#991b1b', fontSize: '1.1rem' }}>⚠️ Missing Keywords & Gaps</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {result.missingSkills.map((skill, idx) => (
                  <span key={idx} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '5px 12px', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: '600' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {result.tailoredRecommendations?.length > 0 && (
            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.05rem' }}>💡 Tailored Recommendations for Your Interview:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', lineHeight: 1.6 }}>
                {result.tailoredRecommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: '0.35rem' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleStartJdInterview}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '700' }}
          >
            🚀 Launch JD-Tailored Mock Interview
          </button>
        </div>
      )}
    </div>
  );
};

export default JdAnalyzer;
