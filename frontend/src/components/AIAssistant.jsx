import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultResponses = {
  bike: {
    category: 'Theft / Larceny',
    riskLevel: 'MEDIUM RISK',
    riskColor: '#FFC107',
    confidence: '94%',
    sections: [
      { act: 'BNS Section 305', desc: 'Theft in a dwelling house or private boundary.' },
      { act: 'BNS Section 306', desc: 'Larceny of private property / vehicle breach.' }
    ],
    steps: [
      'Retrieve local CCTV footage from Satellite Road intersection.',
      'Check local used-bike online listings (OLX, Facebook Marketplace) in 5km radius.',
      'Interview security guards of neighbouring residential complexes.',
      'Deploy patrol units to check known local chop shops.'
    ],
    evidence: [
      'CCTV video clip showing suspect profile',
      'Chassis / Registration number of stolen vehicle',
      'Owner bill of purchase verification'
    ],
    suspectPattern: 'Opportunistic vehicle theft. Often operates in pairs between 10 PM - 2 AM using master keys.',
    station: 'Satellite Police Station (Sector 4)',
    patrol: 'Unit Alpha-03 (Bandra-Satellite route)',
    checklist: [
      { text: 'File FIR and log to CrimePilot ledger', done: true },
      { text: 'Broadcast vehicle details to border toll booths', done: false },
      { text: 'Inspect local security cameras feed', done: false }
    ]
  },
  cyber: {
    category: 'Cyber Crime / Financial Fraud',
    riskLevel: 'HIGH RISK',
    riskColor: '#00C2FF',
    confidence: '89%',
    sections: [
      { act: 'BNS Section 318', desc: 'Cheating by online impersonation.' },
      { act: 'IT Act Section 66D', desc: 'Punishment for cheating by personation using computer resource.' }
    ],
    steps: [
      'Draft formal transaction freeze request to recipient banking node.',
      'Extract IP address headers and DNS routes from victim screenshot log.',
      'Query target domain details against active phishing registrar list.',
      'Instruct victim to change all security codes and block credit cards.'
    ],
    evidence: [
      'Phishing URL address screenshot',
      'Recipient UPI transaction reference ID',
      'IP headers log file'
    ],
    suspectPattern: 'Coordinated phishing syndicate. Uses temporary domain registers and bulk SMS routers.',
    station: 'Cyber Crime Police Station (Ahmedabad Central)',
    patrol: 'Cyber Command Unit 1',
    checklist: [
      { text: 'Draft transaction freeze notice to bank', done: true },
      { text: 'Submit phishing URL to global DNS blacklist', done: false },
      { text: 'Log UPI handle to fraud registry database', done: false }
    ]
  },
  assault: {
    category: 'Armed Robbery / Assault',
    riskLevel: 'CRITICAL RISK',
    riskColor: '#FF4D6D',
    confidence: '96%',
    sections: [
      { act: 'BNS Section 309', desc: 'Robbery and punishment for robbery.' },
      { act: 'BNS Section 311', desc: 'Robbery with attempt to cause grievous hurt.' }
    ],
    steps: [
      'Lock down showroom and collect all security camera feeds.',
      'Deploy forensic experts to scan surfaces for latent fingerprints.',
      'Interview store manager and eye witnesses for suspect physical height/accent details.',
      'Broadcast vehicle description used by suspects to all highway control nodes.'
    ],
    evidence: [
      'Weapon cartridges / physical residue',
      'Showroom CCTV footage backup',
      'Fingerprint report from forensic unit'
    ],
    suspectPattern: 'Organized crime gang. Conducts recce beforehand, uses unregistered vehicles and hand weapons.',
    station: 'Ghatlodiya Police Station',
    patrol: 'Unit Beta-02 (Tactical Response Team)',
    checklist: [
      { text: 'Deploy immediate emergency response units', done: true },
      { text: 'Secure crime scene boundaries', done: true },
      { text: 'Log suspect sketch and physical details', done: false }
    ]
  }
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Tactical Investigation AI Online. Input case description to analyze penal sections, suspect patterns, evidence checklists, and optimization routes.',
      isSystem: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, analyzing]);

  const triggerAnalysis = (text) => {
    let key = 'bike';
    if (text.toLowerCase().includes('cyber') || text.toLowerCase().includes('phishing') || text.toLowerCase().includes('fraud')) {
      key = 'cyber';
    } else if (text.toLowerCase().includes('robbery') || text.toLowerCase().includes('assault') || text.toLowerCase().includes('stolen near satellite road') === false && (text.toLowerCase().includes('weapon') || text.toLowerCase().includes('gun') || text.toLowerCase().includes('showroom'))) {
      key = 'assault';
    }

    setAnalyzing(true);
    setActiveAnalysis(null);

    // Simulate cognitive thinking network stream
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ai',
          text: `Cognitive audit compiled successfully for: "${text.substring(0, 40)}...". I have classified the incident, resolved BNS sections, and mapped the threat intelligence parameters below.`,
          analysis: defaultResponses[key]
        }
      ]);
      setActiveAnalysis(defaultResponses[key]);
      setAnalyzing(false);
    }, 3500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || analyzing) return;

    const userText = inputText;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setInputText('');

    triggerAnalysis(userText);
  };

  const loadPreset = (presetText) => {
    if (analyzing) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: presetText }]);
    triggerAnalysis(presetText);
  };

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: '5fr 4fr',
        gap: '24px',
        height: 'calc(100vh - 120px)',
        alignItems: 'stretch',
        color: '#f8fafc'
      }}
      className="assistant-layout"
    >
      {/* Left Chat Window Column */}
      <div 
        className="cyber-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          background: 'rgba(11, 18, 32, 0.85)',
          border: '1px solid rgba(0, 194, 255, 0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Chat Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0, 194, 255, 0.15)', background: 'rgba(7, 10, 19, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: '800' }}>🤖 AI Investigation Agent</h3>
            <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>MODEL: CrimePilot-Cognitive-v2</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00E676', boxShadow: '0 0 8px #00E676' }} />
            <span style={{ fontSize: '10px', color: '#00C2FF', fontWeight: 'bold' }}>COGNITIVE INTERFACE</span>
          </div>
        </div>

        {/* Message logs area */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div 
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    backgroundColor: msg.sender === 'user' ? '#00C2FF1A' : 'rgba(18, 26, 43, 0.75)',
                    border: msg.sender === 'user' ? '1px solid rgba(0,194,255,0.25)' : '1px solid rgba(255,255,255,0.03)',
                    color: msg.sender === 'user' ? '#00f0ff' : '#cbd5e1',
                    fontFamily: msg.isSystem ? 'JetBrains Mono, monospace' : 'inherit'
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {/* Thinking / Loader state */}
            {analyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
              >
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(18, 26, 43, 0.75)',
                  border: '1px solid rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div className="dot-bounce" style={{ width: '6px', height: '6px', backgroundColor: '#00C2FF', borderRadius: '50%', animation: 'bounce-dot 1.2s infinite 0s' }} />
                  <div className="dot-bounce" style={{ width: '6px', height: '6px', backgroundColor: '#00C2FF', borderRadius: '50%', animation: 'bounce-dot 1.2s infinite 0.2s' }} />
                  <div className="dot-bounce" style={{ width: '6px', height: '6px', backgroundColor: '#00C2FF', borderRadius: '50%', animation: 'bounce-dot 1.2s infinite 0.4s' }} />
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginLeft: '6px' }}>Thinking... compiling threat nodes</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Preset starter buttons */}
        {messages.length === 1 && (
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>PRESET CASE TEMPLATES:</span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => loadPreset('A bike was stolen near Satellite Road at 11 PM.')} className="preset-btn">
                🚲 Vehicle Theft (Satellite)
              </button>
              <button onClick={() => loadPreset('Cheated of Rs 50,000 on a fake transaction phishing page.')} className="preset-btn">
                💳 Phishing & Cyber Fraud
              </button>
              <button onClick={() => loadPreset('Armed robbery at a local jewellery showroom by 3 suspects.')} className="preset-btn">
                🔫 Showroom Robbery
              </button>
            </div>
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid rgba(0, 194, 255, 0.15)', background: 'rgba(7, 10, 19, 0.3)', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Type case parameters (e.g. A bike was stolen at Satellite...)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={analyzing}
            style={{
              flex: 1,
              backgroundColor: '#0B1220',
              border: '1px solid rgba(0, 194, 255, 0.2)',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              color: '#fff',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00C2FF'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(0, 194, 255, 0.2)'}
          />
          <button
            type="submit"
            disabled={analyzing}
            style={{
              padding: '0 20px',
              backgroundColor: '#00C2FF',
              border: 'none',
              borderRadius: '8px',
              color: '#0B1220',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(0,194,255,0.2)'
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* Right Intelligence Output Briefing Column */}
      <AnimatePresence mode="wait">
        {activeAnalysis ? (
          <motion.div
            key={activeAnalysis.category}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(11, 18, 32, 0.85)',
              border: '1px solid rgba(0, 194, 255, 0.25)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
              overflowY: 'auto'
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>CLASSIFICATION</span>
                <h3 style={{ fontSize: '18px', color: '#fff', fontWeight: '800' }}>{activeAnalysis.category}</h3>
              </div>
              <span 
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: activeAnalysis.riskColor,
                  border: `1px solid ${activeAnalysis.riskColor}33`,
                  background: `${activeAnalysis.riskColor}11`,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}
              >
                {activeAnalysis.riskLevel}
              </span>
            </div>

            {/* Confidence & Station */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>AI CONFIDENCE</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#00E676' }}>{activeAnalysis.confidence}</span>
              </div>
              <div>
                <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>NEAREST COMMAND</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#00C2FF', display: 'block', marginTop: '4px' }}>
                  {activeAnalysis.station}
                </span>
              </div>
            </div>

            {/* Possible Legal Sections */}
            <div>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>BNS LEGAL APPLICABILITY</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeAnalysis.sections.map((sec, idx) => (
                  <div key={idx} style={{ padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#00C2FF' }}>{sec.act}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{sec.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Steps */}
            <div>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>SUGGESTED INVESTIGATION STEPS</span>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeAnalysis.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>

            {/* Suspect Pattern & Patrol */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>SUSPECT MO PATTERN</span>
                <span style={{ color: '#cbd5e1' }}>{activeAnalysis.suspectPattern}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '9px' }}>RECOMMENDED PATROL</span>
                <span style={{ color: '#00C2FF', fontWeight: 'bold' }}>{activeAnalysis.patrol}</span>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>INVESTIGATION CHECKLIST</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeAnalysis.checklist.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <input type="checkbox" checked={item.done} readOnly style={{ accentColor: '#00C2FF' }} />
                    <span style={{ color: item.done ? '#64748b' : '#cbd5e1', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Actions buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              <button className="btn btn-primary" style={{ padding: '8px', fontSize: '11px', background: 'linear-gradient(135deg, #00C2FF, #0284c7)', borderColor: '#00C2FF' }} onClick={() => alert('PDF report exported successfully!')}>
                Export PDF Brief
              </button>
              <button className="btn btn-secondary" style={{ padding: '8px', fontSize: '11px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }} onClick={() => alert('Dossier committed to system data structures!')}>
                Save Case
              </button>
            </div>

          </motion.div>
        ) : (
          <div 
            style={{
              background: 'rgba(11, 18, 32, 0.7)',
              border: '1px solid rgba(0, 194, 255, 0.15)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontStyle: 'italic',
              fontSize: '13px'
            }}
          >
            Awaiting parameters input... Click analyze to resolve docket files.
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .preset-btn {
          background-color: rgba(0,194,255,0.06);
          border: 1px solid rgba(0,194,255,0.15);
          color: #00f0ff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .preset-btn:hover {
          background-color: rgba(0,194,255,0.12);
          border-color: rgba(0,194,255,0.3);
          transform: translateY(-2px);
        }
        @keyframes bounce-dot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @media (max-width: 950px) {
          .assistant-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
