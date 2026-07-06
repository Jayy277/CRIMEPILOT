import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
  // State for interactive Map details panel
  const [selectedCity, setSelectedCity] = useState({
    name: 'Ahmedabad',
    cases: 245,
    todayCases: 24,
    priority: 'High',
    officer: 'Inspector D. Patel',
    status: 'Active Patrol'
  });

  // State for AI chatbot simulation
  const [chatMessages, setChatMessages] = useState([
    { sender: 'user', text: 'Initiate system check.' },
    { sender: 'system', text: 'CrimePilot AI Core Engine Online. Awaiting sector query.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

  const handleAskAI = (queryText) => {
    if (!queryText.trim()) return;
    
    // Add user message
    const newMessages = [...chatMessages, { sender: 'user', text: queryText }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = 'Query processed. No anomaly detected in current sector.';
      if (queryText.toLowerCase().includes('ahmedabad')) {
        reply = 'Vehicle theft has increased by 18% in Ahmedabad.\n\nAI Analysis: High probability between 8PM - 11PM.\n\nRecommendation:\nIncrease patrol in Zone 4.';
      } else if (queryText.toLowerCase().includes('delhi')) {
        reply = 'Cyber fraud cases flagged in Sector-6, New Delhi.\n\nAI Analysis: Out-of-state IP cluster detected.\n\nRecommendation:\nDeploy digital forensics team.';
      } else if (queryText.toLowerCase().includes('mumbai')) {
        reply = 'Temporal peak detected for commercial crimes near Port region, Mumbai.\n\nAI Analysis: Overlaps with late shift change timings.\n\nRecommendation:\nDouble patrol counts from 0200h to 0500h.';
      }

      setChatMessages(prev => [...prev, { sender: 'system', text: reply }]);
      setIsTyping(false);
    }, 1200);
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
          SECTION 1: HERO COMMAND CENTER
          ============================================== */}
      <section style={{
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
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
          {/* Left Hero Texts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="pulse-node" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D9FF', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Live National Crime Intelligence
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
                Access Secure Terminal
              </Link>
              <button onClick={() => alert('Launching overview stream...')} style={{ padding: '14px 28px', background: 'transparent', color: '#FFFFFF', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Watch Overview
              </button>
            </div>

            {/* Quick Live stats summary */}
            <div style={{
              display: 'flex',
              gap: '24px',
              marginTop: '40px',
              borderTop: '1px solid rgba(0,217,255,0.08)',
              paddingTop: '24px'
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

          {/* Right Hero: High Tech India Map Representation */}
          <div className="glass-panel" style={{
            padding: '30px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(18, 27, 45, 0.4)'
          }}>
            <div className="scanning-bar" />
            <h3 style={{ fontSize: '12px', color: '#00D9FF', fontFamily: 'monospace', alignSelf: 'flex-start', marginBottom: '20px' }}>
              SECURE SECTOR RADAR MAPPING
            </h3>
            
            {/* Interactive Vector Map mockup representing India */}
            <svg viewBox="0 0 400 450" style={{ width: '100%', maxHeight: '420px' }}>
              {/* Map Outline Lines representing network grid of India shape */}
              <polygon points="190,40 210,50 220,90 260,110 320,130 330,170 310,210 260,230 250,290 280,310 240,360 210,420 190,420 160,330 140,290 125,270 90,260 85,220 100,195 110,160 130,150 140,110 180,85" 
                fill="none" stroke="rgba(0, 217, 255, 0.1)" strokeWidth="1.5" />
              <polygon points="190,40 210,50 220,90 260,110 320,130 330,170 310,210 260,230 250,290 280,310 240,360 210,420 190,420 160,330 140,290 125,270 90,260 85,220 100,195 110,160 130,150 140,110 180,85" 
                fill="rgba(0, 217, 255, 0.01)" />
              
              {/* Connection lines */}
              <line x1="180" y1="110" x2="140" y2="230" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="1" className="map-line-draw" />
              <line x1="140" y1="230" x2="150" y2="280" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="1" className="map-line-draw" />
              <line x1="150" y1="280" x2="220" y2="350" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="1" className="map-line-draw" />
              <line x1="180" y1="110" x2="220" y2="350" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="1" className="map-line-draw" />

              {/* Delhi Node */}
              <circle cx="180" cy="110" r="5" fill="#00D9FF" />
              <circle cx="180" cy="110" r="12" fill="none" stroke="#00D9FF" strokeWidth="1" className="pulse-node" style={{ transformOrigin: '180px 110px' }} />
              <text x="190" y="113" fill="#FFF" fontSize="10" fontFamily="monospace">DELHI</text>

              {/* Ahmedabad Node */}
              <circle cx="140" cy="230" r="5" fill="#00D9FF" />
              <circle cx="140" cy="230" r="12" fill="none" stroke="#00D9FF" strokeWidth="1" className="pulse-node" style={{ transformOrigin: '140px 230px' }} />
              <text x="75" y="233" fill="#00D9FF" fontSize="10" fontFamily="monospace">AHMEDABAD</text>

              {/* Mumbai Node */}
              <circle cx="150" cy="280" r="5" fill="#00D9FF" />
              <circle cx="150" cy="280" r="12" fill="none" stroke="#00D9FF" strokeWidth="1" className="pulse-node" style={{ transformOrigin: '150px 280px' }} />
              <text x="100" y="284" fill="#FFF" fontSize="10" fontFamily="monospace">MUMBAI</text>

              {/* Bangalore Node */}
              <circle cx="220" cy="350" r="5" fill="#00D9FF" />
              <circle cx="220" cy="350" r="12" fill="none" stroke="#00D9FF" strokeWidth="1" className="pulse-node" style={{ transformOrigin: '220px 350px' }} />
              <text x="230" y="354" fill="#FFF" fontSize="10" fontFamily="monospace">BANGALORE</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ==============================================
          SECTION 2: LIVE COMMAND STRIP
          ============================================== */}
      <section style={{
        backgroundColor: '#121B2D',
        borderTop: '1px solid rgba(0, 217, 255, 0.15)',
        borderBottom: '1px solid rgba(0, 217, 255, 0.15)',
        padding: '30px 20px',
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
          SECTION 3: PLATFORM WORKFLOW
          ============================================== */}
      <section style={{ padding: '80px 20px', zIndex: 1, position: 'relative' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Operational Blueprint</span>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px', marginBottom: '48px' }}>SYSTEM WORKFLOW PIPELINE</h2>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            background: 'rgba(18, 27, 45, 0.3)',
            padding: '40px 30px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 217, 255, 0.1)'
          }}>
            {[
              { title: 'Citizen', desc: 'Registers Online' },
              { title: 'Digital FIR', desc: 'Generated & Logged' },
              { title: 'Police Station', desc: 'Station Assigned' },
              { title: 'Investigation', desc: 'Officer In-charge' },
              { title: 'AI Analysis', desc: 'Category Scoring' },
              { title: 'Analyst Dashboard', desc: 'Deep Aggregation' },
              { title: 'Admin Monitoring', desc: 'Total Clearance' }
            ].map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <div style={{ flex: '1', minWidth: '130px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 217, 255, 0.08)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    color: '#00D9FF',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {idx + 1}
                  </div>
                  <h4 style={{ fontSize: '14px', color: '#FFF', fontWeight: 'bold', margin: '4px 0 0 0' }}>{step.title}</h4>
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
          SECTION 4: AI FEATURES
          ============================================== */}
      <section style={{ padding: '80px 20px', zIndex: 1, position: 'relative', backgroundColor: 'rgba(18, 27, 45, 0.2)' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>INTELLIGENCE APPARATUS</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>AI ENGINE CORE UTILITIES</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { icon: '🗺️', title: 'Crime Heatmap', desc: 'Dynamic density hotspot maps computed from incoming digital FIR coordinates.' },
              { icon: '🔮', title: 'Crime Prediction', desc: 'Predictive analytics algorithms mapping historical crime spikes to locations.' },
              { icon: '🤖', title: 'AI Assistant', desc: 'Interactive LLM chat console querying offender profiles and section recommendations.' },
              { icon: '📁', title: 'Evidence Vault', desc: 'Tamper-proof storage index mapping digital evidence parameters to case files.' },
              { icon: '👁️', title: 'Pattern Scanner', desc: 'Modus Operandi scanner matching category, time, and keywords in descriptions.' },
              { icon: '⚖️', title: 'Legal Expert', desc: 'Automatic mapping of registered complaints to appropriate IPC/BNS sections.' }
            ].map((feature, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                <span style={{ fontSize: '28px' }}>{feature.icon}</span>
                <h3 style={{ fontSize: '16px', color: '#FFF', fontWeight: 'bold', fontFamily: 'Outfit, sans-serif' }}>{feature.title}</h3>
                <p style={{ fontSize: '12px', color: '#9AA4B2', lineHeight: '1.5', margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==============================================
          SECTION 5: LIVE INTERACTIVE CRIME MAP
          ============================================== */}
      <section style={{ padding: '80px 20px', zIndex: 1, position: 'relative' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', alignItems: 'center' }}>
          
          {/* Map Vector with city clicks */}
          <div className="glass-panel" style={{ padding: '30px', background: 'rgba(18, 27, 45, 0.4)' }}>
            <h3 style={{ fontSize: '14px', color: '#00D9FF', fontFamily: 'monospace', marginBottom: '20px', textAlign: 'left' }}>
              CRITICALLITY PATROL SECTORS (CLICK TO INTERACT)
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
          SECTION 6: AI ASSISTANT CONSOLE
          ============================================== */}
      <section style={{ padding: '80px 20px', zIndex: 1, position: 'relative', backgroundColor: 'rgba(18, 27, 45, 0.2)' }}>
        <div style={{ width: '800px', maxWidth: '100%', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Neural Assistant</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>ASK CRIMEPILOT AI</h2>
          </div>

          <div className="glass-panel" style={{ minHeight: '360px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0B1220' }}>
            
            {/* Messages box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '280px', overflowY: 'auto', paddingRight: '10px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? 'rgba(0, 217, 255, 0.08)' : '#121B2D',
                  border: `1px solid ${msg.sender === 'user' ? '#00D9FF' : 'rgba(0, 217, 255, 0.15)'}`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  maxWidth: '85%',
                  fontSize: '13px',
                  textAlign: 'left',
                  whiteSpace: 'pre-line',
                  lineHeight: '1.4'
                }}>
                  <strong>{msg.sender === 'user' ? 'User Controller' : 'CrimePilot AI'}:</strong>
                  <div style={{ marginTop: '4px', color: '#e2e8f0' }}>{msg.text}</div>
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', color: '#9AA4B2', fontSize: '12px', fontStyle: 'italic' }}>
                  CrimePilot Neural Core typing...
                </div>
              )}
            </div>

            {/* Input field and pre-configured queries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#9AA4B2', alignSelf: 'center' }}>QUICK QUERIES:</span>
                <button
                  type="button"
                  onClick={() => handleAskAI('What crime is increasing in Ahmedabad?')}
                  style={{
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    color: '#FFF',
                    cursor: 'pointer'
                  }}
                >
                  📈 Ahmedabad Vehicle Theft
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAI('Show security reports for Mumbai region')}
                  style={{
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    color: '#FFF',
                    cursor: 'pointer'
                  }}
                >
                  🚢 Mumbai Port Anomaly
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Ask CrimePilot AI database..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskAI(chatInput)}
                  style={{
                    flex: '1',
                    backgroundColor: '#121B2D',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAskAI(chatInput)}
                  style={{
                    backgroundColor: '#00D9FF',
                    color: '#0B1220',
                    fontWeight: 'bold',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  QUERY
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==============================================
          SECTION 7: PORTAL CARDS
          ============================================== */}
      <section style={{ padding: '80px 20px', zIndex: 1, position: 'relative' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Access Gateways</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>CRIMEPILOT ROLE PORTALS</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { role: 'citizen', title: 'Citizen Portal', icon: '👤', desc: 'File digital FIRs, verify identity proofs, upload supporting evidence, and track active cases.' },
              { role: 'officer', title: 'Officer Portal', icon: '👮', desc: 'Manage assigned caseloads, update investigation timelines, register crimes, and log suspects.' },
              { role: 'analyst', title: 'Analyst Portal', icon: '📈', desc: 'Access crime trends heatmaps, hotspot forecasts, predictions index, and compile PDF reports.' },
              { role: 'admin', title: 'Admin Portal', icon: '🛡️', desc: 'Configure police stations, manage user directories, audit system log entries, and verify citizens.' }
            ].map((portal, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', background: 'rgba(18, 27, 45, 0.4)' }}>
                <span style={{ fontSize: '36px' }}>{portal.icon}</span>
                <h3 style={{ fontSize: '18px', color: '#FFF', fontWeight: 'bold' }}>{portal.title}</h3>
                <p style={{ fontSize: '12px', color: '#9AA4B2', lineHeight: '1.5', margin: 0, minHeight: '66px' }}>{portal.desc}</p>
                <Link
                  to={portal.role === 'citizen' ? '/citizen/login' : '/login'}
                  style={{
                    marginTop: '10px',
                    display: 'block',
                    padding: '10px',
                    backgroundColor: 'rgba(0, 217, 255, 0.08)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#00D9FF',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    fontSize: '13px'
                  }}
                >
                  Access Terminal
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==============================================
          SECTION 8: CASE LIFECYCLE TIMELINE
          ============================================== */}
      <section style={{ padding: '80px 20px', zIndex: 1, position: 'relative', backgroundColor: 'rgba(18, 27, 45, 0.2)' }}>
        <div style={{ width: '800px', maxWidth: '100%', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Clearance Timeline</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>CASE LIFECYCLE</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', borderLeft: '2px solid rgba(0, 217, 255, 0.15)', paddingLeft: '24px', marginLeft: '10px' }}>
            {[
              { step: 'Citizen Files FIR', desc: 'Citizen submits complaint details and uploads evidence files digitally.' },
              { step: 'Station Verification', desc: 'Assigned police station reviews document authenticity and clearance.' },
              { step: 'Officer Assigned', desc: 'System automatically delegates case to station investigation officer.' },
              { step: 'Evidence Collection', desc: 'Officer audits digital files and registers physical findings.' },
              { step: 'AI Analysis', desc: 'Modus Operandi scanner generates category match scores and forecasts.' },
              { step: 'Legal Review', desc: ' IPC/BNS legal sections are mapped and reviewed for chargesheet compilations.' },
              { step: 'Case Closed', desc: 'Final investigation reports saved to secure database ledgers.' }
            ].map((flow, idx) => (
              <div key={idx} style={{ position: 'relative', textAlign: 'left' }}>
                <span style={{
                  position: 'absolute',
                  left: '-31px',
                  top: '2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#00D9FF',
                  border: '3px solid #0B1220',
                  boxShadow: '0 0 8px #00D9FF'
                }} />
                <h4 style={{ fontSize: '15px', color: '#FFF', fontWeight: 'bold', margin: '0 0 4px 0' }}>{flow.step}</h4>
                <p style={{ fontSize: '12px', color: '#9AA4B2', margin: 0 }}>{flow.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==============================================
          SECTION 9: WHY CRIMEPILOT AI
          ============================================== */}
      <section style={{ padding: '80px 20px', zIndex: 1, position: 'relative' }}>
        <div style={{ width: '1240px', maxWidth: '100%', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '11px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Security Assurances</span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginTop: '8px' }}>WHY CRIMEPILOT AI?</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              'AI Powered Neural Classification',
              'Proactive Threat/Crime Prediction',
              'Digital FIR Submissions Gateway',
              'Real-Time Casework Tracking',
              'Interactive Density Heatmaps',
              'Secure SMTP Mail Notifications',
              'Cryptographic Evidence Vaults',
              'Smart Section Mapping Recommendations'
            ].map((checklistText, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left', background: 'rgba(18, 27, 45, 0.2)' }}>
                <span style={{ color: '#00D9FF', fontSize: '16px', fontWeight: 'bold' }}>✓</span>
                <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 'bold' }}>{checklistText}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==============================================
          SECTION 10: CORE INTELLIGENCE TEAM
          ============================================== */}
      <section style={{ padding: '80px 20px', zIndex: 1, position: 'relative', backgroundColor: 'rgba(18, 27, 45, 0.2)' }}>
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
                email: 'jay.kanzariya@crimepilot.gov',
                image: '/assets/cyber_intel_officer_2.jpg',
                isCodeIcon: false
              },
              {
                id: 'CP-002',
                name: 'CHAVDA OM',
                role: 'BACKEND DEVELOPER',
                dept: 'Core System Division',
                student: 'Computer Engineering (CE)',
                spec: 'Node.js, Express.js, APIs, Security & Database',
                email: 'chavda.om@crimepilot.gov',
                image: '/assets/cyber_intel_officer_1.jpg',
                isCodeIcon: true
              },
              {
                id: 'CP-003',
                name: 'SOLANKI CHIRAG',
                role: 'AI & ML DEVELOPER',
                dept: 'AI & Analytics Division',
                student: 'Computer Engineering (CE)',
                spec: 'Python, Machine Learning, Data Analytics & AI Models',
                email: 'solanki.chirag@crimepilot.gov',
                image: '/assets/cyber_intel_officer_3.jpg',
                isCodeIcon: true
              }
            ].map((member) => (
              <div
                key={member.id}
                className="team-id-card glass-panel"
                style={{
                  width: '320px',
                  background: 'rgba(17, 24, 39, 0.85)',
                  border: '1px solid rgba(0, 217, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div className="card-scanner" />
                
                <div className="verified-badge" style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(0, 217, 255, 0.1)', border: '1px solid rgba(0, 217, 255, 0.3)',
                  borderRadius: '4px', padding: '2px 6px', fontSize: '8px', color: '#00D9FF', fontWeight: 'bold'
                }}>
                  Verified Intel
                </div>

                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  border: '2px solid rgba(0, 217, 255, 0.4)', padding: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px', overflow: 'hidden'
                }}>
                  <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '4px', letterSpacing: '0.05em' }}>{member.name}</h4>
                <span style={{ fontSize: '11px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '20px', display: 'block', textTransform: 'uppercase' }}>{member.role}</span>

                {/* Details layout with icons */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', marginBottom: '20px', fontSize: '11px' }}>
                  
                  {/* Department */}
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', color: '#00D9FF', marginTop: '2px', flexShrink: 0 }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Department</span>
                      <span style={{ color: '#e2e8f0' }}>{member.dept}</span>
                    </div>
                  </div>

                  {/* Student status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', color: '#00D9FF', marginTop: '2px', flexShrink: 0 }}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Student</span>
                      <span style={{ color: '#e2e8f0' }}>{member.student}</span>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    {member.isCodeIcon ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', color: '#00D9FF', marginTop: '2px', flexShrink: 0 }}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', color: '#00D9FF', marginTop: '2px', flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    )}
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

                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <a href="#" style={{ color: '#64748b' }} className="social-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                  </a>
                  <a href="#" style={{ color: '#64748b' }} className="social-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                  </a>
                  <a href={`mailto:${member.email}`} style={{ color: '#64748b' }} className="social-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  </a>
                </div>

              </div>
            ))}
          </div>

          {/* Bottom badge with tagline */}
          <div style={{
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 11 11 13 15 9"/>
            </svg>
            <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 'bold', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              UNITED BY CODE. DRIVEN BY INTELLIGENCE. DEDICATED TO PUBLIC SAFETY.
            </span>
            <span style={{
              background: 'rgba(0, 217, 255, 0.05)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '4px',
              padding: '4px 12px',
              fontSize: '10px',
              color: '#00D9FF',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              letterSpacing: '0.05em'
            }}>
              BUILDING A SAFER INDIA WITH AI POWERED CRIME INTELLIGENCE
            </span>
          </div>

        </div>
      </section>

      {/* ==============================================
          SECTION 11: MISSION STATEMENT
          ============================================== */}
      <section style={{ padding: '80px 20px', zIndex: 1, position: 'relative' }}>
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
          FOOTER
          ============================================== */}
      <footer style={{
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
              National cyber-crime intelligence and automated digital FIR incident ledger.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', color: '#00D9FF', fontWeight: 'bold', textTransform: 'uppercase' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '13px' }}>
              <a href="#" style={{ color: '#9AA4B2', textDecoration: 'none' }}>GitHub Repository</a>
              <a href="#" style={{ color: '#9AA4B2', textDecoration: 'none' }}>System Documentation</a>
              <a href="#" style={{ color: '#9AA4B2', textDecoration: 'none' }}>Tactical Support</a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', color: '#00D9FF', fontWeight: 'bold', textTransform: 'uppercase' }}>System Integrity</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '13px', color: '#9AA4B2', fontFamily: 'monospace' }}>
              <span>VERSION: v4.8.2-stable</span>
              <span>INTEGRITY: SECURE (CLEAR)</span>
              <span>MD5: 8b27c62d1a38bc</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '12px', color: '#00D9FF', fontWeight: 'bold', textTransform: 'uppercase' }}>Command Center</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '13px', color: '#9AA4B2' }}>
              <span>Emergency Sector Sync: Active</span>
              <span>Response Unit: Standby</span>
            </div>
          </div>
        </div>

        <div style={{
          width: '1240px',
          maxWidth: '100%',
          margin: '40px auto 0 auto',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#64748b'
        }}>
          <span>© 2026 CrimePilot AI. Restricted for authorized government agencies only.</span>
          <span>Security Clearance Level-4 Required.</span>
        </div>
      </footer>

    </div>
  );
};

export default Home;
