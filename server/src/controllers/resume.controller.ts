import { Request, Response } from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import mongoose from 'mongoose';
import { ResumeModel } from '../models/Resume.model';

export const offlineResumes: any[] = [];

// Configure Multer
const storage = multer.memoryStorage();
const fileFilter = (_req: any, file: any, cb: any) => {
  const nameLower = file.originalname.toLowerCase();
  if (nameLower.endsWith('.pdf') || nameLower.endsWith('.docx')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF (.pdf) and Word documents (.docx) are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Helper for extracting text
const extractText = async (buffer: Buffer, originalname: string): Promise<string> => {
  const nameLower = originalname.toLowerCase();
  if (nameLower.endsWith('.pdf')) {
    const parser = new PDFParse({ data: buffer });
    try {
      const textResult = await parser.getText();
      return textResult.text || '';
    } finally {
      await parser.destroy();
    }
  } else if (nameLower.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }
  throw new Error('Unsupported file format');
};

// POST /api/v1/resume/upload
export const uploadResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
        data: null
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        data: null
      });
      return;
    }

    // Extract text from document buffer
    const parsedText = await extractText(req.file.buffer, req.file.originalname);

    const offlineResumeDoc = {
      id: `offline_res_${Date.now()}`,
      userId: req.user.id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/resumes/${Date.now()}_${req.file.originalname}`,
      parsedText,
      skills: [], // empty for now as requested
      experienceYears: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Offline fallback if MongoDB is down
    if (mongoose.connection.readyState !== 1) {
      offlineResumes.push(offlineResumeDoc);
      res.status(201).json({
        success: true,
        message: 'Resume uploaded and parsed successfully (offline fallback)',
        data: offlineResumeDoc
      });
      return;
    }

    // Save in Database
    const newResume = new ResumeModel({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileUrl: offlineResumeDoc.fileUrl,
      parsedText,
      skills: [],
      experienceYears: 0
    });

    await newResume.save();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: newResume.toJSON()
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error occurred while processing file',
      data: null
    });
  }
};

// GET /api/v1/resume/me (Fetch latest resume metadata + parsedText)
export const getLatestResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        data: null
      });
      return;
    }

    // Offline fallback if MongoDB is down
    if (mongoose.connection.readyState !== 1) {
      const userResumes = offlineResumes.filter(r => r.userId === req.user!.id);
      const latest = userResumes.length > 0 ? userResumes[userResumes.length - 1] : null;

      if (!latest) {
        res.status(404).json({
          success: false,
          message: 'No resume found for this user',
          data: null
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Latest resume fetched successfully (offline fallback)',
        data: latest
      });
      return;
    }

    const latest = await ResumeModel.findOne({ userId: req.user.id })
      .sort({ createdAt: -1 });

    if (!latest) {
      res.status(404).json({
        success: false,
        message: 'No resume found for this user',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Latest resume fetched successfully',
      data: latest.toJSON()
    });
  } catch (error: any) {
    console.error('Fetch latest resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resume',
      data: null
    });
  }
};

// GET /api/v1/resumes
export const listResumes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        data: null
      });
      return;
    }

    // Offline fallback if MongoDB is down
    if (mongoose.connection.readyState !== 1) {
      const userResumes = offlineResumes.filter(r => r.userId === req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Resumes fetched successfully (offline fallback)',
        data: userResumes
      });
      return;
    }

    const resumes = await ResumeModel.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Resumes fetched successfully',
      data: resumes.map(r => r.toJSON())
    });
  } catch (error) {
    console.error('List resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while listing resumes',
      data: null
    });
  }
};

// GET /api/v1/resumes/:id
export const getResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        data: null
      });
      return;
    }

    // Offline fallback if MongoDB is down
    if (mongoose.connection.readyState !== 1) {
      const resume = offlineResumes.find(r => r.id === req.params.id && r.userId === req.user!.id);
      if (!resume) {
        res.status(404).json({
          success: false,
          message: 'Resume record not found',
          data: null
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Resume fetched successfully (offline fallback)',
        data: resume
      });
      return;
    }

    const resume = await ResumeModel.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      res.status(404).json({
        success: false,
        message: 'Resume record not found',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Resume fetched successfully',
      data: resume.toJSON()
    });
  } catch (error) {
    console.error('Get resume details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting resume details',
      data: null
    });
  }
};
