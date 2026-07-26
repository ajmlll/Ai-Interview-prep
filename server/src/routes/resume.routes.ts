import { Router } from 'express';
import { uploadResume, listResumes, getResume } from '../controllers/resume.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all resume endpoints
router.use(authMiddleware);

// POST /api/v1/resumes
router.post('/', uploadResume);

// GET /api/v1/resumes
router.get('/', listResumes);

// GET /api/v1/resumes/:id
router.get('/:id', getResume);

export default router;
