import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Plus, Edit, Trash2, X, CheckCircle, Tag, Eye } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { fetchCoupons, addCoupon, updateCoupon, deleteCoupon } from '../store/couponSlice';

const Coupons = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { coupons, loading } = useSelector((state: RootState) => state.coupons);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'FIXED',
    discountValue: 0,
    maxDiscount: 0,
    minRideFare: 0,
    validFrom: '',
    validTo: '',
    vehicleType: 'ALL',
    userType: 'ALL',
    usageLimitPerUser: 1,
    totalUsageLimit: 100,
    status: 'ACTIVE'
  });

  useEffect(() => { dispatch(fetchCoupons()); }, [dispatch]);

  const handleSubmit = async () => {
    if(!formData.code.trim()) return;

    setSaving(true);
    const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        maxDiscount: formData.type === 'PERCENTAGE' ? Number(formData.maxDiscount) : null,
        minRideFare: Number(formData.minRideFare),
        usageLimitPerUser: Number(formData.usageLimitPerUser),
        totalUsageLimit: formData.totalUsageLimit ? Number(formData.totalUsageLimit) : null,
    };

    try {
      if (editingCoupon) {
        await dispatch(updateCoupon({ id: editingCoupon.id, payload })).unwrap();
      } else {
        await dispatch(addCoupon(payload)).unwrap();
      }
      setSuccessMessage(editingCoupon ? 'Coupon updated successfully!' : 'Coupon added successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage(null);
        setSaving(false);
      }, 1500);
    } catch(err) {
      console.error(err);
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if(!couponToDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteCoupon(couponToDelete)).unwrap();
      setCouponToDelete(null);
      setDeleting(false);
    } catch(err) {
      console.error(err);
      setDeleting(false);
    }
  };

  const openAddModal = () => {
      setEditingCoupon(null);
      setFormData({
        code: '',
        type: 'FIXED',
        discountValue: 0,
        maxDiscount: 0,
        minRideFare: 0,
        validFrom: new Date().toISOString().slice(0, 16),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        vehicleType: 'ALL',
        userType: 'ALL',
        usageLimitPerUser: 1,
        totalUsageLimit: 100,
        status: 'ACTIVE'
      });
      setIsModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingCoupon(c);
    setFormData({
        code: c.code,
        type: c.type,
        discountValue: c.discountValue,
        maxDiscount: c.maxDiscount || 0,
        minRideFare: c.minRideFare,
        validFrom: new Date(c.validFrom).toISOString().slice(0, 16),
        validTo: new Date(c.validTo).toISOString().slice(0, 16),
        vehicleType: c.vehicleType,
        userType: c.userType,
        usageLimitPerUser: c.usageLimitPerUser,
        totalUsageLimit: c.totalUsageLimit || 0,
        status: c.status
    });
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={24} color="var(--accent-primary)" />
            Manage Coupons
        </h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
               <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
             </div>
          ) : (
             <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: 'var(--glass-border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '1rem' }}>Code</th>
                        <th style={{ padding: '1rem' }}>Type & Discount</th>
                        <th style={{ padding: '1rem' }}>Validity</th>
                        <th style={{ padding: '1rem' }}>Vehicle & User</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {coupons.map(c => (
                        <tr key={c.id} style={{ borderBottom: 'var(--glass-border)' }}>
                            <td style={{ padding: '1rem', fontWeight: 600 }}>{c.code}</td>
                            <td style={{ padding: '1rem' }}>
                                {c.type === 'FIXED' ? `₹${c.discountValue}` : `${c.discountValue}%`} 
                                {c.type === 'PERCENTAGE' && c.maxDiscount ? ` (Max ₹${c.maxDiscount})` : ''}
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Min Fare: ₹{c.minRideFare}</div>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                <div>From: {new Date(c.validFrom).toLocaleDateString()}</div>
                                <div>To: {new Date(c.validTo).toLocaleDateString()}</div>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                <div>Vehicles: {c.vehicleType}</div>
                                <div>Users: {c.userType}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <span className={`badge ${c.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => navigate(`/coupons/${c.id}`)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} title="View Coupon Details">
                                        <Eye size={16} />
                                    </button>
                                    <button onClick={() => openEditModal(c)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }} title="Edit Coupon">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => setCouponToDelete(c.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Delete Coupon">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {coupons.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No coupons available.
                            </td>
                        </tr>
                    )}
                </tbody>
             </table>
          )}
      </div>

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, overflowY: 'auto', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="animate-fade-in glass-panel" style={{ width: '100%', maxWidth: '800px', margin: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</h2>
               <button onClick={() => { setIsModalOpen(false); setSuccessMessage(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                 <X size={24} />
               </button>
            </div>

            {successMessage && (
              <div className="animate-fade-in" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} />
                {successMessage}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                    <label>Coupon Code</label>
                    <input type="text" className="form-control" placeholder="e.g. WELCOME100" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                    <label>Coupon Type</label>
                    <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="FIXED">Fixed Amount (₹)</option>
                        <option value="PERCENTAGE">Percentage (%)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Discount Value</label>
                    <input type="number" className="form-control" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value as any})} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {formData.type === 'PERCENTAGE' && (
                    <div className="form-group">
                        <label>Max Discount (₹)</label>
                        <input type="number" className="form-control" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value as any})} />
                    </div>
                )}
                <div className="form-group" style={{ gridColumn: formData.type === 'FIXED' ? 'span 2' : 'span 1' }}>
                    <label>Min Ride Fare (₹)</label>
                    <input type="number" className="form-control" value={formData.minRideFare} onChange={e => setFormData({...formData, minRideFare: e.target.value as any})} />
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                    <label>Valid From</label>
                    <input type="datetime-local" className="form-control" value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Valid To</label>
                    <input type="datetime-local" className="form-control" value={formData.validTo} onChange={e => setFormData({...formData, validTo: e.target.value})} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                    <label>Applicable Vehicle</label>
                    <select className="form-control" value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})}>
                        <option value="ALL">All</option>
                        <option value="BIKE">Bike</option>
                        <option value="AUTO">Auto</option>
                        <option value="CAB">Cab</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>User Type</label>
                    <select className="form-control" value={formData.userType} onChange={e => setFormData({...formData, userType: e.target.value})}>
                        <option value="ALL">All Users</option>
                        <option value="NEW">New Users</option>
                        <option value="EXISTING">Existing Users</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group">
                    <label>Usage Limit Per User</label>
                    <input type="number" className="form-control" value={formData.usageLimitPerUser} onChange={e => setFormData({...formData, usageLimitPerUser: e.target.value as any})} />
                </div>
                <div className="form-group">
                    <label>Total Usage Limit</label>
                    <input type="number" className="form-control" value={formData.totalUsageLimit} onChange={e => setFormData({...formData, totalUsageLimit: e.target.value as any})} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
               <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setIsModalOpen(false); setSuccessMessage(null); setSaving(false); }} disabled={saving}>Cancel</button>
               <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={handleSubmit} disabled={saving}>
                 {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                 {saving ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Save Coupon')}
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {couponToDelete && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, overflowY: 'auto', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="animate-fade-in glass-panel" style={{ width: '100%', maxWidth: '400px', margin: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', textAlign: 'center' }}>
            <Trash2 size={48} color="var(--danger)" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Delete Coupon?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Are you sure you want to delete this coupon? This action cannot be undone.</p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setCouponToDelete(null)} disabled={deleting}>Cancel</button>
               <button className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={confirmDelete} disabled={deleting}>
                 {deleting ? <Loader2 size={18} className="animate-spin" /> : null}
                 {deleting ? 'Deleting...' : 'Delete'}
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Coupons;
