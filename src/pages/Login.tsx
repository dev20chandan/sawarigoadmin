import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Loader2, Eye, EyeOff, KeyRound, X, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { setCredentials } from '../store/authSlice';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/admin/login', { username, password });

      const { access_token } = response.data;
      if (access_token) {
        dispatch(setCredentials({ token: access_token }));
        onLogin();
        navigate('/');
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data?.message || 'Invalid credentials');
      } else {
        setError('Network error. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const response = await axiosInstance.post('/admin/forgot-password', {
        email: forgotInput.trim(),
        username: forgotInput.trim()
      });
      setForgotSuccess(response.data?.message || 'Password reset instructions have been sent to your email.');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setForgotSuccess('A reset request has been logged. Please contact system super-admin or check your registered email for recovery instructions.');
      } else {
        setForgotError(err.response?.data?.message || 'Failed to initiate password reset. Please verify your email/username.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '1.5rem' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '420px', maxWidth: '100%', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 'var(--glass-shadow)', borderRadius: '16px' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <img
              src="/favicon.png"
              alt="Sawarigo Logo"
              style={{ width: '48px', height: '48px', objectFit: 'contain', marginRight: '-0.75rem' }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
            <span style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-main)' }}>awari</span>
              <span style={{ color: 'var(--accent-primary)' }}>Go</span>
            </span>
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 600, margin: 0, textAlign: 'center', color: 'var(--text-main)' }}>
            Admin Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.35rem 0 0' }}>
            Sign in to manage Sawarigo
          </p>
        </div>

        {error && (
          <div style={{ width: '100%', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              Username or Email
            </label>
            <input
              type="text"
              name="username_field"
              className="form-control"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              Password
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_field"
                className="form-control"
                style={{ width: '100%', paddingRight: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', marginTop: '0.4rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setForgotInput(username);
                setForgotSuccess('');
                setForgotError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '0.84rem',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '0.2rem 0'
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '420px', maxWidth: '100%', padding: '2rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '16px', position: 'relative' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={22} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Reset Admin Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Enter your admin email address or username to receive password reset instructions.
            </p>

            {forgotSuccess && (
              <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{forgotError}</span>
              </div>
            )}

            {!forgotSuccess ? (
              <form onSubmit={handleForgotPassword}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>
                    Email or Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="admin@sawarigo.in or admin"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      style={{ width: '100%', paddingLeft: '38px' }}
                      required
                      autoFocus
                    />
                    <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowForgotModal(false)}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={forgotLoading}
                    style={{ padding: '0.5rem 1.25rem', minWidth: '120px', justifyContent: 'center' }}
                  >
                    {forgotLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send Request'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowForgotModal(false)}
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
