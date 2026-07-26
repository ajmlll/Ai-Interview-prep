import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeDoc } from '@ai-interview/shared';
import { uploadResume, getMyResume, analyzeJobDescription, type JDAnalysisResult } from '../api/resume';

const Resume: React.FC = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedResume, setUploadedResume] = useState<ResumeDoc | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // JD Analysis states
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [analyzingJD, setAnalyzingJD] = useState(false);
  const [jdAnalysisResult, setJdAnalysisResult] = useState<JDAnalysisResult | null>(null);
  const [jdErrorMsg, setJdErrorMsg] = useState<string | null>(null);

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
    setJdAnalysisResult(null);

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

  const handleAnalyzeJD = async () => {
    if (!jobDescriptionInput.trim()) {
      setJdErrorMsg('Please paste a job description before analyzing.');
      return;
    }
    if (!uploadedResume) {
      setJdErrorMsg('Please upload your resume first before analyzing against a Job Description.');
      return;
    }

    setJdErrorMsg(null);
    setAnalyzingJD(true);
    try {
      const result = await analyzeJobDescription(jobDescriptionInput);
      setJdAnalysisResult(result);
    } catch (err: any) {
      setJdErrorMsg(err.message || 'Failed to analyze Job Description.');
    } finally {
      setAnalyzingJD(false);
    }
  };

  const handleStartJdInterview = () => {
    sessionStorage.setItem('jd_tailored_text', jobDescriptionInput);
    navigate('/mock-interview');
  };

  if (loadingInitial) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p>Loading resume details...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Resume & Job Description Analysis</h1>
        <p>Upload your CV, compute AI skill match scores against target Job Descriptions, and generate tailored mock interviews.</p>
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

            <button onClick={() => setUploadedResume(null)} className="btn btn-secondary" style={{ marginTop: 'auto', width: 'fit-content' }}>
              Upload New Resume
            </button>
          </div>

          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
            <h3 style={{ margin: 0, paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Parsed Text Preview</h3>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: '#334155', fontFamily: 'monospace' }}>
              {uploadedResume.parsedText}
            </div>
          </div>
        </div>
      )}

      {/* Job Description Match Analyzer Section */}
      <div className="section-card">
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>🎯 Job Description Match Analyzer</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Paste a target job posting below. Gemini AI will evaluate your resume against the requirements to compute a <strong>Match Score %</strong>, highlight missing skills, and customize your mock interview questions.
        </p>

        {jdErrorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 15px', borderRadius: '6px', border: '1px solid #fca5a5', marginBottom: '1rem' }}>
            {jdErrorMsg}
          </div>
        )}

        <textarea
          rows={6}
          placeholder="Paste Job Description text here (e.g. Senior Frontend Engineer duties, required skills, tools)..."
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
            marginBottom: '1rem'
          }}
        />

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={handleAnalyzeJD}
            disabled={analyzingJD || !jobDescriptionInput.trim()}
            className="btn btn-primary"
          >
            {analyzingJD ? 'Analyzing Match with Gemini AI...' : 'Analyze Match & Missing Skills'}
          </button>
        </div>

        {jdAnalysisResult && (
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Analysis Results</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>{jdAnalysisResult.summary}</p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                backgroundColor: jdAnalysisResult.matchScore >= 80 ? '#dcfce7' : jdAnalysisResult.matchScore >= 60 ? '#fef3c7' : '#fee2e2',
                border: `1px solid ${jdAnalysisResult.matchScore >= 80 ? '#86efac' : jdAnalysisResult.matchScore >= 60 ? '#fde047' : '#fca5a5'}`
              }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', fontWeight: 'bold' }}>Match Score</span>
                <div style={{
                  fontSize: '2.25rem',
                  fontWeight: '800',
                  color: jdAnalysisResult.matchScore >= 80 ? '#15803d' : jdAnalysisResult.matchScore >= 60 ? '#b45309' : '#b91c1c'
                }}>
                  {jdAnalysisResult.matchScore}%
                </div>
              </div>
            </div>

            <div className="grid-2col" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#166534' }}>✅ Matching Skills</h4>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {jdAnalysisResult.matchingSkills.map((skill, idx) => (
                    <span key={idx} style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#991b1b' }}>⚠️ Missing / Gaps to Address</h4>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {jdAnalysisResult.missingSkills.map((skill, idx) => (
                    <span key={idx} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {jdAnalysisResult.tailoredRecommendations?.length > 0 && (
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>💡 Tailored Recommendations for Your Interview:</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155' }}>
                  {jdAnalysisResult.tailoredRecommendations.map((rec, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleStartJdInterview}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
            >
              🚀 Start JD-Tailored Mock Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resume;
