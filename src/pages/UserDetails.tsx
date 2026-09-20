import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';
import { ArrowLeft, Car, Loader2, Edit, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { SmartAvatar } from '../App';
import type { AppDispatch } from '../store';
import { deleteUser, updateUser, fetchUsers } from '../store/userSlice';

const UserDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [user, setUser] = useState<any>(state?.user || null);
  const [userRides, setUserRides] = useState<any[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);

  // Edit / Delete State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: '',
    phoneNumber: '',
    gender: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/users');
    } else {
      setFormData({
        name: user.profile?.name || '',
        email: user.profile?.email || '',
        status: user.status || 'ACTIVE',
        phoneNumber: user.phoneNumber || '',
        gender: user.profile?.gender || ''
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.id) {
      const fetchRides = async () => {
        setLoadingRides(true);
        try {
          const res = await axiosInstance.get(`/admin/user-rides/${user.id}`);
          setUserRides(res.data?.data || res.data || []);
        } catch (e) {
          console.error('Failed to fetch user rides', e);
        } finally {
          setLoadingRides(false);
        }
      };
      fetchRides();
    }
  }, [user?.id]);

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await dispatch(updateUser({ id: user.id, data: formData })).unwrap();
      const updatedData = res?.data || res;
      setUser((prev: any) => ({
        ...prev,
        ...updatedData,
        profile: { ...prev.profile, ...updatedData.profile }
      }));
      setSaveSuccessMsg('User profile updated successfully!');
      dispatch(fetchUsers());
      setTimeout(() => {
        setSaveSuccessMsg('');
        setIsEditModalOpen(false);
      }, 1500);
    } catch (e: any) {
      console.error('Failed to update user', e);
      setSaveError(typeof e === 'string' ? e : (e?.message || 'Failed to update user'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await dispatch(deleteUser(user.id)).unwrap();
      dispatch(fetchUsers());
      navigate('/users');
    } catch (e: any) {
      console.error('Failed to delete user', e);
      setDeleteError(typeof e === 'string' ? e : (e?.message || 'Failed to delete user'));
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/users')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            User Details
            <span className={`badge ${(user.status || 'PENDING').toLowerCase()}`}>
              {user.status || 'PENDING'}
            </span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => {
              setFormData({
                name: user.profile?.name || '',
                email: user.profile?.email || '',
                status: user.status || 'ACTIVE',
                phoneNumber: user.phoneNumber || '',
                gender: user.profile?.gender || ''
              });
              setSaveError(null);
              setSaveSuccessMsg('');
              setIsEditModalOpen(true);
            }}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
          >
            <Edit size={16} /> Edit User
          </button>
          <button
            onClick={() => { setDeleteError(null); setIsDeleteModalOpen(true); }}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
          >
            <Trash2 size={16} /> Delete User
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* User Info Card */}
        <div style={{ background: 'var(--input-bg)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0 }}>
            <SmartAvatar src={user.profile?.image} name={user.profile?.name || 'User'} size={80} />
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Name</strong>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>{user.profile?.name || 'Unnamed User'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.resolvedCode || user.userCode || 'N/A'}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Email</strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{user.profile?.email || '-'}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Mobile</strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{user.phoneNumber || '-'}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Gender</strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{user.profile?.gender || '-'}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Joined On</strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Ride History */}
        <div style={{ background: 'var(--input-bg)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={18} /> Ride History
          </h3>
          
          {loadingRides ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
            </div>
          ) : userRides.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
              No rides found for this user.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {userRides.map((r: any) => (
                <div key={r.id} onClick={() => navigate('/rides/' + r.id)} style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover-highlight">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{new Date(r.createdAt).toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      <span className={`badge ${(r.status || 'PENDING').toLowerCase()}`}>{r.status}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                     <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{r.fare || 0}</div>
                     <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.distance || '0'} km</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '420px', padding: '2rem', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit User</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {saveError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <AlertCircle size={18} />
                {saveError}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
              <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
              <input type="text" className="form-control" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Gender</label>
              <select className="form-control" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}>
                <option value="">Select Gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
              <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <button onClick={handleSave} disabled={isSaving || !!saveSuccessMsg} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', opacity: (isSaving || !!saveSuccessMsg) ? 0.7 : 1 }}>
              {saveSuccessMsg ? (
                <><CheckCircle size={18} /> {saveSuccessMsg}</>
              ) : isSaving ? (
                <><Loader2 className="animate-spin" size={18} /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '380px', padding: '2rem', textAlign: 'center', background: 'var(--bg-main)' }}>
            <Trash2 size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Are you sure?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            {deleteError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-outline" style={{ flex: 1, padding: '0.75rem' }} disabled={isDeleting}>Cancel</button>
              <button onClick={handleDelete} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', background: 'var(--danger)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }} disabled={isDeleting}>
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserDetails;