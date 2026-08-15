import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import CaseTrackerModal from '../../components/citizen/CaseTrackerModal';
import { downloadPDFResponse } from '../../utils/downloadPDF';

const TrackFIR = () => {
  const { user } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await axiosInstance.get('/citizen/my-cases');
      } catch (e) {
        res = await axiosInstance.get('/api/citizen/my-cases');
      }
      if (res.data && res.data.success && res.data.crimes?.length > 0) {
        setCases(res.data.crimes);
        setSelectedCase(res.data.crimes[0]);
      }
    } catch (err) {
      console.error('Error loading cases for live tracker:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleDownloadPDF = async (crime) => {
    const cId = crime.id || crime._id || crime.crime_id || crime.crimeId;
    try {
      let response;
      try {
        response = await axiosInstance.get(`/citizen/cases/${cId}/download`, { responseType: 'blob' });
      } catch (e) {
        response = await axiosInstance.get(`/api/citizen/cases/${cId}/download`, { responseType: 'blob' });
      }
      downloadPDFResponse(response, `CrimePilot_FIR_${crime.crime_id || crime.crimeId || cId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to download FIR PDF compilation file.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', color: '#64748b', textAlign: 'center', fontSize: '13px', fontStyle: 'italic' }}>
        Loading Live Case Tracker...
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', color: '#f8fafc' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: 'bold' }}>CITIZEN PORTAL</span>
          <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff', fontWeight: '800', marginTop: '4px' }}>
            Live Case Tracker
          </h1>
        </div>
        <div style={{ background: '#111827', border: '1px dashed #223248', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#64748b' }}>
          <span style={{ fontSize: '32px' }}>📡</span>
          <h3 style={{ fontSize: '16px', color: '#fff', marginTop: '12px', fontWeight: 'bold' }}>No Active FIR Cases to Track</h3>
          <p style={{ fontSize: '13px', marginTop: '4px', marginBottom: '16px' }}>You have not submitted any FIR complaints yet.</p>
          <Link to="/citizen/register-fir" style={{ padding: '10px 20px', backgroundColor: '#00D9FF', color: '#0B1220', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '13px', display: 'inline-block' }}>
            ✍️ File New FIR
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Case Selector Dropdown if user has multiple FIR cases */}
      {cases.length > 1 && (
        <div style={{ background: '#111827', border: '1px solid #223248', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>
            SELECT FIR CASE TO TRACK ({cases.length} Active Records):
          </span>
          <select
            value={selectedCase?.id || selectedCase?.crime_id}
            onChange={(e) => {
              const selected = cases.find(c => String(c.id) === e.target.value || String(c.crime_id) === e.target.value);
              if (selected) setSelectedCase(selected);
            }}
            style={{ backgroundColor: '#0B1220', border: '1px solid #00D9FF', color: '#fff', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          >
            {cases.map((c) => (
              <option key={c.id || c.crime_id} value={c.id || c.crime_id}>
                {c.crime_id || `FIR-${c.id}`} — {c.crime_category?.name || c.crimeCategory?.name || 'Case'} ({c.status})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Full-Width Live Case Tracker View */}
      {selectedCase && (
        <CaseTrackerModal
          crime={selectedCase}
          onClose={null}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
};

export default TrackFIR;
