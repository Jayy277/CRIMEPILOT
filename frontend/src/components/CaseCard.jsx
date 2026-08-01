import React from 'react';
import { Link } from 'react-router-dom';
import PulsingDot from './PulsingDot';
import StatusTimeline from './StatusTimeline';

const CaseCard = ({ crime, role }) => {
  const dateStr = crime.date ? new Date(crime.date).toLocaleDateString() : 'N/A';
  const categoryName = crime.category?.name || crime.crimeCategory?.name || 'Unassigned';
  const stationName = crime.location?.policeStation || 'N/A';
  const priority = crime.priority || 'Medium';
  const status = crime.status || 'Reported';
  const isPending = crime.isPending;

  // Role class mapper
  const getRoleClass = () => {
    if (role === 'admin') return 'theme-admin';
    if (role === 'analyst') return 'theme-analyst';
    return 'theme-officer';
  };

  const getPriorityStyle = (prio) => {
    if (prio === 'Critical') return { color: '#E0384D', border: '1px solid rgba(224,56,77,0.3)', background: 'rgba(224,56,77,0.08)' };
    if (prio === 'High') return { color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.08)' };
    if (prio === 'Medium') return { color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.08)' };
    return { color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.08)' };
  };

  const caseId = crime._id || crime.id;
  const detailsPath = `/${role}/cases/${caseId}`;

  return (
    <div className={`glass-card ${getRoleClass()}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Custom Feature B - Pulsing Dot Pending Indicator */}
      {isPending && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <PulsingDot label="Active" />
        </div>
      )}

      {/* Case Header */}
      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace' }}>{dateStr}</span>
        <h3 style={{ fontSize: '18px', margin: '4px 0', fontFamily: 'Space Grotesk, sans-serif', color: '#fff' }}>
          {crime.crimeId}
        </h3>
        <span style={{
          fontSize: '11px',
          fontWeight: '800',
          color: 'var(--theme-accent, #3B82F6)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
          {categoryName}
        </span>
      </div>

      {/* Case Description Snippet */}
      <p style={{
        fontSize: '13px',
        color: '#94a3b8',
        margin: '0 0 16px 0',
        lineHeight: '1.4',
        flexGrow: 1,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {crime.description}
      </p>

      {/* Signature Element: Mini Case Stepper Progress Line */}
      <div style={{ marginBottom: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
        <StatusTimeline currentStatus={status} mini={true} />
      </div>

      {/* Details Row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '16px'
      }}>
        {/* Jurisdiction */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', marginBottom: '4px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ fontSize: '12px', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {stationName}
          </span>
        </div>

        {/* Priority Badge */}
        <span style={{
          fontSize: '10px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          ...getPriorityStyle(priority)
        }}>
          {priority}
        </span>

        {/* Status Tag */}
        <span className={`status-tag status-${status.toLowerCase().replace(/ /g, '-')}`}>
          {status}
        </span>
      </div>

      {/* Details Button */}
      <Link to={detailsPath} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
        View Case Details
      </Link>
    </div>
  );
};

export default CaseCard;
