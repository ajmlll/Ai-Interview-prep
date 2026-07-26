import { Router } from 'express';
import { listInterviews, createInterview, getInterview, startInterview, submitInterview } from '../controllers/interview.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Apply requireAuth to all interview endpoints
router.use(requireAuth);

// GET /api/v1/interviews
router.get('/', listInterviews);

// POST /api/v1/interviews & POST /api/v1/interview/generate
router.post('/', createInterview);
router.post('/generate', createInterview);

// GET /api/v1/interviews/:id
router.get('/:id', getInterview);

// POST /api/v1/interviews/:id/start
router.post('/:id/start', startInterview);

// POST /api/v1/interviews/:id/submit & POST /api/v1/interview/:id/answer
router.post('/:id/submit', submitInterview);
router.post('/:id/answer', submitInterview);

export default router;
