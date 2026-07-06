import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#070a13',
        color: '#94a3b8'
      }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            border: '4px solid rgba(255,255,255,0.1)',
            borderLeftColor: '#06b6d4',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <h3>Securing Connection...</h3>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    if (window.location.pathname.startsWith('/citizen')) {
      return <Navigate to="/citizen/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles to their respective landing dashboards
    if (user.role === 'officer') {
      return <Navigate to="/officer/dashboard" replace />;
    } else if (user.role === 'analyst') {
      return <Navigate to="/analyst/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'citizen') {
      return <Navigate to="/citizen/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
