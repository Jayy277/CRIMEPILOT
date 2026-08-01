import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminDataTable from '../../components/AdminDataTable';
import { downloadPDFResponse } from '../../utils/downloadPDF';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Preview crimes state
  const [previewCrimes, setPreviewCrimes] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(true);

  // Fetch preview matching crimes
  const fetchPreviewCrimes = async () => {
    try {
      setPreviewLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (priority) params.append('priority', priority);
      if (status) params.append('status', status);

      const res = await axiosInstance.get(`/crimes?${params.toString()}`);
      if (res.data && res.data.success) {
        setPreviewCrimes(res.data.crimes || []);
      }
    } catch (err) {
      console.error('Error fetching report crimes preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviewCrimes();
  }, [startDate, endDate, priority, status]);

  // Handle Preset Ranges
  const handlePreset = (preset) => {
    const today = new Date();
    let start = new Date();

    if (preset === 'daily') {
      start.setHours(0, 0, 0, 0);
    } else if (preset === 'weekly') {
      start.setDate(today.getDate() - 7);
    } else if (preset === 'monthly') {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          Admin Case Compilation Reports
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Generate global-level PDF logs of crime case profiles and incident statistics.
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
      <div className="glass-card" style={{ padding: '28px', borderTop: '4px solid #e11d48' }}>
        <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
          Global Report Scope Parameters
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
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
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
            className="btn btn-crimson"
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '6px' }}
          >
            {loading ? 'Compiling PDF File...' : 'Compile Global PDF Report'}
          </button>

        </form>
      </div>

      {/* Matching Cases Preview Table using AdminDataTable */}
      <AdminDataTable
        title={`Matching Report Cases (${previewCrimes.length})`}
        columns={[
          {
            key: 'crimeId',
            label: 'Case ID',
            sortable: true,
            render: (c) => <span style={{ fontWeight: '700', color: '#00D9FF', fontFamily: 'monospace' }}>{c.crimeId || c.id}</span>
          },
          {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (c) => c.date ? new Date(c.date).toLocaleDateString() : 'N/A'
          },
          {
            key: 'crimeCategory.name',
            label: 'Category',
            sortable: true,
            render: (c) => c.crimeCategory?.name || c.category || 'Unassigned'
          },
          {
            key: 'location.policeStation',
            label: 'Police Station',
            sortable: true,
            render: (c) => (
              <span>
                {c.location?.policeStation || c.policeStation || 'N/A'}
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                  {c.location?.city || c.city}
                </span>
              </span>
            )
          },
          {
            key: 'priority',
            label: 'Priority',
            sortable: true,
            render: (c) => {
              const prio = c.priority || 'Medium';
              let color = '#f59e0b';
              if (prio === 'High') color = '#ef4444';
              if (prio === 'Critical') color = '#ec4899';
              if (prio === 'Low') color = '#10b981';
              return (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  color,
                  backgroundColor: `${color}15`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${color}30`
                }}>
                  {prio}
                </span>
              );
            }
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (c) => (
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                color: ['Solved', 'Closed'].includes(c.status) ? '#10b981' : '#06b6d4',
                backgroundColor: ['Solved', 'Closed'].includes(c.status) ? 'rgba(16,185,129,0.1)' : 'rgba(6,182,212,0.1)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: `1px solid ${['Solved', 'Closed'].includes(c.status) ? 'rgba(16,185,129,0.2)' : 'rgba(6,182,212,0.2)'}`
              }}>
                {c.status}
              </span>
            )
          }
        ]}
        data={previewCrimes}
        loading={previewLoading}
        emptyMessage="No crime cases matched the current scope criteria."
        searchPlaceholder="Search preview cases by ID, category, or station..."
      />

    </div>
  );
};

export default Reports;
