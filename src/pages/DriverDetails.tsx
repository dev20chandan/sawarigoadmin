import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Check, X, ArrowLeft, Trash2, Ban, Star, Loader2, Award } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { RootState, AppDispatch } from '../store';
import { fetchDriverDetails, clearSelectedDriver, updateDriverStatus, updateDocumentStatus } from '../store/driverSlice';
import axiosInstance from '../utils/axiosInstance';
import { API_BASE_URL } from '../config';
import DriverLocationHistory from '../components/DriverLocationHistory';

const DriverDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { drivers, selectedDriver, loadingDetails } = useSelector((reduxState: RootState) => reduxState.drivers);

  // Derive current driver object from store details, list, or location state
  const targetId = id || state?.driver?.id || state?.driver?.driverId;
  const driver = selectedDriver || drivers.find((d: any) => d.id === targetId || d.driverId === targetId || d.userId === targetId) || state?.driver;

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
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [driverRides, setDriverRides] = useState<any[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);
  const [driverTab, setDriverTab] = useState<'info' | 'gps' | 'wallet' | 'rides' | 'reviews'>('info');

  useEffect(() => {
    if (targetId) {
      dispatch(fetchDriverDetails(targetId));
    }
    return () => {
      dispatch(clearSelectedDriver());
    };
  }, [targetId, dispatch]);

  useEffect(() => {
    const driverId = targetId || driver?.id || driver?.driverId;
    if (!driverId) return;

    // Fetch wallet records
    const fetchWallet = async () => {
      try {
        setLoadingWallet(true);
        const res = await axiosInstance.get(`/admin/drivers/${driverId}/wallet`);
        const wData = res.data?.data || res.data;
        setWalletRecords(Array.isArray(wData) ? wData : []);
        setWalletError(null);
      } catch (err: any) {
        console.error('Failed to fetch wallet:', err);
        setWalletRecords([]);
        setWalletError(err.response?.data?.message || 'Wallet data not found');
      } finally {
        setLoadingWallet(false);
      }
    };
    
    // Fetch rides if not present in driver object
    const fetchRides = async () => {
      if (driver?.recentRides && driver.recentRides.length > 0) return;
      try {
        setLoadingRides(true);
        const res = await axiosInstance.get(`/admin/user-rides/${driverId}`);
        setUserRides(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to fetch driver rides', err);
      } finally {
        setLoadingRides(false);
      }
    };

    fetchWallet();
    fetchRides();
  }, [targetId, driver?.id, driver?.driverId, driver?.recentRides]);

  function setUserRides(data: any) {
    setDriverRides(Array.isArray(data) ? data : []);
  }

  if (loadingDetails && !driver) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={36} color="var(--accent-primary)" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No driver information available. <br /><br />
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Raw documents extraction helper
  const rawDocsList = driver.rawDocs || driver.documents || (driver.docs ? Object.entries(driver.docs).map(([k, v]) => ({ id: k, documentType: k, fileUrl: v, status: 'APPROVED' })) : []);

  const stats = driver.stats || {
    totalRides: driver.totalRides || 0,
    completedRides: driver.completedRides || 0,
    rating: driver.rating || 5.0,
    totalReviews: driver.totalReviews || 0,
    totalEarnings: driver.totalEarnings || 0
  };

  const ridesToDisplay = (driver.recentRides && driver.recentRides.length > 0) ? driver.recentRides : driverRides;
  const reviewsList = driver.reviews || [];

  const activeDriverId = driver.id || driver.driverId || targetId;

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

      if (statusToUpdate.status === 'approved') {
        setTimeout(() => navigate(-1), 1000);
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
      await dispatch(updateDocumentStatus({ driverId: activeDriverId, docId, status, reason })).unwrap();
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
      {/* Header Bar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          Captain Details ({driver.driverCode || 'Driver'})
          <span className={`badge ${driver.status?.toLowerCase() || driver.rawStatus?.toLowerCase() || 'pending'}`} style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
            {driver.status?.toLowerCase() || driver.rawStatus?.toLowerCase() || 'pending'}
          </span>
          {typeof driver.isOnline !== 'undefined' && (
            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--input-bg)', padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: driver.isOnline ? 'var(--success)' : '#9ca3af' }}></span>
              {driver.isOnline ? 'Online' : 'Offline'}
            </span>
          )}
        </h1>
      </div>

      {/* Stats Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--input-bg)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Rides</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>{stats.totalRides ?? 0}</div>
        </div>
        <div style={{ background: 'var(--input-bg)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed Rides</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.2rem' }}>{stats.completedRides ?? 0}</div>
        </div>
        <div style={{ background: 'var(--input-bg)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rating ({stats.totalReviews || 0} reviews)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Star size={20} fill="#f59e0b" /> {stats.rating || 5.0}
          </div>
        </div>
        <div style={{ background: 'var(--input-bg)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Earnings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
            ₹{(stats.totalEarnings || driver.totalEarnings || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        <button onClick={() => setDriverTab('info')} style={{ background: 'transparent', border: 'none', padding: '0.5rem 0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: driverTab === 'info' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: driverTab === 'info' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: driverTab === 'info' ? 600 : 400 }}>Info & Documents</button>
        <button onClick={() => setDriverTab('gps')} style={{ background: 'transparent', border: 'none', padding: '0.5rem 0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: driverTab === 'gps' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: driverTab === 'gps' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: driverTab === 'gps' ? 600 : 400 }}>Live GPS & History</button>
        <button onClick={() => setDriverTab('wallet')} style={{ background: 'transparent', border: 'none', padding: '0.5rem 0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: driverTab === 'wallet' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: driverTab === 'wallet' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: driverTab === 'wallet' ? 600 : 400 }}>Earnings & Wallet</button>
        <button onClick={() => setDriverTab('rides')} style={{ background: 'transparent', border: 'none', padding: '0.5rem 0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: driverTab === 'rides' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: driverTab === 'rides' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: driverTab === 'rides' ? 600 : 400 }}>Ride History</button>
        <button onClick={() => setDriverTab('reviews')} style={{ background: 'transparent', border: 'none', padding: '0.5rem 0.5rem', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: driverTab === 'reviews' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: driverTab === 'reviews' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: driverTab === 'reviews' ? 600 : 400 }}>Reviews ({reviewsList.length})</button>
      </div>

      {(driverTab === 'info' || driverTab === 'gps' || driverTab === 'wallet') && (
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        {driverTab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem', background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Driver Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            <div style={{ wordBreak: 'break-word' }}><strong>Name:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.name || driver.profile?.name || 'N/A'}</span></div>
            <div style={{ wordBreak: 'break-word' }}><strong>Phone:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.phoneNumber || driver.phone || 'N/A'}</span></div>
            <div style={{ wordBreak: 'break-word' }}><strong>Email:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.email || driver.profile?.email || 'N/A'}</span></div>
            <div style={{ wordBreak: 'break-word' }}><strong>Gender:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.gender || driver.profile?.gender || 'N/A'}</span></div>
            <div style={{ wordBreak: 'break-word' }}><strong>Date of Birth:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.profile?.dob ? new Date(driver.profile.dob).toLocaleDateString() : 'N/A'}</span></div>
            <div style={{ wordBreak: 'break-word' }}><strong>Address:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.profile?.address || driver.address || driver.location || 'N/A'}</span></div>
            <div style={{ wordBreak: 'break-word' }}><strong>Joined Date:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : 'N/A'}</span></div>
          </div>

          <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Vehicle Information</h3>
          {driver.vehicleDetails || driver.vehicle ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>
              <div><strong>Vehicle Type:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.vehicleType || driver.vehicleDetails?.type || 'CAR'}</span></div>
              <div>
                <strong>RC / Plate Number:</strong> 
                <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,140,66,0.15)', border: '1px dashed var(--accent-primary)', borderRadius: '4px', marginLeft: '0.5rem', color: 'var(--text-main)', display: 'inline-block', fontWeight: 600 }}>
                  {driver.vehicleDetails?.plateNumber || driver.vehicle || 'N/A'}
                </span>
              </div>
              {driver.vehicleDetails?.brand && <div><strong>Brand / Model:</strong> <span style={{ color: 'var(--text-muted)' }}>{driver.vehicleDetails.brand} {driver.vehicleDetails.model || ''} ({driver.vehicleDetails.year || ''})</span></div>}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No vehicle details registered.</p>
          )}
        </div>

        {/* Driver Documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>Uploaded Verification Documents</h3>
          {(rawDocsList.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', padding: '1.5rem', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>No documents uploaded by driver.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {[...rawDocsList].sort((a: any, b: any) => {
                const order = ['AADHAAR', 'DRIVING_LICENSE', 'VEHICLE_REGISTRATION', 'RC', 'INSURANCE', 'SELFIE'];
                const aType = (a.documentType || '').toUpperCase();
                const bType = (b.documentType || '').toUpperCase();
                let aIdx = order.findIndex(o => aType.includes(o));
                let bIdx = order.findIndex(o => bType.includes(o));
                if (aIdx === -1) aIdx = 999;
                if (bIdx === -1) bIdx = 999;
                return aIdx - bIdx;
              }).map((doc: any) => (
                <div key={doc.id || doc.documentType + Math.random()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--glass-shadow)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--accent-primary)', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {(doc.documentType || 'DOCUMENT').replace(/_/g, ' ')}
                      {doc.status && doc.status !== 'PENDING' && (
                        <span className={`badge ${doc.status.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>{doc.status}</span>
                      )}
                      {doc.status !== 'APPROVED' && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this document?')) {
                              try {
                                await axiosInstance.delete(`/admin/drivers/${activeDriverId}/documents/${doc.id}`);
                                setToastMessage({ text: 'Document deleted!', type: 'success' });
                                setTimeout(() => setToastMessage(null), 3000);
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          style={{ background: 'var(--danger)', border: 'none', color: 'white', padding: '0.2rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '0.5rem', opacity: 0.85 }}
                          title="Delete Document"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </span>
                    <span
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--input-bg)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer' }}
                      onClick={() => { setPreviewDoc(doc); setZoomScale(1); }}
                    >
                      Preview
                    </span>
                  </div>
                  <img
                    src={doc.fileUrl ? (doc.fileUrl.startsWith('/') ? `${API_BASE_URL}${doc.fileUrl}` : doc.fileUrl) : '/placeholder.png'}
                    alt={doc.documentType}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => { setPreviewDoc(doc); setZoomScale(1); }}
                  />
                  {doc.status !== 'APPROVED' && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => setDocRejectModal(doc.id)}
                        className="btn btn-outline"
                        disabled={!!docUpdating}
                        style={{ flex: 1, padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        {docUpdating?.id === doc.id && docUpdating?.status === 'REJECTED' ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />} Reject
                      </button>
                      <button
                        onClick={() => updateDocStatus(doc.id, 'APPROVED')}
                        className="btn btn-primary"
                        disabled={!!docUpdating}
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        {docUpdating?.id === doc.id && docUpdating?.status === 'APPROVED' ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
        )}

        {driverTab === 'gps' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Live GPS & Location History Tracker
          </h3>
          <DriverLocationHistory driverId={activeDriverId} />
        </div>
        )}

        {driverTab === 'wallet' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Driver Earnings & Wallet Transactions
          </h3>
          <div className="table-container" style={{ margin: 0, border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-card)' }}>
            <table style={{ width: '100%', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: 'var(--input-bg)' }}>
                  <th>Driver ID</th>
                  <th>Ride ID</th>
                  <th>Credit</th>
                  <th>Debit</th>
                  <th>Recharge</th>
                  <th>Withdrawal</th>
                  <th>Adjustment</th>
                  <th style={{ color: 'var(--text-main)' }}>Balance</th>
                  <th>Date</th>
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
                      <td style={{ fontFamily: 'monospace' }}>{txn.driverId?.substring(0, 8) || activeDriverId?.substring(0, 8)}</td>
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
        )}

        {driverTab === 'info' && (
        <div style={{ paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
          {(() => {
            const isSelfieUploaded = rawDocsList.some((d: any) => (d.documentType || '').toUpperCase().includes('SELFIE'));
            const currentStatus = (driver.status || driver.rawStatus || 'PENDING').toUpperCase();

            return (
              <>
                {!isSelfieUploaded && (
                  <div style={{ color: 'var(--warning)', fontSize: '0.9rem', marginRight: 'auto' }}>
                    ⚠️ Driver selfie has not been uploaded yet.
                  </div>
                )}
                {currentStatus === 'SUSPENDED' && (
                  <button
                    className="btn btn-outline"
                    style={{ color: 'var(--success)', borderColor: 'var(--success)', padding: '0.6rem 2rem', fontSize: '1rem' }}
                    onClick={() => handleUpdateStatus(activeDriverId, 'approved')}
                  >
                    <Check size={20} /> Activate
                  </button>
                )}
                {currentStatus === 'APPROVED' && (
                  <button
                    className="btn btn-outline"
                    style={{ color: '#f59e0b', borderColor: '#f59e0b', padding: '0.6rem 2rem', fontSize: '1rem' }}
                    onClick={() => handleUpdateStatus(activeDriverId, 'suspended')}
                  >
                    <Ban size={20} /> Suspend
                  </button>
                )}
                {currentStatus !== 'APPROVED' && currentStatus !== 'SUSPENDED' && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 2rem', fontSize: '1rem' }}
                    onClick={() => handleUpdateStatus(activeDriverId, 'approved')}
                  >
                    <Check size={20} /> Approve All
                  </button>
                )}
              </>
            );
          })()}
        </div>
        )}
      </div>
      )}

      {/* Ride History Tab */}
      {driverTab === 'rides' && (
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Driver Ride History</h3>
        
        {loadingRides ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 className="animate-spin" size={28} color="var(--accent-primary)" />
          </div>
        ) : ridesToDisplay.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No rides found for this driver.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {ridesToDisplay.map((r: any) => (
              <div key={r.id} onClick={() => navigate('/rides/' + r.id)} style={{ padding: '1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover-highlight">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${(r.status || 'PENDING').toLowerCase()}`}>{r.status}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : '-'}</span>
                  </div>
                  {r.pickupLocation && <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}><strong>Pickup:</strong> {r.pickupLocation}</div>}
                  {r.dropoffLocation && <div style={{ fontSize: '0.85rem' }}><strong>Dropoff:</strong> {r.dropoffLocation}</div>}
                  {r.riderName && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rider: {r.riderName}</div>}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                   <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>Fare: ₹{r.fare || 0}</div>
                   {r.earning && <div style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}>Earning: ₹{r.earning}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Reviews Tab */}
      {driverTab === 'reviews' && (
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} /> Driver Reviews & Ratings
        </h3>
        {reviewsList.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No reviews submitted for this driver yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviewsList.map((rev: any) => (
              <div key={rev.id} style={{ padding: '1.25rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 700 }}>
                    <Star size={18} fill="#f59e0b" /> {rev.rating} / 5
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.createdAt ? new Date(rev.createdAt).toLocaleString('en-IN') : ''}</span>
                </div>
                {rev.comment && <p style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-main)', fontStyle: 'italic' }}>"{rev.comment}"</p>}
                {rev.riderName && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>— {rev.riderName}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Modals & Portals */}
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
                  <option value="">-- Select Reason --</option>
                  <option value="Invalid documents uploaded">Invalid documents uploaded</option>
                  <option value="Vehicle details mismatch">Vehicle details mismatch</option>
                  <option value="Identity verification failed">Identity verification failed</option>
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
                {isUpdatingStatus ? <Loader2 className="animate-spin" size={16} style={{ margin: 'auto' }} /> : 'Confirm'}
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
                  Reject
                </button>
                <button
                  onClick={() => updateDocStatus(previewDoc.id, 'APPROVED')}
                  className="btn btn-primary"
                  disabled={!!docUpdating || previewDoc.status === 'APPROVED'}
                  style={{ padding: '0.4rem 1.25rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {previewDoc.status === 'APPROVED' ? 'Approved' : 'Approve'}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setPreviewDoc(null)}
            style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10001 }}
          >
            <X size={24} />
          </button>

          <div className="animate-fade-in" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto', display: 'flex', alignItems: zoomScale === 1 ? 'center' : 'flex-start', justifyContent: zoomScale === 1 ? 'center' : 'flex-start', padding: zoomScale === 1 ? '0' : '2rem' }} onClick={() => setPreviewDoc(null)}>
            <img
              src={previewDoc.fileUrl ? (previewDoc.fileUrl.startsWith('/') ? `${API_BASE_URL}${previewDoc.fileUrl}` : previewDoc.fileUrl) : '/placeholder.png'}
              alt="Preview"
              style={{
                maxWidth: zoomScale === 1 ? '90vw' : 'none',
                maxHeight: zoomScale === 1 ? '90vh' : 'none',
                width: zoomScale === 1 ? 'auto' : '150%',
                objectFit: 'contain',
                cursor: zoomScale === 1 ? 'zoom-in' : 'zoom-out',
                borderRadius: '8px',
                margin: 'auto'
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
              Please provide a reason for rejecting this document:
            </p>
            <textarea
              autoFocus
              value={docRejectReason}
              onChange={(e) => setDocRejectReason(e.target.value)}
              placeholder="e.g. Image is blurry, document expired..."
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
