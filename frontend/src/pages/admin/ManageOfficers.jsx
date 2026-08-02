import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { renderDepartmentBadge } from '../../api/departmentHelper';
import AdminDataTable from '../../components/AdminDataTable';

const ManageOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWorkloads = async () => {
    try {
      setLoading(true);
      setError('');
      const staffRes = await axiosInstance.get('/admin/staff-search?role=officer');

      if (staffRes.data && staffRes.data.success) {
        setOfficers(staffRes.data.officers || []);
      }
    } catch (err) {
      console.error('Error fetching officer directory workloads:', err);
      setError('Failed to compute officer workloads. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const getOfficerStats = (officer) => {
    if (!officer) return { total: 0, active: 0, resolved: 0 };
    const active = officer.active_cases ?? officer.activeCases ?? 0;
    const resolved = officer.resolved_cases ?? officer.resolvedCases ?? 0;
    const total = officer.total_cases ?? officer.totalCases ?? (active + resolved);
    return { total, active, resolved };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          Officers Directory & Workload Logs
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Audit officer workloads, badge schedules, and active investigations progress.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {/* Directory Table using AdminDataTable */}
      <AdminDataTable
        title="Caseload Auditing"
          columns={[
            {
              key: 'badgeNo',
              label: 'Badge No',
              sortable: true,
              render: (o) => (
                <span style={{ fontWeight: '700', color: '#fbbf24', fontFamily: 'monospace' }}>
                  {o.badgeNo}
                </span>
              )
            },
            {
              key: 'user.name',
              label: 'Officer Name',
              sortable: true,
              render: (o) => (
                <span style={{ fontWeight: '700', color: '#fff' }}>
                  {o.user?.name || 'Staff Officer'}
                  <div style={{ marginTop: '4px' }}>{o.user?.email && renderDepartmentBadge(o.user.email)}</div>
                </span>
              )
            },
            { key: 'contact', label: 'Contact', sortable: true, render: (o) => o.contact || 'N/A' },
            {
              key: 'station.policeStation',
              label: 'Jurisdiction Station',
              sortable: true,
              render: (o) => (
                <span>
                  {o.station?.policeStation || 'N/A'}
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                    {o.station?.city}
                  </span>
                </span>
              )
            },
            {
              key: 'active',
              label: 'Active Cases',
              sortable: true,
              sortValue: (o) => getOfficerStats(o).active,
              render: (o) => {
                const stats = getOfficerStats(o);
                return <span style={{ fontWeight: '700', color: '#e11d48' }}>{stats.active}</span>;
              }
            },
            {
              key: 'resolved',
              label: 'Solved Cases',
              sortable: true,
              sortValue: (o) => getOfficerStats(o).resolved,
              render: (o) => {
                const stats = getOfficerStats(o);
                return <span style={{ fontWeight: '700', color: '#10b981' }}>{stats.resolved}</span>;
              }
            },
            {
              key: 'total',
              label: 'Total Cases',
              sortable: true,
              sortValue: (o) => getOfficerStats(o).total,
              render: (o) => {
                const stats = getOfficerStats(o);
                return <span style={{ fontWeight: '700', color: '#fff' }}>{stats.total}</span>;
              }
            },
            {
              key: 'status',
              label: 'Caseload Status',
              sortable: false,
              render: (o) => {
                const stats = getOfficerStats(o);
                const isOverloaded = stats.active >= 5;
                return (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: isOverloaded ? '#e11d48' : '#10b981',
                    backgroundColor: isOverloaded ? 'rgba(225,29,72,0.1)' : 'rgba(16,185,129,0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${isOverloaded ? 'rgba(225,29,72,0.2)' : 'rgba(16,185,129,0.2)'}`
                  }}>
                    {isOverloaded ? 'Overloaded' : 'Optimal'}
                  </span>
                );
              }
            }
          ]}
          data={officers}
          loading={loading}
          emptyMessage="No officers registered in systems."
          searchPlaceholder="Search officers by name, badge, contact, or station..."
        />

    </div>
  );
};

export default ManageOfficers;
