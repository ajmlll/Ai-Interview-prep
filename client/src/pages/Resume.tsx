import React, { useState, useRef } from 'react';
import type { ResumeDoc } from '@ai-interview/shared';
import { uploadResume } from '../api/resume';

const Resume: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedResume, setUploadedResume] = useState<ResumeDoc | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Validate type (PDF or DOCX)
    const validExtensions = ['.pdf', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!isValidType) {
      setErrorMsg('Invalid file type. Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }

    // Validate size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('File size exceeds the 5MB limit. Please upload a smaller file.');
      return;
    }

    // Start upload simulation
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

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Resume Parsing Workspace</h1>
        <p>Upload your resume to extract skills, compute experience metrics, and guide simulated question generators.</p>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      {!uploadedResume && uploadProgress === null && (
        <div 
          className={`section-card`}
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
            transition: 'all 0.2s'
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
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
        <div className="section-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h3>Uploading and parsing resume...</h3>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', marginTop: '1.5rem', overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#0284c7', transition: 'width 0.2s' }}></div>
          </div>
          <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
            {uploadProgress}% Completed
          </span>
        </div>
      )}

      {uploadedResume && (
        <div className="grid-2col">
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', margin: 0 }}>Upload Details</h3>
            
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>File Name</span>
              <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{uploadedResume.fileName}</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Date Uploaded</span>
              <strong>{new Date(uploadedResume.createdAt).toLocaleString()}</strong>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Experience Computed</span>
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
    </div>
  );
};

export default Resume;
