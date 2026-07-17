import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── SLIDE DATA ─────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 0,
    phase: 'INTRO',
    duration: 5000,
    icon: '🛡️',
    title: 'CrimePilot AI',
    subtitle: 'DIGITAL FIR & CITIZEN SAFETY PORTAL',
    description: 'A next-generation AI-powered platform connecting citizens, officers and analysts for a safer India.',
    color: '#00D9FF',
    accent: 'rgba(0,217,255,0.15)',
    particles: true,
  },
  {
    id: 1,
    phase: 'FIR SUBMISSION',
    duration: 6000,
    icon: '📄',
    title: 'Citizen FIR Submission',
    subtitle: 'STEP 1 — DIGITAL COMPLAINT FILING',
    description: 'Citizens file an FIR digitally from anywhere — selecting crime category, BNS legal sections, police station, and uploading evidence securely.',
    color: '#3B82F6',
    accent: 'rgba(59,130,246,0.15)',
    steps: ['Select Crime Category', 'Choose BNS Section', 'Upload Evidence', 'Select Police Station', 'Submit FIR'],
  },
  {
    id: 2,
    phase: 'AI ANALYSIS',
    duration: 6000,
    icon: '🤖',
    title: 'AI Analysis Engine',
    subtitle: 'STEP 2 — INTELLIGENT CASE PROCESSING',
    description: 'CrimePilot AI scans the FIR, detects crime patterns, finds similar historical cases, and generates a priority score for immediate action.',
    color: '#8B5CF6',
    accent: 'rgba(139,92,246,0.15)',
    metrics: [
      { label: 'Pattern Match', val: '94%' },
      { label: 'Priority Score', val: 'HIGH' },
      { label: 'Similar Cases', val: '3 Found' },
      { label: 'AI Confidence', val: '97.2%' },
    ],
  },
  {
    id: 3,
    phase: 'OFFICER ASSIGNMENT',
    duration: 5500,
    icon: '👮',
    title: 'Officer Assignment',
    subtitle: 'STEP 3 — FIELD DEPLOYMENT',
    description: 'The system auto-assigns the nearest available officer, sends instant SMTP notifications, and updates the case dashboard in real time.',
    color: '#F59E0B',
    accent: 'rgba(245,158,11,0.15)',
    steps: ['Officer Notified via Email', 'Case Added to Dashboard', 'Investigation Begins', 'Evidence Logged'],
  },
  {
    id: 4,
    phase: 'CASE RESOLUTION',
    duration: 5500,
    icon: '✅',
    title: 'Case Resolution',
    subtitle: 'STEP 4 — JUSTICE DELIVERED',
    description: 'The officer updates case status through every stage. Citizens receive real-time email updates. Resolved cases feed the AI for smarter future predictions.',
    color: '#10B981',
    accent: 'rgba(16,185,129,0.15)',
    stages: ['Reported', 'Assigned', 'Under Investigation', 'Evidence Collected', 'Solved'],
  },
  {
    id: 5,
    phase: 'GET STARTED',
    duration: 999999,
    icon: '🚀',
    title: 'Ready to Begin?',
    subtitle: 'JOIN INDIA\'S DIGITAL SAFETY NETWORK',
    description: 'Register as a citizen to file your first FIR, or login to access your portal.',
    color: '#00D9FF',
    accent: 'rgba(0,217,255,0.15)',
    cta: true,
  },
];

/* ─── ANIMATED CANVAS PARTICLES ─────────────────────────────────────────── */
const ParticleCanvas = ({ color }) => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.5 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0 || d.x > canvas.width)  d.dx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.dy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(d.o * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [color]);

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
};

/* ─── TYPEWRITER TEXT ────────────────────────────────────────────────────── */
const Typewriter = ({ text, speed = 28, color = '#E2E8F0' }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return <span style={{ color, lineHeight: 1.6 }}>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0 }}>|</span></span>;
};

/* ─── STEP LIST WITH STAGGER ─────────────────────────────────────────────── */
const StepList = ({ items, color }) => {
  const [visible, setVisible] = useState([]);
  useEffect(() => {
    setVisible([]);
    items.forEach((_, i) => {
      setTimeout(() => setVisible(v => [...v, i]), 400 + i * 400);
    });
  }, [items]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          opacity: visible.includes(i) ? 1 : 0,
          transform: visible.includes(i) ? 'translateX(0)' : 'translateX(-30px)',
          transition: 'all 0.5s ease',
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: color, color: '#0B1220',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '900', flexShrink: 0,
          }}>{i + 1}</div>
          <span style={{ color: '#E2E8F0', fontSize: '15px', fontWeight: '600' }}>{item}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── METRICS GRID ───────────────────────────────────────────────────────── */
const MetricsGrid = ({ metrics, color }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 500); }, []);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${color}44`,
          borderRadius: '12px', padding: '16px',
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1)' : 'scale(0.85)',
          transition: `all 0.5s ease ${i * 150}ms`,
        }}>
          <div style={{ fontSize: '22px', fontWeight: '900', color, fontFamily: 'monospace' }}>{m.val}</div>
          <div style={{ fontSize: '11px', color: '#9AA4B2', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
        </div>
      ))}
    </div>
  );
};

/* ─── CASE PROGRESS BAR ──────────────────────────────────────────────────── */
const CaseProgress = ({ stages, color }) => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setActive(i);
      if (i >= stages.length - 1) clearInterval(iv);
    }, 700);
    return () => clearInterval(iv);
  }, [stages]);
  return (
    <div style={{ marginTop: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
        {stages.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: i <= active ? color : 'rgba(255,255,255,0.08)',
                border: `2px solid ${i <= active ? color : 'rgba(255,255,255,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.4s ease',
                boxShadow: i <= active ? `0 0 14px ${color}88` : 'none',
                fontSize: '14px', zIndex: 1,
              }}>
                {i <= active ? '✓' : <span style={{ color: '#9AA4B2', fontSize: '11px' }}>{i + 1}</span>}
              </div>
              <div style={{
                fontSize: '9px', color: i <= active ? color : '#9AA4B2',
                marginTop: '6px', textAlign: 'center', fontWeight: i <= active ? '700' : '400',
                transition: 'color 0.4s ease', maxWidth: '70px',
              }}>{s}</div>
            </div>
            {i < stages.length - 1 && (
              <div style={{
                height: '2px', flex: 1, marginBottom: '18px',
                background: i < active ? color : 'rgba(255,255,255,0.1)',
                transition: 'background 0.4s ease',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function OverviewAnimation() {
  const navigate = useNavigate();
  const [slideIdx, setSlideIdx] = useState(0);
  const [fadeIn, setFadeIn]     = useState(true);
  const [elapsed, setElapsed]   = useState(0);
  const timerRef  = useRef(null);
  const elapsedRef = useRef(null);

  const slide = SLIDES[slideIdx];
  const isLast = slideIdx === SLIDES.length - 1;

  /* Auto-advance slides */
  useEffect(() => {
    if (isLast) return;
    setElapsed(0);

    elapsedRef.current = setInterval(() => {
      setElapsed(e => e + 50);
    }, 50);

    timerRef.current = setTimeout(() => {
      goNext();
    }, slide.duration);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(elapsedRef.current);
    };
  }, [slideIdx]);

  const goNext = () => {
    if (slideIdx >= SLIDES.length - 1) return;
    setFadeIn(false);
    setTimeout(() => {
      setSlideIdx(i => i + 1);
      setFadeIn(true);
      setElapsed(0);
    }, 350);
  };

  const goTo = (i) => {
    clearTimeout(timerRef.current);
    clearInterval(elapsedRef.current);
    setFadeIn(false);
    setTimeout(() => { setSlideIdx(i); setFadeIn(true); setElapsed(0); }, 350);
  };

  const skip = () => navigate('/citizen/login');

  const progress = isLast ? 100 : Math.min((elapsed / slide.duration) * 100, 100);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#060D1A',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Particle background */}
      <ParticleCanvas color={slide.color} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${slide.accent}, transparent 70%)`,
        transition: 'background 0.8s ease',
        pointerEvents: 'none',
      }} />

      {/* ── TOP BAR ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🛡️</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              CRIMEPILOT <span style={{ color: slide.color, transition: 'color 0.5s' }}>AI</span>
            </div>
            <div style={{ fontSize: '8px', color: '#9AA4B2', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Platform Overview
            </div>
          </div>
        </div>

        {/* Phase badge */}
        <div style={{
          padding: '5px 14px', borderRadius: '20px',
          background: slide.accent, border: `1px solid ${slide.color}55`,
          fontSize: '10px', fontWeight: '800', color: slide.color,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          transition: 'all 0.5s',
        }}>{slide.phase}</div>

        {/* Skip */}
        <button onClick={skip} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#9AA4B2', padding: '6px 16px', borderRadius: '20px',
          fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.target.style.color = '#FFFFFF'}
          onMouseLeave={e => e.target.style.color = '#9AA4B2'}
        >Skip ✕</button>
      </div>

      {/* ── SLIDE PROGRESS BAR ── */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', position: 'relative', zIndex: 10 }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: `linear-gradient(90deg, ${slide.color}, ${slide.color}88)`,
          transition: 'width 0.05s linear, background 0.5s',
          boxShadow: `0 0 8px ${slide.color}`,
        }} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 5, padding: '20px 40px',
        opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}>
        <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>

          {/* Icon */}
          <div style={{
            fontSize: '72px', marginBottom: '20px',
            filter: `drop-shadow(0 0 20px ${slide.color}88)`,
            animation: 'floatIcon 3s ease-in-out infinite',
          }}>{slide.icon}</div>

          {/* Subtitle */}
          <div style={{
            fontSize: '10px', color: slide.color, fontWeight: '800',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            marginBottom: '12px', transition: 'color 0.5s',
          }}>{slide.subtitle}</div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900',
            color: '#FFFFFF', margin: '0 0 20px 0', letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>{slide.title}</h1>

          {/* Description — typewriter */}
          <p style={{
            fontSize: '16px', lineHeight: 1.7, margin: '0 auto 24px auto',
            maxWidth: '580px', color: '#9AA4B2',
          }}>
            <Typewriter key={slide.id} text={slide.description} speed={22} />
          </p>

          {/* Slide-specific widgets */}
          {slide.steps && <StepList items={slide.steps} color={slide.color} />}
          {slide.metrics && <MetricsGrid metrics={slide.metrics} color={slide.color} />}
          {slide.stages && <CaseProgress stages={slide.stages} color={slide.color} />}

          {/* CTA slide */}
          {slide.cta && (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/citizen/register')}
                style={{
                  padding: '14px 36px',
                  background: `linear-gradient(135deg, ${slide.color}, #00A8CC)`,
                  color: '#060D1A', border: 'none', borderRadius: '50px',
                  fontWeight: '900', fontSize: '15px', cursor: 'pointer',
                  boxShadow: `0 0 30px ${slide.color}66`,
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                🚀 Register as Citizen
              </button>
              <button
                onClick={() => navigate('/citizen/login')}
                style={{
                  padding: '14px 36px',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50px', fontWeight: '700', fontSize: '15px',
                  cursor: 'pointer', transition: 'all 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                🔐 Citizen Login
              </button>
            </div>
          )}

          {/* Next button (non-last slides) */}
          {!isLast && (
            <button onClick={goNext} style={{
              marginTop: '32px',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${slide.color}44`,
              color: slide.color, padding: '10px 28px',
              borderRadius: '50px', fontSize: '13px',
              fontWeight: '700', cursor: 'pointer',
              transition: 'all 0.25s', letterSpacing: '0.04em',
            }}
              onMouseEnter={e => e.currentTarget.style.background = slide.accent}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* ── BOTTOM DOT NAV ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: '10px',
        padding: '16px 32px 24px',
      }}>
        {SLIDES.map((s, i) => (
          <button key={i} onClick={() => goTo(i)} title={s.phase} style={{
            width: i === slideIdx ? '28px' : '8px',
            height: '8px',
            borderRadius: '4px',
            background: i === slideIdx ? slide.color : 'rgba(255,255,255,0.2)',
            border: 'none', cursor: 'pointer',
            transition: 'all 0.35s ease',
            boxShadow: i === slideIdx ? `0 0 10px ${slide.color}` : 'none',
            padding: 0,
          }} />
        ))}
        <span style={{ color: '#9AA4B2', fontSize: '11px', marginLeft: '8px' }}>
          {slideIdx + 1} / {SLIDES.length}
        </span>
      </div>

      <style>{`
        @keyframes floatIcon {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
