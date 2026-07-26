import { Request, Response } from 'express';

// TODO: Implement fetching all interviews for the authenticated user from MongoDB
export const listInterviews = async (req: Request, res: Response): Promise<void> => {
  console.log('interviewController.listInterviews stub called');
  res.status(200).json({
    success: true,
    message: 'List interviews TODO',
    data: []
  });
};

// TODO: Implement generating questions using AI and creating interview document in MongoDB
export const createInterview = async (req: Request, res: Response): Promise<void> => {
  console.log('interviewController.createInterview stub called');
  res.status(201).json({
    success: true,
    message: 'Create interview TODO',
    data: {
      id: 'dummy_interview_id',
      userId: 'dummy_user_id',
      title: req.body.title || 'Practice Interview',
      status: 'pending',
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
};

// TODO: Implement fetching a specific interview detail by ID
export const getInterview = async (req: Request, res: Response): Promise<void> => {
  console.log('interviewController.getInterview stub called');
  res.status(200).json({
    success: true,
    message: 'Get interview details TODO',
    data: {
      id: req.params.id,
      userId: 'dummy_user_id',
      title: 'Practice Interview',
      status: 'pending',
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
};

// TODO: Implement transition of interview status to in_progress and log start time
export const startInterview = async (req: Request, res: Response): Promise<void> => {
  console.log('interviewController.startInterview stub called');
  res.status(200).json({
    success: true,
    message: 'Start interview TODO',
    data: {
      id: req.params.id,
      status: 'in_progress'
    }
  });
};

// TODO: Implement submitting answers, using OpenAI to evaluate, and generating detailed feedback
export const submitInterview = async (req: Request, res: Response): Promise<void> => {
  console.log('interviewController.submitInterview stub called');
  res.status(200).json({
    success: true,
    message: 'Submit interview answers and evaluate TODO',
    data: {
      id: req.params.id,
      status: 'completed',
      feedback: {
        overallScore: 85,
        detailedFeedback: 'Overall good response, needs more details on metrics.',
        questionWiseScore: []
      }
    }
  });
};
