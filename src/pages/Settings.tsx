import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Lock, Save, AlertCircle, Camera, Loader2, Eye, EyeOff, CheckCircle, KeyRound } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchProfile, updateProfile, clearSettingsMessages } from '../store/settingsSlice';

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile: storedProfile, loading, error, updateSuccess } = useSelector((state: RootState) => state.settings);

  const [profile, setProfile] = useState({ name: '', username: '', email: '', image: '' });

  // Dedicated Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    dispatch(fetchProfile());
    return () => {
      dispatch(clearSettingsMessages());
    };
  }, [dispatch]);

  useEffect(() => {
    if (storedProfile.username || storedProfile.email) {
      setProfile({ ...storedProfile, image: storedProfile.image || '' });
    }
  }, [storedProfile]);

  useEffect(() => {
    if (updateSuccess) {
      setTimeout(() => dispatch(clearSettingsMessages()), 3000);
    }
  }, [updateSuccess, dispatch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(profile)).unwrap();
    } catch {
      // Handled by redux state
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and Confirm password do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      // Backend /admin/profile handles password update, supporting currentPassword and password
      const payload: any = {
        password: newPassword,
        currentPassword: currentPassword || undefined
      };

      await dispatch(updateProfile(payload)).unwrap();
      setPasswordSuccess('Password has been changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err: any) {
      setPasswordError(typeof err === 'string' ? err : (err?.message || 'Failed to update password. Please check your current password.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {updateSuccess && (
        <div className="notification-alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle size={20} />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="notification-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Profile Picture Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '50%', 
              background: profile.image ? `url(${profile.image}) center/cover` : 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '3rem', fontWeight: 600, boxShadow: 'var(--glass-shadow)',
              border: '4px solid var(--bg-card)'
            }}>
              {!profile.image && (profile.name ? profile.name.charAt(0).toUpperCase() : 'A')}
            </div>
            
            <input 
              type="file" 
              id="profileImageInput" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageChange} 
            />
            
            <button 
              type="button"
              onClick={() => document.getElementById('profileImageInput')?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0, background: 'var(--bg-card)', border: 'var(--glass-border)',
                borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-main)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              title="Change Profile Photo"
            >
              <Camera size={18} />
            </button>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{profile.name || 'Admin'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{profile.email || 'Admin Account'}</p>
        </div>

        {/* Forms Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Personal Information Form */}
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleUpdateProfile} style={{ width: '100%' }}>
              
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={22} color="var(--accent-primary)" /> Personal Information
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ width: '100%', marginBottom: '0.5rem' }}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    style={{ width: '100%' }} 
                    placeholder="e.g. Rahul Sharma"
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                  />
                </div>

                <div className="form-group" style={{ width: '100%', marginBottom: '0.5rem' }}>
                  <label>Username</label>
                  <input 
                    type="text" 
                    className="form-control"
                    style={{ width: '100%' }}  
                    value={profile.username}
                    onChange={e => setProfile({...profile, username: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group" style={{ width: '100%', marginTop: '1rem' }}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-control"
                  style={{ width: '100%' }}  
                  placeholder="admin@sawarigo.in"
                  value={profile.email}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleChangePassword} style={{ width: '100%' }}>
              
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={22} color="var(--accent-primary)" /> Change Password
              </h2>

              {passwordSuccess && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <CheckCircle size={18} />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <AlertCircle size={18} />
                  <span>{passwordError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                
                {/* Current Password */}
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Current Password</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-control"
                      style={{ width: '100%', paddingRight: '40px' }}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="form-group" style={{ width: '100%' }}>
                  <label>New Password</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-control"
                      style={{ width: '100%', paddingRight: '40px' }}
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0
                      }}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group" style={{ width: '100%' }}>
                  <label>Confirm New Password</label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      style={{ width: '100%', paddingRight: '40px' }}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Password must be at least 6 characters long.
                </span>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 2rem' }}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
