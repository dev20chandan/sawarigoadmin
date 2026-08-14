import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Loader2, LifeBuoy, CheckCircle, Clock, AlertTriangle, Paperclip, X } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchSupportTickets } from '../store/supportSlice';
import axiosInstance from '../utils/axiosInstance';
import { createPortal } from 'react-dom';
import './RideFare.css';

export default function SupportRecords() {
  const dispatch = useDispatch<AppDispatch>();
  const { tickets, loading, error } = useSelector((state: RootState) => state.support);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchSupportTickets());
  }, [dispatch]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return <span className="badge pending" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><AlertTriangle size={12}/> Open</span>;
      case 'IN_PROGRESS': return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={12}/> In Progress</span>;
      case 'RESOLVED': return <span className="badge active" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><CheckCircle size={12}/> Resolved</span>;
      default: return <span className="badge">{status || 'UNKNOWN'}</span>;
    }
  };

  const submitResponse = async () => {
    if (!activeTicket || !adminResponseText.trim()) return;
    setSubmitting(true);
    try {
      await axiosInstance.post(`/admin/support-tickets/${activeTicket.ticketId}/response`, { response: adminResponseText });
      // Refresh the tickets safely
      dispatch(fetchSupportTickets());
      setActiveTicket(null);
      setAdminResponseText('');
    } catch (err) {
      console.error('Error submitting support response:', err);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.rideId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.complaintType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage user Support Complaints and monitor issue resolution.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginBottom: 0, borderRadius: '30px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search Ticket, User, or Ride ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel table-container px-0 pb-0">
        <table style={{ width: '100%', minWidth: '950px' }}>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>User & Ride Info</th>
              <th>Type & Details</th>
              <th>Attachments</th>
              <th>Status</th>
              <th>Admin Response</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
             {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
                  </div>
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {error ? `No support data available: ${error}` : `No records found matching "${searchTerm}"`}
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket, i) => (
                <tr key={ticket.ticketId || i} className="hover-highlight" style={{ cursor: 'pointer' }} onClick={() => { setActiveTicket(ticket); setAdminResponseText(ticket.adminResponse || ''); }}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <LifeBuoy size={16} color="var(--accent-primary)" />
                      {ticket.ticketId?.substring(0, 8)}...
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>User: </span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{ticket.userId?.substring(0,8) || 'N/A'}</span>
                    </div>
                    {ticket.rideId && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ride: </span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{ticket.rideId?.substring(0,8)}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ maxWidth: '280px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: '0.2rem', textTransform: 'capitalize' }}>
                      {ticket.complaintType?.replace('_', ' ') || 'General Enquiry'}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={ticket.description}>
                      {ticket.description || 'No description provided.'}
                    </p>
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    {ticket.images && Array.isArray(ticket.images) && ticket.images.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                        <Paperclip size={14} /> {ticket.images.length} File(s)
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>
                    )}
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td style={{ maxWidth: '220px', verticalAlign: 'top' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={ticket.adminResponse}>
                      {ticket.adminResponse || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Awaiting response...</span>}
                    </p>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', verticalAlign: 'top' }}>
                    {formatDate(ticket.updatedAt || ticket.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {activeTicket && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(3px)' }} onClick={() => setActiveTicket(null)}>
          <div 
            className="animate-slide-in-right glass-panel" 
            style={{ width: '450px', height: '100%', background: 'var(--bg-main)', borderLeft: '1px solid var(--border)', borderRadius: '16px 0 0 16px', padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <LifeBuoy size={20} color="var(--accent-primary)"/> Ticket Details
              </h2>
              <button onClick={() => setActiveTicket(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Complaint Type</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>{activeTicket.complaintType?.replace('_', ' ')}</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Description</div>
              <div style={{ color: 'var(--text-main)', lineHeight: 1.6, background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {activeTicket.description || 'No additional details provided.'}
              </div>
            </div>

            {activeTicket.images && activeTicket.images.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Attachments ({activeTicket.images.length})</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {activeTicket.images.map((img: string, ix: number) => (
                    <a key={ix} href={img} target="_blank" rel="noreferrer" style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={img} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Admin Response / Notes</label>
              <textarea
                value={adminResponseText}
                onChange={(e) => setAdminResponseText(e.target.value)}
                rows={4}
                placeholder="Write resolution response..."
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', resize: 'vertical', outline: 'none', marginBottom: '1rem' }}
              />
              <button 
                onClick={submitResponse} 
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                disabled={submitting || !adminResponseText.trim()}
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Submit Response & Resolve'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
