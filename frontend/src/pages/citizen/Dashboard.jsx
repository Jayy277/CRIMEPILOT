import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import AnimatedCounter from '../../components/AnimatedCounter';

const CitizenDashboard = () => {
  const { user, details } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status mapping
  const getStatus = () => {
    return details?.status || 'pending';
  };

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axiosInstance.get('/api/citizen/my-cases');
        if (res.data && res.data.success) {
          setCases(res.data.crimes);
        }
      } catch (err) {
        console.error('Error fetching citizen cases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const totalSubmitted = cases.length;
  const underInvestigation = cases.filter(c => ['Assigned', 'Under Investigation', 'Evidence Collected'].includes(c.status)).length;
  const closedCases = cases.filter(c => ['Solved', 'Closed'].includes(c.status)).length;
  const reportedPending = cases.filter(c => c.status === 'Reported').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: '#f8fafc' }}>
      
      {/* Header & Verification Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff', fontWeight: '800' }}>
            Welcome, {user?.name}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
            Citizen Reference Workspace & Digital FIR Center.
          </p>
        </div>

        {/* Verification Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          borderRadius: '12px',
          border: '1px solid #223248',
          background: '#111827',
        }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>CREDENTIAL STATUS:</span>
          {getStatus() === 'verified' ? (
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
              🛡️ VERIFIED CITIZEN
            </span>
          ) : getStatus() === 'rejected' ? (
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
              ❌ VERIFICATION REJECTED
            </span>
          ) : (
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
              ⏳ PENDING VERIFICATION
            </span>
          )}
        </div>
      </div>

      {getStatus() !== 'verified' && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.05)',
          borderLeft: '4px solid #f59e0b',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#cbd5e1',
          lineHeight: '1.5'
        }}>
          <strong>Note:</strong> Your profile is currently undergoing verification of uploaded identity proofs. You will receive access to file digital FIRs once an officer approves your request.
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div className="cyber-container" style={{ padding: '20px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Total FIR Submitted</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#4DA3FF', marginTop: '8px' }}>
            <AnimatedCounter value={totalSubmitted} />
          </div>
        </div>

        <div className="cyber-container" style={{ padding: '20px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Under Investigation</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#4DA3FF', marginTop: '8px' }}>
            <AnimatedCounter value={underInvestigation} />
          </div>
        </div>

        <div className="cyber-container" style={{ padding: '20px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Closed / Solved Cases</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#4DA3FF', marginTop: '8px' }}>
            <AnimatedCounter value={closedCases} />
          </div>
        </div>

        <div className="cyber-container" style={{ padding: '20px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Pending Assignment</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#4DA3FF', marginTop: '8px' }}>
            <AnimatedCounter value={reportedPending} />
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Updates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Quick Actions */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>
            Quick Operations
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            <Link to="/citizen/register-fir" style={{ textDecoration: 'none' }}>
              <div className="action-card" style={{ pointerEvents: getStatus() === 'verified' ? 'auto' : 'none', opacity: getStatus() === 'verified' ? 1 : 0.4 }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✍️</div>
                <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>Register New FIR</h4>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>File a digital complaint to local stations</p>
              </div>
            </Link>

            <Link to="/citizen/track-fir" style={{ textDecoration: 'none' }}>
              <div className="action-card">
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📡</div>
                <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>Track Case File</h4>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Monitor progression timeline in real-time</p>
              </div>
            </Link>

            <Link to="/citizen/my-cases" style={{ textDecoration: 'none' }}>
              <div className="action-card">
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📥</div>
                <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>My Submitted FIRs</h4>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Review active case logs and assignments</p>
              </div>
            </Link>

            <Link to="/citizen/profile" style={{ textDecoration: 'none' }}>
              <div className="action-card">
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
                <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>Update Profile</h4>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Manage security credentials and proofs</p>
              </div>
            </Link>

          </div>
        </div>

        {/* Recent Timeline Updates */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>
            Latest Activity Log
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid rgba(77, 163, 255, 0.15)', paddingLeft: '16px', marginLeft: '6px' }}>
            {cases.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>No registered complaints found.</div>
            ) : (
              cases.slice(0, 4).map((c, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '-22px',
                    top: '4px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#4DA3FF',
                  }} />
                  <span style={{ fontSize: '11px', color: '#4DA3FF', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {c.created_at ? c.created_at.substring(0, 10) : c.date}
                  </span>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '2px 0 0 0' }}>
                    FIR <strong>{c.crime_id}</strong> is marked as <strong>{c.status}</strong>.
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <style>{`
        .cyber-container {
          background: #111827;
          border: 1px solid #223248;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s ease;
        }
        .cyber-container:hover {
          border-color: rgba(77, 163, 255, 0.25);
        }
        .action-card {
          background: #0B1220;
          border: 1px solid #223248;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .action-card:hover {
          border-color: #4DA3FF;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default CitizenDashboard;
