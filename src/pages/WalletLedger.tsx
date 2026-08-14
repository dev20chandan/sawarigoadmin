import { useState, useEffect } from 'react';
import { Search, Loader2, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import './RideFare.css'; 

export default function WalletLedger() {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLedger(page);
  }, [page]);

  const fetchLedger = async (currentPage: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/wallet-transactions?page=${currentPage}&limit=${limit}`);
      const data = response.data;
      
      // Support nested pagination format: { data: [], meta: { page, totalPages } }
      if (data && data.data && data.meta) {
        setTransactions(data.data);
        setTotalPages(data.meta.totalPages || 1);
      } else {
        setTransactions(Array.isArray(data) ? data : []);
        setTotalPages(1); // Default if metadata is missing
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching wallet ledger:', err);
      // Fallback if endpoint is unreachable
      setTransactions([]);
      setError(err.response?.data?.message || 'Failed to fetch financial ledger');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => `₹${Number(val || 0).toFixed(2)}`;
  
  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Filter client-side by search
  const filteredTxns = transactions.filter(t => 
    t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Comprehensive financial ledger and global wallet transaction tracking.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginBottom: 0, borderRadius: '30px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search user, ID, or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <button onClick={() => fetchLedger(1)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '30px', padding: '0.5rem 1.25rem' }}>
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction ID / User</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance After</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
                  </div>
                </td>
              </tr>
            ) : filteredTxns.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {error ? `No ledger data: ${error}` : `No records found matching "${searchTerm}"`}
                </td>
              </tr>
            ) : (
              filteredTxns.map((txn, i) => (
                <tr key={txn.id || i} className="hover-highlight" style={{ cursor: 'pointer' }}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {formatDate(txn.createdAt || txn.timestamp)}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {txn.userName || txn.driverName || 'System'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      TRX: {txn.id?.substring(0,8) || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                       {txn.category?.replace('_', ' ') || 'GENERAL'}
                    </span>
                  </td>
                  <td>
                    {txn.type?.toUpperCase() === 'CREDIT' ? (
                      <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>
                        <ArrowUpRight size={14} /> CREDIT
                      </span>
                    ) : (
                       <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>
                         <ArrowDownRight size={14} /> DEBIT
                       </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 'bold', color: txn.type?.toUpperCase() === 'CREDIT' ? 'var(--success)' : 'var(--danger)' }}>
                    {txn.type?.toUpperCase() === 'CREDIT' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {formatCurrency(txn.balanceAfter)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Showing Page {page} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="btn btn-outline"
                style={{ padding: '0.4rem 1rem', opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="btn btn-outline"
                style={{ padding: '0.4rem 1rem', opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
