import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { getStageIndex, INVESTIGATION_STAGES } from './CaseTrackerModal';

const FIRDetailsModal = ({ crime, user, onClose, onRefresh, onDownloadPDF }) => {
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!crime) return null;

  const currentStageIdx = getStageIndex(crime.status);

  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceFile) {
      setError('Please choose a file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', evidenceFile);

    try {
      let res;
      try {
        res = await axiosInstance.post(`/citizen/cases/${crime.id}/evidence`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (err) {
        res = await axiosInstance.post(`/api/citizen/cases/${crime.id}/evidence`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data && res.data.success) {
        setSuccess('Additional evidence file submitted successfully!');
        setEvidenceFile(null);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Evidence upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0B1220',
        border: '1px solid #223248',
        boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f8fafc'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#111827'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: 'bold' }}>
              OFFICIAL COMPLAINT COMPILATION FILE
            </span>
            <h2 style={{ fontSize: '20px', color: '#fff', fontWeight: '800', marginTop: '2px' }}>
              FIR Details: {crime.crime_id}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => onDownloadPDF(crime)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#00D9FF',
                color: '#0B1220',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              📥 Download PDF
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Notifications */}
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '12px', color: '#fca5a5', borderRadius: '8px', fontSize: '12px' }}>{error}</div>}
          {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid #22c55e', padding: '12px', color: '#86efac', borderRadius: '8px', fontSize: '12px' }}>{success}</div>}

          {/* Grid of Key Info */}
          {(() => {
            const rawCid = crime.crime_id || crime.crimeId || crime.id || '';
            const firNo = crime.firNumber || crime.fir_number || (rawCid.startsWith('FIR-') ? rawCid : `FIR-${rawCid}`);
            const stationName = crime.location?.policeStation || crime.location?.police_station || 'Jurisdiction Police Station';
            const cityState = `${crime.location?.city || 'Gujarat'}, ${crime.location?.state || 'Gujarat'}`;
            const offName = crime.officer?.user?.name || crime.officer?.name || 'Assigned Station Officer';
            const offBadge = crime.officer?.badgeNo || crime.officer?.badge_no || 'BADGE-OFFICER';
            const catName = crime.crime_category?.name || crime.crimeCategory?.name || 'General Offence';

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                
                {/* Case Info */}
                <div style={{ background: '#111827', border: '1px solid #223248', padding: '20px', borderRadius: '14px' }}>
                  <h3 style={{ fontSize: '13px', color: '#00D9FF', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>
                    📁 Case Specifications
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                    <div><strong>FIR Number:</strong> <span style={{ fontFamily: 'monospace', color: '#00D9FF', fontWeight: 'bold' }}>{firNo}</span></div>
                    <div><strong>Category:</strong> {catName}</div>
                    <div><strong>Priority:</strong> {crime.priority}</div>
                    <div><strong>Current Stage:</strong> <span style={{ color: '#00D9FF', fontWeight: 'bold' }}>{INVESTIGATION_STAGES[currentStageIdx]}</span></div>
                    <div><strong>Registration Date:</strong> {crime.created_at ? String(crime.created_at).substring(0, 10) : crime.date}</div>
                  </div>
                </div>

                {/* Citizen Details */}
                <div style={{ background: '#111827', border: '1px solid #223248', padding: '20px', borderRadius: '14px' }}>
                  <h3 style={{ fontSize: '13px', color: '#00D9FF', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>
                    👤 Citizen Complainant
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                    <div><strong>Name:</strong> {user?.name || 'Citizen'}</div>
                    <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
                    <div><strong>Role:</strong> Registered Citizen</div>
                    <div><strong>Status:</strong> Verified Account</div>
                  </div>
                </div>

                {/* Station & Officer Details */}
                <div style={{ background: '#111827', border: '1px solid #223248', padding: '20px', borderRadius: '14px' }}>
                  <h3 style={{ fontSize: '13px', color: '#00D9FF', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>
                    🏫 Assigned Authority
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                    <div><strong>Police Station:</strong> <span style={{ color: '#fff', fontWeight: 'bold' }}>{stationName}</span></div>
                    <div><strong>District / City:</strong> {cityState}</div>
                    <div><strong>Assigned Officer:</strong> {offName}</div>
                    <div><strong>Officer Badge:</strong> <span style={{ fontFamily: 'monospace', color: '#00D9FF' }}>{offBadge}</span></div>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* Incident Details Description */}
          <div style={{ background: '#111827', border: '1px solid #223248', padding: '20px', borderRadius: '14px' }}>
            <h3 style={{ fontSize: '13px', color: '#00D9FF', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>
              📝 Incident Summary & Report Statement
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px', fontSize: '12px', color: '#94a3b8' }}>
              <div><strong>Incident Date:</strong> {crime.date}</div>
              <div><strong>Incident Time:</strong> {crime.time}</div>
            </div>
            <p style={{ fontSize: '13px', color: '#f8fafc', lineHeight: '1.6', whiteSpace: 'pre-line', background: '#0B1220', padding: '16px', borderRadius: '10px', border: '1px solid #223248' }}>
              {crime.description}
            </p>
          </div>

          {/* Upload & List Evidence */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Upload evidence */}
            <div style={{ background: '#111827', border: '1px solid #223248', padding: '20px', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '13px', color: '#00D9FF', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>
                📤 Submit Additional Evidence
              </h3>

              <form onSubmit={handleUploadEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="file"
                  onChange={e => setEvidenceFile(e.target.files[0])}
                  required
                  style={{
                    backgroundColor: '#0B1220',
                    border: '1px solid #223248',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    padding: '10px',
                    backgroundColor: '#00D9FF',
                    color: '#0B1220',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {uploading ? 'Uploading File...' : 'Upload Evidence File'}
                </button>
              </form>
            </div>

            {/* List Evidence */}
            <div style={{ background: '#111827', border: '1px solid #223248', padding: '20px', borderRadius: '14px' }}>
              <h3 style={{ fontSize: '13px', color: '#00D9FF', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>
                📎 Evidence Files Log ({crime.evidences?.length || 0})
              </h3>

              {crime.evidences && crime.evidences.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {crime.evidences.map((ev, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0B1220', border: '1px solid #223248', borderRadius: '8px', fontSize: '12px' }}>
                      <span>📄 {ev.type} ({ev.evidence_id || 'Doc'})</span>
                      <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${ev.file_path}`} target="_blank" rel="noreferrer" style={{ color: '#00D9FF', textDecoration: 'none', fontWeight: 'bold' }}>
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>No extra evidence files uploaded yet.</div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default FIRDetailsModal;
