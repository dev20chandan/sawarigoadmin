import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Loader2, Edit, Trash2, X, AlertCircle, Users, Car, ArrowRight, CheckCircle } from 'lucide-react';
import { SmartAvatar } from '../App';
import type { RootState, AppDispatch } from '../store';
import { fetchUsers, deleteUser, updateUser } from '../store/userSlice';
import { fetchDrivers } from '../store/driverSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const UserList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { users, loading: usersLoading, error } = useSelector((state: RootState) => state.users);
  const { drivers, loading: driversLoading } = useSelector((state: RootState) => state.drivers);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'incomplete_users' | 'incomplete_drivers'>(() => {
    if (location.state?.filter === 'INCOMPLETE') {
      return location.state.activeTab === 'drivers' ? 'incomplete_drivers' : 'incomplete_users';
    }
    return 'all';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', status: '', phoneNumber: '', gender: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDrivers());
  }, [dispatch]);

  // Handle location state updates if user navigates back and forth
  useEffect(() => {
    if (location.state?.filter === 'INCOMPLETE') {
      setActiveTab(location.state.activeTab === 'drivers' ? 'incomplete_drivers' : 'incomplete_users');
    }
  }, [location.state]);

  const isIncompleteUser = (u: any) =>
    !u.profile?.name || !u.profile?.email || u.status === 'PENDING' || !u.phoneNumber;

  const isIncompleteDriver = (d: any) =>
    !d.name || !d.phone || d.status === 'PENDING' || d.status === 'INCOMPLETE' || !d.vehicleDetails?.plateNumber || !d.vehicle;

  const incompleteUsers = users.filter(isIncompleteUser);
  const incompleteDrivers = drivers.filter(isIncompleteDriver);

  // Users displayed based on active tab
  const baseUsers = activeTab === 'incomplete_users' ? incompleteUsers : users;

  const filteredUsers = baseUsers.filter(u =>
    (u.phoneNumber || '').includes(search) ||
    (u.profile?.name && u.profile.name.toLowerCase().includes(search.toLowerCase())) ||
    (u.userCode && u.userCode.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredIncompleteDrivers = incompleteDrivers.filter(d =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.phone || d.phoneNumber || '').includes(search) ||
    (d.userCode || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.vehicleDetails?.plateNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await dispatch(deleteUser(userToDelete)).unwrap();
      setUserToDelete(null);
      dispatch(fetchUsers());
    } catch (e: any) {
      console.error('Failed to delete user', e);
      setDeleteError(typeof e === 'string' ? e : (e?.message || 'Failed to delete user'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await dispatch(updateUser({ id: editingUser.id, data: formData })).unwrap();
      setSuccessMsg('Profile updated successfully!');
      dispatch(fetchUsers());
      setTimeout(() => {
        setSuccessMsg('');
        setIsModalOpen(false);
      }, 1500);
    } catch (e: any) {
      console.error('Failed to update user', e);
      setSaveError(typeof e === 'string' ? e : (e?.message || 'Failed to update user'));
    } finally { 
      setIsSaving(false); 
    }
  };

  const loading = activeTab === 'incomplete_drivers' ? driversLoading : usersLoading;

  if (loading && users.length === 0 && drivers.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
      </div>
    );
  }

  if (error) {
    return <div style={{ color: 'var(--danger)', padding: '2rem', textAlign: 'center' }}>Failed to load users: {error}</div>;
  }

  return (
    <div className="animate-fade-in">
      
      {/* Top Controls: Tabs + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'all' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'all' ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} /> All Users ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('incomplete_users')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'incomplete_users' ? 'var(--danger)' : 'transparent',
              color: activeTab === 'incomplete_users' ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} /> Incomplete Users ({incompleteUsers.length})
          </button>

          <button
            onClick={() => setActiveTab('incomplete_drivers')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'incomplete_drivers' ? '#f59e0b' : 'transparent',
              color: activeTab === 'incomplete_drivers' ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Car size={16} /> Incomplete Drivers ({incompleteDrivers.length})
          </button>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem', borderRadius: '30px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={activeTab === 'incomplete_drivers' ? "Search incomplete drivers..." : "Search by code, name, or phone..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', minWidth: '220px' }}
            />
          </div>
        </div>
      </div>

      {/* Table Display */}
      {activeTab === 'incomplete_drivers' ? (
        /* Incomplete Drivers Table */
        <div className="glass-panel table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center', whiteSpace: 'nowrap' }}>Dr Code</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Image</th>
                <th style={{ textAlign: 'left', paddingLeft: '1rem' }}>Driver Name</th>
                <th style={{ textAlign: 'center' }}>Mobile</th>
                <th style={{ textAlign: 'left', paddingLeft: '1rem' }}>Vehicle</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncompleteDrivers.map((driver: any, index: number) => {
                const driverCode = driver.userCode || `D-${String(index + 1).padStart(2, '0')}`;
                return (
                  <tr
                    key={driver.id}
                    onClick={() => navigate(`/drivers/${driver.id}`, { state: { driver } })}
                    style={{ cursor: 'pointer' }}
                    className="hover-highlight"
                  >
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {driverCode}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <SmartAvatar src={driver.profile?.image || driver.image} name={driver.name || 'Driver'} size={36} />
                      </div>
                    </td>
                    <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {driver.name || <span style={{ color: 'var(--danger)', fontStyle: 'italic' }}>Name Missing</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{driver.profile?.email || 'No email provided'}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {driver.phone || driver.phoneNumber || '-'}
                    </td>
                    <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>
                        {driver.vehicleDetails?.type || driver.vehicle || <span style={{ color: 'var(--danger)' }}>No Vehicle Details</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {driver.vehicleDetails?.plateNumber || 'No plate registered'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${driver.status?.toLowerCase() || 'pending'}`} style={{ textTransform: 'capitalize' }}>
                        {driver.status?.toLowerCase() || 'incomplete'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/drivers/${driver.id}`, { state: { driver } });
                        }}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        Review <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredIncompleteDrivers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No incomplete drivers found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Users Table (All or Incomplete Users) */
        <div className="glass-panel table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center', whiteSpace: 'nowrap' }}>User Code</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Image</th>
                <th style={{ textAlign: 'left', paddingLeft: '1rem' }}>User Name</th>
                <th style={{ textAlign: 'center' }}>Mobile</th>
                <th style={{ textAlign: 'center' }}>Email</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const fallbackCode = `U-${String(index + 1).padStart(2, '0')}`;
                const resolvedCode = user.userCode || fallbackCode;
                const isIncomplete = isIncompleteUser(user);
                return (
                  <tr
                    key={user.id}
                    onClick={() => navigate('/users/' + user.id, { state: { user: { ...user, resolvedCode } } })}
                    style={{ cursor: 'pointer' }}
                    className="hover-highlight"
                  >
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {resolvedCode}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SmartAvatar src={user.profile?.image} name={user.profile?.name || 'User'} size={36} />
                      </div>
                    </td>
                    <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)', textTransform: 'capitalize' }} title={user.profile?.name || 'Not Provided'}>
                        {user.profile?.name ? (
                          user.profile.name.length > 25 ? user.profile.name.substring(0, 25) + '...' : user.profile.name
                        ) : (
                          <span style={{ color: 'var(--danger)', fontStyle: 'italic' }}>Name Not Provided</span>
                        )}
                      </div>
                      {isIncomplete && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 500 }}>
                          Incomplete Profile
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>{user.phoneNumber || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {user.profile?.email || <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${(user.status || 'PENDING').toLowerCase()}`}>
                        {user.status || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setEditingUser(user);
                          setFormData({ name: user.profile?.name || '', email: user.profile?.email || '', gender: user.profile?.gender || '', status: user.status || 'ACTIVE', phoneNumber: user.phoneNumber || '' });
                          setSaveError(null);
                          setSuccessMsg('');
                          setIsModalOpen(true);
                        }} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} title="Edit User">
                          <Edit size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setUserToDelete(user.id); setDeleteError(null); }} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem' }} title="Delete User">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {activeTab === 'incomplete_users' ? 'No incomplete users found' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && editingUser && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '420px', padding: '2rem', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit User</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
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

            <button onClick={handleSave} disabled={isSaving || !!successMsg} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', opacity: (isSaving || !!successMsg) ? 0.7 : 1 }}>
              {successMsg ? (
                <><CheckCircle size={18} /> {successMsg}</>
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

      {userToDelete && createPortal(
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
              <button onClick={() => setUserToDelete(null)} className="btn btn-outline" style={{ flex: 1, padding: '0.75rem' }} disabled={isDeleting}>Cancel</button>
              <button onClick={confirmDelete} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', background: 'var(--danger)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }} disabled={isDeleting}>
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

export default UserList;