import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import CaseTrackerModal, { getStageIndex, INVESTIGATION_STAGES } from '../../components/citizen/CaseTrackerModal';
import FIRDetailsModal from '../../components/citizen/FIRDetailsModal';
import { downloadPDFResponse } from '../../utils/downloadPDF';
import { getTodayDateString, validateDateRange } from '../../utils/dateValidation';

// Status color helper per prompt instructions
export const getStatusColor = (statusStr) => {
  if (!statusStr) return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: '#3B82F6' };
  const s = statusStr.trim().toLowerCase();

  if (s === 'reported' || s === 'submitted' || s === 'fir submitted') {
    return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: '#3B82F6' }; // Blue
  }
  if (s === 'verified' || s === 'fir verified') {
    return { bg: 'rgba(6, 182, 212, 0.15)', text: '#06B6D4', border: '#06B6D4' }; // Cyan
  }
  if (s.includes('investigation') || s === 'assigned' || s.includes('station assigned') || s.includes('officer assigned')) {
    return { bg: 'rgba(249, 115, 22, 0.15)', text: '#F97316', border: '#F97316' }; // Orange
  }
  if (s.includes('evidence')) {
    return { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', border: '#A855F7' }; // Purple
  }
  if (s.includes('charge') || s.includes('chargesheet')) {
    return { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366F1', border: '#6366F1' }; // Indigo
  }
  if (s.includes('court')) {
    return { bg: 'rgba(234, 179, 8, 0.15)', text: '#EAB308', border: '#EAB308' }; // Yellow
  }
  if (s.includes('closed') || s === 'solved') {
    return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: '#22C55E' }; // Green
  }

  return { bg: 'rgba(0, 217, 255, 0.15)', text: '#00D9FF', border: '#00D9FF' };
};

const MyFIRs = () => {
  const { user } = useContext(AuthContext);
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [trackingCrime, setTrackingCrime] = useState(null);
  const [detailCrime, setDetailCrime] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');

  const todayStr = getTodayDateString();

  // Validate dates
  useEffect(() => {
    const val = validateDateRange(startDate, endDate);
    if (!val.isValid) {
      setDateError(val.error);
    } else {
      setDateError('');
    }
  }, [startDate, endDate]);

  // Lists for dropdown options
  const [categories, setCategories] = useState([]);
  const [stations, setStations] = useState([]);

  const fetchMyFIRs = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await axiosInstance.get('/citizen/my-cases');
      } catch (e) {
        res = await axiosInstance.get('/api/citizen/my-cases');
      }
      if (res.data && res.data.success) {
        setCrimes(res.data.crimes);

        // Derive categories & stations for filters
        const cats = Array.from(new Set(res.data.crimes.map(c => c.crime_category?.name || c.crimeCategory?.name).filter(Boolean)));
        const stns = Array.from(new Set(res.data.crimes.map(c => c.location?.policeStation || c.location?.police_station).filter(Boolean)));
        setCategories(cats);
        setStations(stns);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load your submitted FIRs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFIRs();
  }, []);

  const handleDownloadPDF = async (crime) => {
    try {
      let response;
      try {
        response = await axiosInstance.get(`/citizen/cases/${crime.id}/download`, { responseType: 'blob' });
      } catch (e) {
        response = await axiosInstance.get(`/api/citizen/cases/${crime.id}/download`, { responseType: 'blob' });
      }
      downloadPDFResponse(response, `CrimePilot_FIR_${crime.crime_id || crime.crimeId || crime.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to download FIR PDF compilation file.');
    }
  };

  // Filtering Logic
  const filteredCrimes = crimes.filter(c => {
    // Search query matching FIR Number, Category, or Description
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = c.crime_id?.toLowerCase().includes(q);
      const matchCat = c.crime_category?.name?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      if (!matchId && !matchCat && !matchDesc) return false;
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      const sIdx = getStageIndex(c.status);
      if (statusFilter === 'Submitted' && sIdx !== 0) return false;
      if (statusFilter === 'Verified' && sIdx !== 1) return false;
      if (statusFilter === 'Investigation' && (sIdx < 2 || sIdx > 5)) return false;
      if (statusFilter === 'Evidence Review' && sIdx !== 6) return false;
      if (statusFilter === 'Charge Sheet' && sIdx !== 7) return false;
      if (statusFilter === 'Court' && sIdx !== 8) return false;
      if (statusFilter === 'Closed' && sIdx !== 9) return false;
    }

    // Category Filter
    if (categoryFilter !== 'ALL' && (c.crime_category?.name || c.crimeCategory?.name) !== categoryFilter) {
      return false;
    }

    // Station Filter
    const cStation = c.location?.policeStation || c.location?.police_station;
    if (stationFilter !== 'ALL' && cStation !== stationFilter) {
      return false;
    }

    // Date Range Filter
    if (startDate) {
      const cDate = new Date(c.date);
      const sDate = new Date(startDate);
      if (cDate < sDate) return false;
    }

    if (endDate) {
      const cDate = new Date(c.date);
      const eDate = new Date(endDate);
      if (cDate > eDate) return false;
    }

    return true;
  });

  if (trackingCrime) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <CaseTrackerModal
          crime={trackingCrime}
          onClose={() => setTrackingCrime(null)}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    );
  }

  if (detailCrime) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <FIRDetailsModal
          crime={detailCrime}
          user={user}
          onClose={() => setDetailCrime(null)}
          onRefresh={fetchMyFIRs}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: 'bold' }}>CITIZEN PORTAL</span>
            <span style={{ color: '#64748b', fontSize: '12px' }}>•</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Personal FIR Records</span>
          </div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff', fontWeight: '800', marginTop: '4px' }}>
            My FIRs & Case Tracking
          </h1>
        </div>

        <button
          onClick={fetchMyFIRs}
          style={{
            padding: '10px 18px',
            backgroundColor: '#111827',
            border: '1px solid #223248',
            color: '#00D9FF',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔄 Refresh Case Logs
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        background: '#111827',
        border: '1px solid #223248',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Top Search Input */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search by FIR Number (e.g. CR-2026-00001), Category, or Details..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0B1220',
                border: '1px solid #223248',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
          {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || stationFilter !== 'ALL' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
                setStationFilter('ALL');
                setStartDate('');
                setEndDate('');
              }}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          
          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
              Filter Status:
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0B1220',
                border: '1px solid #223248',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                fontSize: '12px'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted (Blue)</option>
              <option value="Verified">Verified (Cyan)</option>
              <option value="Investigation">Investigation (Orange)</option>
              <option value="Evidence Review">Evidence Review (Purple)</option>
              <option value="Charge Sheet">Charge Sheet (Indigo)</option>
              <option value="Court">Court (Yellow)</option>
              <option value="Closed">Closed (Green)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
              Crime Category:
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0B1220',
                border: '1px solid #223248',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                fontSize: '12px'
              }}
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Police Station Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
              Police Station:
            </label>
            <select
              value={stationFilter}
              onChange={e => setStationFilter(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0B1220',
                border: '1px solid #223248',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                fontSize: '12px'
              }}
            >
              <option value="ALL">All Police Stations</option>
              {stations.map((st, i) => (
                <option key={i} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
              Incident Date From:
            </label>
            <input
              type="date"
              max={todayStr}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0B1220',
                border: '1px solid #223248',
                borderRadius: '8px',
                padding: '9px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
          </div>

          {/* Date To */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
              Incident Date To:
            </label>
            <input
              type="date"
              max={todayStr}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0B1220',
                border: '1px solid #223248',
                borderRadius: '8px',
                padding: '9px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
          </div>

        </div>

        {dateError && (
          <div style={{
            marginTop: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid #ef4444',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            ⚠️ {dateError}
          </div>
        )}
      </div>

      {/* FIR Cards Grid */}
      {loading ? (
        <div style={{ padding: '40px', textTransform: 'uppercase', color: '#64748b', textAlign: 'center', fontSize: '13px', fontStyle: 'italic' }}>
          Loading your FIR records...
        </div>
      ) : filteredCrimes.length === 0 ? (
        <div style={{
          background: '#111827',
          border: '1px dashed #223248',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <span style={{ fontSize: '32px' }}>📂</span>
          <h3 style={{ fontSize: '16px', color: '#fff', marginTop: '12px', fontWeight: 'bold' }}>No FIR Records Found</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>No FIR complaints match your active filter parameters or search criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredCrimes.map((crime) => {
            const sIdx = getStageIndex(crime.status);
            const stageName = INVESTIGATION_STAGES[sIdx];
            const colorScheme = getStatusColor(stageName);

            const rawCid = crime.crime_id || crime.crimeId || crime.id || '';
            const cardFirNo = crime.firNumber || crime.fir_number || (rawCid.startsWith('FIR-') ? rawCid : `FIR-${rawCid}`);
            const cardStation = crime.location?.policeStation || crime.location?.police_station || 'Assigned Station';
            const cardOfficer = crime.officer?.user?.name || crime.officer?.name || 'Assigned Officer';
            const cardCat = crime.crime_category?.name || crime.crimeCategory?.name || 'FIR Complaint';

            return (
              <div
                key={crime.id}
                style={{
                  background: '#111827',
                  border: '1px solid #223248',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Card Top Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace', color: '#00D9FF' }}>
                        {cardFirNo}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: colorScheme.bg,
                        color: colorScheme.text,
                        border: `1px solid ${colorScheme.border}`
                      }}>
                        {stageName}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: crime.priority === 'Critical' || crime.priority === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: crime.priority === 'Critical' || crime.priority === 'High' ? '#ef4444' : '#eab308'
                      }}>
                        Priority: {crime.priority}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '18px', color: '#fff', fontWeight: '800', marginTop: '6px', fontFamily: 'Outfit, sans-serif' }}>
                      {cardCat}
                    </h3>
                  </div>

                  <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'right' }}>
                    <div>Registered: <strong>{crime.created_at ? String(crime.created_at).substring(0, 10) : crime.date}</strong></div>
                    <div>Incident Date: <strong>{crime.date}</strong></div>
                  </div>
                </div>

                {/* Info Pills Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  background: '#0B1220',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #223248',
                  fontSize: '12px',
                  color: '#cbd5e1'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>POLICE STATION</span>
                    <strong style={{ color: '#fff' }}>🏫 {cardStation}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>INVESTIGATING OFFICER</span>
                    <strong>👮 {cardOfficer}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>LAST UPDATED</span>
                    <strong>⏱️ {crime.updated_at ? crime.updated_at.substring(0, 10) : 'Just Now'}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>PROGRESS</span>
                    <strong style={{ color: '#00D9FF' }}>Stage {sIdx + 1} of 10 ({Math.round(((sIdx + 1) / 10) * 100)}%)</strong>
                  </div>
                </div>

                {/* Description snippet */}
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                  {crime.description.length > 200 ? `${crime.description.substring(0, 200)}...` : crime.description}
                </p>

                {/* Action Buttons Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    
                    {/* View Details Button */}
                    <button
                      onClick={() => setDetailCrime(crime)}
                      style={{
                        padding: '9px 16px',
                        backgroundColor: '#0B1220',
                        border: '1px solid #223248',
                        color: '#fff',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      👁️ View Details
                    </button>

                    {/* Track Case Button */}
                    <button
                      onClick={() => setTrackingCrime(crime)}
                      style={{
                        padding: '9px 16px',
                        backgroundColor: 'rgba(0, 217, 255, 0.12)',
                        border: '1px solid #00D9FF',
                        color: '#00D9FF',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 0 10px rgba(0, 217, 255, 0.2)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      📡 Track Case
                    </button>

                  </div>

                  {/* Download PDF Button */}
                  <button
                    onClick={() => handleDownloadPDF(crime)}
                    style={{
                      padding: '9px 16px',
                      backgroundColor: '#10B981',
                      border: 'none',
                      color: '#0B1220',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    📥 Download Signed PDF
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}





    </div>
  );
};

export default MyFIRs;
