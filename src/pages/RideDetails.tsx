import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { ArrowLeft, MapPin, User, Car, Navigation, Loader2, Trash2 } from 'lucide-react';

const RideDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [ride, setRide] = useState<any>(state?.ride || null);
  const [loading, setLoading] = useState(!state?.ride);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchRide = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/rides/${id}`);
        setRide(res.data?.data || res.data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch ride details');
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ride? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/rides/${id}`);
      navigate(-1);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete ride');
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
      <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
    </div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
      {error} <br /><br />
      <button className="btn btn-outline" onClick={() => navigate(-1)}>Go Back</button>
    </div>;
  }

  if (!ride) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No ride information available. <br /><br />
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="badge active">Completed</span>;
      case 'PENDING': return <span className="badge pending">Pending</span>;
      case 'CANCELLED': return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>Cancelled</span>;
      case 'ACCEPTED':
      case 'ARRIVED':
      case 'STARTED':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}>{status}</span>;
      default: return <span className="badge">Unknown</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Ride Details
          {getStatusBadge(ride.status)}
        </h1>
        <button onClick={handleDelete} className="btn" style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trash2 size={16} /> Delete Ride
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Ride Meta Info */}
        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Ride ID</div>
            <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{ride.id?.substring(0,8)}...</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Requested</div>
            <div style={{ fontWeight: 600 }}>{new Date(ride.createdAt).toLocaleString()}</div>
          </div>
          {ride.acceptedTime && (
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Pickup Time</div>
              <div style={{ fontWeight: 600 }}>{new Date(ride.acceptedTime).toLocaleString()}</div>
            </div>
          )}
          {ride.completedTime && (
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Drop-off Time</div>
              <div style={{ fontWeight: 600 }}>{new Date(ride.completedTime).toLocaleString()}</div>
            </div>
          )}
          {ride.fare !== undefined && ride.fare !== null && (
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Fare</div>
              <div style={{ fontWeight: 600, color: 'var(--success)' }}>₹{ride.fare}</div>
            </div>
          )}
          {ride.paymentStatus ? (
            <div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Payment Status</div>
               <div style={{ fontWeight: 600, color: ride.paymentStatus === 'COMPLETED' || ride.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--warning)' }}>{ride.paymentStatus} ({ride.paymentMethod || 'CASH'})</div>
            </div>
          ) : ride.payments && ride.payments.length > 0 && (
             <div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Payment Status</div>
               <div style={{ fontWeight: 600, color: ride.payments[0].paymentStatus === 'COMPLETED' || ride.payments[0].paymentStatus === 'PAID' ? 'var(--success)' : 'var(--warning)' }}>{ride.payments[0].paymentStatus}</div>
             </div>
          )}
          {ride.payments && ride.payments.length > 0 && ride.payments[0].updatedAt && (
             <div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Payment Time</div>
               <div style={{ fontWeight: 600 }}>{new Date(ride.payments[0].updatedAt).toLocaleString()}</div>
             </div>
          )}
          {ride.distance !== undefined && ride.distance !== null && (
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Distance</div>
              <div style={{ fontWeight: 600 }}>{ride.distance} km</div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* User Info */}
          <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} /> User Info
            </h3>
            {ride.rider ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                <div><strong>Name:</strong> <span style={{ color: 'var(--text-muted)' }}>{ride.rider?.name || ride.rider?.profile?.name || 'Unknown'}</span></div>
                <div><strong>Phone:</strong> <span style={{ color: 'var(--text-muted)' }}>{ride.rider?.phoneNumber || ride.rider?.phone || 'Unknown'}</span></div>
                <div><strong>Email:</strong> <span style={{ color: 'var(--text-muted)' }}>{ride.rider?.email || ride.rider?.profile?.email || 'N/A'}</span></div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>No user information</div>
            )}
          </div>

          {/* Driver Info */}
          <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car size={18} /> Driver Info
            </h3>
            {ride.driver ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                <div><strong>Name:</strong> <span style={{ color: 'var(--text-muted)' }}>{ride.driver?.name || ride.driver?.profile?.name || 'Unknown'}</span></div>
                <div><strong>Phone:</strong> <span style={{ color: 'var(--text-muted)' }}>{ride.driver?.phoneNumber || ride.driver?.phone || 'Unknown'}</span></div>
                {ride.driver?.vehicles && ride.driver.vehicles.length > 0 && (
                   <div><strong>Vehicle:</strong> <span style={{ color: 'var(--text-muted)' }}>{ride.driver.vehicles[0].plateNumber || 'N/A'} ({ride.driver.vehicles[0].type || 'N/A'})</span></div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>Awaiting Driver / No driver assigned</div>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
           <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Navigation size={18} /> Route Details
           </h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', paddingLeft: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', position: 'relative', paddingBottom: (ride.dropLat && ride.dropLng) ? '2rem' : '0' }}>
                {(ride.dropLat && ride.dropLng) && <div style={{ position: 'absolute', left: '17px', top: '34px', bottom: '0', width: '2px', background: 'var(--border)' }}></div>}
                
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', minWidth: '36px', height: '36px', borderRadius: '50%', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, border: '4px solid var(--input-bg)' }}>
                  <MapPin size={16} />
                </div>
                <div style={{ paddingTop: '0.2rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Pickup Location</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{ride.pickupLocation || ride.pickupAddress || 'Address not available'}</div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${ride.pickupLat},${ride.pickupLng}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}>View on Maps (Lat: {ride.pickupLat}, Lng: {ride.pickupLng})</a>
                </div>
              </div>
              
              {ride.dropLat && ride.dropLng && (
                 <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', position: 'relative' }}>
                   <div style={{ background: 'rgba(239, 68, 68, 0.1)', minWidth: '36px', height: '36px', borderRadius: '50%', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, border: '4px solid var(--input-bg)' }}>
                     <MapPin size={16} />
                   </div>
                   <div style={{ paddingTop: '0.2rem' }}>
                     <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Drop-off Location</div>
                     <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{ride.dropoffLocation || ride.dropAddress || '(Calculated Drop Location / Coordinates provided)'}</div>
                     <a href={`https://www.google.com/maps/search/?api=1&query=${ride.dropLat},${ride.dropLng}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}>View on Maps (Lat: {ride.dropLat}, Lng: {ride.dropLng})</a>
                   </div>
                 </div>
              )}
           </div>

              {ride.trackingHistory && ride.trackingHistory.length > 0 && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Tracking History</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {ride.trackingHistory.map((track: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div style={{ minWidth: '24px', height: '24px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{track.status}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(track.createdAt).toLocaleString()}</span>
                          </div>
                          {(track.latitude && track.longitude) ? (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${track.latitude},${track.longitude}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                              Location: {track.latitude}, {track.longitude}
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No GPS logged</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

      </div>
    </div>
  );
};

export default RideDetails;
