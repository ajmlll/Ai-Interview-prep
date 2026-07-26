import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.model';
import redisClient from '../config/redis';

export const offlineUsers: any[] = [];

// Zod schemas for body validation
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_key_456';
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

// Helper to generate access & refresh tokens
const generateTokenPair = (userId: string, email: string, role: string) => {
  const payload = { id: userId, email, role };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
};

// POST /api/v1/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const bodyResult = registerSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: bodyResult.error.format()
      });
      return;
    }

    const { name, email, password } = bodyResult.data;

    // Offline fallback if MongoDB is down
    if (mongoose.connection.readyState !== 1) {
      const existingOffline = offlineUsers.find(u => u.email === email);
      if (existingOffline) {
        res.status(400).json({
          success: false,
          message: 'A user with this email address already exists.',
          data: null
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = {
        id: `offline_user_${Date.now()}`,
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      offlineUsers.push({ ...newUser, passwordHash });

      const { accessToken, refreshToken } = generateTokenPair(newUser.id, newUser.email, newUser.role);
      await redisClient.set(`refreshToken:${newUser.id}`, refreshToken, 'EX', REFRESH_TOKEN_EXPIRY);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFRESH_TOKEN_EXPIRY * 1000,
        sameSite: 'lax'
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful (offline fallback)',
        data: {
          token: accessToken,
          user: newUser
        }
      });
      return;
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
        data: null
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new UserModel({
      name,
      email,
      passwordHash,
      role: 'user' // default role
    });

    await newUser.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(newUser.id, newUser.email, newUser.role);

    // Save refresh token to Redis
    await redisClient.set(`refreshToken:${newUser.id}`, refreshToken, 'EX', REFRESH_TOKEN_EXPIRY);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_TOKEN_EXPIRY * 1000,
      sameSite: 'lax'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token: accessToken,
        user: newUser.toJSON()
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      data: null
    });
  }
};

// POST /api/v1/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const bodyResult = loginSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: bodyResult.error.format()
      });
      return;
    }

    const { email, password } = bodyResult.data;

    // Offline fallback if MongoDB is down
    if (mongoose.connection.readyState !== 1) {
      const user = offlineUsers.find(u => u.email === email);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          data: null
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          data: null
        });
        return;
      }

      const { accessToken, refreshToken } = generateTokenPair(user.id, user.email, user.role);
      await redisClient.set(`refreshToken:${user.id}`, refreshToken, 'EX', REFRESH_TOKEN_EXPIRY);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFRESH_TOKEN_EXPIRY * 1000,
        sameSite: 'lax'
      });

      const { passwordHash, ...userClean } = user;
      res.status(200).json({
        success: true,
        message: 'Login successful (offline fallback)',
        data: {
          token: accessToken,
          user: userClean
        }
      });
      return;
    }

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null
      });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user.id, user.email, user.role);

    // Save refresh token to Redis
    await redisClient.set(`refreshToken:${user.id}`, refreshToken, 'EX', REFRESH_TOKEN_EXPIRY);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_TOKEN_EXPIRY * 1000,
      sameSite: 'lax'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        user: user.toJSON()
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      data: null
    });
  }
};

// POST /api/v1/auth/refresh
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required',
        data: null
      });
      return;
    }

    // Decode refresh token
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err: any, decoded: any) => {
      if (err || !decoded) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
          data: null
        });
        return;
      }

      const { id, email, role } = decoded as { id: string; email: string; role: string };

      // Validate refresh token matches value in Redis
      const storedToken = await redisClient.get(`refreshToken:${id}`);
      if (!storedToken || storedToken !== refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Session revoked or expired',
          data: null
        });
        return;
      }

      // Find user to return actual profile data
      let userClean: any = null;
      if (mongoose.connection.readyState !== 1) {
        const found = offlineUsers.find(u => u.id === id);
        if (found) {
          const { passwordHash, ...rest } = found;
          userClean = rest;
        }
      } else {
        const user = await UserModel.findById(id);
        if (user) {
          userClean = user.toJSON();
        }
      }

      if (!userClean) {
        res.status(401).json({
          success: false,
          message: 'User no longer exists',
          data: null
        });
        return;
      }

      // Generate new token pair
      const tokens = generateTokenPair(userClean.id, userClean.email, userClean.role);

      // Save new refresh token in Redis (rotate token)
      await redisClient.set(`refreshToken:${userClean.id}`, tokens.refreshToken, 'EX', REFRESH_TOKEN_EXPIRY);

      // Set new refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFRESH_TOKEN_EXPIRY * 1000,
        sameSite: 'lax'
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: tokens.accessToken,
          user: userClean
        }
      });
    });
  } catch (error: any) {
    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh',
      data: null
    });
  }
};

// POST /api/v1/auth/logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      // Decode user ID directly to invalidate Redis key
      try {
        const decoded = jwt.decode(refreshToken) as { id: string } | null;
        if (decoded && decoded.id) {
          await redisClient.del(`refreshToken:${decoded.id}`);
        }
      } catch (err) {
        console.warn('Could not parse refresh token on logout:', err);
      }
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};
