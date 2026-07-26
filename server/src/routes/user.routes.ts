import { Router } from 'express';
import { getProfile, getProgress } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Apply requireAuth to all user endpoints
router.use(requireAuth);

// GET /api/v1/users/profile
router.get('/profile', getProfile);

// GET /api/v1/users/progress
router.get('/progress', getProgress);

export default router;
