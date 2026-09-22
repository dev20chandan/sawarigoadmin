import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Loader2, Route, Trash2, Eye, MapPin, Car, Phone, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchRides } from '../store/rideSlice';
import { SmartAvatar } from '../App';

const RideList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { rides, meta, loading, error } = useSelector((state: RootState) => state.rides);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(location.state?.filterStatus || 'ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(fetchRides({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  useEffect(() => {
    if (location.state?.filterStatus) {
      setStatusFilter(location.state.filterStatus);
    }
  }, [location.state]);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return <span className="badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={12} /> Completed</span>;
      case 'PENDING':
        return <span className="badge pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> Pending</span>;
      case 'CANCELLED':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><XCircle size={12} /> Cancelled</span>;
      case 'ACCEPTED':
      case 'ARRIVED':
      case 'STARTED':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}>{s}</span>;
      default:
        return <span className="badge">{status || 'Unknown'}</span>;
    }
  };

  const getUniqueRideId = (ride: any) => {
    return ride.rideCode || ride.uniqueRideId || ride.bookingId || ('SRG-' + (ride.id?.length > 8 ? ride.id.slice(-6).toUpperCase() : (ride.id || 'N/A')));
  };

  const getVehicleName = (ride: any) => {
    return ride.vehicleName || ride.vehicleModel || ride.driver?.vehicles?.[0]?.model || ride.vehicleType || ride.driver?.vehicle || 'Standard Vehicle';
  };

  const filteredRides = rides.filter(ride => {
    const uniqueRideId = getUniqueRideId(ride).toLowerCase();
    const vehicleName = getVehicleName(ride).toLowerCase();
    const riderName = (ride.rider?.profile?.name || '').toLowerCase();
    const riderPhone = (ride.rider?.phoneNumber || '');
    const driverName = (ride.driver?.profile?.name || ride.driver?.name || '').toLowerCase();
    const driverPhone = (ride.driver?.phoneNumber || ride.driver?.phone || '');
    const pickup = (ride.pickupLocation || ride.pickupAddress || '').toLowerCase();
    const drop = (ride.dropoffLocation || ride.dropAddress || '').toLowerCase();

    const q = search.toLowerCase();
    const matchesSearch = !q ||
      uniqueRideId.includes(q) ||
      vehicleName.includes(q) ||
      riderName.includes(q) ||
      riderPhone.includes(q) ||
      driverName.includes(q) ||
      driverPhone.includes(q) ||
      pickup.includes(q) ||
      drop.includes(q) ||
      (ride.id && ride.id.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || (ride.status && ride.status.toUpperCase() === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const statuses = ['ALL', 'COMPLETED', 'PENDING', 'ACCEPTED', 'STARTED', 'CANCELLED'];

  if (loading && rides.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>Failed to load rides: {error}</div>;
  }

  return (
    <div className="animate-fade-in">
      
      {/* Top Filter Bar: Status Pills + Search Input */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: 'var(--input-bg)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: statusFilter === st ? 'var(--accent-primary)' : 'transparent',
                color: statusFilter === st ? 'white' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {st === 'ALL' ? 'All Rides' : st.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem', borderRadius: '30px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by ID, User, Driver, or Vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '280px' }}
            />
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th style={{ minWidth: '150px' }}>Unique Ride ID & Vehicle</th>
              <th style={{ minWidth: '160px' }}>User Info</th>
              <th style={{ minWidth: '160px' }}>Driver Info</th>
              <th style={{ minWidth: '180px' }}>Route Summary</th>
              <th style={{ textAlign: 'center', minWidth: '120px' }}>Status & Fare</th>
              <th style={{ minWidth: '130px' }}>Date & Time</th>
              <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRides.map(ride => {
              const uniqueRideId = getUniqueRideId(ride);
              const vehicleName = getVehicleName(ride);
              const riderName = ride.rider?.profile?.name || 'Unknown User';
              const riderPhone = ride.rider?.phoneNumber || '-';
              const driverName = ride.driver?.profile?.name || ride.driver?.name || 'Awaiting Driver';
              const driverPhone = ride.driver?.phoneNumber || ride.driver?.phone || '';
              const driverPlate = ride.driver?.vehicles?.[0]?.plateNumber || '';
              const pickup = ride.pickupLocation || ride.pickupAddress || 'Pickup address';
              const drop = ride.dropoffLocation || ride.dropAddress || 'Destination address';

              return (
                <tr
                  key={ride.id}
                  className="hover-highlight"
                  onClick={() => navigate(`/rides/${ride.id}`, { state: { ride } })}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Unique Ride ID & Vehicle */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.92rem' }}>
                        <Route size={15} />
                        {uniqueRideId}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 500 }}>
                        <Car size={13} color="var(--text-muted)" />
                        {vehicleName}
                      </div>
                      {driverPlate && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Plate: {driverPlate}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* User Info */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <SmartAvatar src={ride.rider?.profile?.image} name={riderName} size={32} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }} title={riderName}>
                          {riderName.length > 18 ? riderName.substring(0, 18) + '...' : riderName}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={11} /> {riderPhone}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Driver Info */}
                  <td>
                    {ride.driver ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <SmartAvatar src={ride.driver?.profile?.image || ride.driver?.image} name={driverName} size={32} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }} title={driverName}>
                            {driverName.length > 18 ? driverName.substring(0, 18) + '...' : driverName}
                          </span>
                          {driverPhone && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Phone size={11} /> {driverPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                        Awaiting Driver...
                      </span>
                    )}
                  </td>

                  {/* Route Summary */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', maxWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={pickup}>
                        <MapPin size={13} color="#3b82f6" style={{ flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-main)' }}>{pickup}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={drop}>
                        <MapPin size={13} color="#ef4444" style={{ flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-muted)' }}>{drop}</span>
                      </div>
                      {ride.distance && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', paddingLeft: '1rem' }}>
                          {ride.distance} km
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status & Fare */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                      {getStatusBadge(ride.status)}
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                        ₹{ride.fare || 0}
                      </div>
                      {ride.paymentMethod && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {ride.paymentMethod}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/rides/${ride.id}`, { state: { ride } });
                        }}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.55rem', fontSize: '0.78rem' }}
                        title="View Ride Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0.35rem 0.55rem' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this ride record?')) {
                            try {
                              const axiosInstance = (await import('../utils/axiosInstance')).default;
                              await axiosInstance.delete(`/rides/${ride.id}`);
                              dispatch(fetchRides({ page: currentPage, limit }));
                            } catch (err) {
                              console.error(err);
                              alert('Failed to delete ride');
                            }
                          }
                        }}
                        title="Delete Ride"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredRides.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No rides found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {meta && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Showing page {meta.page} of {meta.totalPages} ({meta.total} total rides)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              disabled={meta.page <= 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              style={{ padding: '0.4rem 1rem' }}
            >
              Previous
            </button>
            <button
              className="btn btn-outline"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              style={{ padding: '0.4rem 1rem' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideList;
