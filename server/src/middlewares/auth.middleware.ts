import { Request, Response, NextFunction } from 'express';

// TODO: Implement actual JWT authentication verification, token decoding, and database check
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  console.log('authMiddleware stub called');
  
  // For now, attach a dummy user object so subsequent handlers can compile
  (req as any).user = {
    id: 'dummy_user_id',
    email: 'dummy@example.com',
    role: 'user'
  };
  
  next();
};
