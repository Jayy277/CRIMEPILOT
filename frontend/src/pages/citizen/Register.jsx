import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const CitizenRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [identityType, setIdentityType] = useState('Aadhaar Card');
  const [identityNumber, setIdentityNumber] = useState('');
  const [idFile, setIdFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }
    setError('');
    setIdFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!idFile) {
      setError('Please upload your identity proof document.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('mobile', mobile);
    formData.append('dob', dob);
    formData.append('gender', gender);
    formData.append('address', address);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('pincode', pincode);
    formData.append('identityType', identityType);
    formData.append('identityNumber', identityNumber);
    formData.append('identityDocument', idFile);

    try {
      const res = await axios.post('/api/auth/citizen/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setSuccess('Registration successful! Redirecting to login page...');
        setTimeout(() => {
          navigate('/citizen/login');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Check inputs and document format.');
    } finally {
      setLoading(false);
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
      padding: '40px 20px',
      position: 'relative',
      overflowX: 'hidden'
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
        width: '640px',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid #223248',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 2,
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', letterSpacing: '-0.03em', fontFamily: 'Outfit, sans-serif' }}>
            CrimePilot
          </h2>
          <span style={{ fontSize: '11px', color: '#4DA3FF', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>
            Create Citizen Account
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

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            borderLeft: '3px solid #10b981',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#a7f3d0',
            marginBottom: '20px'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Credentials */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Full Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Email Address</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="john@example.com" />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Mobile Number</label>
            <input type="text" className="form-control" value={mobile} onChange={e => setMobile(e.target.value)} required placeholder="9876543210" />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Confirm Password</label>
            <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          {/* Personal details */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Date of Birth</label>
            <input type="date" className="form-control" value={dob} onChange={e => setDob(e.target.value)} required />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Gender</label>
            <select className="form-control" value={gender} onChange={e => setGender(e.target.value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Address */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Address</label>
            <textarea className="form-control" value={address} onChange={e => setAddress(e.target.value)} required placeholder="House No, Street, Landmark" style={{ minHeight: '60px' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>City</label>
            <input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} required placeholder="Ahmedabad" />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>State</label>
            <input type="text" className="form-control" value={state} onChange={e => setState(e.target.value)} required placeholder="Gujarat" />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Pincode</label>
            <input type="text" className="form-control" value={pincode} onChange={e => setPincode(e.target.value)} required placeholder="380015" />
          </div>

          {/* Identity Proof */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Identity Type</label>
            <select className="form-control" value={identityType} onChange={e => setIdentityType(e.target.value)}>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="Driving License">Driving License</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Identity Card Number</label>
            <input type="text" className="form-control" value={identityNumber} onChange={e => setIdentityNumber(e.target.value)} required placeholder="Card ID Number" />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Upload Identity Document (Max 5MB, JPG/PNG/PDF)</label>
            <input type="file" onChange={handleFileChange} required accept=".jpg,.jpeg,.png,.pdf" style={{
              width: '100%',
              backgroundColor: '#0B1220',
              border: '1px solid #223248',
              borderRadius: '8px',
              padding: '10px',
              color: '#fff',
              fontSize: '13px'
            }} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              gridColumn: 'span 2',
              padding: '14px',
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
            {loading ? 'Submitting Registration...' : 'Submit Credentials'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/citizen/login" style={{ color: '#4DA3FF', textDecoration: 'none', fontWeight: 'bold' }}>
            Login Here
          </Link>
        </div>
      </div>

      <style>{`
        .form-control {
          width: 100%;
          background-color: #0B1220;
          border: 1px solid #223248;
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-control:focus {
          border-color: #4DA3FF;
        }
      `}</style>
    </div>
  );
};

export default CitizenRegister;
