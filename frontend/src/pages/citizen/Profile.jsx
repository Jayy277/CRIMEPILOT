import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { maskIdentityNumber } from '../../utils/maskUtils';
import { getProfilePictureUrl } from '../../utils/profileImage';
import { FiCamera, FiEye, FiEyeOff } from 'react-icons/fi';

const DEFAULT_CITIZEN_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';

const CitizenProfile = () => {
  const { user, setUser, details, setDetails } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const avatarUrl = getProfilePictureUrl(user, details, DEFAULT_CITIZEN_AVATAR);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.post('/auth/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('crimepilot_user', JSON.stringify(res.data.user));
        }
        if (res.data.details) {
          setDetails(res.data.details);
          localStorage.setItem('crimepilot_details', JSON.stringify(res.data.details));
        }
        setSuccess('Profile picture updated successfully!');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#f8fafc', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff', fontWeight: '800' }}>
            Citizen Dossier & Profile
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Manage personal verification details, credentials, and account protection.
          </p>
        </div>

        {/* Citizen Avatar Upload */}
        <div style={{ position: 'relative' }}>
          <img
            src={avatarUrl}
            alt={user?.name || 'Citizen'}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #4DA3FF',
              boxShadow: '0 0 15px rgba(77, 163, 255, 0.4)',
              backgroundColor: '#0F172A'
            }}
          />
          <label
            htmlFor="citizen-avatar-upload"
            style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              backgroundColor: '#4DA3FF',
              color: '#0B1220',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
            title="Upload Photo"
          >
            <FiCamera size={13} />
          </label>
          <input
            id="citizen-avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>
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
                <span style={{ color: '#fff', fontFamily: 'monospace' }}>{maskIdentityNumber(details?.identityType, details?.identityNumber)}</span>
              </div>
              
              {details?.identityDocument && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={details.identityDocument.startsWith('http') ? details.identityDocument : `${(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')}${details.identityDocument.startsWith('/') ? details.identityDocument : `/${details.identityDocument}`}`}
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
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                    style={{
                      backgroundColor: '#0B1220',
                      border: '1px solid #223248',
                      borderRadius: '8px',
                      padding: '8px 36px 8px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0'
                    }}
                    title={showOldPassword ? "Hide password" : "Show password"}
                  >
                    {showOldPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#64748b' }}>New Password</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{
                      backgroundColor: '#0B1220',
                      border: '1px solid #223248',
                      borderRadius: '8px',
                      padding: '8px 36px 8px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0'
                    }}
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#64748b' }}>Confirm New Password</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      backgroundColor: '#0B1220',
                      border: '1px solid #223248',
                      borderRadius: '8px',
                      padding: '8px 36px 8px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0'
                    }}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
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
