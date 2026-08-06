import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area, Cell } from 'recharts';

const CrimeTrends = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/dashboard/analyst');
        if (res.data && res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching trends:', err);
        setError('Failed to load crime trend aggregates.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: '#06b6d4',
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
      <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
        {error}
      </div>
    );
  }

  const { categoryStats, hourStats, hotspotStats } = data;

  // Format hour stats
  const hourData = [...hourStats]
    .sort((a, b) => Number(a._id) - Number(b._id))
    .map(h => {
      const hr = Number(h._id);
      const ampm = hr >= 12 ? 'PM' : 'AM';
      const hr12 = hr % 12 === 0 ? 12 : hr % 12;
      const formattedHr = `${hr12.toString().padStart(2, '0')}:00 ${ampm}`;
      return {
        name: formattedHr,
        Count: h.count
      };
    });

  // Format hotspots
  const hotspotData = hotspotStats.slice(0, 6).map(h => ({
    Station: h.policeStation.length > 15 ? `${h.policeStation.substring(0, 13)}..` : h.policeStation,
    Incidents: h.count
  }));

  // Format categories (top 6 max)
  const categoryData = categoryStats.slice(0, 6).map(c => ({
    Category: c.name.length > 14 ? `${c.name.substring(0, 12)}..` : c.name,
    Count: c.count
  }));

  const COLORS = ['#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          Crime Trend Intelligence
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Breakdowns of temporal patterns, peak incident hours, and geographical clusters.
        </p>
      </div>

      {/* Grid of Trend Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Peak Crime Hours */}
        <div className="glass-card" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>
            Peak Crime Incident Hours (Temporal)
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {hourData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>No hours data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourData} margin={{ left: -20, right: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="Count" stroke="#f59e0b" fill="rgba(245,158,11,0.08)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Most Common Crime Categories */}
        <div className="glass-card" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>
            Most Common Crime Typologies
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {categoryData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>No category data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ left: -20, right: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="Category" stroke="#64748b" fontSize={10} interval={0} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="Count" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Location comparison */}
        <div className="glass-card" style={{ height: '380px', display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>
            Geographical Incident Counts Comparison (Police Jurisdiction)
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {hotspotData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>No station hotspot data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hotspotData} margin={{ left: -20, right: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="Station" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="Incidents" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CrimeTrends;
