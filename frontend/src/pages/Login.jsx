import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  
  const navigate = useNavigate();

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'analyst') navigate('/analyst/dashboard');
      else navigate('/officer/dashboard');
    }
  }, [user, navigate]);

  const handleMouseMove = (e) => {
    // Disable parallax if prefers-reduced-motion is active or on mobile viewports
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768) {
      return;
    }
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 80; // Subtle offset range (approx 5-8px)
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'hidden',
        backgroundColor: '#05070f'
      }}
    >
      {/* Styles Injection */}
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hud-blink {
          0%, 100% { opacity: 0.2; }
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
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.2);
          }
          50% {
            box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);
            border-color: rgba(16, 185, 129, 0.5);
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
        @media (prefers-reduced-motion: reduce) {
          .hud-anim-rotate, .hud-anim-blink, .hud-anim-draw, .hud-anim-pulse, .hud-anim-glow, .hud-anim-scan, .hud-anim-building, .hud-anim-bit, .hud-anim-particle, .hud-anim-grid {
            animation: none !important;
            stroke-dashoffset: 0 !important;
            transform: none !important;
            opacity: 0.6 !important;
          }
        }
      `}</style>

      {/* 1. Base Background Image (WebP format with parallax translations) */}
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
          background: 'radial-gradient(circle at 50% 50%, rgba(15, 20, 32, 0.75) 0%, rgba(15, 20, 32, 0.92) 80%)',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />

      {/* 3. Live HUD Animation Overlays */}
      <div 
        className="hud-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
          pointerEvents: 'none',
          opacity: 0.7
        }}
      >
        {/* Floating Particles (Small Blue Glowing Dots) */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
          {[
            { t: '15%', l: '10%', s: '4px', d: '6s' },
            { t: '40%', l: '8%', s: '3px', d: '8s' },
            { t: '75%', l: '12%', s: '5px', d: '5s' },
            { t: '25%', l: '85%', s: '3px', d: '7s' },
            { t: '55%', l: '90%', s: '4px', d: '9s' },
            { t: '80%', l: '82%', s: '5px', d: '6s' }
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
                backgroundColor: '#06b6d4',
                boxShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d4',
                animation: `particle-drift ${pt.d} infinite ease-in-out`
              }}
            />
          ))}
        </div>

        {/* Subtle Network Lines (SVG Overlay) */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="10%" y1="15%" x2="8%" y2="40%" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" />
          <line x1="8%" y1="40%" x2="12%" y2="75%" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" />
          <line x1="85%" y1="25%" x2="90%" y2="55%" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" />
          <line x1="90%" y1="55%" x2="82%" y2="80%" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" />
        </svg>

        {/* Slow Moving Grid Lines on the Ground (Perspective Perspective Grid) */}
        <div 
          className="hud-anim-grid"
          style={{
            position: 'absolute',
            bottom: 0,
            left: '5%',
            right: '5%',
            height: '22%',
            perspective: '150px',
            overflow: 'hidden',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            opacity: 0.45
          }}
        >
          <div 
            style={{
              width: '200%',
              height: '300%',
              marginLeft: '-50%',
              transform: 'rotateX(82deg)',
              transformOrigin: 'top center',
              backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.15) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(6, 182, 212, 0.15) 1.5px, transparent 1.5px)',
              backgroundSize: '40px 40px',
              animation: 'grid-scroll-floor 12s infinite linear'
            }}
          />
        </div>

        {/* Occasional Scanning Radar Line (Very Subtle) */}
        <div 
          className="hud-anim-scan"
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, rgba(6, 182, 212, 0) 0%, rgba(6, 182, 212, 0.35) 50%, rgba(6, 182, 212, 0) 100%)',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
            animation: 'radar-scan 7s infinite linear'
          }}
        />

        {/* Soft Glow Pulsing on Buildings (Very Slow) */}
        <div 
          className="hud-anim-building"
          style={{
            position: 'absolute',
            top: '25%',
            left: '3%',
            width: '14%',
            height: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 75%)',
            animation: 'glow-building 8s infinite ease-in-out alternate'
          }}
        />
        <div 
          className="hud-anim-building"
          style={{
            position: 'absolute',
            top: '25%',
            right: '3%',
            width: '14%',
            height: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.10) 0%, transparent 75%)',
            animation: 'glow-building 10s infinite ease-in-out alternate',
            animationDelay: '4s'
          }}
        />

        {/* Small Data Bits (0s and 1s) Floating Upwards */}
        {[
          { val: '1', delay: '0s', left: '15%' },
          { val: '0', delay: '2s', left: '22%' },
          { val: '1', delay: '4.5s', left: '78%' },
          { val: '0', delay: '1s', left: '84%' },
          { val: '1', delay: '3.5s', left: '89%' }
        ].map((item, idx) => (
          <span
            key={idx}
            className="hud-anim-bit"
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: item.left,
              fontFamily: 'monospace',
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'rgba(6, 182, 212, 0.35)',
              animation: 'float-bit 9s infinite linear',
              animationDelay: item.delay
            }}
          >
            {item.val}
          </span>
        ))}

        {/* Very Subtle Fog/Mist Effect at the Bottom */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '110px',
            background: 'linear-gradient(to top, rgba(5, 7, 15, 0.5), transparent)',
            backdropFilter: 'blur(2px)',
            maskImage: 'linear-gradient(to top, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
            zIndex: 4
          }}
        />

        {/* Top-Left Radar Sweep Circle */}
        <div style={{
          position: 'absolute',
          top: '5%',
          left: '4%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '1px solid rgba(6, 182, 212, 0.15)',
          background: 'radial-gradient(circle, transparent 40%, rgba(6, 182, 212, 0.02) 100%)',
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
              background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.3) 0deg, rgba(6, 182, 212, 0.0) 90deg)',
              animation: 'radar-sweep 4s linear infinite',
              transformOrigin: 'center'
            }} 
          />
          <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', backgroundColor: 'rgba(6, 182, 212, 0.1)' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%', backgroundColor: 'rgba(6, 182, 212, 0.1)' }} />
          <div style={{ position: 'absolute', top: '20%', left: '20%', width: '60%', height: '60%', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.08)' }} />
        </div>

        {/* SYSTEM STATUS: ONLINE Panel */}
        <div style={{
          position: 'absolute',
          top: '6.5%',
          left: '16%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          color: 'rgba(6, 182, 212, 0.65)',
          letterSpacing: '0.08em'
        }}>
          <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.25)' }}>SYSTEM STATUS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#06b6d4', marginTop: '2px' }}>
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
            ONLINE
          </div>
        </div>

        {/* World Map Connection Arcs (Top-Right) */}
        <svg style={{
          position: 'absolute',
          top: '4%',
          right: '5%',
          width: '280px',
          height: '140px',
          overflow: 'visible'
        }}>
          <circle cx="65" cy="45" r="3" fill="#3b82f6" opacity="0.8">
            <animate attributeName="r" values="2;5;2" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="125" cy="60" r="3" fill="#06b6d4" opacity="0.8">
            <animate attributeName="r" values="2;5;2" dur="4.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="4.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="215" cy="40" r="3" fill="#e11d48" opacity="0.8">
            <animate attributeName="r" values="2;4;2" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.1;0.8" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <path d="M65 45 Q 95 15 125 60" fill="none" stroke="rgba(6, 182, 212, 0.45)" strokeWidth="1" strokeDasharray="100" strokeDashoffset="100">
            <animate attributeName="stroke-dashoffset" values="100;0" dur="4.5s" repeatCount="indefinite" />
          </path>
          <path d="M125 60 Q 170 25 215 40" fill="none" stroke="rgba(225, 29, 72, 0.45)" strokeWidth="1" strokeDasharray="100" strokeDashoffset="100">
            <animate attributeName="stroke-dashoffset" values="100;0" dur="5.5s" repeatCount="indefinite" />
          </path>
        </svg>

        {/* THREAT LEVEL: LOW Graph (Middle-Right) */}
        <div style={{
          position: 'absolute',
          top: '31%',
          right: '8%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          color: 'rgba(6, 182, 212, 0.65)'
        }}>
          <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.25)' }}>THREAT LEVEL</span>
          <span style={{ fontWeight: '700', color: '#3b82f6', marginTop: '2px', letterSpacing: '0.05em' }}>LOW</span>
          <svg width="110" height="30" style={{ marginTop: '8px', overflow: 'visible' }}>
            <path
              className="hud-anim-draw"
              d="M0 15 L20 15 L25 5 L30 25 L35 15 L60 15 L65 2 L70 28 L75 15 L95 15 L100 10 L105 20 L110 15"
              fill="none"
              stroke="rgba(6, 182, 212, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="200"
              strokeDashoffset="200"
              style={{
                animation: 'hud-draw 2.5s ease-out forwards'
              }}
            />
          </svg>
        </div>

        {/* LIVE MONITORING: 24/7 ACTIVE (Bottom-Left) */}
        <div style={{
          position: 'absolute',
          bottom: '6%',
          left: '4%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          color: 'rgba(6, 182, 212, 0.65)'
        }}>
          <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.25)' }}>LIVE MONITORING</span>
          <span style={{ fontWeight: '700', color: '#06b6d4', marginTop: '1px', fontSize: '10px' }}>24/7 ACTIVE</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px', marginTop: '8px' }}>
            {[14, 8, 18, 12, 6, 14, 16, 9, 11, 15].map((height, i) => (
              <div
                key={i}
                className="hud-anim-pulse"
                style={{
                  width: '3px',
                  backgroundColor: 'rgba(6, 182, 212, 0.45)',
                  height: `${height}px`,
                  animation: 'pulse-bar 1.4s infinite alternate ease-in-out',
                  animationDelay: `${i * 0.12}s`,
                  transformOrigin: 'bottom'
                }}
              />
            ))}
          </div>
        </div>

        {/* SECURE CONNECTION: ENCRYPTED (Bottom-Right) */}
        <div style={{
          position: 'absolute',
          bottom: '6%',
          right: '4%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          color: 'rgba(6, 182, 212, 0.65)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.25)' }}>SECURE CONNECTION</span>
            <span style={{ fontWeight: '700', color: '#10b981', marginTop: '1px' }}>ENCRYPTED</span>
          </div>
          <div 
            className="hud-anim-glow"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.15)',
              animation: 'lock-glow-pulse 2s infinite ease-in-out'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. Login Form Glass Card Container */}
      <div 
        className="glass-card" 
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          padding: '32px',
          zIndex: 10,
          position: 'relative',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #e11d48)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '24px',
            color: '#fff',
            margin: '0 auto 12px',
            boxShadow: '0 0 20px rgba(6,182,212,0.3)'
          }}>
            C
          </div>
          <h2 style={{ fontSize: '24px', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Access CrimeGPT</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Enter credentials to access secure terminal</p>
        </div>

        {error && (
          <div className="glass-card" style={{
            padding: '12px',
            borderLeft: '4px solid #e11d48',
            backgroundColor: 'rgba(225,29,72,0.06)',
            color: '#fda4af',
            fontSize: '13px',
            marginBottom: '20px',
            borderRadius: '6px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Username or Email Address</label>
            <input
              type="text"
              placeholder="e.g. admin@crimegpt.com"
              autoComplete="off"
              className="form-control"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label>Secure Password</label>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', height: '45px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In Securely'}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Authorized Personnel Only. Logins are audited.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
