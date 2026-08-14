import { API_BASE_URL } from './config';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { fetchProfile } from './store/settingsSlice';
import { LayoutDashboard, Users, FileCheck, BellRing, LogOut, Moon, Sun, Car, AlertCircle, Loader2, Route as RouteIcon, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UserList from './pages/UserList';
import DriverVerification from './pages/DriverVerification';
import DriverDetails from './pages/DriverDetails';
import RideList from './pages/RideList';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import SettingsPage from './pages/Settings';
import CmsFaq from './pages/CmsFaq';
import CmsPages from './pages/CmsPages';
import Coupons from './pages/Coupons';
import CouponDetails from './pages/CouponDetails';
import VehicleTypes from './pages/VehicleTypes';
import RatingsAndReviews from './pages/RatingsAndReviews';
import RideFareDetails from './pages/RideFareDetails';
import CancellationRecords from './pages/CancellationRecords';
import SupportRecords from './pages/SupportRecords';
import WalletLedger from './pages/WalletLedger';
import { User, FileText, Tag, Truck, Star, Ban, LifeBuoy, IndianRupee } from 'lucide-react';

export const SmartAvatar = ({ src, name, size = 36, type = 'icon' }: { src?: string, name: string, size?: number, type?: 'initial' | 'icon' }) => {
  const [error, setError] = useState(false);
  const initial = (name || 'A').charAt(0).toUpperCase();

  if (!src || error) {
    if (type === 'icon') {
        return (
          <div style={{ width: size, height: size, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--glass-shadow)', overflow: 'hidden' }}>
            <User size={size * 0.6} />
          </div>
        );
    }
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--gradient-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 5px rgba(255,107,53,0.3)', fontWeight: 'bold', fontSize: `${size * 0.45}px` }}>
        {initial}
      </div>
    );
  }

  const resolvedUrl = (src.startsWith('http') || src.startsWith('data:')) ? src : `${API_BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
  
  return (
    <img 
      src={resolvedUrl} 
      alt={name} 
      onError={() => setError(true)} 
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', boxShadow: 'var(--glass-shadow)' }} 
    />
  );
};



const TopBarUserWidget = ({ adminName, adminImage, onLogout, theme, toggleTheme }: { adminName: string, adminImage?: string, onLogout: () => void, theme: string, toggleTheme: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'absolute', top: '1.5rem', right: '2rem', zIndex: 100 }}>
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline"
        title={adminName || 'Admin'}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 1rem 0.4rem 0.4rem', background: 'var(--bg-card)', border: 'var(--glass-border)', borderRadius: '30px', cursor: 'pointer', backdropFilter: 'blur(10px)', boxShadow: 'var(--glass-shadow)', transition: 'all 0.2s' }}
      >
        <SmartAvatar src={adminImage} name={adminName || 'Admin'} size={32} type="initial" />
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
          {adminName || 'Admin'}
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="animate-fade-in" style={{ position: 'absolute', top: '110%', right: '0rem', background: 'var(--sidebar-bg)', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: 'var(--glass-border)', minWidth: '160px', backdropFilter: 'blur(16px)' }}>
          <div onClick={() => { setIsOpen(false); navigate('/settings'); }} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }} className="nav-item">
            <SettingsIcon size={16} /> Settings
          </div>
          <div onClick={() => { setIsOpen(false); toggleTheme(); }} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }} className="nav-item">
            {theme === 'light' ? <><Moon size={16} /> Dark Mode</> : <><Sun size={16} /> Light Mode</>}
          </div>
          <div onClick={() => { setIsOpen(false); onLogout(); }} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: '8px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }} className="nav-item">
            <LogOut size={16} /> Logout
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} /> },
    { name: 'Drivers', path: '/drivers', icon: <FileCheck size={20} /> },
    { name: 'Trip Activity', path: '/rides', icon: <RouteIcon size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <BellRing size={20} /> },
    { name: 'Support', path: '/support', icon: <LifeBuoy size={20} /> },
    { name: 'Vehicle Types', path: '/vehicle-types', icon: <Truck size={20} /> },
    { name: 'Reviews', path: '/reviews', icon: <Star size={20} /> },
    { name: 'Cancellations', path: '/cancellations', icon: <Ban size={20} /> },
    { name: 'Fares List', path: '/ride-fares', icon: <FileText size={20} /> },
    { name: 'Wallet Ledger', path: '/wallet-ledger', icon: <IndianRupee size={20} /> },
    { name: 'Coupons', path: '/coupons', icon: <Tag size={20} /> },
    { name: 'CMS', path: '/cms/pages', icon: <FileText size={20} /> },
  ];

  return (
    <div className="sidebar">
      <Link to="/" className="brand">
        <Car size={32} />
        Sawarigo
      </Link>
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`nav-item ${
              (link.path === '/' ? location.pathname === '/' : 
              (link.path === '/cms/pages' ? location.pathname.startsWith('/cms') : location.pathname.startsWith(link.path))) 
                ? 'active' : ''
            }`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

const ProtectedLayout = ({ handleLogout, theme, toggleTheme }: { handleLogout: () => void, theme: string, toggleTheme: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.settings);
  const location = useLocation();
  const [init, setInit] = useState(false);

  useEffect(() => {
    // Only fetch profile initially, do not depend on location.pathname
    // to avoid re-fetching on every client-side page navigation
    dispatch(fetchProfile())
      .unwrap()
      .then(() => {
        setInit(true);
      })
      .catch((err) => {
        setInit(true);
        if (err === 'Unauthorized' || (err && err.statusCode === 401) || String(err).includes('401')) {
           handleLogout();
        }
      });
  }, [dispatch, handleLogout]);

  // Handle initial loading so we don't flash default routes or triggers false needsSetup
  if (!init) {
     return <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
       <Loader2 className="animate-spin" size={40} color="var(--accent-primary)" />
       <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
     </div>;
  }

  const needsSetup = !profile?.name || !profile?.email;

  const getPageTitle = (path: string) => {
    if (path.startsWith('/drivers/')) return 'Captain Details';
    
    switch (path) {
      case '/': return 'Platform Overview';
      case '/users': return 'Users Management';
      case '/drivers': return 'Driver Management';
      case '/rides': return 'Trip Activity';
      case '/notifications': return 'Notifications';
      case '/support': return 'Support Tickets';
      case '/vehicle-types': return 'Vehicle Types Management';
      case '/reviews': return 'Ratings & Reviews';
      case '/cancellations': return 'Cancellation Records';
      case '/ride-fares': return 'Ride Fares Overview';
      case '/wallet-ledger': return 'Wallet & Financial Ledger';
      case '/cms/pages': return 'CMS - Pages';
      case '/cms/faqs': return 'CMS - FAQs';
      case '/coupons': return 'Coupon Management';
      case '/settings': return 'Settings';
      default: return 'Sawarigo Platform';
    }
  };

  return (
    <div className={`app-container ${theme}`} style={{ background: 'var(--sidebar-bg)', color: 'var(--text-main)' }}>
      <Sidebar />
      <TopBarUserWidget adminName={profile?.name || profile?.username} adminImage={profile?.image} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content" style={{ paddingTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        {!location.pathname.match(/^\/drivers\/[a-zA-Z0-9_-]+/) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
              {getPageTitle(location.pathname)}
            </h1>
          </div>
        )}
        {needsSetup && location.pathname === '/settings' && (
          <div className="animate-fade-in" style={{ padding: '1rem 1.5rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--warning)', color: 'var(--warning)', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertCircle size={24} />
            <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>You must completely fill out your Name and Email Address before accessing the dashboard.</span>
          </div>
        )}
        <Routes>
          <Route path="/" element={needsSetup ? <Navigate to="/settings" /> : <Dashboard />} />
          <Route path="/users" element={needsSetup ? <Navigate to="/settings" /> : <UserList />} />
          <Route path="/drivers" element={needsSetup ? <Navigate to="/settings" /> : <DriverVerification />} />
          <Route path="/drivers/:id" element={needsSetup ? <Navigate to="/settings" /> : <DriverDetails />} />
          <Route path="/rides" element={needsSetup ? <Navigate to="/settings" /> : <RideList />} />
          <Route path="/notifications" element={needsSetup ? <Navigate to="/settings" /> : <Notifications />} />
          <Route path="/support" element={needsSetup ? <Navigate to="/settings" /> : <SupportRecords />} />
          <Route path="/vehicle-types" element={needsSetup ? <Navigate to="/settings" /> : <VehicleTypes />} />
          <Route path="/reviews" element={needsSetup ? <Navigate to="/settings" /> : <RatingsAndReviews />} />
          <Route path="/cancellations" element={needsSetup ? <Navigate to="/settings" /> : <CancellationRecords />} />
          <Route path="/ride-fares" element={needsSetup ? <Navigate to="/settings" /> : <RideFareDetails />} />
          <Route path="/wallet-ledger" element={needsSetup ? <Navigate to="/settings" /> : <WalletLedger />} />
          <Route path="/cms/pages" element={needsSetup ? <Navigate to="/settings" /> : <CmsPages />} />
          <Route path="/cms/faqs" element={needsSetup ? <Navigate to="/settings" /> : <CmsFaq />} />
          <Route path="/coupons" element={needsSetup ? <Navigate to="/settings" /> : <Coupons />} />
          <Route path="/coupons/:id" element={needsSetup ? <Navigate to="/settings" /> : <CouponDetails />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </main>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('adminToken');
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const handleLogin = () => setIsAuthenticated(true);
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <ProtectedLayout handleLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;
