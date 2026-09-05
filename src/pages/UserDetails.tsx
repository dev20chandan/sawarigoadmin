import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Car, Loader2, CreditCard, LifeBuoy, Star, Award, MapPin, Calendar, Smartphone, Mail, UserCheck } from 'lucide-react';
import { SmartAvatar } from '../App';
import type { RootState, AppDispatch } from '../store';
import { fetchUserDetails, clearSelectedUser } from '../store/userSlice';
import axiosInstance from '../utils/axiosInstance';

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedUser, loadingDetails, errorDetails } = useSelector((reduxState: RootState) => reduxState.users);
  const [userRides, setUserRides] = useState<any[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);

  // Initial user from route state or fetched detail
  const user = selectedUser || state?.user;

  useEffect(() => {
    if (id) {
      dispatch(fetchUserDetails(id));
    }
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [id, dispatch]);

  // Fallback to fetch rides if recentRides is not populated in user detail response
  useEffect(() => {
    const userId = id || user?.id;
    if (userId && (!user?.recentRides || user.recentRides.length === 0)) {
      const fetchRides = async () => {
        setLoadingRides(true);
        try {
          const res = await axiosInstance.get(`/admin/user-rides/${userId}`);
          setUserRides(res.data?.data || res.data || []);
        } catch (e) {
          console.error('Failed to fetch user rides', e);
        } finally {
          setLoadingRides(false);
        }
      };
      fetchRides();
    }
  }, [id, user?.id, user?.recentRides]);

  if (loadingDetails && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={36} color="var(--accent-primary)" />
      </div>
    );
  }

  if (errorDetails && !user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        Failed to load user details: {errorDetails} <br /><br />
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!user) return null;

  const displayRides = (user.recentRides && user.recentRides.length > 0) ? user.recentRides : userRides;
  const stats = user.stats || {
    totalRides: user.totalRides || 0,
    completedRides: user.completedRides || 0,
    totalSpent: user.totalSpent || 0
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Navigation & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          User Details
          <span className={`badge ${(user.status || 'ACTIVE').toLowerCase()}`}>
            {user.status || 'ACTIVE'}
          </span>
          {user.hasDriverProfile && (
            <span className="badge approved" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <UserCheck size={14} /> Has Driver Profile
            </span>
          )}
        </h1>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* User Info Card */}
        <div style={{ background: 'var(--input-bg)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0 }}>
            <SmartAvatar src={user.image || user.profile?.image} name={user.name || user.profile?.name || 'User'} size={90} />
          </div>
          
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                Full Name
              </strong>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {user.name || user.profile?.name || 'Unnamed User'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                ID: {user.id}
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                <Smartphone size={14} /> Mobile Phone
              </strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>
                {user.phoneNumber || user.phone || '-'}
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                <Mail size={14} /> Email Address
              </strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {user.email || user.profile?.email || '-'}
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Gender</strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {user.gender || user.profile?.gender || '-'}
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                <Calendar size={14} /> Date of Birth
              </strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {user.dob || user.profile?.dob ? new Date(user.dob || user.profile?.dob).toLocaleDateString() : '-'}
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                <MapPin size={14} /> Address
              </strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {user.address || user.profile?.address || '-'}
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                <Award size={14} /> Referral Code
              </strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontFamily: 'monospace', fontWeight: 600 }}>
                {user.referralCode || user.profile?.referralCode || '-'}
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Joined On</strong>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleString('en-IN') : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Total Rides Requested</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.totalRides ?? 0}</div>
          </div>
          <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Completed Rides</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{stats.completedRides ?? 0}</div>
          </div>
          <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Total Spent</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>₹{(stats.totalSpent ?? 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Ride History */}
        <div style={{ background: 'var(--input-bg)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={18} /> Ride History & Recent Activity
          </h3>
          
          {(loadingRides || loadingDetails) ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
            </div>
          ) : displayRides.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
              No rides found for this user.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {displayRides.map((r: any) => (
                <div 
                  key={r.id} 
                  onClick={() => navigate('/rides/' + r.id)} 
                  style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }} 
                  className="hover-highlight"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '250px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${(r.status || 'PENDING').toLowerCase()}`}>{r.status}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : '-'}</span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {r.pickupLocation && <div><strong>Pickup:</strong> {r.pickupLocation}</div>}
                      {r.dropoffLocation && <div><strong>Dropoff:</strong> {r.dropoffLocation}</div>}
                      {r.driverName && <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}><strong>Driver:</strong> {r.driverName}</div>}
                    </div>

                    {r.review && (
                      <div style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                        <Star size={14} fill="#f59e0b" /> {r.review.rating} / 5 {r.review.comment ? `— "${r.review.comment}"` : ''}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                     <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.15rem' }}>₹{r.fare || 0}</div>
                     {r.vehicleType && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{r.vehicleType}</div>}
                     {r.paymentMethod && (
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                         {r.paymentMethod} {r.paymentStatus ? `(${r.paymentStatus})` : ''}
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wallet Transactions Section (if available) */}
        {user.walletTransactions && user.walletTransactions.length > 0 && (
          <div style={{ background: 'var(--input-bg)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} /> Wallet Transactions
            </h3>
            <div className="table-container" style={{ margin: 0, borderRadius: '8px' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card)' }}>
                    <th>Txn ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {user.walletTransactions.map((tx: any, idx: number) => (
                    <tr key={tx.id || idx}>
                      <td style={{ fontFamily: 'monospace' }}>{tx.id ? tx.id.substring(0, 10) : idx + 1}</td>
                      <td>{tx.type || tx.category || 'TRANSACTION'}</td>
                      <td style={{ fontWeight: 600, color: tx.type === 'DEBIT' ? 'var(--danger)' : 'var(--success)' }}>
                        {tx.type === 'DEBIT' ? '-' : '+'}₹{tx.amount || 0}
                      </td>
                      <td><span className={`badge ${(tx.status || 'COMPLETED').toLowerCase()}`}>{tx.status || 'COMPLETED'}</span></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-IN') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Support Tickets Section (if available) */}
        {user.supportTickets && user.supportTickets.length > 0 && (
          <div style={{ background: 'var(--input-bg)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LifeBuoy size={18} /> Support Tickets
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user.supportTickets.map((st: any) => (
                <div key={st.id} style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{st.subject || st.title || 'Support Query'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{st.description || st.message}</div>
                  </div>
                  <span className={`badge ${(st.status || 'OPEN').toLowerCase()}`}>{st.status || 'OPEN'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserDetails;
