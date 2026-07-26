import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { getProgress } from '../api/progress';
import type { ProgressData } from '../api/progress';
import { AnalyticsIcon, ZapIcon } from '../components/Icons';

const Progress: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const result = await getProgress();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
        <h3>Loading Progress Metrics...</h3>
        <p style={{ color: '#64748b' }}>Analyzing historical mock transcripts from MongoDB...</p>
      </div>
    );
  }

  // Custom colors for Bar Chart categories
  const barColors = ['#0284c7', '#10b981', '#f59e0b'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.25rem' }}>
          <div className="card-header-icon card-icon-cyan" style={{ margin: 0 }}>
            <AnalyticsIcon size={24} />
          </div>
          <h1>Your Preparation Progress</h1>
        </div>
        <p>Monitor your performance scores across categories and track live improvement timelines from MongoDB database records.</p>
      </div>

      {data.summary.totalInterviews === 0 && (
        <div className="alert-banner alert-banner-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <strong>No Sessions Recorded Yet:</strong> Take your first mock interview to start generating dynamic performance charts and category analytics!
          </div>
          <button onClick={() => navigate('/mock-interview')} className="btn btn-primary btn-sm">
            <ZapIcon size={16} color="#ffffff" />
            Start Mock Interview
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Mock Sessions</h3>
          <p className="stat-number">{data.summary.totalInterviews}</p>
        </div>
        <div className="stat-card">
          <h3>Average Evaluated Score</h3>
          <p className="stat-number">{data.summary.averageScore}%</p>
        </div>
        <div className="stat-card">
          <h3>Most Practiced Tech Stack</h3>
          <p className="stat-number" style={{ fontSize: '1.4rem', marginTop: '15px' }}>
            {data.summary.mostPracticedStack}
          </p>
        </div>
      </div>

      <div className="grid-2col">
        {/* Line Chart */}
        <div className="section-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1.5rem 0' }}>Performance Evaluation Over Time</h3>
          <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.overTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="correctness" stroke="#0284c7" strokeWidth={2} name="Correctness %" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="clarity" stroke="#10b981" strokeWidth={2} name="Clarity %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="section-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1.5rem 0' }}>Performance Score By Question Type</h3>
          <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 100]} />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} name="Average Score %" maxBarSize={60}>
                  {data.byCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
