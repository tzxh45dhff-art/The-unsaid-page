import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: { 'Content-Type': 'application/json' },
});

// Auto-inject JWT from localStorage on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('unsaid-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-redirect to login on 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('unsaid-token');
            // Don't redirect if already on auth pages
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                // Optionally trigger redirect — handled by context
            }
        }
        return Promise.reject(err);
    }
);

export default api;
