import { Router } from 'express';
import { listInterviews, createInterview, getInterview, startInterview, submitInterview } from '../controllers/interview.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all interview endpoints
router.use(authMiddleware);

// GET /api/v1/interviews
router.get('/', listInterviews);

// POST /api/v1/interviews
router.post('/', createInterview);

// GET /api/v1/interviews/:id
router.get('/:id', getInterview);

// POST /api/v1/interviews/:id/start
router.post('/:id/start', startInterview);

// POST /api/v1/interviews/:id/submit
router.post('/:id/submit', submitInterview);

export default router;
