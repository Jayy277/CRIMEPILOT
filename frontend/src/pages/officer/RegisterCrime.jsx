import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import LegalSectionDropdown from '../../components/LegalSectionDropdown';

const RegisterCrime = () => {
  const { user, details } = useContext(AuthContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [error, setError] = useState('');
  
  // Form fields
  const [crimeCategory, setCrimeCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5)
  );
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [selectedSections, setSelectedSections] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setFetchingOptions(true);
        const [categoriesRes, locationsRes] = await Promise.all([
          axiosInstance.get('/admin/crime-categories'),
          axiosInstance.get('/admin/locations'),
        ]);

        if (categoriesRes.data && categoriesRes.data.categories) {
          setCategories(categoriesRes.data.categories);
        }
        if (locationsRes.data && locationsRes.data.locations) {
          setLocations(locationsRes.data.locations);
        }
      } catch (err) {
        console.error('Error fetching register form options:', err);
        setError('Failed to load locations or categories. Please try again.');
      } finally {
        setFetchingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!crimeCategory || !location || !description) {
      setError('Please fill in all required fields.');
      return;
    }

    const officerId = Number(details?._id || details?.id || details?.userId) || details?._id || details?.id || details?.userId;
    if (!officerId) {
      setError('Officer profile metadata is missing from your session. Please contact the administrator.');
      return;
    }

    const categoryId = Number(crimeCategory) || crimeCategory;
    const locationId = Number(location) || location;

    setLoading(true);
    setError('');

    try {
      const payload = {
        crimeCategory: categoryId,
        date,
        time,
        location: locationId,
        description,
        officer: Number(officerId), // Officer DB ID
        priority,
        sections: selectedSections || [], // Custom Feature A selection
      };
      console.log('RegisterCrime payload:', payload);

      const response = await axiosInstance.post('/crimes', payload);
      if (response.data && response.data.success) {
        navigate('/officer/my-cases');
      }
    } catch (err) {
      console.error('Error registering crime:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit crime case report.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingOptions) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: '#f59e0b',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          Register New Crime Case
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          File a secure First Information Report (FIR) and assign legal codes.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {/* Register Form */}
      <div className="glass-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Auto generated ID */}
            <div className="form-group">
              <label>Crime ID</label>
              <input
                type="text"
                disabled
                className="form-control"
                value="Auto-Generated on Save"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#64748b', fontStyle: 'italic' }}
              />
            </div>

            {/* Officer Name */}
            <div className="form-group">
              <label>Filing Officer (Auto)</label>
              <input
                type="text"
                disabled
                className="form-control"
                value={`${user?.name || ''} (${details?.badgeNo || 'N/A'})`}
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#64748b' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Crime Category */}
            <div className="form-group">
              <label>Crime Type / Category *</label>
              <select
                required
                className="form-control"
                value={crimeCategory}
                onChange={(e) => {
                  setCrimeCategory(e.target.value);
                  setSelectedSections([]); // reset sections on type change
                }}
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => {
                  const categoryId = cat._id || cat.id;
                  return (
                    <option key={categoryId} value={categoryId}>
                      {cat.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Jurisdiction / Station *</label>
              <select
                required
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">-- Select Location/Station --</option>
                {locations.map((loc) => {
                  const locationId = loc._id || loc.id;
                  return (
                    <option key={locationId} value={locationId}>
                      {loc.policeStation} ({loc.city}, {loc.state})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Date */}
            <div className="form-group">
              <label>Incident Date *</label>
              <input
                type="date"
                required
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Time */}
            <div className="form-group">
              <label>Incident Time (24h) *</label>
              <input
                type="time"
                required
                className="form-control"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Priority */}
            <div className="form-group">
              <label>Priority Level</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Initial Case Status</label>
              <input
                type="text"
                disabled
                className="form-control"
                value="Reported"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: '#64748b' }}
              />
            </div>
          </div>

          {/* Custom Feature A - Legal Section Dropdown */}
          <div className="form-group">
            <LegalSectionDropdown
              categoryId={crimeCategory}
              selectedSections={selectedSections}
              onChange={setSelectedSections}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Case Details & Modus Operandi Description *</label>
            <textarea
              required
              rows="5"
              className="form-control"
              placeholder="Describe the crime scene, MO, weapons used, and entry method. Be descriptive to aid similar case comparisons..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/officer/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-gold"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register FIR Case'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default RegisterCrime;
