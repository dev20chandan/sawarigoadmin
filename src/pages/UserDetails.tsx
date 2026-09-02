import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { ArrowLeft, Car, Loader2 } from 'lucide-react';
import { SmartAvatar } from '../App';

const UserDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // If user state is passed from list we can use it initially
  const [user] = useState<any>(state?.user || null);
  const [userRides, setUserRides] = useState<any[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/users');
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button onClick={() => navigate('/users')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          User Details
          <span className={`badge ${(user.status || 'PENDING').toLowerCase()}`}>
            {user.status || 'PENDING'}
          </span>
        </h1>
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
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.profile?.name || 'Unnamed User'}</div>
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
    </div>
  );
};

export default UserDetails;
