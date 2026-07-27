import type { Interview } from '@ai-interview/shared';
import { apiRequest } from './client';

// Shape returned by the server for submitAnswer — must match what MockInterview.tsx uses
export interface QuestionFeedback {
  correctnessScore: number;
  clarityScore: number;
  feedbackText: string;
  suggestedImprovement: string;
}

// Server returns { id, userId, title, status, questions, createdAt, updatedAt }
export const generateInterview = async (
  role: string,
  level: string,
  techStack: string,
  useResume: boolean,
  jobDescription?: string,
  questionFocus?: string
): Promise<Interview> => {
  const result = await apiRequest<Interview>('/interviews', {
    method: 'POST',
    body: JSON.stringify({ role, level, techStack, useResume, jobDescription, questionFocus })
  });

  if (!result.data) {
    throw new Error(result.message || 'Failed to generate interview');
  }

  // Store active interview ID so submitAnswer can reference it
  sessionStorage.setItem('activeInterviewId', result.data.id);

  return result.data;
};

// Server POST /interviews/:id/submit with { questionId, answerText }
// Returns { correctnessScore, clarityScore, feedbackText, suggestedImprovement }
export const submitAnswer = async (
  questionId: string,
  answer: string
): Promise<QuestionFeedback> => {
  const interviewId = sessionStorage.getItem('activeInterviewId');

  const result = await apiRequest<{
    correctnessScore: number;
    clarityScore: number;
    feedbackText: string;
    suggestedImprovement: string;
  }>(`/interviews/${interviewId || 'unknown'}/submit`, {
    method: 'POST',
    body: JSON.stringify({ questionId, answerText: answer })
  });

  if (!result.data) {
    throw new Error(result.message || 'Failed to submit answer');
  }

  return result.data;
};
