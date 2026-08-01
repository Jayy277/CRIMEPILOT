import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import CaseCard from '../../components/CaseCard';
import AnimatedCounter from '../../components/AnimatedCounter';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalAssigned: 0, pendingCount: 0, solvedCount: 0 });
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOfficerStats = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/dashboard/officer');
        if (response.data && response.data.success) {
          setStats(response.data.stats);
          setRecentCases(response.data.recentCases || []);
        }
      } catch (err) {
        console.error('Error fetching officer dashboard:', err);
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOfficerStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: 'var(--theme-accent, #3B82F6)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Space Grotesk, sans-serif', color: '#fff' }}>
          Officer Dashboard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Welcome back, Officer {user?.name}. Here is a summary of your assigned case loads.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #E0384D', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {/* Stats Widgets - Staggered entrance & Counters */}
      <div className="dashboard-grid stagger-container">
        {/* Total Assigned */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '50ms', borderLeft: '4px solid #3B82F6' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Assigned Cases</span>
            <div className="dashboard-stat-value" style={{ color: '#3B82F6' }}>
              <AnimatedCounter value={stats.totalAssigned} />
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '12px', color: '#3B82F6' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
        </div>

        {/* Pending Count (Active) */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '100ms', borderLeft: '4px solid #E0384D' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Pending Case Load</span>
              <span className="red-dot" style={{ width: '6px', height: '6px', backgroundColor: '#E0384D' }} />
            </div>
            <div className="dashboard-stat-value" style={{ color: '#E0384D' }}>
              <AnimatedCounter value={stats.pendingCount} />
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(224,56,77,0.1)', padding: '12px', borderRadius: '12px', color: '#E0384D' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        </div>

        {/* Solved Count */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '150ms', borderLeft: '4px solid #22C55E' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Cases Solved</span>
            <div className="dashboard-stat-value" style={{ color: '#22C55E' }}>
              <AnimatedCounter value={stats.solvedCount} />
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(34,197,94,0.1)', padding: '12px', borderRadius: '12px', color: '#22C55E' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Crime Reports */}
      <div className="stagger-item" style={{ animationDelay: '200ms' }}>
        <h2 style={{ fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif', color: '#fff', marginBottom: '16px' }}>
          Recent Crime Assignments
        </h2>
        {recentCases.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No recent crime cases assigned to you.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {recentCases.map(crime => {
              const caseKey = crime._id || crime.id;
              return <CaseCard key={caseKey} crime={crime} role="officer" />;
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
