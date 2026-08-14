import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Ban, Loader2 } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchCancellations } from '../store/cancellationSlice';
import './RideFare.css'; // Re-use common table styles

export default function CancellationRecords() {
  const dispatch = useDispatch<AppDispatch>();
  const { records, loading, error } = useSelector((state: RootState) => state.cancellations);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCancellations());
  }, [dispatch]);

  const formatCurrency = (val: number) => `₹${Number(val || 0).toFixed(2)}`;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredRecords = records.filter(r => 
    r.rideId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cancelledBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cancellationReason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Review all rejected and cancelled trips across the platform.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginBottom: 0, borderRadius: '30px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search ID, Reason, or Role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Ride ID</th>
              <th>Cancelled By</th>
              <th>Cancellation Reason</th>
              <th>Cancellation Charge</th>
              <th>Cancelled Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {error ? `No cancellation data available: ${error}` : `No cancellation records found matching "${searchTerm}"`}
                </td>
              </tr>
            ) : (
              filteredRecords.map((record, i) => (
                <tr key={record.rideId || i} className="hover-highlight" style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Ban size={16} color="var(--danger)" />
                      {record.rideId?.substring(0, 10)}...
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ 
                      textTransform: 'capitalize', 
                      background: record.cancelledBy?.toLowerCase() === 'driver' ? 'rgba(239, 68, 68, 0.15)' : 
                                  record.cancelledBy?.toLowerCase() === 'user' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: record.cancelledBy?.toLowerCase() === 'driver' ? 'var(--danger)' :
                             record.cancelledBy?.toLowerCase() === 'user' ? 'var(--warning)' : 'var(--text-main)',
                      border: record.cancelledBy?.toLowerCase() === 'driver' ? '1px solid rgba(239, 68, 68, 0.3)' :
                              record.cancelledBy?.toLowerCase() === 'user' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border)'
                    }}>
                       {record.cancelledBy || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '250px' }}>
                    <p style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }} title={record.cancellationReason}>
                      {record.cancellationReason || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No reason provided</span>}
                    </p>
                  </td>
                  <td>
                    {record.cancellationCharge > 0 ? (
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{formatCurrency(record.cancellationCharge)}</span>
                    ) : (
                       <span style={{ color: 'var(--text-muted)' }}>No Charge</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {formatDate(record.cancelledTime)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
