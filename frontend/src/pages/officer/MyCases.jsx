import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import CaseCard from '../../components/CaseCard';

const MyCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError('');
      // Query parameters: assignedOnly=true returns cases assigned to the logged-in officer
      const response = await axiosInstance.get('/crimes?assignedOnly=true');
      if (response.data && response.data.success) {
        setCases(response.data.crimes || []);
      }
    } catch (err) {
      console.error('Error fetching assigned cases:', err);
      setError('Failed to fetch assigned cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = cases.filter(c => {
    if (!statusFilter) return true;
    if (statusFilter === 'Pending') return c.isPending;
    if (statusFilter === 'Resolved') return !c.isPending;
    return c.status === statusFilter;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: '#f59e0b',
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
      
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
            My Assigned Cases
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Manage investigations and update case statuses.
          </p>
        </div>

        {/* Filter dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Filter Status:</label>
          <select
            className="form-control"
            style={{ width: '180px', padding: '8px 12px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Cases</option>
            <option value="Pending">Active (Pending Red Dot)</option>
            <option value="Resolved">Resolved (Solved/Closed)</option>
            <option value="Reported">Reported</option>
            <option value="Assigned">Assigned</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Evidence Collected">Evidence Collected</option>
            <option value="Solved">Solved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {/* Case Grid */}
      {filteredCases.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          {cases.length === 0 
            ? 'No cases currently assigned to you.' 
            : 'No cases match the selected status filter.'
          }
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredCases.map(crime => {
            const caseKey = crime._id || crime.id;
            return <CaseCard key={caseKey} crime={crime} role="officer" />;
          })}
        </div>
      )}

    </div>
  );
};

export default MyCases;
