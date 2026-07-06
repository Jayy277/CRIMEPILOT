import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

const CitizenProfile = () => {
  const { user, details } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axiosInstance.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      if (res.data && res.data.success) {
        setSuccess('Password updated successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update password. Check old password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', color: '#f8fafc' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff', fontWeight: '800' }}>
          Citizen Dossier & Profile
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Manage personal verification details, credentials, and account protection.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        
        {/* Personal Details */}
        <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
            Personal Identification
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Full Name:</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{user?.name}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Email:</span>
              <span style={{ color: '#fff' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Mobile:</span>
              <span style={{ color: '#fff' }}>{details?.mobile || 'N/A'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Date of Birth:</span>
              <span style={{ color: '#fff' }}>{details?.dob || 'N/A'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Gender:</span>
              <span style={{ color: '#fff' }}>{details?.gender || 'N/A'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Address:</span>
              <span style={{ color: '#fff', lineHeight: '1.4' }}>
                {details?.address}, {details?.city}, {details?.state} - {details?.pincode}
              </span>
            </div>
          </div>
        </div>

        {/* Account Security & Identity Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Identity Verification Badges */}
          <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800' }}>Identity Verification</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Doc Type:</span>
                <span style={{ color: '#fff' }}>{details?.identityType}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Doc Number:</span>
                <span style={{ color: '#fff', fontFamily: 'monospace' }}>{details?.identityNumber}</span>
              </div>
              
              {details?.identityDocument && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={`http://localhost:5000${details.identityDocument}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'rgba(77, 163, 255, 0.05)',
                      border: '1px solid #223248',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: '#4DA3FF',
                      fontSize: '12px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    📄 Audit Uploaded Proof
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Form */}
          <div className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800' }}>Account Security</h3>

            {error && <div style={{ color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '11px' }}>{error}</div>}
            {success && <div style={{ color: '#a7f3d0', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '6px', fontSize: '11px' }}>{success}</div>}

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                  style={{
                    backgroundColor: '#0B1220',
                    border: '1px solid #223248',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#64748b' }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  style={{
                    backgroundColor: '#0B1220',
                    border: '1px solid #223248',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    backgroundColor: '#0B1220',
                    border: '1px solid #223248',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  padding: '10px',
                  backgroundColor: '#4DA3FF',
                  color: '#0B1220',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginTop: '10px'
                }}
              >
                {loading ? 'Committing New Hash...' : 'Commit New Password'}
              </button>
            </form>
          </div>

        </div>

      </div>

      <style>{`
        .cyber-container {
          background: #111827;
          border: 1px solid #223248;
          border-radius: 16px;
          padding: 24px;
        }
      `}</style>
    </div>
  );
};

export default CitizenProfile;
