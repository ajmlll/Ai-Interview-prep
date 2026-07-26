import mongoose, { Schema, Document } from 'mongoose';
import type { Interview as SharedInterview, Question as SharedQuestion, FeedbackResult } from '@ai-interview/shared';

export interface IInterviewDocument extends Omit<SharedInterview, 'id'>, Document {}

const QuestionSchema = new Schema<SharedQuestion>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  sampleAnswer: { type: String }
});

const FeedbackSchema = new Schema<FeedbackResult>({
  overallScore: { type: Number, required: true },
  detailedFeedback: { type: String, required: true },
  questionWiseScore: [{
    questionId: { type: String, required: true },
    score: { type: Number, required: true },
    feedback: { type: String, required: true }
  }]
});

const InterviewSchema = new Schema<IInterviewDocument>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending', required: true },
  questions: { type: [QuestionSchema], default: [] },
  feedback: { type: FeedbackSchema }
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      const r = ret as any;
      r.id = r._id.toString();
      delete r._id;
      delete r.__v;
      // Ensure timestamp Dates are serialized as ISO strings (matches shared Interview type)
      if (r.createdAt instanceof Date) r.createdAt = r.createdAt.toISOString();
      if (r.updatedAt instanceof Date) r.updatedAt = r.updatedAt.toISOString();
      return r;
    }
  }
});

export const InterviewModel = mongoose.model<IInterviewDocument>('Interview', InterviewSchema);
