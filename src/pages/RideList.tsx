import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, MapPin, Loader2, Route } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchRides } from '../store/rideSlice';

const RideList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rides, meta, loading, error } = useSelector((state: RootState) => state.rides);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    dispatch(fetchRides({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

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

  const filteredRides = rides.filter(ride =>
    ride.rider?.phoneNumber.includes(search) ||
    (ride.driver?.phoneNumber && ride.driver.phoneNumber.includes(search)) ||
    ride.id.includes(search)
  );

  if (loading && rides.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
    </div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>Failed to load rides: {error}</div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by Phone or Ride ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '250px' }}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Ride ID</th>
              <th>Rider Info</th>
              <th>Driver Info</th>
              <th>Status & Fare</th>
              <th>Date</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredRides.map(ride => (
              <tr key={ride.id}>
                <td style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Route size={16} color="var(--accent-primary)" />
                    {ride.id.substring(0, 8)}...
                  </div>
                </td>
                <td>
                  <div>{ride.rider?.profile?.name || 'Unknown Rider'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ride.rider?.phoneNumber}</div>
                </td>
                <td>
                  {ride.driver ? (
                    <>
                      <div>{ride.driver?.profile?.name || 'Unknown Driver'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ride.driver?.phoneNumber}</div>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Awaiting Driver...</span>
                  )}
                </td>
                <td>
                  <div style={{ marginBottom: '0.4rem' }}>{getStatusBadge(ride.status)}</div>
                  {ride.fare && <div style={{ fontWeight: 600 }}>₹{ride.fare}</div>}
                </td>
                <td>{new Date(ride.createdAt).toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="var(--primary)" />
                    <a href={`https://www.google.com/maps/search/?api=1&query=${ride.pickupLat},${ride.pickupLng}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline', fontSize: '0.85rem' }}>View Pickup</a>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRides.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No rides found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {meta && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 1rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
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
