import React, { useState } from 'react';
import type { ResumeDoc } from '@ai-interview/shared';

const Resume: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mock resume records list
  const mockResumes: ResumeDoc[] = [
    {
      id: 'res_1',
      userId: 'user_1',
      fileName: 'Software_Engineer_CV.pdf',
      fileUrl: 'http://storage.example.com/cv.pdf',
      skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB'],
      experienceYears: 4,
      createdAt: '2026-07-24T12:00:00Z',
      updatedAt: '2026-07-24T12:00:00Z'
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    console.log('Uploading file:', selectedFile.name);

    setTimeout(() => {
      setIsUploading(false);
      setSelectedFile(null);
      alert('Resume uploaded and parsed successfully!');
    }, 2000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Resume Parser & Keywords Analyzer</h1>
        <p>Upload your resume to extract skills, calculate experience metrics, and guide simulated questions.</p>
      </div>

      <div className="grid-2col">
        <div className="section-card">
          <h3>Upload New Resume</h3>
          <form onSubmit={handleUpload} style={{ marginTop: '15px' }}>
            <div className="form-group">
              <label htmlFor="resume-file">Choose PDF or DOCX file</label>
              <input
                id="resume-file"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isUploading || !selectedFile}>
              {isUploading ? 'Parsing Document...' : 'Upload & Parse'}
            </button>
          </form>
        </div>

        <div className="section-card">
          <h3>Active CV Analyses</h3>
          {mockResumes.map((resume) => (
            <div key={resume.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginTop: '15px' }}>
              <h4>{resume.fileName}</h4>
              <p style={{ margin: '5px 0' }}><strong>Experience parsed:</strong> {resume.experienceYears} Years</p>
              <div>
                <strong>Skills identified:</strong>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                  {resume.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-completed">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resume;
