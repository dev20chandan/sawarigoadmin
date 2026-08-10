import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Car, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchDashboardStats } from '../store/dashboardSlice';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

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
        <Link to="/users" className="glass-panel stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <div className="stat-header">
            <span>Total Users</span>
            <Users color="var(--accent-primary)" />
          </div>
          <div className="stat-value">{stats?.totalUsers || 0}</div>
        </Link>

        <Link to="/drivers" className="glass-panel stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <div className="stat-header">
            <span>Total Drivers</span>
            <Car color="var(--text-muted)" />
          </div>
          <div className="stat-value">{stats?.totalDrivers || 0}</div>
        </Link>

        <Link to="/drivers" state={{ filterStatus: 'APPROVED' }} className="glass-panel stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <div className="stat-header">
            <span>Active Drivers</span>
            <CheckCircle color="var(--success)" />
          </div>
          <div className="stat-value">{stats?.activeDrivers || 0}</div>
        </Link>

        <Link to="/drivers" state={{ filterStatus: 'PENDING' }} className="glass-panel stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <div className="stat-header">
            <span>Pending Verifications</span>
            <AlertTriangle color="var(--warning)" />
          </div>
          <div className="stat-value">{stats?.pendingVerifications || 0}</div>
        </Link>

        <Link to="/users" className="glass-panel stat-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
          <div className="stat-header">
            <span>Incomplete Profiles</span>
            <CheckCircle color="var(--danger)" />
          </div>
          <div className="stat-value">{stats?.incompleteProfiles || 0}</div>
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
