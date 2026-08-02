import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import CaseCard from '../../components/CaseCard';

const Search = () => {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [error, setError] = useState('');
  
  // Search parameters
  const [crimeId, setCrimeId] = useState('');
  const [suspectName, setSuspectName] = useState('');
  const [crimeCategory, setCrimeCategory] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');

  // Results
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchSearchOptions = async () => {
      try {
        setFetchingOptions(true);
        let categoriesRes, locationsRes;
        try {
          [categoriesRes, locationsRes] = await Promise.all([
            axiosInstance.get('/crime-categories'),
            axiosInstance.get('/locations'),
          ]);
        } catch (e) {
          [categoriesRes, locationsRes] = await Promise.all([
            axiosInstance.get('/admin/crime-categories'),
            axiosInstance.get('/admin/locations'),
          ]);
        }

        if (categoriesRes.data) {
          setCategories(categoriesRes.data.categories || categoriesRes.data.results || (Array.isArray(categoriesRes.data) ? categoriesRes.data : []));
        }
        if (locationsRes.data) {
          setLocations(locationsRes.data.locations || locationsRes.data.results || (Array.isArray(locationsRes.data) ? locationsRes.data : []));
        }
      } catch (err) {
        console.error('Error fetching search page filters:', err);
        setError('Failed to populate search filter criteria options.');
      } finally {
        setFetchingOptions(false);
      }
    };

    fetchSearchOptions();
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams();
      if (crimeId) queryParams.append('crimeId', crimeId);
      if (suspectName) queryParams.append('suspectName', suspectName);
      if (crimeCategory) queryParams.append('crimeCategory', crimeCategory);
      if (location) queryParams.append('location', location);
      if (priority) queryParams.append('priority', priority);
      if (status) queryParams.append('status', status);

      const response = await axiosInstance.get(`/crimes?${queryParams.toString()}`);
      if (response.data && response.data.success) {
        setResults(response.data.crimes || []);
      }
      setHasSearched(true);
    } catch (err) {
      console.error('Error performing crime search:', err);
      setError('Search query failed. Please check network/parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCrimeId('');
    setSuspectName('');
    setCrimeCategory('');
    setLocation('');
    setPriority('');
    setStatus('');
    setResults([]);
    setHasSearched(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
          Search Case Records
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Query database logs by case parameters, suspects, or locations.
        </p>
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {/* Advanced Search Form */}
      <div className="glass-card">
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Case ID */}
            <div className="form-group">
              <label>Case ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. CR-2026-00001"
                value={crimeId}
                onChange={e => setCrimeId(e.target.value)}
              />
            </div>

            {/* Criminal Name */}
            <div className="form-group">
              <label>Criminal / Suspect Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ramesh"
                value={suspectName}
                onChange={e => setSuspectName(e.target.value)}
              />
            </div>

            {/* Crime Type */}
            <div className="form-group">
              <label>Crime Category</label>
              <select
                className="form-control"
                value={crimeCategory}
                onChange={e => setCrimeCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Location */}
            <div className="form-group">
              <label>Police Station Station</label>
              <select
                className="form-control"
                value={location}
                onChange={e => setLocation(e.target.value)}
              >
                <option value="">All Stations</option>
                {locations.map(loc => (
                  <option key={loc._id} value={loc._id}>{loc.policeStation} ({loc.city})</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label>Priority</label>
              <select
                className="form-control"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Case Status</label>
              <select
                className="form-control"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="Assigned">Assigned</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Evidence Collected">Evidence Collected</option>
                <option value="Solved">Solved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={loading}
            >
              Reset Filters
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Execute Search'}
            </button>
          </div>

        </form>
      </div>

      {/* Results Listing */}
      {hasSearched && (
        <div>
          <h2 style={{ fontSize: '20px', fontFamily: 'Outfit, sans-serif', color: '#fff', marginBottom: '16px' }}>
            Search Results ({results.length})
          </h2>
          {results.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No crime records matched your search parameters.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {results.map(crime => (
                <CaseCard key={crime._id || crime.id} crime={crime} role="officer" />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Search;
