import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBalanceScale, FaFileAlt, FaFilePdf, FaFileImage, FaBrain, 
  FaCalendarAlt, FaShieldAlt, FaKey, FaListUl, FaGavel, FaCheckCircle, 
  FaArrowRight, FaArrowLeft, FaClock, FaSpinner
} from 'react-icons/fa';

const AILegalPrediction = () => {
  const [inputType, setInputType] = useState('text'); // 'text', 'pdf', 'image'
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  // Carousel state for similar judgments
  const [currentJudgmentIdx, setCurrentJudgmentIdx] = useState(0);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError(null);
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (inputType === 'text') {
      if (!description.trim()) {
        setError('Please enter a crime or complaint description.');
        setLoading(false);
        return;
      }
      formData.append('text', description);
    } else {
      if (!selectedFile) {
        setError(`Please select a ${inputType.toUpperCase()} file to upload.`);
        setLoading(false);
        return;
      }
      formData.append('file', selectedFile);
    }

    try {
      const response = await axiosInstance.post('/ai/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        setResult(response.data.prediction);
        setCurrentJudgmentIdx(0);
      } else {
        setError(response.data.message || 'Failed to generate legal prediction.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while contacting the legal AI prediction server.');
    } finally {
      setLoading(false);
    }
  };

  // UI Accent color based on user portal or default theme
  const accentColor = '#3B82F6'; // Cobalt Blue

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            backgroundColor: `${accentColor}1A`,
            border: `1px solid ${accentColor}33`,
            borderRadius: '12px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            fontSize: '20px'
          }}>
            <FaBalanceScale />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#fff' }}>AI Legal Case Prediction</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Fictional AI-assisted analysis under BNS 2023, BNSS 2023, and BSA 2023 procedures.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '24px', transition: 'all 0.3s' }}>
        
        {/* Input Panel */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          height: 'fit-content'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBrain style={{ color: accentColor }} /> Case Analysis Input
          </h2>

          {/* Tab Selector */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '4px', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <button
              onClick={() => { setInputType('text'); setSelectedFile(null); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: inputType === 'text' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: inputType === 'text' ? '#fff' : '#94a3b8',
                border: inputType === 'text' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FaFileAlt /> Manual Description
            </button>
            <button
              onClick={() => { setInputType('pdf'); setSelectedFile(null); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: inputType === 'pdf' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: inputType === 'pdf' ? '#fff' : '#94a3b8',
                border: inputType === 'pdf' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FaFilePdf /> Upload PDF
            </button>
            <button
              onClick={() => { setInputType('image'); setSelectedFile(null); }}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: inputType === 'image' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: inputType === 'image' ? '#fff' : '#94a3b8',
                border: inputType === 'image' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FaFileImage /> Upload Image (OCR)
            </button>
          </div>

          <form onSubmit={handlePredict}>
            {inputType === 'text' ? (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Provide full incident report details, complaint notes, or suspect statement:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: Complainant returned home to find front door lock broken. Valuables including a gold chain worth INR 80,000 and laptops stolen. Suspect broke in during the night..."
                  style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    color: '#fff',
                    padding: '12px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = accentColor}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Select file to extract text & run prediction models:
                </label>
                <div style={{
                  border: '2px dashed rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '32px 16px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(15, 23, 42, 0.2)',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    accept={inputType === 'pdf' ? '.pdf' : 'image/*'}
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ fontSize: '32px', color: accentColor, marginBottom: '12px' }}>
                    {inputType === 'pdf' ? <FaFilePdf /> : <FaFileImage />}
                  </div>
                  <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                    {selectedFile ? selectedFile.name : 'Click or Drag file to upload'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>
                    Maximum file size 5MB (Supported format: {inputType === 'pdf' ? 'PDF' : 'JPEG/PNG'})
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? 'rgba(59, 130, 246, 0.5)' : accentColor,
                color: '#fff',
                padding: '12px',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 12px ${accentColor}33`,
                transition: 'all 0.2s'
              }}
            >
              {loading ? (
                <>
                  <FaSpinner className="spin" /> Generating Prediction Models...
                </>
              ) : (
                <>
                  Run Legal Prediction Models <FaArrowRight />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                background: 'rgba(30, 41, 59, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaBalanceScale style={{ color: '#10B981' }} /> Predicted Legal Framework
                </h2>
                
                {/* Confidence Meter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <FaShieldAlt style={{ color: '#10B981', fontSize: '12px' }} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#10B981' }}>
                    Confidence Score: {Math.round(result.confidence_score * 100)}%
                  </span>
                </div>
              </div>

              {/* Categorized Provisions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                
                {/* BNS Section */}
                <div style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', gap: '8px', color: '#FF7A00', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <FaGavel /> Predicted BNS Section (Bhartiya Nyaya Sanhita)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                    {result.predicted_bns}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                    Under Indian BNS acts, this covers primary criminal codes matching the description.
                  </div>
                </div>

                {/* BNSS Procedure */}
                <div style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', gap: '8px', color: '#3B82F6', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <FaClock /> Applicable BNSS Procedure (Bhartiya Nagarik Suraksha)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                    {result.predicted_bnss}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                    Required procedural stages for registration, inquiry, and investigation of cognitive crimes.
                  </div>
                </div>

                {/* BSA Evidence */}
                <div style={{ background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', gap: '8px', color: '#10B981', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <FaCheckCircle /> BSA Evidence Rule (Bhartiya Sakshya Adhiniyam)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>
                    {result.predicted_bsa}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                    Evidence standards required to ensure admissability, hashes for electronic records, and statements.
                  </div>
                </div>

              </div>

              {/* Stat prediction fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Likely Sentence</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#F5A623' }}>{result.punishment}</div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Likely Outcome</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>{result.outcome}</div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Case Duration</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <FaCalendarAlt /> {result.duration_months} Months
                  </div>
                </div>
              </div>

              {/* Keywords Found */}
              {result.keywords && result.keywords.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaKey /> Matching Case Keywords
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.keywords.map(kw => (
                      <span key={kw} style={{ fontSize: '11px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Evidence Checklist */}
              {result.evidence_required && result.evidence_required.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaListUl /> Recommended Evidence List
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {result.evidence_required.map(ev => (
                      <div key={ev} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                        <FaCheckCircle style={{ color: '#10B981', flexShrink: 0 }} />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Judgments Carousel */}
              {result.similar_judgments && result.similar_judgments.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaGavel /> Similar Judgments retrieved (Vector Search)
                    </h4>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setCurrentJudgmentIdx(prev => (prev === 0 ? result.similar_judgments.length - 1 : prev - 1))}
                        style={{ padding: '4px 8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '4px', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        <FaArrowLeft />
                      </button>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                        {currentJudgmentIdx + 1}/{result.similar_judgments.length}
                      </span>
                      <button
                        onClick={() => setCurrentJudgmentIdx(prev => (prev === result.similar_judgments.length - 1 ? 0 : prev + 1))}
                        style={{ padding: '4px 8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '4px', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        <FaArrowRight />
                      </button>
                    </div>
                  </div>
                  
                  {/* Active Carousel Case */}
                  <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                        {result.similar_judgments[currentJudgmentIdx].case_id}
                      </span>
                      <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>
                        Cosine Match: {Math.round(result.similar_judgments[currentJudgmentIdx].similarity_score * 100)}%
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                      Court: {result.similar_judgments[currentJudgmentIdx].court} | Presiding: {result.similar_judgments[currentJudgmentIdx].judge}
                    </div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic', lineHeight: '1.4', marginBottom: '6px' }}>
                      "{result.similar_judgments[currentJudgmentIdx].judgment_summary}"
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', borderTop: '1px dashed rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
                      <strong>Decision:</strong> {result.similar_judgments[currentJudgmentIdx].decision}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Styles for rotating spinner animation */}
      <style>{`
        .spin {
          animation: rotation 1.5s infinite linear;
        }
        @keyframes rotation {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(359deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AILegalPrediction;
