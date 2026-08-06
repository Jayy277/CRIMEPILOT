import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import AnimatedCounter from '../../components/AnimatedCounter';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalystStats = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/dashboard/analyst');
        if (res.data && res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching analyst stats:', err);
        setError('Failed to fetch analyst dashboard aggregation metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalystStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: 'var(--theme-accent, #F5A623)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card" style={{ borderLeft: '4px solid #E0384D', padding: '16px', color: '#fda4af' }}>
        {error}
      </div>
    );
  }

  const { summary, categoryStats, monthlyTrends, hotspotStats } = data;

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const trendChartData = [...monthlyTrends]
    .reverse()
    .map(t => {
      const mIdx = Math.max(0, (t._id.month || 1) - 1) % 12;
      return {
        name: `${MONTH_NAMES[mIdx]} ${t._id.year}`,
        Crimes: t.count
      };
    });

  const categoryChartData = categoryStats
    .slice(0, 6)
    .map(c => ({
      name: c.name.length > 14 ? `${c.name.substring(0, 12)}..` : c.name,
      fullName: c.name,
      Count: c.count
    }));

  const COLORS = ['#3B82F6', '#ec4899', '#F5A623', '#22C55E', '#8b5cf6', '#a855f7', '#E0384D'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Space Grotesk, sans-serif', color: '#fff' }}>
          Tactical Analyst Command Center
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Aggregated crime statistics and pattern intelligence visualization.
        </p>
      </div>

      {/* Summary Stats Cards */}
      <div className="dashboard-grid stagger-container">
        {/* Total Crimes */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '40ms', borderLeft: '4px solid #3B82F6' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Crimes Logged</span>
            <div className="dashboard-stat-value" style={{ color: '#3B82F6' }}>
              <AnimatedCounter value={summary.totalCrimes} />
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '12px', color: '#3B82F6' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>

        {/* Solved Cases */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '80ms', borderLeft: '4px solid #22C55E' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Cases Solved</span>
            <div className="dashboard-stat-value" style={{ color: '#22C55E' }}>
              <AnimatedCounter value={summary.solvedCount} />
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(34,197,94,0.1)', padding: '12px', borderRadius: '12px', color: '#22C55E' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        </div>

        {/* Pending Cases */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '120ms', borderLeft: '4px solid #E0384D' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Active Investigations</span>
            <div className="dashboard-stat-value" style={{ color: '#E0384D' }}>
              <AnimatedCounter value={summary.pendingCount} />
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(224,56,77,0.1)', padding: '12px', borderRadius: '12px', color: '#E0384D' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
        </div>

        {/* Solved Rate */}
        <div className="glass-card dashboard-stat-card stagger-item" style={{ animationDelay: '160ms', borderLeft: '4px solid #F5A623' }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Resolution Rate</span>
            <div className="dashboard-stat-value" style={{ color: '#F5A623' }}>
              <AnimatedCounter value={parseFloat(summary.solvedRate)} />%
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(245,166,35,0.1)', padding: '12px', borderRadius: '12px', color: '#F5A623' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="stagger-item" style={{ animationDelay: '200ms', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Monthly Trend Chart */}
        <div className="glass-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Crime Case Volume Trend</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {trendChartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>No trend data recorded.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ left: -20, right: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5A623" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A2233', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="Crimes" stroke="#F5A623" strokeWidth={3} fillOpacity={1} fill="url(#amberGradient)" animationDuration={600} activeDot={{ r: 6, fill: '#FFC107' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="glass-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Crime Category Distribution</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {categoryChartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>No category data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ left: -20, right: 10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A2233', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="Count" radius={[4, 4, 0, 0]} animationDuration={600}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Jurisdictional Hotspots List */}
      <div className="glass-card stagger-item" style={{ animationDelay: '250ms' }}>
        <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Top Crime Hotspots Jurisdictions</h3>
        {hotspotStats.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', padding: '10px 0' }}>No hotspot data available.</div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Police Station</th>
                  <th>City</th>
                  <th>District</th>
                  <th>State</th>
                  <th>Incidents Filed</th>
                </tr>
              </thead>
              <tbody>
                {hotspotStats.map((hot, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: '#fff' }}>{hot.policeStation}</td>
                    <td>{hot.city}</td>
                    <td>{hot.district}</td>
                    <td>{hot.state}</td>
                    <td style={{ fontWeight: '700', color: '#E0384D', fontFamily: 'JetBrains Mono, monospace' }}>{hot.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
