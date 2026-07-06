import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const TrackFIR = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Status mapping timeline
  const STATUS_STEPS = [
    'Reported',
    'Assigned',
    'Under Investigation',
    'Evidence Collected',
    'Solved',
    'Closed'
  ];

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/citizen/my-cases');
      if (res.data && res.data.success) {
        setCases(res.data.crimes);
        if (res.data.crimes.length > 0) {
          setSelectedCase(res.data.crimes[0]);
          if (res.data.crimes[0].evidences) {
            setEvidenceList(res.data.crimes[0].evidences);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch submitted cases list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const selectCaseItem = (crime) => {
    setSelectedCase(crime);
    setError('');
    setSuccess('');
    if (crime.evidences) {
      setEvidenceList(crime.evidences);
    } else {
      setEvidenceList([]);
    }
  };

  const handleDownloadPDF = async (crime) => {
    try {
      const response = await axiosInstance.get(`/api/citizen/cases/${crime.id}/download`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `FIR-Report-${crime.crime_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to compile and download FIR PDF compilation file.');
    }
  };

  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceFile || !selectedCase) {
      setError('Please choose a file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', evidenceFile);

    try {
      const res = await axiosInstance.post(`/api/citizen/cases/${selectedCase.id}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setSuccess('Additional evidence submitted successfully!');
        setEvidenceFile(null);
        
        // Refresh details
        const updatedEvidences = [...evidenceList, res.data.evidence];
        setEvidenceList(updatedEvidences);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Evidence submission failed.');
    } finally {
      setUploading(false);
    }
  };

  // Get active step index
  const getActiveStepIndex = (statusStr) => {
    return STATUS_STEPS.indexOf(statusStr);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '28px', color: '#f8fafc', minHeight: '80vh' }}>
      
      {/* Left Column Case List */}
      <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>
          My Case Ledger
        </h3>

        {loading ? (
          <div style={{ color: '#64748b', fontStyle: 'italic' }}>Loading files...</div>
        ) : cases.length === 0 ? (
          <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>No active cases found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cases.map((c, idx) => (
              <div
                key={idx}
                onClick={() => selectCaseItem(c)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: selectedCase?.id === c.id ? 'rgba(77, 163, 255, 0.1)' : '#0B1220',
                  border: `1px solid ${selectedCase?.id === c.id ? '#4DA3FF' : '#223248'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{c.crime_id}</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>
                  {c.crime_category?.name || 'FIR Complaint'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px' }}>
                  <span style={{ color: '#94a3b8' }}>{c.date}</span>
                  <span style={{ color: '#4DA3FF', fontWeight: 'bold' }}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column Tracker Detail */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {selectedCase ? (
          <>
            {/* Header info */}
            <div className="cyber-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>CASE FILES INTEL</span>
                <h2 style={{ fontSize: '20px', color: '#fff', fontWeight: '800' }}>
                  {selectedCase.crime_category?.name || 'General Complaint'} ({selectedCase.crime_id})
                </h2>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                  <span>🏫 Station: {selectedCase.location?.police_station}</span>
                  <span>👮 Assigned Officer: {selectedCase.officer?.user?.name || 'Pending Assignment'}</span>
                </div>
              </div>

              <button
                onClick={() => handleDownloadPDF(selectedCase)}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: '#4DA3FF', color: '#0B1220', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Download Signed PDF
              </button>
            </div>

            {/* Error/Success updates */}
            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '12px', color: '#fca5a5', borderRadius: '6px', fontSize: '12px' }}>{error}</div>}
            {success && <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: '12px', color: '#a7f3d0', borderRadius: '6px', fontSize: '12px' }}>{success}</div>}

            {/* Timeline Progress */}
            <div className="cyber-container">
              <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '700', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Investigation Timeline Progression
              </h3>

              {/* Steps Progress Visualizer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', paddingBottom: '20px' }}>
                
                {/* Background progress bar */}
                <div style={{
                  position: 'absolute',
                  top: '12px', left: '20px', right: '20px',
                  height: '4px',
                  backgroundColor: '#223248',
                  zIndex: 1
                }} />

                {/* Active progress bar */}
                <div style={{
                  position: 'absolute',
                  top: '12px', left: '20px',
                  width: `${(getActiveStepIndex(selectedCase.status) / (STATUS_STEPS.length - 1)) * 90}%`,
                  height: '4px',
                  backgroundColor: '#4DA3FF',
                  zIndex: 2,
                  transition: 'width 0.4s ease'
                }} />

                {/* Steps circles */}
                {STATUS_STEPS.map((step, idx) => {
                  const isActive = idx <= getActiveStepIndex(selectedCase.status);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '80px', textAlign: 'center' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#4DA3FF' : '#0B1220',
                        border: `2px solid ${isActive ? '#4DA3FF' : '#223248'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? '#0B1220' : '#64748b',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        boxShadow: isActive ? '0 0 10px rgba(77, 163, 255, 0.4)' : 'none'
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '10px', color: isActive ? '#fff' : '#64748b', marginTop: '10px', fontWeight: isActive ? 'bold' : 'normal' }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                <span>Last Updated: {selectedCase.updated_at ? selectedCase.updated_at.substring(0, 10) : 'Just Now'}</span>
                <span style={{ color: '#4DA3FF', fontWeight: 'bold' }}>Estimated Update: Within 48 Hours</span>
              </div>
            </div>

            {/* Case Details & Upload More Evidence */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              
              {/* Description */}
              <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '700', textTransform: 'uppercase' }}>Description & notes</h3>
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {selectedCase.description}
                </p>
              </div>

              {/* Upload evidence */}
              <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', color: '#fff', fontWeight: '700', textTransform: 'uppercase' }}>Upload more evidence</h3>
                
                <form onSubmit={handleUploadEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                      fontSize: '12px',
                      width: '100%'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn btn-primary"
                    style={{
                      padding: '10px',
                      backgroundColor: '#4DA3FF',
                      color: '#0B1220',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {uploading ? 'Uploading Evidence...' : 'Commit Evidence File'}
                  </button>
                </form>

                {/* List of uploaded files */}
                {evidenceList.length > 0 && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                      UPLOADED FILE LOGS:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {evidenceList.map((ev, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#0B1220', border: '1px solid #223248', borderRadius: '6px', fontSize: '11px' }}>
                          <span style={{ color: '#cbd5e1' }}>📄 {ev.type} - {ev.evidence_id || 'Uploaded Doc'}</span>
                          <a href={`http://localhost:5000${ev.file_path}`} target="_blank" rel="noreferrer" style={{ color: '#4DA3FF', textDecoration: 'none', fontWeight: 'bold' }}>
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          <div className="cyber-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontStyle: 'italic' }}>
            Awaiting case files selection... Select complaint ledger from list.
          </div>
        )}
      </div>

    </div>
  );
};

export default TrackFIR;
