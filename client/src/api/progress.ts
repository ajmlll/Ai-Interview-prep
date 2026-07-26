import { apiRequest } from './client';

export interface PerformanceOverTime {
  date: string;
  correctness: number;
  clarity: number;
}

export interface PerformanceByCategory {
  category: string;
  score: number;
}

export interface ProgressData {
  summary: {
    totalInterviews: number;
    averageScore: number;
    mostPracticedStack: string;
  };
  overTime: PerformanceOverTime[];
  byCategory: PerformanceByCategory[];
}

export const getProgress = async (): Promise<ProgressData> => {
  const result = await apiRequest<ProgressData>('/progress/me');

  if (!result.data) {
    throw new Error(result.message || 'Failed to fetch progress data');
  }

  return result.data;
};
