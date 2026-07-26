import { Request, Response } from 'express';

// TODO: Implement file upload storage (Multer/S3), text extraction (pdf-parse), and DB insertion
export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  console.log('resumeController.uploadResume stub called');
  res.status(201).json({
    success: true,
    message: 'Upload and parse resume TODO',
    data: {
      id: 'dummy_resume_id',
      userId: 'dummy_user_id',
      fileName: 'resume.pdf',
      fileUrl: 'http://storage.example.com/resume.pdf',
      skills: ['TypeScript', 'Node.js', 'Express', 'React'],
      experienceYears: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
};

// TODO: Implement listing all resumes for the authenticated user from MongoDB
export const listResumes = async (req: Request, res: Response): Promise<void> => {
  console.log('resumeController.listResumes stub called');
  res.status(200).json({
    success: true,
    message: 'List resumes TODO',
    data: []
  });
};

// TODO: Implement fetching specific resume analysis results by ID
export const getResume = async (req: Request, res: Response): Promise<void> => {
  console.log('resumeController.getResume stub called');
  res.status(200).json({
    success: true,
    message: 'Get resume details TODO',
    data: {
      id: req.params.id,
      userId: 'dummy_user_id',
      fileName: 'resume.pdf',
      fileUrl: 'http://storage.example.com/resume.pdf',
      skills: ['TypeScript', 'Node.js', 'Express', 'React'],
      experienceYears: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
};
