// Centralized API base URL for frontend calls
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export function backendUrl(path) {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL.replace(/\/+$/,'')}/${path.replace(/^\/+/, '')}`;
}
