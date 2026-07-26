import { Router } from 'express';
import { runCode } from '../controllers/code.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Apply requireAuth protection to all execution endpoints
router.use(requireAuth);

// POST /api/v1/code/run
router.post('/run', runCode);

export default router;
