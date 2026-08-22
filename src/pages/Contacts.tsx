import React, { useState, useEffect } from 'react';
import { Search, Loader2, Eye, Trash2, Mail, CheckCircle, Clock, X } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { createPortal } from 'react-dom';
import { SmartAvatar } from '../App';

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContact, setActiveContact] = useState<any | null>(null);
  const [contactDetailsLoading, setContactDetailsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/contacts');
      setContacts(res.data?.data || res.data || []);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch contacts:', err);
      setError(err.response?.data?.message || 'Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleViewDetails = async (id: string, contactData: any) => {
    setActiveContact(contactData); // fast optimistic display
    setContactDetailsLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/contacts/${id}`);
      setActiveContact(res.data?.data || res.data || contactData);
    } catch (err) {
      console.error('Failed to load contact details:', err);
    } finally {
      setContactDetailsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      setDeletingId(contactToDelete);
      await axiosInstance.delete(`/admin/contacts/${contactToDelete}`);
      setContacts(prev => prev.filter(c => c.id !== contactToDelete));
      if (activeContact?.id === contactToDelete) setActiveContact(null);
    } catch (err) {
      console.error('Failed to delete contact:', err);
      alert('Failed to delete contact. Please try again.');
    } finally {
      setDeletingId(null);
      setContactToDelete(null);
    }
  };

  const markAsStatus = async (id: string, status: string) => {
    try {
      // PROPOSED API FOR STATUS UPDATE. YOU WILL NEED TO ADD THIS AT BACKEND
      await axiosInstance.patch(`/admin/contacts/${id}/status`, { status });
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      setActiveContact((prev: any) => prev?.id === id ? { ...prev, status } : prev);
    } catch (err) {
      console.error('Status update API might not exist yet:', err);
      alert('Update failed (or API not yet implemented).');
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'UNREAD':
      case 'PENDING':
        return <span className="badge pending" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={12}/> Unread</span>;
      case 'READ':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Eye size={12}/> Read</span>;
      case 'REPLIED':
      case 'RESOLVED':
        return <span className="badge active" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><CheckCircle size={12}/> Replied</span>;
      default: 
        return <span className="badge pending" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={12}/> Unread</span>;
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Review and respond to messages from the Website Contact Form.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', marginBottom: 0, borderRadius: '30px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search Name, Email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <button className="btn btn-outline" onClick={fetchContacts} style={{ padding: '0.5rem 1rem', borderRadius: '30px' }}>
             Refresh
          </button>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table style={{ width: '100%', minWidth: '950px' }}>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center', whiteSpace: 'nowrap' }}>Sl No.</th>
              <th style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>Name</th>
              <th style={{ textAlign: 'center' }}>Email</th>
              <th style={{ textAlign: 'center' }}>Subject & Date</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
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
            ) : paginatedContacts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {error ? error : `No contact messages found.`}
                </td>
              </tr>
            ) : (
              paginatedContacts.map((contact, i) => {
                const globalIndex = ((currentPage - 1) * itemsPerPage) + i;
                return (
                  <tr key={contact.id || i} className="hover-highlight" style={{ cursor: 'pointer' }} onClick={() => handleViewDetails(contact.id, contact)}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {globalIndex + 1}
                    </td>
                    <td style={{ textAlign: 'left', paddingLeft: '1.5rem', textTransform: 'capitalize' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} title={contact.name || 'Anonymous'}>
                        {contact.name ? (contact.name.length > 20 ? contact.name.substring(0, 20) + '...' : contact.name) : 'Anonymous'}
                        <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {contact.userType || 'WEB'}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{contact.email}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {contact.subject ? (contact.subject.length > 20 ? contact.subject.substring(0, 20) + '...' : contact.subject) : 'Website Enquiry'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formatDate(contact.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {getStatusBadge(contact.status)}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleViewDetails(contact.id, contact); }} 
                          className="btn btn-outline" 
                          style={{ padding: '0.4rem 0.6rem' }} 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          disabled={deletingId === contact.id}
                          onClick={(e) => { e.stopPropagation(); setContactToDelete(contact.id); }}
                          className="btn btn-outline" 
                          style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} 
                          title="Delete Message"
                        >
                          {deletingId === contact.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: 'var(--glass-border)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{ padding: '0.4rem 1rem', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Prev
              </button>
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
                  <button
                    key={i}
                    className="btn"
                    onClick={() => setCurrentPage(i)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: currentPage === i ? 'var(--accent-primary)' : 'transparent',
                      color: currentPage === i ? 'white' : 'var(--text-main)',
                      border: currentPage === i ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <button
                className="btn btn-outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '0.4rem 1rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {activeContact && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)', padding: '1rem' }} onClick={() => setActiveContact(null)}>
          <div 
            className="animate-fade-in glass-panel" 
            style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Mail size={20} color="var(--accent-primary)"/> Complete Message
              </h2>
              <button onClick={() => setActiveContact(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={24} />
              </button>
            </div>

            {contactDetailsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
                 <Loader2 size={32} className="animate-spin text-accent-primary" />
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem', background: 'var(--input-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sender</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {activeContact.name}
                        <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {activeContact.userType || 'WEB'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date</div>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{formatDate(activeContact.createdAt)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email</div>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}><a href={`mailto:${activeContact.email}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{activeContact.email}</a></div>
                  </div>
                  {activeContact.phone && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone</div>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{activeContact.phone}</div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Subject</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {activeContact.subject || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No Subject Provided</span>}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Message Content</div>
                  <div style={{ color: 'var(--text-main)', lineHeight: 1.6, background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {activeContact.message || 'Blank message content.'}
                  </div>
                </div>
              </>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button onClick={() => markAsStatus(activeContact.id, 'REPLIED')} className="btn btn-primary" style={{ flex: 1 }}>
                Mark Replied
              </button>
              <button 
                onClick={(e) => { 
                  setContactToDelete(activeContact.id);
                }} 
                className="btn btn-outline" 
                style={{ flex: 1, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {contactToDelete && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '380px', padding: '2rem', textAlign: 'center' }}>
            <Trash2 size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Are you sure?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this contact message? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setContactToDelete(null)} 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '0.75rem' }}
                disabled={!!deletingId}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '0.75rem', background: 'var(--danger)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
                disabled={!!deletingId}
              >
                {deletingId ? <Loader2 size={20} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
