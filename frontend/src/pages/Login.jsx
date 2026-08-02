import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const ROLE_CONFIGS = {
  citizen: {
    roleKey: 'citizen',
    badgeText: '🟢 CITIZEN PORTAL',
    badgeColor: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeBorder: 'rgba(16, 185, 129, 0.35)',
    title: 'Citizen Login',
    subtitle: 'Sign in to access your Citizen Portal, submit FIRs, track complaints, and receive investigation updates.',
    documentTitle: 'Citizen Login | CrimePilot',
  },
  officer: {
    roleKey: 'officer',
    badgeText: '🔵 OFFICER PORTAL',
    badgeColor: '#00D9FF',
    badgeBg: 'rgba(0, 217, 255, 0.12)',
    badgeBorder: 'rgba(0, 217, 255, 0.35)',
    title: 'Officer Login',
    subtitle: 'Sign in to access investigation tools, assigned cases, evidence management, and field operations.',
    documentTitle: 'Officer Login | CrimePilot',
  },
  analyst: {
    roleKey: 'analyst',
    badgeText: '🟣 ANALYST PORTAL',
    badgeColor: '#A855F7',
    badgeBg: 'rgba(168, 85, 247, 0.12)',
    badgeBorder: 'rgba(168, 85, 247, 0.35)',
    title: 'Analyst Login',
    subtitle: 'Sign in to access crime intelligence, AI analytics, legal prediction, and crime pattern analysis.',
    documentTitle: 'Analyst Login | CrimePilot',
  },
  admin: {
    roleKey: 'admin',
    badgeText: '🔴 ADMIN PORTAL',
    badgeColor: '#EF4444',
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    badgeBorder: 'rgba(239, 68, 68, 0.35)',
    title: 'Admin Login',
    subtitle: 'Sign in to access the CrimePilot Command Center, manage users, officers, reports, AI modules, and system administration.',
    documentTitle: 'Admin Login | CrimePilot',
  },
};

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEyeHovered, setIsEyeHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Detect role from URL query param (?role=officer) or location state or fallback to 'citizen'
  const roleParam = searchParams.get('role') || location.state?.role;
  const currentRole = (roleParam ? String(roleParam).toLowerCase() : 'citizen');
  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.citizen;

  // Dynamic Browser Document Title
  useEffect(() => {
    document.title = roleConfig.documentTitle;
  }, [roleConfig]);

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'analyst') navigate('/analyst/dashboard');
      else if (user.role === 'citizen') navigate('/citizen/dashboard');
      else navigate('/officer/dashboard');
    }
  }, [user, navigate]);

  const handleMouseMove = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768) {
      return;
    }
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 80;
    const moveY = (clientY - window.innerHeight / 2) / 80;
    setParallaxOffset({ x: -moveX, y: -moveY });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(usernameOrEmail, password);
    setLoading(false);

    if (result.success) {
      if (result.role === 'admin') navigate('/admin/dashboard');
      else if (result.role === 'analyst') navigate('/analyst/dashboard');
      else if (result.role === 'citizen') navigate('/citizen/dashboard');
      else navigate('/officer/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#03050c',
        color: '#f8fafc',
        fontFamily: 'JetBrains Mono, monospace'
      }}
    >
      {/* Styles Injection */}
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hud-blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes hud-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse-bar {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.3); }
        }
        @keyframes lock-glow-pulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.15);
            border-color: rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 0 16px rgba(16, 185, 129, 0.45);
            border-color: rgba(16, 185, 129, 0.6);
          }
        }
        @keyframes radar-scan {
          0% { top: -5%; }
          100% { top: 105%; }
        }
        @keyframes glow-building {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.95; }
        }
        @keyframes float-bit {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-75vh) scale(1.1); opacity: 0; }
        }
        @keyframes particle-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, -15px); }
        }
        @keyframes grid-scroll-floor {
          from { background-position: 0 0; }
          to { background-position: 0 40px; }
        }
        .cyber-panel {
          position: relative;
          background: rgba(8, 12, 24, 0.85) !important;
          border: 1px solid rgba(0, 240, 255, 0.2) !important;
          box-shadow: inset 0 0 12px rgba(0, 240, 255, 0.05), 0 4px 20px rgba(0,0,0,0.5);
          transition: all 0.3s ease;
        }
        .cyber-panel:hover {
          border-color: rgba(0, 240, 255, 0.45) !important;
          box-shadow: inset 0 0 16px rgba(0, 240, 255, 0.1), 0 0 15px rgba(0, 240, 255, 0.15);
        }
        @media (max-width: 950px) {
          .cyber-hud-column {
            display: none !important;
          }
          .cyber-hud-main-grid {
            justify-content: center !important;
            padding: 20px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .hud-anim-rotate, .hud-anim-blink, .hud-anim-draw, .hud-anim-pulse, .hud-anim-glow, .hud-anim-scan, .hud-anim-building, .hud-anim-bit, .hud-anim-particle, .hud-anim-grid {
            animation: none !important;
            stroke-dashoffset: 0 !important;
            transform: none !important;
            opacity: 0.6 !important;
          }
        }
      `}</style>

      {/* 1. Base Background Image */}
      <div 
        style={{
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          right: '-20px',
          bottom: '-20px',
          backgroundImage: 'url(/assets/login-bg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
          transition: 'transform 0.1s ease-out',
          zIndex: 1
        }}
      />

      {/* 2. Dark Radial & Linear Gradient Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(10, 14, 26, 0.70) 0%, rgba(5, 8, 16, 0.90) 80%)',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />

      {/* Ambient background particles & grid */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3, pointerEvents: 'none', opacity: 0.55 }}>
        {/* Floating Particles */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
          {[
            { t: '15%', l: '10%', s: '4px', d: '6s' },
            { t: '45%', l: '15%', s: '3px', d: '8s' },
            { t: '75%', l: '8%', s: '5px', d: '5s' },
            { t: '20%', l: '82%', s: '3px', d: '7s' },
            { t: '50%', l: '88%', s: '4px', d: '9s' },
            { t: '80%', l: '84%', s: '5px', d: '6s' }
          ].map((pt, idx) => (
            <div
              key={idx}
              className="hud-anim-particle"
              style={{
                position: 'absolute',
                top: pt.t,
                left: pt.l,
                width: pt.s,
                height: pt.s,
                borderRadius: '50%',
                backgroundColor: '#00f0ff',
                boxShadow: '0 0 10px #00f0ff',
                animation: `particle-drift ${pt.d} infinite ease-in-out`
              }}
            />
          ))}
        </div>

        {/* Occasional Scanning Radar Line */}
        <div 
          className="hud-anim-scan"
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0) 0%, rgba(0, 240, 255, 0.35) 50%, rgba(0, 240, 255, 0) 100%)',
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)',
            animation: 'radar-scan 7s infinite linear'
          }}
        />

        {/* Slow Moving Grid Lines on the Ground */}
        <div 
          className="hud-anim-grid"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '180px',
            perspective: '150px',
            overflow: 'hidden',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            opacity: 0.35
          }}
        >
          <div 
            style={{
              width: '200%',
              height: '300%',
              marginLeft: '-50%',
              transform: 'rotateX(82deg)',
              transformOrigin: 'top center',
              backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.15) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(0, 240, 255, 0.15) 1.5px, transparent 1.5px)',
              backgroundSize: '40px 40px',
              animation: 'grid-scroll-floor 12s infinite linear'
            }}
          />
        </div>
      </div>

      {/* 3. Top Header Bar */}
      <header
        style={{
          height: '54px',
          borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
          background: 'rgba(8, 12, 24, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxShadow: '0 2px 20px rgba(0, 240, 255, 0.05)',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/assets/logo.webp" alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
          <span style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '2px', color: '#fff' }}>CRIMEPILOT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#00f0ff', fontWeight: 'bold' }}>
          <span>AI CORE</span>
          <span 
            className="hud-anim-blink"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
              animation: 'hud-blink 2s infinite ease-in-out'
            }} 
          />
          <span style={{ color: '#10b981' }}>ONLINE</span>
        </div>
      </header>

      {/* 4. Main Body Layout (3 Columns: Left, Center, Right) */}
      <div 
        className="cyber-hud-main-grid"
        style={{
          display: 'flex',
          flex: 1,
          padding: '24px 32px',
          gap: '32px',
          position: 'relative',
          zIndex: 10,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Left Column Panels */}
        <div 
          className="cyber-hud-column"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '280px',
            flexShrink: 0
          }}
        >
          {/* Rectangular Back Button below top header line */}
          <button
            onClick={() => navigate('/')}
            title="Return to Home Page"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px 20px',
              borderRadius: '8px',
              width: '100%',
              cursor: 'pointer',
              background: 'rgba(8, 12, 24, 0.85)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              color: '#00f0ff',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '1.5px',
              fontFamily: 'JetBrains Mono, monospace',
              boxShadow: 'inset 0 0 12px rgba(0, 240, 255, 0.08), 0 4px 20px rgba(0, 0, 0, 0.5)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.15)';
              e.currentTarget.style.borderColor = '#00f0ff';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.boxShadow = 'inset 0 0 16px rgba(0, 240, 255, 0.2), 0 0 20px rgba(0, 240, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(8, 12, 24, 0.85)';
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.35)';
              e.currentTarget.style.color = '#00f0ff';
              e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(0, 240, 255, 0.08), 0 4px 20px rgba(0, 0, 0, 0.5)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>BACK TO HOME</span>
          </button>
          {/* Live Radar sweep */}
          <div className="cyber-panel" style={{ padding: '16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.08em' }}>SYSTEM RADAR // LIVE SWEEP</span>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <div style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                background: 'radial-gradient(circle, transparent 40%, rgba(0, 240, 255, 0.04) 100%)',
                overflow: 'hidden'
              }}>
                <div 
                  className="hud-anim-rotate"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'conic-gradient(from 0deg, rgba(0, 240, 255, 0.35) 0deg, rgba(0, 240, 255, 0) 90deg)',
                    animation: 'radar-sweep 4s linear infinite',
                    transformOrigin: 'center'
                  }} 
                />
                <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', backgroundColor: 'rgba(0, 240, 255, 0.15)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%', backgroundColor: 'rgba(0, 240, 255, 0.15)' }} />
              </div>
            </div>
          </div>

          {/* Case database metric logs */}
          <div className="cyber-panel" style={{ padding: '16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.08em' }}>DATABASE METRIC // ACTIVE CASE</span>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Cases:</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#00f0ff' }}>22 Record Logs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '16px', marginTop: '6px' }}>
                <div style={{ width: '8%', height: '50%', backgroundColor: '#00f0ff' }} />
                <div style={{ width: '8%', height: '80%', backgroundColor: '#3b82f6' }} />
                <div style={{ width: '8%', height: '40%', backgroundColor: '#f59e0b' }} />
                <div style={{ width: '8%', height: '100%', backgroundColor: '#10b981' }} />
                <div style={{ width: '8%', height: '65%', backgroundColor: '#00f0ff' }} />
              </div>
            </div>
          </div>

          {/* AI core logic status */}
          <div className="cyber-panel" style={{ padding: '16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.08em' }}>COGNITIVE AGENT MODULE</span>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Vector Matrix:</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>SECURED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>NLP Embeddings:</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>ONLINE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Forecasting Engine:</span>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>ARMED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column (Login Card Container) */}
        <div 
          className="cyber-hud-center"
          style={{
            display: 'flex',
            justifyContent: 'center',
            flex: 1,
            zIndex: 10
          }}
        >
          <div 
            className="glass-card" 
            style={{ 
              width: '100%', 
              maxWidth: '380px', 
              padding: '30px',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.50), inset 0 0 15px rgba(0, 240, 255, 0.05)',
              borderRadius: '12px'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <img
                src="/assets/logo.webp"
                alt="CrimePilot Logo"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  margin: '0 auto 10px',
                  display: 'block',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                  border: '1.5px solid rgba(0, 240, 255, 0.3)'
                }}
              />

              {/* Small Colored Role Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: roleConfig.badgeBg,
                border: `1px solid ${roleConfig.badgeBorder}`,
                color: roleConfig.badgeColor,
                fontSize: '10.5px',
                fontWeight: '800',
                letterSpacing: '1px',
                marginBottom: '10px',
                boxShadow: `0 0 12px ${roleConfig.badgeBg}`
              }}>
                {roleConfig.badgeText}
              </div>

              <h2 style={{ fontSize: '22px', color: '#fff', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                {roleConfig.title}
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
                {roleConfig.subtitle}
              </p>
            </div>

            {error && (
              <div className="glass-card" style={{
                padding: '10px',
                borderLeft: '4px solid #e11d48',
                backgroundColor: 'rgba(225,29,72,0.06)',
                color: '#fda4af',
                fontSize: '12px',
                marginBottom: '16px',
                borderRadius: '6px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Username or Email Address</label>
                <input
                  type="text"
                  placeholder="e.g. admin@crimepilot.com"
                  autoComplete="off"
                  className="form-control"
                  style={{
                    backgroundColor: 'rgba(8, 12, 24, 0.8)',
                    borderColor: 'rgba(0, 240, 255, 0.25)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Secure Password</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="form-control"
                    style={{
                      backgroundColor: 'rgba(8, 12, 24, 0.8)',
                      borderColor: 'rgba(0, 240, 255, 0.25)',
                      color: '#fff',
                      fontSize: '13px',
                      paddingRight: '40px'
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    onMouseEnter={() => setIsEyeHovered(true)}
                    onMouseLeave={() => setIsEyeHovered(false)}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                    aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      margin: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: isEyeHovered ? '#00D9FF' : '#8AA3B5',
                      filter: isEyeHovered ? 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.5))' : 'none',
                      transition: 'all 200ms ease',
                      outline: 'none'
                    }}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {currentRole === 'citizen' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px' }}>
                    <Link to="/citizen/forgot-password" style={{ color: '#00D9FF', textDecoration: 'none', fontWeight: 'bold' }}>
                      Forgot Password?
                    </Link>
                    <Link to="/citizen/register" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                      New Citizen? <span style={{ color: '#10B981', fontWeight: 'bold' }}>Register</span>
                    </Link>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '10px',
                  height: '42px',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                  borderColor: '#06b6d4',
                  boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)'
                }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In Securely'}
              </button>
            </form>

            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: '#64748b' }}>
                Authorized Personnel Only. Logins are audited.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column Panels */}
        <div 
          className="cyber-hud-column"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '280px',
            flexShrink: 0
          }}
        >
          {/* Threat Monitor Panel */}
          <div className="cyber-panel" style={{ padding: '16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.08em' }}>THREAT MATRIX // WAVEFORM</span>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Level:</span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '1px' }}>LOW</span>
            </div>
            <svg width="100%" height="25" style={{ marginTop: '8px', overflow: 'visible' }}>
              <path
                className="hud-anim-draw"
                d="M0 12 L20 12 L25 2 L30 22 L35 12 L60 12 L65 2 L70 22 L75 12 L100 12 L105 8 L110 16 L120 12"
                fill="none"
                stroke="rgba(0, 240, 255, 0.5)"
                strokeWidth="1.5"
                strokeDasharray="200"
                strokeDashoffset="200"
                style={{ animation: 'hud-draw 2.5s ease-out forwards' }}
              />
            </svg>
          </div>

          {/* Active Alerts Live Ticker */}
          <div className="cyber-panel" style={{ padding: '16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.08em' }}>LIVE ALERTS FEED</span>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '9px', fontFamily: 'monospace', maxHeight: '72px', overflow: 'hidden' }}>
              <div style={{ color: '#f59e0b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>[12:20] Case CR-008 status Assigned</div>
              <div style={{ color: '#10b981', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>[12:18] Encryption key rotated</div>
              <div style={{ color: '#00f0ff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>[12:15] Neural graph seeded</div>
            </div>
          </div>

          {/* Network Integrity Info */}
          <div className="cyber-panel" style={{ padding: '16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.08em' }}>NETWORK INTEGRITY</span>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Ping Latency:</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>14ms (Optimal)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Node Status:</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>OPERATIONAL</span>
              </div>
            </div>
          </div>

          {/* Secure Connection Vault */}
          <div className="cyber-panel" style={{ padding: '16px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '9px', color: '#64748b' }}>SECURITY ARCHITECTURE</span>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>ENCRYPTED ENDPOINT</span>
              </div>
              <div 
                className="hud-anim-glow" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  animation: 'lock-glow-pulse 2s infinite ease-in-out'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Footer Bar */}
      <footer
        style={{
          height: '42px',
          borderTop: '1px solid rgba(0, 240, 255, 0.25)',
          background: 'rgba(8, 12, 24, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          fontSize: '11px',
          color: '#64748b',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#00f0ff' }}>●</span> LIVE FEED</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#3b82f6' }}>●</span> GEO TRACKING</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#a855f7' }}>●</span> AI ANALYSIS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#10b981' }}>●</span> SECURE CONNECTION</div>
      </footer>
    </div>
  );
};

export default Login;
