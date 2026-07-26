import type { Interview, Question } from '@ai-interview/shared';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateInterview = async (
  role: string,
  level: string,
  techStack: string,
  useResume: boolean
): Promise<Interview> => {
  await delay(1000);
  
  const mockQuestions: Question[] = [
    {
      id: 'q_1',
      text: `Tell me about a time you resolved a complex performance bottleneck in a ${techStack} application. What was your optimization strategy?`,
      category: 'Behavioral',
      difficulty: level === 'senior' ? 'hard' : level === 'mid' ? 'medium' : 'easy'
    },
    {
      id: 'q_2',
      text: `Write a TypeScript function to check if a binary search tree is valid. Make sure to handle edge cases.`,
      category: 'Technical',
      difficulty: level === 'senior' ? 'hard' : level === 'mid' ? 'medium' : 'easy'
    },
    {
      id: 'q_3',
      text: `Design a URL shortening service (like Bitly) to process 10,000 write requests per second. Detail database schemas and hashing schemes.`,
      category: 'System Design',
      difficulty: level === 'senior' ? 'hard' : level === 'mid' ? 'medium' : 'easy'
    },
    {
      id: 'q_4',
      text: `Explain how Event Loop and Async I/O work in the context of Node.js or browser engine runtime.`,
      category: 'Technical',
      difficulty: level === 'senior' ? 'hard' : level === 'mid' ? 'medium' : 'easy'
    },
    {
      id: 'q_5',
      text: `How do you resolve conflict with product managers when negotiating scope changes or deadlines? Describe a real example.`,
      category: 'Behavioral',
      difficulty: level === 'senior' ? 'hard' : level === 'mid' ? 'medium' : 'easy'
    }
  ];

  return {
    id: `int_${Math.random().toString(36).substring(2, 9)}`,
    userId: 'current_user_id',
    title: `${level.charAt(0).toUpperCase() + level.slice(1)} ${role} - ${techStack} (${useResume ? 'With CV' : 'No CV'})`,
    status: 'pending',
    questions: mockQuestions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export interface QuestionFeedback {
  correctnessScore: number;
  clarityScore: number;
  feedbackText: string;
  suggestedImprovement: string;
}

export const submitAnswer = async (
  questionId: string,
  answer: string
): Promise<QuestionFeedback> => {
  await delay(800);
  console.log('Submitted answer for question:', questionId, 'Length:', answer.length);

  const correctnessScore = Math.min(65 + Math.floor(Math.random() * 25) + (answer.length > 50 ? 10 : 0), 100);
  const clarityScore = Math.min(70 + Math.floor(Math.random() * 20) + (answer.length > 100 ? 10 : 0), 100);

  return {
    correctnessScore,
    clarityScore,
    feedbackText: 'Your answer is structured reasonably and covers key architectural/methodological highlights correctly.',
    suggestedImprovement: 'Consider elaborating on specific design trade-offs, metrics (e.g. throughput gains), and fallback options.'
  };
};
