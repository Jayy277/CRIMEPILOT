import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminDataTable from '../../components/AdminDataTable';

const CrimeCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Category fields
  const [name, setName] = useState('');
  const [sections, setSections] = useState([]); // [{ act: 'BNS', section: '', description: '' }]

  // Section fields (temp inputs to append)
  const [tempAct, setTempAct] = useState('BNS');
  const [tempSection, setTempSection] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.get('/admin/crime-categories');
      if (res.data && res.data.success) {
        const sorted = (res.data.categories || []).sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setCategories(sorted);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch crime category definitions database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddTempSection = () => {
    if (!tempSection || !tempDescription) {
      alert('Section number and description are required.');
      return;
    }
    setSections([...sections, { act: tempAct, section: tempSection, description: tempDescription }]);
    setTempSection('');
    setTempDescription('');
  };

  const handleRemoveTempSection = (idx) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  // Submit Add Category
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await axiosInstance.post('/admin/crime-categories', { name, sections });
      if (res.data && res.data.success) {
        setSuccess(`Crime Category "${name}" created successfully.`);
        setName('');
        setSections([]);
        setShowAddForm(false);
        fetchCategories();
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category: "${catName}"? This will break legal references for linked cases.`)) return;

    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.delete(`/admin/crime-categories/${catId}`);
      if (res.data && res.data.success) {
        setSuccess(`Category "${catName}" deleted successfully.`);
        setCategories(prev => prev.filter(c => c._id !== catId));
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  // Start Edit Mode
  const startEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSections(cat.sections || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Update Category
  const handleUpdateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await axiosInstance.put(`/admin/crime-categories/${editingCategory._id}`, { name, sections });
      if (res.data && res.data.success) {
        setSuccess(`Category "${name}" updated successfully.`);
        setEditingCategory(null);
        setName('');
        setSections([]);
        fetchCategories();
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.response?.data?.message || 'Failed to update category.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && categories.length === 0) {
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
            Crime Categories & Legal Sections Schedule
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Configure crime types and bind applicable legal acts and sections (Feature A source).
          </p>
        </div>

        {!editingCategory && (
          <button onClick={() => { setShowAddForm(!showAddForm); setName(''); setSections([]); }} className="btn btn-crimson" style={{ fontSize: '13px' }}>
            {showAddForm ? 'Hide Form' : '+ Create Category'}
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
          ADD / EDIT CRIME CATEGORY FORM
          ============================================== */}
      {(showAddForm || editingCategory) && (
        <div className="glass-card" style={{ border: editingCategory ? '1px solid #06b6d4' : '1px solid var(--border-glass)' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', fontFamily: 'Outfit, sans-serif' }}>
            {editingCategory ? `Edit Crime Category: ${editingCategory.name}` : 'Create Crime Category'}
          </h3>

          <form onSubmit={editingCategory ? handleUpdateCategorySubmit : handleAddCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Category Name */}
            <div className="form-group">
              <label>Crime Category Name *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Cyber Burglary, Robbery"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* Sections Schedule Builder */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#fff', display: 'block', marginBottom: '12px' }}>
                Legal Sections Array (BNS/BNSS/BSA)
              </label>

              {/* Added sections list */}
              {sections.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic', marginBottom: '16px' }}>
                  No legal sections added yet. Build sections list below.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {sections.map((sec, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px' }}>
                      <div>
                        <span style={{ color: '#22d3ee', fontWeight: '700', fontSize: '13px' }}>{sec.act} Section {sec.section}</span>
                        <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0' }}>{sec.description}</p>
                      </div>
                      <button type="button" onClick={() => handleRemoveTempSection(idx)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', color: '#f43f5e' }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Section Builders inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr', gap: '12px', alignItems: 'end', backgroundColor: 'rgba(7, 10, 19, 0.4)', padding: '16px', borderRadius: '8px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Legal Act</label>
                  <select className="form-control" value={tempAct} onChange={e => setTempAct(e.target.value)}>
                    <option value="BNS">BNS</option>
                    <option value="BNSS">BNSS</option>
                    <option value="BSA">BSA</option>
                    <option value="IT Act">IT Act</option>
                    <option value="NDPS Act">NDPS Act</option>
                    <option value="Motor Vehicles Act">Motor Vehicles Act</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Section Code</label>
                  <input type="text" className="form-control" placeholder="e.g. 305" value={tempSection} onChange={e => setTempSection(e.target.value)} />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Section Description</label>
                  <input type="text" className="form-control" placeholder="e.g. Punishment for theft..." value={tempDescription} onChange={e => setTempDescription(e.target.value)} />
                </div>

                <button type="button" onClick={handleAddTempSection} className="btn btn-secondary" style={{ width: '100%', height: '42px', padding: 0 }}>
                  + Append
                </button>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setShowAddForm(false); setEditingCategory(null); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : editingCategory ? 'Save Updates' : 'Create Category'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ==============================================
          CATEGORIES LIST TABLE USING ADMIN DATATABLE
          ============================================== */}
      <div className="glass-card">
        <AdminDataTable
          title="Registered Categories Registry"
          columns={[
            { key: 'name', label: 'Category Name', sortable: true, render: (cat) => <span style={{ fontWeight: '700', color: '#fff' }}>{cat.name}</span> },
            {
              key: 'sections',
              label: 'Legal Sections Covered',
              sortable: false,
              render: (cat) => (
                cat.sections && cat.sections.length > 0 ? (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {cat.sections.map((sec, idx) => (
                      <span key={idx} style={{ backgroundColor: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: '#22d3ee' }}>
                        {sec.act} Sec {sec.section}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>No sections schedules configured</span>
                )
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              sortable: false,
              align: 'right',
              render: (cat) => (
                <div style={{ display: 'inline-flex', gap: '8px' }}>
                  <button
                    onClick={() => startEdit(cat)}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    Edit Sections
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 8px', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.1)' }}
                  >
                    Delete
                  </button>
                </div>
              )
            }
          ]}
          data={categories}
          loading={loading}
          emptyMessage="No crime categories registered."
          searchPlaceholder="Search categories or legal sections..."
        />
      </div>

    </div>
  );
};

export default CrimeCategories;
