import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeDoc } from '@ai-interview/shared';
import { getMyResume, getResumeAudit, type ResumeAuditResult } from '../api/resume';

const ResumeScore: React.FC = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeDoc | null>(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<ResumeAuditResult | null>(null);
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

  const handleRunAudit = async () => {
    if (!resume) {
      setErrorMsg('Please upload a resume first before running an AI score audit.');
      return;
    }

    setErrorMsg(null);
    setAuditing(true);
    try {
      const data = await getResumeAudit();
      setAuditResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to run AI Resume Audit.');
    } finally {
      setAuditing(false);
    }
  };

  if (loadingResume) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p>Loading candidate resume...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>💡 AI Resume Score & ATS Audit</h1>
        <p>Audit your CV against recruiter screening criteria: ATS readability, metric impact, brevity, and grammar.</p>
      </div>

      {!resume ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <h3>No Resume Uploaded</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Upload your resume document on the Resume page to unlock instant AI scoring & ATS audit breakdown.</p>
          <button onClick={() => navigate('/resume')} className="btn btn-primary">
            Go to Resume Upload
          </button>
        </div>
      ) : (
        <>
          <div className="section-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Active Resume: <strong>{resume.fileName}</strong></h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                Uploaded on {new Date(resume.createdAt).toLocaleDateString()} • {resume.skills.length} Extracted Skills
              </p>
            </div>
            <button
              onClick={handleRunAudit}
              disabled={auditing}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              {auditing ? 'Running AI Audit with Gemini...' : 'Run Comprehensive AI Audit'}
            </button>
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 15px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
              {errorMsg}
            </div>
          )}

          {auditResult && (
            <div className="page-container" style={{ animation: 'fadeIn 0.3s ease-in' }}>
              {/* Score Cards Grid */}
              <div className="stats-grid">
                <div className="stat-card" style={{ borderTop: '4px solid #0284c7' }}>
                  <h3>Overall Resume Score</h3>
                  <div className="stat-number" style={{ color: '#0284c7' }}>{auditResult.overallScore} / 100</div>
                </div>

                <div className="stat-card" style={{ borderTop: '4px solid #16a34a' }}>
                  <h3>ATS Readability Score</h3>
                  <div className="stat-number" style={{ color: '#16a34a' }}>{auditResult.atsScore}%</div>
                </div>

                <div className="stat-card" style={{ borderTop: '4px solid #d97706' }}>
                  <h3>Impact & Metrics Score</h3>
                  <div className="stat-number" style={{ color: '#d97706' }}>{auditResult.impactScore}%</div>
                </div>

                <div className="stat-card" style={{ borderTop: '4px solid #9333ea' }}>
                  <h3>Grammar & Tone Score</h3>
                  <div className="stat-number" style={{ color: '#9333ea' }}>{auditResult.grammarScore}%</div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid-2col">
                <div className="section-card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <h3 style={{ color: '#166534', marginTop: 0 }}>✅ Key Strengths</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#14532d', lineHeight: 1.6 }}>
                    {auditResult.strengths.map((str, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="section-card" style={{ backgroundColor: '#fffbebfb', border: '1px solid #fde047' }}>
                  <h3 style={{ color: '#92400e', marginTop: 0 }}>⚠️ Areas to Improve</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#78350f', lineHeight: 1.6 }}>
                    {auditResult.improvements.map((imp, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Bullet Point Rewrites */}
              {auditResult.suggestedRewrites?.length > 0 && (
                <div className="section-card">
                  <h3 style={{ marginTop: 0 }}>✨ High-Impact AI Bullet Point Rewrites</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {auditResult.suggestedRewrites.map((item, idx) => (
                      <div key={idx} style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 'bold', marginBottom: '0.25rem' }}>Original Line:</div>
                        <div style={{ color: '#64748b', textDecoration: 'line-through', marginBottom: '0.75rem', fontSize: '0.95rem' }}>{item.original}</div>
                        
                        <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 'bold', marginBottom: '0.25rem' }}>High-Impact AI Version:</div>
                        <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.95rem' }}>{item.improved}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResumeScore;
