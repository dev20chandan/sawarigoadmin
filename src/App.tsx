import { API_BASE_URL } from './config';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { fetchProfile } from './store/settingsSlice';
import {
  LayoutDashboard, Users, FileCheck, BellRing, LogOut, Moon, Sun,
  AlertCircle, Loader2, Route as RouteIcon, Settings as SettingsIcon,
  Menu, MessageSquare, User, FileText, Tag, Truck, Star,
  ChevronRight, PanelLeftClose,
  ArrowLeft
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import UserList from './pages/UserList';
import UserDetails from './pages/UserDetails';
import DriverVerification from './pages/DriverVerification';
import DriverDetails from './pages/DriverDetails';
import RideList from './pages/RideList';
import RideDetails from './pages/RideDetails';
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
import Contacts from './pages/Contacts';

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
    <div ref={dropdownRef} className="top-widget-container" style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline"
        title={adminName || 'Admin'}
        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.3rem 0.8rem 0.3rem 0.3rem', background: 'var(--bg-card)', border: 'var(--glass-border)', borderRadius: '30px', cursor: 'pointer', backdropFilter: 'blur(10px)', boxShadow: 'var(--glass-shadow)', transition: 'all 0.2s' }}
      >
        <SmartAvatar src={adminImage} name={adminName || 'Admin'} size={30} type="initial" />
        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {adminName || 'Admin'}
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="animate-fade-in" style={{ position: 'absolute', top: '125%', right: '0rem', background: 'var(--sidebar-bg)', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: 'var(--glass-border)', minWidth: '170px', backdropFilter: 'blur(16px)', zIndex: 1200 }}>
          <div onClick={() => { setIsOpen(false); navigate('/settings'); }} style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, fontSize: '0.88rem' }} className="nav-item">
            <SettingsIcon size={16} /> Settings
          </div>
          <div onClick={() => { setIsOpen(false); toggleTheme(); }} style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, fontSize: '0.88rem' }} className="nav-item">
            {theme === 'light' ? <><Moon size={16} /> Dark Mode</> : <><Sun size={16} /> Light Mode</>}
          </div>
          <div onClick={() => { setIsOpen(false); onLogout(); }} style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', borderRadius: '8px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, fontSize: '0.88rem' }} className="nav-item">
            <LogOut size={16} /> Logout
          </div>
        </div>
      )}
    </div>
  );
};

const HeaderBar = ({
  title,
  isDrawerOpen,
  toggleDrawer,
  profile,
  handleLogout,
  theme,
  toggleTheme,
  showBackButton
}: {
  title: string;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  profile: any;
  handleLogout: () => void;
  theme: string;
  toggleTheme: () => void;
  showBackButton?: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-brand-section">
          <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
            <img
              src="/favicon.png"
              alt="Sawarigo Logo"
              style={{ width: '32px', height: '32px', objectFit: 'contain', marginRight: '-0.50rem' }}
            />
            <span>
              <span style={{ color: 'var(--text-main)' }}>awari</span>
              <span style={{ color: 'var(--accent-primary)' }}>Go</span>
            </span>
          </Link>

          <button
            className={`drawer-toggle-btn ${isDrawerOpen ? 'active' : ''}`}
            onClick={toggleDrawer}
            title={isDrawerOpen ? "Close Navigation Sidebar" : "Open Navigation Sidebar"}
            aria-label="Toggle Navigation Sidebar"
          >
            {isDrawerOpen ? <PanelLeftClose size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="header-divider" />

        {showBackButton && (
          <button
            className="btn btn-outline"
            onClick={() => navigate(-1)}
            title="Go Back"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', borderRadius: '8px' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <div className="header-title-container">
          <h1 className="header-title">{title}</h1>
        </div>
      </div>

      <div className="header-right">
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <TopBarUserWidget
          adminName={profile?.name || profile?.username}
          adminImage={profile?.image}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>
    </header>
  );
};

const SidebarDrawer = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const location = useLocation();

  // Close drawer on Escape key in mobile overlay mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && window.innerWidth <= 1024) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navCategories = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={19} /> }
      ]
    },
    {
      title: 'User Management',
      items: [
        { name: 'Users', path: '/users', icon: <Users size={19} /> },
        { name: 'Drivers', path: '/drivers', icon: <FileCheck size={19} /> }
      ]
    },
    {
      title: 'Rides & Financials',
      items: [
        { name: 'Ride History', path: '/rides', icon: <RouteIcon size={19} /> },
        { name: 'Vehicle Types', path: '/vehicle-types', icon: <Truck size={19} /> },
        { name: 'Coupons', path: '/coupons', icon: <Tag size={19} /> }
      ]
    },
    {
      title: 'Support & Feedback',
      items: [
        { name: 'Notifications', path: '/notifications', icon: <BellRing size={19} /> },
        { name: 'Contacts / Enquiries', path: '/contacts', icon: <MessageSquare size={19} /> },
        { name: 'Ratings & Reviews', path: '/reviews', icon: <Star size={19} /> }
      ]
    },
    {
      title: 'CMS & Settings',
      items: [
        { name: 'CMS Pages', path: '/cms/pages', icon: <FileText size={19} /> },
        { name: 'Settings', path: '/settings', icon: <SettingsIcon size={19} /> }
      ]
    }
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/cms/pages') return location.pathname.startsWith('/cms');
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    // Only close overlay drawer on mobile viewports
    if (window.innerWidth <= 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay on mobile when open */}
      {isOpen && (
        <div
          className="drawer-backdrop"
          onClick={onClose}
          aria-label="Close Drawer Overlay"
        />
      )}

      <aside className={`sidebar-drawer ${isOpen ? 'drawer-open' : ''}`}>
        {/* Drawer Navigation Content */}
        <div className="drawer-nav-content" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
          {navCategories.map((cat) => (
            <div key={cat.title} className="drawer-nav-group">
              <div className="drawer-group-title">{cat.title}</div>
              {cat.items.map((item) => {
                const active = isLinkActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`drawer-nav-item ${active ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    <span className="nav-item-text">{item.name}</span>
                    {active && <ChevronRight size={15} className="active-indicator" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

const ProtectedLayout = ({ handleLogout, theme, toggleTheme }: { handleLogout: () => void, theme: string, toggleTheme: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.settings);
  const location = useLocation();
  const [init, setInit] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_open');
    if (saved !== null) return saved === 'true';
    return window.innerWidth > 1024;
  });

  useEffect(() => {
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

  const toggleDrawer = () => {
    setIsDrawerOpen(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_open', String(next));
      return next;
    });
  };

  const closeDrawer = () => {
    if (window.innerWidth <= 1024) {
      setIsDrawerOpen(false);
    }
  };

  if (!init) {
    return <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <Loader2 className="animate-spin" size={40} color="var(--accent-primary)" />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </div>;
  }

  const needsSetup = !profile?.name || !profile?.email;

  const getPageTitle = (path: string) => {
    if (path.startsWith('/drivers/')) return 'Captain Details';
    if (path.startsWith('/users/')) return 'User Details';
    if (path.startsWith('/rides/')) return 'Ride Details';
    if (path.startsWith('/coupons/')) return 'Coupon Details';

    switch (path) {
      case '/': return 'Platform Overview';
      case '/users': return 'Users Management';
      case '/drivers': return 'Driver Verification';
      case '/rides': return 'Ride History';
      case '/notifications': return 'Notifications';
      case '/support': return 'Support Tickets';
      case '/contacts': return 'Website Contacts & Enquiries';
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

  const isDetailPage = !!location.pathname.match(/^\/(drivers|rides|users|coupons)\/[a-zA-Z0-9_-]+/);

  return (
    <div className={`app-container ${theme}`}>
      <HeaderBar
        title={getPageTitle(location.pathname)}
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        profile={profile}
        handleLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        showBackButton={isDetailPage}
      />

      <div className="app-body-layout">
        <SidebarDrawer
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
        />

        <main className="main-content-area">
          {needsSetup && location.pathname === '/settings' && (
            <div className="animate-fade-in" style={{ padding: '1rem 1.5rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--warning)', color: 'var(--warning)', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <AlertCircle size={24} />
              <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>You must completely fill out your Name and Email Address before accessing the dashboard.</span>
            </div>
          )}
          <Routes>
            <Route path="/" element={needsSetup ? <Navigate to="/settings" /> : <Dashboard />} />
            <Route path="/users" element={needsSetup ? <Navigate to="/settings" /> : <UserList />} />
            <Route path="/users/:id" element={needsSetup ? <Navigate to="/settings" /> : <UserDetails />} />
            <Route path="/drivers" element={needsSetup ? <Navigate to="/settings" /> : <DriverVerification />} />
            <Route path="/drivers/:id" element={needsSetup ? <Navigate to="/settings" /> : <DriverDetails />} />
            <Route path="/rides" element={needsSetup ? <Navigate to="/settings" /> : <RideList />} />
            <Route path="/rides/:id" element={needsSetup ? <Navigate to="/settings" /> : <RideDetails />} />
            <Route path="/notifications" element={needsSetup ? <Navigate to="/settings" /> : <Notifications />} />
            <Route path="/support" element={needsSetup ? <Navigate to="/settings" /> : <SupportRecords />} />
            <Route path="/contacts" element={needsSetup ? <Navigate to="/settings" /> : <Contacts />} />
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
