import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/auth.routes';
import interviewRoutes from './routes/interview.routes';
import resumeRoutes from './routes/resume.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_interview_prep';

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Register API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/users', userRoutes);

// Connect to MongoDB & Start Server
const connectAndStart = async () => {
  try {
    console.log('Connecting to MongoDB...');
    // In a real application, you might use additional mongoose connection options.
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed. Starting server in offline mode...', error);
    // Even if db connection fails, start server so the stubs are testable during dev setup
    app.listen(PORT, () => {
      console.log(`Server is running in offline mode on port ${PORT}`);
    });
  }
};

connectAndStart();

export default app;
