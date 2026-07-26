export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleAnswer?: string;
}

export interface FeedbackResult {
  overallScore: number;
  detailedFeedback: string;
  questionWiseScore: Array<{
    questionId: string;
    score: number;
    feedback: string;
  }>;
}

export interface Interview {
  id: string;
  userId: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  questions: Question[];
  feedback?: FeedbackResult;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeDoc {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  parsedText?: string;
  skills: string[];
  experienceYears?: number;
  createdAt: string;
  updatedAt: string;
}
