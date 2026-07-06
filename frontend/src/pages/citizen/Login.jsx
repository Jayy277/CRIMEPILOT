import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const CitizenLogin = () => {
  const { user, login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'analyst') {
        navigate('/analyst/dashboard');
      } else {
        navigate('/officer/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else {
        setError('Unauthorized role. Please login through the officer portal.');
      }
    } else {
      setError(result.message || 'Invalid credentials');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#03050c',
      color: '#f8fafc',
      fontFamily: 'JetBrains Mono, monospace',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Grid */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle, rgba(77, 163, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.8,
        zIndex: 1
      }} />

      <div className="glass-card" style={{
        width: '420px',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid #223248',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        background: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', letterSpacing: '-0.03em', fontFamily: 'Outfit, sans-serif' }}>
            CrimePilot
          </h2>
          <span style={{ fontSize: '11px', color: '#4DA3FF', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>
            Citizen Portal Login
          </span>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '3px solid #ef4444',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#fca5a5',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: '#0B1220',
                border: '1px solid #223248',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '13px'
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                backgroundColor: '#0B1220',
                border: '1px solid #223248',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '13px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4DA3FF',
              color: '#0B1220',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            {loading ? 'Authorizing Dossier...' : 'Secure Authorization'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#94a3b8' }}>
          New to the platform?{' '}
          <Link to="/citizen/register" style={{ color: '#4DA3FF', textDecoration: 'none', fontWeight: 'bold' }}>
            Register Citizen Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;
