import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { downloadPDFResponse } from '../../utils/downloadPDF';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Preset Ranges
  const handlePreset = (preset) => {
    const today = new Date();
    let start = new Date();

    if (preset === 'daily') {
      // Today
      start.setHours(0, 0, 0, 0);
    } else if (preset === 'weekly') {
      // Last 7 days
      start.setDate(today.getDate() - 7);
    } else if (preset === 'monthly') {
      // Last 30 days
      start.setDate(today.getDate() - 30);
    }

    setStartDate(start.toISOString().substring(0, 10));
    setEndDate(today.toISOString().substring(0, 10));
  };

  const handleDownloadPDF = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const params = new URLSearchParams();
      params.append('fileFormat', 'pdf');
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (priority) params.append('priority', priority);
      if (status) params.append('status', status);

      const response = await axiosInstance.get(`/dashboard/report?${params.toString()}`, {
        responseType: 'blob'
      });

      const downloadedName = downloadPDFResponse(response, 'CrimePilot_Report');
      setSuccessMsg(`PDF Report compiled and saved as ${downloadedName}`);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      setError('Failed to generate compilation PDF. Check parameters and connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          Compile Crime Intelligence Reports
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Aggregate legal sections, MO descriptions, and priorities into signed PDF compilations.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div className="glass-card" style={{ borderLeft: '4px solid #10b981', padding: '16px', color: '#a7f3d0' }}>
          {successMsg}
        </div>
      )}

      {/* Compiler Panel */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
          Report Compilation Parameters
        </h3>

        {/* Date presets */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Quick Range Presets
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => handlePreset('daily')} className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '8px' }}>
              Daily Report (24h)
            </button>
            <button type="button" onClick={() => handlePreset('weekly')} className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '8px' }}>
              Weekly Report (7d)
            </button>
            <button type="button" onClick={() => handlePreset('monthly')} className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '8px' }}>
              Monthly Report (30d)
            </button>
          </div>
        </div>

        <form onSubmit={handleDownloadPDF} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Custom Date Picker Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Start Date Limit</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Date Limit</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Status */}
            <div className="form-group">
              <label>Case Status Filter</label>
              <select
                className="form-control"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="Assigned">Assigned</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Evidence Collected">Evidence Collected</option>
                <option value="Solved">Solved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label>Priority Filter</label>
              <select
                className="form-control"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '10px' }}
          >
            {loading ? 'Compiling PDF File...' : 'Generate & Download PDF Compilation'}
          </button>

        </form>
      </div>

    </div>
  );
};

export default Reports;
