// Central API base URL - reads from environment variable
// In development: http://localhost:5000
// In production (Netlify): set VITE_API_URL in Netlify dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
