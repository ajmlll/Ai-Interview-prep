const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  await delay(500);
  return {
    totalUsers: 142,
    totalInterviews: 684,
    openaiCallsToday: 1250,
    topTechStacks: [
      { name: 'React + Node.js', count: 284 },
      { name: 'Python + Django', count: 186 },
      { name: 'Go + Kubernetes', count: 124 },
      { name: 'Java + Spring Boot', count: 90 }
    ]
  };
};

// Hardcoded users list to mock toggle state persistence during local run
let mockUsersList: AdminUser[] = [
  { id: '1', name: 'Jane Doe', email: 'user@example.com', role: 'user', lastActive: '2026-07-26T12:00:00Z' },
  { id: '2', name: 'System Admin', email: 'admin@example.com', role: 'admin', lastActive: '2026-07-26T11:45:00Z' },
  { id: '3', name: 'Alice Smith', email: 'alice@example.com', role: 'user', lastActive: '2026-07-25T15:30:00Z' },
  { id: '4', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', lastActive: '2026-07-24T09:15:00Z' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', lastActive: '2026-07-23T18:20:00Z' },
  { id: '6', name: 'David Miller', email: 'david@example.com', role: 'user', lastActive: '2026-07-22T14:10:00Z' },
  { id: '7', name: 'Eva Davis', email: 'eva@example.com', role: 'user', lastActive: '2026-07-21T10:05:00Z' },
  { id: '8', name: 'Frank Wilson', email: 'frank@example.com', role: 'user', lastActive: '2026-07-20T16:40:00Z' }
];

export const listUsers = async (page: number, limit: number = 5): Promise<{ users: AdminUser[]; total: number }> => {
  await delay(400);
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    users: mockUsersList.slice(start, end),
    total: mockUsersList.length
  };
};

export const toggleUserRole = async (userId: string): Promise<AdminUser> => {
  await delay(300);
  const userIdx = mockUsersList.findIndex(u => u.id === userId);
  if (userIdx === -1) throw new Error('User not found');
  
  const currentRole = mockUsersList[userIdx].role;
  const updatedUser: AdminUser = {
    ...mockUsersList[userIdx],
    role: currentRole === 'admin' ? 'user' : 'admin'
  };
  
  // Persist updated role in the local array mockup
  mockUsersList[userIdx] = updatedUser;
  return updatedUser;
};
