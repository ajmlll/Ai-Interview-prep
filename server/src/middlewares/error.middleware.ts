import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// ─── Consistent error shape ──────────────────────────────────────────────────
export interface ApiError extends Error {
  statusCode?: number;
}

/**
 * Global Express error-handling middleware.
 * Must be registered LAST with app.use() — after all routes.
 */
export const globalErrorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
};

/**
 * 404 handler — register before globalErrorHandler but after all routes.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null
  });
};

// ─── Rate Limiters ────────────────────────────────────────────────────────────

/**
 * Auth rate limiter: relaxed max limit to prevent unwanted local development blocks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 mins to avoid blocking
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in a few moments.',
      data: null
    });
  }
});

/**
 * Interview generation rate limiter: relaxed limit.
 */
export const interviewRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Interview generation rate limit exceeded. Please try again in a few moments.',
      data: null
    });
  }
});

/**
 * General API rate limiter.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please slow down.',
      data: null
    });
  }
});
