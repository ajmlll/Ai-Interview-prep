import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeDoc } from '@ai-interview/shared';
import { uploadResume, getMyResume, getResumeAudit, type ResumeAuditResult } from '../api/resume';

const Resume: React.FC = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedResume, setUploadedResume] = useState<ResumeDoc | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // AI Audit states
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<ResumeAuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchExistingResume = async () => {
      try {
        const resume = await getMyResume();
        if (resume) setUploadedResume(resume);
      } catch (err) {
        // No existing resume found
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchExistingResume();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndUpload = async (file: File) => {
    setErrorMsg(null);
    setUploadedResume(null);
    setAuditResult(null);

    const validExtensions = ['.pdf', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!isValidType) {
      setErrorMsg('Invalid file type. Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('File size exceeds the 5MB limit. Please upload a smaller file.');
      return;
    }

    setUploadProgress(0);
    try {
      const result = await uploadResume(file, (progress) => {
        setUploadProgress(progress);
      });
      setUploadedResume(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during upload.');
    } finally {
      setUploadProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const handleRunAudit = async () => {
    if (!uploadedResume) {
      setAuditError('Please upload a resume first.');
      return;
    }

    setAuditError(null);
    setAuditing(true);
    try {
      const data = await getResumeAudit();
      setAuditResult(data);
    } catch (err: any) {
      setAuditError(err.message || 'Failed to run AI Resume Audit.');
    } finally {
      setAuditing(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p>Loading resume studio...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📄 Resume Studio & AI Audit</h1>
        <p>Upload your CV (PDF or DOCX) for text parsing, skill extraction, ATS readability scoring, and high-impact AI bullet rewrites.</p>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '6px', border: '1px solid #fca5a5', marginBottom: '1.5rem' }}>
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {!uploadedResume && uploadProgress === null && (
        <div 
          className="section-card"
          style={{ 
            border: dragActive ? '2px dashed #0284c7' : '2px dashed #cbd5e1',
            backgroundColor: dragActive ? '#f0f9ff' : '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '2rem'
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            style={{ display: 'none' }} 
            accept=".pdf,.docx"
            onChange={handleChange}
          />
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#64748b' }}>📄</div>
          <h3>Drag and drop your resume file here</h3>
          <p style={{ margin: '0.25rem 0 1.5rem 0', color: '#64748b' }}>Supports PDF and DOCX formats (Max size: 5MB)</p>
          <button type="button" className="btn btn-secondary">
            Or Click to Browse Files
          </button>
        </div>
      )}

      {uploadProgress !== null && (
        <div className="section-card" style={{ textAlign: 'center', padding: '3rem 2rem', marginBottom: '2rem' }}>
          <h3>Uploading and analyzing resume with AI...</h3>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', marginTop: '1.5rem', overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#0284c7', transition: 'width 0.2s' }}></div>
          </div>
          <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
            {uploadProgress}% Completed
          </span>
        </div>
      )}

      {uploadedResume && (
        <>
          <div className="grid-2col" style={{ marginBottom: '2rem' }}>
            <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Upload Details</span>
                <span className="badge badge-completed">AI Analyzed</span>
              </h3>
              
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>File Name</span>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{uploadedResume.fileName}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Date Uploaded</span>
                <strong>{new Date(uploadedResume.createdAt).toLocaleString()}</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Experience Estimated</span>
                <strong>{uploadedResume.experienceYears} Years</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Extracted Skills</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {uploadedResume.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-completed">{skill}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', flexWrap: 'wrap' }}>
                <button
                  onClick={handleRunAudit}
                  disabled={auditing}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {auditing ? 'Auditing with Gemini AI...' : '💡 Run AI Score Audit'}
                </button>
                <button onClick={() => setUploadedResume(null)} className="btn btn-secondary">
                  Change File
                </button>
              </div>
            </div>

            <div className="section-card" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
              <h3 style={{ margin: 0, paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Parsed Text Preview</h3>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: '#334155', fontFamily: 'monospace' }}>
                {uploadedResume.parsedText}
              </div>
            </div>
          </div>

          {/* AI Audit Results Breakdown */}
          {auditError && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 15px', borderRadius: '6px', border: '1px solid #fca5a5', marginBottom: '1.5rem' }}>
              {auditError}
            </div>
          )}

          {auditResult && (
            <div className="page-container" style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease-in' }}>
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

          {/* Quick Action Navigation Grid */}
          <div className="quick-start-grid">
            <div className="quick-start-card">
              <h4>🎯 Analyze Against Job Posting</h4>
              <p>Compare this resume against a target Job Description to compute your Match Score % and missing keywords.</p>
              <button onClick={() => navigate('/jd-analyzer')} className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '10px' }}>
                Open JD Match Analyzer
              </button>
            </div>

            <div className="quick-start-card">
              <h4>✉️ Cover Letter & Cold Email</h4>
              <p>Generate ATS-optimized cover letters and recruiter outreach templates based on this resume.</p>
              <button onClick={() => navigate('/cover-letter')} className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '10px' }}>
                Generate Cover Letter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Resume;
