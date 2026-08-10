
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, Tag, Calendar, Users, Car, AlertCircle, Clock } from 'lucide-react';
import { SmartAvatar } from '../App';
import type { RootState } from '../store';

const CouponDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const coupons = useSelector((reduxState: RootState) => reduxState.coupons.coupons);
  const coupon = coupons.find((c: any) => c.id === state?.coupon?.id) || state?.coupon;
  if (!coupon) {
      return (
         <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
             <AlertCircle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
             <h2>Coupon Not Found</h2>
             <button className="btn btn-primary" onClick={() => navigate('/coupons')} style={{ marginTop: '1rem' }}>Go Back</button>
         </div>
      );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', color: 'var(--text-muted)', width: 'fit-content' }} onClick={() => navigate('/coupons')} className="hover-text-primary">
        <ChevronLeft size={20} /> Back to Coupons
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Tag size={28} color="var(--accent-primary)" />
            {coupon.code}
            <span className={`badge ${coupon.status === 'ACTIVE' ? 'active' : 'inactive'}`} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                {coupon.status}
            </span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Main Info Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: 'var(--glass-border)', paddingBottom: '0.5rem', color: 'var(--text-muted)' }}>Overview</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Discount Amount:</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                        {coupon.type === 'FIXED' ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`}
                        {coupon.type === 'PERCENTAGE' && coupon.maxDiscount ? ` (Max ₹${coupon.maxDiscount})` : ''}
                      </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Minimum Ride Fare:</span>
                      <strong>₹{coupon.minRideFare}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}><Calendar size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> Valid From:</span>
                      <span>{new Date(coupon.validFrom).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}><Clock size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> Valid To:</span>
                      <span>{new Date(coupon.validTo).toLocaleString()}</span>
                  </div>
              </div>
          </div>

          {/* Limits & Rules */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: 'var(--glass-border)', paddingBottom: '0.5rem', color: 'var(--text-muted)' }}>Rules & Limits</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}><Car size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> Vehicle Type:</span>
                      <strong>{coupon.vehicleType}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}><Users size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> Target Audience:</span>
                      <strong>{coupon.userType === 'ALL' ? 'All Users' : (coupon.userType === 'NEW' ? 'New Users Only' : 'Existing Users Only')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Limit Per User:</span>
                      <strong>{coupon.usageLimitPerUser}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Usage Tracker:</span>
                      <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '1.1rem' }}>{coupon.totalUsed}</strong> / {coupon.totalUsageLimit || 'Unlimited'}
                          <div style={{ width: '100px', height: '6px', background: 'var(--bg-card)', borderRadius: '3px', marginTop: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                              <div style={{ 
                                  height: '100%', 
                                  background: 'var(--accent-primary)', 
                                  width: coupon.totalUsageLimit ? `${Math.min(100, (coupon.totalUsed / coupon.totalUsageLimit) * 100)}%` : '0%'
                              }}></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '1rem' }}>Recent Usage History</h3>
      
      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
          {coupon.usages && coupon.usages.length > 0 ? (
             <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: 'var(--glass-border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '1rem' }}>User</th>
                        <th style={{ padding: '1rem' }}>Phone</th>
                        <th style={{ padding: '1rem' }}>Usage Count</th>
                        <th style={{ padding: '1rem' }}>Last Used At</th>
                    </tr>
                </thead>
                <tbody>
                    {coupon.usages.map((u: any) => (
                        <tr key={u.id} style={{ borderBottom: 'var(--glass-border)' }}>
                            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <SmartAvatar src={u.user?.profile?.image} name={u.user?.profile?.name || u.user?.phoneNumber} size={32} />
                                <span style={{ fontWeight: 600 }}>{u.user?.profile?.name || 'Anonymous User'}</span>
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                {u.user?.phoneNumber}
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <strong>{u.count}</strong> time(s)
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                {new Date(u.updatedAt).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  This coupon has not been used by anyone yet.
              </div>
          )}
      </div>

    </div>
  );
};

export default CouponDetails;
