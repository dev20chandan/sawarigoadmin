
import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Check, X, ArrowLeft, Trash2, Ban } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { RootState, AppDispatch } from '../store';
import { updateDriverStatus, updateDocumentStatus } from '../store/driverSlice';
import axiosInstance from '../utils/axiosInstance';
import DriverLocationHistory from '../components/DriverLocationHistory';

const DriverDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const drivers = useSelector((reduxState: RootState) => reduxState.drivers.drivers);
  const driver = drivers.find((d: any) => d.id === state?.driver?.id) || state?.driver;
  const [statusToUpdate, setStatusToUpdate] = useState<{ id: string, status: string } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [docUpdating, setDocUpdating] = useState<{ id: string, status: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'danger' } | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [docRejectModal, setDocRejectModal] = useState<string | null>(null);
  const [docRejectReason, setDocRejectReason] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [walletRecords, setWalletRecords] = useState<any[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [driverRides, setDriverRides] = useState<any[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);

  React.useEffect(() => {
    // Fetch wallet records for this specific driver
    const fetchWallet = async () => {
      if (!state?.driver?.id) return;
      try {
        setLoadingWallet(true);
        const res = await axiosInstance.get(`/admin/drivers/${state.driver.id}/wallet`);
        setWalletRecords(Array.isArray(res.data) ? res.data : []);
        setWalletError(null);
      } catch (err: any) {
        console.error('Failed to fetch wallet:', err);
        setWalletRecords([]); // Fallback
        setWalletError(err.response?.data?.message || 'Wallet data not found');
      } finally {
        setLoadingWallet(false);
      }
    };
    
    const fetchRides = async () => {
      if (!state?.driver?.id) return;
      try {
        setLoadingRides(true);
        const res = await axiosInstance.get(`/admin/user-rides/${state.driver.id}`);
        setDriverRides(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch driver rides', err);
      } finally {
        setLoadingRides(false);
      }
    };

    fetchWallet();
    fetchRides();
  }, [state?.driver?.id]);

  if (!driver) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No driver information available. <br /><br />
        <button className="btn btn-outline" onClick={() => navigate('/drivers')}>Go Back</button>
      </div>
    );
  }

  const handleUpdateStatus = (id: string, status: string) => {
    setStatusToUpdate({ id, status });
  };

  const confirmStatusUpdate = async () => {
    if (!statusToUpdate || !driver) return;
    setIsUpdatingStatus(true);
    try {
      if (statusToUpdate.status === 'rejected' && rejectReason) {
        await axiosInstance.post(`/admin/drivers/${statusToUpdate.id}/status`, { status: statusToUpdate.status, reason: rejectReason });
      } else {
        await dispatch(updateDriverStatus({ id: statusToUpdate.id, status: statusToUpdate.status })).unwrap();
      }

      setToastMessage({
        text: `Driver successfully ${statusToUpdate.status}`,
        type: statusToUpdate.status === 'rejected' ? 'danger' : 'success'
      });
      setTimeout(() => setToastMessage(null), 3000);

      setStatusToUpdate(null);
      setRejectReason('');

      // Optionally navigate back after approval
      if (statusToUpdate.status === 'approved') {
        setTimeout(() => navigate('/drivers'), 1000);
      }
    } catch (err) {
      console.error(err);
      setToastMessage({ text: 'Failed to update driver status', type: 'danger' });
      setTimeout(() => setToastMessage(null), 3000);
      setStatusToUpdate(null);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const updateDocStatus = async (docId: string, status: string, reason: string = '') => {
    if (!driver) return;

    setDocUpdating({ id: docId, status });
    try {
      await dispatch(updateDocumentStatus({ driverId: driver.id, docId, status, reason })).unwrap();
      setPreviewDoc(null);
      setToastMessage({
        text: `Document successfully ${status.toLowerCase()}`,
        type: status === 'REJECTED' ? 'danger' : 'success'
      });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage({ text: 'Failed to update document status', type: 'danger' });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setDocUpdating(null);
      setDocRejectModal(null);
      setDocRejectReason('');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button onClick={() => navigate('/drivers')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Captain Details
          <span className={`badge ${driver.status?.toLowerCase() || 'pending'}`} style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
            {driver.status?.toLowerCase() || 'pending'}
          </span>
        </h1>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem', background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Driver Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            <div style={{ wordBreak: 'break-word' }}><strong>Name:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.name || 'N/A'}</span></div>
            <div style={{ wordBreak: 'break-word' }}><strong>Phone:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.phone || 'N/A'}</span></div>
            <div style={{ wordBreak: 'break-word' }}><strong>Email:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.profile?.email || 'N/A'}</span></div>
            <div style={{ wordBreak: 'break-word' }}><strong>Gender:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.profile?.gender || 'N/A'}</span></div>
            <div style={{ wordBreak: 'break-word' }}><strong>Joined Date:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : 'N/A'}</span></div>
          </div>

          <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Vehicle Details</h3>
          {driver.vehicleDetails ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>
              <div><strong>Type:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.vehicleDetails.type || 'N/A'}</span></div>
              <div style={{ gridColumn: 'span 2', wordBreak: 'break-word' }}>
                <strong>RC / Plate Number:</strong> <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,140,66,0.15)', border: '1px dashed var(--accent-primary)', borderRadius: '4px', marginLeft: '0.5rem', color: 'var(--text-main)', display: 'inline-block', marginTop: '0.2rem', fontWeight: 600 }}>{driver.vehicleDetails.plateNumber || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No vehicle details registered.</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(!driver.rawDocs || driver.rawDocs.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', padding: '1.5rem', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>No documents uploaded by driver.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
              {[...driver.rawDocs].sort((a: any, b: any) => {
                const order = [
                  'RC', 'RC_FRONT', 'RC_BACK',
                  'AADHAAR', 'AADHAAR_FRONT', 'AADHAAR_BACK',
                  'AADHAR', 'AADHAR_FRONT', 'AADHAR_BACK',
                  'DRIVING_LICENSE', 'DRIVING_LICENSE_FRONT', 'DL_FRONT', 'DRIVING_LICENSE_BACK', 'DL_BACK',
                  'POLLUTION', 'POLLUTION_FRONT', 'POLLUTION_BACK',
                  'INSURANCE', 'INSURANCE_FRONT', 'INSURANCE_BACK',
                  'INSURANCE', 'INSURANCE_FRONT', 'INSURANCE_BACK',
                  'SELFIE',
                ];
                const aType = (a.documentType || '').toUpperCase();
                const bType = (b.documentType || '').toUpperCase();
                let aIndex = order.indexOf(aType);
                let bIndex = order.indexOf(bType);
                if (aIndex === -1) aIndex = 999;
                if (bIndex === -1) bIndex = 999;
                if (aIndex !== bIndex) return aIndex - bIndex;
                return aType.localeCompare(bType);
              }).map((doc: any) => (
                <div key={doc.id || doc.documentType + Math.random()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--glass-shadow)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--accent-primary)', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {doc.documentType.replace(/_/g, ' ')}
                      {doc.status && doc.status !== 'PENDING' && (
                        <span className={`badge ${doc.status.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>{doc.status}</span>
                      )}
                      {doc.status !== 'APPROVED' && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this document?')) {
                              try {
                                await axiosInstance.delete(`/admin/drivers/${driver.id}/documents/${doc.id}`);
                                // Opt to refresh manually or let Redux do it if we map it
                                setToastMessage({ text: 'Document deleted! Please refresh.', type: 'success' });
                                setTimeout(() => setToastMessage(null), 3000);
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          style={{ background: 'var(--danger)', border: 'none', color: 'white', padding: '0.2rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '0.5rem', opacity: 0.85, transition: 'opacity 0.2s' }}
                          title="Delete Document"
                          onMouseOver={e => e.currentTarget.style.opacity = '1'}
                          onMouseOut={e => e.currentTarget.style.opacity = '0.85'}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </span>
                    <span
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer' }}
                      onClick={() => { setPreviewDoc(doc); setZoomScale(1); }}
                    >
                      Tap to preview
                    </span>
                  </div>
                  <img
                    src={doc.fileUrl.startsWith('/') ? `${API_BASE_URL}${doc.fileUrl}` : doc.fileUrl}
                    alt={doc.documentType}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => { setPreviewDoc(doc); setZoomScale(1); }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  {doc.status !== 'APPROVED' && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => setDocRejectModal(doc.id)}
                        className="btn btn-outline"
                        disabled={!!docUpdating}
                        style={{ flex: 1, padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        {docUpdating?.id === doc.id && docUpdating?.status === 'REJECTED' ? <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid currentColor', borderRightColor: 'transparent' }} className="animate-spin" /> : <X size={16} />} Reject
                      </button>
                      <button
                        onClick={() => updateDocStatus(doc.id, 'APPROVED')}
                        className="btn btn-primary"
                        disabled={!!docUpdating}
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        {docUpdating?.id === doc.id && docUpdating?.status === 'APPROVED ALL' ? <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid currentColor', borderRightColor: 'transparent' }} className="animate-spin" /> : <Check size={16} />} Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GPS Location history tracker */}
        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Live GPS & Location History Tracker
          </h3>
          <DriverLocationHistory driverId={state?.driver?.id} />
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Driver Earnings & Wallet
          </h3>
          <div className="table-container" style={{ margin: 0, border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-card)' }}>
            <table style={{ width: '100%', minWidth: '1000px' }}>
              <thead>
                <tr style={{ background: 'var(--input-bg)' }}>
                  <th>Driver ID</th>
                  <th>Ride ID</th>
                  <th>Credit</th>
                  <th>Debit</th>
                  <th>Recharge</th>
                  <th>Withdrawal</th>
                  <th>Refund/Adjustment</th>
                  <th style={{ color: 'var(--text-main)' }}>Balance</th>
                  <th>Transaction Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingWallet ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>Loading wallet records...</td>
                  </tr>
                ) : walletRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      {walletError ? walletError : 'No wallet transactions found for this driver.'}
                    </td>
                  </tr>
                ) : (
                  walletRecords.map((txn, i) => (
                    <tr key={txn.id || i} className="hover-highlight">
                      <td style={{ fontFamily: 'monospace' }}>{txn.driverId?.substring(0, 8) || driver.id?.substring(0, 8)}</td>
                      <td style={{ fontFamily: 'monospace' }}>{txn.rideId?.substring(0, 8) || '-'}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{txn.credit ? `+₹${txn.credit.toFixed(2)}` : '-'}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{txn.debit ? `-₹${txn.debit.toFixed(2)}` : '-'}</td>
                      <td>{txn.recharge ? `₹${txn.recharge.toFixed(2)}` : '-'}</td>
                      <td>{txn.withdrawal ? `₹${txn.withdrawal.toFixed(2)}` : '-'}</td>
                      <td>{txn.adjustment ? `₹${txn.adjustment.toFixed(2)}` : '-'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{(txn.balance || 0).toFixed(2)}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {txn.createdAt ? new Date(txn.createdAt).toLocaleString('en-IN') : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          {(() => {
            const isSelfieUploaded = driver.rawDocs && driver.rawDocs.some((d: any) => d.documentType === 'SELFIE');
            const allDocsApproved = driver.rawDocs && driver.rawDocs.length > 0 && driver.rawDocs.every((d: any) => d.status === 'APPROVED');

            return (
              <>
                {!isSelfieUploaded ? (
                  <div style={{ color: 'var(--warning)', fontSize: '0.9rem', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⚠️ Driver selfie has not been uploaded yet.
                  </div>
                ) : !allDocsApproved ? (
                  <div style={{ color: 'var(--warning)', fontSize: '0.9rem', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⚠️ Approving the driver will automatically approve their documents.
                  </div>
                ) : null}
                {driver.status?.toUpperCase() === 'SUSPENDED' && (
                  <button
                    className="btn btn-outline"
                    style={{ color: 'var(--success)', borderColor: 'var(--success)', padding: '0.6rem 2rem', fontSize: '1rem' }}
                    onClick={() => handleUpdateStatus(driver.id, 'approved')}
                  >
                    <Check size={20} /> Activate
                  </button>
                )}
                {driver.status?.toUpperCase() === 'APPROVED' && (
                  <button
                    className="btn btn-outline"
                    style={{ color: '#f59e0b', borderColor: '#f59e0b', padding: '0.6rem 2rem', fontSize: '1rem' }}
                    onClick={() => handleUpdateStatus(driver.id, 'suspended')}
                  >
                    <Ban size={20} /> Suspend
                  </button>
                )}
                {driver.status?.toUpperCase() !== 'APPROVED' && driver.status?.toUpperCase() !== 'SUSPENDED' && isSelfieUploaded && (
                  <button
                    className="btn btn-primary"
                    style={{
                      padding: '0.6rem 2rem',
                      fontSize: '1rem',
                      opacity: 1,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleUpdateStatus(driver.id, 'approved')}
                    title="Approve Driver and all Documents"
                  >
                    <Check size={20} /> Approve All
                  </button>
                )}
              </>
            );
          })()}
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Ride History</h3>
        
        {loadingRides ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
          </div>
        ) : driverRides.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No rides found for this driver.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {driverRides.map((r: any) => (
              <div key={r.id} onClick={() => navigate('/rides/' + r.id)} style={{ padding: '1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover-highlight">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{new Date(r.createdAt).toLocaleString()}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span className={`badge ${(r.status || 'PENDING').toLowerCase()}`}>{r.status}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                   <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{r.fare || 0}</div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.distance || '0'} km</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {statusToUpdate && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '380px', padding: '2rem', textAlign: 'center', background: 'var(--bg-main)' }}>
            {statusToUpdate.status === 'approved' ? (
              <Check size={48} color="var(--success)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            ) : statusToUpdate.status === 'suspended' ? (
              <Ban size={48} color="#f59e0b" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            ) : (
              <X size={48} color="var(--danger)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            )}
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Are you sure?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Are you sure you want to {statusToUpdate.status === 'suspended' ? 'suspend' : statusToUpdate.status} this driver?
            </p>
            {statusToUpdate.status === 'rejected' && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>Select Rejection Reason:</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none' }}
                >
                  <option value="">-- No Document Specified --</option>
                  {driver.rawDocs
                    ?.filter((doc: any) => doc.status !== 'APPROVED')
                    .map((doc: any) => {
                      const prettyName = doc.documentType.replace(/_/g, ' ');
                      return (
                        <option key={doc.id || doc.documentType} value={`Rejected Document: ${prettyName}`}>
                          {prettyName} rejected
                        </option>
                      );
                    })}
                  {(driver.rawDocs?.filter((doc: any) => doc.status !== 'APPROVED').length || 0) > 1 && (
                    <option value="Multiple documents are invalid/rejected">Multiple invalid documents</option>
                  )}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => { setStatusToUpdate(null); setRejectReason(''); }}
                className="btn btn-outline"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className="btn"
                style={{ flex: 1, padding: '0.75rem', background: statusToUpdate.status === 'approved' ? 'var(--success)' : statusToUpdate.status === 'suspended' ? '#f59e0b' : 'var(--danger)', color: 'white' }}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid currentColor', borderRightColor: 'transparent', margin: 'auto' }} className="animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {previewDoc && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }} onClick={() => setPreviewDoc(null)}>



          {previewDoc.status !== 'APPROVED' && (
            <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.75rem', width: 'auto', alignItems: 'center', zIndex: 10002 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', gap: '0.75rem', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setDocRejectModal(previewDoc.id)}
                  className="btn btn-outline"
                  disabled={!!docUpdating}
                  style={{ padding: '0.4rem 1.25rem', borderRadius: '50px', color: 'var(--danger)', borderColor: 'var(--danger)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {docUpdating?.id === previewDoc.id && docUpdating?.status === 'REJECTED' ? <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid currentColor', borderRightColor: 'transparent' }} className="animate-spin" /> : null} Reject
                </button>

                <button
                  onClick={() => updateDocStatus(previewDoc.id, 'APPROVED')}
                  className="btn btn-primary"
                  disabled={!!docUpdating || previewDoc.status === 'APPROVED'}
                  style={{ padding: '0.4rem 1.25rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {docUpdating?.id === previewDoc.id && docUpdating?.status === 'APPROVED' ? <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid currentColor', borderRightColor: 'transparent' }} className="animate-spin" /> : null} {previewDoc.status === 'APPROVED' ? 'Approved' : 'Approve'}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setPreviewDoc(null)}
            style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'background 0.2s', zIndex: 10001 }}
          >
            <X size={24} />
          </button>

          <div className="animate-fade-in" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto', display: 'flex', alignItems: zoomScale === 1 ? 'center' : 'flex-start', justifyContent: zoomScale === 1 ? 'center' : 'flex-start', padding: zoomScale === 1 ? '0' : '2rem' }} onClick={() => setPreviewDoc(null)}>
            <img
              src={previewDoc.fileUrl.startsWith('/') ? `${API_BASE_URL}${previewDoc.fileUrl}` : previewDoc.fileUrl}
              alt="Preview"
              style={{
                maxWidth: zoomScale === 1 ? '90vw' : 'none',
                maxHeight: zoomScale === 1 ? '90vh' : 'none',
                width: zoomScale === 1 ? 'auto' : '150%',
                objectFit: 'contain',
                cursor: zoomScale === 1 ? 'zoom-in' : 'zoom-out',
                transition: 'width 0.3s ease',
                borderRadius: '8px',
                margin: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
              onClick={e => { e.stopPropagation(); setZoomScale(s => s === 1 ? 2 : 1); }}
            />
          </div>
        </div>,
        document.body
      )}

      {toastMessage && createPortal(
        <div className="animate-fade-in" style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: `var(--${toastMessage.type})`, color: 'white', padding: '1rem 1.5rem', borderRadius: '8px', zIndex: 10005, boxShadow: '0 4px 15px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
          {toastMessage.type === 'success' ? <Check size={20} /> : <X size={20} />}
          {toastMessage.text}
        </div>,
        document.body
      )}

      {docRejectModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10005, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '2rem', background: 'var(--bg-main)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
              <X size={24} /> Reject Document
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
              Please provide a reason for rejecting this document. It will be sent to the driver directly.
            </p>
            <textarea
              autoFocus
              value={docRejectReason}
              onChange={(e) => setDocRejectReason(e.target.value)}
              placeholder="e.g. Image is blurry, details not visible..."
              rows={3}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', marginBottom: '1.5rem', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setDocRejectModal(null); setDocRejectReason(''); }}
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.5rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => updateDocStatus(docRejectModal, 'REJECTED', docRejectReason)}
                className="btn"
                style={{ padding: '0.6rem 1.5rem', background: 'var(--danger)', color: 'white' }}
                disabled={!docRejectReason.trim()}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DriverDetails;
