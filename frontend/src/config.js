// API configuration for production and local development
function getApiBaseUrl() {
  let url = (import.meta.env.VITE_API_BASE_URL || '').trim();

  if (!url) {
    // If running locally in development, connect to local backend
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://127.0.0.1:8000';
    }
    // Production default: connect to deployed Render backend
    return 'https://agrovision-backend-rgmi.onrender.com';
  }

  // If Render or user passed hostname without protocol (e.g. "agrovision-backend.onrender.com")
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Strip trailing slashes
  return url.replace(/\/+$/, '');
}

export const API_BASE_URL = getApiBaseUrl();
