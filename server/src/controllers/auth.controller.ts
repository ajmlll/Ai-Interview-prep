import { Request, Response } from 'express';

// TODO: Implement user registration logic, hashing passwords, storing in DB
export const register = async (req: Request, res: Response): Promise<void> => {
  console.log('authController.register stub called');
  res.status(201).json({
    success: true,
    message: 'User registration TODO',
    data: null
  });
};

// TODO: Implement login logic, validating credentials, generating JWT & refresh tokens
export const login = async (req: Request, res: Response): Promise<void> => {
  console.log('authController.login stub called');
  res.status(200).json({
    success: true,
    message: 'User login TODO',
    data: {
      token: 'dummy_jwt_access_token',
      refreshToken: 'dummy_jwt_refresh_token',
      user: {
        id: 'dummy_user_id',
        email: 'dummy@example.com',
        name: 'Dummy User',
        role: 'user'
      }
    }
  });
};

// TODO: Implement refresh token validation and access token regeneration
export const refresh = async (req: Request, res: Response): Promise<void> => {
  console.log('authController.refresh stub called');
  res.status(200).json({
    success: true,
    message: 'Token refresh TODO',
    data: {
      token: 'dummy_new_jwt_access_token'
    }
  });
};

// TODO: Implement logout logic, blacklisting refresh tokens or clearing cookies
export const logout = async (req: Request, res: Response): Promise<void> => {
  console.log('authController.logout stub called');
  res.status(200).json({
    success: true,
    message: 'User logout TODO'
  });
};
