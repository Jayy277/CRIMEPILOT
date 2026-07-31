import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminDataTable from '../../components/AdminDataTable';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  // Location fields
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [policeStation, setPoliceStation] = useState('');

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.get('/admin/locations');
      if (res.data && res.data.success) {
        const sorted = (res.data.locations || []).sort((a, b) => 
          a.policeStation.localeCompare(b.policeStation)
        );
        setLocations(sorted);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to fetch police station location registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Submit Add Location
  const handleAddLocationSubmit = async (e) => {
    e.preventDefault();
    if (!state || !district || !city || !policeStation) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await axiosInstance.post('/admin/locations', { state, district, city, policeStation });
      if (res.data && res.data.success) {
        setSuccess(`Location "${policeStation}" registered successfully.`);
        setState('');
        setDistrict('');
        setCity('');
        setPoliceStation('');
        setShowAddForm(false);
        fetchLocations();
      }
    } catch (err) {
      console.error('Error creating location:', err);
      setError(err.response?.data?.message || 'Failed to register location.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Location
  const handleDeleteLocation = async (locId, stationName) => {
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.delete(`/admin/locations/${locId}`);
      if (res.data && res.data.success) {
        setSuccess(`Location "${stationName}" deactivated successfully.`);
        setLocations(prev => prev.map(l => (l._id === locId || l.id === locId) ? { ...l, isActive: false } : l));
      }
    } catch (err) {
      console.error('Error deleting location:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete location.');
    }
  };

  // Start Edit Mode
  const startEdit = (loc) => {
    setEditingLocation(loc);
    setState(loc.state);
    setDistrict(loc.district);
    setCity(loc.city);
    setPoliceStation(loc.policeStation);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Update Location
  const handleUpdateLocationSubmit = async (e) => {
    e.preventDefault();
    if (!editingLocation) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await axiosInstance.put(`/admin/locations/${editingLocation._id}`, { state, district, city, policeStation });
      if (res.data && res.data.success) {
        setSuccess(`Location "${policeStation}" updated successfully.`);
        setEditingLocation(null);
        setState('');
        setDistrict('');
        setCity('');
        setPoliceStation('');
        fetchLocations();
      }
    } catch (err) {
      console.error('Error updating location:', err);
      setError(err.response?.data?.message || 'Failed to update location.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && locations.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.1)',
          borderLeftColor: '#e11d48',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
            Police Stations & Jurisdictions Registry
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Create and edit legal police stations mapped to States, Districts, and Cities.
          </p>
        </div>

        {!editingLocation && (
          <button onClick={() => { setShowAddForm(!showAddForm); setState(''); setDistrict(''); setCity(''); setPoliceStation(''); }} className="btn btn-crimson" style={{ fontSize: '13px' }}>
            {showAddForm ? 'Hide Form' : '+ Add Location'}
          </button>
        )}
      </div>

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #e11d48', padding: '16px', color: '#fda4af' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="glass-card" style={{ borderLeft: '4px solid #10b981', padding: '16px', color: '#a7f3d0' }}>
          {success}
        </div>
      )}

      {/* ==============================================
          ADD / EDIT LOCATION FORM
          ============================================== */}
      {(showAddForm || editingLocation) && (
        <div className="glass-card" style={{ border: editingLocation ? '1px solid #06b6d4' : '1px solid var(--border-glass)' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
            {editingLocation ? `Edit Location: ${editingLocation.policeStation}` : 'Register Police Station'}
          </h3>

          <form onSubmit={editingLocation ? handleUpdateLocationSubmit : handleAddLocationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              
              <div className="form-group">
                <label>State Region *</label>
                <input type="text" required placeholder="e.g. Maharashtra, Karnataka" className="form-control" value={state} onChange={e => setState(e.target.value)} />
              </div>

              <div className="form-group">
                <label>District *</label>
                <input type="text" required placeholder="e.g. Mumbai City, Bengaluru Suburban" className="form-control" value={district} onChange={e => setDistrict(e.target.value)} />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input type="text" required placeholder="e.g. Mumbai, Bengaluru" className="form-control" value={city} onChange={e => setCity(e.target.value)} />
              </div>

            </div>

            <div className="form-group">
              <label>Police Station Station Name *</label>
              <input type="text" required placeholder="e.g. Connaught Place Police Station" className="form-control" value={policeStation} onChange={e => setPoliceStation(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setShowAddForm(false); setEditingLocation(null); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : editingLocation ? 'Save Updates' : 'Add Location'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ==============================================
          LOCATIONS LIST TABLE USING ADMIN DATATABLE
          ============================================== */}
      <div className="glass-card">
        <AdminDataTable
          title="Registered Jurisdictions Directory"
          columns={[
            { key: 'policeStation', label: 'Police Station', sortable: true, render: (loc) => <span style={{ fontWeight: '700', color: '#fff' }}>{loc.policeStation}</span> },
            { key: 'city', label: 'City', sortable: true },
            { key: 'district', label: 'District', sortable: true },
            { key: 'state', label: 'State', sortable: true },
            {
              key: 'isActive',
              label: 'Status',
              sortable: true,
              render: (loc) => (
                loc.isActive === false ? (
                  <span style={{ color: '#ef4444', backgroundColor: '#ef444415', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>Inactive</span>
                ) : (
                  <span style={{ color: '#10b981', backgroundColor: '#10b98115', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>Active</span>
                )
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              sortable: false,
              align: 'right',
              render: (loc) => (
                <div style={{ display: 'inline-flex', gap: '8px' }}>
                  <button
                    onClick={() => startEdit(loc)}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(loc._id || loc.id, loc.policeStation)}
                    className="btn btn-secondary"
                    disabled={loc.isActive === false}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      color: loc.isActive === false ? '#64748b' : '#f43f5e',
                      borderColor: loc.isActive === false ? 'rgba(100,116,139,0.1)' : 'rgba(244,63,94,0.1)',
                      cursor: loc.isActive === false ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loc.isActive === false ? 'Deactivated' : 'Deactivate'}
                  </button>
                </div>
              )
            }
          ]}
          data={locations}
          loading={loading}
          emptyMessage="No police station locations recorded."
          searchPlaceholder="Search locations by station, city, district, or state..."
        />
      </div>

    </div>
  );
};

export default Locations;
