import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { renderDepartmentBadge } from '../../api/departmentHelper';
import { maskIdentityNumber } from '../../utils/maskUtils';
import AdminDataTable from '../../components/AdminDataTable';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('staff');
  const [citizens, setCitizens] = useState([]);

  // Toggle Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // New User Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('officer');
  const [badgeNo, setBadgeNo] = useState('');
  const [station, setStation] = useState('');
  const [contact, setContact] = useState('');
  const [department, setDepartment] = useState('');

  // Edit User Form States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editBadgeNo, setEditBadgeNo] = useState('');
  const [editStation, setEditStation] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  const fetchUsersAndLocations = async () => {
    setLoading(true);
    setError('');

    let uList = [];
    let lList = [];

    // Fetch users
    try {
      let usersRes;
      try {
        usersRes = await axiosInstance.get('/admin/users');
      } catch (e1) {
        usersRes = await axiosInstance.get('/api/admin/users');
      }
      if (usersRes?.data) {
        uList = usersRes.data.users || usersRes.data.results || (Array.isArray(usersRes.data) ? usersRes.data : []);
      }
    } catch (errU) {
      console.error('Error fetching admin users:', errU);
    }

    // Fetch locations
    try {
      let locRes;
      try {
        locRes = await axiosInstance.get('/admin/locations');
      } catch (e2) {
        locRes = await axiosInstance.get('/api/admin/locations');
      }
      if (locRes?.data) {
        lList = locRes.data.locations || locRes.data.results || (Array.isArray(locRes.data) ? locRes.data : []);
      }
    } catch (errL) {
      console.error('Error fetching locations:', errL);
    }

    setUsers(uList);
    setLocations(lList);
    setLoading(false);
  };

  const fetchCitizens = async () => {
    try {
      let res;
      try {
        res = await axiosInstance.get('/admin/citizens');
      } catch (e) {
        res = await axiosInstance.get('/api/admin/citizens');
      }
      if (res.data && res.data.success) {
        setCitizens(res.data.citizens || []);
      }
    } catch (err) {
      console.error('Error fetching citizens list:', err);
    }
  };

  const handleVerifyCitizen = async (citizenId, action) => {
    setError('');
    setSuccess('');
    try {
      let res;
      try {
        res = await axiosInstance.post(`/admin/citizens/${citizenId}/verify`, { action });
      } catch (e) {
        res = await axiosInstance.post(`/api/admin/citizens/${citizenId}/verify`, { action });
      }
      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        fetchCitizens();
      }
    } catch (err) {
      console.error('Error verifying citizen:', err);
      setError('Failed to update citizen verification status.');
    }
  };

  useEffect(() => {
    fetchUsersAndLocations();
    fetchCitizens();
  }, []);

  // Handle User Signup (Create User)
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    // Domain validation checks
    const emailLower = email.toLowerCase();
    if (['officer', 'analyst', 'admin'].includes(role) && !emailLower.endsWith('@crimepilot.com')) {
      setError('Staff accounts must use mandatory domain @crimepilot.com');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
        role,
      };

      if (role === 'officer') {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(contact)) {
          setError('Contact phone number must be compulsory 10 digits starting with 6, 7, 8, or 9.');
          setSubmitting(false);
          return;
        }
        payload.badgeNo = badgeNo;
        payload.station = station;
        payload.contact = contact;
      } else if (role === 'analyst') {
        payload.department = department;
      }

      const res = await axiosInstance.post('/auth/signup', payload);
      if (res.data && res.data.success) {
        setSuccess(`User ${name} registered successfully as ${role.toUpperCase()}.`);
        setShowAddForm(false);
        // Clear fields
        setName('');
        setEmail('');
        setPassword('');
        setRole('officer');
        setBadgeNo('');
        setStation('');
        setContact('');
        setDepartment('');
        fetchUsersAndLocations();
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.response?.data?.message || 'Failed to register new user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Toggle Active/Deactive login status
  const handleToggleActive = async (userId) => {
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.patch(`/admin/users/${userId}/toggle-active`);
      if (res.data && res.data.success) {
        setSuccess(res.data.message);
        setUsers(prev =>
          prev.map(item =>
            item.user._id === userId
              ? { ...item, user: { ...item.user, isActive: res.data.isActive } }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Error toggling active status:', err);
      setError(err.response?.data?.message || 'Failed to update user login active state.');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user: ${userName}? This will clean up their profiles.`)) return;

    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.delete(`/admin/users/${userId}`);
      if (res.data && res.data.success) {
        setSuccess(`User ${userName} deleted successfully.`);
        setUsers(prev => prev.filter(item => item.user._id !== userId));
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Start Edit Mode
  const startEdit = (item) => {
    setEditingUser(item.user);
    setEditName(item.user.name);
    setEditEmail(item.user.email);
    setEditRole(item.user.role);
    setEditBadgeNo(item.details?.badgeNo || '');
    setEditStation(item.details?.station?._id || item.details?.station || '');
    setEditContact(item.details?.contact || '');
    setEditDepartment(item.details?.department || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Edit Submit
  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    // Domain validation checks
    const emailLower = editEmail.toLowerCase();
    if (['officer', 'analyst', 'admin'].includes(editRole) && !emailLower.endsWith('@crimepilot.com')) {
      setError('Staff accounts must use mandatory domain @crimepilot.com');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: editName,
        email: editEmail,
        role: editRole,
      };

      if (editRole === 'officer') {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(editContact)) {
          setError('Contact phone number must be compulsory 10 digits starting with 6, 7, 8, or 9.');
          setSubmitting(false);
          return;
        }
        payload.badgeNo = editBadgeNo;
        payload.station = editStation;
        payload.contact = editContact;
      } else if (editRole === 'analyst') {
        payload.department = editDepartment;
      }

      const res = await axiosInstance.put(`/admin/users/${editingUser._id}`, payload);
      if (res.data && res.data.success) {
        setSuccess('User details updated successfully.');
        setEditingUser(null);
        fetchUsersAndLocations();
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && users.length === 0) {
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
            Manage System Users
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Configure and audit personnel profiles and verify citizen dossier claims.
          </p>
        </div>

        {!editingUser && activeTab === 'staff' && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-crimson" style={{ fontSize: '13px' }}>
            {showAddForm ? 'Hide Form' : '+ Add System User'}
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #223248', paddingBottom: '2px' }}>
        <button
          onClick={() => { setActiveTab('staff'); setShowAddForm(false); }}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'staff' ? '#4DA3FF' : '#94a3b8',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            paddingBottom: '10px',
            borderBottom: activeTab === 'staff' ? '2px solid #4DA3FF' : 'none'
          }}
        >
          👮 System Staff Directory
        </button>
        <button
          onClick={() => { setActiveTab('citizens'); setShowAddForm(false); }}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'citizens' ? '#4DA3FF' : '#94a3b8',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            paddingBottom: '10px',
            borderBottom: activeTab === 'citizens' ? '2px solid #4DA3FF' : 'none'
          }}
        >
          👤 Citizens Accounts Verification
        </button>
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
          ADD USER FORM
          ============================================== */}
      {showAddForm && (
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>Register New Personnel</h3>
          
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" required placeholder="e.g. Inspector John" className="form-control" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" required placeholder="email@crimepilot.com" autoComplete="new-email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Default Password *</label>
                <input type="password" required placeholder="••••••••" autoComplete="new-password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>System Portal Role *</label>
                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="officer">Officer (Field Squad)</option>
                  <option value="analyst">Analyst (Data Analytics)</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              {/* Conditional Officer fields */}
              {role === 'officer' && (
                <>
                  <div className="form-group">
                    <label>Badge Number *</label>
                    <input type="text" required placeholder="e.g. BD-90812" className="form-control" value={badgeNo} onChange={e => setBadgeNo(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Assigned Station *</label>
                    <select required className="form-control" value={station} onChange={e => setStation(e.target.value)}>
                      <option value="">-- Choose Location --</option>
                      {locations.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.policeStation} ({loc.city})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contact Phone (10 Digits) *</label>
                    <input type="tel" required placeholder="10-digit mobile" maxLength={10} minLength={10} inputMode="numeric" pattern="[6-9][0-9]{9}" className="form-control" value={contact} onChange={e => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                  </div>
                </>
              )}

              {/* Conditional Analyst fields */}
              {role === 'analyst' && (
                <div className="form-group">
                  <label>Department / Branch *</label>
                  <input type="text" required placeholder="e.g. Cyber Trends Unit" className="form-control" value={department} onChange={e => setDepartment(e.target.value)} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-crimson" disabled={submitting}>{submitting ? 'Registering...' : 'Register User'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ==============================================
          EDIT USER FORM
          ============================================== */}
      {editingUser && (
        <div className="glass-card" style={{ border: '1px solid #06b6d4' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
            Edit Personnel Details: <span style={{ color: '#06b6d4' }}>{editingUser.name}</span>
          </h3>
          
          <form onSubmit={handleUpdateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" required className="form-control" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" required className="form-control" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Portal Role *</label>
                <select className="form-control" value={editRole} onChange={e => setEditRole(e.target.value)}>
                  <option value="officer">Officer (Field Squad)</option>
                  <option value="analyst">Analyst (Data Analytics)</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {editRole === 'officer' && (
                <>
                  <div className="form-group">
                    <label>Badge Number *</label>
                    <input type="text" required className="form-control" value={editBadgeNo} onChange={e => setEditBadgeNo(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Assigned Station *</label>
                    <select required className="form-control" value={editStation} onChange={e => setEditStation(e.target.value)}>
                      <option value="">-- Choose Location --</option>
                      {locations.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.policeStation} ({loc.city})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contact Phone (10 Digits) *</label>
                    <input type="tel" required placeholder="10-digit mobile" maxLength={10} minLength={10} inputMode="numeric" pattern="[6-9][0-9]{9}" className="form-control" value={editContact} onChange={e => setEditContact(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                  </div>
                </>
              )}

              {editRole === 'analyst' && (
                <div className="form-group">
                  <label>Department / Branch *</label>
                  <input type="text" required className="form-control" value={editDepartment} onChange={e => setEditDepartment(e.target.value)} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Updating...' : 'Save Updates'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ==============================================
          DIRECTORY LISTS USING ADMIN DATATABLE
          ============================================== */}
      {activeTab === 'staff' ? (
        <AdminDataTable
          title="System Personnel Registry"
            columns={[
              {
                key: 'user.name',
                label: 'Name',
                sortable: true,
                render: (item) => (
                  <span style={{ fontWeight: '700', color: '#fff' }}>
                    {item.user.name}
                    <div style={{ marginTop: '4px' }}>{renderDepartmentBadge(item.user.email)}</div>
                  </span>
                )
              },
              { key: 'user.email', label: 'Email', sortable: true },
              {
                key: 'user.role',
                label: 'Role',
                sortable: true,
                render: (item) => {
                  const getRoleColor = (roleVal) => {
                    if (roleVal === 'admin') return '#f43f5e';
                    if (roleVal === 'analyst') return '#06b6d4';
                    return '#f59e0b';
                  };
                  return (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: getRoleColor(item.user.role),
                      backgroundColor: `${getRoleColor(item.user.role)}11`,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${getRoleColor(item.user.role)}22`
                    }}>{item.user.role}</span>
                  );
                }
              },
              {
                key: 'details',
                label: 'Affiliation / Badge',
                sortable: false,
                render: (item) => {
                  const u = item.user;
                  const details = item.details;
                  if (u.role === 'officer' && details) {
                    return <span>Badge: <strong>{details.badgeNo}</strong> ({details.station?.policeStation || 'No Station'})</span>;
                  } else if (u.role === 'analyst' && details) {
                    return <span>Dept: {details.department}</span>;
                  }
                  return <span style={{ color: '#64748b', fontStyle: 'italic' }}>System Admin</span>;
                }
              },
              {
                key: 'user.isActive',
                label: 'Status',
                sortable: true,
                render: (item) => (
                  <span style={{ fontSize: '11px', fontWeight: '700', color: item.user.isActive ? '#10b981' : '#64748b' }}>
                    {item.user.isActive ? 'Active' : 'Deactivated'}
                  </span>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                sortable: false,
                align: 'right',
                render: (item) => (
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleActive(item.user._id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 8px', color: item.user.isActive ? '#fbbf24' : '#10b981' }}
                    >
                      {item.user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => startEdit(item)}
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(item.user._id, item.user.name)}
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 8px', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.1)' }}
                    >
                      Delete
                    </button>
                  </div>
                )
              }
            ]}
            data={users}
            loading={loading}
            emptyMessage="No personnel records found."
            searchPlaceholder="Search personnel by name, email, or role..."
          />
      ) : (
        <AdminDataTable
          title="Citizen Dossier Verification Desk"
            columns={[
              { key: 'user.name', label: 'Full Name', sortable: true, render: (c) => <span style={{ fontWeight: '700', color: '#fff' }}>{c.user?.name}</span> },
              {
                key: 'user.email',
                label: 'Contact Credentials',
                sortable: true,
                render: (c) => (
                  <div>
                    <div style={{ fontSize: '12px' }}>{c.user?.email}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Mob: {c.mobile}</div>
                  </div>
                )
              },
              {
                key: 'identityType',
                label: 'Identity Proof Info',
                sortable: true,
                render: (c) => (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{c.identityType}</div>
                    <div style={{ fontSize: '11px', color: '#4DA3FF', fontFamily: 'monospace' }}>No: {maskIdentityNumber(c.identityType, c.identityNumber)}</div>
                  </div>
                )
              },
              {
                key: 'identityDocument',
                label: 'Document Audit',
                sortable: false,
                render: (c) => (
                  c.identityDocument ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${c.identityDocument}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#4DA3FF', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px dashed #4DA3FF' }}
                    >
                      🔗 Audit Document
                    </a>
                  ) : (
                    <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '11px' }}>No Doc Uploaded</span>
                  )
                )
              },
              {
                key: 'status',
                label: 'Verification Status',
                sortable: true,
                render: (c) => (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    color: c.status === 'verified' ? '#10b981' : c.status === 'rejected' ? '#f43f5e' : '#f59e0b',
                    backgroundColor: c.status === 'verified' ? 'rgba(16,185,129,0.08)' : c.status === 'rejected' ? 'rgba(244,63,94,0.08)' : 'rgba(245,158,11,0.08)'
                  }}>
                    {c.status}
                  </span>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                sortable: false,
                align: 'right',
                render: (c) => (
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      onClick={() => handleVerifyCitizen(c.id || c._id, 'verify')}
                      className="btn btn-secondary"
                      disabled={c.status === 'verified'}
                      style={{ fontSize: '11px', padding: '4px 8px', color: '#10b981', borderColor: 'rgba(16,185,129,0.1)' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerifyCitizen(c.id || c._id, 'reject')}
                      className="btn btn-secondary"
                      disabled={c.status === 'rejected'}
                      style={{ fontSize: '11px', padding: '4px 8px', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.1)' }}
                    >
                      Reject
                    </button>
                  </div>
                )
              }
            ]}
            data={citizens}
            emptyMessage="No citizens registered on ledger."
            searchPlaceholder="Search citizens by name, email, status, or identity..."
          />
      )}

    </div>
  );
};

export default ManageUsers;
