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
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [pincode, setPincode] = useState('');

  const [witnessInfo, setWitnessInfo] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [docFile, setDocFile] = useState(null);

  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  // Filter police stations based on user typed station query, city, or state
  const getFilteredStations = () => {
    const query = policeStation.trim().toLowerCase();
    return locationsList.filter(loc => {
      const stName = (loc.police_station || loc.policeStation || '').toLowerCase();
      const cName = (loc.city || '').toLowerCase();
      const sName = (loc.state || '').toLowerCase();

      const matchesQuery = !query || stName.includes(query) || stName.startsWith(query) || cName.includes(query) || sName.includes(query);
      const matchesState = state ? sName.includes(state.toLowerCase()) : true;
      const matchesCity = city ? cName.includes(city.toLowerCase()) : true;

      return matchesQuery && matchesState && matchesCity;
    });
  };

  const handleStationClick = (station) => {
    const stName = station.police_station || station.policeStation;
    setPoliceStation(stName);
    if (station.district) setDistrict(station.district);
    if (station.state) setState(station.state);
    if (station.city) setCity(station.city);
    setShowStationDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaChecked) {
      setError('Please verify the legal declaration checklist before submitting.');
      return;
    }
    if (!policeStation) {
      setError('Please select a target Police Station.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

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
      setError(err.response?.data?.message || 'FIR filing failed. Please check active clearances and inputs.');
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
            <label>Incident Date</label>
            <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Incident Time (approx)</label>
            <input type="text" className="form-control" placeholder="11:45 PM" value={time} onChange={e => setTime(e.target.value)} required />
          </div>
        </div>

        {/* Location selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>State</label>
            <input type="text" className="form-control" placeholder="Gujarat" value={state} onChange={e => setState(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>City</label>
            <input type="text" className="form-control" placeholder="Ahmedabad" value={city} onChange={e => setCity(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Pincode</label>
            <input type="text" className="form-control" placeholder="380015" value={pincode} onChange={e => setPincode(e.target.value)} required />
          </div>
        </div>

        <div className="form-group" style={{ position: 'relative' }}>
          <label>Selected Police Station</label>
          <input
            type="text"
            className="form-control"
            placeholder="Type police station name (e.g., M, Navrangpura, Satellite, Colaba...)"
            value={policeStation}
            onChange={e => {
              setPoliceStation(e.target.value);
              setShowStationDropdown(true);
            }}
            onFocus={() => setShowStationDropdown(true)}
            required
            style={{ fontWeight: '700', color: '#4DA3FF' }}
          />

          {/* Interactive Live Suggestion Dropdown */}
          {showStationDropdown && getFilteredStations().length > 0 && (
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
                maxHeight: '230px',
                overflowY: 'auto',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)'
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
                <span>SUGGESTED POLICE STATIONS ({getFilteredStations().length})</span>
                <span 
                  onClick={() => setShowStationDropdown(false)} 
                  style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '10px' }}
                >
                  ✕ Close
                </span>
              </div>
              {getFilteredStations().map((station, idx) => {
                const name = station.police_station || station.policeStation;
                const isSelected = policeStation === name;
                return (
                  <div
                    key={idx}
                    onClick={() => handleStationClick(station)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      borderBottom: idx === getFilteredStations().length - 1 ? 'none' : '1px solid #162438',
                      backgroundColor: isSelected ? 'rgba(77, 163, 255, 0.15)' : 'transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(77, 163, 255, 0.1)';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div>
                      <span style={{ color: '#fff', fontWeight: '600', fontSize: '13px', display: 'block' }}>
                        🏫 {name}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                        {station.city}, {station.state} {station.district ? `(${station.district})` : ''}
                      </span>
                    </div>
                    <span style={{ color: '#4DA3FF', fontSize: '11px', fontWeight: 'bold' }}>
                      {isSelected ? '✓ Selected' : 'Select →'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed description */}
        <div className="form-group">
          <label>Incident Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            placeholder="Describe the incident in detail (chronology, suspects profile, stolen properties, vehicle tags, etc.)"
            style={{ minHeight: '120px' }}
          />
        </div>

        {/* Witness and notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Witness Information</label>
            <textarea
              className="form-control"
              value={witnessInfo}
              onChange={e => setWitnessInfo(e.target.value)}
              placeholder="Name, Contact detail of witnesses present at location"
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
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
            Evidence attachments (Max 5MB each)
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ fontSize: '11px' }}>Photo Evidence</label>
              <input type="file" onChange={e => setPhotoFile(e.target.files[0])} accept="image/*" className="form-control" style={{ padding: '8px' }} />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px' }}>Video Evidence</label>
              <input type="file" onChange={e => setVideoFile(e.target.files[0])} accept="video/*" className="form-control" style={{ padding: '8px' }} />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px' }}>Supporting Doc (PDF)</label>
              <input type="file" onChange={e => setDocFile(e.target.files[0])} accept=".pdf" className="form-control" style={{ padding: '8px' }} />
            </div>
          </div>
        </div>

        {/* CAPTCHA decleration check */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          background: 'rgba(77,163,255,0.03)',
          border: '1px solid #223248',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '10px'
        }}>
          <input
            type="checkbox"
            checked={captchaChecked}
            onChange={e => setCaptchaChecked(e.target.checked)}
            style={{ marginTop: '3px', accentColor: '#4DA3FF', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
            I verify that all information provided in this digital FIR submission is true, complete, and correct to the best of my knowledge, and I understand that compiling false information is punishable under legal penal codes.
          </span>
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
