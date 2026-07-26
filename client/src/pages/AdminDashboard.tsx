import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, listUsers, toggleUserRole } from '../api/admin';
import type { AdminStats, AdminUser } from '../api/admin';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Role Guard
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const USERS_PER_PAGE = 5;

  const fetchStats = async () => {
    try {
      const result = await getAdminStats();
      setStats(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { users: resultUsers, total } = await listUsers(page, USERS_PER_PAGE);
      setUsers(resultUsers);
      setTotalUsers(total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleToggleRole = async (userId: string) => {
    try {
      await toggleUserRole(userId);
      fetchUsers(); // Refresh active page row data
    } catch (err) {
      console.error(err);
      alert('Failed to modify user role.');
    }
  };

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Control Panel</h1>
        <p>Monitor platform usage analytics, audit mock interviews, and manage registered accounts.</p>
      </div>

      {/* KPI Cards */}
      {loadingStats || !stats ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>Loading KPI statistics...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Registered Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Interviews Conducted</h3>
            <p className="stat-number">{stats.totalInterviews}</p>
          </div>
          <div className="stat-card">
            <h3>OpenAI Tokens Today</h3>
            <p className="stat-number">{stats.openaiCallsToday}</p>
          </div>
        </div>
      )}

      <div className="grid-2col">
        {/* User Table Card */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3>System Registered Accounts</h3>
          {loadingUsers ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>Loading user collection...</div>
          ) : (
            <>
              <div style={{ flex: 1, overflowX: 'auto' }}>
                <table className="data-table" style={{ marginTop: 0 }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-completed' : 'badge-pending'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleRole(u.id)}
                            className="btn btn-secondary btn-sm"
                          >
                            Toggle Role
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 0}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tech Stacks KPI breakdown card */}
        <div className="section-card">
          <h3>Popular Tech Stacks Demands</h3>
          {loadingStats || !stats ? (
            <div>Loading statistics data...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {stats.topTechStacks.map((stack, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <strong>{stack.name}</strong>
                    <span style={{ color: '#64748b' }}>{stack.count} practice runs</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                    {/* Calculate percentage relative to the highest count (which is index 0) */}
                    <div style={{ width: `${(stack.count / stats.topTechStacks[0].count) * 100}%`, height: '100%', backgroundColor: '#0284c7' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
