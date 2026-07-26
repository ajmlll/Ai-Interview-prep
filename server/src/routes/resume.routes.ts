import { Router } from 'express';
import { uploadResume, getLatestResume, listResumes, getResume, upload, analyzeJobDescription } from '../controllers/resume.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all resume endpoints
router.use(requireAuth);

// Support POST /api/v1/resume/upload or POST /api/v1/resumes
router.post('/upload', upload.single('file'), uploadResume);
router.post('/', upload.single('file'), uploadResume);

// Support POST /api/v1/resume/analyze-jd or POST /api/v1/resumes/analyze-jd
router.post('/analyze-jd', analyzeJobDescription);

// Support GET /api/v1/resume/me or GET /api/v1/resumes/me
router.get('/me', getLatestResume);

// GET /api/v1/resumes list and detail
router.get('/', listResumes);
router.get('/:id', getResume);

export default router;
