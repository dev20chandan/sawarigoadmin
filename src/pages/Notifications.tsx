import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { sendNotification, resetNotificationState } from '../store/notificationSlice';

const Notifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('incomplete');
  
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    if (success) {
      setTitle('');
      setMessage('');
      const timer = setTimeout(() => dispatch(resetNotificationState()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
    try {
      await dispatch(sendNotification({ title, message, target })).unwrap();
    } catch(err) {
      console.error('Failed to send notification', err);
    }
  };

  return (
    <div className="animate-fade-in notification-container">

      {success && (
        <div className="notification-alert-success">
          <AlertCircle size={20} />
          Notification successfully queued for delivery!
        </div>
      )}

      {error && (
        <div className="notification-alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="glass-panel notification-panel-content">
        <p className="notification-helper-text">
          Send targeted notifications and nudges to users based on their profile completion status.
        </p>

        <form onSubmit={handleSend}>
          <div className="form-group">
            <label>Target Audience</label>
            <div className="notification-radio-group">
              <label className="notification-radio-label">
                <input 
                  type="radio" 
                  name="target" 
                  value="incomplete" 
                  checked={target === 'incomplete'}
                  onChange={(e) => setTarget(e.target.value)}
                />
                <span className="notification-radio-text">Incomplete Profiles (Nudge)</span>
              </label>
              <label className="notification-radio-label">
                <input 
                  type="radio" 
                  name="target" 
                  value="all" 
                  checked={target === 'all'}
                  onChange={(e) => setTarget(e.target.value)}
                />
                <span className="notification-radio-text">All Active Users</span>
              </label>
              <label className="notification-radio-label">
                <input 
                  type="radio" 
                  name="target" 
                  value="new_users" 
                  checked={target === 'new_users'}
                  onChange={(e) => setTarget(e.target.value)}
                />
                <span className="notification-radio-text">All New Users</span>
              </label>
              <label className="notification-radio-label">
                <input 
                  type="radio" 
                  name="target" 
                  value="drivers" 
                  checked={target === 'drivers'}
                  onChange={(e) => setTarget(e.target.value)}
                />
                <span className="notification-radio-text">All Drivers</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Notification Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g., Complete your profile to get ₹50 off!" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Message Body</label>
            <textarea 
              className="form-control" 
              rows={5} 
              placeholder="Write your push notification message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="notification-action-bar">
            <button type="submit" className="btn btn-primary notification-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
      

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default Notifications;
