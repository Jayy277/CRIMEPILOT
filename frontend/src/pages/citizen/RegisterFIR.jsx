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
        const catRes = await axiosInstance.get('/api/crime-categories');
        if (catRes.data && catRes.data.success) {
          setCategories(catRes.data.categories);
          if (catRes.data.categories.length > 0) {
            setCategoryName(catRes.data.categories[0].name);
          }
        }
        
        const locRes = await axiosInstance.get('/api/locations');
        if (locRes.data && locRes.data.success) {
          setLocationsList(locRes.data.locations);
        }
      } catch (err) {
        console.error('Error fetching categories/locations:', err);
      }
    };
    fetchData();
  }, []);

  // Filter police stations based on city / state input
  const getFilteredStations = () => {
    if (!city && !state) return [];
    return locationsList.filter(loc => {
      const matchState = state ? loc.state.toLowerCase().includes(state.toLowerCase()) : true;
      const matchCity = city ? loc.city.toLowerCase().includes(city.toLowerCase()) : true;
      return matchState && matchCity;
    });
  };

  const handleStationClick = (station) => {
    setPoliceStation(station.police_station);
    setDistrict(station.district);
    setState(station.state);
    setCity(station.city);
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
      const res = await axiosInstance.post('/api/citizen/fir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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

        {/* Dynamic station auto-suggestion list */}
        {getFilteredStations().length > 0 && (
          <div style={{
            background: '#0B1220',
            border: '1px solid #223248',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <span style={{ fontSize: '11px', color: '#4DA3FF', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
              DETECTED NEARBY COMMAND STATIONS:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {getFilteredStations().map((station, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStationClick(station)}
                  style={{
                    backgroundColor: policeStation === station.police_station ? 'rgba(77, 163, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${policeStation === station.police_station ? '#4DA3FF' : '#223248'}`,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  🏫 {station.police_station}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Selected Police Station</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search city/state above and select suggested station"
            value={policeStation}
            onChange={e => setPoliceStation(e.target.value)}
            required
            style={{ fontWeight: '700', color: '#4DA3FF' }}
          />
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
