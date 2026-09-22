import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
  MapPin, User, Car, Navigation, Loader2, Trash2, CheckCircle,
  Clock, XCircle, Shield, Phone, Mail, IndianRupee,
  Calendar
} from 'lucide-react';
import { SmartAvatar } from '../App';

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
        if (!state?.ride) setLoading(true);
        const res = await axiosInstance.get(`/rides/${id}`);
        const fetchedData = res.data?.data || res.data;
        if (fetchedData && typeof fetchedData === 'object') {
          setRide(fetchedData);
        }
        setError(null);
      } catch (err: any) {
        console.warn('API /rides/:id not reachable, using state/cached ride data', err);
        // Only set error if no ride data was passed via navigation state
        if (!state?.ride) {
          setError(err.response?.data?.message || 'Failed to fetch ride details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id, state?.ride]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ride record? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/rides/${id}`);
      navigate('/rides');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete ride');
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return <span className="badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.8rem' }}><CheckCircle size={14} /> Completed</span>;
      case 'PENDING':
        return <span className="badge pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.8rem' }}><Clock size={14} /> Pending</span>;
      case 'CANCELLED':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.8rem' }}><XCircle size={14} /> Cancelled</span>;
      case 'ACCEPTED':
      case 'ARRIVED':
      case 'STARTED':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', padding: '0.35rem 0.8rem' }}>{s}</span>;
      default:
        return <span className="badge" style={{ padding: '0.35rem 0.8rem' }}>{status || 'Unknown'}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
        <Loader2 className="animate-spin" size={36} color="var(--accent-primary)" />
      </div>
    );
  }

  if (error && !ride) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>
        <div style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{error}</div>
        <button className="btn btn-outline" onClick={() => navigate('/rides')}>Back to Ride History</button>
      </div>
    );
  }

  if (!ride) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ marginBottom: '1rem' }}>No ride information available.</div>
        <button className="btn btn-outline" onClick={() => navigate('/rides')}>Back to Ride History</button>
      </div>
    );
  }

  const uniqueRideId = ride.rideCode || ride.uniqueRideId || ride.bookingId || ('SRG-' + (ride.id?.length > 8 ? ride.id.slice(-6).toUpperCase() : (ride.id || 'N/A')));
  const vehicleName = ride.vehicleName || ride.vehicleModel || ride.driver?.vehicles?.[0]?.model || ride.vehicleType || ride.driver?.vehicle || 'Standard Vehicle';
  const vehiclePlate = ride.driver?.vehicles?.[0]?.plateNumber || ride.vehiclePlate || ride.vehicleDetails?.plateNumber || 'No plate registered';
  const vehicleType = ride.vehicleType || ride.driver?.vehicles?.[0]?.type || 'CAR';

  const riderName = ride.rider?.profile?.name || 'Unknown User';
  const riderPhone = ride.rider?.phoneNumber || '-';
  const riderEmail = ride.rider?.profile?.email || 'N/A';
  const riderCode = ride.rider?.userCode || 'N/A';

  const driverName = ride.driver?.profile?.name || ride.driver?.name || 'Awaiting Driver';
  const driverPhone = ride.driver?.phoneNumber || ride.driver?.phone || '-';
  const driverCode = ride.driver?.userCode || 'N/A';

  const paymentStatus = ride.paymentStatus || (ride.payments && ride.payments[0]?.paymentStatus) || 'COMPLETED';
  const paymentMethod = ride.paymentMethod || 'CASH';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header Actions (No duplicate Back button) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                {uniqueRideId}
              </h1>
              {getStatusBadge(ride.status)}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Database ID: <span style={{ fontFamily: 'monospace' }}>{ride.id}</span> • {vehicleName}
            </div>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="btn"
          style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}
        >
          <Trash2 size={16} /> Delete Ride
        </button>
      </div>

      {/* Main Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Metric Highlight Ribbon */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Total Fare</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-primary)' }}>₹{ride.fare || 0}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Distance</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>{ride.distance ? `${ride.distance} km` : 'N/A'}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Payment Status</span>
            <span style={{
              display: 'inline-block',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: paymentStatus === 'COMPLETED' || paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: paymentStatus === 'COMPLETED' || paymentStatus === 'PAID' ? 'var(--success)' : 'var(--warning)',
              border: `1px solid ${paymentStatus === 'COMPLETED' || paymentStatus === 'PAID' ? 'var(--success)' : 'var(--warning)'}`
            }}>
              {paymentStatus} ({paymentMethod})
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Booking Date</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {new Date(ride.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 3-Column Info Cards: User, Driver, Vehicle */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {/* User Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} /> User Info
            </h3>
            {ride.rider ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <SmartAvatar src={ride.rider?.profile?.image} name={riderName} size={48} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{riderName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={13} /> {riderPhone}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={13} /> {riderEmail}
                  </div>
                  {riderCode !== 'N/A' && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                      Code: {riderCode}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No user information attached.</div>
            )}
          </div>

          {/* Driver Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car size={18} /> Driver Info
            </h3>
            {ride.driver ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <SmartAvatar src={ride.driver?.profile?.image || ride.driver?.image} name={driverName} size={48} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{driverName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={13} /> {driverPhone}
                  </div>
                  {driverCode !== 'N/A' && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Captain Code: {driverCode}
                    </div>
                  )}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Status: <span style={{ textTransform: 'capitalize', color: 'var(--text-main)', fontWeight: 500 }}>{ride.driver?.status || 'Active'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
                Awaiting Driver / No driver assigned to this trip.
              </div>
            )}
          </div>

          {/* Vehicle Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} /> Vehicle Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle Name:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{vehicleName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Plate Number:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{vehiclePlate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category / Type:</span>
                <span style={{ fontWeight: 500, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{vehicleType}</span>
              </div>
              {ride.driver?.vehicles?.[0]?.brand && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Brand / Model:</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{ride.driver.vehicles[0].brand} {ride.driver.vehicles[0].model}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Route Details Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={18} /> Route & Coordinates
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '0.5rem' }}>
            {/* Pickup */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', position: 'relative', paddingBottom: (ride.dropLat || ride.dropoffLocation || ride.dropAddress) ? '2rem' : '0' }}>
              {(ride.dropLat || ride.dropoffLocation || ride.dropAddress) && (
                <div style={{ position: 'absolute', left: '17px', top: '34px', bottom: '0', width: '2px', background: 'var(--border)' }}></div>
              )}
              
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', minWidth: '36px', height: '36px', borderRadius: '50%', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, border: '4px solid var(--input-bg)' }}>
                <MapPin size={16} />
              </div>
              <div style={{ paddingTop: '0.2rem', flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-main)' }}>Pickup Location</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                  {ride.pickupLocation || ride.pickupAddress || 'Address not available'}
                </div>
                {ride.pickupLat && ride.pickupLng && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${ride.pickupLat},${ride.pickupLng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}
                  >
                    View on Google Maps (Lat: {ride.pickupLat}, Lng: {ride.pickupLng})
                  </a>
                )}
              </div>
            </div>
            
            {/* Drop-off */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', position: 'relative' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', minWidth: '36px', height: '36px', borderRadius: '50%', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, border: '4px solid var(--input-bg)' }}>
                <MapPin size={16} />
              </div>
              <div style={{ paddingTop: '0.2rem', flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-main)' }}>Destination / Drop-off Location</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '0.4rem' }}>
                  {ride.dropoffLocation || ride.dropAddress || (ride.dropLat ? `Coordinates: ${ride.dropLat}, ${ride.dropLng}` : 'Destination not specified')}
                </div>
                {ride.dropLat && ride.dropLng && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${ride.dropLat},${ride.dropLng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}
                  >
                    View on Google Maps (Lat: {ride.dropLat}, Lng: {ride.dropLng})
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fare Breakdown & Lifecycle Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Fare & Financials */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IndianRupee size={18} /> Fare & Payment Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              {ride.baseFare !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Base Fare:</span>
                  <span>₹{ride.baseFare}</span>
                </div>
              )}
              {ride.distanceFare !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Distance / Time Charge:</span>
                  <span>₹{ride.distanceFare}</span>
                </div>
              )}
              {ride.surgeMultiplier && ride.surgeMultiplier > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--warning)' }}>Surge Multiplier:</span>
                  <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{ride.surgeMultiplier}x</span>
                </div>
              )}
              {ride.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--success)' }}>Discount:</span>
                  <span style={{ color: 'var(--success)' }}>-₹{ride.discountAmount}</span>
                </div>
              )}
              {ride.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tax / GST:</span>
                  <span>₹{ride.taxAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                <span>Final Paid Fare:</span>
                <span style={{ color: 'var(--accent-primary)' }}>₹{ride.fare || 0}</span>
              </div>
              {ride.driverEarning !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.88rem' }}>
                  <span>Driver Earning:</span>
                  <span>₹{ride.driverEarning}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps & Trip Lifecycle */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} /> Trip Lifecycle & Timestamps
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Created At:</span>
                <span style={{ fontWeight: 500 }}>{new Date(ride.createdAt).toLocaleString()}</span>
              </div>
              {ride.acceptedTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Accepted At:</span>
                  <span style={{ fontWeight: 500 }}>{new Date(ride.acceptedTime).toLocaleString()}</span>
                </div>
              )}
              {ride.arrivedTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Driver Arrived:</span>
                  <span style={{ fontWeight: 500 }}>{new Date(ride.arrivedTime).toLocaleString()}</span>
                </div>
              )}
              {ride.startedTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Trip Started:</span>
                  <span style={{ fontWeight: 500 }}>{new Date(ride.startedTime).toLocaleString()}</span>
                </div>
              )}
              {ride.completedTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Trip Completed:</span>
                  <span style={{ fontWeight: 500, color: 'var(--success)' }}>{new Date(ride.completedTime).toLocaleString()}</span>
                </div>
              )}
              {ride.cancelledTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--danger)' }}>Cancelled At:</span>
                  <span style={{ fontWeight: 500, color: 'var(--danger)' }}>{new Date(ride.cancelledTime).toLocaleString()}</span>
                </div>
              )}
              {ride.cancellationReason && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingTop: '0.4rem' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Cancellation Reason:</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ride.cancellationReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tracking History if Available */}
        {ride.trackingHistory && ride.trackingHistory.length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Navigation size={18} /> GPS Tracking Log ({ride.trackingHistory.length} checkpoints)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
              {ride.trackingHistory.map((track: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--input-bg)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ minWidth: '22px', height: '22px', background: 'var(--accent-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 'bold' }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>{track.status || 'CHECKPOINT'}</span>
                    {(track.latitude && track.longitude) ? (
                      <a href={`https://www.google.com/maps/search/?api=1&query=${track.latitude},${track.longitude}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                        Lat: {track.latitude}, Lng: {track.longitude}
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No coordinates logged</span>
                    )}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{track.createdAt ? new Date(track.createdAt).toLocaleTimeString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RideDetails;
