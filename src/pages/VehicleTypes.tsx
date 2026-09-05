import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Trash2, Loader2, X } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { API_BASE_URL } from '../config';

const VehicleTypes = () => {
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [deleteData, setDeleteData] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    baseFare: '',
    perKmRate: '',
    seats: '4',
    image: '',
    displayOrder: '0'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/vehicles/types');
      // The API returns { statusCode, message, body }
      setVehicleTypes(res.data?.body || []);
    } catch (err) {
      console.error('Failed to fetch vehicle types', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!formData.image) {
      alert('Vehicle image is required. Please upload an image first.');
      return;
    }
    
    try {
      const payload = {
        name: formData.name,
        label: formData.label,
        description: formData.description,
        seats: Number(formData.seats),
        baseFare: Number(formData.baseFare),
        perKmRate: Number(formData.perKmRate),
        image: formData.image,
        displayOrder: Number(formData.displayOrder || 0)
      };

      if (editingType) {
        await axiosInstance.put(`/vehicles/categories/${editingType.id || editingType._id}`, payload);
      } else {
        await axiosInstance.post('/vehicles/categories', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save vehicle type', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    try {
      await axiosInstance.delete(`/vehicles/categories/${deleteData}`);
      fetchData();
    } catch (err: any) {
      console.error('Failed to delete vehicle type', err);
      // Alert the exact error from the backend so the user knows why it failed
      alert(err.response?.data?.message || 'Failed to delete vehicle type. It may be hardcoded or already deleted.');
    } finally {
      setDeleteData(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <button
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem' }}
          onClick={() => {
            setEditingType(null);
            setFormData({ name: '', label: '', description: '', baseFare: '', perKmRate: '', seats: '4', image: '', displayOrder: '0' });
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Vehicle Type
        </button>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Image</th>
              <th style={{ textAlign: 'center', width: '60px' }}>Order</th>
              <th style={{ textAlign: 'left', paddingLeft: '1rem' }}>Vehicle Name</th>
              <th style={{ textAlign: 'center' }}>Seats</th>
              <th style={{ textAlign: 'center' }}>Base Fare</th>
              <th style={{ textAlign: 'center' }}>Per Km Rate</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {vehicleTypes.map((vType: any) => (
              <tr key={vType.id || vType.name}>
                <td style={{ textAlign: 'center' }}>
                  {vType.image ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <img
                        src={vType.image.startsWith('http') ? vType.image : `${import.meta.env.VITE_API_URL || API_BASE_URL}${vType.image.startsWith('/') ? '' : '/'}${vType.image}`}
                        alt="icon"
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>N/A</div>
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--accent-primary)' }}>{vType.displayOrder || 0}</td>
                <td style={{ textAlign: 'left', paddingLeft: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>
                  {vType.name}
                </td>
                <td style={{ textAlign: 'center' }}>{vType.seats}</td>
                <td style={{ textAlign: 'center' }}>₹{vType.baseFare}</td>
                <td style={{ textAlign: 'center' }}>₹{vType.perKmRate}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        setEditingType(vType);
                        setFormData({
                          name: vType.name || '',
                          label: vType.label || '',
                          description: vType.description || '',
                          baseFare: vType.baseFare || '',
                          perKmRate: vType.perKmRate || '',
                          seats: vType.seats || '4',
                          image: vType.image || '',
                          displayOrder: vType.displayOrder !== undefined ? String(vType.displayOrder) : '0'
                        });
                        setIsModalOpen(true);
                      }}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteData(vType.id || vType._id || vType.name)}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {vehicleTypes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No vehicle types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="animate-fade-in glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingType ? 'Edit Vehicle Type' : 'Add Vehicle Type'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--input-bg)', border: '1px dashed var(--border)', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                {formData.image ? (
                  <>
                    <img src={formData.image.startsWith('http') ? formData.image : `${import.meta.env.VITE_API_URL || API_BASE_URL}${formData.image.startsWith('/') ? '' : '/'}${formData.image}`} alt="Type" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '4px', display: 'flex', justifyContent: 'center' }}>
                      <Edit size={14} color="#fff" />
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>Upload Icon</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e: any) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('file', file);
                    try {
                      const res = await axiosInstance.post('/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                      setFormData(prev => ({ ...prev, image: res.data.url }));
                    } catch (err) {
                      console.error('Upload failed', err);
                    }
                  }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Category Icon</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vehicle Name</label>
              <input
                className="input"
                placeholder="Vehicle Name (e.g. SEDAN)"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Display Label</label>
              <input
                className="input"
                placeholder="Display Label (e.g. Sedan (4 Seats))"
                value={formData.label}
                onChange={e => setFormData({ ...formData, label: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description</label>
              <input
                className="input"
                placeholder="Description (e.g. 4 Seater AC ride...)"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Base Fare</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Base Fare (₹)"
                  value={formData.baseFare}
                  onChange={e => setFormData({ ...formData, baseFare: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Per Km Rate</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Per Km Rate (₹)"
                  value={formData.perKmRate}
                  onChange={e => setFormData({ ...formData, perKmRate: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Seats</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Seats"
                  value={formData.seats}
                  onChange={e => setFormData({ ...formData, seats: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order Index</label>
                <input
                  type="number"
                  className="input"
                  placeholder="Order"
                  value={formData.displayOrder}
                  onChange={e => setFormData({ ...formData, displayOrder: e.target.value })}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn" style={{ flex: 1, background: 'var(--input-bg)', color: 'var(--text-main)' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>
                {editingType ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {deleteData && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '380px', padding: '2rem', textAlign: 'center', background: 'var(--bg-main)' }}>
            <Trash2 size={48} color="var(--danger)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Are you sure?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this vehicle type? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setDeleteData(null)} className="btn btn-outline" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
              <button onClick={handleDelete} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', background: 'var(--danger)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default VehicleTypes;
