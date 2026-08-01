import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import SimilarCaseList from '../../components/SimilarCaseList';
import StatusTimeline from '../../components/StatusTimeline';
import PulsingDot from '../../components/PulsingDot';

const CrimeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, details } = useContext(AuthContext);

  const [crime, setCrime] = useState(null);
  const [suspects, setSuspects] = useState([]);
  const [victims, setVictims] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Form states for adding items
  const [suspectForm, setSuspectForm] = useState({ name: '', age: '', gender: 'Male', address: '', status: 'Suspect' });
  const [victimForm, setVictimForm] = useState({ name: '', contact: '', statement: '', evidenceReference: '' });
  const [evidenceForm, setEvidenceForm] = useState({ type: '', description: '', collectionDate: new Date().toISOString().substring(0, 10), file: null });
  const [noteText, setNoteText] = useState('');

  // Status Progression flow order
  const STATUS_ORDER = ['Reported', 'Assigned', 'Under Investigation', 'Evidence Collected', 'Solved', 'Closed'];

  // Toggle Forms visibility
  const [showSuspectForm, setShowSuspectForm] = useState(false);
  const [showVictimForm, setShowVictimForm] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  // Submitting loaders
  const [submittingNote, setSubmittingNote] = useState(false);
  const [submittingSuspect, setSubmittingSuspect] = useState(false);
  const [submittingVictim, setSubmittingVictim] = useState(false);
  const [submittingEvidence, setSubmittingEvidence] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchAllDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const [crimeRes, suspectRes, victimRes, evidenceRes] = await Promise.all([
        axiosInstance.get(`/crimes/${id}`),
        axiosInstance.get(`/suspects?linkedCrime=${id}`),
        axiosInstance.get(`/victims?linkedCrime=${id}`),
        axiosInstance.get(`/evidence?linkedCrime=${id}`)
      ]);

      if (crimeRes.data && crimeRes.data.success) {
        setCrime(crimeRes.data.crime);
      }
      if (suspectRes.data && suspectRes.data.success) {
        setSuspects(suspectRes.data.suspects || []);
      }
      if (victimRes.data && victimRes.data.success) {
        setVictims(victimRes.data.victims || []);
      }
      if (evidenceRes.data && evidenceRes.data.success) {
        setEvidence(evidenceRes.data.evidence || []);
      }

    } catch (err) {
      console.error('Error fetching crime details:', err);
      setError('Failed to load crime case profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDetails();
  }, [id]);

  // Handle Note submit
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await axiosInstance.post(`/crimes/${id}/notes`, { note: noteText });
      if (res.data && res.data.success) {
        setCrime(prev => ({ ...prev, notes: res.data.notes }));
        setNoteText('');
        // Refresh details because notes population fetches details of the note creator
        const refreshedCrime = await axiosInstance.get(`/crimes/${id}`);
        setCrime(refreshedCrime.data.crime);
      }
    } catch (err) {
      console.error('Error adding case note:', err);
      alert(err.response?.data?.message || 'Failed to add investigation note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  // Handle Status Progression
  const handleProgressStatus = async (targetStatus) => {
    setSubmittingStatus(true);
    try {
      const res = await axiosInstance.patch(`/crimes/${id}/status`, { status: targetStatus });
      if (res.data && res.data.success) {
        setCrime(prev => ({ ...prev, status: res.data.crime.status }));
      }
    } catch (err) {
      console.error('Error changing case status:', err);
      alert(err.response?.data?.message || 'Failed to update case status progression.');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Handle Direct Solved/Closed marking
  const handleDirectCloseOrSolve = async (targetStatus) => {
    if (!window.confirm(`Are you sure you want to mark this case as ${targetStatus}?`)) return;
    setSubmittingStatus(true);
    try {
      const res = await axiosInstance.patch(`/crimes/${id}/close-solved`, { status: targetStatus });
      if (res.data && res.data.success) {
        setCrime(prev => ({ ...prev, status: res.data.crime.status }));
      }
    } catch (err) {
      console.error('Error closing/solving case:', err);
      alert(err.response?.data?.message || 'Failed to resolve case.');
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Handle Add Suspect
  const handleAddSuspect = async (e) => {
    e.preventDefault();
    if (!suspectForm.name) return;

    setSubmittingSuspect(true);
    try {
      const payload = { ...suspectForm, linkedCrime: id };
      const res = await axiosInstance.post('/suspects', payload);
      if (res.data && res.data.success) {
        setSuspects(prev => [res.data.suspect, ...prev]);
        setSuspectForm({ name: '', age: '', gender: 'Male', address: '', status: 'Suspect' });
        setShowSuspectForm(false);
      }
    } catch (err) {
      console.error('Error adding suspect:', err);
      alert(err.response?.data?.message || 'Failed to add suspect.');
    } finally {
      setSubmittingSuspect(false);
    }
  };

  // Handle Add Victim
  const handleAddVictim = async (e) => {
    e.preventDefault();
    if (!victimForm.name) return;

    if (victimForm.contact) {
      const phoneRegex = /^[789]\d{9}$/;
      if (!phoneRegex.test(victimForm.contact)) {
        alert('Victim contact phone number must be 10 digits starting with 7, 8, or 9.');
        return;
      }
    }

    setSubmittingVictim(true);
    try {
      const payload = { ...victimForm, linkedCrime: id };
      const res = await axiosInstance.post('/victims', payload);
      if (res.data && res.data.success) {
        setVictims(prev => [res.data.victim, ...prev]);
        setVictimForm({ name: '', contact: '', statement: '', evidenceReference: '' });
        setShowVictimForm(false);
      }
    } catch (err) {
      console.error('Error adding victim:', err);
      alert(err.response?.data?.message || 'Failed to add victim.');
    } finally {
      setSubmittingVictim(false);
    }
  };

  // Handle Add Evidence
  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceForm.type) return;

    const officerId = details?._id || details?.id;
    if (!officerId) {
      alert('Officer profile details missing. Cannot log evidence.');
      return;
    }

    setSubmittingEvidence(true);
    try {
      const formData = new FormData();
      formData.append('type', evidenceForm.type);
      formData.append('description', evidenceForm.description);
      formData.append('collectionDate', evidenceForm.collectionDate);
      formData.append('assignedOfficer', officerId);
      formData.append('linkedCrime', id);
      if (evidenceForm.file) {
        formData.append('file', evidenceForm.file);
      }

      const res = await axiosInstance.post('/evidence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        // Fetch new evidence list because backend populates references
        const newEvRes = await axiosInstance.get(`/evidence?linkedCrime=${id}`);
        setEvidence(newEvRes.data.evidence || []);
        setEvidenceForm({ type: '', description: '', collectionDate: new Date().toISOString().substring(0, 10), file: null });
        setShowEvidenceForm(false);
      }
    } catch (err) {
      console.error('Error adding evidence:', err);
      alert(err.response?.data?.message || 'Failed to file evidence metadata.');
    } finally {
      setSubmittingEvidence(false);
    }
  };

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

  if (error || !crime) {
    return (
      <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '24px', color: '#fda4af', textAlign: 'center' }}>
        <h3>Error Accessing Case Data</h3>
        <p style={{ marginTop: '12px' }}>{error || 'The requested crime case does not exist.'}</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: '20px' }}>
          Back to list
        </button>
      </div>
    );
  }

  // Next status index in sequence
  const currentStatusIdx = STATUS_ORDER.indexOf(crime.status);
  const nextStatusInFlow = currentStatusIdx < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentStatusIdx + 1] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Back link & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: 0, marginBottom: '8px' }}>
            ← Back to case queue
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '32px', fontFamily: 'Space Grotesk, sans-serif', color: '#fff', margin: 0 }}>
              Case: {crime.crimeId}
            </h1>
            {crime.isPending && (
              <PulsingDot label="Active" />
            )}
          </div>
          <span style={{ color: 'var(--theme-accent, #06b6d4)', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {crime.category?.name || crime.crimeCategory?.name}
          </span>
        </div>

        {/* Action tags (status and priority) */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className={`status-tag status-${crime.status.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: '12px', padding: '6px 14px' }}>
            Status: {crime.status}
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '6px 14px',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            backgroundColor: crime.priority === 'Critical' ? 'rgba(224,56,77,0.15)' : 'rgba(245,166,35,0.15)',
            color: crime.priority === 'Critical' ? '#E0384D' : '#F5A623',
            border: `1px solid ${crime.priority === 'Critical' ? 'rgba(224,56,77,0.3)' : 'rgba(245,166,35,0.3)'}`
          }}>
            Priority: {crime.priority}
          </span>
        </div>
      </div>

      {/* Signature Element: glowing case-status timeline progress line */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <StatusTimeline currentStatus={crime.status} />
      </div>

      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        gap: '24px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {['overview', 'suspects', 'victims', 'evidence', 'investigation', 'similar'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 4px',
              fontSize: '14px',
              fontWeight: activeTab === tab ? '700' : '500',
              color: activeTab === tab ? '#06b6d4' : '#94a3b8',
              borderBottom: activeTab === tab ? '2px solid #06b6d4' : '2px solid transparent',
              textTransform: 'capitalize',
              fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab === 'similar' ? 'MO Similar Finder' : tab === 'overview' ? 'Case Overview' : tab === 'victims' ? 'Victims/Witnesses' : tab === 'evidence' ? 'Evidence Locker' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass-card" style={{ minHeight: '300px' }}>
        
        {/* ========================================================
            OVERVIEW TAB
            ======================================================== */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Incident Date/Time</span>
                <p style={{ color: '#fff', fontSize: '15px', marginTop: '4px' }}>
                  {new Date(crime.date).toLocaleDateString()} @ {crime.time}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Police Station / Jurisdiction</span>
                <p style={{ color: '#fff', fontSize: '15px', marginTop: '4px' }}>
                  {crime.location?.policeStation} ({crime.location?.city}, {crime.location?.state})
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Filing Officer</span>
                <p style={{ color: '#fff', fontSize: '15px', marginTop: '4px' }}>
                  {crime.officer?.user?.name} (Badge: {crime.officer?.badgeNo})
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Case Description / Modus Operandi</span>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', marginTop: '8px', whiteSpace: 'pre-line' }}>
                {crime.description}
              </p>
            </div>

            {crime.sections && crime.sections.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Applicable acts & legal sections (BNS/BNSS/BSA)</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {crime.sections.map((sec, idx) => (
                    <div key={idx} style={{ backgroundColor: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '8px', padding: '10px 14px' }}>
                      <span style={{ color: '#22d3ee', fontWeight: '700', fontSize: '13px' }}>{sec.act} Section {sec.section}</span>
                      <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>{sec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SUSPECTS TAB
            ======================================================== */}
        {activeTab === 'suspects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', color: '#fff' }}>Suspect Profiles Locker</h3>
              {user.role !== 'analyst' && (
                <button onClick={() => setShowSuspectForm(!showSuspectForm)} className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                  {showSuspectForm ? 'Hide Form' : '+ Add Suspect Profile'}
                </button>
              )}
            </div>

            {showSuspectForm && (
              <form onSubmit={handleAddSuspect} className="glass-card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Full Suspect Name *</label>
                    <input type="text" required className="form-control" placeholder="Name" value={suspectForm.name} onChange={e => setSuspectForm({ ...suspectForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input type="number" className="form-control" placeholder="Age" value={suspectForm.age} onChange={e => setSuspectForm({ ...suspectForm, age: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Gender</label>
                    <select className="form-control" value={suspectForm.gender} onChange={e => setSuspectForm({ ...suspectForm, gender: e.target.value })}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Suspect Status</label>
                    <select className="form-control" value={suspectForm.status} onChange={e => setSuspectForm({ ...suspectForm, status: e.target.value })}>
                      <option value="Suspect">Suspect</option>
                      <option value="Detained">Detained</option>
                      <option value="Arrested">Arrested</option>
                      <option value="Absconding">Absconding</option>
                      <option value="Cleared">Cleared</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Residential Address / Last Known Location</label>
                  <textarea className="form-control" rows="2" placeholder="Address info" value={suspectForm.address} onChange={e => setSuspectForm({ ...suspectForm, address: e.target.value })} />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowSuspectForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-gold" disabled={submittingSuspect}>{submittingSuspect ? 'Logging...' : 'File Profile'}</button>
                </div>
              </form>
            )}

            {suspects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontStyle: 'italic' }}>
                No suspects logged under this case record.
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Demographics</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Prior Cases Linked</th>
                    </tr>
                  </thead>
                  <tbody>
                      {suspects.map(sus => (
                        <tr key={sus.id || sus._id}>
                        <td style={{ fontWeight: '700', color: '#22d3ee' }}>{sus.name}</td>
                        <td>{sus.age ? `${sus.age} yrs` : 'N/A'} / {sus.gender}</td>
                        <td>{sus.address || 'N/A'}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                            backgroundColor: sus.status === 'Arrested' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: sus.status === 'Arrested' ? '#10b981' : '#f59e0b'
                          }}>{sus.status}</span>
                        </td>
                        <td>
                          {sus.previousCases && sus.previousCases.length > 0 ? (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {sus.previousCases.map((prevCase, pIdx) => (
                                <span key={pIdx} style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px' }}>
                                  {typeof prevCase === 'object' ? prevCase.crimeId : 'CR-LINKED'}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '12px' }}>First logged offense</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            VICTIMS/WITNESSES TAB
            ======================================================== */}
        {activeTab === 'victims' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', color: '#fff' }}>Victims & Witness Depositions</h3>
              {user.role !== 'analyst' && (
                <button onClick={() => setShowVictimForm(!showVictimForm)} className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                  {showVictimForm ? 'Hide Form' : '+ Record Deposition'}
                </button>
              )}
            </div>

            {showVictimForm && (
              <form onSubmit={handleAddVictim} className="glass-card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" required className="form-control" placeholder="Name" value={victimForm.name} onChange={e => setVictimForm({ ...victimForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone / Address</label>
                    <input type="text" className="form-control" placeholder="Contact Details" value={victimForm.contact} onChange={e => setVictimForm({ ...victimForm, contact: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Deposed Statement / Narrative *</label>
                  <textarea required className="form-control" rows="4" placeholder="Log physical statement details here..." value={victimForm.statement} onChange={e => setVictimForm({ ...victimForm, statement: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Linked Physical Evidence Reference (Optional)</label>
                  <input type="text" className="form-control" placeholder="e.g. Weapon Recovered / Witness Audio Log #3" value={victimForm.evidenceReference} onChange={e => setVictimForm({ ...victimForm, evidenceReference: e.target.value })} />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowVictimForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-gold" disabled={submittingVictim}>{submittingVictim ? 'Recording...' : 'File Statement'}</button>
                </div>
              </form>
            )}

            {victims.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontStyle: 'italic' }}>
                No victim or witness records attached.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {victims.map((vic) => (
                  <div key={vic.id || vic._id} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '16px', background: 'rgba(15,22,42,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>{vic.name} <span style={{ color: '#64748b', fontWeight: '500', fontSize: '12px' }}>({vic.contact || 'No contact logged'})</span></span>
                      {vic.evidenceReference && (
                        <span style={{ fontSize: '11px', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', backgroundColor: 'rgba(251,191,36,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          Ref: {vic.evidenceReference}
                        </span>
                      )}
                    </div>
                    <p style={{ marginTop: '8px', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', borderLeft: '3px solid #06b6d4', paddingLeft: '12px', lineHeight: '1.4' }}>
                      "{vic.statement}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            EVIDENCE TAB
            ======================================================== */}
        {activeTab === 'evidence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', color: '#fff' }}>Evidence Locker Registry</h3>
              {user.role !== 'analyst' && (
                <button onClick={() => setShowEvidenceForm(!showEvidenceForm)} className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                  {showEvidenceForm ? 'Hide Form' : '+ File Evidence Metadata'}
                </button>
              )}
            </div>

            {showEvidenceForm && (
              <form onSubmit={handleAddEvidence} className="glass-card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Evidence Type *</label>
                    <input type="text" required className="form-control" placeholder="e.g. Weapon, CCTV Footage, Cellphone" value={evidenceForm.type} onChange={e => setEvidenceForm({ ...evidenceForm, type: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Collection Date</label>
                    <input type="date" className="form-control" value={evidenceForm.collectionDate} onChange={e => setEvidenceForm({ ...evidenceForm, collectionDate: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Item Description / Chain of Custody Notes</label>
                  <textarea className="form-control" rows="2" placeholder="Description of item condition and storage location..." value={evidenceForm.description} onChange={e => setEvidenceForm({ ...evidenceForm, description: e.target.value })} />
                </div>

                {/* Optional File upload */}
                <div className="form-group">
                  <label>Upload File Attachment / Image (Optional)</label>
                  <input type="file" className="form-control" onChange={e => setEvidenceForm({ ...evidenceForm, file: e.target.files[0] })} />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowEvidenceForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-gold" disabled={submittingEvidence}>{submittingEvidence ? 'Uploading...' : 'File Item'}</button>
                </div>
              </form>
            )}

            {evidence.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontStyle: 'italic' }}>
                No evidence items securely cataloged for this case.
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Collection Date</th>
                      <th>Filing Officer</th>
                      <th>Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidence.map(ev => {
                      const colDate = ev.collectionDate ? new Date(ev.collectionDate).toLocaleDateString() : 'N/A';
                      const officerName = ev.assignedOfficer?.user?.name || 'Unknown Officer';

                      return (
                        <tr key={ev.id || ev._id}>
                          <td style={{ fontWeight: '700', color: '#fbbf24' }}>{ev.type}</td>
                          <td>{ev.description || 'N/A'}</td>
                          <td>{colDate}</td>
                          <td>{officerName}</td>
                          <td>
                            {ev.filePath ? (
                              <a href={`/api${ev.filePath}`} target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: '600' }}>
                                View File
                              </a>
                            ) : (
                              <span style={{ color: '#64748b', fontStyle: 'italic' }}>None</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            INVESTIGATION PROGRESS TIMELINE TAB
            ======================================================== */}
        {activeTab === 'investigation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Investigation Actions (For Officers & Admins) */}
            {user.role !== 'analyst' && (
              <div className="glass-card" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: '#fff', fontSize: '15px', marginBottom: '12px' }}>Progress Investigation Flow (Custom Feature B / status flow)</h4>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  
                  {/* Next Step Progression Button */}
                  {nextStatusInFlow ? (
                    <button
                      onClick={() => handleProgressStatus(nextStatusInFlow)}
                      disabled={submittingStatus}
                      className="btn btn-gold"
                      style={{ fontSize: '13px' }}
                    >
                      {submittingStatus ? 'Progressing...' : `Progress Case Status to: ${nextStatusInFlow}`}
                    </button>
                  ) : (
                    <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '700' }}>
                      ✓ Case status has reached closed loop progression.
                    </span>
                  )}

                  {/* Direct Resolved options */}
                  {crime.status !== 'Solved' && crime.status !== 'Closed' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleDirectCloseOrSolve('Solved')}
                        disabled={submittingStatus}
                        className="btn btn-secondary"
                        style={{ fontSize: '13px', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}
                      >
                        Mark Solved
                      </button>
                      <button
                        onClick={() => handleDirectCloseOrSolve('Closed')}
                        disabled={submittingStatus}
                        className="btn btn-secondary"
                        style={{ fontSize: '13px', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }}
                      >
                        Close Case
                      </button>
                    </div>
                  )}

                </div>
                <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
                  Status progression order: <span style={{ color: '#94a3b8' }}>{STATUS_ORDER.join(' → ')}</span>
                </div>
              </div>
            )}

            {/* Note addition */}
            <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Log a new timeline update or investigation note..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <button type="submit" disabled={submittingNote} className="btn btn-primary" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
                {submittingNote ? 'Adding...' : 'Add Note'}
              </button>
            </form>

            {/* Timeline display */}
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: '16px' }}>Investigation Logs Timeline</h4>
              
              {crime.notes.length === 0 ? (
                <div style={{ padding: '20px 0', color: '#64748b', fontStyle: 'italic', fontSize: '13px' }}>
                  No investigation notes recorded for this case.
                </div>
              ) : (
                <div style={{ position: 'relative', borderLeft: '2px solid rgba(255,255,255,0.08)', paddingLeft: '20px', marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {crime.notes.map((noteItem, nIdx) => {
                    const authorName = noteItem.addedBy?.name || 'Officer';
                    const authorRole = noteItem.addedBy?.role || 'Staff';
                    const noteDate = new Date(noteItem.createdAt).toLocaleString();

                    return (
                      <div key={noteItem.id || noteItem._id || nIdx} style={{ position: 'relative' }}>
                        {/* Timeline dot accent */}
                        <div style={{
                          position: 'absolute',
                          left: '-26px',
                          top: '6px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#06b6d4',
                          border: '2px solid #070a13',
                          boxShadow: '0 0 8px rgba(6,182,212,0.5)'
                        }} />

                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', fontSize: '13px', color: '#fff' }}>{authorName}</span>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: authorRole === 'admin' ? '#f43f5e' : '#f59e0b', backgroundColor: 'rgba(255,255,255,0.02)', padding: '1px 6px', borderRadius: '4px' }}>{authorRole}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>({noteDate})</span>
                          </div>
                          <p style={{ marginTop: '4px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.4' }}>
                            {noteItem.note}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================
            SIMILAR CASES FINDER TAB
            ======================================================== */}
        {activeTab === 'similar' && (
          <SimilarCaseList sourceCaseId={id} role={user.role} />
        )}

      </div>
    </div>
  );
};

export default CrimeDetails;
