import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

const glass = {
  background: 'rgba(10,18,35,0.85)',
  border: '1px solid rgba(0,217,255,0.22)',
  backdropFilter: 'blur(16px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,217,255,0.05)',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: '#9AA4B2',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '8px',
};

const inputStyle = {
  width: '100%',
  backgroundColor: 'rgba(11,18,32,0.95)',
  border: '1px solid rgba(0,217,255,0.25)',
  borderRadius: '10px',
  padding: '13px 16px',
  color: '#FFFFFF',
  fontSize: '14.5px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color .2s',
};

export default function CitizenForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notRegisteredError, setNotRegisteredError] = useState(false);
  const [emailServiceError, setEmailServiceError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Password rules validation
  const rules = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setNotRegisteredError(false);
    setEmailServiceError('');

    try {
      const res = await axiosInstance.post('/auth/citizen/forgot-password/send-otp/', { email: cleanEmail });
      if (res.data && res.data.success) {
        setSuccess(res.data.message || 'A verification code has been sent to your registered email address. Please enter the OTP to continue.');
        setStep(2);
        setResendTimer(60);
      } else {
        setError(res.data?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      const isNotReg = err.response?.status === 404 || err.response?.data?.not_registered;
      const isServiceErr = err.response?.status === 500 || err.response?.data?.email_service_error;

      if (isNotReg) {
        setNotRegisteredError(true);
      } else if (isServiceErr) {
        setEmailServiceError(err.response?.data?.message || 'We found your account, but the email service is currently unavailable. Please try again in a few minutes.');
      } else {
        setError(err.response?.data?.message || 'Unable to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axiosInstance.post('/auth/citizen/forgot-password/verify-otp/', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (res.data && res.data.success) {
        setSuccess('OTP verified successfully.');
        setStep(3);
      } else {
        setError(res.data?.message || 'Invalid OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!rules.length || !rules.upper || !rules.lower || !rules.number || !rules.special) {
      setError('Password must meet all complexity requirements.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axiosInstance.post('/auth/citizen/forgot-password/reset-password/', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });

      if (res.data && res.data.success) {
        setSuccess('Password changed successfully. Redirecting to login...');
        setTimeout(() => {
          navigate('/citizen/login');
        }, 2000);
      } else {
        setError(res.data?.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#060D1A',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(0, 217, 255, 0.12) 0%, rgba(0,0,0,0) 70%)',
        top: '10%', left: '30%', pointerEvents: 'none',
      }} />

      <div style={{ ...glass, width: '100%', maxWidth: '440px', padding: '36px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.01em' }}>
              CRIMEPILOT <span style={{ color: '#00D9FF' }}>AI</span>
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0', color: '#FFFFFF' }}>
            Reset Citizen Password
          </h2>
          <p style={{ fontSize: '12px', color: '#9AA4B2', margin: 0 }}>
            {step === 1 && 'Enter your registered email address to receive a secure OTP'}
            {step === 2 && 'Enter the 6-digit verification code sent to your email'}
            {step === 3 && 'Create a new secure password for your account'}
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: step >= s ? '#00D9FF' : 'rgba(255,255,255,0.1)',
                color: step >= s ? '#060D1A' : '#9AA4B2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '800',
              }}>
                {s}
              </div>
              {s < 3 && (
                <div style={{
                  width: '30px', height: '2px',
                  backgroundColor: step > s ? '#00D9FF' : 'rgba(255,255,255,0.1)',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Not Registered Card (Red) */}
        {notRegisteredError ? (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)'
          }}>
            <div style={{ fontSize: '17px', fontWeight: '900', color: '#EF4444', marginBottom: '8px' }}>
              Email Not Registered
            </div>
            <div style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: '1.6', marginBottom: '16px' }}>
              No CrimePilot Citizen account was found with this email address.
              <br />
              Please check your email or create a new Citizen account.
            </div>
            <button
              type="button"
              onClick={() => navigate('/citizen/register')}
              style={{
                padding: '11px 24px',
                background: 'linear-gradient(90deg, #00B8D9, #00D9FF)',
                color: '#060D1A',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 217, 255, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              Go to Citizen Registration
            </button>
          </div>
        ) : null}

        {/* Email Service Unavailable (Orange Alert) */}
        {emailServiceError && !notRegisteredError ? (
          <div style={{
            background: 'rgba(249, 115, 22, 0.12)',
            borderLeft: '4px solid #F97316',
            padding: '14px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#F97316',
            marginBottom: '20px',
            fontWeight: '600',
            boxShadow: '0 2px 12px rgba(249, 115, 22, 0.15)',
          }}>
            <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px', color: '#F97316' }}>
              Unable to Send OTP
            </div>
            <div>{emailServiceError}</div>
          </div>
        ) : null}

        {/* Green Success Alert */}
        {success && !notRegisteredError && !emailServiceError ? (
          <div style={{
            background: 'rgba(34, 197, 94, 0.12)',
            borderLeft: '4px solid #22C55E',
            padding: '14px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#22C55E',
            marginBottom: '20px',
            fontWeight: '600',
            boxShadow: '0 2px 12px rgba(34, 197, 94, 0.15)',
          }}>
            <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px', color: '#22C55E' }}>
              OTP Sent Successfully
            </div>
            <div>{success}</div>
          </div>
        ) : null}

        {/* Red General Error Alert */}
        {error && !notRegisteredError && !emailServiceError ? (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderLeft: '4px solid #EF4444',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#FCA5A5',
            marginBottom: '20px',
            fontWeight: '600',
          }}>
            {error}
          </div>
        ) : null}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>REGISTERED EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px',
                background: 'linear-gradient(90deg, #00B8D9, #00D9FF)',
                color: '#060D1A',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(0, 217, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid #060D1A',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 1s linear infinite',
                  }} />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>ENTER 6-DIGIT OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.4em', fontSize: '20px', fontWeight: '800' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px',
                background: 'linear-gradient(90deg, #00B8D9, #00D9FF)',
                color: '#060D1A',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(0, 217, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid #060D1A',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 1s linear infinite',
                  }} />
                  Verifying OTP...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div style={{ textAlign: 'center', fontSize: '12px', color: '#9AA4B2' }}>
              Didn't receive code?{' '}
              {resendTimer > 0 ? (
                <span style={{ color: '#00D9FF' }}>Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  style={{ background: 'none', border: 'none', color: '#00D9FF', cursor: 'pointer', fontWeight: '700' }}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>NEW PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  style={{ ...inputStyle, paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#9AA4B2', cursor: 'pointer',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>CONFIRM NEW PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  style={{ ...inputStyle, paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#9AA4B2', cursor: 'pointer',
                  }}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Password Complexity Checklist */}
            <div style={{
              background: 'rgba(11, 18, 32, 0.6)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '11.5px',
            }}>
              <div style={{ fontWeight: '700', color: '#9AA4B2', marginBottom: '6px' }}>PASSWORD REQUIREMENTS:</div>
              {[
                { key: 'length', text: 'At least 8 characters' },
                { key: 'upper', text: 'One uppercase letter (A-Z)' },
                { key: 'lower', text: 'One lowercase letter (a-z)' },
                { key: 'number', text: 'One number (0-9)' },
                { key: 'special', text: 'One special character (!@#$%^&*)' },
              ].map((r) => (
                <div key={r.key} style={{
                  color: rules[r.key] ? '#22C55E' : '#9AA4B2',
                  display: 'flex', alignItems: 'center', gap: '6px', margin: '3px 0',
                }}>
                  <span>{rules[r.key] ? '✓' : '○'}</span>
                  <span>{r.text}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                padding: '14px',
                background: 'linear-gradient(90deg, #00B8D9, #00D9FF)',
                color: '#060D1A',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(0, 217, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid #060D1A',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 1s linear infinite',
                  }} />
                  Changing Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/citizen/login" style={{ color: '#00D9FF', fontSize: '13px', textDecoration: 'none', fontWeight: '700' }}>
            ← Back to Citizen Login
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
