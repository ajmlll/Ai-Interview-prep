import * as dotenv from 'dotenv';
// Load environment variables before any submodule imports
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/auth.routes';
import interviewRoutes from './routes/interview.routes';
import resumeRoutes from './routes/resume.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import codeRoutes from './routes/code.routes';
import progressRoutes from './routes/progress.routes';

// Import middleware
import {
  globalErrorHandler,
  notFoundHandler,
  generalRateLimiter,
  authRateLimiter,
  interviewRateLimiter
} from './middlewares/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_interview_prep';

// ─── Global Middlewares ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true, // allow cookies (refresh token)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Apply general rate limit to all API routes
app.use('/api/', generalRateLimiter);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
// Auth: apply brute-force rate limiter on login/register
app.use('/api/v1/auth', authRateLimiter, authRoutes);

// Interviews: apply per-session rate limit on generation
app.use('/api/v1/interviews', interviewRateLimiter, interviewRoutes);
app.use('/api/v1/interview', interviewRateLimiter, interviewRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/code', codeRoutes);
app.use('/api/v1/progress', progressRoutes);

// ─── 404 & Error Handlers (must be LAST) ──────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Database & Server Startup ─────────────────────────────────────────────────
const connectAndStart = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed. Starting server in offline mode...', error);
    app.listen(PORT, () => {
      console.log(`Server is running in offline mode on port ${PORT}`);
    });
  }
};

connectAndStart();

export default app;
