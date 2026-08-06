import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackToHomeButton = ({ style = {} }) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      title="Navigate to Home Page"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#00D9FF',
        backgroundColor: 'transparent',
        border: '1px solid #00D9FF',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.25s ease-in-out',
        outline: 'none',
        textDecoration: 'none',
        boxShadow: '0 0 10px rgba(0, 217, 255, 0.1)',
        marginBottom: '16px',
        userSelect: 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#00D9FF';
        e.currentTarget.style.color = '#FFFFFF';
        e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#00D9FF';
        e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 217, 255, 0.1)';
      }}
    >
      <span style={{ fontSize: '14px', lineHeight: 1 }}>←</span>
      <span>Back to Home</span>
    </button>
  );
};

export default BackToHomeButton;
