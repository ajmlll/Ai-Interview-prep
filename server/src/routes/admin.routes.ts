import { Router } from 'express';
import { getStats, listAllUsers, listAllInterviews } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Apply admin role verification checks to all endpoints under this router
router.use(requireAuth, requireRole('admin'));

// GET /api/v1/admin/stats
router.get('/stats', getStats);

// GET /api/v1/admin/users
router.get('/users', listAllUsers);

// GET /api/v1/admin/interviews
router.get('/interviews', listAllInterviews);

export default router;
