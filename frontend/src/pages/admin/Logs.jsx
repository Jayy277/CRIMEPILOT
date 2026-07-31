import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminDataTable from '../../components/AdminDataTable';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.get('/admin/logs');
      if (res.data && res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to fetch system audit logs database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const userRole = log.user?.role || '';
    return !roleFilter || userRole === roleFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          System Audit & Security Logs
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          View read-only audit trails of login history, database updates, and supervisor operations.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {/* Audit Logs Table using AdminDataTable */}
      <div className="glass-card">
        <AdminDataTable
          title="System Audit Trail"
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '12px', color: '#94A3B8' }}>Role Filter:</label>
              <select
                className="form-control"
                style={{ width: '130px', padding: '6px 10px', fontSize: '12px' }}
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="officer">Officer</option>
                <option value="analyst">Analyst</option>
              </select>
            </div>
          }
          columns={[
            {
              key: 'timestamp',
              label: 'Timestamp',
              sortable: true,
              render: (log) => (
                <span style={{ color: '#cbd5e1', fontSize: '12px' }}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                </span>
              )
            },
            {
              key: 'user.name',
              label: 'Operator',
              sortable: true,
              render: (log) => (
                <span style={{ fontWeight: '700', color: '#fff' }}>
                  {log.user?.name || 'Anonymous Session'}
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                    {log.user?.email ? `(${log.user.email})` : ''}
                  </span>
                </span>
              )
            },
            {
              key: 'user.role',
              label: 'Role',
              sortable: true,
              render: (log) => (
                <span style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: log.user?.role === 'admin' ? '#f43f5e' : log.user?.role === 'analyst' ? '#06b6d4' : '#f59e0b'
                }}>
                  {log.user?.role || 'Guest'}
                </span>
              )
            },
            {
              key: 'action',
              label: 'Action Logged',
              sortable: true,
              render: (log) => (
                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#fbbf24' }}>
                  {log.action}
                </span>
              )
            },
            {
              key: 'details',
              label: 'Details / Payload',
              sortable: false,
              render: (log) => (
                <span style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'inline-block' }} title={log.details}>
                  {log.details || 'N/A'}
                </span>
              )
            },
            {
              key: 'ipAddress',
              label: 'IP Address',
              sortable: true,
              render: (log) => <span style={{ fontSize: '12px', color: '#64748b' }}>{log.ipAddress || '127.0.0.1'}</span>
            }
          ]}
          data={filteredLogs}
          loading={loading}
          emptyMessage="No audit logs found matching criteria."
          searchPlaceholder="Search audit logs by keyword, email, action, or IP..."
        />
      </div>

    </div>
  );
};

export default Logs;
