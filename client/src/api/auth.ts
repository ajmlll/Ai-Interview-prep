import type { User } from '@ai-interview/shared';
import { apiRequest } from './client';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  } | null;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const result = await apiRequest<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return result as AuthResponse;
};

export const register = async (name: string, email: string, password?: string): Promise<AuthResponse> => {
  const result = await apiRequest<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  return result as AuthResponse;
};

export const refresh = async (): Promise<AuthResponse> => {
  const result = await apiRequest<{ token: string; user: User }>('/auth/refresh', {
    method: 'POST'
  });
  return result as AuthResponse;
};

export const logout = async (): Promise<void> => {
  await apiRequest('/auth/logout', { method: 'POST' });
  document.cookie = 'remember_me=; Max-Age=0; path=/';
};
