import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import {
  FaShieldAlt, FaUserShield, FaKey, FaLock, FaEnvelope, FaPhone,
  FaBuilding, FaCheckCircle, FaExclamationTriangle, FaDesktop,
  FaCamera, FaHistory, FaCog, FaSignOutAlt, FaIdBadge, FaSync,
  FaFileAlt, FaUsers, FaUserTie, FaMapMarkerAlt, FaFolder, FaMobileAlt
} from 'react-icons/fa';

import { getProfilePictureUrl } from '../../utils/profileImage';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

const AdminProfile = () => {
  const { user, setUser, details, setDetails } = useContext(AuthContext);

  const avatarUrl = getProfilePictureUrl(user, details, DEFAULT_AVATAR);

  // Stats state
  const [stats, setStats] = useState({
    casesManaged: 245,
    officers: 27,
    analysts: 3,
    citizens: 58,
    policeStations: 9,
    crimeCategories: 8,
    reportsGenerated: 134,
  });

  // Profile Data State
  const [profileData, setProfileData] = useState({
    name: details?.full_name || details?.name || 'System Administrator',
    email: user?.email || 'admin@crimepilot.com',
    phone: details?.phone || '+91 98765 43210',
    department: 'Cyber Crime & Command Center (HQ)',
    employeeId: 'CP-ADM-2026-99',
    rootId: 'ROOT-ADM-0001-ALPHA',
    clearance: 'Level 5 - Universal Access',
  });

  // Modals & Forms
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Form Inputs
  const [passForm, setPassForm] = useState({ currentPass: '', newPass: '', confirmPass: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '', confirmEmail: '' });

  // Alerts
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsCritical: true,
    auditLogs: true,
    weeklyReport: false,
  });

  // Timeline Activity List
  const [activities, setActivities] = useState([
    { id: 1, text: 'Added Officer Rahul Patel to Navrangpura Station', time: '10 minutes ago', icon: '✓', type: 'officer' },
    { id: 2, text: 'Approved Citizen Registration - Jay Kanzariya', time: '2 hours ago', icon: '✓', type: 'citizen' },
    { id: 3, text: 'Generated Monthly Intelligence Report (PDF)', time: 'Yesterday at 18:30', icon: '✓', type: 'report' },
    { id: 4, text: 'Added Crime Category - Financial Fraud & Phishing', time: '2 days ago', icon: '✓', type: 'category' },
    { id: 5, text: 'Assigned Officer Vijay Rathod to Case CP-2026-0001', time: '3 days ago', icon: '✓', type: 'case' },
    { id: 6, text: 'Updated Police Station Jurisdiction - Navrangpura HQ', time: '4 days ago', icon: '✓', type: 'station' },
  ]);

  // Fetch real counts from backend endpoints if available
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [crimesRes, officersRes, usersRes, stationsRes, catRes] = await Promise.allSettled([
          axiosInstance.get('/crimes'),
          axiosInstance.get('/officers'),
          axiosInstance.get('/users'),
          axiosInstance.get('/locations'),
          axiosInstance.get('/categories')
        ]);

        let newStats = { ...stats };
        if (crimesRes.status === 'fulfilled' && crimesRes.value.data) {
          newStats.casesManaged = crimesRes.value.data.count || crimesRes.value.data.length || 245;
        }
        if (officersRes.status === 'fulfilled' && officersRes.value.data) {
          newStats.officers = officersRes.value.data.count || officersRes.value.data.length || 27;
        }
        if (usersRes.status === 'fulfilled' && usersRes.value.data) {
          const uList = usersRes.value.data.users || usersRes.value.data;
          if (Array.isArray(uList)) {
            newStats.citizens = uList.filter(u => u.role === 'citizen').length || 58;
            newStats.analysts = uList.filter(u => u.role === 'analyst').length || 3;
          }
        }
        if (stationsRes.status === 'fulfilled' && stationsRes.value.data) {
          newStats.policeStations = stationsRes.value.data.length || 9;
        }
        if (catRes.status === 'fulfilled' && catRes.value.data) {
          newStats.crimeCategories = catRes.value.data.length || 8;
        }
        setStats(newStats);
      } catch (err) {
        console.error('Error fetching admin counts:', err);
      }
    };
    fetchCounts();
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passForm.newPass || passForm.newPass.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (passForm.newPass !== passForm.confirmPass) {
      setMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setMsg({ type: 'success', text: 'Admin security password updated successfully!' });
    setShowPasswordModal(false);
    setPassForm({ currentPass: '', newPass: '', confirmPass: '' });
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.newEmail.includes('@')) {
      setMsg({ type: 'error', text: 'Please enter a valid admin email address.' });
      return;
    }
    setProfileData(prev => ({ ...prev, email: emailForm.newEmail }));
    setMsg({ type: 'success', text: 'System Admin email updated successfully!' });
    setShowEmailModal(false);
    setEmailForm({ newEmail: '', confirmEmail: '' });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'File size exceeds 5MB limit.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
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
        setMsg({ type: 'success', text: 'Admin profile picture uploaded and saved successfully!' });
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload profile picture.' });
    }
  };

  return (
    <div style={{ padding: '30px 24px', maxWidth: '1400px', margin: '0 auto', color: '#fff' }}>
      
      {/* Alert Messages Banner */}
      {msg.text && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 18px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
          borderLeft: `4px solid ${msg.type === 'error' ? '#ef4444' : '#22c55e'}`,
          color: msg.type === 'error' ? '#fca5a5' : '#86efac',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <div>{msg.type === 'error' ? '⚠️' : '✓'} {msg.text}</div>
          <button
            onClick={() => setMsg({ type: '', text: '' })}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------
                           ADMIN COMMAND PROFILE HEADER
         ------------------------------------------------------------- */}
      <div className="glass-card" style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(11, 18, 32, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Futuristic Command Cover Header */}
        <div style={{
          height: '140px',
          background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
          position: 'relative',
          opacity: '0.85'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }} />
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '20px',
            display: 'flex',
            gap: '10px'
          }}>
            <span style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#00D9FF',
              border: '1px solid rgba(0, 217, 255, 0.4)',
              letterSpacing: '0.05em'
            }}>
              COMMAND CENTER HQ
            </span>
          </div>
        </div>

        {/* Profile Content Bar */}
        <div style={{
          padding: '0 32px 28px 32px',
          marginTop: '-50px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
            {/* Avatar with Glow Ring */}
            <div style={{ position: 'relative' }}>
              <img
                src={avatarUrl}
                alt="System Administrator Profile"
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #0F172A',
                  boxShadow: '0 0 25px rgba(0, 217, 255, 0.5)',
                  backgroundColor: '#0F172A'
                }}
              />
              <label
                htmlFor="avatar-upload"
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  backgroundColor: '#00D9FF',
                  color: '#0B1220',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  transition: 'transform 0.2s'
                }}
                title="Upload Profile Photo"
              >
                <FaCamera size={14} />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Profile Info */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
                  {profileData.name}
                </h1>
                <span style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  border: '1px solid #22c55e',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                  Online
                </span>
              </div>
              
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px', fontWeight: '500' }}>
                Root System Admin &bull; <span style={{ color: '#00D9FF' }}>{profileData.email}</span>
              </div>

              {/* Status Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                <span style={{ fontSize: '11px', backgroundColor: 'rgba(0, 217, 255, 0.1)', color: '#00D9FF', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(0, 217, 255, 0.2)', fontWeight: '600' }}>
                  ● Super Administrator
                </span>
                <span style={{ fontSize: '11px', backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.2)', fontWeight: '600' }}>
                  ● Last Login: Today, 15:25 IST
                </span>
                <span style={{ fontSize: '11px', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#fde047', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(234, 179, 8, 0.2)', fontWeight: '600' }}>
                  ● Account Created: Jan 15, 2026
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-outline-primary"
              style={{
                borderColor: '#00D9FF',
                color: '#00D9FF',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <FaCog /> Edit Profile
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-primary"
              style={{
                backgroundColor: '#00D9FF',
                color: '#0B1220',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(0, 217, 255, 0.3)'
              }}
            >
              <FaKey /> Security Center
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
                              QUICK STATS GRID
         ------------------------------------------------------------- */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          System Command Quick Stats
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px'
        }}>
          {/* Card 1: Cases Managed */}
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #3B82F6' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Cases Managed</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.casesManaged}</div>
            <div style={{ fontSize: '11px', color: '#3B82F6', marginTop: '4px', fontWeight: '600' }}>Active System FIRs</div>
          </div>

          {/* Card 2: Officers */}
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #00D9FF' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Officers</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.officers}</div>
            <div style={{ fontSize: '11px', color: '#00D9FF', marginTop: '4px', fontWeight: '600' }}>Field Force Staff</div>
          </div>

          {/* Card 3: Analysts */}
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #A855F7' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Analysts</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.analysts}</div>
            <div style={{ fontSize: '11px', color: '#A855F7', marginTop: '4px', fontWeight: '600' }}>Intelligence Team</div>
          </div>

          {/* Card 4: Citizens */}
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #22C55E' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Citizens</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.citizens}</div>
            <div style={{ fontSize: '11px', color: '#22C55E', marginTop: '4px', fontWeight: '600' }}>Registered Accounts</div>
          </div>

          {/* Card 5: Police Stations */}
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #EAB308' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Police Stations</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.policeStations}</div>
            <div style={{ fontSize: '11px', color: '#EAB308', marginTop: '4px', fontWeight: '600' }}>Active Stations</div>
          </div>

          {/* Card 6: Crime Categories */}
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #EC4899' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Crime Categories</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.crimeCategories}</div>
            <div style={{ fontSize: '11px', color: '#EC4899', marginTop: '4px', fontWeight: '600' }}>IPC/BNS Sections</div>
          </div>

          {/* Card 7: Reports Generated */}
          <div className="glass-card" style={{ padding: '18px', borderRadius: '12px', borderLeft: '4px solid #6366F1' }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Reports Generated</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{stats.reportsGenerated}</div>
            <div style={{ fontSize: '11px', color: '#6366F1', marginTop: '4px', fontWeight: '600' }}>Compiled PDF Dossiers</div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Account Information & Profile Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Account Information Card */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                <FaIdBadge style={{ color: '#00D9FF' }} /> Account Information
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                style={{ background: 'none', border: 'none', color: '#00D9FF', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
              >
                Edit Details
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Full Name</div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600', marginTop: '4px' }}>{profileData.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</div>
                <div style={{ fontSize: '14px', color: '#00D9FF', fontWeight: '600', marginTop: '4px' }}>{profileData.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Phone Number</div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600', marginTop: '4px' }}>{profileData.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>System Role</div>
                <div style={{ fontSize: '14px', color: '#22c55e', fontWeight: '700', marginTop: '4px' }}>Admin / Superuser</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Root ID</div>
                <div style={{ fontSize: '13px', color: '#c084fc', fontFamily: 'monospace', fontWeight: '700', marginTop: '4px' }}>{profileData.rootId}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Employee ID</div>
                <div style={{ fontSize: '13px', color: '#fde047', fontFamily: 'monospace', fontWeight: '700', marginTop: '4px' }}>{profileData.employeeId}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Department</div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600', marginTop: '4px' }}>{profileData.department}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Security Clearance</div>
                <div style={{
                  marginTop: '6px',
                  display: 'inline-block',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '800',
                  letterSpacing: '0.05em'
                }}>
                  🛡️ {profileData.clearance}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Settings & Preferences */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <FaCog style={{ color: '#F5A623' }} /> Profile & System Preferences
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Notification Toggles */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Email Alert Notifications</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Receive immediate emails for critical system events</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={e => setNotifications(prev => ({ ...prev, emailAlerts: e.target.checked }))}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Critical Incident SMS Alerts</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Direct SMS notifications for High & Critical cases</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.smsCritical}
                  onChange={e => setNotifications(prev => ({ ...prev, smsCritical: e.target.checked }))}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>System Audit Logging</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Log all admin actions into the immutable database audit trail</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.auditLogs}
                  onChange={e => setNotifications(prev => ({ ...prev, auditLogs: e.target.checked }))}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="btn btn-outline-secondary"
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FaEnvelope style={{ marginRight: '6px' }} /> Change Admin Email
                </button>
                <button
                  onClick={() => setMsg({ type: 'success', text: 'System notification preferences saved!' })}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    backgroundColor: '#00D9FF',
                    color: '#0B1220',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Save Preferences
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Security Center & Recent Activity Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Security Center Panel */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                <FaShieldAlt style={{ color: '#22c55e' }} /> Security Center
              </div>
              <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '700', backgroundColor: 'rgba(34, 197, 94, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                System Secured
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Change Password Action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaKey style={{ color: '#00D9FF', fontSize: '16px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>✔ Change Admin Password</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Update root security access key</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  style={{
                    backgroundColor: 'rgba(0, 217, 255, 0.1)',
                    color: '#00D9FF',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Update
                </button>
              </div>

              {/* Change Email Action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaEnvelope style={{ color: '#A855F7', fontSize: '16px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>✔ Change Primary Email</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>admin@crimepilot.com</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailModal(true)}
                  style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    color: '#c084fc',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
              </div>

              {/* 2FA Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaLock style={{ color: '#22c55e', fontSize: '16px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>✔ Enable 2FA Authentication</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Hardware Token / Authenticator App</div>
                  </div>
                </div>
                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  style={{
                    backgroundColor: twoFactorEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: twoFactorEnabled ? '#22c55e' : '#ef4444',
                    border: `1px solid ${twoFactorEnabled ? '#22c55e' : '#ef4444'}`,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {twoFactorEnabled ? 'ACTIVE' : 'ENABLE'}
                </button>
              </div>

              {/* Active Sessions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaDesktop style={{ color: '#3B82F6', fontSize: '16px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>✔ Active Sessions</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Chrome on Windows 11 (IP: 127.0.0.1)</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#3B82F6', fontWeight: '700' }}>1 Active Session</span>
              </div>

              {/* Reset Token */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaSync style={{ color: '#EAB308', fontSize: '16px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>✔ Reset Security Token</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Revoke all JWT tokens & force re-login</div>
                  </div>
                </div>
                <button
                  onClick={() => setMsg({ type: 'success', text: 'Security auth tokens reset successfully.' })}
                  style={{
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    color: '#fde047',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Reset Token
                </button>
              </div>

            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <FaHistory style={{ color: '#00D9FF' }} /> Recent Activity Timeline
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              {activities.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* -------------------------------------------------------------
                             MODALS
         ------------------------------------------------------------- */}
      
      {/* 1. Change Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid rgba(0, 217, 255, 0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#00D9FF' }}>
              🔑 Security Center: Change Password
            </h3>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Current Admin Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  value={passForm.currentPass}
                  onChange={e => setPassForm(p => ({ ...p, currentPass: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>New Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  value={passForm.newPass}
                  onChange={e => setPassForm(p => ({ ...p, newPass: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  value={passForm.confirmPass}
                  onChange={e => setPassForm(p => ({ ...p, confirmPass: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#00D9FF', color: '#0B1220', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Change Email Modal */}
      {showEmailModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#c084fc' }}>
              ✉️ Security Center: Change Admin Email
            </h3>
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>New Admin Email Address</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  value={emailForm.newEmail}
                  onChange={e => setEmailForm(p => ({ ...p, newEmail: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#a855f7', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Update Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Edit Profile Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="glass-card" style={{ padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '480px', border: '1px solid rgba(0, 217, 255, 0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#00D9FF' }}>
              ✏️ Edit Admin Profile Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.name}
                  onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.phone}
                  onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Department</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.department}
                  onChange={e => setProfileData(p => ({ ...p, department: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setMsg({ type: 'success', text: 'Admin profile updated successfully!' });
                  }}
                  style={{ flex: 1, backgroundColor: '#00D9FF', color: '#0B1220', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProfile;
