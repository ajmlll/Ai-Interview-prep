import { Request, Response } from 'express';

// TODO: Implement fetching aggregated system metrics (total users, interviews conducted, token usage)
export const getStats = async (req: Request, res: Response): Promise<void> => {
  console.log('adminController.getStats stub called');
  res.status(200).json({
    success: true,
    message: 'Get admin system stats TODO',
    data: {
      totalUsers: 120,
      totalInterviewsConducted: 450,
      openAiTokensUsed: 980000
    }
  });
};

// TODO: Implement paginated database list of all system users
export const listAllUsers = async (req: Request, res: Response): Promise<void> => {
  console.log('adminController.listAllUsers stub called');
  res.status(200).json({
    success: true,
    message: 'List all users (Admin) TODO',
    data: []
  });
};

// TODO: Implement auditing dashboard endpoints to list all interviews across platform
export const listAllInterviews = async (req: Request, res: Response): Promise<void> => {
  console.log('adminController.listAllInterviews stub called');
  res.status(200).json({
    success: true,
    message: 'List all interviews (Admin) TODO',
    data: []
  });
};
