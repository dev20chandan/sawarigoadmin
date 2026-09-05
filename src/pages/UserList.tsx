import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Loader2, Edit, Trash2, X, CheckCircle } from 'lucide-react';
import { SmartAvatar } from '../App';
import type { RootState, AppDispatch } from '../store';
import { fetchUsers, deleteUser, updateUser } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state: RootState) => state.users);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', status: '', phoneNumber: '', gender: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(u => {
    const name = u.name || u.profile?.name || '';
    const email = u.email || u.profile?.email || '';
    const phone = u.phoneNumber || u.phone || '';
    const code = u.userCode || '';
    const searchLower = search.toLowerCase();
    return (
      phone.includes(search) ||
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      code.toLowerCase().includes(searchLower)
    );
  });

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await dispatch(deleteUser(userToDelete)).unwrap();
      setUserToDelete(null);
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateUser({ id: editingUser.id, data: formData })).unwrap();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setIsModalOpen(false);
      }, 2000);
    } catch (e) {
        alert('Failed to update user: ' + JSON.stringify(e));
    } finally { 
        setIsSaving(false); 
    }
  };

  if (loading && users.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
    </div>;
  }

  if (error) {
    return <div style={{ color: 'var(--danger)', padding: '2rem', textAlign: 'center' }}>Failed to load users: {error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by code, name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
        </div>
      </div>

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
              const userName = user.name || user.profile?.name || 'Not Provided';
              const userEmail = user.email || user.profile?.email || '-';
              const userImage = user.image || user.profile?.image;
              const userGender = user.gender || user.profile?.gender || '';
              const resolvedCode = user.userCode || `U-${String(index + 1).padStart(2, '0')}`;

              return (
                <tr key={user.id} onClick={() => navigate('/users/' + user.id, { state: { user: { ...user, name: userName, email: userEmail, image: userImage, gender: userGender, resolvedCode } } })} style={{ cursor: 'pointer' }} className="hover-highlight">
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{resolvedCode}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <SmartAvatar src={userImage} name={userName !== 'Not Provided' ? userName : 'User'} size={36} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }} title={userName}>
                      {userName.length > 25 ? userName.substring(0, 25) + '...' : userName}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{user.phoneNumber || user.phone || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{userEmail}</td>
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
                        setFormData({
                          name: user.name || user.profile?.name || '',
                          email: user.email || user.profile?.email || '',
                          gender: user.gender || user.profile?.gender || '',
                          status: user.status || 'PENDING',
                          phoneNumber: user.phoneNumber || user.phone || ''
                        });
                        setIsModalOpen(true);
                      }} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} title="Edit User">
                        <Edit size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setUserToDelete(user.id); }} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem' }} title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      


      {isModalOpen && editingUser && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Edit User</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

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

            <button onClick={handleSave} disabled={isSaving || !!successMsg} className="btn btn-primary" style={{ width: '100%', opacity: (isSaving || !!successMsg) ? 0.7 : 1 }}>
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
          <div className="glass-panel animate-fade-in" style={{ width: '380px', padding: '2rem', textAlign: 'center' }}>
            <Trash2 size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Are you sure?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setUserToDelete(null)} className="btn btn-outline" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
              <button onClick={confirmDelete} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', background: 'var(--danger)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserList;
