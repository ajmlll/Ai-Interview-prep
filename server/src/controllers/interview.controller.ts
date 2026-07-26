import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { InterviewModel } from '../models/Interview.model';
import type { Question } from '@ai-interview/shared';

// In-memory fallback store for offline mode
const offlineInterviews: any[] = [];

// Helper: generate mock questions for offline/no-AI mode
const buildMockQuestions = (role: string, level: string, techStack: string): Question[] => {
  const diff: 'easy' | 'medium' | 'hard' =
    level === 'senior' ? 'hard' : level === 'mid' ? 'medium' : 'easy';

  return [
    {
      id: 'q_1',
      text: `Tell me about a time you resolved a complex performance bottleneck in a ${techStack} application. What was your optimization strategy?`,
      category: 'Behavioral',
      difficulty: diff
    },
    {
      id: 'q_2',
      text: `Write a TypeScript function to check if a binary search tree is valid. Make sure to handle edge cases.`,
      category: 'Technical',
      difficulty: diff
    },
    {
      id: 'q_3',
      text: `Design a URL shortening service (like Bitly) to process 10,000 write requests per second. Detail database schemas and hashing schemes.`,
      category: 'System Design',
      difficulty: diff
    },
    {
      id: 'q_4',
      text: `Explain how Event Loop and Async I/O work in the context of Node.js or browser engine runtime.`,
      category: 'Technical',
      difficulty: diff
    },
    {
      id: 'q_5',
      text: `How do you resolve conflict with product managers when negotiating scope changes or deadlines? Describe a real example.`,
      category: 'Behavioral',
      difficulty: diff
    },
    {
      id: 'q_6',
      text: `Compare REST APIs vs GraphQL for a large-scale data-heavy ${role} application. When would you choose one over the other?`,
      category: 'Technical',
      difficulty: diff
    },
    {
      id: 'q_7',
      text: `Design a distributed caching and cache-invalidation layer using Redis for high-frequency database read operations.`,
      category: 'System Design',
      difficulty: diff
    },
    {
      id: 'q_8',
      text: `How do database indexes (B-Trees vs Hash indexes) improve query performance? What are the write performance trade-offs?`,
      category: 'Technical',
      difficulty: diff
    },
    {
      id: 'q_9',
      text: `Describe a scenario where a critical bug reached production under your watch. How did you triage, fix, and conduct the post-mortem?`,
      category: 'Behavioral',
      difficulty: diff
    },
    {
      id: 'q_10',
      text: `Explain web application security fundamentals: how do CSRF, XSS, and CORS work, and how do you secure JWT storage?`,
      category: 'Technical',
      difficulty: diff
    }
  ];
};

// POST /api/v1/interviews — generate questions, create session
export const createInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, level, techStack, useResume } = req.body;
    const userId = req.user?.id || 'offline_user';

    const questions = buildMockQuestions(
      role || 'Software Engineer',
      level || 'mid',
      techStack || 'React, Node.js'
    );

    const title = `${(level || 'mid').charAt(0).toUpperCase() + (level || 'mid').slice(1)} ${role || 'Engineer'} — ${techStack || 'General'} (${useResume ? 'With CV' : 'No CV'})`;

    if (mongoose.connection.readyState !== 1) {
      const offlineDoc = {
        id: `offline_int_${Date.now()}`,
        userId,
        title,
        status: 'pending' as const,
        questions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      offlineInterviews.push(offlineDoc);

      res.status(201).json({
        success: true,
        message: 'Interview session created (offline mode)',
        data: offlineDoc
      });
      return;
    }

    const doc = new InterviewModel({ userId, title, status: 'pending', questions });
    await doc.save();
    const saved = doc.toJSON();

    res.status(201).json({
      success: true,
      message: 'Interview session created',
      data: saved
    });
  } catch (error) {
    console.error('createInterview error:', error);
    res.status(500).json({ success: false, message: 'Failed to create interview', data: null });
  }
};

// POST /api/v1/interviews/:id/submit — evaluate a single answer
export const submitInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId, answerText } = req.body;
    const answerLen = (answerText || '').length;

    // Deterministic mock scoring (no OpenAI key needed)
    const correctnessScore = Math.min(65 + Math.floor(Math.random() * 25) + (answerLen > 50 ? 10 : 0), 100);
    const clarityScore = Math.min(70 + Math.floor(Math.random() * 20) + (answerLen > 100 ? 10 : 0), 100);

    const feedback = {
      correctnessScore,
      clarityScore,
      feedbackText: 'Your answer is structured reasonably and covers key architectural/methodological highlights correctly.',
      suggestedImprovement: 'Consider elaborating on specific design trade-offs, metrics (e.g. throughput gains), and fallback options.'
    };

    // Persist to DB if available
    if (mongoose.connection.readyState === 1) {
      const interview = await InterviewModel.findById(req.params.id);
      if (interview) {
        if (!interview.feedback) {
          interview.feedback = {
            overallScore: correctnessScore,
            detailedFeedback: feedback.feedbackText,
            questionWiseScore: []
          };
        }
        interview.feedback.questionWiseScore.push({
          questionId,
          score: correctnessScore,
          feedback: feedback.feedbackText
        });
        await interview.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Answer evaluated',
      data: feedback
    });
  } catch (error) {
    console.error('submitInterview error:', error);
    res.status(500).json({ success: false, message: 'Failed to evaluate answer', data: null });
  }
};

// GET /api/v1/interviews
export const listInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({ success: true, message: 'Interviews listed (offline)', data: offlineInterviews.filter(i => i.userId === userId) });
      return;
    }
    const interviews = await InterviewModel.find({ userId });
    res.status(200).json({ success: true, message: 'Interviews listed', data: interviews.map(i => i.toJSON()) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list interviews', data: null });
  }
};

// GET /api/v1/interviews/:id
export const getInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const found = offlineInterviews.find(i => i.id === req.params.id);
      res.status(found ? 200 : 404).json({ success: !!found, message: found ? 'Found' : 'Not found', data: found || null });
      return;
    }
    const interview = await InterviewModel.findById(req.params.id);
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found', data: null });
      return;
    }
    res.status(200).json({ success: true, message: 'Interview found', data: interview.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get interview', data: null });
  }
};

// POST /api/v1/interviews/:id/start
export const startInterview = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: 'Interview started', data: { id: req.params.id, status: 'in_progress' } });
};
