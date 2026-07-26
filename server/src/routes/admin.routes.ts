import { Router } from 'express';
import { getStats, listAllUsers, listAllInterviews } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all admin endpoints (ideally admin roles check too)
router.use(authMiddleware);

// GET /api/v1/admin/stats
router.get('/stats', getStats);

// GET /api/v1/admin/users
router.get('/users', listAllUsers);

// GET /api/v1/admin/interviews
router.get('/interviews', listAllInterviews);

export default router;
