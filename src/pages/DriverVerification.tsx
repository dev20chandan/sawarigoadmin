import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Check, X, FileText, ExternalLink, Loader2, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { SmartAvatar } from '../App';
import type { RootState, AppDispatch } from '../store';
import { fetchDrivers, deleteDriver, updateDriver, addDriver, updateDriverStatus } from '../store/driverSlice';
import axiosInstance from '../utils/axiosInstance';

const DriverVerification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { drivers, loading, error } = useSelector((state: RootState) => state.drivers);
  const [selectedDriver, setSelectedDriver] = useState<any>(null); // Kept for API integration if needed, but navigation used instead for row clicks
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState<{ id: string, status: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(state?.filterStatus || 'ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    gender: 'Male',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleType: 'CAR',
    vehiclePlate: '',
    documents: {
      DRIVING_LICENSE: '',
      AADHAR: ''
    } as Record<string, string>,
    latitude: '',
    longitude: ''
  });

  const handleFileUpload = async (e: any, docType: string) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataBody = new FormData();
    formDataBody.append('file', file);

    try {
      const res = await axiosInstance.post('/uploads/image', formDataBody, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [docType]: res.data.url }
      }));
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const loadDrivers = () => {
    dispatch(fetchDrivers());
  };

  const confirmDelete = async () => {
    if (!driverToDelete) return;
    try {
      await dispatch(deleteDriver(driverToDelete)).unwrap();
      setDriverToDelete(null);
    } catch (err) {
      console.error('Failed to delete driver', err);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [dispatch]);

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch =
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone?.includes(searchTerm) ||
      d.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.userCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || (d.status && d.status.toUpperCase() === filterStatus);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdateStatus = (id: string, status: string) => {
    setStatusToUpdate({ id, status });
  };

  const confirmStatusUpdate = async () => {
    if (!statusToUpdate) return;
    try {
      await dispatch(updateDriverStatus({ id: statusToUpdate.id, status: statusToUpdate.status })).unwrap();
      setSelectedDriver(null);
      setStatusToUpdate(null);
    } catch (err) {
      console.error('Failed to update driver status', err);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
    </div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by code, name, phone, or plate..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', minWidth: '300px' }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="form-control"
            style={{ padding: '0.5rem 1rem', background: 'var(--input-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', outline: 'none' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => { setEditingDriver(null); setFormData({ name: '', phoneNumber: '', email: '', gender: 'Male', vehicleBrand: '', vehicleModel: '', vehicleYear: '', vehicleType: 'CAR', vehiclePlate: '', documents: { DRIVING_LICENSE: '', AADHAR: '' } as Record<string, string>, latitude: '', longitude: '' }); setIsModalOpen(true); }}>
            + Add Driver
          </button>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center', whiteSpace: 'nowrap' }}>Cap. Code</th>
              <th style={{ width: '60px', textAlign: 'center' }}>Image</th>
              <th style={{ textAlign: 'left', paddingLeft: '1rem' }}>Driver Name</th>
              <th style={{ textAlign: 'center' }}>Email</th>
              <th style={{ textAlign: 'center' }}>Vehicle No.</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDrivers.map((driver: any, index: number) => {
              const globalIndex = ((currentPage - 1) * itemsPerPage) + index;
              return (
                <tr key={driver.id} onClick={() => navigate(`/drivers/${driver.id}`, { state: { driver } })} style={{ cursor: 'pointer', background: selectedDriver?.id === driver.id ? 'var(--input-bg)' : '' }}>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{driver.userCode || `D-${String(globalIndex + 1).padStart(2, '0')}`}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <SmartAvatar src={driver.profile?.image || driver.image} name={driver.name || 'Driver'} size={36} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }} title={driver.name || 'Not Provided'}>
                      {((driver.name || 'Not Provided').length > 25 ? (driver.name || 'Not Provided').substring(0, 25) + '...' : (driver.name || 'Not Provided'))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{driver.profile?.email || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{driver.vehicle}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${driver.status}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                      {driver.status?.toUpperCase() === 'APPROVED' && (
                        <button onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingDriver(driver); 
                          const docsRecord: Record<string, string> = {};
                          if (driver.rawDocs) {
                            driver.rawDocs.forEach((d: any) => { docsRecord[d.documentType] = d.fileUrl; });
                          }
                          setFormData({ 
                            name: driver.name || '', 
                            phoneNumber: (driver.phone || driver.phoneNumber || '').replace(/^\+91/, ''), 
                            email: driver.profile?.email || '',  
                            gender: driver.profile?.gender || 'Male', 
                            vehicleBrand: driver.vehicleDetails?.brand || '', 
                            vehicleModel: driver.vehicleDetails?.model || '', 
                            vehicleYear: driver.vehicleDetails?.year || '', 
                            vehicleType: driver.vehicleDetails?.type || 'CAR', 
                            vehiclePlate: driver.vehicleDetails?.plateNumber || '', 
                            documents: docsRecord, 
                            latitude: driver.latitude || '', 
                            longitude: driver.longitude || '' 
                          }); 
                          setIsModalOpen(true); 
                        }} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} title="Edit Driver">
                          <Edit size={16} />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setDriverToDelete(driver.id); }} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem' }} title="Delete Driver">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginatedDrivers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  {drivers.length === 0 ? 'No drivers registered yet.' : 'No drivers match your search filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: 'var(--glass-border)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDrivers.length)} of {filteredDrivers.length}
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

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, overflowY: 'auto', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="animate-fade-in glass-panel" style={{ width: '100%', maxWidth: '800px', margin: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{editingDriver ? 'Edit Driver' : 'Add Driver'}</h2>
              <button onClick={() => { setIsModalOpen(false); setFieldErrors({}); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <input className="input" placeholder="Full Name" value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); setFieldErrors({ ...fieldErrors, name: '' }); }} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: `1px solid ${fieldErrors.name ? 'var(--danger)' : 'var(--border)'}`, background: 'var(--input-bg)', color: 'var(--text-main)' }} />
                {fieldErrors.name && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.4rem', marginLeft: '0.2rem' }}>{fieldErrors.name}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', borderRadius: '8px', border: `1px solid ${fieldErrors.phoneNumber ? 'var(--danger)' : 'var(--border)'}`, overflow: 'hidden' }}>
                  <span style={{ padding: '0.8rem 0.5rem 0.8rem 1rem', color: 'var(--text-muted)' }}>+91</span>
                  <input className="input" placeholder="Phone Number" value={formData.phoneNumber} onChange={e => { setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }); setFieldErrors({ ...fieldErrors, phoneNumber: '' }); }} style={{ width: '100%', padding: '0.8rem', paddingLeft: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }} />
                </div>
                {fieldErrors.phoneNumber && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.4rem', marginLeft: '0.2rem' }}>{fieldErrors.phoneNumber}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <input className="input" placeholder="Email Address" type="email" value={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); setFieldErrors({ ...fieldErrors, email: '' }); }} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: `1px solid ${fieldErrors.email ? 'var(--danger)' : 'var(--border)'}`, background: 'var(--input-bg)', color: 'var(--text-main)' }} />
                {fieldErrors.email && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.4rem', marginLeft: '0.2rem' }}>{fieldErrors.email}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <select className="input" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)' }}>
                  <option value="Male" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Male</option>
                  <option value="Female" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Female</option>
                  <option value="Other" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Other</option>
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', marginTop: '0.5rem', color: 'var(--accent-primary)' }}>Vehicle Details</h3>
            <select className="input" value={formData.vehicleType} onChange={e => setFormData({ ...formData, vehicleType: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              <option value="CAR" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Car</option>
              <option value="BIKE" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Bike</option>
              <option value="AUTO" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Auto</option>
              <option value="TAXI" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Taxi</option>
              <option value="PICKUP" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Pickup</option>
              <option value="PREMIUM" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Premium</option>
              <option value="BIKE_PARCEL" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Bike Parcel</option>
            </select>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <input className="input" placeholder="Plate Number" value={formData.vehiclePlate} onChange={e => { setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() }); setFieldErrors({ ...fieldErrors, vehiclePlate: '' }); }} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: `1px solid ${fieldErrors.vehiclePlate ? 'var(--danger)' : 'var(--border)'}`, background: 'var(--input-bg)', color: 'var(--text-main)' }} />
              {fieldErrors.vehiclePlate && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.4rem', marginLeft: '0.2rem' }}>{fieldErrors.vehiclePlate}</span>}
            </div>

            <h3 style={{ fontSize: '1rem', marginTop: '1.5rem', color: 'var(--accent-primary)' }}>Driver & Vehicle Documents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--input-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Driving License (Front)</span>
                  {formData.documents.DRIVING_LICENSE_FRONT ? <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Uploaded</span> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'DRIVING_LICENSE_FRONT')} style={{ fontSize: '0.8rem' }} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Driving License (Back)</span>
                  {formData.documents.DRIVING_LICENSE_BACK ? <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Uploaded</span> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'DRIVING_LICENSE_BACK')} style={{ fontSize: '0.8rem' }} />}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>RC Book</span>
                  {formData.documents.RC ? <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Uploaded</span> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'RC')} style={{ fontSize: '0.8rem' }} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pollution</span>
                  {formData.documents.POLLUTION ? <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Uploaded</span> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'POLLUTION')} style={{ fontSize: '0.8rem' }} />}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aadhar (Front)</span>
                  {formData.documents.AADHAR_FRONT ? <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Uploaded</span> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'AADHAR_FRONT')} style={{ fontSize: '0.8rem' }} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aadhar (Back)</span>
                  {formData.documents.AADHAR_BACK ? <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Uploaded</span> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'AADHAR_BACK')} style={{ fontSize: '0.8rem' }} />}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Insurance</span>
                  {formData.documents.INSURANCE ? <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Uploaded</span> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'INSURANCE')} style={{ fontSize: '0.8rem' }} />}
                </div>
                <div></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn" style={{ flex: 1, background: 'var(--input-bg)', color: 'var(--text-main)' }} onClick={() => { setIsModalOpen(false); setFieldErrors({}); }}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={async () => {
                const errors: Record<string, string> = {};

                if (!formData.name?.trim()) errors.name = 'Full Name is required';

                if (!formData.phoneNumber?.trim()) {
                  errors.phoneNumber = 'Phone Number is required';
                } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
                  errors.phoneNumber = 'Valid 10-digit phone number strictly required';
                }

                if (!formData.email?.trim()) {
                  errors.email = 'Email Address is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
                  errors.email = 'Valid Email Address format required';
                }

                if (!formData.vehiclePlate?.trim()) errors.vehiclePlate = 'Vehicle Plate is required';

                if (Object.keys(errors).length > 0) {
                  setFieldErrors(errors);
                  return;
                }

                const formattedDocs = Object.entries(formData.documents)
                  .filter(([_, url]) => url)
                  .map(([type, url]) => ({ documentType: type, fileUrl: url }));

                const submitData = { ...formData, phoneNumber: `+91${formData.phoneNumber.trim()}`, documents: formattedDocs };

                try {
                  if (editingDriver) {
                    await dispatch(updateDriver({ id: editingDriver.id, data: submitData })).unwrap();
                  } else {
                    await dispatch(addDriver(submitData)).unwrap();
                  }
                  setIsModalOpen(false);
                } catch (err) {
                  console.error('Failed to save driver:', err);
                }
              }}>
                {editingDriver ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {driverToDelete && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '380px', padding: '2rem', textAlign: 'center', background: 'var(--bg-main)' }}>
            <Trash2 size={48} color="var(--danger)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Are you sure?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this driver? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setDriverToDelete(null)} className="btn btn-outline" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
              <button onClick={confirmDelete} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', background: 'var(--danger)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {statusToUpdate && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '380px', padding: '2rem', textAlign: 'center', background: 'var(--bg-main)' }}>
            {statusToUpdate.status === 'approved' ? (
              <Check size={48} color="var(--success)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            ) : (
              <X size={48} color="var(--danger)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            )}
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Are you sure?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Are you sure you want to {statusToUpdate.status} this driver?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStatusToUpdate(null)} className="btn btn-outline" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
              <button onClick={confirmStatusUpdate} className="btn" style={{ flex: 1, padding: '0.75rem', background: statusToUpdate.status === 'approved' ? 'var(--success)' : 'var(--danger)', color: 'white' }}>Confirm</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DriverVerification;
