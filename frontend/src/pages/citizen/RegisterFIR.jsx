import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const RegisterFIR = () => {
  const [categories, setCategories] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  
  const [categoryName, setCategoryName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('Central');
  const [policeStation, setPoliceStation] = useState('');
  const [stationSearch, setStationSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [pincode, setPincode] = useState('');

  const [witnessInfo, setWitnessInfo] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let catData = [];
        try {
          const catRes = await axiosInstance.get('/admin/crime-categories');
          catData = catRes.data?.categories || (Array.isArray(catRes.data) ? catRes.data : []);
        } catch (e1) {
          const catRes = await axiosInstance.get('/crime-categories');
          catData = catRes.data?.categories || (Array.isArray(catRes.data) ? catRes.data : []);
        }
        
        setCategories(catData);
        if (catData.length > 0) {
          setCategoryName(catData[0].name);
        }
        
        let locData = [];
        try {
          const locRes = await axiosInstance.get('/admin/locations');
          locData = locRes.data?.locations || (Array.isArray(locRes.data) ? locRes.data : []);
        } catch (e2) {
          const locRes = await axiosInstance.get('/locations');
          locData = locRes.data?.locations || (Array.isArray(locRes.data) ? locRes.data : []);
        }

        setLocationsList(locData);
      } catch (err) {
        console.error('Error fetching categories/locations:', err);
      }
    };
    fetchData();
  }, []);

  const getMatchingStations = () => {
    const q = stationSearch.trim().toLowerCase();
    if (!q) return locationsList;
    return locationsList.filter(loc => {
      const name = (loc.police_station || loc.policeStation || '').toLowerCase();
      const c = (loc.city || '').toLowerCase();
      const s = (loc.state || '').toLowerCase();
      const d = (loc.district || '').toLowerCase();
      return name.includes(q) || c.includes(q) || s.includes(q) || d.includes(q);
    });
  };

  const handleSelectStation = (station) => {
    const name = station.police_station || station.policeStation;
    setPoliceStation(name);
    setStationSearch(name);
    if (station.state) setState(station.state);
    if (station.city) setCity(station.city);
    if (station.district) setDistrict(station.district);
    setShowDropdown(false);
    setFieldErrors(prev => ({ ...prev, policeStation: null }));
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const str = timeStr.trim().toUpperCase();
    
    // Check 12-hour format with AM/PM (e.g. 05:30 PM, 5:30 PM, 5:30PM)
    const ampmMatch = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = parseInt(ampmMatch[2], 10);
      const period = ampmMatch[3];
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }

    // Check 24-hour format (e.g. 17:30 or 09:15)
    const match24 = str.match(/^(\d{1,2}):(\d{2})/);
    if (match24) {
      const hours = parseInt(match24[1], 10);
      const minutes = parseInt(match24[2], 10);
      return hours * 60 + minutes;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setError('');
    setSuccess('');

    const newErrors = {};

    if (!categoryName) {
      newErrors.category = 'Please select a Crime Category.';
    }

    if (!date) {
      newErrors.date = 'Incident Date is required. Please select a date.';
    } else {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (date > todayStr) {
        newErrors.date = 'Incident Date cannot be in the future or tomorrow.';
      }
    }

    if (!time) {
      newErrors.time = 'Incident Time is required. Please select a time.';
    } else if (date) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (date === todayStr) {
        const userTimeMinutes = parseTimeToMinutes(time);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (userTimeMinutes !== null && userTimeMinutes > currentMinutes) {
          const liveFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          newErrors.time = `For today's date, Incident Time cannot be in the future (Current live time is ${liveFormatted}).`;
        }
      }
    }

    if (!state.trim()) {
      newErrors.state = 'State is required.';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required.';
    }

    const pincodeClean = pincode.trim();
    if (!pincodeClean) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(pincodeClean)) {
      newErrors.pincode = 'Pincode must be compulsory 6 digits (e.g. 380015).';
    }

    const isValidStation = locationsList.some(
      loc => (loc.police_station || loc.policeStation) === policeStation
    );
    if (!policeStation || !isValidStation) {
      newErrors.policeStation = 'Please search and select a valid registered Police Station from the list.';
    }

    if (!description.trim()) {
      newErrors.description = 'Incident Description is required. Please describe what happened.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Incident Description must be at least 10 characters long.';
    }

    if (!witnessInfo.trim()) {
      newErrors.witnessInfo = 'Witness Information is required. Please provide witness names/contacts or enter N/A.';
    }

    if (!captchaChecked) {
      newErrors.captcha = 'Please check the legal declaration checklist before submitting.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Please resolve the highlighted field errors below before submitting your FIR.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('crimeCategory', categoryName);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('description', `${description}\n\n[Witness Info]: ${witnessInfo}\n\n[Notes]: ${additionalNotes}`);
    formData.append('priority', priority);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('district', district);
    formData.append('police_station', policeStation);
    formData.append('pincode', pincodeClean);

    if (photoFile) formData.append('photo', photoFile);
    if (videoFile) formData.append('video', videoFile);
    if (docFile) formData.append('document', docFile);

    try {
      let res;
      try {
        res = await axiosInstance.post('/citizen/fir', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (e) {
        res = await axiosInstance.post('/api/citizen/fir', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      if (res.data && res.data.success) {
        setSuccess(`Digital FIR filed successfully! Case ID: ${res.data.crimeId}. Redirecting to tracker...`);
        setTimeout(() => {
          navigate('/citizen/track-fir');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      const apiMsg = err.response?.data?.message || err.response?.data?.error || 'FIR filing failed. Please check your account status and inputs.';
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff', fontWeight: '800' }}>
          File Digital FIR Case
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Submit legal sections, Mo parameters, witness details, and evidence attachments to nearest command stations.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '16px', color: '#fca5a5', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: '16px', color: '#a7f3d0', borderRadius: '8px' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="cyber-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Category & priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Crime Category</label>
            <select className="form-control" value={categoryName} onChange={e => setCategoryName(e.target.value)}>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority Estimation</label>
            <select className="form-control" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Date and Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label style={{ color: fieldErrors.date ? '#fca5a5' : '#64748b' }}>
              Incident Date * (Click to Open Calendar)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="date"
                className="form-control"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => {
                  setDate(e.target.value);
                  setFieldErrors(prev => ({ ...prev, date: null }));
                }}
                onClick={e => { if (e.target.showPicker) e.target.showPicker(); }}
                required
                style={{
                  colorScheme: 'dark',
                  cursor: 'pointer',
                  paddingRight: '40px',
                  borderColor: fieldErrors.date ? '#ef4444' : '#223248',
                  boxShadow: fieldErrors.date ? '0 0 0 1px #ef4444' : 'none'
                }}
              />
              <span
                onClick={(e) => {
                  const inputEl = e.currentTarget.previousElementSibling;
                  if (inputEl && inputEl.showPicker) inputEl.showPicker();
                }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  userSelect: 'none'
                }}
                title="Click to Open Calendar Picker"
              >
                📅
              </span>
            </div>
            {fieldErrors.date && (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '700', display: 'block' }}>
                ⚠️ {fieldErrors.date}
              </span>
            )}
          </div>

          <div className="form-group">
            <label style={{ color: fieldErrors.time ? '#fca5a5' : '#64748b' }}>
              Incident Time (approx) *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="time"
                className="form-control"
                value={time}
                onChange={e => {
                  setTime(e.target.value);
                  setFieldErrors(prev => ({ ...prev, time: null }));
                }}
                onClick={e => { if (e.target.showPicker) e.target.showPicker(); }}
                required
                style={{
                  colorScheme: 'dark',
                  cursor: 'pointer',
                  paddingRight: '40px',
                  borderColor: fieldErrors.time ? '#ef4444' : '#223248',
                  boxShadow: fieldErrors.time ? '0 0 0 1px #ef4444' : 'none'
                }}
              />
              <span
                onClick={(e) => {
                  const inputEl = e.currentTarget.previousElementSibling;
                  if (inputEl && inputEl.showPicker) inputEl.showPicker();
                }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  userSelect: 'none'
                }}
                title="Click to Open Time Picker"
              >
                🕒
              </span>
            </div>
            {fieldErrors.time && (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '700', display: 'block' }}>
                ⚠️ {fieldErrors.time}
              </span>
            )}
          </div>
        </div>

        {/* Location selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label style={{ color: fieldErrors.state ? '#fca5a5' : '#64748b' }}>State *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Gujarat"
              value={state}
              onChange={e => {
                setState(e.target.value);
                setFieldErrors(prev => ({ ...prev, state: null }));
              }}
              required
              style={{
                borderColor: fieldErrors.state ? '#ef4444' : '#223248',
                boxShadow: fieldErrors.state ? '0 0 0 1px #ef4444' : 'none'
              }}
            />
            {fieldErrors.state && (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '700', display: 'block' }}>
                ⚠️ {fieldErrors.state}
              </span>
            )}
          </div>

          <div className="form-group">
            <label style={{ color: fieldErrors.city ? '#fca5a5' : '#64748b' }}>City *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ahmedabad"
              value={city}
              onChange={e => {
                setCity(e.target.value);
                setFieldErrors(prev => ({ ...prev, city: null }));
              }}
              required
              style={{
                borderColor: fieldErrors.city ? '#ef4444' : '#223248',
                boxShadow: fieldErrors.city ? '0 0 0 1px #ef4444' : 'none'
              }}
            />
            {fieldErrors.city && (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '700', display: 'block' }}>
                ⚠️ {fieldErrors.city}
              </span>
            )}
          </div>

          <div className="form-group">
            <label style={{ color: fieldErrors.pincode ? '#fca5a5' : '#64748b' }}>Pincode * (6 Digits)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 380015"
              value={pincode}
              onChange={e => {
                setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setFieldErrors(prev => ({ ...prev, pincode: null }));
              }}
              maxLength={6}
              required
              style={{
                borderColor: fieldErrors.pincode ? '#ef4444' : (pincode && pincode.length !== 6 ? '#f59e0b' : '#223248'),
                boxShadow: fieldErrors.pincode ? '0 0 0 1px #ef4444' : 'none'
              }}
            />
            {fieldErrors.pincode ? (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '700', display: 'block' }}>
                ⚠️ {fieldErrors.pincode}
              </span>
            ) : pincode && pincode.length !== 6 ? (
              <span style={{ fontSize: '10px', color: '#f59e0b', marginTop: '2px', display: 'block' }}>
                Pincode must be exactly 6 digits ({pincode.length}/6)
              </span>
            ) : null}
          </div>
        </div>

        <div className="form-group" style={{ position: 'relative' }}>
          <label style={{ color: fieldErrors.policeStation ? '#fca5a5' : '#64748b' }}>
            Selected Police Station * (Search & Select)
          </label>
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Type to search police station by name, city, or state..."
              value={stationSearch}
              onChange={(e) => {
                const val = e.target.value;
                setStationSearch(val);
                setShowDropdown(true);
                if (policeStation && val !== policeStation) {
                  setPoliceStation('');
                }
                setFieldErrors(prev => ({ ...prev, policeStation: null }));
              }}
              onFocus={() => setShowDropdown(true)}
              style={{
                fontWeight: '600',
                color: policeStation ? '#10b981' : '#fff',
                borderColor: fieldErrors.policeStation ? '#ef4444' : (policeStation ? '#10b981' : '#223248'),
                boxShadow: fieldErrors.policeStation ? '0 0 0 1px #ef4444' : 'none'
              }}
            />
            {stationSearch && (
              <button
                type="button"
                onClick={() => {
                  setPoliceStation('');
                  setStationSearch('');
                  setShowDropdown(true);
                  setFieldErrors(prev => ({ ...prev, policeStation: null }));
                }}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'rgba(239,68,68,0.15)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Inline Field Error or Status Indicator */}
          {fieldErrors.policeStation ? (
            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', fontWeight: 'bold' }}>
              ⚠️ {fieldErrors.policeStation}
            </div>
          ) : policeStation ? (
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: 'bold' }}>
              ✓ Registered Station Selected: {policeStation} ({city}, {state})
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>
              ⚠️ Type above to search, then click a matching station from the list below to select.
            </div>
          )}

          {/* Search Dropdown Popup */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 999,
                backgroundColor: '#0B1220',
                border: '1px solid #4DA3FF',
                borderRadius: '10px',
                marginTop: '6px',
                maxHeight: '240px',
                overflowY: 'auto',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.85)'
              }}
            >
              <div style={{
                padding: '8px 12px',
                fontSize: '11px',
                color: '#4DA3FF',
                fontWeight: 'bold',
                borderBottom: '1px solid #223248',
                background: '#070D18',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>REGISTERED POLICE STATIONS MATCHES ({getMatchingStations().length})</span>
                <span
                  onClick={() => setShowDropdown(false)}
                  style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '11px' }}
                >
                  ✕ Close List
                </span>
              </div>

              {getMatchingStations().length === 0 ? (
                <div style={{ padding: '16px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
                  No registered police station found matching "{stationSearch}".
                  <br />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Please search by city (e.g., Ahmedabad, Mumbai, Delhi) or state.</span>
                </div>
              ) : (
                getMatchingStations().map((station, idx) => {
                  const name = station.police_station || station.policeStation;
                  const isSelected = policeStation === name;
                  return (
                    <div
                      key={station._id || station.id || idx}
                      onClick={() => handleSelectStation(station)}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        borderBottom: idx === getMatchingStations().length - 1 ? 'none' : '1px solid #162438',
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(77, 163, 255, 0.12)';
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div>
                        <span style={{ color: isSelected ? '#10b981' : '#fff', fontWeight: '600', fontSize: '13px', display: 'block' }}>
                          🏫 {name}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                          📍 {station.city}, {station.state} {station.district ? `(${station.district})` : ''}
                        </span>
                      </div>
                      <span style={{
                        color: isSelected ? '#10b981' : '#4DA3FF',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: isSelected ? 'rgba(16,185,129,0.2)' : 'rgba(77,163,255,0.1)'
                      }}>
                        {isSelected ? '✓ Selected' : 'Select Station →'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Detailed description */}
        <div className="form-group">
          <label style={{ color: fieldErrors.description ? '#fca5a5' : '#64748b' }}>
            Incident Description *
          </label>
          <textarea
            className="form-control"
            value={description}
            onChange={e => {
              setDescription(e.target.value);
              setFieldErrors(prev => ({ ...prev, description: null }));
            }}
            required
            placeholder="Describe the incident in detail (chronology, suspects profile, stolen properties, vehicle tags, etc.)"
            style={{
              minHeight: '120px',
              borderColor: fieldErrors.description ? '#ef4444' : '#223248',
              boxShadow: fieldErrors.description ? '0 0 0 1px #ef4444' : 'none'
            }}
          />
          {fieldErrors.description && (
            <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '700', display: 'block' }}>
              ⚠️ {fieldErrors.description}
            </span>
          )}
        </div>

        {/* Witness and notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label style={{ color: fieldErrors.witnessInfo ? '#fca5a5' : '#64748b' }}>
              Witness Information *
            </label>
            <textarea
              className="form-control"
              value={witnessInfo}
              onChange={e => {
                setWitnessInfo(e.target.value);
                setFieldErrors(prev => ({ ...prev, witnessInfo: null }));
              }}
              required
              placeholder="Name, Contact detail of witnesses present at location (or enter N/A if none)"
              style={{
                minHeight: '80px',
                borderColor: fieldErrors.witnessInfo ? '#ef4444' : '#223248',
                boxShadow: fieldErrors.witnessInfo ? '0 0 0 1px #ef4444' : 'none'
              }}
            />
            {fieldErrors.witnessInfo && (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: '700', display: 'block' }}>
                ⚠️ {fieldErrors.witnessInfo}
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Additional Notes <span style={{ color: '#94a3b8', textTransform: 'none' }}>(Optional)</span></label>
            <textarea
              className="form-control"
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="Specific security details, local constraints, emergency contacts"
              style={{ minHeight: '80px' }}
            />
          </div>
        </div>

        {/* Evidence files attachment */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
            Evidence Attachments <span style={{ color: '#94a3b8', textTransform: 'none', fontWeight: 'normal' }}>(Optional — Max 5MB each)</span>
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ fontSize: '11px' }}>Photo Evidence <span style={{ color: '#94a3b8', textTransform: 'none' }}>(Optional)</span></label>
              <input type="file" onChange={e => setPhotoFile(e.target.files[0])} accept="image/*" className="form-control" style={{ padding: '8px' }} />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px' }}>Video Evidence <span style={{ color: '#94a3b8', textTransform: 'none' }}>(Optional)</span></label>
              <input type="file" onChange={e => setVideoFile(e.target.files[0])} accept="video/*" className="form-control" style={{ padding: '8px' }} />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px' }}>Supporting Doc (PDF) <span style={{ color: '#94a3b8', textTransform: 'none' }}>(Optional)</span></label>
              <input type="file" onChange={e => setDocFile(e.target.files[0])} accept=".pdf" className="form-control" style={{ padding: '8px' }} />
            </div>
          </div>
        </div>

        {/* CAPTCHA decleration check */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: fieldErrors.captcha ? 'rgba(239,68,68,0.06)' : 'rgba(77,163,255,0.03)',
          border: fieldErrors.captcha ? '1px solid #ef4444' : '1px solid #223248',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '10px'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={captchaChecked}
              onChange={e => {
                setCaptchaChecked(e.target.checked);
                setFieldErrors(prev => ({ ...prev, captcha: null }));
              }}
              style={{ marginTop: '3px', accentColor: '#4DA3FF', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
              I verify that all information provided in this digital FIR submission is true, complete, and correct to the best of my knowledge, and I understand that compiling false information is punishable under legal penal codes.
            </span>
          </div>
          {fieldErrors.captcha && (
            <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '8px', fontWeight: '700' }}>
              ⚠️ {fieldErrors.captcha}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#4DA3FF',
            color: '#0B1220',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {loading ? 'Filing Digital FIR Ledger...' : 'Commit & File FIR'}
        </button>

      </form>

      <style>{`
        .cyber-container {
          background: #111827;
          border: 1px solid #223248;
          border-radius: 16px;
          padding: 32px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
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

export default RegisterFIR;
