import { Request, Response } from 'express';

// TODO: Implement fetching full profile information of logged-in user
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  console.log('userController.getProfile stub called');
  res.status(200).json({
    success: true,
    message: 'Get user profile TODO',
    data: {
      id: 'dummy_user_id',
      email: 'dummy@example.com',
      name: 'Dummy User',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
};

// TODO: Implement computing aggregate learning stats (e.g. interviews count, average score trends)
export const getProgress = async (req: Request, res: Response): Promise<void> => {
  console.log('userController.getProgress stub called');
  res.status(200).json({
    success: true,
    message: 'Get user progress statistics TODO',
    data: {
      interviewsCompletedCount: 5,
      averageScore: 78,
      categoriesPracticed: ['Behavioral', 'System Design']
    }
  });
};
