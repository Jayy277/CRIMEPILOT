import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NationalIntelMap from '../components/NationalIntelMap';
import './PlatformOverview.css';

/* ─── REALISTIC TYPEWRITER COMPONENT ─────────────────────────────────────── */
const Typewriter = ({ text, speed = 25 }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", lineHeight: '1.6', color: '#00D9FF' }}>
      {displayed}
      <span style={{ opacity: displayed.length < text.length ? 1 : 0, animation: 'blink 1s infinite' }}>|</span>
    </span>
  );
};

/* ─── DEDICATED STANDALONE PLATFORM OVERVIEW PAGE (/platform-overview) ──── */
export default function PlatformOverview() {
  const navigate = useNavigate();

  // ScrollSpy IntersectionObserver for smooth section reveal
  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show-section');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const sections = document.querySelectorAll('.overview-section');
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="platform-overview-page">
      {/* Background Layer */}
      <div className="overview-cyber-grid" />
      <div className="overview-radial-glow" />

      {/* ── MINIMAL TOP NAVBAR ── */}
      <header className="overview-header">
        <div className="overview-brand" onClick={() => navigate('/')}>
          <img src="/assets/logo.webp" alt="CrimePilot" className="overview-brand-logo" />
          <span className="overview-brand-title">CrimePilot</span>
          <span className="overview-badge">PLATFORM OVERVIEW</span>
        </div>

        <button className="overview-back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </header>

      {/* ── HERO INTRO SECTION ── */}
      <section className="overview-section" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <div style={{ maxWidth: '840px', textAlign: 'center' }}>
          <img src="/assets/logo.webp" alt="CrimePilot Emblem" style={{ width: '64px', height: '64px', borderRadius: '14px', border: '1.5px solid #00D9FF', boxShadow: '0 0 30px rgba(0, 217, 255, 0.5)', margin: '0 auto 20px auto', display: 'block' }} />
          <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
            National Crime Intelligence System
          </span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: '900', color: '#FFFFFF', margin: '14px 0 16px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            NATIONAL CRIME<br />
            <span style={{ color: '#00D9FF' }}>INTELLIGENCE PLATFORM</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#9AA4B2', fontStyle: 'italic', fontWeight: '600', maxWidth: '620px', margin: '0 auto 32px auto' }}>
            "Protecting India with AI-Powered Intelligence for Modern Law Enforcement"
          </p>
          <div style={{ width: '120px', height: '2px', background: 'linear-gradient(90deg, transparent, #00D9FF, transparent)', margin: '0 auto' }} />
        </div>
      </section>

      {/* ── SECTION 1: WHAT IS CRIMEPILOT? ── */}
      <section className="overview-section" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Section 01 // Foundation</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#FFF', marginTop: '8px', marginBottom: '16px' }}>What is CrimePilot?</h2>
          <p style={{ fontSize: '15px', color: '#9AA4B2', lineHeight: '1.7', maxWidth: '720px', margin: '0 auto 40px auto' }}>
            CrimePilot is India’s unified AI platform connecting citizens, police units, and intelligence analysts for automated crime clearance, legal mapping under BNS/BNSS, and public safety advisory.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { icon: '📄', title: 'Digital FIR Engine', desc: 'Automated legal section suggestion and station routing.' },
              { icon: '🤖', title: 'CrimePilot AI', desc: '24x7 legal assistant powered by BNS, BNSS, and BSA law corpus.' },
              { icon: '🔒', title: 'Evidence Vault', desc: 'Tamper-proof 256-bit SHA cryptographic file integrity.' },
              { icon: '📈', title: 'Spatial Analytics', desc: 'Realtime crime heatmaps, MO pattern match, and clearance forecasts.' }
            ].map((card, i) => (
              <div key={i} className="overview-card" style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '32px' }}>{card.icon}</span>
                <h3 style={{ fontSize: '18px', color: '#FFF', fontWeight: 'bold', margin: '12px 0 6px 0' }}>{card.title}</h3>
                <p style={{ fontSize: '13px', color: '#9AA4B2', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: CITIZEN PORTAL WORKFLOW ── */}
      <section className="overview-section" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Section 02 // Public Access</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#FFF', marginTop: '8px', marginBottom: '40px' }}>Citizen Portal Workflow</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { step: '1. Citizen Login', icon: '👤' },
              { step: '2. Register Account', icon: '📝' },
              { step: '3. Submit Digital FIR', icon: '📄' },
              { step: '4. Upload Evidence', icon: '📁' },
              { step: '5. Receive Tracking ID', icon: '🆔' },
              { step: '6. Case Assigned', icon: '👮' }
            ].map((item, idx, arr) => (
              <React.Fragment key={idx}>
                <div className="overview-card" style={{ padding: '16px 20px', textAlign: 'center', minWidth: '130px' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <div style={{ fontSize: '12px', color: '#FFF', fontWeight: 'bold', marginTop: '6px' }}>{item.step}</div>
                </div>
                {idx < arr.length - 1 && <span style={{ color: '#00D9FF', fontSize: '18px', fontWeight: 'bold' }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: OFFICER PORTAL WORKFLOW ── */}
      <section className="overview-section" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Section 03 // Police Clearance</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#FFF', marginTop: '8px', marginBottom: '40px' }}>Officer Command Workflow</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Officer Login', desc: 'Investigative Credential Verification', icon: '🔑', color: '#10B981' },
              { title: 'Assigned Cases', desc: 'Caseload Queue & Incident Alerts', icon: '📋', color: '#00D9FF' },
              { title: 'Evidence Review', desc: 'SHA File Hashes & Custody Audit', icon: '🔍', color: '#F59E0B' },
              { title: 'Investigation', desc: 'Timeline Updates & Suspect Logging', icon: '⚖️', color: '#8B5CF6' },
              { title: 'Status Update', desc: 'Final Solved & Charge Dossier', icon: '✅', color: '#10B981' }
            ].map((card, i) => (
              <div key={i} className="overview-card" style={{ borderColor: `${card.color}44`, textAlign: 'center' }}>
                <span style={{ fontSize: '28px' }}>{card.icon}</span>
                <h3 style={{ fontSize: '15px', color: '#FFF', fontWeight: 'bold', margin: '10px 0 4px 0' }}>{card.title}</h3>
                <p style={{ fontSize: '11px', color: '#9AA4B2', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: CRIMEPILOT AI ── */}
      <section className="overview-section" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Section 04 // AI Intelligence</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#FFF', marginTop: '8px', marginBottom: '24px' }}>CrimePilot AI Legal Console</h2>
          <div style={{ background: 'rgba(10, 18, 32, 0.9)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '14px', padding: '24px', textAlign: 'left', boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)' }}>
            <div style={{ fontSize: '11px', color: '#9AA4B2', marginBottom: '8px', fontFamily: 'monospace' }}>
              LEGAL QUERY PROMPT: <span style={{ color: '#FFF', fontWeight: 'bold' }}>"What are the procedures for filing a cybercrime FIR under Bharatiya Nyaya Sanhita (BNS)?"</span>
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
              <span style={{ color: '#00E6A8', fontWeight: 'bold', fontFamily: 'monospace' }}>CRIMEPILOT AI: </span>
              <Typewriter text="Under BNS Sec 318 & BNSS Sec 35, cyber financial fraud complaints are registered via Citizen Portal. The system attaches transaction hashes, suggests BNS sections, and routes the FIR to the station officer automatically." speed={25} />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: CRIME ANALYTICS ── */}
      <section className="overview-section" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#EC4899', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Section 05 // Analytics & Predictions</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#FFF', marginTop: '8px', marginBottom: '40px' }}>Predictive Crime Analytics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Spatial Heatmap Index', val: '98.4%', status: 'HIGH DENSITY FORECAST' },
              { label: 'MO Pattern Match', val: '92.8%', status: 'PATTERN IDENTIFIED' },
              { label: 'Hotspot Prediction', val: 'ACTIVE', status: 'ALERT LEVEL GREEN' },
              { label: 'Clearance Rate', val: '89.2%', status: 'OPTIMAL CLEARANCE' }
            ].map((stat, i) => (
              <div key={i} className="overview-card" style={{ borderColor: 'rgba(236, 72, 153, 0.4)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#EC4899', fontFamily: 'monospace' }}>{stat.val}</div>
                <div style={{ fontSize: '13px', color: '#FFF', fontWeight: 'bold', marginTop: '6px' }}>{stat.label}</div>
                <div style={{ fontSize: '9.5px', color: '#10B981', marginTop: '4px', fontWeight: 'bold' }}>{stat.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: NATIONAL INTELLIGENCE MAP ── */}
      <section className="overview-section" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Section 06 // Sector Radar</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#FFF', marginTop: '8px', marginBottom: '32px' }}>National Intelligence Map</h2>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <NationalIntelMap />
          </div>
        </div>
      </section>

      {/* ── SECTION 7: TECHNOLOGY STACK ── */}
      <section className="overview-section" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Section 07 // Architecture</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#FFF', marginTop: '8px', marginBottom: '40px' }}>Technology Stack</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            {[
              { name: 'React 18', type: 'Frontend UI', icon: '⚛️' },
              { name: 'Node.js / Django', type: 'Backend Microservices', icon: '⚙️' },
              { name: 'CrimePilot AI', type: 'LLM Legal Engine', icon: '🧠' },
              { name: 'MongoDB / Postgres', type: 'Encrypted Database', icon: '🗄️' },
              { name: 'JWT Auth', type: 'Security Token Vault', icon: '🔑' },
              { name: 'Nodemailer API', type: 'Alert Dispatch', icon: '✉️' }
            ].map((tech, i) => (
              <div key={i} className="overview-card" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '28px' }}>{tech.icon}</span>
                <h3 style={{ fontSize: '14px', color: '#FFF', fontWeight: 'bold', margin: '8px 0 2px 0' }}>{tech.name}</h3>
                <span style={{ fontSize: '10px', color: '#00D9FF', fontFamily: 'monospace' }}>{tech.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: SECURITY ── */}
      <section className="overview-section" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Section 08 // Cybersecurity</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#FFF', marginTop: '8px', marginBottom: '40px' }}>Government Security & Governance</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Encrypted Communication', desc: 'TLS 1.3 End-to-End Tunneling' },
              { title: 'Role-Based Access', desc: 'Granular Clearance Control' },
              { title: 'JWT Authentication', desc: 'Cryptographic Identity Tokens' },
              { title: 'Evidence Security', desc: '256-bit SHA File Hash Vault' }
            ].map((sec, i) => (
              <div key={i} className="overview-card" style={{ borderColor: 'rgba(0, 230, 168, 0.3)', textAlign: 'center' }}>
                <span style={{ fontSize: '24px' }}>🛡️</span>
                <h3 style={{ fontSize: '15px', color: '#00E6A8', fontWeight: 'bold', margin: '10px 0 4px 0' }}>{sec.title}</h3>
                <p style={{ fontSize: '11px', color: '#9AA4B2', margin: 0 }}>{sec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FUTURE VISION ── */}
      <section className="overview-section" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Section 09 // Vision</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#FFF', marginTop: '8px', marginBottom: '16px' }}>Future Vision & National Rollout</h2>
          <p style={{ fontSize: '15px', color: '#9AA4B2', lineHeight: '1.7' }}>
            Deploying AI-powered crime intelligence across all Indian states, connecting police headquarters, digital evidence vaults, and predictive analytics for nationwide public safety.
          </p>
        </div>
      </section>

      {/* ── FINAL SECTION & ANTHEM ── */}
      <section className="overview-section" style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 54px)', fontWeight: '900', color: '#FFF', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '28px' }}>
            One Platform.<br />
            <span style={{ color: '#00D9FF' }}>One Intelligence Network.</span><br />
            Safer India.
          </h2>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '16px 36px',
                background: 'linear-gradient(135deg, #00D9FF, #0088ff)',
                color: '#060D1A',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(0, 217, 255, 0.5)'
              }}
            >
              🚀 Launch Secure Portal
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '16px 36px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
