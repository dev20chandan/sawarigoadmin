import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Lock, Save, AlertCircle, Camera, Loader2, Eye, EyeOff } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { fetchProfile, updateProfile, clearSettingsMessages } from '../store/settingsSlice';

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile: storedProfile, loading, error, updateSuccess } = useSelector((state: RootState) => state.settings);

  const [profile, setProfile] = useState({ name: '', username: '', email: '', image: '' });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      setPassword(''); 
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...profile };
    if (password) payload.password = password;

    try {
      await dispatch(updateProfile(payload)).unwrap();
    } catch {
      // Error is handled by redux state
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {updateSuccess && (
        <div className="notification-alert-success">
          <AlertCircle size={20} />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="notification-alert-error">
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
            >
              <Camera size={18} />
            </button>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{profile.name || 'Admin'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{profile.email || 'Admin Account'}</p>
        </div>

        {/* Main Settings Form */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleUpdate} style={{ width: '100%' }}>
            
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
                placeholder="admin@sawarigo.com"
                value={profile.email}
                onChange={e => setProfile({...profile, email: e.target.value})}
              />
            </div>

            <br/>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: 'var(--border)', paddingTop: '1.5rem' }}>
              <Lock size={22} color="var(--accent-primary)" /> Security
            </h2>
            
            <div className="form-group" style={{ width: '100%' }}>
              <label>New Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ width: '100%', paddingRight: '40px' }}
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Only enter a new password if you want to change your current one.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem' }} disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
