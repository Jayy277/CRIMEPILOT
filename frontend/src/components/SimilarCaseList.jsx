import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const SimilarCaseList = ({ sourceCaseId, role }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearchSimilar = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get(`/crimes/${sourceCaseId}/similar`);
      if (response.data && response.data.results) {
        setResults(response.data.results);
      }
      setSearched(true);
    } catch (err) {
      console.error('Error finding similar cases:', err);
      setError('Failed to query similar cases from the system.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          Similar / Related Cases Finder (Custom Feature C)
        </h3>
        
        <button
          onClick={handleSearchSimilar}
          disabled={loading}
          className="btn btn-primary"
          style={{ fontSize: '12px', padding: '8px 16px' }}
        >
          {loading ? 'Analyzing MO...' : 'Scan Database for Similarities'}
        </button>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '12px', color: '#fda4af', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '12px' }}>
          <div style={{
            border: '3px solid rgba(6, 182, 212, 0.1)',
            borderLeftColor: '#06b6d4',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Analyzing description keywords, timing proximity, and jurisdictions...</span>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontStyle: 'italic', fontSize: '14px' }}>
          No past cases matched the similarity criteria for this report.
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {results.map((match) => {
            const matchedCrime = match.crime;
            const caseId = matchedCrime._id || matchedCrime.id;
            const dateStr = matchedCrime.date ? new Date(matchedCrime.date).toLocaleDateString() : 'N/A';

            return (
              <div
                key={caseId}
                style={{
                  background: 'rgba(30, 41, 59, 0.2)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                {/* Match Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link
                      to={`/${role}/cases/${caseId}`}
                      style={{
                        fontSize: '15px',
                        fontWeight: '700',
                        color: '#22d3ee',
                        textDecoration: 'none',
                        fontFamily: 'Outfit, sans-serif'
                      }}
                    >
                      {matchedCrime.crimeId}
                    </Link>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>({dateStr})</span>
                  </div>

                  {/* Similarity Score Badge */}
                  <div style={{
                    backgroundColor: 'rgba(6,182,212,0.15)',
                    border: '1px solid rgba(6,182,212,0.3)',
                    color: '#22d3ee',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    Match Score: {match.similarityScore}
                  </div>
                </div>

                {/* Match Case Description */}
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                  {matchedCrime.description}
                </p>

                {/* Match Reasons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {match.similarityReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        color: '#cbd5e1',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SimilarCaseList;
