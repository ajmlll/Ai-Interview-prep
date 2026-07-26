import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeDoc } from '@ai-interview/shared';
import { getMyResume, generateCoverLetter, type CoverLetterResult } from '../api/resume';

const CoverLetter: React.FC = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeDoc | null>(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [tone, setTone] = useState<'Professional' | 'Confident' | 'Technical' | 'Startup'>('Professional');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCover, setCopiedCover] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

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

  const handleGenerate = async () => {
    if (!jobDescriptionInput.trim()) {
      setErrorMsg('Please paste target Job Description text.');
      return;
    }
    if (!resume) {
      setErrorMsg('Please upload a resume first to generate a tailored cover letter.');
      return;
    }

    setErrorMsg(null);
    setGenerating(true);
    setResult(null);
    try {
      const data = await generateCoverLetter(jobDescriptionInput, tone);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate cover letter.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'cover' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'cover') {
      setCopiedCover(true);
      setTimeout(() => setCopiedCover(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
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
        <h1>✉️ AI Cover Letter & Cold Email Generator</h1>
        <p>Generate tailored, high-converting Cover Letters and hiring manager cold outreach emails in seconds using Gemini AI.</p>
      </div>

      {!resume && (
        <div style={{ backgroundColor: '#fffbebfb', color: '#b45309', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fde047', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>No Resume Uploaded Yet:</strong> Please upload your CV on the Resume page so Gemini AI can extract your personal work history.
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
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>1. Paste Target Job Description</h3>
        <textarea
          rows={6}
          placeholder="Paste Job Description text here..."
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

        <h3 style={{ marginBottom: '0.75rem' }}>2. Select Tone</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {(['Professional', 'Confident', 'Technical', 'Startup'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={tone === t ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem' }}
            >
              {t} Tone
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !jobDescriptionInput.trim() || !resume}
          className="btn btn-primary"
          style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem', fontWeight: '700' }}
        >
          {generating ? 'Generating Materials with Gemini AI...' : '✨ Generate Cover Letter & Cold Email'}
        </button>
      </div>

      {result && (
        <div className="grid-2col" style={{ gap: '1.5rem', animation: 'fadeIn 0.3s ease-in' }}>
          {/* Cover Letter Card */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>📄 Tailored Cover Letter</h3>
              <button
                onClick={() => copyToClipboard(result.coverLetter, 'cover')}
                className="btn btn-secondary btn-sm"
              >
                {copiedCover ? '✓ Copied!' : '📋 Copy Text'}
              </button>
            </div>
            <div style={{
              flex: 1,
              whiteSpace: 'pre-wrap',
              fontSize: '0.95rem',
              color: '#334155',
              lineHeight: 1.65,
              backgroundColor: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontFamily: 'sans-serif'
            }}>
              {result.coverLetter}
            </div>
          </div>

          {/* Hiring Manager Cold Email Card */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>✉️ Hiring Manager Cold Email</h3>
              <button
                onClick={() => copyToClipboard(`Subject: ${result.subjectLine}\n\n${result.coldEmail}`, 'email')}
                className="btn btn-secondary btn-sm"
              >
                {copiedEmail ? '✓ Copied!' : '📋 Copy Email'}
              </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '6px', color: '#0369a1', fontSize: '0.9rem' }}>
              <strong>Subject Line:</strong> {result.subjectLine}
            </div>

            <div style={{
              flex: 1,
              whiteSpace: 'pre-wrap',
              fontSize: '0.95rem',
              color: '#334155',
              lineHeight: 1.65,
              backgroundColor: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontFamily: 'sans-serif'
            }}>
              {result.coldEmail}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetter;
