import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import {
  FiShield, FiCpu, FiTrendingUp, FiFileText, FiMapPin, FiActivity,
  FiLock, FiUser, FiMail, FiPhone, FiCalendar, FiClock, FiSmartphone,
  FiGlobe, FiKey, FiEdit, FiBell, FiCheckCircle, FiChevronRight,
  FiZap, FiPieChart, FiBarChart2, FiSliders, FiDownload, FiCamera, FiCheck
} from 'react-icons/fi';

const AnalystProfile = () => {
  const { user, details, setUser, setDetails } = useContext(AuthContext);
  const navigate = useNavigate();

  // Avatar Upload State
  const [avatarUrl, setAvatarUrl] = useState(
    details?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
  );
  const [uploading, setUploading] = useState(false);

  // Modals & Messages
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Form Inputs
  const [profileForm, setProfileForm] = useState({
    name: details?.full_name || details?.name || 'Analyst One',
    email: user?.email || 'analyst1@crimepilot.com',
    phone: details?.phone || '+91 98123 45678',
    department: 'Intelligence & AI Crime Analytics',
    rank: 'Senior Crime Analyst',
    analystId: 'ANA-2026-001',
  });

  const [passForm, setPassForm] = useState({ currentPass: '', newPass: '', confirmPass: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '', confirmEmail: '' });

  // Handle Avatar Change
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'File size exceeds 5MB limit.' });
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    setMsg({ type: 'success', text: 'Profile picture updated successfully!' });

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await axiosInstance.post('/auth/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success && res.data.details) {
        setDetails(res.data.details);
        localStorage.setItem('crimepilot_details', JSON.stringify(res.data.details));
      }
    } catch (err) {
      console.error('Error saving profile picture:', err);
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
    setMsg({ type: 'success', text: 'Analyst security password updated successfully!' });
    setShowPasswordModal(false);
    setPassForm({ currentPass: '', newPass: '', confirmPass: '' });
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.newEmail.includes('@')) {
      setMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setProfileForm(prev => ({ ...prev, email: emailForm.newEmail }));
    setMsg({ type: 'success', text: 'Analyst account email updated successfully!' });
    setShowEmailModal(false);
    setEmailForm({ newEmail: '', confirmEmail: '' });
  };

  // Assigned Analysis Cases Data
  const assignedCases = [
    { id: 'CP-2026-0001', category: 'Cyber Crime', status: 'Under Investigation', priority: 'High', date: '2026-07-30' },
    { id: 'CP-2026-0003', category: 'Online Fraud', status: 'Evidence Collected', priority: 'Medium', date: '2026-07-29' },
    { id: 'CP-2026-0006', category: 'Financial Fraud', status: 'Solved', priority: 'Critical', date: '2026-07-26' },
    { id: 'CP-2026-0012', category: 'House Burglary', status: 'Under Investigation', priority: 'Critical', date: '2026-07-15' },
  ];

  // Login History Data
  const loginHistory = [
    { date: '2026-08-02 14:10', device: 'Windows PC (HQ-Workstation)', browser: 'Chrome 122.0', ip: '127.0.0.1', status: 'SUCCESS' },
    { date: '2026-08-01 09:30', device: 'Windows PC (HQ-Workstation)', browser: 'Chrome 122.0', ip: '127.0.0.1', status: 'SUCCESS' },
    { date: '2026-07-31 16:20', device: 'Analyst iPad Pro', browser: 'Safari 17.2', ip: '192.168.1.45', status: 'SUCCESS' },
    { date: '2026-07-30 11:05', device: 'Windows PC (HQ-Workstation)', browser: 'Firefox 120.0', ip: '127.0.0.1', status: 'SUCCESS' },
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
            <FiShield style={{ color: '#FBBF24', fontSize: '24px' }} />
            <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>
              Intelligence Division Command Center
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 34px' }}>
            CrimePilot AI &bull; Analyst Security Profile & Predictive Intelligence Hub
          </p>
        </div>
        <span style={{
          backgroundColor: 'rgba(251, 191, 36, 0.15)',
          color: '#FBBF24',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiCpu /> AI Module Active
        </span>
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
        
        {/* ROW 1 - LEFT CARD: Analyst Identity */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid rgba(251, 191, 36, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Avatar with Amber Glowing Ring */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <img
              src={avatarUrl}
              alt={profileForm.name}
              style={{
                width: '105px',
                height: '105px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #FBBF24',
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)',
                backgroundColor: '#0F172A'
              }}
            />
            <label
              htmlFor="analyst-avatar-upload"
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                backgroundColor: '#FBBF24',
                color: '#0B1220',
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
              id="analyst-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Name & Analyst ID */}
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#fff' }}>
            {profileForm.name}
          </h2>
          <div style={{
            fontSize: '12px',
            color: '#FBBF24',
            fontWeight: '700',
            fontFamily: 'monospace',
            marginTop: '4px',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            padding: '2px 10px',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            {profileForm.analystId}
          </div>

          <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', width: '100%', margin: '14px 0' }} />

          {/* Metadata List */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', fontSize: '12px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Badge:</span>
              <span style={{
                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                color: '#00D9FF',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: '700',
                fontSize: '10px'
              }}>
                🛡️ INTELLIGENCE DIVISION
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Rank:</span>
              <span style={{ color: '#fff', fontWeight: '700' }}>{profileForm.rank}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Department:</span>
              <span style={{ color: '#e2e8f0', fontWeight: '500', fontSize: '11px', textAlign: 'right' }}>
                {profileForm.department}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Status:</span>
              <span style={{ color: '#22c55e', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                Online
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Email:</span>
              <span style={{ color: '#00D9FF', fontWeight: '600', fontSize: '11px' }}>{profileForm.email}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Joined Date:</span>
              <span style={{ color: '#cbd5e1' }}>Jan 10, 2026</span>
            </div>

          </div>
        </div>

        {/* ROW 1 - CENTER CARD: Performance Summary */}
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
              <FiBarChart2 style={{ color: '#FBBF24' }} /> Intelligence Performance Summary
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Updated Live</span>
          </div>

          {/* 6 Statistic Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px'
          }}>
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              transition: 'transform 0.2s',
            }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Total Cases Analysed</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#00D9FF', marginTop: '6px' }}>342</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>+12% from last week</div>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              transition: 'transform 0.2s',
            }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>AI Predictions</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#FBBF24', marginTop: '6px' }}>128</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>High Precision Runs</div>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              transition: 'transform 0.2s',
            }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Reports Created</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#c084fc', marginTop: '6px' }}>84</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Compiled Dossiers</div>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              transition: 'transform 0.2s',
            }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Hotspots Monitored</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#ef4444', marginTop: '6px' }}>19</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Geospatial Zones</div>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              transition: 'transform 0.2s',
            }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Trends Detected</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#22c55e', marginTop: '6px' }}>47</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Pattern Correlations</div>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              transition: 'transform 0.2s',
            }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Avg Accuracy %</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#fde047', marginTop: '6px' }}>96.4%</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>ML Engine Confidence</div>
            </div>
          </div>
        </div>

        {/* ROW 1 - RIGHT CARD: Security Clearance */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#ef4444', marginBottom: '14px' }}>
              <FiLock /> Security Clearance
            </div>

            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10px', color: '#fca5a5', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clearance Level</div>
              <div style={{ fontSize: '15px', color: '#ef4444', fontWeight: '900', marginTop: '2px' }}>
                CONFIDENTIAL - LEVEL 4
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Division:</span>
                <span style={{ color: '#FBBF24', fontWeight: '700' }}>Intelligence Division</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>System Access:</span>
                <span style={{ color: '#22c55e', fontWeight: '700' }}>ACTIVE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Last Login:</span>
                <span style={{ color: '#cbd5e1' }}>Today, 14:10 IST</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Current Device:</span>
                <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Chrome 122 (Win 11)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Current IP:</span>
                <span style={{ color: '#00D9FF', fontFamily: 'monospace', fontWeight: '700' }}>127.0.0.1</span>
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
        
        {/* ROW 2 - LEFT: Recent Analyst Activities */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid rgba(0, 217, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            <FiActivity style={{ color: '#00D9FF' }} /> Recent Analyst Activities
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>
                ⚡
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Generated AI Prediction for Cyber Theft Hotspots</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>15 minutes ago</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0, 217, 255, 0.15)', color: '#00D9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>
                📄
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Exported Monthly Crime Compilation Report (PDF)</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>2 hours ago</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>
                🗺️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Updated Interactive Heatmap Data Layer</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Yesterday at 16:45</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>
                🔍
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Completed Crime Pattern Analysis - Commercial Theft</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>2 days ago</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#fde047', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>
                📝
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Added Investigation Notes to Case CP-2026-0004</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>3 days ago</div>
              </div>
            </div>

          </div>
        </div>

        {/* ROW 2 - CENTER: Skill Dashboard */}
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
            <FiSliders style={{ color: '#FBBF24' }} /> Intelligence Skill Dashboard
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Skill 1: Cyber Crime Analysis */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ color: '#e2e8f0' }}>Cyber Crime Analysis</span>
                <span style={{ color: '#00D9FF', fontWeight: '700' }}>92%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #00D9FF, #3b82f6)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Skill 2: Financial Crime */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ color: '#e2e8f0' }}>Financial Crime</span>
                <span style={{ color: '#FBBF24', fontWeight: '700' }}>88%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #FBBF24, #f97316)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Skill 3: Prediction Accuracy */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ color: '#e2e8f0' }}>Prediction Accuracy</span>
                <span style={{ color: '#22c55e', fontWeight: '700' }}>94%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #22c55e, #10b981)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Skill 4: Heatmap Intelligence */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ color: '#e2e8f0' }}>Heatmap Intelligence</span>
                <span style={{ color: '#c084fc', fontWeight: '700' }}>91%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '91%', height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Skill 5: Pattern Detection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                <span style={{ color: '#e2e8f0' }}>Pattern Detection</span>
                <span style={{ color: '#3b82f6', fontWeight: '700' }}>96%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '96%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '4px' }} />
              </div>
            </div>

          </div>
        </div>

        {/* ROW 2 - RIGHT: Quick Actions */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
            <FiZap style={{ color: '#00D9FF' }} /> Quick Actions
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to="/analyst/prediction"
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🤖 Generate AI Report</span>
              <FiChevronRight />
            </Link>

            <Link
              to="/analyst/heatmap"
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🗺️ Crime Heatmap</span>
              <FiChevronRight />
            </Link>

            <Link
              to="/analyst/reports"
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📊 Compile Report</span>
              <FiChevronRight />
            </Link>

            <Link
              to="/analyst/analytics"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📄 Export Analytics PDF</span>
              <FiChevronRight />
            </Link>

            <Link
              to="/analyst/trends"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.3)',
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📈 View Crime Trends</span>
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
        
        {/* ROW 3 - LEFT: Assigned Analysis Cases Table */}
        <div style={{
          backgroundColor: '#121B2D',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid rgba(0, 217, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            <FiFileText style={{ color: '#00D9FF' }} /> Assigned Analysis Cases
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Case ID</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Category</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Priority</th>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>Assigned Date</th>
                </tr>
              </thead>
              <tbody>
                {assignedCases.map(item => {
                  const pBadge = getPriorityBadgeStyle(item.priority);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '10px', fontWeight: '700', color: '#00D9FF', fontFamily: 'monospace' }}>{item.id}</td>
                      <td style={{ padding: '10px', color: '#e2e8f0' }}>{item.category}</td>
                      <td style={{ padding: '10px', color: '#cbd5e1' }}>{item.status}</td>
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
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{item.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROW 3 - CENTER: AI Performance */}
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
            <FiCpu style={{ color: '#FBBF24' }} /> AI Engine Metrics
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Prediction Confidence</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#22c55e', marginTop: '4px' }}>96.8%</div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Avg Processing Time</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#00D9FF', marginTop: '4px' }}>1.2s</div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Today's Predictions</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#FBBF24', marginTop: '4px' }}>14</div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Weekly Predictions</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#c084fc', marginTop: '4px' }}>86</div>
            </div>
          </div>
        </div>

        {/* ROW 3 - RIGHT: Account Settings */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
            <FiSliders style={{ color: '#00D9FF' }} /> Account Settings
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
              onClick={() => setShowEmailModal(true)}
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMail /> Change Email</span>
              <FiChevronRight />
            </button>

            <button
              onClick={() => setMsg({ type: 'success', text: 'Notification settings drawer opened.' })}
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
        border: '1px solid rgba(0, 217, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
          <FiClock style={{ color: '#00D9FF' }} /> Recent Login History
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px', fontWeight: '700' }}>Date & Time</th>
                <th style={{ padding: '10px', fontWeight: '700' }}>Device</th>
                <th style={{ padding: '10px', fontWeight: '700' }}>Browser</th>
                <th style={{ padding: '10px', fontWeight: '700' }}>IP Address</th>
                <th style={{ padding: '10px', fontWeight: '700' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px', color: '#e2e8f0', fontWeight: '600' }}>{item.date}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{item.device}</td>
                  <td style={{ padding: '10px', color: '#cbd5e1' }}>{item.browser}</td>
                  <td style={{ padding: '10px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: '700' }}>{item.ip}</td>
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
          <div style={{ backgroundColor: '#121B2D', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '460px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#FBBF24' }}>
              ✏️ Edit Analyst Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.name}
                  onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.phone}
                  onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Department</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.department}
                  onChange={e => setProfileForm(p => ({ ...p, department: e.target.value }))}
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
                    setMsg({ type: 'success', text: 'Analyst profile updated successfully!' });
                  }}
                  style={{ flex: 1, backgroundColor: '#FBBF24', color: '#0B1220', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
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
          <div style={{ backgroundColor: '#121B2D', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid rgba(0, 217, 255, 0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#00D9FF' }}>
              🔑 Change Password
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
                  style={{ flex: 1, backgroundColor: '#00D9FF', color: '#0B1220', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showEmailModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{ backgroundColor: '#121B2D', padding: '28px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#c084fc' }}>
              ✉️ Change Email Address
            </h3>
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>New Analyst Email Address</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  value={emailForm.newEmail}
                  onChange={e => setEmailForm(p => ({ ...p, newEmail: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
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

    </div>
  );
};

export default AnalystProfile;
