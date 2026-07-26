import type { User } from '@ai-interview/shared';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  } | null;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  await delay(800);
  
  if (email === 'admin@example.com' && password === 'password123') {
    return {
      success: true,
      message: 'Login successful',
      data: {
        token: 'mock-jwt-access-token-admin',
        user: {
          id: 'admin_1',
          email: 'admin@example.com',
          name: 'System Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    };
  } else if (email === 'user@example.com' && password === 'password123') {
    return {
      success: true,
      message: 'Login successful',
      data: {
        token: 'mock-jwt-access-token-user',
        user: {
          id: 'user_1',
          email: 'user@example.com',
          name: 'Jane Doe',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    };
  } else {
    throw new Error('Invalid email or password. Hint: use user@example.com / password123');
  }
};

export const register = async (name: string, email: string, password?: string): Promise<AuthResponse> => {
  await delay(800);
  console.log('Registered with password length:', password?.length || 0);
  
  return {
    success: true,
    message: 'Registration successful',
    data: {
      token: 'mock-jwt-access-token-registered',
      user: {
        id: 'user_new',
        email,
        name,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  };
};

export const refresh = async (): Promise<AuthResponse> => {
  await delay(500);
  
  const hasRememberMe = document.cookie.includes('remember_me=true');
  if (hasRememberMe) {
    return {
      success: true,
      message: 'Token refreshed',
      data: {
        token: 'mock-jwt-access-token-refreshed',
        user: {
          id: 'user_remembered',
          email: 'user@example.com',
          name: 'Jane Doe (Remembered)',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    };
  }
  throw new Error('No valid session found');
};

export const logout = async (): Promise<void> => {
  await delay(300);
  document.cookie = 'remember_me=; Max-Age=0; path=/';
};
