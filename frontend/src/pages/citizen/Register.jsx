import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BackToHomeButton from '../../components/BackToHomeButton';

const ID_CONFIGS = {
  'Aadhaar Card': {
    label: 'Aadhaar Card',
    placeholder: '123456789012',
    helperText: 'Enter your 12-digit Aadhaar number',
    maxLength: 14,
    errorMessage: 'Aadhaar number must contain exactly 12 digits.',
    validate: (val) => {
      const clean = val.replace(/[\s-]/g, '');
      return /^\d{12}$/.test(clean);
    },
    formatInput: (val) => {
      const digits = val.replace(/\D/g, '').slice(0, 12);
      return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }
  },
  'Driving License': {
    label: 'Driving License',
    placeholder: 'GJ01 20230012345',
    helperText: 'Example: GJ01 20230012345',
    maxLength: 18,
    errorMessage: 'Please enter a valid Driving Licence number.',
    validate: (val) => {
      const clean = val.toUpperCase().replace(/[\s-]/g, '');
      return /^[A-Z]{2}\d{2}[A-Z0-9]{7,11}$/.test(clean);
    },
    formatInput: (val) => val.toUpperCase()
  },
  'Passport': {
    label: 'Passport',
    placeholder: 'A1234567',
    helperText: 'Example: A1234567',
    maxLength: 8,
    errorMessage: 'Passport number must contain 1 letter followed by 7 digits.',
    validate: (val) => {
      const clean = val.toUpperCase().replace(/\s/g, '');
      return /^[A-Z]\d{7}$/.test(clean);
    },
    formatInput: (val) => val.toUpperCase().replace(/\s/g, '').slice(0, 8)
  },
  'Voter ID': {
    label: 'Voter ID',
    placeholder: 'ABC1234567',
    helperText: 'Example: ABC1234567',
    maxLength: 10,
    errorMessage: 'Please enter a valid Voter ID / EPIC number.',
    validate: (val) => {
      const clean = val.toUpperCase().replace(/\s/g, '');
      return /^[A-Z]{3}\d{7}$/.test(clean);
    },
    formatInput: (val) => val.toUpperCase().replace(/\s/g, '').slice(0, 10)
  }
};
const GUJARAT_CITIES = [
  "Ahmedabad", "Amreli", "Anand", "Bharuch", "Bhavnagar", 
  "Bhuj", "Botad", "Dahod", "Deesa", "Gandhinagar", 
  "Godhra", "Gondal", "Jamnagar", "Jetpur", "Junagadh", 
  "Kalol", "Mehsana", "Morbi", "Nadiad", "Navsari", 
  "Palanpur", "Patan", "Porbandar", "Rajkot", "Surat", 
  "Surendranagar", "Vadodara", "Valsad", "Vapi", "Veraval"
];

const CitizenRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState(null);
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Gujarat');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [identityType, setIdentityType] = useState('Aadhaar Card');
  const [identityNumber, setIdentityNumber] = useState('');
  const [idFile, setIdFile] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [identityTypeError, setIdentityTypeError] = useState('');
  const [identityTouch, setIdentityTouch] = useState(false);
  const idInputRef = useRef(null);

  const [mobileError, setMobileError] = useState('');
  const [mobileTouch, setMobileTouch] = useState(false);
  const mobileInputRef = useRef(null);

  // Email OTP Verification States (Strict requirement 14)
  const [alreadyRegisteredError, setAlreadyRegisteredError] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTPSection, setShowOTPSection] = useState(false);

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const triggerToast = (msg, type = 'error') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' });
    }, 7000);
  };

  const otpInputsRef = useRef([]);

  // Reset form fields on mount
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMobile('');
    setDob(null);
    setGender('Male');
    setAddress('');
    setState('Gujarat');
    setCity('');
    setPincode('');
    setIdentityType('Aadhaar Card');
    setIdentityNumber('');
    setOtpDigits(['', '', '', '', '', '']);
    setAlreadyRegisteredError(false);
    setOtpSent(false);
    setOtpVerified(false);
    setShowOTPSection(false);
  }, []);

  // Auto focus first box when OTP section opens
  useEffect(() => {
    if ((showOTPSection || otpSent) && !otpVerified && otpInputsRef.current[0]) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [showOTPSection, otpSent, otpVerified]);

  // Countdown Timer for Resend OTP (Requirement 6)
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendEmailOTP = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setOtpError('Please enter a valid email address.');
      return;
    }

    setSendingOtp(true);
    setOtpError('');
    setOtpSuccess('Sending...');

    console.log('[Frontend OTP] Sending POST /api/auth/send-email-otp request for email:', cleanEmail);

    try {
      const payload = {
        email: cleanEmail,
        identityType,
        identityNumber: identityNumber.replace(/[\s-]/g, '')
      };
      const res = await axiosInstance.post('/auth/send-email-otp', payload);
      console.log('[Frontend OTP] Received response from send-email-otp:', res.data);
      
      // Automatically render OTP verification component on success (Requirement 1, 7, 15)
      if (res.data && (res.data.success === true || res.data.success === 'true')) {
        setOtpSent(true);
        setShowOTPSection(true);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpSuccess('OTP Sent Successfully');
        setResendTimer(60);
      } else {
        setOtpSuccess('');
        setOtpError(res.data?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error('[Frontend OTP] Error sending Email OTP:', err);
      setOtpSuccess('');
      const errData = err.response?.data;
      const isAadhaarDup = errData?.code === 'AADHAAR_ALREADY_EXISTS' || (err.response?.status === 409 && (errData?.message?.includes('Aadhaar') || errData?.message?.includes('already registered')));
      const isDup = errData?.already_registered || (err.response?.status === 409 && !isAadhaarDup) || errData?.message?.includes('Mobile Number');

      if (isAadhaarDup) {
        const aadhaarMsg = errData?.message || "This Aadhaar Card is already registered with CrimePilot.\nPlease log in using your existing account or contact support if you believe this is an error.";
        setIdentityTypeError(aadhaarMsg);
        triggerToast(aadhaarMsg, 'error');
        if (idInputRef.current) {
          idInputRef.current.focus();
          idInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (isDup) {
        setAlreadyRegisteredError(true);
        setError('An account with this Email Address or Mobile Number already exists. Please login to continue.');
      } else {
        const errorMsg = errData?.message || err.message || 'Failed to send OTP email.';
        setOtpError(errorMsg);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyEmailOTP = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    setOtpSuccess('Verifying...');

    try {
      const res = await axiosInstance.post('/auth/verify-email-otp', {
        email: email.trim(),
        otp: fullOtp,
      });

      if (res.data && (res.data.success === true || res.data.success === 'true')) {
        setOtpVerified(true);
        setOtpSuccess('Email Verified Successfully');
        setError('');
      } else {
        setOtpSuccess('');
        setOtpError(res.data?.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Error verifying Email OTP:', err);
      setOtpSuccess('');
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        if (serverMsg.toLowerCase().includes('expire')) {
          setOtpError('OTP has expired. Please resend a new code.');
        } else {
          setOtpError(serverMsg);
        }
      } else {
        setOtpError('Invalid OTP');
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    if (otpVerified) return;
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtpError('');

    // Auto focus next box if digit entered
    if (digit && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (otpVerified) return;
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && otpInputsRef.current[index - 1]) {
        otpInputsRef.current[index - 1].focus();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      verifyEmailOTP();
    }
  };

  const handleOtpPaste = (e) => {
    if (otpVerified) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      setOtpError('');
      const nextFocusIndex = Math.min(pastedData.length, 5);
      if (otpInputsRef.current[nextFocusIndex]) {
        otpInputsRef.current[nextFocusIndex].focus();
      }
    }
  };

  const handleMobileChange = (e) => {
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(cleanDigits);

    if (mobileTouch) {
      if (!cleanDigits) {
        setMobileError('Mobile number is compulsory.');
      } else if (cleanDigits.length < 10) {
        setMobileError('Mobile number must be compulsory 10 digits.');
      } else if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
        setMobileError('Mobile number must start with 6, 7, 8, or 9.');
      } else {
        setMobileError('');
      }
    }
  };

  const handleMobileBlur = () => {
    setMobileTouch(true);
    if (!mobile) {
      setMobileError('Mobile number is compulsory.');
    } else if (mobile.length < 10) {
      setMobileError('Mobile number must be compulsory 10 digits.');
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMobileError('Mobile number must start with 6, 7, 8, or 9.');
    } else {
      setMobileError('');
    }
  };

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleIdentityTypeChange = (e) => {
    const newType = e.target.value;
    setIdentityType(newType);
    setIdentityNumber('');
    setIdentityTypeError('');
    setIdentityTouch(false);
  };

  const handleIdentityNumberChange = (e) => {
    const rawVal = e.target.value;
    const config = ID_CONFIGS[identityType] || ID_CONFIGS['Aadhaar Card'];
    const formattedVal = config.formatInput ? config.formatInput(rawVal) : rawVal;
    
    setIdentityNumber(formattedVal);

    if (identityTouch) {
      if (formattedVal.trim() && !config.validate(formattedVal)) {
        setIdentityTypeError(config.errorMessage);
      } else {
        setIdentityTypeError('');
      }
    }
  };

  const handleIdentityBlur = () => {
    setIdentityTouch(true);
    const config = ID_CONFIGS[identityType] || ID_CONFIGS['Aadhaar Card'];
    if (identityNumber.trim() && !config.validate(identityNumber)) {
      setIdentityTypeError(config.errorMessage);
    } else {
      setIdentityTypeError('');
    }
  };

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

    if (!otpVerified) {
      setError('Please verify your email address using the Email OTP before submitting.');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!mobile || !phoneRegex.test(mobile)) {
      setMobileTouch(true);
      if (!mobile) {
        setMobileError('Mobile number is compulsory.');
        setError('Mobile number is compulsory.');
      } else if (mobile.length < 10) {
        setMobileError('Mobile number must be compulsory 10 digits.');
        setError('Mobile number must be compulsory 10 digits.');
      } else {
        setMobileError('Mobile number must start with 6, 7, 8, or 9.');
        setError('Mobile number must be 10 digits starting with 6, 7, 8, or 9.');
      }
      if (mobileInputRef.current) {
        mobileInputRef.current.focus();
        mobileInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const currentConfig = ID_CONFIGS[identityType] || ID_CONFIGS['Aadhaar Card'];
    if (!identityNumber || !currentConfig.validate(identityNumber)) {
      setIdentityTouch(true);
      setIdentityTypeError(currentConfig.errorMessage);
      if (idInputRef.current) {
        idInputRef.current.focus();
        idInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!idFile) {
      setError('Please upload your identity proof.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const normalizedIdentityNumber = identityNumber.replace(/[\s-]/g, '').toUpperCase();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('mobile', mobile);
    formData.append('dob', dob ? (dob instanceof Date ? dob.toISOString().split('T')[0] : dob) : '');
    formData.append('gender', gender);
    formData.append('address', address);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('pincode', pincode);
    formData.append('identityType', identityType);
    formData.append('identityNumber', normalizedIdentityNumber);
    formData.append('identityDocument', idFile);
    formData.append('idProof', idFile);

    try {
      const res = await axiosInstance.post('/auth/citizen/signup/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        if (res.data.token && res.data.user) {
          localStorage.setItem('crimepilot_token', res.data.token);
          localStorage.setItem('crimepilot_user', JSON.stringify(res.data.user));
          if (res.data.details) {
            localStorage.setItem('crimepilot_details', JSON.stringify(res.data.details));
          }
        }
        setTimeout(() => {
          navigate('/citizen/login');
        }, 2000);
      } else {
        setError(res.data.message || 'Registration failed.');
      }
    } catch (err) {
      const errData = err.response?.data;
      const isAadhaarDup = errData?.code === 'AADHAAR_ALREADY_EXISTS' || (err.response?.status === 409 && (errData?.message?.includes('Aadhaar') || errData?.field === 'identityNumber'));
      const serverMsg = errData?.message;

      if (isAadhaarDup) {
        const aadhaarMsg = serverMsg || "This Aadhaar Card is already registered with CrimePilot.\nPlease log in using your existing account or contact support if you believe this is an error.";
        setIdentityTypeError(aadhaarMsg);
        triggerToast(aadhaarMsg, 'error');
        if (idInputRef.current) {
          idInputRef.current.focus();
          idInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (errData?.field === 'identityNumber' && serverMsg) {
        setIdentityTypeError(serverMsg);
        triggerToast(serverMsg, 'error');
        if (idInputRef.current) {
          idInputRef.current.focus();
          idInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setError(serverMsg || 'Server error during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = ID_CONFIGS[identityType] || ID_CONFIGS['Aadhaar Card'];
  const isValidFormat = identityNumber.trim() && currentConfig.validate(identityNumber);
  const isOtpComplete = otpDigits.join('').length === 6;

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: "url('/assets/citizen_bg_clean.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      backgroundColor: '#0B1220',
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Toast / Snackbar Alert Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          backgroundColor: toast.type === 'error' ? 'rgba(127, 29, 29, 0.95)' : 'rgba(6, 95, 70, 0.95)',
          color: '#FFFFFF',
          border: `1.5px solid ${toast.type === 'error' ? '#EF4444' : '#10B981'}`,
          borderRadius: '12px',
          padding: '14px 20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          maxWidth: '460px',
          backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <span style={{ fontSize: '20px', lineHeight: '1.2' }}>⚠️</span>
          <div style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.4', whiteSpace: 'pre-line', flex: 1 }}>
            {toast.message}
          </div>
          <button
            onClick={() => setToast({ show: false, message: '', type: 'error' })}
            style={{ background: 'none', border: 'none', color: '#9AA4B2', cursor: 'pointer', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Background Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 18, 32, 0.15)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Glassmorphism Register Card */}
      <div className="glass-card" style={{
        width: '700px',
        maxWidth: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        border: '1px solid rgba(0, 217, 255, 0.15)',
        background: 'rgba(18, 27, 45, 0.82)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 35px rgba(0, 217, 255, 0.25), inset 0 0 15px rgba(0, 217, 255, 0.05)',
        zIndex: 2,
        position: 'relative',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box'
      }}>
        
        <div style={{
          padding: '40px',
          overflowY: 'auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
            <BackToHomeButton style={{ marginBottom: 0 }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '11px', color: '#9AA4B2', display: 'block', marginBottom: '4px' }}>Join CrimePilot AI Citizen Network</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, Outfit, sans-serif' }}>
              Create Citizen Account
            </h2>
          </div>

          {alreadyRegisteredError ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#EF4444', marginBottom: '8px' }}>
                Account Already Registered
              </div>
              <div style={{ fontSize: '13.5px', color: '#E2E8F0', lineHeight: '1.6', marginBottom: '16px' }}>
                An account with this Email Address or Mobile Number already exists.
                <br />
                Please login to continue.
              </div>
              <button
                type="button"
                onClick={() => navigate('/citizen/login')}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(90deg, #00B8D9, #00D9FF)',
                  color: '#060D1A',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 217, 255, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                Go to Login
              </button>
            </div>
          ) : error ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              borderLeft: '3.5px solid #EF4444',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#fca5a5',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          ) : null}

          {success && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.12)',
              borderLeft: '3.5px solid #22C55E',
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
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Full Name</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />
            </div>

            {/* Email Address Field */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={showOTPSection || otpSent || otpVerified}
                  required
                  placeholder="john@example.com"
                  style={{
                    flex: 1,
                    borderColor: otpVerified ? '#22C55E' : ((showOTPSection || otpSent) ? 'rgba(0, 217, 255, 0.3)' : undefined),
                    opacity: (showOTPSection || otpSent || otpVerified) ? 0.8 : 1
                  }}
                />
                
                {/* Send Email OTP Button (Strict Requirement 1: Immediately hide when OTP is sent) */}
                {!showOTPSection && !otpSent && !otpVerified && (
                  <button
                    type="button"
                    disabled={sendingOtp || !email.trim()}
                    onClick={sendEmailOTP}
                    className="btn"
                    style={{
                      padding: '10px 18px',
                      fontSize: '12px',
                      fontWeight: '800',
                      backgroundColor: (sendingOtp || !email.trim()) ? 'rgba(0, 217, 255, 0.05)' : 'rgba(0, 217, 255, 0.15)',
                      border: '1px solid rgba(0, 217, 255, 0.4)',
                      borderRadius: '8px',
                      color: '#00D9FF',
                      cursor: (sendingOtp || !email.trim()) ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    {sendingOtp ? 'Sending...' : 'Send Email OTP'}
                  </button>
                )}
              </div>
            </div>

            {/* Email Verification Section (Strict Requirement 2, 7, 8: Appears ONLY after send-email-otp API returns success) */}
            {(showOTPSection || otpSent) && (
              <div className="form-group" style={{
                gridColumn: 'span 2',
                background: '#121B2D',
                border: otpVerified ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(0, 217, 255, 0.25)',
                padding: '20px',
                borderRadius: '14px',
                boxShadow: otpVerified ? '0 0 20px rgba(34, 197, 94, 0.15)' : '0 0 20px rgba(0, 217, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ marginBottom: '14px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.02em' }}>
                    Email Verification
                  </h4>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9AA4B2' }}>
                    Enter the 6-digit verification code sent to your email.
                  </p>
                </div>

                {/* 6-Digit Separate OTP Input Boxes (Requirement 3) */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }} onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputsRef.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      disabled={otpVerified || verifyingOtp}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      style={{
                        width: '44px',
                        height: '50px',
                        backgroundColor: '#0B1220',
                        border: otpVerified
                          ? '1.5px solid #22C55E'
                          : (digit ? '1.5px solid #00D9FF' : '1px solid rgba(0, 217, 255, 0.25)'),
                        borderRadius: '10px',
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: '900',
                        fontFamily: 'monospace',
                        color: otpVerified ? '#22C55E' : '#FFFFFF',
                        boxShadow: digit ? '0 0 10px rgba(0, 217, 255, 0.25)' : 'none',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        opacity: (otpVerified || verifyingOtp) ? 0.7 : 1
                      }}
                    />
                  ))}
                </div>

                {/* Status Feedback Messages (Requirement 9, Error Handling) */}
                {otpError && (
                  <div style={{
                    color: '#EF4444',
                    fontSize: '11.5px',
                    marginBottom: '14px',
                    fontWeight: '700',
                    textAlign: 'center',
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    ⚠️ {otpError}
                  </div>
                )}

                {otpVerified && (
                  <div style={{
                    color: '#22C55E',
                    fontSize: '12px',
                    marginBottom: '14px',
                    fontWeight: '800',
                    textAlign: 'center',
                    background: 'rgba(34, 197, 94, 0.12)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    ✓ Email Verified Successfully
                  </div>
                )}

                {/* Buttons & Resend Countdown Timer (Requirement 4, 5, 6, 9) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Primary Verify Button / Verified Badge */}
                    {!otpVerified ? (
                      <button
                        type="button"
                        disabled={verifyingOtp || !isOtpComplete}
                        onClick={verifyEmailOTP}
                        className="btn"
                        style={{
                          flex: 1,
                          padding: '11px',
                          backgroundColor: (verifyingOtp || !isOtpComplete) ? 'rgba(0, 217, 255, 0.15)' : '#00D9FF',
                          color: (verifyingOtp || !isOtpComplete) ? '#00D9FF' : '#0B1220',
                          border: '1px solid rgba(0, 217, 255, 0.4)',
                          borderRadius: '8px',
                          fontWeight: '800',
                          fontSize: '12.5px',
                          cursor: (verifyingOtp || !isOtpComplete) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {verifyingOtp ? (
                          <>
                            <span className="spinner" style={{
                              width: '14px',
                              height: '14px',
                              border: '2px solid rgba(0, 217, 255, 0.3)',
                              borderTop: '2px solid #00D9FF',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite',
                              display: 'inline-block'
                            }} />
                            Verifying...
                          </>
                        ) : (
                          'Verify OTP'
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        style={{
                          flex: 1,
                          padding: '11px',
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          color: '#22C55E',
                          border: '1px solid rgba(34, 197, 94, 0.5)',
                          borderRadius: '8px',
                          fontWeight: '800',
                          fontSize: '12.5px',
                          cursor: 'default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        Verified ✓
                      </button>
                    )}

                    {/* Secondary Resend OTP Button */}
                    {!otpVerified && (
                      <button
                        type="button"
                        disabled={sendingOtp || resendTimer > 0}
                        onClick={sendEmailOTP}
                        className="btn"
                        style={{
                          padding: '11px 18px',
                          fontSize: '12px',
                          fontWeight: '800',
                          backgroundColor: resendTimer > 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 217, 255, 0.12)',
                          border: '1px solid rgba(0, 217, 255, 0.3)',
                          borderRadius: '8px',
                          color: resendTimer > 0 ? '#9AA4B2' : '#00D9FF',
                          cursor: (sendingOtp || resendTimer > 0) ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                        }}
                      >
                        {sendingOtp ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>

                  {/* Resend Timer Text */}
                  {!otpVerified && resendTimer > 0 && (
                    <div style={{ textAlign: 'center', fontSize: '11px', color: '#9AA4B2', fontWeight: '500' }}>
                      Resend available in <span style={{ color: '#00D9FF', fontWeight: 'bold' }}>{resendTimer}</span> seconds
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
                Mobile Number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                ref={mobileInputRef}
                type="tel"
                className="form-control"
                value={mobile}
                onChange={handleMobileChange}
                onBlur={handleMobileBlur}
                required
                maxLength={10}
                minLength={10}
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                placeholder="9876543210"
                style={{
                  borderColor: mobileError ? '#EF4444' : undefined,
                  boxShadow: mobileError ? '0 0 0 1px #EF4444' : undefined,
                }}
              />
              {mobileError ? (
                <div style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>
                  {mobileError}
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '10px', marginTop: '4px' }}>
                  Compulsory 10-digit mobile number ({mobile.length}/10)
                </div>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} className="form-control" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#00D9FF'}}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#9AA4B2'}}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirmPassword ? "text" : "password"} className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="••••••••" style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#00D9FF'}}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#9AA4B2'}}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Personal details */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Date of Birth</label>
              <div className="custom-datepicker-wrapper">
                <DatePicker
                  selected={dob}
                  onChange={(date) => setDob(date)}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="YYYY-MM-DD"
                  showYearDropdown
                  showMonthDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  dropdownMode="scroll"
                  minDate={new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDate())}
                  maxDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                  openToDate={new Date(new Date().getFullYear() - 18, 0, 1)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Gender</label>
              <select className="form-control" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Address</label>
              <textarea className="form-control" value={address} onChange={e => setAddress(e.target.value)} required placeholder="House No, Street, Landmark" style={{ minHeight: '60px' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>City</label>
              <select className="form-control" value={city} onChange={e => setCity(e.target.value)} required>
                <option value="" disabled>Select a city</option>
                {GUJARAT_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>State</label>
              <input type="text" className="form-control" value={state} readOnly disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Pincode</label>
              <input
                type="text"
                className="form-control"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                minLength={6}
                maxLength={6}
                pattern="\d{6}"
                placeholder="380015"
                title="Pincode must be exactly 6 digits"
              />
            </div>

            {/* Identity Proof */}
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Identity Type</label>
              <select className="form-control" value={identityType} onChange={handleIdentityTypeChange}>
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                  Identity Card Number
                </label>
                {isValidFormat && (
                  <span style={{ fontSize: '11px', color: '#22C55E', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ✓ Valid format
                  </span>
                )}
              </div>
              
              <input
                ref={idInputRef}
                type="text"
                className="form-control"
                value={identityNumber}
                onChange={handleIdentityNumberChange}
                onBlur={handleIdentityBlur}
                maxLength={currentConfig.maxLength}
                required
                placeholder={currentConfig.placeholder}
                style={{
                  borderColor: identityTypeError ? '#EF4444' : (isValidFormat ? '#22C55E' : undefined),
                  borderWidth: identityTypeError ? '2px' : '1px',
                  boxShadow: identityTypeError ? '0 0 12px rgba(239, 68, 68, 0.4)' : undefined
                }}
              />
              
              {identityTypeError ? (
                <span style={{ fontSize: '11px', color: '#f87171', display: 'block', marginTop: '6px', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                  ⚠️ {identityTypeError}
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                  {currentConfig.helperText}
                </span>
              )}
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#9AA4B2', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Upload Identity Document (Max 5MB, JPG/PNG/PDF)</label>
              <input type="file" onChange={handleFileChange} required accept=".jpg,.jpeg,.png,.pdf" style={{
                width: '100%',
                backgroundColor: '#0B1220',
                border: '1px solid rgba(0, 217, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                fontSize: '13px',
                boxSizing: 'border-box'
              }} />
            </div>

            {/* Create Citizen Account Submit Button (Requirement 10: Disabled until OTP verified) */}
            <button
              type="submit"
              disabled={loading || !otpVerified}
              className="btn btn-primary"
              style={{
                gridColumn: 'span 2',
                padding: '14px',
                backgroundColor: (loading || !otpVerified) ? 'rgba(0, 217, 255, 0.25)' : '#00D9FF',
                color: (loading || !otpVerified) ? '#9AA4B2' : '#0B1220',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '14px',
                cursor: (loading || !otpVerified) ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                transition: 'all 0.25s ease'
              }}
            >
              {loading ? 'Submitting Registration...' : 'Create Citizen Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9AA4B2' }}>
            Already have an account?{' '}
            <Link to="/citizen/login" style={{ color: '#00D9FF', textDecoration: 'none', fontWeight: 'bold' }}>
              Login Here
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .form-control {
          width: 100%;
          background-color: #0B1220;
          border: 1px solid rgba(0, 217, 255, 0.15);
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .form-control:focus {
          border-color: #00D9FF !important;
        }
        .glass-card:hover {
          box-shadow: 0 0 50px rgba(0, 217, 255, 0.4) !important;
          border-color: rgba(0, 217, 255, 0.3) !important;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(18, 27, 45, 0.5);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 217, 255, 0.3);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 217, 255, 0.6);
        }
      `}</style>
    </div>
  );
};

export default CitizenRegister;
