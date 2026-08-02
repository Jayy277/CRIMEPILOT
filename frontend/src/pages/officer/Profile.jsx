import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import {
  FiShield, FiCpu, FiTrendingUp, FiFileText, FiMapPin, FiActivity,
  FiLock, FiUser, FiMail, FiPhone, FiCalendar, FiClock, FiSmartphone,
  FiGlobe, FiKey, FiEdit, FiBell, FiCheckCircle, FiChevronRight,
  FiZap, FiPieChart, FiBarChart2, FiSliders, FiDownload, FiCamera,
  FiAward, FiStar, FiEye, FiCheck, FiLogOut, FiNavigation
} from 'react-icons/fi';

import { getProfilePictureUrl } from '../../utils/profileImage';

const DEFAULT_OFFICER_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';

const OfficerProfile = () => {
  const { user, details, setUser, setDetails, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const avatarUrl = getProfilePictureUrl(user, details, DEFAULT_OFFICER_AVATAR);
  const [uploading, setUploading] = useState(false);

  // Modals & Messages
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Duty Status State
  const [dutyStatus, setDutyStatus] = useState('ON DUTY'); // ON DUTY, FIELD PATROL, OFF DUTY
  const [currentDuty, setCurrentDuty] = useState('Field Patrol'); // Field Patrol, Crime Branch, Cyber Cell, Traffic

  // Form Inputs
  const [profileForm, setProfileForm] = useState({
    name: details?.full_name || details?.name || 'Inspector Amit Patel',
    badgeNo: details?.badge_no || 'BADGE-AHM-1001',
    rank: 'Senior Police Inspector',
    officerId: 'OFF-2026-001',
    station: details?.station?.police_station || 'Ahmedabad City Police HQ',
    district: details?.station?.district || 'Ahmedabad',
    state: details?.station?.state || 'Gujarat',
    email: user?.email || 'amitpatel@crimepilot.com',
    phone: details?.contact || '+91 98250 10001',
    joiningDate: 'August 15, 2021',
  });

  const [passForm, setPassForm] = useState({ currentPass: '', newPass: '', confirmPass: '' });

  // Handle Avatar Change
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'File size exceeds 5MB limit.' });
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
        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('crimepilot_user', JSON.stringify(res.data.user));
        }
        if (res.data.details) {
          setDetails(res.data.details);
          localStorage.setItem('crimepilot_details', JSON.stringify(res.data.details));
        }
        setMsg({ type: 'success', text: 'Officer profile picture uploaded and saved successfully!' });
      }
    } catch (err) {
      console.error('Error saving profile photo:', err);
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload profile picture.' });
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passForm.newPass || passForm.newPass.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (passForm.newPass !== passForm.confirmPass) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setMsg({ type: 'success', text: 'Officer password updated successfully!' });
    setShowPasswordModal(false);
    setPassForm({ currentPass: '', newPass: '', confirmPass: '' });
  };

  // Assigned Cases Table Data
  const assignedCases = [
    { id: 'CP-2026-0001', category: 'Cyber Crime', priority: 'High', status: 'Under Investigation', date: '2026-07-30' },
    { id: 'CP-2026-0004', category: 'Chain Snatching', priority: 'High', status: 'Reported', date: '2026-07-28' },
    { id: 'CP-2026-0007', category: 'Public Assault', priority: 'Medium', status: 'Assigned', date: '2026-07-25' },
    { id: 'CP-2026-0012', category: 'House Burglary', priority: 'Critical', status: 'Under Investigation', date: '2026-07-15' },
  ];

  // Login History Data
  const loginHistory = [
    { date: '2026-08-02 15:10', device: 'Toughbook Win11', browser: 'Chrome 122.0', ip: '127.0.0.1', location: 'Ahmedabad HQ', status: 'SUCCESS' },
    { date: '2026-08-01 08:30', device: 'Officer Mobile App', browser: 'Android 14 App', ip: '192.168.1.10', location: 'Navrangpura Field', status: 'SUCCESS' },
    { date: '2026-07-31 18:45', device: 'Toughbook Win11', browser: 'Chrome 122.0', ip: '127.0.0.1', location: 'Ahmedabad HQ', status: 'SUCCESS' },
    { date: '2026-07-30 10:15', device: 'Officer Mobile App', browser: 'Android 14 App', ip: '192.168.1.10', location: 'Satellite Sector', status: 'SUCCESS' },
  ];

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'Critical': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '#ef4444' };
      case 'High': return { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: '#f97316' };
      case 'Medium': return { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', border: '#eab308' };
      default: return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: '#3b82f6' };
    }
  };

  return (
    <div style={{
      backgroundColor: '#0B1220',
      minHeight: '100vh',
      padding: '30px 24px',
      color: '#fff',
      fontFamily: 'Outfit, sans-serif'
    }}>

      {/* -------------------------------------------------------------
                              ALERT BANNER
         ------------------------------------------------------------- */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {msg.type === 'error' ? '⚠️' : '✓'} <span>{msg.text}</span>
          </div>
          <button
            onClick={() => setMsg({ type: '', text: '' })}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiShield style={{ color: '#3B82F6', fontSize: '26px' }} />
            <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
              Field Operations Command Center Profile
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 36px' }}>
            CrimePilot AI &bull; Officer Command Dossier & Operational Status
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setDutyStatus(dutyStatus === 'ON DUTY' ? 'OFF DUTY' : 'ON DUTY')}
            style={{
              backgroundColor: dutyStatus === 'ON DUTY' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: dutyStatus === 'ON DUTY' ? '#22c55e' : '#ef4444',
              border: `1px solid ${dutyStatus === 'ON DUTY' ? '#22c55e' : '#ef4444'}`,
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dutyStatus === 'ON DUTY' ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
            {dutyStatus} / {currentDuty.toUpperCase()}
          </button>
        </div>
      </div>

      {/* =============================================================
                                  ROW 1
         ============================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 300px',
        gap: '20px',
        marginBottom: '24px'
      }}>
        
        {/* ROW 1 - LEFT CARD: Officer Identity */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Avatar with Glowing Blue Ring */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <img
              src={avatarUrl}
              alt={profileForm.name}
              style={{
                width: '105px',
                height: '105px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #3B82F6',
                boxShadow: '0 0 22px rgba(59, 130, 246, 0.5)',
                backgroundColor: '#0F172A'
              }}
            />
            <label
              htmlFor="officer-avatar-upload"
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                backgroundColor: '#3B82F6',
                color: '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                transition: 'all 0.2s'
              }}
              title="Upload Photo"
            >
              <FiCamera size={14} />
            </label>
            <input
              id="officer-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Officer Name & Badge */}
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#fff' }}>
            {profileForm.name}
          </h2>
          <div style={{
            fontSize: '12px',
            color: '#3B82F6',
            fontWeight: '800',
            fontFamily: 'monospace',
            marginTop: '4px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '2px 10px',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            {profileForm.badgeNo}
          </div>

          <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', width: '100%', margin: '14px 0' }} />

          {/* Metadata List */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', fontSize: '12px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Rank:</span>
              <span style={{ color: '#fff', fontWeight: '700' }}>{profileForm.rank}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Officer ID:</span>
              <span style={{ color: '#c084fc', fontFamily: 'monospace', fontWeight: '700' }}>{profileForm.officerId}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Station:</span>
              <span style={{ color: '#00D9FF', fontWeight: '600', fontSize: '11px', textAlign: 'right' }}>
                {profileForm.station}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>District / State:</span>
              <span style={{ color: '#cbd5e1' }}>{profileForm.district}, {profileForm.state}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Email:</span>
              <span style={{ color: '#3B82F6', fontWeight: '600', fontSize: '11px' }}>{profileForm.email}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Mobile:</span>
              <span style={{ color: '#cbd5e1' }}>{profileForm.phone}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Joining Date:</span>
              <span style={{ color: '#cbd5e1' }}>{profileForm.joiningDate}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Duty Status:</span>
              <span style={{ color: dutyStatus === 'ON DUTY' ? '#22c55e' : '#ef4444', fontWeight: '800' }}>
                ● {dutyStatus}
              </span>
            </div>

          </div>
        </div>

        {/* ROW 1 - CENTER CARD: Officer Performance */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid rgba(0, 217, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#fff' }}>
              <FiActivity style={{ color: '#3B82F6' }} /> Officer Performance & Case Analytics
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Field Sync Live</span>
          </div>

          {/* 7 Statistic Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Cases</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#3B82F6', marginTop: '4px' }}>24</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Total Case Load</div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Solved Cases</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#22c55e', marginTop: '4px' }}>18</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Chargesheet Filed</div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Pending Cases</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#eab308', marginTop: '4px' }}>6</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>In Investigation</div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Critical Cases</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>3</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>High Priority</div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(0, 217, 255, 0.2)', gridColumn: 'span 2' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Avg Response Time</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#00D9FF', marginTop: '4px' }}>14 Mins</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Emergency Dispatch Arrival</div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Resolution Rate</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#c084fc', marginTop: '4px' }}>85.7%</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Clearance Ratio</div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Today's Cases</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#f97316', marginTop: '4px' }}>2</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>New Incident Calls</div>
            </div>
          </div>
        </div>

        {/* ROW 1 - RIGHT CARD: Operational Status */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#3B82F6', marginBottom: '14px' }}>
              <FiNavigation /> Operational Status
            </div>

            {/* Current Duty Unit Dropdown/Badges */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>Current Assigned Duty</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {['Field Patrol', 'Crime Branch', 'Cyber Cell', 'Traffic'].map(unit => (
                  <button
                    key={unit}
                    onClick={() => setCurrentDuty(unit)}
                    style={{
                      backgroundColor: currentDuty === unit ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                      color: currentDuty === unit ? '#60a5fa' : '#94a3b8',
                      border: `1px solid ${currentDuty === unit ? '#3B82F6' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Last Login:</span>
                <span style={{ color: '#cbd5e1' }}>Today, 15:10 IST</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Current Device:</span>
                <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Field Toughbook Win11</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Current IP:</span>
                <span style={{ color: '#00D9FF', fontFamily: 'monospace', fontWeight: '700' }}>127.0.0.1</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Security Level:</span>
                <span style={{ color: '#eab308', fontWeight: '700' }}>LEVEL 3 - FIELD CONTROL</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>GPS Tracking Status:</span>
                <span style={{ color: '#22c55e', fontWeight: '800' }}>🟢 ACTIVE / SYNCED</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =============================================================
                                  ROW 2
         ============================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 280px',
        gap: '20px',
        marginBottom: '24px'
      }}>
        
        {/* ROW 2 - LEFT: Assigned Cases Table */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff' }}>
              <FiFileText style={{ color: '#3B82F6' }} /> Assigned Field Cases
            </div>
            <Link to="/officer/my-cases" style={{ color: '#3B82F6', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}>
              View All Cases &rarr;
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Case ID</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Crime</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Priority</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedCases.map(item => {
                  const pBadge = getPriorityBadgeStyle(item.priority);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px', fontWeight: '700', color: '#00D9FF', fontFamily: 'monospace' }}>{item.id}</td>
                      <td style={{ padding: '10px', color: '#e2e8f0' }}>{item.category}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          backgroundColor: pBadge.bg,
                          color: pBadge.text,
                          border: `1px solid ${pBadge.border}`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: '700',
                          fontSize: '10px'
                        }}>
                          {item.priority}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: '#cbd5e1' }}>{item.status}</td>
                      <td style={{ padding: '10px' }}>
                        <button
                          onClick={() => navigate(`/officer/cases/${item.id}`)}
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Quick View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROW 2 - CENTER: Field Performance Circular Progress */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid rgba(0, 217, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            <FiSliders style={{ color: '#00D9FF' }} /> Field Investigation Performance
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Metric 1: Investigation Accuracy */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ color: '#e2e8f0' }}>Investigation Accuracy</span>
                <span style={{ color: '#22c55e', fontWeight: '700' }}>94%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #22c55e, #10b981)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Metric 2: Response Speed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ color: '#e2e8f0' }}>Response Speed</span>
                <span style={{ color: '#00D9FF', fontWeight: '700' }}>91%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '91%', height: '100%', background: 'linear-gradient(90deg, #00D9FF, #3b82f6)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Metric 3: Evidence Collection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ color: '#e2e8f0' }}>Evidence Collection</span>
                <span style={{ color: '#c084fc', fontWeight: '700' }}>88%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Metric 4: Case Closure Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ color: '#e2e8f0' }}>Case Closure Rate</span>
                <span style={{ color: '#fde047', fontWeight: '700' }}>86%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '86%', height: '100%', background: 'linear-gradient(90deg, #eab308, #f97316)', borderRadius: '4px' }} />
              </div>
            </div>

          </div>
        </div>

        {/* ROW 2 - RIGHT: Quick Actions */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
            <FiZap style={{ color: '#3B82F6' }} /> Quick Actions
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to="/officer/register"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📝 Register New Crime</span>
              <FiChevronRight />
            </Link>

            <Link
              to="/officer/search"
              style={{
                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                color: '#00D9FF',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🔍 Search Cases</span>
              <FiChevronRight />
            </Link>

            <button
              onClick={() => setMsg({ type: 'success', text: 'FIR Generation compiler initiated.' })}
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📄 Generate FIR</span>
              <FiChevronRight />
            </button>

            <Link
              to="/officer/my-cases"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📁 View Assigned Cases</span>
              <FiChevronRight />
            </Link>

            <Link
              to="/officer/legal-prediction"
              style={{
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                color: '#FBBF24',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>⚖️ AI Legal Prediction</span>
              <FiChevronRight />
            </Link>
          </div>
        </div>

      </div>

      {/* =============================================================
                                  ROW 3
         ============================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px 300px',
        gap: '20px',
        marginBottom: '24px'
      }}>
        
        {/* ROW 3 - LEFT: Recent Activities Timeline */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            <FiActivity style={{ color: '#3B82F6' }} /> Recent Activities Timeline
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>
                👮
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Case Assigned: Cyber Heist CP-2026-0001</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>30 minutes ago</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>
                📝
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>FIR Registered: Online Phishing Incident</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>2 hours ago</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>
                📁
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Evidence Uploaded: Bank Statements & CCTV Logs</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>4 hours ago</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#fde047', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>
                🔄
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Crime Status Updated: Under Investigation</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Yesterday at 17:20</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0, 217, 255, 0.15)', color: '#00D9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>
                📄
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Report Submitted to HQ Command Center</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>2 days ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3 - CENTER: Awards & Service */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid rgba(251, 191, 36, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            <FiAward style={{ color: '#FBBF24' }} /> Awards & Service Dossier
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Years of Service:</span>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: '800' }}>5 Years</span>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Cases Solved:</span>
              <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: '800' }}>18 Cases</span>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Commendations:</span>
              <span style={{ fontSize: '12px', color: '#FBBF24', fontWeight: '800' }}>🏅 3 Medals</span>
            </div>

            <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiStar style={{ color: '#FBBF24', fontSize: '18px' }} />
              <div>
                <div style={{ fontSize: '11px', color: '#FBBF24', fontWeight: '800' }}>BEST PERFORMANCE BADGE</div>
                <div style={{ fontSize: '12px', color: '#fff', fontWeight: '700' }}>Officer of the Month</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Special Unit</div>
              <div style={{ fontSize: '12px', color: '#00D9FF', fontWeight: '700', marginTop: '2px' }}>Cyber Crime Investigation Cell</div>
            </div>
          </div>
        </div>

        {/* ROW 3 - RIGHT: Account & Security */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
            <FiLock style={{ color: '#3B82F6' }} /> Account & Security
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiEdit /> Edit Profile</span>
              <FiChevronRight />
            </button>

            <button
              onClick={() => setShowPasswordModal(true)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiKey /> Change Password</span>
              <FiChevronRight />
            </button>

            <button
              onClick={() => setMsg({ type: 'success', text: 'Officer notification settings opened.' })}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiBell /> Notification Settings</span>
              <FiChevronRight />
            </button>

            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              style={{
                backgroundColor: twoFactorEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: twoFactorEnabled ? '#22c55e' : '#ef4444',
                border: `1px solid ${twoFactorEnabled ? '#22c55e' : '#ef4444'}`,
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiLock /> 2FA Authentication</span>
              <span>{twoFactorEnabled ? 'ENABLED' : 'DISABLED'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to log out all active sessions?')) {
                  setMsg({ type: 'success', text: 'All active sessions invalidated.' });
                }
              }}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiLogOut /> Logout All Devices</span>
              <FiChevronRight />
            </button>
          </div>
        </div>

      </div>

      {/* =============================================================
                                 BOTTOM SECTION
         ============================================================= */}
      <div style={{
        backgroundColor: '#121B2D',
        borderRadius: '14px',
        padding: '24px',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
          <FiClock style={{ color: '#3B82F6' }} /> Recent Login History
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px', fontWeight: '700' }}>Date & Time</th>
                <th style={{ padding: '10px', fontWeight: '700' }}>Browser</th>
                <th style={{ padding: '10px', fontWeight: '700' }}>Device</th>
                <th style={{ padding: '10px', fontWeight: '700' }}>IP Address</th>
                <th style={{ padding: '10px', fontWeight: '700' }}>Location</th>
                <th style={{ padding: '10px', fontWeight: '700' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px', color: '#e2e8f0', fontWeight: '600' }}>{item.date}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{item.browser}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{item.device}</td>
                  <td style={{ padding: '10px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: '700' }}>{item.ip}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{item.location}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      color: '#22c55e',
                      border: '1px solid #22c55e',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '700',
                      fontSize: '10px'
                    }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =============================================================
                                    MODALS
         ============================================================= */}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{ backgroundColor: '#121B2D', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '460px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#3B82F6' }}>
              ✏️ Edit Officer Profile Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Officer Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.name}
                  onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Mobile Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Rank</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.rank}
                  onChange={e => setProfileForm(p => ({ ...p, rank: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setMsg({ type: 'success', text: 'Officer profile details updated successfully!' });
                  }}
                  style={{ flex: 1, backgroundColor: '#3B82F6', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{ backgroundColor: '#121B2D', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#3B82F6' }}>
              🔑 Change Officer Password
            </h3>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Current Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  value={passForm.currentPass}
                  onChange={e => setPassForm(p => ({ ...p, currentPass: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>New Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  value={passForm.newPass}
                  onChange={e => setPassForm(p => ({ ...p, newPass: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  value={passForm.confirmPass}
                  onChange={e => setPassForm(p => ({ ...p, confirmPass: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#3B82F6', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OfficerProfile;
