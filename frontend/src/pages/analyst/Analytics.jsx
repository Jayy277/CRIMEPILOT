import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip, XAxis, YAxis } from 'recharts';
import { FaShieldAlt, FaUserShield, FaCheckCircle, FaExclamationTriangle, FaFilter } from 'react-icons/fa';

const Analytics = () => {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [crimeCategory, setCrimeCategory] = useState('');
  const [location, setLocation] = useState('');

  // Aggregated Data
  const [crimes, setCrimes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    officersCount: 7,
    solved: 0,
    unsolvedRate: 0,
    solvedRate: 0
  });
  
  const [priorityData, setPriorityData] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFetchingOptions(true);
        const [categoriesRes, locationsRes] = await Promise.all([
          axiosInstance.get('/admin/crime-categories'),
          axiosInstance.get('/admin/locations'),
        ]);

        if (categoriesRes.data && categoriesRes.data.categories) {
          setCategories(categoriesRes.data.categories);
        }
        if (locationsRes.data && locationsRes.data.locations) {
          setLocations(locationsRes.data.locations);
        }
      } catch (err) {
        console.error('Error fetching deep analytics filters:', err);
        setError('Failed to fetch filter options.');
      } finally {
        setFetchingOptions(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleApplyFilters = async () => {
    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams();
      if (crimeCategory) queryParams.append('crimeCategory', crimeCategory);
      if (location) queryParams.append('location', location);

      const res = await axiosInstance.get(`/crimes?${queryParams.toString()}`);
      if (res.data && res.data.success) {
        let list = res.data.crimes || [];

        // Apply date filtering client-side if specified
        if (startDate) {
          const start = new Date(startDate);
          list = list.filter(c => new Date(c.date) >= start);
        }
        if (endDate) {
          const end = new Date(endDate + 'T23:59:59.999Z');
          list = list.filter(c => new Date(c.date) <= end);
        }

        setCrimes(list);

        // 1. Calculate general stats
        const total = list.length;
        const solved = list.filter(c => !c.isPending).length;
        const solvedRate = total > 0 ? Math.round((solved / total) * 100) : 0;
        const unsolvedRate = total > 0 ? 100 - solvedRate : 0;

        setStats({
          total,
          officersCount: 7, // Seeded 7 officers
          solved,
          solvedRate,
          unsolvedRate
        });

        // 2. Priority Distribution Data (Pie Chart)
        const priorityCounts = list.reduce((acc, c) => {
          acc[c.priority] = (acc[c.priority] || 0) + 1;
          return acc;
        }, {});
        
        const priorityChart = [
          { name: 'Critical', value: priorityCounts['Critical'] || 0, color: '#E0384D' },
          { name: 'High', value: priorityCounts['High'] || 0, color: '#F5A623' },
          { name: 'Medium', value: priorityCounts['Medium'] || 0, color: '#3B82F6' },
          { name: 'Low', value: priorityCounts['Low'] || 0, color: '#10B981' }
        ].filter(p => p.value > 0);
        
        setPriorityData(priorityChart);

        // 3. Category Breakdown Data (Horizontal Bars)
        const categoryCounts = list.reduce((acc, c) => {
          const catName = c.category?.name || 'General';
          acc[catName] = (acc[catName] || 0) + 1;
          return acc;
        }, {});

        const categoryChart = Object.keys(categoryCounts).map(name => ({
          name,
          count: categoryCounts[name],
          percentage: total > 0 ? Math.round((categoryCounts[name] / total) * 100) : 0
        })).sort((a, b) => b.count - a.count);

        setCategoryBreakdown(categoryChart);

        // 4. Time Series Data (Line Chart)
        const dateCounts = list.reduce((acc, c) => {
          const formattedDate = new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[formattedDate] = (acc[formattedDate] || 0) + 1;
          return acc;
        }, {});

        const timeSeries = Object.keys(dateCounts).map(dateKey => ({
          date: dateKey,
          Cases: dateCounts[dateKey],
          rawDate: new Date(dateKey)
        })).sort((a, b) => a.rawDate - b.rawDate);

        setTimeSeriesData(timeSeries);
      }
    } catch (err) {
      console.error('Error fetching analytics breakdown:', err);
      setError('Failed to compute deep analytics values.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchingOptions) {
      handleApplyFilters();
    }
  }, [fetchingOptions, crimeCategory, location, startDate, endDate]);

  if (fetchingOptions) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: '#F5A623',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: 0 }}>Analytics Overview</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>Track and analyze your CrimePilot case metrics, category loads, and priorities.</p>
        </div>
      </div>

      {/* Advanced Interactive Filters */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          <FaFilter style={{ color: '#F5A623' }} /> Case File Filtering
        </div>
        <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(255, 255, 255, 0.08)', color: '#fff', fontSize: '13px' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(255, 255, 255, 0.08)', color: '#fff', fontSize: '13px' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Crime Category</label>
            <select
              className="form-control"
              value={crimeCategory}
              onChange={e => setCrimeCategory(e.target.value)}
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(255, 255, 255, 0.08)', color: '#fff', fontSize: '13px' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Police Station</label>
            <select
              className="form-control"
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(255, 255, 255, 0.08)', color: '#fff', fontSize: '13px' }}
            >
              <option value="">All Stations</option>
              {locations.map(l => (
                <option key={l._id || l.id} value={l._id || l.id}>{l.policeStation}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(224, 56, 77, 0.1)', borderLeft: '4px solid #E0384D', color: '#fda4af', borderRadius: '4px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Total Views -> Total Cases */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #3B82F6' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Cases Filed</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.total}</div>
            <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              +12% <span style={{ color: '#64748b' }}>from last month</span>
            </span>
          </div>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '14px', borderRadius: '12px', color: '#3B82F6', fontSize: '20px' }}>
            <FaShieldAlt />
          </div>
        </div>

        {/* Total Users -> Active Staff Officers */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #F5A623' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active Officers</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.officersCount}</div>
            <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              100% <span style={{ color: '#64748b' }}>on active duty</span>
            </span>
          </div>
          <div style={{ backgroundColor: 'rgba(245, 166, 35, 0.1)', padding: '14px', borderRadius: '12px', color: '#F5A623', fontSize: '20px' }}>
            <FaUserShield />
          </div>
        </div>

        {/* Conversions -> Cases Solved */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #10B981' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Resolved Cases</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.solved}</div>
            <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              {stats.solvedRate}% <span style={{ color: '#64748b' }}>resolution rate</span>
            </span>
          </div>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '12px', color: '#10B981', fontSize: '20px' }}>
            <FaCheckCircle />
          </div>
        </div>

        {/* Bounce Rate -> Active Rate */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #E0384D' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active Investigations</span>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.total - stats.solved}</div>
            <span style={{ fontSize: '11px', color: '#E0384D', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              {stats.unsolvedRate}% <span style={{ color: '#64748b' }}>pending caseload</span>
            </span>
          </div>
          <div style={{ backgroundColor: 'rgba(224, 56, 77, 0.1)', padding: '14px', borderRadius: '12px', color: '#E0384D', fontSize: '20px' }}>
            <FaExclamationTriangle />
          </div>
        </div>

      </div>

      {/* Main Diagrams Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Visitors Over Time -> Cases Volume Over Time */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '360px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0 }}>Incident Progression Over Time</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Filing timeline trend analysis</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            {timeSeriesData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>No timeline logs matching filter.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ left: -20, right: 10, bottom: 5 }}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A2233', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="Cases" stroke="#3B82F6" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* User Distribution -> Case Priority Distribution */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '360px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0 }}>Case Severity Distribution</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Critical vs low priority index</span>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
            {priorityData.length === 0 ? (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', color: '#64748b' }}>No priority data.</div>
            ) : (
              <>
                <div style={{ height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1A2233', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {priorityData.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
                      <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>{item.name}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto', marginRight: '24px' }}>{item.value} ({Math.round(item.value / stats.total * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Traffic Sources & Top Pages Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Traffic Sources -> Category Case Loads */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0 }}>Category Load Factors</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Caseload density per category</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
            {categoryBreakdown.slice(0, 5).map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500', color: '#cbd5e1' }}>
                  <span>{cat.name}</span>
                  <span style={{ color: '#fff' }}>{cat.count} cases ({cat.percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${cat.percentage}%`,
                    height: '100%',
                    backgroundColor: ['#3B82F6', '#F5A623', '#10B981', '#E0384D', '#a855f7'][idx % 5],
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages -> Top Active Cases */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0 }}>Critical Active Cases</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Primary emergency investigation log files</span>
          </div>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <th style={{ padding: '10px 8px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Case ID</th>
                  <th style={{ padding: '10px 8px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Category</th>
                  <th style={{ padding: '10px 8px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Priority</th>
                  <th style={{ padding: '10px 8px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {crimes.slice(0, 5).map((crime, idx) => {
                  const idText = crime.crimeId || `CR-${crime.id}`;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: '#fff' }}>{idText}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', color: '#cbd5e1' }}>{crime.category?.name || 'General'}</td>
                      <td style={{ padding: '12px 8px', fontSize: '12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          backgroundColor: crime.priority === 'Critical' ? 'rgba(224, 56, 77, 0.15)' :
                                           crime.priority === 'High' ? 'rgba(245, 166, 35, 0.15)' :
                                           crime.priority === 'Medium' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: crime.priority === 'Critical' ? '#E0384D' :
                                 crime.priority === 'High' ? '#F5A623' :
                                 crime.priority === 'Medium' ? '#3B82F6' : '#10B981'
                        }}>{crime.priority}</span>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#94a3b8' }}>{crime.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
