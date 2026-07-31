import React from 'react';

// 10 Investigation Stages
export const INVESTIGATION_STAGES = [
  'FIR Submitted',
  'FIR Verified',
  'Police Station Assigned',
  'Investigating Officer Assigned',
  'Investigation In Progress',
  'Evidence Collection',
  'Evidence Review',
  'Charge Sheet Filed',
  'Sent to Court',
  'Case Closed'
];

// Helper to determine active stage index (0 to 9)
export const getStageIndex = (statusStr) => {
  if (!statusStr) return 0;
  const s = statusStr.trim().toLowerCase();
  
  if (s === 'reported' || s === 'fir submitted' || s === 'submitted') return 0;
  if (s === 'verified' || s === 'fir verified') return 1;
  if (s === 'police station assigned' || s === 'station assigned') return 2;
  if (s === 'assigned' || s === 'investigating officer assigned' || s === 'officer assigned') return 3;
  if (s === 'under investigation' || s === 'investigation in progress' || s === 'investigation') return 4;
  if (s === 'evidence collected' || s === 'evidence collection') return 5;
  if (s === 'evidence review' || s === 'evidence under review') return 6;
  if (s === 'charge sheet filed' || s === 'chargesheet filed' || s === 'charge sheet') return 7;
  if (s === 'sent to court' || s === 'court') return 8;
  if (s === 'solved' || s === 'closed' || s === 'case closed') return 9;

  // Fallback match
  const idx = INVESTIGATION_STAGES.findIndex(stage => stage.toLowerCase() === s);
  return idx >= 0 ? idx : 0;
};

// Expected Next Step Calculator based on current stage
export const getExpectedNextStep = (stageIndex, crime) => {
  const officerName = crime?.officer?.user?.name || crime?.officer?.name || 'Assigned Officer';

  switch (stageIndex) {
    case 0:
      return {
        action: 'FIR Document Verification',
        responsible: 'Duty Inspector / Desk Officer',
        estimate: 'Within 2–4 hours'
      };
    case 1:
      return {
        action: 'Assignment to Local Police Station',
        responsible: 'Jurisdiction Superintendent',
        estimate: 'Within 6–12 hours'
      };
    case 2:
      return {
        action: 'Investigating Officer (IO) Allocation',
        responsible: crime?.location?.police_station || 'Station House Officer (SHO)',
        estimate: 'Within 24 hours'
      };
    case 3:
      return {
        action: 'Initial Site Inspection & Statements Recording',
        responsible: officerName,
        estimate: 'Within 1–2 working days'
      };
    case 4:
      return {
        action: 'CCTV & Physical Evidence Collection',
        responsible: officerName,
        estimate: 'Within 2–3 working days'
      };
    case 5:
      return {
        action: 'Forensic & Evidence Verification',
        responsible: 'Crime Lab / ' + officerName,
        estimate: 'Within 3–5 working days'
      };
    case 6:
      return {
        action: 'Charge Sheet Drafting & Legal Review',
        responsible: officerName,
        estimate: 'Within 5–7 working days'
      };
    case 7:
      return {
        action: 'Submission to Judicial Magistrate',
        responsible: 'Prosecution Cell & ' + officerName,
        estimate: 'Within 3–5 working days'
      };
    case 8:
      return {
        action: 'Court Hearing & Closure Order',
        responsible: 'Judicial Magistrate Court',
        estimate: 'As per court schedule'
      };
    case 9:
      return {
        action: 'Case Successfully Resolved & Archived',
        responsible: 'System Administrator',
        estimate: 'Finalized'
      };
    default:
      return {
        action: 'Evidence Verification',
        responsible: officerName,
        estimate: 'Within 2–3 working days'
      };
  }
};

const CaseTrackerModal = ({ crime, onClose, onDownloadPDF }) => {
  if (!crime) return null;

  const currentStageIdx = getStageIndex(crime.status);
  const progressPercent = Math.round(((currentStageIdx + 1) / INVESTIGATION_STAGES.length) * 100);
  const nextStep = getExpectedNextStep(currentStageIdx, crime);

  // Generate clean timeline entries based on crime data
  const generateTimeline = () => {
    const regDate = crime.created_at ? new Date(crime.created_at) : new Date(crime.date);
    const formatDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const timeline = [];

    // Stage 1
    timeline.push({
      date: formatDate(regDate),
      time: formatTime(regDate),
      title: 'FIR Submitted',
      description: `Digital FIR ${crime.crime_id} successfully filed by citizen under category: ${crime.crime_category?.name || 'Complaint'}.`,
      status: 'completed'
    });

    // Stage 2
    if (currentStageIdx >= 1) {
      const d = new Date(regDate.getTime() + 15 * 60000);
      timeline.push({
        date: formatDate(d),
        time: formatTime(d),
        title: 'FIR Verified',
        description: 'Identity proofs and initial incident report verified by central dispatch.',
        status: 'completed'
      });
    }

    // Stage 3
    if (currentStageIdx >= 2) {
      const d = new Date(regDate.getTime() + 45 * 60000);
      timeline.push({
        date: formatDate(d),
        time: formatTime(d),
        title: `Assigned to ${crime.location?.police_station || 'Jurisdiction Police Station'}`,
        description: `Case dispatched to local station jurisdiction (${crime.location?.city || 'City'}, ${crime.location?.state || 'State'}).`,
        status: 'completed'
      });
    }

    // Stage 4
    if (currentStageIdx >= 3) {
      const d = new Date(regDate.getTime() + 120 * 60000);
      const officerName = crime.officer?.user?.name || crime.officer?.name || 'Inspector Raj Mehta';
      timeline.push({
        date: formatDate(d),
        time: formatTime(d),
        title: 'Assigned Investigating Officer',
        description: `Lead investigating officer assigned: ${officerName} (Badge No: ${crime.officer?.badge_no || 'POL-8942'}).`,
        status: 'completed'
      });
    }

    // Stage 5
    if (currentStageIdx >= 4) {
      const d = new Date(regDate.getTime() + 24 * 3600000);
      timeline.push({
        date: formatDate(d),
        time: '11:30 AM',
        title: 'Investigation In Progress',
        description: 'Official investigation initiated. On-site inspection and witness testimonies recorded.',
        status: 'completed'
      });
    }

    // Stage 6
    if (currentStageIdx >= 5) {
      const d = new Date(regDate.getTime() + 48 * 3600000);
      timeline.push({
        date: formatDate(d),
        time: '03:20 PM',
        title: 'Evidence Collection',
        description: 'CCTV footage, physical evidence, and digital logs collected by investigation unit.',
        status: 'completed'
      });
    }

    // Stage 7
    if (currentStageIdx >= 6) {
      const d = new Date(regDate.getTime() + 72 * 3600000);
      timeline.push({
        date: formatDate(d),
        time: '09:40 AM',
        title: 'Evidence Under Review',
        description: 'Forensic reports and collected evidence submitted to technical analysis team.',
        status: 'completed'
      });
    }

    // Stage 8
    if (currentStageIdx >= 7) {
      const d = new Date(regDate.getTime() + 96 * 3600000);
      timeline.push({
        date: formatDate(d),
        time: '02:15 PM',
        title: 'Charge Sheet Filed',
        description: 'Formal charge sheet compiled and submitted to prosecution cell.',
        status: 'completed'
      });
    }

    // Stage 9
    if (currentStageIdx >= 8) {
      const d = new Date(regDate.getTime() + 120 * 3600000);
      timeline.push({
        date: formatDate(d),
        time: '10:00 AM',
        title: 'Sent to Court',
        description: 'Case documents and legal sections transferred to Judicial Magistrate Court.',
        status: 'completed'
      });
    }

    // Stage 10
    if (currentStageIdx >= 9) {
      const d = new Date(regDate.getTime() + 144 * 3600000);
      timeline.push({
        date: formatDate(d),
        time: '04:30 PM',
        title: 'Case Closed',
        description: 'Final court verdict passed. Case status updated to Closed.',
        status: 'completed'
      });
    }

    return timeline;
  };

  const timelineEntries = generateTimeline();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0B1220',
        border: '1px solid #00D9FF',
        boxShadow: '0 0 30px rgba(0, 217, 255, 0.2)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '950px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f8fafc'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifySpace: 'between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, #0B1220 0%, #111827 100%)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#00D9FF',
                background: 'rgba(0, 217, 255, 0.1)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}>
                LIVE CASE TRACKER
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                FIR No: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{crime.crime_id}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginTop: '6px', fontFamily: 'Outfit, sans-serif' }}>
              {crime.crime_category?.name || 'Crime Report'} Investigation Progress
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => onDownloadPDF(crime)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(0, 217, 255, 0.15)',
                color: '#00D9FF',
                border: '1px solid #00D9FF',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📄 Download PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Progress Bar & Current Stage */}
          <div style={{
            background: '#111827',
            border: '1px solid #223248',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                  Current Investigation Stage
                </span>
                <h3 style={{ fontSize: '18px', color: '#00D9FF', fontWeight: '800', marginTop: '2px' }}>
                  {INVESTIGATION_STAGES[currentStageIdx]}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '28px', fontWeight: '900', color: '#00D9FF', fontFamily: 'monospace' }}>
                  {progressPercent}%
                </span>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Stage {currentStageIdx + 1} of 10</span>
              </div>
            </div>

            {/* Visual Bar */}
            <div style={{
              width: '100%',
              height: '10px',
              backgroundColor: '#0B1220',
              borderRadius: '999px',
              overflow: 'hidden',
              border: '1px solid #223248',
              position: 'relative'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3B82F6 0%, #00D9FF 100%)',
                boxShadow: '0 0 12px #00D9FF',
                borderRadius: '999px',
                transition: 'width 0.5s ease-in-out'
              }} />
            </div>
          </div>

          {/* 10-Stage Horizontal Visual Stepper */}
          <div style={{
            background: '#111827',
            border: '1px solid #223248',
            borderRadius: '16px',
            padding: '28px 20px',
            overflowX: 'auto'
          }}>
            <h4 style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px', fontWeight: 'bold' }}>
              10-Stage Investigation Workflow
            </h4>

            <div style={{ display: 'flex', minWidth: '800px', justifyContent: 'space-between', position: 'relative' }}>
              
              {/* Connector line */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '25px',
                right: '25px',
                height: '3px',
                backgroundColor: '#223248',
                zIndex: 1
              }} />

              {/* Active Connector line */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '25px',
                width: `${(currentStageIdx / (INVESTIGATION_STAGES.length - 1)) * 94}%`,
                height: '3px',
                backgroundColor: '#00D9FF',
                zIndex: 2,
                transition: 'width 0.4s ease'
              }} />

              {INVESTIGATION_STAGES.map((stageName, idx) => {
                const isCompleted = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                let circleBg = '#0B1220';
                let circleBorder = '#223248';
                let textColor = '#64748b';
                let circleContent = idx + 1;

                if (isCompleted) {
                  circleBg = '#22C55E';
                  circleBorder = '#22C55E';
                  textColor = '#22C55E';
                  circleContent = '✓';
                } else if (isCurrent) {
                  circleBg = '#00D9FF';
                  circleBorder = '#00D9FF';
                  textColor = '#00D9FF';
                }

                return (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 3,
                    width: '75px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: circleBg,
                      border: `2px solid ${circleBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCompleted ? '#0B1220' : (isCurrent ? '#0B1220' : '#64748b'),
                      fontWeight: 'bold',
                      fontSize: '12px',
                      boxShadow: isCurrent ? '0 0 16px #00D9FF' : (isCompleted ? '0 0 8px rgba(34, 197, 94, 0.4)' : 'none'),
                      transition: 'all 0.3s ease'
                    }}>
                      {circleContent}
                    </div>

                    <span style={{
                      fontSize: '10px',
                      color: isCurrent ? '#fff' : (isCompleted ? '#cbd5e1' : '#64748b'),
                      marginTop: '10px',
                      fontWeight: isCurrent ? '800' : (isCompleted ? '600' : '400'),
                      lineHeight: '1.3'
                    }}>
                      {stageName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expected Next Step & Current Case Intel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Expected Next Step Card */}
            <div style={{
              background: 'rgba(0, 217, 255, 0.04)',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>⚡</span>
                <span style={{ fontSize: '12px', color: '#00D9FF', fontWeight: '800', letterSpacing: '0.05em' }}>
                  NEXT EXPECTED ACTION
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 'bold' }}>{nextStep.action}</h4>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>👮 <strong>Responsible:</strong> {nextStep.responsible}</span>
                  <span>⏳ <strong>Estimated Update:</strong> {nextStep.estimate}</span>
                </div>
              </div>
            </div>

            {/* Current Case Details Overview */}
            <div style={{
              background: '#111827',
              border: '1px solid #223248',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>
                CASE SPECIFICATIONS
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                <div><strong>Station:</strong> {crime.location?.police_station || 'N/A'}</div>
                <div><strong>Officer:</strong> {crime.officer?.user?.name || crime.officer?.name || 'Assigned'}</div>
                <div><strong>Priority:</strong> {crime.priority}</div>
                <div><strong>Last Updated:</strong> {crime.updated_at ? crime.updated_at.substring(0, 10) : 'Today'}</div>
              </div>
            </div>

          </div>

          {/* Detailed Timeline */}
          <div style={{
            background: '#111827',
            border: '1px solid #223248',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: '800', marginBottom: '24px', fontFamily: 'Outfit, sans-serif' }}>
              📜 Case Investigation Activity Log
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '24px' }}>
              {/* Vertical timeline bar */}
              <div style={{
                position: 'absolute',
                left: '7px',
                top: '4px',
                bottom: '4px',
                width: '2px',
                backgroundColor: '#223248'
              }} />

              {timelineEntries.map((entry, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Circle dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#00D9FF',
                    border: '3px solid #0B1220',
                    boxShadow: '0 0 8px #00D9FF'
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                      {entry.title}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#00D9FF', fontFamily: 'monospace', fontWeight: '600' }}>
                      {entry.date} • {entry.time}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.5' }}>
                    {entry.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CaseTrackerModal;
