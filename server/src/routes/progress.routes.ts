import { Router } from 'express';
import { getProgress } from '../controllers/progress.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Apply requireAuth validation checks to all endpoints under this router
router.use(requireAuth);

// GET /api/v1/progress/me
router.get('/me', getProgress);

export default router;
