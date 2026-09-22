import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Car, CheckCircle, Loader2, CircleDot, Route as RouteIcon } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchDashboardStats } from '../store/dashboardSlice';
import { fetchRides } from '../store/rideSlice';
import { fetchDrivers } from '../store/driverSlice';
import { fetchUsers } from '../store/userSlice';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector((state: RootState) => state.dashboard);
  const { meta: ridesMeta } = useSelector((state: RootState) => state.rides);
  const { drivers } = useSelector((state: RootState) => state.drivers);
  const { users } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRides({ page: 1, limit: 1 }));
    dispatch(fetchDrivers());
    dispatch(fetchUsers());
  }, [dispatch]);

  const totalRidesCount = stats?.totalRides ?? stats?.ridesCount ?? ridesMeta?.total ?? 0;
  const totalUsersCount = (stats?.totalUsers !== undefined && stats.totalUsers > 0) ? stats.totalUsers : (users?.length || 0);
  const totalDriversCount = (stats?.totalDrivers !== undefined && stats.totalDrivers > 0) ? stats.totalDrivers : (drivers?.length || 0);
  const onlineDriversCount = (stats?.activeDrivers !== undefined && stats.activeDrivers > 0)
    ? stats.activeDrivers
    : (drivers?.filter((d: any) => d.isOnline === true || d.status === 'ONLINE' || d.driverStatus === 'ONLINE').length || 0);

  const incompleteUsersCount = users?.filter((u: any) => !u.profile?.name || !u.profile?.email || u.status === 'PENDING' || !u.phoneNumber).length || 0;
  const incompleteDriversCount = drivers?.filter((d: any) => !d.name || !d.profile?.email || d.status === 'PENDING' || !d.phoneNumber).length || 0;
  const incompleteCount = stats?.incompleteProfiles ?? (incompleteUsersCount + incompleteDriversCount);

  if (loading && !stats) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
    </div>;
  }

  if (error) {
    return <div style={{ color: 'var(--danger)', padding: '2rem', textAlign: 'center' }}>Failed to load dashboard: {error}</div>;
  }

  return (
    <div className="animate-fade-in">

      <div className="dashboard-grid">
        {/* Total Rides */}
        <Link to="/rides" state={{ filterStatus: 'ALL' }} className="glass-panel stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <div className="stat-header">
            <span>Total Rides</span>
            <RouteIcon color="var(--accent-primary)" />
          </div>
          <div className="stat-value">{totalRidesCount}</div>
        </Link>

        {/* Total Users */}
        <Link to="/users" className="glass-panel stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <div className="stat-header">
            <span>Total Users</span>
            <Users color="var(--accent-primary)" />
          </div>
          <div className="stat-value">{totalUsersCount}</div>
        </Link>

        {/* Total Drivers */}
        <Link to="/drivers" className="glass-panel stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <div className="stat-header">
            <span>Total Drivers</span>
            <Car color="var(--text-muted)" />
          </div>
          <div className="stat-value">{totalDriversCount}</div>
        </Link>

        {/* Online Drivers */}
        <Link to="/drivers" state={{ filterStatus: 'ONLINE' }} className="glass-panel stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <div className="stat-header">
            <span>Online Drivers</span>
            <CircleDot color="var(--success)" strokeWidth={3} absoluteStrokeWidth />
          </div>
          <div className="stat-value">{onlineDriversCount}</div>
        </Link>

        {/* Incomplete Profiles */}
        <Link to="/users" state={{ filter: 'INCOMPLETE', activeTab: 'users' }} className="glass-panel stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <div className="stat-header">
            <span>Incomplete Profiles</span>
            <CheckCircle color="var(--danger)" />
          </div>
          <div className="stat-value">{incompleteCount}</div>
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Captain Approval Requests</h2>
        <div style={{ color: 'var(--text-muted)' }}>
          {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((act: any) => (
            <div key={act.id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                A new Captain request from <strong>{act.profile?.name || act.phoneNumber}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem' }}>{new Date(act.createdAt).toLocaleString()}</span>
                <Link to={`/drivers/${act.id}`} state={{ driver: act }} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Review
                </Link>
              </div>
            </div>
          )) : <p>No new captain requests at the moment.</p>}
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default Dashboard;
