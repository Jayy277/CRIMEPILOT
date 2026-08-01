import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NationalIntelMap from '../components/NationalIntelMap';
import './PlatformOverview.css';

/* ─── REALISTIC TYPEWRITER COMPONENT FOR SCENE 6 ─────────────────────────── */
const TypewriterText = ({ text, speed = 20 }) => {
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
    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#00D9FF' }}>
      {displayed}
      <span style={{ opacity: displayed.length < text.length ? 1 : 0, animation: 'blink-cursor 1s infinite' }}>|</span>
    </span>
  );
};

export default function PlatformOverview() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayTimerRef = useRef(null);

  const TOTAL_SCENES = 13;
  const sceneTitles = [
    '01. WELCOME',
    '02. MODERN LAW ENFORCEMENT',
    '03. HOW CRIMEPILOT WORKS',
    '04. ARCHITECTURE',
    '05. CITIZEN PORTAL',
    '06. OFFICER PORTAL',
    '07. CRIMEPILOT AI',
    '08. NATIONAL INTEL MAP',
    '09. EVIDENCE MANAGEMENT',
    '10. CYBERSECURITY',
    '11. PREDICTIVE AI',
    '12. TECH STACK',
    '13. LAUNCH PORTAL'
  ];

  // Scroll helper
  const scrollToScene = useCallback((idx) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      top: idx * container.clientHeight,
      behavior: 'smooth'
    });
    setActiveSceneIndex(idx);
  }, []);

  // Handle manual interaction to pause auto presentation
  const handleManualInteraction = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  // ScrollSpy to update active scene index based on scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop;
      const height = container.clientHeight;
      const index = Math.round(scrollPos / height);
      if (index >= 0 && index < TOTAL_SCENES) {
        setActiveSceneIndex(index);
      }
    };

    const handleWheel = () => {
      handleManualInteraction();
    };

    const handleTouchMove = () => {
      handleManualInteraction();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [TOTAL_SCENES, handleManualInteraction]);

  // Automatic presentation timer (5 seconds per scene)
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setActiveSceneIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % TOTAL_SCENES;
        const container = containerRef.current;
        if (container) {
          container.scrollTo({
            top: nextIndex * container.clientHeight,
            behavior: 'smooth'
          });
        }
        return nextIndex;
      });
    }, 5000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, TOTAL_SCENES]);

  const [showKbHint, setShowKbHint] = useState(true);

  // Fade out keyboard navigation helper after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowKbHint(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation effect (ArrowUp, ArrowDown, PageUp, PageDown, Home, End)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
      if (!keys.includes(e.key)) return;

      const container = containerRef.current;
      if (!container) return;

      const sceneHeight = container.clientHeight;
      const currentIndex = Math.round(container.scrollTop / sceneHeight);
      let targetIndex = currentIndex;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        if (currentIndex < TOTAL_SCENES - 1) {
          targetIndex = currentIndex + 1;
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          targetIndex = currentIndex - 1;
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = TOTAL_SCENES - 1;
      }

      if (targetIndex !== currentIndex) {
        handleManualInteraction();
        scrollToScene(targetIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [TOTAL_SCENES, handleManualInteraction, scrollToScene]);

  // Framer Motion transition variants for section reveals
  const sectionVariant = {
    hidden: { opacity: 0, y: 35 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
  };

  // Cinematic Intro variants for Scene 1
  const logoVariant = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const titleVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.4, ease: 'easeOut' } }
  };

  const subtitleVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.8, ease: 'easeOut' } }
  };

  const buttonsVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 1.2, ease: 'easeOut' } }
  };

  return (
    <div ref={containerRef} className="overview-presentation-container">
      {/* Background Cyber Grid & Ambient Lighting */}
      <div className="overview-fixed-grid" />
      <div className="overview-fixed-glow" />

      {/* Floating Controls Top-Right */}
      <div className="overview-floating-controls">
        <button
          className={`overview-control-btn ${isAutoPlaying ? 'active' : 'paused'}`}
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        >
          {isAutoPlaying ? '⏸ Pause Auto Presentation' : '▶ Resume Auto Presentation'}
        </button>
        <button className="overview-control-btn skip" onClick={() => navigate('/')}>
          Skip Overview ➔
        </button>
      </div>

      {/* Floating Scene Dots Navigation (Right Edge) */}
      <div className="overview-scene-dots">
        {sceneTitles.map((title, idx) => (
          <button
            key={idx}
            className={`overview-dot ${idx === activeSceneIndex ? 'active' : ''}`}
            onClick={() => {
              handleManualInteraction();
              scrollToScene(idx);
            }}
            title={title}
          />
        ))}
      </div>

      {/* Bottom-Right Keyboard Navigation Helper Hint */}
      <div className={`overview-kb-hint ${showKbHint ? '' : 'hidden'}`}>
        <span><span className="overview-kb-key">↑</span> Previous Scene</span>
        <span style={{ color: '#00D9FF' }}>|</span>
        <span><span className="overview-kb-key">↓</span> Next Scene</span>
      </div>

      {/* ===================================================================
          SCENE 1 – CINEMATIC INTRO (PERFECTLY CENTERED)
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" animate="visible">
            {/* Centered Logo */}
            <motion.div variants={logoVariant} style={{ marginBottom: '24px' }}>
              <img
                src="/assets/logo.webp"
                alt="CrimePilot Shield Logo"
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '18px',
                  border: '1.5px solid #00D9FF',
                  boxShadow: '0 0 35px rgba(0, 217, 255, 0.4)',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </motion.div>

            {/* Title & Tagline */}
            <motion.div variants={titleVariant}>
              <span className="overview-scene-tag">Scene 01 // Cinematic Intro</span>
              <h1 className="overview-scene-title" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)' }}>
                NATIONAL CRIME<br />
                <span style={{ color: '#00D9FF' }}>INTELLIGENCE PLATFORM</span>
              </h1>
            </motion.div>

            <motion.p variants={subtitleVariant} className="overview-scene-desc" style={{ fontSize: '18px', color: '#CBD5E1', fontStyle: 'italic' }}>
              "Protecting India with AI-Powered Intelligence for Modern Law Enforcement"
            </motion.p>

            {/* Entrance Buttons */}
            <motion.div variants={buttonsVariant} style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
              <button
                className="overview-cta-btn"
                onClick={() => {
                  setIsAutoPlaying(true);
                  scrollToScene(1);
                }}
              >
                ▶ Explore Presentation
              </button>
              <button className="overview-secondary-btn" onClick={() => navigate('/login')}>
                Launch Portal
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 2 – MODERN LAW ENFORCEMENT CHALLENGES
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.25 }} variants={sectionVariant}>
            <span className="overview-scene-tag">SCENE 02 // MODERN LAW ENFORCEMENT</span>
            <h2 className="overview-scene-title">Challenges in Modern Law Enforcement</h2>
            <p className="overview-scene-desc" style={{ maxWidth: '840px', lineHeight: '1.7' }}>
              Modern policing faces fragmented workflows, delayed FIR processing, disconnected evidence management, limited crime prediction, and complex legal procedures. CrimePilot AI unifies these operations into one intelligent national platform.
            </p>

            {/* Staggered Card Grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              transition={{ staggerChildren: 0.15 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', width: '100%', marginBottom: '16px' }}
            >
              {[
                {
                  icon: '📄',
                  title: 'Manual FIR Processing',
                  desc: 'Traditional paper-based FIR registration slows investigations and delays police response during critical situations.'
                },
                {
                  icon: '📂',
                  title: 'Fragmented Evidence Management',
                  desc: 'Images, CCTV footage, videos, documents, and digital evidence remain scattered across different systems, making investigations inefficient.'
                },
                {
                  icon: '🔮',
                  title: 'Limited Crime Intelligence',
                  desc: 'Without predictive analytics, police departments struggle to identify emerging crime hotspots and deploy resources proactively.'
                },
                {
                  icon: '⚖️',
                  title: 'Complex Legal Compliance',
                  desc: 'Frequent legal updates including BNS, BNSS, and BSA create challenges in maintaining accurate investigation workflows.'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
                  }}
                  className="scene2-card"
                >
                  <span className="scene2-icon">{item.icon}</span>
                  <h3 className="scene2-card-title">{item.title}</h3>
                  <p className="scene2-card-desc">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Glowing Bottom Solution Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="scene2-solution-strip"
            >
              <div className="scene2-solution-header">
                <span className="scene2-solution-badge">AI SOLUTION</span>
                <span className="scene2-solution-title">CrimePilot AI Solution</span>
              </div>
              <p className="scene2-solution-content">
                CrimePilot centralizes FIR management, AI-powered analytics, digital evidence, legal intelligence, predictive crime mapping, and inter-department collaboration into a unified national platform.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 3 – HOW CRIMEPILOT WORKS
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.25 }} variants={sectionVariant}>
            <span className="overview-scene-tag">SCENE 03 // OPERATIONAL WORKFLOW</span>
            <h2 className="overview-scene-title">How CrimePilot Works</h2>
            <p className="overview-scene-desc" style={{ maxWidth: '840px', lineHeight: '1.7' }}>
              An end-to-end automated pipeline connecting incident reporting, AI law analysis, officer dispatch, digital evidence hash logging, and case resolution.
            </p>

            <div style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              background: 'rgba(18, 27, 45, 0.65)',
              padding: '36px 24px',
              borderRadius: '16px',
              border: '1px solid rgba(0, 217, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              width: '100%'
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
                  <div style={{ flex: '1', minWidth: '130px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0, 217, 255, 0.12)',
                      border: '1px solid rgba(0, 217, 255, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      color: '#00D9FF',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      boxShadow: '0 0 12px rgba(0, 217, 255, 0.2)'
                    }}>
                      {idx + 1}
                    </div>
                    <h4 style={{ fontSize: '13px', color: '#FFF', fontWeight: 'bold', margin: '4px 0 0 0' }}>{step.title}</h4>
                    <p style={{ fontSize: '11px', color: '#9AA4B2', margin: 0 }}>{step.desc}</p>
                  </div>
                  {idx < arr.length - 1 && (
                    <span className="workflow-arrow" style={{ fontSize: '18px', fontWeight: 'bold', color: '#00D9FF' }}>→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 4 – PLATFORM ARCHITECTURE
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={sectionVariant}>
            <span className="overview-scene-tag">SCENE 04 // Command Ecosystem</span>
            <h2 className="overview-scene-title">Unified Platform Architecture</h2>
            <p className="overview-scene-desc">
              Four specialized roles synchronized across one high-security AI intelligence grid.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {[
                { role: 'Citizen Portal', color: '#4DA3FF', icon: '👤', desc: 'Digital FIR registration, identity proofing, evidence upload & live tracking.' },
                { role: 'Officer Portal', color: '#3B82F6', icon: '👮', desc: 'Instant FIR assignment, investigation timeline, evidence log & suspect dossier.' },
                { role: 'Analyst Portal', color: '#F5A623', icon: '📊', desc: 'Spatial heatmaps, MO pattern identification & predictive crime forecasts.' },
                { role: 'Admin Command', color: '#E0384D', icon: '⚡', desc: 'System governance, user RBAC, audit security logs & station setup.' }
              ].map((item, idx) => (
                <div key={idx} className="overview-glass-card" style={{ borderColor: `${item.color}55` }}>
                  <span style={{ fontSize: '36px' }}>{item.icon}</span>
                  <h3 style={{ fontSize: '18px', color: item.color, fontWeight: 'bold', margin: '12px 0 8px 0' }}>{item.role}</h3>
                  <p style={{ fontSize: '13px', color: '#9AA4B2', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 5 – CITIZEN PORTAL
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={sectionVariant}>
            <span className="overview-scene-tag">Scene 05 // Citizen Empowerment</span>
            <h2 className="overview-scene-title">Citizen Digital Services</h2>
            <p className="overview-scene-desc">
              Fast, transparent, and secure public access to police reporting and case tracking.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {[
                {
                  title: 'Digital FIR Registration',
                  desc: 'Submit FIRs online with AI-assisted crime classification, automatic BNS section mapping, and nearest police station routing.',
                  icon: '📄'
                },
                {
                  title: 'Live Case Tracking',
                  desc: 'Track every investigation milestone in real time, including FIR registration, officer assignment, evidence verification, investigation progress, and final case closure.',
                  icon: '📍'
                },
                {
                  title: 'Secure Evidence Vault',
                  desc: 'Upload photos, videos, audio recordings, and documents securely with tamper-proof evidence protection and digital integrity verification.',
                  icon: '📁'
                },
                {
                  title: 'CrimePilot AI Assistant',
                  desc: 'Get AI-powered guidance on FIR filing, BNS legal sections, complaint procedures, citizen rights, and emergency reporting assistance.',
                  icon: '🤖'
                }
              ].map((item, idx) => (
                <div key={idx} className="overview-glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '30px' }}>{item.icon}</span>
                  <h3 style={{ fontSize: '16px', color: '#FFF', fontWeight: 'bold', margin: '12px 0 6px 0' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#9AA4B2', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 6 – OFFICER PORTAL
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={sectionVariant}>
            <span className="overview-scene-tag">Scene 06 // Police Response</span>
            <h2 className="overview-scene-title">Officer Investigation Console</h2>
            <p className="overview-scene-desc">
              Equipping investigating officers with real-time case queues and digital evidence logs.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {[
                {
                  title: 'AI Case Assignment',
                  desc: 'Automatically assigns cases to the appropriate police station and investigating officer based on jurisdiction, workload, crime category, and case priority.',
                  icon: '🛡️'
                },
                {
                  title: 'Evidence Management',
                  desc: 'Securely review, organize, verify, and manage digital evidence while maintaining complete chain-of-custody records.',
                  icon: '📂'
                },
                {
                  title: 'Investigation Timeline',
                  desc: 'Monitor every investigation stage with real-time status updates, officer remarks, case activities, and investigation history.',
                  icon: '🕒'
                },
                {
                  title: 'Charge Sheet Generation',
                  desc: 'Generate court-ready charge sheets, investigation summaries, and official case reports directly from verified investigation records.',
                  icon: '📑'
                }
              ].map((item, idx) => (
                <div key={idx} className="overview-glass-card" style={{ borderColor: 'rgba(59, 130, 246, 0.4)', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '30px' }}>{item.icon}</span>
                  <h3 style={{ fontSize: '16px', color: '#3B82F6', fontWeight: 'bold', margin: '12px 0 6px 0' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#9AA4B2', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 7 – CRIMEPILOT AI
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={sectionVariant}>
            <span className="overview-scene-tag">Scene 07 // AI Legal Console</span>
            <h2 className="overview-scene-title">CrimePilot AI Legal Assistant</h2>
            <p className="overview-scene-desc">
              24x7 intelligent guidance trained on Bharatiya Nyaya Sanhita (BNS) and Bharatiya Nagarik Suraksha Sanhita (BNSS).
            </p>

            <div style={{
              maxWidth: '820px',
              margin: '0 auto',
              background: 'rgba(10, 18, 32, 0.92)',
              border: '1px solid rgba(0, 217, 255, 0.4)',
              borderRadius: '16px',
              padding: '28px',
              textAlign: 'left',
              boxShadow: '0 0 35px rgba(0, 217, 255, 0.15)'
            }}>
              <div style={{ fontSize: '11px', color: '#9AA4B2', marginBottom: '10px', fontFamily: 'monospace' }}>
                CITIZEN QUERY: <span style={{ color: '#FFF', fontWeight: 'bold' }}>"What section applies to online cyber financial fraud and how to file a digital FIR?"</span>
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.7', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                <span style={{ color: '#10B981', fontWeight: 'bold', fontFamily: 'monospace' }}>CRIMEPILOT AI: </span>
                <TypewriterText
                  text="Under BNS Sec 318 & BNSS Sec 35, cyber financial fraud complaints are registered directly via the Citizen Portal. The platform automatically hashes payment transaction proofs, tags applicable legal sections, and routes the FIR to the assigned station officer."
                  speed={20}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 8 – NATIONAL CRIME INTELLIGENCE DASHBOARD
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={sectionVariant}>
            <span className="overview-scene-tag">Scene 08 // Spatial Intelligence</span>
            <h2 className="overview-scene-title">National Crime Intelligence Map</h2>
            <p className="overview-scene-desc">
              Real-time monitoring across Indian states with active core highlights and live incident node pings.
            </p>

            <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
              <NationalIntelMap />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 9 – DIGITAL EVIDENCE MANAGEMENT
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={sectionVariant}>
            <span className="overview-scene-tag">Scene 09 // Evidence Vault</span>
            <h2 className="overview-scene-title">Digital Evidence Pipeline</h2>
            <p className="overview-scene-desc">
              Cryptographic integrity ensuring court-admissible evidence retention without tamper risks.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {[
                { step: '1. File Upload', icon: '📤', detail: 'Photos, Videos, Audio, PDFs' },
                { step: '2. SHA-256 Hash', icon: '🔐', detail: '256-bit Cryptographic Digest' },
                { step: '3. Encrypted Vault', icon: '🗄️', detail: 'Secure Storage Pipeline' },
                { step: '4. Chain of Custody', icon: '📋', detail: 'Timestamped Audit Trail' }
              ].map((item, idx, arr) => (
                <React.Fragment key={idx}>
                  <div className="overview-glass-card" style={{ padding: '20px 24px', textAlign: 'center', minWidth: '170px' }}>
                    <span style={{ fontSize: '32px' }}>{item.icon}</span>
                    <div style={{ fontSize: '15px', color: '#FFF', fontWeight: 'bold', marginTop: '8px' }}>{item.step}</div>
                    <div style={{ fontSize: '11px', color: '#00D9FF', fontFamily: 'monospace', marginTop: '4px' }}>{item.detail}</div>
                  </div>
                  {idx < arr.length - 1 && <span style={{ color: '#00D9FF', fontSize: '24px', fontWeight: 'bold' }}>➔</span>}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 10 – SECURITY
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={sectionVariant}>
            <span className="overview-scene-tag">Scene 10 // Government Security</span>
            <h2 className="overview-scene-title">Enterprise Cybersecurity Architecture</h2>
            <p className="overview-scene-desc">
              Strict data governance and cryptographic security standards protecting national intelligence.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {[
                { title: 'JWT Authentication', desc: 'Secure stateless bearer tokens for all API endpoints.', icon: '🔑' },
                { title: 'End-to-End Encryption', desc: 'TLS 1.3 tunneling and 256-bit AES database encryption.', icon: '🔒' },
                { title: 'Role-Based Access Control', desc: 'Strict isolation between Citizen, Officer, Analyst, and Admin.', icon: '🛡️' },
                { title: 'System Audit Logging', desc: 'Immutable activity tracking for compliance and forensics.', icon: '📜' }
              ].map((item, idx) => (
                <div key={idx} className="overview-glass-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  <span style={{ fontSize: '32px' }}>{item.icon}</span>
                  <h3 style={{ fontSize: '16px', color: '#10B981', fontWeight: 'bold', margin: '12px 0 6px 0' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#9AA4B2', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 11 – AI PREDICTION
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={sectionVariant}>
            <span className="overview-scene-tag">Scene 11 // Predictive Analytics</span>
            <h2 className="overview-scene-title">Crime Hotspot Forecasting</h2>
            <p className="overview-scene-desc">
              Predictive models identifying high-risk spatial sectors and optimal patrol deployment routes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {[
                { val: '98.4%', label: 'Spatial Density Accuracy', note: 'High probability sector mapping' },
                { val: '92.8%', label: 'MO Pattern Matching', note: 'Cross-station modus operandi sync' },
                { val: '< 15m', label: 'Response Target', note: 'AI dispatched patrol alert speed' },
                { val: '100%', label: 'BNS/BNSS Coverage', note: 'Complete statutory section alignment' }
              ].map((item, idx) => (
                <div key={idx} className="overview-glass-card" style={{ borderColor: 'rgba(236, 72, 153, 0.4)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#EC4899', fontFamily: 'monospace' }}>{item.val}</div>
                  <div style={{ fontSize: '14px', color: '#FFF', fontWeight: 'bold', marginTop: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#9AA4B2', marginTop: '4px' }}>{item.note}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          SCENE 12 – TECHNOLOGY STACK
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={sectionVariant}>
            <span className="overview-scene-tag">Scene 12 // Technology Stack</span>
            <h2 className="overview-scene-title">Production Tech Stack</h2>
            <p className="overview-scene-desc">
              Modern, scalable web technology powering India's National Crime Intelligence Platform.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px' }}>
              {[
                { name: 'React 19', type: 'Frontend Engine', icon: '⚛️' },
                { name: 'Node.js & Express', type: 'REST Microservices', icon: '⚙️' },
                { name: 'Django Engine', type: 'Python Intelligence Core', icon: '🐍' },
                { name: 'MySQL & MongoDB', type: 'Encrypted Vault', icon: '🗄️' },
                { name: 'CrimePilot AI', type: 'BNS/BNSS LLM Model', icon: '🧠' },
                { name: 'Framer Motion', type: 'Presentation UI', icon: '✨' }
              ].map((item, idx) => (
                <div key={idx} className="overview-glass-card" style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '32px' }}>{item.icon}</span>
                  <h3 style={{ fontSize: '15px', color: '#FFF', fontWeight: 'bold', margin: '8px 0 2px 0' }}>{item.name}</h3>
                  <span style={{ fontSize: '11px', color: '#00D9FF', fontFamily: 'monospace' }}>{item.type}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          FINAL SCENE – LAUNCH PORTAL
          =================================================================== */}
      <section className="overview-scene">
        <div className="overview-scene-content">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={sectionVariant}>
            <img
              src="/assets/logo.webp"
              alt="CrimePilot Emblem"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '16px',
                border: '1.5px solid #00D9FF',
                boxShadow: '0 0 35px rgba(0, 217, 255, 0.5)',
                margin: '0 auto 20px auto',
                display: 'block'
              }}
            />

            <span className="overview-scene-tag">Final Scene // System Ready</span>
            <h2 className="overview-scene-title" style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>
              One Platform.<br />
              <span style={{ color: '#00D9FF' }}>Smarter Investigation.</span><br />
              Safer India.
            </h2>

            <p style={{ fontSize: '16px', color: '#9AA4B2', maxWidth: '600px', margin: '0 auto 32px auto' }}>
              CrimePilot AI is operational and ready to serve citizens, officers, and analysts nationwide.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="overview-cta-btn" onClick={() => navigate('/login')}>
                🚀 Launch Secure Portal
              </button>
              <button className="overview-secondary-btn" onClick={() => navigate('/')}>
                🏠 Return to Homepage
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
