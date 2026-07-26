import { apiRequest } from './client';

export interface AdminStats {
  totalUsers: number;
  totalInterviews: number;
  openaiCallsToday: number;
  topTechStacks: Array<{ name: string; count: number }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  lastActive: string;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const result = await apiRequest<AdminStats>('/admin/stats');

  if (!result.data) {
    throw new Error(result.message || 'Failed to fetch admin stats');
  }

  return result.data;
};

export const listUsers = async (page: number, limit: number = 5): Promise<{ users: AdminUser[]; total: number }> => {
  const result = await apiRequest<{ users: AdminUser[]; total: number }>(
    `/admin/users?page=${page}&limit=${limit}`
  );

  if (!result.data) {
    throw new Error(result.message || 'Failed to list users');
  }

  return result.data;
};

// toggleUserRole is kept as a client-side mock since we don't have a PATCH /admin/users/:id endpoint yet
let mockRoleCache: Record<string, 'user' | 'admin'> = {};

export const toggleUserRole = async (userId: string): Promise<AdminUser> => {
  // Fetch fresh user list to find current role
  const { users } = await listUsers(1, 100);
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  // Flip role in cache and return patched object
  const currentRole = mockRoleCache[userId] ?? user.role;
  const newRole: 'user' | 'admin' = currentRole === 'admin' ? 'user' : 'admin';
  mockRoleCache[userId] = newRole;

  return { ...user, role: newRole };
};
