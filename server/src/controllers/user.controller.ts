import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.model';
import { offlineUsers } from './auth.controller';

// GET /api/v1/users/profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized', data: null });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      const offlineUser = offlineUsers.find(u => u.id === req.user!.id);
      if (!offlineUser) {
        res.status(404).json({ success: false, message: 'User not found', data: null });
        return;
      }
      const { passwordHash: _ph, ...safeUser } = offlineUser as any;
      res.status(200).json({ success: true, message: 'Profile fetched', data: safeUser });
      return;
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found', data: null });
      return;
    }

    res.status(200).json({ success: true, message: 'Profile fetched', data: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching profile', data: null });
  }
};

// GET /api/v1/users/progress — delegated to the dedicated progress controller
export const getProgress = async (_req: Request, res: Response): Promise<void> => {
  res.redirect(307, '/api/v1/progress/me');
};
