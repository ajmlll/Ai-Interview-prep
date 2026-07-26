import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface DecodedUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token required',
      data: null
    });
    return;
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key_123';

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
        data: null
      });
      return;
    }

    const payload = decoded as DecodedUser;
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role
    };

    next();
  });
};

export const requireRole = (role: 'user' | 'admin') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        data: null
      });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        success: false,
        message: `Forbidden: requires ${role} role`,
        data: null
      });
      return;
    }

    next();
  };
};

// Keep old authMiddleware exports as stub references so that other routes continue compiling
export const authMiddleware = requireAuth;
