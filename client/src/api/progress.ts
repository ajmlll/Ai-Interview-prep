const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  await delay(600);
  
  return {
    summary: {
      totalInterviews: 8,
      averageScore: 81,
      mostPracticedStack: 'React, Node.js'
    },
    overTime: [
      { date: 'Jul 20', correctness: 68, clarity: 70 },
      { date: 'Jul 21', correctness: 72, clarity: 75 },
      { date: 'Jul 22', correctness: 75, clarity: 74 },
      { date: 'Jul 23', correctness: 78, clarity: 79 },
      { date: 'Jul 24', correctness: 80, clarity: 82 },
      { date: 'Jul 25', correctness: 83, clarity: 85 },
      { date: 'Jul 26', correctness: 85, clarity: 88 }
    ],
    byCategory: [
      { category: 'Behavioral', score: 84 },
      { category: 'Technical', score: 78 },
      { category: 'System Design', score: 81 }
    ]
  };
};
