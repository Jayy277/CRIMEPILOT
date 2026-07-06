import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import AnimatedCounter from '../../components/AnimatedCounter';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const AnalystProfile = () => {
  const { user, setUser, details, setDetails } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axiosInstance.post('/auth/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        if (res.data.details) {
          setDetails(res.data.details);
          localStorage.setItem('crimepilot_details', JSON.stringify(res.data.details));
        }
        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('crimepilot_user', JSON.stringify(res.data.user));
        }
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      alert(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await axiosInstance.delete('/auth/profile-picture');
      if (res.data && res.data.success) {
        if (res.data.details) {
          setDetails(res.data.details);
          localStorage.setItem('crimepilot_details', JSON.stringify(res.data.details));
        }
        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('crimepilot_user', JSON.stringify(res.data.user));
        }
      }
    } catch (err) {
      console.error('Error deleting profile picture:', err);
      alert(err.response?.data?.message || 'Failed to delete profile picture.');
    } finally {
      setDeleting(false);
    }
  };

  const profilePicPath = user?.profilePicture || details?.profilePicture;

  // Recharts Chart Data
  const weeklyData = [
    { name: 'Mon', Solved: 4, Pending: 2, Accuracy: 91 },
    { name: 'Tue', Solved: 6, Pending: 1, Accuracy: 94 },
    { name: 'Wed', Solved: 5, Pending: 3, Accuracy: 89 },
    { name: 'Thu', Solved: 8, Pending: 1, Accuracy: 96 },
    { name: 'Fri', Solved: 7, Pending: 2, Accuracy: 92 },
    { name: 'Sat', Solved: 9, Pending: 0, Accuracy: 97 },
    { name: 'Sun', Solved: 4, Pending: 1, Accuracy: 90 }
  ];

  // Hotspots for Ahmedabad small map
  const mockMapHotspots = [
    { id: 1, name: 'Satellite', type: 'Vehicle Theft', cases: 14, risk: 82, l: '20%', t: '40%' },
    { id: 2, name: 'Navrangpura', type: 'Cyber Fraud', cases: 19, risk: 89, l: '60%', t: '25%' },
    { id: 3, name: 'Vastrapur', type: 'Theft', cases: 8, risk: 61, l: '40%', t: '70%' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: '#f8fafc' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff', fontWeight: '800' }}>
          Analyst Dossier & Intelligence Workspace
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
          Verified security credentials, active clearance ranks, and diagnostic metrics.
        </p>
      </div>

      {/* Main Grid: Left Dossier Card & Right Security Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        
        {/* Profile Dossier Card */}
        <div className="cyber-container" style={{ border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 229, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {profilePicPath ? (
              <img
                src={`http://localhost:5000${profilePicPath}`}
                alt="Profile"
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #00E5FF',
                  boxShadow: '0 0 12px rgba(0, 229, 255, 0.3)'
                }}
              />
            ) : (
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                backgroundColor: '#00E5FF',
                color: '#0B1120',
                fontSize: '26px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(0, 229, 255, 0.3)'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h2 style={{ fontSize: '20px', color: '#fff', fontWeight: '800' }}>{user?.name}</h2>
              <span style={{ fontSize: '11px', color: '#00E5FF', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>
                Senior Crime Analyst
              </span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <label className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
                  {uploading ? 'Uploading...' : 'Upload Badge'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>
                {profilePicPath && (
                  <button type="button" onClick={handleDeletePicture} disabled={deleting} className="btn btn-crimson" style={{ padding: '4px 10px', fontSize: '11px' }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Operator Mail:</span>
              <span style={{ color: '#fff' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Access Role:</span>
              <span style={{ color: '#00E5FF', fontWeight: '700' }}>CYBER INTEL UNIT</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Database Rank:</span>
              <span style={{ color: '#fff' }}>Dossier Analyst L5</span>
            </div>
          </div>
        </div>

        {/* Section 3: Security Clearance Card */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 229, 255, 0.05)' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>
            🛡️ Security Clearance Node
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '11px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#64748b', display: 'block' }}>SECURITY LEVEL</span>
              <span style={{ color: '#00E5FF', fontWeight: '800' }}>CLASS 5 // TOP SECRET</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#64748b', display: 'block' }}>ACCESS RANK</span>
              <span style={{ color: '#00E5FF', fontWeight: '800' }}>SENIOR CONTROLLER</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#64748b', display: 'block' }}>BIOMETRIC SCAN</span>
              <span style={{ color: '#00E5FF', fontWeight: '800' }}>● VERIFIED SECURE</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#64748b', display: 'block' }}>ENCRYPTION ALGO</span>
              <span style={{ color: '#00E5FF', fontWeight: '800' }}>AES-256 GCM SHIELD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Analyst Performance Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Cases Investigated Today', value: 8, color: '#00E5FF', unit: '' },
          { label: 'AI Reports Generated', value: 24, color: '#00E5FF', unit: '' },
          { label: 'Evidence Reviewed', value: 12, color: '#00E5FF', unit: '' },
          { label: 'Case Accuracy Rating', value: 96, color: '#00E5FF', unit: '%' },
          { label: 'Avg Investigation Time', value: 18, color: '#00E5FF', unit: 'm' },
          { label: 'Active Assignments', value: 3, color: '#00E5FF', unit: '' }
        ].map((stat, idx) => (
          <div key={idx} className="cyber-dashboard-card">
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', display: 'block' }}>{stat.label}</span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: stat.color, marginTop: '6px' }}>
              <AnimatedCounter value={stat.value} />{stat.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Section 4 & 5: Weekly charts + AI Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Weekly Productivity Charts */}
        <div className="cyber-container" style={{ height: '340px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 229, 255, 0.05)' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>
            Weekly Resolution & AI Accuracy Trends
          </h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ left: -25, right: 0, top: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#121A2B', border: '1px solid rgba(0, 229, 255, 0.25)', color: '#fff' }} />
                <Area type="monotone" dataKey="Solved" stroke="#00E5FF" strokeWidth={2} fill="url(#resolvedGrad)" name="Cases Resolved" />
                <Area type="monotone" dataKey="Accuracy" stroke="#FFFFFF" strokeWidth={2} fill="none" name="AI Accuracy (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations panel */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 229, 255, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800' }}>AI Assistant Advice</h3>
            <span style={{ fontSize: '10px', color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.25)', padding: '2px 8px', borderRadius: '4px' }}>ACTIVE BRIEF</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(0, 229, 255, 0.03)', border: '1px solid rgba(0, 229, 255, 0.15)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#00E5FF', fontWeight: 'bold' }}>
                <span>CRIME ACTIVITY WARNING</span>
                <span>CONFIDENCE: 92%</span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.4' }}>
                Vehicle theft probabilities are increasing in **Satellite (Sector 14)** boundary. Recommended patrol dispatch window: **8 PM - 11 PM** using Unit Alpha-03.
              </p>
            </div>
            
            <div style={{ background: 'rgba(0, 229, 255, 0.03)', border: '1px solid rgba(0, 229, 255, 0.15)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#00E5FF', fontWeight: 'bold' }}>MODEL RECOMMENDED PROTOCOLS</div>
              <ul style={{ margin: '6px 0 0 0', paddingLeft: '14px', fontSize: '11px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Optimize CCTV camera logs in Vastrapur boundaries</li>
                <li>Conduct OSINT phishing registries sweeps</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6 & 7: Assigned Investigations & Skill Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Assigned Investigations Cards */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 229, 255, 0.05)' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800' }}>Active Investigation Dossiers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { id: 'CP-204', type: 'Vehicle Theft', priority: 'High', area: 'Satellite', date: '2026-07-06', status: 'In Progress', color: '#FF4D6D' },
              { id: 'CP-198', type: 'Cyber Fraud', priority: 'Medium', area: 'Navrangpura', date: '2026-07-04', status: 'Evidence Check', color: '#FFC107' },
              { id: 'CP-182', type: 'Theft Larceny', priority: 'Low', area: 'Vastrapur', date: '2026-06-25', status: 'Archived', color: '#00E5FF' }
            ].map(caseItem => (
              <div key={caseItem.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>CASE ID: {caseItem.id}</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>{caseItem.type}</div>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Sector: {caseItem.area}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: caseItem.color, border: `1px solid ${caseItem.color}33`, background: `${caseItem.color}11`, padding: '2px 6px', borderRadius: '4px' }}>
                    {caseItem.priority}
                  </span>
                  <span style={{ fontSize: '11px', color: '#00E5FF', fontWeight: 'bold' }}>{caseItem.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Matrix Progress Bars */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 229, 255, 0.05)' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800' }}>Skill Matrix Core Diagnostics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
            {[
              { name: 'Cyber Crime Investigation', score: 90, color: '#00E5FF' },
              { name: 'Digital Forensics Analysis', score: 85, color: '#5DEEFF' },
              { name: 'Financial Fraud Audits', score: 95, color: '#A8FAFF' },
              { name: 'OSINT Footprint Scanning', score: 80, color: '#C2F5FF' },
              { name: 'AI Forecast Modeling', score: 92, color: '#E5FAFF' }
            ].map((skill, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#94a3b8' }}>{skill.name}</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{skill.score}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${skill.score}%`, height: '100%', backgroundColor: skill.color, borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2 & 8: Recent Timeline & Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Timeline */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 229, 255, 0.05)' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800' }}>Operations Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid rgba(0, 229, 255, 0.15)', paddingLeft: '16px', marginLeft: '6px' }}>
            {[
              { time: '09:20', log: 'Authentication verified secure', color: '#00E5FF' },
              { time: '09:35', log: 'AI Crime Prediction model compiled', color: '#00E5FF' },
              { time: '10:05', log: 'CCTV video frames cataloged', color: '#FFFFFF' },
              { time: '10:22', log: 'Investigation Docket #CP-204 created', color: '#00E5FF' },
              { time: '10:40', log: 'Diagnostic forensic review completed', color: '#00E5FF' }
            ].map((t, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '-22px',
                  top: '4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: t.color
                }} />
                <span style={{ fontSize: '11px', color: t.color, fontFamily: 'monospace', fontWeight: 'bold' }}>{t.time}</span>
                <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '2px 0 0 0' }}>{t.log}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Live AI Alerts Ticker */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 229, 255, 0.05)' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800' }}>Real-Time AI Event Logs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Suspicious Operator Session Handshake', desc: 'Remote login query blocked on unauthorized node', status: 'CRITICAL', color: '#FF4D6D' },
              { title: 'Sector Risk Matrix Calculated', desc: 'Satellite boundary vulnerability index update', status: 'INFO', color: '#FFFFFF' },
              { title: 'Vehicle Theft Forecasting Surge', desc: 'Satellite probability increased to 72%', status: 'WARNING', color: '#FFC107' }
            ].map((alert, idx) => (
              <div key={idx} style={{ padding: '10px 14px', borderRadius: '6px', background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${alert.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' }}>
                  <span style={{ color: '#fff' }}>{alert.title}</span>
                  <span style={{ color: alert.color }}>{alert.status}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>{alert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 9 & 10: Mini Heatmap & Mission Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Section 9: Mini Heatmap Grid */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 229, 255, 0.05)' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800' }}>Mini Geographic Grid</h3>
          
          <div style={{
            position: 'relative',
            height: '180px',
            backgroundColor: '#111827',
            borderRadius: '8px',
            border: '1px solid rgba(0, 229, 255, 0.15)',
            backgroundImage: 'radial-gradient(circle, rgba(0, 229, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            overflow: 'hidden'
          }}>
            {mockMapHotspots.map(spot => (
              <div
                key={spot.id}
                onMouseEnter={() => setHoveredHotspot(spot)}
                onMouseLeave={() => setHoveredHotspot(null)}
                style={{
                  position: 'absolute',
                  left: spot.l,
                  top: spot.t,
                  cursor: 'pointer',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#00E5FF',
                  boxShadow: '0 0 8px #00E5FF'
                }} />
              </div>
            ))}

            {/* Hover Tooltip Overlay */}
            {hoveredHotspot ? (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                background: '#111827',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'monospace',
                zIndex: 10
              }}>
                <span style={{ color: '#00E5FF', fontWeight: 'bold' }}>{hoveredHotspot.name} Area</span>
                <div>Type: {hoveredHotspot.type} | Risk: {hoveredHotspot.risk}%</div>
              </div>
            ) : (
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '9px', color: '#64748b' }}>
                Hover over target coordinates to audit
              </div>
            )}
          </div>
        </div>

        {/* Section 10: Today's Mission Summary */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 4px 20px rgba(0, 229, 255, 0.05)' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800' }}>Mission Summary Dashboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            {[
              { label: "Today's Assigned Cases", val: '3 Cases', color: '#00E5FF' },
              { label: 'Completed Actions', val: '2 Solved', color: '#FFFFFF' },
              { label: 'Active Pending Loads', val: '1 Pending', color: '#FFC107' },
              { label: 'AI Prediction Accuracy', val: '96.2%', color: '#00E5FF' },
              { label: 'Target Completion Rate', val: '88.4%', color: '#00E5FF' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ color: '#94a3b8' }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 'bold' }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .cyber-dashboard-card {
          background: #111827;
          border: 1px solid rgba(0, 229, 255, 0.25);
          border-radius: 16px;
          padding: 16px;
          transition: all 0.2s ease;
        }
        .cyber-dashboard-card:hover {
          transform: translateY(-1px);
          border-color: rgba(0, 229, 255, 0.25);
        }
        .cyber-container {
          background: #111827;
          border: 1px solid rgba(0, 229, 255, 0.25);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s ease;
        }
        .cyber-container:hover {
          border-color: rgba(0, 229, 255, 0.25);
        }
      `}</style>

    </div>
  );
};

export default AnalystProfile;
