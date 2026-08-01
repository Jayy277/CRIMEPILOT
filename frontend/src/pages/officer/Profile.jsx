import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { renderDepartmentBadge } from '../../api/departmentHelper';

const Profile = () => {
  const { user, setUser, details, setDetails } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Profile theme options based on role
  const getRoleTheme = () => {
    if (!user) return { color: '#3B82F6', text: 'Officer', banner: 'Officer Profile Workspace' };
    if (user.role === 'admin') return { color: '#E0384D', text: 'Root System Admin', banner: 'Admin Settings Workspace' };
    if (user.role === 'analyst') return { color: '#F5A623', text: 'Crime Trends Analyst', banner: 'Analyst Profile Workspace' };
    return { color: '#3B82F6', text: 'Field Squad Officer', banner: 'Officer Profile Workspace' };
  };

  const theme = getRoleTheme();
  const profilePicPath = user?.profilePicture || details?.profilePicture;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Space Grotesk, sans-serif', color: '#fff' }}>
          {theme.banner}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Your verified credentials, profile badge, and jurisdictional mapping.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-card" style={{ padding: '32px', borderTop: `4px solid ${theme.color}` }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          
          {/* Avatar Picture or Initials */}
          {profilePicPath ? (
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profilePicPath}`}
              alt="Profile"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${theme.color}`,
                boxShadow: `0 0 16px ${theme.color}44`
              }}
            />
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: theme.color,
              color: '#fff',
              fontSize: '28px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 16px ${theme.color}44`
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '22px', color: '#fff', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
              {user?.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: theme.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {theme.text}
              </span>
              {user && renderDepartmentBadge(user.email)}
            </div>


            {/* Profile Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
              {profilePicPath && (
                <button
                  type="button"
                  onClick={handleDeletePicture}
                  disabled={deleting}
                  className="btn btn-crimson"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px' }}>
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Email Address:</span>
            <span style={{ color: '#f8fafc', fontSize: '14px' }}>{user?.email}</span>
          </div>

          {/* Conditional rendering based on role */}
          {user?.role === 'officer' && (
            <>
              {/* Badge Number */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Badge Number:</span>
                <span style={{ color: 'var(--theme-accent, #3B82F6)', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: '700' }}>
                  {details?.badgeNo || 'N/A'}
                </span>
              </div>

              {/* Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Contact Phone:</span>
                <span style={{ color: '#f8fafc', fontSize: '14px' }}>{details?.contact || 'N/A'}</span>
              </div>

              {/* Police Station / Jurisdiction */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Assigned Station:</span>
                <div>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>
                    {details?.station?.policeStation || 'N/A'}
                  </div>
                  {details?.station && (
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
                      {details.station.city}, {details.station.district}, {details.station.state}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {user?.role === 'analyst' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Department:</span>
              <span style={{ color: '#f8fafc', fontSize: '14px' }}>{details?.department || 'Cyber Intelligence Unit'}</span>
            </div>
          )}

          {user?.role === 'admin' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Root ID:</span>
              <span style={{ color: '#f8fafc', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', fontWeight: '700' }}>GLOBAL_ADMIN_ROOT_UID</span>
            </div>
          )}

          {/* System Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '12px' }}>
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>System Access Status:</span>
            <span style={{ color: '#22C55E', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>
              ✓ ACTIVE SECURE ROOT
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;
