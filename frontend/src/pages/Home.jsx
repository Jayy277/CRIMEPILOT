import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AskCrimePilotAI from '../components/AskCrimePilotAI';
import OverviewAnimation from '../components/OverviewAnimation';
import NationalIntelMap from '../components/NationalIntelMap';
import { smoothScrollTo } from '../utils/smoothScroll';

// Simple helper for count-up numbers from 0
const CountUp = ({ end, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    if (end === 0) return;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Mouse radial glow coordinates
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Section Scroll Reveal (IntersectionObserver)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((sec) => {
      sec.classList.add('section-hidden');
      observer.observe(sec);
    });

    return () => observer.disconnect();
  }, []);

  // State for interactive Map details panel

  // State for interactive Map details panel
  const [selectedCity, setSelectedCity] = useState({
    name: 'Ahmedabad',
    cases: 245,
    todayCases: 24,
    priority: 'High',
    officer: 'Inspector D. Patel',
    status: 'Active Patrol'
  });

  const cityDatabase = {
    Ahmedabad: { name: 'Ahmedabad', cases: 245, todayCases: 24, priority: 'High', officer: 'Inspector D. Patel', status: 'Active Patrol' },
    Surat: { name: 'Surat', cases: 156, todayCases: 14, priority: 'Medium', officer: 'Sub-Inspector M. Shah', status: 'Investigation Ongoing' },
    Rajkot: { name: 'Rajkot', cases: 98, todayCases: 8, priority: 'High', officer: 'Inspector K. Jadeja', status: 'Alert Level Green' },
    Vadodara: { name: 'Vadodara', cases: 67, todayCases: 5, priority: 'Low', officer: 'Officer R. Rathod', status: 'Standby' },
    Mumbai: { name: 'Mumbai', cases: 412, todayCases: 38, priority: 'Critical', officer: 'DCP S. Sawant', status: 'Emergency Response' },
    Delhi: { name: 'Delhi', cases: 520, todayCases: 47, priority: 'Critical', officer: 'ACP V. Sharma', status: 'Tactical Deployment' },
    Bangalore: { name: 'Bangalore', cases: 189, todayCases: 19, priority: 'Medium', officer: 'Inspector S. Gowda', status: 'Monitoring Active' },
    Pune: { name: 'Pune', cases: 110, todayCases: 11, priority: 'Medium', officer: 'Officer A. Deshmukh', status: 'Investigation Ongoing' }
  };

  const handleCityClick = (cityName) => {
    if (cityDatabase[cityName]) {
      setSelectedCity(cityDatabase[cityName]);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0B1220',
      color: '#FFFFFF',
      fontFamily: 'Outfit, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>

      {/* Styles Injection */}
      <style>{`
        body.overview-active header {
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 300ms ease !important;
        }
        .glass-panel {
          background: #121B2D;
          border: 1px solid rgba(0, 217, 255, 0.15);
          border-radius: 12px;
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .glass-panel:hover {
          border-color: #00D9FF;
          box-shadow: 0 0 15px rgba(0, 217, 255, 0.15);
          transform: translateY(-2px);
        }
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 217, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.02) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .pulse-node {
          animation: pulse-ring 2.5s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.35); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes sweep-line {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .scanning-bar {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #00D9FF, transparent);
          box-shadow: 0 0 8px #00D9FF;
          animation: sweep-line 3s linear infinite;
        }
        .workflow-arrow {
          color: #00D9FF;
          animation: arrow-glow 1.5s infinite alternate;
        }
        @keyframes arrow-glow {
          0% { opacity: 0.3; text-shadow: none; }
          100% { opacity: 1; text-shadow: 0 0 8px #00D9FF; }
        }
        .map-line-draw {
          stroke-dasharray: 8;
          animation: line-dash 30s linear infinite;
        }
        @keyframes line-dash {
          to { stroke-dashoffset: -1000; }
        }
        .team-id-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .team-id-card:hover {
          transform: translateY(-5px);
          border-color: #00D9FF !important;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.25) !important;
        }
        .team-id-card:hover .card-scanner {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: #00D9FF;
          box-shadow: 0 0 10px #00D9FF;
          animation: sweep-line 2.5s linear infinite;
          z-index: 10;
        }
      `}</style>

      {/* Background Cyber Grid */}
      <div className="cyber-grid" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* ==============================================
          SECTION 1: HERO
          ============================================== */}
      <section id="hero" style={{
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '70px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '1240px',
          maxWidth: '100%',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }}>
          {/* Left Hero Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="pulse-node" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D9FF', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                National Crime Intelligence System
              </span>
            </div>

            <h1 style={{
              fontSize: '52px',
              fontWeight: '900',
              lineHeight: '1.1',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #FFFFFF, #9AA4B2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              AI POWERED CRIME<br />
              <span style={{ color: '#00D9FF', WebkitTextFillColor: 'initial' }}>INTELLIGENCE PLATFORM</span>
            </h1>

            <p style={{ fontSize: '15px', color: '#9AA4B2', lineHeight: '1.6', maxWidth: '520px' }}>
              Real-time AI crime monitoring, digital FIR management, predictive analytics, investigation intelligence and secure police collaboration.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '14px 28px', backgroundColor: '#00D9FF', color: '#0B1220', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', border: '1px solid #00D9FF' }}>
                Launch Secure Portal
              </Link>
              <button
                onClick={() => navigate('/overview')}
                style={{
                  padding: '14px 28px',
                  background: 'transparent',
                  color: '#00D9FF',
                  border: '1px solid rgba(0,217,255,0.4)',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,217,255,0.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,217,255,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                ▶ Watch Platform Overview
              </button>
            </div>

            {/* Quick Live state badge */}
            <div style={{
              display: 'flex',
              gap: '24px',
              marginTop: '30px',
              borderTop: '1px solid rgba(0,217,255,0.08)',
              paddingTop: '20px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#9AA4B2', textTransform: 'uppercase' }}>SYSTEM STATE</span>
                <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>🛡️ ONLINE (SECURE)</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#9AA4B2', textTransform: 'uppercase' }}>AI ENGINE</span>
                <span style={{ fontSize: '14px', color: '#00D9FF', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>v4.8 ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Right Hero: National Crime Intelligence Map Component */}
          <div>
            <NationalIntelMap />
          </div>
        </div>
      </section>

      {/* ==============================================
          SECTION 2: WHAT IS CRIMEPILOT? (<20s overview)
          ============================================== */}
      <section id="what-is-crimepilot" style={{
        padding: '70px 20px',
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'rgba(18, 27, 45, 0.25)',
        borderTop: '1px solid rgba(0, 217, 255, 0.1)',
        borderBottom: '1px solid rgba(0, 217, 255, 0.1)'
      }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Platform Foundation</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>WHAT IS CRIMEPILOT?</h2>
            <p style={{ fontSize: '14px', color: '#9AA4B2', marginTop: '6px', maxWidth: '600px', margin: '6px auto 0' }}>
              CrimePilot is India's unified AI platform connecting citizens, police units, and intelligence analysts for automated crime clearance and public safety.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              {
                icon: '📄',
                title: 'Digital FIR',
                desc: 'Instant online complaint registration with automated IPC/BNS section suggestions and nearest station routing.'
              },
              {
                icon: '🤖',
                title: 'CrimePilot AI',
                desc: 'Natural language legal assistant providing 24x7 guidance on Indian criminal laws, FIR steps, and safety advisories.'
              },
              {
                icon: '📁',
                title: 'Evidence Vault',
                desc: 'Tamper-proof storage vault securing digital evidence, files, and chain-of-custody logs with cryptographic hash integrity.'
              },
              {
                icon: '📊',
                title: 'Crime Analytics',
                desc: 'Real-time spatial heatmaps, Modus Operandi pattern recognition, and automated clearance trend dossiers.'
              }
            ].map((card, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                <span style={{ fontSize: '32px' }}>{card.icon}</span>
                <h3 style={{ fontSize: '18px', color: '#FFF', fontWeight: 'bold', fontFamily: 'Outfit, sans-serif', margin: 0 }}>{card.title}</h3>
                <p style={{ fontSize: '13px', color: '#9AA4B2', lineHeight: '1.5', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================================
          SECTION 3: CRIMEPILOT AI (FLAGSHIP FEATURE)
          ============================================== */}
      <section id="crimepilot-ai" style={{ padding: '80px 20px', zIndex: 1, position: 'relative' }}>
        <div style={{ width: '1000px', maxWidth: '100%', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Flagship Intelligence</span>
            <h2 style={{ fontSize: '34px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>CRIMEPILOT AI ASSISTANT</h2>
            <p style={{ fontSize: '14px', color: '#9AA4B2', marginTop: '8px', maxWidth: '640px', margin: '8px auto 0' }}>
              Specialized in Indian Criminal Law (BNS, BNSS, BSA), digital FIR procedures, cybercrime reporting, and public safety advisory.
            </p>
          </div>

          <AskCrimePilotAI />

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={(e) => { e.preventDefault(); smoothScrollTo('crimepilot-ai', 900, 70); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                background: 'rgba(0, 217, 255, 0.08)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '8px',
                color: '#00D9FF',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 217, 255, 0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              🤖 Try CrimePilot AI Interactive Assistant
            </button>
          </div>

        </div>
      </section>

      {/* ==============================================
          SECTION 4: INTERACTIVE CRIME INTELLIGENCE MAP
          ============================================== */}
      <section id="crime-map" style={{ padding: '80px 20px', zIndex: 1, position: 'relative', backgroundColor: 'rgba(18, 27, 45, 0.25)' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', alignItems: 'center' }}>

          {/* Map Vector with city clicks */}
          <div className="glass-panel" style={{ padding: '30px', background: 'rgba(18, 27, 45, 0.4)' }}>
            <h3 style={{ fontSize: '13px', color: '#00D9FF', fontFamily: 'monospace', marginBottom: '20px', textAlign: 'left' }}>
              CRITICALITY PATROL SECTORS (CLICK CITY TO INSPECT)
            </h3>

            <svg viewBox="0 0 400 450" style={{ width: '100%', maxHeight: '400px' }}>
              <polygon points="190,40 210,50 220,90 260,110 320,130 330,170 310,210 260,230 250,290 280,310 240,360 210,420 190,420 160,330 140,290 125,270 90,260 85,220 100,195 110,160 130,150 140,110 180,85"
                fill="rgba(0, 217, 255, 0.02)" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="1" />

              {Object.keys(cityDatabase).map((cityKey) => {
                const positions = {
                  Delhi: { cx: 180, cy: 110 },
                  Ahmedabad: { cx: 140, cy: 230 },
                  Mumbai: { cx: 150, cy: 280 },
                  Bangalore: { cx: 220, cy: 350 },
                  Surat: { cx: 155, cy: 245 },
                  Rajkot: { cx: 120, cy: 235 },
                  Vadodara: { cx: 160, cy: 250 },
                  Pune: { cx: 165, cy: 295 }
                };
                const pos = positions[cityKey] || { cx: 200, cy: 200 };
                const isSelected = selectedCity.name === cityKey;

                return (
                  <g key={cityKey} onClick={() => handleCityClick(cityKey)} style={{ cursor: 'pointer' }}>
                    <circle cx={pos.cx} cy={pos.cy} r={isSelected ? 6 : 4} fill={isSelected ? '#00D9FF' : 'rgba(0, 217, 255, 0.6)'} />
                    <circle cx={pos.cx} cy={pos.cy} r={10} fill="none" stroke="#00D9FF" strokeWidth="0.5" className="pulse-node" style={{ transformOrigin: `${pos.cx}px ${pos.cy}px` }} />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Info Panel */}
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: 'bold' }}>SECTOR PROFILE PANEL</span>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#FFF', marginTop: '6px' }}>{selectedCity.name}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#9AA4B2' }}>TOTAL ACTIVE CASES</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFF', display: 'block', marginTop: '2px' }}>{selectedCity.cases}</span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#9AA4B2' }}>TODAY INCIDENTS</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#00D9FF', display: 'block', marginTop: '2px' }}>+{selectedCity.todayCases}</span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#9AA4B2' }}>THREAT LEVEL</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: selectedCity.priority === 'Critical' ? '#fb7185' : '#f59e0b', display: 'block', marginTop: '4px' }}>
                  {selectedCity.priority}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#9AA4B2' }}>SECTOR STATUS</span>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1', display: 'block', marginTop: '4px' }}>{selectedCity.status}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <span style={{ fontSize: '10px', color: '#9AA4B2', display: 'block' }}>ASSIGNED INCIDENT CONTROLLER</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#FFF', display: 'block', marginTop: '4px' }}>{selectedCity.officer}</span>
            </div>
          </div>

        </div>
      </section>

      {/* ==============================================
          SECTION 5: PLATFORM CAPABILITIES
          ============================================== */}
      <section id="capabilities" style={{ padding: '80px 20px', zIndex: 1, position: 'relative' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>System Apparatus</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>PLATFORM CAPABILITIES</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              { icon: '🤖', title: 'AI Analysis', desc: 'Modus Operandi pattern scoring & historical similarity matching.' },
              { icon: '📈', title: 'Crime Analytics', desc: 'Statistical density heatmaps and predictive clearance trends.' },
              { icon: '📄', title: 'Digital FIR', desc: 'End-to-end digital complaint filing with legal section recommendations.' },
              { icon: '📁', title: 'Evidence Vault', desc: 'Cryptographic hash indexing for physical & digital evidence files.' },
              { icon: '⏱️', title: 'Case Tracking', desc: 'Real-time investigation progress timeline & automated SMTP updates.' },
              { icon: '🔔', title: 'Notifications', desc: 'Instant alerts dispatched to assigned officers & citizens.' },
              { icon: '👤', title: 'Citizen Portal', desc: 'Self-service portal for complaints, tracking, and evidence submission.' },
              { icon: '👮', title: 'Officer Dashboard', desc: 'Investigative command console for caseload & suspect management.' }
            ].map((capability, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                <span style={{ fontSize: '28px' }}>{capability.icon}</span>
                <h3 style={{ fontSize: '16px', color: '#FFF', fontWeight: 'bold', fontFamily: 'Outfit, sans-serif' }}>{capability.title}</h3>
                <p style={{ fontSize: '12px', color: '#9AA4B2', lineHeight: '1.5', margin: 0 }}>{capability.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================================
          SECTION 6: HOW CRIMEPILOT WORKS
          ============================================== */}
      <section id="how-it-works" style={{ padding: '80px 20px', zIndex: 1, position: 'relative', backgroundColor: 'rgba(18, 27, 45, 0.25)' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Operational Blueprint</span>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px', marginBottom: '48px' }}>HOW CRIMEPILOT WORKS</h2>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            background: 'rgba(18, 27, 45, 0.4)',
            padding: '40px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 217, 255, 0.15)'
          }}>
            {[
              { title: 'Citizen Reports Incident', desc: 'Online FIR & evidence submission' },
              { title: 'AI Initial Analysis', desc: 'IPC/BNS & pattern match scoring' },
              { title: 'Officer Assignment', desc: 'Automated station officer dispatch' },
              { title: 'Evidence Collection', desc: 'Digital & physical hash logging' },
              { title: 'Investigation', desc: 'Case status timeline updates' },
              { title: 'Resolution', desc: 'Final charge & closure report' }
            ].map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <div style={{ flex: '1', minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 217, 255, 0.08)',
                    border: '1px solid rgba(0, 217, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    color: '#00D9FF',
                    fontWeight: 'bold',
                    fontSize: '15px'
                  }}>
                    {idx + 1}
                  </div>
                  <h4 style={{ fontSize: '13px', color: '#FFF', fontWeight: 'bold', margin: '4px 0 0 0' }}>{step.title}</h4>
                  <p style={{ fontSize: '11px', color: '#9AA4B2', margin: 0 }}>{step.desc}</p>
                </div>
                {idx < arr.length - 1 && (
                  <span className="workflow-arrow" style={{ fontSize: '18px', fontWeight: 'bold' }}>→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================================
          SECTION 7: ROLE PORTALS
          ============================================== */}
      <section id="portals" style={{ padding: '80px 20px', scrollMarginTop: '80px', zIndex: 1, position: 'relative' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Access Gateways</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>CRIMEPILOT ROLE PORTALS</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { role: 'citizen', title: 'Citizen Portal', icon: '👤', access: 'Public Access', desc: 'File digital FIRs, verify identity proofs, upload supporting evidence, and track active cases.' },
              { role: 'officer', title: 'Officer Portal', icon: '👮', access: 'Investigative Clearance', desc: 'Manage assigned caseloads, update investigation timelines, register crimes, and log suspects.' },
              { role: 'analyst', title: 'Analyst Portal', icon: '📈', access: 'Intelligence Clearance', desc: 'Access crime trends heatmaps, hotspot forecasts, predictions index, and compile PDF reports.' },
              { role: 'admin', title: 'Admin Portal', icon: '🛡️', access: 'System Governance', desc: 'Configure police stations, manage user directories, audit system log entries, and verify citizens.' }
            ].map((portal, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', background: 'rgba(18, 27, 45, 0.4)' }}>
                <span style={{ fontSize: '36px' }}>{portal.icon}</span>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#FFF', fontWeight: 'bold', margin: 0 }}>{portal.title}</h3>
                  <span style={{ fontSize: '10px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>{portal.access}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#9AA4B2', lineHeight: '1.5', margin: 0, minHeight: '60px' }}>{portal.desc}</p>
                <Link
                  to={portal.role === 'citizen' ? '/citizen/login' : '/login'}
                  style={{
                    marginTop: '8px',
                    display: 'block',
                    padding: '10px',
                    backgroundColor: 'rgba(0, 217, 255, 0.08)',
                    border: '1px solid rgba(0, 217, 255, 0.25)',
                    borderRadius: '8px',
                    color: '#00D9FF',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,217,255,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,217,255,0.08)'; }}
                >
                  Access Terminal
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==============================================
          SECTION 8: WHY CRIMEPILOT?
          ============================================== */}
      <section id="why-crimepilot" style={{ padding: '80px 20px', zIndex: 1, position: 'relative', backgroundColor: 'rgba(18, 27, 45, 0.25)' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Security & Platform Assurances</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>WHY CRIMEPILOT AI?</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              'Secure Cryptographic Logging',
              'AI Powered Neural Classification',
              'Proactive Threat & Crime Prediction',
              'Digital FIR Submissions Gateway',
              'Real-Time Casework Tracking',
              'Interactive Spatial Density Heatmaps',
              'Secure Automated SMTP Mail Updates',
              'Smart BNS Section Recommendations'
            ].map((checklistText, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left', background: 'rgba(18, 27, 45, 0.3)' }}>
                <span style={{ color: '#00D9FF', fontSize: '16px', fontWeight: 'bold' }}>✓</span>
                <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 'bold' }}>{checklistText}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==============================================
          SECTION 9: PLATFORM STATISTICS (After context)
          ============================================== */}
      <section id="statistics" style={{
        backgroundColor: '#121B2D',
        borderTop: '1px solid rgba(0, 217, 255, 0.15)',
        borderBottom: '1px solid rgba(0, 217, 255, 0.15)',
        padding: '50px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '1240px',
          maxWidth: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '24px',
          textAlign: 'center'
        }}>
          {[
            { label: 'ACTIVE CASES', val: 1248 },
            { label: 'CONNECTED STATIONS', val: 56 },
            { label: 'REGISTERED OFFICERS', val: 312 },
            { label: 'REGISTERED CITIZENS', val: 1845 },
            { label: 'PENDING FIR', val: 18 },
            { label: 'SOLVED CASES', val: 924 },
            { label: 'AI CONFIDENCE', val: 97, unit: '%' }
          ].map((stat, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: '#9AA4B2', fontWeight: '800', letterSpacing: '0.05em' }}>{stat.label}</span>
              <span style={{ fontSize: '26px', fontWeight: '900', color: '#00D9FF', fontFamily: 'monospace' }}>
                <CountUp end={stat.val} />{stat.unit}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ==============================================
          SECTION 10: DEVELOPMENT TEAM
          ============================================== */}
      <section id="development-team" style={{ padding: '80px 20px', zIndex: 1, position: 'relative' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>

          <div style={{ marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Core Intelligence Team</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>SYSTEM INTEL ENGINEERS</h2>
            <p style={{ fontSize: '13px', color: '#9AA4B2', marginTop: '8px' }}>The engineers responsible for building the CrimePilot AI National Crime Intelligence Platform.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
            {[
              {
                id: 'CP-001',
                name: 'JAY KANZARIYA',
                role: 'FULL STACK DEVELOPER',
                dept: 'Platform Development Unit',
                student: 'Computer Engineering (CE)',
                spec: 'MERN Stack, System Design, Database & UI/UX',
                email: 'jaykanzariya153@gmail.com',
                image: '/assets/cyber_intel_officer_2.jpg?v=3',
                isCodeIcon: false,
                github: 'https://github.com/Jayy277',
                linkedin: 'https://www.linkedin.com/in/jay-kanzariya-5a82a0328'
              },
              {
                id: 'CP-002',
                name: 'OM CHAVDA',
                role: 'BACKEND DEVELOPER',
                dept: 'Core System Division',
                student: 'Computer Engineering (CE)',
                spec: 'Node.js, Express.js, APIs, Security & Database',
                email: 'omchavda06@gmail.com',
                image: '/assets/cyber_intel_officer_1.jpg?v=2',
                isCodeIcon: true,
                github: 'https://github.com/omchavdapl',
                linkedin: 'https://www.linkedin.com/in/om-chavda-39451a37a'
              },
              {
                id: 'CP-003',
                name: 'CHIRAG SOLANKI',
                role: 'AI & ML DEVELOPER',
                dept: 'AI & Analytics Division',
                student: 'Computer Engineering (CE)',
                spec: 'Python, Machine Learning, Data Analytics & AI Models',
                email: 'solanki33153315@gmail.com',
                image: '/assets/cyber_intel_officer_3.jpg?v=2',
                isCodeIcon: true,
                github: 'https://github.com/chirag041126',
                linkedin: 'https://www.linkedin.com/in/chirag-solanki-618453385'
              }
            ].map((member) => (
              <div
                key={member.id}
                className="team-id-card"
                style={{
                  width: '340px',
                  background: 'rgba(10, 18, 32, 0.85)',
                  border: '1px solid rgba(0, 217, 255, 0.22)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <div className="card-scanner" />

                <div className="verified-badge" style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(0, 217, 255, 0.05)', border: '1px solid rgba(0, 217, 255, 0.25)',
                  borderRadius: '4px', padding: '3px 8px', fontSize: '9px', color: '#00D9FF', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  Verified Intel
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>

                <div style={{
                  position: 'relative',
                  width: '150px',
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                  marginTop: '12px'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '2px solid rgba(0, 217, 255, 0.8)',
                    padding: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    background: '#0a1120',
                    boxShadow: '0 0 20px rgba(0, 217, 255, 0.25)'
                  }}>
                    <img
                      src={member.image}
                      alt={member.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '4px', letterSpacing: '0.05em' }}>{member.name}</h4>
                <span style={{ fontSize: '11px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '18px', display: 'block', textTransform: 'uppercase' }}>{member.role}</span>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '20px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ color: '#00D9FF', marginRight: '8px' }}>🏢</span>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Department</span>
                      <span style={{ color: '#e2e8f0' }}>{member.dept}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ color: '#00D9FF', marginRight: '8px' }}>🎓</span>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Student</span>
                      <span style={{ color: '#e2e8f0' }}>{member.student}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ color: '#00D9FF', marginRight: '8px' }}>⚡</span>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Specialization</span>
                      <span style={{ color: '#e2e8f0', lineHeight: '1.4' }}>{member.spec}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748b'
                }}>
                  <span style={{ fontFamily: 'monospace' }}>ID: {member.id}</span>
                  <span style={{
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '9px',
                    color: '#00D9FF',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}>
                    CLEARANCE: LEVEL 5 (SCI)
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==============================================
          SECTION 11: MISSION & VISION
          ============================================== */}
      <section id="mission" style={{ padding: '80px 20px', zIndex: 1, position: 'relative', backgroundColor: 'rgba(18, 27, 45, 0.25)' }}>
        <div style={{ width: '800px', maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Mission Clearances</span>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px', marginBottom: '24px' }}>STATEMENT OF OBJECTIVES</h2>

          <div className="glass-panel" style={{ padding: '36px', background: 'rgba(18, 27, 45, 0.4)' }}>
            <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.7', margin: 0 }}>
              "To empower global police units, intelligence analysis branches, and municipal command centers with distributed case management, machine intelligence prediction metrics, and secure communication dossiers. We are committed to preserving public safety through cryptographic logging, advanced digital investigations, and real-time network correlation."
            </p>
          </div>
        </div>
      </section>

      {/* ==============================================
          SECTION 12: FOOTER
          ============================================== */}
      <footer id="footer" style={{
        backgroundColor: '#0B1220',
        borderTop: '1px solid rgba(0, 217, 255, 0.15)',
        padding: '60px 20px 40px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '1240px',
          maxWidth: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          textAlign: 'left'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF', fontFamily: 'Outfit, sans-serif' }}>CrimePilot AI</h3>
            <p style={{ fontSize: '12px', color: '#9AA4B2', marginTop: '10px', lineHeight: '1.5' }}>
              National Crime Intelligence Platform
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', color: '#00D9FF', fontWeight: 'bold', textTransform: 'uppercase' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '13px' }}>
              <a href="#hero" onClick={(e) => { e.preventDefault(); smoothScrollTo('hero', 900, 70); }} className="footer-hover-link">Home</a>
              <a href="#what-is-crimepilot" onClick={(e) => { e.preventDefault(); smoothScrollTo('what-is-crimepilot', 900, 70); }} className="footer-hover-link">What is CrimePilot?</a>
              <a href="#crimepilot-ai" onClick={(e) => { e.preventDefault(); smoothScrollTo('crimepilot-ai', 900, 70); }} className="footer-hover-link">CrimePilot AI</a>
              <a href="#capabilities" onClick={(e) => { e.preventDefault(); smoothScrollTo('capabilities', 900, 70); }} className="footer-hover-link">Capabilities</a>
              <a href="#portals" onClick={(e) => { e.preventDefault(); smoothScrollTo('portals', 900, 70); }} className="footer-hover-link">Role Portals</a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', color: '#00D9FF', fontWeight: 'bold', textTransform: 'uppercase' }}>System Status</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '13px', color: '#9AA4B2', fontFamily: 'monospace' }}>
              <span>AI Engine Online</span>
              <span>Database Synced</span>
              <span>Network Secure</span>
              <span>Security Level 4</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', color: '#00D9FF', fontWeight: 'bold', textTransform: 'uppercase' }}>Command Center</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '13px', color: '#9AA4B2' }}>
              <span>Connected Stations: 39</span>
              <span>Active Officers: 312</span>
              <span>Response Status: READY</span>
            </div>
          </div>
        </div>

        <style>{`
          .footer-hover-link {
            color: #9AA4B2;
            text-decoration: none;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .footer-hover-link:hover {
            color: #00D9FF !important;
            transform: translateX(4px);
          }
        `}</style>
      </footer>

    </div>
  );
};

export default Home;
