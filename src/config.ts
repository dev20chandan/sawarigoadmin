// Auto-switch between local backend during development and live backend for production
const isDev = import.meta.env.DEV;
const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.includes('.local')
);

export const API_BASE_URL = import.meta.env.VITE_API_URL 
  || import.meta.env.VITE_API_BASE_URL
  || (isDev || isLocal ? 'http://localhost:3002' : 'https://api.sawarigo.in');